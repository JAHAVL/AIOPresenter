import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { Rnd, Props as RndProps, DraggableData, ResizableDelta } from 'react-rnd';
import type { DraggableEvent } from 'react-draggable';

// Import child components
import OutputWindow from './components/OutputWindow/OutputWindow';
import SlidesView from './components/SlidesView/SlidesView';
import LibraryView from './components/LibraryView/LibraryView';
import CueListView from './components/CueListView/CueListView';

// --- Embedded LibraryCueListCombinedView Component ---
const LibraryCueListCombinedView: React.FC = () => {
  const wrapperStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  };

  const viewStyle: React.CSSProperties = {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '50%',
    overflow: 'auto',
    padding: '5px',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
  };

  return (
    <div style={wrapperStyle}>
      <div style={{ ...viewStyle, borderBottom: '1px solid #444' }}>
        <LibraryView />
      </div>
      <div style={viewStyle}>
        <CueListView />
      </div>
    </div>
  );
};
// --- End of Embedded LibraryCueListCombinedView Component ---

interface PanelState {
  id: string;
  x: number;
  y: number;
  width: string | number; // Can be % or px
  height: string | number; // Can be % or px
  zIndex: number;
  component: ReactNode;
  minWidth?: number;
  minHeight?: number;
}

const initialPanels: PanelState[] = [
  { id: 'output', x: 0, y: 0, width: '50%', height: '50%', zIndex: 1, component: <OutputWindow />, minWidth: 200, minHeight: 150 },
  { id: 'slides', x: 0, y: 0, width: '50%', height: '50%', zIndex: 2, component: <SlidesView />, minWidth: 200, minHeight: 150 },
  { id: 'libraryCueList', x: 0, y: 0, width: '50%', height: '50%', zIndex: 3, component: <LibraryCueListCombinedView />, minWidth: 200, minHeight: 150 },
  { id: 'automation', x: 0, y: 0, width: '50%', height: '50%', zIndex: 4, component: <div>Automation Controls</div>, minWidth: 200, minHeight: 150 },
];

const PresentationWidget: React.FC = () => {
  const [panels, setPanels] = useState<PanelState[]>(initialPanels);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [visualSnapLines, setVisualSnapLines] = useState<{h: number[], v: number[]}>({ h: [], v: [] });
  const [nextZ, setNextZ] = useState<number>(initialPanels.length + 1);

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
      setPanels(prevPanels => prevPanels.map(panel => {
        let newX = panel.x;
        let newY = panel.y;
        const defaultWidth = offsetWidth / 2;
        const defaultHeight = offsetHeight / 2;

        if (panel.id === 'output') { newX = 0; newY = 0; }
        else if (panel.id === 'slides') { newX = defaultWidth; newY = 0; }
        else if (panel.id === 'libraryCueList') { newX = 0; newY = defaultHeight; }
        else if (panel.id === 'automation') { newX = defaultWidth; newY = defaultHeight; }
        
        return { ...panel, x: newX, y: newY, width: defaultWidth, height: defaultHeight };
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridContainerRef.current]); // Re-run if gridContainerRef becomes available, not just on mount

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
    setPanels(prevPanels =>
      prevPanels.map(panel =>
        panel.id === id
          ? {
              ...panel,
              width: refToElement.style.width, 
              height: refToElement.style.height, 
              x: position.x,
              y: position.y,
            }
          : panel
      )
    );
  };

  const widgetWrapperStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#1e1e1e',
  };

  const topControlBarStyle: React.CSSProperties = {
    height: '50px',
    backgroundColor: '#333333',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 10px',
    flexShrink: 0, 
  };

  const gridContainerStyle: React.CSSProperties = {
    flexGrow: 1, 
    backgroundColor: '#2a2a2a',
    minHeight: 0, 
    position: 'relative', 
  };

  const rndItemStyleDefault: React.CSSProperties = { 
    border: '1px solid #555555',
    borderRadius: '4px',
    backgroundColor: '#383838', 
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
    color: 'white',
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
  };

  return (
    <div style={widgetWrapperStyle}>
      <div style={topControlBarStyle}>
        Presentation Controls (Next, Prev, etc.)
      </div>
      <div ref={gridContainerRef} style={gridContainerStyle}>
        {panels.map(panel => (
          <Rnd
            key={panel.id}
            style={{...rndItemStyleDefault, zIndex: panel.zIndex}} // Apply zIndex here
            size={{ width: panel.width, height: panel.height }}
            position={{ x: panel.x, y: panel.y }} // Controlled position
            minWidth={panel.minWidth}
            minHeight={panel.minHeight}
            bounds="parent"
            onDragStart={() => handleDragStart(panel.id)}
            onDrag={(e, data) => handleDrag(panel.id, e, data)}
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
              {panel.component}
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
    </div>
  );
};

export default PresentationWidget;
