import { useState, useEffect, useCallback } from 'react';
import { useRecipeStore } from '../../stores/recipeStore';
import { useProjectStore } from '../../stores/projectStore';
import { RecipeCard } from './RecipeCard';
import type { RecipeMeta } from '../../types/recipe';
import './RecipeBrowser.css';

/* ── Icons ──────────────────────────────────────────────────────────────── */
const BookmarkIcon = () => (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
        <path d="M4 2h8a1 1 0 011 1v11l-5-3-5 3V3a1 1 0 011-1z" />
    </svg>
);

const ChevronIcon = () => (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="10" height="10">
        <path d="M6 4l4 4-4 4" />
    </svg>
);

const FileIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="24" height="24">
        <path d="M9 12h6M9 16h6M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
        <path d="M14 2v6h6" />
    </svg>
);

/* ── Props ──────────────────────────────────────────────────────────────── */
export interface RecipeBrowserProps {
    onLoadRecipe: (recipe: RecipeMeta) => void;
    onRenameRecipe: (recipe: RecipeMeta) => void;
    onDeleteRecipe: (recipe: RecipeMeta) => void;
    onCloneRecipe: (recipe: RecipeMeta) => void;
}

/* ── Component ─────────────────────────────────────────────────────────── */
export function RecipeBrowser({ onLoadRecipe, onRenameRecipe, onDeleteRecipe, onCloneRecipe }: RecipeBrowserProps) {
    const [collapsed, setCollapsed] = useState(false);

    const activeProjectId = useProjectStore((s) => s.activeProjectId);
    const loadRecipes = useRecipeStore((s) => s.loadRecipes);
    const recipes = useRecipeStore(
        useCallback(
            (s) => (activeProjectId ? s.getRecipesByProject(activeProjectId) : []),
            [activeProjectId],
        ),
    );

    /* Load recipes for the current project on mount / project change */
    useEffect(() => {
        if (activeProjectId) {
            loadRecipes(activeProjectId);
        }
    }, [activeProjectId, loadRecipes]);

    const handleCardClick = (recipe: RecipeMeta) => {
        onLoadRecipe(recipe);
    };

    return (
        <div className="app-sidebar__section">
            <button
                className="recipe-browser__toggle"
                onClick={() => setCollapsed((v) => !v)}
                aria-expanded={!collapsed}
            >
                <BookmarkIcon />
                Recipes
                {recipes.length > 0 && (
                    <span className="recipe-browser__count">{recipes.length}</span>
                )}
                <span className={`recipe-browser__chevron${collapsed ? '' : ' recipe-browser__chevron--open'}`}>
                    <ChevronIcon />
                </span>
            </button>

            {!collapsed && (
                <>
                    {recipes.length === 0 ? (
                        <div className="recipe-browser__empty">
                            <span className="recipe-browser__empty-icon">
                                <FileIcon />
                            </span>
                            <span className="recipe-browser__empty-text">
                                No recipes saved. Save your current workflow as a recipe.
                            </span>
                        </div>
                    ) : (
                        <div className="recipe-browser__list">
                            {recipes.map((recipe) => (
                                <RecipeCard
                                    key={recipe.id}
                                    recipe={recipe}
                                    onClick={() => handleCardClick(recipe)}
                                    onLoad={() => onLoadRecipe(recipe)}
                                    onRename={() => onRenameRecipe(recipe)}
                                    onDelete={() => onDeleteRecipe(recipe)}
                                    onClone={() => onCloneRecipe(recipe)}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
