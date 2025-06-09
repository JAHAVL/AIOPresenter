import * as fs from 'fs';
import * as path from 'path';
import { PathService } from '../PathService';

/**
 * Renames a user library
 * @param pathService Instance of PathService
 * @param oldName Current name of the library
 * @param newName New name for the library
 * @returns Success status and path to the renamed library
 */
export async function renameUserLibrary(
  pathService: PathService,
  oldName: string,
  newName: string
): Promise<{ success: boolean; path?: string; error?: string }> {
  console.log(`[renameUserLibrary_ACTION] Renaming library from ${oldName} to ${newName}`);
  try {
    const sanitizedOldName = oldName.replace(/[^a-zA-Z0-9_\-\s]/g, '');
    const sanitizedNewName = newName.replace(/[^a-zA-Z0-9_\-\s]/g, '');

    if (!sanitizedOldName || !sanitizedNewName) {
      return { success: false, error: 'Invalid library name(s).' };
    }

    const presentationLibraryPath = pathService.getPresentationLibraryPath();
    if (!presentationLibraryPath) {
      console.error('[renameUserLibrary_ACTION] Presentation library path is not configured.');
      return { success: false, error: 'Presentation library path is not configured.' };
    }

    const oldPath = path.join(presentationLibraryPath, sanitizedOldName);
    const newPath = path.join(presentationLibraryPath, sanitizedNewName);

    if (!fs.existsSync(oldPath)) {
      return { success: false, error: `Library '${sanitizedOldName}' does not exist.` };
    }

    if (fs.existsSync(newPath)) {
      return { success: false, error: `Library '${sanitizedNewName}' already exists.` };
    }

    await fs.promises.rename(oldPath, newPath);
    console.log(`[renameUserLibrary_ACTION] Renamed library from ${oldPath} to ${newPath}`);
    return { success: true, path: newPath };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[renameUserLibrary_ACTION] Error renaming library from ${oldName} to ${newName}:`, errorMessage);
    return { success: false, error: `Failed to rename library: ${errorMessage}` };
  }
}
