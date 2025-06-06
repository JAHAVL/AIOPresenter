import type { Library } from '../../shared/ipcChannels';

export type {
  SlideElement,
  Slide,
  Cue,
  Cuelist,
  Library,
  BaseSlideElement,
  TextSlideElement,
  ImageSlideElement,
  VideoSlideElement,
  ShapeSlideElement,
  ShapeType
} from '../../shared/ipcChannels';

export type { PresentationFile } from '../widgets/PresentationWidget/types/presentationSharedTypes';

export interface CueGroup {
  id: string;
  name: string;
  cueIds: string[]; // Array of Cue IDs belonging to this group
  // Add other group-specific properties as needed
}
