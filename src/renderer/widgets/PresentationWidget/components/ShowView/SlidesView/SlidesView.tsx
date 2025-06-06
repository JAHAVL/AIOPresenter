import React from 'react';
import SlideItem from './SlideItem';
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
  console.log('[SlidesView] Rendering with slides:', slides?.length || 0);
  
  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      backgroundColor: themeColors.panelBackground, 
      color: themeColors.textColor, 
      boxSizing: 'border-box',
      padding: '10px',
      overflow: 'auto'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: '12px',
        padding: '5px'
      }}>
        {slides && slides.length > 0 ? (
          slides.map((slide, index) => (
            <SlideItem
              key={slide.id}
              slide={slide}
              themeColors={themeColors}
              isSelected={selectedSlideIds?.includes(slide.id) || false}
              onSelect={(event) => onSelectSlide(slide.id, event)}
              thumbnailUrl="" // Add thumbnail generation logic later
              slideIndex={index}
              minWidth={120}
              cueId={slide.id} // Using slide.id as cueId for now
            />
          ))
        ) : (
          <div style={{ 
            gridColumn: '1 / -1', 
            padding: '20px', 
            textAlign: 'center',
            color: themeColors.textColor
          }}>
            No slides available
          </div>
        )}
      </div>
    </div>
  );
};

export default SlidesView;
