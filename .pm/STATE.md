# Image Workflow — Current State

**Last updated:** 2026-03-02T20:30:00+07:00

---

## Active Milestone

**v1.3 — AI Generation Engine** (`active`)

Integrate Google Labs APIs (ImageFX, Whisk, Flow) for text-to-image and image-based generation with queue management.

### Phase Status

| # | Phase | Status |
|---|-------|--------|
| 1 | API Integration | 📝 planning (3 plans, 2 waves) |
| 2 | Generate Node | ⬚ not_started |
| 3 | Image-Based Generation | ⬚ not_started |
| 4 | Generation Queue | ⬚ not_started |
| 5 | Generate Ingredient Node | ⬚ not_started |

### Current Position

Phase 1 (API Integration) has been decomposed into 3 plans:
- **Plan 1.1** (wave 1): Generation Types & Dependencies — install `@rohitaryal/imagefx-api` + `@rohitaryal/whisk-api`, create `src/types/generation.ts`
- **Plan 1.2** (wave 2): Electron IPC Bridge — main-process handlers + typed preload API
- **Plan 1.3** (wave 2): API Service & Auth Settings — renderer service, auth store, settings UI

---

## What Was Done (Last Session)

- Completed v2.0 Prompt Flow Engine milestone (all 3 phases).
- Activated v1.3 AI Generation Engine milestone.
- Researched Google Labs APIs (ImageFX, Whisk) — documented endpoints, auth flow, npm packages.
- Decomposed Phase 1 (API Integration) into 3 executable plans across 2 waves.

---

## Key Research Decisions

- **API packages:** Using unofficial `@rohitaryal/imagefx-api` and `@rohitaryal/whisk-api` npm packages (cookie-based auth)
- **Architecture:** API calls go through Electron main process (Node.js) via IPC bridge, not direct from renderer
- **Auth flow:** Google cookie → session token from `https://labs.google/fx/api/auth/session`
- **ImageFX endpoint:** `https://aisandbox-pa.googleapis.com/v1:runImageFx` (POST, returns base64 images)

---

## Next Steps

1. **Execute Phase 1 plans** — Start with Plan 1.1 (wave 1), then Plans 1.2 + 1.3 (wave 2)
2. **Plan Phase 2** (Generate Node) after Phase 1 is complete

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
│   └── ui/                    # Shared UI components
├── hooks/                     # Custom React hooks
├── services/                  # Service layer
├── stores/                    # Zustand stores
├── styles/                    # Design system tokens
├── types/                     # TypeScript type definitions
└── utils/                     # Utility functions
```
