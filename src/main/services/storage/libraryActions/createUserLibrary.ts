import * as fs from 'fs';
import * as path from 'path';
import { PathService } from '../PathService';

/**
 * Creates a new user library with the given name
 * @param pathService Instance of PathService
 * @param libraryName Name of the library to create
 * @returns Success status and path to the created library
 */
export async function createUserLibrary(
  pathService: PathService,
  libraryName: string
): Promise<{ success: boolean; path?: string; error?: string }> {
  console.log(`[createUserLibrary_ACTION] Creating library ${libraryName}`);
  try {
    const sanitizedName = libraryName.replace(/[^a-zA-Z0-9_\-\s]/g, '');
    if (!sanitizedName) {
      return { success: false, error: 'Invalid library name.' };
    }

    const presentationLibraryPath = pathService.getPresentationLibraryPath();
    if (!presentationLibraryPath) {
      console.error('[createUserLibrary_ACTION] Presentation library path is not configured.');
      return { success: false, error: 'Presentation library path is not configured.' };
    }
    
    const libraryPath = path.join(presentationLibraryPath, sanitizedName);

    if (fs.existsSync(libraryPath)) {
      return { success: false, error: `Library '${sanitizedName}' already exists.` };
    }

    await fs.promises.mkdir(libraryPath, { recursive: true });
    console.log(`[createUserLibrary_ACTION] Created library at ${libraryPath}`);
    return { success: true, path: libraryPath };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[createUserLibrary_ACTION] Error creating library ${libraryName}:`, errorMessage);
    return { success: false, error: `Failed to create library: ${errorMessage}` };
  }
}
