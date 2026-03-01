import { IngredientNode } from '../IngredientNode';
import { GenericNode } from './GenericNode';
import type { NodeType } from '../../../types/workflow';
import { PlaceholderNode } from '../PlaceholderNode';

/* ── nodeTypes map — Central registry for React Flow ──────────────────── */
export const nodeTypes: Record<NodeType, React.ComponentType<any>> = {
    'ingredient': IngredientNode,
    'placeholder': PlaceholderNode,
    // Future nodes get the generic placeholder for now
    'compose': GenericNode,
    'preview': GenericNode,
    'output': GenericNode,
    'generate': GenericNode,
    'batch-generator': GenericNode,
    'style-fanout': GenericNode,
    'generate-ingredient': GenericNode,
    'brand-kit': GenericNode,
} as const;
