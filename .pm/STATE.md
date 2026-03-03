# Image Workflow — Current State

**Last updated:** 2026-03-03T10:30:00+07:00

---

## Active Milestone

**v1.3 — AI Generation Engine** (`active`)

Integrate Google Labs APIs (ImageFX, Whisk, Flow) for text-to-image and image-based generation with queue management.

### Phase Status

| # | Phase | Status |
|---|-------|--------|
| 1 | API Integration | ✅ completed |
| 2 | Generate Node | ✅ completed |
| 3 | Image-Based Generation | ✅ completed |
| 4 | Generation Queue | ✅ completed |
| 5 | Generate Ingredient Node | ⬚ not_started |

### Current Position

Phase 3 (Image-Based Generation) is now complete — all 3 plans across 2 waves executed and verified.

---

## What Was Done (Last Session)

- Fixed blocking bug 294a6aaa: Node connector handles not displaying
  - Root cause: `backdrop-filter: blur(14px)` on `.prompt-node` creates a stacking context
  - Fix: added `z-index: 0` and `position: relative` to `.base-node__content` in `BaseNode.css`
- Completed Phase 3 (Image-Based Generation) — confirming all 3 plans already implemented:
  - **Plan 3.1** (wave 1): Added `WhiskImageSlot`, `WhiskSlotType`, `WhiskGenerationRequest` types; added `generation:generate-whisk` IPC handler in `electron/ipc/generation.ts`
  - **Plan 3.2** (wave 1): Added `generateWhisk()` to `generationService.ts`; extended `preload.ts` and ElectronAPI typings
  - **Plan 3.3** (wave 2): PromptNode mode toggle (Text/Image), Whisk image slots (subject/scene/style), clipboard paste, clear button; `useGenerate` routes to Whisk based on `generationMode`
- TypeScript compilation passes cleanly throughout

---

## Next Steps

1. **Execute Phase 5** (Generate Ingredient Node) — not started


---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Desktop shell | Electron |
| Frontend | React + TypeScript + Vite |
| Canvas | React Flow |
| State | Zustand |
| Persistence | Local filesystem (JSON + localStorage) |
| AI Backend | Google Labs APIs (ImageFX, Whisk) via unofficial npm packages |

## Source Structure

```
src/
├── App.tsx                    # Main application
├── components/
│   ├── canvas/                # Canvas + React Flow nodes
│   ├── dashboard/             # Project dashboard
│   ├── ingredients/           # Ingredient CRUD & library
│   ├── recipes/               # Recipe management
│   ├── settings/              # API settings dialog
│   └── ui/                    # Shared UI components
├── hooks/                     # Custom React hooks
├── services/                  # Service layer (storage, generation)
├── stores/                    # Zustand stores (canvas, project, auth, generationQueue)
├── styles/                    # Design system tokens
├── types/                     # TypeScript type definitions
└── utils/                     # Utility functions
```
