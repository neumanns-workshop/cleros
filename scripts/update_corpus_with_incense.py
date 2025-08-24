#!/usr/bin/env python3
"""
Update corpus files to include incense information from original sentences files.
"""
import json
from pathlib import Path

def update_hymns_corpus_with_incense():
    """Update the hymns corpus file to include incense information."""
    
    # Load original sentences file (contains incense data)
    sentences_file = Path("/Users/jneumann/Repos/cleros/web/public/orphic_hymns_sentences.json")
    with open(sentences_file, 'r', encoding='utf-8') as f:
        sentences_data = json.load(f)
    
    # Load corpus file (needs incense data)
    corpus_file = Path("/Users/jneumann/Repos/cleros/web/public/corpus_20250822_121628/hymns.json")
    with open(corpus_file, 'r', encoding='utf-8') as f:
        corpus_data = json.load(f)
    
    # Create mapping from title to incense data
    incense_mapping = {}
    for section in sentences_data['sections']:
        title = section.get('title', '')
        title_english = section.get('title_english', '')
        incense = section.get('incense')
        incense_greek = section.get('incense_greek')
        
        # Use both Greek and English titles as keys
        if title:
            incense_mapping[title] = {
                'incense': incense,
                'incense_greek': incense_greek
            }
        if title_english:
            incense_mapping[title_english] = {
                'incense': incense,
                'incense_greek': incense_greek
            }
    
    print(f"Found incense data for {len([k for k, v in incense_mapping.items() if v['incense']])} hymns")
    
    # Update corpus parts with incense information
    updated_count = 0
    for part in corpus_data['parts']:
        part_title = part.get('part_title', '')
        
        # Try to find incense data for this part
        incense_data = incense_mapping.get(part_title, {})
        if not incense_data and 'To ' in part_title:
            # Try without "To " prefix
            alt_title = part_title.replace('To ', '')
            incense_data = incense_mapping.get(alt_title, {})
        
        if incense_data.get('incense'):
            part['incense'] = incense_data['incense']
            part['incense_greek'] = incense_data['incense_greek']
            updated_count += 1
            print(f"  Added incense to '{part_title}': {incense_data['incense']}")
        else:
            # Set explicit null for hymns without incense
            part['incense'] = None
            part['incense_greek'] = None
    
    # Save updated corpus file
    with open(corpus_file, 'w', encoding='utf-8') as f:
        json.dump(corpus_data, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Updated {updated_count} parts with incense information")
    print(f"💾 Saved to {corpus_file}")

if __name__ == "__main__":
    print("🌿 Updating corpus files with incense information...")
    update_hymns_corpus_with_incense()
    print("✨ Complete!")
