import React from 'react';
import type { ThemeColors } from '@theme/theme';
import type { SlideElement, TextSlideElement } from '../../../types/presentationSharedTypes';
import TextProperties from './ElementProperties/TextProperties/TextProperties';

interface PropertiesPanelProps {
  themeColors: ThemeColors;
  selectedElement: SlideElement | undefined;
  onUpdateElement: (updatedElement: SlideElement) => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ themeColors, selectedElement, onUpdateElement }) => {
  const handleTextElementUpdate = (updatedTextProps: Partial<TextSlideElement>) => {
    if (selectedElement && selectedElement.type === 'text') {
      // Ensure we're merging with the full TextSlideElement, not just a generic SlideElement
      const currentTextElement = selectedElement as TextSlideElement;
      const updatedElement: TextSlideElement = {
        ...currentTextElement,
        ...updatedTextProps,
      };
      onUpdateElement(updatedElement); // Pass the fully formed TextSlideElement
    }
  };

  const propertiesSectionStyle: React.CSSProperties = {
    flex: '1 1 50%', // Allow shrinking/growing, basis 50%
    minHeight: '100px', // Minimum height before collapsing too much
    backgroundColor: themeColors.secondaryPanelBackground || themeColors.panelBackground,
    borderRadius: '4px',
    padding: '10px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  };

  return (
    <div style={propertiesSectionStyle} data-component-name="PropertiesPanel">
      <h4 style={{ 
        marginTop: 0, 
        marginBottom: '10px', 
        borderBottom: `1px solid ${themeColors.panelBorder}`, 
        paddingBottom: '8px', 
        flexShrink: 0, 
        color: themeColors.headerText || themeColors.text 
      }}>
        Properties
      </h4>
      <div style={{flexGrow: 1, overflowY: 'auto'}}> {/* Inner scroll for properties if they exceed space */}
        {selectedElement ? (
          <div style={{ fontSize: '13px' }}>
            {/* Common Properties - consider moving to a sub-component or function */}
            <p><strong>ID:</strong> {selectedElement.id}</p>
            <p><strong>Type:</strong> {selectedElement.type}</p>
            <p><strong>X:</strong> {selectedElement.position.x.toFixed(1)}</p>
            <p><strong>Y:</strong> {selectedElement.position.y.toFixed(1)}</p>
            <p><strong>Width:</strong> {selectedElement.size.width.toFixed(1)}</p>
            <p><strong>Height:</strong> {selectedElement.size.height.toFixed(1)}</p>
            <p><strong>Rotation:</strong> {selectedElement.rotation}°</p>
            <p><strong>Z-Index:</strong> {selectedElement.zIndex}</p>

            {/* Type-Specific Properties */}
            {selectedElement.type === 'text' && (
              <TextProperties 
                element={selectedElement as TextSlideElement} 
                onUpdateElement={handleTextElementUpdate} 
                themeColors={themeColors} 
              />
            )}

            {selectedElement.type === 'image' && selectedElement.src && (
              <p><strong>Source:</strong> <span style={{wordBreak: 'break-all'}}>{selectedElement.src}</span></p>
            )}

            {selectedElement.type === 'video' && selectedElement.src && (
              <p><strong>Source:</strong> <span style={{wordBreak: 'break-all'}}>{selectedElement.src}</span></p>
            )}
          </div>
        ) : (
          <p style={{color: themeColors.mutedText, fontSize: '13px'}}>
            Select an element on the slide to see its properties.
          </p>
        )}
      </div>
    </div>
  );
};

export default PropertiesPanel;
