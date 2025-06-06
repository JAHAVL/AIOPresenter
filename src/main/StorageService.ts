// AIOPRESENTER/src/main/StorageService.ts
import os from 'os';
import { app, BrowserWindow } from 'electron';
import path from 'path';
import fs from 'fs'; // Still needed for some synchronous checks and other file ops
import chokidar, { FSWatcher } from 'chokidar'; // Added for robust watching
import { PATH_CONFIG } from '@utils/pathconfig';
import { StorageChannel, Cue } from '../shared/ipcChannels';

class StorageService {
  private documentsBasePath: string;
  private globalLibrariesRootPath: string = '';
  private presentationLibraryPath: string = '';
  private defaultUserLibraryPath: string = '';
  private mediaLibraryPath: string = '';
  private userProjectsRootPath: string = '';
  private libraryWatcher: FSWatcher | null = null; // Changed type

  constructor(customLibrariesPath?: string) {
    console.log('[SS_DEBUG_MAIN] StorageService Constructor: Called.');
    this.documentsBasePath = app.getPath('documents');
    console.log(`[SS_DEBUG_MAIN] StorageService Constructor: Documents base path set to: ${this.documentsBasePath}`);

    const aioAppBasePathForProjects = path.join(this.documentsBasePath, PATH_CONFIG.AIO_DIR_NAME, PATH_CONFIG.APP_DIR_NAME);
    this.userProjectsRootPath = path.join(aioAppBasePathForProjects, PATH_CONFIG.PROJECTS_DIR_NAME);
    console.log(`[SS_DEBUG_MAIN] StorageService Constructor: User projects root path set to: ${this.userProjectsRootPath}`);

    if (customLibrariesPath) {
      console.log(`[SS_DEBUG_MAIN] StorageService Constructor: Using custom library path: ${customLibrariesPath}`);
      this.globalLibrariesRootPath = customLibrariesPath;
      this.presentationLibraryPath = customLibrariesPath;
      this.defaultUserLibraryPath = path.join(customLibrariesPath, PATH_CONFIG.DEFAULT_LIBRARY_DIR_NAME);
      this.mediaLibraryPath = path.join(customLibrariesPath, PATH_CONFIG.MEDIA_LIBRARY_DIR_NAME);
    } else {
      console.log("[SS_DEBUG_MAIN] StorageService Constructor: Using user's preferred library path structure.");
      const userPreferredLibrariesBase = path.join(this.documentsBasePath, PATH_CONFIG.AIO_DIR_NAME, PATH_CONFIG.APP_DIR_NAME_MIXED_CASE_FOR_LIBS);
      this.presentationLibraryPath = path.join(userPreferredLibrariesBase, PATH_CONFIG.LIBRARIES_DIR_NAME);
      this.globalLibrariesRootPath = this.presentationLibraryPath;
      this.defaultUserLibraryPath = path.join(this.presentationLibraryPath, PATH_CONFIG.DEFAULT_LIBRARY_DIR_NAME);
      this.mediaLibraryPath = path.join(this.presentationLibraryPath, PATH_CONFIG.MEDIA_LIBRARY_DIR_NAME);
    }

    console.log('[SS_DEBUG_MAIN] StorageService Constructor: Final Initialized Paths:');
    console.log(`  Documents Base: ${this.documentsBasePath}`);
    console.log(`  Global Libraries Root (effective): ${this.globalLibrariesRootPath}`);
    console.log(`  User Projects Root: ${this.userProjectsRootPath}`);
    console.log(`  Presentation Library (actual root for libraries): ${this.presentationLibraryPath}`);
    console.log(`  Default User Library: ${this.defaultUserLibraryPath}`);
    console.log(`  Media Library: ${this.mediaLibraryPath}`);

    this.initializeAsync();
  }

