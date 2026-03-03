/* ── Generation IPC Handlers ─────────────────────────────────────────── */
/* Runs in Electron main process. Wraps ImageFX/Whisk API libraries.    */

import { ipcMain } from 'electron';
import { ImageFX, Prompt as ImageFXPrompt } from '@rohitaryal/imagefx-api';
import { Whisk } from '@rohitaryal/whisk-api';
import { flowView } from '../flow/flowBrowserView.js';
import { flowApiClient } from '../flow/flowApiClient.js';


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

    // Inject the same Google cookie into the Flow BrowserView session so
    // labs.google is authenticated automatically (Option 2: share cookies).
    flowView.injectCookies(cookie).catch(() => {
        // Non-fatal — Flow generation will show FLOW_AUTH_REQUIRED if it fails
    });
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

    /* ── Flow: Upload Image ── */
    ipcMain.handle('generation:flow-upload-image', async (_event, params: {
        imageBase64: string;
        mimeType: string;
        fileName: string;
    }) => {
        try {
            const bearerToken = await flowView.getBearerToken();
            const projectId = await flowApiClient.getProjectId(bearerToken);
            const assetId = await flowApiClient.uploadImage({
                bearerToken,
                projectId,
                imageBase64: params.imageBase64,
                mimeType: params.mimeType,
                fileName: params.fileName,
            });
            return { assetId };
        } catch (err: any) {
            const code = (err?.message ?? '').startsWith('FLOW_AUTH_REQUIRED')
                ? 'FLOW_AUTH_REQUIRED'
                : 'UPLOAD_FAILED';
            return {
                error: {
                    code,
                    message: err?.message ?? 'Flow image upload failed',
                    retryable: code !== 'FLOW_AUTH_REQUIRED',
                },
            };
        }
    });

    /* ── Flow: Generate Images (Nano Banana / NARWHAL) ── */
    ipcMain.handle('generation:generate-flow', async (_event, request: {
        prompt: string;
        model?: string;
        aspectRatio?: string;
        seed?: number;
        imageInputs?: Array<{ imageInputType: string; name: string }>;
    }) => {
        try {
            const model = request.model ?? 'NARWHAL';
            const aspectRatio = request.aspectRatio ?? 'IMAGE_ASPECT_RATIO_SQUARE';
            const seed = request.seed ?? Math.floor(Math.random() * 2 ** 31);
            const sessionId = `;${Date.now()}`;
            const batchId = crypto.randomUUID();
            const projectId = 'labs-goog-website-prod';

            // Build the request body WITHOUT recaptchaContext
            // executeFlowGeneration() will inject it from the page context
            const clientCtx = {
                projectId,
                tool: 'PINHOLE',
                sessionId,
            };

            const requestBody = {
                clientContext: clientCtx,
                mediaGenerationContext: { batchId },
                useNewMedia: true,
                requests: [{
                    clientContext: clientCtx,
                    imageModelName: model,
                    imageAspectRatio: aspectRatio,
                    structuredPrompt: { parts: [{ text: request.prompt }] },
                    seed,
                    imageInputs: request.imageInputs ?? [],
                }],
            };

            // Execute entirely inside the BrowserView page context
            const data = await flowView.executeFlowGeneration(requestBody) as Record<string, unknown>;

            // Parse response
            const images: Array<{ encodedImage: string; seed: number; mediaGenerationId: string; aspectRatio: string }> = [];
            const responses = (data['responses'] ?? []) as Array<Record<string, unknown>>;

            for (const resp of responses) {
                const mediaLists = [
                    ...((resp['generatedImages'] ?? []) as Array<Record<string, unknown>>),
                    ...((resp['media'] ?? []) as Array<Record<string, unknown>>),
                    ...((resp['generatedMedia'] ?? []) as Array<Record<string, unknown>>),
                ];
                for (const media of mediaLists) {
                    const encoded = (media['encodedMedia'] ?? media['encodedImage'] ?? '') as string;
                    if (!encoded) continue;
                    images.push({
                        encodedImage: encoded,
                        seed: (media['seed'] as number | undefined) ?? seed,
                        mediaGenerationId: (media['mediaGenerationId'] ?? media['name'] ?? `flow-${Date.now()}`) as string,
                        aspectRatio,
                    });
                }
            }

            // Fallback: top-level generatedMedia
            if (images.length === 0) {
                const topMedia = (data['generatedMedia'] ?? data['media'] ?? []) as Array<Record<string, unknown>>;
                for (const media of topMedia) {
                    const encoded = (media['encodedMedia'] ?? media['encodedImage'] ?? '') as string;
                    if (!encoded) continue;
                    images.push({
                        encodedImage: encoded,
                        seed: (media['seed'] as number | undefined) ?? seed,
                        mediaGenerationId: (media['mediaGenerationId'] ?? media['name'] ?? `flow-${Date.now()}`) as string,
                        aspectRatio,
                    });
                }
            }

            if (images.length === 0) {
                console.warn('[Flow IPC] No images parsed from response:', JSON.stringify(data).slice(0, 500));
            }

            return {
                images,
                prompt: request.prompt,
                model: model as any,
                requestId: `flow-${Date.now()}`,
            };
        } catch (err: any) {
            const msg = err?.message ?? '';
            const code = msg.startsWith('FLOW_AUTH_REQUIRED')
                ? 'FLOW_AUTH_REQUIRED'
                : msg.startsWith('FLOW_RATE_LIMITED')
                    ? 'RATE_LIMITED'
                    : 'GENERATION_FAILED';
            return {
                error: {
                    code,
                    message: msg || 'Flow image generation failed',
                    retryable: code !== 'FLOW_AUTH_REQUIRED',
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
