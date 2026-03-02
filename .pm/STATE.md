# Image Workflow — Current State

**Last updated:** 2026-03-02T20:45:00+07:00

---

## Active Milestone

**v1.3 — AI Generation Engine** (`active`)

Integrate Google Labs APIs (ImageFX, Whisk, Flow) for text-to-image and image-based generation with queue management.

### Phase Status

| # | Phase | Status |
|---|-------|--------|
| 1 | API Integration | ✅ completed |
| 2 | Generate Node | ⬚ not_started |
| 3 | Image-Based Generation | ⬚ not_started |
| 4 | Generation Queue | ⬚ not_started |
| 5 | Generate Ingredient Node | ⬚ not_started |

### Current Position

Phase 1 (API Integration) is complete — all 3 plans across 2 waves executed and verified.

---

## What Was Done (Last Session)

- Completed Phase 1 (API Integration) with 3 plans:
  - **Plan 1.1** (wave 1): Installed `@rohitaryal/imagefx-api` + `@rohitaryal/whisk-api`, created `src/types/generation.ts`
  - **Plan 1.2** (wave 2): Created `electron/ipc/generation.ts` with IPC handlers, extended preload with typed generation API
  - **Plan 1.3** (wave 2): Created `generationService.ts`, `authStore.ts`, `SettingsDialog` with gear icon in header
- Both TypeScript compilations pass cleanly (renderer + electron)

---

## Next Steps

1. **Plan Phase 2** (Generate Node) — decompose into executable plans
2. **Execute Phase 2** — build the text-to-image node on canvas

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
