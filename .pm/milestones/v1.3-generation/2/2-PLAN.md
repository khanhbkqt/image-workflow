---
phase: 2
plan: 2
wave: 2
gap_closure: false
---

# Plan 2.2: Generate UI Controls

## Objective
Add generation controls to the Prompt Node: model selector, aspect ratio picker, and a "Generate" button with loading state. This transforms the Prompt Node from a text-only input into an interactive generation trigger.

## Context
Load these files for context:
- src/components/canvas/nodes/PromptNode.tsx (current implementation — textarea only)
- src/components/canvas/nodes/PromptNode.css (current styles)
- src/hooks/useGenerate.ts (from Plan 2.1)
- src/types/canvas.ts (updated PromptNodeData from Plan 2.1)
- src/types/generation.ts (GenerationModel, AspectRatio enums)
- src/stores/authStore.ts (useAuthStore for auth check)
- src/styles/ (design system tokens)

## Tasks

<task type="auto">
  <name>Add generation controls to PromptNode</name>
  <files>
    src/components/canvas/nodes/PromptNode.tsx
  </files>
  <action>
    Extend the PromptNode component with generation UI:

    Steps:
    1. Import `useGenerate` hook and `useAuthStore`
    2. Add a controls section below the textarea:
       a. **Model selector** — compact dropdown/select with options:
          - "Imagen 3.5" (value: IMAGEN_3_5)
          - "Imagen 4" (value: IMAGEN_4)
       b. **Aspect ratio picker** — icon-based button group with options:
          - Square (1:1)
          - Portrait (3:4)
          - Landscape (4:3 / 16:9)
       c. Both selectors should update node data via `updateNodeData`
    3. Add a **Generate button** at the bottom:
       - Label: "✨ Generate" (or a sparkle icon)
       - Disabled when `canGenerate` is false
       - When generating: show a CSS spinner + "Generating…" text
       - When auth not configured: show "⚙️ Set up API" text that opens settings dialog
       - Use `nodrag` class on all interactive elements to prevent dragging
    4. Show error banner below controls when `generationStatus === 'error'`:
       - Red background with error message
       - "Retry" button that calls `retry()`

    AVOID: Making the node too wide — keep max-width at 300px, use compact controls
    USE: Native `<select>` for model dropdown, custom button group for aspect ratio
  </action>
  <verify>
    npm run dev
    # Open canvas, add a Prompt node
    # Verify model selector and aspect ratio picker render
    # Verify Generate button appears and is disabled (no auth)
    # Verify interactive elements don't trigger node drag
  </verify>
  <done>
    - Model selector dropdown renders with 2 options
    - Aspect ratio picker renders with icon buttons
    - Generate button shows correct state (disabled/loading/ready)
    - No node dragging when interacting with controls
  </done>
</task>

<task type="auto">
  <name>Style generation controls</name>
  <files>
    src/components/canvas/nodes/PromptNode.css
  </files>
  <action>
    Add CSS for the new generation controls section:

    Steps:
    1. `.prompt-node__controls` — flex row with gap, compact layout
    2. `.prompt-node__select` — styled select matching dark node theme:
       - Dark background, subtle border, light text
       - Small font (10-11px)
       - Compact padding
    3. `.prompt-node__aspect-group` — horizontal button group:
       - Icon buttons with aspect ratio visual indicators
       - Active state with accent color highlight
    4. `.prompt-node__generate-btn` — primary action button:
       - Gradient background using prompt accent color
       - Hover glow effect
       - Disabled state (dimmed, no cursor)
       - Loading state with CSS spinner animation
    5. `.prompt-node__error` — error banner:
       - Red-tinted background
       - Compact retry button
    6. `.prompt-node__spinner` — CSS-only loading spinner animation

    USE: CSS variables already defined (--prompt-accent, --prompt-glow)
    AVOID: Adding external icon libraries — use CSS shapes or emoji for aspect ratio icons
  </action>
  <verify>
    npm run dev
    # Visual inspection — controls should match the dark glassmorphism aesthetic of the node
  </verify>
  <done>
    - Controls are visually polished and compact
    - Generate button has gradient, hover glow, and loading spinner
    - Error banner is styled with red accent
    - All styles use existing CSS variables
  </done>
</task>

## Must-Haves
After all tasks complete, verify:
- [ ] Prompt node has model selector, aspect ratio picker, and generate button
- [ ] Generate button correctly reflects auth and generation state
- [ ] All interactive elements use `nodrag` class
- [ ] Visual design matches existing node aesthetic

## Success Criteria
- [ ] All tasks verified passing
- [ ] Must-haves confirmed
- [ ] No regressions in existing build or UI
- [ ] Controls are usable at the compact node size
