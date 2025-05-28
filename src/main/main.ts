// src/main/main.ts
import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron';
import path from 'path';
import { exec } from 'child_process';
import 'electron-squirrel-startup'; // Handles squirrel startup events for windows installers

// Define VITE_DEV_SERVER_URL. vite-plugin-electron will define this during development.
declare const VITE_DEV_SERVER_URL: string | undefined;

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

function createWindow() {
  console.log('[main.ts] Attempting to create window...');

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false, // Remove standard OS window frame
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'hidden', // 'hiddenInset' for macOS, 'hidden' for others
    show: false, // Initially hide the window, show when ready or via tray
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'), // Adjusted path for Vite output
      contextIsolation: true,
      nodeIntegration: false,
    },
    backgroundColor: '#181818', // Changed from '#FF4136' to dark theme color
  });

  // Show window when it's ready to prevent flash of unstyled content
  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });

  console.log('[main.ts] MainWindow object created.');

  // Attempt to open DevTools immediately, before any URL loading
  if (mainWindow && !mainWindow.webContents.isDestroyed() && !mainWindow.webContents.isDevToolsOpened()) {
    console.log('[main.ts] Attempting to open DevTools BEFORE URL load...');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error(`[main.ts] Failed to load URL: ${validatedURL}. Error ${errorCode}: ${errorDescription}`);
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
    console.log('[main.ts] WebContents finished loading content.');
    // Ensure DevTools are open if they weren't already
    if (mainWindow && !mainWindow.webContents.isDestroyed() && !mainWindow.webContents.isDevToolsOpened()) {
      console.log('[main.ts] Attempting to open DevTools AFTER did-finish-load (if not already open)...');
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
  });

  mainWindow.webContents.on('devtools-opened', () => {
    console.log('[main.ts] DevTools confirmed opened.');
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    app.quit(); // Ensure app quits when main window is closed
  });

  // mainWindow.on('close', ...) handler that previously hid the window on macOS
  // has been removed to allow the window to close, which then triggers 'closed' event for app.quit().

  const isDev = import.meta.env.DEV;
  console.log(`[main.ts] import.meta.env.DEV: ${isDev}, VITE_DEV_SERVER_URL: ${VITE_DEV_SERVER_URL}`);

  if (isDev && VITE_DEV_SERVER_URL) {
    console.log(`[main.ts] Loading DEV URL: ${VITE_DEV_SERVER_URL}`);
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
  } else {
    const prodPath = path.join(__dirname, '../renderer/index.html');
    console.log(`[main.ts] Loading PROD file: ${prodPath}`);
    mainWindow.loadFile(prodPath);
  }

  ipcMain.on('ping', () => console.log('[main.ts] Main process received ping'));
}

function createTray() {
  // Icon should be in 'AIOPRESENTER/public/assets/iconTemplate.png'
  // In dev, app.getAppPath() is project root. In prod, it's app root.
  // Vite serves 'public' dir at root, and copies it to output root.
  const iconName = 'iconTemplate.png'; // Electron handles @2x for macOS automatically if present
  
  let basePath;
  if (import.meta.env.DEV) {
    // In development, app.getAppPath() is the project root.
    // Assets are in 'public/assets' relative to project root.
    basePath = path.join(app.getAppPath(), 'public');
  } else {
    // In production, app.getAppPath() is the app's root directory (e.g., inside app.asar).
    // Assets from 'public' are copied to the root of this directory.
    basePath = app.getAppPath();
  }
  const iconPath = path.join(basePath, 'assets', iconName);
  
  console.log(`[main.ts] Attempting to load tray icon from: ${iconPath}`);

  try {
    const image = nativeImage.createFromPath(iconPath);
    if (image.isEmpty()) {
      console.error(`[main.ts] Failed to load tray icon at ${iconPath}. Image is empty.`);
      // Fallback or error handling if icon doesn't load
      tray = new Tray(nativeImage.createEmpty()); // Creates a blank space, less ideal
    } else {
      console.log(`[main.ts] Tray icon loaded from ${iconPath}`);
      tray = new Tray(image);
    }
  } catch (error) {
    console.error(`[main.ts] Error creating tray icon from path ${iconPath}:`, error);
    tray = new Tray(nativeImage.createEmpty()); // Fallback
  }

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Preferences...',
      click: () => {
        console.log('[main.ts] Preferences clicked (not implemented yet)');
        // Here you would typically open a preferences window or show the main window
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

  // On macOS, clicking the tray icon usually shows/hides the app or a popover.
  // Left click to show/hide window, right click for context menu (default on Windows/Linux)
  if (process.platform === 'darwin') {
    tray.on('click', () => {
      if (mainWindow) {
        if (mainWindow.isVisible()) {
           // If you want left click to also show context menu on mac, call: tray.popUpContextMenu();
           // Or toggle window visibility:
          mainWindow.hide(); 
        } else {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    });
    // Right click for context menu on macOS is handled by setContextMenu by default
  }

  console.log('[main.ts] Tray icon created.');
}

app.whenReady().then(() => {
  console.log('[main.ts] App is ready, calling createWindow and createTray...');
  createWindow();
  createTray();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      console.log('[main.ts] App activate, calling createWindow...');
      createWindow();
    }
    // Ensure main window is shown if it was hidden
    if (mainWindow && !mainWindow.isVisible()) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
});

app.on('will-quit', () => {
  if (import.meta.env.DEV) {
    console.log('[main.ts] App is quitting in DEV mode. Attempting to kill port 9871...');
    exec('kill-port 9871', (error, stdout, stderr) => {
      if (error) {
        console.error(`[main.ts] Error killing port 9871: ${error.message}`);
        return;
      }
      if (stderr) {
        console.warn(`[main.ts] Stderr while killing port 9871: ${stderr}`);
      }
      console.log(`[main.ts] kill-port 9871 stdout: ${stdout}`);
    });
  }
});

app.on('window-all-closed', () => {
  // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.
  // With a tray icon, you might not want to quit even on other platforms.
  if (process.platform !== 'darwin') {
    app.quit();
  }
  // If we want the app to quit if not on macOS and no tray, this is fine.
  // If tray exists, usually the app doesn't quit when all windows are closed.
  // The 'Quit' option in tray menu becomes the primary way to exit.
  if (!tray || tray.isDestroyed()) { // Only quit if no tray icon
    if (process.platform !== 'darwin') {
      app.quit();
    }
  }
});

console.log('[main.ts] Main process script top-level execution finished.');
