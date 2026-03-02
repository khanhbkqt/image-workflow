import type { NodeProps } from '@xyflow/react';
import type { PromptNodeData } from '../../../types/canvas';

/**
 * PromptNode — stub component.
 * Full implementation is delivered in Phase 2: Prompt Node.
 */
export function PromptNode({ data }: NodeProps) {
    const { label, prompt } = data as PromptNodeData;
    return (
        <div className="prompt-node prompt-node--stub">
            <div className="prompt-node__header">✏️ Prompt</div>
            <div className="prompt-node__label">{label ?? 'Prompt'}</div>
            {prompt && <div className="prompt-node__text">{String(prompt)}</div>}
        </div>
    );
}
