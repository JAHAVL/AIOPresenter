import React from 'react';
import SlideEditingView from '../../../views/SlideEditingView';
import type { ThemeColors } from '../../../theme';
import type { Slide } from '../../../types/presentationSharedTypes';

// Define the props interface for SlidesView
export interface SlidesViewProps {
  themeColors: ThemeColors;
  slides: Slide[];
  selectedSlideIds: string[];
  onSelectSlide: (slideId: string, event?: React.MouseEvent) => void;
  onUpdateSlides: (updatedSlides: Slide[]) => void;
}

const SlidesView: React.FC<SlidesViewProps> = ({
  themeColors,
  slides,
  selectedSlideIds,
  onSelectSlide,
  onUpdateSlides
}) => {
  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: themeColors.panelBackground, color: themeColors.textColor, boxSizing: 'border-box' }}>
      <SlideEditingView
        themeColors={themeColors}
        slides={slides}
        selectedSlideIds={selectedSlideIds}
        onSelectSlide={onSelectSlide}
        onUpdateSlides={onUpdateSlides}
      />
    </div>
  );
};

export default SlidesView;
