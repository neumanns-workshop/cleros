# Cleros Web Interface

A sophisticated React application for consulting ancient Greek texts through digital bibliomancy. This interface provides two distinct modes of text consultation: **Oracle** (true random selection using atmospheric noise) and **Counsel** (AI-powered semantic search with transformer models).

## Current Architecture

### Frontend Stack
- **React 18** + **TypeScript** + **Vite** for modern development
- **Tailwind CSS** for responsive, utility-first styling
- **Lucide React** for consistent iconography
- **Custom state management** with React hooks (no external state libraries)

### Backend Infrastructure
- **Netlify Functions** for serverless compute (random.org API integration)
- **Netlify Edge Functions** for ML model caching and CDN optimization
- **Python data processing pipeline** for corpus preparation and embeddings
- **Static asset serving** for optimized corpus data and embeddings

### Machine Learning Stack
- **@xenova/transformers** (transformers.js) for client-side AI
- **all-MiniLM-L6-v2** model for semantic embeddings (384D vectors)
- **Cosine similarity** for semantic matching
- **Synonym expansion** for enhanced keyword matching

### Data Architecture
- **Ancient Greek corpus** with parallel English translations
- **Pre-computed embeddings** stored as optimized NumPy arrays
- **Structured JSON** for corpus metadata and text organization
- **Embedding mappings** for efficient vector lookup

### Components Structure

```
src/
├── components/
│   ├── layout/              # Application shell (Header, Footer)
│   ├── views/               # Page-level view components
│   │   ├── HomeView.tsx     # Landing page with consultation interface
│   │   ├── AboutView.tsx    # Project information and methodology
│   │   ├── CorpusView.tsx   # Text browser and search results
│   │   ├── PrivacyView.tsx  # Privacy policy
│   │   └── TermsView.tsx    # Terms of service
│   ├── common/              # Reusable UI components
│   │   ├── LoadingOverlay.tsx
│   │   ├── ModeSwitcher.tsx      # Oracle vs Counsel mode toggle
│   │   ├── ConsultationForm.tsx  # Query input interface
│   │   ├── AncientQueryCarousel.tsx  # Example queries with typewriter effect
│   │   ├── ShareDialog.tsx       # Social sharing modal
│   │   └── ShareCard.tsx         # Shareable result cards
│   └── OracleLine.tsx       # Individual text line display
├── hooks/                   # Custom React hooks for state and effects
│   ├── useAppState.ts       # Main application state management
│   ├── useTypewriter.ts     # Animated typewriter effect
│   ├── useCorpusData.ts     # Corpus data loading and caching
│   ├── usePersonalReports.ts # User consultation history
│   └── useRandomOrg.ts      # Random.org availability checking
├── services/                # Business logic layer with clean boundaries
│   ├── oracleService.ts     # Oracle mode: true randomness via random.org
│   ├── counselService.ts    # Counsel mode: semantic search with ML
│   ├── embeddingService.ts  # Text embeddings and similarity calculations
│   ├── semanticLineRanker.ts # Advanced semantic ranking algorithms
│   ├── synonymExpansionService.ts # Keyword expansion for better matching

├── types/                   # TypeScript definitions for type safety
│   ├── app.ts               # Application-wide types
│   ├── corpus.ts           # Corpus data structures
│   └── oracle.ts           # Oracle/Counsel response types
├── constants/               # Application constants and configuration
├── utils/                   # Pure utility functions
└── test-utils/             # Testing utilities and mocks
```

## Core Features

### Oracle vs Counsel Distinction

**Oracle Mode: True Randomness**
- Uses atmospheric noise from **random.org** API via secure Netlify function
- Pure bibliomancy with no semantic analysis or AI influence  
- Filters corpus for optimal divination (excludes proems/appendices, includes short passages)
- Provides three random selections from Orphic Hymns, Argonautica, and Lithica
- Falls back gracefully when random.org is unavailable (disables Oracle mode)

**Counsel Mode: Semantic Intelligence**
- AI-powered semantic search using **all-MiniLM-L6-v2** transformer model
- Client-side ML processing with **transformers.js**
- 384-dimensional vector embeddings for precise semantic matching
- Enhanced keyword expansion with synonym analysis
- Combines semantic similarity (70%) with keyword relevance (30%)
- Line-level analysis to identify most relevant passages within selections

### Advanced ML Features

**Performance Optimizations:**
- **Code splitting** with ML-specific chunks loaded on demand
- **Lazy loading** of transformer models until first Counsel use
- **Embedding caching** with efficient NumPy array parsing

