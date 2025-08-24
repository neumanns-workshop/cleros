import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAppState } from '../useAppState';

// Mock the services
vi.mock('../../services/oracleService', () => ({
  oracleService: {
    checkRandomOrgAvailability: vi.fn(),
    loadCorpusData: vi.fn(),
    generateOracleResponse: vi.fn(),
    cacheOracleResponse: vi.fn()
  }
}));

vi.mock('../../services/counselService', () => ({
  counselService: {
    generateCounselResponse: vi.fn(),
    cacheCounselResponse: vi.fn()
  }
}));

// Mock fetch for corpus data loading
global.fetch = vi.fn();

describe('useAppState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    // Mock successful fetch responses for corpus data
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        metadata: {},
        parts: []
      })
    } as Response);
  });

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useAppState());
    
    expect(result.current.currentView).toBe('home');
    expect(result.current.searchQuery).toBe('');
    expect(result.current.searchMode).toBe('oracle');
    expect(result.current.selectedSource).toBe('hymns');
    expect(result.current.selectedSection).toBe('');
    expect(result.current.loading).toBe(true);
    expect(result.current.isGeneratingOracle).toBe(false);
    expect(result.current.isGeneratingCounsel).toBe(false);
  });

  it('checks random.org availability on mount', async () => {
    const { oracleService } = await import('../../services/oracleService');
    vi.mocked(oracleService.checkRandomOrgAvailability).mockResolvedValue(true);
    
    const { result } = renderHook(() => useAppState());
    
    await waitFor(() => {
      expect(oracleService.checkRandomOrgAvailability).toHaveBeenCalled();
      expect(result.current.isRandomOrgAvailable).toBe(true);
    });
  });

  it('switches to counsel mode when random.org is unavailable', async () => {
    const { oracleService } = await import('../../services/oracleService');
    vi.mocked(oracleService.checkRandomOrgAvailability).mockResolvedValue(false);
    
    const { result } = renderHook(() => useAppState());
    
    await waitFor(() => {
      expect(result.current.isRandomOrgAvailable).toBe(false);
      expect(result.current.searchMode).toBe('sage');
    });
  });

  it('loads corpus data on mount', async () => {
    const { result } = renderHook(() => useAppState());
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/corpus_20250822_121628/hymns.json');
      expect(fetch).toHaveBeenCalledWith('/corpus_20250822_121628/argonautica.json');
      expect(fetch).toHaveBeenCalledWith('/corpus_20250822_121628/lithica.json');
      expect(result.current.loading).toBe(false);
    });
  });

  it('handles search correctly for oracle mode', async () => {
    const { oracleService } = await import('../../services/oracleService');
    vi.mocked(oracleService.checkRandomOrgAvailability).mockResolvedValue(true);
    const mockResponse = {
      timestamp: Date.now(),
      query: 'test query',
      selections: {},
      randomSource: 'random.org' as const,
      keywords: ['test', 'query'],
      shareableOptions: []
    };
    vi.mocked(oracleService.generateOracleResponse).mockResolvedValue(mockResponse);
    
    const { result } = renderHook(() => useAppState());
    
    await waitFor(() => {
      expect(result.current.isRandomOrgAvailable).toBe(true);
    });
    
    await result.current.handleSearch('test query');
    
    await waitFor(() => {
      expect(oracleService.generateOracleResponse).toHaveBeenCalledWith('test query');
      expect(oracleService.cacheOracleResponse).toHaveBeenCalled();
      expect(result.current.currentView).toBe('corpus');
      expect(result.current.selectedSource).toBe('personal');
    });
  });

  it('handles search correctly for counsel mode', async () => {
    const { oracleService } = await import('../../services/oracleService');
    const { counselService } = await import('../../services/counselService');
    vi.mocked(oracleService.checkRandomOrgAvailability).mockResolvedValue(true);
    const mockResponse = {
      timestamp: Date.now(),
      query: 'test query',
      selections: {},
      searchSource: 'semantic' as const,
      keywords: ['test', 'query'],
      shareableOptions: []
    };
    vi.mocked(counselService.generateCounselResponse).mockResolvedValue(mockResponse);
    
    const { result } = renderHook(() => useAppState());
    
    await waitFor(() => {
      expect(result.current.isRandomOrgAvailable).toBe(true);
    });
    
    // Set to counsel mode and wait for state update
    result.current.setSearchMode('sage');
    
    await waitFor(() => {
      expect(result.current.searchMode).toBe('sage');
    });
    
    await result.current.handleSearch('test query');
    
    await waitFor(() => {
      expect(counselService.generateCounselResponse).toHaveBeenCalledWith('test query');
      expect(counselService.cacheCounselResponse).toHaveBeenCalled();
      expect(result.current.currentView).toBe('corpus');
      expect(result.current.selectedSource).toBe('personal');
    });
  });

  it('loads personal reports from localStorage', () => {
    // Set up localStorage with test data
    const mockOracleResponse = {
      timestamp: 123456789,
      query: 'test oracle query',
      selections: {}
    };
    const mockCounselResponse = {
      timestamp: 987654321,
      query: 'test counsel query',
      selections: {}
    };
    
    localStorage.setItem('oracle_response_123456789', JSON.stringify({
      response: mockOracleResponse,
      cached_at: Date.now()
    }));
    localStorage.setItem('counsel_response_987654321', JSON.stringify({
      response: mockCounselResponse,
      cached_at: Date.now()
    }));
    
    const { result } = renderHook(() => useAppState());
    
    expect(result.current.personalOracleReports).toHaveLength(1);
    expect(result.current.personalCounselReports).toHaveLength(1);
    expect(result.current.personalOracleReports[0].query).toBe('test oracle query');
    expect(result.current.personalCounselReports[0].query).toBe('test counsel query');
  });
});