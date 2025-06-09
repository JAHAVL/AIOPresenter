import React, { useState } from 'react';
import { mockSlides } from '../../../data/mockData/mockSlides';
import { defaultDarkThemeColors } from '../../../theme/theme';

/**
 * A simplified test component for slide selection functionality
 */
const SlidesViewTest: React.FC = () => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  
  // Handle slide selection with proper modifier key support
  const handleSlideClick = (slideId: string, event: React.MouseEvent) => {
    console.log('Slide clicked:', {
      id: slideId,
      shift: event.shiftKey,
      ctrl: event.ctrlKey,
      meta: event.metaKey
    });
    
    if (event.shiftKey && lastSelectedId) {
      // Shift key - select range
      const lastIndex = mockSlides.findIndex(s => s.id === lastSelectedId);
      const currentIndex = mockSlides.findIndex(s => s.id === slideId);
      
      if (lastIndex !== -1 && currentIndex !== -1) {
        const startIdx = Math.min(lastIndex, currentIndex);
        const endIdx = Math.max(lastIndex, currentIndex);
        
        const rangeIds = mockSlides
          .slice(startIdx, endIdx + 1)
          .map(slide => slide.id);
        
        if (event.ctrlKey || event.metaKey) {
          // Shift+Ctrl/Cmd - add range to existing selection
          const outsideSelections = selectedIds.filter(id => 
            !mockSlides.slice(startIdx, endIdx + 1).some(slide => slide.id === id)
          );
          setSelectedIds([...new Set([...outsideSelections, ...rangeIds])]);
        } else {
          // Shift only - replace selection with range
          setSelectedIds(rangeIds);
        }
      }
    } else if (event.ctrlKey || event.metaKey) {
      // Ctrl/Cmd key - toggle selection
      setSelectedIds(prev => {
        if (prev.includes(slideId)) {
          return prev.filter(id => id !== slideId);
        } else {
          return [...prev, slideId];
        }
      });
      setLastSelectedId(slideId);
    } else {
      // Normal click - select single
      setSelectedIds([slideId]);
      setLastSelectedId(slideId);
    }
  };
  
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: defaultDarkThemeColors.panelBackground,
      color: defaultDarkThemeColors.text,
      height: '100vh',
      overflow: 'auto'
    }}>
      <h2>Slide Selection Test</h2>
      <div>Selected: {selectedIds.join(', ')}</div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '10px',
        marginTop: '20px'
      }}>
        {mockSlides.map((slide, index) => {
          const isSelected = selectedIds.includes(slide.id);
          
          return (
            <div
              key={slide.id}
              onClick={(e) => handleSlideClick(slide.id, e)}
              style={{
                backgroundColor: isSelected ? '#2a5885' : '#333',
                padding: '10px',
                borderRadius: '4px',
                cursor: 'pointer',
                border: isSelected ? '2px solid #4a90e2' : '1px solid #555',
                minHeight: '100px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative'
              }}
            >
              <div style={{ 
                position: 'absolute', 
                top: '5px', 
                left: '5px',
                backgroundColor: isSelected ? '#4a90e2' : '#555',
                color: '#fff',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '12px'
              }}>
                {index + 1}
              </div>
              <div>{slide.name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SlidesViewTest;
