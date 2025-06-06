import React from 'react';
import type { ThemeColors } from '../../../theme';
import type { Library, Cuelist, PresentationFile, Cue } from '../../../types/presentationSharedTypes';
import LibrariesSection from './LibrariesSection';
import CuelistsSection from './CuelistsSection';
import SelectedItemContentView from './SelectedItemContentView';
// import TestLibraryDisplay from './TestLibraryDisplay'; // Import the new test component

// This interface includes all original props. Some may not be used by the immediate children 
// (LibrariesSection, CuelistsSection) but are kept for structural consistency with the original component
// and for potential future use if this component's responsibilities expand (e.g., showing cue details).
export interface LibraryCueListCombinedViewProps {
  themeColors: ThemeColors;
  libraries: Library[];
  cuelists: Cuelist[];
  selectedItemId: string | null;
  selectedItemType: 'library' | 'cuelist' | 'folder' | null;
  onSelectItem: (id: string | null, type: 'library' | 'cuelist' | 'folder' | null) => void;
  itemsForCueList: PresentationFile[] | Cue[];
  cueListItemType: 'presentation' | 'cue' | null;
  onAddLibrary: () => void;
  onAddCuelist: () => void;
  onSelectCue: (cueId: string) => void;
  allCues: Cue[];
  selectedCueId: string | null;
  onAddItemToSelectedList?: () => void; // New prop for the add button in SelectedItemContentView, made optional
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
  onAddLibrary,
  onAddCuelist,
  onSelectCue,
  selectedCueId,
  allCues,
  onAddItemToSelectedList = () => { console.warn('onAddItemToSelectedList not implemented or passed'); }, // Provide a default no-op if not passed
}) => {
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
          onAddLibrary={onAddLibrary}
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
        <SelectedItemContentView 
          themeColors={themeColors}
          items={itemsForCueList} // This will be the content of the selected library or cuelist
          itemType={cueListItemType} // This indicates if items are 'presentation' files or 'cues'
          selectedCueId={selectedCueId}
          onSelectCue={onSelectCue}
          onAddItem={onAddItemToSelectedList} // Pass down the new handler
        />
      </div>
    </div>
  );
};

export default LibraryCueListCombinedView;
