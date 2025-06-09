import React from 'react';
import type { ThemeColors } from '../../../theme';
import type { Cuelist } from '../../../types/presentationSharedTypes';
import { SectionContainer, SelectableItem } from '../../common';

// Type assertion helper to ensure theme compatibility
const asCompatibleTheme = (theme: ThemeColors): any => theme;

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
  // Use our type assertion helper to ensure theme compatibility
  const compatibleTheme = asCompatibleTheme(themeColors);
  
  return (
    <SectionContainer
      title="Cuelists"
      themeColors={compatibleTheme}
      onAddItem={onAddCuelist}
      className="cuelists-section"
    >
      {cuelists.length === 0 ? (
        <p style={{ color: themeColors.textColor }}>No Cuelists Yet</p>
      ) : (
        cuelists.map(cuelist => (
          <SelectableItem
            key={cuelist.id}
            id={cuelist.id}
            isSelected={selectedCuelistId === cuelist.id}
            themeColors={compatibleTheme}
            onClick={() => onSelectCuelist(cuelist.id)}
            className="cuelist-item"
          >
            {cuelist.name}
          </SelectableItem>
        ))
      )}
    </SectionContainer>
  );
};

export default CuelistsSection;
