import { app, BrowserWindow } from 'electron';
// Eliminado: import path from 'node:path';
import { startServer } from '../server/index.js'; // El .js es obligatorio en ESM aunque sea un .ts

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    title: "VTT Lite - Decide and Die",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Apuntamos al puerto de Vite
  win.loadURL('http://localhost:5173'); 
}

app.whenReady().then(() => {
  startServer(); // Arrancamos el backend y la DB
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});