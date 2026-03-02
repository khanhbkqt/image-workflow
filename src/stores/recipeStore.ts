import { create } from 'zustand';
import type { RecipeMeta, RecipeData, RecipeState } from '../types/recipe';
import { storage } from '../services/storage';

/* ── Constants ───────────────────────────────────────────────────────── */

const RECIPES_KEY_PREFIX = 'recipes:';
const RECIPE_DATA_KEY_PREFIX = 'recipe-data:';

/* ── Helpers ─────────────────────────────────────────────────────────── */

let idCounter = 0;
const generateId = (): string => {
    idCounter += 1;
    return `rcp_${Date.now()}_${idCounter}`;
};

const now = (): string => new Date().toISOString();

/** Storage key for the recipe-meta list of a project. */
function recipesKey(projectId: string): string {
    return `${RECIPES_KEY_PREFIX}${projectId}`;
}

/** Storage key for a single recipe's canvas data. */
function recipeDataKey(projectId: string, recipeId: string): string {
    return `${RECIPE_DATA_KEY_PREFIX}${projectId}:${recipeId}`;
}

/** Persist the recipe-meta list for a project. */
function persistRecipeList(projectId: string, recipes: RecipeMeta[]): void {
    const projectRecipes = recipes.filter((r) => r.projectId === projectId);
    storage.setItem(recipesKey(projectId), JSON.stringify(projectRecipes));
}

/** Load recipe-meta list from storage. */
function loadRecipeList(projectId: string): RecipeMeta[] {
    const raw = storage.getItem(recipesKey(projectId));
    if (!raw) return [];
    try {
        return JSON.parse(raw) as RecipeMeta[];
    } catch {
        return [];
    }
}

/** Persist recipe canvas data. */
function persistRecipeData(projectId: string, recipeId: string, data: RecipeData): void {
    storage.setItem(recipeDataKey(projectId, recipeId), JSON.stringify(data));
}

/** Load recipe canvas data from storage. */
function loadRecipeData(projectId: string, recipeId: string): RecipeData | null {
    const raw = storage.getItem(recipeDataKey(projectId, recipeId));
    if (!raw) return null;
    try {
        return JSON.parse(raw) as RecipeData;
    } catch {
        return null;
    }
}

/* ── Recipe Store ────────────────────────────────────────────────────── */

export const useRecipeStore = create<RecipeState>((set, get) => ({
    /* ── Data ── */
    recipes: [],

    /* ── CRUD Actions ── */
    saveRecipe: (
        projectId: string,
        name: string,
        data: RecipeData,
        description?: string,
    ): RecipeMeta => {
        const timestamp = now();
        const meta: RecipeMeta = {
            id: generateId(),
            projectId,
            name,
            description,
            nodeCount: data.nodes.length,
            edgeCount: data.edges.length,
            createdAt: timestamp,
            updatedAt: timestamp,
        };

        // Persist the canvas data separately
        persistRecipeData(projectId, meta.id, data);

        // Add meta to state and persist list
        set((state) => {
            const updated = [...state.recipes, meta];
            persistRecipeList(projectId, updated);
            return { recipes: updated };
        });

        return meta;
    },

    deleteRecipe: (projectId: string, recipeId: string) => {
        // Remove canvas data from storage
        storage.removeItem(recipeDataKey(projectId, recipeId));

        // Remove meta from state and persist
        set((state) => {
            const updated = state.recipes.filter((r) => r.id !== recipeId);
            persistRecipeList(projectId, updated);
            return { recipes: updated };
        });
    },

    renameRecipe: (projectId: string, recipeId: string, name: string) => {
        set((state) => {
            const updated = state.recipes.map((r) =>
                r.id === recipeId
                    ? { ...r, name, updatedAt: now() }
                    : r
            );
            persistRecipeList(projectId, updated);
            return { recipes: updated };
        });
    },

    cloneRecipe: (projectId: string, recipeId: string, newName: string): RecipeMeta | null => {
        const originalData = loadRecipeData(projectId, recipeId);
        if (!originalData) return null;

        // Use saveRecipe to create the clone
        const cloned = get().saveRecipe(projectId, newName, originalData);
        return cloned;
    },

    /* ── Queries ── */
    loadRecipes: (projectId: string) => {
        const loaded = loadRecipeList(projectId);
        set((state) => {
            // Merge: keep recipes from other projects, replace this project's recipes
            const otherRecipes = state.recipes.filter((r) => r.projectId !== projectId);
            return { recipes: [...otherRecipes, ...loaded] };
        });
    },

    getRecipeData: (projectId: string, recipeId: string): RecipeData | null => {
        return loadRecipeData(projectId, recipeId);
    },

    getRecipesByProject: (projectId: string): RecipeMeta[] => {
        return get().recipes.filter((r) => r.projectId === projectId);
    },

    /* ── Canvas integration ── */
    loadRecipeToCanvas: (projectId: string, recipeId: string): RecipeData | null => {
        return loadRecipeData(projectId, recipeId);
    },

    /* ── Cleanup ── */
    removeAllRecipes: (projectId: string) => {
        const projectRecipes = get().recipes.filter((r) => r.projectId === projectId);

        // Remove all recipe data from storage
        for (const recipe of projectRecipes) {
            storage.removeItem(recipeDataKey(projectId, recipe.id));
        }

        // Remove recipe list from storage
        storage.removeItem(recipesKey(projectId));

        // Remove from state
        set((state) => ({
            recipes: state.recipes.filter((r) => r.projectId !== projectId),
        }));
    },
}));

/* ── Cross-store Helpers ─────────────────────────────────────────────── */

/**
 * Remove all recipes belonging to a project.
 * Call this when deleting a project to cascade cleanup.
 */
export function removeRecipeData(projectId: string): void {
    useRecipeStore.getState().removeAllRecipes(projectId);
}
