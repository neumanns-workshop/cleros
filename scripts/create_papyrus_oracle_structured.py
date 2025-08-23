#!/usr/bin/env python3
"""
Create structured version of papyrus oracle queries for web interface.
Converts them to match the sections/sentences/line_details format expected by carousel and corpus explorer.
"""

import json
from datetime import datetime
from pathlib import Path

def create_papyrus_oracle_structured():
    """Convert papyrus oracle queries to structured format for web interface."""
    
    # Load original data
    source_file = Path("/Users/jneumann/Repos/cleros/web/public/papyrus_oracle_queries.json")
    with open(source_file, 'r', encoding='utf-8') as f:
        original_data = json.load(f)
    
    # Create structured version
    structured_data = {
        "title": "Papyrus Oracle Queries — Web Edition",
        "source_file": "papyrus_oracle_queries.json",
        "created": datetime.now().isoformat(),
        "format": "Web-compatible structure preserving query content",
        "structure_method": "Individual query sections",
        "sections": []
    }
    
    for query in original_data["content"]["queries"]:
        # Create a section for each query (following golden tablets pattern)
        section = {
            "title": f"{query['id']} — {query['context']['provenance']}",
            "type": "query",
            "query_id": query["id"],
            "category": query["category"],
            "intent": query["intent"],
            "formula_type": query["formula_type"],
            "provenance": query["context"]["provenance"],
            "date": query["context"]["date"],
            "addressee": query["context"]["addressee"],
            "petitioner": query["context"]["petitioner"],
            "url": query.get("url", ""),
            "original_line_count": 1,  # Each query is treated as one "line"
            "sentence_count": 1,
            "sentences": [
                {
                    "sentence_id": 1,
                    "line_range": {
                        "start": 1,
                        "end": 1,
                        "lines": [1]
                    },
                    "text": {
                        "english": query["translation"]["english"],
                        "greek": query["translation"]["greek"]
                    },
                    "line_count": 1,
                    "line_details": [
                        {
                            "line": 1,
                            "english": query["translation"]["english"],
                            "greek": query["translation"]["greek"],
                            "note": query["translation"]["note"]
                        }
                    ]
                }
            ]
        }
        
        structured_data["sections"].append(section)
    
    # Write structured file
    output_file = Path("/Users/jneumann/Repos/cleros/web/public/papyrus_oracle_queries_structured.json")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(structured_data, f, indent=2, ensure_ascii=False)
    
    print(f"Created structured Papyrus Oracle Queries with {len(structured_data['sections'])} queries")
    return output_file

if __name__ == "__main__":
    create_papyrus_oracle_structured()
