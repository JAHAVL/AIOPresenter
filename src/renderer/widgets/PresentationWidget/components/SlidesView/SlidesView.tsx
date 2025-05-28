import React from 'react';

const SlidesView: React.FC = () => {
  const style: React.CSSProperties = {
    border: '1px solid #444',
    padding: '10px',
    width: '100%', // Fill parent quadrant width
    height: '100%', // Fill parent quadrant height
    backgroundColor: '#2a2a2a',
    color: '#e0e0e0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
  return <div style={style}>Slides View</div>;
};

export default React.memo(SlidesView);
