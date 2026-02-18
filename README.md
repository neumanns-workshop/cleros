# Cleros

Cleros is a computational bibliomancy system that applies AI-powered semantic analysis to ancient Greek religious texts. The application provides two distinct modes of divination: **Oracle mode** (cryptographically secure random selection) and **Counsel mode** (semantic similarity search). Built as a pure static React/TypeScript application with ML capabilities running entirely in the browser.

**Live:** [cleros.gbe.games](https://cleros.gbe.games)

## How It Works

### Oracle Mode
Cryptographically secure random selection using the Web Crypto API (`crypto.getRandomValues`). Selects one random passage from each of three Orphic texts, following the classical tradition of sortes (lot-casting). No semantic analysis or AI influence.

### Counsel Mode
AI-powered semantic search using transformers.js running client-side. Your query is embedded using the `all-MiniLM-L6-v2` model (384-dimensional vectors), then compared against pre-computed corpus embeddings via cosine similarity. Keywords are expanded using WordNet synonyms for enhanced matching.

## The Corpus

| Collection | Period | Items | Type |
|---|---|---|---|
| Orphic Hymns | 2nd-3rd century CE | 90 pieces | Ritual invocations |
| Orphic Argonautica | 4th-6th century CE | 1 epic | Epic narrative poetry |
| Orphic Lithica | 4th-6th century CE | 1 poem | Didactic mineralogy |

All texts include parallel Greek-English translations with scholarly metadata.

## Architecture

Pure static SPA with no server-side dependencies:

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **ML:** @xenova/transformers (all-MiniLM-L6-v2) via WebAssembly
- **Randomness:** Web Crypto API (hardware entropy)
- **Hosting:** Cloudflare Pages
- **CI/CD:** GitHub Actions (lint, type-check, test, deploy)

## Getting Started

```bash
cd web
npm install
npm run dev
```

### Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run lint         # ESLint
npm run type-check   # TypeScript checking
npm run test         # Unit tests (Vitest)
npm run test:e2e     # End-to-end tests (Playwright)
```

## Project Structure

```
cleros/
├── web/                          # React application
│   ├── src/
│   │   ├── components/           # React UI components
│   │   ├── services/             # Business logic
│   │   │   ├── oracleService.ts  # Random selection via Web Crypto
│   │   │   ├── counselService.ts # Semantic search
│   │   │   └── embeddingService.ts # ML model management
│   │   ├── hooks/                # Custom React hooks
│   │   ├── types/                # TypeScript definitions
│   │   └── utils/                # Utility functions
│   └── public/
│       ├── corpus_*/             # Pre-processed corpus JSON
│       └── embeddings/           # Pre-computed embeddings (.npy)
├── data/                         # Source corpus data
├── scripts/                      # Data processing tools
└── tools/                        # Analysis utilities
```

## Philosophical Framework

The name "Cleros" derives from kleros, the Greek word meaning "lot" or "allotted portion" -- the share of fate assigned to each person. Beyond simple chance, kleros was the mechanism through which divine will was thought to manifest in human affairs.

The system integrates traditional divinatory principles with computational methods:

- **Oracle mode** preserves the classical sortes tradition -- pure lot-casting with no algorithmic mediation
- **Counsel mode** treats the corpus as a searchable semantic space, using ML to surface thematically relevant passages
- **Both modes** maintain the interpretive act at the center -- the system surfaces text, the human makes meaning

## License

[CC0 1.0 Universal](LICENSE) -- Public Domain
