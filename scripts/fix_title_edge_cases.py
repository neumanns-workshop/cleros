#!/usr/bin/env python3
"""
Fix edge cases in hymn title translations:
1. "To O Okeanos!" -> "O Okeanos!" (vocative stays vocative)
2. Other awkward normalizations
"""

import json
from pathlib import Path


def fix_title_edge_cases():
    """Fix specific title edge cases that got mangled."""
    
    # Define fixes for specific awkward cases
    fixes = {
        "To O Okeanos!": "O Okeanos!",
        "To Orphic Hymn to Zeus (Cosmogonic)": "Orphic Hymn to Zeus (Cosmogonic)",
        "To Seilenos, of the Satyros, of the Bacchoi": "To Seilenos, the Satyros, and the Bacchoi",
        "To The Biennial One": "To the Biennial One",
        "To The Stars": "To the Stars",
        "To The Clouds": "To the Clouds",
        "To The Mares": "To the Mares",
        "To The Nereids": "To the Nereids",
        "To The Titanes": "To the Titanes",
        "To The Horai": "To the Horai",
        "To The Nymphai": "To the Nymphs",
        "To The Trieteric": "To the Trieteric",
        "To The Moirai": "To the Fates",
        "To The Charites": "To the Graces",
        "To The Daimon": "To the Daimon",
        "To The Muses": "To the Muses",
        "To The Mother of the Gods": "To the Mother of the Gods"
    }
    
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
            
        print(f"Fixing edge cases in {file_path}")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        changes_made = False
        
        # Fix sections
        if 'sections' in data:
            for section in data['sections']:
                if 'title_english' in section:
                    old_title = section['title_english']
                    if old_title in fixes:
                        section['title_english'] = fixes[old_title]
                        print(f"  Fixed: {old_title} → {fixes[old_title]}")
                        changes_made = True
        
        # Fix hymns in main gold standard
        if 'content' in data and 'hymns' in data['content']:
            for hymn in data['content']['hymns']:
                if 'title_english' in hymn:
                    old_title = hymn['title_english']
                    if old_title in fixes:
                        hymn['title_english'] = fixes[old_title]
                        print(f"  Fixed: {old_title} → {fixes[old_title]}")
                        changes_made = True
        
        # Save only if changes were made
        if changes_made:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"  Updated {file_path}")
        else:
            print(f"  No changes needed in {file_path}")


def main():
    print("Fixing hymn title edge cases...")
    fix_title_edge_cases()
    print("\nEdge case fixes complete!")


if __name__ == "__main__":
    main()
