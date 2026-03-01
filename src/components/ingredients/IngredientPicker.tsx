import { INGREDIENT_CATEGORIES, type Ingredient, type IngredientType } from '../../types/ingredient';
import { useIngredientStore } from '../../stores/ingredientStore';
import './IngredientPicker.css';

/* ── Icons ──────────────────────────────────────────────────────────── */
const CheckIcon = () => (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
        <polyline points="2,8 6,12 14,4" />
    </svg>
);

/* ── Props ──────────────────────────────────────────────────────────── */
interface IngredientPickerProps {
    /** The project to scope the ingredient list to. */
    projectId: string;
    /** Which ingredient type to show (e.g. 'style', 'modifier'). */
    type: IngredientType;
    /** Currently selected ingredient IDs. */
    selectedIds: string[];
    /** Called when the selection changes. */
    onChange: (ids: string[]) => void;
    /** Optional label shown above the list. */
    label?: string;
}

/* ── Component ──────────────────────────────────────────────────────── */
export function IngredientPicker({
    projectId,
    type,
    selectedIds,
    onChange,
    label,
}: IngredientPickerProps) {
    const getIngredientsByType = useIngredientStore((s) => s.getIngredientsByType);
    const available: Ingredient[] = getIngredientsByType(projectId, type);
    const meta = INGREDIENT_CATEGORIES[type];

    const toggle = (id: string) => {
        if (selectedIds.includes(id)) {
            onChange(selectedIds.filter((sid) => sid !== id));
        } else {
            onChange([...selectedIds, id]);
        }
    };

    return (
        <div className="ingredient-picker">
            {label && (
                <div className="ingredient-picker__label">
                    <span className="ingredient-picker__label-icon">{meta.icon}</span>
                    {label}
                    {selectedIds.length > 0 && (
                        <span className="ingredient-picker__count">{selectedIds.length}</span>
                    )}
                </div>
            )}
            <div className="ingredient-picker__list">
                {available.length === 0 ? (
                    <div className="ingredient-picker__empty">
                        No {meta.label.toLowerCase()} ingredients yet
                    </div>
                ) : (
                    available.map((ing) => {
                        const isSelected = selectedIds.includes(ing.id);
                        return (
                            <button
                                key={ing.id}
                                type="button"
                                className={`ingredient-picker__item${isSelected ? ' ingredient-picker__item--selected' : ''}`}
                                onClick={() => toggle(ing.id)}
                                aria-pressed={isSelected}
                                aria-label={`${isSelected ? 'Deselect' : 'Select'} ${ing.name}`}
                            >
                                <span className="ingredient-picker__item-check" aria-hidden="true">
                                    {isSelected && <CheckIcon />}
                                </span>
                                <span className="ingredient-picker__item-icon">{meta.icon}</span>
                                <span className="ingredient-picker__item-name">{ing.name}</span>
                                {ing.imageUrl && (
                                    <img
                                        src={ing.imageUrl}
                                        alt=""
                                        className="ingredient-picker__item-thumb"
                                    />
                                )}
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}
