import { useState, useRef, useEffect } from 'react';
import type { ProjectMeta } from '../../types/project';
import './ProjectCard.css';

/* ── Icons ─────────────────────────────────────────────────────────────── */
const CalendarIcon = () => (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="12" height="12">
        <rect x="2" y="3" width="12" height="11" rx="2" />
        <path d="M5 1v3M11 1v3M2 7h12" />
    </svg>
);

const ClockIcon = () => (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="12" height="12">
        <circle cx="8" cy="8" r="6" />
        <path d="M8 4v4l3 2" />
    </svg>
);

const MoreIcon = () => (
    <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
        <circle cx="8" cy="3" r="1.5" />
        <circle cx="8" cy="8" r="1.5" />
        <circle cx="8" cy="13" r="1.5" />
    </svg>
);

const PencilIcon = () => (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="13" height="13">
        <path d="M11 2l3 3-9 9H2v-3z" />
    </svg>
);

const TrashIcon = () => (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="13" height="13">
        <path d="M3 4h10M6 4V2h4v2M5 4v9h6V4" />
    </svg>
);

/* ── Helpers ───────────────────────────────────────────────────────────── */
const formatDate = (iso: string): string => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatRelative = (iso: string): string => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return formatDate(iso);
};

/* ── Component ─────────────────────────────────────────────────────────── */
interface ProjectCardProps {
    project: ProjectMeta;
    onOpen: (id: string) => void;
    onRename: (id: string) => void;
    onDelete: (id: string) => void;
}

export function ProjectCard({ project, onOpen, onRename, onDelete }: ProjectCardProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        if (!menuOpen) return;
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [menuOpen]);

    return (
        <div
            className="project-card"
            onClick={() => onOpen(project.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onOpen(project.id)}
        >
            <div className="project-card__header">
                <span className="project-card__name" title={project.name}>
                    {project.name}
                </span>
                <div ref={menuRef} style={{ position: 'relative' }}>
                    <button
                        className="project-card__menu-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen((v) => !v);
                        }}
                        title="More actions"
                        aria-label="Project actions"
                    >
                        <MoreIcon />
                    </button>
                    {menuOpen && (
                        <div className="dropdown-menu">
                            <button
                                className="dropdown-menu__item"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setMenuOpen(false);
                                    onRename(project.id);
                                }}
                            >
                                <PencilIcon /> Rename
                            </button>
                            <button
                                className="dropdown-menu__item dropdown-menu__item--danger"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setMenuOpen(false);
                                    onDelete(project.id);
                                }}
                            >
                                <TrashIcon /> Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <span className="project-card__slug">/{project.slug}</span>

            {project.description && (
                <p className="project-card__description">{project.description}</p>
            )}

            <div className="project-card__meta">
                <span className="project-card__meta-item">
                    <CalendarIcon />
                    {formatDate(project.createdAt)}
                </span>
                <span className="project-card__meta-item">
                    <ClockIcon />
                    {formatRelative(project.updatedAt)}
                </span>
            </div>
        </div>
    );
}
