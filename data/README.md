# Sortes Orphicae Data

This directory contains the data processing pipeline for the Sortes Orphicae project.

## Directory Structure

- `raw/`: Original source data (`orphic_hymns.json`)
- `processing/`: Data processing scripts
- `base/`: Clean normalized hymns (one JSON file per hymn)
- `enriched/`: Enhanced data with additional features
  - `linguistics/`: Linguistic analysis results
    - `linguistic_features.json`: Detailed linguistic features per hymn
    - `linguistics_summary.json`: Overall statistics and distributions
    - `text_metrics.json`: Text-level metrics and analysis
  - `embeddings/`: Text embeddings for semantic search
    - `hymn_embeddings.json`: Whole-hymn embeddings (384 dimensions)
    - `sentence_embeddings.json`: Sentence-level embeddings
    - `embeddings_metadata.json`: Model and statistics information

## Data Processing Pipeline

1. Raw Data Processing
   - Extract from source texts into `orphic_hymns.json`
   - Never modify this file directly

2. Base Dataset Generation
   - Clean, normalized version of each hymn
   - One JSON file per hymn with standardized format
   - Includes line mappings back to original text
   ```json
   {
       "hymn_id": str,          # Unique identifier
       "title": str,            # Hymn title
       "dedication": str,        # Optional dedication
       "incense": str,          # Optional incense
       "lines": List[str],      # Normalized lines
       "line_mappings": Dict,   # Maps to original line numbers
       "sequence": int          # Position in collection
   }
   ```

3. Linguistic Analysis
   - Part-of-speech tagging and analysis
   - Stored in `enriched/linguistics/`

4. Semantic Embeddings
   - Uses `@xenova/transformers` with the all-MiniLM-L6-v2 model
   - Generates both hymn and sentence-level embeddings
   - Optimized for browser-based semantic search
   - All embeddings are normalized for efficient similarity comparisons

## Divination Process

The Sortes Orphicae combines quantum randomness with semantic search:

1. Initial Selection
   - Quantum random number generation (QRNG) selects an initial hymn
   - True randomness rooted in quantum mechanics
   - Ensures unbiased initial selection

2. Semantic Answer Finding
   - User's query is embedded using MiniLM model
   - System finds semantically related sentences across all hymns
   - Uses cosine similarity between embeddings
   - Returns contextually relevant answers from the Orphic corpus

This hybrid approach merges:
- Quantum randomness for divination initiation
- Semantic understanding for finding relevant answers
- The collective wisdom of the Orphic corpus

## Usage

Generate base dataset:
```bash
python data/processing/raw_to_base.py
```

Generate embeddings:
```bash
node data/processing/embed_hymns.js
```

The embeddings enable efficient semantic search directly in the browser, requiring no server-side computation for the divination process. 