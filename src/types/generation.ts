/* ── Generation Types ────────────────────────────────────────────────── */

/** Supported AI generation providers. */
export type GenerationProvider = 'imagefx' | 'whisk' | 'flow';

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

/* ── Flow (Nano Banana) ────────────────────────────────────────────── */

/** Available Flow models. */
export type FlowModel = 'NARWHAL';

/** Image input type for Flow generation. */
export type FlowImageInputType = 'IMAGE_INPUT_TYPE_REFERENCE';

/** A single image input for Flow generation (uses uploaded asset UUID). */
export interface FlowImageInput {
    imageInputType: FlowImageInputType;
    /** Asset UUID returned from uploadImage */
    name: string;
}

/** Parameters for a Flow generation request. */
export interface FlowGenerationRequest {
    prompt: string;
    model: FlowModel;
    aspectRatio?: string;
    seed?: number;
    imageInputs?: FlowImageInput[];
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
    /** Flow-only: pre-uploaded reference image asset IDs. */
    flowImageInputs?: FlowImageInput[];
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
    GENERATE_FLOW: 'generation:generate-flow',
    FLOW_UPLOAD_IMAGE: 'generation:flow-upload-image',
    CANCEL: 'generation:cancel',
    AUTH_VALIDATE: 'generation:auth-validate',
    AUTH_STATUS: 'generation:auth-status',
    AUTH_SET_COOKIE: 'generation:auth-set-cookie',
} as const;

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];

/* ── Generation Queue ───────────────────────────────────────────────── */

/** Lifecycle status of a single queue job. */
export type QueueJobStatus = 'pending' | 'running' | 'done' | 'error';

/** A single job in the generation queue. */
export interface QueueJob {
    /** Unique job identifier */
    id: string;
    /** The canvas node this job belongs to */
    nodeId: string;
    /** The generation request payload */
    request: GenerationRequest;
    /** Current lifecycle status */
    status: QueueJobStatus;
    /** How many times this job has been retried */
    retryCount: number;
    /** When the job was enqueued (ISO string) */
    enqueuedAt: string;
    /** When the job started processing */
    startedAt?: string;
    /** When the job finished (success or final error) */
    completedAt?: string;
    /** Result on success */
    result?: GenerationResult;
    /** Error on failure */
    error?: GenerationError;
}

/** Shape of the Zustand generation queue store. */
export interface GenerationQueueState {
    jobs: QueueJob[];
    activeJobId: string | null;
    processing: boolean;
    enqueue: (nodeId: string, request: GenerationRequest) => string; // returns jobId
    cancelJob: (jobId: string) => void;
    removeJob: (jobId: string) => void;
    clearCompleted: () => void;
    updateJob: (jobId: string, patch: Partial<QueueJob>) => void;
    processNext: () => Promise<void>;
    // Derived helpers
    pendingCount: () => number;
    jobForNode: (nodeId: string) => QueueJob | undefined;
}
