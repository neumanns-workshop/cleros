import { embeddingService } from './embeddingService';

import { useState, useEffect } from 'react';

export interface LineScore {
  line: number;
  text: string;
  similarity: number;
  opacity: number;
  rank: number;
}

class ClientSemanticScorer {
  private queryEmbeddingCache: Map<string, Promise<number[]>> = new Map();

  private getQueryEmbedding(query: string): Promise<number[]> {
    if (!this.queryEmbeddingCache.has(query)) {
      this.queryEmbeddingCache.set(query, embeddingService.getQueryEmbedding(query));
    }
    return this.queryEmbeddingCache.get(query)!;
  }



  private calculateBasicKeywordBoost(lineText: string, keywords: string[]): number {
    const lowerLineText = lineText.toLowerCase();
    const boostPerKeyword = 0.1;
    let totalBoost = 0;

    for (const keyword of keywords) {
        const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`);
        if (regex.test(lowerLineText)) {
            totalBoost += boostPerKeyword;
        }
    }
    return Math.min(totalBoost, 0.25);
  }

  public async getSimilarity(corpus: string, lineData: any, query: string, keywords: string[]): Promise<number> {
    try {
      // Handle null/undefined lineData or header items
      if (!lineData || lineData.isHeader || lineData.isMarker || 
          (lineData.sentence_id == null && lineData.line == null)) {
        return 0; // Skip headers/markers silently
      }

      const queryEmbedding = await this.getQueryEmbedding(query);
      
      // Use the unified corpus structure - construct proper line ID
      if (lineData.part_number != null && lineData.sentence_id != null && lineData.corpus_name) {
        const lineId = `${lineData.corpus_name}_${lineData.part_number}_${lineData.sentence_id}_${lineData.line}`;

        
        const lineEmbedding = await embeddingService.getLineEmbedding(corpus, lineId);

        if (lineEmbedding) {

          // Calculate semantic similarity
          const semanticSimilarity = embeddingService.calculateCosineSimilarity(
            queryEmbedding, 
            lineEmbedding
          );

          // Add basic keyword boost (no synonym expansion - that was done during counsel generation)
          const keywordBoost = this.calculateBasicKeywordBoost(lineData.english || '', keywords);
          
          // Combine scores (capped at 1.0)
          const combinedScore = Math.min(semanticSimilarity + keywordBoost, 1.0);
          
          return combinedScore;
        }
      }
      
      // Fallback to basic keyword scoring (no synonym expansion)
      const keywordScore = this.calculateBasicKeywordBoost(lineData.english || '', keywords);
      return keywordScore;

    } catch (error) {
      console.error('Error calculating similarity:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const clientSemanticScorer = new ClientSemanticScorer();


// React Hook for getting similarity score for a line
export const useSemanticSimilarity = (corpus: string | undefined, lineData: any, oracleResponse: any | null) => {
  const [similarity, setSimilarity] = useState(0);

  useEffect(() => {
    let isMounted = true;
    if (corpus && lineData && oracleResponse) {
      clientSemanticScorer.getSimilarity(corpus, lineData, oracleResponse.query, oracleResponse.keywords).then(score => {
        if (isMounted) {
          setSimilarity(score);
        }
      }).catch(() => {
        if (isMounted) {
          setSimilarity(0);
        }
      });
    } else {
      setSimilarity(0);
    }
    return () => { isMounted = false; };
  }, [corpus, lineData, oracleResponse]);

  // Create transparency levels based on semantic similarity - no color highlights
  let opacity: number;

  if (similarity >= 0.5) {
    // High relevance: fully visible
    opacity = 1.0;
  } else if (similarity >= 0.25) {
    // Medium relevance: clearly visible
    opacity = 0.85;
  } else if (similarity > 0) {
    // Low relevance: dimmed but readable
    opacity = 0.65;
  } else {
    // No relevance: still readable
    opacity = 0.5;
  }

  const style: React.CSSProperties = {
    opacity: opacity,
    transition: 'opacity 0.5s ease'
  };

  return style;
};
