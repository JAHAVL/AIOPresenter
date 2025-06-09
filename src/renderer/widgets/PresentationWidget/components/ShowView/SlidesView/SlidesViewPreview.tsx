import React, { useState } from 'react';
import SlidesView from './SlidesView';
import SlidesViewTest from './SlidesViewTest';
import KeyboardTest from './KeyboardTest';
import { mockSlides } from '../../../data/mockData/mockSlides';
import { defaultDarkThemeColors } from '../../../theme/theme';

/**
 * Preview component for SlidesView with mock data
 */
const SlidesViewPreview: React.FC = () => {
  const [activeComponent, setActiveComponent] = useState<'regular' | 'test' | 'keyboard'>('regular');
  const [selectedSlideIds, setSelectedSlideIds] = useState<string[]>([]);
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  
  const handleSelectSlide = (slideId: string, event?: React.MouseEvent) => {
    console.log('Preview handling selection:', { 
      slideId, 
      shiftKey: event?.shiftKey, 
      ctrlKey: event?.ctrlKey, 
      metaKey: event?.metaKey 
    });
    
    // Implement proper selection logic with modifier keys
    if (event?.shiftKey && lastSelectedId) {
      // Range selection with Shift key
      const lastSelectedIndex = mockSlides.findIndex(slide => slide.id === lastSelectedId);
      const currentIndex = mockSlides.findIndex(slide => slide.id === slideId);
      
      if (lastSelectedIndex !== -1 && currentIndex !== -1) {
        const startIdx = Math.min(lastSelectedIndex, currentIndex);
        const endIdx = Math.max(lastSelectedIndex, currentIndex);
        
        const rangeIds = mockSlides
          .slice(startIdx, endIdx + 1)
          .map(slide => slide.id);
        
        if (event.ctrlKey || event.metaKey) {
          // Shift+Ctrl/Cmd - add range to existing selection
          const outsideSelections = selectedSlideIds.filter(id => 
            !mockSlides.slice(startIdx, endIdx + 1).some(slide => slide.id === id)
          );
          setSelectedSlideIds([...new Set([...outsideSelections, ...rangeIds])]);
        } else {
          // Shift only - replace selection with range
          setSelectedSlideIds(rangeIds);
        }
      }
    } else if (event?.ctrlKey || event?.metaKey) {
      // Ctrl/Cmd key - toggle selection
      if (selectedSlideIds.includes(slideId)) {
        setSelectedSlideIds(selectedSlideIds.filter(id => id !== slideId));
      } else {
        setSelectedSlideIds([...selectedSlideIds, slideId]);
      }
      setLastSelectedId(slideId);
    } else {
      // Normal click - select single
      setSelectedSlideIds([slideId]);
      setLastSelectedId(slideId);
    }
  };
  
  return (
    <div style={{ padding: '20px', backgroundColor: defaultDarkThemeColors.panelBackground, height: '100vh' }}>
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => setActiveComponent('regular')}
          style={{
            padding: '8px 16px',
            backgroundColor: activeComponent === 'regular' ? defaultDarkThemeColors.accent : '#444',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Regular Component
        </button>
        
        <button 
          onClick={() => setActiveComponent('test')}
          style={{
            padding: '8px 16px',
            backgroundColor: activeComponent === 'test' ? defaultDarkThemeColors.accent : '#444',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Test Component
        </button>
        
        <button 
          onClick={() => setActiveComponent('keyboard')}
          style={{
            padding: '8px 16px',
            backgroundColor: activeComponent === 'keyboard' ? defaultDarkThemeColors.accent : '#444',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Keyboard Test
        </button>
        
        <span style={{ color: defaultDarkThemeColors.text, marginLeft: '10px' }}>
          Selected: {selectedSlideIds.join(', ')}
        </span>
      </div>
      
      {activeComponent === 'test' && <SlidesViewTest />}
      {activeComponent === 'keyboard' && <KeyboardTest />}
      {activeComponent === 'regular' && (
        <SlidesView 
          slides={mockSlides} 
          themeColors={defaultDarkThemeColors}
          selectedSlideIds={selectedSlideIds}
          onSelectSlide={handleSelectSlide}
          onUpdateSlides={() => console.log('Update slides called')}
        />
      )}
    </div>
  );
};

export default SlidesViewPreview;
