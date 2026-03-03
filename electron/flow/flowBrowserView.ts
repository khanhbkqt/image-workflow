/* ── FlowBrowserView Manager ──────────────────────────────────────────── */
/* Manages a hidden BrowserView that loads labs.google/fx/tools/flow     */
/* to extract OAuth2 Bearer tokens and generate per-request reCAPTCHA    */
/* Enterprise tokens needed for the Flow API.                            */

import { BrowserView, BrowserWindow } from 'electron';
import type { CookiesSetDetails } from 'electron';

const FLOW_URL = 'https://labs.google/fx/tools/flow';

/** Google domains where cookies should be injected. */
const GOOGLE_DOMAINS = [
    '.google.com',
    '.labs.google',
    'labs.google',
];

/** Cache entry for the Bearer token with TTL. */
interface TokenCache {
    token: string;
    expiresAt: number; // epoch ms
}

export class FlowBrowserViewManager {
    private view: BrowserView | null = null;
    private mainWindow: BrowserWindow | null = null;
    private tokenCache: TokenCache | null = null;
    private recaptchaTokenCache: string | null = null;
    private loaded = false;

    /** Token TTL: 55 minutes (tokens valid ~1 hour, refresh with margin). */
    private readonly TOKEN_TTL_MS = 55 * 60 * 1000;

    /** Attach the hidden BrowserView to the main window and start loading. */
    init(mainWindow: BrowserWindow): void {
        this.mainWindow = mainWindow;

        this.view = new BrowserView({
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                partition: 'persist:flow-auth', // isolated session for Flow auth
            },
        });

        // Position off-screen so it's never visible to the user
        mainWindow.setBrowserView(this.view);
        this.view.setBounds({ x: -9999, y: -9999, width: 1, height: 1 });

        // Intercept outgoing requests to capture the Bearer token AND reCAPTCHA tokens
        this.view.webContents.session.webRequest.onBeforeSendHeaders(
            { urls: ['*://aisandbox-pa.googleapis.com/*'] },
            (details, callback) => {
                const auth = details.requestHeaders['Authorization'];
                if (auth && auth.startsWith('Bearer ')) {
                    const token = auth.slice(7); // strip "Bearer "
                    this.tokenCache = {
                        token,
                        expiresAt: Date.now() + this.TOKEN_TTL_MS,
                    };
                }
                callback({ requestHeaders: details.requestHeaders });
            }
        );

        // Intercept request bodies to extract reCAPTCHA tokens the page generates
        this.view.webContents.session.webRequest.onBeforeRequest(
            { urls: ['*://aisandbox-pa.googleapis.com/*/flowMedia:batchGenerateImages*'] },
            (details, callback) => {
                if (details.uploadData?.length) {
                    try {
                        const raw = Buffer.from(details.uploadData[0].bytes).toString('utf8');
                        const body = JSON.parse(raw) as Record<string, unknown>;
                        const clientCtx = body['clientContext'] as Record<string, unknown> | undefined;
                        const recaptchaCtx = clientCtx?.['recaptchaContext'] as Record<string, unknown> | undefined;
                        const token = recaptchaCtx?.['token'] as string | undefined;
                        if (token) {
                            this.recaptchaTokenCache = token;
                        }
                    } catch {
                        // Ignore parse errors
                    }
                }
                callback({});
            }
        );

        this.view.webContents.on('did-finish-load', () => {
            this.loaded = true;
        });

