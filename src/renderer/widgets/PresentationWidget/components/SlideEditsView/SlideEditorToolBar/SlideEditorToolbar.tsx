import React from 'react';
import { FaMousePointer, FaFont, FaImage, FaVideo, FaSquare } from 'react-icons/fa';
import { ThemeColors } from '../../../theme';

interface SlideEditorToolbarProps {
  themeColors: ThemeColors;
  onAddTextElement: () => void;
  onAddImageElement: (imageDataUrl?: string) => void; // Expects Data URL or undefined for placeholder
  onAddShapeElement: () => void;
  onAddVideoElement: () => void;
  // Add callbacks for other icon clicks later, e.g., onSelectTool: (tool: string) => void;
}

const SlideEditorToolbar: React.FC<SlideEditorToolbarProps> = ({ themeColors, onAddTextElement, onAddImageElement, onAddShapeElement, onAddVideoElement }) => {
  const slideEditorToolbarStyle: React.CSSProperties = {
    height: '56px', // Explicitly set toolbar height
    display: 'flex',
    alignItems: 'center', // Vertically center icons
    padding: '0 12px', // Adjust padding if necessary for new height
    backgroundColor: themeColors.secondaryPanelBackground || themeColors.panelBackground,
    borderBottom: `1px solid ${themeColors.panelBorder}`,
    borderRadius: '8px 8px 0 0', // Rounded top corners if it's at the very top of editorPanel
    marginBottom: '1px', // Small gap or overlap prevention
    flexShrink: 0,
  };

  const iconStyle: React.CSSProperties = {
    fontSize: '30px', // Significantly increased icon size
    color: themeColors.textColor,
    margin: '0 10px', // Slightly adjust margin if needed with new size
    cursor: 'pointer',
    padding: '8px', // Padding around icons
    borderRadius: '4px',
    display: 'flex', // Ensure icon itself is a flex container for centering its content (SVG path)
    alignItems: 'center', // Center SVG content within the padding box
    justifyContent: 'center',
    transition: 'background-color 0.2s ease-in-out',
  };

  // Example of how to handle hover for iconStyle - you might need a more robust solution
  // or use styled-components/CSS classes for :hover pseudo-class.
  // For simplicity, this is not implemented directly in inline styles here.

  return (
    <div style={slideEditorToolbarStyle} data-component-name="SlideEditorToolbar">
      <FaMousePointer style={iconStyle} title="Select Tool" />
      <FaFont style={iconStyle} title="Add Text" onClick={onAddTextElement} />
      <FaImage 
        style={iconStyle} 
        title="Add Image" 
        onClick={async () => {
          console.log('[SlideEditorToolbar] "Add Image" icon clicked. Requesting image dialog...');
          try {
            const filePath = await window.electronAPI.openImageDialog();
            console.log('[SlideEditorToolbar] Image dialog returned path:', filePath);
            if (filePath) {
              console.log('[SlideEditorToolbar] File path received:', filePath, 'Attempting to load as Data URL...');
              const dataUrl = await window.electronAPI.loadImageAsDataURL(filePath);
              if (dataUrl) {
                console.log('[SlideEditorToolbar] Data URL received (length):', dataUrl.length, 'Calling onAddImageElement.');
                onAddImageElement(dataUrl);
              } else {
                console.error('[SlideEditorToolbar] Failed to load image as Data URL. Path:', filePath);
                console.log('[SlideEditorToolbar] Adding placeholder due to Data URL load failure.');
                onAddImageElement(); // Fallback to placeholder
              }
            } else {
              console.log('[SlideEditorToolbar] Image dialog cancelled or no path returned. Adding placeholder.');
              onAddImageElement(); 
            }
          } catch (error) {
            console.error('[SlideEditorToolbar] Error during image selection/loading process:', error);
            console.log('[SlideEditorToolbar] Falling back to placeholder due to error.');
            onAddImageElement(); // Fallback to placeholder on error
          }
        }}
      />
      <FaVideo style={iconStyle} title="Add Video" onClick={onAddVideoElement} />
      <FaSquare 
        style={iconStyle} 
        title="Add Shape" 
        onClick={() => {
          console.log('[SlideEditorToolbar] "Add Shape" icon clicked.');
          onAddShapeElement();
        }}
      />
      {/* Add more toolbar icons as needed */}
    </div>
  );
};

export default SlideEditorToolbar;
