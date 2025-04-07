#!/usr/bin/env python3
"""
Sentence Entity Classifier for Cleros Orphicae

This script maps deity classifications to their positions in sentences.
It uses the character offset information from the linguistic features
to identify where each classified entity appears in a given sentence.
"""

import json
import argparse
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple

# Constants
DATA_DIR = Path("data")
LINGUISTICS_DIR = DATA_DIR / "enriched" / "linguistics"
DEITIES_DIR = DATA_DIR / "enriched" / "deities"
LINGUISTIC_FEATURES_PATH = LINGUISTICS_DIR / "linguistic_features.json"
CLASSIFICATIONS_PATH = DEITIES_DIR / "deity_classifications.json"

class EntityLocation:
    """Entity location and classification information"""
    def __init__(self, entity: str, category: str, start: int, end: int):
        self.entity = entity
        self.category = category
        self.start = start
        self.end = end
    
    def __repr__(self):
        return f"EntityLocation(entity='{self.entity}', category='{self.category}', start={self.start}, end={self.end})"

def load_classifications() -> Dict[str, str]:
    """
    Load entity classifications from JSON file
    
    Returns:
        Dictionary mapping entity names to their categories
    """
    try:
        with open(CLASSIFICATIONS_PATH, 'r') as f:
            classifications = json.load(f)
        
        # Create a dictionary mapping entity names to categories
        entity_categories = {}
        for item in classifications:
            entity = item.get('entity')
            category = item.get('category')
            if entity and category:
                entity_categories[entity] = category
        
        print(f"Loaded classifications for {len(entity_categories)} entities")
        return entity_categories
    
    except Exception as e:
        print(f"Error loading classifications: {e}")
        return {}

def load_entity_offsets() -> Dict[str, List[Tuple[str, int, int, int, int]]]:
    """
    Load entity offsets from linguistic_features.json
    
    Returns:
        Dictionary mapping hymn+line identifiers to lists of 
        (entity, start_char, end_char, hymn_id, line_num) tuples
    """
    try:
        with open(LINGUISTIC_FEATURES_PATH, 'r') as f:
            features_data = json.load(f)
        
        # Extract entities with their offsets
        line_entities = {}
        
        # Process each hymn
        for hymn in features_data:
            hymn_id = hymn.get("hymn_id", "unknown")
            
            # Process each line in the hymn
            for line_data in hymn.get("per_line", []):
                line_num = line_data.get("line_num", 0)
                line_key = f"Hymn {hymn_id}, Line {line_num}"
                
                # Get line entities
                entities = []
                for entity in line_data.get("entities", []):
                    entity_text = entity.get("text", "")
                    start_char = entity.get("start_char", 0)
                    end_char = entity.get("end_char", 0)
                    
                    if entity_text and start_char < end_char:
                        entities.append((entity_text, start_char, end_char, hymn_id, line_num))
                
                if entities:
                    line_entities[line_key] = entities
        
        return line_entities
    
    except Exception as e:
        print(f"Error loading entity offsets: {e}")
        return {}

def classify_sentence(sentence: str, hymn_id: str = None, line_num: int = None) -> List[EntityLocation]:
    """
    Classify entities in a sentence and return their locations
    
    Args:
        sentence: The sentence text to classify
        hymn_id: Optional hymn ID to help with lookup
        line_num: Optional line number to help with lookup
        
    Returns:
        List of EntityLocation objects with entity, category, and character positions
    """
    # Load classifications and entity offsets
    classifications = load_classifications()
    line_entities = load_entity_offsets()
    
    # Create a key for lookup if hymn_id and line_num are provided
    line_key = f"Hymn {hymn_id}, Line {line_num}" if hymn_id is not None and line_num is not None else None
    
    # If we have a direct line key match
    if line_key and line_key in line_entities:
        entities = line_entities[line_key]
        
        # Map entities to their classifications
        locations = []
        for entity_text, start_char, end_char, _, _ in entities:
            category = classifications.get(entity_text, "Unknown")
            locations.append(EntityLocation(entity_text, category, start_char, end_char))
        
        return locations
    
    # If we don't have a direct line key match, we need to find the best match
    # by comparing the sentence with the contexts in our entity data
    
    # Find the most similar line by simple string matching
    best_match_key = None
    best_match_score = 0
    
    for line_key in line_entities.keys():
        # Extract the actual text from the line key, which is in format "Hymn X, Line Y: text"
        if ": " in line_key:
            line_text = line_key.split(": ", 1)[1]
            
            # Calculate a simple similarity score (number of matching words)
            sentence_words = set(sentence.lower().split())
            line_words = set(line_text.lower().split())
            common_words = sentence_words.intersection(line_words)
            
            # Weight by the ratio of common words to total words in the sentence
            score = len(common_words) / max(1, len(sentence_words))
            
            if score > best_match_score:
                best_match_score = score
                best_match_key = line_key
    
    # If we found a good match (at least 50% of words match)
    if best_match_score >= 0.5 and best_match_key:
        entities = line_entities[best_match_key]
        
        # Map entities to their classifications
        locations = []
        for entity_text, start_char, end_char, _, _ in entities:
            # We need to adjust offsets since we're using a different text
            # Find the entity in the sentence
            entity_pos = sentence.find(entity_text)
            if entity_pos >= 0:
                category = classifications.get(entity_text, "Unknown")
                locations.append(EntityLocation(
                    entity_text, 
                    category, 
                    entity_pos, 
                    entity_pos + len(entity_text)
                ))
        
        return locations
    
    # If we couldn't find a good match, return an empty list
    return []

def annotate_sentence(sentence: str, locations: List[EntityLocation]) -> str:
    """
    Annotate a sentence with deity categories
    
    Args:
        sentence: The sentence text to annotate
        locations: List of EntityLocation objects
        
    Returns:
        Sentence with entity annotations
    """
    # Sort locations by start position in reverse order (to avoid position shifts)
    locations.sort(key=lambda loc: loc.start, reverse=True)
    
    # Make a copy of the sentence
    annotated = sentence
    
    # Insert annotations
    for loc in locations:
        prefix = annotated[:loc.end]
        suffix = annotated[loc.end:]
        annotated = f"{prefix}[{loc.category}]{suffix}"
        
        prefix = annotated[:loc.start]
        suffix = annotated[loc.start:]
        annotated = f"{prefix}«{suffix}"
    
    return annotated

def print_entity_info(sentence: str, locations: List[EntityLocation]):
    """Print information about entities in a sentence"""
    print(f"Sentence: {sentence}")
    print(f"Found {len(locations)} entities:")
    
    for loc in locations:
        print(f"  - {loc.entity} ({loc.category}) at positions {loc.start}-{loc.end}")
    
    # Print the annotated sentence
    print("\nAnnotated sentence:")
    print(annotate_sentence(sentence, locations))

def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description="Classify and annotate entities in sentences from the Orphic Hymns"
    )
    
    parser.add_argument("--sentence", type=str, help="Sentence to classify")
    parser.add_argument("--hymn", type=str, help="Hymn ID", default=None)
    parser.add_argument("--line", type=int, help="Line number", default=None)
    
    args = parser.parse_args()
    
    if args.sentence:
        locations = classify_sentence(args.sentence, args.hymn, args.line)
        print_entity_info(args.sentence, locations)
    else:
        parser.print_help()

if __name__ == "__main__":
    main() 