import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { IngredientNodeData } from '../../types/canvas';
import './IngredientNode.css';

/* ── Ingredient Node Component ───────────────────────────────────────── */
export function IngredientNode({ data }: NodeProps) {
    const { label, icon, ingredientType, description, imageUrl } =
        data as IngredientNodeData;

    return (
        <div className={`ingredient-node ingredient-node--${ingredientType}`}>
            <Handle type="target" position={Position.Left} />

            {imageUrl && (
                <div className="ingredient-node__thumbnail">
                    <img src={imageUrl} alt={label} />
                </div>
            )}

            <div className="ingredient-node__body">
                <div className="ingredient-node__header">
                    <span className="ingredient-node__icon">{icon}</span>
                    <span className="ingredient-node__label">{label}</span>
                </div>
                <span className="ingredient-node__badge">{ingredientType}</span>
                {description && (
                    <p className="ingredient-node__description">{description}</p>
                )}
            </div>

            <Handle type="source" position={Position.Right} />
        </div>
    );
}
