---
phase: 4
plan: 1
wave: 1
gap_closure: false
---

# Plan 4.1: Queue Types & Store

## Objective
Define the `QueueJob` type and create a `generationQueueStore` (Zustand) that will act as the central coordinator for all generation requests across every PromptNode on the canvas. This is the foundation that the queue processor (4.2) and hook integration (4.3) build on top of.

## Context
Load these files for context:
- `src/types/generation.ts` — existing GenerationRequest, GenerationResult, GenerationError types
- `src/stores/canvasStore.ts` — pattern for Zustand store structure
- `src/stores/index.ts` — barrel exports for stores
- `src/services/generationService.ts` — the service the queue will call

## Tasks

<task type="auto">
  <name>Define QueueJob type in generation.ts</name>
  <files>
    src/types/generation.ts
  </files>
  <action>
    Add queue-specific types to the existing generation type file.

    Steps:
    1. Add a `QueueJobStatus` union type:
       ```ts
       export type QueueJobStatus = 'pending' | 'running' | 'done' | 'error';
       ```
    2. Add a `QueueJob` interface below the existing types:
       ```ts
       export interface QueueJob {
           /** Unique job identifier */
           id: string;
           /** The canvas node this job belongs to */
           nodeId: string;
           /** The generation request payload */
           request: GenerationRequest;
           /** Current lifecycle status */
           status: QueueJobStatus;
           /** How many times this job has been retried */
           retryCount: number;
           /** When the job was enqueued (ISO string) */
           enqueuedAt: string;
           /** When the job started processing */
           startedAt?: string;
           /** When the job finished (success or final error) */
           completedAt?: string;
           /** Result on success */
           result?: GenerationResult;
           /** Error on failure */
           error?: GenerationError;
       }
       ```
    3. Add a `GenerationQueueState` interface for the Zustand store shape:
       ```ts
       export interface GenerationQueueState {
           jobs: QueueJob[];
           activeJobId: string | null;
           enqueue: (nodeId: string, request: GenerationRequest) => string; // returns jobId
           cancelJob: (jobId: string) => void;
           removeJob: (jobId: string) => void;
           clearCompleted: () => void;
           updateJob: (jobId: string, patch: Partial<QueueJob>) => void;
           // Derived helpers
           pendingCount: () => number;
           jobForNode: (nodeId: string) => QueueJob | undefined;
       }
       ```

    AVOID: Putting the async processNext() logic in the type — that belongs in the store implementation.
    USE: ISO strings for timestamps (not Date objects) to keep the store serialization-friendly.
  </action>
  <verify>
    npx tsc --noEmit
    # Should compile without errors
  </verify>
  <done>
    - `QueueJobStatus`, `QueueJob`, and `GenerationQueueState` are exported from `generation.ts`
    - TypeScript compilation passes
  </done>
</task>

<task type="auto">
  <name>Create generationQueueStore.ts</name>
  <files>
    src/stores/generationQueueStore.ts [NEW]
  </files>
  <action>
    Create the Zustand store that holds all queue state. At this stage it only manages data — the processor (Plan 4.2) will add the `processNext()` logic.

    Steps:
    1. Create `src/stores/generationQueueStore.ts`
    2. Import Zustand `create` and the new types from `../types/generation`
    3. Implement the store with the following shape:
       ```ts
       import { create } from 'zustand';
       import type { QueueJob, GenerationQueueState, GenerationRequest } from '../types/generation';

       function makeJobId(): string {
           return `job-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
       }

       export const useGenerationQueueStore = create<GenerationQueueState>((set, get) => ({
           jobs: [],
           activeJobId: null,

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
               return id;
           },

           cancelJob: (jobId) => {
               set((s) => ({
                   jobs: s.jobs.map((j) =>
                       j.id === jobId && (j.status === 'pending' || j.status === 'running')
                           ? { ...j, status: 'error', error: { code: 'CANCELLED', message: 'Cancelled by user', retryable: false }, completedAt: new Date().toISOString() }
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

           pendingCount: () => {
               return get().jobs.filter((j) => j.status === 'pending').length;
           },

           jobForNode: (nodeId) => {
               // Return the most recent non-done job for this node
               const nodeJobs = get().jobs.filter((j) => j.nodeId === nodeId);
               return (
                   nodeJobs.find((j) => j.status === 'running') ??
                   nodeJobs.find((j) => j.status === 'pending') ??
                   nodeJobs.findLast((j) => j.status === 'done' || j.status === 'error')
               );
           },
       }));
       ```
    4. Export the store from `src/stores/index.ts` barrel

    AVOID: Importing canvasStore or generationService here — keep this store pure data.
    NOTE: `processNext()` will be patched into this store in Plan 4.2 via a separate module.
  </action>
  <verify>
    npx tsc --noEmit
    # generationQueueStore.ts should compile cleanly
  </verify>
  <done>
    - `useGenerationQueueStore` exists at `src/stores/generationQueueStore.ts`
    - `enqueue`, `cancelJob`, `removeJob`, `clearCompleted`, `updateJob`, `pendingCount`, `jobForNode` all implemented
    - Exported from `src/stores/index.ts`
    - TypeScript compilation passes
  </done>
</task>

## Must-Haves
After all tasks complete, verify:
- [ ] `QueueJob`, `QueueJobStatus`, `GenerationQueueState` types exported from `generation.ts`
- [ ] `useGenerationQueueStore` created with all CRUD actions
- [ ] `jobForNode(nodeId)` correctly returns the most relevant job for a node
- [ ] No regressions in existing TypeScript compilation

## Success Criteria
- [ ] All tasks verified passing
- [ ] Must-haves confirmed
- [ ] `npx tsc --noEmit` passes
