# Image Workflow — Current State

**Last updated:** 2026-03-03T10:25:00+07:00

---

## Active Milestone

**v1.3 — AI Generation Engine** (`active`)

Integrate Google Labs APIs (ImageFX, Whisk, Flow) for text-to-image and image-based generation with queue management.

### Phase Status

| # | Phase | Status |
|---|-------|--------|
| 1 | API Integration | ✅ completed |
| 2 | Generate Node | ✅ completed |
| 3 | Image-Based Generation | 🔄 planning |
| 4 | Generation Queue | ✅ completed |
| 5 | Generate Ingredient Node | ⬚ not_started |

### Current Position

Phase 4 (Generation Queue) is complete — all 4 plans across 3 waves executed and verified.

---

## What Was Done (Last Session)

- Completed Phase 4 (Generation Queue) with 4 plans:
  - **Plan 4.1** (wave 1): Added `QueueJob`, `QueueJobStatus`, `GenerationQueueState` types to `generation.ts`; created `generationQueueStore.ts` with full CRUD
  - **Plan 4.2** (wave 2): Implemented async `processNext()` in queue store — mutex guarded, 2× retry on retryable errors, writes results back to canvasStore
  - **Plan 4.3** (wave 2): Refactored `useGenerate` to enqueue jobs via queue store; added `queuePosition`, `cancel()`, and updated `PromptNode` UI
  - **Plan 4.4** (wave 3): Created `QueueBadge` floating component; mounted in `Canvas.tsx` — shows active/pending count with spinner and a clear button
- TypeScript compilation passes cleanly throughout

---

## Next Steps

1. **Execute Phase 3** (Image-Based Generation) — plans still in `planning` status, need execution
2. **Execute Phase 5** (Generate Ingredient Node) — not started

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
