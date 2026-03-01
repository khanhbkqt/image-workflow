import type { NodeProps } from '@xyflow/react';
import type { IngredientNodeData } from '../../types/canvas';
import { useIngredientStore } from '../../stores/ingredientStore';
import { BaseNode } from './nodes/BaseNode';
import './IngredientNode.css';

/* ── Ingredient Node Component ───────────────────────────────────────── */
export function IngredientNode({ data }: NodeProps) {
    const { label, icon, ingredientType, description, imageUrl, ingredientId } =
        data as IngredientNodeData & { ingredientId?: string };

    const getIngredientById = useIngredientStore((s) => s.getIngredientById);
    const ingredients = useIngredientStore((s) => s.ingredients);

    // For brand-kit: resolve bundled ingredient names
    const bundledItems = ingredientType === 'brand-kit' && ingredientId ? (() => {
        const bk = getIngredientById(ingredientId) as (typeof ingredients[0] & { styleIds?: string[]; modifierIds?: string[] }) | undefined;
        if (!bk) return null;
        const styles = (bk.styleIds ?? []).map((id) => getIngredientById(id)?.name).filter(Boolean) as string[];
        const modifiers = (bk.modifierIds ?? []).map((id) => getIngredientById(id)?.name).filter(Boolean) as string[];
        return { styles, modifiers };
    })() : null;

    // determine correct node type. In a more complete engine, brand-kit might be its own node type
    const nodeType = ingredientType === 'brand-kit' ? 'brand-kit' : 'ingredient';

    return (
        <BaseNode nodeType={nodeType} className={`ingredient-node ingredient-node--${ingredientType}`}>
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
                {bundledItems && (bundledItems.styles.length > 0 || bundledItems.modifiers.length > 0) && (
                    <div className="ingredient-node__bundle">
                        {bundledItems.styles.length > 0 && (
                            <div className="ingredient-node__bundle-group">
                                <span className="ingredient-node__bundle-label">Styles</span>
                                {bundledItems.styles.map((name) => (
                                    <span key={name} className="ingredient-node__bundle-item">🎨 {name}</span>
                                ))}
                            </div>
                        )}
                        {bundledItems.modifiers.length > 0 && (
                            <div className="ingredient-node__bundle-group">
                                <span className="ingredient-node__bundle-label">Modifiers</span>
                                {bundledItems.modifiers.map((name) => (
                                    <span key={name} className="ingredient-node__bundle-item">⚙️ {name}</span>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </BaseNode>
    );
}
