import { useCallback } from 'react';
import { QueryRandomError, getRandomNumberFromEmbedding } from '../services/qrng';
import { loadHymnData, loadHymnEmbeddings } from '../services/hymns';
import { useOracleContext } from '../context/OracleContext';
import { SourceSelectionState } from '../types';

export const useOracle = () => {
  const {
    setResults,
    setIsLoading,
    setError,
    setModelLoading,
    setIsTyping,
    setExpanded,
    hymnEmbeddings,
    setHymnEmbeddings,
  } = useOracleContext();

  // Initialize hymn embeddings if not already loaded
  const initializeEmbeddings = useCallback(async () => {
    if (!hymnEmbeddings) {
      try {
        const embeddings = await loadHymnEmbeddings();
        setHymnEmbeddings(embeddings);
        return embeddings;
      } catch (err) {
        console.error('Failed to load hymn embeddings:', err);
        setError('Failed to load hymn data. Please refresh the page.');
        return null;
      }
    }
    return hymnEmbeddings;
  }, [hymnEmbeddings, setHymnEmbeddings, setError]);

  // The main function to consult the oracle
  const consultOracle = useCallback(async (question: string, selectedSources: SourceSelectionState) => {
    setIsLoading(true);
    setError(null);
    setResults([]);
    setExpanded(false);
    setIsTyping(true);
    
    try {
      // Currently only handling Orphic hymns
      if (selectedSources.orphic) {
        // Make sure embeddings are loaded
        const embeddings = await initializeEmbeddings();
        if (!embeddings) {
          throw new Error('Hymn embeddings not loaded');
        }
        
        // Dynamically import embedding functions only when needed
        const { getQueryEmbedding, cosineSimilarity } = await import('../services/embeddings');
        
        // Get query embedding - this will now be our source of randomness
        const queryEmbedding = await getQueryEmbedding(question, setModelLoading);
        
        // Use the query embedding to generate a random hymn number
        const hymnNumber = getRandomNumberFromEmbedding(queryEmbedding);
        
        const hymnData = await loadHymnData(hymnNumber);
        
        // Calculate similarity for each line
        const linesWithSimilarity = hymnData.lines.map((line, index) => {
          const lineData = embeddings.lines[hymnNumber.toString()][index.toString()];
          const similarity = cosineSimilarity(queryEmbedding, lineData.embedding);
          return { text: line, similarity, originalIndex: index };
        });

        // Sort by similarity for ranking
        const sortedForRanking = [...linesWithSimilarity].sort((a, b) => b.similarity - a.similarity);
        
        // Add rank to each line
        const linesWithRank = linesWithSimilarity.map(line => {
          const rank = sortedForRanking.findIndex(l => l.originalIndex === line.originalIndex);
          return { ...line, rank };
        });

        // Set the results
        setResults([{
          source: 'orphic',
          hymn: hymnNumber.toString(),
          title: hymnData.title,
          question: question,
          incense: hymnData.incense,
          timestamp: new Date().toISOString(),
          lines: linesWithRank,
          maxSimilarity: Math.max(...linesWithSimilarity.map(l => l.similarity)),
          minSimilarity: Math.min(...linesWithSimilarity.map(l => l.similarity)),
          topThreeIndices: sortedForRanking.slice(0, 3).map(line => line.originalIndex)
        }]);
      }
    } catch (err) {
      if (err instanceof QueryRandomError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. The oracle cannot be consulted at this time.');
      }
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [
    setIsLoading, 
    setError, 
    setResults, 
    setExpanded, 
    setIsTyping, 
    setModelLoading, 
    initializeEmbeddings
  ]);

  return {
    consultOracle,
    initializeEmbeddings
  };
}; 