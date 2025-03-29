import { useCallback } from 'react';
import { QueryRandomError, getRandomNumberFromEmbedding } from '../services/qrng';
import { loadHymnData, loadHymnEmbeddings } from '../services/hymns';
import { useOracleContext } from '../context/OracleContext';
import { SourceSelectionState } from '../types';
import { initializeEmbedder, initializeEmbedderOptimized } from '../services/embeddings';

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
    modelInitialized,
    setModelInitialized,
  } = useOracleContext();

  // Initialize the TensorFlow model if not already done
  const initializeModel = useCallback(async () => {
    if (!modelInitialized) {
      try {
        setModelLoading(true);
        
        // Use the optimized embedder in production
        if (process.env.NODE_ENV === 'production') {
          await initializeEmbedderOptimized();
        } else {
          await initializeEmbedder();
        }
        
        setModelInitialized(true);
      } catch (err) {
        console.error('Failed to initialize model:', err);
        setError('Failed to initialize the oracle. Please try again.');
      } finally {
        setModelLoading(false);
      }
    }
  }, [modelInitialized, setModelLoading, setModelInitialized, setError]);

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
      // Initialize model if not already done
      await initializeModel();
      
      // Currently only handling Orphic hymns
      if (selectedSources.orphic) {
        // Make sure embeddings are loaded
        const embeddings = await initializeEmbeddings();
        if (!embeddings) {
          throw new Error('Hymn embeddings not loaded');
        }
        
        // Add diagnostic logging to understand embeddings structure
        console.log('Embeddings structure check:');
        console.log('- Type of embeddings:', typeof embeddings);
        console.log('- Has lines property:', 'lines' in embeddings);
        console.log('- Has hymns property:', 'hymns' in embeddings);
        console.log('- Direct keys:', Object.keys(embeddings).slice(0, 5));
        
        // Check available data files with fetch
        console.log('Checking available data files:');
        try {
          const basePathsToCheck = [
            '/data/enriched/embeddings/hymn_embeddings.json',
            '/sortes-app/data/enriched/embeddings/hymn_embeddings.json',
          ];
          
          for (const path of basePathsToCheck) {
            try {
              const response = await fetch(path, { method: 'HEAD' });
              console.log(`${path}: ${response.ok ? 'Available' : 'Not available'} (${response.status})`);
            } catch (e: any) {
              console.log(`${path}: Error checking - ${e.message}`);
            }
          }
        } catch (e: any) {
          console.log('Error checking data files:', e);
        }
        
        // Dynamically import embedding functions only when needed
        const { getQueryEmbedding, cosineSimilarity } = await import('../services/embeddings');
        
        // Get query embedding - this will now be our source of randomness
        const queryEmbedding = await getQueryEmbedding(question);
        
        // Use the query embedding to generate a random hymn number
        const hymnNumber = getRandomNumberFromEmbedding(queryEmbedding);
        
        const hymnData = await loadHymnData(hymnNumber);
        
        // Calculate similarity for each line
        const linesWithSimilarity = hymnData.lines.map((line, index) => {
          // In embeddings data, lines are indexed from 0, but in hymn_data.json they might be mapped differently
          // We'll try direct index first, then fallback to appropriate handling
          let lineEmbeddingIndex = index.toString();
          
          // Access the embedding data with proper null checks
          if (!embeddings[hymnNumber.toString()] || 
              !embeddings[hymnNumber.toString()][lineEmbeddingIndex] ||
              !embeddings[hymnNumber.toString()][lineEmbeddingIndex].embedding) {
            console.warn(`Missing embedding for hymn ${hymnNumber}, line ${lineEmbeddingIndex}`);
            // Provide a default similarity when embedding is missing
            return { 
              text: line, 
              similarity: 0, 
              originalIndex: index 
            };
          }
          
          const lineData = embeddings[hymnNumber.toString()][lineEmbeddingIndex];
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
    initializeModel,
    initializeEmbeddings
  ]);

  return {
    consultOracle,
    initializeEmbeddings
  };
}; 