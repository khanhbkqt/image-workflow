---
phase: 4
plan: 2
wave: 2
gap_closure: false
---

# Plan 4.2: Queue Processor

## Objective
Implement the async queue runner that processes one generation job at a time. `processNext()` picks the first pending job, marks it as running, calls the generation service, updates the job with results or errors (with up to 2 automatic retries for retryable errors), then chains to the next job. The processor auto-starts when a job is enqueued while the queue is idle.

## Context
Load these files for context:
- `src/stores/generationQueueStore.ts` — the store created in Plan 4.1 (has `jobs`, `updateJob`, `enqueue`)
- `src/services/generationService.ts` — `generate()` and `generateWhisk()` to call
- `src/types/generation.ts` — `QueueJob`, `QueueJobStatus`, `GenerationRequest`, `GenerationResult`, `GenerationError`
- `src/stores/canvasStore.ts` — `updateNodeData` to write results back to nodes after success

## Tasks

<task type="auto">
  <name>Add processNext() to generationQueueStore</name>
  <files>
    src/stores/generationQueueStore.ts
  </files>
  <action>
    Extend the Zustand store with async processor logic.

    Steps:
    1. Import `generationService` from `../services/generationService`
    2. Import `useCanvasStore` from `./canvasStore` — BUT import it **lazily inside the function** (not at the module top level) to avoid circular deps. Use `import('../stores/canvasStore').then(...)` pattern or just call `useCanvasStore.getState()` directly since Zustand stores expose `.getState()`:
       ```ts
       import { useCanvasStore } from './canvasStore'; // fine at top level — no circular, canvasStore doesn't import queueStore
       ```
    3. Add a `processing: boolean` field to the store state to act as a mutex:
       ```ts
       processing: false,
       ```
    4. Add a `processNext` action:
       ```ts
       processNext: async () => {
           const state = get();
           if (state.processing) return; // already running

           const nextJob = state.jobs.find((j) => j.status === 'pending');
           if (!nextJob) return; // queue empty

           // Acquire "lock"
           set({ processing: true, activeJobId: nextJob.id });
           get().updateJob(nextJob.id, {
               status: 'running',
               startedAt: new Date().toISOString(),
           });

           try {
               let result;
               const req = nextJob.request;

               if ('imageSlots' in req && req.imageSlots?.length && req.provider === 'whisk') {
                   result = await generationService.generateWhisk({
                       prompt: req.prompt,
                       imageSlots: req.imageSlots,
                       aspectRatio: req.aspectRatio,
                       seed: req.seed,
                   });
               } else {
                   result = await generationService.generate(req);
               }

               if ('error' in result) {
                   const isRetryable = result.error.retryable && nextJob.retryCount < 2;
                   if (isRetryable) {
                       // Re-queue with incremented retry count
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
                       // Write error back to node data
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
           } catch (err: any) {
               const error = {
                   code: 'UNEXPECTED',
                   message: err?.message ?? 'Unexpected error during generation',
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
               // Chain to next job
               get().processNext();
           }
       },
       ```
    5. Update `enqueue` to auto-start processing when idle:
       ```ts
       enqueue: (nodeId, request) => {
           const id = makeJobId();
           // ... create job ...
           set((s) => ({ jobs: [...s.jobs, job] }));
           // Auto-start if not already processing
           if (!get().processing) {
               Promise.resolve().then(() => get().processNext());
           }
           return id;
       },
       ```
    6. Update the `GenerationQueueState` type in `generation.ts` to include `processing: boolean` and `processNext: () => Promise<void>`

    AVOID: Calling `processNext()` synchronously inside the `set()` callback — always defer with `Promise.resolve().then()`
    AVOID: Multiple parallel calls to `processNext()` — the `processing` boolean acts as a mutex
    USE: `useCanvasStore.getState()` (not the hook) since we're outside of React
  </action>
  <verify>
    npx tsc --noEmit
    # Should compile without errors
  </verify>
  <done>
    - `processNext()` exists on the queue store
    - `processing` boolean prevents re-entrant execution
    - Results are written back to canvasStore node data on success
    - Retryable errors retry up to 2× before marking as error
    - `enqueue()` auto-triggers processing when queue was idle
  </done>
</task>

## Must-Haves
After all tasks complete, verify:
- [ ] `processNext()` picks exactly 1 pending job at a time (serial processing)
- [ ] `processing` boolean acts as a correct mutex (no double-processing)
- [ ] On success: `QueueJob.status = 'done'`, node data updated with images
- [ ] On retryable error: retries up to 2×, then marks `status: 'error'`
- [ ] On non-retryable error: immediately marks `status: 'error'`
- [ ] Cancelled jobs (status already 'error') are skipped in `processNext()`
- [ ] TypeScript compilation passes

## Success Criteria
- [ ] All tasks verified passing
- [ ] Must-haves confirmed
- [ ] `npx tsc --noEmit` passes
