export type ViewType = 'home' | 'corpus' | 'about';

export type SearchMode = 'oracle' | 'sage';

export type SourceType = 'hymns' | 'argonautica' | 'lithica' | 'tablets' | 'queries' | 'papyrusQueries' | 'personal';

export interface AppState {
  currentView: ViewType;
  searchQuery: string;
  searchMode: SearchMode;
  selectedSource: SourceType;
  selectedSection: string;
  isRandomOrgAvailable: boolean | null;
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