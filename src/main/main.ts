// src/main/main.ts
// CACHE_BREAKER_COMMENT_JUNE_05_2025_1135_AM
console.log('<<<<< EXECUTING MAIN.TS - CACHE BREAKER ACTIVE >>>>>');
import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron';
import { StorageChannel } from '../shared/ipcChannels';
import fs from 'fs';
import path from 'path';
import util from 'util';

// Completely disable console output to bypass EPIPE errors
// Store original console methods
const originalConsole = { ...console };

// Replace all console methods with no-ops (Commented out to allow file logging)
// console.log = () => {};
// console.info = () => {};
// console.warn = () => {};
// console.error = () => {};
// console.debug = () => {};


// Redirect console output to a log file
const logDirectory = app.getPath('userData');
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}
const logFilePath = path.join(logDirectory, 'main.log');
const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

console.log = (...args: any[]) => {
  logStream.write(util.format(...args) + '\n');
  process.stdout.write(util.format(...args) + '\n'); // Also keep writing to stdout if possible
};
console.error = (...args: any[]) => {
  logStream.write(util.format('ERROR:', ...args) + '\n');
  process.stderr.write(util.format('ERROR:', ...args) + '\n');
};
console.warn = (...args: any[]) => {
  logStream.write(util.format('WARN:', ...args) + '\n');
  process.stdout.write(util.format('WARN:', ...args) + '\n');
};
console.info = (...args: any[]) => {
  logStream.write(util.format('INFO:', ...args) + '\n');
  process.stdout.write(util.format('INFO:', ...args) + '\n');
};
console.debug = (...args: any[]) => {
  logStream.write(util.format('DEBUG:', ...args) + '\n');
  process.stdout.write(util.format('DEBUG:', ...args) + '\n');
};

console.log(`<<<<< Main process started. Logging to: ${logFilePath} >>>>>`);
console.log(`Node.js version: ${process.version}`);
console.log(`Electron version: ${process.versions.electron}`);
console.log(`App version: ${app.getVersion()}`);
console.log(`User Data Path: ${app.getPath('userData')}`);

process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION IN MAIN PROCESS:', error);
  // Optionally, exit or attempt a graceful shutdown
  // app.quit();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION IN MAIN PROCESS:', reason, promise);
});


import { exec } from 'child_process';
import 'electron-squirrel-startup';
import * as PathConfig from '../utils/pathconfig'; // Handles squirrel startup events for windows installers
import { StorageService } from './StorageService';
import { initializeStorageIpcHandlers } from './ipc/storageHandlers';
import { setupInputHandlers } from './ipc/inputHandlers';

// Define WEBPACK_DEV_SERVER_URL. vite-plugin-electron will define this during development.
declare const WEBPACK_DEV_SERVER_URL: string; // Injected by Webpack DefinePlugin in webpack.main.config.js

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

const isDev = process.env.NODE_ENV === 'development';

