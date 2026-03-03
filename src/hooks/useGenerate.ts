/* ── useGenerate Hook ────────────────────────────────────────────────── */
/* Manages the full text-to-image generation lifecycle for a Prompt node. */

import { useCallback, useMemo } from 'react';
import { useCanvasStore } from '../stores/canvasStore';
import { useAuthStore } from '../stores/authStore';
import { generationService } from '../services/generationService';
import type { PromptNodeData } from '../types/canvas';
import type { GenerationError } from '../types/generation';

export function useGenerate(nodeId: string) {
    const updateNodeData = useCanvasStore((s) => s.updateNodeData);
    const nodes = useCanvasStore((s) => s.nodes);
    const authState = useAuthStore((s) => s.authState);

    /* ── Derive current node data ── */
    const nodeData = useMemo(() => {
        const node = nodes.find((n) => n.id === nodeId);
        return (node?.data ?? {}) as PromptNodeData;
    }, [nodes, nodeId]);

    const isGenerating = nodeData.generationStatus === 'generating';
    const isAuthenticated = authState.status === 'valid';

    const canGenerate =
        !!nodeData.prompt?.trim() &&
        isAuthenticated &&
        !isGenerating;

    /* ── Generate action ── */
    const generate = useCallback(async () => {
        if (!canGenerate) return;

        // Set loading state
        updateNodeData(nodeId, {
            generationStatus: 'generating',
            generationError: undefined,
        });

        try {
            const result = await generationService.generate({
                prompt: nodeData.prompt!,
                model: nodeData.model ?? 'IMAGEN_3_5',
                aspectRatio: nodeData.aspectRatio ?? 'IMAGE_ASPECT_RATIO_SQUARE',
                provider: 'imagefx',
            });

            if ('error' in result) {
                updateNodeData(nodeId, {
                    generationStatus: 'error',
                    generationError: result.error,
                });
                return;
            }

            // Success — store images and auto-select first
            updateNodeData(nodeId, {
                generationStatus: 'success',
                generatedImages: result.images,
                selectedImageIndex: 0,
                generationError: undefined,
                outputImage: result.images[0]?.encodedImage,
                outputSeed: result.images[0]?.seed,
            });
        } catch (err: any) {
            const error: GenerationError = {
                code: 'UNEXPECTED',
                message: err?.message ?? 'An unexpected error occurred',
                retryable: true,
            };
            updateNodeData(nodeId, {
                generationStatus: 'error',
                generationError: error,
            });
        }
    }, [canGenerate, nodeData.prompt, nodeData.model, nodeData.aspectRatio, nodeId, updateNodeData]);

    /* ── Retry action ── */
    const retry = useCallback(() => {
        updateNodeData(nodeId, {
            generationStatus: 'idle',
            generationError: undefined,
        });
        // Re-trigger after clearing error state
        generate();
    }, [nodeId, updateNodeData, generate]);

    return {
        generate,
        retry,
        isGenerating,
        canGenerate,
        isAuthenticated,
    };
}
