import React from 'react';
import type { ThemeColors } from '../../../theme';
import type { Library } from '../../../types/presentationSharedTypes';
import { FaPlus } from 'react-icons/fa';

export interface LibrariesSectionProps {
  themeColors: ThemeColors;
  libraries: Library[];
  selectedLibraryId: string | null;
  onSelectLibrary: (id: string | null) => void;
  // New props for library creation and renaming
  onCreateNewLibrary: () => void;
  onRenameLibrarySubmit: (libraryId: string, newName: string) => void;
  editingLibraryId: string | null;
  currentEditName: string;
  onLibraryDoubleClick: (libraryId: string, currentName: string) => void;
  onLibraryNameChange: (newName: string) => void;
  onLibraryNameKeyDown: (event: React.KeyboardEvent<HTMLInputElement>, libraryId: string) => void;
}

const LibrariesSection: React.FC<LibrariesSectionProps> = ({
  themeColors,
  libraries,
  selectedLibraryId,
  onSelectLibrary,
  onCreateNewLibrary, // New prop
  onRenameLibrarySubmit, // New prop
  editingLibraryId, // New prop
  currentEditName, // New prop
  onLibraryDoubleClick, // New prop
  onLibraryNameChange, // New prop
  onLibraryNameKeyDown, // New prop
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
        <button onClick={onCreateNewLibrary} style={addButtonStyle} title="Add Library">
          <FaPlus />
        </button>
      </div>
      {libraries.length === 0 ? (
        <p style={{ color: themeColors.textColor }}>No Libraries Yet</p>
      ) : (
        libraries.map(library => {
          console.log(`[LibrariesSection] Rendering item. Library ID: ${library.id}, Name: ${library.name}, editingLibraryId: ${editingLibraryId}, IsEditingThis: ${editingLibraryId === library.id}`);
          return (
            <div 
              key={library.id} 
            onClick={() => editingLibraryId !== library.id && onSelectLibrary(library.id)} // Prevent selection when editing
            onDoubleClick={() => editingLibraryId !== library.id && onLibraryDoubleClick(library.id, library.name)} // Prevent double click when already editing
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
              cursor: editingLibraryId === library.id ? 'default' : 'pointer',
            }}
          >
            {editingLibraryId === library.id ? (
              <input
                type="text"
                value={currentEditName}
                onFocus={() => {
                  console.log(`[LibrariesSection] INPUT FOCUSED for library ${library.name} (ID: ${library.id})`);
                }}
                onChange={(e) => {
                  console.log("[LibrariesSection] RAW INPUT EVENT:", e); // Log the raw event object
                  console.log(`[LibrariesSection] onChange triggered. New value: '${e.target.value}'`);
                  onLibraryNameChange(e.target.value);
                }}
                onKeyDown={(e) => {
                  console.log(`[LibrariesSection] onKeyDown triggered. Key: '${e.key}', Library ID: ${library.id}`);
                  onLibraryNameKeyDown(e, library.id);
                }}
                onBlur={() => {
                  console.log(`[LibrariesSection] onBlur triggered for library ${library.id}. Current edit name: '${currentEditName}'. Submitting...`);
                  onRenameLibrarySubmit(library.id, currentEditName);
                }}
                autoFocus
                style={{
                  width: '100%',
                  padding: '6px',
                  margin: '-6px', // Offset padding of parent to fill space
                  border: `1px solid ${themeColors.inputBorder || themeColors.accentColor}`,
                  borderRadius: '3px',
                  backgroundColor: themeColors.inputBackground || themeColors.panelBackground,
                  color: themeColors.inputText || themeColors.textColor,
                  boxSizing: 'border-box',
                }}
              />
            ) : (
              library.name
            )}
          </div>
          );
        })
      )}
    </div>
  );
};

export default LibrariesSection;
