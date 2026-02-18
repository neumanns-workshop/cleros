#!/usr/bin/env python3
"""
Oracle Keyword Extraction System
Extracts meaningful keywords from user queries for highlighting in oracle responses.
Uses curated stop word lists from english-word-atlas.
"""

import json
import re
import string
from pathlib import Path
from typing import List, Set, Dict
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class OracleKeywordExtractor:
    """Extracts meaningful keywords from queries for oracle response highlighting."""
    
    def __init__(self, base_path: str = None):
        REPO_ROOT = Path(__file__).resolve().parent.parent
        self.base_path = Path(base_path) if base_path else REPO_ROOT
        self.stop_words = set()
        self._load_stop_words()

    def _load_stop_words(self):
        """Load stop words from the combined stopwords list."""
        try:
            # Use our combined and deduplicated stop words list
            stopwords_path = self.base_path / "data" / "nltk_stopwords.json"
            with open(stopwords_path, 'r', encoding='utf-8') as f:
                stop_words_list = json.load(f)
                self.stop_words = set(word.lower() for word in stop_words_list)
            
            logger.info(f"Loaded {len(self.stop_words)} stop words from combined list")
            logger.info(f"Checking if 'and' is in stop words: {'and' in self.stop_words}")
            logger.info(f"Sample stop words: {sorted(list(self.stop_words))[:20]}")
            
        except Exception as e:
            logger.warning(f"Could not load combined stop words: {e}")
            # Fallback to a basic set
            self.stop_words = {
                'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
                'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
                'to', 'was', 'were', 'will', 'with', 'would', 'i', 'you', 'me',
                'my', 'we', 'our', 'they', 'them', 'their', 'this', 'these', 'that',
                'those', 'have', 'had', 'do', 'does', 'did', 'can', 'could', 'should'
            }
    
    def clean_word(self, word: str) -> str:
        """Clean a word by removing punctuation and normalizing."""
        # Remove punctuation but keep apostrophes for contractions
        word = re.sub(r'[^\w\'-]', '', word)
        # Convert to lowercase
        word = word.lower().strip()
        # Remove leading/trailing apostrophes and hyphens
        word = word.strip("'-")
        return word
    
    def is_meaningful_word(self, word: str) -> bool:
        """Check if a word is meaningful (not a stop word, number, or too short)."""
        if not word or len(word) < 2:
            return False
        
        # Skip pure numbers
        if word.isdigit():
            return False
            
        # Skip stop words (case insensitive)
        if word.lower() in self.stop_words:
            return False
            
        # Skip single letters unless they're meaningful (like 'I')
        if len(word) == 1 and word.lower() not in ['i', 'a']:
            return False
            
        return True
    
    def extract_keywords(self, query: str, min_length: int = 2, max_keywords: int = 20) -> List[str]:
        """
        Extract meaningful keywords from a query.
        
        Args:
            query: The user's query text
            min_length: Minimum word length to consider
            max_keywords: Maximum number of keywords to return
            
        Returns:
            List of meaningful keywords in order of appearance
        """
        if not query:
            return []
        
        # Tokenize by splitting on whitespace and common separators
        tokens = re.findall(r'\b\w+(?:\'[a-z]+)?\b', query, re.IGNORECASE)
        
        keywords = []
        seen = set()
        
        for token in tokens:
            cleaned = self.clean_word(token)
            
            if (self.is_meaningful_word(cleaned) and 
                len(cleaned) >= min_length and 
                cleaned not in seen):
                
                keywords.append(cleaned)
                seen.add(cleaned)
                
                if len(keywords) >= max_keywords:
                    break
        
        return keywords
    
    def extract_keyword_variations(self, query: str) -> Dict[str, List[str]]:
        """
        Extract keywords with their original case variations.
        Useful for highlighting where we want to preserve original formatting.
        """
        if not query:
            return {}
        
        # Find all words with their original formatting
        tokens = re.findall(r'\b\w+(?:\'[a-z]+)?\b', query, re.IGNORECASE)
        
        keyword_variations = {}
        
        for token in tokens:
            cleaned = self.clean_word(token)
            
            if self.is_meaningful_word(cleaned):
                if cleaned not in keyword_variations:
                    keyword_variations[cleaned] = []
                
                # Store original case version if not already present
                if token not in keyword_variations[cleaned]:
                    keyword_variations[cleaned].append(token)
        
        return keyword_variations
    
    def highlight_keywords_in_text(self, text: str, keywords: List[str], 
                                 highlight_class: str = "keyword-highlight") -> str:
        """
        Highlight keywords in text with HTML spans.
        
        Args:
            text: Text to highlight in
            keywords: List of keywords to highlight
            highlight_class: CSS class for highlighting
            
        Returns:
            Text with keywords wrapped in <span> tags
        """
        if not keywords or not text:
            return text
        
        # Create pattern that matches whole words only
        # Sort by length (longest first) to avoid partial replacements
        sorted_keywords = sorted(keywords, key=len, reverse=True)
        
        highlighted_text = text
        
        for keyword in sorted_keywords:
            # Create case-insensitive word boundary pattern
            pattern = r'\b' + re.escape(keyword) + r'\b'
            
            # Replace with highlighted version, preserving original case
            def replace_func(match):
                return f'<span class="{highlight_class}">{match.group()}</span>'
            
            highlighted_text = re.sub(pattern, replace_func, highlighted_text, flags=re.IGNORECASE)
        
        return highlighted_text
    
    def analyze_query_complexity(self, query: str) -> Dict:
        """Analyze query complexity and keyword density."""
        keywords = self.extract_keywords(query)
        total_words = len(query.split())
        
        return {
            "total_words": total_words,
            "keyword_count": len(keywords),
            "keyword_density": len(keywords) / max(total_words, 1),
            "keywords": keywords,
            "complexity": "high" if len(keywords) > 5 else "medium" if len(keywords) > 2 else "low"
        }


