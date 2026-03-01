import { useState, useRef, useEffect, type FormEvent } from 'react';
import { useProjectStore } from '../../stores/projectStore';
import { Button } from '../ui';
import './dialogs.css';

/* ═══════════════════════════════════════════════════════════════════════════
   Create Project Dialog
   ═══════════════════════════════════════════════════════════════════════════ */

interface CreateProjectDialogProps {
    open: boolean;
    onClose: () => void;
}

export function CreateProjectDialog({ open, onClose }: CreateProjectDialogProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const nameRef = useRef<HTMLInputElement>(null);
    const createProject = useProjectStore((s) => s.createProject);
    const setActiveProject = useProjectStore((s) => s.setActiveProject);

    useEffect(() => {
        if (open) {
            setName('');
            setDescription('');
            setTimeout(() => nameRef.current?.focus(), 50);
        }
    }, [open]);

    if (!open) return null;

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        const project = createProject(name.trim(), description.trim() || undefined);
        onClose();
        setActiveProject(project.id);
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
    };

    return (
        <div className="dialog-overlay" onClick={handleOverlayClick} onKeyDown={handleKeyDown}>
            <div className="dialog-card" role="dialog" aria-labelledby="create-dialog-title">
                <h2 className="dialog-card__title" id="create-dialog-title">New Project</h2>
                <form className="dialog-form" onSubmit={handleSubmit}>
                    <div className="dialog-form__field">
                        <label className="dialog-form__label" htmlFor="project-name">Project Name</label>
                        <input
                            ref={nameRef}
                            id="project-name"
                            className="dialog-form__input"
                            type="text"
                            placeholder="My awesome workflow"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoComplete="off"
                        />
                    </div>
                    <div className="dialog-form__field">
                        <label className="dialog-form__label" htmlFor="project-desc">Description (optional)</label>
                        <textarea
                            id="project-desc"
                            className="dialog-form__input dialog-form__textarea"
                            placeholder="What will this project create?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div className="dialog-actions">
                        <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
                        <Button variant="primary" type="submit" disabled={!name.trim()}>
                            Create Project
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Rename Project Dialog
   ═══════════════════════════════════════════════════════════════════════════ */

interface RenameProjectDialogProps {
    open: boolean;
    projectId: string | null;
    currentName: string;
    onClose: () => void;
}

export function RenameProjectDialog({ open, projectId, currentName, onClose }: RenameProjectDialogProps) {
    const [name, setName] = useState(currentName);
    const nameRef = useRef<HTMLInputElement>(null);
    const renameProject = useProjectStore((s) => s.renameProject);

    useEffect(() => {
        if (open) {
            setName(currentName);
            setTimeout(() => {
                nameRef.current?.focus();
                nameRef.current?.select();
            }, 50);
        }
    }, [open, currentName]);

    if (!open || !projectId) return null;

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!name.trim() || name.trim() === currentName) {
            onClose();
            return;
        }
        renameProject(projectId, name.trim());
        onClose();
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className="dialog-overlay" onClick={handleOverlayClick} onKeyDown={(e) => e.key === 'Escape' && onClose()}>
            <div className="dialog-card" role="dialog" aria-labelledby="rename-dialog-title">
                <h2 className="dialog-card__title" id="rename-dialog-title">Rename Project</h2>
                <form className="dialog-form" onSubmit={handleSubmit}>
                    <div className="dialog-form__field">
                        <label className="dialog-form__label" htmlFor="rename-name">Project Name</label>
                        <input
                            ref={nameRef}
                            id="rename-name"
                            className="dialog-form__input"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoComplete="off"
                        />
                    </div>
                    <div className="dialog-actions">
                        <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
                        <Button variant="primary" type="submit" disabled={!name.trim()}>
                            Save
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Delete Confirm Dialog
   ═══════════════════════════════════════════════════════════════════════════ */

interface DeleteConfirmDialogProps {
    open: boolean;
    projectId: string | null;
    projectName: string;
    onClose: () => void;
}

export function DeleteConfirmDialog({ open, projectId, projectName, onClose }: DeleteConfirmDialogProps) {
    const deleteProject = useProjectStore((s) => s.deleteProject);

    if (!open || !projectId) return null;

    const handleDelete = () => {
        deleteProject(projectId);
        onClose();
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className="dialog-overlay" onClick={handleOverlayClick} onKeyDown={(e) => e.key === 'Escape' && onClose()}>
            <div className="dialog-card dialog-card--danger" role="alertdialog" aria-labelledby="delete-dialog-title">
                <h2 className="dialog-card__title" id="delete-dialog-title">Delete Project</h2>
                <div className="dialog-warning">
                    Are you sure you want to delete <strong>{projectName}</strong>? This action cannot be undone.
                </div>
                <div className="dialog-actions">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button variant="danger" onClick={handleDelete}>Delete Project</Button>
                </div>
            </div>
        </div>
    );
}
