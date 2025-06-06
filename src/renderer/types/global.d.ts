import type { IpcRenderer } from 'electron';

declare global {
  interface Window {
    electron?: {
      ipcRenderer: IpcRenderer;
      // Add other Electron APIs exposed via preload script here if any
    };
  }
}

// Export {} to make it a module, which is good practice for .d.ts files if they don't export anything else.
// This ensures the file is treated as a module and its declarations are applied globally.
export {};
