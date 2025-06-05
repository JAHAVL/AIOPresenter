import React from 'react';
import { FaEye, FaPencilAlt } from 'react-icons/fa'; // Import icons
import type { ThemeColors } from '../../theme'; // Path to theme.ts from within components directory

interface PresentationControlsBarProps {
  themeColors: ThemeColors;
  onShowClick?: () => void; // Optional: To handle eye icon click for navigation
  onEditClick?: () => void; // Optional: To handle pencil icon click for navigation
}

const PresentationControlsBar: React.FC<PresentationControlsBarProps> = ({ themeColors, onShowClick, onEditClick }) => {
  // Check if running on macOS in the renderer process
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  const topControlBarStyle: React.CSSProperties = {
    height: '40px', // Fixed height for the control bar
    backgroundColor: 'transparent',
    color: themeColors.textColor,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start', // Align icons to the start
    paddingTop: '0px',
    paddingBottom: '0px',
    paddingRight: '10px',
    paddingLeft: isMac ? '78px' : '10px', // Conditional left padding for macOS window controls
    flexShrink: 0,
    boxSizing: 'border-box',
    zIndex: 10000, // Ensure it's in the foreground
    WebkitAppRegion: 'no-drag', // Explicitly make this area not draggable
  };

  const iconStyle: React.CSSProperties = {
    margin: '0 8px', // Add some spacing around icons
    cursor: 'pointer',
    fontSize: '20px', // Adjust icon size as needed
  };

  return (
    <div style={topControlBarStyle} data-component-name="PresentationControlsBar">
      <FaEye style={iconStyle} title="Show" onClick={onShowClick} />
      <FaPencilAlt style={iconStyle} title="Edit" onClick={onEditClick} />
      {/* Future controls like Next, Previous buttons can be added here */}
    </div>
  );
};

export default PresentationControlsBar;
