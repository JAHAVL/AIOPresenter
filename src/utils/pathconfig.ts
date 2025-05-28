// src/utils/pathconfig.ts

// This file will define path aliases for the AIOPRESENTER project.
// These aliases should be configured in tsconfig.json and webpack config.

// Example (these will be refined as the project grows):
export const paths = {
  app: '@src/renderer/App.tsx',
  mainProcess: '@src/main/main.ts',
  preloadScript: '@src/preload/preload.ts',
  assets: '@src/renderer/assets',
  components: '@src/renderer/components',
  pages: '@src/renderer/pages',
  widgets: '@src/renderer/widgets',
  utils: '@src/utils'
};

// You can also define more specific paths as needed, for example:
// export const WelcomePagePath = '@src/renderer/pages/WelcomePage/WelcomePage.tsx';

console.log('Pathconfig loaded');
