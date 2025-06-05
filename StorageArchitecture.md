# AIO Application Suite - Storage Architecture Plan

This document outlines the planning and considerations for the storage architecture of the AIO Application Suite, encompassing local storage and integral collaborative capabilities for its various widgets/modules (e.g., Presentations, Lighting, Encoding, Streaming).

## 1. Introduction

*   **Purpose**: Define a robust, flexible, and collaborative storage strategy for **AIO Projects** (also referred to as "Productions" or "Events"). An AIO Project is a versatile container. Its specific purpose or "type" (e.g., a presentation-focused project, a lighting show, a full multi-disciplinary production) is determined by the collection of widget modules it actively includes and configures.
*   **Goals**: Ensure data integrity, portability, ease of use, and scalability. The architecture must support seamless local use, transparent background synchronization for shared access, and real-time remote collaboration across different widgets operating on the same AIO Project.

## 2. Core Requirements

*   **Save/Load AIO Projects**: Users must be able to save their AIO Projects (containing data for one or more widgets) and reload them later.
*   **Modular Data Management**: The system must manage data and configurations specific to each widget (Presentation, Lighting, Encoding, etc.) within an AIO Project.
*   **Shared Asset Management**: Manage shared media assets (images, videos, fonts, audio files) used across different widgets within an AIO Project, as well as widget-specific assets.
*   **Application Settings**: Store user preferences and application-wide configurations (including sync settings).
*   **Data Integrity**: Prevent data loss or corruption at both project and individual widget data levels.
*   **Portability**: AIO Projects should be movable between systems, maintaining all internal references.
*   **Offline Access & Operation**: Users must be able to work on AIO Projects fully offline. Changes are queued for synchronization when connectivity is restored.
*   **Shared Access & Transparent Syncing**: Multiple users (e.g., in the same building or remotely) must be able to access and work on common AIO Projects. Synchronization of project data (including all widget data and assets) with a central repository must be **transparent, automatic, and occur in the background**.
*   **Real-time Remote Collaboration (WSS)**: Support for multiple users to concurrently interact with different parts of the *same AIO Project* (e.g., one user on Presentations, another on Lighting). Real-time updates (e.g., cursor positions with names, live data changes) relevant to the specific widget a user is interacting with should be broadcast via WebSockets (WSS).

## 3. Data Entities

This architecture distinguishes between globally reusable library content, event-specific project data, and application-level settings.

### 3.1. Global Libraries (User-Specific)

These are top-level storage locations for content intended to be reused across multiple AIO Projects. Each widget that benefits from such a library will have its own dedicated global library root.

*   **AIO Presentation Library**: A dedicated root directory (e.g., `AIO_Presentation_Library/`) for all reusable content managed by the Presentation Widget. This directory itself acts as a container for multiple *user-creatable libraries*.
    *   **User-Created Libraries (Sub-directories)**: Within `AIO_Presentation_Library/`, users can create named sub-directories, each representing a distinct library (e.g., `Songs/`, `Sermons/`, `Youth_Ministry_Templates/`). The application will initialize with a `Default/` library.
        *   Each user-created library folder (e.g., `AIO_Presentation_Library/Songs/`) holds:
            *   **Library Item Files**: Individual JSON files defining reusable presentation components like songs or templates (e.g., `Amazing_Grace.json`, `Standard_Sermon_Layout.json`). These are the master copies of reusable content, stored within their respective user-created library folder.
            *   **Library-Specific Media (Optional)**: Each user-created library folder can contain its own `Media/` sub-directory for assets primarily associated with items in that library (e.g., `AIO_Presentation_Library/Songs/Media/Worship_Background_1.jpg`).
    *   **Global Library Media (Optional)**: A top-level `Media/` folder directly under `AIO_Presentation_Library/` could still exist for assets truly global to all user-created libraries, if desired.
    *   **Presentation Library Manifest (Optional)**: A `presentation_library_manifest.json` at the root of `AIO_Presentation_Library/` could list and manage these user-created library sub-directories.

*(Other widgets might eventually have their own global libraries, e.g., `AIO_Lighting_Fixture_Library/`)*

### 3.2. AIO Project (Production/Event)

The top-level container for all data related to a specific production or event. This is the primary unit of work for assembling and running an event.

