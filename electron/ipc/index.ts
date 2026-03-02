/* ── IPC Handler Registry ────────────────────────────────────────────── */

import { registerGenerationHandlers } from './generation';

/**
 * Register all IPC handlers. Call once in app.whenReady().
 */
export function registerIpcHandlers(): void {
    registerGenerationHandlers();
}