  private async initializeAsync(): Promise<void> {
    console.log('[SS_DEBUG_MAIN] initializeAsync: Starting initialization...');
    try {
      await this.ensureAppDirectoriesExist();
      console.log('[SS_DEBUG_MAIN] initializeAsync: All required directories ensured.');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[SS_DEBUG_MAIN] initializeAsync: Error during initialization:', errorMessage);
      throw new Error(`Initialization failed: ${errorMessage}`);
    }
    console.log('[SS_DEBUG_MAIN] initializeAsync: Initialization complete. Setting up library watcher.');
    this.startWatchingLibrariesDirectory();
  }

  private async directoryExists(checkPath: string): Promise<boolean> {
    // console.log(`[SS_DEBUG_MAIN] directoryExists: Checking path: ${checkPath}`);
    try {
      await fs.promises.access(checkPath, fs.constants.F_OK);
      // console.log(`[SS_DEBUG_MAIN] directoryExists: Path exists: ${checkPath}`);
      return true;
    } catch {
      // console.log(`[SS_DEBUG_MAIN] directoryExists: Path does NOT exist: ${checkPath}`);
      return false;
    }
  }

  public updateLibrariesPath(newPath: string): void {
    console.log(`[SS_DEBUG_MAIN] updateLibrariesPath: Updating libraries path to: ${newPath}`);
    this.globalLibrariesRootPath = newPath;
    this.presentationLibraryPath = newPath;
    this.defaultUserLibraryPath = path.join(newPath, PATH_CONFIG.DEFAULT_LIBRARY_DIR_NAME);
    this.mediaLibraryPath = path.join(newPath, PATH_CONFIG.MEDIA_LIBRARY_DIR_NAME);

    console.log('[SS_DEBUG_MAIN] updateLibrariesPath: Paths updated.');
    console.log(`  Global Libraries Root (effective): ${this.globalLibrariesRootPath}`);
    console.log(`  Presentation Library (actual root for libraries): ${this.presentationLibraryPath}`);
    console.log(`  Default User Library: ${this.defaultUserLibraryPath}`);
    console.log(`  Media Library: ${this.mediaLibraryPath}`);
    this.initializeAsync(); // Re-initialize to ensure directories and watcher are set for the new path
  }

