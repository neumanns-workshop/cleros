# Greek Hymn Corpus Data Files

This directory contains the processed hymn corpus with annotations and generated embeddings for both Homeric and Orphic hymns.

## Source Files

- `hymns.json` - Combined hymn corpus with both Homeric and Orphic hymns, including annotations and span information

## Generated Embeddings

All embedding files use the Universal Sentence Encoder model (512 dimensions).

### Sentence-Level Files
- `sentence_embeddings.json` (~7MB) - Embeddings for all sentences
- `sentence_metadata.json` (~130KB) - Sentence ID to text mapping

### Span-Level Files (by category)
Each category has two files:
```
span_embeddings_{category}.json  - Embeddings for spans of that category
span_metadata_{category}.json    - Metadata and context for spans
```

Available categories:
- deity (~4.7MB)
- epithet (~12MB)
- place (~4MB) 
- mortal (~2MB)
- artifact (~2MB)
- nature (~2MB)
- celestial_sphere (~2MB)
- beast (~2MB)
- hero (~2MB)
- action (~2MB)
- other (~2MB)
- other_divine (~2MB)

## File Formats

### Embedding Files
```json
{
  "m": "universal-sentence-encoder",
  "d": 512,
  "e": {
    "id": [/* 512 float values */],
    ...
  }
}
```

### Metadata Files
```json
{
  "spans": {
    "span_id": {
      "text": "actual text",
      "category": "deity",
      "hymn_id": "homeric-0",
      "sentence_index": 0,
      "confidence": "high",
      "start_char": 10,
      "end_char": 15
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

### Hymns File Structure
```json
{
  "hymns": [
    {
      "id": "homeric-0",
      "title": "HYMN Α΄. TO DIONYSUS",
      "deities": ["Dionysus"],
      "sentences": [
        {
          "text": "The sentence text...",
          "index": 0,
          "spans": [
            {
              "text": "span text",
              "category": "deity",
              "confidence": "high",
              "start_char": 10,
              "end_char": 15
            }
          ]
        }
      ]
    }
  ]
}
```

### Sentence Metadata Structure
```json
{
  "sentences": {
    "homeric-0-s0": {
      "text": "The full sentence text..."
    }
  }
}
```

### Span Categories

- **deity**: Named gods and goddesses
- **epithet**: Divine titles and honorifics
- **place**: Sacred and mythological locations
- **mortal**: Human and mortal references
- **artifact**: Objects or items associated with the gods
- **nature**: Natural phenomena or objects
- **celestial_sphere**: Stars, planets, and other celestial bodies
- **beast**: Mythical creatures or animals
- **hero**: Human or demigod heroes
- **action**: Significant actions or events
- **other**: Other categories not yet defined
- **other_divine**: Other divine beings falling outside of the above categories

## Usage Notes

1. Files are in standard JSON format, ready to use without decompression

2. Use cosine similarity for comparison:
```javascript
function cosineSimilarity(a, b) {
  return a.reduce((sum, _, i) => sum + a[i] * b[i], 0);
}
```

3. Span IDs format: `{hymn_id}-s{sentence_index}-{start_char}`
   Example: `homeric-0-s0-175` refers to a span in the Homeric hymn 0, sentence 0, starting at character 175

4. Sentence IDs format: `{hymn_id}-s{sentence_index}`
   Example: `homeric-0-s0` refers to sentence 0 in the Homeric hymn 0

## Implementation Notes

The current implementation:

- **Startup:**
  - Loads all sentence embeddings (`sentence_embeddings.json`).
  - Loads all categorized span embeddings and metadata (`span_embeddings_*.json`, `span_metadata_*.json`).
  - Initializes the Universal Sentence Encoder model locally in the browser.

- **Divination Process:**
  1.  **Query Submission:** User enters a query string.
  2.  **Hymn Selection:** A hymn key (e.g., `homeric-31`) is chosen based on a hash of the user's **context string** (timestamp, user agent, screen dimensions), making the selection unique to the user's moment of query but independent of the query *content*. Details for the selected hymn (title, etc.) are loaded from `hymns.json`.
  3.  **Query Embedding:** The Universal Sentence Encoder generates a 512-dimension embedding vector for the user's query text.
  4.  **Sentence Processing & Ranking:**
      - All sentences for the selected hymn are retrieved using the pre-loaded sentence embeddings data.
      - For each sentence, two scores are calculated:
          - `querySimilarity`: Cosine similarity between the **query embedding** and the **sentence embedding**.
          - `maxClauseSimilarity`: The highest cosine similarity found between the **query embedding** and any individual **clause embedding** (deity, epithet, place, mortal) within that sentence.
      - A `combinedScore` is calculated (e.g., `0.7 * querySimilarity + 0.3 * maxClauseSimilarity`).
      - The sentence with the highest `combinedScore` is designated the `primarySentence`.
      - All sentences from the hymn, along with their scores (`querySimilarity`, `maxClauseSimilarity`, `combinedScore`), are stored (`allSentencesForHymn`).
  5.  **Clause Identification:**
      - For each sentence, its constituent clauses (spans) are identified using the pre-loaded span metadata and their pre-calculated embeddings.
      - The similarity between the **query embedding** and each **clause embedding** is stored.
  6.  **UI Rendering:**
      - The `primarySentence` is displayed, often with a typing animation.
      - An option allows expanding to view `allSentencesForHymn`.
      - **Sentence Opacity:** In the expanded view, sentences are styled with opacity based on their rank relative to other sentences *within that hymn*, determined by sorting the `combinedScore`.
      - **Clause Highlighting:** Within each sentence (primary and secondary), only the **single most relevant clause per category** (deity, epithet, place, mortal) based on clause-query similarity is highlighted with its category-specific color.

- **Key Points:**
  - Hymn selection is decoupled from query semantics but linked to user context (hash of timestamp, user agent, screen size).
  - Sentence relevance (for primary sentence selection and opacity ranking) is based on the **combined score** (weighted sentence + max clause similarity).
  - Clause highlighting shows only the **top clause per category** within each sentence, using direct category color.
  - The application combines elements of personalized random bibliomancy (context hash hymn selection) with hybrid semantic relevance highlighting (combined sentence/clause score for ranking, top clause highlighting). 