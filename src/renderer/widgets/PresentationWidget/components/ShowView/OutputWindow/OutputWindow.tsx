import React, { useState, useCallback } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import type { OutputItem } from '../../../types/presentationSharedTypes';
import type { ThemeColors } from '../../../theme/theme';

export interface OutputWindowProps {
  themeColors: ThemeColors;
  availableOutputs: OutputItem[];
}

interface OutputCardProps {
  output: OutputItem;
  themeColors: ThemeColors;
  onClick: () => void;
  isSelected?: boolean;
}

// Individual output card component for the grid view
const OutputCard: React.FC<OutputCardProps> = ({ output, themeColors, onClick, isSelected = false }) => {
  const cardStyle: React.CSSProperties = {
    backgroundColor: themeColors.panelBackground || '#2a2a2a',
    color: themeColors.textColor || '#e0e0e0',
    border: `1px solid ${isSelected ? themeColors.selectedItemAccentColor || '#4a90e2' : themeColors.panelBorder || '#444'}`,
    borderRadius: '4px',
    padding: '4px',
    display: 'flex',
    flexDirection: 'column',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
    boxShadow: isSelected ? '0 4px 8px rgba(0,0,0,0.2)' : 'none',
    overflow: 'hidden',
    maxWidth: '100%',
    justifyContent: 'space-between',
  };

  const headerStyle: React.CSSProperties = {
    fontWeight: 'bold',
    marginBottom: '2px',
    fontSize: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '18px',
  };

  const contentContainerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    marginBottom: '2px',
  };
  
  const contentStyle: React.CSSProperties = {
    position: 'relative',
    width: '70%',
    height: 0,
    paddingBottom: '39.375%', // 16:9 aspect ratio (70% * 56.25% = 39.375%)
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: '3px',
    overflow: 'hidden',
    marginLeft: 'auto',
    marginRight: 'auto',
  };

  const contentInnerStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    color: themeColors.textSecondary || '#aaa',
  };

  // Audio level indicator if available
  const renderAudioLevel = () => {
    if (typeof output.audioLevel === 'number') {
      const audioLevelContainerStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
      };
      
      const audioLevelStyle: React.CSSProperties = {
        width: '6px',
        height: '100%',
        backgroundColor: '#333',
        borderRadius: '2px',
        overflow: 'hidden',
        position: 'relative',
      };

      // Create a gradient background for the audio meter
      const getAudioMeterBackground = () => {
        return (
          'linear-gradient(to top, ' +
          '#4caf50 0%, ' +                // Green from 0-70%
          '#4caf50 70%, ' +
          '#ffeb3b 70%, ' +               // Yellow from 70-85%
          '#ffeb3b 85%, ' +
          '#ff4d4d 85%, ' +               // Red from 85-100%
          '#ff4d4d 100%)'
        );
      };
      
      const audioLevelFillStyle: React.CSSProperties = {
        width: '100%',
        height: `${output.audioLevel}%`,
        backgroundImage: getAudioMeterBackground(),
        transition: 'height 0.2s ease',
        position: 'absolute',
        bottom: 0,
        boxShadow: '0 0 3px rgba(0,0,0,0.3) inset',
      };

      return (
        <div style={audioLevelContainerStyle}>
          <div style={{...audioLevelStyle, marginLeft: '8px'}}>
            <div style={audioLevelFillStyle} />
          </div>
          <div style={{...audioLevelStyle, marginRight: '8px'}}>
            <div style={audioLevelFillStyle} />
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={cardStyle} onClick={onClick}>
      <div style={headerStyle}>
        <span>{output.name}</span>
      </div>
      <div style={contentContainerStyle}>
        <div style={contentStyle}>
          <div style={contentInnerStyle}>
            {output.contentPreview || 'No Preview'}
          </div>
        </div>
        {renderAudioLevel()}
      </div>
    </div>
  );
};

