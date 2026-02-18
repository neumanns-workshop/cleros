#!/usr/bin/env python3
"""
Fix incense data mapping using section indexes instead of title matching
"""
import json
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

def fix_incense_mapping():
    """Update corpus with incense data using section indexes."""

    # Load original sentences file (source of incense data)
    sentences_file = REPO_ROOT / "web" / "public" / "orphic_hymns_sentences.json"
    with open(sentences_file, 'r', encoding='utf-8') as f:
        sentences_data = json.load(f)
    
    # Load corpus file (target for incense data)
    corpus_file = REPO_ROOT / "web" / "public" / "corpus_20250822_121628" / "hymns.json"
    with open(corpus_file, 'r', encoding='utf-8') as f:
        corpus_data = json.load(f)
    
    print(f"Original file has {len(sentences_data['sections'])} sections")
    print(f"Corpus file has {len(corpus_data['parts'])} parts")
    
    # Create mapping by section index (0-based)
    incense_by_index = {}
    for i, section in enumerate(sentences_data['sections']):
        incense = section.get('incense')
        incense_greek = section.get('incense_greek')
        if incense:
            incense_by_index[i] = {
                'incense': incense,
                'incense_greek': incense_greek
            }
            print(f"  Section {i}: {section.get('title', 'Unknown')} -> {incense}")
    
    print(f"\nFound {len(incense_by_index)} sections with incense data")
    
    # Update corpus parts using part_number to map to section index
    updated_count = 0
    for part in corpus_data['parts']:
        part_number = part.get('part_number')
        if part_number is not None and part_number in incense_by_index:
            incense_data = incense_by_index[part_number]
            part['incense'] = incense_data['incense']
            part['incense_greek'] = incense_data['incense_greek']
            updated_count += 1
            print(f"  Updated part {part_number}: {part.get('part_title', 'Unknown')} -> {incense_data['incense']}")
        else:
            # Ensure null values for parts without incense
            part['incense'] = None
            part['incense_greek'] = None
    
    # Save updated corpus file
    with open(corpus_file, 'w', encoding='utf-8') as f:
        json.dump(corpus_data, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Updated {updated_count} parts with incense information")
    print(f"💾 Saved to {corpus_file}")

if __name__ == "__main__":
    print("🌿 Fixing incense data mapping using section indexes...")
    fix_incense_mapping()
    print("✨ Complete!")
