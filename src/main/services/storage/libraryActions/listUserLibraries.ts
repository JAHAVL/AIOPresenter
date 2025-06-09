import * as fs from 'fs';
import * as path from 'path';
import { PathService } from '../PathService';
import { Library, ListUserLibrariesResponse } from '../../../../shared/ipcChannels';

/**
 * Lists all user libraries in the presentation library path
 * @param pathService Instance of PathService
 * @returns List of libraries with their metadata
 */
export async function listUserLibraries(pathService: PathService): Promise<ListUserLibrariesResponse> {
  console.log('[listUserLibraries_ACTION] Called');
  try {
    const presentationLibraryPath = pathService.getPresentationLibraryPath();
    if (!presentationLibraryPath) {
      console.error('[listUserLibraries_ACTION] Presentation library path is not configured.');
      return { success: false, error: 'Presentation library path is not configured.' };
    }

    if (!fs.existsSync(presentationLibraryPath)) {
      console.error(`[listUserLibraries_ACTION] Presentation library path does not exist: ${presentationLibraryPath}`);
      return { success: false, error: `Presentation library path does not exist: ${presentationLibraryPath}` };
    }

    const directories = await fs.promises.readdir(presentationLibraryPath, { withFileTypes: true });
    const libraryDirs = directories.filter(dirent => dirent.isDirectory());

    const libraries: Library[] = libraryDirs.map(dir => {
      const libraryPath = path.join(presentationLibraryPath, dir.name);
      return {
        id: dir.name, // Using directory name as ID for simplicity
        name: dir.name,
        path: libraryPath,
        type: 'custom' // Assuming all these are custom libraries
      };
    });

    console.log(`[listUserLibraries_ACTION] Found ${libraries.length} libraries`);
    return { success: true, libraries };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[listUserLibraries_ACTION] Error listing libraries:', errorMessage);
    return { success: false, error: `Failed to list libraries: ${errorMessage}` };
  }
}
