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

/* ── Initial viewport ────────────────────────────────────────────────── */
const DEFAULT_VIEWPORT: Viewport = { x: 0, y: 0, zoom: 1 };

/* ── Canvas Store ────────────────────────────────────────────────────── */
export const useCanvasStore = create<CanvasState>((set, get) => ({
    /* ── Data ── */
    nodes: [],
    edges: [],
    viewport: DEFAULT_VIEWPORT,

    /* ── React Flow change handlers ── */
    onNodesChange: (changes: NodeChange<AppNode>[]) => {
        set({ nodes: applyNodeChanges(changes, get().nodes) });
    },

    onEdgesChange: (changes: EdgeChange<AppEdge>[]) => {
        set({ edges: applyEdgeChanges(changes, get().edges) });
    },

    onConnect: (connection: Connection) => {
        set({ edges: addEdge(connection, get().edges) });
    },

    /* ── Custom actions ── */
    addNode: (node: AppNode) => {
        set({ nodes: [...get().nodes, node] });
    },

    removeNode: (nodeId: string) => {
        set({
            nodes: get().nodes.filter((n) => n.id !== nodeId),
            edges: get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
        });
    },

    setViewport: (viewport: Viewport) => {
        set({ viewport });
    },
}));
