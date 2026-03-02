import { useState, useMemo, useCallback, useEffect } from 'react';
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
import { SearchBar } from './SearchBar';
import { TagFilter } from './TagFilter';
import { CategoryFilter } from './CategoryFilter';
import { CreateIngredientDialog } from './CreateIngredientDialog';
import { EditIngredientDialog } from './EditIngredientDialog';
import { DeleteIngredientDialog } from './DeleteIngredientDialog';
import './IngredientList.css';

/* ── Icons ──────────────────────────────────────────────────────────── */
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

const PlusIcon = () => (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
        <path d="M8 3v10M3 8h10" />
    </svg>
);

const FilterIcon = () => (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="12" height="12">
        <path d="M2 3h12M4 7h8M6 11h4" />
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

    /* ── Filter state ── */
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
    const [selectedTypes, setSelectedTypes] = useState<Set<IngredientType>>(new Set());
    const [filtersExpanded, setFiltersExpanded] = useState(false);

    /* ── Reset filters on project switch ── */
    useEffect(() => {
        setSearchQuery('');
        setSelectedTags(new Set());
        setSelectedTypes(new Set());
        setCollapsed(new Set());
        setFiltersExpanded(false);
    }, [activeProjectId]);

    const allIngredients = useMemo(
        () => (activeProjectId ? getIngredientsByProject(activeProjectId) : []),
        [activeProjectId, getIngredientsByProject]
    );

    /* ── Apply all filters ── */
    const filteredIngredients = useMemo(() => {
        let result = allIngredients;

        // Search filter (name + description)
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            result = result.filter(
                (ing) =>
                    ing.name.toLowerCase().includes(q) ||
                    (ing.description && ing.description.toLowerCase().includes(q))
            );
        }

        // Tag filter (AND logic)
        if (selectedTags.size > 0) {
            result = result.filter((ing) =>
                Array.from(selectedTags).every((tag) => ing.tags.includes(tag))
            );
        }

        // Type filter
        if (selectedTypes.size > 0) {
            result = result.filter((ing) => selectedTypes.has(ing.type));
        }

        return result;
    }, [allIngredients, searchQuery, selectedTags, selectedTypes]);

    /* ── Group filtered ingredients by type ── */
    const groups = useMemo(() => {
        const map = new Map<IngredientType, Ingredient[]>();
        for (const type of INGREDIENT_TYPES) {
            const items = filteredIngredients.filter((i) => i.type === type);
            if (items.length > 0) {
                map.set(type, items);
            }
        }
        return map;
    }, [filteredIngredients]);

    /* ── Callbacks ── */
    const toggleSection = (type: IngredientType) => {
        setCollapsed((prev) => {
            const next = new Set(prev);
            if (next.has(type)) next.delete(type);
            else next.add(type);
            return next;
        });
    };

    const toggleTag = useCallback((tag: string) => {
        setSelectedTags((prev) => {
            const next = new Set(prev);
            if (next.has(tag)) next.delete(tag);
            else next.add(tag);
            return next;
        });
    }, []);

    const toggleType = useCallback((type: IngredientType) => {
        setSelectedTypes((prev) => {
            const next = new Set(prev);
            if (next.has(type)) next.delete(type);
            else next.add(type);
            return next;
        });
    }, []);

    const clearAllFilters = useCallback(() => {
        setSearchQuery('');
        setSelectedTags(new Set());
        setSelectedTypes(new Set());
    }, []);

    const activeFilterCount = selectedTags.size + selectedTypes.size;
    const hasActiveFilters = searchQuery.length > 0 || activeFilterCount > 0;

    return (
        <div className="ingredient-list">
            {/* Search + Filter toggle + Add button row */}
            <div className="il-search-row">
                <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    resultCount={filteredIngredients.length}
                    totalCount={allIngredients.length}
                    placeholder={`Search ${allIngredients.length} ingredient${allIngredients.length !== 1 ? 's' : ''}…`}
                />
                <button
                    className={`il-filter-toggle${filtersExpanded ? ' il-filter-toggle--active' : ''}${activeFilterCount > 0 ? ' il-filter-toggle--has-filters' : ''}`}
                    onClick={() => setFiltersExpanded((v) => !v)}
                    aria-label="Toggle filters"
                    title={filtersExpanded ? 'Hide filters' : 'Show filters'}
                >
                    <FilterIcon />
                    {activeFilterCount > 0 && (
                        <span className="il-filter-toggle__badge">{activeFilterCount}</span>
                    )}
                </button>
                <button
                    className="il-add-btn"
                    onClick={() => setCreateOpen(true)}
                    aria-label="Add ingredient"
                    title="Add ingredient"
                >
                    <PlusIcon />
                </button>
            </div>

            {/* Collapsible Filters */}
            {filtersExpanded && (
                <div className="il-filters-panel">
                    <CategoryFilter
                        ingredients={allIngredients}
                        selectedTypes={selectedTypes}
                        onToggleType={toggleType}
                        onClearTypes={() => setSelectedTypes(new Set())}
                    />

                    <TagFilter
                        ingredients={allIngredients}
                        selectedTags={selectedTags}
                        onToggleTag={toggleTag}
                        onClearTags={() => setSelectedTags(new Set())}
                    />

                    {hasActiveFilters && (
                        <div className="il-filter-bar">
                            <span className="il-filter-bar__count">
                                {activeFilterCount + (searchQuery.length > 0 ? 1 : 0)} filter{(activeFilterCount + (searchQuery.length > 0 ? 1 : 0)) !== 1 ? 's' : ''} active
                            </span>
                            <button className="il-filter-bar__clear" onClick={clearAllFilters}>
                                Clear all
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Divider */}
            <div className="il-filter-divider" />

            {/* List */}
            {allIngredients.length === 0 ? (
                <div className="il-empty">
                    <div className="il-empty__icon">🧪</div>
                    <p className="il-empty__text">No ingredients yet</p>
                    <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)}>
                        Create First Ingredient
                    </Button>
                </div>
            ) : groups.size === 0 ? (
                <div className="il-empty">
                    <div className="il-empty__icon">🔍</div>
                    <p className="il-empty__text">No matching ingredients</p>
                    <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                        Clear Filters
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
                                                highlightTags={selectedTags.size > 0 ? selectedTags : undefined}
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
