import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // IPC methods will be added here in future milestones
  send: (channel: string, data: unknown) => ipcRenderer.send(channel, data),
  on: (channel: string, callback: (...args: unknown[]) => void) =>
    ipcRenderer.on(channel, (_event, ...args) => callback(...args)),
})
