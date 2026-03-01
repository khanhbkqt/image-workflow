import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Ingredient, IngredientType, CreateIngredientInput } from '../types/ingredient';
import { DEMO_INGREDIENTS } from '../data/seedIngredients';

/* ── Helpers ─────────────────────────────────────────────────────────── */

let idCounter = 0;
const generateId = (): string => {
    idCounter += 1;
    return `ing_${Date.now()}_${idCounter}`;
};

const now = (): string => new Date().toISOString();

/* ── Store Shape ─────────────────────────────────────────────────────── */

export interface IngredientState {
    /* ── Data ── */
    ingredients: Ingredient[];
    isLoading: boolean;

    /* ── CRUD Actions ── */
    addIngredient: (input: CreateIngredientInput) => Ingredient;
    updateIngredient: (id: string, updates: Partial<Ingredient>) => void;
    deleteIngredient: (id: string) => void;

    /* ── Queries ── */
    getIngredientsByProject: (projectId: string) => Ingredient[];
    getIngredientsByType: (projectId: string, type: IngredientType) => Ingredient[];
    getIngredientById: (id: string) => Ingredient | undefined;
    getIngredientsByIds: (ids: string[]) => Ingredient[];
}

/* ── Ingredient Store ────────────────────────────────────────────────── */

export const useIngredientStore = create<IngredientState>()(
    persist(
        (set, get) => ({
            /* ── Data ── */
            ingredients: DEMO_INGREDIENTS as Ingredient[],
            isLoading: false,

            /* ── CRUD Actions ── */
            addIngredient: (input: CreateIngredientInput): Ingredient => {
                const timestamp = now();
                const ingredient: Ingredient = {
                    ...input,
                    id: generateId(),
                    createdAt: timestamp,
                    updatedAt: timestamp,
                };
                set((state) => ({
                    ingredients: [...state.ingredients, ingredient],
                }));
                return ingredient;
            },

            updateIngredient: (id: string, updates: Partial<Ingredient>) => {
                set((state) => ({
                    ingredients: state.ingredients.map((ing) =>
                        ing.id === id
                            ? { ...ing, ...updates, updatedAt: now() }
                            : ing
                    ),
                }));
            },

            deleteIngredient: (id: string) => {
                set((state) => {
                    // Remove the ingredient itself
                    const remaining = state.ingredients.filter((ing) => ing.id !== id);

                    // Cascade: remove this id from any brand-kit's styleIds/modifierIds
                    const updated = remaining.map((ing) => {
                        if (ing.type !== 'brand-kit') return ing;
                        const bk = ing as typeof ing & { styleIds?: string[]; modifierIds?: string[] };
                        const newStyleIds = (bk.styleIds ?? []).filter((sid) => sid !== id);
                        const newModifierIds = (bk.modifierIds ?? []).filter((mid) => mid !== id);
                        if (
                            newStyleIds.length === (bk.styleIds ?? []).length &&
                            newModifierIds.length === (bk.modifierIds ?? []).length
                        ) {
                            return ing; // no change
                        }
                        return { ...ing, styleIds: newStyleIds, modifierIds: newModifierIds };
                    });

                    return { ingredients: updated };
                });
            },

            /* ── Queries ── */
            getIngredientsByProject: (projectId: string): Ingredient[] => {
                return get().ingredients.filter((ing) => ing.projectId === projectId);
            },

            getIngredientsByType: (projectId: string, type: IngredientType): Ingredient[] => {
                return get().ingredients.filter(
                    (ing) => ing.projectId === projectId && ing.type === type
                );
            },

            getIngredientById: (id: string): Ingredient | undefined => {
                return get().ingredients.find((ing) => ing.id === id);
            },

            getIngredientsByIds: (ids: string[]): Ingredient[] => {
                const all = get().ingredients;
                return ids
                    .map((id) => all.find((ing) => ing.id === id))
                    .filter((ing): ing is Ingredient => ing !== undefined);
            },
        }),
        {
            name: 'iw:ingredients',
            version: 1,
            migrate: (persisted, _version) => {
                // v1: initial schema — no migration needed yet
                return persisted as Record<string, unknown>;
            },
            partialize: (state) => ({
                ingredients: state.ingredients,
            }),
        }
    )
);

/* ── Cross-store Helpers ─────────────────────────────────────────────── */

/**
 * Remove all ingredients belonging to a project.
 * Call this when deleting a project to cascade cleanup.
 */
export function removeIngredientData(projectId: string): void {
    useIngredientStore.setState((state) => ({
        ingredients: state.ingredients.filter((ing) => ing.projectId !== projectId),
    }));
}
