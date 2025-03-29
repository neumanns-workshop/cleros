export interface HymnResult {
  source: 'orphic' | 'homeric' | 'virgilian' | 'biblical' | 'custom' | 'gnostic';
  hymn: string;
  title: string;
  question?: string;
  incense?: string;
  timestamp?: string;
  lines: Array<{
    text: string;
    similarity: number;
    originalIndex: number;
    rank: number;
  }>;
  maxSimilarity: number;
  minSimilarity: number;
  topThreeIndices: number[];
}

export interface SourceSelectionState {
  orphic: boolean;
  homeric: boolean;
  virgilian: boolean;
  biblical: boolean;
  custom: boolean;
  gnostic: boolean;
} 