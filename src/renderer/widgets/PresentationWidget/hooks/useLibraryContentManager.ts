import { useState, useEffect, useCallback } from 'react';
import type { PresentationFile } from '../../../../shared/ipcChannels';
import { createPresentationFile, listPresentationFiles } from '../services/storageClient';

interface UseLibraryContentManagerReturn {
  libraryContents: PresentationFile[];
  isLoading: boolean;
  error: Error | null;
  fetchLibraryContents: (libraryPath: string) => Promise<void>;
  createNewPresentation: (libraryPath: string) => Promise<{ success: boolean; filePath?: string; error?: string }>;
}

/**
 * Hook to manage library contents (presentation files)
 */
export const useLibraryContentManager = (): UseLibraryContentManagerReturn => {
  const [libraryContents, setLibraryContents] = useState<PresentationFile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentLibraryPath, setCurrentLibraryPath] = useState<string | null>(null);

  /**
   * Fetch contents of a library
   */
  const fetchLibraryContents = useCallback(async (libraryPath: string) => {
    console.log('[useLibraryContentManager] Fetching library contents for:', libraryPath);
    setIsLoading(true);
    setError(null);
    setCurrentLibraryPath(libraryPath);

    try {
      // Call the storageClient service to list presentation files in the library
      console.log('[useLibraryContentManager] Calling listPresentationFiles with path:', libraryPath);
      const response = await listPresentationFiles(libraryPath);
      console.log('[useLibraryContentManager] Response from listPresentationFiles:', response);
      
      if (response.success && response.data) {
        console.log(`[useLibraryContentManager] Found ${response.data.length} presentations in library:`, libraryPath);
        console.log('[useLibraryContentManager] Presentation files data:', response.data);
        setLibraryContents(response.data);
        console.log('[useLibraryContentManager] Updated libraryContents state:', response.data);
      } else {
        console.error('[useLibraryContentManager] Failed to list presentations:', response.error);
        setError(new Error(response.error || 'Failed to fetch library contents'));
        setLibraryContents([]);
      }
    } catch (err) {
      console.error('[useLibraryContentManager] Error fetching library contents:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch library contents'));
      setLibraryContents([]);
    }
    
    setIsLoading(false);
  }, []);

  /**
   * Create a new presentation in the specified library
   */
  const createNewPresentation = useCallback(async (libraryPath: string) => {
    console.log('[useLibraryContentManager] Creating new presentation in:', libraryPath);
    
    try {
      const result = await createPresentationFile(libraryPath, "New Presentation");
      
      if (result.success && currentLibraryPath === libraryPath) {
        // If successful and we're still viewing the same library, refresh the contents
        await fetchLibraryContents(libraryPath);
      }
      
      return result;
    } catch (error: any) {
      console.error('[useLibraryContentManager] Error creating presentation:', error);
      return { 
        success: false, 
        error: error.message || 'Unknown error during presentation creation' 
      };
    }
  }, [currentLibraryPath, fetchLibraryContents]);

  return { 
    libraryContents, 
    isLoading, 
    error, 
    fetchLibraryContents,
    createNewPresentation
  };
};
