import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProjectMeta, AppView, ProjectState } from '../types/project';
import { removeCanvasData } from './canvasStore';
import { removeIngredientData } from './ingredientStore';
import { removeRecipeData } from './recipeStore';

/* ── Helpers ─────────────────────────────────────────────────────────── */

let idCounter = 0;
const generateId = (): string => {
    idCounter += 1;
    return `proj_${Date.now()}_${idCounter}`;
};

const slugify = (text: string): string =>
    text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

const now = (): string => new Date().toISOString();

/* ── Seed Data ───────────────────────────────────────────────────────── */

const DEMO_PROJECTS: ProjectMeta[] = [
    {
        id: 'demo-1',
        name: 'Portrait Series',
        slug: 'portrait-series',
        description: 'AI-generated portrait studies with different art styles',
        createdAt: '2026-02-28T10:00:00.000Z',
        updatedAt: '2026-03-01T09:30:00.000Z',
    },
    {
        id: 'demo-2',
        name: 'Landscape Dreams',
        slug: 'landscape-dreams',
        description: 'Surreal landscape compositions using layered prompts',
        createdAt: '2026-02-27T14:20:00.000Z',
        updatedAt: '2026-02-28T16:45:00.000Z',
    },
    {
        id: 'demo-3',
        name: 'Brand Assets',
        slug: 'brand-assets',
        description: 'Logo and brand material generation workflow',
        createdAt: '2026-02-25T08:15:00.000Z',
        updatedAt: '2026-02-26T11:00:00.000Z',
    },
];

/* ── Project Store ───────────────────────────────────────────────────── */

export const useProjectStore = create<ProjectState>()(
    persist(
        (set, get) => ({
            /* ── Data ── */
            projects: DEMO_PROJECTS,
            activeProjectId: null,
            currentView: 'dashboard' as AppView,
            isLoading: false,

            /* ── CRUD Actions ── */
            createProject: (name: string, description?: string): ProjectMeta => {
                const timestamp = now();
                const project: ProjectMeta = {
                    id: generateId(),
                    name,
                    slug: slugify(name),
                    description,
                    createdAt: timestamp,
                    updatedAt: timestamp,
                };
                set((state) => ({ projects: [...state.projects, project] }));
                return project;
            },

            deleteProject: (id: string) => {
                // Clean up associated data from localStorage
                removeCanvasData(id);
                removeIngredientData(id);
                removeRecipeData(id);
                set((state) => ({
                    projects: state.projects.filter((p) => p.id !== id),
                    // If we deleted the active project, go back to dashboard
                    ...(state.activeProjectId === id
                        ? { activeProjectId: null, currentView: 'dashboard' as AppView }
                        : {}),
                }));
            },

            renameProject: (id: string, name: string) => {
                set((state) => ({
                    projects: state.projects.map((p) =>
                        p.id === id
                            ? { ...p, name, slug: slugify(name), updatedAt: now() }
                            : p
                    ),
                }));
            },

            /* ── Navigation ── */
            setActiveProject: (id: string | null) => {
                set({
                    activeProjectId: id,
                    currentView: id ? 'canvas' : 'dashboard',
                });
            },

            getActiveProject: (): ProjectMeta | undefined => {
                const { projects, activeProjectId } = get();
                return projects.find((p) => p.id === activeProjectId);
            },

            navigateTo: (view: AppView) => {
                set({ currentView: view });
            },
        }),
        {
            name: 'iw:projects',
            version: 1,
            migrate: (persisted, _version) => {
                // v1: initial schema — no migration needed yet
                return persisted as Record<string, unknown>;
            },
            partialize: (state) => ({
                projects: state.projects,
                // activeProjectId intentionally NOT persisted:
                // on reload the app always returns to the dashboard
            }),
        }
    )
);
