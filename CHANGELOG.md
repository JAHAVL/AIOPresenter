# Changelog

All notable changes to the AIOPresenter application will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.5] - 2025-06-07

### Fixed
- Fixed presentation files not showing in the UI by correcting IPC parameter passing in the preload script
- Enhanced debugging in StorageService to provide more detailed information about file operations
- Fixed syntax errors in PresentationWidget.tsx related to conditional rendering of presentation files

### Added
- Added detailed logging throughout the IPC communication chain for better debugging
- Created useLibraryContentManager hook to manage presentation file state

## [0.2.4] - 2025-06-06

### Added
- Initial implementation of presentation file creation and listing
- Added library selection functionality
- Implemented basic UI components for presentation management

### Changed
- Improved IPC communication between renderer and main processes
- Enhanced error handling in storage operations

## [0.2.3] - 2025-06-05

### Added
- Basic library management functionality
- Initial implementation of the StorageService for filesystem operations
- Setup of IPC channels for communication between main and renderer processes

## [0.2.2] - 2025-06-04

### Added
- Initial UI components and layout
- Basic application structure with Electron
- Project configuration and build setup

## [0.2.1] - 2025-06-03

### Added
- Project initialization
- Basic Electron setup with React and TypeScript
- Development environment configuration
