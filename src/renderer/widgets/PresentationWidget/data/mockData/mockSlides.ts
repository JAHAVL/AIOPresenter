import { Slide } from '../../types/presentationSharedTypes';

// Extended Slide interface for mock data with additional UI properties
export interface MockSlide extends Slide {
  name: string;
  thumbnailUrl?: string;
  content?: string;
  notes?: string;
  backgroundColor?: string;
  textColor?: string;
}

// Generate mock slides with different background colors and content
export const mockSlides: MockSlide[] = [
  {
    id: 'slide-001',
    name: 'Welcome',
    elements: [],
    content: 'Welcome to the Presentation',
    notes: 'Opening slide - introduce the topic',
    backgroundColor: '#3f51b5',
    textColor: '#ffffff',
  },
  {
    id: 'slide-002',
    name: 'Agenda',
    elements: [],
    content: 'Today\'s Topics',
    notes: 'Go through the agenda briefly',
    backgroundColor: '#2196f3',
    textColor: '#ffffff',
  },
  {
    id: 'slide-003',
    name: 'Introduction',
    elements: [],
    content: 'Introduction to the Subject',
    notes: 'Provide background information',
    backgroundColor: '#03a9f4',
    textColor: '#ffffff',
  },
  {
    id: 'slide-004',
    name: 'Key Points',
    elements: [],
    content: 'Main Discussion Points',
    notes: 'Highlight the key aspects',
    backgroundColor: '#00bcd4',
    textColor: '#ffffff',
  },
  {
    id: 'slide-005',
    name: 'Data Analysis',
    elements: [],
    content: 'Analysis of Results',
    notes: 'Explain the data findings',
    backgroundColor: '#009688',
    textColor: '#ffffff',
  },
  {
    id: 'slide-006',
    name: 'Case Study',
    elements: [],
    content: 'Real-world Example',
    notes: 'Discuss the case study details',
    backgroundColor: '#4caf50',
    textColor: '#ffffff',
  },
  {
    id: 'slide-007',
    name: 'Comparison',
    elements: [],
    content: 'Comparing Options',
    notes: 'Compare and contrast different approaches',
    backgroundColor: '#8bc34a',
    textColor: '#ffffff',
  },
  {
    id: 'slide-008',
    name: 'Benefits',
    elements: [],
    content: 'Key Benefits',
    notes: 'Highlight the advantages',
    backgroundColor: '#cddc39',
    textColor: '#333333',
  },
  {
    id: 'slide-009',
    name: 'Challenges',
    elements: [],
    content: 'Potential Challenges',
    notes: 'Address possible obstacles',
    backgroundColor: '#ffeb3b',
    textColor: '#333333',
  },
  {
    id: 'slide-010',
    name: 'Solutions',
    elements: [],
    content: 'Proposed Solutions',
    notes: 'Present solutions to challenges',
    backgroundColor: '#ffc107',
    textColor: '#333333',
  },
  {
    id: 'slide-011',
    name: 'Timeline',
    elements: [],
    content: 'Project Timeline',
    notes: 'Go through the project schedule',
    backgroundColor: '#ff9800',
    textColor: '#ffffff',
  },
  {
    id: 'slide-012',
    name: 'Budget',
    elements: [],
    content: 'Budget Overview',
    notes: 'Review the financial aspects',
    backgroundColor: '#ff5722',
    textColor: '#ffffff',
  },
  {
    id: 'slide-013',
    name: 'Team',
    elements: [],
    content: 'Meet the Team',
    notes: 'Introduce team members',
    backgroundColor: '#795548',
    textColor: '#ffffff',
  },
  {
    id: 'slide-014',
    name: 'Q&A',
    elements: [],
    content: 'Questions & Answers',
    notes: 'Prepare for common questions',
    backgroundColor: '#9e9e9e',
    textColor: '#ffffff',
  },
  {
    id: 'slide-015',
    name: 'Thank You',
    elements: [],
    content: 'Thank You!',
    notes: 'Closing remarks and contact information',
    backgroundColor: '#607d8b',
    textColor: '#ffffff',
  },
];

export default mockSlides;
