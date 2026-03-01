import type { Node, Edge, Viewport } from '@xyflow/react';
import type { IngredientType } from './ingredient';

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

/** Data shape for an ingredient node dropped from the library. */
export interface IngredientNodeData extends NodeData {
    ingredientId: string;
    ingredientType: IngredientType;
    icon: string;
    description?: string;
    imageUrl?: string;
}

/* ── App-Level Node & Edge Types ─────────────────────────────────────── */

/** Application node — union of all supported node types. */
export type AppNode =
    | Node<PlaceholderNodeData, 'placeholder'>
    | Node<IngredientNodeData, 'ingredient'>;

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
