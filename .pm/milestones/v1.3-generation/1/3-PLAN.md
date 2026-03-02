---
phase: 1
plan: 3
wave: 2
gap_closure: false
---

# Plan 1.3: API Service & Auth Settings

## Objective
Create the renderer-side API service that wraps Electron IPC calls, a Zustand auth store, and a settings UI where users can paste their Google cookie to authenticate. This completes the API integration layer so that later phases (Generate Node, Image-Based Generation) can simply call `generationService.generate()`.

## Context
Load these files for context:
- src/services/storage.ts (existing service pattern)
- src/stores/canvasStore.ts (existing Zustand store pattern)
- src/types/generation.ts (types from Plan 1.1)
- electron/preload.ts (preload API from Plan 1.2)
- src/App.tsx (main app component for settings route/modal)
- src/styles/ (design system tokens)

## Tasks

<task type="auto">
  <name>Create renderer-side generation service</name>
  <files>
    src/services/generationService.ts [NEW]
    src/types/electron.d.ts [NEW]
  </files>
  <action>
    Create a service layer that wraps the Electron IPC bridge:

    Steps:
    1. Create `src/types/electron.d.ts` — declare the `window.electronAPI` global with typed methods from preload
    2. Create `src/services/generationService.ts` with:
       - `validateAuth(cookie: string): Promise<AuthState>` — calls `window.electronAPI.validateAuth(cookie)`
       - `generate(request: GenerationRequest): Promise<GenerationResult>` — calls `window.electronAPI.generate(request)`
       - `getAuthStatus(): Promise<AuthState>` — calls `window.electronAPI.getAuthStatus()`
       - Fallback behavior when `window.electronAPI` is undefined (running in browser dev mode): return mock/error responses
    3. Export as a singleton object (same pattern as `storage.ts`)

    AVOID: Importing Electron types in renderer code
    USE: Global type declaration for `window.electronAPI`
  </action>
  <verify>
    npx tsc --noEmit
    # Should compile without errors
  </verify>
  <done>
    - `src/services/generationService.ts` wraps all IPC calls
    - `src/types/electron.d.ts` types the window.electronAPI global
    - Graceful fallback when running outside Electron
  </done>
</task>

<task type="auto">
  <name>Create auth store and settings UI</name>
  <files>
    src/stores/authStore.ts [NEW]
    src/components/settings/SettingsDialog.tsx [NEW]
    src/components/settings/SettingsDialog.css [NEW]
  </files>
  <action>
    Create a Zustand store for auth state and a settings dialog for cookie input:

    Steps:
    1. Create `src/stores/authStore.ts`:
       - State: `authState: AuthState`, `cookie: string | null`, `isSettingsOpen: boolean`
       - Actions: `validateCookie(cookie)`, `clearAuth()`, `openSettings()`, `closeSettings()`
       - `validateCookie` calls `generationService.validateAuth()`, updates state
       - Persist cookie to localStorage via the storage service (encrypted later)
    2. Create `src/components/settings/SettingsDialog.tsx`:
       - Modal dialog with title "API Settings"
       - Textarea for pasting Google cookie (masked/password style)
       - "Validate" button that calls `authStore.validateCookie()`
       - Status indicator: ✅ Connected (user name + email) / ❌ Invalid / ⏳ Validating
       - "Clear" button to remove saved cookie
       - Instructions text: "Get your cookie from labs.google → DevTools → Application → Cookies"
    3. Create `src/components/settings/SettingsDialog.css`:
       - Use design system tokens for colors, spacing, borders
       - Dark modal overlay with glass-morphism effect
       - Status badges with green/red/yellow colors
    4. Add a settings gear icon button to the app header/toolbar that opens the dialog

    AVOID: Storing cookie in plain visible text — use a password-style input
    USE: Design system tokens for all styling
  </action>
  <verify>
    npm run dev
    # Visit http://localhost:5173
    # Click settings gear → dialog should open
    # Paste a cookie → click validate → should show status
    # Close dialog → state should persist
  </verify>
  <done>
    - Settings dialog opens from toolbar with gear icon
    - Cookie can be pasted, validated, and cleared
    - Auth status persists across page reloads
    - UI matches design system aesthetics
  </done>
</task>

## Must-Haves
After all tasks complete, verify:
- [ ] Generation service provides clean API for later phases
- [ ] Auth store manages cookie and connection state
- [ ] Settings UI is accessible from the main app
- [ ] Graceful behavior when running outside Electron (dev mode)

## Success Criteria
- [ ] All tasks verified passing
- [ ] Must-haves confirmed
- [ ] No regressions in existing build or UI
- [ ] Settings dialog is visually polished with design system tokens
