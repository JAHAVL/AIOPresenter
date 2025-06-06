import { useState, useRef, useEffect, useCallback } from 'react';
import type { DraggableData, ResizableDelta, Position as RndPosition } from 'react-rnd';

// --- Type Definitions ---
export interface PanelConfig {
  id: string;
  componentKey: string; 
  defaultSize: { width: number | string; height: number | string };
  defaultPosition: { x: number; y: number };
  minWidth?: number;
  minHeight?: number;
  visible?: boolean; 
  isResizable?: boolean;
  isDraggable?: boolean;
}

export interface PanelState extends PanelConfig { 
  x: number;
  y: number;
  width: number | string;
  height: number | string;
  zIndex: number;
  visible: boolean; 
}

interface UsePanelManagerProps {
  initialPanelsConfig: PanelConfig[];
  panelContainerRef?: React.RefObject<HTMLDivElement | null>; // Allow null for initial ref value
  snapThreshold?: number;
  gridSize?: number; 
  storageKey?: string;
}

interface UsePanelManagerReturn {
  panels: PanelState[];
  visualSnapLines: { h: number[]; v: number[] };
  panelContainerRef: React.RefObject<HTMLDivElement | null>; // Adjusted to allow null
  draggingId: string | null;
  handleDragStart: (panelId: string) => void;
  handleDrag: (panelId: string, data: DraggableData) => void | false; // Return type changed
  handleDragStop: (panelId: string, data: DraggableData) => void;
  handleResizeStart: (panelId: string) => void;
  handleResize: (panelId: string, direction: any, elementRef: HTMLElement, delta: ResizableDelta, position: RndPosition) => void;
  handleResizeStop: (panelId: string, event: MouseEvent | TouchEvent, direction: any, elementRef: HTMLElement, delta: ResizableDelta, position: RndPosition) => void;
  bringToFront: (panelId: string) => void;
  togglePanelVisibility: (panelId: string) => void;
  getPanelState: (panelId: string) => PanelState | undefined;
  updatePanelState: (panelId: string, newProps: Partial<PanelState>) => void;
}

const parsePixelValue = (value: string | number): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

