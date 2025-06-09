import React from 'react';
import type { ThemeColors } from '../../../theme';
import type { PresentationFile } from '../../../types/presentationSharedTypes';
import { SectionContainer, SelectableItem } from '../../common';

// Type assertion helper to ensure theme compatibility
const asCompatibleTheme = (theme: ThemeColors): any => theme;

export interface PresentationsSectionProps {
  themeColors: ThemeColors;
  presentations: PresentationFile[];
  selectedPresentationId: string | null;
  onSelectPresentation: (id: string | null) => void;
  onAddPresentation: () => void;
  libraryPath?: string; // Optional path to the current library
}

// Using React.memo for better HMR performance
const PresentationsSection: React.FC<PresentationsSectionProps> = React.memo(({
  themeColors,
  presentations,
  selectedPresentationId,
  onSelectPresentation,
  onAddPresentation,
  libraryPath,
}) => {
  console.log('[PresentationsSection] Rendering with presentations:', presentations);
  console.log('[PresentationsSection] Selected presentation ID:', selectedPresentationId);
  
  // Use our type assertion helper to ensure theme compatibility
  const compatibleTheme = asCompatibleTheme(themeColors);
  
  return (
    <SectionContainer
      title="" // Empty title but keep the header for the add button
      themeColors={compatibleTheme}
      onAddItem={onAddPresentation}
      className="presentations-section"
    >
      {presentations.length === 0 ? (
        <p style={{ color: themeColors.textColor }}>
          {libraryPath ? 'No presentations in this library' : 'Select a library to view presentations'}
        </p>
      ) : (
        presentations.map(presentation => (
          <SelectableItem
            key={presentation.id}
            id={presentation.id}
            isSelected={selectedPresentationId === presentation.id}
            themeColors={compatibleTheme}
            onClick={() => onSelectPresentation(presentation.id)}
            className="presentation-item"
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '8px' }}>
                {getIconForPresentationType(presentation.type)}
              </span>
              {formatPresentationName(presentation.name)}
            </div>
          </SelectableItem>
        ))
      )}
    </SectionContainer>
  );
});

// Add displayName for better debugging in React DevTools
PresentationsSection.displayName = 'PresentationsSection';

// Helper function to get an appropriate icon based on presentation type
const getIconForPresentationType = (type: PresentationFile['type']): string => {
  switch (type) {
    case 'image':
      return '🖼️';
    case 'video':
      return '🎬';
    case 'audio':
      return '🔊';
    case 'custom':
      return '📄';
    default:
      return '📁';
  }
};

// Helper function to remove file extensions from presentation names
const formatPresentationName = (name: string): string => {
  // Remove .AIOPresentation extension if present
  return name.replace(/\.AIOPresentation$/i, '');
};

export default PresentationsSection;
