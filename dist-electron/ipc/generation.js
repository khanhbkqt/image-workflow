/* ── Generation IPC Handlers ─────────────────────────────────────────── */
/* Runs in Electron main process. Wraps ImageFX/Whisk API libraries.    */
import { ipcMain } from 'electron';
import { ImageFX, Prompt as ImageFXPrompt } from '@rohitaryal/imagefx-api';
import { Whisk } from '@rohitaryal/whisk-api';
import { flowView } from '../flow/flowBrowserView.js';
import { flowApiClient } from '../flow/flowApiClient.js';
/* ── State ── */
let imagefxClient = null;
let whiskClient = null;
let currentCookie = null;
let lastUser = null;
/* ── Helpers ── */
function getAuthState() {
    if (!imagefxClient || !currentCookie) {
        return { status: 'unconfigured' };
    }
    return {
        status: 'valid',
        user: lastUser ?? undefined,
    };
}
/** Create both ImageFX and Whisk clients from a validated cookie. */
function setClientsFromAuth(client, cookie, user) {
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
export function registerGenerationHandlers() {
    /* ── Auth: Validate Cookie ── */
    ipcMain.handle('generation:auth-validate', async (_event, cookie) => {
        try {
            const client = new ImageFX(cookie);
            const account = client.account;
            await account.refreshSession();
            const user = account.user ? {
                name: account.user.name,
                email: account.user.email,
                image: account.user.image,
            } : null;
            setClientsFromAuth(client, cookie, user);
            return {
                status: 'valid',
                user: lastUser ?? undefined,
            };
        }
        catch (err) {
            clearClients();
            return {
                status: 'invalid',
                error: err?.message ?? 'Failed to validate cookie',
            };
        }
    });
    /* ── Auth: Get Status ── */
    ipcMain.handle('generation:auth-status', async () => {
        return getAuthState();
    });
    /* ── Auth: Set Cookie (quick store, no validation) ── */
    ipcMain.handle('generation:auth-set-cookie', async (_event, cookie) => {
        try {
            const client = new ImageFX(cookie);
            const account = client.account;
            await account.refreshSession();
            const user = account.user ? {
                name: account.user.name,
                email: account.user.email,
                image: account.user.image,
            } : null;
            setClientsFromAuth(client, cookie, user);
            return { status: 'valid', user: lastUser ?? undefined };
        }
        catch (err) {
            return { status: 'invalid', error: err?.message ?? 'Invalid cookie' };
        }
    });
    /* ── Generate Image (ImageFX — text-to-image) ── */
    ipcMain.handle('generation:generate', async (_event, request) => {
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
                aspectRatio: request.aspectRatio ?? 'IMAGE_ASPECT_RATIO_SQUARE',
                generationModel: request.model ?? 'IMAGEN_3_5',
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
        }
        catch (err) {
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
    ipcMain.handle('generation:generate-whisk', async (_event, request) => {
        if (!whiskClient) {
            return {
                error: {
                    code: 'AUTH_REQUIRED',
                    message: 'Not authenticated. Please set your Google cookie in Settings.',
                    retryable: false,
                },
            };
        }
        let project = null;
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
                aspectRatio: request.aspectRatio ?? 'IMAGE_ASPECT_RATIO_SQUARE',
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
                model: 'IMAGEN_3_5',
                requestId: `whisk-${Date.now()}`,
            };
        }
        catch (err) {
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
    ipcMain.handle('generation:flow-upload-image', async (_event, params) => {
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
        }
        catch (err) {
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
    ipcMain.handle('generation:generate-flow', async (_event, request) => {
        try {
            const bearerToken = await flowView.getBearerToken();
            const recaptchaToken = await flowView.getRecaptchaToken('batchGenerateImages');
            const projectId = await flowApiClient.getProjectId(bearerToken);
            const { images } = await flowApiClient.generateImages({
                bearerToken,
                recaptchaToken,
                projectId,
                prompt: request.prompt,
                model: request.model ?? 'NARWHAL',
                aspectRatio: request.aspectRatio,
                seed: request.seed,
                imageInputs: request.imageInputs,
            });
            return {
                images: images.map((img) => ({
                    encodedImage: img.encodedImage,
                    seed: img.seed,
                    mediaGenerationId: img.mediaId,
                    aspectRatio: request.aspectRatio ?? 'IMAGE_ASPECT_RATIO_SQUARE',
                })),
                prompt: request.prompt,
                model: (request.model ?? 'NARWHAL'),
                requestId: `flow-${Date.now()}`,
            };
        }
        catch (err) {
            const code = (err?.message ?? '').startsWith('FLOW_AUTH_REQUIRED')
                ? 'FLOW_AUTH_REQUIRED'
                : (err?.message ?? '').startsWith('FLOW_RATE_LIMITED')
                    ? 'RATE_LIMITED'
                    : 'GENERATION_FAILED';
            return {
                error: {
                    code,
                    message: err?.message ?? 'Flow image generation failed',
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
