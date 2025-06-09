import React, { useState, useEffect, useCallback, useRef } from 'react';
import SlideItem from './SlideItem';
import type { ThemeColors } from '../../../theme';
import type { Slide } from '../../../types/presentationSharedTypes';
import { mockSlides } from '../../../data/mockData/mockSlides';

// Define the props interface for SlidesView
export interface SlidesViewProps {
  themeColors: ThemeColors;
  slides: Slide[];
  selectedSlideIds: string[];
  onSelectSlide: (slideId: string, event?: React.MouseEvent) => void;
  onUpdateSlides: (updatedSlides: Slide[]) => void;
}

const SlidesView: React.FC<SlidesViewProps> = ({
  themeColors,
  slides: propSlides,
  selectedSlideIds,
  onSelectSlide,
  onUpdateSlides
}) => {
  // Container ref for focus management
  const containerRef = useRef<HTMLDivElement>(null);
  
  // For UI development, use mock slides if no slides are provided
  const [displaySlides, setDisplaySlides] = useState<Slide[]>(propSlides || []);
  
  useEffect(() => {
    // For UI development only - use mock slides if no slides are provided
    if (!propSlides || propSlides.length === 0) {
      console.log('[SlidesView] Using mock slides for UI development');
      setDisplaySlides(mockSlides);
    } else {
      setDisplaySlides(propSlides);
    }
  }, [propSlides]);
  
  // For UI development - mock selection if none provided
  const [internalSelectedIds, setInternalSelectedIds] = useState<string[]>([]);
  
  // Track the last selected slide for shift-selection
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  
  // Handle slide selection with keyboard modifiers
  const handleSlideSelect = useCallback((slideId: string, event?: React.MouseEvent) => {
    // Log the event for debugging
    console.log('SlidesView handleSlideSelect:', { 
      slideId, 
      shiftKey: event?.shiftKey, 
      ctrlKey: event?.ctrlKey, 
      metaKey: event?.metaKey,
      lastSelectedId
    });
    
    // If real onSelectSlide is provided, use it
    if (onSelectSlide) {
      onSelectSlide(slideId, event);
      return;
    }
    
    // For UI development - handle selection internally
    if (event?.shiftKey && lastSelectedId) {
      // Range selection with Shift key
      const lastSelectedIndex = displaySlides.findIndex(slide => slide.id === lastSelectedId);
      const currentIndex = displaySlides.findIndex(slide => slide.id === slideId);
      
      if (lastSelectedIndex !== -1 && currentIndex !== -1) {
        // Determine range start and end
        const startIdx = Math.min(lastSelectedIndex, currentIndex);
        const endIdx = Math.max(lastSelectedIndex, currentIndex);
        
        // Get all slide IDs in the range
        const rangeIds = displaySlides
          .slice(startIdx, endIdx + 1)
          .map(slide => slide.id);
        
        if (event.ctrlKey || event.metaKey) {
          // Shift+Ctrl/Cmd - add range to existing selection
          const outsideSelections = internalSelectedIds.filter(id => 
            !displaySlides.slice(startIdx, endIdx + 1).some(slide => slide.id === id)
          );
          setInternalSelectedIds([...new Set([...outsideSelections, ...rangeIds])]);
        } else {
          // Shift only - replace selection with range
          setInternalSelectedIds(rangeIds);
        }
      }
    } else if (event?.ctrlKey || event?.metaKey) {
      // Multi-select with Ctrl/Cmd key (toggle individual slides)
      if (internalSelectedIds.includes(slideId)) {
        // If already selected, remove it
        setInternalSelectedIds(internalSelectedIds.filter(id => id !== slideId));
      } else {
        // If not selected, add it
        setInternalSelectedIds([...internalSelectedIds, slideId]);
      }
      setLastSelectedId(slideId);
    } else {
      // Single select
      setInternalSelectedIds([slideId]);
      setLastSelectedId(slideId);
    }
  }, [onSelectSlide, lastSelectedId, displaySlides, internalSelectedIds]);
  
  // Advance to next slide
  const selectNextSlide = useCallback(() => {
    if (displaySlides.length === 0) return;
    
    // Use provided selectedSlideIds or internal state
    const currentSelectedIds = selectedSlideIds || internalSelectedIds;
    let nextIndex = 0;
    
    if (currentSelectedIds.length > 0) {
      // Find the index of the last selected slide
      const lastSelectedId = currentSelectedIds[currentSelectedIds.length - 1];
      const currentIndex = displaySlides.findIndex(slide => slide.id === lastSelectedId);
      
      // Calculate next index (wrap around to beginning if at the end)
      nextIndex = currentIndex >= 0 && currentIndex < displaySlides.length - 1 
        ? currentIndex + 1 
        : 0;
    }
    
    // Select the next slide
    const nextSlideId = displaySlides[nextIndex].id;
    handleSlideSelect(nextSlideId);
  }, [displaySlides, selectedSlideIds, internalSelectedIds, handleSlideSelect]);
  
  // Find the index of the currently selected slide (last one if multiple are selected)
  const getSelectedIndex = useCallback(() => {
    const currentSelectedIds = selectedSlideIds || internalSelectedIds;
    if (currentSelectedIds.length === 0) return -1;
    
    const lastId = currentSelectedIds[currentSelectedIds.length - 1];
    return displaySlides.findIndex(slide => slide.id === lastId);
  }, [displaySlides, selectedSlideIds, internalSelectedIds]);
  
  // Select slide by index with optional keyboard modifiers
  const selectSlideByIndex = useCallback((index: number, modifiers?: { shift?: boolean, ctrl?: boolean }) => {
    if (index < 0 || index >= displaySlides.length) return;
    
    const targetId = displaySlides[index].id;
    
    // Create a synthetic event with modifier keys
    const syntheticEvent = {
      preventDefault: () => {},
      stopPropagation: () => {},
      shiftKey: modifiers?.shift || false,
      ctrlKey: modifiers?.ctrl || false,
      metaKey: modifiers?.ctrl || false, // Use ctrl for both ctrl and meta
    } as React.MouseEvent;
    
    handleSlideSelect(targetId, syntheticEvent);
  }, [displaySlides, handleSlideSelect]);
  
  // Keyboard event handler
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const currentIndex = getSelectedIndex();
    
    // Prevent default behavior for navigation keys
    if (['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.code)) {
      event.preventDefault();
    }
    
    // Space bar advances to next slide
    if (event.code === 'Space' || event.key === ' ') {
      selectNextSlide();
      return;
    }
    
    // Handle arrow keys
    switch (event.code) {
      case 'ArrowRight':
      case 'ArrowDown':
        // Move to next slide
        if (currentIndex < displaySlides.length - 1) {
          selectSlideByIndex(currentIndex + 1, { 
            shift: event.shiftKey, 
            ctrl: event.ctrlKey || event.metaKey 
          });
        }
        break;
        
      case 'ArrowLeft':
      case 'ArrowUp':
        // Move to previous slide
        if (currentIndex > 0) {
          selectSlideByIndex(currentIndex - 1, { 
            shift: event.shiftKey, 
            ctrl: event.ctrlKey || event.metaKey 
          });
        }
        break;
        
      case 'Home':
        // Move to first slide
        selectSlideByIndex(0, { 
          shift: event.shiftKey, 
          ctrl: event.ctrlKey || event.metaKey 
        });
        break;
        
      case 'End':
        // Move to last slide
        selectSlideByIndex(displaySlides.length - 1, { 
          shift: event.shiftKey, 
          ctrl: event.ctrlKey || event.metaKey 
        });
        break;
        
      case 'KeyA':
        // Select all slides with Ctrl+A
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          setInternalSelectedIds(displaySlides.map(slide => slide.id));
        }
        break;
    }
  }, [selectNextSlide, getSelectedIndex, displaySlides, selectSlideByIndex, setInternalSelectedIds]);
  
  // Set up keyboard event listeners
  useEffect(() => {
    // Add event listener when component mounts
    window.addEventListener('keydown', handleKeyDown);
    
    // Focus the container to ensure keyboard events are captured
    if (containerRef.current) {
      containerRef.current.focus();
    }
    
    // Clean up event listener when component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  
  // Use provided selectedSlideIds or internal state for UI development
  const effectiveSelectedIds = selectedSlideIds || internalSelectedIds;
  
  return (
    <div 
      ref={containerRef}
      style={{ 
        width: '100%', 
        height: '100%', 
        backgroundColor: themeColors.panelBackground || '#2a2a2a', 
        color: themeColors.textColorColor || '#e0e0e0', 
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
      tabIndex={0} // Make the container focusable
      onFocus={() => console.log('SlidesView focused')} // Optional logging
    >
      {/* Header with controls */}
      <div style={{
        padding: '10px 15px',
        borderBottom: `1px solid ${themeColors.panelBorder || '#444'}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px'
        }}>
          <div style={{ 
            fontWeight: 'bold', 
            fontSize: '15px',
            color: themeColors.textColorColor || '#fff'
          }}>
            Quarterly Business Review
          </div>
        </div>
        
        {/* Icon buttons on the right */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Automation icon */}
          <div 
            title="Automation Settings"
            style={{
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              borderRadius: '4px',
              backgroundColor: 'transparent',
              color: themeColors.mutedText || '#999',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = themeColors.buttonHoverBackground || '#555';
              e.currentTarget.style.color = themeColors.textColor || '#fff';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = themeColors.mutedText || '#999';
            }}
            onClick={() => console.log('Automation settings clicked')}
          >
            {/* SVG for automation icon - gear icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" fill="currentColor" />
              <path fillRule="evenodd" clipRule="evenodd" d="M20.8 14.4C20.1791 14.4 19.6 13.8209 19.6 13.2C19.6 12.5791 20.1791 12 20.8 12V8C19.5791 8 18.6 7.02091 18.6 5.8H5.4C5.4 7.02091 4.42091 8 3.2 8V16C4.42091 16 5.4 16.9791 5.4 18.2H18.6C18.6 16.9791 19.5791 16 20.8 16V14.4ZM21.6 6.8C22.9255 6.8 24 5.72548 24 4.4C24 3.07452 22.9255 2 21.6 2H2.4C1.07452 2 0 3.07452 0 4.4C0 5.72548 1.07452 6.8 2.4 6.8C2.4 8.12548 3.47452 9.2 4.8 9.2V14.8C3.47452 14.8 2.4 15.8745 2.4 17.2C2.4 18.5255 3.47452 19.6 4.8 19.6H19.2C20.5255 19.6 21.6 18.5255 21.6 17.2C21.6 15.8745 20.5255 14.8 19.2 14.8V9.2C20.5255 9.2 21.6 8.12548 21.6 6.8ZM12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z" fill="currentColor" />
            </svg>
          </div>
          
          {/* Arrangement icon */}
          <div 
            title="Arrange Slides"
            style={{
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              borderRadius: '4px',
              backgroundColor: 'transparent',
              color: themeColors.mutedText || '#999',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = themeColors.buttonHoverBackground || '#555';
              e.currentTarget.style.color = themeColors.textColor || '#fff';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = themeColors.mutedText || '#999';
            }}
            onClick={() => console.log('Arrangement clicked')}
          >
            {/* SVG for arrangement icon - layers icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 7L12 12L22 7L12 2L2 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          {/* Add slide icon */}
          <div 
            title="Add New Slide"
            style={{
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              borderRadius: '4px',
              backgroundColor: 'transparent',
              color: themeColors.mutedText || '#999',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = themeColors.buttonHoverBackground || '#555';
              e.currentTarget.style.color = themeColors.textColor || '#fff';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = themeColors.mutedText || '#999';
            }}
            onClick={() => console.log('Add slide clicked')}
          >
            {/* SVG for add icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          {/* Slide count badge */}
          <div style={{
            fontSize: '12px',
            color: themeColors.mutedText || '#999',
            backgroundColor: themeColors.buttonBackground || '#333',
            padding: '2px 8px',
            borderRadius: '10px',
            marginLeft: '4px'
          }}>
            {displaySlides.length}
          </div>
        </div>
      </div>
      
      {/* Slides grid */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '15px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '15px',
          padding: '5px'
        }}>
          {displaySlides && displaySlides.length > 0 ? (
            displaySlides.map((slide, index) => (
              <SlideItem
                key={slide.id}
                slide={slide}
                themeColors={themeColors}
                isSelected={effectiveSelectedIds?.includes(slide.id) || false}
                onSelect={(event) => handleSlideSelect(slide.id, event)}
                thumbnailUrl="" // Add thumbnail generation logic later
                slideIndex={index}
                minWidth={160}
                cueId={slide.id} // Using slide.id as cueId for now
              />
            ))
          ) : (
            <div style={{ 
              gridColumn: '1 / -1', 
              padding: '40px 20px', 
              textAlign: 'center',
              color: themeColors.mutedText || '#aaa', // Using mutedText instead of textSecondary
              backgroundColor: 'rgba(0,0,0,0.1)',
              borderRadius: '8px',
              border: `1px dashed ${themeColors.panelBorder || '#444'}`
            }}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>📊</div>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>No Slides Available</div>
              <div style={{ fontSize: '13px' }}>Add slides to get started</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SlidesView;
