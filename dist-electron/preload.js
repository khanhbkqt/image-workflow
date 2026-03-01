"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    // IPC methods will be added here in future milestones
    send: (channel, data) => electron_1.ipcRenderer.send(channel, data),
    on: (channel, callback) => electron_1.ipcRenderer.on(channel, (_event, ...args) => callback(...args)),
});
