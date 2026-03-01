import { IngredientNode } from '../IngredientNode';
import { GenericNode } from './GenericNode';
import { ComposeNode } from './ComposeNode';
import { PreviewNode } from './PreviewNode';
import { OutputNode } from './OutputNode';
import type { NodeType } from '../../../types/workflow';
import { PlaceholderNode } from '../PlaceholderNode';
import { BatchGeneratorNode } from './BatchGeneratorNode';
import { StyleFanOutNode } from './StyleFanOutNode';

/* ── nodeTypes map — Central registry for React Flow ──────────────────── */
export const nodeTypes: Record<NodeType, React.ComponentType<any>> = {
    'ingredient': IngredientNode,
    'placeholder': PlaceholderNode,
    // Phase 2: Core Nodes
    'compose': ComposeNode,
    'preview': PreviewNode,
    'output': OutputNode,
    // Phase 3: Advanced Nodes (placeholder until implemented)
    'generate': GenericNode,
    'batch-generator': BatchGeneratorNode,
    'style-fanout': StyleFanOutNode,
    'generate-ingredient': GenericNode,
    'brand-kit': GenericNode,
} as const;
