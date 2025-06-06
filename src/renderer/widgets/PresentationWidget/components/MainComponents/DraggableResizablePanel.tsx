import React, { ReactNode } from 'react';
import { Rnd, Props as RndProps, DraggableData, ResizableDelta, Position } from 'react-rnd';
import type { DraggableEvent } from 'react-draggable';
import type { ThemeColors } from '../../theme/theme';
import type { PanelState as HookPanelState } from '../../hooks/usePanelManager'; // Renamed to avoid conflict

interface DraggableResizablePanelProps {
  panel: HookPanelState;
  themeColors: ThemeColors;
  children?: ReactNode;
  onDragStart?: (e: DraggableEvent, data: DraggableData, id: string) => void;
  onDrag?: (e: DraggableEvent, data: DraggableData, id: string) => void;
  onDragStop?: (e: DraggableEvent, data: DraggableData, id: string) => void;
  onResizeStart?: (e: React.MouseEvent | React.TouchEvent, dir: any, ref: HTMLElement, id: string) => void;
  onResize?: (e: MouseEvent | TouchEvent, dir: any, ref: HTMLElement, delta: ResizableDelta, position: Position, id: string) => void;
  onResizeStop?: (e: MouseEvent | TouchEvent, dir: any, ref: HTMLElement, delta: ResizableDelta, position: Position, id: string) => void;
}

const DraggableResizablePanel: React.FC<DraggableResizablePanelProps> = ({
  panel,
  themeColors,
  children,
  onDragStart,
  onDrag,
  onDragStop,
  onResizeStart,
  onResize,
  onResizeStop,
}) => {
  // Combined style for the Rnd component itself
  const rndCombinedStyle: React.CSSProperties = {
    // Original styles from rndWrapperStyle
    // border: `1px solid ${themeColors.panelBorder || '#444'}`, // Overridden by test style
    // backgroundColor: panel.componentKey === 'output' ? 'transparent' : (themeColors.panelBackground || '#2a2a2a'), // Overridden by test style
    boxShadow: `0 2px 10px ${themeColors.shadowColor || 'rgba(0,0,0,0.5)'}`,
    borderRadius: '4px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden', // Important for containing content

    // Test styles merged in for visual confirmation
    backgroundColor: 'fuchsia',
    border: '3px solid limegreen',
    color: 'white', // For test text visibility
    alignItems: 'center', // For test text centering
    justifyContent: 'center', // For test text centering
    fontSize: '10px', // Smaller font for test text
    padding: '5px',   // Padding for test text
    boxSizing: 'border-box',

    // Z-index for stacking
    zIndex: panel.zIndex,
  };

  // Style for the content div inside Rnd
  const contentStyle: React.CSSProperties = {
    flexGrow: 1,
    padding: '0px',
    overflow: 'auto',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center', // Center test text
    justifyContent: 'center', // Center test text
    color: 'white', // Explicitly white for test text against fuchsia
    boxSizing: 'border-box',
  };

  if (!panel.visible) {
    return null;
  }

  // Use panel's current x, y, width, height. Fallback to defaults if they are not numbers.
  const getNumericValue = (value: string | number | undefined, defaultValue: number): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      if (!isNaN(parsed)) return parsed;
    }
    return defaultValue;
  };

  const x = getNumericValue(panel.x, panel.defaultPosition?.x ?? 0);
  const y = getNumericValue(panel.y, panel.defaultPosition?.y ?? 0);
  
  // First, determine the numeric default size, ensuring the fallback is a number.
  const defaultWidth = getNumericValue(panel.defaultSize?.width, 200);
  const defaultHeight = getNumericValue(panel.defaultSize?.height, 150);

  // Then, use these numeric defaults when getting the panel's current size.
  const width = getNumericValue(panel.width, defaultWidth);
  const height = getNumericValue(panel.height, defaultHeight);

  return (
    <Rnd
      default={{
        x: x,
        y: y,
        width: width,
        height: height,
      }}
      position={{ x: x, y: y }}
      size={{ width: width, height: height }}
      style={rndCombinedStyle} // Apply combined styles with test overrides and zIndex
      minWidth={panel.minWidth ?? 100}
      minHeight={panel.minHeight ?? 50}
      onDragStart={(e, d) => onDragStart && onDragStart(e, d, panel.id)}
      onDrag={(e, d) => onDrag && onDrag(e, d, panel.id)}
      onDragStop={(e, d) => onDragStop && onDragStop(e, d, panel.id)}
      onResizeStart={(e, dir, ref) => onResizeStart && onResizeStart(e, dir, ref, panel.id)}
      onResize={(e, dir, ref, delta, pos) => onResize && onResize(e, dir, ref, delta, pos, panel.id)}
      onResizeStop={(e, dir, ref, delta, pos) => onResizeStop && onResizeStop(e, dir, ref, delta, pos, panel.id)}
      bounds="parent"
      enableResizing={panel.isResizable !== false}
      disableDragging={panel.isDraggable === false}
    >
      <div style={contentStyle}>
        {children || (
          <>
            <p>Panel ID: {panel.id}</p>
            <p>CmpKey: {panel.componentKey}</p>
            <p style={{ fontWeight: 'bold' }}>HMR TEST SUCCESSFUL!</p>
          </>
        )}
      </div>
    </Rnd>
  );
};

export default DraggableResizablePanel;
