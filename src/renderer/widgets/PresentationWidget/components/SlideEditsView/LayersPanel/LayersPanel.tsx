import React, { useState, useEffect, useRef } from 'react';
import { ReactSortable } from 'react-sortablejs';
import type { SlideElement, TextSlideElement, ImageSlideElement, VideoSlideElement, ShapeSlideElement } from '@projectTypes/presentationSharedTypes';
import type { ThemeColors } from '@theme/theme';

interface LayersPanelProps {
  themeColors: ThemeColors;
  elements: SlideElement[] | undefined;
  selectedElementId: string | null;
  onElementSelect: (elementId: string) => void;
  onUpdateElementName: (elementId: string, newName: string) => void;
  onLayerOrderChange: (reorderedElements: SlideElement[]) => void;
}

const LayersPanel: React.FC<LayersPanelProps> = ({ themeColors, elements, selectedElementId, onElementSelect, onUpdateElementName, onLayerOrderChange }) => {
  const [hoveredLayerId, setHoveredLayerId] = useState<string | null>(null);
  // Log elements prop when it changes
  useEffect(() => {
    console.log('[LayersPanel] elements prop updated:', JSON.parse(JSON.stringify(elements || [])));
  }, [elements]);

  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');

  const layersSectionStyle: React.CSSProperties = {
    backgroundColor: themeColors.panelBackground,
    borderTop: `1px solid ${themeColors.panelBorder}`,
    width: '100%',
    height: '40%', // Fixed height of 40% of the parent container
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden', // Hide overflow from the container, list inside will scroll
  };

  // Derive the list for ReactSortable from props, sorted by zIndex
  const sortedElementsForDisplay = React.useMemo(() => {
    if (elements && elements.length > 0) {
      const elementsWithZIndex = elements.map((el) => ({
        ...el,
        zIndex: typeof el.zIndex === 'number' ? el.zIndex : 0,
      }));
      const sorted = elementsWithZIndex.sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));
      return sorted;
    }
    return [];
  }, [elements]);

  const getElementDisplayName = (element: SlideElement): string => {
    // Safety check
    if (!element) return 'Unknown Element';
    
    if (element.name) return element.name;
    
    // Safe access to id for truncation
    const getId = (el: SlideElement): string => {
      return typeof el.id === 'string' && el.id ? el.id.substring(0, 6) : 'unknown';
    };
    
    // Default naming based on element type
    switch (element.type) {
      case 'text': {
        const textElement = element as TextSlideElement;
        return textElement.content?.substring(0, 20) || 'Text Element';
      }
      case 'image':
        return 'Image Element';
      case 'shape': {
        const shapeElement = element as ShapeSlideElement;
        return `Shape (${shapeElement.shapeType || 'Generic'})`;
      }
      case 'video':
        return 'Video Element';
      default:
        return `Element (${getId(element)})`;
    }
  };
  
  // Handle reorder via ReactSortable
  const handleReorder = (newOrderFromSortable: SlideElement[]) => {
    console.log('[LayersPanel] handleReorder called. newOrderFromSortable:', JSON.parse(JSON.stringify(newOrderFromSortable)));

    // newOrderFromSortable is the array of elements in their new visual order,
    // but their zIndex properties might still be the old ones from before the drag.
    // We need to assign new zIndex values based on this new visual order.
    const reorderedWithCorrectedZIndexes = newOrderFromSortable.map((element, index) => ({
      ...element,
      zIndex: newOrderFromSortable.length - 1 - index, // Higher in list = higher zIndex
    }));
    console.log('[LayersPanel] reorderedWithCorrectedZIndexes to be sent to parent:', JSON.parse(JSON.stringify(reorderedWithCorrectedZIndexes)));

    // Pass this fully updated list (new order, new zIndexes) to the parent.
    // The parent is responsible for updating its state, which will then flow
    // back down as the 'elements' prop, causing 'sortedElementsForDisplay' to recompute.
    onLayerOrderChange(reorderedWithCorrectedZIndexes);
  };

  const layerItemStyleBase: React.CSSProperties = {
    paddingTop: '5px',
    paddingBottom: '5px',
    paddingLeft: '8px',
    paddingRight: '8px',
    fontSize: '13px',
    cursor: 'grab', // Make the whole item look draggable
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: '3px', // Slightly rounded corners for items
    marginBottom: '2px', // Space between items
    border: '1px solid transparent', // Base border for layout consistency. Individual sides can be overridden.
    boxSizing: 'border-box', // Ensure padding and border are included in the element's total width and height
    transition: 'background-color 0.15s ease-in-out, border-left-color 0.15s ease-in-out, border-radius 0.15s ease-in-out, color 0.15s ease-in-out, padding 0.15s ease-in-out',
  };

  const layerListContainerStyle: React.CSSProperties = {
    flex: '1 1 auto',
    overflowY: 'auto',
    padding: '4px', // Inner padding for the list items
    margin: '8px', // Margin around the container
    borderRadius: '4px',
    border: `1px solid ${themeColors.panelBorder || '#DDDDDD'}`, // Border for the container
    backgroundColor: themeColors.secondaryPanelBackground || themeColors.panelBackground, // Slightly different background for distinction
  };

  return (
    <div style={layersSectionStyle}>
      <div style={{ padding: '10px 10px 5px 10px', borderBottom: `1px solid ${themeColors.panelBorder}` }}>
        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: themeColors.text }}>
          Layers
        </h4>
      </div>
      
      {sortedElementsForDisplay && sortedElementsForDisplay.length > 0 ? (
        <div style={layerListContainerStyle}>
          <ReactSortable
            list={sortedElementsForDisplay} // Use the memoized, prop-derived list
            setList={handleReorder} 
            animation={150}
            // Removed handle=".layer-item-handle" to make the whole item draggable
            ghostClass="sortable-ghost" 
            chosenClass="sortable-chosen" 
            dragClass="sortable-drag" 
          >
            {sortedElementsForDisplay.map((element) => {
              const isSelected = element.id === selectedElementId;
              const accentC = themeColors.accent || '#007bff';

              const itemStyle: React.CSSProperties = {
                ...layerItemStyleBase,
                backgroundColor: isSelected
                  ? (themeColors.slideListItemHoverBackground || accentC) 
                  : (hoveredLayerId === element.id) 
                    ? (themeColors.slideListItemHoverBackground || '#2A2A2A') 
                    : 'transparent',
                color: isSelected
                  ? (themeColors.buttonPrimaryText || themeColors.buttonPrimaryText || '#ffffff')
                  : themeColors.text,
                fontWeight: isSelected ? 'bold' : 'normal',
                
                ...(isSelected && {
                  borderLeft: `3px solid ${accentC}`,
                  borderRadius: '4px',
                  paddingTop: '7px',
                  paddingRight: '7px',
                  paddingBottom: '7px',
                  paddingLeft: '10px',
                }),
              };

              return (
                <div
                  id={`layer-item-${element.id}`}
                  key={element.id}
                  className="layer-item"
                  style={itemStyle}
                  onClick={() => onElementSelect(element.id)}
                  onMouseEnter={() => setHoveredLayerId(element.id)}
                  onMouseLeave={() => setHoveredLayerId(null)}
                >
                  {/* Removed layer-item-handle span */}
                  {editingElementId === element.id ? (
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onBlur={() => {
                        if (editingElementId && editText.trim() !== '') {
                          onUpdateElementName(editingElementId, editText.trim());
                        }
                        setEditingElementId(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (editingElementId && editText.trim() !== '') {
                            onUpdateElementName(editingElementId, editText.trim());
                          }
                          setEditingElementId(null);
                          e.preventDefault();
                        } else if (e.key === 'Escape') {
                          setEditingElementId(null);
                          e.preventDefault();
                        }
                      }}
                      autoFocus
                      style={{
                        width: 'calc(100% - 40px)',
                        padding: '2px 4px',
                        marginRight: '5px',
                        border: `1px solid ${themeColors.accent || '#0078D4'}`,
                        borderRadius: '3px',
                        fontSize: '13px',
                        backgroundColor: themeColors.secondaryPanelBackground || themeColors.panelBackground,
                        color: themeColors.text || '#333',
                        outline: 'none',
                      }}
                    />
                  ) : (
                    <span
                      onDoubleClick={() => {
                        setEditingElementId(element.id);
                        setEditText(element.name || getElementDisplayName(element));
                      }}
                      style={{ flexGrow: 1, cursor: 'text', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {getElementDisplayName(element)}
                    </span>
                  )}
                  <span style={{ fontSize: '11px', color: themeColors.mutedText || themeColors.text || '#999', marginLeft: 'auto', paddingLeft: '5px' }}>z: {element.zIndex}</span>
                </div>
              );
            })}
          </ReactSortable>
        </div>
      ) : (
        <div style={layerListContainerStyle}> {/* Maintain container style for empty state */}
          <p style={{ color: themeColors.mutedText || themeColors.text || '#999', fontSize: '13px', textAlign: 'center', marginTop: '10px' }}>
            No layers on this slide.
          </p>
        </div>
      )}
    </div>
  );
};

export default LayersPanel;
