import React from 'react';
import type { ThemeColors } from '../../../theme';
import type { Cuelist } from '../../../types/presentationSharedTypes';
import { FaPlus } from 'react-icons/fa';

export interface CuelistsSectionProps {
  themeColors: ThemeColors;
  cuelists: Cuelist[];
  selectedCuelistId: string | null;
  onSelectCuelist: (id: string | null) => void;
  onAddCuelist: () => void;
}

const CuelistsSection: React.FC<CuelistsSectionProps> = ({
  themeColors,
  cuelists,
  selectedCuelistId,
  onSelectCuelist,
  onAddCuelist,
}) => {
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
    margin: '10px 0 10px 0',
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
        <h2 style={titleStyle}>Cuelists</h2>
        <button onClick={onAddCuelist} style={addButtonStyle} title="Add Cuelist">
          <FaPlus />
        </button>
      </div>
      {cuelists.length === 0 ? (
        <p style={{ color: themeColors.textColor }}>No Cuelists Yet</p>
      ) : (
        cuelists.map(cuelist => (
          <div 
            key={cuelist.id} 
            onClick={() => onSelectCuelist(cuelist.id)} 
            style={{
              padding: '8px', 
              margin: '4px 0', 
              backgroundColor: selectedCuelistId === cuelist.id 
                ? (themeColors.selectedItemBackground || themeColors.accentColor || themeColors.buttonBackground) 
                : themeColors.panelBackground,
              color: selectedCuelistId === cuelist.id 
                ? (themeColors.selectedItemText || themeColors.textOnAccentColor || themeColors.buttonText || themeColors.textColor) 
                : themeColors.textColor,
              borderRadius: '4px', 
              cursor: 'pointer',
            }}
          >
            {cuelist.name}
          </div>
        ))
      )}
    </div>
  );
};

export default CuelistsSection;
