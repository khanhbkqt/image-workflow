import { useState, useMemo } from 'react';
import { useIngredientStore } from '../../stores/ingredientStore';
import { useProjectStore } from '../../stores/projectStore';
import {
    INGREDIENT_TYPES,
    INGREDIENT_CATEGORIES,
    type IngredientType,
    type Ingredient,
} from '../../types/ingredient';
import { Button } from '../ui';
import { IngredientCard } from './IngredientCard';
import { CreateIngredientDialog } from './CreateIngredientDialog';
import { EditIngredientDialog } from './EditIngredientDialog';
import { DeleteIngredientDialog } from './DeleteIngredientDialog';
import './IngredientList.css';

/* ── Icons ──────────────────────────────────────────────────────────── */
const PlusIcon = () => (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
        <path d="M8 3v10M3 8h10" />
    </svg>
);

const ChevronIcon = ({ open }: { open: boolean }) => (
    <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        width="12"
        height="12"
        className={`il-chevron${open ? ' il-chevron--open' : ''}`}
    >
        <path d="M5 3l5 5-5 5" />
    </svg>
);

export function IngredientList() {
    const activeProjectId = useProjectStore((s) => s.activeProjectId);
    const getIngredientsByProject = useIngredientStore((s) => s.getIngredientsByProject);

    /* ── Dialog state ── */
    const [createOpen, setCreateOpen] = useState(false);
    const [editIngredient, setEditIngredient] = useState<Ingredient | null>(null);
    const [deleteIngredient, setDeleteIngredient] = useState<Ingredient | null>(null);
    const [collapsed, setCollapsed] = useState<Set<IngredientType>>(new Set());

    const ingredients = useMemo(
        () => (activeProjectId ? getIngredientsByProject(activeProjectId) : []),
        [activeProjectId, getIngredientsByProject]
    );

    /* ── Group by type ── */
    const groups = useMemo(() => {
        const map = new Map<IngredientType, Ingredient[]>();
        for (const type of INGREDIENT_TYPES) {
            const items = ingredients.filter((i) => i.type === type);
            if (items.length > 0) {
                map.set(type, items);
            }
        }
        return map;
    }, [ingredients]);

    const toggleSection = (type: IngredientType) => {
        setCollapsed((prev) => {
            const next = new Set(prev);
            if (next.has(type)) next.delete(type);
            else next.add(type);
            return next;
        });
    };

    return (
        <div className="ingredient-list">
            {/* Header */}
            <div className="il-header">
                <span className="il-header__count">
                    {ingredients.length} ingredient{ingredients.length !== 1 ? 's' : ''}
                </span>
                <Button
                    variant="primary"
                    size="sm"
                    icon={<PlusIcon />}
                    onClick={() => setCreateOpen(true)}
                >
                    Add
                </Button>
            </div>

            {/* List */}
            {groups.size === 0 ? (
                <div className="il-empty">
                    <div className="il-empty__icon">🧪</div>
                    <p className="il-empty__text">No ingredients yet</p>
                    <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)}>
                        Create First Ingredient
                    </Button>
                </div>
            ) : (
                <div className="il-groups">
                    {Array.from(groups.entries()).map(([type, items]) => {
                        const meta = INGREDIENT_CATEGORIES[type];
                        const isOpen = !collapsed.has(type);
                        return (
                            <div key={type} className="il-group">
                                <button
                                    className="il-group__header"
                                    onClick={() => toggleSection(type)}
                                >
                                    <ChevronIcon open={isOpen} />
                                    <span className="il-group__icon">{meta.icon}</span>
                                    <span className="il-group__label">{meta.label}</span>
                                    <span className="il-group__count">{items.length}</span>
                                </button>
                                {isOpen && (
                                    <div className="il-group__items">
                                        {items.map((ing) => (
                                            <IngredientCard
                                                key={ing.id}
                                                ingredient={ing}
                                                onEdit={setEditIngredient}
                                                onDelete={setDeleteIngredient}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Dialogs */}
            <CreateIngredientDialog open={createOpen} onClose={() => setCreateOpen(false)} />
            <EditIngredientDialog
                open={!!editIngredient}
                onClose={() => setEditIngredient(null)}
                ingredient={editIngredient}
            />
            <DeleteIngredientDialog
                open={!!deleteIngredient}
                onClose={() => setDeleteIngredient(null)}
                ingredient={deleteIngredient}
            />
        </div>
    );
}
