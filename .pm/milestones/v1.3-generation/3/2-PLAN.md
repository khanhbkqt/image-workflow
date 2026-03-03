---
phase: 3
plan: 2
wave: 1
gap_closure: false
---

# Plan 3.2: Service & Preload Bridge

## Objective
Extend the renderer-side service layer and Electron preload bridge to expose the new Whisk generation IPC channel, so React components can call Whisk generation through the same service abstraction.

## Context
Load these files for context:
- src/services/generationService.ts (existing generate() wrapper)
- src/types/electron.d.ts (ElectronAPI interface)
- electron/preload.ts (contextBridge exposure)
- src/types/generation.ts (WhiskImageSlot, GenerationRequest with imageSlots)

## Tasks

<task type="auto">
  <name>Extend preload.ts with Whisk IPC bridge</name>
  <files>
    electron/preload.ts
  </files>
  <action>
    Add the Whisk generation IPC invoke to the preload bridge:

    Steps:
    1. Add `generateWhisk` method to the exposed API:
       ```ts
       generateWhisk: (request: {
         prompt: string;
         imageSlots: Array<{ slotType: string; imageData: string }>;
         aspectRatio?: string;
         seed?: number;
       }) => ipcRenderer.invoke('generation:generate-whisk', request),
       ```

    KEEP: All existing methods unchanged
  </action>
  <verify>
    npx tsc --noEmit
  </verify>
  <done>
    - `generateWhisk` is exposed via contextBridge
  </done>
</task>

<task type="auto">
  <name>Update ElectronAPI type declaration</name>
  <files>
    src/types/electron.d.ts
  </files>
  <action>
    Add the type for the new `generateWhisk` method:

    Steps:
    1. Import `WhiskImageSlot` from `./generation`
    2. Add to `ElectronAPI` interface:
       ```ts
       generateWhisk: (request: {
         prompt: string;
         imageSlots: WhiskImageSlot[];
         aspectRatio?: string;
         seed?: number;
       }) => Promise<GenerationResult | { error: GenerationError }>;
       ```
  </action>
  <verify>
    npx tsc --noEmit
  </verify>
  <done>
    - ElectronAPI includes `generateWhisk` method typing
  </done>
</task>

<task type="auto">
  <name>Add generateWhisk() to generationService</name>
  <files>
    src/services/generationService.ts
  </files>
  <action>
    Add a Whisk-specific generation function to the service:

    Steps:
    1. Import `WhiskImageSlot` from `../types/generation`
    2. Add `generateWhisk` function following the same pattern as `generate()`:
       ```ts
       async function generateWhisk(request: {
         prompt: string;
         imageSlots: WhiskImageSlot[];
         aspectRatio?: AspectRatio;
         seed?: number;
       }): Promise<GenerationResult | { error: GenerationError }> {
         if (!isElectron()) {
           return {
             error: {
               code: 'NOT_ELECTRON',
               message: 'Whisk generation requires the Electron desktop app.',
               retryable: false,
             },
           };
         }
         return window.electronAPI!.generateWhisk(request);
       }
       ```
    3. Export `generateWhisk` in the service object

    AVOID: Modifying the existing `generate()` function — keep ImageFX and Whisk separate
  </action>
  <verify>
    npx tsc --noEmit
  </verify>
  <done>
    - `generationService.generateWhisk()` exists and compiles
    - Existing `generationService.generate()` is unchanged
  </done>
</task>

## Must-Haves
After all tasks complete, verify:
- [ ] `preload.ts` exposes `generateWhisk` via contextBridge
- [ ] `ElectronAPI` interface includes `generateWhisk` typing
- [ ] `generationService.generateWhisk()` calls the IPC channel correctly
- [ ] No regressions to existing ImageFX-related methods

## Success Criteria
- [ ] All tasks verified passing
- [ ] Must-haves confirmed
- [ ] `npx tsc --noEmit` passes
