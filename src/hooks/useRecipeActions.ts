import { useCallback } from 'react';
import { useCanvasStore } from '../stores/canvasStore';
import { useRecipeStore } from '../stores/recipeStore';
import { useProjectStore } from '../stores/projectStore';
import type { RecipeMeta } from '../types/recipe';

/**
 * Custom hook wiring recipe store operations to the canvas store.
 * Provides save-current-as-recipe and load-recipe-to-canvas actions.
 */
export function useRecipeActions() {
    const activeProjectId = useProjectStore((s) => s.activeProjectId);

    const saveCurrentAsRecipe = useCallback(
        (name: string, description?: string): RecipeMeta | null => {
            if (!activeProjectId) return null;

            const { nodes, edges, viewport } = useCanvasStore.getState();
            const recipe = useRecipeStore.getState().saveRecipe(
                activeProjectId,
                name,
                { nodes, edges, viewport },
                description,
            );
            return recipe;
        },
        [activeProjectId],
    );

    const loadRecipe = useCallback(
        (recipeId: string): boolean => {
            if (!activeProjectId) return false;

            const data = useRecipeStore.getState().loadRecipeToCanvas(activeProjectId, recipeId);
            if (!data) return false;

            // Replace current canvas with the recipe data
            useCanvasStore.getState().loadCanvas(activeProjectId);

            // Override with recipe data after loading
            useCanvasStore.setState({
                nodes: data.nodes,
                edges: data.edges,
                viewport: data.viewport,
            });

            return true;
        },
        [activeProjectId],
    );

    return { saveCurrentAsRecipe, loadRecipe };
}
