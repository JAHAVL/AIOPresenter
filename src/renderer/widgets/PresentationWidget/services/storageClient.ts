// Define the interface for the exposed Electron API
// Local ElectronAPI interface and type assertion removed.
// Relying on global window.electronAPI type from preload.d.ts.
const electronAPI = window.electronAPI;

// Adjust the path if your build process places ipcChannels.ts elsewhere or if it remains .ts
import { StorageChannel, Cue, Library, PresentationFile } from '../../../../shared/ipcChannels';

// Local ElectronWindow interface and declaration removed.
// Global type from preload.d.ts will be used for window.electronAPI.

export interface StoragePaths {
  globalLibrariesRoot: string;
  projectsRoot: string;
  presentationLibraryRoot: string;
  defaultUserLibraryPath: string;
}

export interface UserLibrary {
  name: string;
  path: string;
  cues: Cue[];
}

interface IpcResponse<T = any> {
  success: boolean;
  data?: T; 
  paths?: T; // Specifically for getStoragePaths
  // name?: string; // Covered by data for createUserLibrary
  // path?: string; // Covered by data for createUserLibrary
  error?: string;
  alreadyExists?: boolean; // Specifically for createUserLibrary
}

/**
 * Retrieves all relevant storage paths from the main process.
 */
export async function getStoragePaths(): Promise<IpcResponse<StoragePaths>> {
  try {
    console.log('[IPC CLIENT] Requesting storage paths...');
    const response: IpcResponse<StoragePaths> = await electronAPI.invoke(StorageChannel.GET_STORAGE_PATHS);
    console.log('[IPC CLIENT] Received storage paths response:', response);
    if (!response.success) {
        console.error('Error fetching storage paths:', response.error);
    }
    return response;
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
    console.log('[storageClient.ts] Calling window.electronAPI.listUserLibraries() (expecting IpcResponse<Library[]> as per TS lint)...');
    // Assuming, due to lint error, that TypeScript thinks window.electronAPI.listUserLibraries()
    // returns Promise<IpcResponse<Library[]>>. Our actual preload returns Promise<Library[]>
    // but we code defensively against what TS reports.
    const responseFromPreload = await window.electronAPI.listUserLibraries() as any; // Cast to any to bypass immediate TS error if types mismatch, then check shape.

    // Check if responseFromPreload is the direct array (Library[]) or an IpcResponse object
    if (Array.isArray(responseFromPreload)) {
      // It's directly Library[] - our preload.ts is working as intended and d.ts might be wrong or TS is confused
      console.log('[storageClient.ts] window.electronAPI.listUserLibraries() returned Library[] directly.');
      const actualLibraries: Library[] = responseFromPreload;
      const userLibs: UserLibrary[] = actualLibraries.map(lib => ({
        name: lib.name,
        path: lib.path,
        cues: [] // Initialize with empty cues array
      }));
      return { success: true, data: userLibs };
    } else if (responseFromPreload && typeof responseFromPreload.success === 'boolean') {
      // It's an IpcResponse<Library[]> object - TS lint error was predictive or d.ts is aligned with this
      console.log('[storageClient.ts] window.electronAPI.listUserLibraries() returned IpcResponse.');
      const ipcResponseFromPreload = responseFromPreload as IpcResponse<Library[]>;
      if (ipcResponseFromPreload.success && ipcResponseFromPreload.data) {
        const userLibs: UserLibrary[] = ipcResponseFromPreload.data.map(lib => ({
          name: lib.name,
          path: lib.path,
          cues: [] // Initialize with empty cues array
        }));
        return { success: true, data: userLibs };
      } else {
        console.error('[storageClient.ts] IpcResponse from preload was not successful or data missing:', ipcResponseFromPreload.error);
        return { success: false, error: ipcResponseFromPreload.error || 'API call reported failure but no error message' };
      }
    } else {
      // Unexpected structure
      console.error('[storageClient.ts] Unexpected response structure from window.electronAPI.listUserLibraries():', responseFromPreload);
      return { success: false, error: 'Unexpected response structure from API.' };
    }
  } catch (error) { // This catch is for if the `await` itself rejects (e.g. IPC transport error, or error thrown in main handler)
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[storageClient.ts] Error invoking window.electronAPI.listUserLibraries():', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Creates a new user library in the Presentation Global Library.
 * @param libraryName The desired name for the new library.
 */
export async function createUserLibrary(libraryName: string): Promise<IpcResponse<{name: string, path: string}>> {
  try {
    console.log(`[IPC CLIENT] Requesting creation of user library: ${libraryName}`);
    const response: IpcResponse<{name: string, path: string}> = await electronAPI.invoke(StorageChannel.CREATE_USER_LIBRARY, libraryName);
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

// Add more client functions here to correspond with other handlers in storageHandlers.js as needed.
// For example:
// - readLibraryItem(libraryName: string, itemName: string)
// - writeLibraryItem(libraryName: string, itemName: string, content: any)
// - listProjects()
// - createProject(projectName: string)
// etc.
