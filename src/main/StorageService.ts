// AIOPRESENTER/src/main/StorageService.ts
// import os from 'os'; // Commented out as it appears unused in this file after refactor
import { app, BrowserWindow, ipcMain } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import * as chokidar from 'chokidar';
import type { FSWatcher } from 'chokidar';
import { StorageChannel, AIOPresentationContent, Library, ListUserLibrariesResponse } from '../shared/ipcChannels';
import type { Cue, Cuelist, Slide, SlideElement, PresentationFile } from '@shared/types';
// import { PATH_CONFIG } from '@utils/pathconfig'; // Path logic and PATH_CONFIG usage moved to PathService
import { v4 as uuidv4 } from 'uuid';
import { PathService } from './services/storage/PathService';
import { listUserLibraries as listUserLibrariesAction } from './services/storage/libraryActions/listUserLibraries';
import { createUserLibrary as createUserLibraryAction } from './services/storage/libraryActions/createUserLibrary';
import { deleteUserLibrary as deleteUserLibraryAction } from './services/storage/libraryActions/deleteUserLibrary';
import { renameUserLibrary as renameUserLibraryAction } from './services/storage/libraryActions/renameUserLibrary';
import { PATH_CONFIG } from '../utils/pathconfig';

class StorageService {
  private pathService: PathService; // Manages all application paths
  // Path properties (documentsBasePath, globalLibrariesRootPath, etc.) are now managed by PathService
  private libraryWatcher: FSWatcher | null = null; // For watching library file changes

  constructor(customLibrariesPath?: string) {
    console.log('[SS_DEBUG_MAIN] StorageService Constructor: Called.');
    this.pathService = new PathService(customLibrariesPath);
    console.log('[SS_DEBUG_MAIN] StorageService Constructor: PathService initialized.');

    // Path initialization and logging are now handled within PathService.
    // ensureAppDirectoriesExist is also called within PathService constructor.

    this.registerIpcHandlers();
    // initializeAsync will be called to set up watchers and other non-path async tasks.
    this.initializeAsync(); 
  }

  /**
   * Registers all IPC handlers for storage-related operations
   */
  private registerIpcHandlers(): void {
    console.log('[SS_DEBUG_MAIN] registerIpcHandlers: Registering IPC handlers for StorageService.');
    ipcMain.handle(StorageChannel.LIST_USER_LIBRARIES, this.listUserLibraries.bind(this));
    ipcMain.handle(StorageChannel.CREATE_USER_LIBRARY, (event, libraryName) => this.createUserLibrary(libraryName));
    ipcMain.handle(StorageChannel.RENAME_USER_LIBRARY, (event, oldName, newName) => this.renameUserLibrary(oldName, newName));
    ipcMain.handle(StorageChannel.DELETE_USER_LIBRARY, (event, libraryName) => this.deleteUserLibrary(libraryName));
    ipcMain.handle(StorageChannel.GET_STORAGE_PATHS, this.getStoragePaths.bind(this));
    
    // Add handler for force refreshing presentation files
    ipcMain.handle(StorageChannel.FORCE_REFRESH_PRESENTATION_FILES, (event, libraryPath) => {
      console.log(`[SS_DEBUG_MAIN] Force refresh presentation files requested for library: ${libraryPath}`);
      this.notifyAllWindowsAboutPresentationFileChange(libraryPath);
      return { success: true };
    });
    ipcMain.handle(StorageChannel.LIST_PRESENTATION_FILES, (event, libraryPath) => this.listPresentationFiles(libraryPath));
    ipcMain.handle(StorageChannel.CREATE_PRESENTATION_FILE, (event, libraryPath, fileName) => this.createPresentationFile(libraryPath, fileName));
    ipcMain.handle(StorageChannel.OPEN_PRESENTATION_FILE, (event, filePath) => this.openPresentationFile(filePath));
    ipcMain.handle(StorageChannel.SAVE_PRESENTATION_FILE, (event, filePath, content) => this.savePresentationFile(filePath, content));
    ipcMain.handle(StorageChannel.DELETE_PRESENTATION_FILE, (event, filePath) => this.deletePresentationFile(filePath));
    
    console.log('[SS_DEBUG_MAIN] registerIpcHandlers: Successfully registered all IPC handlers.');
  }

