console.log('<<<<<<<<<< TOP LEVEL EXECUTION MARKER IN main.ts >>>>>>>>>>'); // Added for build verification
import { app, BrowserWindow, ipcMain, Menu, shell, dialog } from 'electron';
import fs from 'fs';
import path from 'path';
import util from 'util';
import childProcess from 'child_process';
import squirrelStartup from 'electron-squirrel-startup';
import { StorageChannel, Cue, Library } from '../shared/ipcChannels';
import { PATH_CONFIG } from '@utils/pathconfig';
import { StorageService } from './StorageService';

import { DebugIPC } from './utils/DebugIPC';

// PathConfig (PATH_CONFIG object) is imported and can be used directly.

// Initialize DebugIPC
const debugIPC = DebugIPC.getInstance();
debugIPC.log('Main process DebugIPC initialized.');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (squirrelStartup) {
  app.quit();
}

// --- Global Variables and Constants ---
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
const IS_MAC = process.platform === 'darwin';
const LOG_FILE_PATH = path.join(app.getAppPath(), 'main.log'); // Log to project root

// --- Utility Functions ---

/**
 * Simple file-based logger.
 * @param message - The message to log.
 */
const logToFile = (message: string) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFile(LOG_FILE_PATH, logMessage, (err) => {
    if (err) {
      originalConsoleError('Failed to write to log file:', err); // Use originalConsoleError to prevent recursion
    }
  });
};

// Redirect console.log and console.error to file and original console
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

console.log = (...args: unknown[]) => {
  const message = util.format(...args);
  logToFile(`LOG: ${message}`);
  originalConsoleLog.apply(console, args);
  debugIPC.log(`LOG: ${message}`); // Send to renderer via DebugIPC
};

console.error = (...args: unknown[]) => {
  const message = util.format(...args);
  logToFile(`ERROR: ${message}`);
  originalConsoleError.apply(console, args);
  debugIPC.error(`ERROR: ${message}`); // Send to renderer via DebugIPC
};

console.log('Main process logging initialized. Log file at:', LOG_FILE_PATH);

// --- Storage Service Initialization ---
const storageService = StorageService; // StorageService is the imported instance
// StorageService constructor calls its own private initializeAsync, so no need to call it here.
// console.log('StorageService instance created. Initialization is handled within its constructor.');


// --- Main Window Management ---
let mainWindow: BrowserWindow | null = null;

const createWindow = (): void => {
  console.log('Creating main window...');
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'), // Corrected path
      nodeIntegration: false, // Disable nodeIntegration for security
      contextIsolation: true, // Enable contextIsolation for security
      devTools: IS_DEVELOPMENT, // Enable DevTools only in development
    },
    show: false, // Don't show the window until it's ready
  });

  // Determine the URL to load
  let loadUrl: string;
  console.log(`[Main Process Env Check] NODE_ENV: '${process.env.NODE_ENV}', IS_DEVELOPMENT: ${IS_DEVELOPMENT}`);
  console.log(`[Main Process Env Check] WEBPACK_DEV_SERVER_URL: '${process.env.WEBPACK_DEV_SERVER_URL}'`);

  if (IS_DEVELOPMENT && process.env.WEBPACK_DEV_SERVER_URL) {
    loadUrl = process.env.WEBPACK_DEV_SERVER_URL;
    console.log(`Attempting to load URL from Webpack Dev Server: ${loadUrl}`);
  } else {
    loadUrl = `file://${path.join(__dirname, '../renderer/index.html')}`;
    console.log(`Attempting to load URL from file: ${loadUrl}`);
    if (IS_DEVELOPMENT) {
      console.warn(`WARNING: IS_DEVELOPMENT is true, but WEBPACK_DEV_SERVER_URL was not found or is empty. URL will be loaded from file system.`);
    } else {
      console.info(`INFO: IS_DEVELOPMENT is false. URL will be loaded from file system. NODE_ENV: '${process.env.NODE_ENV}'`);
    }
  }

  mainWindow.loadURL(loadUrl).then(() => {
    console.log('Main window URL loaded successfully.');
  }).catch(err => {
    console.error('Failed to load main window URL:', err);
  });

  // Check if --dev-tools flag was passed
  const devToolsFlag = process.argv.includes('--dev-tools');
  
  // Open DevTools automatically if in development or if --dev-tools flag is passed
  if (IS_DEVELOPMENT || devToolsFlag) {
    mainWindow.webContents.openDevTools({ mode: 'undocked' });
    console.log('DevTools opened for main window.');
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    console.log('Main window is ready to show and now visible.');
  });

  mainWindow.on('closed', () => {
    console.log('Main window closed.');
    mainWindow = null;
  });

  // Security: Handle new window requests
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    console.log(`Window open handler: Denying request for URL: ${url}`);
    // shell.openExternal(url); // Uncomment to open external links in default browser
    return { action: 'deny' }; // Deny new window creation for now
  });

  console.log('Main window setup complete.');
};

