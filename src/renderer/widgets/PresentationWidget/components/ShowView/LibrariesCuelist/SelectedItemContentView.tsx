import React from 'react';
import type { ThemeColors } from '../../../theme';
import type { PresentationFile, Cue } from '../../../types/presentationSharedTypes';
import { FaPlus } from 'react-icons/fa';

export interface SelectedItemContentViewProps {
  themeColors: ThemeColors;
  items: (PresentationFile | Cue)[];
  itemType: 'presentation' | 'cue' | null;
  selectedCueId: string | null;
  onSelectCue: (cueId: string) => void;
  onAddItem: () => void; // New prop for adding items to the current list
  // Potentially add onSelectItem for library files if needed
}

const SelectedItemContentView: React.FC<SelectedItemContentViewProps> = ({
  themeColors,
  items,
  itemType,
  selectedCueId,
  onSelectCue,
  onAddItem,
}) => {
  console.log('[SelectedItemContentView] Rendering. Items:', items, 'Type:', itemType);

  const itemStyle = (isSelected: boolean, item: PresentationFile | Cue): React.CSSProperties => ({
    padding: '8px 12px',
    border: isSelected ? `2px solid ${themeColors.accentColor || themeColors.panelBorder}` : `1px solid ${themeColors.panelBorder || '#ccc'}`,
    backgroundColor: isSelected ? (themeColors.selectedItemBackground || themeColors.accentColor) : themeColors.panelBackground,
    color: isSelected ? (themeColors.selectedItemText || themeColors.textOnAccentColor || themeColors.textColor) : themeColors.textColor,
    transition: 'background-color 0.2s ease-in-out',
  });

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end', // Position button to the right
    alignItems: 'center',
    padding: '0 0 10px 0', // Padding at the bottom
    // borderBottom: `1px solid ${themeColors.panelBorder}`, // Optional: separator line
  };

  const addButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: themeColors.textColor,
    cursor: 'pointer',
    fontSize: '18px', // Slightly larger icon for this panel
    padding: '5px',
  };

  const getAddItemButtonTitle = () => {
    if (itemType === 'presentation') return 'Add Presentation File';
    if (itemType === 'cue') return 'Add Cue';
    return 'Add Item';
  };

  if (!items || items.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={headerStyle}>
          <button onClick={onAddItem} style={addButtonStyle} title={getAddItemButtonTitle()}>
            <FaPlus />
          </button>
        </div>
        <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: themeColors.textColor, textAlign: 'center' }}>No items to display.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ overflowY: 'auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={headerStyle}>
        <button onClick={onAddItem} style={addButtonStyle} title={getAddItemButtonTitle()}>
          <FaPlus />
        </button>
      </div>
      <div style={{ flexGrow: 1, overflowY: 'auto' }}> {/* This div will scroll */} 
        {items.map((item) => {
          const id = (item as PresentationFile | Cue).id; // Both types have 'id'
          const isSelected = itemType === 'cue' && (item as Cue).id === selectedCueId;

          return (
            <div 
              key={id}
              style={itemStyle(isSelected, item)}
              onClick={() => {
                if (itemType === 'cue' && 'id' in item) {
                  onSelectCue(item.id);
                }
                // Handle selection for library items (PresentationFile) if needed
              }}
            >
              {itemType === 'presentation' ? (
                // item is PresentationFile
                <span>{(item as PresentationFile).name}</span>
              ) : (
                // item is Cue
                <span>{(item as Cue).name}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SelectedItemContentView;
