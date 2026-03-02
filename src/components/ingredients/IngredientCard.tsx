import { useState } from 'react';
import { INGREDIENT_CATEGORIES, type Ingredient, type BrandKitIngredient } from '../../types/ingredient';
import './IngredientCard.css';

/* ── Icons ──────────────────────────────────────────────────────────── */
const EditIcon = () => (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
        <path d="M11.5 1.5l3 3L5 14H2v-3z" />
    </svg>
);

const TrashIcon = () => (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
        <path d="M2 4h12M5.5 4V2.5h5V4M6 7v5M10 7v5" />
        <path d="M3.5 4l.5 10h8l.5-10" />
    </svg>
);

/* ── Props ──────────────────────────────────────────────────────────── */
interface IngredientCardProps {
    ingredient: Ingredient;
    onEdit: (ingredient: Ingredient) => void;
    onDelete: (ingredient: Ingredient) => void;
    highlightTags?: Set<string>;
}

export function IngredientCard({ ingredient, onEdit, onDelete, highlightTags }: IngredientCardProps) {
    const meta = INGREDIENT_CATEGORIES[ingredient.type];
    const [isDragging, setIsDragging] = useState(false);

    // Brand-kit: derive bundle summary
    const bundleInfo = ingredient.type === 'brand-kit' ? (() => {
        const bk = ingredient as BrandKitIngredient;
        return `${bk.styleIds.length} style${bk.styleIds.length !== 1 ? 's' : ''} · ${bk.modifierIds.length} modifier${bk.modifierIds.length !== 1 ? 's' : ''}`;
    })() : null;

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        const payload = {
            id: ingredient.id,
            name: ingredient.name,
            type: ingredient.type,
            tags: ingredient.tags,
            imageUrl: ingredient.imageUrl,
            description: ingredient.description,
            icon: meta.icon,
        };
        e.dataTransfer.setData('application/ingredient', JSON.stringify(payload));
        e.dataTransfer.effectAllowed = 'move';
        setIsDragging(true);
    };

    const handleDragEnd = () => setIsDragging(false);

    return (
        <div
            className={`ingredient-card${isDragging ? ' ingredient-card--dragging' : ''}`}
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClick={() => onEdit(ingredient)}
        >
            <div className="ingredient-card__icon">{meta.icon}</div>
            <div className="ingredient-card__info">
                <span className="ingredient-card__name">{ingredient.name}</span>
                {bundleInfo && (
                    <span className="ingredient-card__bundle-info">{bundleInfo}</span>
                )}
                {ingredient.tags.length > 0 && (
                    <div className="ingredient-card__tag-pills">
                        {ingredient.tags.map((tag) => (
                            <span
                                key={tag}
                                className={`ingredient-card__tag-pill${highlightTags?.has(tag) ? ' ingredient-card__tag-pill--match' : ''
                                    }`}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
            {ingredient.imageUrl && (
                <img
                    src={ingredient.imageUrl}
                    alt=""
                    className="ingredient-card__thumb"
                />
            )}
            <div className="ingredient-card__actions">
                <button
                    className="ingredient-card__action"
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(ingredient);
                    }}
                    title="Edit"
                    aria-label={`Edit ${ingredient.name}`}
                >
                    <EditIcon />
                </button>
                <button
                    className="ingredient-card__action ingredient-card__action--danger"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(ingredient);
                    }}
                    title="Delete"
                    aria-label={`Delete ${ingredient.name}`}
                >
                    <TrashIcon />
                </button>
            </div>
        </div>
    );
}
