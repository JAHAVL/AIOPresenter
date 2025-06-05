import React, { useState, useEffect, useCallback, useRef } from 'react';
import { IpcRendererEvent } from 'electron';
import { StorageChannel } from '../../../shared/ipcChannels';
import { Rnd, Props as RndProps, DraggableData, ResizableDelta } from 'react-rnd';
import type { DraggableEvent } from 'react-draggable';

// Import child components
import OutputWindow from './components/ShowView/OutputWindow/OutputWindow';
import SlidesView from './components/ShowView/SlidesView/SlidesView';
import LibrariesSection from './components/ShowView/LibrariesCuelist/LibrariesSection';
import CuelistsSection from './components/ShowView/LibrariesCuelist/CuelistsSection';
import LibraryCueListCombinedView from './components/ShowView/LibrariesCuelist/LibraryCueListCombinedView';

// Placeholder types and data (ideally imported from actual files)
import type { ThemeColors } from './theme';
import type { Slide, Library, Cuelist, PresentationFile, Cue } from './types/presentationSharedTypes';

// Placeholder for uuid if not installed - REMOVE IF UUID IS PROPERLY INSTALLED AND IMPORTED
const uuidv4 = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// Placeholder default theme - REPLACE WITH ACTUAL IMPORT
const defaultThemeColorsExtended: ThemeColors = {} as any; // Use empty object with type assertion to bypass strict typing

const defaultThemeColors: ThemeColors = defaultThemeColorsExtended;

// Placeholder initial slides - REPLACE WITH ACTUAL DATA LOGIC
const initialSlidesData: Slide[] = [
  { id: uuidv4(), name: 'Slide 1', elements: [] },
  { id: uuidv4(), name: 'Slide 2', elements: [] },
];

type PanelId = 'output' | 'slides' | 'libraryCueList' | 'automation';

interface PanelLayoutState {
  id: PanelId;
  x: number;
  y: number;
  width: string | number;
  height: string | number;
  zIndex: number;
  minWidth?: number;
  minHeight?: number;
}

const initialPanelLayouts: PanelLayoutState[] = [
  { id: 'output', x: 0, y: 0, width: '50%', height: '50%', zIndex: 1, minWidth: 200, minHeight: 150 },
  { id: 'slides', x: 0, y: 0, width: '50%', height: '50%', zIndex: 2, minWidth: 200, minHeight: 150 },
  { id: 'libraryCueList', x: 0, y: 0, width: '50%', height: '50%', zIndex: 3, minWidth: 200, minHeight: 150 },
  { id: 'automation', x: 0, y: 0, width: '50%', height: '50%', zIndex: 4, minWidth: 200, minHeight: 150 },
];

interface PresentationWidgetProps {
  themeColors?: ThemeColors;
}

interface OutputWindowProps {
  themeColors: ThemeColors;
}

interface SlidesViewProps {
  themeColors?: ThemeColors; // Make themeColors optional
  slides?: Slide[];
  selectedSlideIds?: string[];
  onSelectSlide?: (slideId: string) => void;
  onUpdateSlides?: (updatedSlides: Slide[]) => void;
}

interface LibraryCueListCombinedViewProps {
  themeColors: ThemeColors;
  libraries: Library[];
  cuelists: Cuelist[];
  onLibrarySelect?: (libraryId: string) => void;
  onCueSelect?: (cueId: string) => void;
}