**Semantic Processing:**
- **Pre-computed embeddings** for all corpus sentences and lines
- **Cosine similarity** calculations for semantic matching
- **Keyword expansion** using synonym services for enhanced relevance
- **Hybrid scoring** combining semantic and lexical similarity
- **Bibliomancy filtering** maintains divination authenticity

### User Experience

**Interactive Features:**
- **Responsive design** optimized for desktop and mobile
- **Typewriter carousel** showcasing example ancient queries
- **Mode switching** between Oracle and Counsel with visual feedback
- **Loading animations** with progress indication for ML operations
- **Share functionality** with beautiful card generation and QR codes
- **Personal reports** for tracking consultation history

**Accessibility:**
- **Keyboard navigation** support
- **Screen reader** compatibility
- **High contrast** mode support
- **Reduced motion** preferences respected

## Development

### Prerequisites

- **Node.js 18+** for modern JavaScript features
- **npm** (recommended) or yarn for package management
- **Git** for version control

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd cleros/web

# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Open browser to http://localhost:3000
```

### Available Scripts

**Development:**
```bash
npm run dev          # Start Vite development server
npm run preview      # Preview production build locally
npm run type-check   # Run TypeScript type checking
npm run lint         # Run ESLint with strict rules
npm run lint:fix     # Auto-fix linting issues
```

**Build:**
```bash
npm run build        # Production build (TypeScript + Vite)
```

**Testing Scripts:**
```bash
# Core testing (fast, reliable)
npm run test:working    # Essential tests + type checking
npm run test:ci         # CI-safe test suite (core + e2e)

# Comprehensive testing
npm run test           # All unit tests (watch mode)
npm run test:run       # All unit tests (single run)
npm run test:coverage  # Unit tests with coverage report
npm run test:ui        # Interactive test UI with Vitest

# Specialized test suites
npm run test:services  # Deep service integration tests
npm run test:deep      # ML model and real data tests
npm run test:e2e       # Playwright end-to-end tests
npm run test:e2e:ui    # Interactive E2E test runner

