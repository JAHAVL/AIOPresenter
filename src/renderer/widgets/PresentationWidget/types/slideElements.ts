// src/renderer/widgets/PresentationWidget/types/slideElements.ts

export type SlideElementType = 'text' | 'image' | 'video' | 'shape' | 'group';

export interface SlideElementPosition {
  x: number;
  y: number;
}

export interface SlideElementSize {
  width: number;
  height: number;
}

export interface Slide {
  id: string;
  elements: SlideElement[];
  // Add other slide-specific properties here if needed, e.g., background, transitions
}

export interface SlideElement {
  id: string;
  type: SlideElementType;
  name?: string;
  position: SlideElementPosition;
  size: SlideElementSize;
  rotation: number;
  opacity: number;
  zIndex?: number; // Added for layering
  isSelected?: boolean;
}

export interface TextSlideElement extends SlideElement {
  type: 'text';
  content: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  fontWeight?: 'normal' | 'bold' | 'lighter' | 'bolder' | number;
  fontStyle?: 'normal' | 'italic' | 'oblique';
  textDecoration?: string; // Allows space-separated values like 'underline line-through'
  lineHeight?: number;
  letterSpacing?: number;
  // New properties for advanced text styling inspired by Figma
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  verticalAlign?: 'top' | 'middle' | 'bottom'; // Controls vertical alignment of text within its bounding box
  textStroke?: {
    color: string;
    width: number;
    enabled: boolean;
  };
  textShadow?: {
    color: string;
    opacity?: number; // 0-1
    angle?: number; // degrees, 0-360
    offsetMagnitude?: number; // pixels
    blurRadius?: number; // pixels
    enabled: boolean;
  };
}

export interface ImageSlideElement extends SlideElement {
  type: 'image';
  src: string;
  altText?: string;
  objectFit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';
}

export interface VideoSlideElement extends SlideElement {
  type: 'video';
  src: string;
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

export interface ShapeSlideElement extends SlideElement {
  type: 'shape';
  shapeType: ShapeType;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  cornerRadius?: number; 
  points?: number; 
}

export interface GroupSlideElement extends SlideElement {
  type: 'group';
  children: SlideElement[];
}

console.log('Slide Elements module loaded: src/renderer/widgets/PresentationWidget/types/slideElements.ts');
