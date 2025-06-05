import React from 'react';
import type { ThemeColors } from '../../../theme';
import type { Library } from '../../../types/presentationSharedTypes';
import { FaPlus } from 'react-icons/fa';

export interface LibrariesSectionProps {
  themeColors: ThemeColors;
  libraries: Library[];
  selectedLibraryId: string | null;
  onSelectLibrary: (id: string | null) => void;
  onAddLibrary: () => void;
}

const LibrariesSection: React.FC<LibrariesSectionProps> = ({
  themeColors,
  libraries,
  selectedLibraryId,
  onSelectLibrary,
  onAddLibrary,
}) => {
  console.log('[LibrariesSection] Received libraries prop:', JSON.stringify(libraries, null, 2));
  console.log('[LibrariesSection] Number of libraries to display:', libraries.length);

  const containerStyle: React.CSSProperties = {
    padding: '10px',
    // height: '50%', // Or manage height via flex settings in parent
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: '0 0 10px 0',
    paddingBottom: '5px',
    borderBottom: `1px solid ${themeColors.panelBorder}`,
  };

  const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: '16px',
    color: themeColors.textColor,
  };

  const addButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: themeColors.textColor,
    cursor: 'pointer',
    fontSize: '16px',
    padding: '5px',
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={titleStyle}>Libraries</h2>
        <button onClick={onAddLibrary} style={addButtonStyle} title="Add Library">
          <FaPlus />
        </button>
      </div>
      {libraries.length === 0 ? (
        <p style={{ color: themeColors.textColor }}>No Libraries Yet</p>
      ) : (
        libraries.map(library => (
          <div 
            key={library.id} 
            onClick={() => onSelectLibrary(library.id)} 
            style={{
              padding: '8px', 
              margin: '4px 0', 
              backgroundColor: selectedLibraryId === library.id 
                ? (themeColors.selectedItemBackground || themeColors.accentColor || themeColors.buttonBackground) 
                : themeColors.panelBackground,
              color: selectedLibraryId === library.id 
                ? (themeColors.selectedItemText || themeColors.textOnAccentColor || themeColors.buttonText || themeColors.textColor) 
                : themeColors.textColor,
              borderRadius: '4px', 
              cursor: 'pointer',
            }}
          >
            {library.name}
          </div>
        ))
      )}
    </div>
  );
};

export default LibrariesSection;
