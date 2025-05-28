# AIOPRESENTER

## Overview

AIOPRESENTER is a desktop presentation software designed to provide a robust platform for creating, managing, and delivering dynamic presentations. It aims to support rich media, including live video inputs, and offer flexible slide editing capabilities. The initial development will focus on the core **Presentation Widget**.

**UI/UX Goals:** The application will feature a modern, clean, and intuitive user interface, prioritizing ease of use and an efficient workflow. Navigation between major functional areas (widgets) will be handled via a **tab-based system**, similar to applications like DaVinci Resolve.

## Core Goals & Features

- **Presentation Management:** Create, organize, and deliver slide-based presentations.
- **Slide System:**
    - Slides are stored as individual files, allowing for modularity and easy sharing.
    - Slides can be organized into libraries (directories) for better management.
- **Slide Editing:**
    - A dedicated slide editor view.
    - Each slide acts as a container where various components (text, images, videos, etc.) can be placed and arranged.
- **Live Video Input:** Support for integrating live video feeds into presentations.
- **Timecode Synchronization:**
    - Ability to synchronize slide transitions and video playback with external timecode sources.
    - Trigger slides automatically based on incoming timecode.
- **Playlist Functionality:** Create playlists by selecting and ordering slide files for a seamless presentation flow.
- **Offline First with Online Collaboration:** 
    - The application must be fully functional offline.
    - It will also support internet connectivity for real-time collaboration and synchronization with other instances of AIOPRESENTER.
- **Database Integration:** The application will connect to a database for storing and managing persistent data (e.g., user settings, library metadata, collaborative session info).
- **AI-Powered Control & Chat:**
    - The entire application aims to be controllable via AI through natural language commands.
    - An integrated AI chat interface will be provided within the UI for this purpose.

## Architectural Concepts

AIOPRESENTER is built using Electron, React, and TypeScript, providing a cross-platform desktop application with a modern UI and strong type safety.

### Key Views

1.  **Main Presentation View:** This will be the primary interface for managing and delivering presentations. It will likely include:
    *   **Library Panel:** Displays available slide libraries (directories) and their constituent slide files.
    *   **Playlist Panel:** Shows the currently loaded playlist, which is an ordered list of slide files selected for presentation.
    *   **Slide Preview/Sequence Panel:** Displays thumbnails or a list of slides within the active playlist, allowing for quick navigation and selection.
    *   **Live Output Preview:** A preview of what is being sent to the main presentation display.
    *   *(Actual Output Display will be managed by Electron, potentially on a separate screen)*

2.  **Slide Editor View:** A dedicated interface for creating and modifying slides:
    *   **Canvas/Stage:** The main area where the slide content is visually constructed.
    *   **Component Library:** A palette of available components (text boxes, image placeholders, video players, etc.) that can be dragged onto the slide.
    *   **Properties Inspector:** Allows editing of properties for the selected slide or component (e.g., text font, image source, video controls, component position and size).

### Data Management

- **Slides:** Individual files (format to be determined, e.g., JSON, XML, or a custom binary format) that store the layout, content, and component information for a single slide.
- **Libraries:** Represented by directories in the file system, containing multiple slide files.
- **Playlists:** Likely a simple file (e.g., JSON) that stores an ordered list of paths to slide files, along with any playlist-specific settings.

### Key Technologies & Libraries

- **Framework:** Electron
- **UI Library:** React
- **Language:** TypeScript
- **Bundler:** Webpack
- **Database:** MySQL (development instance on Docker, port 3308)
- **Drag & Drop:** A modern, well-supported library (e.g., SortableJS, react-beautiful-dnd, or dnd-kit) will be used for intuitive reordering of elements such as slides, playlist items, and library items.
- **Styling:** (To be decided - e.g., CSS Modules, Styled Components, Tailwind CSS)

## Future Considerations / Roadmap

- Advanced animation and transition effects for slides and components.
- Support for various live input sources and protocols (e.g., NDI, SDI via capture cards).
- Network control capabilities (e.g., remote control via web interface or OSC).
- Extensible plugin architecture for custom components or functionality.
- Detailed timecode mapping and control interface.
