import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  /* ── Legacy generic channels ── */
  send: (channel: string, data: unknown) => ipcRenderer.send(channel, data),
  on: (channel: string, callback: (...args: unknown[]) => void) =>
    ipcRenderer.on(channel, (_event, ...args) => callback(...args)),

  /* ── Generation API ── */
  validateAuth: (cookie: string) =>
    ipcRenderer.invoke('generation:auth-validate', cookie),
  generate: (request: {
    prompt: string;
    model?: string;
    aspectRatio?: string;
    seed?: number;
    numberOfImages?: number;
  }) => ipcRenderer.invoke('generation:generate', request),
  generateWhisk: (request: {
    prompt: string;
    imageSlots: Array<{ slotType: string; imageData: string }>;
    aspectRatio?: string;
    seed?: number;
  }) => ipcRenderer.invoke('generation:generate-whisk', request),
  getAuthStatus: () =>
    ipcRenderer.invoke('generation:auth-status'),
  setAuthCookie: (cookie: string) =>
    ipcRenderer.invoke('generation:auth-set-cookie', cookie),
  cancelGeneration: () =>
    ipcRenderer.invoke('generation:cancel'),
})
