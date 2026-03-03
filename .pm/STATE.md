# Image Workflow — Current State

**Last updated:** 2026-03-03T07:50:00+07:00

---

## Active Milestone

**v1.3 — AI Generation Engine** (`active`)

Integrate Google Labs APIs (ImageFX, Whisk, Flow) for text-to-image and image-based generation with queue management.

### Phase Status

| # | Phase | Status |
|---|-------|--------|
| 1 | API Integration | ✅ completed |
| 2 | Generate Node | ✅ completed |
| 3 | Image-Based Generation | ⬚ not_started |
| 4 | Generation Queue | ⬚ not_started |
| 5 | Generate Ingredient Node | ⬚ not_started |

### Current Position

Phase 2 (Generate Node) is complete — all 3 plans across 2 waves executed and verified.

---

## What Was Done (Last Session)

- Completed Phase 2 (Generate Node) with 3 plans:
  - **Plan 2.1** (wave 1): Extended `PromptNodeData` with generation state fields, created `useGenerate()` hook
  - **Plan 2.2** (wave 2): Added model selector, aspect ratio picker, generate button with loading/error states to PromptNode
  - **Plan 2.3** (wave 2): Added image results grid with thumbnail selection, output wiring (`outputImage`/`outputSeed`)
- TypeScript compilation passes cleanly
- Visual smoke test verified in browser

---

## Next Steps

1. **Plan Phase 3** (Image-Based Generation) — decompose into executable plans
2. **Execute Phase 3** — integrate Whisk for subject/scene/style image inputs

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
├── stores/                    # Zustand stores (canvas, project, auth)
├── styles/                    # Design system tokens
├── types/                     # TypeScript type definitions
└── utils/                     # Utility functions
```