*(Moved to section 3.2 above)*
    *   **Project Identifier**: A folder, e.g., `MyProduction.aio/`, identifiable by the application.
    *   **Project Manifest (`project_manifest.json`)**: Located at the root of the AIO Project folder. This crucial file defines the nature and content of this specific AIO Project. It contains:
        *   Global Project Metadata: Name, author, creation/modification dates, version, a globally unique ID (GUID) for syncing, and potentially a user-defined "Project Type" or "Focus" tag (e.g., "Presentation", "Live Show", "Broadcast Event") for easier identification.
        *   **`active_modules` List**: An explicit list of widget module identifiers (e.g., `["presentation", "lighting"]`) that are active and configured for *this specific* AIO Project. The presence of a module in this list dictates whether its corresponding data subdirectory (e.g., `presentation_module/`) is expected and managed.
        *   Pointers/paths to the data files or subdirectories for each module listed in `active_modules`.
        *   Overall project-level settings or notes.
    *   **Widget-Specific Data Modules**: For each module identifier listed in the `project_manifest.json`'s `active_modules` list, a corresponding data subdirectory (or set of files) will exist within the AIO Project folder. If a module is not listed as active, its data subdirectory may not be present. Examples:
        *   **Presentation Module Data** (e.g., in `presentation_module/` for a specific AIO Project):
            *   `event_cuelists/`: Directory containing Cuelist files specifically for *this event*. These files define the sequence of presentation items for the event.
                *   They primarily consist of *references* to items within specific user-created libraries in the `AIO_Presentation_Library/` (e.g., pointing to a song file like `../../../AIO_Presentation_Library/Songs/Amazing_Grace.json` or `../../../AIO_Presentation_Library/Default/Welcome_Slide.json`).
                *   They can also include event-specific overrides for library items (e.g., using a different background for a song just for this event).
                *   They can also contain inline cues created uniquely for this event and not intended for the global library.
                *   Example: `Sunday_Service_RunOrder.json`, `Special_Announcement_Sequence.json`.
            *   `assets/`: Subfolder for media assets (images, videos, fonts) that are *unique to this specific AIO Project's presentation needs* or are overriding a global library asset for this event only.
        *   **Lighting Module Data** (e.g., in `lighting_module/`):
            *   `lighting_cues.json`: Cue lists, fixture settings, timings.
            *   `dmx_patch.json`: DMX address assignments.
            *   `fixture_profiles/`: Custom fixture definitions.
        *   **Encoding Module Data** (e.g., in `encoding_module/`):
            *   `encoding_profiles.json`: Output formats, bitrates, destinations.
        *   **Audio Mixer Module Data** (e.g., in `audio_module/`):
            *   `mixer_settings.json`: Channel strips, routing, bus configurations.
            *   `audio_clips/`: Specific audio files for playback.
*   **Shared Media Assets (`shared_assets/`)**: A dedicated folder within the AIO Project for media assets (images, videos, fonts, audio files) that can be referenced and used by multiple widgets within that same project.
    *   Asset Metadata: Original source path, type, size, dimensions, content hash for deduplication, unique ID for each asset.
*   **Application Configuration (User-Specific, Local)**:
    *   User Preferences (UI theme, default tool settings, window layouts).
    *   Recently Opened AIO Projects list.
    *   Sync settings (central repository URL/address, user credentials/authentication tokens, sync preferences).
    *   Stored in the standard Electron application data directory.

## 4. Local Storage Model

### 4.1. Global Library Storage (User-Specific)

*   **Location**: A user-configurable root directory, e.g., `~/Documents/AIO_Global_Libraries/`. Within this, widget-specific libraries reside.
    *   Example: `~/Documents/AIO_Global_Libraries/AIO_Presentation_Library/`
*   **Contents**: As defined in Section 3.1. The `AIO_Presentation_Library/` will contain user-created library folders (e.g., `Default/`, `Songs/`, `Sermons/`), each potentially containing item files and their own `Media/` folders.

### 4.2. Application Data (User-Specific)

*   **Location**: Stored in standard application data directories (e.g., `~/Library/Application Support/AIOAppSuite/` on macOS, `%APPDATA%/AIOAppSuite/` on Windows).
*   **Contents**:
    *   User preferences (UI settings, default behaviors).
    *   Application-wide configurations (e.g., sync service credentials, API keys if any, **paths to Global Library roots like `AIO_Presentation_Library/`**).
    *   Local sync state, logs.
    *   Potentially a manifest of known AIO Projects for quick access.

### 4.3. AIO Project Structure (Local)

*   A dedicated, user-configurable (with a sensible default) root folder will be established on the user's local system for storing all AIO Projects.
    *   Example Default: `~/Documents/AIO_Projects/` or `~/Documents/MyProductions/`.

*(Renumbered to 4.3 above)*

