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
    const batchId = crypto.randomUUID();
    const resolvedAspect = toFlowAspect(aspectRatio);
    const resolvedSeed = seed ?? Math.floor(Math.random() * 2 ** 31);

    /** clientContext is required at BOTH the top level and inside each request item */
    const clientCtx = {
        recaptchaContext: recaptchaToken
            ? { token: recaptchaToken, applicationType: 'RECAPTCHA_APPLICATION_TYPE_WEB' }
            : undefined,
        projectId,
        tool: 'PINHOLE',
        sessionId,
    };

    const requestBody = {
        clientContext: clientCtx,
        mediaGenerationContext: {
            batchId,
        },
        useNewMedia: true,
        requests: [
            {
                clientContext: clientCtx,
                imageModelName: model,
                imageAspectRatio: resolvedAspect,
                structuredPrompt: {
                    parts: [{ text: prompt }],
                },
                seed: resolvedSeed,
                imageInputs: imageInputs.length > 0 ? imageInputs : [],
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

    // The Flow API returns images nested under responses[].generatedImages[] or responses[].media[]
    // Try several known shapes from the research
    const images: FlowGeneratedImage[] = [];

    const topLevelResponses = (data['responses'] ?? []) as Array<Record<string, unknown>>;
    const topLevelMedia = (data['generatedMedia'] ?? data['media'] ?? []) as Array<Record<string, unknown>>;

    // Shape 1: responses[] array (observed in research)
    for (const resp of topLevelResponses) {
        const mediaList = ([
            ...(resp['generatedImages'] as Array<Record<string, unknown>> ?? []),
            ...(resp['media'] as Array<Record<string, unknown>> ?? []),
            ...(resp['generatedMedia'] as Array<Record<string, unknown>> ?? []),
        ]);
        for (const media of mediaList) {
            const encoded =
                (media['encodedMedia'] as string | undefined) ??
                (media['encodedImage'] as string | undefined) ?? '';
            if (!encoded) continue;
            images.push({
                encodedImage: encoded,
                seed: (media['seed'] as number | undefined) ?? resolvedSeed,
                mediaId: (media['mediaGenerationId'] as string | undefined) ??
                    (media['name'] as string | undefined) ??
                    `flow-${Date.now()}`,
            });
        }

        // Also check if the response item itself has encodedMedia directly
        const directEncoded =
            (resp['encodedMedia'] as string | undefined) ??
            (resp['encodedImage'] as string | undefined);
        if (directEncoded && images.length === 0) {
            images.push({
                encodedImage: directEncoded,
                seed: (resp['seed'] as number | undefined) ?? resolvedSeed,
                mediaId: (resp['mediaGenerationId'] as string | undefined) ??
                    (resp['name'] as string | undefined) ??
                    `flow-${Date.now()}`,
            });
        }
    }

    // Shape 2: top-level generatedMedia[] (fallback)
    if (images.length === 0) {
        for (const media of topLevelMedia) {
            const encoded =
                (media['encodedMedia'] as string | undefined) ??
                (media['encodedImage'] as string | undefined) ?? '';
            if (!encoded) continue;
            images.push({
                encodedImage: encoded,
                seed: (media['seed'] as number | undefined) ?? resolvedSeed,
                mediaId: (media['mediaGenerationId'] as string | undefined) ??
                    (media['name'] as string | undefined) ??
                    `flow-${Date.now()}`,
            });
        }
    }

    // Log the raw response for debugging if we got no images
    if (images.length === 0) {
        console.warn('[flowApiClient] No images extracted from response:', JSON.stringify(data).slice(0, 500));
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
