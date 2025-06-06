import { nanoid } from 'nanoid';
import type { PresentationFile, SlideElement, Slide, Cue, Library, Cuelist } from '@customTypes/presentationSharedTypes';

export const initialPresentationFiles: PresentationFile[] = [
  { id: nanoid(), name: 'Welcome Video.mp4', path: '/path/to/welcome.mp4', type: 'video' },
  { id: nanoid(), name: 'Sermon Outline.txt', path: '/path/to/sermon.txt', type: 'custom' }, 
  { id: nanoid(), name: 'Worship Background 1.jpg', path: '/path/to/bg1.jpg', type: 'image' },
];

export const initialSlideElements: SlideElement[] = [
  { id: nanoid(), type: 'text', content: 'Welcome to Our Service!', position: { x: 10, y: 10 }, size: { width: 300, height: 50 }, rotation: 0, opacity: 1, zIndex: 1 },
  { id: nanoid(), type: 'text', content: 'Amazing Grace, how sweet the sound...', position: { x: 10, y: 70 }, size: { width: 300, height: 50 }, rotation: 0, opacity: 1, zIndex: 1 },
  { id: nanoid(), type: 'text', content: 'That saved a wretch like me.', position: { x: 10, y: 130 }, size: { width: 300, height: 50 }, rotation: 0, opacity: 1, zIndex: 1 },
  { id: nanoid(), type: 'image', src: 'public/images/sample-slide-bg.jpg', position: { x: 50, y: 50 }, size: { width: 400, height: 225 }, rotation: 0, opacity: 1, zIndex: 0 }, 
  { id: nanoid(), type: 'text', content: 'John 3:16', position: { x: 10, y: 190 }, size: { width: 300, height: 50 }, rotation: 0, opacity: 1, zIndex: 1 },
  { id: nanoid(), type: 'text', content: 'For God so loved the world...', position: { x: 10, y: 250 }, size: { width: 300, height: 50 }, rotation: 0, opacity: 1, zIndex: 1 },
];

export const initialCues: Cue[] = [
  { id: nanoid(), name: 'Welcome Sequence', slides: [] }, // Placeholder, will be populated by initialSlidesData references after it's defined
  { 
    id: nanoid(), 
    name: 'Worship Set', 
    slides: [] 
  },
  { id: nanoid(), name: 'Sermon Notes', slides: [] },
  { id: nanoid(), name: 'Announcements', slides: [] },
  { id: nanoid(), name: 'Closing Song', slides: [] },
];

