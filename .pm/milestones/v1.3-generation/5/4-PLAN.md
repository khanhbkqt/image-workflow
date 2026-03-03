---
phase: 5
plan: 4
wave: 3
gap_closure: false
---

# Plan 5.4: PromptNode Flow UI & useGenerate Integration

## Objective
Add Flow/Nano Banana as a selectable generation provider in the PromptNode UI. Users can choose between ImageFX (text-to-image), Whisk (image-based), and Flow (Nano Banana text-to-image with optional reference images). The `useGenerate` hook and `generationQueueStore` are updated to route Flow requests to the correct IPC channel.

## Context
Load these files for context:
- `src/hooks/useGenerate.ts` (add Flow routing)
- `src/stores/generationQueueStore.ts` (process Flow jobs)
- `src/components/canvas/nodes/` (PromptNode UI)
- `src/types/generation.ts` (Flow types)
- `src/types/canvas.ts` (PromptNodeData — add Flow fields)
- `src/services/generationService.ts` (Flow service from Plan 5.3)

## Tasks

<task type="auto">
  <name>Update PromptNodeData and useGenerate to support Flow provider</name>
  <files>
    src/types/canvas.ts
    src/hooks/useGenerate.ts
    src/stores/generationQueueStore.ts
  </files>
  <action>
    Steps:
    1. **canvas.ts** — Add to `PromptNodeData`:
       - Update `generationMode` type to include `'flow'` (e.g., `'text' | 'whisk' | 'flow'`)
       - Add `flowModel?: 'NARWHAL'` field
       - Add `flowReferenceImages?: Array<{ assetId?: string; imageData: string }>` field for uploaded reference images
    2. **useGenerate.ts** — Add Flow routing:
       - In `canGenerate`, when mode is `'flow'`, require prompt (reference images are optional)
       - In `generate()`, build Flow-specific `GenerationRequest` with `provider: 'flow'`
       - If `flowReferenceImages` exist with `assetId`, include them as `flowImageInputs`
    3. **generationQueueStore.ts** — Update `processNext()`:
       - When `request.provider === 'flow'`, call `generationService.generateFlow(request)` instead of `generate()` / `generateWhisk()`
       - Handle the same `GenerationResult | { error }` response shape

    AVOID: Breaking existing text/whisk generation flows
    USE: Same queue mechanism — Flow jobs go through the same queue as ImageFX/Whisk
  </action>
  <verify>
    npx tsc --noEmit
  </verify>
  <done>
    - Flow provider builds valid requests
    - Queue processor routes Flow jobs correctly
    - Existing text and whisk generation still works
  </done>
</task>

<task type="auto">
  <name>Add Flow mode toggle and reference image upload to PromptNode UI</name>
  <files>
    src/components/canvas/nodes/PromptNode.tsx
    src/components/canvas/nodes/PromptNode.css
  </files>
  <action>
    Steps:
    1. Update the generation mode toggle to include 3 options: **Text** | **Image** | **Flow**
       - Text = ImageFX text-to-image (existing)
       - Image = Whisk image-based (existing)
       - Flow = Nano Banana with optional reference images (new)
    2. When mode is `'flow'`:
       - Show the text prompt input (same as text mode)
       - Show an optional "Reference Images" section below the prompt
       - Reference images: up to 3 drag/drop or paste image slots
       - Each reference image: small thumbnail with remove button
       - When a reference image is added, auto-upload via `generationService.flowUploadImage()` and store the returned `assetId`
       - Show upload progress indicator while uploading
    3. Style the Flow mode UI:
       - Use a subtle gradient or color accent to differentiate from text/whisk modes
       - Reference image slots: 64x64 thumbnails in a horizontal row
       - Upload spinner: small inline indicator
    4. The Generate button should work the same — it enqueues via `useGenerate`

    AVOID: Making the UI too complex — Flow mode should feel like a natural extension
    USE: Existing PromptNode styles and patterns, with minimal additions
  </action>
  <verify>
    npx tsc --noEmit
  </verify>
  <done>
    - Mode toggle shows Text / Image / Flow options
    - Flow mode shows prompt + optional reference images
    - Reference image upload triggers flowUploadImage and stores assetId
    - Generate button works in flow mode
    - UI is styled consistently with existing modes
  </done>
</task>

## Must-Haves
After all tasks complete, verify:
- [ ] Flow appears as a generation mode option in the PromptNode
- [ ] Text-to-image generation works via Flow (prompt only, no reference images)
- [ ] Reference image upload and generation works via Flow
- [ ] Existing text and whisk modes are unaffected
- [ ] No regressions in TypeScript compilation

## Success Criteria
- [ ] All tasks verified passing
- [ ] Must-haves confirmed
- [ ] `npx tsc --noEmit` passes cleanly
