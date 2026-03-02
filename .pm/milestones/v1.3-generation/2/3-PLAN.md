---
phase: 2
plan: 3
wave: 2
gap_closure: false
---

# Plan 2.3: Image Results & Output Wiring

## Objective
Display generated images as a thumbnail grid inside the Prompt Node, allow selecting an image, and wire the selected image to the node's `image_out` port so downstream Prompt nodes or other consumers can access it.

## Context
Load these files for context:
- src/components/canvas/nodes/PromptNode.tsx (updated from Plan 2.2)
- src/components/canvas/nodes/PromptNode.css (updated from Plan 2.2)
- src/types/canvas.ts (updated PromptNodeData from Plan 2.1)
- src/types/generation.ts (GeneratedImage type — has encodedImage, seed, mediaGenerationId)
- src/stores/canvasStore.ts (updateNodeData for selecting image)
- src/components/canvas/nodes/BaseNode.tsx (handle/port pattern)

## Tasks

<task type="auto">
  <name>Add image results grid to PromptNode</name>
  <files>
    src/components/canvas/nodes/PromptNode.tsx
    src/components/canvas/nodes/PromptNode.css
  </files>
  <action>
    Display generated images inline within the Prompt Node:

    Steps:
    1. After the controls section, add a `.prompt-node__results` container:
       - Only visible when `generatedImages` is non-empty
       - 2×2 thumbnail grid layout (for default 4 images)
       - Each thumbnail is an `<img>` with `src="data:image/png;base64,{encodedImage}"`
    2. Each thumbnail should:
       - Show a selection ring when it's the `selectedImageIndex`
       - On click: update `selectedImageIndex` via `updateNodeData`
       - On hover: show a tooltip with seed number and model
       - Have a subtle scale-up animation on hover
    3. Add a `.prompt-node__results-header` showing "4 images generated" count
    4. Add CSS for the grid:
       - `.prompt-node__results-grid` — 2-column grid, small gap
       - `.prompt-node__thumbnail` — square aspect ratio, rounded corners, object-fit: cover
       - `.prompt-node__thumbnail--selected` — blue accent ring
       - Smooth fade-in animation when images load
    5. The node should expand vertically to fit the image grid (no fixed height)

    AVOID: Loading all 4 base64 images at full resolution — use CSS to constrain thumbnail size
    USE: `nodrag nowheel` classes on the results container to prevent canvas interaction
  </action>
  <verify>
    npm run dev
    # In Electron: authenticate, write a prompt, click Generate
    # Verify 4 thumbnails appear in a 2×2 grid
    # Click a thumbnail → selection ring appears
    # Hover thumbnail → tooltip shows seed
  </verify>
  <done>
    - Generated images display as 2×2 thumbnail grid
    - Clicking a thumbnail selects it (visual ring)
    - Tooltips show generation metadata
    - Node expands to fit images without overflow
  </done>
</task>

<task type="auto">
  <name>Wire selected image to output port</name>
  <files>
    src/components/canvas/nodes/PromptNode.tsx
  </files>
  <action>
    Ensure the selected generated image is accessible to downstream nodes via the image_out port:

    Steps:
    1. When `selectedImageIndex` changes, also update node data with:
       - `outputImage: generatedImages[selectedImageIndex].encodedImage` — the base64 image data
       - `outputSeed: generatedImages[selectedImageIndex].seed` — for reference
    2. Downstream Prompt nodes that consume `image_in` should be able to read the upstream node's `outputImage` from the connected edge
    3. Add `outputImage` and `outputSeed` fields to `PromptNodeData` in canvas.ts
    4. On generation success, automatically set `selectedImageIndex: 0` and populate `outputImage` with the first result

    Note: The actual consumption of upstream images by downstream nodes will be handled in Phase 3 (Image-Based Generation). For now, just make the data available on the node.

    AVOID: Passing base64 data through React Flow edges — store on node data, let consumers look up connected source node data
    USE: `updateNodeData` to set outputImage when selection changes
  </action>
  <verify>
    npx tsc --noEmit
    # Verify types compile
    # In dev: Generate images, select different thumbnails
    # Inspect node data in React DevTools — outputImage should update
  </verify>
  <done>
    - Selected image's base64 data is stored as `outputImage` on node data
    - Changing selection updates `outputImage`
    - TypeScript compiles without errors
    - Data is ready for downstream consumption in Phase 3
  </done>
</task>

## Must-Haves
After all tasks complete, verify:
- [ ] Generated images display as thumbnails in the node
- [ ] Clicking a thumbnail selects it visually and updates outputImage
- [ ] Node expands to fit content without breaking layout
- [ ] Output port data is set correctly for downstream nodes

## Success Criteria
- [ ] All tasks verified passing
- [ ] Must-haves confirmed
- [ ] No regressions in existing build or UI
- [ ] End-to-end flow works: type prompt → generate → see images → select one
