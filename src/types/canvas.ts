import type { Node, Edge, Viewport } from '@xyflow/react';

/* ── Base Node Data ──────────────────────────────────────────────────── */

/** Base interface for all custom node data. */
export interface NodeData {
    label: string;
    [key: string]: unknown;
}

/** Data shape for a placeholder/demo node. */
export interface PlaceholderNodeData extends NodeData {
    icon?: string;
    description?: string;
}

/* ── App-Level Node & Edge Types ─────────────────────────────────────── */

/** Application node — extends React Flow's Node with typed custom data. */
export type AppNode = Node<PlaceholderNodeData, 'placeholder'>;

/** Application edge — extends React Flow's Edge. */
export type AppEdge = Edge;

/* ── Canvas Store State ──────────────────────────────────────────────── */

export interface CanvasState {
    /* ── Data ── */
    nodes: AppNode[];
    edges: AppEdge[];
    viewport: Viewport;

    /* ── React Flow change handlers ── */
    onNodesChange: (changes: import('@xyflow/react').NodeChange<AppNode>[]) => void;
    onEdgesChange: (changes: import('@xyflow/react').EdgeChange<AppEdge>[]) => void;
    onConnect: (connection: import('@xyflow/react').Connection) => void;

    /* ── Custom actions ── */
    addNode: (node: AppNode) => void;
    removeNode: (nodeId: string) => void;
    setViewport: (viewport: Viewport) => void;

    /* ── Persistence actions ── */
    loadCanvas: (projectId: string) => void;
    clearCanvas: () => void;
}
