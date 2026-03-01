import type { NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import './PreviewNode.css';

/* ── Preview Node Component ──────────────────────────────────────────── */
export function PreviewNode({ data }: NodeProps) {
    const label = (data.label as string) || 'Preview';
    const imageUrl = data.imageUrl as string | undefined;
    const width = (data.width as number) || 256;
    const height = (data.height as number) || 144;

    return (
        <BaseNode nodeType="preview" className="preview-node">
            <div className="preview-node__header">
                <span className="preview-node__icon">👁️</span>
                <span className="preview-node__title">{label}</span>
            </div>
            <div className="preview-node__canvas" style={{ width, height: height }}>
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt="Preview"
                        className="preview-node__image"
                    />
                ) : (
                    <div className="preview-node__placeholder">
                        <span className="preview-node__placeholder-icon">🖼️</span>
                        <span className="preview-node__placeholder-text">No image connected</span>
                    </div>
                )}
            </div>
            <div className="preview-node__footer">
                <span className="preview-node__size">{width} × {height}</span>
            </div>
        </BaseNode>
    );
}