  public async saveCueFile(libraryName: string, cueName: string, cueData: Cue): Promise<{ success: boolean; path?: string; error?: string }> {
    const libraryPath = path.join(this.presentationLibraryPath, libraryName);
    console.log(`[SS_DEBUG_MAIN] saveCueFile: Attempting to save cue '${cueName}' in library '${libraryName}' at path: ${libraryPath}`);
    try {
      await this.ensureDirectoryExists(libraryPath);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[SS_DEBUG_MAIN] saveCueFile: Error creating library directory ${libraryPath}:`, errorMessage);
      return { success: false, error: `Failed to create library directory: ${errorMessage}` };
    }

    let fileName = `${cueName}.AIOPresentation`;
    let filePath = path.join(libraryPath, fileName);
    let counter = 1;

    try {
      while (await fs.promises.access(filePath).then(() => true).catch(() => false)) {
        fileName = `${cueName}-${counter}.AIOPresentation`;
        filePath = path.join(libraryPath, fileName);
        counter++;
      }
      console.log(`[SS_DEBUG_MAIN] saveCueFile: Determined final file path: ${filePath}`);
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`[SS_DEBUG_MAIN] saveCueFile: Error checking file existence for ${filePath}:`, errorMessage);
        return { success: false, error: `Error checking file existence: ${errorMessage}` };
    }
    
    try {
      const jsonContent = JSON.stringify(cueData, null, 2);
      await fs.promises.writeFile(filePath, jsonContent, 'utf8');
      console.log(`[SS_DEBUG_MAIN] saveCueFile: Successfully saved cue to ${filePath}`);
      return { success: true, path: filePath };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[SS_DEBUG_MAIN] saveCueFile: Error saving cue to ${filePath}:`, errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    // console.log(`[SS_DEBUG_MAIN] ensureDirectoryExists: Ensuring directory: ${dirPath}`);
    try {
      await fs.promises.mkdir(dirPath, { recursive: true });
      // console.log(`[SS_DEBUG_MAIN] ensureDirectoryExists: Successfully ensured directory (created if didn't exist): ${dirPath}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[SS_DEBUG_MAIN] ensureDirectoryExists: Failed to ensure directory ${dirPath}:`, errorMessage);
      throw new Error(`Failed to ensure directory ${dirPath}: ${errorMessage}`);
    }
  }

  private async ensureAppDirectoriesExist(): Promise<void> {
    console.log('[SS_DEBUG_MAIN] ensureAppDirectoriesExist: Ensuring application directories exist.');
    const aioAppBasePath = path.join(this.documentsBasePath, PATH_CONFIG.AIO_DIR_NAME, PATH_CONFIG.APP_DIR_NAME);
    
    await this.ensureDirectoryExists(aioAppBasePath);
    console.log(`[SS_DEBUG_MAIN] ensureAppDirectoriesExist: Ensured AIO App Base Path: ${aioAppBasePath}`);
    await this.ensureDirectoryExists(this.presentationLibraryPath);
    console.log(`[SS_DEBUG_MAIN] ensureAppDirectoriesExist: Ensured Presentation Library Path: ${this.presentationLibraryPath}`);
    await this.ensureDirectoryExists(this.defaultUserLibraryPath);
    console.log(`[SS_DEBUG_MAIN] ensureAppDirectoriesExist: Ensured Default User Library Path: ${this.defaultUserLibraryPath}`);
    await this.ensureDirectoryExists(this.mediaLibraryPath);
    console.log(`[SS_DEBUG_MAIN] ensureAppDirectoriesExist: Ensured Media Library Path: ${this.mediaLibraryPath}`);
    await this.ensureDirectoryExists(this.userProjectsRootPath);
    console.log(`[SS_DEBUG_MAIN] ensureAppDirectoriesExist: Ensured User Projects Root Path: ${this.userProjectsRootPath}`);
    console.log('[SS_DEBUG_MAIN] ensureAppDirectoriesExist: Application directory structure ensured.');
  }

  public getGlobalLibrariesRoot(): string {
    return this.globalLibrariesRootPath;
  }

  public getUserProjectsRootPath(): string {
    return this.userProjectsRootPath;
  }

  public getPresentationLibraryPath(): string {
    return this.presentationLibraryPath;
  }

  public async listUserLibraryFolders(): Promise<string[]> {
    console.log(`[SS_DEBUG_MAIN] listUserLibraryFolders: Called for path: ${this.presentationLibraryPath}`);
    if (!this.presentationLibraryPath || !(await this.directoryExists(this.presentationLibraryPath))) {
      console.warn('[SS_DEBUG_MAIN] listUserLibraryFolders: Presentation library path does not exist or is not set. Returning empty array.');
      return [];
    }

    try {
      const entries = await fs.promises.readdir(this.presentationLibraryPath, { withFileTypes: true });
      const libraryFolders = entries
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      console.log('[SS_DEBUG_MAIN] listUserLibraryFolders: Found library folders:', libraryFolders);
      return libraryFolders;
    } catch (error: any) {
      console.error('[SS_DEBUG_MAIN] listUserLibraryFolders: Error listing user library folders:', error.message);
      return [];
    }
  }

  public async getLibraryCues(libraryName: string): Promise<Cue[]> {
    const libraryPath = path.join(this.presentationLibraryPath, libraryName);
    const cueFilePath = path.join(libraryPath, 'cue.json'); // Using 'cue.json' directly
    console.log(`[SS_DEBUG_MAIN] getLibraryCues: Attempting to read cues for library '${libraryName}' from ${cueFilePath}`);

    try {
      // First, ensure the library directory itself exists
      if (!(await this.directoryExists(libraryPath))) {
        console.warn(`[SS_DEBUG_MAIN] getLibraryCues: Library folder '${libraryName}' does not exist at ${libraryPath}. Returning empty cues.`);
        return [];
      }

      // Check if cue.json exists before trying to read it
      await fs.promises.access(cueFilePath, fs.constants.F_OK);
      const fileContent = await fs.promises.readFile(cueFilePath, 'utf-8');
      const cues: Cue[] = JSON.parse(fileContent);
      console.log(`[SS_DEBUG_MAIN] getLibraryCues: Successfully read and parsed cues for library '${libraryName}'. Found ${cues.length} cues.`);
      return cues;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // This means cue.json was not found, which is a common case for an empty library or one without cues yet.
        console.log(`[SS_DEBUG_MAIN] getLibraryCues: cue.json not found for library '${libraryName}' at ${cueFilePath}. Returning empty cues.`);
      } else {
        // Other errors (e.g., parsing error, permissions)
        console.error(`[SS_DEBUG_MAIN] getLibraryCues: Error reading or parsing cue.json for library '${libraryName}':`, error.message);
      }
      return []; // Return empty array if cue.json doesn't exist or on other errors
    }
  }

