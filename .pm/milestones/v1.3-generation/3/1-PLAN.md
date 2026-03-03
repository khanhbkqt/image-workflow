---
phase: 3
plan: 1
wave: 1
gap_closure: false
---

# Plan 3.1: Whisk Types & IPC Handler

## Objective
Extend the generation type system with Whisk-specific types (image slots for subject/scene/style) and add a new Electron IPC handler that uses the `@rohitaryal/whisk-api` `Project` class to perform image-based generation via Whisk.

## Context
Load these files for context:
- src/types/generation.ts (existing GenerationRequest, GenerationResult types)
- electron/ipc/generation.ts (existing ImageFX IPC handler)
- node_modules/@rohitaryal/whisk-api/dist/Whisk.d.ts (Whisk class API)
- node_modules/@rohitaryal/whisk-api/dist/Project.d.ts (Project.addSubject/addScene/addStyle/generateImageWithReferences)
- node_modules/@rohitaryal/whisk-api/dist/Types.d.ts (ImageInput, MediaReference)
- node_modules/@rohitaryal/whisk-api/dist/Media.d.ts (Media class — encodedMedia, seed, mediaGenerationId)

## Tasks

<task type="auto">
  <name>Add Whisk types to generation.ts</name>
  <files>
    src/types/generation.ts
  </files>
  <action>
    Extend the generation type system with Whisk-specific types:

    Steps:
    1. Add a `WhiskImageSlot` type representing a category of image input:
       ```ts
       export type WhiskSlotType = 'subject' | 'scene' | 'style';
       export interface WhiskImageSlot {
           slotType: WhiskSlotType;
           /** base64-encoded image data */
           imageData: string;
       }
       ```
    2. Add a `WhiskGenerationRequest` interface for Whisk-specific requests:
       ```ts
       export interface WhiskGenerationRequest {
           prompt: string;
           imageSlots: WhiskImageSlot[];
           aspectRatio?: AspectRatio;
           seed?: number;
           provider: 'whisk';
       }
       ```
    3. Update the `GenerationRequest` type to support both ImageFX and Whisk by keeping the existing interface for ImageFX and adding the new one:
       - Rename current `GenerationRequest` to `ImageFXGenerationRequest` (keeping `provider: 'imagefx'`)
       - Create a union: `export type GenerationRequest = ImageFXGenerationRequest | WhiskGenerationRequest;`
       - OR simply add optional `imageSlots?: WhiskImageSlot[]` to the existing `GenerationRequest` to keep backward compat (simpler approach — prefer this)
    4. Add IPC channel constant: `GENERATE_WHISK: 'generation:generate-whisk'`

    PREFER: Adding optional `imageSlots` field to existing `GenerationRequest` for simplicity
    AVOID: Breaking existing ImageFX generation flow
  </action>
  <verify>
    npx tsc --noEmit
    # Should compile without errors
  </verify>
  <done>
    - WhiskImageSlot and WhiskSlotType types exist
    - GenerationRequest supports optional imageSlots
    - IPC channel for Whisk generation is defined
  </done>
</task>

<task type="auto">
  <name>Add Whisk IPC handler in Electron main process</name>
  <files>
    electron/ipc/generation.ts
  </files>
  <action>
    Add a new IPC handler for Whisk image-based generation:

    Steps:
    1. Import `Whisk` and `Project` from `@rohitaryal/whisk-api`
    2. Add a state variable `let whiskClient: Whisk | null = null;`
    3. Create the Whisk client alongside ImageFX client in the auth handlers:
       - In `generation:auth-validate` and `generation:auth-set-cookie`, after successful auth, also create: `whiskClient = new Whisk(cookie)`
    4. Register new IPC handler `generation:generate-whisk`:
       - Validate that `whiskClient` exists (auth check)
       - Create a new Whisk project: `const project = await whiskClient.newProject('gen-' + Date.now())`
       - For each image slot in the request:
         - If slot.slotType === 'subject': `await project.addSubject({ base64: slot.imageData })`
         - If slot.slotType === 'scene': `await project.addScene({ base64: slot.imageData })`
         - If slot.slotType === 'style': `await project.addStyle({ base64: slot.imageData })`
       - Generate: `const media = await project.generateImageWithReferences({ prompt, seed, aspectRatio })`
       - Clean up: `await project.delete()` (fire-and-forget)
       - Return result in `GenerationResult` format:
         ```ts
         {
           images: [{
             encodedImage: media.encodedMedia,
             seed: media.seed,
             mediaGenerationId: media.mediaGenerationId,
             aspectRatio: media.aspectRatio,
           }],
           prompt: request.prompt,
           model: 'IMAGEN_3_5',
           requestId: `whisk-${Date.now()}`,
         }
         ```
       - Wrap in try/catch, return `{ error: GenerationError }` on failure

    NOTE: Whisk returns a single Media object (not an array), so images array will have 1 element
    IMPORTANT: Always delete the Whisk project after generation to avoid cluttering the user's Whisk account
  </action>
  <verify>
    npx tsc --noEmit
    # Electron main process should compile cleanly
  </verify>
  <done>
    - Whisk client created alongside ImageFX on auth success
    - `generation:generate-whisk` IPC handler works with subject/scene/style inputs
    - Whisk projects are cleaned up after generation
  </done>
</task>

## Must-Haves
After all tasks complete, verify:
- [ ] `WhiskImageSlot` and `WhiskSlotType` types exist in `generation.ts`
- [ ] `GenerationRequest` supports `imageSlots` for Whisk
- [ ] Whisk IPC handler compiles and handles all 3 slot types
- [ ] Whisk project cleanup (delete) after generation
- [ ] No regressions in existing ImageFX generation

## Success Criteria
- [ ] All tasks verified passing
- [ ] Must-haves confirmed
- [ ] `npx tsc --noEmit` passes
