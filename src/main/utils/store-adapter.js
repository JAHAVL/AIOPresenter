// AIOPRESENTER/src/main/utils/store-adapter.js
// This file is intentionally written in CommonJS to avoid any transpilation issues.
// Its purpose is to reliably load electron-store, create an instance, and export it.

let storeInstance = null;
let S_A_error = null;

console.log('[store-adapter] Initializing for instance export...');

try {
  const electronStoreModule = require('electron-store');
  console.log('[store-adapter] Required electron-store module, type:', typeof electronStoreModule);
  // console.log('[store-adapter] electron-store module value:', electronStoreModule); // Can be verbose

  let StoreConstructor = null;
  if (typeof electronStoreModule === 'function') {
    console.log('[store-adapter] electron-store module itself is a function. Using it as constructor.');
    StoreConstructor = electronStoreModule;
  } else if (electronStoreModule && typeof electronStoreModule.default === 'function') {
    console.log('[store-adapter] electron-store module has a .default function. Using .default as constructor.');
    StoreConstructor = electronStoreModule.default;
  } else if (electronStoreModule && typeof electronStoreModule.Store === 'function') {
    console.log('[store-adapter] electron-store module has a .Store function. Using .Store as constructor.');
    StoreConstructor = electronStoreModule.Store;
  } else {
    S_A_error = new Error('No recognizable constructor found in electron-store module.');
    console.error('[store-adapter]', S_A_error.message, 'Module content:', electronStoreModule);
  }

  if (StoreConstructor) {
    console.log('[store-adapter] Successfully identified StoreConstructor. Type:', typeof StoreConstructor);
    try {
      storeInstance = new StoreConstructor({
        name: 'aiopresenter-config-via-adapter',
        // schema: {}, // Optional: define schema if needed
      });
      console.log('[store-adapter] Successfully created store instance. Path:', storeInstance.path);
    } catch (instantiationError) {
      S_A_error = instantiationError;
      console.error('[store-adapter] CRITICAL ERROR instantiating electron-store:', instantiationError);
      storeInstance = null; // Ensure instance is null on error
    }
  } else if (!S_A_error) {
    S_A_error = new Error('StoreConstructor is null after checks, but no specific error was caught during loading.');
    console.error('[store-adapter]', S_A_error.message);
  }

} catch (loadError) {
  S_A_error = loadError;
  console.error('[store-adapter] CRITICAL ERROR loading electron-store module:', loadError);
}

if (S_A_error && !storeInstance) {
  console.warn('[store-adapter] Due to errors, storeInstance is null. Exporting null.');
}

module.exports = storeInstance;


