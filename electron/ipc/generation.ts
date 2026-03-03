/* ── Generation IPC Handlers ─────────────────────────────────────────── */
/* Runs in Electron main process. Wraps ImageFX/Whisk API libraries.    */

import { ipcMain } from 'electron';
import { ImageFX, Prompt as ImageFXPrompt } from '@rohitaryal/imagefx-api';
import { Whisk } from '@rohitaryal/whisk-api';

/* ── State ── */
let imagefxClient: ImageFX | null = null;
let whiskClient: Whisk | null = null;
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

/** Create both ImageFX and Whisk clients from a validated cookie. */
function setClientsFromAuth(client: ImageFX, cookie: string, user: typeof lastUser) {
    imagefxClient = client;
    whiskClient = new Whisk(cookie);
    currentCookie = cookie;
    lastUser = user;
}

function clearClients() {
    imagefxClient = null;
    whiskClient = null;
    currentCookie = null;
    lastUser = null;
}

/* ── Register Handlers ── */
export function registerGenerationHandlers(): void {

    /* ── Auth: Validate Cookie ── */
    ipcMain.handle('generation:auth-validate', async (_event, cookie: string) => {
        try {
            const client = new ImageFX(cookie);
            const account = (client as any).account;
            await account.refreshSession();

            const user = account.user ? {
                name: account.user.name,
                email: account.user.email,
                image: account.user.image,
            } : null;

            setClientsFromAuth(client, cookie, user);

            return {
                status: 'valid' as const,
                user: lastUser ?? undefined,
            };
        } catch (err: any) {
            clearClients();
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

            const user = account.user ? {
                name: account.user.name,
                email: account.user.email,
                image: account.user.image,
            } : null;

            setClientsFromAuth(client, cookie, user);

            return { status: 'valid' as const, user: lastUser ?? undefined };
        } catch (err: any) {
            return { status: 'invalid' as const, error: err?.message ?? 'Invalid cookie' };
        }
    });

    /* ── Generate Image (ImageFX — text-to-image) ── */
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

    /* ── Generate Image (Whisk — image-based generation) ── */
    ipcMain.handle('generation:generate-whisk', async (_event, request: {
        prompt: string;
        imageSlots: Array<{ slotType: string; imageData: string }>;
        aspectRatio?: string;
        seed?: number;
    }) => {
        if (!whiskClient) {
            return {
                error: {
                    code: 'AUTH_REQUIRED',
                    message: 'Not authenticated. Please set your Google cookie in Settings.',
                    retryable: false,
                },
            };
        }

        let project: Awaited<ReturnType<Whisk['newProject']>> | null = null;

        try {
            project = await whiskClient.newProject(`gen-${Date.now()}`);

            // Add image slots to the project
            for (const slot of request.imageSlots) {
                const imageInput = { base64: slot.imageData };
                switch (slot.slotType) {
                    case 'subject':
                        await project.addSubject(imageInput);
                        break;
                    case 'scene':
                        await project.addScene(imageInput);
                        break;
                    case 'style':
                        await project.addStyle(imageInput);
                        break;
                }
            }

            // Generate with references
            const media = await project.generateImageWithReferences({
                prompt: request.prompt,
                seed: request.seed,
                aspectRatio: (request.aspectRatio as any) ?? 'IMAGE_ASPECT_RATIO_SQUARE',
            });

            // Clean up project (fire-and-forget)
            project.delete().catch(() => { });

            return {
                images: [{
                    encodedImage: media.encodedMedia,
                    seed: media.seed,
                    mediaGenerationId: media.mediaGenerationId,
                    aspectRatio: media.aspectRatio,
                }],
                prompt: request.prompt,
                model: 'IMAGEN_3_5' as const,
                requestId: `whisk-${Date.now()}`,
            };
        } catch (err: any) {
            // Clean up project on failure too
            if (project) {
                project.delete().catch(() => { });
            }
            return {
                error: {
                    code: 'GENERATION_FAILED',
                    message: err?.message ?? 'Whisk image generation failed',
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
