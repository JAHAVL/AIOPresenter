import React from 'react';
import { defaultTheme, type ThemeColors } from '../widgets/PresentationWidget/theme/theme';
import PresentationWidget from '../widgets/PresentationWidget/views/PresentationWidget'; // Import the widget

const PresentingPage: React.FC = () => {
  const pageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent', // Or a specific background for this page if needed
    // color: '#e0e0e0', // Text color, adjust as needed - widget will handle its own text
    display: 'flex',
    flexDirection: 'column',
    // alignItems: 'center', // Widget will fill space
    // justifyContent: 'center', // Widget will fill space
    padding: 0, // Remove padding if widget handles its own
    margin: 0,
  };

  return (
    <div style={pageStyle}>
      {/* Content for the Presenting page will go here */}
      {/* This is a blank container for now */}
      <PresentationWidget themeColors={defaultTheme.colors} />
    </div>
  );
};

export default PresentingPage;
