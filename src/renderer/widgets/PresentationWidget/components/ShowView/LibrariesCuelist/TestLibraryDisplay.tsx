import React from 'react';
import type { Library } from '../../../types/presentationSharedTypes';

interface TestLibraryDisplayProps {
  libraries: Library[];
}

const TestLibraryDisplay: React.FC<TestLibraryDisplayProps> = ({ libraries }) => {
  console.log('[TestLibraryDisplay] Rendering with libraries:', libraries);
  return (
    <div style={{ border: '2px dashed red', padding: '10px', margin: '10px' }}>
      <h3>Test Library Display Component</h3>
      {libraries && libraries.length > 0 ? (
        <ul>
          {libraries.map(lib => (
            <li key={lib.id}>{lib.name} (Path: {lib.path})</li>
          ))}
        </ul>
      ) : (
        <p>No libraries to display in TestComponent, or libraries prop is empty.</p>
      )}
    </div>
  );
};

export default TestLibraryDisplay;
