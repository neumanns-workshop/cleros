#!/usr/bin/env python3
"""
Generate span-level embeddings for specified categories using TensorFlow Hub's 
Universal Sentence Encoder, matching the format of existing files in web/public/data/.
"""

import json
import numpy as np
import tensorflow as tf
import tensorflow_hub as hub
from pathlib import Path
import sys
import time

# --- Configuration ---
HYMN_FILE = Path("web/public/data/hymns.json")
OUTPUT_DIR = Path("web/public/data")
# Categories to generate embeddings for
TARGET_CATEGORIES = [
    "action", 
    "artifact", 
    "beast", 
    "celestial_sphere", 
    "hero", 
    "nature", 
    "other", 
    "other_divinity"
] 
MODEL_URL = "https://tfhub.dev/google/universal-sentence-encoder/4"
MODEL_NAME = "universal-sentence-encoder" # Keep consistent with existing files
EMBEDDING_DIMENSION = 512
CONTEXT_CHARS = 50 # Number of characters before/after span for context snippet

# --- Helper Functions ---

def get_context(full_text, start, end, num_chars=CONTEXT_CHARS):
    """Extract context around a span."""
    context_start = max(0, start - num_chars)
    context_end = min(len(full_text), end + num_chars)
    
    prefix = "..." if context_start > 0 else ""
    suffix = "..." if context_end < len(full_text) else ""
    
    return f"{prefix}{full_text[context_start:start]}<span class='highlight'>{full_text[start:end]}</span>{full_text[end:context_end]}{suffix}"

# --- Main Logic ---

def main():
    start_time = time.time()
    print(f"Starting embedding generation for categories: {', '.join(TARGET_CATEGORIES)}")

    # 1. Load USE Model
    print(f"Loading Universal Sentence Encoder model ({MODEL_URL})...")
    try:
        model = hub.load(MODEL_URL)
        print("Model loaded successfully.")
    except Exception as e:
        print(f"Error loading model: {e}", file=sys.stderr)
        print("Please ensure TensorFlow and TensorFlow Hub are installed (`pip install tensorflow tensorflow_hub`) and you have internet access.", file=sys.stderr)
        sys.exit(1)

    # 2. Load Hymn Data
    print(f"Loading hymn data from {HYMN_FILE}...")
    if not HYMN_FILE.exists():
        print(f"Error: Hymn file not found at {HYMN_FILE}", file=sys.stderr)
        sys.exit(1)
    with open(HYMN_FILE, 'r', encoding='utf-8') as f:
        hymn_data = json.load(f)
    print(f"Loaded data for {len(hymn_data.get('hymns', []))} hymns.")

    # 3. Prepare Data Structures
    spans_by_category = {category: [] for category in TARGET_CATEGORIES}
    metadata_by_category = {category: {"spans": {}, "contexts": {}} for category in TARGET_CATEGORIES}
    
    # 4. Iterate and Extract Spans
    print("Extracting spans for target categories...")
    total_spans_extracted = 0
    for hymn in hymn_data.get("hymns", []):
        hymn_id = hymn.get("id")
        if not hymn_id: continue
        
        for sentence_index, sentence in enumerate(hymn.get("sentences", [])):
            sentence_text = sentence.get("text")
            if not sentence_text: continue

            for span in sentence.get("spans", []):
                category = span.get("category")
                if category in TARGET_CATEGORIES:
                    span_text = span.get("text")
                    start_char = span.get("start_char")
                    end_char = span.get("end_char")
                    
                    if span_text is None or start_char is None or end_char is None: continue

                    # Generate unique ID
                    span_id = f"{hymn_id}-s{sentence_index}-{start_char}"
                    
                    # Store span text for embedding
                    spans_by_category[category].append({"id": span_id, "text": span_text})
                    
                    # Store metadata
                    metadata = span.copy() # Copy existing span data
                    metadata["hymn_id"] = hymn_id
                    metadata["sentence_index"] = sentence_index
                    metadata_by_category[category]["spans"][span_id] = metadata
                    
                    # Store context
                    context_snippet = get_context(sentence_text, start_char, end_char)
                    metadata_by_category[category]["contexts"][span_id] = {
                        "context": context_snippet,
                        "full_sentence": sentence_text
                    }
                    total_spans_extracted += 1

    print(f"Extracted {total_spans_extracted} spans across target categories.")
    if total_spans_extracted == 0:
        print("No relevant spans found. Exiting.")
        sys.exit(0)

    # 5. Generate Embeddings and Save Files per Category
    print("Generating embeddings and saving files...")
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    for category in TARGET_CATEGORIES:
        category_spans = spans_by_category[category]
        category_metadata = metadata_by_category[category]
        
        if not category_spans:
            print(f"  - Skipping category '{category}': No spans found.")
            continue

        print(f"  - Processing category '{category}' ({len(category_spans)} spans)...")
        
        # Generate embeddings
        span_texts = [span["text"] for span in category_spans]
        span_ids = [span["id"] for span in category_spans]
        
        embeddings_np = model(span_texts).numpy()
        
        # Format embeddings JSON
        embeddings_dict = {
            span_id: embedding.tolist() 
            for span_id, embedding in zip(span_ids, embeddings_np)
        }
        output_embeddings_json = {
            "m": MODEL_NAME,
            "d": EMBEDDING_DIMENSION,
            "e": embeddings_dict
        }
        
        # Save embeddings file
        embeddings_filename = OUTPUT_DIR / f"span_embeddings_{category}.json"
        with open(embeddings_filename, 'w', encoding='utf-8') as f:
            json.dump(output_embeddings_json, f) # No indent for embeddings for smaller file size
        print(f"    - Saved embeddings to {embeddings_filename}")

        # Save metadata file
        metadata_filename = OUTPUT_DIR / f"span_metadata_{category}.json"
        with open(metadata_filename, 'w', encoding='utf-8') as f:
            json.dump(category_metadata, f, ensure_ascii=False, indent=2)
        print(f"    - Saved metadata to {metadata_filename}")

    end_time = time.time()
    print(f"\nFinished in {end_time - start_time:.2f} seconds.")
    print(f"Output files saved to: {OUTPUT_DIR}")

if __name__ == "__main__":
    # Ensure the script's working directory is the project root 
    # This makes the relative paths (web/public/data) work correctly
    project_root = Path(__file__).resolve().parent.parent
    import os
    os.chdir(project_root)
    print(f"Changed working directory to: {os.getcwd()}")
    
    main() 