  private startWatchingLibrariesDirectory(): void {
    console.log('[SS_DEBUG_MAIN] startWatchingLibrariesDirectory: Attempting to start watcher.');
    if (this.libraryWatcher) {
      console.log('[SS_DEBUG_MAIN] startWatchingLibrariesDirectory: Existing watcher found. Closing it first.');
      this.libraryWatcher.close();
      this.libraryWatcher = null;
    }

    if (!this.presentationLibraryPath || !fs.existsSync(this.presentationLibraryPath)) {
      console.error(`[SS_DEBUG_MAIN] startWatchingLibrariesDirectory: Cannot start watcher. Presentation library path does not exist ('${this.presentationLibraryPath}') or is not set.`);
      return;
    }

    console.log(`[SS_DEBUG_MAIN] startWatchingLibrariesDirectory: Starting chokidar watcher on: ${this.presentationLibraryPath}`);
    try {
      this.libraryWatcher = chokidar.watch(this.presentationLibraryPath, {
        persistent: true,
        ignored: /(^|[\/])\../, // ignore dotfiles
        ignoreInitial: true, // Don't fire on existing files/folders
        depth: 0, // Only watch direct children (folders) in the Libraries directory
        awaitWriteFinish: {
          stabilityThreshold: 2000,
          pollInterval: 100
        }
      });

      this.libraryWatcher
        .on('addDir', (eventPath: string) => {
          console.log(`[SS_DEBUG_MAIN] Watcher Event (addDir): Path: ${eventPath}.`);
          const channelToSend_addDir = StorageChannel.LIBRARIES_DID_CHANGE;
          console.log(`[SS_DEBUG_MAIN] Watcher Event (addDir): Channel to send is '${channelToSend_addDir}'. Sending to all windows.`);
          
          // Only send events for changes in the libraries directory, not subdirectories
          const libraryPath = this.presentationLibraryPath;
          if (eventPath !== libraryPath && path.dirname(eventPath) === libraryPath) {
            console.log(`[SS_DEBUG_MAIN] Detected new library folder: ${path.basename(eventPath)}`);
            
            BrowserWindow.getAllWindows().forEach((win) => {
              if (win && win.webContents && !win.webContents.isDestroyed()) {
                // Send with both the enum and direct string for maximum compatibility
                win.webContents.send(StorageChannel.LIBRARIES_DID_CHANGE);
                win.webContents.send('storage:presentation-libraries-did-change');
                console.log(`[SS_DEBUG_MAIN] IPC event sent to window ${win.id} on channel: ${StorageChannel.LIBRARIES_DID_CHANGE}`);
              }
            });
          } else {
            console.log(`[SS_DEBUG_MAIN] Ignoring addDir event for path that is not a direct library folder: ${eventPath}`);
          }
        })
        .on('unlinkDir', (eventPath: string) => {
          console.log(`[SS_DEBUG_MAIN] Watcher Event (unlinkDir): Path: ${eventPath}.`);
          const channelToSend_unlinkDir = StorageChannel.LIBRARIES_DID_CHANGE;
          console.log(`[SS_DEBUG_MAIN] Watcher Event (unlinkDir): Channel to send is '${channelToSend_unlinkDir}'. Sending to all windows.`);
          
          // Only send events for changes in the libraries directory, not subdirectories
          const libraryPath = this.presentationLibraryPath;
          if (eventPath !== libraryPath && path.dirname(eventPath) === libraryPath) {
            console.log(`[SS_DEBUG_MAIN] Detected removed library folder: ${path.basename(eventPath)}`);
            
            BrowserWindow.getAllWindows().forEach((win) => {
              if (win && win.webContents && !win.webContents.isDestroyed()) {
                // Send with both the enum and direct string for maximum compatibility
                win.webContents.send(StorageChannel.LIBRARIES_DID_CHANGE);
                win.webContents.send('storage:presentation-libraries-did-change');
                console.log(`[SS_DEBUG_MAIN] IPC event sent to window ${win.id} on channel: ${StorageChannel.LIBRARIES_DID_CHANGE}`);
              }
            });
          } else {
            console.log(`[SS_DEBUG_MAIN] Ignoring unlinkDir event for path that is not a direct library folder: ${eventPath}`);
          }
        })
        .on('error', (error: unknown) => {
          console.error(`[SS_DEBUG_MAIN] Watcher Error for ${this.presentationLibraryPath}:`, error);
        })
        .on('ready', () => {
            console.log(`[SS_DEBUG_MAIN] Chokidar watcher ready and initial scan complete for: ${this.presentationLibraryPath}`);
        });

      console.log(`[SS_DEBUG_MAIN] startWatchingLibrariesDirectory: Successfully initiated chokidar watcher on ${this.presentationLibraryPath}`);
    } catch (error) {
      console.error(`[SS_DEBUG_MAIN] startWatchingLibrariesDirectory: Failed to start chokidar watching ${this.presentationLibraryPath}:`, error);
    }
  }

