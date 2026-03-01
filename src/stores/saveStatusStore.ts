import { create } from 'zustand';

/* ── Save Status Store ───────────────────────────────────────────────── */

export interface SaveStatusState {
    isSaving: boolean;
    lastSavedAt: string | null;

    markSaving: () => void;
    markSaved: () => void;
}

export const useSaveStatusStore = create<SaveStatusState>((set) => ({
    isSaving: false,
    lastSavedAt: null,

    markSaving: () => set({ isSaving: true }),
    markSaved: () => set({ isSaving: false, lastSavedAt: new Date().toISOString() }),
}));
