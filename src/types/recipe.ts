import type { AppNode, AppEdge } from './canvas';
import type { Viewport } from '@xyflow/react';

/* ── Recipe Types ────────────────────────────────────────────────────── */

/** Metadata for a saved recipe (displayed in browser lists). */
export interface RecipeMeta {
    id: string;
    projectId: string;
    name: string;
    description?: string;
    nodeCount: number;
    edgeCount: number;
    createdAt: string;   // ISO 8601
    updatedAt: string;   // ISO 8601
}

/** Full serialised canvas snapshot stored alongside the recipe. */
export interface RecipeData {
    nodes: AppNode[];
    edges: AppEdge[];
    viewport: Viewport;
}

/** Complete recipe = meta + data. */
export interface Recipe extends RecipeMeta {
    data: RecipeData;
}

/* ── Recipe Store State ──────────────────────────────────────────────── */

export interface RecipeState {
    /* ── Data ── */
    recipes: RecipeMeta[];

    /* ── CRUD Actions ── */
    saveRecipe: (
        projectId: string,
        name: string,
        data: RecipeData,
        description?: string,
    ) => RecipeMeta;
    deleteRecipe: (projectId: string, recipeId: string) => void;
    renameRecipe: (projectId: string, recipeId: string, name: string) => void;
    cloneRecipe: (projectId: string, recipeId: string, newName: string) => RecipeMeta | null;

    /* ── Queries ── */
    loadRecipes: (projectId: string) => void;
    getRecipeData: (projectId: string, recipeId: string) => RecipeData | null;
    getRecipesByProject: (projectId: string) => RecipeMeta[];

    /* ── Canvas integration ── */
    loadRecipeToCanvas: (projectId: string, recipeId: string) => RecipeData | null;

    /* ── Cleanup ── */
    removeAllRecipes: (projectId: string) => void;
}
