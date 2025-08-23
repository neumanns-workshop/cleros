#!/usr/bin/env python3
"""
Clean up trailing periods from English hymn titles for consistency.
Dropdown titles shouldn't have periods.
"""

import json
from pathlib import Path


def clean_title_periods():
    """Remove trailing periods from all English titles."""
    
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
            
        print(f"Cleaning periods in {file_path}")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        changes_made = False
        
        # Clean sections
        if 'sections' in data:
            for section in data['sections']:
                if 'title_english' in section and section['title_english']:
                    old_title = section['title_english']
                    new_title = old_title.rstrip('.')
                    if old_title != new_title:
                        section['title_english'] = new_title
                        print(f"  Cleaned: '{old_title}' → '{new_title}'")
                        changes_made = True
        
        # Clean hymns in main gold standard
        if 'content' in data and 'hymns' in data['content']:
            for hymn in data['content']['hymns']:
                if 'title_english' in hymn and hymn['title_english']:
                    old_title = hymn['title_english']
                    new_title = old_title.rstrip('.')
                    if old_title != new_title:
                        hymn['title_english'] = new_title
                        print(f"  Cleaned: '{old_title}' → '{new_title}'")
                        changes_made = True
        
        # Save only if changes were made
        if changes_made:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"  Updated {file_path}")
        else:
            print(f"  No trailing periods found in {file_path}")


def main():
    print("Cleaning trailing periods from English hymn titles...")
    clean_title_periods()
    print("\nPeriod cleanup complete!")
    print("All English titles now have consistent formatting for dropdown display.")


if __name__ == "__main__":
    main()
