import React from 'react';
import type { OutputItem } from '../../../types/presentationSharedTypes';
import type { ThemeColors } from '../../../theme/theme';

export interface OutputWindowProps {
  themeColors: ThemeColors;
  availableOutputs: OutputItem[];
}

const OutputWindow: React.FC<OutputWindowProps> = ({ themeColors, availableOutputs }) => {
  const style: React.CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: '#2a2a2a',
    color: '#e0e0e0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    // boxSizing: 'border-box', // REMOVED - this was the culprit
    border: '1px solid #444', // Re-adding border
    padding: '10px', // Re-adding padding
  };
  return <div style={style}>Output Window</div>;
};

export default React.memo(OutputWindow);
