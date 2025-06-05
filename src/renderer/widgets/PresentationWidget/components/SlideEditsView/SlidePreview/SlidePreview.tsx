import React, { useState } from 'react';
import { Rnd, DraggableData, ResizableDelta } from 'react-rnd';
import type { DraggableEvent } from 'react-draggable'; // Correct import for DraggableEvent
import type { ThemeColors } from '@theme/theme';
import type { Slide, SlideElement, ImageSlideElement, TextSlideElement, ShapeSlideElement } from '@projectTypes/presentationSharedTypes';

interface SlidePreviewProps {
  currentSlide: Slide | undefined;
  selectedElementId: string | null; // Renamed from onElementSelect to selectedElementId
  onElementSelect: (elementId: string) => void;
  onUpdateElement: (slideId: string, elementId: string, updatedElement: SlideElement) => void; // Corrected type for updatedElement
  themeColors: ThemeColors;
}

const SlidePreview: React.FC<SlidePreviewProps> = ({ currentSlide, selectedElementId, onElementSelect, onUpdateElement, themeColors }) => {
  const [editingTextElementId, setEditingTextElementId] = useState<string | null>(null);
  const [editTextValue, setEditTextValue] = useState<string>('');
  const handleDragStop = React.useCallback((element: SlideElement, _e: DraggableEvent, data: DraggableData) => {
    if (currentSlide) {
      onUpdateElement(currentSlide.id, element.id, { ...element, position: { x: data.x, y: data.y } });
    }
  }, [currentSlide, onUpdateElement]);

  const handleResizeStop = React.useCallback((element: SlideElement, _e: MouseEvent | TouchEvent, _direction: string, ref: HTMLElement, _delta: ResizableDelta, position: { x: number; y: number }) => {
    if (currentSlide) {
      onUpdateElement(currentSlide.id, element.id, {
        ...element,
        size: { width: ref.offsetWidth, height: ref.offsetHeight },
        position: { x: position.x, y: position.y },
      });
    }
  }, [currentSlide, onUpdateElement]);

  if (!currentSlide) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: themeColors.mutedText,
      }}>
        <p>Select a slide from the list to view/edit.</p>
      </div>
    );
  }

  const slideAspectRatio = 16 / 9;

  // Styles for the inner content area that maintains 16:9
  const slideContentHolderStyle: React.CSSProperties = {
    width: '100%', // Will be constrained by parent with padding
    paddingBottom: `${(1 / slideAspectRatio) * 100}%`, // Aspect ratio padding trick
    position: 'relative',
    backgroundColor: currentSlide.backgroundColor || themeColors.secondaryPanelBackground || '#2B2B2B',
    borderRadius: '4px',
    overflow: 'hidden',
    boxShadow: `0 2px 10px rgba(0,0,0,0.1)`,
  };

  const slideActualContentStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    display: 'flex', 
    flexDirection: 'column', // Stack title and content if needed, or just center content
    alignItems: 'center', 
    justifyContent: 'center',
    padding: '20px', // Padding inside the slide preview content area
    overflow: 'auto', // If actual slide content overflows
    color: themeColors.text, // Default text color for slide content
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', boxSizing: 'border-box' }} data-component-name="SlidePreview">
      <h4 style={{ color: themeColors.headerText || themeColors.text, marginBottom: '15px', textAlign: 'center', flexShrink: 0 }}>
        {currentSlide.name || 'Selected Slide'}
      </h4>
      <div style={slideContentHolderStyle}>
        <div style={slideActualContentStyle}>
          {/* Actual slide content rendering will go here */}
          {currentSlide.elements && currentSlide.elements.map((element) => {

            const elementStyle: React.CSSProperties = {
              border: '1px dashed rgba(255,255,255,0.3)', // Optional: visual aid for element bounds
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden', // Ensure content stays within RND bounds
            };

            return (
              <Rnd
                key={element.id}
                size={{ width: element.size.width, height: element.size.height }}
                position={{ x: element.position.x, y: element.position.y }}
                onDragStop={(e, data) => handleDragStop(element, e, data)}
                onResizeStop={(e, direction, ref, delta, position) => handleResizeStop(element, e, direction, ref, delta, position)}
                minWidth={20}
                minHeight={20}
                bounds="parent"
                lockAspectRatio={element.type === 'image'}
                style={{ zIndex: element.zIndex || 1, ...elementStyle }}
              >
                <div 
                  onClick={(e) => { e.stopPropagation(); onElementSelect(element.id); }} 
                  style={{ width: '100%', height: '100%', cursor: 'pointer' }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onElementSelect(element.id); }}}
                  aria-label={`Select element ${element.type}`}
                >
                {element.type === 'image' && (element as ImageSlideElement).src && (
                  <img src={(element as ImageSlideElement).src} alt="slide element" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                )}
                {element.type === 'text' && editingTextElementId === element.id ? (
                  <textarea
                    value={editTextValue}
                    onChange={(e) => setEditTextValue(e.target.value)}
                    onBlur={() => {
                      if (currentSlide) {
                        onUpdateElement(currentSlide.id, element.id, { ...element, content: editTextValue });
                      }
                      setEditingTextElementId(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) { // Save on Enter, allow Shift+Enter for new line
                        e.preventDefault();
                        if (currentSlide) {
                          onUpdateElement(currentSlide.id, element.id, { ...element, content: editTextValue });
                        }
                        setEditingTextElementId(null);
                      } else if (e.key === 'Escape') {
                        setEditingTextElementId(null); // Cancel editing on Escape
                        // Optionally revert editTextValue to original element.content here
                      }
                    }}
                    autoFocus
                    style={{
                      display: 'block',
                      width: '100%',
                      height: '100%',
                      padding: '5px',
                      margin: 0,
                      border: 'none',
                      outline: 'none',
                      fontFamily: 'inherit',
                      fontSize: 'inherit',
                      lineHeight: '1.4',
                      color: themeColors.text,
                      backgroundColor: 'transparent',
                      boxSizing: 'border-box',
                      resize: 'none',
                      textAlign: 'center',
                      whiteSpace: 'pre-wrap',      // Consistent whitespace handling
                      overflowWrap: 'break-word',  // Consistent word wrapping
                      overflowY: 'hidden',
                    }}
                  />
                ) : element.type === 'text' && (() => {
                  const textElement = element as TextSlideElement;
                  const dynamicTextStyle: React.CSSProperties = {
                    fontFamily: textElement.fontFamily || 'inherit',
                    fontSize: textElement.fontSize ? `${textElement.fontSize}px` : 'inherit',
                    fontWeight: textElement.fontWeight || 'normal',
                    fontStyle: textElement.fontStyle || 'normal',
                    color: textElement.color || themeColors.text,
                    textAlign: textElement.textAlign || 'center',
                    lineHeight: textElement.lineHeight || 1.4,
                    letterSpacing: textElement.letterSpacing ? `${textElement.letterSpacing}px` : undefined,
                    textTransform: textElement.textTransform || 'none',
                    opacity: textElement.opacity === undefined ? 1 : textElement.opacity,
                    backgroundColor: textElement.textBackgroundColor || 'transparent',
                    // Vertical alignment will be handled by flex properties on this div
                    display: 'flex',
                    alignItems: textElement.verticalAlign === 'top' ? 'flex-start' : textElement.verticalAlign === 'bottom' ? 'flex-end' : 'center',
                    justifyContent: textElement.textAlign === 'left' ? 'flex-start' : textElement.textAlign === 'right' ? 'flex-end' : 'center',
                    padding: '5px', // Keep existing padding
                    boxSizing: 'border-box', // Keep existing box-sizing
                    whiteSpace: 'pre-wrap', // Keep existing white-space
                    overflowWrap: 'break-word', // Keep existing overflow-wrap
                    overflow: 'hidden', // Keep existing overflow
                    width: '100%', // Keep existing width
                    height: '100%', // Keep existing height
                  };

                  if (textElement.textDecoration && textElement.textDecoration !== 'none') {
                    dynamicTextStyle.textDecorationLine = textElement.textDecoration;
                  }

                  if (textElement.textStrokeEnabled && textElement.textStrokeWidth && textElement.textStrokeColor) {
                    dynamicTextStyle.WebkitTextStrokeWidth = `${textElement.textStrokeWidth}px`;
                    dynamicTextStyle.WebkitTextStrokeColor = textElement.textStrokeColor;
                  }

                  if (textElement.textShadow?.enabled && textElement.textShadow.color) {
                    const {
                      angle = 0, // Default to 0 degrees if undefined
                      offsetMagnitude = 0, // Default to 0 px if undefined
                      blurRadius = 0, // Default to 0 px if undefined
                      color: shadowBaseColor, // Renamed to avoid conflict with outer scope variables
                      opacity = 1, // Default to full opacity if undefined
                    } = textElement.textShadow;

                    // Convert angle from degrees to radians for trigonometric functions
                    const angleInRadians = (angle * Math.PI) / 180;

                    // Calculate offsetX and offsetY, format to 2 decimal places for CSS
                    const offsetX = (offsetMagnitude * Math.cos(angleInRadians)).toFixed(2);
                    const offsetY = (offsetMagnitude * Math.sin(angleInRadians)).toFixed(2);

                    let finalShadowColor = shadowBaseColor;
                    // Apply opacity if it's defined, numeric, and less than 1 (and color format is known)
                    if (typeof opacity === 'number' && opacity >= 0 && opacity < 1) {
                        let r = 0, g = 0, b = 0;
                        if (shadowBaseColor.startsWith('#')) {
                            if (shadowBaseColor.length === 4) { // #RGB
                                r = parseInt(shadowBaseColor[1] + shadowBaseColor[1], 16);
                                g = parseInt(shadowBaseColor[2] + shadowBaseColor[2], 16);
                                b = parseInt(shadowBaseColor[3] + shadowBaseColor[3], 16);
                                finalShadowColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
                            } else if (shadowBaseColor.length === 7) { // #RRGGBB
                                r = parseInt(shadowBaseColor.substring(1, 3), 16);
                                g = parseInt(shadowBaseColor.substring(3, 5), 16);
                                b = parseInt(shadowBaseColor.substring(5, 7), 16);
                                finalShadowColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
                            }
                            // If hex is invalid or not parsable here, finalShadowColor remains shadowBaseColor
                        } else if (shadowBaseColor.startsWith('rgb(') && !shadowBaseColor.startsWith('rgba(')) {
                           // Convert rgb() to rgba()
                           finalShadowColor = shadowBaseColor.replace('rgb(', 'rgba(').replace(')', `, ${opacity})`);
                        } else if (shadowBaseColor.startsWith('rgba(')) {
                           // If already rgba(), update the alpha value
                           finalShadowColor = shadowBaseColor.replace(/rgba\(([^,]+,\s*[^,]+,\s*[^,]+,)\s*[^)]+\)/, `rgba($1 ${opacity})`);
                        }
                        // For named colors or other unhandled formats, opacity < 1 won't be applied.
                        // If opacity is 1, finalShadowColor remains shadowBaseColor (original color string), which is correct.
                    }

                    dynamicTextStyle.textShadow = `${offsetX}px ${offsetY}px ${blurRadius}px ${finalShadowColor}`;
                  }

                  return (
                
                  <div 
                    style={dynamicTextStyle}
                    onDoubleClick={() => {
                      if (textElement.type === 'text') {
                        setEditingTextElementId(textElement.id);
                        setEditTextValue(textElement.content || 'Text');
                      }
                    }}
                  >
                    {textElement.content}
                  </div>
                );
                })()}
                {element.type === 'shape' && (
                  <div 
                    style={{
                      width: '100%', 
                      height: '100%', 
                      backgroundColor: (element as ShapeSlideElement).fillColor || '#cccccc',
                    }}
                    aria-label="Shape element"
                  />
                )}
                {element.type === 'video' && element.src && (
                  <video src={element.src} style={{ width: '100%', height: '100%', objectFit: 'contain' }} controls />
                )}
                </div>
              </Rnd>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SlidePreview;
