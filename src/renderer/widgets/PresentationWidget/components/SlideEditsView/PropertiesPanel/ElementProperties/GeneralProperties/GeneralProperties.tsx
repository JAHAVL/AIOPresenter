import React from 'react';
import { ThemeColors } from '@theme/theme';
import { SlideElement } from '@projectTypes/slideElements'; // Using base SlideElement

interface GeneralPropertiesProps {
  element: SlideElement; // Accepts any slide element
  onUpdateElement: (updatedElement: Partial<SlideElement>) => void;
  themeColors: ThemeColors;
}

const GeneralProperties: React.FC<GeneralPropertiesProps> = ({ element, onUpdateElement, themeColors }) => {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'name') {
      onUpdateElement({ name: value });
    } else {
      // For numeric properties: x, y, width, height, rotation, opacity
      let numericValue = parseFloat(value);
      if (isNaN(numericValue)) {
        numericValue = 0; // Default to 0 if input is cleared or not a valid number
      }

      if (name === 'x' || name === 'y') {
        onUpdateElement({ position: { ...element.position, [name]: numericValue } });
      } else if (name === 'width' || name === 'height') {
        onUpdateElement({ size: { ...element.size, [name]: numericValue } });
      } else if (name === 'rotation') {
        onUpdateElement({ rotation: numericValue });
      } else if (name === 'opacity') {
        // Opacity is between 0 and 1
        numericValue = Math.max(0, Math.min(1, numericValue));
        onUpdateElement({ opacity: numericValue });
      }
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    backgroundColor: themeColors.inputBackground || '#2a2a2a',
    color: themeColors.inputText || '#ffffff',
    border: `1px solid ${themeColors.inputBorder || '#444'}`,  
    borderRadius: '3px',
    padding: '6px 8px',
    fontSize: '13px',
    marginBottom: '10px',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '5px',
    fontSize: '12px',
    fontWeight: 500,
    color: themeColors.text || '#cccccc',
  };

  const groupStyle: React.CSSProperties = {
    marginBottom: '15px',
    paddingBottom: '15px',
    borderBottom: `1px solid ${themeColors.panelBorder || '#444'}`,
  };
  
  const lastGroupStyle: React.CSSProperties = {
    ...groupStyle,
    borderBottom: 'none',
    marginBottom: '0px',
    paddingBottom: '0px',
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
  };

  return (
    <div style={{ color: themeColors.text || '#ccc', marginTop: '15px', paddingTop: '15px', borderTop: `1px solid ${themeColors.panelBorder || '#444'}` }}>
      <h5 style={{ marginTop: 0, marginBottom: '15px', color: themeColors.headerText || themeColors.text }}>General Properties</h5>
      
      <div style={groupStyle}>
        <div style={gridStyle}>
          <div>
            <label htmlFor="x" style={labelStyle}>X (px):</label>
            <input type="number" id="x" name="x" value={element.position.x} onChange={handleInputChange} style={inputStyle} />
          </div>
          <div>
            <label htmlFor="y" style={labelStyle}>Y (px):</label>
            <input type="number" id="y" name="y" value={element.position.y} onChange={handleInputChange} style={inputStyle} />
          </div>
        </div>
      </div>

      <div style={groupStyle}>
        <div style={gridStyle}>
          <div>
            <label htmlFor="width" style={labelStyle}>Width (px):</label>
            <input type="number" id="width" name="width" value={element.size.width} min="0" onChange={handleInputChange} style={inputStyle} />
          </div>
          <div>
            <label htmlFor="height" style={labelStyle}>Height (px):</label>
            <input type="number" id="height" name="height" value={element.size.height} min="0" onChange={handleInputChange} style={inputStyle} />
          </div>
        </div>
      </div>

      <div style={groupStyle}>
        <div style={gridStyle}>
          <div>
            <label htmlFor="rotation" style={labelStyle}>Rotation (°):</label>
            <input type="number" id="rotation" name="rotation" value={element.rotation} onChange={handleInputChange} style={inputStyle} />
          </div>
          <div>
            <label htmlFor="opacity" style={labelStyle}>Opacity (0-1):</label>
            <input type="number" id="opacity" name="opacity" value={element.opacity} step="0.01" min="0" max="1" onChange={handleInputChange} style={inputStyle} />
          </div>
        </div>
      </div>

      <div style={lastGroupStyle}>
        <label htmlFor="name" style={labelStyle}>Element Name (ID):</label>
        <input type="text" id="name" name="name" value={element.name || ''} onChange={handleInputChange} style={inputStyle} placeholder="Optional name for layer panel"/>
      </div>

    </div>
  );
};

export default GeneralProperties;
