#!/usr/bin/env python3
"""
Generate Line Embeddings for Oracle Semantic Highlighting
Creates embeddings for each line of text in the three main corpora.
"""

import json
import numpy as np
from pathlib import Path
from typing import Dict, List, Tuple
from sentence_transformers import SentenceTransformer
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LineEmbeddingGenerator:
    """Generates embeddings for individual lines of text."""
    
    def __init__(self, base_path: str = None):
        REPO_ROOT = Path(__file__).resolve().parent.parent
        self.base_path = Path(base_path) if base_path else REPO_ROOT
        self.model = SentenceTransformer('all-MiniLM-L6-v2')  # Same model as used for sentences
        
        self.corpus_info = {
            "orphic_hymns": {
                "name": "Orphic Hymns",
                "chunked_path": "data/gold_standard/chunked/orphic_hymns_sentences.json",
                "output_dir": "embeddings/orphic_hymns_lines"
            },
            "orphic_argonautica": {
                "name": "Orphic Argonautica", 
                "chunked_path": "data/gold_standard/chunked/orphic_argonautica_sentences.json",
                "output_dir": "embeddings/orphic_argonautica_lines"
            },
            "orphic_lithica": {
                "name": "Orphic Lithica",
                "chunked_path": "data/gold_standard/chunked/orphic_lithica_sentences.json", 
                "output_dir": "embeddings/orphic_lithica_lines"
            }
        }
    
    def extract_lines_from_chunked_data(self, chunked_data: Dict) -> List[Dict]:
        """Extract line data from chunked sentence data."""
        lines = []
        
        # Handle the top-level structure with 'sections' array
        sections = chunked_data.get('sections', [])
        
        for section in sections:
            if 'sentences' in section:
                for sentence in section['sentences']:
                    if 'line_details' in sentence:
                        for line_detail in sentence['line_details']:
                            line_data = {
                                **line_detail,
                                'sentence_id': sentence['sentence_id'],
                                'sentence_text': sentence.get('text', {}),
                                'section_title': section.get('title', ''),
                                'section_type': section.get('type', ''),
                                'source': chunked_data.get('source_file', '')
                            }
                            lines.append(line_data)
        
        # Sort by line number for consistent ordering
        lines.sort(key=lambda x: x.get('line', 0))
        return lines
    
    def generate_line_embeddings(self, corpus_key: str) -> Tuple[List[Dict], np.ndarray]:
        """Generate embeddings for all lines in a corpus."""
        corpus_info = self.corpus_info[corpus_key]
        chunked_path = self.base_path / corpus_info["chunked_path"]
        
        logger.info(f"Loading chunked data from: {chunked_path}")
        
        # Load chunked data
        with open(chunked_path, 'r', encoding='utf-8') as f:
            chunked_data = json.load(f)
        
        # Extract lines
        lines = self.extract_lines_from_chunked_data(chunked_data)
        logger.info(f"Extracted {len(lines)} lines from {corpus_info['name']}")
        
        # Extract English text for each line
        line_texts = []
        for line in lines:
            text = line.get('english', '').strip()
            if text:
                line_texts.append(text)
            else:
                line_texts.append("")  # Empty text for missing lines
        
        logger.info(f"Generating embeddings for {len(line_texts)} line texts...")
        
        # Generate embeddings
        embeddings = self.model.encode(line_texts, show_progress_bar=True)
        
        logger.info(f"Generated embeddings with shape: {embeddings.shape}")
        
        return lines, embeddings
    
    def save_line_embeddings(self, corpus_key: str, lines: List[Dict], embeddings: np.ndarray):
        """Save line embeddings and metadata."""
        corpus_info = self.corpus_info[corpus_key]
        output_dir = self.base_path / corpus_info["output_dir"]
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Save metadata
        metadata_path = output_dir / "line_metadata.json"
        metadata = {
            "corpus": corpus_info["name"],
            "total_lines": len(lines),
            "embedding_dim": embeddings.shape[1] if len(embeddings.shape) > 1 else 0,
            "model": "all-MiniLM-L6-v2",
            "lines": lines
        }
        
        with open(metadata_path, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)
        
        # Save embeddings as numpy array
        embeddings_path = output_dir / "line_embeddings.npy"
        np.save(embeddings_path, embeddings)
        
        # Save JSON version for easier access
        embeddings_json_path = output_dir / "line_embeddings.json"
        embeddings_data = {
            "embeddings": embeddings.tolist(),
            "metadata": metadata
        }
        
        with open(embeddings_json_path, 'w', encoding='utf-8') as f:
            json.dump(embeddings_data, f, indent=2)
        
        logger.info(f"✅ Saved {corpus_info['name']} line embeddings:")
        logger.info(f"   Metadata: {metadata_path}")
        logger.info(f"   Embeddings: {embeddings_path}")
        logger.info(f"   JSON: {embeddings_json_path}")
    
    def generate_all_line_embeddings(self):
        """Generate line embeddings for all three main corpora."""
        logger.info("🚀 Starting line embedding generation for all corpora...")
        
        for corpus_key in self.corpus_info.keys():
            try:
                logger.info(f"\n📖 Processing {self.corpus_info[corpus_key]['name']}...")
                lines, embeddings = self.generate_line_embeddings(corpus_key)
                self.save_line_embeddings(corpus_key, lines, embeddings)
                
                # Show sample lines
                logger.info(f"Sample lines from {corpus_key}:")
                for i, line in enumerate(lines[:3]):
                    logger.info(f"  Line {line.get('line', i)}: {line.get('english', '')[:60]}...")
                
            except Exception as e:
                logger.error(f"❌ Error processing {corpus_key}: {e}")
        
        logger.info("\n🎉 Line embedding generation complete!")

def main():
    """Main function to generate line embeddings."""
    generator = LineEmbeddingGenerator()
    generator.generate_all_line_embeddings()

if __name__ == "__main__":
    main()
