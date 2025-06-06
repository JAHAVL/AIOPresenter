import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Library, Cuelist, Cue } from '@customTypes/presentationSharedTypes';
import type { UserLibrary as ClientUserLibrary } from '../services/storageClient';
import { initialLibraries as mockLibraries } from '@PresentationWidgetMocks';

interface UseLibraryManagerReturn {
  uniqueLibraries: Library[];
  isLoading: boolean;
  error: Error | null;
  fetchUserLibraries: () => Promise<void>;
}

export const useLibraryManager = (): UseLibraryManagerReturn => {
  const [userLibraries, setUserLibraries] = useState<ClientUserLibrary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUserLibraries = useCallback(async () => {
    console.log('[useLibraryManager] Fetching user libraries...');
    setIsLoading(true);
    setError(null);
    try {
      if (window.electron?.ipcRenderer) {
        const response: { success: boolean, data?: ClientUserLibrary[], error?: string } = await window.electron.ipcRenderer.invoke('listUserLibraries');
        if (response.success && response.data) {
          setUserLibraries(response.data);
        } else {
          console.error('Failed to fetch user libraries from IPC or data was empty:', response.error);
          setUserLibraries([]); // Fallback to empty on error or no data
          if (response.error) setError(new Error(response.error));
        }
      } else {
        console.warn('Electron IPC not available for fetching user libraries. Using only mock libraries.');
        setUserLibraries([]); // No user libraries if IPC is not available
      }
    } catch (err) {
      console.error('Failed to fetch user libraries:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch user libraries'));
      setUserLibraries([]); // Fallback to empty on error
    }
    setIsLoading(false);
  }, []); // Dependencies for useCallback, e.g., if it used props or other state setters from the hook itself.

  useEffect(() => {
    fetchUserLibraries();
  }, [fetchUserLibraries]); // fetchUserLibraries is now a stable dependency

  const uniqueLibraries = useMemo(() => {
    const mappedUserLibraries: Library[] = userLibraries.map(ul => ({
      id: ul.path, // Using path as ID, assuming it's unique for user libraries
      name: ul.name,
      path: ul.path,
      cues: ul.cues || [], // Directly use cues from ClientUserLibrary
    }));

    const allLibraries = [...mockLibraries, ...mappedUserLibraries];
    const unique = Array.from(new Map(allLibraries.map(lib => [lib.id, lib])).values());
    // Sort by name for consistent display
    return unique.sort((a, b) => a.name.localeCompare(b.name));
  }, [mockLibraries, userLibraries]);

  return { uniqueLibraries, isLoading, error, fetchUserLibraries };
};
