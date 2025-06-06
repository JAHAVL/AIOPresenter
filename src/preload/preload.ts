// src/preload/preload.ts
console.log('<<<<< PRELOAD SCRIPT VERSION XXXXX - TOP OF FILE - JUNE 05 2025 12:08 PM >>>>>');
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { StorageChannel, Library } from '../shared/ipcChannels';
// import { MainProcessDebugPayload } from './types'; // Assuming types.ts or similar, commented out for now
// import { MainChannel, FileChannel } from './constants'; // Assuming constants.ts or similar, commented out for now

console.log('[preload.ts] Preload script executing...');

const validChannelsReceive = [
  // LogChannel.MAIN_PROCESS_LOG, // Commented out as LogChannel is not available from @shared/ipcChannels
  'pong'
  // StorageChannel.DEBUG_MAIN_PROCESS_LOG, // Removed, does not exist
  // StorageChannel.MAIN_PROCESS_DEBUG_MESSAGE // Removed, does not exist
];

// Define the API object
const electronAPIExports = {
  // General invoke (kept for other functionalities if any still use it, or for future)
  invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),

  // Ping tests
  sendPing: () => ipcRenderer.send('ping-main', 'Hello from renderer via sendPing!'),
  onPong: (callback: (event: IpcRendererEvent, ...args: any[]) => void) => {
    ipcRenderer.on('pong-renderer', callback);
    return () => ipcRenderer.removeListener('pong-renderer', callback);
  },

  // Debug message listener (Removed as StorageChannel.MAIN_PROCESS_DEBUG_MESSAGE does not exist)
  // onMainProcessDebugMessage: (callback: (message: any /* MainProcessDebugPayload */) => void) => {
  //   const handler = (_event: IpcRendererEvent, payload: any /* MainProcessDebugPayload */) => callback(payload);
  //   ipcRenderer.on(StorageChannel.MAIN_PROCESS_DEBUG_MESSAGE, handler);
  //   // Return a cleanup function
  //   return () => {
  //     ipcRenderer.removeListener(StorageChannel.MAIN_PROCESS_DEBUG_MESSAGE, handler);
  //   };
  // },

  // Test for on/reply pattern (main.ts)
  testOnReplyPing: (): Promise<any> => {
    return new Promise((resolve) => {
      console.log(`[preload.ts] testOnReplyPing: Sending 'ping from renderer for main.ts test-on-reply' on 'test-on-reply' /* MainChannel.TEST_ON_REPLY */`);
      ipcRenderer.send('test-on-reply' /* MainChannel.TEST_ON_REPLY */, 'ping from renderer for main.ts test-on-reply');
      ipcRenderer.once('test-on-reply-back' /* MainChannel.TEST_ON_REPLY_BACK */, (_event, response) => {
        console.log(`[preload.ts] testOnReplyPing: Received response on 'test-on-reply-back' /* MainChannel.TEST_ON_REPLY_BACK */:`, response);
        resolve(response);
      });
    });
  },

  // Test for on/reply pattern (storageHandlers.ts)
  testStorageChannelPing: (): Promise<any> => {
    return new Promise((resolve) => {
      console.log(`[preload.ts] testStorageChannelPing: Sending 'ping from renderer for storageHandlers.ts test-channel' on 'test-channel'`);
      ipcRenderer.send('test-channel', 'ping from renderer for storageHandlers.ts test-channel');
      ipcRenderer.once('test-channel-reply', (_event, response) => {
        console.log(`[preload.ts] testStorageChannelPing: Received response on 'test-channel-reply':`, response);
        resolve(response);
      });
    });
  },

  // File dialog
  openImageDialog: () => ipcRenderer.invoke('file:open-image-dialog' /* FileChannel.OPEN_IMAGE_DIALOG */),
  loadImageAsDataURL: (filePath: string) => ipcRenderer.invoke('file:load-image-data-url' /* FileChannel.LOAD_IMAGE_AS_DATA_URL */, filePath),

  // List User Libraries (using invoke)
  listUserLibraries: (): Promise<{ success: boolean; data?: Library[]; error?: string }> => {
    const channel = StorageChannel.LIST_USER_LIBRARIES;
    console.log(`[preload.ts] listUserLibraries (invoke version): Attempting to invoke on channel (from enum StorageChannel.LIST_USER_LIBRARIES): '${channel}'`);
    console.log('<<<<< PRELOAD SCRIPT VERSION XXXXX - INSIDE listUserLibraries (invoke) - JUNE 06 2025 - ENUM ONLY >>>>>');
    return ipcRenderer.invoke(channel)
      .then((libraries: Library[]) => {
        console.log('[preload.ts] listUserLibraries resolved successfully with data:', libraries);
        return { success: true, data: libraries };
      })
      .catch((err: Error) => {
        console.error('[preload.ts] listUserLibraries failed:', err);
        return { success: false, error: err.message };
      });
  },

  // General on listener (if needed for other dynamic channels, use with caution)
  on: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void) => {
    console.log(`[preload.ts] Setting up listener for channel: '${channel}'`);
    
    // Create a wrapper function to ensure we log when events are received
    const wrappedListener = (event: IpcRendererEvent, ...args: any[]) => {
      console.log(`[preload.ts] 🔔 IPC Event received on channel: '${channel}'`, args);
      listener(event, ...args);
    };
    
    ipcRenderer.on(channel, wrappedListener);
    
    // Return cleanup function that removes the wrapped listener
    return () => {
      console.log(`[preload.ts] Removing listener for channel: '${channel}'`);
      ipcRenderer.removeListener(channel, wrappedListener);
    };
  },
  // Add any other methods that were part of your electronAPI object here
  // e.g. getAIOPaths: () => ipcRenderer.invoke('get-aio-paths'),

  // Listener for logs from main process services (like StorageService)
  onMainProcessServiceLog: (callback: (payload: { source: string; type: 'log' | 'error' | 'warn'; messages: string[] }) => void) => { // eslint-disable-line @typescript-eslint/no-unused-vars
    const handler = (_event: IpcRendererEvent, payload: { source: string; type: 'log' | 'error' | 'warn'; messages: string[] }) => callback(payload);
    // ipcRenderer.on(LogChannel.MAIN_PROCESS_LOG, handler); // Commented out as LogChannel is not available
    return () => {
      // ipcRenderer.removeListener(LogChannel.MAIN_PROCESS_LOG, handler); // Commented out as LogChannel is not available
    };
  }
};