# Development utilities
npm run test:debug     # Debug tests with breakpoints
npm run test:all       # Complete test suite (unit + e2e)
```

## Testing Philosophy

### Deep Integration Testing Strategy

This project emphasizes **real-world testing** over mocking to ensure production reliability:

**Real Services Integration:**
- **Random.org API**: Tests actual atmospheric randomness calls
- **Transformers.js Models**: Tests real ML model loading and inference
- **Corpus Data**: Tests with actual ancient Greek texts and embeddings
- **Performance Validation**: Memory usage, caching, and ML model behavior

**Test Categories:**

**Unit Tests (Vitest):**
- **Service Layer**: Deep integration with real external dependencies
- **Hook Testing**: React hooks with actual data loading and state management  
- **ML Pipeline**: Real transformer model operations and embedding generation
- **Error Resilience**: Network failures, API unavailability, edge cases

**End-to-End Tests (Playwright):**
- **Complete User Flows**: Full Oracle and Counsel consultation workflows
- **Cross-browser Testing**: Chrome, Firefox, WebKit compatibility
- **Responsive Design**: Mobile and desktop layout validation
- **Performance Testing**: Page load times, ML initialization, user interactions
- **Accessibility**: Keyboard navigation, screen readers, visual contrast

**Integration Tests:**
- **Real Data Loading**: Actual corpus files and embedding vectors
- **ML Model Performance**: Transformers.js loading, memory usage, inference speed
- **Cache Management**: LocalStorage, model caching, embedding persistence
- **API Coordination**: Netlify functions, edge functions, random.org integration

### Current Test Status: 49/49 Tests Passing ✅

**Core Test Coverage:**
- All essential utilities and string operations
- Service layer with real API integration
- ML embedding operations with actual models
- Complete user workflows via E2E testing
- Performance and memory validation
- Error handling and graceful degradation

## Architecture Design Decisions

### Architectural Principles

**Service Layer Separation:**
- **oracleService**: Pure randomness with random.org integration, no ML dependencies
- **counselService**: Semantic search with transformer models and embedding operations  
- **embeddingService**: Vector operations, similarity calculations, and model management
- **Clean boundaries** prevent coupling between Oracle (random) and Counsel (semantic) modes

**State Management Philosophy:**
- **Custom React hooks** instead of external state libraries (Redux, Zustand)
- **Simpler debugging** and testing with direct state control
- **Reduced bundle size** without additional state management dependencies
- **Type safety** with full TypeScript integration
- **Focused state** - each hook manages its specific domain

**Component Architecture:**
- **View Components**: Handle routing, page logic, and data fetching
- **Common Components**: Pure UI components with props interface
- **Layout Components**: Application shell with consistent structure
- **Business Logic**: Entirely separated into service layer for testability

### Performance Architecture

**Code Splitting Strategy:**
```typescript
// Vite configuration for intelligent chunking
{
  manualChunks: {
    'vendor-react': ['react', 'react-dom'],
    'ml-transformers': ['@xenova/transformers'], // Loaded on demand
    'ml-services': ['embeddingService', 'counselService'], // Only for Counsel mode
    'app-services': ['oracleService'], // Core services
    'components': ['src/components/'] // UI components
  }
}
```

**Memory Management:**
- **Singleton patterns** for ML models to prevent memory leaks
- **Lazy loading** - ML models only load when Counsel mode is first used
- **Efficient caching** with cleanup strategies for embeddings
- **NumPy array parsing** for optimal vector storage

**Data Loading Optimization:**
- **Pre-computed embeddings** stored as compressed NumPy arrays
- **Metadata separation** for fast initial loading
- **Progressive enhancement** - Oracle mode works without ML dependencies
- **CDN optimization** via Netlify Edge Functions for model files

## Deployment & Infrastructure

### Multi-Environment Strategy

**Development Environment:**
```bash
npm run dev  # Vite dev server with hot reload
```

**Production Build:**
```bash
npm run build  # TypeScript compilation + Vite optimization
# Outputs to dist/ with:
# - Code-split chunks for optimal loading
# - ML assets loaded on demand
# - Compressed static assets
# - Source maps for debugging
```

**Deployment Targets:**
- **Netlify** (primary): Serverless functions + Edge functions + CDN
- **Static hosting** (fallback): Any provider (GitHub Pages, Vercel, etc.)
- **Local testing**: `npm run preview` for production preview

### Serverless Architecture

**Netlify Functions:**
```javascript
// /netlify/functions/random-oracle.js
// Secure random.org API integration with error handling
```

**Netlify Edge Functions:**
```typescript
// /netlify/edge-functions/model-proxy.ts  
// ML model caching and CDN optimization for transformers.js
```

**Benefits:**
- **No server management** - fully serverless architecture
- **Global CDN** for fast model and asset delivery
- **Secure API keys** - random.org credentials never exposed to client
- **Auto-scaling** - handles traffic spikes automatically

## Development Workflow

### Code Quality Standards

**Linting & Formatting:**
```bash
npm run lint         # ESLint with TypeScript + React rules
npm run lint:fix     # Auto-fix violations
npm run type-check   # TypeScript strict type checking
```

**Pre-commit Checklist:**
1. **Type safety**: `npm run type-check` must pass
2. **Linting**: `npm run lint` with zero warnings
3. **Core tests**: `npm run test:working` must pass  
4. **E2E validation**: `npm run test:e2e` for user flows

### Contributing Guidelines

**Architecture Principles:**
- Maintain **service layer separation** - Oracle and Counsel modes must remain independent
- **No mocking** in tests - use real services and data for integration confidence
- **Type safety first** - all new code must be fully typed
- **Performance conscious** - consider ML model loading and memory impact

**Testing Requirements:**
- **Real service integration** - test with actual Random.org API and ML models
- **Performance validation** - measure memory usage for ML operations
- **Error resilience** - test network failures and service unavailability
- **Cross-browser** - validate E2E tests across Chrome, Firefox, WebKit

**Pull Request Process:**
```bash
# Ensure all checks pass
npm run test:working    # Core functionality
npm run test:e2e        # End-to-end validation
npm run type-check      # TypeScript compliance
npm run lint           # Code quality
```

### Project Vision

**Cleros** represents a unique intersection of **ancient wisdom** and **modern AI**, demonstrating how **transformer models** can enhance traditional bibliomantic practices while preserving their authenticity through **true randomness**.

**Key Values:**
- **Authenticity**: Oracle mode maintains pure bibliomantic tradition
- **Innovation**: Counsel mode showcases cutting-edge semantic search
- **Performance**: Client-side ML with intelligent caching
- **Accessibility**: Universal design for all users and devices
- **Quality**: Real-world testing ensures production reliability

**Technical Excellence:**
- **49/49 tests passing** with real service integration
- **Type-safe** architecture throughout the stack
- **Serverless** infrastructure with global CDN
- **Progressive enhancement** - works without ML dependencies

This project serves as a **reference implementation** for sophisticated client-side ML applications with **clean architecture**, **comprehensive testing**, and **production-ready deployment strategies**.

---

*Cleros is a donation-supported project. Contributions help maintain the ancient wisdom accessible through modern technology.*