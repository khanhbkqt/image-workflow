import type { NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import type { NodeType } from '../../../types/workflow';

/* ── Generic Node Component ──────────────────────────────────────────── */
export function GenericNode(props: NodeProps) {
    const { type, data } = props;
    const nodeType = type as NodeType;
    const label = (data.label as string) || nodeType;
    const icon = data.icon as string | undefined;

    return (
        <BaseNode nodeType={nodeType} className="generic-node">
            <div className="generic-node__header" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                minWidth: '120px'
            }}>
                {icon ? (
                    <span className="generic-node__icon">{icon}</span>
                ) : (
                    <span className="generic-node__icon" style={{
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'var(--color-bg-elevated)',
                        borderRadius: '4px',
                        fontSize: '12px'
                    }}>⚙️</span>
                )}
                <span className="generic-node__label" style={{
                    fontWeight: 500,
                    fontSize: '12px',
                    color: 'var(--color-text-primary)'
                }}>{label}</span>
            </div>

            {/* "Coming soon" badge or something similar */}
            <div style={{
                padding: '0 12px 12px 12px',
                fontSize: '10px',
                color: 'var(--color-text-muted)'
            }}>
                Generic Implementation
            </div>
        </BaseNode>
    );
}
