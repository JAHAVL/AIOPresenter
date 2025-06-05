// src/shared/ipcChannels.ts

export enum StorageChannel {
  DEBUG_MAIN_PROCESS_LOG = 'debug:main-process-log',
  MAIN_PROCESS_DEBUG_MESSAGE = 'system:main-process-debug-message',
  SAVE_CUE_FILE = 'storage:save-cue-file',
  LIST_USER_LIBRARIES = 'storage:list-user-libraries',
  CREATE_USER_LIBRARY = 'storage:create-user-library',
  GET_STORAGE_PATHS = 'storage:get-paths', // Existing from previous work
  LIST_USER_LIBRARIES_REPLY = 'storage:list-user-libraries-reply',
  LIBRARIES_DID_CHANGE = 'storage:libraries-did-change',
  // Add other storage-related channels here
}

export enum ConfigChannel {
  GET_CONFIG_VALUE = 'config:get-value',
  SET_CONFIG_VALUE = 'config:set-value',
  // Add other config-related channels here
}

// You can add more enums for different categories of IPC channels

// Types previously in presentationSharedTypes.ts
export interface PresentationFile {
  id: string;
  name: string;
  path: string; // Path to the actual file on disk, or identifier for internally generated content
  type: 'image' | 'video' | 'audio' | 'custom' | 'unknown'; // Example types. Removed 'slides'.
  // Future properties: thumbnail, duration, slideCount, etc.
}

export interface Library {
  id: string;
  name: string;
  path: string; // Absolute path to the library's folder
  cues: Cue[]; // A library contains a collection of reusable Cues (e.g., songs)
}

export interface ListUserLibrariesResponse {
  success: boolean;
  libraries?: Library[];
  error?: string;
}

// Base interface for all slide elements
export interface BaseSlideElement {
  id: string;
  name?: string; // Optional, user-defined name for the layer
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  opacity: number;
  zIndex?: number;   // Optional, for stacking order
}

// Specific element type interfaces
export interface TextSlideElement extends BaseSlideElement {
  type: 'text';
  content: string;
  fontFamily?: string;
  fontSize?: number; // in pixels
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  verticalAlign?: 'top' | 'middle' | 'bottom'; // Vertical alignment within the text box
  color?: string; // Text color
  textDecoration?: string; // e.g., "underline line-through"
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  lineHeight?: number; // e.g., 1.5 for 1.5x line height
  letterSpacing?: number; // in pixels
  textBackgroundColor?: string; // Background color of the text element's box
  opacity: number; // Opacity of the text element (0-1)

  // Stroke properties
  textStrokeEnabled?: boolean;
  textStrokeWidth?: number;
  textStrokeColor?: string;

  // Shadow properties
  textShadow?: {
    enabled: boolean;
    color: string;
    opacity: number; // 0-1
    angle: number; // degrees 0-360
    offsetMagnitude: number; // pixels
    blurRadius: number; // pixels
  };
}

export interface ImageSlideElement extends BaseSlideElement {
  type: 'image';
  src: string; // Data URL or path to image
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  altText?: string;
}

export interface VideoSlideElement extends BaseSlideElement {
  type: 'video';
  src: string; // Path or URL to video
  autoplay: boolean;
  loop: boolean;
  controls: boolean;
  volume?: number;
  muted?: boolean;
  poster?: string;
}

export enum ShapeType {
  RECTANGLE = 'rectangle',
  ELLIPSE = 'ellipse',
  TRIANGLE = 'triangle',
  LINE = 'line',
  STAR = 'star',
  POLYGON = 'polygon',
}

export interface ShapeSlideElement extends BaseSlideElement {
  type: 'shape';
  shapeType: ShapeType;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  cornerRadius?: number;
  points?: number; // For polygons or stars
}

// Discriminated union for all possible slide elements
export type SlideElement = TextSlideElement | ImageSlideElement | VideoSlideElement | ShapeSlideElement;

// Represents a single slide within a Cue
export interface Slide {
  id: string;
  name?: string; // Optional name for the slide (e.g., "Verse 1", "Chorus Slide 2")
  elements: SlideElement[];
  backgroundColor?: string;
  notes?: string;
  thumbnailUrl?: string; // Optional URL for the slide thumbnail
  // Future properties: transition to next slide, duration, etc.
}

// A Cue is a sequence of one or more slides
export interface Cue {
  id: string;
  name: string; // A name for this cue (e.g., "Song Intro", "Sermon Point 1")
  slides: Slide[]; // The slides that make up this cue
  // Future properties: cue-specific settings, default transition, etc.
}

export interface Cuelist {
  id: string;
  name: string;
  type: 'cuelist' | 'folder'; // To distinguish between cuelists and folders
  parentId?: string; // Optional: ID of the parent folder
  cues?: Cue[]; // Optional: Array of cues, only for 'cuelist' type
}

// Represents a Cue and its slides, primarily for use in SlidesView when displaying multiple cues
export interface CueGroup {
  cue: Cue;
  slides: Slide[]; // Redundant with cue.slides but reinforces the data structure for SlidesView
  // cuelistId?: string; // Optional: if needed to trace back to the Cuelist
}
