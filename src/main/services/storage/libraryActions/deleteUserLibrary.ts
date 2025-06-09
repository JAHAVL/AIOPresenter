import * as fs from 'fs';
import * as path from 'path';
import { PathService } from '../PathService';

/**
 * Deletes a user library
 * @param pathService Instance of PathService
 * @param libraryName Name of the library to delete
 * @returns Success status
 */
export async function deleteUserLibrary(
  pathService: PathService,
  libraryName: string
): Promise<{ success: boolean; error?: string }> {
  console.log(`[deleteUserLibrary_ACTION] Deleting library ${libraryName}`);
  try {
    const sanitizedName = libraryName.replace(/[^a-zA-Z0-9_\-\s]/g, '');
    if (!sanitizedName) {
      return { success: false, error: 'Invalid library name.' };
    }

    const presentationLibraryPath = pathService.getPresentationLibraryPath();
    if (!presentationLibraryPath) {
      console.error('[deleteUserLibrary_ACTION] Presentation library path is not configured.');
      return { success: false, error: 'Presentation library path is not configured.' };
    }
    const libraryPath = path.join(presentationLibraryPath, sanitizedName);

    if (!fs.existsSync(libraryPath)) {
      return { success: false, error: `Library '${sanitizedName}' does not exist.` };
    }

    await fs.promises.rm(libraryPath, { recursive: true, force: true });
    console.log(`[deleteUserLibrary_ACTION] Deleted library at ${libraryPath}`);
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[deleteUserLibrary_ACTION] Error deleting library ${libraryName}:`, errorMessage);
    return { success: false, error: `Failed to delete library: ${errorMessage}` };
  }
}
