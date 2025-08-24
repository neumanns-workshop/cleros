/**
 * Client-side Oracle Service
 * Implements pure random selection and oracle response generation
 */

import { OracleResponse } from '../types/oracle';

// OracleResponse and OracleSelection interfaces moved to types/oracle.ts - import from there

export interface LineDetail {
  line: number;
  english: string;
  greek?: string;
  note?: string;
}

export interface CorpusData {
  title: string;
  sections: Section[];
  parts: any[]; // Corpus parts structure
}

export interface Section {
  title: string;
  type: string;
  part_number?: number;
  sentences?: Sentence[];
  incense?: string;
  incense_greek?: string;
}

export interface Sentence {
  sentence_id: number;
  text: {
    english: string;
    greek?: string;
  };
  line_details: LineDetail[];
}

import { semanticLineRanker } from './semanticLineRanker';
import { embeddingService } from './embeddingService';

class ClientOracleService {
  private corpusCache: Map<string, CorpusData> = new Map();
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
   * Load corpus data from public JSON files
   */
  async loadCorpusData(corpusName: string): Promise<CorpusData> {
    if (this.corpusCache.has(corpusName)) {
      return this.corpusCache.get(corpusName)!;
    }

    const fileMap = {
      'hymns': '/corpus_20250822_121628/hymns.json',
      'argonautica': '/corpus_20250822_121628/argonautica.json', 
      'lithica': '/corpus_20250822_121628/lithica.json'
    };

    const filename = fileMap[corpusName as keyof typeof fileMap];
    if (!filename) {
      throw new Error(`Unknown corpus: ${corpusName}`);
    }

    try {
      const response = await fetch(filename);
      if (!response.ok) {
        throw new Error(`Failed to load ${filename}: ${response.status}`);
      }
      
      const data: CorpusData = await response.json();
      this.corpusCache.set(corpusName, data);
      return data;
    } catch (error) {
      console.error(`Error loading corpus ${corpusName}:`, error);
      throw error;
    }
  }

  /**
   * Get truly random numbers from random.org API - NO FALLBACKS
   * Oracle divination requires true randomness or nothing.
   */
  private async getTrueRandomNumbers(min: number[], max: number[]): Promise<number[]> {
    try {
      const url = 'https://www.random.org/integers/';
      const params = new URLSearchParams({
        'num': min.length.toString(),
        'min': Math.min(...min).toString(),
        'max': Math.max(...max).toString(),
        'col': '1',
        'base': '10',
        'format': 'plain',
        'rnd': 'new'
      });

      const response = await fetch(`${url}?${params}`);
      if (!response.ok) {
        throw new Error(`Random.org HTTP error: ${response.status}`);
      }
      
      const text = await response.text();
      const numbers = text.trim().split('\n').map(num => parseInt(num.trim()));
      
      if (numbers.length !== min.length || numbers.some(n => isNaN(n))) {
        throw new Error('Invalid response format from random.org');
      }

      // Scale numbers to the specific ranges needed
      const scaledNumbers = numbers.map((num, i) => {
        const range = max[i] - min[i] + 1;
        return min[i] + (num % range);
      });
      
      console.log('🎲 TRUE random.org randomness obtained:', scaledNumbers);
      return scaledNumbers;
      
    } catch (error) {
      console.error('❌ Random.org failed - Oracle mode unavailable:', error);
      throw new Error('True randomness unavailable - Oracle cannot function');
    }
  }

  /**
   * Check if random.org is available for oracle divination
   */
  async checkRandomOrgAvailability(): Promise<boolean> {
    try {
      const response = await fetch('https://www.random.org/integers/?num=1&min=1&max=100&col=1&base=10&format=plain&rnd=new');
      return response.ok;
    } catch {
      return false;
    }
  }

