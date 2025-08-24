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

## Gold Standard Corpus & Semantic Search

Cleros includes a comprehensive gold standard corpus of ancient Greek religious texts with state-of-the-art semantic embeddings for advanced search and analysis.

### Corpus Contents

The gold standard corpus (`data/gold_standard/`) contains 5 collections spanning 8 centuries of ancient Greek religious literature:

| **Collection** | **Period** | **Items** | **Lines** | **Type** |
|----------------|------------|-----------|-----------|----------|
| **Orphic Argonautica** | 4th-6th century CE | 1 epic | 1,376 lines | Epic narrative poetry |
| **Orphic Lithica** | 4th-6th century CE | 1 poem | 779 lines | Didactic mineralogy |
| **Orphic Hymns** | 2nd-3rd century CE | 90 pieces | 1,173 lines | Ritual invocations |
| **Orphic Golden Tablets** | 5th-2nd century BCE | 10 tablets | 10 formulae | Funerary instructions |
| **Dodona Oracle Queries** | 5th-2nd century BCE | 18 queries | 18 consultations | Oracle consultations |
| **TOTAL** | | **120 texts** | **3,356 items** | Mixed formats |

### Sentence-Based Chunking

The corpus uses intelligent sentence-based chunking that preserves scholarly structure while creating semantically coherent units:

- **Period-boundary detection**: Uses periods at line endings as reliable sentence markers  
- **Atomic unit preservation**: Tablets and oracle queries remain as complete units (already semantically atomic)
- **Line-level metadata**: All scholarly apparatus (line numbers, Greek text, philological notes) preserved
- **Compression results**: 3,328 lines → 749 sentences (avg 4.4 lines per sentence)

#### Chunking Statistics by Corpus

| **Corpus** | **Original Lines** | **Sentences** | **Avg Lines/Sentence** |
|------------|-------------------|---------------|------------------------|
| Orphic Hymns | 1,173 | 218 | 5.38 |
| Orphic Argonautica | 1,376 | 338 | 4.07 |
| Orphic Lithica | 779 | 193 | 4.04 |
| Golden Tablets | 10 | 10 | 1.0 (atomic) |
| Oracle Queries | 18 | 18 | 1.0 (atomic) |

### Semantic Embeddings

The corpus includes **dual embedding systems** for different use cases:

#### Server-Side Embeddings (High Performance)
- **Model**: `nomic-embed-text:latest` via Ollama (768-dimensional vectors)
- **Coverage**: 777 semantic units with 100% success rate
- **Infrastructure**: Local Ollama (no external API dependencies)
- **Use case**: Backend processing, research, high-precision search

#### Client-Side Embeddings (Browser Compatible)
- **Model**: `all-MiniLM-L6-v2` via transformers.js (384-dimensional vectors)
- **Coverage**: 777 semantic units with 100% success rate  
- **Infrastructure**: Browser-native transformers.js (`Xenova/all-MiniLM-L6-v2`)
- **Use case**: Real-time client-side semantic search, web applications

Both embedding sets provide **complete coverage** with identical chunking but different dimensions optimized for their respective use cases.

#### Embedding Files Structure

```
embeddings/
├── {corpus_name}/                                # Server-side (Ollama/Nomic)
│   ├── {corpus}_sentence_embeddings.json        # Full data + 768D embeddings
│   ├── {corpus}_embeddings.npy                  # NumPy array for fast loading
│   └── {corpus}_metadata.json                   # Quick reference
├── {corpus_name}_client/                        # Client-side (transformers.js)
│   ├── {corpus}_client_embeddings.json          # Full data + 384D embeddings
│   ├── {corpus}_client_embeddings.npy           # NumPy array for backend use
│   └── {corpus}_client_metadata.json            # Quick reference
└── scripts/
    ├── generate_sentence_embeddings.py          # Ollama/Nomic generator
    ├── generate_atomic_embeddings.py            # Ollama/Nomic atomic units
    ├── generate_client_embeddings.py            # Client-compatible generator
    └── client_search_example.js                 # Browser integration example
```

### Generating Embeddings

#### Prerequisites

