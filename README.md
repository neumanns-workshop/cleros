# Cleros

Cleros is a web application that uses advanced text processing to interact with ancient Greek hymn corpora, specifically focusing on a combined collection of Homeric and Orphic Hymns within a single-column user interface. The application leverages embedding models for semantic search and text analysis.

## Submodule Setup

This repository is designed to be used as a submodule within the [Neumann's Workshop website](https://github.com/neumanns-workshop/neumanns-workshop.github.io). The application is deployed to GitHub Pages and is accessible at https://neumanns-workshop.github.io/cleros/.

### Using as a Submodule

To add this as a submodule to the main repository:

```bash
# From the root of the main repository
git submodule add https://github.com/neumanns-workshop/cleros.git cleros
git submodule update --init --recursive
```

To update the submodule to the latest version:

```bash
# From the root of the main repository
git submodule update --remote --merge
```

## Architecture Overview

The application follows a modern React architecture with TypeScript and consists of several key components:

### Core Components

- **Frontend (web/)**: React application with TypeScript
- **Data Processing**: Tools for generating embeddings and text analysis
- **Semantic Search**: TensorFlow.js-based text similarity engine

## Key Features

- **Hymn Exploration**: Browse and search through ancient hymns
- **Semantic Search**: Find relevant hymns and lines based on meaning, not just keywords
- **Entity Recognition**: Highlight deities and entities within texts
- **Query-based Random Number Generator (QRNG)**: Retrieve random (fated) hymns based on user queries

## Directory Structure

- **web/**: Main React application
  - **src/components/**: React components 
  - **src/services/**: Service utilities for data loading and processing
  - **src/hooks/**: Custom React hooks
  - **src/context/**: React context providers
  - **scripts/**: Utility scripts for code analysis and optimization
  - **public/data/**: JSON data files for hymns and embeddings

## Service Layer

The application's service layer handles data loading and processing:

- **API Service**: Standardized data fetching with caching
- **Hymns Service**: Load hymn data and embeddings
- **Deities Service**: Entity classification in hymns
- **Embeddings Service**: TensorFlow.js-based semantic search functionality

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/cleros.git
cd cleros

# Install dependencies
cd web
npm install

# Start development server
npm start
```

### Available Scripts

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Analyze bundle size
npm run analyze

# Find unused files
npm run find-unused

# Lint code
npm run lint
```

## Optimization Features

The application includes several optimization features:

- **Dynamic Module Loading**: TensorFlow.js is loaded only when needed
- **Data Caching**: API responses are cached to improve performance
- **Bundle Analysis**: Tools to analyze and optimize bundle size

## Testing

Tests are written using Jest and can be run with:

```bash
npm test
```

## Key Technologies

- **React**: UI framework
- **TypeScript**: Type-safe JavaScript
- **TensorFlow.js**: Machine learning in the browser
- **Universal Sentence Encoder**: Text embedding model
- **Material UI**: Component library

## Experiments in Algorithmic, Gnostic Divination

Cleros is a framework for computational bibliomancy that applies machine learning techniques to ancient divinatory practices. The initial implementation leverages the Orphic Hymns corpus, employing semantic embeddings within a gnostic interpretive framework.

## Repository Structure

This repository contains both the deployable web application and the data processing tools:

- `web/` - React web application (ready for deployment)
- `data/` - Corpus data files (raw, processed, and enriched)
- `tools/` - Python scripts for data processing and analysis
- `scripts/` - Utility scripts for embedding generation
- `docs/` - Documentation files

For detailed information about the repository organization, see [docs/REPO_STRUCTURE.md](docs/REPO_STRUCTURE.md).

## Core Concept

This system integrates traditional divinatory principles with contemporary computational methods through several key mechanisms:

1. **Dual-Aspect Processing**: User queries undergo vector embedding analysis that serves two distinct functions:
   - **Statistical/Temporal Analysis**: Mathematical properties of the embedding vector, combined with temporal data, determine corpus selection through a deterministic hashing algorithm
   - **Semantic Analysis**: The same embedding facilitates cosine similarity calculations to identify contextually relevant passages

2. **Unified Information Flow**: This bidirectional application of the embedding vector creates an integrated system where selection and interpretation emerge from the same representational space

3. **Functional Randomness Through Complexity**: The system achieves effective stochasticity not through quantum mechanics or other physical processes but through the compounding complexity of high-dimensional semantic spaces and temporal variables—rendering the selection process functionally non-deterministic from the user's perspective

4. **Collective Knowledge Representation**: Queries engage with distributed semantic representations derived from collective linguistic understanding, effectively allowing individual questions to interact with aggregated cultural knowledge encoded in the embedding space

## Deployment

For deployment instructions, see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

For production preparation, see [docs/PRODUCTION_CHECKLIST.md](docs/PRODUCTION_CHECKLIST.md).

## Web Interface

The project includes a modern React web interface with the following features:

- Interactive oracle querying and response display
- Deity highlighting system that automatically colors deity names in the hymn text based on their categories
- Support for deity aliases and epithets to ensure comprehensive identification
- Responsive design with typewriter effect for dramatic presentation of oracle responses
- Ko-fi donation button for supporting the project

For payment integration setup, see [docs/PAYMENT_SETUP.md](docs/PAYMENT_SETUP.md).

### Available Sources
- **Orphic Hymns** - Currently fully implemented and functional
- **Coming Soon:** Homer, Virgil, and Gnostic texts (visible in the interface but currently disabled)

For more details, see the [web/README.md](web/README.md).

## Implementation Details

1. User query processing via embedding model
2. Vector transformation and temporal variable integration
3. Deterministic hashing for corpus selection
4. Semantic similarity calculation for passage identification
5. Visualization and contextual presentation of results

## Philosophical Framework

The system operates within an interpretive framework derived from gnostic thought:

- **Complementary Interpretive Modalities**: The system employs both statistical-mathematical (numerological) and semantic (interpretive) approaches to meaning, reflecting historical divinatory practices

- **Temporal Integration**: Time variables are incorporated as inseparable components of the selection process, acknowledging the moment of inquiry as significant to the interpretive act

- **Deterministic Complexity**: The apparent randomness emerges not from true stochasticity but from computational complexity that exceeds human comprehension—creating epistemological uncertainty from deterministic processes

- **Agency and Receptivity**: The framework posits a dialectical relationship between intentional meaning-making (the user's agency in query formulation) and receptivity to meaning-discovery (the unexpected connections revealed through processing)

- **Immanent Transcendence**: Consistent with gnostic traditions, the divine element is conceptualized as immanent within the interaction between questioner and system, rather than transcendent or external to it

## Technical Architecture

The vector processing system employs the following implementation:

```javascript
// Extract statistical properties from embedding vector
const embeddingSum = queryEmbedding.reduce((sum, val) => sum + val, 0);
const embeddingMean = embeddingSum / queryEmbedding.length;
const embeddingMax = Math.max(...queryEmbedding);
const embeddingMin = Math.min(...queryEmbedding);
const embeddingStdDev = Math.sqrt(
    queryEmbedding.reduce((sum, val) => sum + Math.pow(val - embeddingMean, 2), 0) / queryEmbedding.length
);

// Incorporate temporal variables
const now = new Date();
const timeComponents = [
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    now.getMinutes(),
    now.getSeconds(),
    now.getMilliseconds()
];

// Generate hash input from combined vector properties and temporal variables
const hashInput = `${embeddingSum}-${embeddingMean}-${embeddingMax}-${embeddingMin}-${embeddingStdDev}-${timeComponents.join('-')}`;
```

## Technical Capabilities

- Neural embedding-based text analysis
- Deterministic hashing with temporal integration
- Cosine similarity measurement for relevance ranking
- Natural language processing for entity recognition
- Interactive data visualization

## Deity Classification

The system includes tools for classifying entities mentioned in the Orphic Hymns into different types of deities using local LLMs via Ollama:

### Requirements

- [Ollama](https://ollama.ai/) installed locally
- Gemma 3 (27B) model pulled: `ollama pull gemma3:27b`

### Usage

#### Interactive Entity Classification

```bash
python tools/entity_classifier.py interactive
```

This allows you to interactively classify deities and entities by entering their names. The system will attempt to find the original context (the line containing the entity in the Orphic Hymns) to provide better classification.

#### Batch Classification

```bash
python tools/entity_classifier.py batch --output data/enriched/deities/deity_classifications.json
```

This classifies all entities extracted from the linguistic analysis of the Orphic Hymns. Each entity is classified using its original textual context from the hymns, providing more accurate and contextually-aware classifications.

#### Visualization

```bash
python tools/visualize_classifications.py --show
```

To visualize the classification results and save the visualizations:

```bash
python tools/visualize_classifications.py --output-dir data/enriched/deities/visualizations
```

You can also export the results to a CSV file for easier viewing and analysis:

```bash
python tools/visualize_classifications.py --csv deity_classifications.csv
```

### Classification Categories

Entities are classified into the following categories based on their contextual appearances in the hymns:
- **Olympian** - Major gods residing on Mount Olympus (Zeus, Apollo, Athene, etc.)
- **Chthonic** - Underworld or earth deities (Persephone, Plouton, etc.)
- **Titan** - Pre-Olympian primordial deities (Kronos, Rhea, etc.)
- **Nature** - Deities representing natural forces (Nereus, Pan, etc.)
- **Abstract** - Deities representing concepts (Nemesis, Sleep, etc.)
- **Hero/Mortal** - Deified humans or heroes
- **Other** - Miscellaneous divine entities not fitting other categories

The classification includes:
- Category determination
- Description of the entity
- Confidence score
- Key attributes associated with the entity
- Original textual context from the hymns

## Historical Context

The Orphic Hymns comprise a collection of 87 poems from Greco-Roman antiquity attributed to Orpheus. Historically used in mystery cult rituals, they address various deities with invocations and requests. This implementation engages with this historical corpus through contemporary computational methods.

---

*Cleros synthesizes traditional divinatory frameworks with modern computational techniques to explore the intersection of meaning-making, statistical analysis, and the interpretive act.*