    /**
   * Select random sentences from all three corpora using random.org
   */
  private async selectRandomSentences(hymnsCorpus: CorpusData, argonauticaCorpus: CorpusData, lithicaCorpus: CorpusData): Promise<{
    hymns: { sentence: Sentence; section: Section; index: number; total: number };
    argonautica: { sentence: Sentence; section: Section; index: number; total: number };
    lithica: { sentence: Sentence; section: Section; index: number; total: number };
  }> {
    // Collect all sentences from each corpus - oracle mode includes everything including proem and appendix
    const hymnsAllSentences: Array<{ sentence: Sentence; section: Section }> = [];
    const argonauticaAllSentences: Array<{ sentence: Sentence; section: Section }> = [];
    const lithicaAllSentences: Array<{ sentence: Sentence; section: Section }> = [];

    hymnsCorpus.parts.forEach((part: any) => {
      // Oracle mode includes ALL parts including proem (0), cosmogonic hymn (1), and appendix (88)
      part.sentences.forEach((sentence: any) => {
        hymnsAllSentences.push({ 
          sentence, 
          section: { 
            title: part.part_title, 
            type: part.part_type,
            part_number: part.part_number,
            incense: part.incense,
            incense_greek: part.incense_greek
          }
        });
      });
    });

    argonauticaCorpus.parts.forEach((part: any) => {
      part.sentences.forEach((sentence: any) => {
        argonauticaAllSentences.push({ sentence, section: { title: part.part_title, type: part.part_type } });
      });
    });

    lithicaCorpus.parts.forEach((part: any) => {
      part.sentences.forEach((sentence: any) => {
        lithicaAllSentences.push({ sentence, section: { title: part.part_title, type: part.part_type } });
      });
    });

    if (hymnsAllSentences.length === 0 || argonauticaAllSentences.length === 0 || lithicaAllSentences.length === 0) {
      throw new Error('No sentences found in one or more corpora');
    }

    // Get random indices using TRUE random.org - no fallbacks
    const randomIndices = await this.getTrueRandomNumbers(
      [0, 0, 0],
      [hymnsAllSentences.length - 1, argonauticaAllSentences.length - 1, lithicaAllSentences.length - 1]
    );
    
    const [hymnsIndex, argonauticaIndex, lithicaIndex] = randomIndices;
    
    return {
      hymns: {
        sentence: hymnsAllSentences[hymnsIndex].sentence,
        section: hymnsAllSentences[hymnsIndex].section,
        index: hymnsIndex,
        total: hymnsAllSentences.length
      },
      argonautica: {
        sentence: argonauticaAllSentences[argonauticaIndex].sentence,
        section: argonauticaAllSentences[argonauticaIndex].section,
        index: argonauticaIndex,
        total: argonauticaAllSentences.length
      },
      lithica: {
        sentence: lithicaAllSentences[lithicaIndex].sentence,
        section: lithicaAllSentences[lithicaIndex].section,
        index: lithicaIndex,
        total: lithicaAllSentences.length
      }
    };
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
   * Highlight keywords in text
   */
  highlightKeywords(text: string, keywords: string[]): string {
    if (keywords.length === 0) return text;

    let highlightedText = text;
    
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      highlightedText = highlightedText.replace(regex, `<span class="keyword-highlight">$&</span>`);
    });

