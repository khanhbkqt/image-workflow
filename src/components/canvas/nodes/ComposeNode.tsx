import type { NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import './ComposeNode.css';

/* ── Compose Node Component ──────────────────────────────────────────── */
export function ComposeNode({ data }: NodeProps) {
    const label = (data.label as string) || 'Compose';
    const blendMode = (data.blendMode as string) || 'normal';
    const opacity = (data.opacity as number) ?? 100;

    return (
        <BaseNode nodeType="compose" className="compose-node">
            <div className="compose-node__header">
                <span className="compose-node__icon">🖼️</span>
                <span className="compose-node__title">{label}</span>
            </div>
            <div className="compose-node__body">
                <div className="compose-node__field">
                    <span className="compose-node__field-label">Blend</span>
                    <span className="compose-node__field-value">{blendMode}</span>
                </div>
                <div className="compose-node__field">
                    <span className="compose-node__field-label">Opacity</span>
                    <span className="compose-node__field-value">{opacity}%</span>
                </div>
                <div className="compose-node__diagram">
                    <div className="compose-node__layer compose-node__layer--bg">BG</div>
                    <div className="compose-node__layer compose-node__layer--fg">FG</div>
                    <span className="compose-node__arrow">→</span>
                    <div className="compose-node__layer compose-node__layer--out">Out</div>
                </div>
            </div>
        </BaseNode>
    );
}
