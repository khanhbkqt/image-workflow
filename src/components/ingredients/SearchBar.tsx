import { useRef, useCallback, useEffect } from 'react';
import './SearchBar.css';

/* ── Icons ──────────────────────────────────────────────────────────── */
const SearchIcon = () => (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="13" height="13">
        <circle cx="6.5" cy="6.5" r="4.5" />
        <path d="M10 10l4 4" />
    </svg>
);

const ClearIcon = () => (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" width="11" height="11">
        <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
);

/* ── Props ──────────────────────────────────────────────────────────── */
interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    resultCount?: number;
    totalCount?: number;
    placeholder?: string;
}

export function SearchBar({
    value,
    onChange,
    resultCount,
    totalCount,
    placeholder = 'Search ingredients…',
}: SearchBarProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    /* ── Keyboard shortcut: Ctrl/Cmd+F focuses search ── */
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
                e.preventDefault();
                inputRef.current?.focus();
            }
            // Escape clears and blurs
            if (e.key === 'Escape' && document.activeElement === inputRef.current) {
                onChange('');
                inputRef.current?.blur();
            }
        },
        [onChange]
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    const showResultCount = value.length > 0 && resultCount !== undefined && totalCount !== undefined;

    return (
        <div className="search-bar">
            <div className="search-bar__wrapper">
                <input
                    ref={inputRef}
                    type="text"
                    className="search-bar__input"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    aria-label="Search ingredients"
                    autoComplete="off"
                    spellCheck={false}
                />
                <span className="search-bar__icon">
                    <SearchIcon />
                </span>
                {showResultCount && (
                    <span className="search-bar__result-badge">
                        {resultCount}/{totalCount}
                    </span>
                )}
                {value.length > 0 && (
                    <button
                        className="search-bar__clear"
                        onClick={() => {
                            onChange('');
                            inputRef.current?.focus();
                        }}
                        aria-label="Clear search"
                        title="Clear search"
                    >
                        <ClearIcon />
                    </button>
                )}
            </div>
        </div>
    );
}
