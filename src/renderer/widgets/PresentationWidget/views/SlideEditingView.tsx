import React, { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import SlideListItem from '../components/SlideEditsView/SlideListItem/SlideListItem';
import SlideEditorToolbar from '../components/SlideEditsView/SlideEditorToolBar/SlideEditorToolbar';
import SlidePreview from '../components/SlideEditsView/SlidePreview/SlidePreview';
import PropertiesPanel from '../components/SlideEditsView/PropertiesPanel/PropertiesPanel';
import LayersPanel from '../components/SlideEditsView/LayersPanel/LayersPanel';
import type { ThemeColors } from '../theme.ts';
import type { Slide, SlideElement, TextSlideElement, ImageSlideElement, VideoSlideElement, ShapeSlideElement } from '@presentationSharedTypes';
import type { ShapeType } from '@presentationSharedTypes'; // ShapeType is a type, not a value

// Uncomment react-icons import after reinstallation
// import { FaBold, FaItalic, FaUnderline, FaAlignLeft, FaAlignCenter, FaAlignRight, FaAlignJustify } from 'react-icons/fa';

interface SlideEditingViewProps {
  themeColors: ThemeColors;
  slides: Slide[]; // Slides from the currently selected cue
  selectedSlideIds: string[]; // Changed to array for multi-select
  onSelectSlide: (slideId: string, event?: React.MouseEvent) => void; // Pass event for modifier keys
  onUpdateSlides: (updatedSlides: Slide[]) => void; // Prop to notify parent of changes
  // Add other necessary props like onUpdateSlideContent, etc., later
}

const SlideEditingView: React.FC<SlideEditingViewProps> = ({
  themeColors,
  slides,
  selectedSlideIds, // Changed
  onSelectSlide, // Will be modified or used by a new handler
  onUpdateSlides,
}) => {
  console.log('SlideEditingView component mounted.');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [lastSelectedSlideId, setLastSelectedSlideId] = useState<string | null>(null);
  // activeSlideId is the first selected slide, or null if no slides are selected.
  // This is useful for operations that still act on a single primary slide (e.g., adding elements).
  const activeSlideId = selectedSlideIds.length > 0 ? selectedSlideIds[0] : null;
  const viewWrapperRef = useRef<HTMLDivElement>(null);
  const borderRadiusValue = '8px'; // Define a common border radius

  const activeSlide = slides.find((s: Slide) => s.id === activeSlideId);
  const selectedElement = activeSlide?.elements.find((el: SlideElement) => el.id === selectedElementId);

  const viewWrapperStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: themeColors.widgetBackground,
    color: themeColors.textColor,
    overflow: 'hidden',
    boxSizing: 'border-box',
    padding: '10px', // Add padding around the two main panels
    gap: '10px', // Add gap between the two main panels
  };

  const slideListPanelStyle: React.CSSProperties = {
    width: '250px', // Fixed width for the slide list
    minWidth: '200px', // Minimum width for responsiveness
    height: '100%',
    backgroundColor: themeColors.panelBackground,
    padding: '10px',
    overflowY: 'auto',
    boxSizing: 'border-box',
    flexShrink: 0,
    borderRadius: borderRadiusValue,
    display: 'flex',
    flexDirection: 'column',
  };

  const editorPanelStyle: React.CSSProperties = { 
    flexGrow: 1,
    height: '100%',
    backgroundColor: themeColors.panelBackground,
    // padding: '20px', // Padding will be handled by inner components or toolbar/slide area
    overflow: 'hidden', // Prevent internal scroll, manage scrolling within slide preview if needed
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column', // Toolbar on top, slide area below
    borderRadius: borderRadiusValue,
  };

  const iconStyle: React.CSSProperties = {
    cursor: 'pointer',
    fontSize: '18px',
    color: themeColors.textColor,
  };

  const slidePreviewAreaStyle: React.CSSProperties = {
    flexGrow: 1,
    padding: '20px',
    overflowY: 'auto', // Allow scrolling if slide content itself is larger than preview area
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
  };

  const handleSlideItemClick = (slideId: string, event: React.MouseEvent) => {
    // This function now directly calls the onSelectSlide prop passed from the parent.
    // The parent (PresentationWidget) will contain the actual logic for updating selectedSlideIds.
    onSelectSlide(slideId, event);
    // We still manage lastSelectedSlideId locally for Shift-click context if the parent doesn't handle it.
    // However, for a cleaner design, the parent should ideally manage the anchor for Shift-click too,
    // or this component needs to be aware of how the parent implements Shift-click to set the anchor correctly.
    // For now, we'll set it on any click that isn't a shift-click without a prior anchor.
    if (!(event.shiftKey && !lastSelectedSlideId)) {
        setLastSelectedSlideId(slideId);
    }
    setSelectedElementId(null); // Deselect elements when slide selection changes
  };

  const handleAddTextElement = useCallback(() => {
    if (!activeSlideId) return;
    const newTextElement: TextSlideElement = {
      id: uuidv4(),
      type: 'text',
      text: 'New Text',
      fontFamily: 'Arial',
      fontSize: 24,
      color: themeColors.textColor || '#000000',
      x: 100, y: 100,
      width: 200, height: 50,
      rotation: 0,
      opacity: 1,
    };

    const updatedSlides = slides.map(slide => {
      if (slide.id === activeSlideId) {
        return { ...slide, elements: [...slide.elements, newTextElement] };
      }
      return slide;
    });

    onUpdateSlides(updatedSlides);
    setSelectedElementId(newTextElement.id);
  }, [activeSlideId, slides, onUpdateSlides]);

  const handleAddImageElement = useCallback((dataUrl?: string) => {
    if (!activeSlideId || !dataUrl) return;
    const newImageElement: ImageSlideElement = {
      id: uuidv4(),
      type: 'image',
      src: '', // Placeholder, user will need to set this
      fit: 'contain',
      x: 150, y: 150,
      width: 300, height: 200,
      rotation: 0,
      opacity: 1,
    };

    const updatedSlides = slides.map(slide => {
      if (slide.id === activeSlideId) {
        return { ...slide, elements: [...slide.elements, newImageElement] };
      }
      return slide;
    });

    onUpdateSlides(updatedSlides);
    setSelectedElementId(newImageElement.id);
  }, [activeSlideId, slides, onUpdateSlides]);

  const handleAddShapeElement = useCallback((shapeType: ShapeType) => {
    if (!activeSlideId) return;
    const newShapeElement: ShapeSlideElement = {
      id: uuidv4(),
      type: 'shape',
      shapeType: shapeType,
      fillColor: themeColors.accentColor || '#007bff',
      strokeColor: '#ffffff',
      strokeWidth: 2,
      x: 200, y: 200,
      width: 100, height: 100, // Generic default size
      rotation: 0,
      opacity: 1,
    };

    const updatedSlides = slides.map(slide => {
      if (slide.id === activeSlideId) {
        return { ...slide, elements: [...slide.elements, newShapeElement] };
      }
      return slide;
    });

    onUpdateSlides(updatedSlides);
    setSelectedElementId(newShapeElement.id);
  }, [activeSlideId, slides, onUpdateSlides]);

  const handleAddVideoElement = () => {
    if (!activeSlideId) {
      console.warn('[SlideEditingView] Cannot add video: No slide selected.');
      return;
    }
    // Placeholder for video element logic - similar to image/shape
    const newVideoElement: VideoSlideElement = {
      id: uuidv4(), type: 'video', name: 'Video Element',
      x: 10, y: 10, width: 320, height: 180,
      rotation: 0, opacity: 1, zIndex: 1,
      src: 'public/videos/placeholder-video.mp4', // Placeholder
      autoplay: false, loop: false, controls: true,
    };
    const updatedSlides = slides.map((slide: Slide) => {
      if (slide.id === activeSlideId) {
        return { ...slide, elements: [...slide.elements, newVideoElement] };
      }
      return slide;
    });
    onUpdateSlides(updatedSlides);
    console.log('[SlideEditingView] Adding video element - TBD');
  };

  const handleSelectElement = (elementId: string | null) => {
    setSelectedElementId(elementId);
  };

  const handleUpdateElement = useCallback((updatedElement: Partial<SlideElement>) => {
    if (!activeSlideId || !selectedElementId) return;

    const updatedSlides = slides.map((slide) => {
      if (slide.id === activeSlideId) {
        return {
          ...slide,
          elements: slide.elements.map((element: SlideElement): SlideElement => {
            if (element.id !== selectedElementId) {
              return element;
            }
            // updatedElement is Partial<SlideElement>
            // We need to ensure the constructed element is of the correct specific type
            // and that its 'type' property is a specific literal, not a union.
            let newElement: SlideElement;
            switch (element.type) {
              case 'text':
                newElement = { 
                  ...element, 
                  ...(updatedElement as Partial<TextSlideElement>), 
                  type: 'text' 
                };
                break;
              case 'image':
                newElement = { 
                  ...element, 
                  ...(updatedElement as Partial<ImageSlideElement>), 
                  type: 'image' 
                };
                break;
              case 'shape':
                newElement = { 
                  ...element, 
                  ...(updatedElement as Partial<ShapeSlideElement>), 
                  type: 'shape' 
                };
                break;
              case 'video':
                newElement = { 
                  ...element, 
                  ...(updatedElement as Partial<VideoSlideElement>), 
                  type: 'video' 
                };
                break;
              default:
                // This ensures exhaustiveness. If SlideElement gets new types, TypeScript will error here.
                const _exhaustiveCheck: never = element;
                // Fallback for safety, though _exhaustiveCheck should prevent reaching here with known types.
                newElement = element; 
                break;
            }
            return newElement;
          }),
        };
      }
      return slide;
    });

    onUpdateSlides(updatedSlides);
  }, [activeSlideId, selectedElementId, slides, onUpdateSlides]);

  const handleDeleteSelectedElement = useCallback(() => {
    if (!activeSlideId || !selectedElementId) return; // Uses activeSlideId correctly

    const newSlides = slides.map(slide => {
      if (slide.id === activeSlideId) {
        return {
          ...slide,
          elements: slide.elements.filter(el => el.id !== selectedElementId),
        };
      }
      return slide;
    });
    onUpdateSlides(newSlides);
    setSelectedElementId(null); // Deselect after deleting
  }, [activeSlideId, selectedElementId, slides, onUpdateSlides]);

  const handleUpdateElementName = useCallback((elementId: string, newName: string) => {
    if (!activeSlideId) return; // Should not happen if an element is selected

    const updatedSlides = slides.map(slide => {
      if (slide.id === activeSlideId) {
        const updatedElements = slide.elements.map(el =>
          el.id === elementId ? { ...el, name: newName } : el
        );
        return { ...slide, elements: updatedElements };
      }
      return slide;
    });
    onUpdateSlides(updatedSlides);
  }, [activeSlideId, slides, onUpdateSlides]);

  const handleLayerOrderChange = useCallback((reorderedElementsByPanel: SlideElement[]) => {
    // This uses activeSlideId correctly from the definition at the top of the component
    if (!activeSlideId) {
      console.warn('[SlideEditingView] Cannot update layer order: No slide selected.');
      return;
    }
    console.log('[SlideEditingView] handleLayerOrderChange - reorderedElementsByPanel count:', reorderedElementsByPanel.length, reorderedElementsByPanel.length > 0 ? `First zIndex: ${reorderedElementsByPanel[0].zIndex}` : 'empty');

    const updatedElementsWithNewZIndex = reorderedElementsByPanel.map((element, index) => ({
      ...element,
      zIndex: reorderedElementsByPanel.length - 1 - index, // Higher in list = higher zIndex
    }));
    console.log('[SlideEditingView] handleLayerOrderChange - updatedElementsWithNewZIndex count:', updatedElementsWithNewZIndex.length, updatedElementsWithNewZIndex.length > 0 ? `First zIndex: ${updatedElementsWithNewZIndex[0].zIndex}` : 'empty');

    const newSlides = slides.map(slide => {
      if (slide.id === activeSlideId) {
        return {
          ...slide,
          elements: updatedElementsWithNewZIndex,
        };
      }
      return slide;
    });

    onUpdateSlides(newSlides);
    console.log('[SlideEditingView] Layer order updated with new zIndexes:', updatedElementsWithNewZIndex);
  }, [activeSlideId, slides, onUpdateSlides]);

  const toolsAndLayersPanelStyle: React.CSSProperties = {
    width: '300px',
    minWidth: '250px',
    height: '100%',
    backgroundColor: themeColors.panelBackground,
    padding: '10px',
    // overflowY: 'auto', // Will be handled by inner sections if needed
    boxSizing: 'border-box',
    flexShrink: 0,
    borderRadius: borderRadiusValue,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px', // Add a gap between Properties and Layers sections
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedElementId) {
        // Check if the event target is not an input, textarea, or contentEditable to avoid interfering with text editing
        const target = event.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !target.isContentEditable) {
          event.preventDefault(); // Prevent browser default behavior (e.g., navigating back)
          handleDeleteSelectedElement();
        }
      }
    };

    const wrapper = viewWrapperRef.current;
    // Add event listener to the wrapper div
    wrapper?.addEventListener('keydown', handleKeyDown);
    return () => {
      wrapper?.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleDeleteSelectedElement, selectedElementId]);

  return (
    <div ref={viewWrapperRef} style={{...viewWrapperStyle, outline: 'none'}} tabIndex={-1} data-component-name="SlideEditingView">
      <div style={slideListPanelStyle}>
        <h3 style={{ marginTop: 0, marginBottom: '15px', borderBottom: `1px solid ${themeColors.panelBorder}`, paddingBottom: '10px' }}>Slides</h3>
        {slides.map((slide) => (
          <SlideListItem
            key={slide.id}
            slide={slide}
            isSelected={selectedSlideIds.includes(slide.id)}
            themeColors={themeColors}
            onClick={(event) => handleSlideItemClick(slide.id, event)}
          />
        ))}
        {slides.length === 0 && <p>No slides in this cue.</p>}
      </div>

      {/* Middle Panel: Editor with Toolbar */}
      <div style={editorPanelStyle}>
        <SlideEditorToolbar
          onAddTextElement={handleAddTextElement}
          onAddImageElement={handleAddImageElement}
          onAddShapeElement={() => handleAddShapeElement('rectangle')}
          onAddVideoElement={handleAddVideoElement}
          themeColors={themeColors}
        />
        <div style={slidePreviewAreaStyle}>
          <SlidePreview 
            currentSlide={activeSlide} 
            selectedElementId={selectedElementId} 
            themeColors={themeColors} 
            onUpdateElement={(slideIdFromPreview, elementIdFromPreview, updatesFromPreview) => {
              if (activeSlideId === slideIdFromPreview && selectedElementId === elementIdFromPreview) {
                handleUpdateElement(updatesFromPreview);
              } else {
                console.warn('[SlideEditingView] SlidePreview attempted to update an element not matching current selection.', { activeSlideId, selectedElementId, slideIdFromPreview, elementIdFromPreview });
              }
            }}
            onElementSelect={handleSelectElement}
          />
        </div>
      </div>

      {/* Right Panel: Tools & Layers */}
      <div style={toolsAndLayersPanelStyle}>
        <PropertiesPanel themeColors={themeColors} selectedElement={selectedElement} onUpdateElement={handleUpdateElement} />
        <LayersPanel 
          themeColors={themeColors} 
          elements={activeSlide?.elements} 
          selectedElementId={selectedElementId}
          onElementSelect={handleSelectElement}
          onUpdateElementName={handleUpdateElementName}
          onLayerOrderChange={handleLayerOrderChange}
        />
      </div>
    </div>
  );
};

export default SlideEditingView;