// --- Application Menu ---
const createMenu = () => {
  console.log('Creating application menu...');
  const template: Electron.MenuItemConstructorOptions[] = [
    ...(IS_MAC ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    } as Electron.MenuItemConstructorOptions] : []),
    {
      label: 'File',
      submenu: [
        IS_MAC ? { role: 'close' } : { role: 'quit' },
        {
          label: 'Open DevTools',
          accelerator: 'CmdOrCtrl+Shift+I',
          click: () => {
            mainWindow?.webContents.openDevTools();
          }
        },
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow?.webContents.reload();
          }
        },
        {
          label: 'Force Reload (ignore cache)',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => {
            mainWindow?.webContents.reloadIgnoringCache();
          }
        },
        {
          label: 'Open Log File',
          click: () => {
            shell.openPath(LOG_FILE_PATH).catch(err => {
              console.error('Failed to open log file:', err);
              dialog.showErrorBox('Error Opening Log', `Could not open log file at ${LOG_FILE_PATH}. Error: ${err.message}`);
            });
          }
        },
        {
          label: 'Open User Data Directory',
          click: () => {
            const userDataPath = app.getPath('userData');
            shell.openPath(userDataPath).catch(err => {
              console.error('Failed to open user data directory:', err);
              dialog.showErrorBox('Error Opening Directory', `Could not open ${userDataPath}. Error: ${err.message}`);
            });
          }
        },
        {
          label: 'Clear User Data (Requires Restart)',
          click: async () => {
            const choice = dialog.showMessageBoxSync(mainWindow!, {
              type: 'warning',
              buttons: ['Cancel', 'Clear Data'],
              defaultId: 0,
              title: 'Confirm Clear User Data',
              message: 'Are you sure you want to clear all user data? This includes settings, libraries, and logs. The application will quit after clearing.',
              detail: 'This action cannot be undone.'
            });
            if (choice === 1) {
              try {
                const userDataPath = app.getPath('userData');
                console.log(`Clearing user data at: ${userDataPath}`);
                // Be very careful with rmSync. Ensure it's the correct path.
                // Consider moving to trash instead of deleting permanently for safety.
                // fs.rmSync(userDataPath, { recursive: true, force: true });
                // For now, let's just log and simulate
                console.log('Simulated clearing of user data. To actually clear, uncomment fs.rmSync.');
                dialog.showMessageBoxSync(mainWindow!, {
                  type: 'info',
                  title: 'User Data Cleared (Simulated)',
                  message: 'User data has been (simulated) cleared. The application will now quit.',
                });
                app.quit();
              } catch (err: any) {
                console.error('Failed to clear user data:', err);
                dialog.showErrorBox('Error Clearing Data', `Failed to clear user data. Error: ${err.message}`);
              }
            }
          }
        }
      ]
    },
    // Add other menus like Edit, View, Window, Help as needed
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  console.log('Application menu created and set.');
};