  private async initializeAsync(): Promise<void> {
    console.log('[SS_DEBUG_MAIN] initializeAsync: Starting non-path related asynchronous initialization...');
    // ensureAppDirectoriesExist() logic is now handled by the PathService constructor.
    console.log('[SS_DEBUG_MAIN] initializeAsync: Path initialization and directory creation handled by PathService. Setting up library watcher.');
    this.startWatchingLibrariesDirectory(); 
  }

  public getStoragePaths(): { success: boolean; paths?: Record<string, string>; error?: string } {
    console.log('[SS_DEBUG_MAIN] getStoragePaths: Called.');
    try {
      const paths = {
        documentsBasePath: this.pathService.getDocumentsBasePath(),
        globalLibrariesRootPath: this.pathService.getGlobalLibrariesRootPath(),
        presentationLibraryPath: this.pathService.getPresentationLibraryPath(),
        defaultUserLibraryPath: this.pathService.getDefaultUserLibraryPath(),
        mediaLibraryPath: this.pathService.getMediaLibraryPath(),
        userProjectsRootPath: this.pathService.getUserProjectsRootPath(),
        appSupportPath: this.pathService.getAppSupportPath(),
        logsPath: this.pathService.getLogsPath(),
        settingsPath: this.pathService.getSettingsPath(),
      };
      return { success: true, paths };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[SS_DEBUG_MAIN] getStoragePaths: Error retrieving paths:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  // private async directoryExists(checkPath: string): Promise<boolean> { // Method moved to PathService
  // }

  public async updateLibrariesPath(newPath: string): Promise<void> {
    console.log(`[SS_DEBUG_MAIN] updateLibrariesPath: Attempting to update libraries path to: ${newPath} via PathService.`);
    try {
      await this.pathService.updateGlobalLibrariesRootPath(newPath); // This will update all related paths in PathService
      console.log('[SS_DEBUG_MAIN] updateLibrariesPath: PathService successfully updated paths.');
      // Log paths using getters from PathService
      console.log(`  Global Libraries Root (effective): ${this.pathService.getGlobalLibrariesRootPath()}`);
      console.log(`  Presentation Library (actual root for libraries): ${this.pathService.getPresentationLibraryPath()}`);
      console.log(`  Default User Library: ${this.pathService.getDefaultUserLibraryPath()}`);
      console.log(`  Media Library: ${this.pathService.getMediaLibraryPath()}`);

      console.log('[SS_DEBUG_MAIN] updateLibrariesPath: Re-initializing watcher due to path change.');
      if (this.libraryWatcher) {
        this.stopWatchingLibrariesDirectory(); 
      }
      // initializeAsync primarily starts the watcher. PathService handles directory creation.
      await this.initializeAsync(); 
      console.log('[SS_DEBUG_MAIN] updateLibrariesPath: Watcher re-initialization process triggered.');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[SS_DEBUG_MAIN] updateLibrariesPath: Error updating libraries path: ${errorMessage}`);
      throw new Error(`Failed to update libraries path: ${errorMessage}`);
    }
  }

  public async saveCueFile(libraryName: string, cueName: string, cueData: Cue): Promise<{ success: boolean; path?: string; error?: string }> {
    const libraryPath = path.join(this.pathService.getPresentationLibraryPath(), libraryName);
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

  // private async ensureDirectoryExists(dirPath: string): Promise<void> { // Method moved to PathService
  // }

  // private async ensureAppDirectoriesExist(): Promise<void> { // Method moved to PathService (called in its constructor)
  // }

  public getGlobalLibrariesRoot(): string {
    return this.pathService.getGlobalLibrariesRootPath();
  }

  public getUserProjectsRootPath(): string {
    return this.pathService.getUserProjectsRootPath();
  }

  public getPresentationLibraryPath(): string {
    return this.pathService.getPresentationLibraryPath();
  }

  public async listUserLibraryFolders(): Promise<string[]> {
    const presentationPath = this.pathService.getPresentationLibraryPath();
    console.log(`[SS_DEBUG_MAIN] listUserLibraryFolders: Called for path: ${presentationPath}`);
    
    try {
      await fs.promises.stat(presentationPath); // Check if path exists and is accessible
    } catch (statError: unknown) {
      // If stat fails (e.g., path doesn't exist), log and return empty array
      const errMessage = statError instanceof Error ? statError.message : String(statError);
      console.warn(`[SS_DEBUG_MAIN] listUserLibraryFolders: Presentation library path '${presentationPath}' does not exist or is not accessible: ${errMessage}. Returning empty array.`);
      return [];
    }

    try {
      const entries = await fs.promises.readdir(presentationPath, { withFileTypes: true });
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

  public async getLibraryCuelists(libraryName: string): Promise<Cuelist[]> {
    console.log(`[SS_DEBUG_MAIN] getLibraryCuelists: Placeholder for library: ${libraryName}. Returning empty Cuelist array.`);
    // TODO: Implement actual logic to read cuelist files from the library directory.
    // This will involve:
    // 1. Reading directory contents.
    // 2. Filtering for files ending with a specific cuelist extension (e.g., .cuelist.json).
    // 3. Reading and parsing each cuelist file.
    // 4. Validating the structure against the Cuelist interface.
    return Promise.resolve([]);
  }

  /**
   * Notifies all open windows about presentation file changes in a specific library
   * @param libraryDir The library directory path where the change occurred
   */
  private notifyAllWindowsAboutPresentationFileChange(libraryDir: string): void {
    console.log(`[SS_DEBUG_MAIN] Notifying all windows about presentation file change in: ${libraryDir}`);
    
    BrowserWindow.getAllWindows().forEach((win) => {
      if (win && win.webContents && !win.webContents.isDestroyed()) {
        win.webContents.send(StorageChannel.PRESENTATION_FILES_DID_CHANGE, { libraryPath: libraryDir });
        win.webContents.send('storage:presentation-files-did-change', { libraryPath: libraryDir });
        console.log(`[SS_DEBUG_MAIN] IPC event sent to window ${win.id} on channel: ${StorageChannel.PRESENTATION_FILES_DID_CHANGE}`);
      }
    });
  }

  private notifyAllWindowsAboutLibraryChange(libraryName: string, itemPath: string, eventType: string): void {
    console.log(`[SS_DEBUG_MAIN] Notifying all windows about library change. Library: ${libraryName}, Item: ${itemPath}, Event: ${eventType}`);
    BrowserWindow.getAllWindows().forEach((win) => {
      if (win && win.webContents && !win.webContents.isDestroyed()) {
        win.webContents.send(StorageChannel.LIBRARIES_DID_CHANGE, { libraryName, itemPath, eventType });
        console.log(`[SS_DEBUG_MAIN] IPC event sent to window ${win.id} on channel: ${StorageChannel.LIBRARIES_DID_CHANGE}`);
      }
    });
  }

  private notifyAllWindowsAboutLibraryListChange(): void {
    console.log('[SS_DEBUG_MAIN] Notifying all windows about library list change.');
    BrowserWindow.getAllWindows().forEach((win) => {
      if (win && win.webContents && !win.webContents.isDestroyed()) {
        win.webContents.send(StorageChannel.LIBRARIES_DID_CHANGE);
        console.log(`[SS_DEBUG_MAIN] IPC event sent to window ${win.id} on channel: ${StorageChannel.LIBRARIES_DID_CHANGE}`);
      }
    });
  }

  private startWatchingLibrariesDirectory(): void {
    console.log('[SS_DEBUG_MAIN] startWatchingLibrariesDirectory: Attempting to start watcher.');
    try {
      if (this.libraryWatcher) {
        console.log('[SS_DEBUG_MAIN] startWatchingLibrariesDirectory: Watcher already exists, closing it first.');
        this.libraryWatcher.close();
        this.libraryWatcher = null; // Ensure it's nullified after closing
      }

      const watchPath = this.pathService.getGlobalLibrariesRootPath();
      if (!watchPath || !fs.existsSync(watchPath)) {
        console.warn(`[SS_DEBUG_MAIN] startWatchingLibrariesDirectory: Watch path does not exist or is not configured: ${watchPath}. Watcher not started.`);
        return;
      }

      console.log(`[SS_DEBUG_MAIN] startWatchingLibrariesDirectory: Setting up watcher for path: ${watchPath}`);
      this.libraryWatcher = chokidar.watch(
        [
          watchPath, // Watch the root for new library folders (addDir/unlinkDir)
          path.join(watchPath, '**/*.AIOPresentation') // Watch for changes to presentation files
        ],
        {
          persistent: true,
          ignored: /(^|[\\/])\./, // Ignore dotfiles, corrected regex for cross-platform compatibility
          ignoreInitial: true, // Prevent events for existing files/dirs upon startup
          depth: 3,
          awaitWriteFinish: {
            stabilityThreshold: 500,
            pollInterval: 100
          },
        }
      );

      this.libraryWatcher
        .on('add', (filePath: string) => this.handleFileChange(filePath, undefined, 'add'))
        .on('change', (filePath: string, stats?: fs.Stats) => this.handleFileChange(filePath, stats, 'change'))
        .on('unlink', (filePath: string) => this.handleFileChange(filePath, undefined, 'unlink'))
        .on('addDir', (dirPath: string) => this.handleDirectoryChange(dirPath, 'addDir'))
        .on('unlinkDir', (dirPath: string) => this.handleDirectoryChange(dirPath, 'unlinkDir'))
        .on('error', (error: unknown) => {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error(`[SS_DEBUG_MAIN] Watcher error: ${errorMessage}`);
        })
        .on('ready', () => {
          console.log(`[SS_DEBUG_MAIN] Chokidar watcher ready and initial scan complete for: ${watchPath}`);
        });

      console.log(`[SS_DEBUG_MAIN] startWatchingLibrariesDirectory: Successfully initiated chokidar watcher on ${watchPath}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[SS_DEBUG_MAIN] startWatchingLibrariesDirectory: Failed to start chokidar watching ${this.pathService.getGlobalLibrariesRootPath()}:`, errorMessage);
    }
  }

  private stopWatchingLibrariesDirectory(): void {
    if (this.libraryWatcher) {
      console.log('[SS_DEBUG_MAIN] stopWatchingLibrariesDirectory: Closing library watcher.');
      this.libraryWatcher.close();
      this.libraryWatcher = null;
    } else {
      console.log('[SS_DEBUG_MAIN] stopWatchingLibrariesDirectory: No active library watcher to close.');
    }
  }

  private handleFileChange(filePath: string, stats?: fs.Stats, eventType?: string): void {
    const isPresentationFile = filePath.endsWith('.AIOPresentation');
    const currentGlobalLibrariesRoot = this.pathService.getGlobalLibrariesRootPath();
    const currentPresentationLibraryPath = this.pathService.getPresentationLibraryPath();
    
    if (!currentGlobalLibrariesRoot || !currentPresentationLibraryPath) {
        console.warn('[SS_DEBUG_MAIN] handleFileChange: Root paths not configured. Skipping event.');
        return;
    }

    const relativePath = path.relative(currentGlobalLibrariesRoot, filePath);
    const libraryName = relativePath.split(path.sep)[0];

    console.log(`[SS_DEBUG_MAIN] handleFileChange: Event: ${eventType}, File: ${path.basename(filePath)}, Library: ${libraryName}, FullPath: ${filePath}, Stats: ${stats ? 'available' : 'N/A'}`);

    if (isPresentationFile) {
      console.log(`[SS_DEBUG_MAIN] handleFileChange: Presentation file changed: ${path.basename(filePath)} in library ${libraryName}.`);
      const directLibraryPath = path.join(currentPresentationLibraryPath, libraryName);
      this.notifyAllWindowsAboutPresentationFileChange(directLibraryPath);
    } else {
      // Optionally handle other file types if necessary, or just log
      console.log(`[SS_DEBUG_MAIN] handleFileChange: Non-presentation file changed: ${path.basename(filePath)} in library ${libraryName}.`);
    }
    // General notification for any file system activity affecting a library's content
    this.notifyAllWindowsAboutLibraryChange(libraryName, filePath, eventType || 'unknown');
  }

  private handleDirectoryChange(dirPath: string, eventType: string): void {
    console.log(`[SS_DEBUG_MAIN] handleDirectoryChange: Event: ${eventType}, Directory: ${path.basename(dirPath)}, FullPath: ${dirPath}`);
    const currentGlobalLibrariesRoot = this.pathService.getGlobalLibrariesRootPath();

    if (!currentGlobalLibrariesRoot) {
        console.warn('[SS_DEBUG_MAIN] handleDirectoryChange: Global libraries root not configured. Skipping event.');
        return;
    }

    // Check if the changed directory is a direct child of the libraries root path (i.e., a library folder itself)
    if (path.dirname(dirPath) === currentGlobalLibrariesRoot) {
      const libraryName = path.basename(dirPath);
      console.log(`[SS_DEBUG_MAIN] handleDirectoryChange: Library folder '${libraryName}' ${eventType === 'addDir' ? 'added' : 'removed'}.`);
      this.notifyAllWindowsAboutLibraryListChange(); // Notify that the list of libraries has changed
    } else {
      // If it's a subdirectory within a library, or a file operation that chokidar reports as a dir event (sometimes happens)
      const relativePath = path.relative(currentGlobalLibrariesRoot, dirPath);
      const libraryName = relativePath.split(path.sep)[0];
      console.log(`[SS_DEBUG_MAIN] handleDirectoryChange: Change in directory '${path.basename(dirPath)}' within library '${libraryName}'. Event: ${eventType}.`);
      // Notify about specific library content change, which could be a sub-folder or related file activity
      this.notifyAllWindowsAboutLibraryChange(libraryName, dirPath, eventType);
    }
  }

  /**
   * Lists all user libraries in the presentation library path
   * @returns List of libraries with their metadata
   */
  public async listUserLibraries(): Promise<ListUserLibrariesResponse> {
    console.log('[SS_DEBUG_MAIN] listUserLibraries: Delegating to action.');
    // This will call the imported listUserLibrariesAction function
    return listUserLibrariesAction(this.pathService);
  }

  /**
   * Creates a new user library with the given name
   * @param libraryName Name of the library to create
   * @returns Success status and path to the created library
   */
  public async createUserLibrary(libraryName: string): Promise<{ success: boolean; path?: string; error?: string }> {
    console.log('[SS_DEBUG_MAIN] createUserLibrary: Delegating to action.');
    // This will call the imported createUserLibraryAction function
    return createUserLibraryAction(this.pathService, libraryName);
  }

  /**
   * Deletes a user library
   * @param libraryName Name of the library to delete
   * @returns Success status
   */
  public async deleteUserLibrary(libraryName: string): Promise<{ success: boolean; error?: string }> {
    console.log('[SS_DEBUG_MAIN] deleteUserLibrary: Delegating to action.');
    // This will call the imported deleteUserLibraryAction function
    return deleteUserLibraryAction(this.pathService, libraryName);
  }

  /**
   * Renames a user library
   * @param oldName Current name of the library
   * @param newName New name for the library
   * @returns Success status and path to the renamed library
   */
  public async renameUserLibrary(oldName: string, newName: string): Promise<{ success: boolean; path?: string; error?: string }> {
    console.log('[SS_DEBUG_MAIN] renameUserLibrary: Delegating to action.');
    // This will call the imported renameUserLibraryAction function
    return renameUserLibraryAction(this.pathService, oldName, newName);
  }
  /**
   * Creates a new presentation file with a unique name if a file with baseName already exists.
   * Ensures the library directory exists before creating the file.
   * @param libraryPath Path to the library
   * @param baseName Base name for the file to create (e.g., "My Presentation")
   * @returns Success status and path to the created file (filePath)
   */
  public async createPresentationFile(libraryPath: string, baseName: string): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
      console.log(`[SS_DEBUG_MAIN] createPresentationFile: Creating file with baseName ${baseName} in ${libraryPath}`);

      if (!this.pathService) {
        console.error('[SS_DEBUG_MAIN] createPresentationFile: PathService is not initialized.');
        return { success: false, error: 'Internal server error: PathService not available.' };
      }
      // Ensure the library directory exists
      await this.pathService.ensureDirectoryExists(libraryPath);

      const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9-_]/g, '_');
      let presentationFileName = sanitizedBaseName; // This will be the part of the filename without extension, potentially with a counter
      let filePath = path.join(libraryPath, `${presentationFileName}.AIOPresentation`);
      let counter = 1;

      // Ensure unique filename
      while (fs.existsSync(filePath)) {
        presentationFileName = `${sanitizedBaseName} (${counter})`;
        filePath = path.join(libraryPath, `${presentationFileName}.AIOPresentation`);
        counter++;
      }
      console.log(`[SS_DEBUG_MAIN] createPresentationFile: Determined unique file path: ${filePath}`);

      const defaultSlide: Slide = {
        id: uuidv4(),
        name: 'Slide 1',
        elements: [],
        backgroundColor: '#FFFFFF',
      };

      const presentationContent: AIOPresentationContent = {
        version: '1.0',
        slides: [defaultSlide],
        // Consider adding a top-level 'name' property to AIOPresentationContent if your type defines it
        // e.g., name: presentationFileName 
      };

      await fs.promises.writeFile(filePath, JSON.stringify(presentationContent, null, 2));
      console.log(`[SS_DEBUG_MAIN] createPresentationFile: Successfully created presentation file at ${filePath}`);
      
      return { success: true, filePath: filePath };

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[SS_DEBUG_MAIN] createPresentationFile: Error creating presentation file in ${libraryPath}:`, errorMessage);
      return { success: false, error: `Failed to create presentation file: ${errorMessage}` };
    }
  }

  /**
   * Opens a presentation file and returns its content
   * @param filePath Path to the presentation file
   * @returns Success status and content of the file
   */
  private async openPresentationFile(filePath: string): Promise<{ success: boolean; content?: any; error?: string }> {
    try {
      console.log(`[SS_DEBUG_MAIN] openPresentationFile: Opening file ${filePath}`);
      if (!fs.existsSync(filePath)) {
        return {
          success: false,
          error: `File does not exist: ${filePath}`
        };
      }

      const fileContent = fs.readFileSync(filePath, 'utf8');
      let parsedContent;
      try {
        parsedContent = JSON.parse(fileContent);
      } catch (parseError: unknown) {
        const errMessage = parseError instanceof Error ? parseError.message : String(parseError);
        console.error(`[SS_DEBUG_MAIN] openPresentationFile: Error parsing JSON content from ${filePath}:`, errMessage);
        return {
          success: false,
          error: `Failed to parse presentation file: ${errMessage}`
        };
      }

      console.log(`[SS_DEBUG_MAIN] openPresentationFile: Successfully opened and parsed file ${filePath}`);
      return {
        success: true,
        content: parsedContent
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[SS_DEBUG_MAIN] openPresentationFile: Error reading file ${filePath}:`, errorMessage);
      return { success: false, error: `Failed to open presentation file: ${errorMessage}` };
    }
  }

  /**
   * Saves content to a presentation file.
   * This method is public as it's called directly by an IPC handler.
   * @param filePath Path to the presentation file
   * @param content Content to save
   * @returns Success status
   */
  public async savePresentationFile(filePath: string, content: any): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`[SS_DEBUG_MAIN] savePresentationFile: Saving file ${filePath}`);
      
      // Update the updatedAt timestamp if content is an object
      if (typeof content === 'object' && content !== null) {
        content.updatedAt = new Date().toISOString();
      }

      const fileContent = JSON.stringify(content, null, 2);
      fs.writeFileSync(filePath, fileContent, 'utf8');
      console.log(`[SS_DEBUG_MAIN] savePresentationFile: Successfully saved file ${filePath}`);
      
      // Notify windows about the change, similar to how create/delete might
      const libraryPath = path.dirname(filePath);
      this.notifyAllWindowsAboutPresentationFileChange(libraryPath);

      return {
        success: true
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[SS_DEBUG_MAIN] savePresentationFile: Error saving file ${filePath}:`, errorMessage);
      return {
        success: false,
        error: `Failed to save presentation file: ${errorMessage}`
      };
    }
  }

  /**
   * Deletes a presentation file.
   * This method is private and intended for internal use.
   * @param filePath Path to the presentation file
   * @returns Success status
   */
  private async deletePresentationFile(filePath: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`[SS_DEBUG_MAIN] deletePresentationFile: Deleting file ${filePath}`);
      if (!fs.existsSync(filePath)) {
        return {
          success: false,
          error: `File does not exist: ${filePath}`
        };
      }

      fs.unlinkSync(filePath);
      console.log(`[SS_DEBUG_MAIN] deletePresentationFile: Successfully deleted file ${filePath}`);
      
      return {
        success: true
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[SS_DEBUG_MAIN] deletePresentationFile: Error deleting file:', errorMessage);
      return {
        success: false,
        error: `Failed to delete presentation file: ${errorMessage}`
      };
    }
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    console.log(`[SS_DEBUG_MAIN] ensureDirectoryExists: Ensuring directory exists at path: ${dirPath}`);
    try {
      await fs.promises.mkdir(dirPath, { recursive: true });
      console.log(`[SS_DEBUG_MAIN] ensureDirectoryExists: Directory ensured/created at: ${dirPath}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[SS_DEBUG_MAIN] ensureDirectoryExists: Failed to ensure directory ${dirPath}: ${errorMessage}`);
      // Re-throw the error to allow the caller to handle it, as directory creation is often critical.
      throw new Error(`Failed to ensure directory ${dirPath}: ${errorMessage}`);
    }
  }