export const usePanelManager = (props: UsePanelManagerProps): UsePanelManagerReturn => {
  const {
    initialPanelsConfig,
    snapThreshold = 5, 
    storageKey = 'appPanelsState',
  } = props;

  const [panels, setPanels] = useState<PanelState[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [visualSnapLines, setVisualSnapLines] = useState<{ h: number[]; v: number[] }>({ h: [], v: [] });
  const [nextZ, setNextZ] = useState<number>(1);

  const internalPanelContainerRef = useRef<HTMLDivElement>(null);
  const panelContainerRef = props.panelContainerRef || internalPanelContainerRef;

  useEffect(() => {
    const initializedPanels = initialPanelsConfig.map((config, index) => ({
      ...config, 
      x: config.defaultPosition.x,
      y: config.defaultPosition.y,
      width: config.defaultSize.width,
      height: config.defaultSize.height,
      zIndex: index + 1,
      visible: config.visible !== undefined ? config.visible : true,
    }));
    setPanels(initializedPanels);
    setNextZ(initialPanelsConfig.length + 1);
  }, [initialPanelsConfig, storageKey]);

  const bringToFront = useCallback((panelId: string) => {
    setPanels(prevPanels =>
      prevPanels.map(panel =>
        panel.id === panelId ? { ...panel, zIndex: nextZ } : panel
      )
    );
    setNextZ(prevZ => prevZ + 1);
  }, [nextZ]);

  const handleDragStart = useCallback((panelId: string) => {
    setDraggingId(panelId);
    bringToFront(panelId);
  }, [bringToFront]);

  const handleDrag = useCallback((panelId: string, data: DraggableData): void | false => {
    if (!panelContainerRef.current) return false;

    const { offsetWidth: containerWidth, offsetHeight: containerHeight } = panelContainerRef.current;
    let newLines: { h: number[]; v: number[] } = { h: [], v: [] };

    const currentPanel = panels.find(p => p.id === panelId);
    if (!currentPanel) return false;

    let newX = data.x;
    let newY = data.y;
    const panelWidth = parsePixelValue(currentPanel.width);
    const panelHeight = parsePixelValue(currentPanel.height);

    // Boundary checks
    newX = Math.max(0, Math.min(newX, containerWidth - panelWidth));
    newY = Math.max(0, Math.min(newY, containerHeight - panelHeight));

    // Snapping logic
    const otherPanels = panels.filter(p => p.id !== panelId && p.visible);
    let snapX = false, snapY = false;

    for (const other of otherPanels) {
      const otherX = other.x;
      const otherY = other.y;
      const otherWidth = parsePixelValue(other.width);
      const otherHeight = parsePixelValue(other.height);

      // Check for vertical snap (aligning X coordinates)
      if (Math.abs(newX - otherX) < snapThreshold) { newX = otherX; newLines.v.push(otherX); snapX = true; }
      if (Math.abs(newX - (otherX + otherWidth)) < snapThreshold) { newX = otherX + otherWidth; newLines.v.push(otherX + otherWidth); snapX = true; }
      if (Math.abs((newX + panelWidth) - otherX) < snapThreshold) { newX = otherX - panelWidth; newLines.v.push(otherX); snapX = true; }
      if (Math.abs((newX + panelWidth) - (otherX + otherWidth)) < snapThreshold) { newX = otherX + otherWidth - panelWidth; newLines.v.push(otherX + otherWidth); snapX = true; }

      // Check for horizontal snap (aligning Y coordinates)
      if (Math.abs(newY - otherY) < snapThreshold) { newY = otherY; newLines.h.push(otherY); snapY = true; }
      if (Math.abs(newY - (otherY + otherHeight)) < snapThreshold) { newY = otherY + otherHeight; newLines.h.push(otherY + otherHeight); snapY = true; }
      if (Math.abs((newY + panelHeight) - otherY) < snapThreshold) { newY = otherY - panelHeight; newLines.h.push(otherY); snapY = true; }
      if (Math.abs((newY + panelHeight) - (otherY + otherHeight)) < snapThreshold) { newY = otherY + otherHeight - panelHeight; newLines.h.push(otherY + otherHeight); snapY = true; }
    }

    // Snap to container edges
    if (Math.abs(newX) < snapThreshold) { newX = 0; newLines.v.push(0); snapX = true; }
    if (Math.abs(newX + panelWidth - containerWidth) < snapThreshold) { newX = containerWidth - panelWidth; newLines.v.push(containerWidth); snapX = true; }
    if (Math.abs(newY) < snapThreshold) { newY = 0; newLines.h.push(0); snapY = true; }
    if (Math.abs(newY + panelHeight - containerHeight) < snapThreshold) { newY = containerHeight - panelHeight; newLines.h.push(containerHeight); snapY = true; }

    setVisualSnapLines(snapX || snapY ? newLines : { h: [], v: [] });

    setPanels(prevPanels =>
      prevPanels.map(p =>
        p.id === panelId ? { ...p, x: newX, y: newY } : p
      )
    );
    // Rnd's onDrag type expects void or false. Position is controlled via state.
  }, [panels, panelContainerRef, snapThreshold, bringToFront]);

  const handleDragStop = useCallback((panelId: string, data: DraggableData) => {
    setDraggingId(null);
    setVisualSnapLines({ h: [], v: [] });
  }, []);

  const handleResizeStart = useCallback((panelId: string) => {
    setDraggingId(panelId);
    bringToFront(panelId);
  }, [bringToFront]);
  
  const handleResize = useCallback((panelId: string, direction: any, elementRef: HTMLElement, delta: ResizableDelta, position: RndPosition) => {
  }, []);

  const handleResizeStop = useCallback((
    panelId: string,
    event: MouseEvent | TouchEvent,
    direction: any,
    elementRef: HTMLElement,
    delta: ResizableDelta,
    position: RndPosition
  ) => {
    setDraggingId(null);
    const newWidthPx = parsePixelValue(elementRef.style.width);
    const newHeightPx = parsePixelValue(elementRef.style.height);
    const newX = position.x;
    const newY = position.y;

    if (event.shiftKey) {
      setPanels(prevPanels =>
        prevPanels.map(p =>
          p.id === panelId ? { ...p, width: newWidthPx, height: newHeightPx, x: newX, y: newY } : p
        ).map(p => ({ ...p, width: `${parsePixelValue(p.width)}px`, height: `${parsePixelValue(p.height)}px` })) 
      );
      return;
    }

    setPanels(prevPanels => {
      const workingPanels = prevPanels.map(p => ({
        ...p,
        x: p.x,
        y: p.y,
        width: parsePixelValue(p.width),
        height: parsePixelValue(p.height),
        minWidth: p.minWidth || 0,
        minHeight: p.minHeight || 0,
      }));

      const activePanelIndex = workingPanels.findIndex(p => p.id === panelId);
      if (activePanelIndex === -1) return prevPanels.map(p => ({ ...p, width: `${parsePixelValue(p.width)}px`, height: `${parsePixelValue(p.height)}px` }));

      let activePanelState = {
        ...workingPanels[activePanelIndex],
        width: newWidthPx,
        height: newHeightPx,
        x: newX,
        y: newY,
      };

      for (let i = 0; i < workingPanels.length; i++) {
        if (i === activePanelIndex || !workingPanels[i].visible) continue;
        const otherPanel = workingPanels[i];

        let apRect = { x: activePanelState.x, y: activePanelState.y, width: activePanelState.width, height: activePanelState.height };
        const opRect = { x: otherPanel.x, y: otherPanel.y, width: otherPanel.width, height: otherPanel.height };
        const opMinWidth = otherPanel.minWidth || 0;
        const opMinHeight = otherPanel.minHeight || 0;

        const overlaps = !(apRect.x + apRect.width <= opRect.x || apRect.x >= opRect.x + opRect.width || apRect.y + apRect.height <= opRect.y || apRect.y >= opRect.y + opRect.height);

        if (overlaps) {
          if (delta.width > 0 && direction.toLowerCase().includes('right') && apRect.x < opRect.x && apRect.x + apRect.width > opRect.x) {
            let overlap = (apRect.x + apRect.width) - opRect.x;
            let newOpWidth = opRect.width - overlap;
            if (newOpWidth < opMinWidth) {
              const deficit = opMinWidth - newOpWidth;
              newOpWidth = opMinWidth;
              activePanelState.width -= deficit;
              apRect.width = activePanelState.width;
            }
            otherPanel.x += overlap - (opMinWidth - newOpWidth > 0 ? opMinWidth - newOpWidth : 0);
            otherPanel.width = newOpWidth;
          }
          else if (delta.width > 0 && direction.toLowerCase().includes('left') && apRect.x < opRect.x + opRect.width && apRect.x + apRect.width > opRect.x + opRect.width) {
            let overlap = (opRect.x + opRect.width) - apRect.x;
            let newOpWidth = opRect.width - overlap;
            if (newOpWidth < opMinWidth) {
              const deficit = opMinWidth - newOpWidth;
              newOpWidth = opMinWidth;
              activePanelState.x += deficit;
              activePanelState.width -= deficit;
              apRect.x = activePanelState.x; apRect.width = activePanelState.width;
            }
            otherPanel.width = newOpWidth;
          }

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
      activePanelState.width = Math.max(activePanelState.width, activePanelState.minWidth || 0);
      activePanelState.height = Math.max(activePanelState.height, activePanelState.minHeight || 0);
      workingPanels[activePanelIndex] = activePanelState;

      return workingPanels.map(p => ({ ...p, width: `${p.width}px`, height: `${p.height}px` }));
    });
  }, []);

  const togglePanelVisibility = useCallback((panelId: string) => {
    setPanels(prevPanels =>
      prevPanels.map(p => (p.id === panelId ? { ...p, visible: !p.visible } : p))
    );
  }, []);

  const getPanelState = useCallback((panelId: string): PanelState | undefined => {
    return panels.find(p => p.id === panelId);
  }, [panels]);

  const updatePanelState = useCallback((panelId: string, newProps: Partial<PanelState>) => {
    setPanels(prev => prev.map(p => p.id === panelId ? {...p, ...newProps} : p));
  }, []);

  return {
    panels,
    visualSnapLines,
    panelContainerRef,
    draggingId,
    handleDragStart,
    handleDrag,
    handleDragStop,
    handleResizeStart,
    handleResize,
    handleResizeStop,
    bringToFront,
    togglePanelVisibility,
    getPanelState,
    updatePanelState,
  };
};
