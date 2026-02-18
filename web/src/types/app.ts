export type ViewType = 'home' | 'corpus' | 'about' | 'privacy' | 'terms';

export type SearchMode = 'oracle' | 'counsel';

export type SourceType = 'hymns' | 'argonautica' | 'lithica' | 'personal';

export interface AppState {
  currentView: ViewType;
  searchQuery: string;
  searchMode: SearchMode;
  selectedSource: SourceType;
  selectedSection: string;
  loading: boolean;
}

export interface LoadingState {
  isGeneratingOracle: boolean;
  isGeneratingCounsel: boolean;
  isLoadingCorpus: boolean;
}

export interface CarouselState {
  currentIndex: number;
  displayedText: string;
}