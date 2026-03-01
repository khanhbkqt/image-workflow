import { useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { Canvas } from './components/canvas';
import { Dashboard } from './components/dashboard';
import { useCanvasStore } from './stores/canvasStore';
import { useProjectStore } from './stores/projectStore';
import type { AppNode } from './types/canvas';
import './App.css';

/* ── Icons ──────────────────────────────────────────────────────────────── */
const BoxIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
    <rect x="2" y="2" width="12" height="12" rx="2" />
  </svg>
);

const LayersIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
    <path d="M2 8l6-4 6 4-6 4z" />
    <path d="M2 11l6 4 6-4" opacity="0.6" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
    <path d="M10 3L5 8l5 5" />
  </svg>
);

/* ── Initial demo nodes ──────────────────────────────────────────────── */
const INITIAL_NODES: AppNode[] = [
  {
    id: 'prompt-1',
    type: 'placeholder',
    position: { x: 100, y: 150 },
    data: { label: 'Text Prompt', icon: '✏️', description: 'Describe your image' },
  },
  {
    id: 'style-1',
    type: 'placeholder',
    position: { x: 400, y: 80 },
    data: { label: 'Style', icon: '🎨', description: 'Watercolor, vibrant' },
  },
  {
    id: 'output-1',
    type: 'placeholder',
    position: { x: 700, y: 150 },
    data: { label: 'Image Output', icon: '🖼️', description: 'Generated result' },
  },
];

/* ── App ───────────────────────────────────────────────────────────────── */
function App() {
  const addNode = useCanvasStore((s) => s.addNode);
  const nodes = useCanvasStore((s) => s.nodes);
  const currentView = useProjectStore((s) => s.currentView);
  const activeProject = useProjectStore((s) => s.getActiveProject());
  const setActiveProject = useProjectStore((s) => s.setActiveProject);

  /* Seed initial demo nodes once on mount */
  useEffect(() => {
    if (nodes.length === 0) {
      INITIAL_NODES.forEach((n) => addNode(n));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="app-shell">
      {/* ── Header ── */}
      <header className="app-header">
        <div className="app-header__brand">
          {currentView === 'canvas' ? (
            <>
              <button
                className="app-header__back-btn"
                onClick={() => setActiveProject(null)}
                title="Back to projects"
                aria-label="Back to projects"
              >
                <ArrowLeftIcon />
              </button>
              <BoxIcon />
              <span className="app-header__title">
                {activeProject?.name ?? 'Untitled'}
              </span>
            </>
          ) : (
            <>
              <BoxIcon />
              <span className="app-header__title">Image Workflow</span>
            </>
          )}
        </div>
        <span className="app-header__badge">
          {currentView === 'canvas' ? 'Canvas' : 'Dashboard'}
        </span>
      </header>

      {/* ── View Content ── */}
      {currentView === 'dashboard' ? (
        <div className="app-body app-body--dashboard">
          <Dashboard />
        </div>
      ) : (
        <div className="app-body">
          {/* ── Sidebar ── */}
          <aside className="app-sidebar">
            <div className="app-sidebar__section">
              <span className="app-sidebar__heading">
                <LayersIcon />
                Ingredients
              </span>
              <p className="app-sidebar__hint">
                Drag ingredients onto the canvas to build your image generation workflow.
              </p>
            </div>

            <div className="app-sidebar__placeholder">
              <div className="app-sidebar__item">✏️ Text Prompt</div>
              <div className="app-sidebar__item">🎨 Style</div>
              <div className="app-sidebar__item">📐 Composition</div>
              <div className="app-sidebar__item">🖼️ Image Output</div>
            </div>
          </aside>

          {/* ── Canvas ── */}
          <main className="app-canvas">
            <ReactFlowProvider>
              <Canvas />
            </ReactFlowProvider>
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