def main():
    """Test the keyword extraction system."""
    extractor = OracleKeywordExtractor()
    
    print("🔍 Oracle Keyword Extraction Test")
    print("=" * 50)
    
    # Test queries
    test_queries = [
        "Tell me about wisdom and divine guidance",
        "I seek knowledge of sacred stones and their mystical properties",
        "What does the oracle say about love and relationships?",
        "Show me the path to spiritual enlightenment and inner peace",
        "How can I find protection from evil and dark forces?",
        "Reveal the secrets of ancient magic and divine power"
    ]
    
    for i, query in enumerate(test_queries, 1):
        print(f"\n📝 Query {i}: \"{query}\"")
        
        # Extract keywords
        keywords = extractor.extract_keywords(query)
        print(f"Keywords: {', '.join(keywords)}")
        
        # Analyze complexity
        analysis = extractor.analyze_query_complexity(query)
        print(f"Complexity: {analysis['complexity']} ({analysis['keyword_count']}/{analysis['total_words']} words)")
        
        # Test highlighting
        sample_text = "The ancient wisdom speaks of divine guidance through sacred stones and mystical properties."
        highlighted = extractor.highlight_keywords_in_text(sample_text, keywords)
        print(f"Highlighted: {highlighted}")
        
        print("-" * 40)
    
    # Test with oracle response
    print(f"\n💎 Integration with Oracle Response")
    oracle_response = {
        "query": "Tell me about wisdom and divine guidance",
        "selections": {
            "hymns": {
                "text": "Learn, Musaeus, the very august rite of burnt-offering, a prayer which indeed for you is the foremost of all."
            },
            "argonautica": {
                "text": "And then indeed I left the lovely cave and crossed beyond, with my very phorminx, and I came to the ancient altar."
            },
            "lithica": {
                "text": "To bestow upon mortals a gift from Zeus Alexikakos, called Eriounios, of Maia, he came bearing divine wisdom."
            }
        }
    }
    
    keywords = extractor.extract_keywords(oracle_response["query"])
    print(f"Query keywords: {', '.join(keywords)}")
    
    for corpus, selection in oracle_response["selections"].items():
        highlighted = extractor.highlight_keywords_in_text(selection["text"], keywords)
        print(f"{corpus.title()}: {highlighted}")


if __name__ == "__main__":
    main()
