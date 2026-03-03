---
phase: 4
plan: 4
wave: 3
gap_closure: false
---

# Plan 4.4: Progress UI & Queue Panel

## Objective
Add visible queue progress to the canvas: a floating badge in the toolbar shows how many jobs are active/pending, and the Canvas toolbar gets a queue panel that can clear completed jobs. This gives users at-a-glance visibility of multi-node batch generation in progress.

## Context
Load these files for context:
- `src/stores/generationQueueStore.ts` — `jobs`, `activeJobId`, `clearCompleted`, `pendingCount()`
- `src/components/canvas/Canvas.tsx` — where the toolbar/overlay lives
- `src/components/canvas/nodes/PromptNode.tsx` — queue position already shown after Plan 4.3
- `src/styles/` — existing design tokens for colours and spacing

## Tasks

<task type="auto">
  <name>Create QueueBadge component</name>
  <files>
    src/components/canvas/QueueBadge.tsx [NEW]
    src/components/canvas/QueueBadge.css [NEW]
  </files>
  <action>
    Build a floating badge that overlays the canvas and shows queue activity.

    Steps:
    1. Create `src/components/canvas/QueueBadge.tsx`:
       ```tsx
       import { useGenerationQueueStore } from '../../stores/generationQueueStore';
       import './QueueBadge.css';

       export function QueueBadge() {
           const jobs = useGenerationQueueStore((s) => s.jobs);
           const clearCompleted = useGenerationQueueStore((s) => s.clearCompleted);

           const running = jobs.filter((j) => j.status === 'running').length;
           const pending = jobs.filter((j) => j.status === 'pending').length;
           const done = jobs.filter((j) => j.status === 'done' || j.status === 'error').length;
           const total = running + pending;

           if (jobs.length === 0) return null;

           return (
               <div className={`queue-badge ${total > 0 ? 'queue-badge--active' : ''}`}>
                   <div className="queue-badge__summary">
                       {total > 0 ? (
                           <>
                               <span className="queue-badge__spinner" />
                               <span className="queue-badge__label">
                                   {running > 0 ? `Generating ${running}` : ''}
                                   {running > 0 && pending > 0 ? ', ' : ''}
                                   {pending > 0 ? `${pending} waiting` : ''}
                               </span>
                           </>
                       ) : (
                           <span className="queue-badge__label queue-badge__label--done">
                               ✓ {done} done
                           </span>
                       )}
                   </div>
                   {done > 0 && (
                       <button
                           className="queue-badge__clear nodrag"
                           onClick={clearCompleted}
                           title="Clear completed jobs"
                           type="button"
                       >
                           ✕ Clear
                       </button>
                   )}
               </div>
           );
       }
       ```
    2. Create `src/components/canvas/QueueBadge.css`:
       ```css
       .queue-badge {
           position: absolute;
           bottom: 16px;
           left: 50%;
           transform: translateX(-50%);
           z-index: 10;
           display: flex;
           align-items: center;
           gap: 8px;
           padding: 6px 14px;
           background: var(--color-surface-overlay, rgba(30, 30, 40, 0.92));
           border: 1px solid var(--color-border-subtle, rgba(255,255,255,0.1));
           border-radius: 20px;
           backdrop-filter: blur(8px);
           box-shadow: 0 4px 16px rgba(0,0,0,0.3);
           font-size: 12px;
           color: var(--color-text-secondary, #aaa);
           pointer-events: auto;
           transition: opacity 0.2s ease;
       }
       .queue-badge--active {
           color: var(--color-text-primary, #eee);
           border-color: var(--color-accent, #7c6af7);
       }
       .queue-badge__summary {
           display: flex;
           align-items: center;
           gap: 6px;
       }
       .queue-badge__spinner {
           display: inline-block;
           width: 10px;
           height: 10px;
           border: 2px solid rgba(124, 106, 247, 0.3);
           border-top-color: #7c6af7;
           border-radius: 50%;
           animation: queue-spin 0.8s linear infinite;
       }
       @keyframes queue-spin {
           to { transform: rotate(360deg); }
       }
       .queue-badge__label--done {
           color: var(--color-success, #4caf82);
       }
       .queue-badge__clear {
           background: none;
           border: none;
           cursor: pointer;
           color: var(--color-text-muted, #666);
           font-size: 11px;
           padding: 2px 4px;
           border-radius: 4px;
           transition: color 0.15s ease;
       }
       .queue-badge__clear:hover {
           color: var(--color-text-secondary, #aaa);
       }
       ```

    AVOID: Making the badge block pointer events on the canvas — use `pointer-events: none` on the parent wrapper and `pointer-events: auto` only on the badge itself.
  </action>
  <verify>
    npx tsc --noEmit
    # QueueBadge should compile
  </verify>
  <done>
    - `QueueBadge` component exists and shows active/pending count with spinner
    - Shows "✓ N done" and a clear button when queue is empty of active jobs
    - Returns null when the jobs array is empty (no badge shown)
  </done>
</task>

<task type="auto">
  <name>Mount QueueBadge in Canvas</name>
  <files>
    src/components/canvas/Canvas.tsx
  </files>
  <action>
    Add the `QueueBadge` to the canvas overlay layer so it floats over the React Flow canvas.

    Steps:
    1. Import `QueueBadge` from `./QueueBadge`
    2. Find the React Flow `<ReactFlow>` wrapper in `Canvas.tsx`
    3. Add the badge inside the same container as the React Flow canvas, ensuring it's absolutely positioned:
       ```tsx
       <div style={{ position: 'relative', width: '100%', height: '100%' }}>
           <ReactFlow ...>
               {/* existing panels */}
           </ReactFlow>
           <QueueBadge />
       </div>
       ```
       If this wrapper already exists, just add `<QueueBadge />` as a sibling to `<ReactFlow>`.
       Make sure the parent has `position: relative` so the badge's `position: absolute` works correctly.

    AVOID: Putting QueueBadge inside `<ReactFlow>` as a child panel — it should be outside the zoom/pan coordinate space.
  </action>
  <verify>
    npx tsc --noEmit
    # Canvas.tsx compiles cleanly
  </verify>
  <done>
    - `<QueueBadge />` is mounted in `Canvas.tsx`
    - Badge appears visually centered at the bottom of the canvas when jobs exist
    - Badge does not interfere with canvas pan/zoom interactions
  </done>
</task>

## Must-Haves
After all tasks complete, verify:
- [ ] `QueueBadge` shows nothing when no jobs exist
- [ ] Active/pending count updates reactively as nodes enqueue/complete jobs
- [ ] Spinner animates while generation is running
- [ ] "Clear" button calls `clearCompleted()` and removes done/error jobs from the badge
- [ ] Badge disappears after clearing when no jobs remain
- [ ] TypeScript compilation passes

## Success Criteria
- [ ] All tasks verified passing
- [ ] Must-haves confirmed
- [ ] `npx tsc --noEmit` passes
- [ ] Visual smoke test: enqueue 2+ nodes, watch badge count down to 0
