import { app, BrowserWindow } from 'electron'
import path from 'path'
import { registerIpcHandlers } from './ipc'
import { flowView } from './flow/flowBrowserView'

const isDev = process.env.NODE_ENV === 'development'

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (isDev) {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  return win
}

app.whenReady().then(() => {
  registerIpcHandlers()
  const win = createWindow()

  // Attach hidden Flow BrowserView for auth token extraction (fire-and-forget)
  flowView.init(win)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  flowView.destroy()
  if (process.platform !== 'darwin') app.quit()
})
