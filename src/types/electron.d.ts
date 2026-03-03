/* ── Electron API Type Declarations ──────────────────────────────────── */
/* Declares the window.electronAPI global exposed by preload.ts          */

import type { AuthState, GenerationRequest, GenerationResult, GenerationError, WhiskImageSlot } from './generation';

export interface ElectronAPI {
    /* Legacy generic channels */
    send: (channel: string, data: unknown) => void;
    on: (channel: string, callback: (...args: unknown[]) => void) => void;

    /* Generation API */
    validateAuth: (cookie: string) => Promise<AuthState>;
    generate: (request: GenerationRequest) => Promise<GenerationResult | { error: GenerationError }>;
    generateWhisk: (request: {
        prompt: string;
        imageSlots: WhiskImageSlot[];
        aspectRatio?: string;
        seed?: number;
    }) => Promise<GenerationResult | { error: GenerationError }>;
    getAuthStatus: () => Promise<AuthState>;
    setAuthCookie: (cookie: string) => Promise<AuthState>;
    cancelGeneration: () => Promise<{ success: boolean }>;
}

declare global {
    interface Window {
        electronAPI?: ElectronAPI;
    }
}