export const initialSlidesData: Slide[] = [
  { id: nanoid(), name: 'Welcome Title', elements: [initialSlideElements[0]], backgroundColor: '#004080' }, 
  { id: nanoid(), name: 'AG - V1 S1', elements: [{ id: nanoid(), type: 'text', content: 'Amazing grace! How sweet the sound', position: { x: 20, y: 20 }, size: { width: 350, height: 60 }, rotation: 0, opacity: 1, zIndex: 1 }], notes: 'Verse 1 Slide 1' }, 
  { id: nanoid(), name: 'AG - V1 S2', elements: [{ id: nanoid(), type: 'text', content: 'That saved a wretch like me!', position: { x: 20, y: 20 }, size: { width: 350, height: 60 }, rotation: 0, opacity: 1, zIndex: 1 }], notes: 'Verse 1 Slide 2' }, 
  { id: nanoid(), name: 'AG - V2 S1', elements: [{ id: nanoid(), type: 'text', content: 'I once was lost, but now am found,', position: { x: 20, y: 20 }, size: { width: 350, height: 60 }, rotation: 0, opacity: 1, zIndex: 1 }], notes: 'Verse 2 Slide 1' }, 
  { id: nanoid(), name: 'AG - V2 S2', elements: [{ id: nanoid(), type: 'text', content: 'Was blind, but now I see.', position: { x: 20, y: 20 }, size: { width: 350, height: 60 }, rotation: 0, opacity: 1, zIndex: 1 }], notes: 'Verse 2 Slide 2' }, 
  { id: nanoid(), name: 'AG - C1 S1', elements: [{ id: nanoid(), type: 'text', content: 'Twas grace that taught my heart to fear,', position: { x: 20, y: 20 }, size: { width: 350, height: 60 }, rotation: 0, opacity: 1, zIndex: 1 }], notes: 'Chorus Slide 1' }, 
  { id: nanoid(), name: 'AG - C1 S2', elements: [{ id: nanoid(), type: 'text', content: 'And grace my fears relieved;', position: { x: 20, y: 20 }, size: { width: 350, height: 60 }, rotation: 0, opacity: 1, zIndex: 1 }], notes: 'Chorus Slide 2' }, 
  { id: nanoid(), name: 'Image Background Slide', elements: [initialSlideElements[3]] }, 
  { id: nanoid(), name: 'Scripture - Title', elements: [initialSlideElements[4]] }, 
  { id: nanoid(), name: 'Scripture - Text', elements: [initialSlideElements[5]] }, 
  // Add more for scrolling test
  { id: nanoid(), name: 'Test Slide 1', elements: [{id: nanoid(), type: 'text', content: 'Test Content 1', position: { x: 20, y: 20 }, size: { width: 350, height: 60 }, rotation: 0, opacity: 1, zIndex: 1}]}, 
  { id: nanoid(), name: 'Test Slide 2', elements: [{id: nanoid(), type: 'text', content: 'Test Content 2', position: { x: 20, y: 20 }, size: { width: 350, height: 60 }, rotation: 0, opacity: 1, zIndex: 1}]}, 
  { id: nanoid(), name: 'Test Slide 3', elements: [{id: nanoid(), type: 'text', content: 'Test Content 3', position: { x: 20, y: 20 }, size: { width: 350, height: 60 }, rotation: 0, opacity: 1, zIndex: 1}]}, 
  { id: nanoid(), name: 'Test Slide 4', elements: [{id: nanoid(), type: 'text', content: 'Test Content 4', position: { x: 20, y: 20 }, size: { width: 350, height: 60 }, rotation: 0, opacity: 1, zIndex: 1}]}, 
  { id: nanoid(), name: 'Test Slide 5', elements: [{id: nanoid(), type: 'text', content: 'Test Content 5', position: { x: 20, y: 20 }, size: { width: 350, height: 60 }, rotation: 0, opacity: 1, zIndex: 1}]}, 
  { id: nanoid(), name: 'Test Slide 6', elements: [{id: nanoid(), type: 'text', content: 'Test Content 6', position: { x: 20, y: 20 }, size: { width: 350, height: 60 }, rotation: 0, opacity: 1, zIndex: 1}]}, 
  { id: nanoid(), name: 'Test Slide 7', elements: [{id: nanoid(), type: 'text', content: 'Test Content 7', position: { x: 20, y: 20 }, size: { width: 350, height: 60 }, rotation: 0, opacity: 1, zIndex: 1}]}, 
  { id: nanoid(), name: 'Test Slide 8', elements: [{id: nanoid(), type: 'text', content: 'Test Content 8', position: { x: 20, y: 20 }, size: { width: 350, height: 60 }, rotation: 0, opacity: 1, zIndex: 1}]}, 
  { id: nanoid(), name: 'Test Slide 9', elements: [{id: nanoid(), type: 'text', content: 'Test Content 9', position: { x: 20, y: 20 }, size: { width: 350, height: 60 }, rotation: 0, opacity: 1, zIndex: 1}]}, 
  { id: nanoid(), name: 'Test Slide 10', elements: [{id: nanoid(), type: 'text', content: 'Test Content 10', position: { x: 20, y: 20 }, size: { width: 350, height: 60 }, rotation: 0, opacity: 1, zIndex: 1}]}, 
  { id: nanoid(), name: 'Test Slide 11', elements: [{id: nanoid(), type: 'text', content: 'Test Content 11', position: { x: 20, y: 20 }, size: { width: 350, height: 60 }, rotation: 0, opacity: 1, zIndex: 1}]}, 
  { id: nanoid(), name: 'Test Slide 12', elements: [{id: nanoid(), type: 'text', content: 'Test Content 12', position: { x: 20, y: 20 }, size: { width: 350, height: 60 }, rotation: 0, opacity: 1, zIndex: 1}]}, 
  { id: nanoid(), name: 'Test Slide 13', elements: [{id: nanoid(), type: 'text', content: 'Test Content 13', position: { x: 20, y: 20 }, size: { width: 350, height: 60 }, rotation: 0, opacity: 1, zIndex: 1}]}, 
  { id: nanoid(), name: 'Test Slide 14', elements: [{id: nanoid(), type: 'text', content: 'Test Content 14', position: { x: 20, y: 20 }, size: { width: 350, height: 60 }, rotation: 0, opacity: 1, zIndex: 1}]}, 
  { id: nanoid(), name: 'Test Slide 15', elements: [{id: nanoid(), type: 'text', content: 'Test Content 15', position: { x: 20, y: 20 }, size: { width: 350, height: 60 }, rotation: 0, opacity: 1, zIndex: 1}]}, 
];

// Now that initialSlidesData is defined, populate initialCues properly
initialCues[0].slides = [initialSlidesData[0]];
initialCues[1].slides = [initialSlidesData[1], initialSlidesData[2]];
initialCues[2].slides = [initialSlidesData[3]];
initialCues[3].slides = [initialSlidesData[4]];
initialCues[4].slides = [initialSlidesData[0]]; // Reusing a slide

export const initialLibraries: Library[] = [
  {
    id: nanoid(),
    name: 'Default Mock Library',
    path: '/mock/libraries/default',
    cuelists: [{ id: nanoid(), name: 'Default Cuelist', cues: [initialCues[0], initialCues[1]] }],
  },
  {
    id: nanoid(),
    name: 'Sermon Archives Mock',
    path: '/mock/libraries/sermons',
    cuelists: [{ id: nanoid(), name: 'Sermon Cuelist 1', cues: [initialCues[2]] }],
  },
];