        // Fire-and-forget — don't block app startup
        this.view.webContents.loadURL(FLOW_URL).catch(() => {
            // Silently fail — user may not be online or logged in
        });
    }

    /** Returns true if the page has finished loading. */
    isReady(): boolean {
        return this.loaded;
    }

    /**
     * Returns a valid OAuth2 Bearer token.
     * Tries multiple extraction strategies:
     * 1. Cached token from onBeforeSendHeaders intercept
     * 2. Direct extraction from Google auth SDK (gapi / google.accounts)
     * 3. Hooking the page's fetch to capture Authorization header
     */
    async getBearerToken(): Promise<string> {
        // 1. Return cached token if still valid
        if (this.tokenCache && Date.now() < this.tokenCache.expiresAt) {
            return this.tokenCache.token;
        }

        if (!this.view) {
            throw new Error('FlowBrowserView not initialised');
        }

        // Wait for page load if not ready
        if (!this.loaded) {
            const loadDeadline = Date.now() + 15_000;
            while (!this.loaded && Date.now() < loadDeadline) {
                await new Promise<void>((r) => setTimeout(r, 500));
            }
        }

        // 2. Try direct extraction from Google auth SDK
        const SDK_EXTRACT = `
            (async () => {
                // Method A: gapi.auth2 (classic Google Sign-In)
                try {
                    if (typeof gapi !== 'undefined' && gapi.auth2) {
                        const instance = gapi.auth2.getAuthInstance();
                        if (instance) {
                            const user = instance.currentUser.get();
                            if (user && user.isSignedIn()) {
                                const authResp = user.getAuthResponse(true);
                                if (authResp && authResp.access_token) {
                                    return authResp.access_token;
                                }
                            }
                        }
                    }
                } catch (_) {}

                // Method B: Scrape from XHR/fetch intercepted token storage
                // Some Google apps store the token in window.__GOOGLE_AUTH_TOKEN or similar
                try {
                    if (window.__GOOGLE_AUTH_TOKEN) return window.__GOOGLE_AUTH_TOKEN;
                } catch (_) {}

                // Method C: Hook into fetch to capture the next outgoing Authorization header
                return new Promise((resolve) => {
                    const origFetch = window.fetch;
                    let resolved = false;
                    window.fetch = function(...args) {
                        const result = origFetch.apply(this, args);
                        if (!resolved) {
                            const req = args[1];
                            const headers = req?.headers;
                            let auth = null;
                            if (headers instanceof Headers) {
                                auth = headers.get('Authorization');
                            } else if (headers && typeof headers === 'object') {
                                auth = headers['Authorization'] || headers['authorization'];
                            }
                            if (auth && auth.startsWith('Bearer ')) {
                                resolved = true;
                                window.fetch = origFetch; // Restore
                                resolve(auth.slice(7));
                            }
                        }
                        return result;
                    };
                    // Trigger a request from the page to capture the token
                    const btn = document.querySelector('button[aria-label*="Generate"], button[data-action*="generate"]');
                    if (btn) btn.click();
                    // Timeout after 5s
                    setTimeout(() => {
                        if (!resolved) {
                            window.fetch = origFetch;
                            resolve(null);
                        }
                    }, 5000);
                });
            })();
        `;

        const token = await this.view.webContents
            .executeJavaScript(SDK_EXTRACT, true)
            .catch(() => null);

        if (token && typeof token === 'string') {
            this.tokenCache = {
                token,
                expiresAt: Date.now() + this.TOKEN_TTL_MS,
            };
            return token;
        }

        // 3. Check if onBeforeSendHeaders caught anything while we waited
        if (this.tokenCache && Date.now() < this.tokenCache.expiresAt) {
            return this.tokenCache.token;
        }

        throw new Error('FLOW_AUTH_REQUIRED: Could not obtain Bearer token. Ensure you are signed in at labs.google');
    }

    /**
     * Execute an authenticated fetch request INSIDE the BrowserView page context.
     * Passes the Bearer token explicitly in the Authorization header.
     * Returns the parsed JSON response.
     */
    async makeAuthenticatedRequest(url: string, body: object, bearerToken: string, contentType = 'application/json'): Promise<unknown> {
        if (!this.view) {
            throw new Error('FlowBrowserView not initialised');
        }

        const bodyJson = JSON.stringify(body).replace(/\\/g, '\\\\').replace(/'/g, "\\'");

        const script = `
            (async () => {
                const resp = await fetch('${url}', {
                    method: 'POST',
                    headers: {
                        'Content-Type': '${contentType}',
                        'Authorization': 'Bearer ${bearerToken}',
                    },
                    body: '${bodyJson}',
                });
                const text = await resp.text();
                return { status: resp.status, ok: resp.ok, body: text };
            })();
        `;

        const result = await this.view.webContents
            .executeJavaScript(script, true) as { status: number; ok: boolean; body: string };

        if (!result.ok) {
            if (result.status === 401 || result.status === 403) {
                // Invalidate cached token
                this.tokenCache = null;
                throw new Error(`FLOW_AUTH_REQUIRED: ${result.body.slice(0, 200)}`);
            }
            if (result.status === 429) {
                throw new Error('FLOW_RATE_LIMITED: Too many requests');
            }
            throw new Error(`Flow API failed (${result.status}): ${result.body.slice(0, 500)}`);
        }

        return JSON.parse(result.body);
    }



    /**
     * Returns the most recently captured reCAPTCHA Enterprise token from the
     * page's own API calls. Falls back to generating one via executeJavaScript
     * if none has been intercepted yet.
     *
     * The interception approach is preferred because tokens generated by the
     * page's own flow are always valid, whereas executeJavaScript-generated
     * tokens are sometimes rejected.
     */
    async getRecaptchaToken(action: string): Promise<string> {
        // Return the most recently intercepted token if available
        if (this.recaptchaTokenCache) {
            const token = this.recaptchaTokenCache;
            // Clear it so we don't reuse stale tokens next time
            this.recaptchaTokenCache = null;
            return token;
        }

        if (!this.view) return '';

        // Fallback: try to generate one via the page's reCAPTCHA SDK
        const SITE_KEY = '6LeMltUpAAAAAMSa7ezZBPGkCwA9p3x8JZuZ9P6x';

        const script = `
            (async () => {
                if (typeof grecaptcha === 'undefined' || !grecaptcha.enterprise) {
                    return null;
                }
                try {
                    return await grecaptcha.enterprise.execute('${SITE_KEY}', { action: '${action}' });
                } catch (e) {
                    return null;
                }
            })();
        `;

        const token = await this.view.webContents
            .executeJavaScript(script, true)
            .catch(() => null);

        // Return token if we got one; otherwise return empty string
        // (the API may still work in some configurations without reCAPTCHA)
        return (token && typeof token === 'string') ? token : '';
    }

    /** Extract the Flow project ID from the page URL or default. */
    async getProjectId(): Promise<string> {
        if (!this.view) {
            throw new Error('FlowBrowserView not initialised');
        }

        const script = `
            (async () => {
                // Try to read from page state or URL query params
                try {
                    const url = new URL(window.location.href);
                    const projectId = url.searchParams.get('projectId');
                    if (projectId) return projectId;
                } catch (_) {}
                // Fallback: scrape from page or use default routing
                return null;
            })();
        `;

        const projectId = await this.view.webContents
            .executeJavaScript(script, true)
            .catch(() => null);

        if (projectId && typeof projectId === 'string') {
            return projectId;
        }

        // Default project ID used by labs.google/fx/tools/flow for anonymous users
        return 'labs-goog-website-prod';
    }

    /**
     * Inject a raw cookie string (from the existing Google auth) into the
     * Flow BrowserView session so labs.google treats the user as signed in.
     *
     * Call this whenever the user's cookie is set/updated in the app.
     */
    async injectCookies(rawCookieString: string): Promise<void> {
        if (!this.view) return;

        const session = this.view.webContents.session;

        // Parse "name=value; name2=value2" pairs
        const pairs = rawCookieString.split(';').map((p) => p.trim()).filter(Boolean);

        for (const pair of pairs) {
            const eqIdx = pair.indexOf('=');
            if (eqIdx < 0) continue;
            const name = pair.slice(0, eqIdx).trim();
            const value = pair.slice(eqIdx + 1).trim();
            if (!name || !value) continue;

            // Set the cookie across all Google domains
            for (const domain of GOOGLE_DOMAINS) {
                const cookieDetails: CookiesSetDetails = {
                    url: `https://${domain.replace(/^\./, '')}/`,
                    domain,
                    name,
                    value,
                    path: '/',
                    secure: true,
                    httpOnly: false,
                    sameSite: 'no_restriction',
                    expirationDate: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365, // 1 year
                };
                await session.cookies.set(cookieDetails).catch(() => {
                    // Ignore individual cookie errors (invalid name/value combos)
                });
            }
        }

        // Invalidate any cached Bearer token — it may be for the wrong account
        this.tokenCache = null;
        this.loaded = false;

        // Reload the Flow page so it picks up the newly injected session
        this.view.webContents.loadURL(FLOW_URL).catch(() => { });
    }

    /** Destroy the BrowserView and clean up. */
    destroy(): void {
        if (this.view && this.mainWindow) {
            this.mainWindow.removeBrowserView(this.view);
        }
        this.view = null;
        this.mainWindow = null;
        this.tokenCache = null;
        this.loaded = false;
    }
}

/** Singleton instance used across the app. */
export const flowView = new FlowBrowserViewManager();
