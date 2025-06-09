import React from 'react';
import type { Slide } from '../../../types/presentationSharedTypes'; // Updated import
import type { ThemeColors } from '../../../theme';
import { MockSlide } from '../../../data/mockData/mockSlides';

export interface SlideItemProps {
  slide: Slide | MockSlide; // Support both Slide and MockSlide types
  themeColors: ThemeColors;
  isSelected: boolean;
  onSelect: (event: React.MouseEvent<HTMLDivElement>) => void; // Renamed from onClick
  onCueClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  thumbnailUrl?: string;
  slideIndex: number; // For displaying the slide number
  minWidth: number; // Added minWidth prop
  cueId: string; // Added cueId prop
}

const SlideItem: React.FC<SlideItemProps> = ({
  slide, // Changed from cue to slide
  themeColors,
  isSelected,
  onSelect, // Renamed from onClick
  onCueClick,
  thumbnailUrl,
  slideIndex,
  minWidth, // Added minWidth
  cueId, // Added cueId
}) => {
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // Prevent default behavior
    event.preventDefault();
    
    // Log selection with modifier keys for debugging
    console.log('SlideItem clicked:', { 
      slideId: (slide as any).id,
      shiftKey: event.shiftKey, 
      ctrlKey: event.ctrlKey, 
      metaKey: event.metaKey
    });
    
    // Pass the original event directly to the parent
    onSelect(event);
  };

  const handleCueClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
    console.log('Cue clicked, should navigate without selecting slide');
    if (onCueClick) {
      onCueClick(event);
    }
  };

  // Define selection indicator styles
  const selectionIndicatorStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    borderRadius: '6px',
    border: `3px solid ${themeColors.accentColor || '#4a90e2'}`,
    boxShadow: `0 0 0 1px ${themeColors.panelBackground || '#333333'}, 0 0 12px ${themeColors.accentColor || '#4a90e2'}`,
    opacity: isSelected ? 1 : 0,
    transition: 'opacity 0.2s ease-in-out',
    zIndex: 2,
  };
  
  // Define corner indicator styles
  const cornerIndicatorStyle: React.CSSProperties = {
    position: 'absolute',
    top: '-1px',
    right: '-1px',
    width: '24px',
    height: '24px',
    backgroundColor: themeColors.accentColor || '#4a90e2',
    transform: 'rotate(45deg) translate(12px, -12px)',
    opacity: isSelected ? 1 : 0,
    transition: 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out',
    zIndex: 1,
  };

  const itemStyle: React.CSSProperties = {
    position: 'relative',
    border: `1px solid ${themeColors.panelBorder || '#555555'}`,
    backgroundColor: themeColors.panelBackground || '#333333',
    color: themeColors.textColor,
    borderRadius: '6px',
    cursor: 'pointer',
    textAlign: 'center',
    minWidth: `${minWidth}px`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    overflow: 'hidden',
    boxShadow: isSelected ? `0 5px 15px rgba(0,0,0,0.3)` : '0 2px 5px rgba(0,0,0,0.2)',
    transition: 'all 0.2s ease-in-out',
    transform: isSelected ? 'translateY(-3px) scale(1.02)' : 'translateY(0) scale(1)',
  };

  return (
    <div
      style={itemStyle}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Select slide ${(slide as MockSlide).name || 'Untitled Slide'}`}
      aria-selected={isSelected}
    >
      {/* Selection indicators */}
      <div style={selectionIndicatorStyle} />
      <div style={cornerIndicatorStyle} />
      <div style={{
        flexGrow: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0', // Remove padding to maximize preview area
        overflow: 'hidden',
        aspectRatio: '16 / 9', // Apply aspect ratio here
        backgroundColor: (slide as MockSlide).backgroundColor || themeColors.widgetBackground || '#222222',
      }}>
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={(slide as MockSlide).name || 'Slide thumbnail'}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            color: (slide as MockSlide).textColor || themeColors.textColor,
            padding: '15px',
            boxSizing: 'border-box',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}>
            <span style={{ 
              fontSize: '1.1em', 
              fontWeight: 'bold',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              wordBreak: 'break-word' 
            }}>
              {(slide as MockSlide).content || (slide as MockSlide).name || `Slide ${slideIndex + 1}`}
            </span>
          </div>
        )}
      </div>
      {/* Slide name */}
      <div 
        style={{
          padding: '8px',
          fontSize: '12px',
          fontWeight: 500,
          color: themeColors.mutedText || '#aaaaaa', // Using mutedText instead of textSecondary
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: `1px solid ${themeColors.panelBorder || '#444444'}`,
          backgroundColor: themeColors.secondaryPanelBackground || '#222222',
        }}
        role="button"
        tabIndex={0}
        aria-label={`Navigate to cue for ${(slide as MockSlide).name || 'Untitled Slide'}`}
        onClick={handleCueClick}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '85%'
        }}>
          <span style={{ 
            backgroundColor: isSelected ? themeColors.accentColor : themeColors.panelBorder || '#555',
            color: '#fff',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '6px',
            fontSize: '0.7em',
            fontWeight: 'bold'
          }}>
            {slideIndex + 1}
          </span>
          <span style={{ 
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {(slide as MockSlide).name || 'Unnamed Slide'}
          </span>
        </div>
        {(slide as MockSlide).notes && (
          <div style={{
            fontSize: '0.7em',
            color: themeColors.mutedText || '#aaaaaa',
            marginLeft: '4px',
          }}>
            <span role="img" aria-label="Notes" title="Has presenter notes">📝</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(SlideItem);
