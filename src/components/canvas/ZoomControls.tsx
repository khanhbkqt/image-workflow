import { useReactFlow, useViewport } from '@xyflow/react';
import './ZoomControls.css';

/* ── Tiny SVG icons ──────────────────────────────────────────────────── */
const ZoomInIcon = () => (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="8" y1="3" x2="8" y2="13" />
        <line x1="3" y1="8" x2="13" y2="8" />
    </svg>
);

const ZoomOutIcon = () => (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="3" y1="8" x2="13" y2="8" />
    </svg>
);

const FitViewIcon = () => (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="2" width="12" height="12" rx="2" />
        <rect x="5" y="5" width="6" height="6" rx="1" />
    </svg>
);

/* ── ZoomControls Component ──────────────────────────────────────────── */
export function ZoomControls() {
    const { zoomIn, zoomOut, fitView } = useReactFlow();
    const { zoom } = useViewport();

    return (
        <div className="zoom-controls">
            <button
                className="zoom-controls__btn"
                onClick={() => zoomIn({ duration: 200 })}
                title="Zoom In"
                aria-label="Zoom In"
            >
                <ZoomInIcon />
            </button>

            <span className="zoom-controls__level" title="Current zoom level">
                {Math.round(zoom * 100)}%
            </span>

            <button
                className="zoom-controls__btn"
                onClick={() => zoomOut({ duration: 200 })}
                title="Zoom Out"
                aria-label="Zoom Out"
            >
                <ZoomOutIcon />
            </button>

            <div className="zoom-controls__divider" />

            <button
                className="zoom-controls__btn"
                onClick={() => fitView({ duration: 300, padding: 0.3 })}
                title="Fit to View"
                aria-label="Fit to View"
            >
                <FitViewIcon />
            </button>
        </div>
    );
}
