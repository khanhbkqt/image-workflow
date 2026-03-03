/* ── IPC Handler Registry ────────────────────────────────────────────── */
import { registerGenerationHandlers } from './generation.js';
/**
 * Register all IPC handlers. Call once in app.whenReady().
 */
export function registerIpcHandlers() {
    registerGenerationHandlers();
}
