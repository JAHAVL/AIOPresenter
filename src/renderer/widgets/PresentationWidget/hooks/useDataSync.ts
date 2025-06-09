import { useState, useCallback, useEffect } from 'react';
import { getStoragePaths, type StoragePaths } from '../services/storageClient';
import { StorageChannel } from '@shared/ipcChannels';

// Assuming window.electronAPI is typed globally via a preload.d.ts file

interface UseDataSyncProps {
  fetchUserLibraries: () => Promise<void>; // Function from useLibraryManager
}

export interface UseDataSyncReturn {
  storagePaths: StoragePaths | null;
  lastRefreshTimestamp: number; // Add timestamp to track refreshes
  refreshLibraries: () => Promise<void>; // Expose refresh function
}

export const useDataSync = ({ fetchUserLibraries }: UseDataSyncProps): UseDataSyncReturn => {
  const [storagePaths, setStoragePaths] = useState<StoragePaths | null>(null);
  const [lastRefreshTimestamp, setLastRefreshTimestamp] = useState<number>(Date.now());

  const performDataFetchAndRefresh = useCallback(async () => {
    console.log('[useDataSync] Performing data fetch and refresh...');
    try {
      const pathsResult = await getStoragePaths();
      if (pathsResult.success && pathsResult.paths) {
        setStoragePaths(pathsResult.paths);
        console.log('[useDataSync] Storage paths loaded:', pathsResult.paths);
      } else {
        setStoragePaths(null); // Reset on failure to avoid stale data
        console.error('[useDataSync] Failed to fetch storage paths:', pathsResult.error);
      }

      // After updating storage paths (or attempting to), trigger library refresh
      // This was part of the original fetchInitialData logic in PresentationWidget
      await fetchUserLibraries();
      
      // Update the refresh timestamp to trigger re-renders in components using this hook
      setLastRefreshTimestamp(Date.now());
      console.log('[useDataSync] User libraries refresh triggered via fetchUserLibraries. Timestamp updated:', Date.now());

    } catch (error) {
      console.error('[useDataSync] Error during data fetch and refresh:', error);
      setStoragePaths(null); // Reset on error
    }
  }, [fetchUserLibraries]);

  // Initial fetch on mount
  useEffect(() => {
    performDataFetchAndRefresh();
  }, [performDataFetchAndRefresh]);

  // Setup listeners for library/folder changes from IPC
  useEffect(() => {
    console.log('[useDataSync] Setting up IPC listeners for data changes...');
    const listeners: Array<(() => void) | undefined> = [];

    if (window.electronAPI && typeof window.electronAPI.on === 'function') {
      // Log the channel name we're listening on to help with debugging
      console.log(`[useDataSync] Setting up listener for StorageChannel.LIBRARIES_DID_CHANGE with value: '${StorageChannel.LIBRARIES_DID_CHANGE}'`);
      
      // Make sure we're using the exact string value from the enum
      const librariesDidChangeChannel = StorageChannel.LIBRARIES_DID_CHANGE;
      console.log(`[useDataSync] Channel string value: '${librariesDidChangeChannel}'`);
      
      // Also set up a listener using the direct string value for redundancy
      const cleanupLibrariesDidChangeString = window.electronAPI.on('storage:libraries-did-change', async () => {
        console.log(`[useDataSync] ✅ Event received on direct string channel: 'storage:libraries-did-change'. Refreshing data...`);
        // Force a small delay to ensure the file system has settled
        await new Promise(resolve => setTimeout(resolve, 100));
        await performDataFetchAndRefresh();
      });
      listeners.push(cleanupLibrariesDidChangeString);
      
      // Keep the original listener as well
      const cleanupLibrariesDidChange = window.electronAPI.on(StorageChannel.LIBRARIES_DID_CHANGE, async () => {
        console.log(`[useDataSync] ✅ Event received on enum channel: '${StorageChannel.LIBRARIES_DID_CHANGE}'. Refreshing data...`);
        // Force a small delay to ensure the file system has settled
        await new Promise(resolve => setTimeout(resolve, 100));
        await performDataFetchAndRefresh();
      });
      listeners.push(cleanupLibrariesDidChange);

    } else {
      console.warn('[useDataSync] window.electronAPI.on is not available. Cannot subscribe to data changes.');
    }

    return () => {
      console.log('[useDataSync] Cleaning up IPC listeners...');
      listeners.forEach(cleanup => {
        if (typeof cleanup === 'function') {
          cleanup();
        }
      });
    };
  // performDataFetchAndRefresh is a dependency because it captures fetchUserLibraries.
  // If fetchUserLibraries itself changes (e.g., if useLibraryManager is re-instantiated with different params),
  // we want to ensure the listeners use the latest version.
  }, [performDataFetchAndRefresh]);

  // Expose the refresh function to allow manual refreshes
  const refreshLibraries = useCallback(async () => {
    console.log('[useDataSync] Manual refresh requested');
    await performDataFetchAndRefresh();
  }, [performDataFetchAndRefresh]);

  return { 
    storagePaths, 
    lastRefreshTimestamp,
    refreshLibraries 
  };
};
