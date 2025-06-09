// src/renderer/theme/theme.ts

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  
  background: string; 
  text: string; 
  
  panelBackground: string; 
  secondaryPanelBackground: string; 
  widgetBackground: string; 

  headerText: string; 
  mutedText: string; 
  
  panelBorder: string;
  inputBackground: string;
  inputBorder: string;
  inputText: string;
  
  buttonPrimaryBackground: string;
  buttonPrimaryText: string;
  buttonSecondaryBackground: string;
  buttonSecondaryText: string;

  // General button styles (can be overridden by specific button types if needed)
  buttonBackground: string; 
  buttonText: string;
  buttonHoverBackground: string;
  
  toggleButtonActive: string;
  toggleButtonInactive: string;
  toggleButtonActiveText: string; 
  toggleButtonInactiveText: string; 

  // Enhanced Button Styles
  buttonActiveBackground: string;
  buttonBorderColor?: string; // Optional: for button borders

  iconColor: string;
  iconHoverColor: string;

  error: string;
  warning: string;
  success: string;
  info: string;

  slidePreviewBackground: string;
  slideListItemActiveBackground: string;
  slideListItemHoverBackground: string;

  scrollbarThumb: string;
  scrollbarTrack: string;

  // Properties added to satisfy PresentationWidget and fix lint errors
  shadowColor: string; // For general shadows
  controlBarBackground: string; // For control bars
  gapColor: string; // For gaps or separators
  textColor: string; // Specific text color, potentially different from general 'text'

  // Properties added from new lint error
  listItemHoverBackground: string;
  listItemText: string; // For general text in list items
  selectedItemBackground: string;
  selectedItemAccentColor: string; // For the left accent bar on selected items
  selectedListItemText: string; // For text in selected list items
  selectedSlideBorderColor: string;
  textSecondary: string; // For secondary or less important text
}

export const defaultDarkThemeColors: ThemeColors = {
  primary: '#424242', // Dark grey (was blue)
  secondary: '#383838', // Darker grey (was green)
  accent: '#505050', // Medium-dark grey (was orange)
  background: '#121212', // Very dark grey
  text: '#E0E0E0', // Light grey
  panelBackground: '#1E1E1E', // Slightly lighter dark grey
  secondaryPanelBackground: '#2C2C2C', // Another shade of dark grey
  widgetBackground: '#1A1A1A', // Dark grey for widgets
  headerText: '#F5F5F5', // Off-white
  mutedText: '#757575', // Medium grey
  panelBorder: '#333333', // Dark grey border
  inputBackground: '#2C2C2C',
  inputBorder: '#424242',
  inputText: '#E0E0E0',
  buttonPrimaryBackground: '#424242', // Using primary dark grey
  buttonPrimaryText: '#F5F5F5',
  buttonSecondaryBackground: '#303030',
  buttonSecondaryText: '#E0E0E0',

  buttonBackground: '#303030', // Default button background
  buttonText: '#E0E0E0', // Default button text
  buttonHoverBackground: '#383838', // Slightly lighter for hover
  buttonActiveBackground: '#4A4A4A', // Darker than hover for active/pressed state
  buttonBorderColor: '#505050', // Using accent color for button borders
  toggleButtonActive: '#4CAF50', // A subtle accent color for active toggle (can be grey too)
  toggleButtonInactive: 'transparent',
  toggleButtonActiveText: '#FFFFFF',
  toggleButtonInactiveText: '#9E9E9E', // Lighter muted grey
  iconColor: '#9E9E9E',
  iconHoverColor: '#E0E0E0',
  error: '#D32F2F', // Darker red
  warning: '#FFA000', // Darker orange/amber
  success: '#388E3C', // Darker green
  info: '#1976D2', // Darker blue (if info needs to stand out, otherwise grey)
  slidePreviewBackground: '#000000', // Pure black for slide preview
  slideListItemActiveBackground: '#424242', // Primary dark grey for active item
  slideListItemHoverBackground: '#2C2C2C', // Secondary panel bg for hover
  listItemText: '#E0E0E0', // Defaulting to the general text color
  selectedItemBackground: '#383838', // A bit lighter than panel, similar to button hover
  selectedItemAccentColor: '#1976D2', // A noticeable blue for the accent bar
  selectedListItemText: '#F5F5F5', // Brighter text for selected item for contrast
  scrollbarThumb: '#505050',
  scrollbarTrack: '#1E1E1E',

  // Added properties
  shadowColor: 'rgba(0, 0, 0, 0.7)', // Darker shadow
  controlBarBackground: '#1A1A1A', // Widget background or similar
  gapColor: '#121212', // Main background for gaps
  textColor: '#E0E0E0', // Consistent with general text

  // Added properties from new lint error
  listItemHoverBackground: '#2C2C2C', // Consistent hover
  selectedSlideBorderColor: '#4CAF50', // Subtle accent for selected slide border,
  textSecondary: '#9E9E9E', // Secondary text color for less important text
};

export const defaultLightThemeColors: ThemeColors = {
  primary: '#007AFF', // Standard blue
  secondary: '#34C759', // Standard green
  accent: '#FF9500', // Standard orange
  background: '#F2F2F7', // Light system grey
  text: '#000000', // Black text
  panelBackground: '#FFFFFF', // White
  secondaryPanelBackground: '#F8F8F8', // Off-white
  widgetBackground: '#FFFFFF', // White
  headerText: '#000000', // Black
  mutedText: '#8E8E93', // Medium grey
  panelBorder: '#D1D1D6', // Light grey border
  inputBackground: '#FFFFFF',
  inputBorder: '#C7C7CC',
  inputText: '#000000',
  buttonPrimaryBackground: '#007AFF',
  buttonPrimaryText: '#FFFFFF',
  buttonSecondaryBackground: '#E5E5EA',
  buttonSecondaryText: '#000000',

  buttonBackground: '#E5E5EA', // Light grey button
  buttonText: '#000000', // Black text
  buttonHoverBackground: '#DCDCE0', // Slightly darker for hover
  buttonActiveBackground: '#C7C7CC', // Darker than hover for active/pressed
  buttonBorderColor: '#C7C7CC',     // Light grey border
  toggleButtonActive: '#007AFF',
  toggleButtonInactive: 'transparent',
  toggleButtonActiveText: '#FFFFFF',
  toggleButtonInactiveText: '#8E8E93',
  iconColor: '#6C6C70',
  iconHoverColor: '#000000',
  error: '#FF3B30',
  warning: '#FF9500',
  success: '#34C759',
  info: '#007AFF',
  slidePreviewBackground: '#EFEFF4',
  slideListItemActiveBackground: '#007AFF',
  slideListItemHoverBackground: '#E5E5EA',
  listItemText: '#000000', // Black text for list items
  selectedItemBackground: '#D1E8FF', // Light blue background for selected items
  selectedItemAccentColor: '#007AFF', // Primary blue for the accent bar
  selectedListItemText: '#000000', // Black text for selected items
  scrollbarThumb: '#AEAEB2',
  scrollbarTrack: '#F2F2F7',

  shadowColor: 'rgba(0, 0, 0, 0.15)',
  controlBarBackground: '#FFFFFF',
  gapColor: '#F2F2F7',
  textColor: '#000000',

  listItemHoverBackground: '#E5E5EA',
  selectedSlideBorderColor: '#007AFF',
  textSecondary: '#8E8E93', // Secondary text color for less important text
};

export const defaultTheme = {
  colors: defaultDarkThemeColors, // Default to dark, will be dynamic in components
};
