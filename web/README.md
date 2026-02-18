# Cleros Web Interface

React application for consulting ancient Greek texts through digital bibliomancy. Two modes: **Oracle** (cryptographic random selection) and **Counsel** (AI-powered semantic search).

## Stack

- **React 18** + **TypeScript** + **Vite 6** + **Tailwind CSS**
- **@xenova/transformers** for client-side ML (all-MiniLM-L6-v2, 384D embeddings)
- **Web Crypto API** for cryptographically secure randomness
- **Cloudflare Pages** for static hosting
- **GitHub Actions** for CI/CD (lint, type-check, test, deploy)

## Development

```bash
npm install
npm run dev          # Vite dev server at localhost:3000
npm run build        # Production build (tsc + vite)
npm run lint         # ESLint with zero-warning policy
npm run type-check   # TypeScript strict checking
npm run test         # Vitest unit tests
npm run test:e2e     # Playwright end-to-end tests
```

## Architecture

### Source Layout

```
src/
├── components/
│   ├── layout/              # Header, Footer
│   ├── views/               # Page-level components
│   │   ├── HomeView.tsx     # Consultation interface
│   │   ├── AboutView.tsx    # Project info
│   │   └── CorpusView.tsx   # Text browser and results
│   └── common/              # Shared UI components
│       ├── ModeSwitcher.tsx  # Oracle/Counsel toggle
│       ├── ConsultationForm.tsx
│       ├── ShareDialog.tsx  # Shareable result cards
│       └── ...
├── services/                # Business logic
│   ├── oracleService.ts     # Random selection via crypto.getRandomValues
│   ├── counselService.ts    # Semantic search with cosine similarity
│   ├── embeddingService.ts  # ML model loading and vector ops
│   ├── semanticLineRanker.ts
│   └── synonymExpansionService.ts
├── hooks/                   # State management
│   ├── useAppState.ts       # Central app state
│   ├── useCorpusData.ts     # Corpus loading/caching
│   └── usePersonalReports.ts
├── types/                   # TypeScript definitions
├── constants/               # Configuration
└── utils/                   # Pure utility functions
```

### Key Design Decisions

**No server dependencies.** Oracle mode uses `crypto.getRandomValues()` (Web Crypto API with hardware entropy). Counsel mode runs transformers.js entirely client-side. The entire app is a pure static SPA.

**Service layer separation.** Oracle and Counsel modes have independent service implementations with no coupling. The embedding service is shared but only loaded on demand.

**Custom state management.** React hooks instead of external state libraries (Redux, Zustand). Simpler debugging, smaller bundle, full TypeScript integration.

**Pre-computed embeddings.** Corpus embeddings are generated offline and stored as NumPy arrays. Only query embeddings are computed at runtime, keeping the ML footprint minimal.

## Data

```
public/
├── corpus_*/                # Parallel Greek-English JSON files
│   ├── hymns.json          # 90 Orphic Hymns
│   ├── argonautica.json    # Orphic Argonautica
│   └── lithica.json        # Orphic Lithica
└── embeddings/              # Pre-computed 384D vectors
    └── {corpus}/
        ├── sentences.npy
        ├── sentences_metadata.json
        ├── lines.npy
        └── lines_metadata.json
```

## License

[CC0 1.0 Universal](../LICENSE)
