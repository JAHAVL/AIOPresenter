// src/preload.d.ts
import { IpcRendererEvent } from 'electron';
import { Library, PresentationFile } from './shared/ipcChannels'; // Import Library type

// Define the type for the electronAPI exposed by the preload script
export interface IElectronAPI {
  // General invoke
  invoke: (channel: string, ...args: any[]) => Promise<any>;

  // Ping tests
  sendPing: () => void;
  onPong: (callback: (event: IpcRendererEvent, ...args: any[]) => void) => () => void; // Returns cleanup fn

  // Debug message listener
  onMainProcessDebugMessage: (callback: (message: any /* MainProcessDebugPayload */) => void) => () => void; // Returns cleanup fn

  // Test for on/reply pattern (main.ts)
  testOnReplyPing: () => Promise<any>;

  // Test for on/reply pattern (storageHandlers.ts)
  testStorageChannelPing: () => Promise<any>;

  // File dialog (assuming these return Promise<any> based on preload.ts invoke usage)
  openImageDialog: () => Promise<any>;
  loadImageAsDataURL: (filePath: string) => Promise<any>;

  // List User Libraries
  listUserLibraries: () => Promise<{ success: boolean; data?: Library[]; error?: string }>;

  // Create User Library
  createUserLibrary: (libraryName?: string) => Promise<{ success: boolean; path?: string; error?: string }>;

  // Rename User Library
  renameUserLibrary: (oldName: string, newName: string) => Promise<{ success: boolean; oldPath?: string; newPath?: string; error?: string }>;

  // Delete User Library
  deleteUserLibrary: (libraryName: string) => Promise<{ success: boolean; error?: string }>;

  // Create Presentation File
  createPresentationFile: (libraryPath: string, baseName?: string) => Promise<{ success: boolean; filePath?: string; error?: string }>;

  // List Presentation Files in a Library
  listPresentationFiles: (libraryPath: string) => Promise<{ success: boolean; data?: PresentationFile[]; error?: string }>;

  // General on listener
  on: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void) => () => void; // Returns cleanup fn

  // Add any other methods that were part of your electronAPI object here
  // e.g. getAIOPaths?: () => Promise<any>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}

// Extend React's CSSProperties to include -webkit-app-region for Electron
declare module 'react' {
  interface CSSProperties {
    WebkitAppRegion?: 'drag' | 'no-drag';
  }
}