async function createWindow() {
  console.log('[main.ts] Attempting to create window...');

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false, // Remove standard OS window frame
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'hidden', // 'hiddenInset' for macOS, 'hidden' for others
    show: false, // Initially hide the window, show when ready or via tray
    webPreferences: {
      preload: PathConfig.getPreloadPath(__dirname),
      contextIsolation: true,
      nodeIntegration: false,
    },
    backgroundColor: '#181818', // Dark theme color
  });

  // Show window when it's ready to prevent flash of unstyled content
  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });

  // console.log('[main.ts] MainWindow object created.');

  // Attempt to open DevTools immediately, before any URL loading
  if (mainWindow && !mainWindow.webContents.isDestroyed() && !mainWindow.webContents.isDevToolsOpened() && isDev) {
    // console.log('[main.ts] Attempting to open DevTools BEFORE URL load...');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    // console.error(`[main.ts] Failed to load URL: ${validatedURL}. Error ${errorCode}: ${errorDescription}`);
    const errorHtml = `data:text/html;charset=utf-8,${encodeURIComponent(`
      <html>
        <body style="font-family: sans-serif; padding: 20px; background-color: #FFCCCC;">
          <h1>Error Loading Page</h1>
          <p>Could not load content for: <strong>${validatedURL}</strong></p>
          <p>Error: ${errorDescription} (Code: ${errorCode})</p>
        </body>
      </html>
    `)}`;
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.loadURL(errorHtml);
  });
  
  mainWindow.webContents.on('did-finish-load', () => {
    // console.log('[main.ts] WebContents finished loading content.');
    // Ensure DevTools are open if they weren't already
    if (mainWindow && !mainWindow.webContents.isDestroyed() && !mainWindow.webContents.isDevToolsOpened() && isDev) {
      // console.log('[main.ts] Attempting to open DevTools AFTER did-finish-load (if not already open)...');
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
  });

  mainWindow.webContents.on('devtools-opened', () => {
    // console.log('[main.ts] DevTools confirmed opened.'); // EPIPE Hunt
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    app.quit(); // Ensure app quits when main window is closed
  });

  if (mainWindow) {
    // console.log('[main.ts] Clearing Electron session cache...'); // EPIPE Hunt
    await mainWindow.webContents.session.clearCache();
    // console.log('[main.ts] Electron session cache cleared.'); // EPIPE Hunt
  }

  // console.log(`[main.ts] NODE_ENV: ${process.env.NODE_ENV}, WEBPACK_DEV_SERVER_URL: ${WEBPACK_DEV_SERVER_URL}`); // Commented out to prevent EPIPE error

  if (isDev) {
    console.log('[main.ts] In development mode.');

    let targetUrl = '';
    if (typeof WEBPACK_DEV_SERVER_URL === 'string' && WEBPACK_DEV_SERVER_URL.trim() !== '') {
      targetUrl = WEBPACK_DEV_SERVER_URL;
      console.log(`[main.ts] Using WEBPACK_DEV_SERVER_URL: ${targetUrl}`);
    } else {
      targetUrl = `http://localhost:8080`; // Fallback to development server port
      console.warn(`[main.ts] WEBPACK_DEV_SERVER_URL not defined or empty. Falling back to: ${targetUrl}`);
    }
    
    // Append a timestamp to try and bypass caching issues if any
    targetUrl += (targetUrl.includes('?') ? '&t=' : '?t=') + Date.now();

    // The onBeforeRequest logging can be verbose, keep if needed for deep debugging.
    // mainWindow.webContents.session.webRequest.onBeforeRequest({ urls: ['*://*/*'] }, 
    //   (details: { url: string }, callback: (response: { cancel?: boolean; redirectURL?: string }) => void) => {
    //     fs.appendFileSync(logFilePath, `[main.ts] Request: ${details.url}\n`);
    //     callback({});
    //   }
    // );
    
    console.log(`[main.ts] Attempting to load URL: ${targetUrl}`);
    fs.appendFileSync(logFilePath, `[main.ts] Loading URL: ${targetUrl}\n`);
    
    try {
      await mainWindow.loadURL(targetUrl);
      console.log(`[main.ts] Successfully loaded URL: ${targetUrl}`);
      fs.appendFileSync(logFilePath, `[main.ts] Successfully loaded dev URL: ${targetUrl}\n`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(`[main.ts] Error loading dev URL (${targetUrl}): ${errorMessage}`);
      fs.appendFileSync(logFilePath, `[main.ts] Error loading dev URL (${targetUrl}): ${errorMessage}\n`);
      // Fallback to prod path if dev fails
      try {
        const prodPath = PathConfig.getProdIndexPath(__dirname);
        console.log(`[main.ts] Attempting to load fallback production path: ${prodPath}`);
        await mainWindow.loadFile(prodPath);
        console.log(`[main.ts] Successfully loaded fallback production path: ${prodPath}`);
      } catch (fallbackErr: unknown) {
        const fallbackErrorMessage = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
        console.error(`[main.ts] Error loading fallback production path: ${fallbackErrorMessage}`);
        fs.appendFileSync(logFilePath, `[main.ts] Error loading fallback production path: ${fallbackErrorMessage}\n`);
        // If fallback also fails, load an error page
        const errorHtml = `data:text/html;charset=utf-8,${encodeURIComponent(`
          <html>
            <body style="font-family: sans-serif; padding: 20px; background-color: #FFCCCC;">
              <h1>Error Loading Page</h1>
              <p>Could not load application content. Development server may not be running or production files may be missing.</p>
              <p>Attempted URL: <strong>${targetUrl}</strong></p>
              <p>Error: ${errorMessage}</p>
            </body>
          </html>
        `)}`;
        if (mainWindow && !mainWindow.isDestroyed()) mainWindow.loadURL(errorHtml);
      }
    }
    
    // Open DevTools in development mode if not already opened
    if (mainWindow && !mainWindow.webContents.isDestroyed() && !mainWindow.webContents.isDevToolsOpened()) {
        mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
  } else {
    const prodPath = PathConfig.getProdIndexPath(__dirname);
    // console.log(`[main.ts] Loading PROD file: ${prodPath}`);
    await mainWindow.loadFile(prodPath);
  }

  ipcMain.on('ping', () => {/* console.log('[main.ts] Main process received ping') */});
}

function createTray() {
  const iconPath = PathConfig.getIconPath(isDev, app.getAppPath(), __dirname);
  
  // console.log(`[main.ts] Attempting to load tray icon from: ${iconPath}`);

  try {
    const image = nativeImage.createFromPath(iconPath);
    if (image.isEmpty()) {
      // console.error(`[main.ts] Failed to load tray icon at ${iconPath}. Image is empty.`);
      tray = new Tray(nativeImage.createEmpty());
    } else {
      // console.log(`[main.ts] Tray icon loaded from ${iconPath}`);
      tray = new Tray(image);
    }
  } catch (error) {
    // console.error(`[main.ts] Error creating tray icon from path ${iconPath}:`, error);
    tray = new Tray(nativeImage.createEmpty());
  }

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Preferences...',
      click: () => {
        // console.log('[main.ts] Preferences clicked (not implemented yet)');
        mainWindow?.show();
      },
    },
    {
      label: 'Show/Hide App',
      click: () => {
        if (mainWindow) {
          if (mainWindow.isVisible() && mainWindow.isFocused()) {
            mainWindow.hide();
          } else {
            mainWindow.show();
            mainWindow.focus();
          }
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Quit AIOPRESENTER',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setToolTip('AIOPRESENTER');
  tray.setContextMenu(contextMenu);

  if (process.platform === 'darwin') {
    tray.on('click', () => {
      if (mainWindow) {
        if (mainWindow.isVisible()) {
          mainWindow.hide(); 
        } else {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    });
  }

  // console.log('[main.ts] Tray icon created.');
}

app.whenReady().then(async () => {
  console.log('[main.ts] app.whenReady().then() --- BLOCK ENTERED ---');

  // Initialize IPC handlers FIRST
  let initError: any = null; // Changed to 'any' to store potential error object
  (ipcMain as any).__MAIN_TS_MARKER__ = 'SetDirectlyInMainTS_IPC_Instance';
  console.log('[main.ts] Marked ipcMain instance with __MAIN_TS_MARKER__:', (ipcMain as any).__MAIN_TS_MARKER__);

  const sendMainDebug = (source: string, message: string, data?: any) => {
    console.log(`[main.ts DEBUG] ${source}: ${message}`, data || '');
    // mainWindow might be null here if called before createWindow, so check it
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send(StorageChannel.MAIN_PROCESS_DEBUG_MESSAGE, {
        source,
        log: message,
        ...(data || {})
      });
    }
  };

  sendMainDebug('initial_state', 'Initial ipcMain event names (before any handler registration).', { eventNames: ipcMain.eventNames() });

  // Call initializeStorageIpcHandlers (and other IPC initializations like setupInputHandlers if they exist)
  try {
    // Note: mainWindow will be null here, storageHandlers is designed to handle this for debug logs.
    initializeStorageIpcHandlers(ipcMain, mainWindow, StorageService);
    sendMainDebug('after_storage_handlers_call', 'SUCCESS: initializeStorageIpcHandlers completed. Event names now:', { eventNames: ipcMain.eventNames() });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    sendMainDebug('storage_handlers_call_error', 'ERROR during initializeStorageIpcHandlers call.', { error: errorMessage, eventNames: ipcMain.eventNames() });
    initError = error; // Keep for final summary
  }

  // TODO: Consider moving setupInputHandlers here as well if it exists and follows a similar pattern

  sendMainDebug('final_ipc_state_before_createWindow', 'Final ipcMain event names after initial handler setup, before createWindow.', { eventNames: ipcMain.eventNames(), initializationError: initError ? (initError instanceof Error ? initError.message : String(initError)) : null });

  // Now create the window and tray
  // console.log('[main.ts] App is ready, calling createWindow and createTray...');
  await createWindow();
  createTray();
  
  // The rest of the debug logging and specific test handlers can remain or be adjusted as needed
  // For instance, sendMainDebug can now use the fully initialized mainWindow if called from here onwards.


  // console.log('[main.ts] IPC handlers initialized.');

  app.on('activate', async () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
    if (mainWindow && !mainWindow.isVisible()) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}); // This closes the app.whenReady().then(() => { ... })

app.on('will-quit', () => {
  if (process.env.NODE_ENV === 'development') {
    // console.log('[main.ts] App is quitting in DEV mode. Attempting to kill port 9871...');
    exec('kill-port 9871', (error, stdout, stderr) => {
      if (error) {
        // console.error(`[main.ts] Error killing port 9871: ${error.message}`);
        return;
      }
      if (stderr) {
        // console.warn(`[main.ts] Stderr while killing port 9871: ${stderr}`);
      }
      // console.log(`[main.ts] Kill port 9871 result: ${stdout}`);
    });
  } else {
    // console.log('[main.ts] App is quitting in non-DEV mode.');
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// console.log('[main.ts] Main process initialization complete.');
