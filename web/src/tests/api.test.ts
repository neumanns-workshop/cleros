// @jest-environment jsdom
import { fetchLocalData, clearAPICache } from '../services/api';

// Mock the global fetch function
global.fetch = jest.fn();

describe('API Service', () => {
  beforeEach(() => {
    // Clear fetch mocks and API cache before each test
    (global.fetch as jest.Mock).mockClear();
    clearAPICache();
  });

  it('should handle successful data fetching', async () => {
    // Mock implementation for successful fetch
    const mockData = { test: 'data' };
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue(mockData)
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    // Call the function
    const result = await fetchLocalData('/test/path.json');

    // Verify results
    expect(global.fetch).toHaveBeenCalledWith('/test/path.json');
    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockData);
    expect(result.error).toBeUndefined();
  });

  it('should handle fetch failures', async () => {
    // Mock implementation for failed fetch
    const mockResponse = {
      ok: false,
      status: 404,
      statusText: 'Not Found'
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    // Call the function
    const result = await fetchLocalData('/invalid/path.json');

    // Verify results
    expect(global.fetch).toHaveBeenCalledWith('/invalid/path.json');
    expect(result.success).toBe(false);
    expect(result.data).toBeNull();
    expect(result.error).toContain('Failed to load data');
  });

  it('should handle network errors', async () => {
    // Mock implementation for network error
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network failure'));

    // Call the function
    const result = await fetchLocalData('/test/path.json');

    // Verify results
    expect(global.fetch).toHaveBeenCalledWith('/test/path.json');
    expect(result.success).toBe(false);
    expect(result.data).toBeNull();
    expect(result.error).toBe('Network failure');
  });

  it('should use cached data on subsequent calls', async () => {
    // Mock implementation for successful fetch
    const mockData = { test: 'cached-data' };
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue(mockData)
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    // First call should fetch data
    const result1 = await fetchLocalData('/cached/path.json');
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(result1.data).toEqual(mockData);

    // Second call should use cached data
    const result2 = await fetchLocalData('/cached/path.json');
    expect(global.fetch).toHaveBeenCalledTimes(1); // Still only called once
    expect(result2.data).toEqual(mockData);
  });

  it('should clear cache when clearAPICache is called', async () => {
    // Mock implementation for successful fetch
    const mockData = { test: 'data' };
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue(mockData)
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    // First call
    await fetchLocalData('/test/clear-cache.json');
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Clear cache
    clearAPICache();

    // Call again - should fetch again
    await fetchLocalData('/test/clear-cache.json');
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
}); 