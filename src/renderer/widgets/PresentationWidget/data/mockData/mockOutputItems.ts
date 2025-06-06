import React, { useMemo } from 'react';
// Assuming OutputItem is exported from here, adjust if necessary
import type { OutputItem } from '../../types/presentationSharedTypes';

// Raw data, not exported directly if always used via the hook
const rawMockAvailableOutputs: OutputItem[] = [
  {
    id: 'output-1',
    name: 'Main Projector',
    contentPreview: 'Live Slide Content',
    audioLevel: 70,
    peakAudioLevel: 85
  },
  {
    id: 'output-2',
    name: 'Stage Display',
    contentPreview: 'Notes & Timer',
    audioLevel: 45,
    peakAudioLevel: 60
  },
  {
    id: 'output-3',
    name: 'NDI Stream 1',
    contentPreview: 'Lower Thirds',
    audioLevel: 92,
    peakAudioLevel: 98
  },
  { id: 'output-4', name: 'Recording Feed' },
];

export const useMockAvailableOutputs = (): OutputItem[] => useMemo(() => rawMockAvailableOutputs, []);
