import React, { useState, useRef, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { Rnd, Props as RndProps, DraggableData, ResizableDelta } from 'react-rnd';
import type { DraggableEvent } from 'react-draggable';
import type { ThemeColors } from '../theme';
import type { Library, Cuelist, PresentationFile, Cue, Slide, SlideElement, CueGroup } from '../types/presentationSharedTypes';
import { nanoid } from 'nanoid';
import { getStoragePaths, listUserLibraries, createUserLibrary, type StoragePaths, type UserLibrary as ClientUserLibrary } from '../services/storageClient';
import { requestUserInput } from '../services/inputClient';
import { StorageChannel } from '@shared/ipcChannels';
// Declare window.electron for TypeScript
interface ElectronWindow extends Window {
  electronAPI: {
    invoke: (channel: string, ...args: any[]) => Promise<any>;
    sendPing: () => void;
    onPong: (callback: (event: any, data: any) => void) => void;
    openImageDialog: () => Promise<any>;
    loadImageAsDataURL: (filePath: string) => Promise<any>;
    on: (channel: string, listener: (event: any, ...args: any[]) => void) => (() => void) | void; // Can return a cleanup function
    // off: (channel: string, listener: (event: any, ...args: any[]) => void) => void; // Removed as it's not directly exposed, cleanup is returned by 'on'
    send?: (channel: string, ...args: any[]) => void; // Exposed in preload
    removeListener?: (channel: string, listener: (...args: any[]) => void) => void; // Exposed in preload
    removeAllListeners?: (channel: string) => void; // Exposed in preload
    getAIOPaths?: () => Promise<any>; // Exposed in preload
  };
}
declare const window: ElectronWindow;
// LibraryCueListCombinedView is defined in this file

// Import child components
import OutputWindow, { type OutputItem } from '../components/OutputWindow/OutputWindow';
import SlidesView from '../components/SlidesView/SlidesView';
import LibraryView from '../components/LibraryView/LibraryView';
import CueListView from '../components/CueListView/CueListView';
import PresentationControlsBar from '../components/PresentationControlsBar/PresentationControlsBar';
import SlideEditingView from './SlideEditingView'; // Import the new view
import InputModal from '../components/InputModal';
import '../styles/fonts.css'; // Import widget-specific font styles

// --- Embedded LibraryCueListCombinedView Component ---
interface LibraryCueListCombinedViewProps {
  themeColors: ThemeColors;
  libraries: Library[];
  cuelists: Cuelist[]; // Renamed from playlists
  selectedItemId: string | null;
  selectedItemType: 'library' | 'cuelist' | 'folder' | null; // Renamed from 'playlist'
  onSelectItem: (id: string | null, type: 'library' | 'cuelist' | 'folder' | null) => void; // Renamed from 'playlist'
  itemsForCueList: PresentationFile[] | Cue[];
  cueListItemType: 'presentation' | 'cue' | null;
  onAddLibrary: () => void; 
  onAddCuelist: () => void; // Renamed from onAddPlaylist
  onSelectCue: (cueId: string) => void; 
  selectedCueId: string | null; 
}
const LibraryCueListCombinedView: React.FC<LibraryCueListCombinedViewProps> = ({
  themeColors,
  libraries,
  cuelists, // Renamed from playlists
  selectedItemId,
  selectedItemType,
  onSelectItem,
  itemsForCueList,
  cueListItemType,
  onAddLibrary,
  onAddCuelist, // Renamed from onAddPlaylist
  onSelectCue, 
  selectedCueId, 
}) => {
  console.log('[LibraryCueListCombinedView] Received libraries prop:', JSON.stringify(libraries, null, 2));
  console.log('[LibraryCueListCombinedView] Number of libraries to display:', libraries.length);
  console.log('[LibraryCueListCombinedView] Rendering combined view...');
  
  const wrapperStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column', // Changed to column to stack vertically for clarity
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    backgroundColor: themeColors.panelBackground, // Apply panel background to the wrapper
  };

  const sectionStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: '10px',
  };

  console.log('[LibraryCueListCombinedView] Directly rendering libraries to ensure display');
  return (
    <div style={wrapperStyle}>
      <div style={sectionStyle}>
        <h2 style={{ margin: 0, paddingBottom: '10px', fontSize: '16px', color: themeColors.textColor }}>Libraries</h2>
        {libraries.length === 0 ? (
          <p style={{ color: themeColors.textColor }}>No Libraries Yet</p>
        ) : (
          libraries.map(library => (
            <div 
              key={library.id} 
              onClick={() => onSelectItem(library.id, 'library')} 
              style={{ 
                padding: '8px', 
                margin: '4px 0', 
                backgroundColor: selectedItemId === library.id && selectedItemType === 'library' 
                  ? themeColors.buttonBackground 
                  : themeColors.panelBackground, 
                borderRadius: '4px', 
                cursor: 'pointer',
              }}
            >
              {library.name}
            </div>
          ))
        )}
        <button 
          onClick={onAddLibrary} 
          style={{ 
            margin: '10px 0', 
            padding: '8px 16px', 
            backgroundColor: themeColors.buttonBackground, 
            color: themeColors.buttonText, 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Add Library
        </button>
      </div>
      <div style={sectionStyle}>
        <h2 style={{ margin: 0, paddingBottom: '10px', fontSize: '16px', color: themeColors.textColor }}>Cuelists</h2>
        {cuelists.length === 0 ? (
          <p style={{ color: themeColors.textColor }}>No Cuelists Yet</p>
        ) : (
          cuelists.map(cuelist => (
            <div 
              key={cuelist.id} 
              onClick={() => onSelectItem(cuelist.id, 'cuelist')} 
              style={{ 
                padding: '8px', 
                margin: '4px 0', 
                backgroundColor: selectedItemId === cuelist.id && selectedItemType === 'cuelist' 
                  ? themeColors.buttonBackground 
                  : themeColors.panelBackground, 
                borderRadius: '4px', 
                cursor: 'pointer',
              }}
            >
              {cuelist.name}
            </div>
          ))
        )}
        <button 
          onClick={onAddCuelist} 
          style={{ 
            margin: '10px 0', 
            padding: '8px 16px', 
            backgroundColor: themeColors.buttonBackground, 
            color: themeColors.buttonText, 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Add Cuelist
        </button>
      </div>
    </div>
  );
};
// --- End of Embedded LibraryCueListCombinedView Component ---

interface PanelState {
  id: string;
  x: number;
  y: number;
  width: string | number; 
  height: string | number; 
  zIndex: number;
  componentKey: string;
  minWidth?: number;
  minHeight?: number;
}

interface PresentationWidgetProps {
  themeColors: ThemeColors;
}

const PresentationWidget: React.FC<PresentationWidgetProps> = ({ themeColors }) => {
  console.log('[PresentationWidget] Rendering...');
  // Modal State
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [inputModalProps, setInputModalProps] = useState({
    title: '',
    message: '',
    defaultValue: '',
    onSubmit: (value: string) => {},
    placeholder: '',
  });

  // Core Data States (excluding those dependent on seed data defined later)
  const [userLibraries, setUserLibraries] = useState<ClientUserLibrary[]>([]);
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [cuelists, setCuelists] = useState<Cuelist[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<'library' | 'cuelist' | 'folder' | null>(null);
  const [selectedCueId, setSelectedCueId] = useState<string | null>(null);
  const [currentViewMode, setCurrentViewMode] = useState<'panels' | 'slideEditor'>('panels');
  const [outputItems, setOutputItems] = useState<OutputItem[]>([]);
  const [storagePaths, setStoragePaths] = useState<StoragePaths | null>(null);
  const [panels, setPanels] = useState<PanelState[]>([]); // Initialize empty, to be set by initialPanels

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

  // Library Management Functions
  const fetchUserLibraries = useCallback(async () => {
    console.log('[PW] Fetching user libraries...');
    const librariesResponse = await listUserLibraries();
    console.log('[PW] Raw response from listUserLibraries:', JSON.stringify(librariesResponse, null, 2));
    if (librariesResponse.success && librariesResponse.data) {
      setUserLibraries(librariesResponse.data);
      console.log('[PW] User libraries fetched:', JSON.stringify(librariesResponse.data, null, 2));
      // Transform the raw library data into the Library type expected by LibraryView
      const transformedLibraries = librariesResponse.data.map(lib => ({
        id: lib.path, // Use path as unique ID
        name: lib.name,
        cues: [] // Initialize with empty cues array
      }));
      setLibraries(transformedLibraries);
      console.log('[PW] Transformed libraries for UI:', JSON.stringify(transformedLibraries, null, 2));
      console.log('[PW] State updated with new libraries, should trigger UI render');
    } else {
      console.error('[PW] Failed to fetch user libraries:', librariesResponse.error);
      setUserLibraries([]);
      setLibraries([]);
      console.log('[PW] State cleared due to failed library fetch');
    }
  }, []);

  // Listen for library changes from the main process
  useEffect(() => {
    const handleLibrariesChanged = () => {
      console.log('[PresentationWidget.tsx] Received LIBRARIES_DID_CHANGE, refetching libraries...');
      fetchUserLibraries();
    };

    let cleanupFunction: (() => void) | void | undefined;

    // Ensure electronAPI and its 'on' method are available
    if (window.electronAPI && typeof window.electronAPI.on === 'function') {
      console.log(`[PresentationWidget.tsx] Subscribing to ${StorageChannel.LIBRARIES_DID_CHANGE}`);
      // window.electronAPI.on returns the cleanup function
      cleanupFunction = window.electronAPI.on(StorageChannel.LIBRARIES_DID_CHANGE, handleLibrariesChanged);
    } else {
      console.warn('[PresentationWidget.tsx] window.electronAPI.on is not available. Cannot subscribe to library changes.');
    }

    return () => {
      if (typeof cleanupFunction === 'function') {
        console.log(`[PresentationWidget.tsx] Unsubscribing from ${StorageChannel.LIBRARIES_DID_CHANGE}`);
        cleanupFunction();
      }
    };
  }, [fetchUserLibraries]); // fetchUserLibraries is a dependency to ensure the latest version is used

  // Fetch initial data or load from storage
  useEffect(() => {
    console.log('[PW useEffect] Component did mount. Fetching initial data...');
    const fetchInitialData = async () => {
      console.log('[PW] Fetching initial data...');
      const pathsResponse = await getStoragePaths(); // Corrected: was getStoragePaths() before, ensure this function exists and is imported
      if (pathsResponse.success && pathsResponse.paths) {
        setStoragePaths(pathsResponse.paths);
        console.log('[PW] Storage paths fetched:', pathsResponse.paths);
      } else {
        console.error('[PW] Failed to fetch storage paths:', pathsResponse.error);
      }
      await fetchUserLibraries();
      // TODO: Fetch initial cuelists and populate cuelists state
      // setCuelists(initialCuelists); // If initialCuelists is defined

      // Initialize panels state - assuming initialPanels is defined elsewhere or use a default
      setPanels(initialPanels);
      console.log('[PW] initialPanels set:', initialPanels);
    };
    fetchInitialData();
    console.log('[PW] useEffect - Initial data fetch triggered.');
  }, []); // Empty dependency array means this runs once on mount

  const handleModalSubmitNewLibrary = useCallback(async (newLibraryName: string) => {
    if (newLibraryName && newLibraryName.trim() !== '') {
      console.log(`[PW] Attempting to create library via modal: ${newLibraryName}`);
      const createResponse = await createUserLibrary(newLibraryName.trim());
      if (createResponse.success) {
        console.log('[PW] Successfully created library:', createResponse.data?.name);
        await fetchUserLibraries(); // Refresh the libraries list
      } else {
        console.error('[PW] Failed to create library:', createResponse.error);
        alert(`Error creating library: ${createResponse.error || 'Unknown error'}`);
      }
    } else {
      console.log('[PW] New library name from modal is empty, not creating.');
    }
  }, [fetchUserLibraries]);

  const handleAddNewUserLibrary = useCallback(() => {
    console.log('[PW] handleAddNewUserLibrary called, opening modal.');
    setInputModalProps({
      title: 'Create New Library',
      message: 'Enter the name for the new library:',
      defaultValue: '',
      placeholder: 'Library Name',
      onSubmit: handleModalSubmitNewLibrary,
    });
    setIsInputModalOpen(true);
  }, [handleModalSubmitNewLibrary, setInputModalProps, setIsInputModalOpen]);
  // --- End Library Management Functions ---

  // Seed Data and State Management for Libraries and Cuelists
  const initialPresentationFiles: PresentationFile[] = [
    { id: nanoid(), name: 'Welcome Video.mp4', path: '/path/to/welcome.mp4', type: 'video' },
    { id: nanoid(), name: 'Sermon Outline.txt', path: '/path/to/sermon.txt', type: 'custom' }, 
    { id: nanoid(), name: 'Worship Background 1.jpg', path: '/path/to/bg1.jpg', type: 'image' },
  ];

  // Sample Slide Elements
  const initialSlideElements: SlideElement[] = [
    { id: nanoid(), type: 'text', content: 'Welcome to Our Service!', position: { x: 10, y: 10 }, size: { width: 300, height: 50 }, rotation: 0, opacity: 1, zIndex: 1 },
    { id: nanoid(), type: 'text', content: 'Amazing Grace, how sweet the sound...', position: { x: 10, y: 70 }, size: { width: 300, height: 50 }, rotation: 0, opacity: 1, zIndex: 1 },
    { id: nanoid(), type: 'text', content: 'That saved a wretch like me.', position: { x: 10, y: 130 }, size: { width: 300, height: 50 }, rotation: 0, opacity: 1, zIndex: 1 },
    { id: nanoid(), type: 'image', src: 'public/images/sample-slide-bg.jpg', position: { x: 50, y: 50 }, size: { width: 400, height: 225 }, rotation: 0, opacity: 1, zIndex: 0 }, 
    { id: nanoid(), type: 'text', content: 'John 3:16', position: { x: 10, y: 190 }, size: { width: 300, height: 50 }, rotation: 0, opacity: 1, zIndex: 1 },
    { id: nanoid(), type: 'text', content: 'For God so loved the world...', position: { x: 10, y: 250 }, size: { width: 300, height: 50 }, rotation: 0, opacity: 1, zIndex: 1 },
  ];

  // Sample Slides
  const initialSlidesData: Slide[] = [
    { id: nanoid(), name: 'Welcome Title', elements: [initialSlideElements[0]], backgroundColor: '#004080' }, 
    { id: nanoid(), name: 'AG - V1 S1', elements: [{ id: nanoid(), type: 'text', content: 'Amazing grace! How sweet the sound', position: { x: 20, y: 20 }, size: { width: 350, height: 60 }, rotation: 0, opacity: 1, zIndex: 1 }], notes: 'Verse 1 Slide 1' }, 
    { id: nanoid(), name: 'AG - V1 S2', elements: [{ id: nanoid(), type: 'text', content: 'That saved a wretch like me!', position: { x: 20, y: 20 }, size: { width: 350, height: 60 }, rotation: 0, opacity: 1, zIndex: 1 }], notes: 'Verse 1 Slide 2' }, 
    { id: nanoid(), name: 'AG - V2 S1', elements: [{ id: nanoid(), type: 'text', content: 'I once was lost, but now am found,', position: { x: 20, y: 20 }, size: { width: 350, height: 60 }, rotation: 0, opacity: 1, zIndex: 1 }], notes: 'Verse 2 Slide 1' }, 
    { id: nanoid(), name: 'AG - V2 S2', elements: [{ id: nanoid(), type: 'text', content: 'Was blind, but now I see.', position: { x: 20, y: 20 }, size: { width: 350, height: 60 }, rotation: 0, opacity: 1, zIndex: 1 }], notes: 'Verse 2 Slide 2' }, 
    { id: nanoid(), name: 'AG - C1 S1', elements: [{ id: nanoid(), type: 'text', content: 'Twas grace that taught my heart to fear,', position: { x: 20, y: 20 }, size: { width: 350, height: 60 }, rotation: 0, opacity: 1, zIndex: 1 }], notes: 'Chorus Slide 1' }, 
    { id: nanoid(), name: 'AG - C1 S2', elements: [{ id: nanoid(), type: 'text', content: 'And grace my fears relieved;', position: { x: 20, y: 20 }, size: { width: 350, height: 60 }, rotation: 0, opacity: 1, zIndex: 1 }], notes: 'Chorus Slide 2' }, 
    { id: nanoid(), name: 'Image Background Slide', elements: [initialSlideElements[3]] }, 
    { id: nanoid(), name: 'Scripture - Title', elements: [initialSlideElements[4]] }, 
    { id: nanoid(), name: 'Scripture - Text', elements: [initialSlideElements[5]] }, 
    // Add more for scrolling test
    { id: nanoid(), name: 'Test Slide 1', elements: [{id: nanoid(), type: 'text', content: 'Test Content 1', position: { x: 20, y: 20 }, size: { width: 350, height: 60 }, rotation: 0, opacity: 1, zIndex: 1}]}, 
    { id: nanoid(), name: 'Test Slide 2', elements: [{id: nanoid(), type: 'text', content: 'Test Content 2', position: { x: 20, y: 20 }, size: { width: 350, height: 60 }, rotation: 0, opacity: 1, zIndex: 1}]}, 
    { id: nanoid(), name: 'Test Slide 3', elements: [{id: nanoid(), type: 'text', content: 'Test Content 3', position: { x: 20, y: 20 }, size: { width: 350, height: 60 }, rotation: 0, opacity: 1, zIndex: 1}]}, 
    { id: nanoid(), name: 'Test Slide 4', elements: [{id: nanoid(), type: 'text', content: 'Test Content 4', position: { x: 20, y: 20 }, size: { width: 350, height: 60 }, rotation: 0, opacity: 1, zIndex: 1}]}, 
    { id: nanoid(), name: 'Test Slide 5', elements: [{id: nanoid(), type: 'text', content: 'Test Content 5', position: { x: 20, y: 20 }, size: { width: 350, height: 60 }, rotation: 0, opacity: 1, zIndex: 1}]}, 
    { id: nanoid(), name: 'Test Slide 6', elements: [{id: nanoid(), type: 'text', content: 'Test Content 6', position: { x: 20, y: 20 }, size: { width: 350, height: 60 }, rotation: 0, opacity: 1, zIndex: 1}]}, 
    { id: nanoid(), name: 'Test Slide 7', elements: [{id: nanoid(), type: 'text', content: 'Test Content 7', position: { x: 20, y: 20 }, size: { width: 350, height: 60 }, rotation: 0, opacity: 1, zIndex: 1}]}, 
    { id: nanoid(), name: 'Test Slide 8', elements: [{id: nanoid(), type: 'text', content: 'Test Content 8', position: { x: 20, y: 20 }, size: { width: 350, height: 60 }, rotation: 0, opacity: 1, zIndex: 1}]}, 
    { id: nanoid(), name: 'Test Slide 9', elements: [{id: nanoid(), type: 'text', content: 'Test Content 9', position: { x: 20, y: 20 }, size: { width: 350, height: 60 }, rotation: 0, opacity: 1, zIndex: 1}]}, 
    { id: nanoid(), name: 'Test Slide 10', elements: [{id: nanoid(), type: 'text', content: 'Test Content 10', position: { x: 20, y: 20 }, size: { width: 350, height: 60 }, rotation: 0, opacity: 1, zIndex: 1}]}, 
    { id: nanoid(), name: 'Test Slide 11', elements: [{id: nanoid(), type: 'text', content: 'Test Content 11', position: { x: 20, y: 20 }, size: { width: 350, height: 60 }, rotation: 0, opacity: 1, zIndex: 1}]}, 
    { id: nanoid(), name: 'Test Slide 12', elements: [{id: nanoid(), type: 'text', content: 'Test Content 12', position: { x: 20, y: 20 }, size: { width: 350, height: 60 }, rotation: 0, opacity: 1, zIndex: 1}]}, 
    { id: nanoid(), name: 'Test Slide 13', elements: [{id: nanoid(), type: 'text', content: 'Test Content 13', position: { x: 20, y: 20 }, size: { width: 350, height: 60 }, rotation: 0, opacity: 1, zIndex: 1}]}, 
    { id: nanoid(), name: 'Test Slide 14', elements: [{id: nanoid(), type: 'text', content: 'Test Content 14', position: { x: 20, y: 20 }, size: { width: 350, height: 60 }, rotation: 0, opacity: 1, zIndex: 1}]}, 
    { id: nanoid(), name: 'Test Slide 15', elements: [{id: nanoid(), type: 'text', content: 'Test Content 15', position: { x: 20, y: 20 }, size: { width: 350, height: 60 }, rotation: 0, opacity: 1, zIndex: 1}]}, 
  ];

  const initialCues: Cue[] = [
    { id: nanoid(), name: 'Welcome Sequence', slides: [initialSlidesData[0]] },
    { 
      id: nanoid(), 
      name: 'Worship Set', 
      slides: [initialSlidesData[1], initialSlidesData[2]] 
    },
    { id: nanoid(), name: 'Sermon Notes', slides: [initialSlidesData[3]] },
    { id: nanoid(), name: 'Announcements', slides: [initialSlidesData[4]] },
    { id: nanoid(), name: 'Closing Song', slides: [initialSlidesData[0]] }, // Reusing a slide for example
  ];

  // States dependent on seed data
  const [slides, setSlides] = useState<Slide[]>(initialSlidesData);
  const [activeCues, setActiveCues] = useState<Cue[]>(initialCues);

  const folderId = nanoid();

  const [currentSelection, setCurrentSelection] = useState<{ id: string | null; type: 'library' | 'cuelist' | 'folder' | null }>({ id: null, type: null });
  const [currentCueGroup, setCurrentCueGroup] = useState<CueGroup | null>(null);




  const uniqueLibraries = React.useMemo(() => {
    const libraryMap = new Map<string, Library>();
    
    // Add the mock data, giving it lower priority
    libraries.forEach(lib => {
      if (!libraryMap.has(lib.name)) {
        libraryMap.set(lib.name, lib);
      }
    });
    
    // Add user libraries from storage, which take precedence
    userLibraries.forEach(userLib => {
      libraryMap.set(userLib.name, {
        id: userLib.name,
        name: userLib.name,
        cues: []  // Cues might be loaded separately
      });
    });
    
    return Array.from(libraryMap.values());
  }, [userLibraries, libraries]);

  useEffect(() => {
    console.log('[PW useEffect] userLibraries changed:', userLibraries);
    console.log('[PW useEffect] uniqueLibraries derived:', uniqueLibraries);
  }, [userLibraries, uniqueLibraries]);

  const [selectedSlideIds, setSelectedSlideIds] = useState<string[]>([]); 
  const [lastSelectedSlideAnchorId, setLastSelectedSlideAnchorId] = useState<string | null>(null); 

  const cuesWithSlidesForView = useMemo((): CueGroup[] => {
    if (currentSelection.type === 'cuelist' && currentSelection.id) {
      const selectedCuelist = cuelists.find(p => p.id === currentSelection.id);
      if (selectedCuelist && selectedCuelist.cues) {
        return selectedCuelist.cues.map((cue: Cue) => ({
          cue,
          slides: cue.slides || [], 
        }));
      }
    }
    return [];
  }, [currentSelection, cuelists]);

  const slidesForCurrentCue = useMemo(() => {
    if (!selectedCueId || !cuesWithSlidesForView) return [];
    const selectedCueGroup = cuesWithSlidesForView.find((cg: CueGroup) => cg.cue.id === selectedCueId);
    return selectedCueGroup ? selectedCueGroup.slides : [];
  }, [cuesWithSlidesForView, selectedCueId]);

  const handleSlideEditingViewSelect = (slideId: string, event?: React.MouseEvent) => {
    const currentSlides = slidesForCurrentCue;
    const slideIndex = currentSlides.findIndex((s: Slide) => s.id === slideId);

    if (event && (event.metaKey || event.ctrlKey)) { 
      setSelectedSlideIds(prevSelectedIds => {
        if (prevSelectedIds.includes(slideId)) {
          return prevSelectedIds.filter(id => id !== slideId);
        } else {
          return [...prevSelectedIds, slideId];
        }
      });
      setLastSelectedSlideAnchorId(slideId);
    } else if (event && event.shiftKey && lastSelectedSlideAnchorId) { 
      const anchorIndex = currentSlides.findIndex((s: Slide) => s.id === lastSelectedSlideAnchorId);
      if (slideIndex !== -1 && anchorIndex !== -1) {
        const start = Math.min(slideIndex, anchorIndex);
        const end = Math.max(slideIndex, anchorIndex);
        const rangeIds = currentSlides.slice(start, end + 1).map((s: Slide) => s.id);
        setSelectedSlideIds(rangeIds);
      } else {
        setSelectedSlideIds([slideId]);
        setLastSelectedSlideAnchorId(slideId);
      }
    } else { 
      setSelectedSlideIds([slideId]);
      setLastSelectedSlideAnchorId(slideId);
    }
  };

  const slidesForEditingView = slidesForCurrentCue; 

  useEffect(() => {
  }, [cuelists]);

  useEffect(() => {
    setSelectedCueId(null);
    setSelectedSlideIds([]);
  }, [currentSelection.id]);

  const handleSelectCue = useCallback((cueId: string) => {
    console.log('handleSelectCue: Setting selectedCueId to:', cueId);
    setSelectedCueId(cueId);
    window.dispatchEvent(new CustomEvent('scrollToCue', { detail: { cueId } }));
  }, [setSelectedCueId]);

  const handleSelectSlide = useCallback((slideId: string | null, cueId?: string) => {
    console.log('handleSelectSlide called for SlidesView (main preview)', { slideId, cueId, currentSelectedSlideIds: selectedSlideIds, currentSelectedCueId: selectedCueId });
    setSelectedSlideIds(slideId ? [slideId] : []);
    setLastSelectedSlideAnchorId(slideId ?? null); 
    if (selectedCueId !== cueId) {
      setSelectedCueId(cueId ?? null);
    }
  }, [setSelectedSlideIds, setSelectedCueId, selectedCueId]);

  const handleSelectSlideInEditor = useCallback((slideId: string) => {
    if (selectedCueId) {
      handleSelectSlide(slideId, selectedCueId);
    }
  }, [selectedCueId, handleSelectSlide]);

  const handleSelectLibraryOrCuelist = (id: string | null, type: 'library' | 'cuelist' | 'folder' | null) => {
    console.log(`PW_handleSelectItem: Received id='${id}', type='${type}'`); 
    console.log(`PW_handleSelectItem_REVISED: Received id='${id}', type='${type}'`);

    setCurrentSelection({ id, type });

    if (type === 'cuelist' && id) {
      const foundCuelist = cuelists.find(p => p.id === id);
      if (foundCuelist && foundCuelist.cues && foundCuelist.cues.length > 0) {
        const firstCue = foundCuelist.cues[0];
        console.log(`PW_handleSelectItem_REVISED: Playlist has cues. First cue:`, firstCue, `Setting selectedCueId to: '${firstCue.id}'`);
        setSelectedCueId(firstCue.id);
        if (firstCue.slides && firstCue.slides.length > 0) {
          console.log(`PW_handleSelectItem_REVISED: First cue has slides. Setting selectedSlideIds to: ['${firstCue.slides[0].id}']`);
          setSelectedSlideIds([firstCue.slides[0].id]);
          setLastSelectedSlideAnchorId(firstCue.slides[0].id);
        } else {
          console.log(`PW_handleSelectItem_REVISED: First cue has no slides. Setting selectedSlideIds to empty.`);
          setSelectedSlideIds([]);
          setLastSelectedSlideAnchorId(null);
        }
      } else {
        console.log(`PW_handleSelectItem_REVISED: Playlist '${id}' has no cues or not found. Resetting cue/slide.`);
        setSelectedCueId(null);
        setSelectedSlideIds([]);
        setLastSelectedSlideAnchorId(null);
      }
    } else if (type === 'library' && id) {
      console.log(`PW_handleSelectItem_REVISED: Library item '${id}' selected. Resetting cue/slide.`);
      setSelectedCueId(null);
      setSelectedSlideIds([]);
      setLastSelectedSlideAnchorId(null);
    } else if (type === 'folder' && id) {
      console.log(`PW_handleSelectItem_REVISED: Folder '${id}' selected. No change to active cue/slide.`);
    } else if (!id && !type) { 
      console.log(`PW_handleSelectItem_REVISED: Explicit deselection (null, null). Resetting cue/slide.`);
      setSelectedCueId(null);
      setSelectedSlideIds([]);
      setLastSelectedSlideAnchorId(null);
    }
  };

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
      cues: [],
    };
    setLibraries(prev => [...prev, newLibrary]);
  }, [uniqueLibraries, setLibraries]);

  const handleAddCuelist = useCallback(() => {
    const defaultNamePrefix = 'New Playlist ';
    let newNameNumber = 1;
    const existingNames = cuelists.map(pl => pl.name);
    while (existingNames.includes(`${defaultNamePrefix}${newNameNumber}`)) {
      newNameNumber++;
    }
    const newCuelist: Cuelist = {
      id: nanoid(),
      name: `${defaultNamePrefix}${newNameNumber}`,
      type: 'cuelist', 
      cues: [],
    };
    setCuelists(prev => [...prev, newCuelist]);
  }, [cuelists, setCuelists]);

  const { slidesForSlidesView, presentationTitleForHeader, cueNameForHeader } = useMemo(() => {
    const selectedCuelist = cuelists.find(pl => pl.id === currentSelection.id && pl.type === 'cuelist');
    const currentCueVal = selectedCuelist?.cues?.find(c => c.id === selectedCueId);
    const slides = currentCueVal?.slides || [];

    const title = selectedCuelist?.name || 
                  (currentSelection.type === 'library' && currentSelection.id ? uniqueLibraries.find(l => l.id === currentSelection.id)?.name : 'No Selection') || 
                  'Presentation';
    let cueNameForSlidesViewHeader = 'Slides'; 
    if (selectedCueId) {
      const currentCue = cuesWithSlidesForView.find(cg => cg.cue.id === selectedCueId)?.cue;
      if (currentCue) {
        cueNameForSlidesViewHeader = currentCue.name;
      } else {
        cueNameForSlidesViewHeader = cuesWithSlidesForView.length > 0 ? cuesWithSlidesForView[0].cue.name : 'Slides';
      }
    } else if (cuesWithSlidesForView.length > 0) {
      cueNameForSlidesViewHeader = cuesWithSlidesForView[0].cue.name;
    }

    return { slidesForSlidesView: slides, presentationTitleForHeader: title, cueNameForHeader: cueNameForSlidesViewHeader };
  }, [cuelists, currentSelection.id, currentSelection.type, selectedCueId]);

  const { itemsForCueList, cueListItemType } = useMemo(() => {
    let items: PresentationFile[] | Cue[] = [];
    let type: 'presentation' | 'cue' | null = null;

    if (currentSelection.type === 'library' && currentSelection.id) {
      const selectedLib = uniqueLibraries.find(lib => lib.id === currentSelection.id);
      if (selectedLib && selectedLib.cues) {
        items = selectedLib.cues;
        type = 'cue';
      } else {
        items = [];
        type = null;
      }
    } else if (currentSelection.type === 'cuelist' && currentSelection.id) {
      const selectedItem = cuelists.find(pl => pl.id === currentSelection.id);
      if (selectedItem) {
        if (selectedItem.type === 'cuelist') {
          items = selectedItem.cues || [];
          type = 'cue';
        } else {
          items = [];
          type = null;
        }
      } else {
        items = [];
        type = null;
      }
    } else {
      items = [];
      type = null;
    }
    return { itemsForCueList: items, cueListItemType: type };
  }, [currentSelection.type, currentSelection.id, uniqueLibraries, cuelists]);

  const initialPanels: PanelState[] = [
    { id: 'libraryCueList', x: 0, y: 0, width: '25%', height: '60%', zIndex: 1, componentKey: 'libraryCueList', minWidth: 200, minHeight: 150 },
    { id: 'slides', x: 300, y: 0, width: '75%', height: '60%', zIndex: 2, componentKey: 'slides', minWidth: 400, minHeight: 300 },
    { id: 'output', x: 0, y: 480, width: '50%', height: '40%', zIndex: 3, componentKey: 'output', minWidth: 320, minHeight: 180 },
    { id: 'automation', x: 600, y: 480, width: '50%', height: '40%', zIndex: 4, componentKey: 'automation', minWidth: 200, minHeight: 150 },
  ];
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [visualSnapLines, setVisualSnapLines] = useState<{h: number[], v: number[]}>({ h: [], v: [] });
  const [nextZ, setNextZ] = useState<number>(initialPanels.length + 1);

  const mockAvailableOutputs: OutputItem[] = useMemo(() => [
    { 
      id: 'output-1', 
      name: 'Main Projector', 
      contentPreview: <div style={{width: '100%', height: '100%', backgroundColor: 'rgba(0,100,0,0.3)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', padding: '5px'}}>Live Slide Content</div>, 
      audioLevel: 70, 
      peakAudioLevel: 85 
    },
    { 
      id: 'output-2', 
      name: 'Stage Display', 
      contentPreview: <div style={{width: '100%', height: '100%', backgroundColor: 'rgba(0,0,100,0.3)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', padding: '5px'}}>Notes & Timer</div>, 
      audioLevel: 45, 
      peakAudioLevel: 60 
    },
    { 
      id: 'output-3', 
      name: 'NDI Stream 1', 
      contentPreview: <div style={{width: '100%', height: '100%', backgroundColor: 'rgba(100,0,0,0.3)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', padding: '5px'}}>Lower Thirds</div>, 
      audioLevel: 92, 
      peakAudioLevel: 98 
    },
    { id: 'output-4', name: 'Recording Feed' }, 
  ], []);

  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });

  const renderPanelComponent = (panel: PanelState) => {
    switch (panel.componentKey) {
      case 'output':
        return <OutputWindow themeColors={themeColors} availableOutputs={mockAvailableOutputs} />;
      case 'slides': {
        let cueNameForSlidesViewHeader = 'Slides'; 
        if (selectedCueId) {
          const currentCue = cuesWithSlidesForView.find(cg => cg.cue.id === selectedCueId)?.cue;
          if (currentCue) {
            cueNameForSlidesViewHeader = currentCue.name;
          } else {
            cueNameForSlidesViewHeader = cuesWithSlidesForView.length > 0 ? cuesWithSlidesForView[0].cue.name : 'Slides';
          }
        } else if (cuesWithSlidesForView.length > 0) {
          cueNameForSlidesViewHeader = cuesWithSlidesForView[0].cue.name;
        }

        return (
          <SlidesView
            key={`slides-view-${panel.id}-${selectedCueId || 'no-cue'}-${selectedSlideIds.length > 0 ? selectedSlideIds[0] : 'no-slide'}`}
            themeColors={themeColors}
            cueGroups={cuesWithSlidesForView} 
            selectedSlideId={selectedSlideIds[0] || null} 
            onSelectSlide={(slideId: string, cueId: string) => handleSelectSlide(slideId, cueId)} 
            presentationTitle={presentationTitleForHeader}
            cueName={cueNameForSlidesViewHeader}
            onVisibleCueChanged={handleSelectCue}
            selectedCueId={selectedCueId}
            onNavigateToCue={handleNavigateToCue}
          />
        );
      }
      case 'libraryCueList':
        return (
          <LibraryCueListCombinedView
            themeColors={themeColors}
            libraries={uniqueLibraries}
            cuelists={cuelists}
            selectedItemId={currentSelection.id || null}
            selectedItemType={currentSelection.type || null}
            onSelectItem={handleSelectLibraryOrCuelist}
            itemsForCueList={itemsForCueList}
            cueListItemType={cueListItemType}
            onAddLibrary={handleAddNewUserLibrary}
            onAddCuelist={handleAddCuelist}
            onSelectCue={handleSelectCue}
            selectedCueId={selectedCueId}
          />
        );
      case 'automation':
        return <div style={{ backgroundColor: themeColors.panelBackground, color: themeColors.textColor, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', padding: '10px' }}>Automation Controls</div>;
      default:
        console.warn(`Unknown panel componentKey: ${panel.componentKey}`);
        return null; 
    }
  };

  const SNAP_THRESHOLD = 5; // pixels
  const GRID_INTERVAL = 20; // pixels

  const gridContainerRef = useRef<HTMLDivElement>(null);

  const parsePixelValue = (value: string | number): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  // Calculate initial positions and sizes based on container size
  useEffect(() => {
    // Check if containerDimensions has been initialized (width and height are not 0)
    if (containerDimensions.width > 0 && containerDimensions.height > 0) {
      const { width: offsetWidth, height: offsetHeight } = containerDimensions;
      const GAP = 10; // Gap acts as padding around and between panels
      // Total space for panels = container size - 3 gaps (left, middle, right or top, middle, bottom)
      const totalPanelWidth = offsetWidth - (3 * GAP);
      const totalPanelHeight = offsetHeight - (3 * GAP);
      const panelWidth = totalPanelWidth / 2;
      const panelHeight = totalPanelHeight / 2;

      setPanels(prevPanels => prevPanels.map(panel => {
        let newX = 0;
        let newY = 0;

        if (panel.id === 'output') { newX = GAP; newY = GAP; }
        else if (panel.id === 'slides') { newX = GAP + panelWidth + GAP; newY = GAP; }
        else if (panel.id === 'libraryCueList') { newX = GAP; newY = GAP + panelHeight + GAP; }
        else if (panel.id === 'automation') { newX = GAP + panelWidth + GAP; newY = GAP + panelHeight + GAP; }
        
        const finalWidth = Math.max(0, panelWidth);
        const finalHeight = Math.max(0, panelHeight);

        return { ...panel, x: newX, y: newY, width: finalWidth, height: finalHeight };
      }));
    }
  }, [containerDimensions]); // Re-run only if containerDimensions change

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

  const bringToFront = (id: string) => {
    setPanels(prevPanels =>
      prevPanels.map(panel =>
        panel.id === id ? { ...panel, zIndex: nextZ } : panel
      )
    );
    setNextZ(prevZ => prevZ + 1);
  };

  const handleDragStart = (id: string) => {
    setDraggingId(id);
    bringToFront(id); 
  };
  
  const handleDrag = (id: string, e: DraggableEvent, d: DraggableData) => {
    if (!gridContainerRef.current) return;

    const { offsetWidth: containerWidth, offsetHeight: containerHeight } = gridContainerRef.current;
    let newVisualSnapLines: { h: number[], v: number[] } = { h: [], v: [] };

    const currentPanel = panels.find(p => p.id === id);
    if (!currentPanel) return;

    const currentPanelWidthPx = parsePixelValue(currentPanel.width);
    const currentPanelHeightPx = parsePixelValue(currentPanel.height);

    let newX = d.x; // Current raw X position from drag event
    let newY = d.y; // Current raw Y position from drag event

    let finalSnappedX = newX; // Initialize with raw position
    let finalSnappedY = newY; // Initialize with raw position

    const xSnapTargets: number[] = [];
    const ySnapTargets: number[] = [];

    // 1. Add other panels' edges as snap targets
    panels.forEach(otherPanel => {
        if (otherPanel.id === id) return; // Skip self

        const otherPanelWidthPx = parsePixelValue(otherPanel.width);
        const otherPanelHeightPx = parsePixelValue(otherPanel.height);

        // X-axis: Align current panel's LEFT or RIGHT edge with other panel's LEFT or RIGHT edge
        xSnapTargets.push(otherPanel.x);                                // Align currentPanel.left to otherPanel.left
        xSnapTargets.push(otherPanel.x + otherPanelWidthPx);            // Align currentPanel.left to otherPanel.right
        xSnapTargets.push(otherPanel.x - currentPanelWidthPx);          // Align currentPanel.right to otherPanel.left
        xSnapTargets.push(otherPanel.x + otherPanelWidthPx - currentPanelWidthPx); // Align currentPanel.right to otherPanel.right

        // Y-axis: Align current panel's TOP or BOTTOM edge with other panel's TOP or BOTTOM edge
        ySnapTargets.push(otherPanel.y);                                 // Align currentPanel.top to otherPanel.top
        ySnapTargets.push(otherPanel.y + otherPanelHeightPx);             // Align currentPanel.top to otherPanel.bottom
        ySnapTargets.push(otherPanel.y - currentPanelHeightPx);           // Align currentPanel.bottom to otherPanel.top
        ySnapTargets.push(otherPanel.y + otherPanelHeightPx - currentPanelHeightPx); // Align currentPanel.bottom to otherPanel.bottom
    });

    // Sort targets by proximity to the current dragged position
    const sortedXTargets = [...new Set(xSnapTargets)].sort((a, b) => Math.abs(newX - a) - Math.abs(newX - b));
    const sortedYTargets = [...new Set(ySnapTargets)].sort((a, b) => Math.abs(newY - a) - Math.abs(newY - b));

    for (const targetX of sortedXTargets) {
        if (Math.abs(newX - targetX) < SNAP_THRESHOLD) {
            finalSnappedX = targetX;
            newVisualSnapLines.v.push(targetX); // Line for current panel's left edge after snap
            newVisualSnapLines.v.push(targetX + currentPanelWidthPx); // Line for current panel's right edge after snap
            break;
        }
    }

    for (const targetY of sortedYTargets) {
        if (Math.abs(newY - targetY) < SNAP_THRESHOLD) {
            finalSnappedY = targetY;
            newVisualSnapLines.h.push(targetY); // Line for current panel's top edge after snap
            newVisualSnapLines.h.push(targetY + currentPanelHeightPx); // Line for current panel's bottom edge after snap
            break;
        }
    }
    
    // Ensure the panel stays within bounds
    finalSnappedX = Math.max(0, Math.min(finalSnappedX, containerWidth - currentPanelWidthPx));
    finalSnappedY = Math.max(0, Math.min(finalSnappedY, containerHeight - currentPanelHeightPx));

    setPanels(prevPanels =>
        prevPanels.map(p =>
            p.id === id ? { ...p, x: finalSnappedX, y: finalSnappedY } : p
        )
    );
    setVisualSnapLines({v: [...new Set(newVisualSnapLines.v)], h: [...new Set(newVisualSnapLines.h)]});
  };

  const handleResizeStart = (id: string) => {
    setDraggingId(id); // Optional: if you want to signify resizing state
    bringToFront(id);
  };

  const handleDragStopInternal = (id: string, d: DraggableData) => {
    setDraggingId(null);
    setVisualSnapLines({ h: [], v: [] }); 
    // Final position is already set by handleDrag due to controlled component nature
    // No explicit setPanels needed here if Rnd's position prop is correctly bound
  };

  const handleResizeStop = (
    id: string,
    event: MouseEvent | TouchEvent,
    direction: string,
    refToElement: HTMLElement,
    delta: ResizableDelta,
    position: { x: number; y: number }
  ) => {
    const newWidthPx = parsePixelValue(refToElement.style.width);
    const newHeightPx = parsePixelValue(refToElement.style.height);
    const newX = position.x;
    const newY = position.y;

    if (event.shiftKey) {
      setPanels(prevPanels =>
        prevPanels.map(p =>
          p.id === id
            ? { ...p, width: newWidthPx, height: newHeightPx, x: newX, y: newY }
            : p
        )
      );
      // bringToFront is already called in handleResizeStart
      return;
    }

    // Push-aside logic
    setPanels(prevPanels => {
      // Create a deep copy for mutable operations, ensuring numeric dimensions
      const workingPanels = prevPanels.map(p => ({
        ...p,
        x: p.x,
        y: p.y,
        width: parsePixelValue(p.width),
        height: parsePixelValue(p.height),
        minWidth: p.minWidth || 0,
        minHeight: p.minHeight || 0,
      }));

      const activePanelIndex = workingPanels.findIndex(p => p.id === id);
      if (activePanelIndex === -1) return prevPanels; // Should not happen

      // Tentatively update the active panel to its new size/pos from Rnd event
      let activePanelState = { 
        ...workingPanels[activePanelIndex],
        width: newWidthPx,
        height: newHeightPx,
        x: newX,
        y: newY,
      };

      for (let i = 0; i < workingPanels.length; i++) {
        if (i === activePanelIndex) continue;
        const otherPanel = workingPanels[i];

        // Define panel rectangles for easier calculation
        let apRect = { x: activePanelState.x, y: activePanelState.y, width: activePanelState.width, height: activePanelState.height };
        const opRect = { x: otherPanel.x, y: otherPanel.y, width: otherPanel.width, height: otherPanel.height };
        const opMinWidth = otherPanel.minWidth;
        const opMinHeight = otherPanel.minHeight;

        const overlaps = !(apRect.x + apRect.width <= opRect.x || apRect.x >= opRect.x + opRect.width || apRect.y + apRect.height <= opRect.y || apRect.y >= opRect.y + opRect.height);

        if (overlaps) {
          // Expanding RIGHT (active panel's right edge moves right)
          if (delta.width > 0 && direction.toLowerCase().includes('right') && apRect.x < opRect.x && apRect.x + apRect.width > opRect.x) {
            let overlap = (apRect.x + apRect.width) - opRect.x;
            let newOpWidth = opRect.width - overlap;
            if (newOpWidth < opMinWidth) {
              const deficit = opMinWidth - newOpWidth;
              newOpWidth = opMinWidth;
              activePanelState.width -= deficit; // Active panel can't expand as much
              apRect.width = activePanelState.width; // Update apRect for subsequent checks if any
            }
            otherPanel.x += overlap - (opMinWidth - newOpWidth > 0 ? opMinWidth - newOpWidth : 0); // Adjust op.x by actual push
            otherPanel.width = newOpWidth;
          }
          // Expanding LEFT (active panel's left edge moves left)
          else if (delta.width > 0 && direction.toLowerCase().includes('left') && apRect.x < opRect.x + opRect.width && apRect.x + apRect.width > opRect.x + opRect.width) {
            let overlap = (opRect.x + opRect.width) - apRect.x;
            let newOpWidth = opRect.width - overlap;
            if (newOpWidth < opMinWidth) {
              const deficit = opMinWidth - newOpWidth;
              newOpWidth = opMinWidth;
              activePanelState.x += deficit; // Active panel's left edge is pushed back
              activePanelState.width -= deficit; // Active panel's width reduces
              apRect.x = activePanelState.x; apRect.width = activePanelState.width; // Update apRect
            }
            // otherPanel.x remains the same
            otherPanel.width = newOpWidth;
          }

          // Expanding DOWN (active panel's bottom edge moves down)
          if (delta.height > 0 && direction.toLowerCase().includes('bottom') && apRect.y < opRect.y && apRect.y + apRect.height > opRect.y) {
            let overlap = (apRect.y + apRect.height) - opRect.y;
            let newOpHeight = opRect.height - overlap;
            if (newOpHeight < opMinHeight) {
              const deficit = opMinHeight - newOpHeight;
              newOpHeight = opMinHeight;
              activePanelState.height -= deficit;
              apRect.height = activePanelState.height;
            }
            otherPanel.y += overlap - (opMinHeight - newOpHeight > 0 ? opMinHeight - newOpHeight : 0);
            otherPanel.height = newOpHeight;
          }
          // Expanding UP (active panel's top edge moves up)
          else if (delta.height > 0 && direction.toLowerCase().includes('top') && apRect.y < opRect.y + opRect.height && apRect.y + apRect.height > opRect.y + opRect.height) {
            let overlap = (opRect.y + opRect.height) - apRect.y;
            let newOpHeight = opRect.height - overlap;
            if (newOpHeight < opMinHeight) {
              const deficit = opMinHeight - newOpHeight;
              newOpHeight = opMinHeight;
              activePanelState.y += deficit;
              activePanelState.height -= deficit;
              apRect.y = activePanelState.y; apRect.height = activePanelState.height;
            }
            otherPanel.height = newOpHeight;
          }
        }
      }
      // Finalize active panel's state after all interactions
      activePanelState.width = Math.max(activePanelState.width, activePanelState.minWidth);
      activePanelState.height = Math.max(activePanelState.height, activePanelState.minHeight);
      workingPanels[activePanelIndex] = activePanelState;

      return workingPanels;
    });
  };

  const handleUpdateCueSlides = (updatedSlides: Slide[]) => {
    if (!selectedCueId) return; // Should not happen if editor is open

    setCuelists((prevCuelists: Cuelist[]) =>
      prevCuelists.map(cuelist => {
        if (cuelist.cues) {
          const updatedCues = cuelist.cues.map((cue: Cue) => {
            if (cue.id === selectedCueId) {
              return { ...cue, slides: updatedSlides };
            }
            return cue;
          });
          // Check if cues were actually updated to avoid unnecessary object spread
          if (cuelist.cues !== updatedCues) {
            return { ...cuelist, cues: updatedCues };
          }
        }
        return cuelist;
      })
    );
  };

  const handleNavigateToCue = (cueId: string) => {
    const targetCueGroup = cuesWithSlidesForView.find(cg => cg.cue.id === cueId);
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

  const rndItemStyleDefault: React.CSSProperties = {
    border: `1px solid ${themeColors.panelBorder}`,
    borderRadius: '8px',
    backgroundColor: themeColors.panelBackground,
    overflow: 'hidden',
    color: themeColors.textColor,
  };

  const gridItemContentStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    overflow: 'auto',
    padding: '10px',
    boxSizing: 'border-box',
    color: themeColors.textColor,
    display: 'flex',
    flexDirection: 'column',
  };

  // Removed toggleTheme function and buttonStyle as they are lifted up

  return (
    <div style={widgetWrapperStyle}>
      <InputModal
        {...inputModalProps}
        isOpen={isInputModalOpen}
        onClose={() => setIsInputModalOpen(false)}
      />
      <PresentationControlsBar 
        themeColors={themeColors} 
        onShowClick={handleShowViewClick} 
        onEditClick={handleEditViewClick} 
      />
      {currentViewMode === 'slideEditor' ? (
        <SlideEditingView
          themeColors={themeColors}
          slides={slidesForEditingView}
          selectedSlideIds={selectedSlideIds}
          onSelectSlide={handleSlideEditingViewSelect}
          onUpdateSlides={handleUpdateCueSlides} // Renamed from handleUpdateSlidesForEditingView for consistency if needed, or verify original name
        />
      ) : (
        <div ref={gridContainerRef} style={gridContainerStyle}>
          {panels.map(panel => (
            <Rnd
              key={panel.id}
              data-panel-id={panel.id} // Add data attribute for identification
              style={{ ...rndItemStyleDefault, zIndex: panel.zIndex }} // Apply zIndex, borderRadius is now in rndItemStyleDefault
              size={{ width: panel.width, height: panel.height }}
              position={{ x: panel.x, y: panel.y }} // Controlled position
              minWidth={panel.minWidth}
              minHeight={panel.minHeight}
              bounds="parent"
              onDragStart={() => handleDragStart(panel.id)}
              onDrag={(e, data) => handleDrag(panel.id, e, data)}
              onResizeStart={() => handleResizeStart(panel.id)}
              onDragStop={(e, d) => handleDragStopInternal(panel.id, d)}
              onResizeStop={(e, dir, ref, delta, pos) =>
                handleResizeStop(panel.id, e, dir, ref, delta, pos)
              }
              enableResizing={{
                top: true, right: true, bottom: true, left: true,
                topRight: true, bottomRight: true, bottomLeft: true, topLeft: true,
              }}
            >
              <div style={gridItemContentStyle}>
                {renderPanelComponent(panel)}
              </div>
            </Rnd>
          ))}
          {/* Visual Snap Lines */}
          {visualSnapLines.v.map((lineX, index) => (
            <div key={`v-line-${index}`} style={{ position: 'absolute', left: lineX, top: 0, bottom: 0, width: '1px', backgroundColor: 'rgba(0, 255, 255, 0.7)', zIndex: 9998, pointerEvents: 'none' }} />
          ))}
          {visualSnapLines.h.map((lineY, index) => (
            <div key={`h-line-${index}`} style={{ position: 'absolute', top: lineY, left: 0, right: 0, height: '1px', backgroundColor: 'rgba(0, 255, 255, 0.7)', zIndex: 9998, pointerEvents: 'none' }} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PresentationWidget;
