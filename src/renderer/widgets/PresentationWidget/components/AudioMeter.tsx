import React from 'react';
import { ThemeColors } from '../theme'; // Adjusted import path

export interface AudioMeterProps {
  level: number; // 0-100
  peakLevel: number; // 0-100, typically same as level or higher for peak hold
  themeColors: ThemeColors;
  orientation?: 'vertical' | 'horizontal'; // default vertical
  showPeak?: boolean; // default true
  size?: 'normal' | 'compact'; // default normal, compact for multi-view
}

const AudioMeter: React.FC<AudioMeterProps> = ({
  level,
  peakLevel,
  themeColors,
  orientation = 'vertical',
  showPeak = true,
  size = 'normal',
}) => {
  const finiteLevel = Number.isFinite(level) ? level : 0;
  const finitePeakLevel = Number.isFinite(peakLevel) ? peakLevel : 0;

  const safeLevel = Math.max(0, Math.min(100, finiteLevel));
  const safePeakLevel = Math.max(0, Math.min(100, finitePeakLevel));

  const meterHeight = orientation === 'vertical' ? (size === 'normal' ? '150px' : '60px') : '10px'; // Taller for single view, shorter for multi-view
  const meterWidth = orientation === 'vertical' ? '12px' : '100%'; // Slightly wider for single view

  const containerStyle: React.CSSProperties = {
    width: meterWidth,
    height: meterHeight,
    backgroundColor: themeColors.secondaryPanelBackground || 'rgba(0,0,0,0.3)',
    border: `1px solid ${themeColors.borderColor || '#555'}`,
    borderRadius: '2px',
    position: 'relative',
    overflow: 'hidden',
    margin: orientation === 'vertical' ? '0 5px' : '3px 0', // Adjust margin for new size
  };

  const levelStyle: React.CSSProperties = {
    position: 'absolute',
    transition: 'height 0.05s ease-out, width 0.05s ease-out',
  };

  let currentLevelColor = themeColors.accentColor || '#4CAF50'; 
  if (safeLevel > 90) {
    currentLevelColor = themeColors.errorColor || '#F44336'; 
  } else if (safeLevel > 75) {
    currentLevelColor = themeColors.warningColor || '#FFC107'; 
  }
  levelStyle.backgroundColor = currentLevelColor;

  if (orientation === 'vertical') {
    levelStyle.bottom = 0;
    levelStyle.left = 0;
    levelStyle.width = '100%';
    levelStyle.height = `${safeLevel}%`;
  } else {
    levelStyle.top = 0;
    levelStyle.left = 0;
    levelStyle.height = '100%';
    levelStyle.width = `${safeLevel}%`;
  }

  const peakStyle: React.CSSProperties = {
    position: 'absolute',
    backgroundColor: themeColors.errorColor || '#FF0000',
  };

  if (orientation === 'vertical') {
    peakStyle.bottom = `${safePeakLevel}%`;
    peakStyle.left = 0;
    peakStyle.width = '100%';
    peakStyle.height = '2px'; // For vertical
    peakStyle.transform = 'translateY(-1px)';
  } else { // Horizontal
    peakStyle.left = `${safePeakLevel}%`;
    peakStyle.top = 0;
    peakStyle.height = '100%'; // Will be 8px from meterHeight
    peakStyle.width = '2px';
    peakStyle.transform = 'translateX(-1px)';
  }

  return (
    <div style={containerStyle} title={`Level: ${safeLevel.toFixed(0)}%, Peak: ${safePeakLevel.toFixed(0)}%`}>
      <div style={levelStyle} />
      {showPeak && safePeakLevel > 0 && safePeakLevel >= safeLevel && <div style={peakStyle} />}
    </div>
  );
};

export default AudioMeter;
