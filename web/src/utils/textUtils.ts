/**
 * Utility functions for text processing in the Cleros application
 */

/**
 * Fixes fragmented text by hiding single periods and formatting ellipses
 */
export const fixFragmentedText = (text: string): string => {
  if (!text) return '';
  
  // Skip standalone periods, they're often parsing errors
  if (text === '.' || text === '..') {
    return '';
  }
  
  // Format proper ellipsis consistently
  if (text === '...' || text === '. . .' || text === '. .') {
    return '...';
  }
  
  // Remove leading commas (like the ", O son of two mothers" case in the screenshot)
  if (text.startsWith(', ')) {
    return text.substring(2);
  }
  
  // Remove lone commas
  if (text === ',') {
    return '';
  }
  
  // Keep other text as is
  return text;
}; 