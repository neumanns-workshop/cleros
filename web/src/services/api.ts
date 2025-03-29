/**
 * API service utility for SORTES
 * 
 * This file provides a centralized place for API-related functionality.
 * Currently all data is loaded locally, but this could be expanded if
 * backend services are added in the future.
 */

import axios from 'axios';

// Type definitions for API responses
export interface APIResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

// Simple cache to avoid repeated fetches for the same data
const dataCache: Record<string, APIResponse<any>> = {};

// Helper function to ensure paths are correctly formed
function ensureCorrectPath(path: string): string {
  // Make sure the path starts with /
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  
  // Make sure we're looking in public directory
  if (!path.startsWith('/data') && !path.includes('/public/')) {
    path = '/data' + path;
  }
  
  // Replace double slashes
  return path.replace(/\/+/g, '/');
}

// Helper function to simulate a local API call for data loading
export async function fetchLocalData<T>(dataPath: string): Promise<APIResponse<T>> {
  try {
    const response = await axios.get(dataPath);
    return { data: response.data, success: true };
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
  console.log('[API] Clearing cache');
  Object.keys(dataCache).forEach(key => {
    delete dataCache[key];
  });
}
