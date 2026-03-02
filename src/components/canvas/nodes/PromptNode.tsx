import { useState, useCallback } from 'react';
import type { NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import type { PromptNodeData } from '../../../types/canvas';
import { useCanvasStore } from '../../../stores/canvasStore';
import './PromptNode.css';

/**
 * PromptNode — core node of the Prompt Flow Engine.
 *
 * Ports (driven by NODE_PORT_REGISTRY):
 *   Input  — image_in  (left)
 *   Output — image_out (right)
 *
 * Content:
 *   - Multi-line textarea for the prompt text
 *   - Inline char counter
 */
export function PromptNode({ id, data }: NodeProps) {
    const { label, prompt = '' } = data as PromptNodeData;
    const updateNodeData = useCanvasStore((s) => s.updateNodeData);

    const [localPrompt, setLocalPrompt] = useState<string>(String(prompt));

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const value = e.target.value;
            setLocalPrompt(value);
            updateNodeData(id, { prompt: value });
        },
        [id, updateNodeData]
    );

    return (
        <BaseNode nodeType="prompt" className="prompt-node">
            <div className="prompt-node__header">
                <span className="prompt-node__icon">✏️</span>
                <span className="prompt-node__title">{label || 'Prompt'}</span>
                <span className="prompt-node__badge">PROMPT</span>
            </div>

            <div className="prompt-node__body">
                <textarea
                    className="prompt-node__textarea nodrag"
                    placeholder="Describe the image to generate…"
                    value={localPrompt}
                    onChange={handleChange}
                    rows={4}
                    maxLength={2000}
                    spellCheck={false}
                />
                <div className="prompt-node__footer">
                    <span className="prompt-node__char-count">
                        {localPrompt.length} / 2000
                    </span>
                </div>
            </div>
        </BaseNode>
    );
}
