# Cleros Web Interface

A modern React application for consulting ancient Greek texts through digital bibliomancy. This interface provides two modes of text consultation: Oracle (random selection) and Counsel (semantic search).

## Architecture

### Components Structure

```
src/
├── components/
│   ├── layout/              # Layout components (Header, Footer)
│   ├── views/               # Page-level view components
│   │   ├── HomeView.tsx     # Landing page with consultation form
│   │   ├── AboutView.tsx    # About page with project information
│   │   └── CorpusView.tsx   # Corpus browser and results display
│   ├── common/              # Reusable UI components
│   │   ├── LoadingOverlay.tsx
│   │   ├── ModeSwitcher.tsx
│   │   ├── ConsultationForm.tsx
│   │   ├── AncientQueryCarousel.tsx
│   │   ├── ShareDialog.tsx
│   │   └── ShareCard.tsx
│   └── OracleLine.tsx       # Component for displaying text lines
├── hooks/                   # Custom React hooks
│   ├── useAppState.ts       # Main application state management
│   ├── useTypewriter.ts     # Typewriter effect for carousel
│   ├── useCorpusData.ts     # Corpus data loading
│   └── usePersonalReports.ts
├── services/                # Business logic and external APIs
│   ├── oracleService.ts     # Oracle mode (random selection)
│   ├── counselService.ts    # Counsel mode (semantic search)
│   ├── embeddingService.ts  # Text embeddings and similarity
│   └── semanticLineRanker.ts
├── types/                   # TypeScript type definitions
├── constants/               # Application constants
└── utils/                   # Utility functions
```

### Key Features

- **Oracle Mode**: True random selection using atmospheric noise from random.org
- **Counsel Mode**: Semantic search using transformer models for text similarity
- **Corpus Browser**: Navigate and read all ancient texts
- **Personal Reports**: Save and review consultation history
- **Share Functionality**: Create shareable cards of consultations
- **Responsive Design**: Works on desktop and mobile devices

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run linter
npm run lint
npm run lint:fix

# Build for production
npm run build
```

### Testing

The project includes comprehensive testing:

- **Unit Tests**: Individual component and service testing
- **Integration Tests**: End-to-end workflow testing
- **Mock Services**: Isolated testing with mocked external dependencies

```bash
# Run all tests
npm test

# Run tests with UI
npm test:ui

# Run tests with coverage
npm test:coverage
```

### Code Quality

- **ESLint**: Configured with TypeScript and React rules
- **TypeScript**: Strict type checking for better code quality
- **Vitest**: Modern testing framework with fast execution

## Architecture Decisions

### State Management

Uses a custom `useAppState` hook instead of external state management libraries for:
- Simpler debugging and testing
- Reduced bundle size
- Direct control over state updates
- Type safety with TypeScript

### Component Organization

- **View Components**: Handle routing and page-level logic
- **Common Components**: Reusable UI elements
- **Layout Components**: Application structure
- **Business Logic**: Separated into service layer

### Services Layer

- **oracleService**: Handles true random selection using random.org API
- **counselService**: Manages semantic search with transformer models
- **embeddingService**: Handles text embeddings and similarity calculations

### Testing Strategy

- **Component Tests**: Verify UI behavior and user interactions
- **Service Tests**: Test business logic and external API integration
- **Integration Tests**: Verify complete user workflows
- **Mock Strategy**: Isolate units under test from external dependencies

## Performance Considerations

- **Code Splitting**: Automatic chunking for vendors and features
- **Lazy Loading**: Dynamic imports for large components
- **Caching**: LocalStorage for consultation history
- **Embedding Optimization**: Efficient vector similarity calculations

## Deployment

The application is built with Vite for optimal production builds:

```bash
npm run build
```

Outputs optimized static files to `dist/` directory ready for deployment to any static hosting service.

## Contributing

1. Follow the existing code style (ESLint configuration)
2. Write tests for new features
3. Update type definitions as needed
4. Document significant changes

## License

MIT License - see LICENSE file for details.