*   **Project Unit**: Each AIO Project will be stored as a dedicated folder, identifiable by an `.aio` extension (e.g., `MyBigEvent.aio/`). This folder is the self-contained unit for the entire production/event. The specific collection of widget modules active within it (as defined by its `project_manifest.json`) determines its functional scope (e.g., whether it's primarily for presentations, lighting, or a combination).
*   **Example Folder Contents** (`MyBigEvent.aio/`):
    *   `project_manifest.json`: (As described in Data Entities) Core metadata and pointers to widget modules.
    *   `presentation_module/`
        *   `event_cuelists/`
            *   `sunday_morning_flow.json` (This file would reference items from user-created libraries within the global AIO_Presentation_Library, e.g., `AIO_Presentation_Library/Songs/Amazing_Grace.json`)
        *   `assets/` (Media specific to this event's presentation needs)

    *   `lighting_module/`
        *   `lighting_cues.json`
        *   `dmx_patch.json`
        *   `fixture_profiles/`
    *   `encoding_module/`
        *   `encoding_profiles.json`
    *   `audio_module/`
        *   `mixer_settings.json`
        *   `audio_clips/`
    *   `shared_assets/` (images, videos, fonts, audio accessible by any module in this project)
        *   `images/`
        *   `videos/`
        *   `fonts/`
        *   `audio/`
    *   `project_thumbnail.png` (optional): An auto-generated or user-chosen preview image for the entire AIO Project.
    *   `sync_state.json` (local use, managed by sync engine): Stores local sync state, last synced revision, conflict markers, etc.

### 4.3. Asset Management within an AIO Project (Local)

*   **Asset Import**: When a user adds an external asset:
    *   If intended for a specific widget (e.g., an image for a slide in the Presentation module), it's copied into that module's dedicated `assets/` folder (e.g., `MyBigEvent.aio/presentation_module/assets/images/`).
    *   If intended for use across multiple widgets, it can be placed in the `MyBigEvent.aio/shared_assets/` folder.
*   **Path Referencing**: All asset paths stored within widget configuration files (e.g., `presentation_config.json`) will be relative to the root of the AIO Project folder (e.g., `presentation_module/assets/images/my_image.png` or `shared_assets/videos/intro.mp4`). This maintains project portability.
*   **Font Handling**: Fonts can be project-specific (in `shared_assets/fonts/` or a module's `assets/fonts/`) and will be dynamically loaded when the AIO Project is active.

## 5. Collaboration and Synchronization Strategy

This section outlines the integrated strategies for collaborative features, which are core to the AIO Application Suite.

### 5.1. Central Repository & Syncing (Dropbox-like Functionality)

*   **Concept**: A central server or service acts as the source of truth for shared **AIO Projects**. Local AIO application instances **automatically and transparently sync** their entire AIO Project folders (including the manifest, all widget module data, and all associated assets) with this repository in the background whenever an internet connection is available. This aims for an "always up-to-date" experience for all collaborators.
*   **What to Sync**: The entire `MyProduction.aio/` project folder structure and its contents. This includes:
    *   `project_manifest.json`
    *   All widget-specific data files (e.g., `presentation_config.json`, `lighting_cues.json`)
    *   All assets in module-specific `assets/` folders and the `shared_assets/` folder.
*   **Media Asset Syncing & Storage**: This is a key challenge.
    *   **Deduplication is Crucial**: The central repository MUST use content-addressable storage (hashing files). This means an identical image/video file, even if used in 100 different presentations by 20 users, is physically stored only once on the server.
    *   **Sync Mechanism**: Local clients would sync the `presentation.json`. For assets, the client would compare its local asset hashes with a manifest from the server for that project. Missing assets are downloaded; new local assets are uploaded (if not already on the server by hash).
*   **Conflict Resolution**: A robust strategy is needed for any concurrently edited files within the AIO Project (especially JSON configuration files like `project_manifest.json` or widget data files). Options include: last-write-wins (potentially with warnings), operational transformation (OT) or Conflict-free Replicated Data Types (CRDTs) for structured data, or versioning with manual/semi-automated merge UIs.
*   **Permissions & Access Control**: Define who can create, view, edit, and share presentations in the central repository.

### 5.2. Real-time Remote Collaboration (WSS)

*   **Concept**: Users on different machines can open the *same AIO Project* (sourced from the synced central repository). If multiple users are interacting with the *same widget instance* within that project (e.g., both viewing/editing the same presentation slides, or the same lighting cue list), they can see each other's interactions in real-time (e.g., cursor movements with names, live edits to elements, parameter changes).
*   **Mechanism**: WebSockets (WSS) for low-latency communication between connected clients. A server component will manage WSS sessions, routing messages to relevant collaborators for a given AIO Project and specific widget/module instance.
*   **Data Flow**: Changes made by a user within a specific widget are:
    1.  Reflected locally in the application's in-memory state for that widget.
    2.  Broadcast via WSS to other collaborators currently active in the *same widget instance* of the *same AIO Project*.
    3.  Persisted to the local file system (e.g., updating `presentation_config.json`).
    4.  These local file changes are then picked up by the background sync mechanism to update the central repository.
*   **State Management**: Requires careful management of the in-memory state for each active widget, synchronizing WSS updates, local user actions, and changes pulled from the sync engine.

### 5.3. Considerations for Synced Media Storage

*   **Minimize Redundant Transfers**: Clients should only download/upload asset data if the content hash indicates the asset is new or different.
*   **Bandwidth Management**: Consider options for throttling, or allowing users to sync assets on demand if bandwidth is a concern (though this adds complexity).
*   **Local Caching**: The entire synced AIO Project (all files and assets) is cached locally, enabling full offline work. The `MyProduction.aio/` folder *is* the local cache.

## 6. Data Formats (Reiteration)

*   **`presentation.json`**: JSON. Needs a well-defined schema.
*   **Media Assets**: Stored and transferred in their native formats.
*   **Application Settings**: JSON.

## 7. Key Considerations (Expanded for Multi-Widget AIO Projects)

*   **Granular Unique IDs**: All core entities (AIO Projects, widget data instances, slides, elements, cues, assets in manifests, etc.) must have globally unique IDs (UUIDs) to facilitate reliable referencing, deep linking, and syncing.
*   **Data Integrity**: JSON schema validation for all configuration files. Asset checksums (hashes) are inherent for deduplication and integrity checks.
*   **Scalability**: 
    *   Local: Efficiently handling large AIO Projects with many modules and numerous assets.
    *   Server-side: Performance for many concurrent users, large numbers of AIO Projects, and vast numbers of (deduplicated) assets.
    *   WSS: Handling many concurrent connections and high volumes of real-time messages per AIO Project/widget session.
*   **Undo/Redo**: Must work seamlessly within each widget, considering that collaborative changes might also be occurring. This is complex and might require OT/CRDT-like approaches for shared data structures.
*   **Backup & Recovery**: Local auto-save features for active AIO Project data. The central repository must have its own robust backup and disaster recovery strategy.
*   **Schema & Data Migration**: As data structures for `project_manifest.json` or individual widget modules evolve, a versioning and migration path is critical for both local AIO Projects and centrally stored data.

## 8. Advanced Features & Extensibility

*   **Global/Team Asset Library**: Beyond project-specific assets, a shared asset library (potentially also synced) for common brand assets, templates, etc., accessible across multiple AIO Projects.
*   **Inter-Widget Communication/Triggering**: Defining how actions in one widget (e.g., advancing a slide in Presentations) might trigger actions in another (e.g., changing a lighting cue).
*   **Comprehensive Export Formats**: Exporting entire AIO Projects or specific widget outputs (e.g., presentation to PDF/video, lighting cues to a standard format, streaming setup to an OBS profile).
*   **Plugin/Extension Architecture**: How third-party or additional first-party widgets/modules can be added to the AIO Application Suite and integrate with the project structure and sync model.

## 9. Open Questions & Next Steps for Design

*   **Detailed Schemas**: Define the precise JSON schemas for:
    *   `project_manifest.json`
    *   Data files for each core widget (Presentation, Lighting, Encoding, Audio, etc.).
*   **Asset Referencing and Management**: Finalize how assets in `shared_assets/` vs. module-specific `assets/` are referenced and managed to avoid conflicts or ambiguity.
*   **Handling Missing/Broken Asset Links**: Robust strategies for local and synced scenarios, especially if a user partially syncs a project or an asset fails to upload/download.
*   **Technology Stack for Backend & Sync**: Evaluate and select technologies for the central repository (database, file storage) and the synchronization engine (e.g., CouchDB/PouchDB, Nakama, Supabase, Firebase, custom gRPC/WebSocket solution).
*   **Conflict Resolution Mechanisms**: Detailed design for handling concurrent edits to shared JSON files. This is a critical and complex area.
*   **Security Model**: Comprehensive design for authentication, authorization (project/module-level permissions), data encryption (at rest and in transit).
*   **WSS Protocol Definition**: Define the message formats and protocols for real-time collaboration updates for each widget.
*   **Offline Sync & Large Change Management**: Strategies for efficiently syncing large volumes of changes after extended offline periods.
*   **API Design for Widget Data Access**: How widgets will read/write their data from/to the AIO Project structure.
