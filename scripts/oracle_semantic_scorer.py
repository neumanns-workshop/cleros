#!/usr/bin/env python3
"""
Oracle Semantic Line Scorer
Calculates semantic similarity between user queries and individual lines for highlighting.
"""

import json
import numpy as np
from pathlib import Path
from typing import Dict, List, Tuple
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class OracleSemanticScorer:
    """Scores lines semantically against user queries for oracle highlighting."""
    
    def __init__(self, base_path: str = "/Users/jneumann/Repos/cleros"):
        self.base_path = Path(base_path)
        self.model = SentenceTransformer('all-MiniLM-L6-v2')  # Same model as embeddings
        
        # Load line embeddings for all corpora
        self.line_data = {}
        self._load_line_embeddings()
    
    def _load_line_embeddings(self):
        """Load pre-computed line embeddings for all three corpora."""
        corpora = {
            "hymns": "embeddings/orphic_hymns_lines",
            "argonautica": "embeddings/orphic_argonautica_lines", 
            "lithica": "embeddings/orphic_lithica_lines"
        }
        
        for corpus_key, embedding_dir in corpora.items():
            embedding_path = self.base_path / embedding_dir
            
            try:
                # Load metadata
                metadata_path = embedding_path / "line_metadata.json"
                with open(metadata_path, 'r', encoding='utf-8') as f:
                    metadata = json.load(f)
                
                # Load embeddings
                embeddings_path = embedding_path / "line_embeddings.npy"
                embeddings = np.load(embeddings_path)
                
                self.line_data[corpus_key] = {
                    "metadata": metadata,
                    "embeddings": embeddings,
                    "lines": metadata["lines"]
                }
                
                logger.info(f"✅ Loaded {corpus_key}: {len(metadata['lines'])} lines, {embeddings.shape} embeddings")
                
            except Exception as e:
                logger.error(f"❌ Failed to load {corpus_key}: {e}")
    
    def score_query_against_lines(self, query: str, corpus_key: str, section_lines: List[Dict] = None) -> List[Dict]:
        """
        Score a query against lines in a corpus section.
        
        Args:
            query: User's oracle query
            corpus_key: Which corpus (hymns, argonautica, lithica)
            section_lines: Specific lines to score (if None, scores all lines)
            
        Returns:
            List of line data with similarity scores and transparency values
        """
        if corpus_key not in self.line_data:
            logger.error(f"No data loaded for corpus: {corpus_key}")
            return []
        
        # Generate query embedding
        query_embedding = self.model.encode([query])
        
        corpus_data = self.line_data[corpus_key]
        all_lines = corpus_data["lines"]
        all_embeddings = corpus_data["embeddings"]
        
        # If specific lines provided, filter to those
        if section_lines:
            # Create a mapping of line numbers to indices
            line_to_index = {line["line"]: i for i, line in enumerate(all_lines)}
            
            # Get embeddings for the specific lines
            line_indices = []
            filtered_lines = []
            
            for section_line in section_lines:
                line_num = section_line.get("line")
                if line_num in line_to_index:
                    idx = line_to_index[line_num]
                    line_indices.append(idx)
                    filtered_lines.append(all_lines[idx])
            
            if not line_indices:
                logger.warning(f"No matching lines found for scoring in {corpus_key}")
                return []
            
            lines_to_score = filtered_lines
            embeddings_to_score = all_embeddings[line_indices]
        else:
            lines_to_score = all_lines
            embeddings_to_score = all_embeddings
        
        # Calculate cosine similarities
        similarities = cosine_similarity(query_embedding, embeddings_to_score)[0]
        
        # Create scored lines with transparency values
        scored_lines = []
        for i, (line, similarity) in enumerate(zip(lines_to_score, similarities)):
            # Convert similarity to transparency (higher similarity = lower transparency = more opaque)
            # Similarity range is typically [-1, 1], but cosine is usually [0, 1]
            # Map to transparency: high similarity -> low transparency (more visible)
            transparency = max(0.1, 1.0 - similarity)  # Keep minimum 10% opacity
            
            scored_line = {
                **line,
                "similarity": float(similarity),
                "transparency": float(transparency),
                "opacity": float(1.0 - transparency),  # For CSS opacity
                "rank": i + 1  # Will be updated after sorting
            }
            scored_lines.append(scored_line)
        
        # Sort by similarity (highest first)
        scored_lines.sort(key=lambda x: x["similarity"], reverse=True)
        
        # Update ranks after sorting
        for i, line in enumerate(scored_lines):
            line["rank"] = i + 1
        
        logger.info(f"Scored {len(scored_lines)} lines for query: '{query[:50]}...'")
        logger.info(f"Top similarity: {scored_lines[0]['similarity']:.4f}")
        logger.info(f"Lowest transparency: {scored_lines[0]['transparency']:.4f}")
        
        return scored_lines
    
    def get_oracle_passage_scores(self, query: str, oracle_selection: Dict) -> Dict:
        """
        Score all lines in an oracle selection (hymn, argonautica, lithica passages).
        
        Args:
            query: User's oracle query
            oracle_selection: Oracle response with selected passages
            
        Returns:
            Dict with scored lines for each corpus
        """
        oracle_scores = {}
        
        # Map oracle selection keys to corpus keys
        corpus_mapping = {
            "hymns": "hymns",
            "argonautica": "argonautica", 
            "lithica": "lithica"
        }
        
        for selection_key, corpus_key in corpus_mapping.items():
            if selection_key in oracle_selection.get("selections", {}):
                selection_data = oracle_selection["selections"][selection_key]
                
                # Extract line range or use sentence metadata to get lines
                # This might need adjustment based on oracle selection structure
                logger.info(f"Scoring {selection_key} passage for semantic relevance...")
                
                # For now, score a reasonable range around the selected sentence
                # You might want to adjust this based on your specific needs
                scored_lines = self.score_query_against_lines(query, corpus_key)
                
                # Take a contextual window around the selected sentence
                # This is a placeholder - you'll want to refine based on actual selection
                oracle_scores[selection_key] = {
                    "scored_lines": scored_lines[:50],  # Top 50 most relevant lines
                    "query": query,
                    "corpus": corpus_key,
                    "selection_metadata": selection_data
                }
        
        return oracle_scores
    
    def demo_semantic_scoring(self, query: str = "divine wisdom and sacred guidance"):
        """Demo the semantic scoring system."""
        logger.info(f"🔍 Demo: Semantic scoring for query: '{query}'")
        
        for corpus_key in ["hymns", "argonautica", "lithica"]:
            logger.info(f"\n📖 Scoring {corpus_key.title()}...")
            
            scored_lines = self.score_query_against_lines(query, corpus_key)
            
            if scored_lines:
                logger.info(f"Total lines scored: {len(scored_lines)}")
                logger.info(f"Top 5 most relevant lines:")
                
                for i, line in enumerate(scored_lines[:5]):
                    logger.info(f"  {i+1}. Line {line['line']}: {line['english'][:60]}...")
                    logger.info(f"     Similarity: {line['similarity']:.4f}, Opacity: {line['opacity']:.2f}")
            else:
                logger.warning(f"No lines scored for {corpus_key}")

def main():
    """Demo the semantic scoring system."""
    scorer = OracleSemanticScorer()
    
    # Test with sample oracle queries
    test_queries = [
        "divine wisdom and sacred guidance",
        "protection from evil and darkness", 
        "love and relationships",
        "journey and adventure",
        "sacred stones and mystical properties"
    ]
    
    for query in test_queries:
        logger.info(f"\n{'='*60}")
        scorer.demo_semantic_scoring(query)

if __name__ == "__main__":
    main()
