---
phase: 4
plan: 3
wave: 2
gap_closure: false
---

# Plan 4.3: useGenerate Queue Integration

## Objective
Refactor the `useGenerate` hook so that clicking Generate enqueues a job instead of calling the generation service directly. Per-node generation status is now derived from the queue store (by looking up `jobForNode(nodeId)`), and the hook exposes queue position for the UI to display. This eliminates all direct service calls from the hook.

## Context
Load these files for context:
- `src/hooks/useGenerate.ts` — current hook that calls generationService directly (to be refactored)
- `src/stores/generationQueueStore.ts` — the queue store from Plans 4.1 + 4.2
- `src/types/generation.ts` — `QueueJob`, `QueueJobStatus`
- `src/stores/canvasStore.ts` — `updateNodeData` (still needed for clearing error state on retry)
- `src/stores/authStore.ts` — auth check (unchanged)

## Tasks

<task type="auto">
  <name>Refactor useGenerate to enqueue via queue store</name>
  <files>
    src/hooks/useGenerate.ts
  </files>
  <action>
    Replace direct generationService calls with queue store enqueue calls.

    Steps:
    1. Import `useGenerationQueueStore` from `../stores/generationQueueStore`
    2. Inside `useGenerate(nodeId)`:
       - Subscribe to the queue store to find the current job for this node:
         ```ts
         const queueJob = useGenerationQueueStore((s) => s.jobForNode(nodeId));
         const enqueue = useGenerationQueueStore((s) => s.enqueue);
         const cancelJob = useGenerationQueueStore((s) => s.cancelJob);
         ```
    3. Derive `isGenerating` from the job status instead of node data:
       ```ts
       const isGenerating = queueJob?.status === 'running' || queueJob?.status === 'pending';
       ```
    4. Derive `queuePosition` — how many pending jobs are ahead of this node's job:
       ```ts
       const queuePosition = useGenerationQueueStore((s) => {
           if (!queueJob || queueJob.status !== 'pending') return null;
           const pendingJobs = s.jobs.filter((j) => j.status === 'pending');
           const idx = pendingJobs.findIndex((j) => j.nodeId === nodeId);
           return idx >= 0 ? idx + 1 : null; // 1-indexed position
       });
       ```
    5. Replace the `generate` callback body:
       ```ts
       const generate = useCallback(async () => {
           if (!canGenerate) return;

           // Clear any previous error
           updateNodeData(nodeId, {
               generationStatus: 'generating',
               generationError: undefined,
           });

           // Build request
           const request: GenerationRequest = generationMode === 'whisk' && nodeData.whiskSlots?.length
               ? {
                   prompt: nodeData.prompt!,
                   imageSlots: nodeData.whiskSlots.filter((s) => !!s.imageData),
                   aspectRatio: nodeData.aspectRatio ?? 'IMAGE_ASPECT_RATIO_SQUARE',
                   seed: nodeData.seed,
                   provider: 'whisk',
               }
               : {
                   prompt: nodeData.prompt!,
                   model: nodeData.model ?? 'IMAGEN_3_5',
                   aspectRatio: nodeData.aspectRatio ?? 'IMAGE_ASPECT_RATIO_SQUARE',
                   provider: 'imagefx',
               };

           enqueue(nodeId, request);
       }, [canGenerate, generationMode, nodeData, nodeId, updateNodeData, enqueue]);
       ```
    6. Update `canGenerate` to block re-generation when a job is already pending or running:
       ```ts
       const canGenerate = useMemo(() => {
           if (isGenerating || !isAuthenticated) return false;
           if (queueJob?.status === 'pending' || queueJob?.status === 'running') return false;
           const hasPrompt = !!nodeData.prompt?.trim();
           if (generationMode === 'whisk') {
               const hasSlots = (nodeData.whiskSlots ?? []).some((s) => !!s.imageData);
               return hasPrompt && hasSlots;
           }
           return hasPrompt;
       }, [isGenerating, isAuthenticated, nodeData, generationMode, queueJob]);
       ```
    7. Add a `cancel` callback:
       ```ts
       const cancel = useCallback(() => {
           if (queueJob) cancelJob(queueJob.id);
       }, [queueJob, cancelJob]);
       ```
    8. Return the enriched object:
       ```ts
       return {
           generate,
           retry,
           cancel,
           isGenerating,
           canGenerate,
           isAuthenticated,
           generationMode,
           queuePosition,  // null if not in queue, number (1-indexed) if pending
           queueJob,       // the full job object for status inspection
       };
       ```
    9. Remove the import of `generationService` — it is no longer used in this hook

    AVOID: Keeping direct calls to `generationService.generate()` or `generationService.generateWhisk()` in the hook
    AVOID: Storing any generation state in component local state — it must all flow through node data or queue store
    NOTE: `retry` still works by clearing error state on the node and calling `generate()` again (which enqueues a fresh job)
  </action>
  <verify>
    npx tsc --noEmit
    # Hook should compile cleanly; no direct service imports remain
  </verify>
  <done>
    - `useGenerate` no longer imports or calls `generationService` directly
    - `generate()` calls `enqueue()` on the queue store
    - `isGenerating` correctly reflects pending OR running state
    - `queuePosition` is a 1-indexed number when pending, null otherwise
    - `cancel()` removes the job from the queue
    - PromptNode compiles and runs without changes (return shape is backward compatible)
  </done>
