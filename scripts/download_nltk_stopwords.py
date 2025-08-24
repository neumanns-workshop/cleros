#!/usr/bin/env python3
"""
Download NLTK Stop Words
Downloads the official NLTK English stop words corpus and saves it for our oracle system.
"""

import json
import nltk
from pathlib import Path

def download_nltk_stopwords():
    """Download NLTK stop words and save to our data directory."""
    try:
        # Download the stopwords corpus
        print("Downloading NLTK stopwords corpus...")
        nltk.download('stopwords', quiet=True)
        
        # Import stopwords after download
        from nltk.corpus import stopwords
        
        # Get English stop words
        english_stopwords = stopwords.words('english')
        
        print(f"Downloaded {len(english_stopwords)} English stop words")
        print(f"Sample words: {english_stopwords[:20]}")
        print(f"Contains 'and': {'and' in english_stopwords}")
        print(f"Contains 'the': {'the' in english_stopwords}")
        print(f"Contains 'of': {'of' in english_stopwords}")
        
        # Save to our data directory
        output_path = Path("/Users/jneumann/Repos/cleros/data/nltk_stopwords.json")
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(sorted(english_stopwords), f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Saved NLTK stop words to: {output_path}")
        
        return english_stopwords
        
    except Exception as e:
        print(f"❌ Error downloading NLTK stop words: {e}")
        return None

if __name__ == "__main__":
    download_nltk_stopwords()
