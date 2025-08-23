#!/usr/bin/env python3
"""
Create parallel format for papyrus oracle queries following the established paradigm.
Converts from gold standard to clean Greek-English parallel format.
"""

import json
from datetime import datetime
from pathlib import Path

def create_papyrus_oracle_parallel():
    """Convert papyrus oracle queries to parallel format following established paradigm."""
    
    # Load gold standard data
    source_file = Path("/Users/jneumann/Repos/cleros/data/gold_standard/papyrus_oracle_queries.json")
    with open(source_file, 'r', encoding='utf-8') as f:
        gold_standard = json.load(f)
    
    # Create parallel format following dodona pattern
    parallel_data = {
        "title": "Papyrus Oracle Queries — Parallel Greek-English Edition",
        "created": datetime.now().isoformat(),
        "format": "Oracle consultation texts with facing translations",
        "organization": "By consultation category and formula type",
        "queries": []
    }
    
    for query in gold_standard["content"]["queries"]:
        parallel_query = {
            "id": query["id"],
            "url": query["url"],
            "category": query["category"],
            "intent": query["intent"],
            "formula_type": query["formula_type"],
            "parallel_text": {
                "greek": query["translation"]["greek"],
                "english": query["translation"]["english"],
                "note": query["translation"]["note"]
            },
            "consultation_context": {
                "original_paraphrase": query["context"]["original_paraphrase"],
                "provenance": query["context"]["provenance"],
                "date": query["context"]["date"],
                "addressee": query["context"]["addressee"],
                "petitioner": query["context"]["petitioner"],
                "notes": query["context"]["notes"]
            }
        }
        
        parallel_data["queries"].append(parallel_query)
    
    # Save to both locations following the paradigm
    # 1. Gold standard location
    gs_output = Path("/Users/jneumann/Repos/cleros/data/gold_standard/papyrus_oracle_queries_parallel.json")
    with open(gs_output, 'w', encoding='utf-8') as f:
        json.dump(parallel_data, f, indent=2, ensure_ascii=False)
    
    # 2. Web public location  
    web_output = Path("/Users/jneumann/Repos/cleros/web/public/papyrus_oracle_queries_parallel.json")
    with open(web_output, 'w', encoding='utf-8') as f:
        json.dump(parallel_data, f, indent=2, ensure_ascii=False)
    
    print(f"Created parallel format with {len(parallel_data['queries'])} queries")
    print(f"Gold standard: {gs_output}")
    print(f"Web public: {web_output}")
    
    return parallel_data

if __name__ == "__main__":
    create_papyrus_oracle_parallel()
