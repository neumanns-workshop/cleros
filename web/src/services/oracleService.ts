/**
 * Client-side Oracle Service
 * Implements pure random selection and oracle response generation
 */

import { OracleResponse } from '../types/oracle';
import { LineDetail } from '../types/corpus';

// OracleResponse and OracleSelection interfaces moved to types/oracle.ts - import from there

export interface CorpusData {
  title: string;
  sections: Section[];
  parts: CorpusPart[]; // Corpus parts structure
}

export interface Section {
  title: string;
  title_english?: string;
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
  line_count?: number;
}

export interface CorpusPart {
  part_number: number;
  part_title: string;
  part_type?: string;
  sentence_count?: number;
  sentences: Sentence[];
  incense?: string;
  incense_greek?: string;
}

// Oracle mode uses pure randomness - no semantic analysis needed

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
      const cached = this.corpusCache.get(corpusName);
      if (cached) {
        return cached;
      }
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
   * Get truly random numbers from random.org JSON-RPC API with authentication
   * Oracle divination requires true randomness or nothing.
   */
  private async getTrueRandomNumbers(min: number[], max: number[]): Promise<number[]> {
    try {
      const apiKey = import.meta.env.VITE_RANDOMORG_API_KEY || import.meta.env.RANDOMORG_API_KEY;
      if (!apiKey) {
        throw new Error('Random.org API key not configured');
      }

      const url = import.meta.env.VITE_RANDOMORG_API_ENDPOINT;
      
      // Create individual requests for each range (JSON-RPC API handles ranges differently)
      const requests = min.map((minVal, i) => ({
        jsonrpc: '2.0',
        method: 'generateIntegers',
        params: {
          apiKey: apiKey,
          n: 1,
          min: minVal,
          max: max[i],
          replacement: true,
          base: 10
        },
        id: i + 1
      }));

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requests[0]) // For simplicity, make one request at a time
      });

      if (!response.ok) {
        throw new Error(`Random.org HTTP error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(`Random.org API error: ${data.error.message}`);
      }

      if (!data.result || !data.result.random || !Array.isArray(data.result.random.data)) {
        throw new Error('Invalid response format from random.org');
      }

      // For multiple ranges, we'd need to make multiple requests
      // For now, let's make sequential requests for each range
      const numbers: number[] = [];
      
      for (let i = 0; i < min.length; i++) {
        const request = {
          jsonrpc: '2.0',
          method: 'generateIntegers',
          params: {
            apiKey: apiKey,
            n: 1,
            min: min[i],
            max: max[i],
            replacement: true,
            base: 10
          },
          id: i + 1
        };

        const resp = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(request)
        });

        if (!resp.ok) {
          throw new Error(`Random.org HTTP error: ${resp.status}`);
        }

        const result = await resp.json();
        
        if (result.error) {
          throw new Error(`Random.org API error: ${result.error.message}`);
        }

        numbers.push(result.result.random.data[0]);
      }
      
      console.log('🎲 TRUE random.org randomness obtained:', numbers);
      return numbers;
      
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
      const apiKey = import.meta.env.VITE_RANDOMORG_API_KEY;
      if (!apiKey) {
        console.warn('Random.org API key not configured - Oracle mode unavailable');
        return false;
      }

      const url = import.meta.env.VITE_RANDOMORG_API_ENDPOINT;
      const request = {
        jsonrpc: '2.0',
        method: 'generateIntegers',
        params: {
          apiKey: apiKey,
          n: 1,
          min: 1,
          max: 100,
          replacement: true,
          base: 10
        },
        id: 1
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return !data.error && data.result && data.result.random;
    } catch {
      return false;
    }
  }

    /**
   * Select random sentences from all three corpora using random.org
   * Filters data for bibliomancy: excludes proems/appendices, includes single-sentence parts,
   * and for multi-sentence parts only includes sentences <= 6 lines
   */
  private async selectRandomSentences(hymnsCorpus: CorpusData, argonauticaCorpus: CorpusData, lithicaCorpus: CorpusData): Promise<{
    hymns: { sentence: Sentence; section: Section; index: number; total: number };
    argonautica: { sentence: Sentence; section: Section; index: number; total: number };
    lithica: { sentence: Sentence; section: Section; index: number; total: number };
  }> {
    // Collect sentences from each corpus with bibliomancy filtering
    const hymnsAllSentences: Array<{ sentence: Sentence; section: Section }> = [];
    const argonauticaAllSentences: Array<{ sentence: Sentence; section: Section }> = [];
    const lithicaAllSentences: Array<{ sentence: Sentence; section: Section }> = [];

    hymnsCorpus.parts.forEach((part: CorpusPart) => {
      // Filter 1: Exclude proems and appendices (only if part_type is defined)
      if (part.part_type && (part.part_type === 'proem' || part.part_type === 'appendix')) {
        return;
      }

      // Handle parts that might not have all metadata (like test data)
      const sentenceCount = part.sentence_count || (part.sentences ? part.sentences.length : 0);

      // Filter 2: If part has only 1 sentence, include it regardless of line count
      if (sentenceCount === 1) {
        part.sentences.forEach((sentence: Sentence) => {
          hymnsAllSentences.push({ 
            sentence, 
            section: { 
              title: part.part_title || 'Unknown Section', 
              type: part.part_type || 'section',
              part_number: part.part_number,
              incense: part.incense,
              incense_greek: part.incense_greek
            }
          });
        });
      } else {
        // Filter 3: For multi-sentence parts, only include sentences <= 6 lines
        part.sentences.forEach((sentence: Sentence) => {
          const lineCount = sentence.line_count || (sentence.line_details ? sentence.line_details.length : 1);
          if (lineCount <= 6) {
            hymnsAllSentences.push({ 
              sentence, 
              section: { 
                title: part.part_title || 'Unknown Section', 
                type: part.part_type || 'section',
                part_number: part.part_number,
                incense: part.incense,
                incense_greek: part.incense_greek
              }
            });
          }
        });
      }
    });

    argonauticaCorpus.parts.forEach((part: CorpusPart) => {
      // Filter 1: Exclude proems and appendices (only if part_type is defined)
      if (part.part_type && (part.part_type === 'proem' || part.part_type === 'appendix')) {
        return;
      }

      // Handle parts that might not have all metadata (like test data)
      const sentenceCount = part.sentence_count || (part.sentences ? part.sentences.length : 0);

      // Filter 2: If part has only 1 sentence, include it regardless of line count
      if (sentenceCount === 1) {
        part.sentences.forEach((sentence: Sentence) => {
          argonauticaAllSentences.push({ sentence, section: { title: part.part_title || 'Unknown Section', type: part.part_type || 'section' } });
        });
      } else {
        // Filter 3: For multi-sentence parts, only include sentences <= 6 lines
        part.sentences.forEach((sentence: Sentence) => {
          const lineCount = sentence.line_count || (sentence.line_details ? sentence.line_details.length : 1);
          if (lineCount <= 6) {
            argonauticaAllSentences.push({ sentence, section: { title: part.part_title || 'Unknown Section', type: part.part_type || 'section' } });
          }
        });
      }
    });

    lithicaCorpus.parts.forEach((part: CorpusPart) => {
      // Filter 1: Exclude proems and appendices (only if part_type is defined)
      if (part.part_type && (part.part_type === 'proem' || part.part_type === 'appendix')) {
        return;
      }

      // Handle parts that might not have all metadata (like test data)
      const sentenceCount = part.sentence_count || (part.sentences ? part.sentences.length : 0);

      // Filter 2: If part has only 1 sentence, include it regardless of line count
      if (sentenceCount === 1) {
        part.sentences.forEach((sentence: Sentence) => {
          lithicaAllSentences.push({ sentence, section: { title: part.part_title || 'Unknown Section', type: part.part_type || 'section' } });
        });
      } else {
        // Filter 3: For multi-sentence parts, only include sentences <= 6 lines
        part.sentences.forEach((sentence: Sentence) => {
          const lineCount = sentence.line_count || (sentence.line_details ? sentence.line_details.length : 1);
          if (lineCount <= 6) {
            lithicaAllSentences.push({ sentence, section: { title: part.part_title || 'Unknown Section', type: part.part_type || 'section' } });
          }
        });
      }
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
      highlightedText = highlightedText.replace(regex, '<span class="keyword-highlight">$&</span>');
    });

    return highlightedText;
  }



  /**
   * Generate complete oracle response using pure randomness
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

      // Create simple shareable options from the 3 random sentences
      const shareableOptions = [
        {
          id: `sentence-hymns-${selections.hymns.sentence.sentence_id}`,
          type: 'sentence' as const,
          corpus: 'hymns' as const,
          score: 1, // All options equal in Oracle mode (pure random)
          content: {
            text: selections.hymns.sentence.text.english,
            sectionTitle: selections.hymns.section.title_english || selections.hymns.section.title,
            greek: selections.hymns.sentence.text.greek,
            source: 'Orphic Hymns',
            incense: selections.hymns.section.incense ? {
              english: selections.hymns.section.incense,
              greek: selections.hymns.section.incense_greek
            } : undefined
          }
        },
        {
          id: `sentence-argonautica-${selections.argonautica.sentence.sentence_id}`,
          type: 'sentence' as const,
          corpus: 'argonautica' as const,
          score: 1,
          content: {
            text: selections.argonautica.sentence.text.english,
            sectionTitle: selections.argonautica.section.title_english || selections.argonautica.section.title,
            greek: selections.argonautica.sentence.text.greek,
            source: 'Orphic Argonautica'
          }
        },
        {
          id: `sentence-lithica-${selections.lithica.sentence.sentence_id}`,
          type: 'sentence' as const,
          corpus: 'lithica' as const,
          score: 1,
          content: {
            text: selections.lithica.sentence.text.english,
            sectionTitle: selections.lithica.section.title_english || selections.lithica.section.title,
            greek: selections.lithica.sentence.text.greek,
            source: 'Orphic Lithica'
          }
        }
      ];

      // Build oracle response - pure randomness, no semantic analysis
      const response: OracleResponse = {
        timestamp: Date.now(),
        query,
        randomSource: 'random.org',
        keywords,
        shareableOptions,
        selections: {
          hymns: {
            source: 'Hymns',
            sentenceId: selections.hymns.sentence.sentence_id,
            text: selections.hymns.sentence.text,
            sectionTitle: selections.hymns.section.title_english || selections.hymns.section.title,
            lineDetails: selections.hymns.sentence.line_details,
            randomIndex: selections.hymns.index,
            totalSentences: selections.hymns.total,
            partNumber: selections.hymns.section.part_number || 0,
            incense: selections.hymns.section.incense ? {
              english: selections.hymns.section.incense,
              greek: selections.hymns.section.incense_greek
            } : undefined
          },
          argonautica: {
            source: 'Argonautica',
            sentenceId: selections.argonautica.sentence.sentence_id,
            text: selections.argonautica.sentence.text,
            sectionTitle: selections.argonautica.section.title_english || selections.argonautica.section.title,
            lineDetails: selections.argonautica.sentence.line_details,
            randomIndex: selections.argonautica.index,
            totalSentences: selections.argonautica.total
          },
          lithica: {
            source: 'Lithica',
            sentenceId: selections.lithica.sentence.sentence_id,
            text: selections.lithica.sentence.text,
            sectionTitle: selections.lithica.section.title_english || selections.lithica.section.title,
            lineDetails: selections.lithica.sentence.line_details,
            randomIndex: selections.lithica.index,
            totalSentences: selections.lithica.total
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
