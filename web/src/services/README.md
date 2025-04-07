# Service Utilities

This directory contains service utilities for the Cleros application.

## API Service

The API service (`api.ts`) provides a standardized way to fetch data in the application.

### Key Features

- **Standardized Response Format**: All API responses follow the `APIResponse<T>` interface
- **Error Handling**: Consistent error handling across all data fetching operations
- **Caching**: Data is cached to avoid repeated network requests
- **Type Safety**: Generic typing supports any data structure

### Usage Examples

```typescript
// Import the API utility
import { fetchLocalData, clearAPICache } from './api';

// Fetch data with type safety
interface UserData {
  id: string;
  name: string;
}

async function loadUser(userId: string) {
  const response = await fetchLocalData<UserData>(`/data/users/${userId}.json`);
  
  if (response.success) {
    // Use the typed data
    return response.data;
  } else {
    // Handle error
    console.error('Failed to load user:', response.error);
    return null;
  }
}

// Clear cache when needed
function resetDataCache() {
  clearAPICache();
}
```

## Hymns Service

The Hymns service (`hymns.ts`) provides utilities for loading hymn data and embeddings.

### Key Functions

- `loadHymnData(hymnNumber)`: Loads data for a specific hymn
- `loadHymnEmbeddings()`: Loads embeddings for semantic search

## Deities Service

The Deities service (`deities.ts`) provides utilities for working with deity classifications in hymns.

### Key Functions

- `loadDeityClassifications()`: Loads all deity classifications
- `getEntitiesForLine(classifications, hymnId, lineNum)`: Gets entities for a specific hymn line
- `getCategoryColorClass(category)`: Gets the CSS class for a deity category

## Embeddings Service

The Embeddings service (`embeddings.ts`) provides utilities for semantic search using TensorFlow.js.

### Key Features

- **Lazy Loading**: TensorFlow.js is loaded only when needed
- **Memory Optimization**: Optimized for performance
- **Semantic Search**: Find similar hymns and lines based on meaning

### Key Functions

- `initializeEmbedder()`: Initializes the Universal Sentence Encoder
- `getQueryEmbedding(query)`: Gets embedding for a query
- `findMostRelevantHymn(query, embeddings)`: Finds the hymn most relevant to a query
- `findMostRelevantLine(query, hymnNumber, hymnData, embeddings)`: Finds the line most relevant to a query 