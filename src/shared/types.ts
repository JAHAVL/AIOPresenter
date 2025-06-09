// src/shared/types.ts

// Generic IPC Response Structure
export interface IpcResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string; // Optional, for additional info
}

// Slide Element Types
export interface BaseSlideElement {
  id: string;
  type: string; // 'text', 'image', 'video', 'shape'
  name?: string; // Optional name for the element
  x: number; // Position X
  y: number; // Position Y
  width: number; // Width
  height: number; // Height
  rotation?: number; // Rotation in degrees
  opacity?: number; // Opacity from 0 to 1
  zIndex?: number; // Stacking order
  // Common styling properties can go here if needed
}

export interface TextSlideElement extends BaseSlideElement {
  type: 'text';
  text: string;
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  // Add other text-specific properties
}

export interface ImageSlideElement extends BaseSlideElement {
  type: 'image';
  src: string; // URL or path to the image
  fit?: 'contain' | 'cover' | 'fill'; // How the image should fit its bounds
}

export interface VideoSlideElement extends BaseSlideElement {
  type: 'video';
  src: string; // URL or path to the video
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
}

export interface ShapeSlideElement extends BaseSlideElement {
  type: 'shape';
  shapeType: 'rectangle' | 'ellipse' | 'triangle'; // etc.
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
}

export type SlideElement = TextSlideElement | ImageSlideElement | VideoSlideElement | ShapeSlideElement;

// Represents a single slide within a Cue
export interface Slide {
  id: string;
  name: string; // Name for the slide (e.g., "Verse 1", "Chorus Slide 2")
  elements: SlideElement[];
  backgroundColor?: string;
  notes?: string;
  thumbnailUrl?: string; // Optional URL for the slide thumbnail
  // Future properties: transition to next slide, duration, etc.
}

// Represents a single cue, which is a collection of slides
export interface Cue {
  id: string;
  name: string; // A name for this cue (e.g., "Song Intro", "Sermon Point 1")
  slides: Slide[]; // The slides that make up this cue
  // Future properties: cue-specific settings, default transition, etc.
}

// Represents a Cuelist, which is a collection of cues or a folder
export interface Cuelist {
  id: string;
  name: string;
  type: 'cuelist' | 'folder'; // To distinguish between cuelists and folders
  parentId?: string; // Optional: ID of the parent folder
  cues: Cue[]; // Array of cues, required for 'cuelist' type, should be empty for 'folder' if not applicable
}

// Represents a user-created library (a folder on disk)
export interface UserLibrary {
  id: string; // Unique identifier for the library
  name: string;
  path: string;
  cuelists?: Cuelist[];
}

// Represents a presentation file within a library
export interface PresentationFile {
  id: string;
  name: string;
  path: string; // Path to the actual file on disk, or identifier for internally generated content
  type: 'image' | 'video' | 'audio' | 'custom' | 'unknown'; // Example types.
  // Future properties: thumbnail, duration, slideCount, etc.
}

// Storage Paths
export interface StoragePaths {
  presentationLibraryPath: string;
  defaultUserLibraryPath: string;
  appDataPath: string;
  logsPath: string;
  settingsPath: string;
}
