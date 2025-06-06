export interface PresentationFile {
  id: string;
  name: string;
  path: string; // Path to the actual file on disk, or identifier for internally generated content
  type: 'image' | 'video' | 'audio' | 'custom' | 'unknown'; // Example types. Removed 'slides'.
  // Future properties: thumbnail, duration, slideCount, etc.
}

import type { Cue, Slide } from '../../../../shared/ipcChannels';

export type {
  Library,
  Cuelist,
  Cue,
  Slide,
  SlideElement,
  BaseSlideElement,
  TextSlideElement,
  ImageSlideElement,
  VideoSlideElement,
  ShapeSlideElement
} from '../../../../shared/ipcChannels';
export { ShapeType } from '../../../../shared/ipcChannels';


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
