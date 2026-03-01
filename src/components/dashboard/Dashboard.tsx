import { useState, useCallback } from 'react';
import { useProjectStore } from '../../stores/projectStore';
import { Button } from '../ui';
import { ProjectCard } from './ProjectCard';
import { CreateProjectDialog, RenameProjectDialog, DeleteConfirmDialog } from './Dialogs';
import './Dashboard.css';

/* ── Icons ─────────────────────────────────────────────────────────────── */
const PlusIcon = () => (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
        <path d="M8 3v10M3 8h10" />
    </svg>
);

/* ── Dialog State ──────────────────────────────────────────────────────── */
type DialogState =
    | { type: 'none' }
    | { type: 'create' }
    | { type: 'rename'; projectId: string; currentName: string }
    | { type: 'delete'; projectId: string; projectName: string };

/* ── Component ─────────────────────────────────────────────────────────── */
export function Dashboard() {
    const projects = useProjectStore((s) => s.projects);
    const setActiveProject = useProjectStore((s) => s.setActiveProject);
    const [dialog, setDialog] = useState<DialogState>({ type: 'none' });

    const closeDialog = useCallback(() => setDialog({ type: 'none' }), []);

    const handleOpenProject = (id: string) => {
        setActiveProject(id);
    };

    const handleRename = (id: string) => {
        const project = projects.find((p) => p.id === id);
        if (project) {
            setDialog({ type: 'rename', projectId: id, currentName: project.name });
        }
    };

    const handleDelete = (id: string) => {
        const project = projects.find((p) => p.id === id);
        if (project) {
            setDialog({ type: 'delete', projectId: id, projectName: project.name });
        }
    };

    return (
        <div className="dashboard">
            <div className="dashboard__header">
                <div className="dashboard__header-left">
                    <h1 className="dashboard__title">Projects</h1>
                    <p className="dashboard__subtitle">
                        {projects.length} project{projects.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <Button
                    variant="primary"
                    size="md"
                    icon={<PlusIcon />}
                    onClick={() => setDialog({ type: 'create' })}
                >
                    New Project
                </Button>
            </div>

            {projects.length === 0 ? (
                <div className="dashboard__empty">
                    <div className="dashboard__empty-icon">🎨</div>
                    <div className="dashboard__empty-text">
                        <h2 className="dashboard__empty-title">No projects yet</h2>
                        <p className="dashboard__empty-description">
                            Create your first image generation workflow to get started.
                        </p>
                    </div>
                    <Button
                        variant="primary"
                        icon={<PlusIcon />}
                        onClick={() => setDialog({ type: 'create' })}
                    >
                        Create Project
                    </Button>
                </div>
            ) : (
                <div className="dashboard__grid">
                    {projects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            onOpen={handleOpenProject}
                            onRename={handleRename}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {/* ── Dialogs ── */}
            <CreateProjectDialog
                open={dialog.type === 'create'}
                onClose={closeDialog}
            />
            <RenameProjectDialog
                open={dialog.type === 'rename'}
                projectId={dialog.type === 'rename' ? dialog.projectId : null}
                currentName={dialog.type === 'rename' ? dialog.currentName : ''}
                onClose={closeDialog}
            />
            <DeleteConfirmDialog
                open={dialog.type === 'delete'}
                projectId={dialog.type === 'delete' ? dialog.projectId : null}
                projectName={dialog.type === 'delete' ? dialog.projectName : ''}
                onClose={closeDialog}
            />
        </div>
    );
}