    return highlightedText;
  }



  /**
   * Generate complete oracle response
   */
  async generateOracleResponse(query: string): Promise<OracleResponse> {
    console.log('🔮 Generating oracle response for:', query);

    try {
      // Load all three corpora
      const [hymnsData, argonauticaData, lithicaData] = await Promise.all([
        this.loadCorpusData('hymns'),
        this.loadCorpusData('argonautica'),
        this.loadCorpusData('lithica')
      ]);

      // Select random sentences from all corpora using random.org
      const selections = await this.selectRandomSentences(hymnsData, argonauticaData, lithicaData);

      // Extract keywords for display purposes only (no semantic analysis)
      const keywords = this.extractKeywords(query);

      // SEMANTIC LINE RANKING - Add post-processing to find best lines within randomly selected passages
      // Get query embedding for semantic analysis
      const queryEmbedding = await embeddingService.getQueryEmbedding(query);
      
      // Find best line in each randomly selected passage
      const [hymnsBestLine, argonauticaBestLine, lithicaBestLine] = await Promise.all([
        semanticLineRanker.findBestLineInPassage({
          lineDetails: selections.hymns.sentence.line_details,
          sectionTitle: (selections.hymns.section as any).title_english || selections.hymns.section.title,
          partNumber: selections.hymns.section.part_number || 0,
          sentenceId: selections.hymns.sentence.sentence_id,
          corpusName: 'hymns'
        }, queryEmbedding, undefined, keywords),
        
        semanticLineRanker.findBestLineInPassage({
          lineDetails: selections.argonautica.sentence.line_details,
          sectionTitle: (selections.argonautica.section as any).title_english || selections.argonautica.section.title,
          partNumber: selections.argonautica.section.part_number || 0,
          sentenceId: selections.argonautica.sentence.sentence_id,
          corpusName: 'argonautica'
        }, queryEmbedding, undefined, keywords),
        
        semanticLineRanker.findBestLineInPassage({
          lineDetails: selections.lithica.sentence.line_details,
          sectionTitle: (selections.lithica.section as any).title_english || selections.lithica.section.title,
          partNumber: selections.lithica.section.part_number || 0,
          sentenceId: selections.lithica.sentence.sentence_id,
          corpusName: 'lithica'
        }, queryEmbedding, undefined, keywords)
      ]);

      // Find overall best line across all selections for shareable card default
      const overallBestLine = semanticLineRanker.findOverallBestLine([
        { corpus: 'hymns' as const, bestLine: hymnsBestLine },
        { corpus: 'argonautica' as const, bestLine: argonauticaBestLine },
        { corpus: 'lithica' as const, bestLine: lithicaBestLine }
      ]);

      // Generate all shareable options for the share dialog carousel
      const shareableOptions = await semanticLineRanker.generateAllShareableOptions([
        {
          corpus: 'hymns',
          sentenceId: selections.hymns.sentence.sentence_id,
          text: selections.hymns.sentence.text.english,
          lineDetails: selections.hymns.sentence.line_details,
          sectionTitle: (selections.hymns.section as any).title_english || selections.hymns.section.title,
          bestLine: hymnsBestLine,
          incense: selections.hymns.section.incense ? {
            english: selections.hymns.section.incense,
            greek: selections.hymns.section.incense_greek
          } : undefined
        },
        {
          corpus: 'argonautica',
          sentenceId: selections.argonautica.sentence.sentence_id,
          text: selections.argonautica.sentence.text.english,
          lineDetails: selections.argonautica.sentence.line_details,
          sectionTitle: (selections.argonautica.section as any).title_english || selections.argonautica.section.title,
          bestLine: argonauticaBestLine
        },
        {
          corpus: 'lithica',
          sentenceId: selections.lithica.sentence.sentence_id,
          text: selections.lithica.sentence.text.english,
          lineDetails: selections.lithica.sentence.line_details,
          sectionTitle: (selections.lithica.section as any).title_english || selections.lithica.section.title,
          bestLine: lithicaBestLine
        }
      ], queryEmbedding, keywords);

      // Build oracle response - only possible with true random.org
      const response: OracleResponse = {
        timestamp: Date.now(),
        query,
        randomSource: 'random.org',
        keywords,
        shareableOptions,
        overallBestLine,
        selections: {
          hymns: {
            source: 'Hymns',
            sentenceId: selections.hymns.sentence.sentence_id,
            text: selections.hymns.sentence.text,
            sectionTitle: (selections.hymns.section as any).title_english || selections.hymns.section.title,
            lineDetails: selections.hymns.sentence.line_details,
            randomIndex: selections.hymns.index,
            totalSentences: selections.hymns.total,
            partNumber: selections.hymns.section.part_number || 0,
            bestLine: hymnsBestLine,
            incense: selections.hymns.section.incense ? {
              english: selections.hymns.section.incense,
              greek: selections.hymns.section.incense_greek
            } : undefined
          },
          argonautica: {
            source: 'Argonautica',
            sentenceId: selections.argonautica.sentence.sentence_id,
            text: selections.argonautica.sentence.text,
            sectionTitle: (selections.argonautica.section as any).title_english || selections.argonautica.section.title,
            lineDetails: selections.argonautica.sentence.line_details,
            randomIndex: selections.argonautica.index,
            totalSentences: selections.argonautica.total,
            bestLine: argonauticaBestLine
          },
          lithica: {
            source: 'Lithica',
            sentenceId: selections.lithica.sentence.sentence_id,
            text: selections.lithica.sentence.text,
            sectionTitle: (selections.lithica.section as any).title_english || selections.lithica.section.title,
            lineDetails: selections.lithica.sentence.line_details,
            randomIndex: selections.lithica.index,
            totalSentences: selections.lithica.total,
            bestLine: lithicaBestLine
          }
        }
      };

      console.log('✨ Oracle response generated:', response);
      return response;

    } catch (error) {
      console.error('❌ Error generating oracle response:', error);
      throw error;
    }
  }

  /**
   * Cache oracle response for corpus page display
   */
  cacheOracleResponse(response: OracleResponse): void {
    const cacheKey = `oracle_response_${response.timestamp}`;
    const cacheData = {
      response,
      cached_at: Date.now()
    };
    
    try {
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      
      // Also update the 'latest' cache
      localStorage.setItem('oracle_response_latest', JSON.stringify(cacheData));
      
      console.log('💾 Oracle response cached:', cacheKey);
    } catch (error) {
      console.warn('Failed to cache oracle response:', error);
    }
  }

  /**
   * Get latest cached oracle response
   */
  getLatestOracleResponse(): OracleResponse | null {
    try {
      const cached = localStorage.getItem('oracle_response_latest');
      if (cached) {
        const cacheData = JSON.parse(cached);
        return cacheData.response;
      }
    } catch (error) {
      console.warn('Failed to retrieve cached oracle response:', error);
    }
    
    return null;
  }

  /**
   * Clear oracle response cache
   */
  clearOracleCache(): void {
    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith('oracle_response_')
    );
    
    keys.forEach(key => localStorage.removeItem(key));
    console.log('🗑️ Oracle cache cleared');
  }
}

// Export singleton instance
export const oracleService = new ClientOracleService();
