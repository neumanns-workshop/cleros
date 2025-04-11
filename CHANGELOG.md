# Changelog

All notable changes to the Cleros project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-04-14

### Changed
- Complete data architecture redesign with unified hymn corpus in a single JSON file
- Reimplemented entity span system with categorized embeddings and metadata
- Migration from individual hymn files to a consolidated data model
- Updated TensorFlow.js to version 4.22.0 for improved performance
- Refreshed UI with simplified navigation and improved responsiveness
- Streamlined data loading patterns for better efficiency
- Repository configured for GitHub Pages deployment as a submodule of neumanns-workshop.github.io

### Added
- Contextual span highlighting with improved entity categorization 
- New entity types for more granular analysis (action, artifact, beast, etc.)
- Enhanced text processing with better ellipsis handling
- Additional export and sharing capabilities
- Improved animation effects for better user experience
- Local context support for advanced functionality
- Additional span metadata for richer information display
- GitHub workflow for automated deployment to GitHub Pages

### Removed
- Individual hymn JSON files in favor of unified data structure
- Deprecated components and utilities that were no longer needed
- Redundant context providers with merged functionality

## [1.0.1-beta] - 2025-03-29

### Changed
- Redesigned embeddings architecture to focus exclusively on line-level embeddings
- Simplified embeddings data structure for better performance and maintainability
- Updated hymn data loading logic to use direct axios calls
- Improved path handling for loading hymn and embedding data

### Fixed
- Fixed broken ellipses in hymn texts that were improperly split across multiple lines
- Regenerated embeddings using compatible TensorFlow.js and Universal Sentence Encoder versions
- Improved semantic understanding by ensuring text coherence in hymn lines

### Added
- New browser-based embeddings generation tool that matches frontend environment
- Script to automatically fix improperly broken ellipses in source hymn files
- Updated `findMostRelevantHymn` function to work with line-level embeddings by calculating average similarity

## [1.0.0-beta] - 2025-03-28

### Added
- Initial beta release of Cleros application
- React-based frontend with TypeScript
- Material UI components for modern interface
- Semantic search functionality using TensorFlow.js
- Universal Sentence Encoder for text embeddings
- Query-based Random Number Generator (QRNG)
- Entity recognition and classification for hymn texts
- Oracle context for managing application state
- API service with standardized response format and caching
- Comprehensive documentation and README
- Entity highlighting in hymn text display

### Technical Features
- Dynamic module loading for TensorFlow.js optimization
- Bundle analysis tools for code optimization
- Centralized API layer with error handling
- Test suite for critical components
- Simplified data loading patterns
- Optimized embeddings service with dynamic imports
- Enhanced hymn data structures for better search capabilities 