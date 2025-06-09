import React, { ReactNode, useState } from 'react';

// Using a simplified ThemeColors interface to avoid import issues
interface ThemeColors {
  panelBackground: string;
  textColor: string;
  selectedItemBackground?: string;
  selectedItemText?: string;
  accentColor?: string;
  textOnAccentColor?: string;
  hoverItemBackground?: string; // Background color when item is hovered
  hoverBorderColor?: string;    // Border color when item is hovered
  [key: string]: string | undefined;
}

export interface SelectableItemProps {
  id: string;
  isSelected: boolean;
  isEditing?: boolean;
  themeColors: ThemeColors;
  onClick?: () => void;
  onDoubleClick?: () => void;
  children: ReactNode;
  className?: string;
}

/**
 * A reusable component for selectable items (libraries, cuelists, presentations, etc.)
 * with consistent styling across the application.
 * 
 * When selected, it displays a blue bar on the left side and a grey background.
 */
// Using React.memo for better HMR performance
/**
 * A reusable component for selectable items (libraries, cuelists, presentations, etc.)
 * with consistent styling across the application.
 * 
 * Features:
 * - When selected, displays a blue bar on the left side and a grey background
 * - When hovered, shows a subtle highlight effect
 * - Supports editing mode which disables selection
 */
const SelectableItem: React.FC<SelectableItemProps> = React.memo(({
  id,
  isSelected,
  isEditing = false,
  themeColors,
  onClick,
  onDoubleClick,
  children,
  className = '',
}) => {
  // Track hover state
  const [isHovered, setIsHovered] = useState(false);
  // Determine background color based on selection and hover state
  const getBackgroundColor = () => {
    if (isSelected) {
      return themeColors.selectedItemBackground || '#444';
    }
    if (isHovered && !isEditing) {
      // Use the existing theme property for hover background
      return themeColors.listItemHoverBackground || themeColors.hoverItemBackground || '#3a3a3a';
    }
    return themeColors.panelBackground || '#333';
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: '8px',
    margin: '4px 0',
    backgroundColor: getBackgroundColor(),
    color: isSelected
      ? (themeColors.selectedItemText || themeColors.textOnAccentColor || themeColors.textColor)
      : themeColors.textColor,
    borderRadius: '4px',
    cursor: isEditing ? 'default' : 'pointer',
    position: 'relative',
    overflow: 'hidden',
    borderLeft: isSelected
      ? `4px solid ${themeColors.selectedItemAccentColor || themeColors.accentColor || '#3498db'}`
      : isHovered && !isEditing 
        ? `4px solid ${themeColors.hoverBorderColor || 'rgba(52, 152, 219, 0.3)'}`
        : '4px solid transparent',
    transition: 'background-color 0.15s ease, border-left 0.15s ease',
  };

  const handleClick = () => {
    if (!isEditing && onClick) {
      onClick();
    }
  };

  const handleDoubleClick = () => {
    if (!isEditing && onDoubleClick) {
      onDoubleClick();
    }
  };

  return (
    <div
      id={`selectable-item-${id}`}
      className={`selectable-item ${className}`}
      style={containerStyle}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={`selectable-item-${id}`}
    >
      {children}
    </div>
  );
});

export default SelectableItem;
