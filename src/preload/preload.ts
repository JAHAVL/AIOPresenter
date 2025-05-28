// src/preload/preload.ts
import { contextBridge, ipcRenderer } from 'electron';

console.log('Preload script executing...');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Example: Send a message from renderer to main
  sendPing: () => ipcRenderer.send('ping'),

  // Example: Receive a message from main to renderer
  onPong: (callback: () => void) => ipcRenderer.on('pong', callback),

  // You can expose other Node.js or Electron APIs here securely
  // For example, to get the app version:
  // getAppVersion: () => ipcRenderer.invoke('get-app-version')
});

window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed in preload.');
  // You can interact with the DOM here if needed before React mounts
});
