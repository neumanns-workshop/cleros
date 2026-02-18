#!/usr/bin/env python3
"""
Translate Orphic Hymn titles from Greek to English using GPT-5 reasoning.
Adds English title fields to the corpus data.
"""

import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

# Add the project root to the path so we can import the chunk translator
sys.path.insert(0, str(REPO_ROOT))

sys.path.insert(0, str(REPO_ROOT / "attic" / "development_2025-08-21" / "orphica"))
from chunk_translator import ChunkTranslator, TranslationChunk, TranslatedLine


def extract_hymn_titles():
    """Extract all Greek hymn titles from the corpus."""
    hymns_file = REPO_ROOT / "data" / "gold_standard" / "orphic_hymns.json"
    
    with open(hymns_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    titles = []
    
    # Add proem
    proem_title = "Orpheus to Mousaios"  # Already in English
    titles.append({
        'type': 'proem',
        'greek': 'Orpheus to Mousaios',
        'english': 'Orpheus to Mousaios',
        'number': None
    })
    
    # Extract hymn titles
    for hymn in data['content']['hymns']:
        titles.append({
            'type': 'hymn',
            'greek': hymn['title'],
            'english': None,  # To be translated
            'number': hymn['number']
        })
    
    # Add appendix if it exists
    if 'appendix' in data['content']:
        appendix_title = data['content']['appendix']['title']
        titles.append({
            'type': 'appendix',
            'greek': appendix_title,
            'english': None,  # To be translated
            'number': None
        })
    
    return titles


def translate_titles(titles):
    """Translate Greek hymn titles to English using ChunkTranslator."""
    translator = ChunkTranslator(
        text_metadata={
            "title": "Orphic Hymns",
            "author": "Pseudo-Orpheus", 
            "period": "2nd-3rd century CE",
            "genre": "Religious Poetry - Mystery Cult Invocations",
            "content_type": "hymn_titles"
        }
    )
    
    for title_entry in titles:
        if title_entry['english'] is not None:
            print(f"Skipping {title_entry['greek']} (already in English)")
            continue
            
        greek_title = title_entry['greek']
        print(f"Translating: {greek_title}")
        
        # Create chunk data in the format expected by translate_chunk
        chunk_lines = [{"n": 1, "gr": greek_title}]
        
        # Translate using the same method as hymn content
        try:
            translated_chunk = translator.translate_chunk(
                chunk_lines=chunk_lines,
                chunk_id=1
            )
            
            english_title = translated_chunk.lines[0].english
            title_entry['english'] = english_title
            
            print(f"  → {english_title}")
            
        except Exception as e:
            print(f"  ERROR translating '{greek_title}': {e}")
            # Fallback to basic translation
            title_entry['english'] = f"[Translation needed: {greek_title}]"
    
    return titles


def update_corpus_files(titles):
    """Update all corpus files with English title translations."""
    
    # Create title lookup
    title_lookup = {}
    for title_entry in titles:
        title_lookup[title_entry['greek']] = title_entry['english']
    
    # Files to update
    files_to_update = [
        str(REPO_ROOT / "web" / "public" / "orphic_hymns_sentences.json"),
        str(REPO_ROOT / "web" / "public" / "orphic_hymns_parallel.json"),
        str(REPO_ROOT / "data" / "gold_standard" / "orphic_hymns_parallel.json"),
        str(REPO_ROOT / "data" / "gold_standard" / "chunked" / "orphic_hymns_sentences.json"),
    ]
    
    for file_path in files_to_update:
        file_path = Path(file_path)
        if not file_path.exists():
            print(f"Skipping {file_path} (not found)")
            continue
            
        print(f"Updating {file_path}")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Update sections with English titles
        if 'sections' in data:
            for section in data['sections']:
                greek_title = section.get('title', '')
                if greek_title in title_lookup:
                    section['title_english'] = title_lookup[greek_title]
                    print(f"  Added English title: {greek_title} → {title_lookup[greek_title]}")
        
        # Save updated file
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    
    # Also update the main gold standard file
    hymns_file = REPO_ROOT / "data" / "gold_standard" / "orphic_hymns.json"
    with open(hymns_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    for hymn in data['content']['hymns']:
        greek_title = hymn['title']
        if greek_title in title_lookup:
            hymn['title_english'] = title_lookup[greek_title]
    
    with open(hymns_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print("Updated main gold standard file")


def main():
    print("Extracting Orphic Hymn titles...")
    titles = extract_hymn_titles()
    
    print(f"Found {len(titles)} titles to translate")
    
    print("\nTranslating titles using GPT-5 reasoning...")
    translated_titles = translate_titles(titles)
    
    print("\nUpdating corpus files with English titles...")
    update_corpus_files(translated_titles)
    
    print("\nTitle translation complete!")
    
    # Save translation results
    results_file = REPO_ROOT / "data" / "sources" / "hymn_title_translations.json"
    with open(results_file, 'w', encoding='utf-8') as f:
        json.dump(translated_titles, f, ensure_ascii=False, indent=2)
    
    print(f"Translation results saved to: {results_file}")


if __name__ == "__main__":
    main()
