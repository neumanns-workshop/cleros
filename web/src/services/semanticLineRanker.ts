/**
 * Semantic Line Ranker - Shared utility for ranking lines within passages
 * Used by both Oracle and Counsel services to find the most semantically relevant lines
 */

import { embeddingService } from './embeddingService';
import { synonymExpansionService, EnhancedKeywordData } from './synonymExpansionService';
import { ShareableOption } from '../types/oracle';
import { LineDetail } from '../types/corpus';

export interface BestLineResult {
  lineNumber: number;
  score: number;
  text: string;
}

export interface BestSentenceResult {
  corpus: 'hymns' | 'argonautica' | 'lithica';
  sentenceId: number;
  score: number;
  text: string;
  lineCount: number;
  sectionTitle: string;
}

export interface PassageLineData {
  lineDetails: LineDetail[];
  sectionTitle: string;
  partNumber: number;
  sentenceId: number;
  corpusName: string;
}

export class SemanticLineRanker {
  /**
   * Calculate enhanced keyword boost using pre-expanded keywords
   */
  private calculateEnhancedKeywordBoost(lineText: string, enhancedKeywords: EnhancedKeywordData[]): number {
    if (!enhancedKeywords || enhancedKeywords.length === 0) return 0;

    let totalBoost = 0;
    const lowerLineText = lineText.toLowerCase();

    for (const keywordObj of enhancedKeywords) {
      // Check original keyword
      if (keywordObj.original && lowerLineText.includes(keywordObj.original.toLowerCase())) {
        totalBoost += keywordObj.originalWeight || 0.15;
      }

      // Check synonym matches
      if (keywordObj.synonyms && Array.isArray(keywordObj.synonyms)) {
        for (const synonym of keywordObj.synonyms) {
          if (synonym && lowerLineText.includes(synonym.toLowerCase())) {
            totalBoost += keywordObj.synonymWeight || 0.05;
          }
        }
      }
    }

    // Cap the boost at 0.25
    return Math.min(totalBoost, 0.25);
  }

  /**
   * Calculate basic keyword boost (used when enhanced keywords aren't available)
   */
  private calculateBasicKeywordBoost(lineText: string, keywords: string[]): number {
    if (!keywords || keywords.length === 0) return 0;

    let matchCount = 0;
    const lowerText = lineText.toLowerCase();
    
    for (const keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        matchCount++;
      }
    }

