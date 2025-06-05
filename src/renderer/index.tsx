// src/renderer/index.tsx
console.log('Renderer script started executing.');

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css'; // Import the global CSS file

console.log('Imports completed, attempting to find root element.');

const rootElement = document.getElementById('root');

if (rootElement) {
  console.log('Root element found, creating React root.');
  const root = ReactDOM.createRoot(rootElement);
  console.log('React root created, rendering App component.');
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('App component rendered to DOM.');
} else {
  console.error('Failed to find the root element. App cannot be mounted.');
}

console.log('React app initialization attempted in renderer process.');
