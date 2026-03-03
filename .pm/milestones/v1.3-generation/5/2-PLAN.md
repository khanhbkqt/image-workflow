---
phase: 5
plan: 2
wave: 1
gap_closure: false
---

# Plan 5.2: Flow API Client

## Objective
Implement the Flow API client that makes direct HTTP calls to the Google Labs API for image upload and generation using the NARWHAL model. This client uses Bearer tokens and reCAPTCHA tokens obtained from the BrowserView manager (Plan 5.1).

## Context
Load these files for context:
- `electron/flow/flowBrowserView.ts` (created in Plan 5.1 — provides tokens)
- `src/types/generation.ts` (Flow types from Plan 5.1)
- `electron/ipc/generation.ts` (existing pattern — this client is called by IPC handlers)

API reference (from reverse engineering):
- Generate: `POST https://aisandbox-pa.googleapis.com/v1/projects/{projectId}/flowMedia:batchGenerateImages`
- Upload: `POST https://aisandbox-pa.googleapis.com/v1/flow/uploadImage` (Content-Type: `text/plain;charset=UTF-8`, auth: Bearer)
- Tool identifier: `PINHOLE`
- Model: `NARWHAL`
- Aspect ratios: `IMAGE_ASPECT_RATIO_LANDSCAPE`, `IMAGE_ASPECT_RATIO_PORTRAIT`, `IMAGE_ASPECT_RATIO_SQUARE`

## Tasks

<task type="auto">
  <name>Create the Flow API client module</name>
  <files>
    electron/flow/flowApiClient.ts (NEW)
  </files>
  <action>
    Create a Node.js-side API client for the Flow service:

    Steps:
    1. Create `electron/flow/flowApiClient.ts`
    2. Implement `uploadImage(params: { bearerToken: string; projectId: string; imageBase64: string; mimeType: string; fileName: string }): Promise<string>`:
       - POST to `https://aisandbox-pa.googleapis.com/v1/flow/uploadImage`
       - Content-Type: `text/plain;charset=UTF-8` (unusual but required)
       - Authorization: `Bearer ${bearerToken}`
       - Body: `{ clientContext: { projectId, tool: "PINHOLE" }, imageBytes: imageBase64, isUserUploaded: true, isHidden: false, mimeType, fileName }`
       - Returns the asset UUID from the response
    3. Implement `generateImages(params: { bearerToken: string; recaptchaToken: string; projectId: string; prompt: string; model: string; aspectRatio: string; seed: number; imageInputs: Array<{ imageInputType: string; name: string }> }): Promise<{ images: Array<{ encodedImage: string; seed: number; mediaId: string }> }>`:
       - POST to `https://aisandbox-pa.googleapis.com/v1/projects/${projectId}/flowMedia:batchGenerateImages`
       - Build the request body with `clientContext` (including reCAPTCHA token), `mediaGenerationContext`, `requests[]` array
       - `sessionId` format: `;${Date.now()}`
       - Parse the response and extract base64 image data, seed, and media ID
    4. Implement `getProjectId(bearerToken: string): Promise<string>`:
       - Either extract from the BrowserView page state or use a fixed project ID
       - This may require a list-projects API call or page scrape
    5. Use Node.js built-in `fetch` (available in Node 18+/Electron 28+)

    AVOID: Using the `net` module from Electron — use standard `fetch` for simplicity
    USE: Proper error handling with typed error responses, including rate limiting detection
  </action>
  <verify>
    npx tsc --noEmit
  </verify>
  <done>
    - `uploadImage()` function compiles with correct parameter and return types
    - `generateImages()` function compiles with correct request body structure matching the research
    - Error handling returns structured `GenerationError` objects
    - TypeScript compiles cleanly
  </done>
</task>

## Must-Haves
After all tasks complete, verify:
- [ ] Flow API client handles both text-to-image and image-to-image flows
- [ ] Upload + generate two-step flow is implemented
- [ ] Request body structure matches the reverse-engineered API spec
- [ ] No regressions in TypeScript compilation

## Success Criteria
- [ ] All tasks verified passing
- [ ] Must-haves confirmed
- [ ] `npx tsc --noEmit` passes cleanly
