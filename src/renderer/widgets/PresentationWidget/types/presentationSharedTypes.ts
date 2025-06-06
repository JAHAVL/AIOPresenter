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
  cuelists: Cuelist[]; // Cuelists within this library
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
  name?: string; // Optional name for the slide
  elements: SlideElement[];
  backgroundColor?: string; // e.g., '#FFFFFF', 'rgba(0,0,0,0.5)'
  backgroundImage?: string; // URL or path to an image
  duration?: number; // Optional duration in milliseconds for auto-advancing slides
  notes?: string; // Optional notes for the slide
  // Add other slide-specific properties like transitions, etc.
}

export interface Cue {
  id: string;
  name: string;
  slides: Slide[];
  notes?: string;
  // Add other cue-specific properties, e.g., trigger type
}

export interface Cuelist {
  id: string;
  name: string;
  cues: Cue[];
  parentId?: string; // Optional: Could be Library ID
  type?: 'cuelist' | 'folder'; // To distinguish between cuelists and folders if used in a tree structure
  // Add other cuelist-specific properties
}


// Represents a Cue and its slides, primarily for use in SlidesView when displaying multiple cues
import type React from 'react';

export interface CueGroup {
  cue: Cue;
  slides: Slide[]; // Redundant with cue.slides but reinforces the data structure for SlidesView
  // cuelistId?: string; // Optional: if needed to trace back to the Cuelist
}

export interface OutputItem {
  id: string;
  name: string;
  contentPreview?: React.ReactNode;
  audioLevel?: number;
  peakAudioLevel?: number;
}
