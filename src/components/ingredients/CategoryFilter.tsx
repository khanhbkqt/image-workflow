import { useMemo } from 'react';
import {
    INGREDIENT_TYPES,
    INGREDIENT_CATEGORIES,
    type Ingredient,
    type IngredientType,
} from '../../types/ingredient';
import './CategoryFilter.css';

/* ── Props ──────────────────────────────────────────────────────────── */
interface CategoryFilterProps {
    ingredients: Ingredient[];
    selectedTypes: Set<IngredientType>;
    onToggleType: (type: IngredientType) => void;
    onClearTypes: () => void;
}

export function CategoryFilter({
    ingredients,
    selectedTypes,
    onToggleType,
    onClearTypes,
}: CategoryFilterProps) {
    /* ── Count ingredients per type ── */
    const typeCounts = useMemo(() => {
        const counts = new Map<IngredientType, number>();
        for (const type of INGREDIENT_TYPES) {
            counts.set(type, 0);
        }
        for (const ing of ingredients) {
            counts.set(ing.type, (counts.get(ing.type) || 0) + 1);
        }
        return counts;
    }, [ingredients]);

    return (
        <div className="category-filter" role="group" aria-label="Filter by category">
            <div className="category-filter__label">Categories</div>
            <div className="category-filter__chips">
                {selectedTypes.size > 0 && (
                    <button
                        className="cat-chip"
                        onClick={onClearTypes}
                        aria-label="Clear category filters"
                    >
                        All
                    </button>
                )}
                {INGREDIENT_TYPES.map((type) => {
                    const meta = INGREDIENT_CATEGORIES[type];
                    const count = typeCounts.get(type) || 0;
                    const isSelected = selectedTypes.has(type);
                    return (
                        <button
                            key={type}
                            className={`cat-chip${isSelected ? ' cat-chip--selected' : ''}`}
                            onClick={() => onToggleType(type)}
                            aria-pressed={isSelected}
                            aria-label={`Filter by ${meta.label}`}
                        >
                            <span className="cat-chip__icon">{meta.icon}</span>
                            {meta.label}
                            <span className="cat-chip__count">{count}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
