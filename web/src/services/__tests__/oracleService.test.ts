import { describe, it, expect, vi, beforeEach } from 'vitest';
import { oracleService } from '../oracleService';

// Mock fetch
global.fetch = vi.fn();

// Mock embedding service
vi.mock('../embeddingService', () => ({
  embeddingService: {
    getQueryEmbedding: vi.fn().mockResolvedValue([0.1, 0.2, 0.3]),
    calculateCosineSimilarity: vi.fn().mockReturnValue(0.85)
  }
}));

// Mock semantic line ranker
vi.mock('../semanticLineRanker', () => ({
  semanticLineRanker: {
    findBestLineInPassage: vi.fn().mockResolvedValue({
      lineNumber: 1,
      score: 0.9,
      text: 'Best line text'
    }),
    findOverallBestLine: vi.fn().mockReturnValue({
      corpus: 'hymns',
      lineNumber: 1,
      score: 0.9,
      text: 'Overall best line'
    }),
    generateAllShareableOptions: vi.fn().mockResolvedValue([])
  }
}));

describe('oracleService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('checkRandomOrgAvailability', () => {
    it('returns true when random.org is available', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true
      } as Response);

      const result = await oracleService.checkRandomOrgAvailability();
      
      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('random.org'));
    });

    it('returns false when random.org is unavailable', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

      const result = await oracleService.checkRandomOrgAvailability();
      
      expect(result).toBe(false);
    });
  });

  describe('loadCorpusData', () => {
    it('loads and caches corpus data successfully', async () => {
      const mockCorpusData = {
        title: 'Test Corpus',
        parts: [
          {
            part_number: 1,
            part_title: 'Test Part',
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
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockCorpusData)
      } as Response);

      const result = await oracleService.loadCorpusData('hymns');
      
      expect(result).toEqual(mockCorpusData);
      expect(fetch).toHaveBeenCalledWith('/corpus_20250822_121628/hymns.json');
    });

    it('throws error for unknown corpus', async () => {
      await expect(oracleService.loadCorpusData('unknown')).rejects.toThrow('Unknown corpus: unknown');
    });

    it('throws error when fetch fails', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 404
      } as Response)

      // Clear the cache first
      ;(oracleService as any).corpusCache.clear();

      await expect(oracleService.loadCorpusData('hymns')).rejects.toThrow('Failed to load');
    });
  });

  describe('generateOracleResponse', () => {
    it('generates oracle response with true randomness', async () => {
      // Clear the cache first
      ;(oracleService as any).corpusCache.clear();

      // Mock corpus data
      const mockCorpusData = {
        parts: [
          {
            part_number: 1,
            part_title: 'Test Hymn',
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
      };

      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockCorpusData)
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockCorpusData)
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockCorpusData)
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          text: () => Promise.resolve('0\n0\n0')
        } as Response);

      const result = await oracleService.generateOracleResponse('test query');
      
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('query', 'test query');
      expect(result).toHaveProperty('randomSource', 'random.org');
      expect(result).toHaveProperty('selections');
      expect(result.selections).toHaveProperty('hymns');
      expect(result.selections).toHaveProperty('argonautica');
      expect(result.selections).toHaveProperty('lithica');
    });

    it('throws error when random.org is unavailable', async () => {
      // Clear the cache first
      ;(oracleService as any).corpusCache.clear();

      // Mock corpus data loading success but with actual sentences
      const mockCorpusData = {
        parts: [
          {
            part_number: 1,
            part_title: 'Test',
            sentences: [
              {
                sentence_id: 1,
                text: { english: 'Test sentence' },
                line_details: [{ line: 1, english: 'Test line', greek: 'Greek text' }]
              }
            ]
          }
        ]
      };
      
      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockCorpusData)
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockCorpusData)
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockCorpusData)
        } as Response)
        .mockRejectedValueOnce(new Error('Random.org unavailable'));

      await expect(oracleService.generateOracleResponse('test query')).rejects.toThrow('True randomness unavailable');
    });
  });

  describe('caching', () => {
    it('caches oracle response correctly', () => {
      const mockResponse = {
        timestamp: 123456789,
        query: 'test query',
        randomSource: 'random.org',
        selections: {}
      };

      oracleService.cacheOracleResponse(mockResponse as any);
      
      const cached = localStorage.getItem('oracle_response_123456789');
      expect(cached).toBeTruthy();
      
      const parsedCache = JSON.parse(cached!);
      expect(parsedCache.response).toEqual(mockResponse);
    });

    it('retrieves latest cached oracle response', () => {
      const mockResponse = {
        timestamp: 123456789,
        query: 'test query',
        randomSource: 'random.org',
        selections: {}
      };

      localStorage.setItem('oracle_response_latest', JSON.stringify({
        response: mockResponse,
        cached_at: Date.now()
      }));

      const result = oracleService.getLatestOracleResponse();
      expect(result).toEqual(mockResponse);
    });

    it('clears oracle cache correctly', () => {
      localStorage.setItem('oracle_response_123', 'test1');
      localStorage.setItem('oracle_response_456', 'test2');
      localStorage.setItem('other_data', 'keep');
      
      oracleService.clearOracleCache();
      
      expect(localStorage.getItem('oracle_response_123')).toBeNull();
      expect(localStorage.getItem('oracle_response_456')).toBeNull();
      expect(localStorage.getItem('other_data')).toBe('keep');
    });
  });

  describe('extractKeywords', () => {
    it('extracts keywords correctly', () => {
      const keywords = oracleService.extractKeywords('I need help with my health and prosperity');
      
      expect(keywords).toContain('need');
      expect(keywords).toContain('help');
      expect(keywords).toContain('health');
      expect(keywords).toContain('prosperity');
      expect(keywords).not.toContain('and');
      expect(keywords).not.toContain('my');
      expect(keywords).not.toContain('with');
    });

    it('removes duplicates and short words', () => {
      const keywords = oracleService.extractKeywords('I I need need help help my a');
      
      expect(keywords).toEqual(['need', 'help']);
    });
  });

  describe('highlightKeywords', () => {
    it('highlights keywords in text', () => {
      const result = oracleService.highlightKeywords('I need help with health', ['need', 'health']);
      
      expect(result).toContain('<span class="keyword-highlight">need</span>');
      expect(result).toContain('<span class="keyword-highlight">health</span>');
      expect(result).not.toContain('<span class="keyword-highlight">help</span>');
    });

    it('handles empty keywords array', () => {
      const result = oracleService.highlightKeywords('test text', []);
      
      expect(result).toBe('test text');
    });
  });
});
