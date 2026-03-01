import { useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { Canvas } from './components/canvas';
import { IngredientList } from './components/ingredients';
import { Dashboard } from './components/dashboard';
import { useCanvasStore } from './stores/canvasStore';
import { useProjectStore } from './stores/projectStore';
import { useSaveStatusStore } from './stores/saveStatusStore';
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


/* ── App ───────────────────────────────────────────────────────────────── */
function App() {
  const loadCanvas = useCanvasStore((s) => s.loadCanvas);
  const clearCanvas = useCanvasStore((s) => s.clearCanvas);
  const currentView = useProjectStore((s) => s.currentView);
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const activeProject = useProjectStore((s) => s.getActiveProject());
  const setActiveProject = useProjectStore((s) => s.setActiveProject);
  const isSaving = useSaveStatusStore((s) => s.isSaving);
  const lastSavedAt = useSaveStatusStore((s) => s.lastSavedAt);

  /* Load/clear canvas when the active project changes */
  useEffect(() => {
    if (activeProjectId) {
      loadCanvas(activeProjectId);
    } else {
      clearCanvas();
    }
  }, [activeProjectId, loadCanvas, clearCanvas]);

  const handleBack = () => {
    clearCanvas();
    setActiveProject(null);
  };

  return (
    <div className="app-shell">
      {/* ── Header ── */}
      <header className="app-header">
        <div className="app-header__brand">
          {currentView === 'canvas' ? (
            <>
              <button
                className="app-header__back-btn"
                onClick={handleBack}
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
        <div className="app-header__right">
          {currentView === 'canvas' && (
            <span className={`app-header__save-status${isSaving ? ' app-header__save-status--saving' : ''}`}>
              {isSaving ? 'Saving…' : lastSavedAt ? '✓ Saved' : ''}
            </span>
          )}
          <span className="app-header__badge">
            {currentView === 'canvas' ? 'Canvas' : 'Dashboard'}
          </span>
        </div>
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
            </div>
            <IngredientList />
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
