// AIOPRESENTER/src/main/services/storage/PathService.ts
import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { PATH_CONFIG } from '../../../utils/pathconfig';

export class PathService {
  private documentsBasePath: string;
  private globalLibrariesRootPath: string = ''; // Effectively the presentation library path or custom
  private presentationLibraryPath: string = ''; // Actual root for libraries
  private defaultUserLibraryPath: string = '';
  private mediaLibraryPath: string = '';
  private userProjectsRootPath: string = '';
  private userDataPath: string = '';
  private appSupportPath: string = ''; // Typically same as userDataPath or a subfolder
  private logsPath: string = '';
  private settingsPath: string = ''; // Path to the settings file

  constructor(customLibrariesPath?: string) {
    console.log('[PathService_DEBUG_MAIN] PathService Constructor: Called.');
    this.documentsBasePath = app.getPath('documents');
    this.userDataPath = app.getPath('userData');
    this.appSupportPath = this.userDataPath; // Or a specific sub-directory like path.join(this.userDataPath, PATH_CONFIG.APP_NAME_FOR_SUPPORT_PATH) if needed
    this.logsPath = path.join(this.userDataPath, PATH_CONFIG.LOGS_DIR_NAME);
    this.settingsPath = path.join(this.userDataPath, PATH_CONFIG.SETTINGS_FILE_NAME);

    console.log(`[PathService_DEBUG_MAIN] PathService Constructor: Documents base path set to: ${this.documentsBasePath}`);
    console.log(`[PathService_DEBUG_MAIN] PathService Constructor: User data path set to: ${this.userDataPath}`);
    console.log(`[PathService_DEBUG_MAIN] PathService Constructor: App support path set to: ${this.appSupportPath}`);
    console.log(`[PathService_DEBUG_MAIN] PathService Constructor: Logs path set to: ${this.logsPath}`);
    console.log(`[PathService_DEBUG_MAIN] PathService Constructor: Settings path set to: ${this.settingsPath}`);

    this.initializePaths(customLibrariesPath);

    // Ensure essential directories exist upon instantiation.
    // Errors are logged, but construction doesn't fail to allow app to attempt to function.
    this.ensureAppDirectoriesExist().catch(error => {
      console.error('[PathService_DEBUG_MAIN] PathService Constructor: Error ensuring app directories exist during construction:', error);
    });
  }

  private initializePaths(customLibrariesPath?: string): void {
    console.log('[PathService_DEBUG_MAIN] initializePaths: Initializing paths...');
    const aioAppBasePathForProjects = path.join(this.documentsBasePath, PATH_CONFIG.AIO_DIR_NAME, PATH_CONFIG.APP_DIR_NAME);
    this.userProjectsRootPath = path.join(aioAppBasePathForProjects, PATH_CONFIG.PROJECTS_DIR_NAME);

    if (customLibrariesPath) {
      console.log(`[PathService_DEBUG_MAIN] initializePaths: Using custom library path: ${customLibrariesPath}`);
      this.globalLibrariesRootPath = customLibrariesPath;
      this.presentationLibraryPath = customLibrariesPath; // When custom path is given, it's the direct root.
      this.defaultUserLibraryPath = path.join(customLibrariesPath, PATH_CONFIG.DEFAULT_LIBRARY_DIR_NAME);
      this.mediaLibraryPath = path.join(customLibrariesPath, PATH_CONFIG.MEDIA_LIBRARY_DIR_NAME);
    } else {
      console.log("[PathService_DEBUG_MAIN] initializePaths: Using user's preferred library path structure.");
      const userPreferredLibrariesBase = path.join(this.documentsBasePath, PATH_CONFIG.AIO_DIR_NAME, PATH_CONFIG.APP_DIR_NAME_MIXED_CASE_FOR_LIBS);
      this.presentationLibraryPath = path.join(userPreferredLibrariesBase, PATH_CONFIG.LIBRARIES_DIR_NAME);
      this.globalLibrariesRootPath = this.presentationLibraryPath; // Default global root is the presentation library path.
      this.defaultUserLibraryPath = path.join(this.presentationLibraryPath, PATH_CONFIG.DEFAULT_LIBRARY_DIR_NAME);
      this.mediaLibraryPath = path.join(this.presentationLibraryPath, PATH_CONFIG.MEDIA_LIBRARY_DIR_NAME);
    }

    console.log('[PathService_DEBUG_MAIN] initializePaths: Final Initialized Paths:');
    console.log(`  Documents Base: ${this.documentsBasePath}`);
    console.log(`  User Data Path: ${this.userDataPath}`);
    console.log(`  Global Libraries Root (effective): ${this.globalLibrariesRootPath}`);
    console.log(`  User Projects Root: ${this.userProjectsRootPath}`);
    console.log(`  Presentation Library (actual root for libraries): ${this.presentationLibraryPath}`);
    console.log(`  Default User Library: ${this.defaultUserLibraryPath}`);
    console.log(`  Media Library: ${this.mediaLibraryPath}`);
    console.log(`  App Support Path: ${this.appSupportPath}`);
    console.log(`  Logs Path: ${this.logsPath}`);
    console.log(`  Settings Path: ${this.settingsPath}`);
  }

