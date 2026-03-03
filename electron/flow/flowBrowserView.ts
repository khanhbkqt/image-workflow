/* ── FlowBrowserView Manager ──────────────────────────────────────────── */
/* Manages a hidden BrowserView that loads labs.google/fx/tools/flow     */
/* to extract OAuth2 Bearer tokens and generate per-request reCAPTCHA    */
/* Enterprise tokens needed for the Flow API.                            */

import { BrowserView, BrowserWindow } from 'electron';

const FLOW_URL = 'https://labs.google/fx/tools/flow';

/** Cache entry for the Bearer token with TTL. */
interface TokenCache {
    token: string;
    expiresAt: number; // epoch ms
}

export class FlowBrowserViewManager {
    private view: BrowserView | null = null;
    private mainWindow: BrowserWindow | null = null;
    private tokenCache: TokenCache | null = null;
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

        // Intercept outgoing requests to capture the Bearer token
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
     * Uses the cached token if still valid; otherwise waits for a new one
     * by triggering a lightweight API probe request from the page context.
     */
    async getBearerToken(): Promise<string> {
        // Return cached token if still valid
        if (this.tokenCache && Date.now() < this.tokenCache.expiresAt) {
            return this.tokenCache.token;
        }

        if (!this.view) {
            throw new Error('FlowBrowserView not initialised');
        }

        // Trigger a minimal fetch inside the page to emit a credentialed request,
        // which will be intercepted by onBeforeSendHeaders above.
        const PROBE_SCRIPT = `
            (async () => {
                try {
                    await fetch('https://aisandbox-pa.googleapis.com/v1/flow/ping', {
                        method: 'GET',
                        credentials: 'include',
                    });
                } catch (_) {
                    // Ignore — we only need the auth header side-effect
                }
            })();
        `;

        await this.view.webContents.executeJavaScript(PROBE_SCRIPT).catch(() => null);

        // Wait up to 10 s for the interceptor to capture the token
        const deadline = Date.now() + 10_000;
        while (Date.now() < deadline) {
            if (this.tokenCache && Date.now() < this.tokenCache.expiresAt) {
                return this.tokenCache.token;
            }
            await new Promise<void>((r) => setTimeout(r, 200));
        }

        throw new Error('FLOW_AUTH_REQUIRED: Could not obtain Bearer token. Please sign in at labs.google/fx/tools/flow');
    }

    /**
     * Generates a fresh reCAPTCHA Enterprise token for the given action.
     * Tokens are per-request and must never be cached.
     */
    async getRecaptchaToken(action: string): Promise<string> {
        if (!this.view) {
            throw new Error('FlowBrowserView not initialised');
        }

        const SITE_KEY = '6LeMltUpAAAAAMSa7ezZBPGkCwA9p3x8JZuZ9P6x'; // labs.google site key

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

        if (!token || typeof token !== 'string') {
            // Return empty string — API will still work without reCAPTCHA in many cases
            return '';
        }
        return token;
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