const OutputWindow: React.FC<OutputWindowProps> = ({ themeColors, availableOutputs }) => {
  const [selectedOutputId, setSelectedOutputId] = useState<string | null>(null);

  const handleOutputClick = useCallback((outputId: string) => {
    setSelectedOutputId(outputId);
  }, []);

  const handleBackClick = useCallback(() => {
    setSelectedOutputId(null);
  }, []);

  // Container style for the entire output window
  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: themeColors.panelBackground || '#2a2a2a',
    color: themeColors.textColor || '#e0e0e0',
    display: 'flex',
    flexDirection: 'column',
    border: `1px solid ${themeColors.panelBorder || '#444'}`,
    padding: '4px',
    boxSizing: 'border-box',
    overflow: 'hidden',
  };

  // Header style for the output window
  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '4px',
    height: '24px',
  };

  // Back button style
  const backButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    border: 'none',
    color: themeColors.textColor || '#e0e0e0',
    padding: '4px 8px',
    borderRadius: '4px',
    marginRight: '8px',
    fontSize: '14px',
  };

  // Grid container style for multiview
  const gridContainerStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gridGap: '10px',
    flex: 1,
    overflow: 'auto',
    padding: '8px',
    alignContent: 'start',
  };

  // Single output view style
  const singleOutputStyle: React.CSSProperties = {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  const singleOutputContentContainerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    margin: '0 auto',
  };
  
  const singleOutputContentStyle: React.CSSProperties = {
    position: 'relative',
    width: '70%',
    height: 0,
    paddingBottom: '39.375%', // 16:9 aspect ratio (70% * 56.25% = 39.375%)
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: '4px',
    overflow: 'hidden',
    margin: '0 auto',
  };

  const singleOutputContentInnerStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
  };

  const singleOutputHeaderStyle: React.CSSProperties = {
    padding: '12px 16px',
    borderBottom: `1px solid ${themeColors.panelBorder || '#444'}`,
    fontWeight: 'bold',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  // If an output is selected, show the single output view
  if (selectedOutputId) {
    const selectedOutput = availableOutputs.find(output => output.id === selectedOutputId);
    
    if (!selectedOutput) {
      return <div style={containerStyle}>Output not found</div>;
    }
    
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <button style={backButtonStyle} onClick={handleBackClick}>
            <FaArrowLeft style={{ marginRight: '8px' }} /> Back to Multiview
          </button>
        </div>
        <div style={singleOutputStyle}>
          <div style={singleOutputHeaderStyle}>
            <span>{selectedOutput.name}</span>
          </div>
          <div style={singleOutputContentContainerStyle}>
            <div style={singleOutputContentStyle}>
              <div style={singleOutputContentInnerStyle}>
                {selectedOutput.contentPreview || 'No content preview available'}
              </div>
            </div>
            {typeof selectedOutput.audioLevel === 'number' && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
                pointerEvents: 'none',
              }}>
                <div style={{
                  width: '6px',
                  height: '100%',
                  backgroundColor: '#333',
                  borderRadius: '2px',
                  overflow: 'hidden',
                  position: 'relative',
                  marginLeft: '15%',
                }}>
                  <div style={{
                    width: '100%',
                    height: `${selectedOutput.audioLevel}%`,
                    backgroundImage: 'linear-gradient(to top, #4caf50 0%, #4caf50 70%, #ffeb3b 70%, #ffeb3b 85%, #ff4d4d 85%, #ff4d4d 100%)',
                    transition: 'height 0.3s ease',
                    position: 'absolute',
                    bottom: 0,
                    boxShadow: '0 0 3px rgba(0,0,0,0.3) inset',
                  }} />
                </div>
                <div style={{
                  width: '6px',
                  height: '100%',
                  backgroundColor: '#333',
                  borderRadius: '2px',
                  overflow: 'hidden',
                  position: 'relative',
                  marginRight: '15%',
                }}>
                  <div style={{
                    width: '100%',
                    height: `${selectedOutput.audioLevel}%`,
                    backgroundImage: 'linear-gradient(to top, #4caf50 0%, #4caf50 70%, #ffeb3b 70%, #ffeb3b 85%, #ff4d4d 85%, #ff4d4d 100%)',
                    transition: 'height 0.3s ease',
                    position: 'absolute',
                    bottom: 0,
                    boxShadow: '0 0 3px rgba(0,0,0,0.3) inset',
                  }} />
                </div>
              </div>
            )}
          </div>
          <div style={{ padding: '12px' }}>
            <div style={{ marginBottom: '6px', fontSize: '14px', textAlign: 'center' }}>Audio Level: {selectedOutput.audioLevel}%</div>
          </div>
        </div>
      </div>
    );
  }

  // Otherwise, show the multiview grid
  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h3 style={{ margin: 0, fontSize: '16px' }}>Output Multiview</h3>
      </div>
      <div style={gridContainerStyle}>
        {availableOutputs.map(output => (
          <OutputCard
            key={output.id}
            output={output}
            themeColors={themeColors}
            onClick={() => handleOutputClick(output.id)}
          />
        ))}
      </div>
    </div>
  );

};  // Add missing closing brace

export default React.memo(OutputWindow);
