# Cleros Utility Scripts

This directory contains utility scripts for the Cleros project, primarily for embedding generation and related operations.

## Scripts

- **generate_embeddings.ts** - Generates semantic embeddings for the Orphic Hymns corpus using a transformer model. These embeddings are used for semantic search in the web application.

## Usage

To generate embeddings for the corpus:

```bash
# Navigate to the scripts directory
cd scripts

# Run the embedding generation script
npx ts-node generate_embeddings.ts
```

The generated embeddings will be saved to the `data/enriched/embeddings` directory and should also be copied to `web/public/data/enriched/embeddings` for use by the web application.

## Requirements

These scripts require Node.js and the following packages:
- @xenova/transformers
- typescript
- ts-node

## Notes for Development

When adding new corpus texts or updating existing texts:
1. Re-run the embedding generation script to update embeddings
2. Ensure embeddings are properly formatted and normalized
3. Copy the generated embeddings to the web application's public directory 