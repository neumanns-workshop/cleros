#!/usr/bin/env python3
"""
Create Combined Stop Words List
Combines and deduplicates stop words from english-word-atlas sources
"""

import json
from pathlib import Path
from typing import Set

REPO_ROOT = Path(__file__).resolve().parent.parent

def load_stopwords_from_json(file_path: Path) -> Set[str]:
    """Load stop words from a JSON file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            words = json.load(f)
            return set(word.lower().strip() for word in words if word.strip())
    except Exception as e:
        print(f"Warning: Could not load {file_path}: {e}")
        return set()

def main():
    """Combine and deduplicate stop words from all sources."""
    base_path = REPO_ROOT.parent / "english-word-atlas" / "data" / "sources" / "STOP"
    
    # Load all stop word files
    stop_files = {
        'nltk': base_path / 'NLTK.json',
        'spacy': base_path / 'SPACY.json', 
        'fox': base_path / 'FOX.json',
        'learn': base_path / 'LEARN.json'
    }
    
    all_stopwords = set()
    source_counts = {}
    
    for source_name, file_path in stop_files.items():
        if file_path.exists():
            words = load_stopwords_from_json(file_path)
            source_counts[source_name] = len(words)
            all_stopwords.update(words)
            print(f"Loaded {len(words)} words from {source_name}")
        else:
            print(f"File not found: {file_path}")
    
    # Remove empty strings and single characters except meaningful ones
    filtered_stopwords = set()
    for word in all_stopwords:
        if word and len(word.strip()) > 0:
            # Keep single meaningful letters, skip others
            if len(word) == 1 and word not in ['a', 'i']:
                continue
            filtered_stopwords.add(word.strip().lower())
    
    # Sort for clean output
    sorted_stopwords = sorted(filtered_stopwords)
    
    print(f"\nCombined Statistics:")
    print(f"Total unique stop words: {len(sorted_stopwords)}")
    print(f"Source breakdown: {source_counts}")
    
    # Save to cleros project
    output_path = REPO_ROOT / "data" / "combined_stopwords.json"
    output_path.parent.mkdir(exist_ok=True)
    
    # Create metadata
    stopwords_data = {
        "description": "Combined and deduplicated stop words from english-word-atlas sources",
        "sources": list(stop_files.keys()),
        "source_counts": source_counts,
        "total_words": len(sorted_stopwords),
        "stopwords": sorted_stopwords
    }
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(stopwords_data, f, indent=2, ensure_ascii=False)
    
    print(f"\nSaved combined stop words to: {output_path}")
    
    # Also save just the list for easy loading
    simple_output_path = REPO_ROOT / "data" / "stopwords_simple.json"
    with open(simple_output_path, 'w', encoding='utf-8') as f:
        json.dump(sorted_stopwords, f, indent=2, ensure_ascii=False)
    
    print(f"Saved simple list to: {simple_output_path}")
    
    # Show some sample words
    print(f"\nFirst 20 stop words: {', '.join(sorted_stopwords[:20])}")
    print(f"Last 20 stop words: {', '.join(sorted_stopwords[-20:])}")

if __name__ == "__main__":
    main()
