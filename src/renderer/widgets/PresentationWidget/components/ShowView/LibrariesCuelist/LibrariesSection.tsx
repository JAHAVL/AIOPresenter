import React from 'react';
import type { ThemeColors } from '../../../theme';
import type { Library } from '../../../types/presentationSharedTypes';
import { SectionContainer, EditableSelectableItem } from '../../common';

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
  onCreateNewLibrary,
  onRenameLibrarySubmit,
  editingLibraryId,
  currentEditName,
  onLibraryDoubleClick,
  onLibraryNameChange,
  onLibraryNameKeyDown,
}) => {
  console.log('[LibrariesSection] Received libraries prop:', JSON.stringify(libraries, null, 2));
  console.log('[LibrariesSection] Number of libraries to display:', libraries.length);

  const handleEditSubmit = (libraryId: string, newName: string) => {
    console.log(`[LibrariesSection] handleEditSubmit called for library ${libraryId} with new name: '${newName}'`);
    onRenameLibrarySubmit(libraryId, newName);
  };

  const handleStartEdit = (libraryId: string, currentName: string) => {
    console.log(`[LibrariesSection] handleStartEdit called for library ${libraryId} with current name: '${currentName}'`);
    onLibraryDoubleClick(libraryId, currentName);
  };

  return (
    <SectionContainer
      title="Libraries"
      themeColors={themeColors}
      onAddItem={onCreateNewLibrary}
      className="libraries-section"
    >
      {libraries.length === 0 ? (
        <p style={{ color: themeColors.textColor }}>No Libraries Yet</p>
      ) : (
        libraries.map(library => {
          console.log(`[LibrariesSection] Rendering item. Library ID: ${library.id}, Name: ${library.name}, editingLibraryId: ${editingLibraryId}, IsEditingThis: ${editingLibraryId === library.id}`);
          const isEditing = editingLibraryId === library.id;
          
          return (
            <EditableSelectableItem
              key={library.id}
              id={library.id}
              isSelected={selectedLibraryId === library.id}
              isEditing={isEditing}
              initialValue={library.name}
              themeColors={themeColors}
              onSelect={() => !isEditing && onSelectLibrary(library.id)}
              onStartEdit={() => handleStartEdit(library.id, library.name)}
              onEditSubmit={(value) => handleEditSubmit(library.id, value)}
              onEditCancel={() => onRenameLibrarySubmit(library.id, library.name)}
              onKeyDown={(e) => onLibraryNameKeyDown(e, library.id)}
              className="library-item"
            />
          );
        })
      )}
    </SectionContainer>
  );
};

export default LibrariesSection;