- [Ollama](https://ollama.ai/) installed locally
- Nomic Embed Text model: `ollama pull nomic-embed-text`

#### Generate All Embeddings

```bash
# 1. Create sentence chunks from parallel JSON files
python scripts/sentence_chunker.py

# 2. Generate server-side embeddings (Ollama/Nomic - 768D)
python embeddings/scripts/generate_sentence_embeddings.py  # Chunked corpora
python embeddings/scripts/generate_atomic_embeddings.py    # Tablets & queries

# 3. Generate client-side embeddings (transformers.js - 384D)
python embeddings/scripts/generate_client_embeddings.py    # All corpora
```

#### Test Semantic Search

```bash
# Test semantic search using oracle queries as examples
python embeddings/scripts/test_with_oracle_queries.py
```

This test demonstrates cross-corpus semantic search using real ancient consultation patterns, showing how oracle queries find thematically related content across hymns, tablets, and other texts.

**Example Results:**
- **Household & Safety query** → finds protective hymn passages (46.7% similarity), divine intervention in Argonautica (32.2%), purification tablets (32.6%)
- **Legal Dispute query** → finds justice-related hymn passages (18.9%), judicial decision narratives (18.7%), wisdom guidance (17.2%)  
- **Health queries** → finds healing hymn invocations (34.5%), medical mineralogy passages (28.4%), restorative tablet formulae (18.7%)
- **Success/Prosperity queries** → finds blessing hymns (50.1%), ritual sacrifice instructions (53.8%), initiate benedictions (40.2%)

### Usage Examples

#### Load Embeddings for Similarity Search

```python
import json
import numpy as np

# Load sentence embeddings
with open('embeddings/orphic_hymns/orphic_hymns_sentence_embeddings.json') as f:
    hymns_data = json.load(f)

# Load embeddings as NumPy array for fast operations
embeddings = np.load('embeddings/orphic_hymns/orphic_hymns_embeddings.npy')

# Find similar sentences using cosine similarity
from sklearn.metrics.pairwise import cosine_similarity
query_embedding = get_query_embedding("divine wisdom")  # Your embedding function
similarities = cosine_similarity([query_embedding], embeddings)[0]
```

#### Access Metadata

```python
# Quick access to corpus metadata
with open('embeddings/golden_tablets/golden_tablets_metadata.json') as f:
    tablets = json.load(f)
    
for tablet in tablets['tablets']:
    print(f"{tablet['tablet_id']}: {tablet['text_preview']}")
```

### Search Capabilities

The embedded corpus supports:

- **Cross-corpus semantic search**: Find similar concepts across different text types
- **Intent-based queries**: Search oracle queries by consultation type  
- **Ritual pattern matching**: Identify similar formulations in golden tablets
- **Thematic exploration**: Discover conceptual connections in poetic works
- **Scholarly precision**: All results maintain line-level scholarly apparatus

#### Client-Side Integration Example

```javascript
import { pipeline } from '@huggingface/transformers';

// Initialize semantic search
const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

// Load corpus embeddings
const hymnsResponse = await fetch('/embeddings/orphic_hymns_client/orphic_hymns_client_embeddings.json');
const hymnsData = await hymnsResponse.json();

// Search function
async function searchCleros(queryText, topK = 5) {
    // Generate query embedding
    const queryEmbedding = await extractor(queryText, { pooling: 'mean', normalize: true });
    const queryVector = queryEmbedding.tolist()[0];
    
    // Calculate similarities
    const results = hymnsData.units.map(unit => ({
        text: unit.text.english,
        section: unit.section_title,
        similarity: cosineSimilarity(queryVector, unit.embedding)
    }));
    
    // Return top results
    return results.sort((a, b) => b.similarity - a.similarity).slice(0, topK);
}

// Example usage
const results = await searchCleros("divine protection and safety");
results.forEach(result => {
    console.log(`${(result.similarity * 100).toFixed(1)}%: ${result.text.substring(0, 100)}...`);
});
```

**Live Testing**: Use oracle queries as real-world test cases to validate semantic search quality and cross-corpus thematic discovery.

## Technical Capabilities

- Neural embedding-based text analysis (Nomic Embed Text)
- Sentence-boundary semantic chunking
- Local Ollama integration (privacy-preserving)
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
python tools/entity_classifier.py batch --output data/2_enriched/deities/deity_classifications.json
```

This classifies all entities extracted from the linguistic analysis of the Orphic Hymns. Each entity is classified using its original textual context from the hymns, providing more accurate and contextually-aware classifications.

#### Visualization

```bash
python tools/visualize_classifications.py --output-dir data/2_enriched/deities/visualizations
```

To visualize the classification results and save the visualizations:

```bash
python tools/visualize_classifications.py --output-dir data/2_enriched/deities/visualizations
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