    // Basic boost: 0.1 per keyword match, capped at 0.25
    return Math.min(matchCount * 0.1, 0.25);
  }

  /**
   * Find the best line within a passage using line-level embeddings
   * With graceful degradation when embeddings are unavailable
   */
  async findBestLineInPassage(
    passageData: PassageLineData,
    queryEmbedding: number[] | null, // Allow null for when embeddings unavailable
    enhancedKeywords?: EnhancedKeywordData[], // Enhanced keywords from synonym expansion
    basicKeywords?: string[]  // Fallback basic keywords
  ): Promise<BestLineResult | undefined> {
    
    let bestLine = null;
    let bestScore = -1;
    const embeddingsAvailable = queryEmbedding !== null;

    for (const lineDetail of passageData.lineDetails) {
      try {
        let semanticSimilarity = 0;
        
        // Only attempt semantic scoring if embeddings are available
        if (embeddingsAvailable && queryEmbedding) {
          try {
            // Construct proper line ID: corpus_part_sentence_line
            const lineId = `${passageData.corpusName}_${passageData.partNumber}_${passageData.sentenceId}_${lineDetail.line}`;
            
            // Get line embedding from embedding service
            const lineEmbedding = await embeddingService.getLineEmbedding(passageData.corpusName, lineId);
            if (lineEmbedding) {
              // Calculate semantic similarity
              semanticSimilarity = embeddingService.calculateCosineSimilarity(
                queryEmbedding, 
                lineEmbedding
              );
            }
          } catch (err) {
            // Continue with semanticSimilarity = 0
            console.warn(`Skipping semantic scoring for line ${lineDetail.line}`, err);
          }
        }

        // Apply keyword boost - this works even when embeddings fail
        let keywordBoost = 0;
        if (enhancedKeywords) {
          keywordBoost = this.calculateEnhancedKeywordBoost(lineDetail.english, enhancedKeywords);
        } else if (basicKeywords) {
          keywordBoost = this.calculateBasicKeywordBoost(lineDetail.english, basicKeywords);
        }
        
        // Give keywords more weight when embeddings aren't available
        if (!embeddingsAvailable) {
          keywordBoost *= 2;
        }
        
        // Combined score (clamped to [0, 1])
        const finalScore = Math.min(semanticSimilarity + keywordBoost, 1.0);

        if (finalScore > bestScore) {
          bestScore = finalScore;
          bestLine = {
            lineNumber: lineDetail.line,
            score: finalScore,
            text: lineDetail.english
          };
        }
      } catch (error) {
        console.warn(`Error scoring line ${lineDetail.line} in ${passageData.corpusName}:`, error);
      }
    }

    // If we didn't find any matching lines, don't default to first line
    // Return undefined so the UI can handle this state appropriately
    if (!bestLine) {
      console.warn('No lines matched the query - returning undefined');
    }

    return bestLine || undefined;
  }

  /**
   * Find the overall best line across multiple corpus selections
   */
  findOverallBestLine(
    corpusBestLines: Array<{
      corpus: 'hymns' | 'argonautica' | 'lithica';
      bestLine?: BestLineResult;
    }>
  ): { corpus: 'hymns' | 'argonautica' | 'lithica'; lineNumber: number; score: number; text: string } | undefined {
    
    let overallBest: { 
      corpus: 'hymns' | 'argonautica' | 'lithica'; 
      lineNumber: number; 
      score: number; 
      text: string; 
    } | undefined;

    for (const entry of corpusBestLines) {
      if (entry.bestLine && (!overallBest || entry.bestLine.score > overallBest.score)) {
        overallBest = {
          corpus: entry.corpus,
          lineNumber: entry.bestLine.lineNumber,
          score: entry.bestLine.score,
          text: entry.bestLine.text
        };
      }
    }

    if (overallBest) {
      console.log(`🎯 Overall best line: ${overallBest.corpus} line ${overallBest.lineNumber} (${(overallBest.score * 100).toFixed(1)}%)`);
    }

    return overallBest;
  }

  /**
   * Extract basic keywords from query text (simple version)
   */
  extractKeywords(query: string): string[] {
    return query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .filter(word => !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'].includes(word));
  }

  /**
   * Get enhanced keywords using synonym expansion (for more sophisticated analysis)
   */
  async getEnhancedKeywords(query: string): Promise<EnhancedKeywordData[]> {
    const basicKeywords = this.extractKeywords(query);
    
    return await synonymExpansionService.expandKeywords(
      basicKeywords,
      3, // Max 3 synonyms per term
      0.15, // Original keyword weight 
      0.05  // Synonym weight
    );
  }

  /**
   * Score a sentence semantically against a query
   */
  async scoreSentence(
    corpus: 'hymns' | 'argonautica' | 'lithica',
    sentenceId: number,
    sentenceText: string,
    lineCount: number,
    sectionTitle: string,
    queryEmbedding: number[],
    basicKeywords?: string[]
  ): Promise<BestSentenceResult | undefined> {
    
    try {
      // Get sentence embedding (assume part number 1 for now - this may need refinement)
      const sentenceEmbedding = await embeddingService.getSentenceEmbedding(corpus, sentenceId, 1);
      if (!sentenceEmbedding) return undefined;

      // Calculate semantic similarity
      const semanticSimilarity = embeddingService.calculateCosineSimilarity(
        queryEmbedding, 
        sentenceEmbedding
      );

      // Apply keyword boost if available
      let keywordBoost = 0;
      if (basicKeywords) {
        keywordBoost = this.calculateBasicKeywordBoost(sentenceText, basicKeywords);
      }
      
      // Combined score (clamped to [0, 1])
      const finalScore = Math.min(semanticSimilarity + keywordBoost, 1.0);

      return {
        corpus,
        sentenceId,
        score: finalScore,
        text: sentenceText,
        lineCount,
        sectionTitle
      };
    } catch (error) {
      console.warn(`Error scoring sentence ${sentenceId} in ${corpus}:`, error);
      return undefined;
    }
  }

  /**
   * Find the best shareable sentence across oracle selections
   * Returns best sentence ≤5 lines, or undefined if none qualify
   */
  async findBestShareableSentence(
    oracleSelections: Array<{
      corpus: 'hymns' | 'argonautica' | 'lithica';
      sentenceId: number;
      text: string;
      lineDetails: LineDetail[];
      sectionTitle: string;
    }>,
    queryEmbedding: number[],
    basicKeywords?: string[]
  ): Promise<BestSentenceResult | undefined> {
    
    const candidateSentences: BestSentenceResult[] = [];

    // Score each oracle selection's sentence
    for (const selection of oracleSelections) {
      const lineCount = selection.lineDetails.length;
      
      // Only consider sentences ≤5 lines for shareability
      if (lineCount <= 5) {
        const scoredSentence = await this.scoreSentence(
          selection.corpus,
          selection.sentenceId,
          selection.text,
          lineCount,
          selection.sectionTitle,
          queryEmbedding,
          basicKeywords
        );
        
        if (scoredSentence) {
          candidateSentences.push(scoredSentence);
        }
      }
    }

    // Find the best scoring sentence
    if (candidateSentences.length === 0) {
      console.log('🚫 No sentences ≤5 lines found for sharing');
      return undefined;
    }

    const bestSentence = candidateSentences.reduce((best, current) => 
      current.score > best.score ? current : best
    );

    console.log(`📖 Best shareable sentence: ${bestSentence.corpus} (${bestSentence.lineCount} lines, ${(bestSentence.score * 100).toFixed(1)}%)`);
    return bestSentence;
  }

  /**
   * Generate all shareable options for the share dialog carousel
   * Returns ranked array of sentences and fallback lines
   */
  async generateAllShareableOptions(
    oracleSelections: Array<{
      corpus: 'hymns' | 'argonautica' | 'lithica';
      sentenceId: number;
      text: string;
      lineDetails: LineDetail[];
      sectionTitle: string;
      bestLine?: BestLineResult;
      incense?: {
        english: string;
        greek?: string;
      };
    }>,
    queryEmbedding: number[],
    basicKeywords?: string[]
  ): Promise<Array<{
    id: string;
    type: 'sentence' | 'line';
    corpus: 'hymns' | 'argonautica' | 'lithica';
    score: number;
    content: {
      text: string;
      lineCount?: number;
      sectionTitle: string;
    };
    metadata?: {
      sentenceId?: number;
      lineNumber?: number;
      incense?: {
        english: string;
        greek?: string;
      };
    };
  }>> {
    
    const shareableOptions: ShareableOption[] = [];

    // 1. Add valid sentences (≤5 lines)
    for (const selection of oracleSelections) {
      const lineCount = selection.lineDetails.length;
      
      if (lineCount <= 5) {
        const scoredSentence = await this.scoreSentence(
          selection.corpus,
          selection.sentenceId,
          selection.text,
          lineCount,
          selection.sectionTitle,
          queryEmbedding,
          basicKeywords
        );
        
        if (scoredSentence) {
          shareableOptions.push({
            id: `sentence-${selection.corpus}-${selection.sentenceId}`,
            type: 'sentence',
            corpus: selection.corpus,
            score: scoredSentence.score,
            content: {
              text: scoredSentence.text,
              lineCount: scoredSentence.lineCount,
              sectionTitle: scoredSentence.sectionTitle
            },
            metadata: {
              sentenceId: selection.sentenceId,
              incense: selection.incense
            }
          });
        }
      }
    }

    // Section headers removed - they have no semantic relevance to user queries

    // 2. Add best lines as fallback (especially if no valid sentences)
    for (const selection of oracleSelections) {
      if (selection.bestLine) {
        shareableOptions.push({
          id: `line-${selection.corpus}-${selection.bestLine.lineNumber}`,
          type: 'line',
          corpus: selection.corpus,
          score: selection.bestLine.score,
          content: {
            text: selection.bestLine.text,
            lineCount: 1,
            sectionTitle: selection.sectionTitle
          },
          metadata: {
            lineNumber: selection.bestLine.lineNumber,
            incense: selection.incense
          }
        });
      }
    }

    // Sort by score (highest first), with sentences prioritized over lines at same score
    shareableOptions.sort((a: ShareableOption, b: ShareableOption) => {
      if (Math.abs(a.score - b.score) < 0.01) {
        // If scores are very close, prioritize sentences over lines
        const typeOrder: Record<'sentence' | 'line', number> = { sentence: 2, line: 1 };
        return typeOrder[b.type] - typeOrder[a.type];
      }
      return b.score - a.score;
    });

    const validCount = shareableOptions.filter(opt => opt.type === 'sentence').length;
    console.log(`🎴 Generated ${shareableOptions.length} shareable options (${validCount} valid sentences ≤5 lines)`);
    
    return shareableOptions;
  }
}

// Export singleton instance
export const semanticLineRanker = new SemanticLineRanker();