  public getDefaultUserLibraryPath(): string {
    return this.pathService.getDefaultUserLibraryPath();
  }


  public getMediaLibraryPath(): string {
    return this.pathService.getMediaLibraryPath();
  }

  public async setGlobalLibrariesRoot(newPath: string): Promise<void> {
    console.log(`[SS_DEBUG_MAIN] setGlobalLibrariesRoot: Called with ${newPath}. Delegating to updateLibrariesPath.`);
    await this.updateLibrariesPath(newPath);
    console.log('[SS_DEBUG_MAIN] setGlobalLibrariesRoot: updateLibrariesPath call completed.');
  }

  public async setProjectsRoot(newPath: string): Promise<void> {
    console.log(`[SS_DEBUG_MAIN] setProjectsRoot: Called with ${newPath}. Attempting to update via PathService.`);
    try {
      await this.pathService.updateUserProjectsRootPath(newPath); // PathService handles actual path update and dir creation
      console.log('[SS_DEBUG_MAIN] setProjectsRoot: User projects root updated successfully via PathService.');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[SS_DEBUG_MAIN] setProjectsRoot: Error updating user projects root path: ${errorMessage}`);
      throw new Error(`Failed to update user projects root path: ${errorMessage}`);
    }
  }


  /**
   * Lists all presentation files in a library directory.
   * @param libraryPath The absolute path to the library directory
   * @returns A list of presentation files with their metadata
   */
  public async listPresentationFiles(libraryPath: string): Promise<{ success: boolean; files?: PresentationFile[]; error?: string }> {
    console.log(`[SS_DEBUG_MAIN] listPresentationFiles: Called for libraryPath:`, libraryPath);
    console.log(`[SS_DEBUG_MAIN] listPresentationFiles: libraryPath type:`, typeof libraryPath);
    
    if (!libraryPath) {
      console.error('[SS_DEBUG_MAIN] listPresentationFiles: Library path is empty or null');
      return { success: false, error: 'Library path is required.' };
    }
    
    try {
      // Check if the directory exists
      console.log(`[SS_DEBUG_MAIN] listPresentationFiles: Checking if directory exists: ${libraryPath}`);
      if (!fs.existsSync(libraryPath)) {
        console.error(`[SS_DEBUG_MAIN] listPresentationFiles: Library directory does not exist: ${libraryPath}`);
        return { success: false, error: `Library directory does not exist: ${libraryPath}` };
      }
      
      // Read all files in the directory
      console.log(`[SS_DEBUG_MAIN] listPresentationFiles: Reading directory contents: ${libraryPath}`);
      const files = await fs.promises.readdir(libraryPath);
      console.log(`[SS_DEBUG_MAIN] listPresentationFiles: Found ${files.length} total files in directory`);
      console.log(`[SS_DEBUG_MAIN] listPresentationFiles: Files found:`, files);
      
      // Filter for .AIOPresentation files
      const presentationFiles = files
        .filter(file => {
          const isPresentation = file.endsWith('.AIOPresentation');
          console.log(`[SS_DEBUG_MAIN] File ${file} is presentation file: ${isPresentation}`);
          return isPresentation;
        })
        .map(fileName => {
          const filePath = path.join(libraryPath, fileName);
          const stats = fs.statSync(filePath);
          
          const presentationFile = {
            id: `${libraryPath}-${fileName}`,
            name: fileName,
            path: filePath,
            type: 'custom' as const
          };
          
          console.log(`[SS_DEBUG_MAIN] Created presentation file object:`, presentationFile);
          return presentationFile;
        });
      
      console.log(`[SS_DEBUG_MAIN] listPresentationFiles: Found ${presentationFiles.length} presentation files in ${libraryPath}`);
      console.log(`[SS_DEBUG_MAIN] listPresentationFiles: Presentation files:`, presentationFiles);
      
      return { success: true, files: presentationFiles };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[SS_DEBUG_MAIN] listPresentationFiles: Error listing files in ${libraryPath}:`, errorMessage);
      return { success: false, error: `Failed to list presentation files: ${errorMessage}` };
    }
  }

  /**
   * Creates a new presentation file in the specified library.
   */
}

const StorageServiceInstance = new StorageService();
export { StorageServiceInstance as StorageService };
