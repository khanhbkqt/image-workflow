import type { Node, Edge, Viewport } from '@xyflow/react';
import type { IngredientType } from './ingredient';
import type {
    GenerationModel,
    AspectRatio,
    GenerationStatus,
    GeneratedImage,
    GenerationError,
} from './generation';

/* ── Base Node Data ──────────────────────────────────────────────────── */

/** Base interface for all custom node data. */
export interface NodeData {
    label: string;
    [key: string]: unknown;
}

/** Data shape for an ingredient node dropped from the library. */
export interface IngredientNodeData extends NodeData {
    ingredientId: string;
    ingredientType: IngredientType;
    icon: string;
    description?: string;
    imageUrl?: string;
}

/** Data shape for a prompt node. */
export interface PromptNodeData extends NodeData {
    prompt?: string;

    /* ── Generation state (all optional for backward compat) ── */
    generationStatus?: GenerationStatus;
    generatedImages?: GeneratedImage[];
    selectedImageIndex?: number;
    generationError?: GenerationError;
    model?: GenerationModel;
    aspectRatio?: AspectRatio;
    seed?: number;

    /* ── Output wiring ── */
    outputImage?: string;
    outputSeed?: number;
}

/* ── App-Level Node & Edge Types ─────────────────────────────────────── */

/** Application node — union of all supported node types. */
export type AppNode =
    | Node<IngredientNodeData, 'ingredient'>
    | Node<PromptNodeData, 'prompt'>;

/** Application edge type for React Flow v12. Just use Edge directly
 * to stay compatible with addEdge() which returns Edge[]. */
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
    clearEdges: () => void;
    updateNodeData: (nodeId: string, dataPatch: any) => void;
    setViewport: (viewport: Viewport) => void;

    /* ── Persistence actions ── */
    loadCanvas: (projectId: string) => void;
    clearCanvas: () => void;
}
