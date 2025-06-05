import React from 'react';
import { Slide } from '../../../types/presentationSharedTypes';
import { ThemeColors } from '../../../theme';

interface SlideListItemProps {
  slide: Slide;
  isSelected: boolean;
  themeColors: ThemeColors;
  onClick: (event: React.MouseEvent) => void; // Pass MouseEvent for modifier keys
}

const SlideListItem: React.FC<SlideListItemProps> = ({ slide, isSelected, themeColors, onClick }) => {
  // Style for the outer container of each slide list item (preview + label)
  const slideListItemOuterContainerStyle: React.CSSProperties = {
    width: '220px', // Fixed outer width for each item container
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '10px',
    padding: '5px',
    border: `solid ${isSelected ? themeColors.selectedSlideBorderColor : themeColors.panelBorder}`,
    borderWidth: isSelected ? '2px' : '1px',
    backgroundColor: themeColors.panelBackground, // Background does not change on selection
    borderRadius: '4px',
    cursor: 'pointer',
    boxSizing: 'border-box',
    flexShrink: 0, // Prevent thumbnails from shrinking
    userSelect: 'none', // Standard property
    WebkitUserSelect: 'none', // Safari, Chrome
    MozUserSelect: 'none', // Firefox
    msUserSelect: 'none', // IE/Edge
  };

  // Style for the 16:9 preview area within each list item
  const thumbnailPreviewStyle: React.CSSProperties = {
    width: '100%', // Takes full width of the padded outer container
    aspectRatio: '16 / 9',
    backgroundColor: slide.backgroundColor || themeColors.secondaryPanelBackground || '#333333',
    borderRadius: '3px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: '5px', // Padding within the 16:9 preview itself for the text
    boxSizing: 'border-box',
    color: isSelected ? themeColors.selectedItemText : themeColors.textColor, // Use selectedItemText for selected state
    fontSize: '12px',
    textAlign: 'center',
  };

  // Style for the label underneath the preview
  const thumbnailLabelStyle: React.CSSProperties = {
    width: '100%',
    paddingTop: '6px',
    fontSize: '11px',
    color: isSelected ? themeColors.selectedItemText : (themeColors.mutedText || themeColors.textColor),
    textAlign: 'center',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    lineHeight: '1.2',
  };

  const slideDisplayName = slide.name || `Slide ${slide.id.slice(0, 4)}...`; // Use part of ID if no name
  const previewText = slide.elements && slide.elements[0] && slide.elements[0].type === 'text'
    ? slide.elements[0].content.substring(0, 30) + (slide.elements[0].content.length > 30 ? '...' : '')
    : slideDisplayName;

  return (
    <div
      style={slideListItemOuterContainerStyle}
      onClick={(event) => onClick(event)} // Pass the event up
      title={slideDisplayName}
      data-component-name="SlideListItem"
    >
      <div style={thumbnailPreviewStyle}>
        {previewText}
      </div>
      <div style={thumbnailLabelStyle}>
        {slideDisplayName}
      </div>
    </div>
  );
};

export default SlideListItem;
