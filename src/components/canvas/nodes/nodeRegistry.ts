import { IngredientNode } from '../IngredientNode';
import { PromptNode } from './PromptNode';
import type { NodeType } from '../../../types/workflow';

/* ── nodeTypes map — Central registry for React Flow ──────────────────── */
export const nodeTypes: Record<NodeType, React.ComponentType<any>> = {
    'ingredient': IngredientNode,
    'prompt': PromptNode,
} as const;
