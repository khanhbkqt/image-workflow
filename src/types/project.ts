/* ── Project Types ────────────────────────────────────────────────────── */

/** Core metadata for a project, displayed in dashboard cards. */
export interface ProjectMeta {
    id: string;
    name: string;
    slug: string;
    description?: string;
    createdAt: string;   // ISO 8601
    updatedAt: string;   // ISO 8601
}

/** Full project model — meta + canvas data reference. */
export interface Project extends ProjectMeta {
    /** Future: serialized canvas state, node graph, etc. */
}

/* ── View State ──────────────────────────────────────────────────────── */

export type AppView = 'dashboard' | 'canvas';

/* ── Project Store State ─────────────────────────────────────────────── */

export interface ProjectState {
    /* ── Data ── */
    projects: ProjectMeta[];
    activeProjectId: string | null;
    currentView: AppView;
    isLoading: boolean;

    /* ── CRUD Actions ── */
    createProject: (name: string, description?: string) => ProjectMeta;
    deleteProject: (id: string) => void;
    renameProject: (id: string, name: string) => void;

    /* ── Navigation ── */
    setActiveProject: (id: string | null) => void;
    getActiveProject: () => ProjectMeta | undefined;
    navigateTo: (view: AppView) => void;
}
