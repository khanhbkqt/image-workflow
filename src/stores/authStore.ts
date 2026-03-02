/* ── Auth Store ──────────────────────────────────────────────────────── */
/* Zustand store managing Google API authentication state.               */

import { create } from 'zustand';
import { generationService } from '../services/generationService';
import { storage } from '../services/storage';
import type { AuthState } from '../types/generation';

const COOKIE_STORAGE_KEY = 'auth:cookie';

interface AuthStore {
    /* ── State ── */
    authState: AuthState;
    isSettingsOpen: boolean;

    /* ── Actions ── */
    validateCookie: (cookie: string) => Promise<void>;
    loadSavedAuth: () => Promise<void>;
    clearAuth: () => void;
    openSettings: () => void;
    closeSettings: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
    authState: { status: 'unconfigured' },
    isSettingsOpen: false,

    async validateCookie(cookie: string) {
        set({ authState: { status: 'validating' } });
        try {
            const result = await generationService.validateAuth(cookie);
            set({ authState: result });
            if (result.status === 'valid') {
                storage.setItem(COOKIE_STORAGE_KEY, cookie);
            }
        } catch (err: any) {
            set({
                authState: {
                    status: 'invalid',
                    error: err?.message ?? 'Validation failed',
                },
            });
        }
    },

    async loadSavedAuth() {
        const savedCookie = storage.getItem(COOKIE_STORAGE_KEY);
        if (savedCookie) {
            await get().validateCookie(savedCookie);
        }
    },

    clearAuth() {
        storage.removeItem(COOKIE_STORAGE_KEY);
        set({ authState: { status: 'unconfigured' } });
    },

    openSettings() {
        set({ isSettingsOpen: true });
    },

    closeSettings() {
        set({ isSettingsOpen: false });
    },
}));
