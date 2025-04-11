# Changelog

All notable changes to the Cleros web interface will be documented in this file.

## [2.0.0] - 2025-04-11

### Changed
- Major data structure refactoring: consolidated individual hymn files into a single hymns.json
- Moved from file-per-hymn structure to a unified data model for improved performance
- Updated TensorFlow.js from 3.x to 4.22.0 for better compatibility and performance
- Redesigned entity span handling with categorized embeddings
- Simplified UI by removing sidebar and improving main content layout
- Improved responsive design for better mobile experience

### Added
- Contextual span highlighting with new component
- Share functionality with export options
- Animation improvements including typewriter effect enhancements
- Better error handling and fallback scenarios
- Additional entity categories for more precise highlighting

### Removed
- Sidebar component in favor of cleaner UI
- Deity context provider (functionality merged into Oracle context)
- Several deprecated components and utility functions

## [1.1.0-beta] - 2025-04-07

### Changed
- Updated naming conventions throughout the codebase

## [1.0.3-beta] - 2025-03-29

### Added
- Automatic sidebar closing when a successful hymn query is made, improving focus on the oracle's response

## [1.0.2-beta] - 2025-03-29

### Added
- Sidebar toggle functionality
  - Use `Cmd/Ctrl + \` to toggle the sidebar
  - Click anywhere in the main content area to close the sidebar
- Improved content centering that maintains position during sidebar transitions

## [1.0.1-beta.1] - Initial Release

### Added
- Basic oracle interface with query input
- Support for Orphic Hymns source
- Dark mode aesthetic
- Example prompts
- Donation integration
- Responsive layout 