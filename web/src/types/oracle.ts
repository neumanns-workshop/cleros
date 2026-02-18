export interface AncientQuery {
  id: string;
  text: string;
  category: string;
  origin: 'authentic' | 'generated';
}

export interface SelectionDetail {
  source: string;
  sectionTitle: string;
  sentenceId: number;
  totalSentences: number;
  text: {
    english: string;
    greek?: string;
  };
  lineDetails?: Array<{
    line: number;
    english: string;
    greek?: string;
    note?: string;
  }>;
  partNumber?: number;
  corpusName?: string;
  incense?: {
    english: string;
    greek?: string;
  };
}

export interface OracleSelection extends SelectionDetail {
  randomIndex: number;
  // Oracle mode uses pure randomness - no semantic line ranking
}

export interface CounselSelection extends SelectionDetail {
  semanticScore: number;
  bestLine?: {
    lineNumber: number;
    score: number;
    text: string;
  };
}

export interface ShareableOption {
  id: string;
  type: 'sentence' | 'line';
  corpus: 'hymns' | 'argonautica' | 'lithica';
  score: number;
  content: {
    text: string;
    lineCount?: number;
    sectionTitle: string;
  };
  metadata?: {
    sentenceId?: number;
    lineNumber?: number;
    incense?: {
      english: string;
      greek?: string;
    };
  };
}

export interface OracleResponse {
  query: string;
  timestamp: number;
  randomSource: 'crypto';
  selections: {
    hymns?: OracleSelection;
    argonautica?: OracleSelection;
    lithica?: OracleSelection;
  };
  keywords: string[];
  shareableOptions: ShareableOption[]; // 3 random sentences (pure randomness)
}

export interface CounselResponse {
  query: string;
  timestamp: number;
  searchSource: 'semantic';
  selections: {
    hymns?: CounselSelection;
    argonautica?: CounselSelection;
    lithica?: CounselSelection;
  };
  keywords: string[];
  shareableOptions: ShareableOption[]; // Ranked by semantic relevance  
  overallBestLine?: {
    corpus: 'hymns' | 'argonautica' | 'lithica';
    lineNumber: number;
    score: number;
    text: string;
  };
}

export type ConsultationResponse = OracleResponse | CounselResponse;

