#!/usr/bin/env python3
"""
Normalize Orphic Hymn titles for UI consistency:
1. Convert all "Of X" to "To X" (these are invocations)
2. Update all corpus files with normalized titles
"""

import json
import re
from pathlib import Path


def normalize_title(title):
    """Normalize a single title for UI consistency."""
    # Skip titles that are already properly formatted or are special cases
    if title.startswith("Orpheus to") or title.startswith("Hymn to"):
        return title
    
    # Convert "Of X" to "To X" for deities (these are invocations)
    if title.startswith("Of "):
        # "Of Zeus" -> "To Zeus"
        # "Of the Nereids" -> "To the Nereids" 
        # "Of Nyx." -> "To Nyx"
        return title.replace("Of ", "To ", 1).rstrip('.')
    
    # Convert bare names to "To X"
    if title in ["of the stars", "of clouds", "mares", "of the Mousai", "of Ēōs", "of Leto", "of Ares"]:
        # These need manual fixes
        title_fixes = {
            "of the stars": "To the Stars",
            "of clouds": "To the Clouds", 
            "mares": "To the Mares",
            "of the Mousai": "To the Muses",
            "of Ēōs": "To Eos",
            "of Leto": "To Leto",
            "of Ares": "To Ares"
        }
        return title_fixes.get(title, title)
    
    # Handle special cases
    if title.startswith("of "):
        return title.replace("of ", "To ", 1).title()
    
    # If it doesn't start with "To" already, add it
    if not title.startswith("To ") and not title.startswith("Hymn"):
        return f"To {title}"
    
    return title


def update_corpus_files():
    """Update all corpus files with normalized titles."""
    
    # Files to update
    files_to_update = [
        "/Users/jneumann/Repos/cleros/web/public/orphic_hymns_sentences.json",
        "/Users/jneumann/Repos/cleros/web/public/orphic_hymns_parallel.json",
        "/Users/jneumann/Repos/cleros/data/gold_standard/orphic_hymns_parallel.json",
        "/Users/jneumann/Repos/cleros/data/gold_standard/chunked/orphic_hymns_sentences.json",
        "/Users/jneumann/Repos/cleros/data/gold_standard/orphic_hymns.json"
    ]
    
    for file_path in files_to_update:
        file_path = Path(file_path)
        if not file_path.exists():
            print(f"Skipping {file_path} (not found)")
            continue
            
        print(f"Updating {file_path}")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Update sections with normalized English titles
        if 'sections' in data:
            for section in data['sections']:
                if 'title_english' in section:
                    old_title = section['title_english']
                    new_title = normalize_title(old_title)
                    if old_title != new_title:
                        section['title_english'] = new_title
                        print(f"  Normalized: {old_title} → {new_title}")
        
        # Update hymns in main gold standard
        if 'content' in data and 'hymns' in data['content']:
            for hymn in data['content']['hymns']:
                if 'title_english' in hymn:
                    old_title = hymn['title_english']
                    new_title = normalize_title(old_title)
                    if old_title != new_title:
                        hymn['title_english'] = new_title
                        print(f"  Normalized: {old_title} → {new_title}")
        
        # Save updated file
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)


def main():
    print("Normalizing Orphic Hymn titles for UI consistency...")
    print("Converting 'Of X' to 'To X' for invocations")
    
    update_corpus_files()
    
    print("\nTitle normalization complete!")
    print("All hymn titles now use 'To X' format for consistency.")


if __name__ == "__main__":
    main()
