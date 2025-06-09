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
  RENAME_USER_LIBRARY = 'storage:rename-user-library',
  DELETE_USER_LIBRARY = 'storage:delete-user-library',
  CREATE_PRESENTATION_FILE = 'storage:create-presentation-file',
  LIST_PRESENTATION_FILES = 'storage:list-presentation-files',
  PRESENTATION_FILES_DID_CHANGE = 'storage:presentation-files-did-change',
  FORCE_REFRESH_PRESENTATION_FILES = 'storage:force-refresh-presentation-files',
  OPEN_PRESENTATION_FILE = 'storage:open-presentation-file',
  SAVE_PRESENTATION_FILE = 'storage:save-presentation-file',
  DELETE_PRESENTATION_FILE = 'storage:delete-presentation-file',
  // Add other storage-related channels here
}

export enum ConfigChannel {
  GET_CONFIG_VALUE = 'config:get-value',
  SET_CONFIG_VALUE = 'config:set-value',
  // Add other config-related channels here
}

// You can add more enums for different categories of IPC channels

import type { PresentationFile, SlideElement, Slide, Cue, Cuelist } from '@shared/types';

export interface Library {
  id: string;
  name: string;
  path: string; // Absolute path to the library's folder
  cuelists?: Cuelist[]; // A library contains cuelists. Note: Cuelist here will now refer to the imported type.
}

export interface ListUserLibrariesResponse {
  success: boolean;
  libraries?: Library[];
  error?: string;
}

// Represents a Cue and its slides, primarily for use in SlidesView when displaying multiple cues
export interface CueGroup {
  cue: Cue;
  slides: Slide[]; // Redundant with cue.slides but reinforces the data structure for SlidesView
  // cuelistId?: string; // Optional: if needed to trace back to the Cuelist
}

// Represents the content of an AIOPresentation file
export interface AIOPresentationContent {
  version: string;
  slides: Slide[];
  id?: string;
  name?: string;
  metadata?: {
    createdAt?: string;
    modifiedAt?: string;
    [key: string]: any; // Additional metadata fields
  };
}
