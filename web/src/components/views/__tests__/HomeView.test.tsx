import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../../../test/utils';
import { HomeView } from '../HomeView';
import { ViewType, SearchMode } from '../../../types/app';

// Mock the typewriter hook
vi.mock('../../../hooks/useTypewriter', () => ({
  useTypewriter: () => ({ displayedText: 'Test query text' })
}));

describe('HomeView', () => {
  const defaultProps = {
    currentView: 'home' as ViewType,
    setCurrentView: vi.fn(),
    searchMode: 'oracle' as SearchMode,
    setSearchMode: vi.fn(),
    searchQuery: '',
    setSearchQuery: vi.fn(),
    isRandomOrgAvailable: true,
    isGenerating: false,
    onSubmit: vi.fn(),
    onAncientQueryClick: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<HomeView {...defaultProps} />);
    
    expect(screen.getByText('CLEROS | Digital Bibliomancy')).toBeInTheDocument();
    expect(screen.getByText('Oracle')).toBeInTheDocument();
    expect(screen.getByText('Counsel')).toBeInTheDocument();
    expect(screen.getByText('Test query text')).toBeInTheDocument();
  });

  it('shows oracle mode as selected by default', () => {
    render(<HomeView {...defaultProps} />);
    
    const oracleButton = screen.getByText('Oracle');
    expect(oracleButton).toHaveClass('active');
  });

  it('shows counsel mode when selected', () => {
    render(<HomeView {...defaultProps} searchMode="sage" />);
    
    const counselButton = screen.getByText('Counsel');
    expect(counselButton).toHaveClass('active');
  });

  it('shows warning when random.org is unavailable', () => {
    render(<HomeView {...defaultProps} isRandomOrgAvailable={false} />);
    
    expect(screen.getByText(/Oracle mode disabled/)).toBeInTheDocument();
  });

  it('calls onSubmit when form is submitted', () => {
    render(<HomeView {...defaultProps} searchQuery="test query" />);
    
    const submitButton = screen.getByRole('button', { name: '→' });
    fireEvent.click(submitButton);
    
    expect(defaultProps.onSubmit).toHaveBeenCalled();
  });

  it('calls onAncientQueryClick when carousel is clicked', () => {
    render(<HomeView {...defaultProps} />);
    
    const carousel = screen.getByText('Test query text');
    fireEvent.click(carousel);
    
    // The mock returns the current query text from ancient queries
    expect(defaultProps.onAncientQueryClick).toHaveBeenCalled();
  });

  it('shows loading overlay when generating', () => {
    render(<HomeView {...defaultProps} isGenerating={true} />);
    
    expect(screen.getByText('Consulting the Oracle...')).toBeInTheDocument();
  });

  it('shows correct loading text for counsel mode', () => {
    render(<HomeView {...defaultProps} searchMode="sage" isGenerating={true} />);
    
    expect(screen.getByText('Seeking Wisdom...')).toBeInTheDocument();
  });
});
