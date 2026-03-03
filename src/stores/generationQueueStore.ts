import { create } from 'zustand';
import type { QueueJob, GenerationQueueState } from '../types/generation';
import { generationService } from '../services/generationService';
import { useCanvasStore } from './canvasStore';

function makeJobId(): string {
    return `job-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export const useGenerationQueueStore = create<GenerationQueueState>((set, get) => ({
    jobs: [],
    activeJobId: null,
    processing: false,

    enqueue: (nodeId, request) => {
        const id = makeJobId();
        const job: QueueJob = {
            id,
            nodeId,
            request,
            status: 'pending',
            retryCount: 0,
            enqueuedAt: new Date().toISOString(),
        };
        set((s) => ({ jobs: [...s.jobs, job] }));
        // Auto-start if not already processing (deferred to avoid sync issues)
        if (!get().processing) {
            Promise.resolve().then(() => get().processNext());
        }
        return id;
    },

    cancelJob: (jobId) => {
        set((s) => ({
            jobs: s.jobs.map((j) =>
                j.id === jobId && (j.status === 'pending' || j.status === 'running')
                    ? {
                        ...j,
                        status: 'error',
                        error: { code: 'CANCELLED', message: 'Cancelled by user', retryable: false },
                        completedAt: new Date().toISOString(),
                    }
                    : j
            ),
            activeJobId: s.activeJobId === jobId ? null : s.activeJobId,
        }));
    },

    removeJob: (jobId) => {
        set((s) => ({
            jobs: s.jobs.filter((j) => j.id !== jobId),
            activeJobId: s.activeJobId === jobId ? null : s.activeJobId,
        }));
    },

    clearCompleted: () => {
        set((s) => ({
            jobs: s.jobs.filter((j) => j.status === 'pending' || j.status === 'running'),
        }));
    },

    updateJob: (jobId, patch) => {
        set((s) => ({
            jobs: s.jobs.map((j) => (j.id === jobId ? { ...j, ...patch } : j)),
        }));
    },

    // ── Async queue processor ─────────────────────────────────────────
    processNext: async () => {
        const state = get();
        if (state.processing) return; // already running — mutex guard

        const nextJob = state.jobs.find((j) => j.status === 'pending');
        if (!nextJob) return; // queue empty

        // Acquire processing lock
        set({ processing: true, activeJobId: nextJob.id });
        get().updateJob(nextJob.id, {
            status: 'running',
            startedAt: new Date().toISOString(),
        });

        try {
            const req = nextJob.request;
            let result;

            if (
                'imageSlots' in req &&
                req.imageSlots?.length &&
                req.provider === 'whisk'
            ) {
                result = await generationService.generateWhisk({
                    prompt: req.prompt,
                    imageSlots: req.imageSlots,
                    aspectRatio: req.aspectRatio,
                    seed: req.seed,
                });
            } else if (req.provider === 'flow') {
                result = await generationService.generateFlow({
                    prompt: req.prompt,
                    aspectRatio: req.aspectRatio,
                    seed: req.seed,
                    imageInputs: req.flowImageInputs,
                });
            } else {
                result = await generationService.generate(req);
            }

            if ('error' in result) {
                const isRetryable =
                    result.error.retryable && nextJob.retryCount < 2;

                if (isRetryable) {
                    // Put the job back to pending with incremented retry count
                    get().updateJob(nextJob.id, {
                        status: 'pending',
                        retryCount: nextJob.retryCount + 1,
                        error: result.error,
                    });
                } else {
                    get().updateJob(nextJob.id, {
                        status: 'error',
                        error: result.error,
                        completedAt: new Date().toISOString(),
                    });
                    useCanvasStore.getState().updateNodeData(nextJob.nodeId, {
                        generationStatus: 'error',
                        generationError: result.error,
                    });
                }
            } else {
                get().updateJob(nextJob.id, {
                    status: 'done',
                    result,
                    completedAt: new Date().toISOString(),
                });
                // Write result back to node data
                useCanvasStore.getState().updateNodeData(nextJob.nodeId, {
                    generationStatus: 'success',
                    generatedImages: result.images,
                    selectedImageIndex: 0,
                    generationError: undefined,
                    outputImage: result.images[0]?.encodedImage,
                    outputSeed: result.images[0]?.seed,
                });
            }
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : 'Unexpected error during generation';
            const error = {
                code: 'UNEXPECTED',
                message,
                retryable: true,
            };

            if (nextJob.retryCount < 2) {
                get().updateJob(nextJob.id, {
                    status: 'pending',
                    retryCount: nextJob.retryCount + 1,
                    error,
                });
            } else {
                get().updateJob(nextJob.id, {
                    status: 'error',
                    error,
                    completedAt: new Date().toISOString(),
                });
                useCanvasStore.getState().updateNodeData(nextJob.nodeId, {
                    generationStatus: 'error',
                    generationError: error,
                });
            }
        } finally {
            set({ processing: false, activeJobId: null });
            // Chain to next job in queue
            get().processNext();
        }
    },

    pendingCount: () => {
        return get().jobs.filter((j) => j.status === 'pending').length;
    },

    jobForNode: (nodeId) => {
        // Return the most recent non-done job for this node
        const nodeJobs = get().jobs.filter((j) => j.nodeId === nodeId);
        const runningJob = nodeJobs.find((j) => j.status === 'running');
        if (runningJob) return runningJob;
        const pendingJob = nodeJobs.find((j) => j.status === 'pending');
        if (pendingJob) return pendingJob;
        // findLast polyfill: search from the end for a done/error job
        for (let i = nodeJobs.length - 1; i >= 0; i--) {
            const j = nodeJobs[i];
            if (j.status === 'done' || j.status === 'error') return j;
        }
        return undefined;
    },
}));
