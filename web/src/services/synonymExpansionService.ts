/**
 * Synonym Expansion Service
 * Combines ML semantics with curated semantics using WordNet via wordpos
 */

// @ts-expect-error - wordpos types not available
import WordPOS from 'wordpos';

export interface EnhancedKeywordData {
  original: string;
  synonyms: string[];
  originalWeight: number;
  synonymWeight: number;
}

class SynonymExpansionService {
  private wordpos: WordPOS | null = null;
  private isInitializing: boolean = false;
  private initializationPromise: Promise<void> | null = null;
  private synonymCache: Map<string, string[]> = new Map();

  constructor() {
    this.initializeWordNet();
  }

  private async initializeWordNet(): Promise<void> {
    if (this.wordpos || this.isInitializing) {
      if (this.initializationPromise) {
        return this.initializationPromise;
      }
    }
    
    this.isInitializing = true;
    this.initializationPromise = new Promise((resolve) => {
      try {
        console.log('📚 Initializing WordNet via wordpos...');
        this.wordpos = new WordPOS();
        console.log('📚 WordNet initialized successfully.');
        resolve();
      } catch (error) {
        console.error('Failed to initialize WordNet:', error);
        // Fallback to a mock implementation
        console.warn('Falling back to limited synonym dictionary...');
        this.wordpos = null;
        resolve();
      } finally {
        this.isInitializing = false;
      }
    });
    
    return this.initializationPromise;
  }

