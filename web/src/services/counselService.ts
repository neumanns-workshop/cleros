/**
 * Counsel Service - Semantic Search Implementation
 * Implements wisdom retrieval through AI-powered semantic search
 */

import { embeddingService } from './embeddingService';
import { synonymExpansionService, EnhancedKeywordData } from './synonymExpansionService';
import { semanticLineRanker } from './semanticLineRanker';
import { CounselResponse } from '../types/oracle';
import { LineDetail } from '../types/corpus';
import { CorpusData } from './oracleService';

// CounselResponse and CounselSelection interfaces moved to types/oracle.ts - import from there

export interface SentenceEmbeddingData {
  metadata: {
    corpus: string;
    total_sentences: number;
    embedding_dimension: number;
    mapping: Array<{
      id: string;
      index: number;
    }>;
  };
  embeddings: number[][];
  corpusData: CorpusData; // The unified corpus file
}

export interface SentenceUnit {
  id: number;
  text: string; // Just the English text string
  embedding: number[];
  sentenceData: {
    sentence_id: number;
    part_number: number;
    part_title: string;
    line_details: LineDetail[];
    incense?: string;
    incense_greek?: string;
  };
}

class ClientCounselService {
  private corpusDataCache: Map<string, Promise<SentenceEmbeddingData>> = new Map();
  private stopWords: Set<string> = new Set();

  constructor() {
    this.initializeStopWords();
  }

  private initializeStopWords() {
    // Basic English stop words for client-side keyword extraction
    const basicStopWords = [
      'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
      'has', 'he', 'in', 'is', 'it', 'of', 'on', 'that', 'the', 'to',
      'was', 'were', 'will', 'with', 'would', 'i', 'you', 'me', 'my',
      'we', 'our', 'they', 'them', 'their', 'this', 'these', 'those',
      'have', 'had', 'do', 'does', 'did', 'can', 'could', 'should',
      'but', 'or', 'not', 'no', 'if', 'when', 'where', 'who', 'which',
      'what', 'how', 'why', 'about', 'into', 'through', 'during',
      'before', 'after', 'above', 'below', 'up', 'down', 'out', 'off',
      'over', 'under', 'again', 'further', 'then', 'once'
    ];
    
    basicStopWords.forEach(word => this.stopWords.add(word));
  }

  /**
   * Load sentence embeddings for a corpus
   */
  private async loadSentenceEmbeddings(corpusName: string): Promise<SentenceEmbeddingData> {
    if (this.corpusDataCache.has(corpusName)) {
      const cached = this.corpusDataCache.get(corpusName);
      if (cached) {
        return cached;
      }
    }

    const promise = (async () => {
      // Load minimal metadata + embeddings + corpus separately
      const [metadataResponse, corpusResponse] = await Promise.all([
        fetch(`/embeddings/${corpusName}/sentences_metadata.json`),
        fetch(`/corpus_20250822_121628/${corpusName}.json`)
      ]);

      if (!metadataResponse.ok) {
        throw new Error(`Failed to load metadata: ${metadataResponse.status}`);
      }
      if (!corpusResponse.ok) {
        throw new Error(`Failed to load corpus: ${corpusResponse.status}`);
      }

      const [metadata, corpusData] = await Promise.all([
        metadataResponse.json(),
        corpusResponse.json()
      ]);

      // Load the embedding vectors
      const embeddingResponse = await fetch(`/embeddings/${corpusName}/sentences.npy`);
      if (!embeddingResponse.ok) {
        throw new Error(`Failed to load embeddings: ${embeddingResponse.status}`);
      }
      
      const embeddingBuffer = await embeddingResponse.arrayBuffer();
      const embeddings = this.parseNumpyArray(embeddingBuffer);

      return {
        metadata,
        embeddings,
        corpusData
      };
    })();

    this.corpusDataCache.set(corpusName, promise);
    return promise;
  }

