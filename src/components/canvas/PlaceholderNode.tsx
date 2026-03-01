import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { PlaceholderNodeData } from '../../types/canvas';

/* ── Placeholder Node Component ──────────────────────────────────────── */
export function PlaceholderNode({ data }: NodeProps) {
    const { label, icon, description } = data as PlaceholderNodeData;

    return (
        <div className="placeholder-node">
            <div className="placeholder-node__header">
                {icon && <div className="placeholder-node__icon">{icon}</div>}
                <span className="placeholder-node__label">{label}</span>
            </div>
            {description && (
                <div className="placeholder-node__description">{description}</div>
            )}
            <Handle type="target" position={Position.Left} />
            <Handle type="source" position={Position.Right} />
        </div>
    );
}

/* ── nodeTypes map — defined outside component to avoid re-renders ──── */
export const nodeTypes = {
    placeholder: PlaceholderNode,
} as const;
