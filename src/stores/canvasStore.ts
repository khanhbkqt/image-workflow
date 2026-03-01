import { create } from 'zustand';
import {
    applyNodeChanges,
    applyEdgeChanges,
    addEdge,
    type Viewport,
    type NodeChange,
    type EdgeChange,
    type Connection,
} from '@xyflow/react';

import type { AppNode, AppEdge, CanvasState } from '../types/canvas';
import { storage } from '../services/storage';
import { debounce } from '../utils/debounce';
import { useSaveStatusStore } from './saveStatusStore';

/* ── Constants ───────────────────────────────────────────────────────── */
const CANVAS_KEY_PREFIX = 'canvas:';
const CANVAS_DATA_VERSION = 1;
const DEFAULT_VIEWPORT: Viewport = { x: 0, y: 0, zoom: 1 };

/* ── Demo Nodes (seeded on first open of a project) ────────────────── */
const DEMO_NODES: AppNode[] = [
    {
        id: 'compose-demo',
        type: 'compose',
        position: { x: 300, y: 200 },
        data: { label: 'Compose', blendMode: 'multiply', opacity: 80 },
    },
    {
        id: 'preview-demo',
        type: 'preview',
        position: { x: 600, y: 100 },
        data: { label: 'Preview', width: 200, height: 120 },
    },
    {
        id: 'output-demo',
        type: 'output',
        position: { x: 600, y: 350 },
        data: { label: 'Output', format: 'PNG', resolution: '1920 × 1080', filename: 'final' },
    },
];


/* ── Helpers ─────────────────────────────────────────────────────────── */

function canvasKey(projectId: string): string {
    return `${CANVAS_KEY_PREFIX}${projectId}`;
}

interface PersistedCanvas {
    version?: number;
    nodes: AppNode[];
    edges: AppEdge[];
    viewport: Viewport;
}

function loadFromStorage(projectId: string): PersistedCanvas | null {
    const raw = storage.getItem(canvasKey(projectId));
    if (!raw) return null;
    try {
        return JSON.parse(raw) as PersistedCanvas;
    } catch {
        return null;
    }
}

function saveToStorage(projectId: string, data: Omit<PersistedCanvas, 'version'>): void {
    const persisted: PersistedCanvas = { ...data, version: CANVAS_DATA_VERSION };
    storage.setItem(canvasKey(projectId), JSON.stringify(persisted));
}

/** Remove canvas data for a specific project. */
export function removeCanvasData(projectId: string): void {
    storage.removeItem(canvasKey(projectId));
}

/* ── Canvas Store ────────────────────────────────────────────────────── */

let _activeProjectId: string | null = null;

export const useCanvasStore = create<CanvasState>((set, get) => ({
    /* ── Data ── */
    nodes: [],
    edges: [],
    viewport: DEFAULT_VIEWPORT,

    /* ── React Flow change handlers ── */
    onNodesChange: (changes: NodeChange<AppNode>[]) => {
        set({ nodes: applyNodeChanges(changes, get().nodes) });
        _scheduleAutosave();
    },

    onEdgesChange: (changes: EdgeChange<AppEdge>[]) => {
        set({ edges: applyEdgeChanges(changes, get().edges) });
        _scheduleAutosave();
    },

    onConnect: (connection: Connection) => {
        set({ edges: addEdge(connection, get().edges) });
        _scheduleAutosave();
    },

    /* ── Custom actions ── */
    addNode: (node: AppNode) => {
        set({ nodes: [...get().nodes, node] });
        _scheduleAutosave();
    },

    removeNode: (nodeId: string) => {
        set({
            nodes: get().nodes.filter((n) => n.id !== nodeId),
            edges: get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
        });
        _scheduleAutosave();
    },

    updateNodeData: (nodeId: string, dataPatch: any) => {
        set({
            nodes: get().nodes.map((n) =>
                n.id === nodeId ? { ...n, data: { ...n.data, ...dataPatch } } : n
            ),
        });
        _scheduleAutosave();
    },

    setViewport: (viewport: Viewport) => {
        set({ viewport });
        _scheduleAutosave();
    },

    /* ── Persistence actions ── */
    loadCanvas: (projectId: string) => {
        // Save current project's canvas before switching
        if (_activeProjectId) {
            const { nodes, edges, viewport } = get();
            saveToStorage(_activeProjectId, { nodes, edges, viewport });
        }

        _activeProjectId = projectId;
        const saved = loadFromStorage(projectId);
        if (saved) {
            set({
                nodes: saved.nodes,
                edges: saved.edges,
                viewport: saved.viewport,
            });
        } else {
            // First open — seed with demo nodes
            set({
                nodes: [...DEMO_NODES],
                edges: [],
                viewport: DEFAULT_VIEWPORT,
            });
        }
    },

    clearCanvas: () => {
        if (_activeProjectId) {
            saveToStorage(_activeProjectId, {
                nodes: get().nodes,
                edges: get().edges,
                viewport: get().viewport,
            });
        }
        _activeProjectId = null;
        set({
            nodes: [],
            edges: [],
            viewport: DEFAULT_VIEWPORT,
        });
    },
}));

/* ── Debounced auto-save ─────────────────────────────────────────────── */

const AUTOSAVE_DELAY_MS = 500;

function _doAutosave(): void {
    if (!_activeProjectId) return;
    const { nodes, edges, viewport } = useCanvasStore.getState();
    saveToStorage(_activeProjectId, { nodes, edges, viewport });
    useSaveStatusStore.getState().markSaved();
}

const _debouncedSave = debounce(_doAutosave, AUTOSAVE_DELAY_MS);

function _scheduleAutosave(): void {
    if (!_activeProjectId) return;
    useSaveStatusStore.getState().markSaving();
    _debouncedSave();
}
