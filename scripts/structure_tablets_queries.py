#!/usr/bin/env python3
"""
Structure Golden Tablets and Oracle Queries for the web interface.
Converts them to match the expected sections/sentences/line_details format.
"""

import json
from pathlib import Path

def structure_golden_tablets():
    """Convert Golden Tablets to structured format for web interface."""
    
    # Load original data
    source_file = Path("/Users/jneumann/Repos/cleros/web/public/orphic_golden_tablets.json")
    with open(source_file, 'r', encoding='utf-8') as f:
        original_data = json.load(f)
    
    # Create structured version
    structured_data = {
        "title": "Orphic Golden Tablets — Web Edition",
        "source_file": "orphic_golden_tablets.json",
        "created": "2025-01-18T12:30:00.000000",
        "format": "Web-compatible structure preserving tablet content",
        "structure_method": "Individual tablet sections",
        "sections": []
    }
    
    for i, tablet in enumerate(original_data["content"]["tablets"]):
        # Create a section for each tablet
        section = {
            "title": f"{tablet['id']} — {tablet['provenance']}",
            "type": "tablet",
            "tablet_id": tablet["id"],
            "provenance": tablet["provenance"],
            "date": tablet["date"],
            "formula_family": tablet["formula_family"],
            "ritual_use": tablet["ritual_use"],
            "original_line_count": 1,  # Each tablet is treated as one "line"
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
                        "english": tablet["translation"]["english"],
                        "greek": tablet["translation"]["greek"]
                    },
                    "line_count": 1,
                    "line_details": [
                        {
                            "line": 1,
                            "english": tablet["translation"]["english"],
                            "greek": tablet["translation"]["greek"],
                            "note": tablet["translation"]["note"]
                        }
                    ]
                }
            ]
        }
        
        structured_data["sections"].append(section)
    
    # Write structured file
    output_file = Path("/Users/jneumann/Repos/cleros/web/public/orphic_golden_tablets_structured.json")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(structured_data, f, indent=2, ensure_ascii=False)
    
    print(f"Created structured Golden Tablets with {len(structured_data['sections'])} tablets")
    return output_file

def structure_oracle_queries():
    """Convert Oracle Queries to structured format for web interface."""
    
    # Load original data
    source_file = Path("/Users/jneumann/Repos/cleros/web/public/dodona_oracle_queries.json")
    with open(source_file, 'r', encoding='utf-8') as f:
        original_data = json.load(f)
    
    # Create structured version
    structured_data = {
        "title": "Dodona Oracle Queries — Web Edition",
        "source_file": "dodona_oracle_queries.json",
        "created": "2025-01-18T12:30:00.000000",
        "format": "Web-compatible structure preserving query content",
        "structure_method": "Individual query sections",
        "sections": []
    }
    
    for i, query in enumerate(original_data["content"]["queries"]):
        # Create a section for each query
        section = {
            "title": f"{query['id']} — {query['category']}",
            "type": "query",
            "query_id": query["id"],
            "category": query["category"],
            "intent": query["intent"],
            "formula_type": query["formula_type"],
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
    output_file = Path("/Users/jneumann/Repos/cleros/web/public/dodona_oracle_queries_structured.json")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(structured_data, f, indent=2, ensure_ascii=False)
    
    print(f"Created structured Oracle Queries with {len(structured_data['sections'])} queries")
    return output_file

if __name__ == "__main__":
    print("Structuring Golden Tablets and Oracle Queries for web interface...")
    
    tablets_file = structure_golden_tablets()
    queries_file = structure_oracle_queries()
    
    print(f"\nCreated structured files:")
    print(f"- {tablets_file}")
    print(f"- {queries_file}")
    print("\nNow update the web app to include these in navigation.")
