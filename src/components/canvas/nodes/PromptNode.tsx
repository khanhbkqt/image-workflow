import { useState, useCallback } from 'react';
import type { NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import type { PromptNodeData } from '../../../types/canvas';
import type { GenerationModel, AspectRatio } from '../../../types/generation';
import { useCanvasStore } from '../../../stores/canvasStore';
import { useAuthStore } from '../../../stores/authStore';
import { useGenerate } from '../../../hooks/useGenerate';
import './PromptNode.css';

/* ── Constants ───────────────────────────────────────────────────────── */

const MODEL_OPTIONS: { value: GenerationModel; label: string }[] = [
    { value: 'IMAGEN_3_5', label: 'Imagen 3.5' },
    { value: 'IMAGEN_4', label: 'Imagen 4' },
];

const ASPECT_OPTIONS: { value: AspectRatio; label: string; icon: string }[] = [
    { value: 'IMAGE_ASPECT_RATIO_SQUARE', label: '1:1', icon: '◻' },
    { value: 'IMAGE_ASPECT_RATIO_PORTRAIT', label: '3:4', icon: '▯' },
    { value: 'IMAGE_ASPECT_RATIO_LANDSCAPE', label: '4:3', icon: '▭' },
];

/**
 * PromptNode — core node of the Prompt Flow Engine.
 *
 * Ports (driven by NODE_PORT_REGISTRY):
 *   Input  — image_in  (left)
 *   Output — image_out (right)
 *
 * Content:
 *   - Multi-line textarea for the prompt text
 *   - Model selector, aspect ratio picker, generate button
 *   - Generated image results grid
 */
export function PromptNode({ id, data }: NodeProps) {
    const nodeData = data as PromptNodeData;
    const {
        label,
        prompt = '',
        model = 'IMAGEN_3_5',
        aspectRatio = 'IMAGE_ASPECT_RATIO_SQUARE',
        generationStatus,
        generationError,
        generatedImages,
        selectedImageIndex = 0,
    } = nodeData;

    const updateNodeData = useCanvasStore((s) => s.updateNodeData);
    const openSettings = useAuthStore((s) => s.openSettings);
    const { generate, retry, isGenerating, canGenerate, isAuthenticated } =
        useGenerate(id);

    const [localPrompt, setLocalPrompt] = useState<string>(String(prompt));

    /* ── Handlers ── */

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const value = e.target.value;
            setLocalPrompt(value);
            updateNodeData(id, { prompt: value });
        },
        [id, updateNodeData]
    );

    const handleModelChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            updateNodeData(id, { model: e.target.value as GenerationModel });
        },
        [id, updateNodeData]
    );

    const handleAspectClick = useCallback(
        (value: AspectRatio) => {
            updateNodeData(id, { aspectRatio: value });
        },
        [id, updateNodeData]
    );

    const handleThumbnailClick = useCallback(
        (index: number) => {
            const image = generatedImages?.[index];
            if (!image) return;
            updateNodeData(id, {
                selectedImageIndex: index,
                outputImage: image.encodedImage,
                outputSeed: image.seed,
            });
        },
        [id, updateNodeData, generatedImages]
    );

    /* ── Render helpers ── */

    const renderGenerateButton = () => {
        if (!isAuthenticated) {
            return (
                <button
                    className="prompt-node__generate-btn prompt-node__generate-btn--setup nodrag"
                    onClick={openSettings}
                    type="button"
                >
                    ⚙️ Set up API
                </button>
            );
        }

        return (
            <button
                className={`prompt-node__generate-btn nodrag ${isGenerating ? 'prompt-node__generate-btn--loading' : ''
                    }`}
                onClick={generate}
                disabled={!canGenerate}
                type="button"
            >
                {isGenerating ? (
                    <>
                        <span className="prompt-node__spinner" />
                        Generating…
                    </>
                ) : (
                    '✨ Generate'
                )}
            </button>
        );
    };

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

                {/* ── Generation Controls ── */}
                <div className="prompt-node__controls nodrag">
                    <select
                        className="prompt-node__select nodrag"
                        value={model}
                        onChange={handleModelChange}
                    >
                        {MODEL_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>

                    <div className="prompt-node__aspect-group nodrag">
                        {ASPECT_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                className={`prompt-node__aspect-btn nodrag ${aspectRatio === opt.value
                                        ? 'prompt-node__aspect-btn--active'
                                        : ''
                                    }`}
                                onClick={() => handleAspectClick(opt.value)}
                                title={opt.label}
                                type="button"
                            >
                                {opt.icon}
                            </button>
                        ))}
                    </div>
                </div>

                {renderGenerateButton()}

                {/* ── Error Banner ── */}
                {generationStatus === 'error' && generationError && (
                    <div className="prompt-node__error nodrag">
                        <span className="prompt-node__error-msg">
                            {generationError.message}
                        </span>
                        {generationError.retryable && (
                            <button
                                className="prompt-node__retry-btn nodrag"
                                onClick={retry}
                                type="button"
                            >
                                ↻ Retry
                            </button>
                        )}
                    </div>
                )}

                {/* ── Generated Image Results ── */}
                {generatedImages && generatedImages.length > 0 && (
                    <div className="prompt-node__results nodrag nowheel">
                        <div className="prompt-node__results-header">
                            {generatedImages.length} image
                            {generatedImages.length !== 1 ? 's' : ''} generated
                        </div>
                        <div className="prompt-node__results-grid">
                            {generatedImages.map((img, i) => (
                                <img
                                    key={img.mediaGenerationId || i}
                                    className={`prompt-node__thumbnail ${i === selectedImageIndex
                                            ? 'prompt-node__thumbnail--selected'
                                            : ''
                                        }`}
                                    src={`data:image/png;base64,${img.encodedImage}`}
                                    alt={`Generated ${i + 1}`}
                                    onClick={() => handleThumbnailClick(i)}
                                    title={`Seed: ${img.seed}`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </BaseNode>
    );
}
