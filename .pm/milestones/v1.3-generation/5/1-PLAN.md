---
phase: 5
plan: 1
wave: 1
gap_closure: false
---

# Plan 5.1: Flow Types & Hidden BrowserView Manager

## Objective
Create the TypeScript type definitions for the Flow API integration and implement the hidden BrowserView manager that handles OAuth2 auth, Bearer token extraction, and per-request reCAPTCHA Enterprise token generation. This is the core infrastructure that makes the Flow API usable from Electron.

## Context
Load these files for context:
- `.pm/milestones/v1.3-generation/5/1-PLAN.md` (this plan)
- `src/types/generation.ts` (existing generation types to extend)
- `electron/main.ts` (Electron app bootstrap — BrowserView attaches here)
- `electron/ipc/generation.ts` (existing IPC pattern)

Research reference (Flow API reverse engineering):
- Endpoint: `POST https://aisandbox-pa.googleapis.com/v1/projects/{projectId}/flowMedia:batchGenerateImages`
- Upload: `POST https://aisandbox-pa.googleapis.com/v1/flow/uploadImage`
- Auth: OAuth2 Bearer token (`ya29.xxx`) + per-request reCAPTCHA Enterprise token
- Model: `NARWHAL` (Nano Banana 2)
- Tool ID: `PINHOLE`
- reCAPTCHA tokens must be generated via `grecaptcha.enterprise.execute()` in the browser context

## Tasks

<task type="auto">
  <name>Add Flow types to generation type definitions</name>
  <files>
    src/types/generation.ts
  </files>
  <action>
    Extend the existing generation types with Flow-specific definitions:
    
    Steps:
    1. Add `'flow'` to the `GenerationProvider` union type
    2. Add `'NARWHAL'` to a new `FlowModel` type (keep separate from `GenerationModel` which is ImageFX-specific)
    3. Add `FlowImageInputType` type: `'IMAGE_INPUT_TYPE_REFERENCE'`
    4. Add `FlowImageInput` interface: `{ imageInputType: FlowImageInputType; name: string }` (name = asset UUID from upload)
    5. Add `FlowGenerationRequest` interface with fields: `prompt`, `model` (FlowModel), `aspectRatio`, `seed`, `imageInputs` (FlowImageInput[])
    6. Add `'generation:generate-flow'` and `'generation:flow-upload-image'` to `IPC_CHANNELS`
    7. Update `GenerationRequest` to include optional `flowImageInputs?: FlowImageInput[]` for when provider is `'flow'`

    AVOID: Modifying existing ImageFX/Whisk types — keep Flow separate
    USE: The same `AspectRatio` enum since Flow uses the same values
  </action>
  <verify>
    npx tsc --noEmit
  </verify>
  <done>
    - `GenerationProvider` includes `'flow'`
    - Flow-specific types compile cleanly
    - All existing code still compiles
  </done>
</task>

<task type="auto">
  <name>Implement FlowBrowserView manager in Electron main process</name>
  <files>
    electron/flow/flowBrowserView.ts (NEW)
  </files>
  <action>
    Create a singleton manager for the hidden BrowserView that loads labs.google/fx/tools/flow:

    Steps:
    1. Create `electron/flow/flowBrowserView.ts` exporting a `FlowBrowserViewManager` class
    2. `init(mainWindow: BrowserWindow)` — creates a hidden BrowserView (1x1 pixel, off-screen), loads `https://labs.google/fx/tools/flow`, sets session/partition for cookie isolation
    3. `isReady(): boolean` — checks if page is loaded and user is authenticated (detect login state)
    4. `getBearerToken(): Promise<string>` — executes JS in webContents to extract the OAuth2 access token from the page's auth state (intercept from `gapi.auth2` or extract from a test fetch's Authorization header)
    5. `getRecaptchaToken(action: string): Promise<string>` — executes `grecaptcha.enterprise.execute(SITE_KEY, {action})` in the webContents, returns the fresh token
    6. `destroy()` — cleans up the BrowserView
    7. Export a singleton instance: `export const flowView = new FlowBrowserViewManager()`

    Key implementation details:
    - BrowserView must be attached to the main window but positioned off-screen (x: -1000, y: -1000)
    - Use `webContents.executeJavaScript()` for all JS execution in the Flow page context
    - For Bearer token: intercept using `webContents.session.webRequest.onBeforeSendHeaders` to capture the Authorization header from any outgoing request to `aisandbox-pa.googleapis.com`
    - Cache the Bearer token with a TTL (tokens are valid for ~1 hour)
    - reCAPTCHA tokens are per-request, never cache them

    AVOID: Making the BrowserView visible to the user
    USE: `webContents.executeJavaScript` with proper error handling and timeouts (10s max)
  </action>
  <verify>
    npx tsc --noEmit
  </verify>
  <done>
    - `FlowBrowserViewManager` class exports from `electron/flow/flowBrowserView.ts`
    - `getBearerToken()` and `getRecaptchaToken()` methods exist with proper return types
    - TypeScript compiles cleanly
  </done>
</task>

## Must-Haves
After all tasks complete, verify:
- [ ] Flow types added without breaking existing generation types
- [ ] FlowBrowserViewManager class compiles and exports cleanly
- [ ] No regressions in TypeScript compilation

## Success Criteria
- [ ] All tasks verified passing
- [ ] Must-haves confirmed
- [ ] `npx tsc --noEmit` passes cleanly
