import React, { ReactNode } from 'react';

// Using a simplified ThemeColors interface to avoid import issues
interface ThemeColors {
  panelBackground: string;
  textColor: string;
  panelBorder: string;
  [key: string]: string | undefined;
}
import { FaPlus } from 'react-icons/fa';

export interface SectionContainerProps {
  title?: string; // Make title optional
  themeColors: ThemeColors;
  onAddItem?: () => void;
  children: ReactNode;
  className?: string;
  showHeader?: boolean; // Option to hide the header completely
}

/**
 * A container component for sections like Libraries, Cuelists, etc.
 * Provides consistent styling and header structure across the application.
 */
// Using React.memo for better HMR performance
const SectionContainer: React.FC<SectionContainerProps> = React.memo(({
  title = '',
  themeColors,
  onAddItem,
  children,
  className = '',
  showHeader = true,
}) => {
  const containerStyle: React.CSSProperties = {
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    height: '100%',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: '0 0 10px 0',
    paddingBottom: '5px',
    borderBottom: `1px solid ${themeColors.panelBorder}`,
    width: '100%',
  };

  const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: '14px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: themeColors.textColor,
  };

  const addButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: themeColors.textColor,
    cursor: 'pointer',
    fontSize: '14px',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  };

  return (
    <div className={`section-container ${className}`} style={containerStyle}>
      {(showHeader || onAddItem) && (
        <div className="section-header" style={{
          ...headerStyle,
          justifyContent: title ? 'space-between' : 'flex-end',
          borderBottom: title ? headerStyle.borderBottom : 'none',
          padding: title ? '0' : '0 10px 5px 0',
          height: '28px' // Consistent height for header with or without title
        }}>
          {title && <h2 style={titleStyle}>{title}</h2>}
          {onAddItem && (
            <button 
              onClick={onAddItem} 
              style={addButtonStyle} 
              title={`Add ${title ? title.slice(0, -1) : 'Item'}`}
              className="add-item-button"
            >
              <FaPlus />
            </button>
          )}
        </div>
      )}
      <div className="section-content">
        {children}
      </div>
    </div>
  );
});

export default SectionContainer;
