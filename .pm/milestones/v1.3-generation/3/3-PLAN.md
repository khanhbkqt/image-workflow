---
phase: 3
plan: 3
wave: 2
gap_closure: false
---

# Plan 3.3: PromptNode Whisk UI & Hook

## Objective
Add image-based generation UI to the PromptNode: a generation mode toggle (text-to-image vs image-based), image input drop zones for subject/scene/style, and update the `useGenerate` hook to route Whisk requests via `generationService.generateWhisk()`.

## Context
Load these files for context:
- src/components/canvas/nodes/PromptNode.tsx (current text-to-image UI)
- src/components/canvas/nodes/PromptNode.css (styling)
- src/hooks/useGenerate.ts (generation lifecycle hook)
- src/types/canvas.ts (PromptNodeData)
- src/types/generation.ts (WhiskImageSlot, WhiskSlotType)
- src/services/generationService.ts (generateWhisk() from Plan 3.2)

## Tasks

<task type="auto">
  <name>Extend PromptNodeData with Whisk fields</name>
  <files>
    src/types/canvas.ts
  </files>
  <action>
    Add fields to `PromptNodeData` for Whisk generation mode:

    Steps:
    1. Import `WhiskImageSlot` from `./generation`
    2. Add optional fields to `PromptNodeData`:
       - `generationMode?: 'text' | 'whisk'` — which generation mode (default: 'text')
       - `whiskSlots?: WhiskImageSlot[]` — array of image inputs for subject/scene/style

    AVOID: Making fields required — backward compatibility with saved canvases
  </action>
  <verify>
    npx tsc --noEmit
  </verify>
  <done>
    - PromptNodeData supports `generationMode` and `whiskSlots`
  </done>
</task>

<task type="auto">
  <name>Update useGenerate hook for Whisk routing</name>
  <files>
    src/hooks/useGenerate.ts
  </files>
  <action>
    Extend the generate function to route between ImageFX and Whisk:

    Steps:
    1. Import `generationService` (it's already imported)
    2. Read `generationMode` and `whiskSlots` from node data
    3. Update `canGenerate` logic:
       - For 'text' mode: existing check (prompt required)
       - For 'whisk' mode: at least one whisk slot must have imageData AND prompt must be non-empty
    4. In the `generate()` callback:
       - If `generationMode === 'whisk'` AND whiskSlots exist:
         - Call `generationService.generateWhisk({ prompt, imageSlots: whiskSlots, aspectRatio, seed })`
         - Handle result the same way (set generatedImages, outputImage, etc.)
         - Note: Whisk returns 1 image (vs ImageFX's 4)
       - Else: use existing ImageFX path (no change)
    5. Return additional state: `generationMode` for UI to read

    AVOID: Breaking the existing text-to-image flow
  </action>
  <verify>
    npx tsc --noEmit
  </verify>
  <done>
    - useGenerate routes to Whisk when generationMode is 'whisk'
    - canGenerate correctly validates whisk slots
    - Both text-to-image and Whisk paths work
  </done>
</task>

<task type="auto">
  <name>Add generation mode toggle and image slots to PromptNode UI</name>
  <files>
    src/components/canvas/nodes/PromptNode.tsx
    src/components/canvas/nodes/PromptNode.css
  </files>
  <action>
    Add UI controls for switching between text-to-image and image-based generation:

    Steps:
    1. Add a mode toggle above the textarea — two tab-like buttons:
       - "✏️ Text" (text-to-image via ImageFX)
       - "🖼️ Image" (image-based via Whisk)
       - Styled as segmented control / pill toggle
    2. When in "Image" mode, show image input slots below the textarea:
       - Three collapsible sections: Subject, Scene, Style
       - Each slot shows:
         - A small thumbnail if an image is attached (from connected ingredient or pasted)
         - A drop target label "Drop image or paste" when empty
         - A clear button (×) to remove the image
    3. Wire image data from connected input nodes:
       - Read connected edges to find ingredient nodes with `outputImage`/`imageUrl`
       - Auto-populate the first available empty slot
       - OR: provide explicit per-slot connection logic
    4. For simpler initial implementation:
       - Allow paste (clipboard) into each slot
       - Store as base64 in `whiskSlots` via `updateNodeData`
    5. Update CSS:
       - `.prompt-node__mode-toggle` — segmented control styling
       - `.prompt-node__image-slots` — grid/stack of slot cards
       - `.prompt-node__slot` — individual slot with border, bg, thumbnail area
       - `.prompt-node__slot--filled` — has image attached
       - `.prompt-node__slot-clear` — clear button
    6. When mode is 'whisk', hide the model selector (Whisk uses its own model)
       Keep aspect ratio selector visible.

    AVOID: Overcomplicating the first version — clipboard paste is sufficient for MVP
    NOTE: The aspect ratio selector should work for both modes
  </action>
  <verify>
    npx tsc --noEmit
    # Visual smoke test: open canvas, add prompt node, toggle to Image mode, verify slots appear
  </verify>
  <done>
    - Mode toggle switches between Text and Image generation
    - Image slots for subject/scene/style are visible in Image mode
    - Paste images into slots works
    - Clear button removes slot images
    - Generate button works for both modes
  </done>
</task>

## Must-Haves
After all tasks complete, verify:
- [ ] PromptNodeData has `generationMode` and `whiskSlots` fields
- [ ] useGenerate hook routes correctly based on mode
- [ ] Mode toggle UI is functional and styled
- [ ] Image slots accept clipboard paste
- [ ] Generate works in both text and image modes
- [ ] No regressions in text-to-image workflow
- [ ] `npx tsc --noEmit` passes

## Success Criteria
- [ ] All tasks verified passing
- [ ] Must-haves confirmed
- [ ] Visual smoke test passes — mode toggle and image slots render correctly
- [ ] `npx tsc --noEmit` passes for both renderer and electron
