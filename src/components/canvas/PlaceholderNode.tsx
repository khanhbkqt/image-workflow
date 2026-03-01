import type { NodeProps } from '@xyflow/react';
import type { PlaceholderNodeData } from '../../types/canvas';
import { BaseNode } from './nodes/BaseNode';
import { IngredientNode } from './IngredientNode';
export function PlaceholderNode({ data }: NodeProps) {
    const { label, icon, description } = data as PlaceholderNodeData;

    return (
        <BaseNode nodeType="placeholder" className="placeholder-node">
            <div className="placeholder-node__header">
                {icon && <div className="placeholder-node__icon">{icon}</div>}
                <span className="placeholder-node__label">{label}</span>
            </div>
            {description && (
                <div className="placeholder-node__description">{description}</div>
            )}
        </BaseNode>
    );
}

/* ── nodeTypes map — defined outside component to avoid re-renders ──── */
export const nodeTypes = {
    placeholder: PlaceholderNode,
    ingredient: IngredientNode,
} as const;

