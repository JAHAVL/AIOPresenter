import React, { useState, useEffect } from 'react';

/**
 * A simple component to test keyboard events
 */
const KeyboardTest: React.FC = () => {
  const [keyState, setKeyState] = useState({
    shiftKey: false,
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    lastKey: ''
  });
  
  // Handle keydown events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeyState({
        shiftKey: e.shiftKey,
        ctrlKey: e.ctrlKey,
        metaKey: e.metaKey,
        altKey: e.altKey,
        lastKey: e.key
      });
    };
    
    // Handle keyup events
    const handleKeyUp = (e: KeyboardEvent) => {
      setKeyState(prev => ({
        ...prev,
        shiftKey: e.shiftKey,
        ctrlKey: e.ctrlKey,
        metaKey: e.metaKey,
        altKey: e.altKey
      }));
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  
  // Test grid of items
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [lastSelectedItem, setLastSelectedItem] = useState<number | null>(null);
  
  const handleItemClick = (index: number, e: React.MouseEvent) => {
    console.log('Item clicked:', {
      index,
      shift: e.shiftKey,
      ctrl: e.ctrlKey,
      meta: e.metaKey
    });
    
    // Handle selection based on modifier keys
    if (e.shiftKey && lastSelectedItem !== null) {
      // Range selection
      const start = Math.min(lastSelectedItem, index);
      const end = Math.max(lastSelectedItem, index);
      const range = Array.from(
        { length: end - start + 1 },
        (_, i) => start + i
      );
      
      if (e.ctrlKey || e.metaKey) {
        // Add range to existing selection
        const outsideSelection = selectedItems.filter(
          item => item < start || item > end
        );
        setSelectedItems([...new Set([...outsideSelection, ...range])]);
      } else {
        // Replace selection with range
        setSelectedItems(range);
      }
    } else if (e.ctrlKey || e.metaKey) {
      // Toggle selection
      if (selectedItems.includes(index)) {
        setSelectedItems(selectedItems.filter(item => item !== index));
      } else {
        setSelectedItems([...selectedItems, index]);
      }
      setLastSelectedItem(index);
    } else {
      // Single selection
      setSelectedItems([index]);
      setLastSelectedItem(index);
    }
  };
  
  return (
    <div style={{ padding: '20px', backgroundColor: '#121212', color: '#fff', height: '100vh' }}>
      <h2>Keyboard Event Test</h2>
      
      <div style={{ 
        marginBottom: '20px', 
        padding: '10px', 
        backgroundColor: '#333', 
        borderRadius: '4px' 
      }}>
        <div>Shift: {keyState.shiftKey ? 'ON' : 'off'}</div>
        <div>Ctrl: {keyState.ctrlKey ? 'ON' : 'off'}</div>
        <div>Meta/Cmd: {keyState.metaKey ? 'ON' : 'off'}</div>
        <div>Alt: {keyState.altKey ? 'ON' : 'off'}</div>
        <div>Last Key: {keyState.lastKey}</div>
      </div>
      
      <div>
        <h3>Selection Test</h3>
        <div>Selected: {selectedItems.join(', ')}</div>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(5, 1fr)', 
          gap: '10px',
          marginTop: '10px'
        }}>
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={i}
              onClick={(e) => handleItemClick(i, e)}
              style={{
                padding: '20px',
                backgroundColor: selectedItems.includes(i) ? '#4a90e2' : '#333',
                borderRadius: '4px',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              Item {i + 1}
            </div>
          ))}
        </div>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h3>Mouse Event Test</h3>
        <div 
          style={{ 
            padding: '20px', 
            backgroundColor: '#333', 
            borderRadius: '4px',
            marginTop: '10px'
          }}
          onMouseDown={(e) => {
            console.log('MouseDown Event:', {
              shiftKey: e.shiftKey,
              ctrlKey: e.ctrlKey,
              metaKey: e.metaKey,
              altKey: e.altKey
            });
          }}
        >
          Click here with modifier keys to test
        </div>
      </div>
    </div>
  );
};

export default KeyboardTest;
