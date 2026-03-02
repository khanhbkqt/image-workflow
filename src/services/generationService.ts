/* ── Generation Service ──────────────────────────────────────────────── */
/* Renderer-side wrapper around Electron IPC. Falls back to mock         *
 * responses when running in browser dev mode (no Electron).             */

import type { AuthState, GenerationRequest, GenerationResult, GenerationError } from '../types/generation';

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

/** Generate images from a text prompt. */
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
    getAuthStatus,
    setAuthCookie,
    cancelGeneration,
};
