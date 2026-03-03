/* ── useGenerate Hook ────────────────────────────────────────────────── */
/* Manages the full generation lifecycle for a Prompt node.               */
/* Routes between ImageFX (text-to-image) and Whisk (image-based).       */
/* Results are driven by the generationQueueStore — no direct service     */
/* calls happen here.                                                     */

import { useCallback, useMemo } from 'react';
import { useCanvasStore } from '../stores/canvasStore';
import { useAuthStore } from '../stores/authStore';
import { useGenerationQueueStore } from '../stores/generationQueueStore';
import type { PromptNodeData } from '../types/canvas';
import type { GenerationRequest } from '../types/generation';

export function useGenerate(nodeId: string) {
    const updateNodeData = useCanvasStore((s) => s.updateNodeData);
    const nodes = useCanvasStore((s) => s.nodes);
    const authState = useAuthStore((s) => s.authState);

    // Queue store selectors
    const queueJob = useGenerationQueueStore((s) => s.jobForNode(nodeId));
    const enqueue = useGenerationQueueStore((s) => s.enqueue);
    const cancelJob = useGenerationQueueStore((s) => s.cancelJob);

    /* ── Derive current node data ── */
    const nodeData = useMemo(() => {
        const node = nodes.find((n) => n.id === nodeId);
        return (node?.data ?? {}) as PromptNodeData;
    }, [nodes, nodeId]);

    const generationMode = nodeData.generationMode ?? 'text';
    const isAuthenticated = authState.status === 'valid';

    // Derive isGenerating from queue job status (not node data field)
    const isGenerating =
        queueJob?.status === 'running' || queueJob?.status === 'pending';

    // Derive queue position (1-indexed) when job is pending
    const queuePosition = useGenerationQueueStore((s) => {
        if (!queueJob || queueJob.status !== 'pending') return null;
        const pendingJobs = s.jobs.filter((j) => j.status === 'pending');
        const idx = pendingJobs.findIndex((j) => j.nodeId === nodeId);
        return idx >= 0 ? idx + 1 : null;
    });

    const canGenerate = useMemo(() => {
        if (isGenerating || !isAuthenticated) return false;
        // Block if a job is already active for this node
        if (queueJob?.status === 'pending' || queueJob?.status === 'running') return false;
        const hasPrompt = !!nodeData.prompt?.trim();

        if (generationMode === 'whisk') {
            const hasSlots = (nodeData.whiskSlots ?? []).some((s) => !!s.imageData);
            return hasPrompt && hasSlots;
        }

        // Flow mode: only requires prompt (reference images optional)
        if (generationMode === 'flow') {
            return hasPrompt;
        }

        return hasPrompt;
    }, [isGenerating, isAuthenticated, nodeData, generationMode, queueJob]);

    /* ── Generate action — enqueues a job ── */
    const generate = useCallback(async () => {
        if (!canGenerate) return;

        // Clear any previous error on the node
        updateNodeData(nodeId, {
            generationStatus: 'generating',
            generationError: undefined,
        });

        // Build request based on mode
        let request: GenerationRequest;

        if (generationMode === 'whisk' && nodeData.whiskSlots?.length) {
            request = {
                prompt: nodeData.prompt!,
                imageSlots: nodeData.whiskSlots.filter((s) => !!s.imageData),
                aspectRatio: nodeData.aspectRatio ?? 'IMAGE_ASPECT_RATIO_SQUARE',
                seed: nodeData.seed,
                provider: 'whisk',
            };
        } else if (generationMode === 'flow') {
            // Include only images that have been uploaded (have assetId)
            const uploadedInputs = (nodeData.flowReferenceImages ?? [])
                .filter((img) => !!img.assetId)
                .map((img) => ({
                    imageInputType: 'IMAGE_INPUT_TYPE_REFERENCE' as const,
                    name: img.assetId!,
                }));
            request = {
                prompt: nodeData.prompt!,
                aspectRatio: nodeData.aspectRatio ?? 'IMAGE_ASPECT_RATIO_SQUARE',
                seed: nodeData.seed,
                provider: 'flow',
                flowImageInputs: uploadedInputs.length > 0 ? uploadedInputs : undefined,
            };
        } else {
            request = {
                prompt: nodeData.prompt!,
                model: nodeData.model ?? 'IMAGEN_3_5',
                aspectRatio: nodeData.aspectRatio ?? 'IMAGE_ASPECT_RATIO_SQUARE',
                provider: 'imagefx',
            };
        }

        enqueue(nodeId, request);
    }, [canGenerate, generationMode, nodeData, nodeId, updateNodeData, enqueue]);

    /* ── Retry action — resets error state then re-enqueues ── */
    const retry = useCallback(() => {
        updateNodeData(nodeId, {
            generationStatus: 'idle',
            generationError: undefined,
        });
        generate();
    }, [nodeId, updateNodeData, generate]);

    /* ── Cancel action — removes the job from the queue ── */
    const cancel = useCallback(() => {
        if (queueJob) cancelJob(queueJob.id);
    }, [queueJob, cancelJob]);

    return {
        generate,
        retry,
        cancel,
        isGenerating,
        canGenerate,
        isAuthenticated,
        generationMode,
        queuePosition,  // null if not in queue, 1-indexed number if pending
        queueJob,       // full job object for status inspection
    };
}