  public async ensureDirectoryExists(dirPath: string): Promise<void> {
    console.log(`[PathService_DEBUG_MAIN] ensureDirectoryExists: Ensuring directory exists at ${dirPath}`);
    try {
      await fs.promises.mkdir(dirPath, { recursive: true });
      console.log(`[PathService_DEBUG_MAIN] ensureDirectoryExists: Directory ensured or already exists at ${dirPath}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[PathService_DEBUG_MAIN] ensureDirectoryExists: Failed to create directory ${dirPath}:`, errorMessage);
      throw new Error(`Failed to ensure directory ${dirPath}: ${errorMessage}`);
    }
  }

  public async ensureAppDirectoriesExist(): Promise<void> {
    console.log('[PathService_DEBUG_MAIN] ensureAppDirectoriesExist: Ensuring all essential application directories exist.');
    try {
      await this.ensureDirectoryExists(this.userProjectsRootPath);
      await this.ensureDirectoryExists(this.presentationLibraryPath);
      await this.ensureDirectoryExists(this.defaultUserLibraryPath);
      await this.ensureDirectoryExists(this.mediaLibraryPath);
      await this.ensureDirectoryExists(this.logsPath); // Ensure logs directory exists
      // Settings path is a file, its directory (userDataPath) is implicitly handled by Electron or should already exist.
      console.log('[PathService_DEBUG_MAIN] ensureAppDirectoriesExist: All essential directories ensured.');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[PathService_DEBUG_MAIN] ensureAppDirectoriesExist: Error ensuring one or more app directories:', errorMessage);
      // Propagate the error if specific handling is needed by the caller
      throw new Error(`Failed to ensure app directories: ${errorMessage}`);
    }
  }

  public async directoryExists(checkPath: string): Promise<boolean> {
    console.log(`[PathService_DEBUG_MAIN] directoryExists: Checking if directory exists at ${checkPath}`);
    try {
      const stats = await fs.promises.stat(checkPath);
      const exists = stats.isDirectory();
      console.log(`[PathService_DEBUG_MAIN] directoryExists: Directory at ${checkPath} ${exists ? 'exists' : 'does not exist or is not a directory'}.`);
      return exists;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        console.log(`[PathService_DEBUG_MAIN] directoryExists: Directory at ${checkPath} does not exist (ENOENT).`);
        return false;
      }
      console.error(`[PathService_DEBUG_MAIN] directoryExists: Error checking directory ${checkPath}:`, error.message);
      throw error; // Re-throw other errors
    }
  }

  // Getters
  public getDocumentsBasePath = (): string => this.documentsBasePath;
  public getGlobalLibrariesRootPath = (): string => this.globalLibrariesRootPath;
  public getPresentationLibraryPath = (): string => this.presentationLibraryPath;
  public getDefaultUserLibraryPath = (): string => this.defaultUserLibraryPath;
  public getMediaLibraryPath = (): string => this.mediaLibraryPath;
  public getUserProjectsRootPath = (): string => this.userProjectsRootPath;
  public getUserDataPath = (): string => this.userDataPath;
  public getAppSupportPath = (): string => this.appSupportPath;
  public getLogsPath = (): string => this.logsPath;
  public getSettingsPath = (): string => this.settingsPath;

  // Updaters
  public async updateGlobalLibrariesRootPath(newPath: string): Promise<void> {
    console.log(`[PathService_DEBUG_MAIN] updateGlobalLibrariesRootPath: Called with new path: ${newPath}.`);
    if (!newPath || typeof newPath !== 'string') {
      console.error('[PathService_DEBUG_MAIN] updateGlobalLibrariesRootPath: Invalid new path provided.');
      throw new Error('Invalid new path for global libraries root.');
    }
    this.globalLibrariesRootPath = newPath;
    this.presentationLibraryPath = newPath; // Assuming custom path becomes the new presentation root
    this.defaultUserLibraryPath = path.join(newPath, PATH_CONFIG.DEFAULT_LIBRARY_DIR_NAME);
    this.mediaLibraryPath = path.join(newPath, PATH_CONFIG.MEDIA_LIBRARY_DIR_NAME);
    
    console.log(`[PathService_DEBUG_MAIN] updateGlobalLibrariesRootPath: Global libraries root updated to: ${this.globalLibrariesRootPath}`);
    console.log(`  New Presentation Library Path: ${this.presentationLibraryPath}`);
    console.log(`  New Default User Library Path: ${this.defaultUserLibraryPath}`);
    console.log(`  New Media Library Path: ${this.mediaLibraryPath}`);
    
    // Ensure new directories exist
    await this.ensureDirectoryExists(this.presentationLibraryPath);
    await this.ensureDirectoryExists(this.defaultUserLibraryPath);
    await this.ensureDirectoryExists(this.mediaLibraryPath);
    // Note: This change might require restarting the file watcher. That logic will be handled by FileWatcherService.
  }

  public async updateUserProjectsRootPath(newPath: string): Promise<void> {
    console.log(`[PathService_DEBUG_MAIN] updateUserProjectsRootPath: Called with new path: ${newPath}.`);
    if (!newPath || typeof newPath !== 'string') {
      console.error('[PathService_DEBUG_MAIN] updateUserProjectsRootPath: Invalid new path provided.');
      throw new Error('Invalid new path for user projects root.');
    }
    this.userProjectsRootPath = newPath;
    await this.ensureDirectoryExists(this.userProjectsRootPath);
    console.log(`[PathService_DEBUG_MAIN] updateUserProjectsRootPath: User projects root updated to: ${this.userProjectsRootPath}.`);
  }
}
