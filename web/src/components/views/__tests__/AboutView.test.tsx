import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../../test/utils';
import { AboutView } from '../AboutView';
import { ViewType } from '../../../types/app';

describe('AboutView', () => {
  const mockSetCurrentView = vi.fn();
  const defaultProps = {
    currentView: 'about' as ViewType,
    setCurrentView: mockSetCurrentView
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<AboutView {...defaultProps} />);
    
    expect(screen.getByText('About Cleros')).toBeInTheDocument();
    expect(screen.getByText('Digital Bibliomancy')).toBeInTheDocument();
    expect(screen.getByText('Etymology')).toBeInTheDocument();
    expect(screen.getByText('Two Methods')).toBeInTheDocument();
    expect(screen.getByText('The Corpus')).toBeInTheDocument();
  });

  it('displays header with navigation', () => {
    render(<AboutView {...defaultProps} />);
    
    expect(screen.getByText('CLEROS | Digital Bibliomancy')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Corpus')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  it('shows footer', () => {
    render(<AboutView {...defaultProps} />);
    
    expect(screen.getByText('© 2025 Galaxy Brain Entertainment')).toBeInTheDocument();
  });

  it('displays oracle mode description', () => {
    render(<AboutView {...defaultProps} />);
    
    expect(screen.getByText('Oracle Mode')).toBeInTheDocument();
    expect(screen.getByText(/Oracle mode provides responses through lot-casting/)).toBeInTheDocument();
  });

  it('displays counsel mode description', () => {
    render(<AboutView {...defaultProps} />);
    
    expect(screen.getByText('Counsel Mode')).toBeInTheDocument();
    expect(screen.getByText(/Counsel mode uses semantic search/)).toBeInTheDocument();
  });

  it('displays corpus descriptions', () => {
    render(<AboutView {...defaultProps} />);
    
    expect(screen.getAllByText('Orphic Hymns')).toHaveLength(2);
    expect(screen.getAllByText('Orphic Argonautica')).toHaveLength(2);
    expect(screen.getAllByText('Orphic Lithica')).toHaveLength(2);
    expect(screen.getByText('Golden Tablets')).toBeInTheDocument();
    expect(screen.getByText('Oracle Queries')).toBeInTheDocument();
  });

  it('displays contact information', () => {
    render(<AboutView {...defaultProps} />);
    
    expect(screen.getByText('Contact')).toBeInTheDocument();
    const emailLink = screen.getByText('social@neumannsworkshop.com');
    expect(emailLink).toBeInTheDocument();
    expect(emailLink.closest('a')).toHaveAttribute('href', 'mailto:social@neumannsworkshop.com');
  });

  it('calls setCurrentView when navigation is used', () => {
    render(<AboutView {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Home'));
    expect(mockSetCurrentView).toHaveBeenCalledWith('home');
  });
});
