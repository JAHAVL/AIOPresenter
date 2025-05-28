// src/renderer/App.tsx
import React from 'react';
import MainLayout from './layouts/MainLayout'; // Ensure this path is correct
// import './styles/global.css'; // Assuming you might have or want a global CSS file - Commented out for now

const App: React.FC = () => {
  return (
    <MainLayout>
      {/* This content will be rendered in the mainContent area of MainLayout */}
      {/* <div style={{ textAlign: 'center' }}> */}
      {/*  <h2>Welcome to AIOPRESENTER</h2> */}
      {/*  <p>This is the main content area, rendered via App.tsx as children of MainLayout.</p> */}
      {/*  <p>Future pages and widgets will be displayed here.</p> */}
      {/* </div> */}
    </MainLayout>
  );
};

export default App;
