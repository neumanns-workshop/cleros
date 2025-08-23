#!/usr/bin/env python3
"""
Regenerate clean embeddings from unified corpus files
- Minimal structure: just ID → vector mapping
- Complete coverage: all 6 corpora
- Sentence + Line embeddings for each
"""
import json
import numpy as np
from datetime import datetime
import os

try:
    from sentence_transformers import SentenceTransformer
    print("✅ SentenceTransformers available")
except ImportError:
    print("❌ Need to install: pip install sentence-transformers")
    exit(1)

def load_unified_corpus(corpus_name):
    """Load unified corpus file"""
    filepath = f"public/corpus_20250822_121628/{corpus_name}.json"
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def generate_sentence_embeddings(corpus_name, model):
    """Generate sentence embeddings for a corpus"""
    print(f"📝 Processing {corpus_name} sentences...")
    
    corpus = load_unified_corpus(corpus_name)
    sentences = []
    sentence_ids = []
    
    # Collect all sentences from all parts
    for part in corpus['parts']:
        for sentence in part.get('sentences', []):
            sentences.append(sentence['text']['english'])
            # Create global unique ID: corpus_partnum_sentenceid
            global_id = f"{corpus_name}_{part['part_number']}_{sentence['sentence_id']}"
            sentence_ids.append(global_id)
    
    print(f"   Found {len(sentences)} sentences")
    
    # Generate embeddings
    embeddings = model.encode(sentences, show_progress_bar=True)
    
    # Create minimal metadata
    metadata = {
        "corpus": corpus_name,
        "type": "sentence_embeddings",
        "total_sentences": len(sentences),
        "embedding_dimension": embeddings.shape[1],
        "model": "all-MiniLM-L6-v2",
        "created": datetime.now().isoformat(),
        "mapping": [
            {"id": sentence_ids[i], "index": i} 
            for i in range(len(sentence_ids))
        ]
    }
    
    return embeddings, metadata

def generate_line_embeddings(corpus_name, model):
    """Generate line embeddings for a corpus"""
    print(f"📏 Processing {corpus_name} lines...")
    
    corpus = load_unified_corpus(corpus_name)
    lines = []
    line_ids = []
    
    # Collect all lines from all sentences in all parts
    for part in corpus['parts']:
        for sentence in part.get('sentences', []):
            for line_detail in sentence.get('line_details', []):
                lines.append(line_detail['english'])
                # Create global unique ID: corpus_partnum_sentenceid_linenum
                global_id = f"{corpus_name}_{part['part_number']}_{sentence['sentence_id']}_{line_detail['line']}"
                line_ids.append(global_id)
    
    print(f"   Found {len(lines)} lines")
    
    # Generate embeddings
    embeddings = model.encode(lines, show_progress_bar=True)
    
    # Create minimal metadata
    metadata = {
        "corpus": corpus_name,
        "type": "line_embeddings", 
        "total_lines": len(lines),
        "embedding_dimension": embeddings.shape[1],
        "model": "all-MiniLM-L6-v2",
        "created": datetime.now().isoformat(),
        "mapping": [
            {"id": line_ids[i], "index": i} 
            for i in range(len(line_ids))
        ]
    }
    
    return embeddings, metadata

def save_embeddings(corpus_name, embed_type, embeddings, metadata):
    """Save embeddings and metadata"""
    output_dir = f"public/embeddings/{corpus_name}"
    os.makedirs(output_dir, exist_ok=True)
    
    # Save embeddings as numpy array
    np.save(f"{output_dir}/{embed_type}.npy", embeddings)
    
    # Save metadata as JSON
    with open(f"{output_dir}/{embed_type}_metadata.json", 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)
    
    print(f"   💾 Saved {output_dir}/{embed_type}.npy ({embeddings.shape})")

def main():
    print("🚀 Regenerating clean embeddings from unified corpus files...")
    
    # Initialize model
    print("📦 Loading SentenceTransformer model...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    
    # All corpus files
    corpora = [
        'hymns',
        'argonautica', 
        'lithica',
        'tablets',
        'dodona_queries',
        'papyrus_queries'
    ]
    
    # Create output directory
    os.makedirs("public/embeddings", exist_ok=True)
    
    for corpus_name in corpora:
        print(f"\n🔄 Processing {corpus_name}...")
        
        try:
            # Generate sentence embeddings
            sentence_embeddings, sentence_metadata = generate_sentence_embeddings(corpus_name, model)
            save_embeddings(corpus_name, "sentences", sentence_embeddings, sentence_metadata)
            
            # Generate line embeddings  
            line_embeddings, line_metadata = generate_line_embeddings(corpus_name, model)
            save_embeddings(corpus_name, "lines", line_embeddings, line_metadata)
            
        except Exception as e:
            print(f"❌ Error processing {corpus_name}: {e}")
    
    print(f"\n✅ Complete! Clean embeddings generated in public/embeddings/")
    
    # Show summary
    print("\n📊 SUMMARY:")
    for corpus_name in corpora:
        try:
            with open(f"public/embeddings/{corpus_name}/sentences_metadata.json", 'r') as f:
                s_meta = json.load(f)
            with open(f"public/embeddings/{corpus_name}/lines_metadata.json", 'r') as f:
                l_meta = json.load(f)
            print(f"   {corpus_name}: {s_meta['total_sentences']} sentences, {l_meta['total_lines']} lines")
        except:
            print(f"   {corpus_name}: Error reading metadata")

if __name__ == "__main__":
    main()