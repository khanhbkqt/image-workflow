import type { NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import './OutputNode.css';

/* ── Output Node Component ───────────────────────────────────────────── */
export function OutputNode({ data }: NodeProps) {
    const label = (data.label as string) || 'Output';
    const format = (data.format as string) || 'PNG';
    const resolution = (data.resolution as string) || '1920 × 1080';
    const filename = (data.filename as string) || 'output';
    const isReady = !!(data.imageUrl);

    return (
        <BaseNode nodeType="output" className="output-node">
            <div className="output-node__header">
                <span className="output-node__icon">📤</span>
                <span className="output-node__title">{label}</span>
                <span className={`output-node__status ${isReady ? 'output-node__status--ready' : 'output-node__status--idle'}`}>
                    {isReady ? '●' : '○'}
                </span>
            </div>
            <div className="output-node__body">
                <div className="output-node__field">
                    <span className="output-node__field-label">Format</span>
                    <span className="output-node__field-value output-node__badge">{format}</span>
                </div>
                <div className="output-node__field">
                    <span className="output-node__field-label">Size</span>
                    <span className="output-node__field-value">{resolution}</span>
                </div>
                <div className="output-node__field">
                    <span className="output-node__field-label">File</span>
                    <span className="output-node__field-value output-node__filename">{filename}.{format.toLowerCase()}</span>
                </div>
            </div>
            <button
                className={`output-node__export-btn ${isReady ? '' : 'output-node__export-btn--disabled'}`}
                disabled={!isReady}
            >
                Export
            </button>
        </BaseNode>
    );
}
