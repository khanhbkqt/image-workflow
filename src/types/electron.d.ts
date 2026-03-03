/* ── Electron API Type Declarations ──────────────────────────────────── */
/* Declares the window.electronAPI global exposed by preload.ts          */

import type { AuthState, GenerationResult, GenerationError, WhiskImageSlot, FlowImageInput } from './generation';

export interface ElectronAPI {
    /* Legacy generic channels */
    send: (channel: string, data: unknown) => void;
    on: (channel: string, callback: (...args: unknown[]) => void) => void;

    /* Generation API */
    validateAuth: (cookie: string) => Promise<AuthState>;
    generate: (request: {
        prompt: string;
        model?: string;
        aspectRatio?: string;
        seed?: number;
        numberOfImages?: number;
        provider: string;
        imageSlots?: WhiskImageSlot[];
        flowImageInputs?: FlowImageInput[];
    }) => Promise<GenerationResult | { error: GenerationError }>;
    generateWhisk: (request: {
        prompt: string;
        imageSlots: WhiskImageSlot[];
        aspectRatio?: string;
        seed?: number;
    }) => Promise<GenerationResult | { error: GenerationError }>;
    generateFlow: (request: {
        prompt: string;
        model?: string;
        aspectRatio?: string;
        seed?: number;
        imageInputs?: FlowImageInput[];
    }) => Promise<GenerationResult | { error: GenerationError }>;
    flowUploadImage: (params: {
        imageBase64: string;
        mimeType: string;
        fileName: string;
    }) => Promise<{ assetId: string } | { error: GenerationError }>;
    getAuthStatus: () => Promise<AuthState>;
    setAuthCookie: (cookie: string) => Promise<AuthState>;
    cancelGeneration: () => Promise<{ success: boolean }>;
}

declare global {
    interface Window {
        electronAPI?: ElectronAPI;
    }
}

