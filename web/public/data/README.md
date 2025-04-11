# Greek Hymn Corpus Data Files

This directory contains the processed hymn corpus with annotations and generated embeddings.

## Source Files

- `hymns.json` - Annotated hymn corpus with integrated span information

## Generated Embeddings

All embedding files use the `all-MiniLM-L6-v2` model (384 dimensions) and are gzipped for efficient storage.

### Sentence-Level Files
- `sentence_embeddings.json.gz` (~660KB) - Embeddings for all sentences
- `sentence_metadata.json.gz` (~42KB) - Sentence ID to text mapping

### Span-Level Files (by category)
Each category has two files:
```
span_embeddings_{category}.json.gz  - Embeddings
span_metadata_{category}.json.gz    - Metadata and context
```

Category sizes and counts:
- epithet: 1,217 spans (~1MB)
- action: 979 spans (~900KB)
- other: 906 spans (~785KB)
- deity: 465 spans (~310KB)
- place: 389 spans (~340KB)
- nature: 197 spans (~176KB)
- artifact: 192 spans (~180KB)
- mortal: 191 spans (~138KB)
- other_divinity: 69 spans (~61KB)
- beast: 60 spans (~56KB)
- celestial_sphere: 38 spans (~36KB)
- hero: 6 spans (~6KB)

## File Formats

### Embedding Files (.json.gz)
```json
{
  "m": "all-MiniLM-L6-v2",
  "d": 384,
  "e": {
    "id": [/* 384 float values */],
    ...
  }
}
```

### Metadata Files (.json.gz)
```json
{
  "spans": {
    "span_id": {
      "text": "actual text",
      "hymn_id": "hymn-0",
      "sentence_index": 0,
      "confidence": "high"
    }
  },
  "contexts": {
    "span_id": {
      "context": "... surrounding text ...",
      "full_sentence": "complete sentence"
    }
  }
}
```

### Span Categories

- **deity**: Named gods and goddesses
- **epithet**: Divine titles and honorifics
- **action**: Divine actions and activities
- **place**: Sacred and mythological locations
- **nature**: Natural phenomena and elements
- **artifact**: Sacred objects and items
- **mortal**: Human and mortal references
- **other**: Miscellaneous divine attributes
- **other_divinity**: Minor divine entities
- **celestial_sphere**: Celestial bodies and phenomena
- **beast**: Mythological creatures
- **hero**: Heroic figures

## Usage Notes

1. Files are gzipped - decompress before use:
```javascript
const response = await fetch('sentence_embeddings.json.gz');
const blob = await response.blob();
const text = await new Response(
  new DecompressionStream('gzip').readable
).text();
const data = JSON.parse(text);
```

2. Embeddings are normalized - use cosine similarity:
```javascript
function cosineSimilarity(a, b) {
  return a.reduce((sum, _, i) => sum + a[i] * b[i], 0);
}
```

3. Span IDs format: `{hymn_id}-{sentence_index}-{start_char}`

4. Context windows use ±5 words around spans

## Generation

These files are generated using:
```bash
python scripts/generate_embeddings.py  # Generate embeddings
```

See the scripts directory for source code. 