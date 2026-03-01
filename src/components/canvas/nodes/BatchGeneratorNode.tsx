import type { NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import './BatchGeneratorNode.css';

/* ── Batch Generator Node Component ───────────────────────────────────────── */
export function BatchGeneratorNode({ data }: NodeProps) {
    const label = (data.label as string) || 'Batch Gen';
    const combinations = (data.combinations as number) ?? 4; // Default to 4 for visual mockup

    // Generate mock grid items based on combination count (max 9 for visuals)
    const displayCount = Math.min(combinations, 9);
    const gridItems = Array.from({ length: displayCount }, (_, i) => i);

    return (
        <BaseNode nodeType="batch-generator" className="batch-generator-node">
            <div className="batch-generator-node__header">
                <span className="batch-generator-node__icon">⚡</span>
                <span className="batch-generator-node__title">{label}</span>
            </div>

            <div className="batch-generator-node__body">
                <div className="batch-generator-node__stats">
                    <span className="batch-generator-node__stats-label">Combinations</span>
                    <span className="batch-generator-node__count">{combinations}</span>
                </div>

                <div className="batch-generator-node__grid">
                    {gridItems.map((i) => (
                        <div key={i} className="batch-generator-node__grid-item" />
                    ))}
                    {combinations > 9 && (
                        <div className="batch-generator-node__grid-more">
                            +{combinations - 9}
                        </div>
                    )}
                </div>
            </div>
        </BaseNode>
    );
}
