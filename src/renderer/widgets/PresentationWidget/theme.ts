export interface ThemeColors {
  widgetBackground: string;
  panelBackground: string;
  panelBorder: string;
  textColor: string;
  controlBarBackground: string;
  buttonBackground: string;
  buttonText: string;
  buttonHoverBackground: string;
  shadowColor: string;
  gapColor: string;
  // New properties for LibraryView and potentially other components
  itemInputBackground?: string;
  itemInputText?: string;
  itemInputBorder?: string;
  buttonBorder?: string; // For explicit button border control
  headerText?: string; // For panel headers or important text
  mutedText?: string; // For less important text or placeholders
  // New properties for CollectionSection and similar list/item UIs
  accentColor?: string; // Primary accent color for selections, highlights
  selectedItemBackground?: string; // Background for selected items
  selectedItemText?: string; // Text color for selected items
  textOnAccentColor?: string; // Text color for elements using accentColor as background
  listItemHoverBackground: string; // For hover on list items like cues, layers
  selectedSlideBorderColor: string; // Border color for selected slide items
  panelHoverBackground?: string; // Fallback hover for panel-like elements or items
  borderColor?: string; // Generic border color, used in OutputWindow
  secondaryPanelBackground?: string; // Background for sub-panels or distinct sections, used in OutputWindow
  warningColor?: string; // For audio meter warning levels
  errorColor?: string; // For audio meter clipping/error levels

  // Styles for selected list items (e.g., in LayersPanel, PlaylistColumn)
  selectedListItemBackground?: string;
  selectedListItemBorderColor?: string;
  selectedListItemTextColor?: string;
}

export interface AppTheme {
  light: ThemeColors;
  dark: ThemeColors;
}

export const themes: AppTheme = {
  light: {
    widgetBackground: '#F8F9FA',        // Very light gray for overall widget area
    panelBackground: '#FFFFFF',         // Pure white for panels
    panelBorder: '#F0F0F0',             // Even lighter border for white panels
    textColor: '#555555',               // Lighter gray text for softer look
    controlBarBackground: '#F8F9FA',    // Match widgetBackground
    buttonBackground: '#E9ECEF',        // Light gray buttons (no change)
    buttonText: '#555555',               // Lighter gray button text
    buttonHoverBackground: '#DEE2E6',   // Slightly darker hover for buttons (no change)
    shadowColor: 'rgba(180, 180, 180, 0.08)',  // Very soft gray shadow
    gapColor: '#F8F9FA',                // Match widgetBackground
    itemInputBackground: '#FFFFFF',
    itemInputText: '#495057',
    itemInputBorder: '#CED4DA',
    selectedListItemBackground: '#E9ECEF',      // Light gray, similar to buttonBackground
    selectedListItemBorderColor: '#ADB5BD',     // A slightly darker gray for border
    selectedListItemTextColor: '#212529',       // Darker text for selected item
    buttonBorder: '#CED4DA', // Match input border for consistency
    headerText: '#343A40',
    mutedText: '#6C757D',
    accentColor: '#007bff', // Standard blue accent
    selectedItemBackground: '#CCE5FF', // Light blue background for selected items
    selectedItemText: '#004085', // Darker blue text for selected items
    textOnAccentColor: '#FFFFFF', // White text on accent color
    listItemHoverBackground: '#E9ECEF', // Light grey for list item hover
    selectedSlideBorderColor: '#007bff', // Use accent color for selected slide border
    panelHoverBackground: '#F0F0F0', // Fallback hover for panel-like elements
  },
  dark: {
    widgetBackground: '#0A0A0A', 
    panelBackground: '#121212',  
    panelBorder: '#1A1A1A',    
    // gapColor removed from here, kept the one below with comment
    textColor: '#E0E0E0',
    controlBarBackground: '#181818', // Control bar slightly lighter than panels
    buttonBackground: '#282828',
    buttonText: '#E0E0E0',
    buttonHoverBackground: '#383838',
    shadowColor: 'rgba(0, 0, 0, 0.5)', // Dark shadow for dark theme
    gapColor: '#0A0A0A',                // Match widgetBackground for seamless look
    itemInputBackground: '#2C2C2C',
    itemInputText: '#ADB5BD',
    itemInputBorder: '#495057',
    selectedListItemBackground: '#3A3F44',      // A slightly lighter dark gray
    selectedListItemBorderColor: '#5A6167',     // A subtle border color
    selectedListItemTextColor: '#F8F9FA',       // Light text for selected item
    buttonBorder: '#444444',
    headerText: '#F5F5F5',
    mutedText: '#757575',
    // New CollectionSection UI colors
    accentColor: '#0072C6', // Darker blue accent
    selectedItemBackground: '#1E1E1E', // Dark background for selected items (matches listItemHoverBackground)
    selectedItemText: '#FFFFFF', // White text on selected items
    textOnAccentColor: '#FFFFFF', // White text on accentColor backgrounds
    listItemHoverBackground: '#1E1E1E', // Subtle hover, slightly lighter than panelBackground
    selectedSlideBorderColor: '#0072C6', // Use dark theme's accentColor for selected slides
    panelHoverBackground: '#1E1E1E', // Consistent hover for panel-like items
  },
};
