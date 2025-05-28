import React, { useState, useEffect, useRef } from 'react';
import { Responsive, WidthProvider, Layouts, Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const allItemLayoutDefaults = { minW: 2, minH: 1 }; // minH is 1 logical row
const stackedItemLayoutDefaults = { minW: 1, minH: 1 }; // minH is 1 logical row

const initialLayouts = {
  lg: [ // 12 columns - 2x2 grid, 2 logical rows
    { i: 'output',         x: 0, y: 0, w: 6, h: 1, ...allItemLayoutDefaults },
    { i: 'slides',         x: 6, y: 0, w: 6, h: 1, ...allItemLayoutDefaults },
    { i: 'libraryCueList', x: 0, y: 1, w: 6, h: 1, ...allItemLayoutDefaults },
    { i: 'automation',     x: 6, y: 1, w: 6, h: 1, ...allItemLayoutDefaults },
  ],
  md: [ // 10 columns - 2x2 grid, 2 logical rows
    { i: 'output',         x: 0, y: 0, w: 5, h: 1, ...allItemLayoutDefaults },
    { i: 'slides',         x: 5, y: 0, w: 5, h: 1, ...allItemLayoutDefaults },
    { i: 'libraryCueList', x: 0, y: 1, w: 5, h: 1, ...allItemLayoutDefaults },
    { i: 'automation',     x: 5, y: 1, w: 5, h: 1, ...allItemLayoutDefaults },
  ],
  sm: [ // 6 columns - 2x2 grid, 2 logical rows
    { i: 'output',         x: 0, y: 0, w: 3, h: 1, ...allItemLayoutDefaults },
    { i: 'slides',         x: 3, y: 0, w: 3, h: 1, ...allItemLayoutDefaults },
    { i: 'libraryCueList', x: 0, y: 1, w: 3, h: 1, ...allItemLayoutDefaults },
    { i: 'automation',     x: 3, y: 1, w: 3, h: 1, ...allItemLayoutDefaults },
  ],
  xs: [ // 4 columns - Stacked, 4 logical rows
    { i: 'output',         x: 0, y: 0, w: 4, h: 1, ...stackedItemLayoutDefaults },
    { i: 'slides',         x: 0, y: 1, w: 4, h: 1, ...stackedItemLayoutDefaults },
    { i: 'libraryCueList', x: 0, y: 2, w: 4, h: 1, ...stackedItemLayoutDefaults },
    { i: 'automation',     x: 0, y: 3, w: 4, h: 1, ...stackedItemLayoutDefaults },
  ],
  xxs: [ // 2 columns - Stacked, 4 logical rows
    { i: 'output',         x: 0, y: 0, w: 2, h: 1, ...stackedItemLayoutDefaults },
    { i: 'slides',         x: 0, y: 1, w: 2, h: 1, ...stackedItemLayoutDefaults },
    { i: 'libraryCueList', x: 0, y: 2, w: 2, h: 1, ...stackedItemLayoutDefaults },
    { i: 'automation',     x: 0, y: 3, w: 2, h: 1, ...stackedItemLayoutDefaults },
  ],
};

const PresentationWidget: React.FC = () => {
  const widgetWrapperStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh', // Explicitly set to full viewport height
    // This ensures the widget itself tries to occupy the entire screen height,
    // allowing its internal flex layout (top bar + growing grid container) to work correctly.
  };

  const topControlBarStyle: React.CSSProperties = {
    height: '50px',
    backgroundColor: '#333333', // Distinct color for the control bar
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 10px', // Padding for content within the control bar
    flexShrink: 0,      // Prevent control bar from shrinking
    borderRadius: '4px', // Slightly rounded corners for the bar
    // width: '100%', // Removed, should span naturally or via parent flex settings
  };

  const gridContainerStyle: React.CSSProperties = {
    flexGrow: 1, // Take up remaining vertical space
    overflow: 'hidden', // IMPORTANT: Prevent this container from scrolling
    backgroundColor: '#2a2a2a', // Background for the area containing the grid items
    borderRadius: '4px', // Slightly rounded corners for the grid area
    minHeight: 0, // Helps flex-grow behave correctly, especially with complex children
  };

  const gridItemStyle: React.CSSProperties = {
    backgroundColor: '#383838', // Background for individual grid items
    color: 'white',
    border: '1px solid #555555', // Border for grid items
    borderRadius: '4px', // Slightly rounded corners for grid items
  };

  const gridItemContentStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    overflow: 'auto', // Allows content *within* the panel to scroll if it's too large
    padding: '10px',  // Padding for content within the panel
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const gridContainerRef = useRef<HTMLDivElement>(null);
  const [calculatedRowHeight, setCalculatedRowHeight] = useState(30); // Default before calculation
  const [currentCols, setCurrentCols] = useState(12); // Default to lg cols

  const onLayoutChange = (currentLayout: Layout[], allLayouts: Layouts) => {
    // console.log('Current layout: ', currentLayout);
    // console.log('All layouts: ', allLayouts);
  };

  useEffect(() => {
    const calculateAndSetRowHeight = () => {
      if (gridContainerRef.current) {
        const containerHeight = gridContainerRef.current.offsetHeight;
        const marginY = 10; // From margin={[10, 10]}
        const containerPaddingY = 10; // From new containerPadding={[10, 10]}

        const numRows = (currentCols >= 6) ? 2 : 4; // 2 rows for sm, md, lg; 4 for xs, xxs

        const totalVerticalContainerPadding = 2 * containerPaddingY;
        // Margins are only BETWEEN items now, as containerPadding handles top/bottom space
        const totalVerticalMarginsBetweenItems = (numRows > 1) ? (numRows - 1) * marginY : 0;
        
        const heightAvailableForRows = containerHeight - totalVerticalContainerPadding - totalVerticalMarginsBetweenItems;

        if (heightAvailableForRows > 0) {
          setCalculatedRowHeight(heightAvailableForRows / numRows);
        }
      }
    };

    calculateAndSetRowHeight(); // Initial calculation

    const resizeObserver = new ResizeObserver(calculateAndSetRowHeight);
    if (gridContainerRef.current) {
      resizeObserver.observe(gridContainerRef.current);
    }

    return () => {
      if (gridContainerRef.current) {
        resizeObserver.unobserve(gridContainerRef.current);
      }
    };
  }, [currentCols]); // Recalculate if column count (breakpoint) changes

  const onBreakpointChange = (newBreakpoint: string, newCols: number) => {
    setCurrentCols(newCols);
    // The useEffect for rowHeight will trigger due to currentCols change
  };

  return (
    <div style={widgetWrapperStyle}>
      <div style={topControlBarStyle}>
        Top Control Bar (Placeholder for Navigation/Actions)
      </div>
      <div style={gridContainerStyle} ref={gridContainerRef}>
        <ResponsiveGridLayout
          className="layout"
          layouts={initialLayouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          onLayoutChange={onLayoutChange}
          onBreakpointChange={onBreakpointChange} // Add handler to update currentCols
          isDraggable={true}
          isResizable={true}
          isBounded={true} // Constrain items to grid bounds
          margin={[10, 10]} // Spacing BETWEEN items and at the very edges of items array
          containerPadding={[10, 10]} // Padding INSIDE the grid layout, around all items
          style={{ height: '100%' }}
          rowHeight={calculatedRowHeight} // Use dynamically calculated row height
        >
          <div key="output" style={gridItemStyle}>
            <div style={gridItemContentStyle}>OutputWindow</div>
          </div>
          <div key="slides" style={gridItemStyle}>
            <div style={gridItemContentStyle}>SlidesView</div>
          </div>
          <div key="libraryCueList" style={gridItemStyle}>
            <div style={gridItemContentStyle}>LibraryView & CueListView</div>
          </div>
          <div key="automation" style={gridItemStyle}>
            <div style={gridItemContentStyle}>AutomationPanel</div>
          </div>
        </ResponsiveGridLayout>
      </div>
    </div>
  );
};

export default PresentationWidget;