  public getDefaultUserLibraryPath(): string {
    return this.defaultUserLibraryPath;
  }

  public async createUserLibrary(libraryName: string): Promise<{ success: boolean; path?: string; error?: string }> {
    console.log(`[SS_DEBUG_MAIN] createUserLibrary: Attempting to create library: ${libraryName}`);
    if (!libraryName || libraryName.trim() === '') {
      console.warn('[SS_DEBUG_MAIN] createUserLibrary: Library name cannot be empty.');
      return { success: false, error: 'Library name cannot be empty.' };
    }

    // Basic sanitization for library name to prevent path traversal or invalid characters
    const sanitizedLibraryName = libraryName.replace(/[\/:*?"<>|]/g, '');
    if (sanitizedLibraryName !== libraryName) {
      console.warn(`[SS_DEBUG_MAIN] createUserLibrary: Library name contained invalid characters. Original: '${libraryName}', Sanitized: '${sanitizedLibraryName}'`);
      // Optionally, you could reject here or proceed with sanitized name
      // For now, let's inform and proceed with sanitized, but this might need stricter rules
      if (!sanitizedLibraryName) {
        return { success: false, error: 'Library name became empty after sanitization due to invalid characters.' };
      }
    }

    const libraryPath = path.join(this.presentationLibraryPath, sanitizedLibraryName);
    console.log(`[SS_DEBUG_MAIN] createUserLibrary: Target library path: ${libraryPath}`);

    try {
      // Check if it already exists (as a directory)
      const stats = await fs.promises.stat(libraryPath).catch(() => null);
      if (stats && stats.isDirectory()) {
        console.warn(`[SS_DEBUG_MAIN] createUserLibrary: Library directory already exists: ${libraryPath}`);
        return { success: false, error: `Library '${sanitizedLibraryName}' already exists.` };
      }
      // If it exists but is not a directory (e.g. a file), that's also an issue
      if (stats && !stats.isDirectory()) {
        console.error(`[SS_DEBUG_MAIN] createUserLibrary: A file with the name '${sanitizedLibraryName}' already exists at the library location.`);
        return { success: false, error: `A file (not a directory) named '${sanitizedLibraryName}' already exists. Cannot create library.` };
      }

      await this.ensureDirectoryExists(libraryPath);
      console.log(`[SS_DEBUG_MAIN] createUserLibrary: Successfully created or ensured library directory: ${libraryPath}`);
      return { success: true, path: libraryPath };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[SS_DEBUG_MAIN] createUserLibrary: Error creating library directory ${libraryPath}:`, errorMessage);
      return { success: false, error: `Failed to create library '${sanitizedLibraryName}': ${errorMessage}` };
    }
  }

  public getMediaLibraryPath(): string {
    return this.mediaLibraryPath;
  }

  public async setGlobalLibrariesRoot(newPath: string): Promise<void> {
    console.log(`[SS_DEBUG_MAIN] setGlobalLibrariesRoot: Called with ${newPath}.`);
    this.globalLibrariesRootPath = newPath;
    this.presentationLibraryPath = this.globalLibrariesRootPath;
    this.defaultUserLibraryPath = path.join(this.presentationLibraryPath, PATH_CONFIG.DEFAULT_LIBRARY_DIR_NAME);
    this.mediaLibraryPath = path.join(this.presentationLibraryPath, PATH_CONFIG.MEDIA_LIBRARY_DIR_NAME);
    console.log('[SS_DEBUG_MAIN] setGlobalLibrariesRoot: Global libraries root updated. Dependent paths recalculated.');
    // Consider re-initializing or at least re-starting watcher if path changes significantly
    await this.ensureDirectoryExists(this.presentationLibraryPath); // Ensure new path exists
    this.startWatchingLibrariesDirectory(); // Restart watcher on new path
  }

  public setProjectsRoot(newPath: string): void {
    console.log(`[SS_DEBUG_MAIN] setProjectsRoot: Called with ${newPath}.`);
    this.userProjectsRootPath = newPath;
    this.ensureDirectoryExists(this.userProjectsRootPath); // Ensure this exists, no watcher for projects root currently
    console.log('[SS_DEBUG_MAIN] setProjectsRoot: User projects root updated.');
  }

  // This method is not async, kept for potential internal synchronous needs if any.
  // However, ensureDirectoryExists (async) is generally preferred.
  private createDirectoryIfNotExists(dirPath: string): void {
    console.log(`[SS_DEBUG_MAIN] createDirectoryIfNotExists (SYNC): Attempting for path: ${dirPath}`);
    try {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`[SS_DEBUG_MAIN] createDirectoryIfNotExists (SYNC): Created directory: ${dirPath}`);
      } else {
        console.log(`[SS_DEBUG_MAIN] createDirectoryIfNotExists (SYNC): Directory already exists: ${dirPath}`);
      }
    } catch (error) {
      console.error(`[SS_DEBUG_MAIN] createDirectoryIfNotExists (SYNC): Failed to create directory ${dirPath}:`, error);
    }
  }

  // This is an alias or older version, ensureDirectoryExists is the primary async method.
  private async createDirectoryIfNotExistsAsync(dirPath: string): Promise<void> {
    console.log(`[SS_DEBUG_MAIN] createDirectoryIfNotExistsAsync: Attempting for path: ${dirPath}`);
    await this.ensureDirectoryExists(dirPath);
  }

  public stopWatchingLibrariesDirectory(): void {
    console.log('[SS_DEBUG_MAIN] stopWatchingLibrariesDirectory: Called.');
    if (this.libraryWatcher) {
      console.log('[SS_DEBUG_MAIN] stopWatchingLibrariesDirectory: Closing chokidar library watcher.');
      this.libraryWatcher.close();
      this.libraryWatcher = null;
      console.log('[SS_DEBUG_MAIN] stopWatchingLibrariesDirectory: Chokidar library watcher closed and set to null.');
    } else {
      console.log('[SS_DEBUG_MAIN] stopWatchingLibrariesDirectory: No active chokidar library watcher to stop.');
    }
  }
}

const StorageServiceInstance = new StorageService();
export { StorageServiceInstance as StorageService };
