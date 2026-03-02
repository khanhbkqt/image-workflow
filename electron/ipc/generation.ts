/* ── Generation IPC Handlers ─────────────────────────────────────────── */
/* Runs in Electron main process. Wraps ImageFX/Whisk API libraries.    */

import { ipcMain } from 'electron';
import { ImageFX, Prompt as ImageFXPrompt } from '@rohitaryal/imagefx-api';

/* ── State ── */
let imagefxClient: ImageFX | null = null;
let currentCookie: string | null = null;
let lastUser: { name: string; email: string; image?: string } | null = null;

/* ── Helpers ── */
function getAuthState() {
    if (!imagefxClient || !currentCookie) {
        return { status: 'unconfigured' as const };
    }
    return {
        status: 'valid' as const,
        user: lastUser ?? undefined,
    };
}

/* ── Register Handlers ── */
export function registerGenerationHandlers(): void {

    /* ── Auth: Validate Cookie ── */
    ipcMain.handle('generation:auth-validate', async (_event, cookie: string) => {
        try {
            const client = new ImageFX(cookie);
            // The Account constructor + refreshSession validates the cookie
            // The ImageFX constructor creates an Account internally
            // We try a lightweight operation to confirm the token works
            // Access the internal account to get user info
            const account = (client as any).account;
            await account.refreshSession();

            imagefxClient = client;
            currentCookie = cookie;
            lastUser = account.user ? {
                name: account.user.name,
                email: account.user.email,
                image: account.user.image,
            } : null;

            return {
                status: 'valid' as const,
                user: lastUser ?? undefined,
            };
        } catch (err: any) {
            imagefxClient = null;
            currentCookie = null;
            lastUser = null;
            return {
                status: 'invalid' as const,
                error: err?.message ?? 'Failed to validate cookie',
            };
        }
    });

    /* ── Auth: Get Status ── */
    ipcMain.handle('generation:auth-status', async () => {
        return getAuthState();
    });

    /* ── Auth: Set Cookie (quick store, no validation) ── */
    ipcMain.handle('generation:auth-set-cookie', async (_event, cookie: string) => {
        try {
            const client = new ImageFX(cookie);
            const account = (client as any).account;
            await account.refreshSession();

            imagefxClient = client;
            currentCookie = cookie;
            lastUser = account.user ? {
                name: account.user.name,
                email: account.user.email,
                image: account.user.image,
            } : null;

            return { status: 'valid' as const, user: lastUser ?? undefined };
        } catch (err: any) {
            return { status: 'invalid' as const, error: err?.message ?? 'Invalid cookie' };
        }
    });

    /* ── Generate Image ── */
    ipcMain.handle('generation:generate', async (_event, request: {
        prompt: string;
        model?: string;
        aspectRatio?: string;
        seed?: number;
        numberOfImages?: number;
    }) => {
        if (!imagefxClient) {
            return {
                error: {
                    code: 'AUTH_REQUIRED',
                    message: 'Not authenticated. Please set your Google cookie in Settings.',
                    retryable: false,
                },
            };
        }

        try {
            const prompt = new ImageFXPrompt({
                prompt: request.prompt,
                seed: request.seed ?? 0,
                numberOfImages: request.numberOfImages ?? 4,
                aspectRatio: (request.aspectRatio as any) ?? 'IMAGE_ASPECT_RATIO_SQUARE',
                generationModel: (request.model as any) ?? 'IMAGEN_3_5',
            });

            const images = await imagefxClient.generateImage(prompt);

            return {
                images: images.map((img) => ({
                    encodedImage: img.encodedImage,
                    seed: img.seed,
                    mediaGenerationId: img.mediaId,
                    aspectRatio: img.aspectRatio,
                })),
                prompt: request.prompt,
                model: request.model ?? 'IMAGEN_3_5',
                requestId: `gen-${Date.now()}`,
            };
        } catch (err: any) {
            return {
                error: {
                    code: 'GENERATION_FAILED',
                    message: err?.message ?? 'Image generation failed',
                    retryable: true,
                },
            };
        }
    });

    /* ── Cancel (placeholder — the API doesn't support cancellation) ── */
    ipcMain.handle('generation:cancel', async () => {
        // No-op for now; the ImageFX API doesn't support request cancellation
        return { success: true };
    });
}
