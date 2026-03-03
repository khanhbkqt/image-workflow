/* ── useGenerate Hook ────────────────────────────────────────────────── */
/* Manages the full generation lifecycle for a Prompt node.               */
/* Routes between ImageFX (text-to-image) and Whisk (image-based).       */

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

    const generationMode = nodeData.generationMode ?? 'text';
    const isGenerating = nodeData.generationStatus === 'generating';
    const isAuthenticated = authState.status === 'valid';

    const canGenerate = useMemo(() => {
        if (isGenerating || !isAuthenticated) return false;
        const hasPrompt = !!nodeData.prompt?.trim();

        if (generationMode === 'whisk') {
            // Whisk requires at least one filled image slot AND a prompt
            const hasSlots = (nodeData.whiskSlots ?? []).some((s) => !!s.imageData);
            return hasPrompt && hasSlots;
        }

        // Text mode: just needs a prompt
        return hasPrompt;
    }, [isGenerating, isAuthenticated, nodeData.prompt, generationMode, nodeData.whiskSlots]);

    /* ── Generate action ── */
    const generate = useCallback(async () => {
        if (!canGenerate) return;

        // Set loading state
        updateNodeData(nodeId, {
            generationStatus: 'generating',
            generationError: undefined,
        });

        try {
            let result;

            if (generationMode === 'whisk' && nodeData.whiskSlots?.length) {
                // Whisk path — image-based generation
                result = await generationService.generateWhisk({
                    prompt: nodeData.prompt!,
                    imageSlots: nodeData.whiskSlots.filter((s) => !!s.imageData),
                    aspectRatio: nodeData.aspectRatio ?? 'IMAGE_ASPECT_RATIO_SQUARE',
                    seed: nodeData.seed,
                });
            } else {
                // ImageFX path — text-to-image
                result = await generationService.generate({
                    prompt: nodeData.prompt!,
                    model: nodeData.model ?? 'IMAGEN_3_5',
                    aspectRatio: nodeData.aspectRatio ?? 'IMAGE_ASPECT_RATIO_SQUARE',
                    provider: 'imagefx',
                });
            }

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
    }, [canGenerate, generationMode, nodeData.prompt, nodeData.model, nodeData.aspectRatio, nodeData.seed, nodeData.whiskSlots, nodeId, updateNodeData]);

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
        generationMode,
    };
}
