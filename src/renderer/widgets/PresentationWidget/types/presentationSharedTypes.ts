export interface PresentationFile {
  id: string;
  name: string;
  path: string; // Path to the actual file on disk, or identifier for internally generated content
  type: 'image' | 'video' | 'audio' | 'custom' | 'unknown'; // Example types. Removed 'slides'.
  // Future properties: thumbnail, duration, slideCount, etc.
}

import type {
  UserLibrary as Library,
  Cuelist,
  Cue,
  Slide,
  SlideElement,
  BaseSlideElement,
  TextSlideElement,
  ImageSlideElement,
  VideoSlideElement,
  ShapeSlideElement
} from '@shared/types';

export type {
  Library, // Alias for UserLibrary
  Cuelist,
  Cue,
  Slide,
  SlideElement,
  BaseSlideElement,
  TextSlideElement,
  ImageSlideElement,
  VideoSlideElement,
  ShapeSlideElement
}; // No 'from' needed as they are imported above

export type ShapeType = ShapeSlideElement['shapeType'];


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
