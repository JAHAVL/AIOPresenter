import { useState, useCallback, useMemo } from 'react';
import { nanoid } from 'nanoid';
import type { Library, Cuelist, Cue, TextSlideElement } from '../types/presentationSharedTypes';

interface UseCuelistManagerProps {
  uniqueLibraries: Library[];
}

export interface UseCuelistManagerReturn {
  cuelists: Cuelist[];
  selectedItemId: string | null;
  selectedItemType: 'library' | 'cuelist' | 'folder' | null;
  handleSelectLibraryOrCuelist: (id: string | null, type: 'library' | 'cuelist' | 'folder' | null) => void;
  submitNewCuelist: (newCuelistName: string, parentLibraryId: string) => void;
  cuelistsForSelectedLibrary: Cuelist[];
  cuesForSelectedCuelist: Cue[];
  selectedLibraryName: string | undefined;
  selectedCuelistName: string | undefined;
  handleAddCueToCuelist: (cuelistId: string, newCueName: string) => void;
}

export const useCuelistManager = ({ uniqueLibraries }: UseCuelistManagerProps): UseCuelistManagerReturn => {
  const [cuelists, setCuelists] = useState<Cuelist[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<'library' | 'cuelist' | 'folder' | null>(null);

  const handleSelectLibraryOrCuelist = useCallback((id: string | null, type: 'library' | 'cuelist' | 'folder' | null) => {
    console.log(`[useCuelistManager] Selecting item: ${id}, type: ${type}`);
    setSelectedItemId(id);
    setSelectedItemType(type);
    // If a library is selected, and it's different from the current, deselect any cuelist
    if (type === 'library' && selectedItemType === 'cuelist') {
      // This logic might need refinement based on desired UX when switching library selections
    }
  }, [selectedItemType]);

  const submitNewCuelist = useCallback((newCuelistName: string, parentLibraryId: string) => {
    console.log(`[useCuelistManager] Attempting to create cuelist: ${newCuelistName} in library ${parentLibraryId}`);
    if (!newCuelistName || newCuelistName.trim() === '') {
      console.warn('[useCuelistManager] Cuelist name cannot be empty.');
      return;
    }
    if (!uniqueLibraries.find(lib => lib.id === parentLibraryId)) {
        console.warn(`[useCuelistManager] Parent library with ID ${parentLibraryId} not found.`);
        return;
    }

    const newCuelist: Cuelist = {
      id: nanoid(),
      name: newCuelistName.trim(),
      type: 'cuelist',
      cues: [],
      parentId: parentLibraryId,
    };

    setCuelists(prevCuelists => [...prevCuelists, newCuelist]);
    console.log(`[useCuelistManager] Cuelist '${newCuelist.name}' (ID: ${newCuelist.id}) added.`);
  }, [uniqueLibraries]);

  const selectedLibrary = useMemo(() => {
    if (selectedItemType === 'library') {
      return uniqueLibraries.find(lib => lib.id === selectedItemId);
    }
    if (selectedItemType === 'cuelist') {
      const cuelist = cuelists.find(cl => cl.id === selectedItemId);
      return uniqueLibraries.find(lib => lib.id === cuelist?.parentId);
    }
    return undefined;
  }, [selectedItemId, selectedItemType, uniqueLibraries, cuelists]);

  const selectedCuelist = useMemo(() => {
    if (selectedItemType === 'cuelist') {
      return cuelists.find(cl => cl.id === selectedItemId);
    }
    return undefined;
  }, [selectedItemId, selectedItemType, cuelists]);

  const cuelistsForSelectedLibrary = useMemo(() => {
    if (selectedLibrary) {
      return cuelists.filter(cl => cl.parentId === selectedLibrary.id);
    }
    return [];
  }, [selectedLibrary, cuelists]);

  const cuesForSelectedCuelist = useMemo(() => {
    return selectedCuelist?.cues || [];
  }, [selectedCuelist]);

  const selectedLibraryName = selectedLibrary?.name;
  const selectedCuelistName = selectedCuelist?.name;

  const handleAddCueToCuelist = useCallback((cuelistId: string, newCueName: string) => {
    if (!newCueName || newCueName.trim() === '') {
      console.warn('[useCuelistManager] New cue name cannot be empty.');
      return;
    }

    setCuelists(prevCuelists => {
      const cuelistIndex = prevCuelists.findIndex(cl => cl.id === cuelistId);
      if (cuelistIndex === -1) {
        console.warn(`[useCuelistManager] Cuelist with ID ${cuelistId} not found for adding cue.`);
        return prevCuelists;
      }

      const newSlideId = nanoid();
      const newCue: Cue = {
        id: nanoid(),
        name: newCueName.trim(),
        slides: [
          {
            id: newSlideId,
            name: 'Slide 1',
            elements: [{
              id: nanoid(), 
              type: 'text', 
              content: 'New Slide',
              position: { x: 50, y: 50 },
              size: { width: 200, height: 50 },
              rotation: 0,
              opacity: 1,
              // props: {} // Removed as 'props' is not a property of TextSlideElement
              // order: 0, // Removed as 'order' is not a property here, use zIndex or array order
            } as TextSlideElement], // Added 'as TextSlideElement' for clarity
            backgroundColor: '#FFFFFF',
            // thumbPath: '', // Placeholder, not in Slide type by default
            // order: 0, // Removed, slide order is by array index in Cue.slides
            // cueId: '', // Removed, Slide type does not have cueId
            // transition: { type: 'cut', duration: 0 }, // Transition is not part of the Slide type directly
          }
        ],
        // order: (prevCuelists[cuelistIndex].cues || []).length, // Cue order is by array index in Cuelist.cues
      };

      const updatedCuelists = [...prevCuelists];
      const targetCuelist = updatedCuelists[cuelistIndex];
      // Ensure cues array exists before pushing
      if (!targetCuelist.cues) {
        targetCuelist.cues = [];
      }
      targetCuelist.cues.push(newCue);
      // Re-assign to trigger state update if prevCuelists was shallow copied
      updatedCuelists[cuelistIndex] = { ...targetCuelist };

      console.log(`[useCuelistManager] Cue '${newCue.name}' (ID: ${newCue.id}) added to cuelist '${targetCuelist.name}' (ID: ${cuelistId}).`);
      return updatedCuelists;
    });
  }, []);

  return {
    cuelists,
    selectedItemId,
    selectedItemType,
    handleSelectLibraryOrCuelist,
    submitNewCuelist,
    cuelistsForSelectedLibrary,
    cuesForSelectedCuelist,
    selectedLibraryName,
    selectedCuelistName,
    handleAddCueToCuelist,
  };
};
