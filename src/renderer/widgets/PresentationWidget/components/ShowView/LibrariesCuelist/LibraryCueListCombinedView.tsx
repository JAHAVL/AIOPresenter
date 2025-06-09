import React from 'react';
import type { ThemeColors } from '../../../theme';
import type { Library, Cuelist, PresentationFile, Cue } from '../../../types/presentationSharedTypes';
import LibrariesSection from './LibrariesSection';
import CuelistsSection from './CuelistsSection';
import PresentationsSection from './PresentationsSection';
import SelectedItemContentView from './SelectedItemContentView';
// import TestLibraryDisplay from './TestLibraryDisplay'; // Import the new test component

// This interface includes all original props. Some may not be used by the immediate children 
// (LibrariesSection, CuelistsSection) but are kept for structural consistency with the original component
// and for potential future use if this component's responsibilities expand (e.g., showing cue details).
export interface LibraryCueListCombinedViewProps {
  // Core props

  themeColors: ThemeColors;
  libraries: Library[];
  cuelists: Cuelist[];
  selectedItemId: string | null;
  selectedItemType: 'library' | 'cuelist' | 'folder' | null;
  onSelectItem: (id: string | null, type: 'library' | 'cuelist' | 'folder' | null) => void;
  itemsForCueList: PresentationFile[] | Cue[];
  cueListItemType: 'presentation' | 'cue' | null;
  // Props for library creation and renaming
  onCreateNewLibrary: () => void; // Replaces onAddLibrary
  onRenameLibrarySubmit: (libraryId: string, newName: string) => void;
  editingLibraryId: string | null;
  currentEditName: string;
  onLibraryDoubleClick: (libraryId: string, currentName: string) => void;
  onLibraryNameChange: (newName: string) => void;
  onLibraryNameKeyDown: (event: React.KeyboardEvent<HTMLInputElement>, libraryId: string) => void;

  onAddCuelist: () => void;
  onSelectCue: (cueId: string) => void;
  allCues: Cue[];
  selectedCueId: string | null;
  onAddItemToSelectedList?: () => void; // New prop for the add button in SelectedItemContentView, made optional
  onPresentationCreateAttempted?: (result: { success: boolean; filePath?: string; error?: string }) => void;
  
  // Presentation selection props
  selectedPresentationId?: string | null;
  onSelectPresentation?: (id: string | null) => void;
}

const LibraryCueListCombinedView: React.FC<LibraryCueListCombinedViewProps> = ({
  themeColors,
  libraries,
  cuelists,
  selectedItemId,
  selectedItemType,
  onSelectItem,
  itemsForCueList,
  cueListItemType,
  // Library specific props
  onCreateNewLibrary,
  onRenameLibrarySubmit,
  editingLibraryId,
  currentEditName,
  onLibraryDoubleClick,
  onLibraryNameChange,
  onLibraryNameKeyDown,
  // Other props
  onAddCuelist,
  onSelectCue,
  selectedCueId,
  allCues,
  onAddItemToSelectedList = () => { console.warn('onAddItemToSelectedList not implemented or passed'); },
  onPresentationCreateAttempted,
  // Presentation selection props
  selectedPresentationId = null,
  onSelectPresentation = (id) => { console.warn('onSelectPresentation not implemented or passed', id); },
}) => {
  const selectedLibrary = selectedItemType === 'library' && selectedItemId 
    ? libraries.find(lib => lib.id === selectedItemId)
    : null;
  console.log('[LibraryCueListCombinedView] Rendering with two-panel layout...');
  console.log('[LibraryCueListCombinedView] Libraries prop:', libraries);

  const mainPanelStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    backgroundColor: themeColors.panelBackground,
  };

  const leftPanelStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    flex: 1, 
    minWidth: '200px', 
    maxWidth: '400px', 
    borderRight: `1px solid ${themeColors.panelBorder || '#444'}`, 
    overflowY: 'auto', 
  };

  const rightPanelStyle: React.CSSProperties = {
    flex: 2, 
    padding: '10px',
    overflowY: 'auto',
  };

  return (
    <div style={mainPanelStyle}>
      {/* <TestLibraryDisplay libraries={libraries} /> */}
      <div style={leftPanelStyle}>
        <LibrariesSection
          themeColors={themeColors}
          libraries={libraries}
          selectedLibraryId={selectedItemType === 'library' ? selectedItemId : null}
          onSelectLibrary={(id: string | null) => onSelectItem(id, 'library')}
          // Library creation and renaming props
          onCreateNewLibrary={onCreateNewLibrary}
          onRenameLibrarySubmit={onRenameLibrarySubmit}
          editingLibraryId={editingLibraryId}
          currentEditName={currentEditName}
          onLibraryDoubleClick={onLibraryDoubleClick}
          onLibraryNameChange={onLibraryNameChange}
          onLibraryNameKeyDown={onLibraryNameKeyDown}
        />
        <CuelistsSection
          themeColors={themeColors}
          cuelists={cuelists}
          selectedCuelistId={selectedItemType === 'cuelist' ? selectedItemId : null}
          onSelectCuelist={(id: string | null) => onSelectItem(id, 'cuelist')}
          onAddCuelist={onAddCuelist}
        />
      </div>
      <div style={rightPanelStyle}>
        {cueListItemType === 'presentation' ? (
          <PresentationsSection
            themeColors={themeColors}
            presentations={itemsForCueList as PresentationFile[]}
            selectedPresentationId={selectedPresentationId}
            onSelectPresentation={onSelectPresentation}
            onAddPresentation={() => {
              console.log('Add presentation clicked');
              onAddItemToSelectedList();
            }}
            libraryPath={selectedLibrary ? selectedLibrary.path : undefined}
          />
        ) : (
          <SelectedItemContentView 
            themeColors={themeColors}
            items={itemsForCueList} // This will be the content of the selected library or cuelist
            itemType={cueListItemType} // This indicates if items are 'presentation' files or 'cues'
            selectedCueId={selectedCueId}
            onSelectCue={onSelectCue}
            onAddItem={onAddItemToSelectedList} // Pass down the new handler
            selectedLibraryPath={selectedLibrary ? selectedLibrary.path : undefined}
            onPresentationCreateAttempted={onPresentationCreateAttempted}
          />
        )}
      </div>
    </div>
  );
};

export default LibraryCueListCombinedView;
