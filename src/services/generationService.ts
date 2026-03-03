/* ── Generation Service ──────────────────────────────────────────────── */
/* Renderer-side wrapper around Electron IPC. Falls back to mock         *
 * responses when running in browser dev mode (no Electron).             */

import type { AuthState, GenerationRequest, GenerationResult, GenerationError, WhiskImageSlot, FlowImageInput } from '../types/generation';

function isElectron(): boolean {
    return typeof window !== 'undefined' && !!window.electronAPI;
}

/** Validate a Google cookie and return auth state. */
async function validateAuth(cookie: string): Promise<AuthState> {
    if (!isElectron()) {
        console.warn('[generationService] Not running in Electron — returning mock auth');
        return {
            status: 'invalid',
            error: 'Generation requires the Electron desktop app. Running in browser dev mode.',
        };
    }
    return window.electronAPI!.validateAuth(cookie);
}

/** Generate images from a text prompt (ImageFX). */
async function generate(request: GenerationRequest): Promise<GenerationResult | { error: GenerationError }> {
    if (!isElectron()) {
        return {
            error: {
                code: 'NOT_ELECTRON',
                message: 'Image generation requires the Electron desktop app.',
                retryable: false,
            },
        };
    }
    return window.electronAPI!.generate(request);
}

/** Generate images using Whisk (image-based generation). */
async function generateWhisk(request: {
    prompt: string;
    imageSlots: WhiskImageSlot[];
    aspectRatio?: string;
    seed?: number;
}): Promise<GenerationResult | { error: GenerationError }> {
    if (!isElectron()) {
        return {
            error: {
                code: 'NOT_ELECTRON',
                message: 'Whisk generation requires the Electron desktop app.',
                retryable: false,
            },
        };
    }
    return window.electronAPI!.generateWhisk(request);
}

/** Generate images using Flow / Nano Banana (NARWHAL model). */
async function generateFlow(request: {
    prompt: string;
    model?: string;
    aspectRatio?: string;
    seed?: number;
    imageInputs?: FlowImageInput[];
}): Promise<GenerationResult | { error: GenerationError }> {
    if (!isElectron()) {
        return {
            error: {
                code: 'NOT_ELECTRON',
                message: 'Flow generation requires the Electron desktop app.',
                retryable: false,
            },
        };
    }
    return window.electronAPI!.generateFlow(request);
}

/** Upload an image to the Flow asset store, returns the asset UUID. */
async function flowUploadImage(params: {
    imageBase64: string;
    mimeType: string;
    fileName: string;
}): Promise<{ assetId: string } | { error: GenerationError }> {
    if (!isElectron()) {
        return {
            error: {
                code: 'NOT_ELECTRON',
                message: 'Flow image upload requires the Electron desktop app.',
                retryable: false,
            },
        };
    }
    return window.electronAPI!.flowUploadImage(params);
}

/** Get current authentication status. */
async function getAuthStatus(): Promise<AuthState> {
    if (!isElectron()) {
        return { status: 'unconfigured' };
    }
    return window.electronAPI!.getAuthStatus();
}

/** Set the auth cookie (validates automatically). */
async function setAuthCookie(cookie: string): Promise<AuthState> {
    if (!isElectron()) {
        return {
            status: 'invalid',
            error: 'Not running in Electron.',
        };
    }
    return window.electronAPI!.setAuthCookie(cookie);
}

/** Cancel in-flight generation. */
async function cancelGeneration(): Promise<void> {
    if (isElectron()) {
        await window.electronAPI!.cancelGeneration();
    }
}

export const generationService = {
    validateAuth,
    generate,
    generateWhisk,
    generateFlow,
    flowUploadImage,
    getAuthStatus,
    setAuthCookie,
    cancelGeneration,
};

