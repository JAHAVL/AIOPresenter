import React, { useState } from 'react';
import PresentingPage from '../pages/PresentingPage';

interface DraggableStyle extends React.CSSProperties {
  WebkitAppRegion?: 'drag' | 'no-drag';
}

// SVG Icon Definitions
const iconsData = [
  {
    key: 'Pr',
    title: 'Presenting',
    svg: <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M21 3H3C1.9 3 1 3.9 1 5v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM3 17V5h18v12H3zm5-7l2.5-2.5L13 10l4-4 1.5 1.5L13 13l-2.5-2.5L8 10z"/></svg>
  },
  {
    key: 'DA',
    title: 'DAW',
    svg: <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M16 4h-2V2h-4v2h-2C6.9 4 6 4.9 6 6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-6 14H8v-6h2v6zm4 0h-2V8h2v10zm4 0h-2v-4h2v4z"/></svg>
  },
  {
    key: 'St',
    title: 'Streaming',
    svg: <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6 4.53v14.94c0 .8.85 1.29 1.53.84l11.99-7.47c.65-.41.65-1.28 0-1.69L7.53 3.69C6.85 3.24 6 3.73 6 4.53zm14.47-1.06c-.26-.26-.62-.41-.99-.41h-1.98c-.37 0-.73.15-.99.41-.26.26-.41.62-.41.99v1.98c0 .37.15.73.41.99.26.26.62.41.99.41h1.98c.37 0 .73-.15.99-.41.26-.26.41.62.41-.99V4.46c0-.37-.15-.73-.41-.99zm0 6c-.26-.26-.62-.41-.99-.41h-1.98c-.37 0-.73.15-.99.41-.26.26-.41.62-.41.99v1.98c0 .37.15.73.41.99.26.26.62.41.99.41h1.98c.37 0 .73-.15.99-.41.26-.26.41.62.41-.99V10.46c0-.37-.15-.73-.41-.99zm0 6c-.26-.26-.62-.41-.99-.41h-1.98c-.37 0-.73.15-.99.41-.26.26-.41.62-.41.99v1.98c0 .37.15.73.41.99.26.26.62.41.99.41h1.98c.37 0 .73-.15.99-.41.26-.26.41.62.41-.99V16.46c0-.37-.15-.73-.41-.99z"/></svg>
  },
  {
    key: 'Li',
    title: 'Lighting',
    svg: <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 6c-2.76 0-5 2.24-5 5h10c0-2.76-2.24-5-5-5zm-6.36 6l-1.42 1.42C2.79 16.85 2 18.82 2 21h2c0-1.66.67-3.15 1.76-4.24L7.18 15.4A6.93 6.93 0 0 1 5.64 14zm12.72 0c-.75.75-1.23 1.69-1.42 2.76l1.42 1.42C19.21 19.65 20 20.34 20 21h2c0-2.18-.79-4.15-2.22-5.58L18.36 14z"/></svg>
  }
];

const MainLayout: React.FC = () => {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const topDragRegionHeight = isMac ? '30px' : '15px';
  const contentPaddingTop = isMac ? '35px' : '20px';

  const [activeViewKey, setActiveViewKey] = useState<string>('Pr'); // Default to Presenting

  const handleNavButtonClick = (key: string) => {
    setActiveViewKey(key);
    console.log(`Switched to view: ${key}`);
  };

  const renderActiveView = () => {
    switch (activeViewKey) {
      case 'Pr':
        return <PresentingPage />;
      case 'DA':
        return <div>DAW Content Placeholder</div>; // Placeholder
      case 'St':
        return <div>Streaming Content Placeholder</div>; // Placeholder
      case 'Li':
        return <div>Lighting Content Placeholder</div>; // Placeholder
      default:
        return <PresentingPage />; // Default to Presenting page
    }
  };

  return (
    <div style={styles.container as DraggableStyle}>
      <div style={{...styles.topDragRegion, height: topDragRegionHeight } as DraggableStyle} />
      <div style={styles.body}>
        <main style={{...styles.mainContent, paddingTop: '0px'}}>
          {renderActiveView()}
        </main>
        <aside style={{...styles.rightNavbar, paddingTop: '0px'} as DraggableStyle}>
          {iconsData.map(item => (
            <button 
              key={item.key} 
              style={activeViewKey === item.key ? {...styles.navButton, ...styles.navButtonActive} : styles.navButton as DraggableStyle} 
              title={item.title}
              onClick={() => handleNavButtonClick(item.key)} 
              onMouseEnter={e => {
                if (activeViewKey !== item.key) {
                  Object.assign(e.currentTarget.style, styles.navButtonHover);
                }
              }}
              onMouseLeave={e => {
                 if (activeViewKey !== item.key) {
                  Object.assign(e.currentTarget.style, styles.navButton); 
                }
              }}
            >
              {item.svg}
            </button>
          ))}
        </aside>
      </div>
    </div>
  );
};

interface ComponentStyles {
  container: DraggableStyle;
  topDragRegion: DraggableStyle;
  body: React.CSSProperties;
  mainContent: React.CSSProperties;
  rightNavbar: DraggableStyle;
  navButton: DraggableStyle;
  navButtonHover: React.CSSProperties;
  navButtonActive: React.CSSProperties;
}

const styles: ComponentStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100vw',
    margin: 0,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: '#181818', 
  },
  topDragRegion: {
    width: '100%',
    WebkitAppRegion: 'drag',
    backgroundColor: 'transparent',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 1000,
  },
  body: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1, 
    overflow: 'hidden',
  },
  mainContent: {
    flex: 1,
    // paddingLeft: '20px', // REMOVED
    // paddingRight: '20px', // REMOVED
    // paddingBottom: '20px', // REMOVED
    backgroundColor: 'rgba(28, 28, 30, 0.95)', 
    overflow: 'hidden', // CHANGED from overflowY: 'auto'
  },
  rightNavbar: {
    width: '48px',
    backgroundColor: 'rgba(20, 20, 22, 0.85)', 
    backdropFilter: 'blur(10px)', 
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingBottom: '10px',
    boxShadow: '-1px 0px 10px rgba(0,0,0,0.3)', 
  },
  navButton: {
    width: '36px', 
    height: '36px',
    margin: '8px 0',
    backgroundColor: 'rgba(55, 55, 60, 0.75)', 
    color: 'white', 
    border: '1px solid rgba(255, 255, 255, 0.1)', 
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s ease, transform 0.2s ease',
    WebkitAppRegion: 'no-drag',
    boxShadow: '0px 1px 3px rgba(0,0,0,0.25)',
  },
  navButtonHover: {
    backgroundColor: 'rgba(75, 75, 80, 0.9)', 
    transform: 'scale(1.1)',
  },
  navButtonActive: { 
    backgroundColor: 'rgba(0, 123, 255, 0.8)', 
    borderColor: 'rgba(0, 100, 200, 0.9)',
    transform: 'scale(1.05)',
    boxShadow: '0px 2px 5px rgba(0,123,255,0.4)',
  },
};

export default MainLayout;
