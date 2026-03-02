import { useState, useRef, useEffect, type MouseEvent } from 'react';
import type { RecipeMeta } from '../../types/recipe';
import './RecipeCard.css';

/* ── Icons ──────────────────────────────────────────────────────────────── */
const DotsIcon = () => (
    <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
        <circle cx="8" cy="3" r="1.2" />
        <circle cx="8" cy="8" r="1.2" />
        <circle cx="8" cy="13" r="1.2" />
    </svg>
);

/* ── Props ──────────────────────────────────────────────────────────────── */
export interface RecipeCardProps {
    recipe: RecipeMeta;
    onClick: () => void;
    onLoad: () => void;
    onRename: () => void;
    onDelete: () => void;
    onClone: () => void;
}

/* ── Component ─────────────────────────────────────────────────────────── */
export function RecipeCard({ recipe, onClick, onLoad, onRename, onDelete, onClone }: RecipeCardProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    /* Close dropdown on outside click */
    useEffect(() => {
        if (!menuOpen) return;
        const handleClick = (e: Event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [menuOpen]);

    const handleMenuClick = (e: MouseEvent) => {
        e.stopPropagation();
        setMenuOpen((v) => !v);
    };

    const handleAction = (e: MouseEvent, action: () => void) => {
        e.stopPropagation();
        setMenuOpen(false);
        action();
    };

    const timeAgo = formatTimeAgo(recipe.updatedAt);

    return (
        <div className="recipe-card" onClick={onClick} role="button" tabIndex={0}>
            <div className="recipe-card__info">
                <span className="recipe-card__name">{recipe.name}</span>
                <span className="recipe-card__meta">
                    {recipe.nodeCount} nodes
                    <span className="recipe-card__meta-sep">·</span>
                    {recipe.edgeCount} edges
                    <span className="recipe-card__meta-sep">·</span>
                    {timeAgo}
                </span>
            </div>

            <button
                className="recipe-card__menu-btn"
                onClick={handleMenuClick}
                aria-label="Recipe actions"
                title="Actions"
            >
                <DotsIcon />
            </button>

            {menuOpen && (
                <div className="recipe-card__dropdown" ref={dropdownRef}>
                    <button className="recipe-card__dropdown-item" onClick={(e) => handleAction(e, onLoad)}>
                        Load
                    </button>
                    <button className="recipe-card__dropdown-item" onClick={(e) => handleAction(e, onRename)}>
                        Rename
                    </button>
                    <button className="recipe-card__dropdown-item" onClick={(e) => handleAction(e, onClone)}>
                        Clone
                    </button>
                    <button className="recipe-card__dropdown-item recipe-card__dropdown-item--danger" onClick={(e) => handleAction(e, onDelete)}>
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
}

/* ── Helpers ────────────────────────────────────────────────────────────── */
function formatTimeAgo(isoDate: string): string {
    const diff = Date.now() - new Date(isoDate).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(isoDate).toLocaleDateString();
}
