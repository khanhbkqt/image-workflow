import { useProjectStore } from '../../stores/projectStore';
import { Button } from '../ui';
import { ProjectCard } from './ProjectCard';
import './Dashboard.css';

/* ── Icons ─────────────────────────────────────────────────────────────── */
const PlusIcon = () => (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
        <path d="M8 3v10M3 8h10" />
    </svg>
);

/* ── Component ─────────────────────────────────────────────────────────── */
interface DashboardProps {
    onCreateProject?: () => void;
    onMenuAction?: (id: string, action: 'rename' | 'delete') => void;
}

export function Dashboard({ onCreateProject, onMenuAction }: DashboardProps) {
    const projects = useProjectStore((s) => s.projects);
    const setActiveProject = useProjectStore((s) => s.setActiveProject);

    const handleOpenProject = (id: string) => {
        setActiveProject(id);
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
                    onClick={onCreateProject}
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
                    <Button variant="primary" icon={<PlusIcon />} onClick={onCreateProject}>
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
                            onMenuAction={onMenuAction}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
