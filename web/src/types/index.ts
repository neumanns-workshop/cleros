// New Types for Divination Context V2
export interface ProcessedClauseData {
  hymn_id: string; // Added for unique ID generation
  sentence_index: number; // Added for unique ID generation
  text: string;
  category: string;
  similarity: number; // Similarity to the user QUERY
  start_char: number;
  end_char: number;
  // Add optional rank-based style properties
  rankSaturation?: number; // Pre-calculated saturation (0-100)
  rankLightness?: number; // Pre-calculated lightness (0-100)
}

export interface ProcessedSentenceData {
  hymn_id: string;
  sentence_index: number;
  text: string;
  query_similarity: number;
  max_clause_similarity: number;
  combined_score: number;
  clauses: ProcessedClauseData[]; // Reverted: Keep the full list
}

interface OracleContextType {
  // ... other fields ...
  primarySentence: ProcessedSentenceData | null;
  allSentencesForHymn: ProcessedSentenceData[] | null;
  topHymnClauseIds?: Set<string>; // IDs for highlighting
  topHymnClausesMap?: Record<string, ProcessedClauseData>; // Map of category -> top clause data for export
  performDivination: (userQuery: string) => Promise<void>;
  // ... other fields ...
}
