import { useState, useRef, useCallback, useEffect, type ReactNode } from 'react';
import './ResizablePanel.css';

/* ── Props ──────────────────────────────────────────────────────────── */
interface ResizablePanelProps {
    children: ReactNode;
    /** Minimum panel width in px */
    minWidth?: number;
    /** Maximum panel width in px */
    maxWidth?: number;
    /** Default width in px */
    defaultWidth?: number;
    /** localStorage key to persist the width */
    storageKey?: string;
    /** Which side the resize handle appears on */
    handleSide?: 'left' | 'right';
    /** Additional className for the outer wrapper */
    className?: string;
}

export function ResizablePanel({
    children,
    minWidth = 200,
    maxWidth = 480,
    defaultWidth = 240,
    storageKey = 'iw:sidebar-width',
    handleSide = 'right',
    className = '',
}: ResizablePanelProps) {
    /* ── State ── */
    const [width, setWidth] = useState(() => {
        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                const val = parseInt(stored, 10);
                if (!isNaN(val) && val >= minWidth && val <= maxWidth) return val;
            }
        } catch { /* noop */ }
        return defaultWidth;
    });

    const [isDragging, setIsDragging] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const startXRef = useRef(0);
    const startWidthRef = useRef(0);

    /* ── Persist width ── */
    useEffect(() => {
        try {
            localStorage.setItem(storageKey, String(width));
        } catch { /* noop */ }
    }, [width, storageKey]);

    /* ── Drag handlers ── */
    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            setIsDragging(true);
            startXRef.current = e.clientX;
            startWidthRef.current = width;
        },
        [width]
    );

    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e: MouseEvent) => {
            const diff = handleSide === 'right'
                ? e.clientX - startXRef.current
                : startXRef.current - e.clientX;
            const newWidth = Math.min(maxWidth, Math.max(minWidth, startWidthRef.current + diff));
            setWidth(newWidth);
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isDragging, handleSide, minWidth, maxWidth]);

    return (
        <div
            ref={panelRef}
            className={`resizable-panel${className ? ` ${className}` : ''}`}
            style={{ width }}
        >
            <div className="resizable-panel__content">
                {children}
            </div>
            <div
                className={`resizable-panel__handle resizable-panel__handle--${handleSide}${isDragging ? ' resizable-panel__handle--dragging' : ''}`}
                onMouseDown={handleMouseDown}
                role="separator"
                aria-orientation="vertical"
                aria-valuenow={width}
                aria-valuemin={minWidth}
                aria-valuemax={maxWidth}
                aria-label="Resize sidebar"
            />
        </div>
    );
}
