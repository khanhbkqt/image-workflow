import type { NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import './StyleFanOutNode.css';

/* ── Style Fan-Out Node Component ───────────────────────────────────────── */
export function StyleFanOutNode({ data }: NodeProps) {
    const label = (data.label as string) || 'Style Fan-Out';
    const styleCount = (data.styleCount as number) ?? 3; // Default for visual mockup

    // Generate mock diagram items based on style count (max 5 for visuals)
    const displayCount = Math.min(styleCount, 5);
    const fanItems = Array.from({ length: displayCount }, (_, i) => i);

    return (
        <BaseNode nodeType="style-fanout" className="style-fanout-node">
            <div className="style-fanout-node__header">
                <span className="style-fanout-node__icon">🔀</span>
                <span className="style-fanout-node__title">{label}</span>
            </div>

            <div className="style-fanout-node__body">
                <div className="style-fanout-node__stats">
                    <span className="style-fanout-node__stats-label">Applied Styles</span>
                    <span className="style-fanout-node__count">{styleCount}</span>
                </div>

                <div className="style-fanout-node__diagram">
                    <div className="style-fanout-node__base-image" />
                    <div className="style-fanout-node__arrows">
                        {fanItems.map((i) => (
                            <div key={i} className="style-fanout-node__arrow-path" />
                        ))}
                    </div>
                    <div className="style-fanout-node__outputs">
                        {fanItems.map((i) => (
                            <div key={i} className="style-fanout-node__output-image" />
                        ))}
                        {styleCount > 5 && (
                            <div className="style-fanout-node__output-more">
                                +{styleCount - 5}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </BaseNode>
    );
}