  private async getWordNetSynonyms(word: string, limit: number = 3): Promise<string[]> {
    const cacheKey = `${word}_${limit}`;
    
    if (this.synonymCache.has(cacheKey)) {
      const cached = this.synonymCache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Always use fallback synonyms due to browser compatibility issues with WordPos
    const fallbackSynonyms = this.getFallbackSynonyms(word, limit);
    this.synonymCache.set(cacheKey, fallbackSynonyms);
    return fallbackSynonyms;
  }

  private getFallbackSynonyms(word: string, limit: number = 3): string[] {
    // Curated synonym dictionary for ancient religious/oracle contexts
    const synonymDict: { [key: string]: string[] } = {
      'health': ['wellness', 'healing', 'vitality'],
      'safety': ['protection', 'security', 'refuge'],
      'wisdom': ['knowledge', 'insight', 'understanding'],
      'guidance': ['direction', 'counsel', 'instruction'],
      'divine': ['sacred', 'holy', 'celestial'],
      'prosper': ['flourish', 'succeed', 'thrive'],
      'pray': ['beseech', 'implore', 'entreat'],
      'sacrifice': ['offering', 'oblation', 'dedication'],
      'journey': ['voyage', 'expedition', 'travel'],
      'lawsuit': ['litigation', 'dispute', 'case'],
      'marriage': ['wedding', 'union', 'matrimony'],
      'business': ['commerce', 'trade', 'enterprise'],
      'body': ['flesh', 'form', 'physique'],
      'child': ['offspring', 'progeny', 'descendant'],
      'wife': ['spouse', 'consort', 'partner'],
      'household': ['family', 'home', 'dwelling'],
      'gods': ['deities', 'divinities', 'immortals'],
      'anger': ['wrath', 'fury', 'rage'],
      'treatment': ['therapy', 'care', 'remedy'],
      'advantage': ['benefit', 'gain', 'profit'],
      'purchase': ['buy', 'acquire', 'obtain'],
      'inheritance': ['legacy', 'bequest', 'patrimony'],
      'claims': ['demands', 'rights', 'assertions'],
      'fertility': ['fecundity', 'fruitfulness', 'productivity'],
      'consult': ['advise', 'counsel', 'deliberate'],
      'physician': ['doctor', 'healer', 'medic'],
      'eyes': ['sight', 'vision', 'gaze'],
      'expedient': ['advisable', 'prudent', 'wise'],
      'win': ['succeed', 'triumph', 'prevail'],
      'love': ['affection', 'devotion', 'attachment'],
      'peace': ['tranquility', 'harmony', 'serenity'],
      'war': ['conflict', 'battle', 'strife'],
      'power': ['strength', 'might', 'force'],
      'death': ['demise', 'passing', 'mortality'],
      'life': ['existence', 'being', 'vitality'],
      'soul': ['spirit', 'essence', 'psyche'],
      'light': ['illumination', 'radiance', 'brightness'],
      'darkness': ['shadow', 'obscurity', 'gloom'],
      'fire': ['flame', 'blaze', 'conflagration'],
      'water': ['liquid', 'fluid', 'moisture'],
      'earth': ['soil', 'ground', 'terra'],
      'air': ['atmosphere', 'breath', 'wind'],
      'truth': ['reality', 'verity', 'fact'],
      'justice': ['fairness', 'righteousness', 'equity'],
      'beauty': ['loveliness', 'elegance', 'grace'],
      'virtue': ['goodness', 'righteousness', 'morality'],
      'honor': ['respect', 'dignity', 'esteem'],
      'glory': ['renown', 'fame', 'magnificence'],
      'temple': ['shrine', 'sanctuary', 'sacred-place'],
      'altar': ['shrine', 'sacred-table', 'offering-place'],
      'priest': ['cleric', 'minister', 'sacred-servant'],
      'ritual': ['ceremony', 'rite', 'observance'],
      'blessing': ['benediction', 'favor', 'grace'],
      'curse': ['malediction', 'hex', 'bane'],
      'fate': ['destiny', 'fortune', 'lot'],
      'oracle': ['prophecy', 'divination', 'revelation'],
      'mystery': ['secret', 'enigma', 'arcanum'],
      'sacred': ['holy', 'divine', 'blessed'],
      'pure': ['clean', 'untainted', 'holy'],
      'evil': ['wicked', 'malevolent', 'sinful'],
      'good': ['virtuous', 'righteous', 'beneficial']
    };

    const synonyms = synonymDict[word.toLowerCase()] || [];
    return synonyms.slice(0, limit);
  }

  public async getTopSynonyms(word: string, limit: number = 3): Promise<string[]> {
    await this.initializeWordNet();
    return this.getWordNetSynonyms(word, limit);
  }

  public async expandKeywords(
    keywords: string[],
    maxSynonymsPerTerm: number,
    originalWeight: number,
    synonymWeight: number
  ): Promise<EnhancedKeywordData[]> {
    const expansions: EnhancedKeywordData[] = [];
    console.log(`🔍 Expanding ${keywords.length} keywords with synonyms...`);
    
    for (const keyword of keywords) {
      const synonyms = await this.getTopSynonyms(keyword, maxSynonymsPerTerm);
      if (synonyms.length > 0) {
        console.log(`📚 "${keyword}" → [${synonyms.join(', ')}]`);
      }
      
      expansions.push({
        original: keyword,
        synonyms: synonyms,
        originalWeight: originalWeight,
        synonymWeight: synonymWeight
      });
    }
    
    console.log(`✨ Expanded to ${expansions.reduce((sum, exp) => sum + 1 + exp.synonyms.length, 0)} total search terms`);
    return expansions;
  }

  public calculateEnhancedKeywordBoost(text: string | { english: string }, expansions: EnhancedKeywordData[]): number {
    let totalBoost = 0;
    
    // Robust text validation and handling
    if (!text) {
      return 0;
    }
    
    // Handle cases where text might be an object with english property
    let textToProcess: string;
    if (typeof text === 'string') {
      textToProcess = text;
    } else if (typeof text === 'object' && text !== null && 'english' in text) {
      textToProcess = text.english;
    } else {
      console.warn('Invalid text type for keyword boost:', typeof text, text);
      return 0;
    }
    
    if (typeof textToProcess !== 'string') {
      return 0;
    }
    
    const lowerText = textToProcess.toLowerCase();
    const maxTotalBoost = 0.3; // Cap total keyword boost
    
    for (const expansion of expansions) {
      try {
        // Original keyword = full weight
        const originalRegex = new RegExp(`\\b${this.escapeRegex(expansion.original)}\\b`, 'i');
        if (originalRegex.test(lowerText)) {
          totalBoost += expansion.originalWeight;
        }
        
        // Synonyms = reduced weight
        for (const synonym of expansion.synonyms) {
          const synonymRegex = new RegExp(`\\b${this.escapeRegex(synonym)}\\b`, 'i');
          if (synonymRegex.test(lowerText)) {
            totalBoost += expansion.synonymWeight;
          }
        }
      } catch (error) {
        console.warn(`Error processing keyword expansion for "${expansion.original}":`, error);
      }
    }
    
    return Math.min(totalBoost, maxTotalBoost);
  }

  private escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Clear synonym cache (for testing or memory management)
   */
  public clearCache(): void {
    this.synonymCache.clear();
    console.log('🗑️ Synonym cache cleared');
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.synonymCache.size,
      keys: Array.from(this.synonymCache.keys())
    };
  }
}

export const synonymExpansionService = new SynonymExpansionService();