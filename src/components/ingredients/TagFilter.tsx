import { useMemo } from 'react';
import type { Ingredient } from '../../types/ingredient';
import './TagFilter.css';

/* ── Props ──────────────────────────────────────────────────────────── */
interface TagFilterProps {
    ingredients: Ingredient[];
    selectedTags: Set<string>;
    onToggleTag: (tag: string) => void;
    onClearTags: () => void;
}

export function TagFilter({ ingredients, selectedTags, onToggleTag, onClearTags }: TagFilterProps) {
    /* ── Collect unique tags with counts ── */
    const tagCounts = useMemo(() => {
        const counts = new Map<string, number>();
        for (const ing of ingredients) {
            for (const tag of ing.tags) {
                counts.set(tag, (counts.get(tag) || 0) + 1);
            }
        }
        // Sort alphabetically
        return Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    }, [ingredients]);

    if (tagCounts.length === 0) return null;

    return (
        <div className="tag-filter" role="group" aria-label="Filter by tags">
            <div className="tag-filter__label">Tags</div>
            <div className="tag-filter__chips">
                {selectedTags.size > 0 && (
                    <button
                        className="tag-chip"
                        onClick={onClearTags}
                        aria-label="Clear tag filters"
                    >
                        All
                    </button>
                )}
                {tagCounts.map(([tag, count]) => {
                    const isSelected = selectedTags.has(tag);
                    return (
                        <button
                            key={tag}
                            className={`tag-chip${isSelected ? ' tag-chip--selected' : ''}`}
                            onClick={() => onToggleTag(tag)}
                            aria-pressed={isSelected}
                            aria-label={`Filter by tag: ${tag}`}
                        >
                            {tag}
                            <span className="tag-chip__count">{count}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
