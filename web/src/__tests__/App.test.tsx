import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../test/utils';
import App from '../App';

// Mock the useAppState hook
vi.mock('../hooks/useAppState', () => ({
  useAppState: () => ({
    currentView: 'home',
    setCurrentView: vi.fn(),
    searchQuery: '',
    setSearchQuery: vi.fn(),
    searchMode: 'oracle',
    setSearchMode: vi.fn(),
    selectedSource: 'hymns',
    setSelectedSource: vi.fn(),
    selectedSection: '',
    setSelectedSection: vi.fn(),
    corpusData: {},
    loading: false,
    currentOracleResponse: null,
    currentCounselResponse: null,
    isGeneratingOracle: false,
    isGeneratingCounsel: false,
    isRandomOrgAvailable: true,
    personalOracleReports: [],
    personalCounselReports: [],
    handleSearch: vi.fn(),
    navigateToSource: vi.fn()
  })
}));

// Mock the view components
vi.mock('../components', () => ({
  HomeView: ({ currentView }: any) => <div data-testid="home-view">Home View - {currentView}</div>,
  AboutView: ({ currentView }: any) => <div data-testid="about-view">About View - {currentView}</div>,
  CorpusView: ({ currentView }: any) => <div data-testid="corpus-view">Corpus View - {currentView}</div>
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders HomeView by default', () => {
    render(<App />);
    
    expect(screen.getByTestId('home-view')).toBeInTheDocument();
    expect(screen.getByText('Home View - home')).toBeInTheDocument();
  });

  // Additional view tests can be added when needed
});
