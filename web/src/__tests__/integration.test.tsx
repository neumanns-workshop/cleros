import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../test/utils';
import App from '../App';

// Mock all external dependencies
vi.mock('../services/oracleService', () => ({
  oracleService: {
    checkRandomOrgAvailability: vi.fn().mockResolvedValue(true),
    generateOracleResponse: vi.fn().mockResolvedValue({
      timestamp: Date.now(),
      query: 'test query',
      randomSource: 'random.org',
      keywords: ['test'],
      selections: {
        hymns: {
          source: 'Hymns',
          sentenceId: 1,
          text: { english: 'Test hymn line' },
          sectionTitle: 'Test Hymn',
          lineDetails: [{ line: 1, english: 'Test hymn line', greek: 'Greek text' }],
          randomIndex: 0,
          totalSentences: 100
        },
        argonautica: {
          source: 'Argonautica',
          sentenceId: 1,
          text: { english: 'Test argonautica line' },
          sectionTitle: 'Test Section',
          lineDetails: [{ line: 1, english: 'Test argonautica line', greek: 'Greek text' }],
          randomIndex: 0,
          totalSentences: 100
        },
        lithica: {
          source: 'Lithica',
          sentenceId: 1,
          text: { english: 'Test lithica line' },
          sectionTitle: 'Test Stone',
          lineDetails: [{ line: 1, english: 'Test lithica line', greek: 'Greek text' }],
          randomIndex: 0,
          totalSentences: 100
        }
      }
    }),
    cacheOracleResponse: vi.fn()
  }
}));

vi.mock('../services/counselService', () => ({
  counselService: {
    generateCounselResponse: vi.fn().mockResolvedValue({
      timestamp: Date.now(),
      query: 'test query',
      searchSource: 'semantic',
      keywords: ['test'],
      selections: {
        hymns: {
          source: 'Hymns',
          sentenceId: 1,
          text: { english: 'Test hymn line' },
          sectionTitle: 'Test Hymn',
          lineDetails: [{ line: 1, english: 'Test hymn line', greek: 'Greek text' }],
          semanticScore: 0.85,
          totalSentences: 100
        },
        argonautica: {
          source: 'Argonautica',
          sentenceId: 1,
          text: { english: 'Test argonautica line' },
          sectionTitle: 'Test Section',
          lineDetails: [{ line: 1, english: 'Test argonautica line', greek: 'Greek text' }],
          semanticScore: 0.75,
          totalSentences: 100
        },
        lithica: {
          source: 'Lithica',
          sentenceId: 1,
          text: { english: 'Test lithica line' },
          sectionTitle: 'Test Stone',
          lineDetails: [{ line: 1, english: 'Test lithica line', greek: 'Greek text' }],
          semanticScore: 0.70,
          totalSentences: 100
        }
      }
    }),
    cacheCounselResponse: vi.fn()
  }
}));

// Mock corpus data fetch
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({
    metadata: {},
    parts: [
      {
        part_number: 1,
        part_title: 'Test Part',
        key: '1',
        title_english: 'Test Part',
        sentences: [
          {
            sentence_id: 1,
            text: { english: 'Test sentence' },
            line_details: [
              { line: 1, english: 'Test line', greek: 'Greek text' }
            ]
          }
        ]
      }
    ]
  })
});

describe('Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('completes oracle consultation workflow', async () => {
    render(<App />);

    // Verify we start on home page
    expect(screen.getByText('Oracle')).toBeInTheDocument();
    
    // Enter a query
    const input = screen.getByPlaceholderText(/What's on your mind?/);
    fireEvent.change(input, { target: { value: 'Will I find love?' } });
    
    // Submit the query
    const form = input.closest('form')!;
    fireEvent.submit(form);
    
    // Wait for oracle generation
    expect(screen.getByText('Consulting the Oracle...')).toBeInTheDocument();
    
    // Wait for navigation to corpus view
    await waitFor(() => {
      expect(screen.getByText('Corpus')).toHaveClass('nav-button', 'active');
    }, { timeout: 3000 });
  });

  it('completes counsel consultation workflow', async () => {
    render(<App />);

    // Switch to counsel mode
    fireEvent.click(screen.getByText('Counsel'));
    
    // Enter a query
    const input = screen.getByPlaceholderText(/What's on your mind?/);
    fireEvent.change(input, { target: { value: 'How can I improve my health?' } });
    
    // Submit the query
    const form = input.closest('form')!;
    fireEvent.submit(form);
    
    // Wait for counsel generation
    expect(screen.getByText('Seeking Wisdom...')).toBeInTheDocument();
    
    // Wait for navigation to corpus view
    await waitFor(() => {
      expect(screen.getByText('Corpus')).toHaveClass('nav-button', 'active');
    }, { timeout: 3000 });
  });

  it('navigates between different views', async () => {
    render(<App />);

    // Start on home page
    expect(screen.getByText('Oracle')).toBeInTheDocument();
    
    // Navigate to about page
    fireEvent.click(screen.getByText('About'));
    expect(screen.getByText('Digital Bibliomancy')).toBeInTheDocument();
    
    // Navigate to corpus page
    fireEvent.click(screen.getByText('Corpus'));
    
    await waitFor(() => {
      expect(screen.getByText('Hymns')).toBeInTheDocument();
    });
    
    // Navigate back to home
    fireEvent.click(screen.getByText('Home'));
    expect(screen.getByText('Oracle')).toBeInTheDocument();
  });

  it('browses corpus data', async () => {
    render(<App />);

    // Navigate to corpus page
    fireEvent.click(screen.getByText('Corpus'));
    
    await waitFor(() => {
      expect(screen.getByText('Hymns')).toBeInTheDocument();
    });
    
    // Verify corpus content is displayed
    expect(screen.getByText('Test line')).toBeInTheDocument();
    
    // Change corpus source - find the source selector specifically
    const sourceSelector = document.querySelector('.source-selector') as HTMLSelectElement;
    fireEvent.change(sourceSelector, { target: { value: 'argonautica' } });
    
    await waitFor(() => {
      expect(screen.getByText('Argonautica')).toBeInTheDocument();
    });
  });

  it('handles random.org unavailability gracefully', async () => {
    const { oracleService } = await import('../services/oracleService');
    // Mock random.org as unavailable
    vi.mocked(oracleService.checkRandomOrgAvailability)
      .mockResolvedValue(false);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Oracle mode disabled/)).toBeInTheDocument();
    });
    
    // Oracle button should be disabled
    const oracleButton = screen.getByText(/Oracle.*Disabled/);
    expect(oracleButton).toBeDisabled();
    
    // Should automatically switch to counsel mode
    expect(screen.getByText('Counsel')).toHaveClass('active');
  });

  it('displays error when oracle generation fails', async () => {
    const { oracleService } = await import('../services/oracleService');
    // Mock oracle service to throw error
    vi.mocked(oracleService.generateOracleResponse)
      .mockRejectedValue(new Error('Service error'));

    // Mock alert to capture error messages
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<App />);

    // Enter and submit query
    const input = screen.getByPlaceholderText(/What's on your mind?/);
    fireEvent.change(input, { target: { value: 'Test query' } });
    
    const form = input.closest('form')!;
    fireEvent.submit(form);
    
    // Wait for error handling
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        expect.stringContaining('oracle requires true randomness')
      );
    });

    alertSpy.mockRestore();
  });
});
