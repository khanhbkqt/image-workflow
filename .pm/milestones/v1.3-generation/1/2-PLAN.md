---
phase: 1
plan: 2
wave: 2
gap_closure: false
---

# Plan 1.2: Electron IPC Bridge

## Objective
Create the Electron main-process handlers that wrap the ImageFX and Whisk API libraries, and extend the preload script to expose typed IPC methods to the renderer. Since the API libraries use Node.js APIs (fs, fetch with cookies), all API calls must go through the main process.

## Context
Load these files for context:
- electron/main.ts (Electron main process — currently minimal)
- electron/preload.ts (preload script — has generic send/on)
- src/types/generation.ts (types from Plan 1.1)
- node_modules/@rohitaryal/imagefx-api (API source for reference)

## Tasks

<task type="auto">
  <name>Create generation IPC handlers in main process</name>
  <files>
    electron/ipc/generation.ts [NEW]
    electron/main.ts
  </files>
  <action>
    Create a dedicated IPC handler module for generation and wire it into main.ts:

    Steps:
    1. Create `electron/ipc/generation.ts` with:
       - Import `ImageFX` from `@rohitaryal/imagefx-api`
       - `let imagefxClient: ImageFX | null = null` (lazy-initialized)
       - Handler: `generation:auth-validate` — Takes cookie string, creates ImageFX instance, calls `refreshSession()`, returns `AuthState` with user info or error
       - Handler: `generation:generate` — Takes `GenerationRequest`, validates client exists, calls `generateImage(prompt)`, returns `GenerationResult` with base64 images
       - Handler: `generation:auth-status` — Returns current auth state (configured/unconfigured)
       - Use `ipcMain.handle()` for request/response pattern (not send/on)
       - Wrap all handlers in try/catch, return structured error objects
    2. Create `electron/ipc/index.ts` that calls `registerGenerationHandlers()`
    3. Update `electron/main.ts` to import and call `registerIpcHandlers()` in `app.whenReady()`

    AVOID: Using `ipcMain.on` — use `ipcMain.handle` for promise-based request/response
    AVOID: Storing cookies in plain text files — keep in memory for now, persistent storage in a later phase
    USE: Lazy initialization of the ImageFX client so auth can be updated at runtime
  </action>
  <verify>
    npx tsc -p tsconfig.electron.json --noEmit
    # Should compile the electron code without errors
  </verify>
  <done>
    - `electron/ipc/generation.ts` exists with all IPC handlers
    - `electron/main.ts` registers IPC handlers on app ready
    - Electron TypeScript compiles without errors
  </done>
</task>

<task type="auto">
  <name>Extend preload with typed generation API</name>
  <files>
    electron/preload.ts
  </files>
  <action>
    Replace the generic send/on with typed methods for generation:

    Steps:
    1. Add typed methods to `contextBridge.exposeInMainWorld('electronAPI', ...)`:
       - `validateAuth(cookie: string): Promise<AuthState>` → invokes 'generation:auth-validate'
       - `generate(request: GenerationRequest): Promise<GenerationResult>` → invokes 'generation:generate'
       - `getAuthStatus(): Promise<AuthState>` → invokes 'generation:auth-status'
    2. Use `ipcRenderer.invoke()` for all methods (matches `ipcMain.handle()`)
    3. Keep the existing generic send/on for backward compatibility

    AVOID: Exposing raw ipcRenderer to the renderer — always use contextBridge
    USE: `ipcRenderer.invoke()` which returns a Promise, matching the handle pattern
  </action>
  <verify>
    npx tsc -p tsconfig.electron.json --noEmit
  </verify>
  <done>
    - Preload exposes `electronAPI.validateAuth()`, `electronAPI.generate()`, `electronAPI.getAuthStatus()`
    - All methods use `ipcRenderer.invoke()`
    - Electron TypeScript compiles cleanly
  </done>
</task>

## Must-Haves
After all tasks complete, verify:
- [ ] IPC handlers use `ipcMain.handle` / `ipcRenderer.invoke` pattern
- [ ] All API calls happen in the main process only
- [ ] Error handling wraps all external API calls
- [ ] Electron code compiles with `npx tsc -p tsconfig.electron.json --noEmit`

## Success Criteria
- [ ] All tasks verified passing
- [ ] Must-haves confirmed
- [ ] No regressions in existing build