const PresentationWidget: React.FC<PresentationWidgetProps> = ({ themeColors = defaultThemeColors }) => {
  const [libraries, setLibraries] = useState<Library[]>([]);
  console.log('[PresentationWidget] Initial libraries state:', libraries);

  const fetchLibraries = useCallback(async () => {
    console.log('[PresentationWidget] Attempting to fetch libraries...');
    if (window.electronAPI) {
      console.log('[PresentationWidget] window.electronAPI object found.');
      if (typeof window.electronAPI.listUserLibraries === 'function') {
        try {
          console.log('[PresentationWidget] window.electronAPI.listUserLibraries SOURCE CODE:\n', window.electronAPI.listUserLibraries.toString());
        } catch (e) {
          console.warn('[PresentationWidget] Could not stringify window.electronAPI.listUserLibraries:', e);
        }
        console.log('[PresentationWidget] window.electronAPI.listUserLibraries.toString():', window.electronAPI.listUserLibraries.toString().substring(0, 300) + "...");
        const librariesArray = await window.electronAPI.listUserLibraries();
        console.log('[PresentationWidget] Response from listUserLibraries:', librariesArray);

        if (Array.isArray(librariesArray)) {
          console.log('[PresentationWidget] Attempting to set libraries from direct array:', JSON.stringify(librariesArray, null, 2));
          setLibraries(librariesArray);
          console.log('[PresentationWidget] Called setLibraries with direct array. State will update asynchronously.');
        } else {
          // This case implies the response was not the expected direct array.
          // This could happen if the unwrapping behavior changes or if an error object is returned differently.
          console.error('[PresentationWidget] Error: Expected a direct array of libraries, but received:', librariesArray);
          // Attempt to check for the object structure as a fallback, though types might not align if preload is Promise<Library[]>
          if (librariesArray && typeof librariesArray === 'object' && (librariesArray as any).success && (librariesArray as any).libraries) {
            const libsToSet = Array.isArray((librariesArray as any).libraries) ? (librariesArray as any).libraries : [];
            console.log('[PresentationWidget] Attempting to set libraries from wrapped object (fallback):', JSON.stringify(libsToSet, null, 2));
            setLibraries(libsToSet);
            console.log('[PresentationWidget] Called setLibraries with wrapped object. State will update asynchronously.');
          } else {
            console.log('[PresentationWidget] Setting libraries to EMPTY ARRAY due to unrecognized structure.');
            setLibraries([]); 
            console.error('[PresentationWidget] Further error: Data structure unrecognized.', librariesArray?.error || 'No data returned');
          }
        }
      } else {
        console.error('[PresentationWidget] window.electronAPI.listUserLibraries is NOT a function. Type:', typeof window.electronAPI?.listUserLibraries);
        console.log('[PresentationWidget] Setting libraries to EMPTY ARRAY because listUserLibraries is not a function.');
        setLibraries([]);
      }
    } else {
      console.warn('[PresentationWidget] window.electronAPI is not available.');
      console.log('[PresentationWidget] Setting libraries to EMPTY ARRAY because window.electronAPI is not available.');
      setLibraries([]);
    }
  }, []);

  useEffect(() => {
    console.log('[PresentationWidget] Libraries state CHANGED to:', JSON.stringify(libraries, null, 2));
  }, [libraries]);

  useEffect(() => {
    console.log('[PresentationWidget] Setting up listener for LIBRARIES_DID_CHANGE...');
    const cleanupListener = window.electronAPI?.on(
      StorageChannel.LIBRARIES_DID_CHANGE,
      () => {
        console.log('[PresentationWidget] Received LIBRARIES_DID_CHANGE from main process. Refetching libraries.');
        fetchLibraries();
      }
    );

    return () => {
      console.log('[PresentationWidget] Cleaning up LIBRARIES_DID_CHANGE listener.');
      if (cleanupListener) {
        cleanupListener();
      }
    };
  }, [fetchLibraries]); // fetchLibraries is memoized with useCallback

  useEffect(() => {
    console.log('[PresentationWidget] Setting up main process debug message listener...');
    // const cleanup = window.electronAPI?.onMainProcessDebugMessage((message: any) => {
    //   console.log('[MAIN PROCESS DEBUG] Received:', message && message.log ? message.log : 'No log string', message);
    // });

    // Also listen to the older ad-hoc debug log channel if it's still in use
    // const cleanupAdHoc = window.electronAPI?.on(StorageChannel.DEBUG_MAIN_PROCESS_LOG, (_event: IpcRendererEvent, logMessage: string) => {
    //   console.log('[MAIN DEBUG AD-HOC] Received:', typeof logMessage === 'string' ? logMessage : 'Log message is not a string', { fullData: logMessage });
    // });

    // Test the on/reply IPC mechanism
    if (window.electronAPI?.testOnReplyPing && window.electronAPI?.testStorageChannelPing) { // Ensure both test functions are available
      console.log('[PresentationWidget] Attempting to call IPC test pings...');
      // Test ipcMain.on / event.reply from main.ts
      window.electronAPI.testOnReplyPing()
        .then((response: any) => {
          console.log('[PresentationWidget] Response from testOnReplyPing (main.ts):', response);
        })
        .catch((error: any) => {
          console.error('[PresentationWidget] Error from testOnReplyPing (main.ts):', error);
        });

      // Test ipcMain.on / event.reply from storageHandlers.ts ('test-channel')
      window.electronAPI.testStorageChannelPing()
        .then((response: any) => {
          console.log('[PresentationWidget] Response from testStorageChannelPing (storageHandlers.ts):', response);
        })
        .catch((error: any) => {
          console.error('[PresentationWidget] Error from testStorageChannelPing (storageHandlers.ts):', error);
        });
    } else {
      console.warn('[PresentationWidget] window.electronAPI.testOnReplyPing or testStorageChannelPing is not available.');
    }

    // Fetch initial data
    if (window.electronAPI) {
      fetchLibraries();
    } else {
      console.warn('[PresentationWidget] window.electronAPI is not available for fetchLibraries.');
    }

    return () => {
      console.log('[PresentationWidget] Cleaning up main process debug message listener...');
      // if (typeof cleanup === 'function') {
      //   cleanup();
      // }
      // if (typeof cleanupAdHoc === 'function') {
      //   cleanupAdHoc();
      // }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  console.log('PresentationWidget component mounted with themeColors:', themeColors);
  const [slides, setSlides] = useState<Slide[]>(initialSlidesData);
  const [cuelists, setCuelists] = useState<Cuelist[]>([]);
  const [selectedSlideIds, setSelectedSlideIds] = useState<string[]>(() => {
    // Select the first slide by default if slides exist
    return initialSlidesData.length > 0 ? [initialSlidesData[0].id] : [];
  });
  const [lastSelectedSlideAnchorId, setLastSelectedSlideAnchorId] = useState<string | null>(() => {
    return initialSlidesData.length > 0 ? initialSlidesData[0].id : null;
  });

  const [panelLayouts, setPanelLayouts] = useState<PanelLayoutState[]>(initialPanelLayouts);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [visualSnapLines, setVisualSnapLines] = useState<{h: number[], v: number[]}>({ h: [], v: [] });
  const [nextZ, setNextZ] = useState<number>(initialPanelLayouts.length + 1);

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
    if (gridContainerRef.current) {
      const { offsetWidth, offsetHeight } = gridContainerRef.current;
      setPanelLayouts(prevLayouts => prevLayouts.map(layout => {
        let newX = parsePixelValue(layout.x); // Ensure x/y are numbers for calculation
        let newY = parsePixelValue(layout.y);
        const defaultWidth = offsetWidth / 2;
        const defaultHeight = offsetHeight / 2;

        // Example initial positioning logic, adjust as needed
        if (layout.id === 'output') { newX = 0; newY = 0; }
        else if (layout.id === 'slides') { newX = defaultWidth; newY = 0; }
        else if (layout.id === 'libraryCueList') { newX = 0; newY = defaultHeight; }
        else if (layout.id === 'automation') { newX = defaultWidth; newY = defaultHeight; }
        
        return { ...layout, x: newX, y: newY, width: defaultWidth, height: defaultHeight };
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount to set initial positions based on container size // Re-run if gridContainerRef becomes available, not just on mount

  // Optional: ResizeObserver to update containerSize if needed for truly dynamic %-based children
   useEffect(() => {
    const currentGridContainer = gridContainerRef.current;
    if (!currentGridContainer) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        // If panels used % for x/y, you might recalculate them here,
        // but RND handles % width/height updates automatically if parent resizes.
        // For now, this is a placeholder if more complex resize handling is needed.
      }
    });
    resizeObserver.observe(currentGridContainer);
    return () => {
      resizeObserver.unobserve(currentGridContainer);
    };
  }, []); // Empty dependency array means this runs once after initial render


  const bringToFront = (id: PanelId) => {
    setPanelLayouts(prevLayouts =>
      prevLayouts.map(layout =>
        layout.id === id ? { ...layout, zIndex: nextZ } : layout
      )
    );
    setNextZ(prevZ => prevZ + 1);
  };

  const handleUpdateSlides = useCallback((updatedSlides: Slide[]) => {
    setSlides(updatedSlides);
  }, []);

  const handleSelectSlide = useCallback((slideId: string, event?: React.MouseEvent) => {
    const isModifierKey = event && (event.ctrlKey || event.metaKey || event.shiftKey);
    console.log(`handleSelectSlide: slideId=${slideId}, isModifierKey=${isModifierKey}, eventType=${event?.type}`);
    
    if (isModifierKey) {
      setSelectedSlideIds((prevSelected) =>
        prevSelected.includes(slideId)
          ? prevSelected.filter(id => id !== slideId)
          : [...prevSelected, slideId]
      );
      if (!selectedSlideIds.includes(slideId)) {
        setLastSelectedSlideAnchorId(slideId); 
      }
    } else {
      setSelectedSlideIds([slideId]);
      setLastSelectedSlideAnchorId(slideId);
    }
  }, [selectedSlideIds]);
  
  // Function to fetch libraries and cuelists data
  const fetchLibrariesAndCuelists = useCallback(() => {
    console.log('Fetching libraries and cuelists data...');
    try {
      // This would typically be an API call or IPC call
      // For now, we'll use empty arrays or mock data
      setLibraries([] as Library[]);
      setCuelists([] as Cuelist[]);
    } catch (error) {
      console.error('Error fetching libraries and cuelists:', error);
    }
  }, []);

  useEffect(() => {
    console.log('PresentationWidget mounted, initializing data...');
    fetchLibrariesAndCuelists();
  }, [fetchLibrariesAndCuelists]);

  const handleDragStart = (id: PanelId) => {
    bringToFront(id);
    setDraggingId(id);
  };

  const handleDragStop = (id: string, e: DraggableEvent, d: DraggableData) => {
    if (!gridContainerRef.current) return;

    const { offsetWidth: containerWidth, offsetHeight: containerHeight } = gridContainerRef.current;
    let newVisualSnapLines: { h: number[], v: number[] } = { h: [], v: [] };

    const currentPanel = panelLayouts.find(p => p.id === id);
    if (!currentPanel) return;

    const currentPanelWidthPx = parsePixelValue(currentPanel.width);
    const currentPanelHeightPx = parsePixelValue(currentPanel.height);

    let newX = d.x; // Current raw X position from drag event
    let newY = d.y; // Current raw Y position from drag event

    let finalSnappedX = newX; // Initialize with raw position
    let finalSnappedY = newY; // Initialize with raw position

    const xSnapTargets: number[] = [];
    const ySnapTargets: number[] = [];

    panelLayouts.forEach(otherPanel => {
      if (otherPanel.id === id) return; // Skip self

      const otherPanelWidthPx = parsePixelValue(otherPanel.width);
      const otherPanelHeightPx = parsePixelValue(otherPanel.height);

      xSnapTargets.push(otherPanel.x);                                // Align currentPanel.left to otherPanel.left
      xSnapTargets.push(otherPanel.x + otherPanelWidthPx);            // Align currentPanel.left to otherPanel.right
      xSnapTargets.push(otherPanel.x - currentPanelWidthPx);          // Align currentPanel.right to otherPanel.left
      xSnapTargets.push(otherPanel.x + otherPanelWidthPx - currentPanelWidthPx); // Align currentPanel.right to otherPanel.right

      ySnapTargets.push(otherPanel.y);                                 // Align currentPanel.top to otherPanel.top
      ySnapTargets.push(otherPanel.y + otherPanelHeightPx);             // Align currentPanel.top to otherPanel.bottom
      ySnapTargets.push(otherPanel.y - currentPanelHeightPx);           // Align currentPanel.bottom to otherPanel.top
      ySnapTargets.push(otherPanel.y + otherPanelHeightPx - currentPanelHeightPx); // Align currentPanel.bottom to otherPanel.bottom
    });

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
    
    finalSnappedX = Math.max(0, Math.min(finalSnappedX, containerWidth - currentPanelWidthPx));
    finalSnappedY = Math.max(0, Math.min(finalSnappedY, containerHeight - currentPanelHeightPx));

    setPanelLayouts(prevLayouts =>
      prevLayouts.map(p => (p.id === id ? { ...p, x: finalSnappedX, y: finalSnappedY } : p))
    );
    setVisualSnapLines({v: [...new Set(newVisualSnapLines.v)], h: [...new Set(newVisualSnapLines.h)]});
  };

  const handleResizeStop = (
    id: string,
    e: MouseEvent | TouchEvent,
    dir: string,
    ref: HTMLElement,
    delta: ResizableDelta,
    position: { x: number; y: number }
  ) => {
    setPanelLayouts(prevLayouts =>
      prevLayouts.map(p =>
        p.id === id
          ? {
              ...p,
              width: ref.offsetWidth,
              height: ref.offsetHeight,
              x: position.x,
              y: position.y,
            }
          : p
      )
    );
  };

  const renderPanelContent = useCallback((panelId: string) => {
    console.log('Rendering content for panel:', panelId);
    switch (panelId) {
      case 'output':
        console.log('Rendering OutputWindow component - START. Checking container visibility.');
        try {
          // First test with just the component
          return (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ backgroundColor: 'red', color: 'white', padding: '10px', fontSize: '16px' }}>
                OUTPUT WINDOW CONTAINER
              </div>
              <div style={{ flex: 1, border: '2px solid green', padding: '5px' }}>
                <OutputWindow />
              </div>
            </div>
          );
        } catch (error) {
          console.error('Error rendering OutputWindow:', error);
          return (
            <div style={{ backgroundColor: 'red', color: 'white', padding: '20px', fontSize: '20px' }}>
              Error rendering OutputWindow component
            </div>
          );
        }
      case 'slides':
        console.log('Rendering SlidesView component.');
        return (
          <SlidesView
            themeColors={{} as any}
            slides={slides || []}
            selectedSlideIds={selectedSlideIds || []}
            onSelectSlide={handleSelectSlide}
            onUpdateSlides={handleUpdateSlides}
          />
        );
      case 'libraryCueList':
        console.log('Rendering LibraryCueListCombinedView component - START.');
        try {
          const emptyItems: PresentationFile[] = [];
          
          return (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ backgroundColor: 'blue', color: 'white', padding: '10px', fontSize: '16px' }}>
                LIBRARIES CUELIST CONTAINER
              </div>
              <div style={{ flex: 1, border: '2px solid green', padding: '5px' }}>
                <LibraryCueListCombinedView 
                  themeColors={themeColors || defaultThemeColors}
                  libraries={libraries}
                  cuelists={cuelists}
                  selectedItemId={null}
                  selectedItemType={null}
                  onSelectItem={(id, type) => console.log('Selected item:', id, type)}
                  itemsForCueList={emptyItems}
                  cueListItemType={null}
                  onAddLibrary={() => console.log('Add library clicked')}
                  onAddCuelist={() => console.log('Add cuelist clicked')}
                  onSelectCue={(cueId) => console.log('Selected cue:', cueId)}
                  selectedCueId={null}
                  onAddItemToSelectedList={() => console.log('Add item to selected list clicked')}
                />
              </div>
            </div>
          );
        } catch (error) {
          console.error('Error rendering LibraryCueListCombinedView:', error);
          return (
            <div style={{ backgroundColor: 'blue', color: 'white', padding: '20px', fontSize: '20px' }}>
              Error rendering LibraryCueListCombinedView component
            </div>
          );
        }
      case 'automation':
        console.log('Rendering automation panel placeholder.');
        return <div>Automation Panel (Coming Soon)</div>;
      default:
        console.log('Unknown panel ID:', panelId);
        return <div>Unknown Panel</div>;
    }
  }, [themeColors, slides, selectedSlideIds, handleSelectSlide, handleUpdateSlides, libraries, cuelists]);

  const widgetWrapperStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: themeColors.widgetBackground,
  };

  const topControlBarStyle: React.CSSProperties = {
    height: '50px',
    backgroundColor: themeColors.controlBarBackground,
    color: themeColors.textColor,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 10px',
    flexShrink: 0, 
  };

  const gridContainerStyle: React.CSSProperties = {
    flexGrow: 1, 
    backgroundColor: themeColors.widgetBackground,
    minHeight: 0, 
    position: 'relative', 
  };

  const rndStyle: React.CSSProperties = { 
    border: `1px solid ${themeColors.borderColor}`,
    borderRadius: '4px',
    backgroundColor: themeColors.panelBackground, 
    display: 'flex', 
    flexDirection: 'column', 
    overflow: 'hidden', 
  };

  const gridItemContentStyle: React.CSSProperties = { 
    width: '100%',
    height: '100%',
    overflow: 'auto', 
    padding: '10px',
    boxSizing: 'border-box', 
    color: themeColors.textColor,
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
  };

  console.log('[PresentationWidget] Current LIBRARIES state being passed to children:', JSON.stringify(libraries, null, 2));

  const snapLineStyle: React.CSSProperties = {
    position: 'absolute',
    backgroundColor: 'rgba(0, 255, 255, 0.7)',
    zIndex: 9998,
    pointerEvents: 'none',
  };

  return (
    <div style={widgetWrapperStyle}>
      <div style={topControlBarStyle}>
        <span>Presentation Widget Controls</span>
      </div>
      <div style={gridContainerStyle} ref={gridContainerRef}>
        {panelLayouts.map(panel => {
          const commonRndProps: Partial<RndProps> = {
            style: { ...rndStyle, zIndex: panel.zIndex },
            position: { x: panel.x, y: panel.y },
            size: { width: panel.width, height: panel.height },
            onDragStart: () => handleDragStart(panel.id),
            onDragStop: (e, d) => handleDragStop(panel.id, e, d),
            onResizeStop: (e, dir, ref, delta, position) => handleResizeStop(panel.id, e, dir, ref, delta, position),
            minWidth: panel.minWidth,
            minHeight: panel.minHeight,
            bounds: 'parent',
          };

          return (
            <Rnd key={panel.id} {...commonRndProps}>
              <div style={gridItemContentStyle}>{renderPanelContent(panel.id)}</div>
            </Rnd>
          );
        })}
      </div>
    </div>
  );
};

export default PresentationWidget;
