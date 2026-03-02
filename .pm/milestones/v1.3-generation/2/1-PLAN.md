---
phase: 2
plan: 1
wave: 1
gap_closure: false
---

# Plan 2.1: Generation Types & State

## Objective
Extend the data model to support generation state on Prompt nodes and create a reusable `useGenerate()` hook that manages the full generate lifecycle (request → loading → success/error). This is the foundation that Plan 2.2 and 2.3 build upon.

## Context
Load these files for context:
- src/types/canvas.ts (PromptNodeData — needs generation fields)
- src/types/generation.ts (GenerationRequest, GenerationResult, GenerationStatus)
- src/services/generationService.ts (generate() wrapper)
- src/stores/canvasStore.ts (updateNodeData pattern)
- src/stores/authStore.ts (auth state check)

## Tasks

<task type="auto">
  <name>Extend PromptNodeData with generation fields</name>
  <files>
    src/types/canvas.ts
  </files>
  <action>
    Add generation-related fields to the `PromptNodeData` interface:

    Steps:
    1. Import `GenerationModel`, `AspectRatio`, `GenerationStatus`, `GeneratedImage`, `GenerationError` from `../types/generation`
    2. Add the following optional fields to `PromptNodeData`:
       - `generationStatus?: GenerationStatus` — idle | generating | success | error
       - `generatedImages?: GeneratedImage[]` — array of results from the last generation
       - `selectedImageIndex?: number` — which generated image is "active" for the output port
       - `generationError?: GenerationError` — structured error from last failed generation
       - `model?: GenerationModel` — selected model (default: IMAGEN_3_5)
       - `aspectRatio?: AspectRatio` — selected aspect ratio (default: SQUARE)
       - `seed?: number` — optional seed for reproducibility

    AVOID: Making any fields required — this would break existing saved canvases
    USE: Optional fields with sensible defaults in the component
  </action>
  <verify>
    npx tsc --noEmit
    # Should compile without errors, existing PromptNode still works
  </verify>
  <done>
    - `PromptNodeData` has all generation state fields
    - Existing canvas data is backward-compatible (all new fields optional)
  </done>
</task>

<task type="auto">
  <name>Create useGenerate() hook</name>
  <files>
    src/hooks/useGenerate.ts [NEW]
  </files>
  <action>
    Create a custom React hook that encapsulates the full generation lifecycle:

    Steps:
    1. Create `src/hooks/useGenerate.ts`
    2. The hook takes a `nodeId: string` parameter
    3. Reads current node data from `useCanvasStore` to get prompt, model, aspectRatio
    4. Checks auth status from `useAuthStore`
    5. Exposes:
       - `generate(): Promise<void>` — triggers generation:
         a. Sets `generationStatus: 'generating'` via `updateNodeData`
         b. Calls `generationService.generate({ prompt, model, aspectRatio, provider: 'imagefx' })`
         c. On success: sets `generationStatus: 'success'`, `generatedImages: result.images`, `selectedImageIndex: 0`
         d. On error: sets `generationStatus: 'error'`, `generationError: error`
       - `isGenerating: boolean` — derived from node data
       - `canGenerate: boolean` — true when prompt is non-empty AND auth is valid AND not currently generating
       - `retry(): void` — clears error state and re-triggers generate
    6. Use `useCallback` for memoized functions

    AVOID: Storing generation state outside of node data — it must persist with the canvas
    USE: `updateNodeData` to mutate node data so it auto-saves via the existing debounced autosave
  </action>
  <verify>
    npx tsc --noEmit
    # Hook should compile cleanly with proper types
  </verify>
  <done>
    - `useGenerate(nodeId)` hook exists and compiles
    - Generation lifecycle is fully managed through node data
    - Auth check prevents generation when not authenticated
  </done>
</task>

## Must-Haves
After all tasks complete, verify:
- [ ] `PromptNodeData` includes all generation state fields
- [ ] `useGenerate()` hook compiles and exports correctly
- [ ] Existing canvas data loads without errors (backward compatibility)
- [ ] No regressions in TypeScript compilation

## Success Criteria
- [ ] All tasks verified passing
- [ ] Must-haves confirmed
- [ ] `npx tsc --noEmit` passes for both renderer and electron