// --- IPC Handlers ---
const setupIPCListeners = () => {
  console.log('Setting up IPC listeners...');

  ipcMain.handle(StorageChannel.SAVE_CUE_FILE, async (event, libraryName: string, cueName: string, cueData: Cue) => {
    console.log(`IPC Event: ${StorageChannel.SAVE_CUE_FILE} received for library '${libraryName}', cue '${cueName}'`);
    try {
      const result = await storageService.saveCueFile(libraryName, cueName, cueData);
      console.log(`IPC Event: ${StorageChannel.SAVE_CUE_FILE} - Save result:`, result);
      return result;
    } catch (error: unknown) {
      console.error(`IPC Event: ${StorageChannel.SAVE_CUE_FILE} - Error saving cue file:`, error);
      return { success: false, error: (error instanceof Error ? error.message : String(error)) || 'Unknown error during saveCueFile' };
    }
  });

  const expectedChannel = 'storage:list-user-libraries';
  console.log(`[IPC_SETUP_DEBUG] Registering handler for channel: "${expectedChannel}" (enum resolves to: "${StorageChannel.LIST_USER_LIBRARIES}")`);
  ipcMain.handle(expectedChannel, async (): Promise<Library[]> => {
    console.log(`IPC Event: "${expectedChannel}" received.`);
    try {
      const libraryFolderNames = await storageService.listUserLibraryFolders();
      console.log(`IPC Event: "${expectedChannel}" - Found folder names:`, libraryFolderNames);

      const libraries: Library[] = [];
      for (const folderName of libraryFolderNames) {
        const libraryPath = path.join(storageService.getPresentationLibraryPath(), folderName);
        const cuelists = await storageService.getLibraryCuelists(folderName);
        libraries.push({
          id: folderName, // Use folderName as id
          name: folderName,
          path: libraryPath,
          cuelists: cuelists,
        });
      }

      console.log(`IPC Event: ${StorageChannel.LIST_USER_LIBRARIES} - Constructed ${libraries.length} Library objects.`);
      return libraries;
    } catch (error: unknown) {
      console.error(`IPC Event: ${StorageChannel.LIST_USER_LIBRARIES} - Error listing libraries or fetching details:`, error);
      return []; // Return empty array on error
    }
  });

  ipcMain.handle(StorageChannel.CREATE_PRESENTATION_FILE, async (event, args: { libraryPath: string; baseName?: string }) => {
    console.log(`IPC Event: ${StorageChannel.CREATE_PRESENTATION_FILE} received with args:`, args);
    try {
      const result = await storageService.createPresentationFile(args.libraryPath, args.baseName);
      console.log(`IPC Event: ${StorageChannel.CREATE_PRESENTATION_FILE} - Create result:`, result);
      return result;
    } catch (error: unknown) {
      console.error(`IPC Event: ${StorageChannel.CREATE_PRESENTATION_FILE} - Error creating presentation file:`, error);
      return { success: false, error: (error instanceof Error ? error.message : String(error)) || 'Unknown error during createPresentationFile' };
    }
  });

  ipcMain.handle(StorageChannel.LIST_PRESENTATION_FILES, async (_event, libraryPath: string) => {
    console.log(`IPC Event: ${StorageChannel.LIST_PRESENTATION_FILES} received with libraryPath:`, libraryPath);
    console.log(`IPC Event: ${StorageChannel.LIST_PRESENTATION_FILES} libraryPath type:`, typeof libraryPath);
    
    if (typeof libraryPath !== 'string') {
      console.error(`IPC Event: ${StorageChannel.LIST_PRESENTATION_FILES} - libraryPath is not a string:`, libraryPath);
      return { success: false, error: 'Library path must be a string' };
    }
    
    try {
      console.log(`IPC Event: ${StorageChannel.LIST_PRESENTATION_FILES} - Calling storageService.listPresentationFiles with:`, libraryPath);
      const result = await storageService.listPresentationFiles(libraryPath);
      console.log(`IPC Event: ${StorageChannel.LIST_PRESENTATION_FILES} - Result:`, result);
      console.log(`IPC Event: ${StorageChannel.LIST_PRESENTATION_FILES} - Found ${result.files?.length || 0} presentation files`);
      
      // Convert the result format to match what the renderer expects
      const response = { 
        success: result.success, 
        data: result.files, 
        error: result.error 
      };
      
      console.log(`IPC Event: ${StorageChannel.LIST_PRESENTATION_FILES} - Returning response:`, response);
      return response;
    } catch (error: unknown) {
      console.error(`IPC Event: ${StorageChannel.LIST_PRESENTATION_FILES} - Error listing presentation files:`, error);
      return { success: false, error: (error instanceof Error ? error.message : String(error)) || 'Unknown error during listPresentationFiles' };
    }
  });

  ipcMain.handle(StorageChannel.CREATE_USER_LIBRARY, async (event, libraryName: string) => {
    console.log(`IPC Event: ${StorageChannel.CREATE_USER_LIBRARY} received for library '${libraryName}'.`);
    try {
      const result = await storageService.createUserLibrary(libraryName);
      console.log(`IPC Event: ${StorageChannel.CREATE_USER_LIBRARY} - Creation result:`, result);
      return result;
    } catch (error: unknown) {
      console.error(`IPC Event: ${StorageChannel.CREATE_USER_LIBRARY} - Error creating library:`, error);
      return { success: false, error: (error instanceof Error ? error.message : String(error)) || 'Unknown error during createUserLibrary' };
    }
  });

  ipcMain.handle(StorageChannel.RENAME_USER_LIBRARY, async (event, ...args) => {
    console.log(`[main.ts] RENAME_USER_LIBRARY handler raw ARGS:`, args);
    const oldName = args[0] as string;
    const newName = args[1] as string;
    console.log(`IPC Event: ${StorageChannel.RENAME_USER_LIBRARY} received to rename '${oldName}' to '${newName}'.`);
    try {
      const result = await storageService.renameUserLibrary(oldName, newName);
      console.log(`IPC Event: ${StorageChannel.RENAME_USER_LIBRARY} - Rename result:`, result);
      return result;
    } catch (error: unknown) {
      console.error(`IPC Event: ${StorageChannel.RENAME_USER_LIBRARY} - Error renaming library:`, error);
      return { success: false, error: (error instanceof Error ? error.message : String(error)) || 'Unknown error during renameUserLibrary' };
    }
  });

  ipcMain.handle(StorageChannel.DELETE_USER_LIBRARY, async (event, libraryName: string) => {
    console.log(`IPC Event: ${StorageChannel.DELETE_USER_LIBRARY} received to delete library '${libraryName}'.`);
    try {
      // Assuming libraryName is sufficient to identify and delete the library folder.
      // If the full path is needed and libraryName is just the name, StorageService might need to resolve it.
      const result = await storageService.deleteUserLibrary(libraryName);
      console.log(`IPC Event: ${StorageChannel.DELETE_USER_LIBRARY} - Delete result:`, result);
      return result;
    } catch (error: unknown) {
      console.error(`IPC Event: ${StorageChannel.DELETE_USER_LIBRARY} - Error deleting library:`, error);
      return { success: false, error: (error instanceof Error ? error.message : String(error)) || 'Unknown error during deleteUserLibrary' };
    }
  });

  ipcMain.handle(StorageChannel.GET_STORAGE_PATHS, () => {
    console.log(`IPC Event: ${StorageChannel.GET_STORAGE_PATHS} received.`);
    try {
      const paths = {
        presentationLibraryPath: storageService.getPresentationLibraryPath(),
        defaultUserLibraryPath: storageService.getDefaultUserLibraryPath(),
        mediaLibraryPath: storageService.getMediaLibraryPath(),
        userProjectsRootPath: storageService.getUserProjectsRootPath(),
        documentsBasePath: storageService.getGlobalLibrariesRoot(),
        globalLibrariesRootPath: storageService.getGlobalLibrariesRoot(),
      };
      return { success: true, data: paths };
    } catch (err) {
      console.error(`Error in ${StorageChannel.GET_STORAGE_PATHS} handler:`, err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      return { success: false, error: `Failed to get storage paths: ${errorMessage}` };
    }
  });

  // Listener for debug messages from renderer
  ipcMain.on(StorageChannel.MAIN_PROCESS_DEBUG_MESSAGE, (event, message: string) => {
    // console.log(`[FROM RENDERER DEBUG]: ${message}`); // Already logged by DebugIPC
    // This is mostly for DebugIPC to receive and forward if needed, or for direct main process logging
  });

  console.log('IPC listeners setup complete.');
};

// --- Application Lifecycle Events ---
app.whenReady().then(() => {
  console.log('App is ready. Initializing application components...');
  createWindow();
  createMenu();
  setupIPCListeners();

  // Watch for library changes and notify renderer
  // Library change notifications are handled internally by StorageService via chokidar,
  // which directly sends IPC messages (StorageChannel.LIBRARIES_DID_CHANGE).
  // No need for an additional event listener on storageService here in main.ts.

  app.on('activate', () => {
    console.log('App activated.');
    if (BrowserWindow.getAllWindows().length === 0) {
      console.log('No windows open, creating new main window.');
      createWindow();
    }
  });
  console.log('Application components initialized.');
}).catch(error => {
  console.error('Error during app.whenReady:', error);
});

app.on('window-all-closed', () => {
  console.log('All windows closed.');
  if (!IS_MAC) {
    console.log('Not on macOS, quitting application.');
    app.quit();
  }
});

app.on('will-quit', () => {
  console.log('Application will quit.');
  // Perform any cleanup here
});

// --- Development Specific ---
if (IS_DEVELOPMENT) {
  // Add any development-specific logic here
  console.log('Running in development mode.');

  // Example: Auto-open DevTools for any new BrowserWindow (useful for popups if any)
  /*
  app.on('browser-window-created', (event, window) => {
    if (!window.webContents.isDevToolsOpened()) {
      window.webContents.openDevTools();
    }
  });
  */
}

console.log('Main process script execution finished initial setup.');
