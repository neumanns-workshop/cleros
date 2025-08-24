export interface LineDetail {
  line: number;
  english: string;
  greek?: string;
  note?: string;
}

export interface Sentence {
  sentence_id: string;
  text: {
    english: string;
    greek?: string;
  };
  line_details: LineDetail[];
}

export interface CorpusPart {
  part_number: number;
  part_title: string;
  title_english?: string;
  title?: string; // Legacy support
  key: string | number;
  incense?: string;
  lines?: LineDetail[];
  sentences?: Sentence[];
  tablet_id?: string;
  query_id?: string;
}

export interface CorpusMetadata {
  name: string;
  title: string;
  description?: string;
  total_parts?: number;
  total_lines?: number;
}

export interface CorpusData {
  metadata: CorpusMetadata;
  parts: CorpusPart[];
}

export interface AllCorpusData {
  hymns: CorpusData | null;
  argonautica: CorpusData | null;
  lithica: CorpusData | null;
  tablets: CorpusData | null;
  queries: CorpusData | null;
  papyrusQueries: CorpusData | null;
  [key: string]: CorpusData | null; // Index signature for dynamic access
}

export interface SourceLink {
  corpus: string;
  sentenceId?: string;
  sectionTitle?: string;
  lineNumber?: number;
  key?: string | number;
  source?: string;
}

export interface EnrichedLineData {
  line: number | string | null; // Allow different types for headers
  english: string;
  greek?: string;
  note?: string;
  isHeader?: boolean;
  isMarker?: boolean;
  part_number?: number;
  sentence_id?: string;
  corpus_name?: string;
  sourceLink?: SourceLink;
}