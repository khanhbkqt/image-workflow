import { create } from 'zustand';
import type { QueueJob, GenerationQueueState } from '../types/generation';

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

    // Placeholder — replaced by Plan 4.2 with full async logic
    processNext: async () => {
        // Will be implemented in Plan 4.2
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
