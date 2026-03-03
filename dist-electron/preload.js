"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    /* ── Legacy generic channels ── */
    send: (channel, data) => electron_1.ipcRenderer.send(channel, data),
    on: (channel, callback) => electron_1.ipcRenderer.on(channel, (_event, ...args) => callback(...args)),
    /* ── Generation API ── */
    validateAuth: (cookie) => electron_1.ipcRenderer.invoke('generation:auth-validate', cookie),
    generate: (request) => electron_1.ipcRenderer.invoke('generation:generate', request),
    generateWhisk: (request) => electron_1.ipcRenderer.invoke('generation:generate-whisk', request),
    generateFlow: (request) => electron_1.ipcRenderer.invoke('generation:generate-flow', request),
    flowUploadImage: (params) => electron_1.ipcRenderer.invoke('generation:flow-upload-image', params),
    getAuthStatus: () => electron_1.ipcRenderer.invoke('generation:auth-status'),
    setAuthCookie: (cookie) => electron_1.ipcRenderer.invoke('generation:auth-set-cookie', cookie),
    cancelGeneration: () => electron_1.ipcRenderer.invoke('generation:cancel'),
});
