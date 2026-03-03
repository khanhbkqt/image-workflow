# Image Workflow — Current State

**Last updated:** 2026-03-03T10:45:00+07:00

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
| 5 | Flow API Integration (Nano Banana) | ✅ completed |
| 6 | Generate Ingredient Node | ⬚ not_started |

### Current Position

Phase 5 (Flow API Integration) is now complete. Phase 6 (Generate Ingredient Node) is the final remaining phase before milestone completion.

---

## What Was Done (Last Session)

- Completed Phase 5 (Flow API Integration — Nano Banana) — all 4 plans executed:
  - **Plan 5.1** (wave 1): Added Flow types to `generation.ts` (`'flow'` provider, `FlowModel`, `FlowImageInput`, `FlowGenerationRequest`, new IPC channels `generation:generate-flow` / `generation:flow-upload-image`); created hidden `FlowBrowserViewManager` in `electron/flow/flowBrowserView.ts` that intercepts OAuth2 Bearer tokens from aisandbox-pa.googleapis.com requests and generates reCAPTCHA Enterprise tokens.
  - **Plan 5.2** (wave 1): Created `electron/flow/flowApiClient.ts` with `uploadImage()` (POST to `/v1/flow/uploadImage` with unusual `text/plain;charset=UTF-8` content-type) and `generateImages()` (POST to `/v1/projects/${projectId}/flowMedia:batchGenerateImages` with NARWHAL model).
  - **Plan 5.3** (wave 2): Wired full IPC pipeline — `electron/main.ts` init/destroy `flowView`, `electron/ipc/generation.ts` registers two Flow handlers, `electron/preload.ts` exposes bridge methods, `src/types/electron.d.ts` typed, `src/services/generationService.ts` added `generateFlow()` and `flowUploadImage()`.
  - **Plan 5.4** (wave 3): PromptNode updated — mode toggle extended to Text/Image/Flow, Flow mode shows reference image upload section (paste/drag/click), auto-uploads via `flowUploadImage`, stores `assetId`, shows upload progress spinner and success checkmark; `useGenerate.ts` and `generationQueueStore.ts` route Flow jobs correctly.
- TypeScript compilation passes cleanly throughout all changes.

---

## Next Steps

1. **Plan & Execute Phase 6** (Generate Ingredient Node) — last phase of v1.3



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
