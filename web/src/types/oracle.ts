export interface AncientQuery {
  id: string;
  text: string;
  category: string;
}

export interface SelectionDetail {
  source: string;
  sectionTitle: string;
  sentenceId: string;
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
}

export interface CounselSelection extends SelectionDetail {
  semanticScore: number;
  bestLine?: {
    lineNumber: number;
    score: number;
  };
}

export interface OracleResponse {
  query: string;
  timestamp: number;
  randomSource: 'random.org' | 'fallback';
  selections: {
    hymns?: OracleSelection;
    argonautica?: OracleSelection;
    lithica?: OracleSelection;
  };
}

export interface CounselResponse {
  query: string;
  timestamp: number;
  selections: {
    hymns?: CounselSelection;
    argonautica?: CounselSelection;
    lithica?: CounselSelection;
  };
}

export type ConsultationResponse = OracleResponse | CounselResponse;

export interface RandomOrgResponse {
  jsonrpc: string;
  result: {
    random: {
      data: number[];
    };
  };
  id: number;
}