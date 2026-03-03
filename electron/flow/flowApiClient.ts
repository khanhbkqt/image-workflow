/* ── Flow API Client ──────────────────────────────────────────────────── */
/* Node.js-side HTTP client for the Google Labs Flow (Nano Banana) API.  */
/* Called from IPC handlers in the Electron main process.                */

/** Aspect ratio values accepted by the Flow API. */
const FLOW_ASPECT_MAP: Record<string, string> = {
    IMAGE_ASPECT_RATIO_SQUARE: 'IMAGE_ASPECT_RATIO_SQUARE',
    IMAGE_ASPECT_RATIO_PORTRAIT: 'IMAGE_ASPECT_RATIO_PORTRAIT',
    IMAGE_ASPECT_RATIO_LANDSCAPE: 'IMAGE_ASPECT_RATIO_LANDSCAPE',
    IMAGE_ASPECT_RATIO_LANDSCAPE_FOUR_THREE: 'IMAGE_ASPECT_RATIO_LANDSCAPE',
    IMAGE_ASPECT_RATIO_UNSPECIFIED: 'IMAGE_ASPECT_RATIO_SQUARE',
};

/** Resolves a Flow-compatible aspect ratio from our internal enum. */
function toFlowAspect(aspectRatio?: string): string {
    if (!aspectRatio) return 'IMAGE_ASPECT_RATIO_SQUARE';
    return FLOW_ASPECT_MAP[aspectRatio] ?? 'IMAGE_ASPECT_RATIO_SQUARE';
}

/** Upload image bytes to the Flow asset store. Returns the asset UUID. */
export async function uploadImage(params: {
    bearerToken: string;
    projectId: string;
    imageBase64: string;
    mimeType: string;
    fileName: string;
}): Promise<string> {
    const { bearerToken, projectId, imageBase64, mimeType, fileName } = params;

    const body = JSON.stringify({
        clientContext: { projectId, tool: 'PINHOLE' },
        imageBytes: imageBase64,
        isUserUploaded: true,
        isHidden: false,
        mimeType,
        fileName,
    });

    const response = await fetch('https://aisandbox-pa.googleapis.com/v1/flow/uploadImage', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${bearerToken}`,
            // Unusual content type — required by the Flow API
            'Content-Type': 'text/plain;charset=UTF-8',
        },
        body,
    });

    if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`Flow uploadImage failed (${response.status}): ${text}`);
    }

    const data = await response.json() as Record<string, unknown>;
    const assetId = data['name'] as string | undefined;
    if (!assetId) {
        throw new Error('Flow uploadImage returned no asset name/UUID');
    }
    return assetId;
}

export interface FlowGeneratedImage {
    encodedImage: string;
    seed: number;
    mediaId: string;
}

/** Generate images using the Flow (NARWHAL) model. */
export async function generateImages(params: {
    bearerToken: string;
    recaptchaToken: string;
    projectId: string;
    prompt: string;
    model?: string;
    aspectRatio?: string;
    seed?: number;
    imageInputs?: Array<{ imageInputType: string; name: string }>;
}): Promise<{ images: FlowGeneratedImage[] }> {
    const {
        bearerToken,
        recaptchaToken,
        projectId,
        prompt,
        model = 'NARWHAL',
        aspectRatio,
        seed,
        imageInputs = [],
    } = params;

    const sessionId = `;${Date.now()}`;
    const resolvedAspect = toFlowAspect(aspectRatio);

    const requestBody = {
        clientContext: {
            projectId,
            tool: 'PINHOLE',
            sessionId,
            recaptchaToken: recaptchaToken || undefined,
        },
        mediaGenerationContext: {
            model,
            aspectRatio: resolvedAspect,
        },
        requests: [
            {
                generationContext: {
                    prompt,
                    seed: seed ?? Math.floor(Math.random() * 2 ** 31),
                    imageInputs: imageInputs.length > 0 ? imageInputs : undefined,
                },
            },
        ],
    };

    const response = await fetch(
        `https://aisandbox-pa.googleapis.com/v1/projects/${projectId}/flowMedia:batchGenerateImages`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${bearerToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        }
    );

    if (!response.ok) {
        const text = await response.text().catch(() => '');
        if (response.status === 401 || response.status === 403) {
            throw new Error(`FLOW_AUTH_REQUIRED: ${text || response.statusText}`);
        }
        if (response.status === 429) {
            throw new Error(`FLOW_RATE_LIMITED: Too many requests, please wait`);
        }
        throw new Error(`Flow batchGenerateImages failed (${response.status}): ${text}`);
    }

    const data = await response.json() as Record<string, unknown>;

    // Parse response — extract base64 images from nested structure
    const mediaList = (data['generatedMedia'] ?? data['responses'] ?? []) as Array<Record<string, unknown>>;

    const images: FlowGeneratedImage[] = [];
    for (const media of mediaList) {
        // The response may nest image data under generationResult or directly
        const generationResult = (media['generationResult'] ?? media) as Record<string, unknown>;
        const encodedImage =
            (generationResult['encodedMedia'] as string | undefined) ??
            (generationResult['encodedImage'] as string | undefined) ??
            '';
        if (!encodedImage) continue;

        images.push({
            encodedImage,
            seed: (generationResult['seed'] as number | undefined) ?? (seed ?? 0),
            mediaId: (generationResult['mediaGenerationId'] as string | undefined) ??
                (media['name'] as string | undefined) ??
                `flow-${Date.now()}`,
        });
    }

    return { images };
}

/** Get the Flow project ID.
 *  For the public labs.google/fx/tools/flow endpoint, this is a fixed value.
 *  Individual users can override this if they have their own project.
 */
export async function getProjectId(_bearerToken: string): Promise<string> {
    // The public Flow tool uses this fixed project ID for all users.
    // A future enhancement could discover the project via the API.
    return 'labs-goog-website-prod';
}

export const flowApiClient = { uploadImage, generateImages, getProjectId };
