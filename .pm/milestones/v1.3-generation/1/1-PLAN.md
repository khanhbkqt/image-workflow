---
phase: 1
plan: 1
wave: 1
gap_closure: false
---

# Plan 1.1: Generation Types & Dependencies

## Objective
Install the unofficial Google Labs API packages (`@rohitaryal/imagefx-api`, `@rohitaryal/whisk-api`) and create the foundational TypeScript types for the generation system. This is the prerequisite for all API integration work — later plans depend on these types and packages being available.

## Context
Load these files for context:
- src/types/canvas.ts (existing node data types)
- src/types/workflow.ts (existing port/node types)
- src/types/ingredient.ts (existing ingredient types)
- package.json (current dependencies)

## Tasks

<task type="auto">
  <name>Install unofficial API packages</name>
  <files>
    package.json
  </files>
  <action>
    Install both packages as production dependencies:

    Steps:
    1. Run `npm install @rohitaryal/imagefx-api @rohitaryal/whisk-api`
    2. Verify packages are added to `dependencies` in package.json
    3. Verify TypeScript can resolve the module types

    AVOID: Installing as devDependencies — these are runtime deps used in Electron main process
    USE: Production dependencies because they ship with the packaged app
  </action>
  <verify>
    npm ls @rohitaryal/imagefx-api @rohitaryal/whisk-api
    # Should show both packages without errors
  </verify>
  <done>
    Both packages listed in package.json dependencies and resolvable by TypeScript
  </done>
</task>

<task type="auto">
  <name>Create generation type definitions</name>
  <files>
    src/types/generation.ts [NEW]
  </files>
  <action>
    Create a new type file with all generation-related types:

    Steps:
    1. Create `src/types/generation.ts`
    2. Define generation request/response types:
       - `GenerationProvider`: enum for 'imagefx' | 'whisk'
       - `GenerationModel`: 'IMAGEN_3_5' | 'IMAGEN_4' (from imagefx Constants)
       - `AspectRatio`: 'SQUARE' | 'PORTRAIT' | 'LANDSCAPE' | 'LANDSCAPE_4_3'
       - `GenerationRequest`: { prompt, model?, aspectRatio?, seed?, numberOfImages?, provider }
       - `GenerationResult`: { images: GeneratedImage[], prompt, model, requestId }
       - `GeneratedImage`: { encodedImage (base64), seed, mediaGenerationId, aspectRatio }
       - `GenerationStatus`: 'idle' | 'generating' | 'success' | 'error'
       - `GenerationError`: { code, message, retryable }
    3. Define auth types:
       - `AuthConfig`: { cookie: string, provider: GenerationProvider }
       - `AuthStatus`: 'unconfigured' | 'validating' | 'valid' | 'expired' | 'invalid'
       - `AuthState`: { status: AuthStatus, user?: { name, email, image }, error?: string }
    4. Define IPC channel constants:
       - `IPC_CHANNELS` object with keys like 'generation:generate', 'generation:auth-validate', 'generation:auth-status', 'generation:cancel'
    5. Export everything from `src/types/index.ts`

    AVOID: Re-exporting types from the npm packages directly — wrap them in our own types for decoupling
    USE: Our own type definitions that map to the underlying API types
  </action>
  <verify>
    npx tsc --noEmit
    # Should compile without errors
  </verify>
  <done>
    - `src/types/generation.ts` exists with all types defined
    - Types are exported from `src/types/index.ts`
    - No TypeScript compilation errors
  </done>
</task>

## Must-Haves
After all tasks complete, verify:
- [ ] Both `@rohitaryal/imagefx-api` and `@rohitaryal/whisk-api` are in package.json dependencies
- [ ] All generation types compile without errors
- [ ] IPC channel constants are defined for main↔renderer communication

## Success Criteria
- [ ] All tasks verified passing
- [ ] Must-haves confirmed
- [ ] No regressions in build (`npm run build` or `npx tsc --noEmit`)
