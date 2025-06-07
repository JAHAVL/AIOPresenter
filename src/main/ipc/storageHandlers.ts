import { ipcMain, BrowserWindow } from 'electron';
import path from 'path';
import { StorageService } from '../StorageService';
import { StorageChannel, Library } from '../../shared/ipcChannels'; // For MAIN_PROCESS_DEBUG_MESSAGE

console.log('<<<<< LOADING SIMPLIFIED storageHandlers.ts >>>>>');

let localMainWindow: BrowserWindow | null = null;
// storageServiceInstance will be passed in

// Helper to send debug messages to renderer and main console
const sendDebugLog = (message: string, data?: any) => {
  const fullMessage = `[storageHandlers.ts DEBUG] ${message}`;
  console.log(fullMessage, data || ''); // Log to main process console
  if (localMainWindow && !localMainWindow.isDestroyed() && localMainWindow.webContents) {
    localMainWindow.webContents.send(StorageChannel.MAIN_PROCESS_DEBUG_MESSAGE, {
      source: 'storageHandlers.ts',
      log: fullMessage,
      data: data || null,
      timestamp: new Date().toISOString(),
    });
  }
};

export const initializeStorageIpcHandlers = (
  ipcMainInstance: typeof ipcMain, // Use Electron's ipcMain type directly
  browserWindow: BrowserWindow | null,
  storageService: typeof StorageService // Pass in the StorageService instance, type is typeof the imported instance value
): void => {
  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  console.log('!!!! ENTERING initializeStorageIpcHandlers (SIMPLIFIED) !!!!');
  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  localMainWindow = browserWindow;
  // storageService instance is now passed in, no need to create one here.
  sendDebugLog('SIMPLIFIED initializeStorageIpcHandlers CALLED. Using passed StorageService instance.');
  
  const marker = (ipcMainInstance as any).__MAIN_TS_MARKER__;
  sendDebugLog(`Checking for marker on ipcMainInstance: ${marker === undefined ? 'NOT FOUND' : marker}`);
  sendDebugLog(`Type of ipcMainInstance: ${typeof ipcMainInstance}, Keys: ${ipcMainInstance ? Object.keys(ipcMainInstance).join(', ') : 'null'}`);
  sendDebugLog(`Initial event names in storageHandlers: ${JSON.stringify(ipcMainInstance.eventNames())}`);

  try {
    sendDebugLog("[storageHandlers.ts DEBUG] Attempting to register 'test-channel' with ipcMain.on from storageHandlers.");
    ipcMainInstance.on('test-channel', (event, arg) => {
      sendDebugLog(`[storageHandlers.ts DEBUG] 'test-channel' (using .on) in storageHandlers INVOKED with arg: ${JSON.stringify(arg)}.`);
      event.reply('test-channel-reply', { message: 'Response from SIMPLIFIED test-channel (using .on) in storageHandlers.ts' });
    });
    sendDebugLog("[storageHandlers.ts DEBUG] SUCCESSFULLY called .on() for 'test-channel' in storageHandlers.");
  } catch (e: any) {
    sendDebugLog(`[storageHandlers.ts DEBUG] ERROR calling .on() for 'test-channel': ${e.message}`, { error: e });
  }

  sendDebugLog(`Event names in storageHandlers AFTER 'test-channel' registration: ${JSON.stringify(ipcMainInstance.eventNames())}`);

  // Function to list user libraries using StorageService
  const listUserLibraries = async (): Promise<Library[]> => {
    sendDebugLog('[storageHandlers.ts] listUserLibraries function called, using StorageService.');
    try {
      const libraryFolderNames = await storageService.listUserLibraryFolders();
      const presentationLibraryPath = storageService.getPresentationLibraryPath();
      
      const libraries: Library[] = libraryFolderNames.map((folderName: string) => ({
        id: folderName, // Use folder name as ID for simplicity
        name: folderName,
        path: path.join(presentationLibraryPath, folderName),
        cues: [] // Initialize with empty cues, to be loaded on demand
      }));
      
      sendDebugLog(`[storageHandlers.ts] Successfully fetched libraries from StorageService: ${JSON.stringify(libraries)}`);
      return libraries;
    } catch (error: any) {
      sendDebugLog(`[storageHandlers.ts] Error in listUserLibraries (using StorageService): ${error.message}`, { error });
      // It's important to throw the error or return an empty array based on desired error handling for the IPC reply
      // For now, returning empty array to ensure the IPC reply structure is maintained even on error.
      return []; 
    }
  };

  // Handler for LIST_USER_LIBRARIES using ipcMain.handle
  ipcMainInstance.handle(StorageChannel.LIST_USER_LIBRARIES, async (event) => {
    sendDebugLog(`[storageHandlers.ts DEBUG] '${StorageChannel.LIST_USER_LIBRARIES}' (using .handle) INVOKED.`);
    try {
      const libraries = await listUserLibraries(); // This internal function already logs
      // No need to reply with success/error structure, .handle() takes care of promise resolution/rejection
      return libraries;
    } catch (error: any) {
      sendDebugLog(`[storageHandlers.ts DEBUG] Error in '${StorageChannel.LIST_USER_LIBRARIES}' handler: ${error.message}`);
      // When using .handle, throwing the error will propagate it to the renderer's .invoke() catch block
      throw error; 
    }
  });
  sendDebugLog(`[storageHandlers.ts DEBUG] SUCCESSFULLY called .handle() for '${StorageChannel.LIST_USER_LIBRARIES}'.`);

  // Handler for GET_STORAGE_PATHS using ipcMain.handle
  ipcMainInstance.handle(StorageChannel.GET_STORAGE_PATHS, async () => {
    sendDebugLog(`[storageHandlers.ts DEBUG] '${StorageChannel.GET_STORAGE_PATHS}' (using .handle) INVOKED.`);
    try {
      const paths = {
        globalLibrariesRoot: storageService.getGlobalLibrariesRoot(),
        projectsRoot: storageService.getUserProjectsRootPath(),
        presentationLibraryPath: storageService.getPresentationLibraryPath(),
        defaultUserLibraryPath: storageService.getDefaultUserLibraryPath(),
        mediaLibraryPath: storageService.getMediaLibraryPath(),
      };
      sendDebugLog(`[storageHandlers.ts DEBUG] Returning paths for '${StorageChannel.GET_STORAGE_PATHS}': ${JSON.stringify(paths)}`);
      // .handle will automatically wrap this in { success: true, data: paths } if resolved,
      // or { success: false, error: ... } if rejected. 
      // However, the client expects { success: true, paths: ... }
      // So we explicitly return the structure the client expects.
      return { success: true, paths };
    } catch (error: any) {
      sendDebugLog(`[storageHandlers.ts DEBUG] Error in '${StorageChannel.GET_STORAGE_PATHS}' handler: ${error.message}`);
      // When using .handle, throwing the error will propagate it to the renderer's .invoke() catch block
      // which then wraps it. To match client expectation of { success: false, error: ... }
      return { success: false, error: error.message || 'An unknown error occurred' };
    }
  });
  sendDebugLog(`[storageHandlers.ts DEBUG] SUCCESSFULLY called .handle() for '${StorageChannel.GET_STORAGE_PATHS}'.`);

  // Handler for CREATE_PRESENTATION_FILE using ipcMain.handle
  ipcMainInstance.handle(StorageChannel.CREATE_PRESENTATION_FILE, async (event, { libraryPath, baseName }: { libraryPath: string; baseName: string }) => {
    sendDebugLog(`[storageHandlers.ts DEBUG] '${StorageChannel.CREATE_PRESENTATION_FILE}' (using .handle) INVOKED with libraryPath: ${libraryPath}, baseName: ${baseName}.`);
    try {
      const result = await storageService.createPresentationFile(libraryPath, baseName);
      sendDebugLog(`[storageHandlers.ts DEBUG] Result from createPresentationFile for '${StorageChannel.CREATE_PRESENTATION_FILE}': ${JSON.stringify(result)}`);
      return result; // This will be { success: boolean, filePath?: string, error?: string }
    } catch (error: any) {
      sendDebugLog(`[storageHandlers.ts DEBUG] Error in '${StorageChannel.CREATE_PRESENTATION_FILE}' handler: ${error.message}`);
      return { success: false, error: error.message || 'An unknown error occurred while creating presentation file.' };
    }
  });
  sendDebugLog(`[storageHandlers.ts DEBUG] SUCCESSFULLY called .handle() for '${StorageChannel.CREATE_PRESENTATION_FILE}'.`);

  sendDebugLog(`Event names in storageHandlers AFTER all registrations: ${JSON.stringify(ipcMainInstance.eventNames())}`);
  sendDebugLog('Storage IPC handlers (SIMPLIFIED) initialization complete.');
};
