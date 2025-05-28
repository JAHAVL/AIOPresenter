import React from 'react';

const LibraryView: React.FC = () => {
  const style: React.CSSProperties = {
    border: '1px solid #444',
    padding: '10px',
    width: '100%', // Fill parent container width
    height: '100%', // Fill parent container height
    backgroundColor: '#2a2a2a',
    color: '#e0e0e0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
  return <div style={style}>Library View</div>;
};

export default React.memo(LibraryView);
