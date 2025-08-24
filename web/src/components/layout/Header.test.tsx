import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test/utils';
import { Header } from './Header';

describe('Header', () => {
  const mockSetCurrentView = vi.fn();

  beforeEach(() => {
    mockSetCurrentView.mockClear();
  });

  it('renders correctly', () => {
    render(<Header currentView="home" setCurrentView={mockSetCurrentView} />);
    
    expect(screen.getByText('CLEROS | Digital Bibliomancy')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Corpus')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  it('highlights active view', () => {
    render(<Header currentView="corpus" setCurrentView={mockSetCurrentView} />);
    
    const corpusButton = screen.getByText('Corpus');
    expect(corpusButton).toHaveClass('active');
  });

  it('calls setCurrentView when nav button is clicked', () => {
    render(<Header currentView="home" setCurrentView={mockSetCurrentView} />);
    
    fireEvent.click(screen.getByText('About'));
    expect(mockSetCurrentView).toHaveBeenCalledWith('about');
  });

  it('calls setCurrentView when title is clicked', () => {
    render(<Header currentView="corpus" setCurrentView={mockSetCurrentView} />);
    
    fireEvent.click(screen.getByText('CLEROS | Digital Bibliomancy'));
    expect(mockSetCurrentView).toHaveBeenCalledWith('home');
  });
});