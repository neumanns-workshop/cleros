#!/usr/bin/env python3
"""
Oracle Random Selection System
Uses random.org for true randomness to select passages from the three main Orphic texts.
"""

import json
import requests
import time
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import logging

# Import our keyword extractor
try:
    from oracle_keyword_extractor import OracleKeywordExtractor
except ImportError:
    # Fallback if running standalone
    import sys
    sys.path.append('.')
    from oracle_keyword_extractor import OracleKeywordExtractor

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class OracleRandomSelector:
    """Handles random selection of sentences from the three main Orphic texts."""
    
    def __init__(self, base_path: str = "/Users/jneumann/Repos/cleros"):
        self.base_path = Path(base_path)
        self.corpus_info = {
            "hymns": {
                "name": "Orphic Hymns",
                "role": "Invocation",
                "total_sentences": 218,
                "metadata_path": "embeddings/orphic_hymns/orphic_hymns_metadata.json",
                "sentences_path": "data/gold_standard/chunked/orphic_hymns_sentences.json"
            },
            "argonautica": {
                "name": "Orphic Argonautica", 
                "role": "Narrative",
                "total_sentences": 338,
                "metadata_path": "embeddings/orphic_argonautica/orphic_argonautica_metadata.json",
                "sentences_path": "data/gold_standard/chunked/orphic_argonautica_sentences.json"
            },
            "lithica": {
                "name": "Orphic Lithica",
                "role": "Praxis", 
                "total_sentences": 193,
                "metadata_path": "embeddings/orphic_lithica/orphic_lithica_metadata.json",
                "sentences_path": "data/gold_standard/chunked/orphic_lithica_sentences.json"
            }
        }
        
        # Load metadata for quick access
        self.metadata = {}
        self._load_metadata()
    
    def _load_metadata(self):
        """Load sentence metadata for all three corpora."""
        for corpus_key, info in self.corpus_info.items():
            metadata_path = self.base_path / info["metadata_path"]
            try:
                with open(metadata_path, 'r', encoding='utf-8') as f:
                    self.metadata[corpus_key] = json.load(f)
                logger.info(f"Loaded {corpus_key} metadata: {len(self.metadata[corpus_key]['sentences'])} sentences")
            except Exception as e:
                logger.error(f"Failed to load metadata for {corpus_key}: {e}")
                raise
    
    def get_random_numbers_from_org(self, min_vals: List[int], max_vals: List[int]) -> Optional[List[int]]:
        """
        Get truly random numbers from random.org API using the free basic service.
        
        Args:
            min_vals: List of minimum values for each random number
            max_vals: List of maximum values for each random number
            
        Returns:
            List of random numbers or None if API fails
        """
        if len(min_vals) != len(max_vals):
            raise ValueError("min_vals and max_vals must have same length")
        
        try:
            # Use the simple HTTP API for free tier
            # Format: https://www.random.org/integers/?num=1&min=1&max=100&col=1&base=10&format=plain&rnd=new
            results = []
            
            for min_val, max_val in zip(min_vals, max_vals):
                url = f"https://www.random.org/integers/?num=1&min={min_val}&max={max_val}&col=1&base=10&format=plain&rnd=new"
                
                response = requests.get(url, timeout=10)
                if response.status_code == 200:
                    # Parse the plain text response
                    try:
                        random_num = int(response.text.strip())
                        results.append(random_num)
                    except ValueError:
                        logger.warning(f"Could not parse random.org response: {response.text}")
                        return None
                else:
                    logger.warning(f"Random.org API failed: {response.status_code}")
                    return None
                
                # Small delay between requests to be respectful to free service
                time.sleep(0.2)
            
            return results
                    
        except Exception as e:
            logger.warning(f"Error calling random.org API: {e}")
            return None
    
    def fallback_random_numbers(self, min_vals: List[int], max_vals: List[int]) -> List[int]:
        """Fallback to local random if random.org fails."""
        import random
        logger.info("Using fallback local random numbers")
        return [random.randint(min_val, max_val) for min_val, max_val in zip(min_vals, max_vals)]
    
    def get_random_sentence_ids(self) -> Tuple[Dict[str, int], str]:
        """Get random sentence IDs for all three corpora."""
        # Prepare ranges for each corpus
        min_vals = [1, 1, 1]  # All start at 1
        max_vals = [
            self.corpus_info["hymns"]["total_sentences"],
            self.corpus_info["argonautica"]["total_sentences"], 
            self.corpus_info["lithica"]["total_sentences"]
        ]
        
        # Try random.org first, fallback to local random
        random_numbers = self.get_random_numbers_from_org(min_vals, max_vals)
        source = "random.org"
        
        if random_numbers is None:
            random_numbers = self.fallback_random_numbers(min_vals, max_vals)
            source = "local"
        
        ids = {
            "hymns": random_numbers[0],
            "argonautica": random_numbers[1], 
            "lithica": random_numbers[2]
        }
        
        return ids, source
    
    def get_sentence_by_id(self, corpus_key: str, sentence_id: int) -> Optional[Dict]:
        """Get full sentence data by ID from the corpus."""
        if corpus_key not in self.metadata:
            logger.error(f"Unknown corpus: {corpus_key}")
            return None
        
        sentences = self.metadata[corpus_key]["sentences"]
        
        # Find sentence by ID (they should be sequential starting from 1)
        if 1 <= sentence_id <= len(sentences):
            return sentences[sentence_id - 1]  # Convert to 0-based index
        else:
            logger.error(f"Sentence ID {sentence_id} out of range for {corpus_key}")
            return None
    
    def create_oracle_response(self, query: str = "") -> Dict:
        """Create a complete oracle response with random selections."""
        logger.info("Creating oracle response...")
        
        # Get random sentence IDs
        random_ids, random_source = self.get_random_sentence_ids()
        logger.info(f"Selected random sentences: {random_ids}")
        
        # Build response
        response = {
            "timestamp": time.time(),
            "query": query,
            "random_source": random_source,
            "selections": {}
        }
        
        for corpus_key, sentence_id in random_ids.items():
            sentence_data = self.get_sentence_by_id(corpus_key, sentence_id)
            if sentence_data:
                info = self.corpus_info[corpus_key]
                response["selections"][corpus_key] = {
                    "corpus_name": info["name"],
                    "role": info["role"],
                    "sentence_id": sentence_id,
                    "section_title": sentence_data["section_title"],
                    "line_range": sentence_data["line_range"],
                    "text": sentence_data["text"],
                    "line_count": sentence_data["line_count"]
                }
            else:
                logger.error(f"Failed to get sentence {sentence_id} from {corpus_key}")
        
        return response


def main():
    """Test the oracle random selection system."""
    selector = OracleRandomSelector()
    
    print("🔮 Oracle Random Selection Test")
    print("=" * 50)
    
    # Create a test oracle response
    response = selector.create_oracle_response("Test query about wisdom and guidance")
    
    print(f"Query: {response['query']}")
    print(f"Random source: {response['random_source']}")
    print(f"Timestamp: {response['timestamp']}")
    print()
    
    # Display selections
    for corpus_key, selection in response["selections"].items():
        print(f"📜 {selection['role']} ({selection['corpus_name']})")
        print(f"   Section: {selection['section_title']}")
        print(f"   Lines: {selection['line_range']['start']}-{selection['line_range']['end']}")
        print(f"   Text: {selection['text'][:200]}...")
        print()
    
    # Save response for inspection
    output_path = Path("/Users/jneumann/Repos/cleros/test_oracle_response.json")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(response, f, indent=2, ensure_ascii=False)
    
    print(f"💾 Full response saved to: {output_path}")


if __name__ == "__main__":
    main()
