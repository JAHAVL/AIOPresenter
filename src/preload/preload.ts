// src/preload/preload.ts
console.log('<<<<< PRELOAD SCRIPT VERSION XXXXX - TOP OF FILE - JUNE 05 2025 12:08 PM >>>>>');
import { ipcRenderer, contextBridge, OpenDialogReturnValue, IpcRendererEvent } from 'electron';
import { IpcResponse, UserLibrary, PresentationFile } from '@shared/types'; // Ensure types are imported
import { StorageChannel, type Library, type ListUserLibrariesResponse } from '../shared/ipcChannels';
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
  listUserLibraries: async (): Promise<IpcResponse<UserLibrary[]>> => {
    const channel = StorageChannel.LIST_USER_LIBRARIES;
    console.log(`[preload.ts] listUserLibraries (invoke) for channel: '${channel}'`);
    try {
      const responseFromMain = await ipcRenderer.invoke(channel) as ListUserLibrariesResponse;
      console.log(`[preload.ts] listUserLibraries (invoke): Received from main:`, responseFromMain);

      if (!responseFromMain || typeof responseFromMain.success !== 'boolean') {
        console.error('[preload.ts] listUserLibraries: Invalid response structure from main:', responseFromMain);
        return { success: false, error: 'Invalid response structure from main process for listUserLibraries.' };
      }

      if (responseFromMain.success && responseFromMain.libraries) {
        const userLibraries: UserLibrary[] = responseFromMain.libraries.map((lib: Library) => ({
          id: lib.id,
          name: lib.name,
          path: lib.path,
          cuelists: lib.cuelists || [], // Assuming Cuelist type is compatible
          // presentationFiles will be undefined as Library type doesn't have it
        }));
        return { success: true, data: userLibraries };
      } else if (responseFromMain.success && !responseFromMain.libraries) {
        // Success true but no libraries array (e.g., empty list of libraries)
        return { success: true, data: [] };
      } else {
        // Not successful
        return { success: false, error: responseFromMain.error || 'Failed to list user libraries in main process.' };
      }
    } catch (error: any) {
      console.error(`[preload.ts] listUserLibraries (invoke): Error on channel '${channel}':`, error);
      return { success: false, error: error?.message || 'Unknown IPC error in listUserLibraries' };
    }
  },

  // Create User Library
  createUserLibrary: async (libraryName: string): Promise<IpcResponse<UserLibrary>> => {
    const channel = StorageChannel.CREATE_USER_LIBRARY;
    console.log(`[preload.ts] createUserLibrary (invoke): Received libraryName: '${libraryName}' for channel: '${channel}'`);
    if (typeof libraryName !== 'string' || libraryName.trim() === '') {
      console.error('[preload.ts] createUserLibrary: libraryName is invalid or empty:', libraryName);
      return { success: false, error: 'Invalid library name provided to preload.' };
    }
    try {
      const result = await ipcRenderer.invoke(channel, libraryName); // Ensure libraryName is passed
      console.log(`[preload.ts] createUserLibrary (invoke): Received from main for '${libraryName}':`, result);
      if (!result || typeof result.success !== 'boolean') {
        console.error('[preload.ts] createUserLibrary: Invalid response structure from main:', result);
        return { success: false, error: 'Invalid response structure from main process' };
      }
      return result as IpcResponse<UserLibrary>;
    } catch (error: any) {
      console.error(`[preload.ts] createUserLibrary (invoke): Error for '${libraryName}' on channel '${channel}':`, error);
      return { success: false, error: error?.message || 'Unknown IPC error in createUserLibrary' };
    }
  },

  // Rename User Library
  renameUserLibrary: async (oldName: string, newName: string): Promise<IpcResponse<UserLibrary>> => {
    const channel = StorageChannel.RENAME_USER_LIBRARY;
    console.log(`[preload.ts] renameUserLibrary (invoke): Received oldName: '${oldName}', newName: '${newName}' for channel: '${channel}'`);
    if (typeof oldName !== 'string' || oldName.trim() === '' || typeof newName !== 'string' || newName.trim() === '') {
      console.error('[preload.ts] renameUserLibrary: oldName or newName is invalid or empty:', oldName, newName);
      return { success: false, error: 'Invalid library name provided to preload.' };
    }
    try {
      const result = await ipcRenderer.invoke(channel, oldName, newName); // Ensure oldName and newName are passed
      console.log(`[preload.ts] renameUserLibrary (invoke): Received from main for '${oldName}' -> '${newName}':`, result);
      if (!result || typeof result.success !== 'boolean') {
        console.error('[preload.ts] renameUserLibrary: Invalid response structure from main:', result);
        return { success: false, error: 'Invalid response structure from main process' };
      }
      return result as IpcResponse<UserLibrary>;
    } catch (error: any) {
      console.error(`[preload.ts] renameUserLibrary (invoke): Error for '${oldName}' -> '${newName}' on channel '${channel}':`, error);
      return { success: false, error: error?.message || 'Unknown IPC error in renameUserLibrary' };
    }
  },

  // Delete User Library
  deleteUserLibrary: async (libraryName: string): Promise<IpcResponse<void>> => {
    const channel = StorageChannel.DELETE_USER_LIBRARY;
    console.log(`[preload.ts] deleteUserLibrary (invoke): Received libraryName: '${libraryName}' for channel: '${channel}'`);
    if (typeof libraryName !== 'string' || libraryName.trim() === '') {
      console.error('[preload.ts] deleteUserLibrary: libraryName is invalid or empty:', libraryName);
      return { success: false, error: 'Invalid library name provided to preload.' };
    }
    try {
      const result = await ipcRenderer.invoke(channel, libraryName); // Ensure libraryName is passed
      console.log(`[preload.ts] deleteUserLibrary (invoke): Received from main for '${libraryName}':`, result);
      if (!result || typeof result.success !== 'boolean') {
        console.error('[preload.ts] deleteUserLibrary: Invalid response structure from main:', result);
        return { success: false, error: 'Invalid response structure from main process' };
      }
      return result as IpcResponse<void>;
    } catch (error: any) {
      console.error(`[preload.ts] deleteUserLibrary (invoke): Error for '${libraryName}' on channel '${channel}':`, error);
      return { success: false, error: error?.message || 'Unknown IPC error in deleteUserLibrary' };
    }
  },

  // Create Presentation File
  createPresentationFile: async (libraryPath: string, baseName?: string): Promise<IpcResponse<{ filePath: string }>> => {
    const channel = StorageChannel.CREATE_PRESENTATION_FILE;
    console.log(`[preload.ts] createPresentationFile (invoke): Received libraryPath: '${libraryPath}', baseName: '${baseName}' for channel: '${channel}'`);
    if (typeof libraryPath !== 'string' || libraryPath.trim() === '') {
      console.error('[preload.ts] createPresentationFile: libraryPath is invalid or empty:', libraryPath);
      return { success: false, error: 'Invalid library path provided to preload.' };
    }
    try {
      const result = await ipcRenderer.invoke(channel, libraryPath, baseName);
      console.log(`[preload.ts] createPresentationFile (invoke): Received from main for '${libraryPath}', baseName '${baseName}':`, result);
      if (!result || typeof result.success !== 'boolean') {
        console.error('[preload.ts] createPresentationFile: Invalid response structure from main:', result);
        return { success: false, error: 'Invalid response structure from main process' };
      }
      return result as IpcResponse<{ filePath: string }>;
    } catch (error: any) {
      console.error(`[preload.ts] createPresentationFile (invoke): Error for '${libraryPath}', baseName '${baseName}' on channel '${channel}':`, error);
      return { success: false, error: error?.message || 'Unknown IPC error in createPresentationFile' };
    }
  },

  // List Presentation Files in a Library
  listPresentationFiles: async (libraryPath: string): Promise<IpcResponse<PresentationFile[]>> => {
    const channel = StorageChannel.LIST_PRESENTATION_FILES;
    console.log(`[preload.ts] listPresentationFiles (invoke): Attempting to invoke for libraryPath: '${libraryPath}' on channel: '${channel}'`);

    if (typeof libraryPath !== 'string' || libraryPath.trim() === '') {
      console.error('[preload.ts] listPresentationFiles: libraryPath is invalid or empty:', libraryPath);
      return { success: false, error: 'Invalid library path provided to preload.', data: [] };
    }

    try {
      // Pass libraryPath directly as a string
      const result = await ipcRenderer.invoke(channel, libraryPath);
      console.log(`[preload.ts] listPresentationFiles (invoke): Received from main for '${libraryPath}':`, result);

      if (!result || typeof result.success !== 'boolean') {
        console.error('[preload.ts] listPresentationFiles: Invalid response structure from main:', result);
        return { success: false, error: 'Invalid response structure from main process', data: [] };
      }
      // Ensure data is an empty array if files are undefined but success is true. Main process should send 'files' not 'data'.
      // The 'data' property is part of the IpcResponse structure, not the payload from main for this specific channel.
      // We construct the IpcResponse here, using 'result.files' for the 'data' field.
      return { success: result.success, data: result.files || [], error: result.error };
    } catch (error: any) {
      console.error(`[preload.ts] listPresentationFiles (invoke): Error for '${libraryPath}' on channel '${channel}':`, error);
      return { success: false, error: error?.message || 'Unknown IPC error in listPresentationFiles', data: [] };
    }
  },

  // Listen for presentation files changes
  onPresentationFilesDidChange: (callback: (event: IpcRendererEvent, data: { libraryPath: string }) => void) => {
    console.log('[preload.ts] Setting up listener for presentation files changes');
    const channel = StorageChannel.PRESENTATION_FILES_DID_CHANGE;
    ipcRenderer.on(channel, callback);
    return () => {
      console.log('[preload.ts] Removing listener for presentation files changes');
      ipcRenderer.removeListener(channel, callback);
    };
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
