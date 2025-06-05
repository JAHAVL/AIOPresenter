import React from 'react';
import type { Slide } from '../../../types/presentationSharedTypes'; // Updated import
import type { ThemeColors } from '../../../theme';

export interface SlideItemProps {
  slide: Slide; // Changed from cue to slide
  themeColors: ThemeColors;
  isSelected: boolean;
  onSelect: (event: React.MouseEvent<HTMLDivElement>) => void; // Renamed from onClick
  onCueClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  thumbnailUrl: string;
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
    event.preventDefault(); // Prevent default scroll/navigation behavior
    event.stopPropagation(); // Stop event from bubbling up to parent elements
    event.nativeEvent.stopImmediatePropagation(); // Stop any other handlers from running
    if (event.currentTarget) {
      (event.currentTarget as HTMLElement).focus({ preventScroll: true }); // Explicitly prevent scroll on focus
    }
    console.log('SlideItem clicked, event details:', { type: event.type, target: event.target, currentTarget: event.currentTarget });
    onSelect(event);         // Call the renamed onSelect passed from parent
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

  const itemStyle: React.CSSProperties = {
    border: `2px solid ${isSelected ? themeColors.accentColor : themeColors.panelBorder || '#555555'}`, // Highlight if selected
    backgroundColor: themeColors.panelBackground || '#333333', // Use panel background or a dark fallback
    color: themeColors.textColor,
    // padding: '10px', // Padding will be handled by content and label sections
    // margin: '5px', // Grid gap will handle spacing
    borderRadius: '4px',
    cursor: 'pointer',
    textAlign: 'center',
    minWidth: `${minWidth}px`, // Apply minWidth
    // minHeight: '80px', // Removed to let aspectRatio fully control height
    display: 'flex',
    flexDirection: 'column',
    // justifyContent: 'space-between', // No longer needed here, flexGrow handles it
    alignItems: 'stretch', // To make content and label stretch width-wise
    // aspectRatio: '16 / 9', // Moved to content area
    overflow: 'hidden', // Prevent content spill
    boxShadow: isSelected ? `0 0 8px ${themeColors.accentColor}` : 'none',
    transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  };

  return (
    <div
      style={itemStyle}
      onClick={handleClick} // handleClick now calls onSelect
      role="button"
      tabIndex={0}
      aria-label={`Select slide ${slide.name || 'Untitled Slide'}`}
    >
      <div style={{
        flexGrow: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '10px', // Padding for the content area
        overflow: 'hidden',
        aspectRatio: '16 / 9', // Apply aspect ratio here
        backgroundColor: themeColors.widgetBackground || '#222222', // Use widgetBackground or a dark fallback
      }}>
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={slide.name || 'Slide thumbnail'}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: themeColors.textColor }}>
            {/* For now, just display the slide ID or name. Later, this will render slide content. */}
            <span style={{ fontSize: '0.9em', wordBreak: 'break-word' }}>
              {slide.name || `Slide: ${slide.id.substring(0, 8)}...`}
            </span>
          </div>
        )}
      </div>
      <div 
        style={{
          backgroundColor: themeColors.panelBorder || '#424242', // Consistent background for label
          color: themeColors.textColor || '#FFFFFF', // Consistent text color for label
          padding: '5px 8px',
          fontSize: '0.75em',
          textAlign: 'left',
          width: '100%', // Ensure label spans the full width
          boxSizing: 'border-box',
          borderTop: `1px solid ${themeColors.panelBorder || '#555555'}`, 
        }}
        onClick={(e) => {
          e.stopPropagation(); // Prevent the click from reaching the parent div
          e.preventDefault();
          handleCueClick(e);
        }}
        role="button"
        tabIndex={0}
        aria-label={`Navigate to cue for ${slide.name || 'Untitled Slide'}`}
      >
        <p style={{ fontSize: '0.75em', wordBreak: 'break-word' }}>
          {`${slideIndex + 1}. ${slide.name || 'Unnamed Slide'}`}
        </p>
      </div>
    </div>
  );
};

export default React.memo(SlideItem);