</task>

<task type="auto">
  <name>Update PromptNode to use cancel and queue position</name>
  <files>
    src/components/canvas/nodes/PromptNode.tsx
  </files>
  <action>
    Surface the new `cancel` and `queuePosition` values returned by `useGenerate` in the PromptNode UI.

    Steps:
    1. Destructure `cancel` and `queuePosition` from `useGenerate(id)`
    2. In `renderGenerateButton()`, when `isGenerating` is true, show either:
       - Queue position badge if `queuePosition !== null` (i.e., job is pending / waiting):
         ```tsx
         <button className="prompt-node__generate-btn prompt-node__generate-btn--loading nodrag"
                 onClick={cancel} type="button">
             <span className="prompt-node__queue-pos">#{queuePosition} in queue</span>
             <span className="prompt-node__cancel-hint">✕ Cancel</span>
         </button>
         ```
       - Spinner if the job is actively running (queuePosition is null, isGenerating is true):
         ```tsx
         <button className="prompt-node__generate-btn prompt-node__generate-btn--loading nodrag"
                 onClick={cancel} type="button">
             <span className="prompt-node__spinner" />
             Generating… ✕
         </button>
         ```
    3. Add CSS classes for the new states in `PromptNode.css`:
       - `.prompt-node__queue-pos` — smaller text, muted colour
       - `.prompt-node__cancel-hint` — small secondary label shown on hover

    AVOID: Making any changes to the core generation logic here — just surface existing hook values
    NOTE: The generate button becoming a cancel button when running is intentional UX
  </action>
  <verify>
    npx tsc --noEmit
    # No TypeScript errors in PromptNode.tsx
  </verify>
  <done>
    - PromptNode shows "#N in queue" when job is pending
    - PromptNode shows spinner + "Generating… ✕" when job is running
    - Clicking the button while in either state calls `cancel()`
  </done>
</task>

## Must-Haves
After all tasks complete, verify:
- [ ] `useGenerate` hook has zero direct imports of `generationService`
- [ ] Clicking Generate enqueues a job — PromptNode shows queue position immediately
- [ ] When job starts processing, PromptNode transitions from "#N in queue" to spinner
- [ ] When job completes, node data updates with images (driven by queue processor)
- [ ] Cancel removes the job and resets node to `idle` state
- [ ] TypeScript compilation passes (`npx tsc --noEmit`)

## Success Criteria
- [ ] All tasks verified passing
- [ ] Must-haves confirmed
- [ ] `npx tsc --noEmit` passes
