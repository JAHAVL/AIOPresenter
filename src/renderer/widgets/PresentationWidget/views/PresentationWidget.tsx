import React, { useState, useRef, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { Rnd, Props as RndProps, DraggableData, ResizableDelta } from 'react-rnd';
import type { DraggableEvent } from 'react-draggable';
import type { ThemeColors } from '../theme/theme';
import type { Library, Cuelist, PresentationFile, Cue, Slide, SlideElement, CueGroup } from '@customTypes/presentationSharedTypes';
import { nanoid } from 'nanoid';
import { getStoragePaths, createUserLibrary, type StoragePaths } from '../services/storageClient';
import { requestUserInput } from '../services/inputClient';
import { StorageChannel } from '@shared/ipcChannels';
// Local ElectronWindow interface and declaration removed.
// Global type from preload.d.ts will be used for window.electronAPI.

// Import child components
import LibraryCueListCombinedView from '../components/ShowView/LibrariesCuelist/LibraryCueListCombinedView';
import OutputWindow, { type OutputItem } from '../components/ShowView/OutputWindow/OutputWindow';
import SlidesView from '../components/ShowView/SlidesView/SlidesView';
import PresentationControlsBar from '../components/PresentationControlsBar/PresentationControlsBar';
import SlideEditingView from './SlideEditingView'; // Import the new view
import InputModal from '../components/InputModal';
import { useLibraryManager } from '../hooks/useLibraryManager';
import { useCueSlideManager, type HandleEditingViewSlideSelectOptions } from '../hooks/useCueSlideManager';
import { useInputModal, type InputModalProps as HookInputModalProps } from '../hooks/useInputModal';
import { useDataSync } from '../hooks/useDataSync';
import { useCuelistManager } from '../hooks/useCuelistManager';
import { usePanelManager, type PanelConfig as HookPanelConfig, type PanelState as HookPanelState } from '../hooks/usePanelManager';
import { useAddItemModals } from '../hooks/useAddItemModals'; // Import the new hook
import DraggableResizablePanel from '../components/MainComponents/DraggableResizablePanel'; // Updated import path
// import { useTheme } from '../../../../contexts/ThemeContext';
// import { useModal } from '../hooks/useModal'; // This was incorrect, useInputModal is for generic modals
// import { usePanelDnD } from '../hooks/usePanelDnD';
// import { usePanelSnapLines } from '../hooks/usePanelSnapLines';
// import { usePanelResizeHandler } from '../hooks/usePanelResizeHandler';
import '../styles/fonts.css'; // Import widget-specific font styles
import {
  initialPanelsConfigForHook,
  useMockAvailableOutputs,
  initialPresentationFiles,
  initialSlideElements,
  initialSlidesData
} from '@PresentationWidgetMocks';

// PanelState interface is now removed as it's handled by the hook or HookPanelState can be used if needed externally.

interface PresentationWidgetProps {
  themeColors: ThemeColors;
}

const PresentationWidget: React.FC<PresentationWidgetProps> = ({ themeColors }) => {
  console.log('[PresentationWidget] Rendering...');
  // Modal State and Logic - managed by useInputModal hook for generic modals
  const { isModalOpen: isGenericModalOpen, modalProps: genericModalProps, openModal: openGenericModal, closeModal: closeGenericModal } = useInputModal();
  const [editingLibraryId, setEditingLibraryId] = useState<string | null>(null);
  const [currentEditName, setCurrentEditName] = useState<string>('');

  // Core Data States (excluding those dependent on seed data defined later)
  const { uniqueLibraries, isLoading: librariesLoading, error: librariesError, fetchUserLibraries } = useLibraryManager();
  // Data Sync (storagePaths and IPC listeners for data changes)
  const { storagePaths, lastRefreshTimestamp, refreshLibraries } = useDataSync({ fetchUserLibraries });
  
  const handleCreateNewLibrary = async () => {
    console.log('[PresentationWidget] Attempting to create new library...');
    if (window.electronAPI && window.electronAPI.createUserLibrary) {
      try {
        const result = await window.electronAPI.createUserLibrary(); // No name, backend defaults
        console.log('[PresentationWidget] createUserLibrary result:', result);
        if (result.success) {
          console.log(`[PresentationWidget] New library created at: ${result.path}`);
          refreshLibraries();
        } else {
          console.error('[PresentationWidget] Failed to create library:', result.error);
          openGenericModal({
            title: 'Error Creating Library',
            message: `Could not create new library: ${result.error || 'Unknown error'}.`,
            onSubmit: (_value: string) => {},
          });
        }
      } catch (error) {
        console.error('[PresentationWidget] Error calling createUserLibrary:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        openGenericModal({
          title: 'Error',
          message: `An unexpected error occurred: ${errorMessage}`,
          onSubmit: (_value: string) => {},
        });
      }
    } else {
      console.error('[PresentationWidget] electronAPI.createUserLibrary is not available.');
      openGenericModal({
        title: 'Error',
        message: 'Functionality to create library is not available.',
        onSubmit: (_value: string) => {},
      });
    }
  };

  const handleLibraryDoubleClick = (library: Library) => {
    if (library.name === 'Media Library' || library.name === 'Default User Library') {
      openGenericModal({
        title: 'Rename Not Allowed',
        message: `The library "${library.name}" is a system library and cannot be renamed.`,
        onSubmit: (_value: string) => {},
      });
      return;
    }
    setEditingLibraryId(library.id);
    setCurrentEditName(library.name);
  };

  const handleLibraryNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentEditName(event.target.value);
  };

  const handleRenameSubmit = async (originalLibrary: Library, newNameFromInput: string) => {
    if (!editingLibraryId || !originalLibrary) return;

    const newName = newNameFromInput.trim();
    setEditingLibraryId(null); // Exit editing mode immediately

    if (!newName || newName === originalLibrary.name) {
      console.log('[PresentationWidget] Rename cancelled or name unchanged.');
      return; // No change or empty name
    }

    console.log(`[PresentationWidget] Attempting to rename library '${originalLibrary.name}' to '${newName}'`);
    if (window.electronAPI && window.electronAPI.renameUserLibrary) {
      try {
        console.log(`[PresentationWidget] PRE-IPC CALL: originalLibrary.name = "${originalLibrary.name}" (type: ${typeof originalLibrary.name}), newName = "${newName}" (type: ${typeof newName})`);
      const result = await window.electronAPI.renameUserLibrary(originalLibrary.name, newName);
        console.log('[PresentationWidget] renameUserLibrary result:', result);
        if (result.success) {
          console.log(`[PresentationWidget] Library renamed from '${result.oldPath}' to '${result.newPath}'`);
          fetchUserLibraries();
        } else {
          console.error('[PresentationWidget] Failed to rename library:', result.error);
          // Revert optimistic UI update or inform user
          setCurrentEditName(originalLibrary.name); // Revert name in case of error
          openGenericModal({
            title: 'Error Renaming Library',
            message: `Could not rename library: ${result.error || 'Unknown error'}.`,
            onSubmit: (_value: string) => {},
          });
        }
      } catch (error) {
        console.error('[PresentationWidget] Error calling renameUserLibrary:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        setCurrentEditName(originalLibrary.name); // Revert name in case of error
        openGenericModal({
          title: 'Error',
          message: `An unexpected error occurred: ${errorMessage}`,
          onSubmit: (_value: string) => {},
        });
      }
    } else {
      console.error('[PresentationWidget] electronAPI.renameUserLibrary is not available.');
      setCurrentEditName(originalLibrary.name); // Revert name
      openGenericModal({
        title: 'Error',
        message: 'Functionality to rename library is not available.',
        onSubmit: (_value: string) => {},
      });
    }
  };



  const handleLibraryNameKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, originalLibrary: Library) => {
    if (event.key === 'Enter') {
      handleRenameSubmit(originalLibrary, currentEditName);
    } else if (event.key === 'Escape') {
      setEditingLibraryId(null);
      setCurrentEditName(''); // Or revert to originalLibrary.name if preferred
    }
  };

  // Effect to refresh libraries when lastRefreshTimestamp changes
  useEffect(() => {
    console.log(`[PresentationWidget] Detected refresh timestamp change: ${lastRefreshTimestamp}. Refreshing libraries...`);
    fetchUserLibraries();
  }, [lastRefreshTimestamp, fetchUserLibraries]);
  const {
    cuelists, 
    selectedItemId, 
    selectedItemType, 
    handleSelectLibraryOrCuelist,
    submitNewCuelist,
    handleAddCueToCuelist, // Added this
    cuelistsForSelectedLibrary,
    cuesForSelectedCuelist, // Direct from useCuelistManager
    selectedLibraryName,
    selectedCuelistName 
  } = useCuelistManager({ uniqueLibraries });

  // Derive all cues from libraries for the cue/slide manager
  const allCuesForHook = useMemo(() => {
    if (!uniqueLibraries || uniqueLibraries.length === 0) {
      console.log('[PW] useMemo allCuesForHook: uniqueLibraries is empty, returning empty array.');
      return []; // Return empty array instead of mock data
    }
    console.log('[PW] useMemo allCuesForHook: uniqueLibraries found, mapping to cues.');
    return uniqueLibraries.flatMap((lib: Library) => 
      (lib.cuelists || []).flatMap((cuelist: Cuelist) =>
        (cuelist.cues || []).map((cue: Cue) => ({
          ...cue,
          libraryId: lib.id,
          cuelistId: cuelist.id,
        }))
      )
    );
  }, [uniqueLibraries]);

  // Instantiate Cue and Slide Manager Hook
  const {
    selectedCueId,
    selectedSlideId,
    allCuesAsCueGroups, // Corrected name
    slidesForSelectedCue,
    slidesForEditingView,
    selectedSlideIdsForEditing,
    handleSelectCue,
    handleSelectSlide,
    handleClearSelection,
    handleGoToNextCue, // Corrected name
    handleGoToPreviousCue, // Corrected name
    handleGoToNextSlide, // Corrected name
    handleGoToPreviousSlide, // Corrected name
    handleUpdateCueSlides,
    handleEditingViewSlideSelect
  } = useCueSlideManager({ initialCues: allCuesForHook });
  const [currentViewMode, setCurrentViewMode] = useState<'panels' | 'slideEditor'>('panels');
  const [outputItems, setOutputItems] = useState<OutputItem[]>([]);
  // cuelists, selectedItemId, selectedItemType are now managed by useCuelistManager
  // storagePaths is now managed by useDataSync

  // Moved and corrected handleDeleteLibrary
  const handleDeleteLibrary = useCallback(async (libraryIdToDelete: string) => {
    const libraryToDelete = uniqueLibraries.find(lib => lib.id === libraryIdToDelete);
    if (!libraryToDelete) {
      console.error('[PresentationWidget] Library to delete not found:', libraryIdToDelete);
      openGenericModal({
        title: 'Error',
        message: 'Could not find the library to delete.',
        onSubmit: (_value?: string) => {}, // Can be a no-op for error modals
      });
      return;
    }

    // Directly proceed with deletion logic (confirmation modal removed)
    if (window.electronAPI && window.electronAPI.deleteUserLibrary) {
      try {
        console.log(`[PresentationWidget] Attempting to delete library '${libraryToDelete.name}' (ID: ${libraryToDelete.id})`);
        const result = await window.electronAPI.deleteUserLibrary(libraryToDelete.name);
        if (result.success) {
          console.log(`[PresentationWidget] Library '${libraryToDelete.name}' deleted successfully.`);
          fetchUserLibraries();
          // If the deleted library was the one selected, clear selections
          if (selectedItemId === libraryIdToDelete && selectedItemType === 'library') {
            handleSelectLibraryOrCuelist(null, null); // Clear library/cuelist selection
            handleSelectCue(null); // Clear cue selection
          }
        } else {
          console.error(`[PresentationWidget] Failed to delete library '${libraryToDelete.name}':`, result.error);
          openGenericModal({
            title: 'Error Deleting Library',
            message: `Could not delete library: ${result.error || 'Unknown error'}.`,
            onSubmit: (_v?: string) => {}, // No-op for error modal
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`[PresentationWidget] An unexpected error occurred during library deletion:`, errorMessage);
        openGenericModal({
          title: 'Error',
          message: `An unexpected error occurred: ${errorMessage}`,
          onSubmit: (_v?: string) => {}, // No-op for error modal
        });
      }
    } else {
      console.error('[PresentationWidget] electronAPI.deleteUserLibrary is not available.');
      openGenericModal({
        title: 'Error',
        message: 'Delete functionality is not available.',
        onSubmit: (_v?: string) => {}, // No-op for error modal
      });
    }
  }, [uniqueLibraries, fetchUserLibraries, openGenericModal, selectedItemId, selectedItemType, handleSelectLibraryOrCuelist, handleSelectCue]);

  // Handler for the 'Show' (eye) icon click
  const handleShowViewClick = useCallback(() => {
    console.log('Show view icon clicked - returning to main PresentationWidget view.');
    setCurrentViewMode('panels');
  }, []);

  // Handler for the 'Edit' (pencil) icon click
  const handleEditViewClick = useCallback(() => {
    if (!selectedCueId) {
      console.warn('Edit view clicked, but no cue is selected. Cannot open slide editor.');
      return;
    }
    console.log('Edit view icon clicked - switching to SlideEditingView.');
    setCurrentViewMode('slideEditor');
  }, [selectedCueId]);

  const {
    isModalOpen: isAddItemModalOpen,
    modalMode: addItemModalMode,
    modalTitle: addItemModalTitle,
    modalMessage: addItemModalMessage,
    modalPlaceholder: addItemModalPlaceholder,
    modalInputValue: addItemModalInputValue,
    openNewCuelistModal,
    openAddCueModal,
    closeModal: closeAddItemModal,
    handleModalInputChange: handleAddItemModalInputChange,
    parentLibraryId: addItemModalParentLibraryId, // This is the parentLibraryId from the modal hook
  } = useAddItemModals({ selectedItemTypeForCue: selectedItemType });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInputFocused = activeElement && 
                             (activeElement.tagName === 'INPUT' || 
                              activeElement.tagName === 'TEXTAREA' || 
                              activeElement.hasAttribute('contenteditable'));

      // If an input is focused, and it's the specific library name input being edited, allow default key behavior.
      if (isInputFocused && editingLibraryId && activeElement?.id === `library-name-input-${editingLibraryId}`) {
        return;
      }
      // If any other input/editable area is focused, don't trigger global library delete.
      if (isInputFocused) {
          return;
      }

      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedItemId && selectedItemType === 'library') {
        event.preventDefault(); // Prevent default browser action (e.g., back navigation on Backspace)
        console.log(`[PresentationWidget] Delete/Backspace key pressed for library ID: ${selectedItemId}`);
        handleDeleteLibrary(selectedItemId);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedItemId, selectedItemType, handleDeleteLibrary, editingLibraryId]); // handleDeleteLibrary is stable due to useCallback

  const handleModalSubmitNewLibrary = useCallback(async (newLibraryName: string) => {
    if (newLibraryName && newLibraryName.trim() !== '') {
      console.log(`[PW] Attempting to create library via modal: ${newLibraryName}`);
      const createResponse = await createUserLibrary(newLibraryName.trim());
      if (createResponse.success) {
        console.log(`[PW] Library '${newLibraryName}' created successfully at ${createResponse.data?.path}`);
        // After creating, refresh the libraries list
        await fetchUserLibraries(); // Use fetchUserLibraries from useLibraryManager
        // Optionally, select the new library
        // handleSelectLibraryOrCuelist(createResponse.data?.path, 'library');
        alert(`Error creating library: ${createResponse.error || 'Unknown error'}`);
      }
    } else {
      console.log('[PW] New library name from modal is empty, not creating.');
    }
  }, [fetchUserLibraries]);

  const handleModalSubmitNewCuelist = useCallback(async (newCuelistName: string, parentLibraryId: string) => {
    console.log(`[PW] Attempting to create cuelist: ${newCuelistName} in library ${parentLibraryId}`);
    if (!newCuelistName || newCuelistName.trim() === '') {
      console.warn('[PW] Cuelist name cannot be empty.');
      // Optionally, show a user notification
      return;
    }

    // TODO: Add logic to persist the new cuelist, similar to createUserLibrary.
    // This might involve updating the parent library file or a separate cuelist store.
    // For now, we'll just update the local state.

    // The newCuelist object creation is now handled within useCuelistManager's submitNewCuelist
    // We just need to call it with the name and parent ID.
    submitNewCuelist(newCuelistName.trim(), parentLibraryId);
    console.log(`[PW] Call to submitNewCuelist with name '${newCuelistName.trim()}' and parentId '${parentLibraryId}' initiated.`);

    // Optionally, select the new cuelist or its library after creation
    // handleSelectLibraryOrCuelist(newCuelist.id, 'cuelist');

    // After successful creation and state update, the modal will be closed by its own handlers.
  }, []);

  const handleAddNewUserLibrary = useCallback(() => {
    console.log('[PW] handleAddNewUserLibrary called, opening modal.');
    const defaultNamePrefix = 'New Library ';
    let newNameNumber = 1;
    while (uniqueLibraries.some(lib => lib.name === `${defaultNamePrefix}${newNameNumber}`)) {
      newNameNumber++;
    }
    const defaultName = `${defaultNamePrefix}${newNameNumber}`;

    openGenericModal({
      title: 'Add New Library',
      message: 'Enter the name for the new library:',
      defaultValue: defaultName,
      placeholder: 'Library Name',
      onSubmit: handleModalSubmitNewLibrary,
      onCancel: closeGenericModal
    });
  }, [uniqueLibraries, handleModalSubmitNewLibrary, openGenericModal, closeGenericModal]);

  // --- End Library Management Functions ---

  // Effect to handle side-effects when library/cuelist selection changes
  useEffect(() => {
    if (selectedItemType === 'cuelist' && selectedItemId) {
      const foundCuelist = cuelists.find(cl => cl.id === selectedItemId);
      console.log(`[PW useEffect] Cuelist item '${selectedItemId}' selected. Found cuelist:`, foundCuelist);
      if (foundCuelist && foundCuelist.cues && foundCuelist.cues.length > 0) {
        const firstCueId = foundCuelist.cues[0].id;
        console.log(`[PW useEffect] Cuelist selected. Selecting first cue: ${firstCueId}`);
        handleSelectCue(firstCueId); // from useCueSlideManager
      } else {
        console.log(`[PW useEffect] Cuelist '${selectedItemId}' has no cues or not found. Clearing slide/cue selection.`);
        handleClearSelection(); // from useCueSlideManager
      }
    } else if (selectedItemType === 'library' || selectedItemType === 'folder' || !selectedItemId) {
      console.log(`[PW useEffect] Library, folder, or no item selected. Clearing slide/cue selection.`);
      handleClearSelection(); // from useCueSlideManager
    }
  }, [selectedItemId, selectedItemType, cuelists, handleSelectCue, handleClearSelection]);

  // Effect to scroll to the selected cue in the list
  useEffect(() => {
    if (selectedCueId) {
      console.log(`[PW] useEffect: selectedCueId changed to ${selectedCueId}, dispatching scrollToCue event.`);
      window.dispatchEvent(new CustomEvent('scrollToCue', { detail: { cueId: selectedCueId } }));
    }
  }, [selectedCueId]);

  const handleAddLibrary = useCallback(() => {
    const defaultNamePrefix = 'New Library ';
    let newNameNumber = 1;
    const existingNames = uniqueLibraries.map(lib => lib.name);
    while (existingNames.includes(`${defaultNamePrefix}${newNameNumber}`)) {
      newNameNumber++;
    }
    const newLibrary: Library = {
      id: nanoid(),
      name: `${defaultNamePrefix}${newNameNumber}`,
      path: '', // Placeholder for a new library's path
      cuelists: [],
    };
    // Removed setLibraries as it's handled by the useLibraryManager hook
  }, [uniqueLibraries]);

  const handleAddCuelist = useCallback(() => {
    const selectedLibraryForNewCuelist = uniqueLibraries.find(lib => lib.id === selectedItemId && selectedItemType === 'library');
    if (!selectedLibraryForNewCuelist) {
      console.warn('[PW] Add Cuelist: No library selected or selection mismatch. Cannot determine parent library.');
      // Optionally, show a user notification here
      return;
    }

    const defaultNamePrefix = 'New Cuelist ';
    let newNameNumber = 1;
    // This default name generation logic might need to be more robust depending on how cuelists are stored/associated with libraries.
    // Assuming `cuelists` state contains all cuelists and they have a `parentId` or similar.
    // Or, if cuelists are part of the library object, check within selectedLibraryForNewCuelist.cuelists (if such a property exists)
    const existingCuelistsInLibrary = cuelists.filter(cl => cl.parentId === selectedLibraryForNewCuelist.id); // Placeholder for actual check
    while (existingCuelistsInLibrary.some(cl => cl.name === `${defaultNamePrefix}${newNameNumber}`)) {
      newNameNumber++;
    }
    const defaultName = `${defaultNamePrefix}${newNameNumber}`;

    console.log(`[PW] handleAddCuelist: Opening modal for library ID: ${selectedLibraryForNewCuelist.id}`);
    openNewCuelistModal(selectedLibraryForNewCuelist.id);
  }, [uniqueLibraries, cuelists, selectedItemId, selectedItemType, openNewCuelistModal]);

  // The handleSelectLibraryOrCuelist from useCuelistManager can be used directly by child components
  // No specific wrapper like handleSelectLibraryOrCuelistFromCombinedView is needed if it only calls the hook's version.



  const { itemsForCueList, cueListItemType } = useMemo(() => {
    let items: PresentationFile[] | Cue[] = [];
    let type: 'presentation' | 'cue' | null = null;

    if (selectedItemType === 'library' && selectedItemId) {
      const selectedLib = uniqueLibraries.find(lib => lib.id === selectedItemId);
      // Assuming Library type has a 'cues' property which is an array of Cue objects
      // This might need adjustment if Library stores cuelist IDs and cuelists are fetched separately
      if (selectedLib) {
        // If a library is selected, we might want to show its cuelists, not cues directly.
        // However, the 'itemsForCueList' prop of LibraryCueListCombinedView expects Cue[] or PresentationFile[]
        // For now, let's assume if a library is selected, the right panel (SelectedItemContentView) shows nothing or library details (not cues).
        // The CuelistsSection within LibraryCueListCombinedView already handles displaying cuelists for the selected library.
        // This logic was previously adjusted to pass cuesForSelectedCuelist when a cuelist is selected.
        // Let's ensure this useMemo aligns with what LibraryCueListCombinedView expects for its itemsForCueList prop.
        // The itemsForCueListDisplay and cueListItemTypeDisplay logic near the LibraryCueListCombinedView render seems more accurate.
        // This useMemo might be redundant or conflicting.
        // For now, I will replicate the logic used for itemsForCueListDisplay to ensure consistency.
        items = []; // Placeholder, as LibraryCueListCombinedView's SelectedItemContentView expects Cues or PresentationFiles
        type = null;  // Not 'cue' directly from library, but from a selected cuelist
      }
    } else if (selectedItemType === 'cuelist' && selectedItemId) {
      // This is correct: cuesForSelectedCuelist is already derived by useCuelistManager
      items = cuesForSelectedCuelist;
      type = 'cue';
    } else {
      items = [];
      type = null;
    }
    return { itemsForCueList: items, cueListItemType: type };
  }, [selectedItemType, selectedItemId, uniqueLibraries, cuesForSelectedCuelist]);

  const handleSelectSlideInEditorWrapper = useCallback((slideId: string, event?: React.MouseEvent) => {
    const options: HandleEditingViewSlideSelectOptions = {
      isCtrlCmdKey: event?.ctrlKey || event?.metaKey,
      isShiftKey: event?.shiftKey,
    };
    // slidesForEditingView is from the useCueSlideManager hook
    handleEditingViewSlideSelect(slideId, slidesForEditingView, options);
  }, [handleEditingViewSlideSelect, slidesForEditingView]);

  const handleUpdateSlidesForCurrentCue = useCallback((updatedSlides: Slide[]) => {
    if (selectedCueId) { // selectedCueId from useCueSlideManager
      handleUpdateCueSlides(selectedCueId, updatedSlides); // handleUpdateCueSlides from useCueSlideManager
    } else {
      console.warn('[PresentationWidget] handleUpdateSlidesForCurrentCue called without a selected cue.');
    }
  }, [selectedCueId, handleUpdateCueSlides]);

  const gridContainerRef = useRef<HTMLDivElement>(null); // Keep this ref here, pass to hook

  const {
    panels: managedPanels,
    visualSnapLines: managedVisualSnapLines,
    draggingId: managedDraggingId, // Use this if needed for UI elements outside Rnd
    handleDragStart: panelDragStart,
    handleDrag: panelDrag,
    handleDragStop: panelDragStop,
    handleResizeStart: panelResizeStart,
    handleResize: panelResize, // Rnd's internal resize handler, hook's is for state update on stop
    handleResizeStop: panelResizeStop,
    bringToFront: panelBringToFront, // Hook's bringToFront
    togglePanelVisibility: panelToggleVisibility, // Hook's togglePanelVisibility
    updatePanelState,
    getPanelState
  } = usePanelManager({
    initialPanelsConfig: initialPanelsConfigForHook,
    panelContainerRef: gridContainerRef, // Pass our ref to the hook
  });

  const mockAvailableOutputs = useMockAvailableOutputs();

  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });

  const renderPanelComponent = (panel: HookPanelState) => { // Updated to use HookPanelState
    switch (panel.componentKey) {
      case 'output':
        return <OutputWindow themeColors={themeColors} availableOutputs={mockAvailableOutputs} />;
      case 'slides': {
        let cueNameForSlidesViewHeader = 'Slides'; 
        if (selectedCueId) {
          const currentCue = allCuesAsCueGroups.find((cg: CueGroup) => cg.cue.id === selectedCueId)?.cue;
          if (currentCue) {
            cueNameForSlidesViewHeader = currentCue.name;
          } else {
            cueNameForSlidesViewHeader = allCuesAsCueGroups.length > 0 ? allCuesAsCueGroups[0].cue.name : 'Slides';
          }
        } else if (allCuesAsCueGroups.length > 0) {
          cueNameForSlidesViewHeader = allCuesAsCueGroups[0].cue.name;
        }

        return (
          <SlidesView
            themeColors={themeColors}
            slides={slidesForSelectedCue} // from useCueSlideManager
            selectedSlideIds={selectedSlideId ? [selectedSlideId] : []} // SlidesView expects an array
            onSelectSlide={handleSelectSlide} // from useCueSlideManager
            onUpdateSlides={(updatedSlides: Slide[]) => {
              if (selectedCueId) {
                handleUpdateCueSlides(selectedCueId, updatedSlides); // from useCueSlideManager
              }
            }}
            // presentationTitle and cueName are not props of SlidesView
            // onGoToNextSlide and onGoToPreviousSlide are not props of SlidesView directly, handled by main controls
          />
        );
      }
      case 'libraryCueList':
        // Determine itemsForCueList and cueListItemType based on selection
        let itemsForCueListDisplay: PresentationFile[] | Cue[] = [];
        let cueListItemTypeDisplay: 'presentation' | 'cue' | null = null;

        if (selectedItemType === 'cuelist') { // Only populate for SelectedItemContentView if a cuelist is selected
          itemsForCueListDisplay = cuesForSelectedCuelist;
          cueListItemTypeDisplay = 'cue';
        } else if (selectedItemType === 'library') {
          // When a library is selected, SelectedItemContentView might not display anything directly,
          // as cuelists are handled by CuelistsSection. Or it could show library details if designed so.
          // For now, pass empty and null to satisfy types if SelectedItemContentView only handles Cues/Presentations.
          itemsForCueListDisplay = [];
          cueListItemTypeDisplay = null; 
        }

        return (
          <LibraryCueListCombinedView
            themeColors={themeColors}
            libraries={uniqueLibraries}
            cuelists={cuelistsForSelectedLibrary} // Cuelists for the CuelistsSection within CombinedView
            allCues={allCuesForHook} // All cues for potential display or operations
            selectedItemId={selectedItemId}
            selectedItemType={selectedItemType}
            onSelectItem={handleSelectLibraryOrCuelist} // Use the hook's version directly
            itemsForCueList={itemsForCueListDisplay} // Content for the right panel (SelectedItemContentView)
            cueListItemType={cueListItemTypeDisplay} // Type of items in the right panel
            onCreateNewLibrary={handleCreateNewLibrary} // This is handleAddNewUserLibrary from useLibraryManager
            onRenameLibrarySubmit={(libraryId: string, newName: string) => {
            console.log(`[PresentationWidget] onRenameLibrarySubmit adapter called. Library ID: ${libraryId}, New Name: '${newName}'`);
              const libraryToRename = uniqueLibraries.find(lib => lib.id === libraryId);
              if (libraryToRename) {
                // handleRenameSubmit from useLibraryManager is assumed to use its internal
                // currentEditName state, which should have been updated by onLibraryNameChange.
                // The newName param here is part of the prop signature but not directly passed to this specific hook handler.
                handleRenameSubmit(libraryToRename, newName);
              }
            }}
            editingLibraryId={editingLibraryId} // from useLibraryManager
            currentEditName={currentEditName} // from useLibraryManager
            onLibraryDoubleClick={(libraryId: string, currentName: string) => {
              const libraryToEdit = uniqueLibraries.find(lib => lib.id === libraryId);
              if (libraryToEdit) {
                // handleLibraryDoubleClick from useLibraryManager expects a Library object
                // It will set editingLibraryId and currentEditName internally
                handleLibraryDoubleClick(libraryToEdit);
              }
            }}
            onLibraryNameChange={(newName: string) => {
              // handleLibraryNameChange from useLibraryManager expects a ChangeEvent
              handleLibraryNameChange({ target: { value: newName } } as React.ChangeEvent<HTMLInputElement>);
            }}
            onLibraryNameKeyDown={(event: React.KeyboardEvent<HTMLInputElement>, libraryId: string) => {
              const libraryToEdit = uniqueLibraries.find(lib => lib.id === libraryId);
              if (libraryToEdit) {
                // handleLibraryNameKeyDown from useLibraryManager expects a Library object
                handleLibraryNameKeyDown(event, libraryToEdit);
              }
            }}
            onAddCuelist={() => { // For CuelistsSection
              if (selectedItemType === 'library' && selectedItemId) {
                openNewCuelistModal(selectedItemId);
              } else {
                console.warn('[PW] Cannot add cuelist: No library selected or invalid selection.');
              }
            }}
            onAddItemToSelectedList={selectedItemType === 'cuelist' ? openAddCueModal : undefined} // For SelectedItemContentView when a cuelist is active
            onSelectCue={handleSelectCue} // from useCueSlideManager, for SelectedItemContentView
            selectedCueId={selectedCueId} // from useCueSlideManager
          />
        );
      case 'automation':
        return <div style={{ backgroundColor: themeColors.panelBackground, color: themeColors.textColor, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', padding: '10px' }}>Automation Controls</div>;
      default:
        console.warn(`Unknown panel componentKey: ${panel.componentKey}`);
        return null; 
    }
  };

  // Calculate initial positions and sizes based on container size
  useEffect(() => {
    // Check if containerDimensions has been initialized (width and height are not 0)
    if (containerDimensions.width > 0 && containerDimensions.height > 0) {
      const { width: offsetWidth, height: offsetHeight } = containerDimensions;
      const GAP = 10; // Gap acts as padding around and between panels
      const totalPanelWidth = offsetWidth - (3 * GAP);
      const totalPanelHeight = offsetHeight - (3 * GAP);
      const panelWidth = totalPanelWidth / 2;
      const panelHeight = totalPanelHeight / 2;

      // Update panel states using the hook's updater
      initialPanelsConfigForHook.forEach((panelConfig: HookPanelConfig) => {
        let newX = 0;
        let newY = 0;

        if (panelConfig.id === 'output') { newX = GAP; newY = GAP; }
        else if (panelConfig.id === 'slides') { newX = GAP + panelWidth + GAP; newY = GAP; }
        else if (panelConfig.id === 'libraryCueList') { newX = GAP; newY = GAP + panelHeight + GAP; }
        else if (panelConfig.id === 'automation') { newX = GAP + panelWidth + GAP; newY = GAP + panelHeight + GAP; }
        
        const finalWidth = Math.max(0, panelWidth);
        const finalHeight = Math.max(0, panelHeight);

        updatePanelState(panelConfig.id, { x: newX, y: newY, width: finalWidth, height: finalHeight });
      });
    }
  }, [containerDimensions, updatePanelState]); // Added updatePanelState to dependencies

  // Effect to observe container size changes
  useEffect(() => {
    const currentGridContainer = gridContainerRef.current;
    if (!currentGridContainer) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        if (entry.contentBoxSize) {
          const contentBoxSize = Array.isArray(entry.contentBoxSize) ? entry.contentBoxSize[0] : entry.contentBoxSize;
          setContainerDimensions({ width: contentBoxSize.inlineSize, height: contentBoxSize.blockSize });
        } else {
          // Fallback for older browsers
          setContainerDimensions({ width: entry.contentRect.width, height: entry.contentRect.height });
        }
      }
    });

    resizeObserver.observe(currentGridContainer);
    // Set initial dimensions
    setContainerDimensions({ width: currentGridContainer.offsetWidth, height: currentGridContainer.offsetHeight });

    return () => {
      if (currentGridContainer) {
        resizeObserver.unobserve(currentGridContainer);
      }
    };
  }, []); // Runs once on mount and cleans up on unmount

  // bringToFront, handleDragStart, handleDrag, handleResizeStart, handleDragStopInternal, handleResizeStop
  // are now replaced by handlers from usePanelManager hook (e.g., panelDragStart, panelDrag, etc.)

  // The old handleResizeStop logic is now encapsulated within the hook.
  // The hook's handleResizeStop will be called by Rnd.

  // const handleResizeStop = (...) => { ... } has been removed as its logic is in the hook.

  const handleNavigateToCue = (cueId: string) => {
    const targetCueGroup = allCuesAsCueGroups.find(cg => cg.cue.id === cueId);
    if (targetCueGroup) {
      console.log('Navigating to cue:', targetCueGroup.cue);
      // Attempt to find a way to navigate to the starting point
      // This might require accessing a different part of the application state or sending a message to the player
      window.dispatchEvent(new CustomEvent('navigateToCue', { detail: { cueId } }));
    }
  };

  const widgetWrapperStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: themeColors.widgetBackground,
    overflow: 'hidden',
  };



  const gridContainerStyle: React.CSSProperties = {
    flexGrow: 1,
    position: 'relative',
    backgroundColor: themeColors.gapColor,
    overflow: 'hidden', // Ensures RND components are contained
  };

    // Removed toggleTheme function and buttonStyle as they are lifted up
  // rndItemStyleDefault and gridItemContentStyle have been moved to DraggableResizablePanel.tsx

  return (
    <div style={widgetWrapperStyle}> {/* This div assumes widgetWrapperStyle is defined before the return statement */}
      {isAddItemModalOpen && (
        <InputModal
          isOpen={isAddItemModalOpen}
          title={addItemModalTitle}
          message={addItemModalMessage}
          placeholder={addItemModalPlaceholder}
          defaultValue={addItemModalInputValue}
          onSubmit={(value: string) => {
            if (addItemModalMode === 'cuelist' && addItemModalParentLibraryId) {
              if (value.trim() !== '') {
                submitNewCuelist(value.trim(), addItemModalParentLibraryId);
              }
            } else if (addItemModalMode === 'cue' && selectedItemId) {
              if (value.trim() !== '') {
                handleAddCueToCuelist(selectedItemId, value.trim());
              }
            }
            closeAddItemModal();
          }}
          onClose={closeAddItemModal}
        />
      )}
      {isGenericModalOpen && genericModalProps && (
        <InputModal
          isOpen={isGenericModalOpen}
          title={genericModalProps.title}
          message={genericModalProps.message}
          defaultValue={genericModalProps.defaultValue}
          placeholder={genericModalProps.placeholder}
          onSubmit={(value) => {
            if (genericModalProps && genericModalProps.onSubmit) {
              genericModalProps.onSubmit(value);
            }
            closeGenericModal();
          }}
          onClose={() => {
            if (genericModalProps && genericModalProps.onCancel) {
              genericModalProps.onCancel();
            }
            closeGenericModal();
          }}
        />
      )}
      <PresentationControlsBar 
        themeColors={themeColors} 
        onShowClick={handleShowViewClick} 
        onEditClick={handleEditViewClick} 
      />

      {currentViewMode === 'slideEditor' ? (
        <SlideEditingView
          themeColors={themeColors}
          slides={slidesForEditingView}
          selectedSlideIds={selectedSlideIdsForEditing} // From useCueSlideManager
          onSelectSlide={handleSelectSlideInEditorWrapper} // Wrapper for hook's handler
          onUpdateSlides={handleUpdateSlidesForCurrentCue}
        />
      ) : (
        // This div assumes gridContainerStyle is defined before the return statement
        <div ref={gridContainerRef} style={gridContainerStyle}>
          {managedPanels.map(panel => (
            <DraggableResizablePanel
              key={panel.id}
              panel={panel} // panel object from usePanelManager, should be PanelState type
              themeColors={themeColors}
              onDragStart={(e, data, id) => panelDragStart(id)} 
              onDrag={(e, data, id) => panelDrag(id, data)} 
              onDragStop={(e, data, id) => panelDragStop(id, data)}
              onResizeStart={(e, dir, ref, id) => panelResizeStart(id)}
              onResize={(e, dir, ref, delta, position, id) => panelResize(id, dir, ref, delta, position)}
              onResizeStop={(e, dir, ref, delta, position, id) => panelResizeStop(id, e, dir, ref, delta, position)}
            >
              {renderPanelComponent(panel as HookPanelState)} {/* Ensure HookPanelState is compatible with PanelState or update renderPanelComponent */}
            </DraggableResizablePanel>
          ))}
          {/* Visual Snap Lines */}
          {managedVisualSnapLines.v.map((lineX, index) => (
            <div key={`v-line-${index}`} style={{ position: 'absolute', left: lineX, top: 0, bottom: 0, width: '1px', backgroundColor: 'rgba(0, 255, 255, 0.7)', zIndex: 9998, pointerEvents: 'none' }} />
          ))}
          {managedVisualSnapLines.h.map((lineY, index) => (
            <div key={`h-line-${index}`} style={{ position: 'absolute', top: lineY, left: 0, right: 0, height: '1px', backgroundColor: 'rgba(0, 255, 255, 0.7)', zIndex: 9998, pointerEvents: 'none' }} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PresentationWidget;