// Log details about the electronAPI object and listUserLibraries function being exposed
console.log('[preload.ts] Preparing to expose electronAPI...');
console.log('[preload.ts] electronAPIExports:', electronAPIExports);
console.log('[preload.ts] typeof electronAPIExports:', typeof electronAPIExports);
console.log('[preload.ts] electronAPIExports.toString():', electronAPIExports.toString());
if (electronAPIExports.listUserLibraries) {
  console.log('[preload.ts] typeof electronAPIExports.listUserLibraries:', typeof electronAPIExports.listUserLibraries);
  console.log('[preload.ts] electronAPIExports.listUserLibraries.toString():', electronAPIExports.listUserLibraries.toString().substring(0, 300) + "...");
} else {
  console.error('[preload.ts] CRITICAL: electronAPIExports.listUserLibraries is UNDEFINED before exposing!');
}

// Setting up the direct listener for main process logs.
// This doesn't need to be called from the renderer; it just starts listening.
// ipcRenderer.on(LogChannel.MAIN_PROCESS_LOG, (_event, payload: { source: string; type: 'log' | 'error' | 'warn'; messages: string[] }) => { // Commented out as LogChannel is not available
//   const { source, type, messages } = payload;
//   const logFn = console[type] || console.log;
//   logFn(`%c[${source} via Preload]%c`, 'color: #713AB7; font-weight: bold;', 'color: reset;', ...messages);
// }); // Entire block commented out

contextBridge.exposeInMainWorld('electronAPI', electronAPIExports);
console.log('[preload.ts] electronAPI exposed to main world.');

// The redundant contextBridge.exposeInMainWorld call has been removed.
// The electronAPIExports object is now the single source of truth for the exposed API.

window.addEventListener('DOMContentLoaded', () => {
  console.log('[preload.ts] DOM fully loaded and parsed.');
});
