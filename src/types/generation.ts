/* ── Generation Types ────────────────────────────────────────────────── */

/** Supported AI generation providers. */
export type GenerationProvider = 'imagefx' | 'whisk';

/** Available ImageFX models. */
export type GenerationModel = 'IMAGEN_3_5' | 'IMAGEN_4';

/** Aspect ratio options for generated images. */
export type AspectRatio =
    | 'IMAGE_ASPECT_RATIO_SQUARE'
    | 'IMAGE_ASPECT_RATIO_PORTRAIT'
    | 'IMAGE_ASPECT_RATIO_LANDSCAPE'
    | 'IMAGE_ASPECT_RATIO_LANDSCAPE_FOUR_THREE'
    | 'IMAGE_ASPECT_RATIO_UNSPECIFIED';

/* ── Whisk (Image-Based Generation) ────────────────────────────────── */

/** Category of image input for Whisk generation. */
export type WhiskSlotType = 'subject' | 'scene' | 'style';

/** A single image input slot for Whisk generation. */
export interface WhiskImageSlot {
    slotType: WhiskSlotType;
    /** Base64-encoded image data */
    imageData: string;
}

/* ── Request / Response ─────────────────────────────────────────────── */

/** Parameters for a generation request (ImageFX text-to-image or Whisk image-based). */
export interface GenerationRequest {
    prompt: string;
    model?: GenerationModel;
    aspectRatio?: AspectRatio;
    seed?: number;
    numberOfImages?: number;
    provider: GenerationProvider;
    /** Whisk-only: image input slots for subject/scene/style. */
    imageSlots?: WhiskImageSlot[];
}

/** A single generated image from the API. */
export interface GeneratedImage {
    /** Base64-encoded image data */
    encodedImage: string;
    seed: number;
    mediaGenerationId: string;
    aspectRatio: AspectRatio;
}

/** Result of a generation request. */
export interface GenerationResult {
    images: GeneratedImage[];
    prompt: string;
    model: GenerationModel;
    requestId: string;
}

/** Lifecycle status of a generation. */
export type GenerationStatus = 'idle' | 'generating' | 'success' | 'error';

/** Structured error from the generation system. */
export interface GenerationError {
    code: string;
    message: string;
    retryable: boolean;
}

/* ── Auth ────────────────────────────────────────────────────────────── */

/** Configuration for authenticating with a generation provider. */
export interface AuthConfig {
    cookie: string;
    provider: GenerationProvider;
}

/** Possible authentication states. */
export type AuthStatus = 'unconfigured' | 'validating' | 'valid' | 'expired' | 'invalid';

/** Full authentication state for a provider. */
export interface AuthState {
    status: AuthStatus;
    user?: {
        name: string;
        email: string;
        image?: string;
    };
    error?: string;
}

/* ── IPC Channels ───────────────────────────────────────────────────── */

/** Channel names for Electron main ↔ renderer IPC communication. */
export const IPC_CHANNELS = {
    GENERATE: 'generation:generate',
    GENERATE_WHISK: 'generation:generate-whisk',
    CANCEL: 'generation:cancel',
    AUTH_VALIDATE: 'generation:auth-validate',
    AUTH_STATUS: 'generation:auth-status',
    AUTH_SET_COOKIE: 'generation:auth-set-cookie',
} as const;

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];
