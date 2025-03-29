"""
Extract linguistic features from the base dataset using spaCy.

This script processes each hymn to extract:
1. Basic Text Metrics
   - Word counts
   - Token counts
   - Line lengths
   - Vocabulary statistics

2. Linguistic Analysis
   - Part-of-speech tags
   - Dependency relationships
   - Noun chunks
   - Named entities
   - Syntactic patterns
"""

import json
from pathlib import Path
from typing import Dict, Any, List
from collections import Counter
import spacy
from tqdm import tqdm

# Constants
DATA_DIR = Path("data")
BASE_DIR = DATA_DIR / "base"
LINGUISTICS_DIR = DATA_DIR / "enriched" / "linguistics"

class LinguisticsExtractor:
    """Extract linguistic features using spaCy"""
    
    def __init__(self):
        """Initialize spaCy model"""
        print("Loading spaCy transformer model...")
        self.nlp = spacy.load("en_core_web_trf")
        # Disable GPU to avoid MPS issues
        spacy.require_cpu()
        print("Model loaded successfully!")
    
    def extract_text_metrics(self, hymn_data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract basic text metrics from a hymn
        
        Includes:
        - Word and token counts (per line and total)
        - Line length statistics
        - Vocabulary statistics
        """
        metrics = {
            "hymn_id": hymn_data["hymn_id"],
            "total_words": 0,
            "total_tokens": 0,
            "unique_words": 0,
            "avg_line_length": 0,
            "vocabulary": Counter(),
            "per_line": []
        }
        
        all_words = []
        
        # Process each line
        for i, line in enumerate(hymn_data["lines"], 1):
            doc = self.nlp(line)
            
            # Get word and token counts
            words = [token.text.lower() for token in doc if not token.is_punct and not token.is_space]
            
            # Update counts
            metrics["total_words"] += len(words)
            metrics["total_tokens"] += len(doc)
            metrics["vocabulary"].update(words)
            all_words.extend(words)
            
            # Store line metrics
            metrics["per_line"].append({
                "line_num": i,
                "word_count": len(words),
                "token_count": len(doc),
                "char_length": len(line)
            })
        
        # Calculate averages and unique words
        metrics["unique_words"] = len(metrics["vocabulary"])
        metrics["avg_line_length"] = sum(len(line) for line in hymn_data["lines"]) / len(hymn_data["lines"])
        
        # Convert Counter to dict for JSON serialization
        metrics["vocabulary"] = dict(metrics["vocabulary"])
        
        return metrics
    
    def extract_linguistic_features(self, hymn_data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract detailed linguistic features from a hymn
        
        Includes:
        - POS tags and frequencies
        - Dependency relationships
        - Noun chunks
        - Named entities
        - Syntactic patterns
        """
        features = {
            "hymn_id": hymn_data["hymn_id"],
            "pos_counts": Counter(),
            "dep_counts": Counter(),
            "noun_chunks": [],
            "entities": [],
            "per_line": []
        }
        
        # Process each line
        for i, line in enumerate(hymn_data["lines"], 1):
            doc = self.nlp(line)
            
            # Count POS tags and dependencies
            features["pos_counts"].update(token.pos_ for token in doc)
            features["dep_counts"].update(token.dep_ for token in doc)
            
            # Extract noun chunks
            line_chunks = []
            for chunk in doc.noun_chunks:
                line_chunks.append({
                    "text": chunk.text,
                    "root_text": chunk.root.text,
                    "root_pos": chunk.root.pos_,
                    "root_dep": chunk.root.dep_
                })
            
            # Extract named entities
            line_entities = []
            for ent in doc.ents:
                line_entities.append({
                    "text": ent.text,
                    "label": ent.label_,
                    "start_char": ent.start_char,
                    "end_char": ent.end_char
                })
            
            # Store line features
            features["per_line"].append({
                "line_num": i,
                "noun_chunks": line_chunks,
                "entities": line_entities,
                "pos_tags": [(token.text, token.pos_) for token in doc],
                "dependencies": [(token.text, token.dep_, token.head.text) for token in doc]
            })
            
            # Add chunks and entities to global lists
            features["noun_chunks"].extend(line_chunks)
            features["entities"].extend(line_entities)
        
        # Convert Counters to dicts for JSON serialization
        features["pos_counts"] = dict(features["pos_counts"])
        features["dep_counts"] = dict(features["dep_counts"])
        
        return features

def process_hymns():
    """Process all hymns and extract linguistic features"""
    
    # Create output directory
    LINGUISTICS_DIR.mkdir(parents=True, exist_ok=True)
    
    # Initialize extractor
    extractor = LinguisticsExtractor()
    
    # Initialize collectors
    all_metrics = []
    all_features = []
    
    # Process each hymn
    hymn_files = sorted(BASE_DIR.glob("hymn_*.json"))
    
    print(f"\nProcessing {len(hymn_files)} hymns...")
    
    for hymn_file in tqdm(hymn_files, desc="Extracting linguistic features"):
        # Load hymn
        with open(hymn_file, 'r') as f:
            hymn_data = json.load(f)
        
        try:
            # Extract features
            metrics = extractor.extract_text_metrics(hymn_data)
            features = extractor.extract_linguistic_features(hymn_data)
            
            # Store results
            all_metrics.append(metrics)
            all_features.append(features)
            
        except Exception as e:
            print(f"Error processing {hymn_file.name}: {e}")
            continue
    
    # Save results
    with open(LINGUISTICS_DIR / "text_metrics.json", 'w') as f:
        json.dump(all_metrics, f, indent=2)
        
    with open(LINGUISTICS_DIR / "linguistic_features.json", 'w') as f:
        json.dump(all_features, f, indent=2)
    
    # Generate summary statistics
    summary = {
        "total_hymns": len(hymn_files),
        "processed_hymns": len(all_metrics),
        "total_words": sum(m["total_words"] for m in all_metrics),
        "total_unique_words": len(set(word for m in all_metrics for word in m["vocabulary"].keys())),
        "avg_words_per_hymn": sum(m["total_words"] for m in all_metrics) / len(all_metrics),
        "pos_distribution": Counter(),
        "most_common_entities": Counter(),
        "most_common_nouns": Counter()
    }
    
    # Aggregate statistics
    for features in all_features:
        summary["pos_distribution"].update(features["pos_counts"])
        summary["most_common_entities"].update(e["text"] for e in features["entities"])
        summary["most_common_nouns"].update(
            chunk["root_text"] for chunk in features["noun_chunks"]
            if chunk["root_pos"] == "NOUN"
        )
    
    # Convert Counters to dicts and get top items
    summary["pos_distribution"] = dict(summary["pos_distribution"])
    summary["most_common_entities"] = dict(summary["most_common_entities"].most_common(50))
    summary["most_common_nouns"] = dict(summary["most_common_nouns"].most_common(50))
    
    with open(LINGUISTICS_DIR / "linguistics_summary.json", 'w') as f:
        json.dump(summary, f, indent=2)
    
    print("\nLinguistic processing complete!")
    print(f"Results saved in: {LINGUISTICS_DIR}")
    print(f"\nProcessed {len(all_metrics)}/{len(hymn_files)} hymns")
    print(f"Total words: {summary['total_words']}")
    print(f"Unique words: {summary['total_unique_words']}")
    print(f"Average words per hymn: {summary['avg_words_per_hymn']:.1f}")
    print("\nMost common parts of speech:")
    for pos, count in summary["pos_distribution"].items():
        print(f"  {pos}: {count}")
    print("\nMost common entities:")
    for entity, count in list(summary["most_common_entities"].items())[:10]:
        print(f"  {entity}: {count}")

if __name__ == "__main__":
    process_hymns() 