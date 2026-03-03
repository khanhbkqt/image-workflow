---
phase: 5
plan: 3
wave: 2
gap_closure: false
---

# Plan 5.3: Flow IPC Handlers + Preload Bridge + Renderer Service

## Objective
Wire the Flow API through the existing Electron IPC architecture: register IPC handlers in the main process, expose them via the preload bridge, add renderer-side service functions, and update TypeScript declarations. Follows the exact same pattern as existing ImageFX and Whisk integrations.

## Context
Load these files for context:
- `electron/ipc/generation.ts` (add Flow handlers here)
- `electron/preload.ts` (add Flow bridge methods)
- `src/services/generationService.ts` (add Flow service functions)
- `src/types/electron.d.ts` (extend ElectronAPI interface)
- `src/types/generation.ts` (Flow types from Plan 5.1)
- `electron/flow/flowBrowserView.ts` (Plan 5.1 — token provider)
- `electron/flow/flowApiClient.ts` (Plan 5.2 — API client)
- `electron/main.ts` (init BrowserView on app ready)

## Tasks

<task type="auto">
  <name>Initialize FlowBrowserView in Electron main process</name>
  <files>
    electron/main.ts
  </files>
  <action>
    Steps:
    1. Import `flowView` from `./flow/flowBrowserView`
    2. After `createWindow()`, call `flowView.init(win)` to attach the hidden BrowserView
    3. In the `window-all-closed` handler, call `flowView.destroy()`

    AVOID: Blocking app startup — init can be async/fire-and-forget
    USE: The existing pattern of registering handlers before creating the window
  </action>
  <verify>
    npx tsc --noEmit
  </verify>
  <done>
    - BrowserView initializes when app starts
    - BrowserView destroys when app quits
    - No startup delays
  </done>
</task>

<task type="auto">
  <name>Register Flow IPC handlers</name>
  <files>
    electron/ipc/generation.ts
  </files>
  <action>
    Add two new IPC handlers following the existing pattern:

    Steps:
    1. Import `flowView` and `flowApiClient` from the flow modules
    2. Add `generation:flow-upload-image` handler:
       - Accepts `{ imageBase64: string; mimeType: string; fileName: string }`
       - Gets Bearer token from `flowView.getBearerToken()`
       - Gets projectId from `flowApiClient.getProjectId()`
       - Calls `flowApiClient.uploadImage()` → returns the asset UUID
    3. Add `generation:generate-flow` handler:
       - Accepts `{ prompt: string; model?: string; aspectRatio?: string; seed?: number; imageInputs?: Array<{ imageInputType: string; name: string }> }`
       - Gets Bearer token from `flowView.getBearerToken()`
       - Gets reCAPTCHA token from `flowView.getRecaptchaToken('batchGenerateImages')`
       - Gets projectId from `flowApiClient.getProjectId()`
       - Calls `flowApiClient.generateImages()` → returns `GenerationResult`-shaped object
       - Maps response to match existing `{ images, prompt, model, requestId }` shape
    4. Auth errors from Flow should return `{ error: { code: 'FLOW_AUTH_REQUIRED', message, retryable: false } }`

    AVOID: Duplicating error handling — follow the exact same pattern as existing handlers
    USE: The same return shape as `generation:generate` for consistent consumption
  </action>
  <verify>
    npx tsc --noEmit
  </verify>
  <done>
    - `generation:generate-flow` IPC handler registered
    - `generation:flow-upload-image` IPC handler registered
    - Response shape matches existing generation handlers
  </done>
</task>

<task type="auto">
  <name>Extend preload bridge, renderer service, and type declarations</name>
  <files>
    electron/preload.ts
    src/services/generationService.ts
    src/types/electron.d.ts
  </files>
  <action>
    Steps:
    1. **preload.ts** — Add two new methods to the `electronAPI` object:
       - `generateFlow: (request) => ipcRenderer.invoke('generation:generate-flow', request)`
       - `flowUploadImage: (params) => ipcRenderer.invoke('generation:flow-upload-image', params)`
    2. **electron.d.ts** — Extend `ElectronAPI` interface with matching type signatures:
       - `generateFlow: (request: { prompt: string; model?: string; aspectRatio?: string; seed?: number; imageInputs?: FlowImageInput[] }) => Promise<GenerationResult | { error: GenerationError }>`
       - `flowUploadImage: (params: { imageBase64: string; mimeType: string; fileName: string }) => Promise<{ assetId: string } | { error: GenerationError }>`
    3. **generationService.ts** — Add two new functions:
       - `generateFlow(request)` — calls `window.electronAPI.generateFlow(request)`
       - `flowUploadImage(params)` — calls `window.electronAPI.flowUploadImage(params)`
       - Add to the exported `generationService` object
       - Follow the same isElectron() guard pattern

    AVOID: Breaking existing API surface — only add new functions
    USE: Same error handling pattern as existing `generate()` and `generateWhisk()`
  </action>
  <verify>
    npx tsc --noEmit
  </verify>
  <done>
    - Preload exposes `generateFlow` and `flowUploadImage`
    - ElectronAPI types include Flow methods
    - Renderer service has Flow functions with isElectron() guards
    - TypeScript compiles cleanly end-to-end
  </done>
</task>

## Must-Haves
After all tasks complete, verify:
- [ ] Full IPC pipeline: main → preload → renderer for Flow generation
- [ ] Full IPC pipeline: main → preload → renderer for Flow image upload
- [ ] BrowserView initializes on app start
- [ ] Response shapes are consistent with existing generation handlers
- [ ] No regressions in TypeScript compilation

## Success Criteria
- [ ] All tasks verified passing
- [ ] Must-haves confirmed
- [ ] `npx tsc --noEmit` passes cleanly
