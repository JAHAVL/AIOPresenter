// Define the interface for the exposed Electron API
// Local ElectronAPI interface and type assertion removed.
// Relying on global window.electronAPI type from preload.d.ts.
const electronAPI = window.electronAPI;

// Adjust the path if your build process places ipcChannels.ts elsewhere or if it remains .ts
import { StorageChannel, Library, ListUserLibrariesResponse } from '../../../../shared/ipcChannels';

// Local ElectronWindow interface and declaration removed.
// Global type from preload.d.ts will be used for window.electronAPI.

import type { IpcResponse, UserLibrary, StoragePaths, PresentationFile, Cuelist, Cue } from '@shared/types';

/**
 * Retrieves all relevant storage paths from the main process.
 */
export async function getStoragePaths(): Promise<IpcResponse<StoragePaths>> {
  try {
    console.log('[IPC CLIENT] Requesting storage paths...');
    const response = await electronAPI.invoke(StorageChannel.GET_STORAGE_PATHS) as IpcResponse<StoragePaths>; // Cast to IpcResponse
    console.log('[IPC CLIENT] Received storage paths response:', response);
    if (!response || !response.success) { // Added null check for response
        console.error('Error fetching storage paths:', response ? response.error : 'Response was null or undefined');
    }
    // Provide a fallback if response is null/undefined, otherwise return response
    return response || { success: false, error: 'Received null or undefined response from main process for GET_STORAGE_PATHS' };
  } catch (error) {
    console.error('IPC call to GET_STORAGE_PATHS failed:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Lists all user-created libraries within the Presentation Global Library.
 */
export async function listUserLibraries(): Promise<IpcResponse<UserLibrary[]>> {
  try {
    console.log('[storageClient.ts] Calling window.electronAPI.listUserLibraries()');
    const response = await window.electronAPI.listUserLibraries(); // Expected to be IpcResponse<UserLibrary[]>

    if (!response || typeof response.success !== 'boolean') {
      console.error('[storageClient.ts] listUserLibraries: Invalid response structure from preload:', response);
      return { success: false, error: 'Invalid response structure from preload for listUserLibraries' };
    }

    // The preload script now ensures the data field contains UserLibrary[] if successful.
    // If not successful, it forwards the error from the main process or its own error.
    console.log('[storageClient.ts] listUserLibraries: Received response from preload:', response);
    return response; // Directly return the IpcResponse<UserLibrary[]>

  } catch (error) {
    console.error('[storageClient.ts] Error in listUserLibraries:', error);
    // Ensure a consistent error response shape
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMessage };
  }
}

/**
 * Creates a new user library in the Presentation Global Library.
 * @param libraryName The desired name for the new library.
 */
export async function createUserLibrary(libraryName: string): Promise<IpcResponse<UserLibrary>> {
  try {
    console.log(`[IPC CLIENT] Requesting creation of user library: ${libraryName}`);
    const response: IpcResponse<UserLibrary> = await electronAPI.invoke(StorageChannel.CREATE_USER_LIBRARY, libraryName);
    console.log('[IPC CLIENT] Received create user library response:', response);
    if (!response.success) {
        console.error('Error creating user library:', response.error);
    }
    return response;
  } catch (error) {
    console.error('IPC call to CREATE_USER_LIBRARY failed:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Lists all presentation files in a library.
 * @param libraryPath The absolute path to the library folder to list presentations from.
 */
export async function listPresentationFiles(
  libraryPath: string
): Promise<IpcResponse<PresentationFile[]>> {
  try {
    console.log('[storageClient] Listing presentation files in library:', libraryPath);
    
    if (!window.electronAPI || !window.electronAPI.listPresentationFiles) {
      console.error('[storageClient] window.electronAPI.listPresentationFiles is not available');
      return { success: false, error: 'API not available' };
    }
    
    // Call the IPC channel to list presentation files in the library
    const response = await window.electronAPI.listPresentationFiles(libraryPath);
    
    if (!response.success) {
      console.error('[storageClient] Error from listPresentationFiles IPC call:', response.error);
      return { success: false, error: response.error || 'Failed to list presentation files' };
    }
    
    if (!Array.isArray(response.data)) {
      console.error('[storageClient] Unexpected response format from listPresentationFiles:', response);
      return { success: false, error: 'Unexpected response format' };
    }
    
    console.log(`[storageClient] Successfully listed ${response.data.length} presentation files in ${libraryPath}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('[storageClient] Error listing presentation files:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Creates a new .AIOPresentation file in the specified library.
 * @param libraryPath The absolute path to the library folder where the file should be created.
 * @param baseName The base name for the new presentation file (e.g., "New Presentation"). Defaults if not provided.
 */
export async function createPresentationFile(
  libraryPath: string,
  baseName?: string
): Promise<IpcResponse<{ filePath?: string }>> {
  try {
    console.log(`[IPC CLIENT] Requesting creation of presentation file in library: ${libraryPath} with baseName: ${baseName || 'New Presentation'}`);
    // The actual call to the preload-exposed function
    const response: { success: boolean; filePath?: string; error?: string } = 
      await window.electronAPI.createPresentationFile(libraryPath, baseName);
    
    console.log('[IPC CLIENT] Received create presentation file response:', response);
    if (!response.success) {
        console.error('Error creating presentation file:', response.error);
    }
    // Ensure the response shape matches IpcResponse, specifically for the 'data' field if success.
    if (response.success) {
      return { success: true, data: { filePath: response.filePath } };
    }
    return { success: false, error: response.error };

  } catch (error) {
    console.error('IPC call to createPresentationFile failed:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Renames an existing user library.
 * @param oldLibraryName The current name of the library.
 * @param newLibraryName The new desired name for the library.
 */
export async function renameUserLibrary(oldLibraryName: string, newLibraryName: string): Promise<IpcResponse<UserLibrary>> {
  try {
    console.log(`[IPC CLIENT] Requesting rename of user library from '${oldLibraryName}' to '${newLibraryName}'`);
    const response: IpcResponse<UserLibrary> = await electronAPI.invoke(StorageChannel.RENAME_USER_LIBRARY, oldLibraryName, newLibraryName);
    console.log('[IPC CLIENT] Received rename user library response:', response);
    if (!response.success) {
        console.error('Error renaming user library:', response.error);
    }
    return response;
  } catch (error) {
    console.error('IPC call to RENAME_USER_LIBRARY failed:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMessage };
  }
}

// Add more client functions here to correspond with other handlers in storageHandlers.js as needed.
// For example:
// - readLibraryItem(libraryName: string, itemName: string)
// - writeLibraryItem(libraryName: string, itemName: string, content: any)
// - listProjects()
// - createProject(projectName: string)
// etc.
