import { useState, useEffect, useCallback } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { Canvas } from './components/canvas';
import { IngredientList } from './components/ingredients';
import { Dashboard } from './components/dashboard';
import { RecipeBrowser } from './components/recipes';
import { Dialog, Button } from './components/ui';
import { useCanvasStore } from './stores/canvasStore';
import { useProjectStore } from './stores/projectStore';
import { useRecipeStore } from './stores/recipeStore';
import { useSaveStatusStore } from './stores/saveStatusStore';
import { useRecipeActions } from './hooks/useRecipeActions';
import type { RecipeMeta } from './types/recipe';
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

const SaveIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
    <path d="M4 2h8a1 1 0 011 1v11l-5-3-5 3V3a1 1 0 011-1z" />
  </svg>
);

/* ── Recipe Dialog State ───────────────────────────────────────────────── */
type RecipeDialogType = 'save' | 'load' | 'rename' | 'delete' | 'clone' | null;

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

  /* Recipe state */
  const { saveCurrentAsRecipe, loadRecipe } = useRecipeActions();
  const deleteRecipe = useRecipeStore((s) => s.deleteRecipe);
  const renameRecipe = useRecipeStore((s) => s.renameRecipe);
  const cloneRecipe = useRecipeStore((s) => s.cloneRecipe);

  const [recipeDialog, setRecipeDialog] = useState<RecipeDialogType>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeMeta | null>(null);

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

  /* ── Recipe dialog handlers ── */
  const openRecipeDialog = useCallback((type: RecipeDialogType, recipe?: RecipeMeta) => {
    setRecipeDialog(type);
    setSelectedRecipe(recipe ?? null);
  }, []);

  const closeRecipeDialog = useCallback(() => {
    setRecipeDialog(null);
    setSelectedRecipe(null);
  }, []);

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
            <>
              <button
                className="app-header__save-recipe-btn"
                onClick={() => openRecipeDialog('save')}
                title="Save as Recipe"
                aria-label="Save as Recipe"
              >
                <SaveIcon />
                <span>Save Recipe</span>
              </button>
              <span className={`app-header__save-status${isSaving ? ' app-header__save-status--saving' : ''}`}>
                {isSaving ? 'Saving…' : lastSavedAt ? '✓ Saved' : ''}
              </span>
            </>
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

            {/* ── Recipe Browser ── */}
            <RecipeBrowser
              onLoadRecipe={(recipe) => openRecipeDialog('load', recipe)}
              onRenameRecipe={(recipe) => openRecipeDialog('rename', recipe)}
              onDeleteRecipe={(recipe) => openRecipeDialog('delete', recipe)}
              onCloneRecipe={(recipe) => openRecipeDialog('clone', recipe)}
            />
          </aside>

          {/* ── Canvas ── */}
          <main className="app-canvas">
            <ReactFlowProvider>
              <Canvas />
            </ReactFlowProvider>
          </main>
        </div>
      )}

      {/* ── Recipe Dialogs ── */}
      {recipeDialog === 'save' && activeProjectId && (
        <SaveRecipeDialog onSave={saveCurrentAsRecipe} onClose={closeRecipeDialog} />
      )}
      {recipeDialog === 'load' && selectedRecipe && (
        <LoadRecipeConfirmDialog
          recipe={selectedRecipe}
          onConfirm={() => { loadRecipe(selectedRecipe.id); closeRecipeDialog(); }}
          onClose={closeRecipeDialog}
        />
      )}
      {recipeDialog === 'rename' && selectedRecipe && activeProjectId && (
        <RenameRecipeDialog
          recipe={selectedRecipe}
          onRename={(name) => { renameRecipe(activeProjectId, selectedRecipe.id, name); closeRecipeDialog(); }}
          onClose={closeRecipeDialog}
        />
      )}
      {recipeDialog === 'delete' && selectedRecipe && activeProjectId && (
        <DeleteRecipeDialog
          recipe={selectedRecipe}
          onConfirm={() => { deleteRecipe(activeProjectId, selectedRecipe.id); closeRecipeDialog(); }}
          onClose={closeRecipeDialog}
        />
      )}
      {recipeDialog === 'clone' && selectedRecipe && activeProjectId && (
        <CloneRecipeDialog
          recipe={selectedRecipe}
          onClone={(name) => { cloneRecipe(activeProjectId, selectedRecipe.id, name); closeRecipeDialog(); }}
          onClose={closeRecipeDialog}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Recipe Dialogs — using the reusable Dialog component
   ═══════════════════════════════════════════════════════════════════════════ */

function SaveRecipeDialog({ onSave, onClose }: {
  onSave: (name: string, desc?: string) => RecipeMeta | null;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim(), desc.trim() || undefined);
    onClose();
  };

  return (
    <Dialog
      open
      title="Save as Recipe"
      onClose={onClose}
      actions={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={() => { if (name.trim()) { onSave(name.trim(), desc.trim() || undefined); onClose(); } }} disabled={!name.trim()}>Save</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="dialog-form">
        <div className="dialog-form__field">
          <label className="dialog-form__label">Recipe Name</label>
          <input
            className="dialog-form__input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My workflow recipe"
            autoFocus
            autoComplete="off"
          />
        </div>
        <div className="dialog-form__field">
          <label className="dialog-form__label">Description (optional)</label>
          <textarea
            className="dialog-form__input dialog-form__textarea"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="What does this recipe do?"
          />
        </div>
      </form>
    </Dialog>
  );
}

function LoadRecipeConfirmDialog({ recipe, onConfirm, onClose }: {
  recipe: RecipeMeta;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog
      open
      title="Load Recipe"
      onClose={onClose}
      actions={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={onConfirm}>Load</Button>
        </>
      }
    >
      <div className="dialog-warning">
        Loading <strong>{recipe.name}</strong> will replace your current canvas. Continue?
      </div>
    </Dialog>
  );
}

function RenameRecipeDialog({ recipe, onRename, onClose }: {
  recipe: RecipeMeta;
  onRename: (name: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(recipe.name);
  return (
    <Dialog
      open
      title="Rename Recipe"
      onClose={onClose}
      actions={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={() => { if (name.trim()) onRename(name.trim()); }} disabled={!name.trim()}>Save</Button>
        </>
      }
    >
      <div className="dialog-form">
        <div className="dialog-form__field">
          <label className="dialog-form__label">Recipe Name</label>
          <input
            className="dialog-form__input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            autoComplete="off"
          />
        </div>
      </div>
    </Dialog>
  );
}

function DeleteRecipeDialog({ recipe, onConfirm, onClose }: {
  recipe: RecipeMeta;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog
      open
      danger
      title="Delete Recipe"
      onClose={onClose}
      actions={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm}>Delete</Button>
        </>
      }
    >
      <div className="dialog-warning">
        Are you sure you want to delete <strong>{recipe.name}</strong>? This cannot be undone.
      </div>
    </Dialog>
  );
}

function CloneRecipeDialog({ recipe, onClone, onClose }: {
  recipe: RecipeMeta;
  onClone: (name: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(`${recipe.name} (Copy)`);
  return (
    <Dialog
      open
      title="Clone Recipe"
      onClose={onClose}
      actions={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={() => { if (name.trim()) onClone(name.trim()); }} disabled={!name.trim()}>Clone</Button>
        </>
      }
    >
      <div className="dialog-form">
        <div className="dialog-form__field">
          <label className="dialog-form__label">New Recipe Name</label>
          <input
            className="dialog-form__input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            autoComplete="off"
          />
        </div>
      </div>
    </Dialog>
  );
}

export default App;
