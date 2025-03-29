# Changelog

All notable changes to the SORTES project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1-beta] - 2025-03-29

### Fixed
- Fixed broken ellipses in hymn texts that were improperly split across multiple lines
- Regenerated embeddings using compatible TensorFlow.js and Universal Sentence Encoder versions
- Created browser-based embeddings generation tool for better compatibility
- Improved semantic understanding by ensuring text coherence in hymn lines

### Added
- New browser-based embeddings generation tool that matches frontend environment
- Script to automatically fix improperly broken ellipses in source hymn files

## [1.0.0-beta] - 2025-03-28

### Added
- Initial beta release of SORTES application
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