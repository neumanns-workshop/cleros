/**
 * API service utility for SORTES
 * 
 * This file provides a centralized place for API-related functionality.
 * Currently all data is loaded locally, but this could be expanded if
 * backend services are added in the future.
 */

// Type definitions for API responses
export interface APIResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

// Simple cache to avoid repeated fetches for the same data
const dataCache: Record<string, APIResponse<any>> = {};

// Helper function to simulate a local API call for data loading
export async function fetchLocalData<T>(dataPath: string): Promise<APIResponse<T>> {
  // Check cache first
  if (dataCache[dataPath]) {
    return dataCache[dataPath] as APIResponse<T>;
  }

  try {
    const response = await fetch(dataPath);
    if (!response.ok) {
      throw new Error(`Failed to load data from ${dataPath}`);
    }
    const data = await response.json();
    const apiResponse = { data, success: true };
    
    // Store in cache
    dataCache[dataPath] = apiResponse;
    
    return apiResponse;
  } catch (error: any) {
    console.error(`Error fetching ${dataPath}:`, error?.message);
    return { 
      data: null as unknown as T, 
      success: false, 
      error: error?.message || 'Unknown error' 
    };
  }
}

// Clear cache for testing or when needed
export function clearAPICache(): void {
  Object.keys(dataCache).forEach(key => {
    delete dataCache[key];
  });
}
