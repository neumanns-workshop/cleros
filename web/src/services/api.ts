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

// Get the base URL from the environment or use the public URL if available
const getBasePath = (): string => {
  // Use the PUBLIC_URL if available (set by React during build)
  return process.env.PUBLIC_URL || '';
};

// Helper function to simulate a local API call for data loading
export async function fetchLocalData<T>(dataPath: string): Promise<APIResponse<T>> {
  // Check cache first
  if (dataCache[dataPath]) {
    return dataCache[dataPath] as APIResponse<T>;
  }

  // Prepend the base path to the data path if it's not already an absolute URL
  const fullPath = dataPath.startsWith('http') 
    ? dataPath 
    : `${getBasePath()}${dataPath}`;

  try {
    const response = await fetch(fullPath);
    if (!response.ok) {
      throw new Error(`Failed to load data from ${fullPath}`);
    }
    const data = await response.json();
    const apiResponse = { data, success: true };
    
    // Store in cache
    dataCache[dataPath] = apiResponse;
    
    return apiResponse;
  } catch (error: any) {
    console.error(`Error fetching ${fullPath}:`, error?.message);
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
