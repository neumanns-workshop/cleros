#!/usr/bin/env python3
"""
Generate embeddings compatible with TensorFlow.js Universal Sentence Encoder
This ensures embeddings have the same dimensions (512) as those used in the browser
"""

import os
import json
import time
import numpy as np
import tensorflow as tf
import tensorflow_hub as hub
from datetime import datetime
from pathlib import Path

# Configuration
BASE_DIR = Path("web/public/data/base")
OUTPUT_DIR = Path("web/public/data/enriched/embeddings")

# Universal Sentence Encoder model URL - same as the one used in browser (512 dimensions)
MODEL_URL = "https://tfhub.dev/google/universal-sentence-encoder/4"

def load_hymn_data():
    """Load all hymn data from JSON files"""
    hymns = {}
    
    for file_path in BASE_DIR.glob("hymn_*.json"):
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            hymns[data["hymn_id"]] = data
    
    return hymns

def generate_embeddings(hymns, model):
    """Generate embeddings for all hymn lines"""
    sentence_embeddings = {}
    total_lines = 0
    
    print(f"Processing {len(hymns)} hymns...")
    
    for hymn_id, hymn_data in hymns.items():
        print(f"Processing hymn {hymn_id}...")
        
        # Process individual lines
        sentence_embeddings[hymn_id] = {}
        lines = hymn_data["lines"]
        
        # Process in batches for efficiency
        batch_size = 100
        for i in range(0, len(lines), batch_size):
            batch = lines[i:i+batch_size]
            embeddings = model(batch).numpy()
            
            for j, embedding in enumerate(embeddings):
                line_index = i + j
                if line_index < len(lines):
                    # Convert to Python list for JSON serialization
                    embedding_list = embedding.tolist()
                    
                    sentence_embeddings[hymn_id][str(line_index)] = {
                        "text": lines[line_index],
                        "embedding": embedding_list
                    }
        
        total_lines += len(lines)
    
    # Generate metadata
    first_hymn_id = next(iter(sentence_embeddings))
    first_line_id = next(iter(sentence_embeddings[first_hymn_id]))
    embedding_dimension = len(sentence_embeddings[first_hymn_id][first_line_id]["embedding"])
    
    metadata = {
        "model_name": "tensorflow/universal-sentence-encoder",
        "embedding_dimension": embedding_dimension,
        "total_hymns": len(sentence_embeddings),
        "total_sentences": total_lines,
        "generated_at": datetime.now().isoformat()
    }
    
    return sentence_embeddings, metadata

def main():
    """Main function to generate embeddings"""
    try:
        print("Loading hymn data...")
        hymns = load_hymn_data()
        
        print("Loading Universal Sentence Encoder model...")
        model = hub.load(MODEL_URL)
        
        print("Generating embeddings...")
        sentence_embeddings, metadata = generate_embeddings(hymns, model)
        
        print("Saving embeddings...")
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        
        # Backup original embeddings
        original_embeddings_path = OUTPUT_DIR / "sentence_embeddings.json"
        if original_embeddings_path.exists():
            backup_path = OUTPUT_DIR / f"sentence_embeddings.backup-{int(time.time())}.json"
            with open(original_embeddings_path, "r") as src, open(backup_path, "w") as dst:
                dst.write(src.read())
            print(f"Original embeddings backed up to: {backup_path}")
        
        # Save new embeddings
        with open(OUTPUT_DIR / "sentence_embeddings.json", "w", encoding="utf-8") as f:
            json.dump(sentence_embeddings, f, ensure_ascii=False, indent=2)
        
        # Save metadata
        with open(OUTPUT_DIR / "embeddings_metadata.json", "w", encoding="utf-8") as f:
            json.dump(metadata, f, ensure_ascii=False, indent=2)
        
        print("Done!")
        print(f"Output saved to: {OUTPUT_DIR}")
        
        # Print statistics
        print("\nStatistics:")
        print(f"Total hymns processed: {metadata['total_hymns']}")
        print(f"Total sentences embedded: {metadata['total_sentences']}")
        print(f"Embedding dimension: {metadata['embedding_dimension']}")
        
    except Exception as e:
        print(f"Error generating embeddings: {e}")
        raise

if __name__ == "__main__":
    main() 