  private parseNumpyArray(buffer: ArrayBuffer): number[][] {
    // Simple .npy parser for float32 arrays
    // Skip the header and read the float32 data
    const view = new DataView(buffer);
    
    // Skip numpy header (simplified - assumes our specific format)
    let offset = 128; // Approximate header size
    const floats = [];
    
    while (offset < buffer.byteLength) {
      floats.push(view.getFloat32(offset, true)); // little endian
      offset += 4;
    }
    
    // Reshape to 2D array (assuming we know the dimensions from metadata)
    const result: number[][] = [];
    const embedding_dim = 384; // from all-MiniLM-L6-v2
    
    for (let i = 0; i < floats.length; i += embedding_dim) {
      result.push(floats.slice(i, i + embedding_dim));
    }
    
    return result;
  }



  /**
   * Extract keywords from query text
   */
  extractKeywords(query: string): string[] {
    const words = query
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !this.stopWords.has(word));

    return [...new Set(words)]; // Remove duplicates
  }

  /**
   * Calculate enhanced keyword boost using pre-expanded keywords
   */
  private calculateEnhancedKeywordBoost(
    text: string, 
    enhancedKeywords: EnhancedKeywordData[]
  ): number {
    if (!text || !enhancedKeywords || enhancedKeywords.length === 0) {
      return 0;
    }
    
    try {
      // Calculate boost using pre-expanded keywords
      return synonymExpansionService.calculateEnhancedKeywordBoost(text, enhancedKeywords);
    } catch (error) {
      console.warn('Error in enhanced keyword boosting, falling back to basic:', error);
      // Extract original keywords from enhanced keywords for fallback
      const originalKeywords = enhancedKeywords.map(ek => ek.original);
      return this.calculateBasicKeywordBoost(text, originalKeywords);
    }
  }

  /**
   * Fallback basic keyword boost (for error cases)
   */
  private calculateBasicKeywordBoost(text: string, keywords: string[]): number {
    const lowerText = text.toLowerCase();
    const boostPerKeyword = 0.15;
    let totalBoost = 0;

    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`);
      if (regex.test(lowerText)) {
        totalBoost += boostPerKeyword;
      }
    }
    
    return Math.min(totalBoost, 0.3);
  }

  /**
   * Find best semantic match in a corpus using pre-expanded keywords
   * Filters data for bibliomancy: excludes proems/appendices, includes single-sentence parts,
   * and for multi-sentence parts only includes sentences <= 6 lines
   */
  private async findBestMatch(
    corpusName: string, 
    queryEmbedding: number[], 
    enhancedKeywords: EnhancedKeywordData[]
  ): Promise<{ unit: SentenceUnit; score: number; corpus: string }> {
    
    const embeddingData = await this.loadSentenceEmbeddings(corpusName);
    let bestMatch = null;
    let bestScore = -1;

    // Create embedding ID to sentence data lookup from corpus
    const embeddingIdToSentence: Map<string, any> = new Map();
    for (const part of embeddingData.corpusData.parts) {
      // Bibliomancy Filter 1: Exclude proems and appendices (only if part_type is defined)
      if (part.part_type && (part.part_type === 'proem' || part.part_type === 'appendix')) {
        continue;
      }
      
      for (const sentence of part.sentences) {
        // Handle parts that might not have all metadata
        const sentenceCount = part.sentence_count || (part.sentences ? part.sentences.length : 0);
        const lineCount = sentence.line_count || (sentence.line_details ? sentence.line_details.length : 1);
        
        // Bibliomancy Filter 2: For multi-sentence parts, only include sentences <= 6 lines
        // (single-sentence parts are always included regardless of line count)
        if (sentenceCount > 1 && lineCount > 6) {
          continue;
        }
        
        // Construct embedding ID: corpus_part_sentence format (e.g., "hymns_0_1")
        const embeddingId = `${corpusName}_${part.part_number}_${sentence.sentence_id}`;
        embeddingIdToSentence.set(embeddingId, {
          ...sentence,
          part_number: part.part_number,
          part_title: part.part_title,
          incense: part.incense,
          incense_greek: part.incense_greek
        });
      }
    }

    // Iterate through embeddings using metadata mapping
    for (const mapping of embeddingData.metadata.mapping) {
      const embeddingIndex = mapping.index;
      const embeddingId = mapping.id;
      
      const embedding = embeddingData.embeddings[embeddingIndex];
      const sentenceData = embeddingIdToSentence.get(embeddingId);
      
      if (!embedding || !sentenceData) {
        continue;
      }

      const text = sentenceData.text.english;

      // Calculate semantic similarity
      const semanticSimilarity = embeddingService.calculateCosineSimilarity(
        queryEmbedding, 
        embedding
      );

      // Apply enhanced keyword boost using pre-expanded keywords
      const keywordBoost = this.calculateEnhancedKeywordBoost(text, enhancedKeywords);
      
      // Combined score (semantic gets 70% weight, keywords get 30% weight)
      const finalScore = (semanticSimilarity * 0.7) + Math.min(keywordBoost, 0.3);

      if (finalScore > bestScore) {
        bestScore = finalScore;
        bestMatch = { 
          id: sentenceData.sentence_id, 
          text, 
          embedding,
          sentenceData // Include full sentence data for later use
        };
      }
    }

    if (!bestMatch) {
      throw new Error(`No valid sentences found in ${corpusName}`);
    }

    return {
      unit: bestMatch,
      score: bestScore,
      corpus: corpusName
    };
  }



  /**
   * Find the best line within a passage using line-level embeddings
   */
  private async findBestLineInPassage(
    sentenceData: { 
      lineDetails: LineDetail[]; 
      sectionTitle: string; 
      partNumber: number; 
      sentenceId: number;
      corpusName: string;
    },
    queryEmbedding: number[],
    enhancedKeywords: EnhancedKeywordData[]
  ): Promise<{ lineNumber: number; score: number; text: string } | undefined> {
    
    let bestLine = null;
    let bestScore = -1;

    for (const lineDetail of sentenceData.lineDetails) {
      try {
        // Construct proper line ID: corpus_part_sentence_line
        const lineId = `${sentenceData.corpusName}_${sentenceData.partNumber}_${sentenceData.sentenceId}_${lineDetail.line}`;
        
        // Get line embedding from embedding service
        const lineEmbedding = await embeddingService.getLineEmbedding(sentenceData.corpusName, lineId);
        if (!lineEmbedding) continue;

        // Calculate semantic similarity
        const semanticSimilarity = embeddingService.calculateCosineSimilarity(
          queryEmbedding, 
          lineEmbedding
        );

        // Apply enhanced keyword boost using pre-expanded keywords
        const keywordBoost = this.calculateEnhancedKeywordBoost(lineDetail.english, enhancedKeywords);
        
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
        console.warn(`Error scoring line ${lineDetail.line} in ${sentenceData.corpusName}:`, error);
      }
    }

    return bestLine || undefined;
  }

  /**
   * Find the overall best line across all selected passages
   */
  private findOverallBestLine(
    corpusBestLines: Array<{
      corpus: 'hymns' | 'argonautica' | 'lithica';
      bestLine?: { lineNumber: number; score: number; text: string };
    }>
  ): { corpus: 'hymns' | 'argonautica' | 'lithica'; lineNumber: number; score: number; text: string } | undefined {
    let overallBest: { corpus: 'hymns' | 'argonautica' | 'lithica'; lineNumber: number; score: number; text: string } | undefined;
    let highestScore = -1;

    for (const item of corpusBestLines) {
      if (item.bestLine && item.bestLine.score > highestScore) {
        highestScore = item.bestLine.score;
        overallBest = {
          corpus: item.corpus,
          lineNumber: item.bestLine.lineNumber,
          score: item.bestLine.score,
          text: item.bestLine.text
        };
      }
    }

    if (overallBest) {
      console.log(`🏆 Overall best line: ${overallBest.corpus} line ${overallBest.lineNumber} (${(overallBest.score * 100).toFixed(1)}%)`);
    }

    return overallBest;
  }

  /**
   * Generate complete counsel response using semantic search
   */
  async generateCounselResponse(query: string): Promise<CounselResponse> {
    console.log('🧠 Generating counsel response for:', query);
    
    // Clear caches to ensure fresh results with new filters
    this.clearCounselCache();
    this.corpusDataCache.clear();

    try {
      // Get query embedding
      const queryEmbedding = await embeddingService.getQueryEmbedding(query);
      
      // Extract keywords
      const keywords = this.extractKeywords(query);
      
      // Expand keywords with synonyms ONCE for the entire response
      const enhancedKeywords = await synonymExpansionService.expandKeywords(
        keywords,
        3, // Max 3 synonyms per term
        0.15, // Original keyword weight 
        0.05  // Synonym weight
      );
      
      // Find best matches in all three corpora using pre-expanded keywords
      const [hymnsMatch, argonauticaMatch, lithicaMatch] = await Promise.all([
        this.findBestMatch('hymns', queryEmbedding, enhancedKeywords),
        this.findBestMatch('argonautica', queryEmbedding, enhancedKeywords),
        this.findBestMatch('lithica', queryEmbedding, enhancedKeywords)
      ]);

      // The full sentence data including title and line details is already in the match object.
      const hymnsDetails = {
        lineDetails: hymnsMatch.unit.sentenceData.line_details || [],
        sectionTitle: hymnsMatch.unit.sentenceData.part_title || 'Unknown Section',
        partNumber: hymnsMatch.unit.sentenceData.part_number,
        sentenceId: hymnsMatch.unit.id,
        corpusName: 'hymns',
        incense: hymnsMatch.unit.sentenceData.incense,
        incenseGreek: hymnsMatch.unit.sentenceData.incense_greek
      };
      const argonauticaDetails = {
        lineDetails: argonauticaMatch.unit.sentenceData.line_details || [],
        sectionTitle: argonauticaMatch.unit.sentenceData.part_title || 'Unknown Section',
        partNumber: argonauticaMatch.unit.sentenceData.part_number,
        sentenceId: argonauticaMatch.unit.id,
        corpusName: 'argonautica'
      };
      const lithicaDetails = {
        lineDetails: lithicaMatch.unit.sentenceData.line_details || [],
        sectionTitle: lithicaMatch.unit.sentenceData.part_title || 'Unknown Section',
        partNumber: lithicaMatch.unit.sentenceData.part_number,
        sentenceId: lithicaMatch.unit.id,
        corpusName: 'lithica'
      };

      // Get total sentence counts
      const [hymnsData, argonauticaData, lithicaData] = await Promise.all([
        this.loadSentenceEmbeddings('hymns'),
        this.loadSentenceEmbeddings('argonautica'),
        this.loadSentenceEmbeddings('lithica')
      ]);

      // Use the same enhanced keywords for line analysis (already expanded above)
      // Find best lines within each selected passage
      const [hymnsBestLine, argonauticaBestLine, lithicaBestLine] = await Promise.all([
        this.findBestLineInPassage(hymnsDetails, queryEmbedding, enhancedKeywords),
        this.findBestLineInPassage(argonauticaDetails, queryEmbedding, enhancedKeywords),
        this.findBestLineInPassage(lithicaDetails, queryEmbedding, enhancedKeywords)
      ]);

      // Determine overall best line across all sections
      const overallBestLine = this.findOverallBestLine([
        { corpus: 'hymns' as const, bestLine: hymnsBestLine },
        { corpus: 'argonautica' as const, bestLine: argonauticaBestLine },
        { corpus: 'lithica' as const, bestLine: lithicaBestLine }
      ]);

      // Generate all shareable options for the share dialog carousel
      const shareableOptions = await semanticLineRanker.generateAllShareableOptions([
        {
          corpus: 'hymns',
          sentenceId: hymnsMatch.unit.id,
          text: hymnsMatch.unit.text,
          lineDetails: hymnsDetails.lineDetails,
          sectionTitle: hymnsDetails.sectionTitle,
          bestLine: hymnsBestLine,
          incense: hymnsDetails.incense ? {
            english: hymnsDetails.incense,
            greek: hymnsDetails.incenseGreek
          } : undefined
        },
        {
          corpus: 'argonautica',
          sentenceId: argonauticaMatch.unit.id,
          text: argonauticaMatch.unit.text,
          lineDetails: argonauticaDetails.lineDetails,
          sectionTitle: argonauticaDetails.sectionTitle,
          bestLine: argonauticaBestLine
        },
        {
          corpus: 'lithica',
          sentenceId: lithicaMatch.unit.id,
          text: lithicaMatch.unit.text,
          lineDetails: lithicaDetails.lineDetails,
          sectionTitle: lithicaDetails.sectionTitle,
          bestLine: lithicaBestLine
        }
      ], queryEmbedding, keywords);

      // Build counsel response
      const response: CounselResponse = {
        timestamp: Date.now(),
        query,
        searchSource: 'semantic',
        keywords,
        shareableOptions,
        overallBestLine,
        selections: {
          hymns: {
            source: 'Hymns',
            sentenceId: hymnsMatch.unit.id,
            text: { english: hymnsMatch.unit.text },
            sectionTitle: hymnsDetails.sectionTitle,
            lineDetails: hymnsDetails.lineDetails,
            semanticScore: hymnsMatch.score,
            totalSentences: hymnsData.metadata.total_sentences,
            bestLine: hymnsBestLine,
            partNumber: hymnsDetails.partNumber,
            incense: hymnsDetails.incense ? {
              english: hymnsDetails.incense,
              greek: hymnsDetails.incenseGreek
            } : undefined
          },
          argonautica: {
            source: 'Argonautica',
            sentenceId: argonauticaMatch.unit.id,
            text: { english: argonauticaMatch.unit.text },
            sectionTitle: argonauticaDetails.sectionTitle,
            lineDetails: argonauticaDetails.lineDetails,
            semanticScore: argonauticaMatch.score,
            totalSentences: argonauticaData.metadata.total_sentences,
            bestLine: argonauticaBestLine
          },
          lithica: {
            source: 'Lithica',
            sentenceId: lithicaMatch.unit.id,
            text: { english: lithicaMatch.unit.text },
            sectionTitle: lithicaDetails.sectionTitle,
            lineDetails: lithicaDetails.lineDetails,
            semanticScore: lithicaMatch.score,
            totalSentences: lithicaData.metadata.total_sentences,
            bestLine: lithicaBestLine
          }
        }
      };

      console.log('✨ Counsel response generated with scores:', {
        hymns: hymnsMatch.score.toFixed(3),
        argonautica: argonauticaMatch.score.toFixed(3),
        lithica: lithicaMatch.score.toFixed(3)
      });

      return response;

    } catch (error) {
      console.error('❌ Error generating counsel response:', error);
      throw error;
    }
  }

  /**
   * Cache counsel response for corpus page display
   */
  cacheCounselResponse(response: CounselResponse): void {
    const cacheKey = `counsel_response_${response.timestamp}`;
    const cacheData = {
      response,
      cached_at: Date.now()
    };
    
    try {
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      
      // Also update the 'latest' cache
      localStorage.setItem('counsel_response_latest', JSON.stringify(cacheData));
      
      console.log('💾 Counsel response cached:', cacheKey);
    } catch (error) {
      console.warn('Failed to cache counsel response:', error);
    }
  }

  /**
   * Get latest cached counsel response
   */
  getLatestCounselResponse(): CounselResponse | null {
    try {
      const cached = localStorage.getItem('counsel_response_latest');
      if (cached) {
        const cacheData = JSON.parse(cached);
        return cacheData.response;
      }
    } catch (error) {
      console.warn('Failed to retrieve cached counsel response:', error);
    }
    
    return null;
  }

  /**
   * Clear counsel response cache
   */
  clearCounselCache(): void {
    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith('counsel_response_')
    );
    
    keys.forEach(key => localStorage.removeItem(key));
    console.log('🗑️ Counsel cache cleared');
  }
}

// Export singleton instance
export const counselService = new ClientCounselService();
