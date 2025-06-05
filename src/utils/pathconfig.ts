// src/utils/pathconfig.ts
import path from 'path';

// This file defines path aliases and provides runtime path resolution functions.

// Compile-time aliases (already configured in tsconfig.json and webpack config)
export const compileTimeAliases = {
  app: '@src/renderer/App.tsx',
  mainProcess: '@src/main/main.ts',
  preloadScript: '@src/preload/preload.ts',
  assets: '@src/renderer/assets',
  components: '@src/renderer/components',
  pages: '@src/renderer/pages',
  widgets: '@src/renderer/widgets',
  utils: '@src/utils'
};

// Runtime path functions for use in main.ts
// mainProcessDir should be __dirname from main.ts (dist/main at runtime)
// appPath should be app.getAppPath() from main.ts

export function getPreloadPath(mainProcessDir: string): string {
  // preload.js is output by Webpack to dist/preload/preload.js
  // main.js is in dist/main/main.js
  // So, from dist/main, go up one level to dist, then into preload/preload.js
  return path.join(mainProcessDir, '../preload/preload.js');
}

export function getProdIndexPath(mainProcessDir: string): string {
  // index.html for production is output by Webpack to dist/renderer/index.html
  // main.js is in dist/main/main.js
  // So, from dist/main, go up one level to dist, then into renderer/index.html
  return path.join(mainProcessDir, '../renderer/index.html');
}

const ICON_NAME = 'iconTemplate.png';

export function getIconPath(isDev: boolean, appPath: string, mainProcessDir: string): string {
  let basePath;
  if (isDev) {
    // In development, appPath is project_root (e.g., /.../AIOPRESENTER)
    // However, if main.ts is running from dist/main, app.getAppPath() might be dist/main.
    // Let's assume mainProcessDir (which is __dirname from main.ts, i.e., dist/main) is more reliable for dev pathing to project root.
    // From dist/main, go up two levels to reach project_root, then into 'public/assets'.
    basePath = path.join(mainProcessDir, '../../public/assets');
  } else {
    // In production, appPath is the app's root directory (e.g., inside app.asar).
    // Assets from 'public' are copied to the root of this directory by a build step (assumed).
    // If assets are bundled into 'dist/renderer/assets' or similar by Webpack, this needs adjustment.
    // For now, assuming assets are at the root of the app package, or in a specific 'assets' subfolder.
    // Let's assume they are in an 'assets' folder at the same level as main.js (dist/main/assets)
    // OR that they are copied to the root of the app (appPath/assets).
    // The original logic for prod was: basePath = app.getAppPath(); then path.join(basePath, 'assets', iconName)
    // This implies assets are in app_root/assets. If they are in public/assets copied to app_root/public/assets, it's different.
    // Let's stick to the original production logic's implication: assets are in a top-level 'assets' folder relative to appPath.
    // If public/assets is copied to the root of the app package, then it would be path.join(appPath, 'public', 'assets', ICON_NAME)
    // The previous code used path.join(app.getAppPath(), 'assets', iconName) effectively after resolving basePath = app.getAppPath().
    // This means it expected assets to be in app_root/assets.
    // Let's make it explicit: project_root/public/assets -> app_root/assets (after packaging)
    basePath = path.join(appPath, 'assets'); // Assumes 'public/assets' are copied to 'assets' at the app root in production.
  }
  return path.join(basePath, ICON_NAME);
}

// Path constants for StorageService
export const PATH_CONFIG = {
  AIO_DIR_NAME: 'AIO',
  APP_DIR_NAME: 'AIOPRESENTER', // For projects: Documents/AIO/AIOPRESENTER
  APP_DIR_NAME_MIXED_CASE_FOR_LIBS: 'AIOPresenter', // For libraries: Documents/AIOPresenter
  LIBRARIES_DIR_NAME: 'Libraries',
  DEFAULT_LIBRARY_DIR_NAME: 'Default',
  MEDIA_LIBRARY_DIR_NAME: 'Media',
  PROJECTS_DIR_NAME: 'Projects'
};

console.log('[pathconfig.ts] Pathconfig loaded with runtime functions.');
