#!/usr/bin/env python3
"""
Convert papyrus oracle queries from CSV to gold standard JSON format.
Prepares them for translation using the existing chunk translator system.
"""

import csv
import json
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional


def categorize_query(question_summary: str, notes: str) -> str:
    """Categorize query based on content summary."""
    summary_lower = question_summary.lower()
    notes_lower = notes.lower()
    content = f"{summary_lower} {notes_lower}"
    
    # Map content to categories similar to Dodona queries
    if any(word in content for word in ['health', 'recover', 'medical', 'doctor', 'eye', 'therapy']):
        return "Health"
    elif any(word in content for word in ['marry', 'marriage', 'wedding']):
        return "Marriage"
    elif any(word in content for word in ['business', 'buy', 'slave', 'trade', 'advantageous']):
        return "Business"
    elif any(word in content for word in ['nomarch', 'administrative', 'examine', 'angry', 'authority']):
        return "Administrative"
    elif any(word in content for word in ['judgment', 'dissolve', 'legal']):
        return "Legal"
    elif any(word in content for word in ['question', 'oracle', 'ask']):
        return "General Oracle Consultation"
    else:
        return "Unspecified"


def determine_formula_type(question_summary: str, greek_excerpt: str) -> str:
    """Determine formula type based on question structure."""
    summary_lower = question_summary.lower()
    greek_lower = greek_excerpt.lower() if greek_excerpt else ""
    
    if 'if' in summary_lower or 'εἰ' in greek_lower:
        if 'recover' in summary_lower or 'advantageous' in summary_lower:
            return "if-better-or-advantageous"
        else:
            return "if-will-happen"
    elif 'granted' in summary_lower or 'δέδοται' in greek_lower:
        return "if-granted"
    elif 'whether' in summary_lower or 'εἰ' in greek_lower:
        return "whether-question"
    elif any(word in summary_lower for word in ['ask', 'question', 'seeks']):
        return "general-petition"
    else:
        return "unspecified-formula"


def extract_intent_keywords(question_summary: str, addressee: str, notes: str) -> List[str]:
    """Extract intent keywords from query content."""
    content = f"{question_summary} {addressee} {notes}".lower()
    
    intents = []
    
    # Health-related
    if any(word in content for word in ['health', 'recover', 'medical', 'doctor', 'eye', 'therapy']):
        intents.extend(['HEALTH', 'HEALING'])
    
    # Marriage/relationship
    if any(word in content for word in ['marry', 'marriage', 'wedding']):
        intents.extend(['MARRIAGE', 'RELATIONSHIP'])
    
    # Business/economic
    if any(word in content for word in ['buy', 'slave', 'trade', 'business']):
        intents.extend(['BUSINESS', 'ECONOMIC'])
    
    # Administrative/legal
    if any(word in content for word in ['nomarch', 'administrative', 'authority', 'legal', 'judgment']):
        intents.extend(['ADMINISTRATIVE', 'LEGAL'])
    
    # Divine guidance
    if any(word in content for word in ['oracle', 'god', 'divine', 'consultation']):
        intents.append('DIVINE_GUIDANCE')
    
    # Permission/approval
    if any(word in content for word in ['permission', 'granted', 'allow', 'permit']):
        intents.append('PERMISSION')
    
    return list(set(intents)) if intents else ['GENERAL']


def create_papyrus_oracle_queries_json(csv_file_path: str) -> Dict[str, Any]:
    """Convert CSV papyrus oracle queries to gold standard JSON format."""
    
    # Read CSV data
    queries = []
    with open(csv_file_path, 'r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            # Skip empty rows
            if not row['ref_id'].strip():
                continue
                
            # Extract data from CSV row
            ref_id = row['ref_id']
            question_summary = row['question_summary_en'] or "Oracle consultation (content not preserved)"
            greek_excerpt = row['greek_excerpt'] or ""
            provenance = row['provenance']
            date_ce = row['date_ce']
            addressee = row['addressee'] or "Unknown deity"
            petitioner = row['petitioner'] or ""
            notes = row['notes'] or ""
            source_url = row['source'] or ""
            
            # Process the query
            category = categorize_query(question_summary, notes)
            formula_type = determine_formula_type(question_summary, greek_excerpt)
            intent = extract_intent_keywords(question_summary, addressee, notes)
            
            # Create query entry in gold standard format
            query_entry = {
                "id": ref_id,
                "url": source_url,
                "category": category,
                "intent": intent,
                "formula_type": formula_type,
                "translation": {
                    "greek": greek_excerpt,
                    "english": question_summary,
                    "note": "" # Will be filled during translation
                },
                "context": {
                    "original_paraphrase": question_summary,
                    "provenance": provenance,
                    "date": date_ce,
                    "addressee": addressee,
                    "petitioner": petitioner,
                    "notes": notes,
                    "material": "Papyrus",
                    "source_url": source_url
                }
            }
            
            queries.append(query_entry)
    
    # Create the complete JSON structure
    papyrus_oracle_data = {
        "title": "Papyrus Oracle Queries — Scholarly Edition",
        "subtitle": "Ancient Consultation Texts from Egyptian Oracle Sites",
        "editor": "GPT-5 Reasoning Translation System",
        "created": datetime.now().isoformat(),
        "source": {
            "title": "Papyrus Oracle Queries Collection",
            "oracle_sites": "Multiple Egyptian sites (Oxyrhynchus, Soknopaiou Nesos, etc.)",
            "period": "1st-3rd century CE (Roman period)",
            "genre": "Oracle Consultation Texts",
            "material": "Papyrus fragments and ostraca",
            "scholarly_tradition": "Papyrological collections and digital archives"
        },
        "structure": {
            "organization": "By consultation category and formula type",
            "categories": list(set(q["category"] for q in queries)),
            "formula_types": list(set(q["formula_type"] for q in queries)),
            "geographic_range": "Egyptian oracle sites",
            "temporal_range": "Roman imperial period"
        },
        "historical_context": {
            "oracle_function": "Egyptian oracle sites serving Greco-Egyptian religious syncretism",
            "consultation_method": "Written petitions on papyrus and ostraca",
            "social_context": "Urban and rural Egyptian communities under Roman rule",
            "religious_background": "Hellenistic-Egyptian religious synthesis"
        },
        "translation_metadata": {
            "status": "Prepared for GPT-5 translation",
            "translation_method": "GPT-5 reasoning individual query translation (effort=medium)",
            "success_rate": "Pending translation"
        },
        "content": {
            "queries": queries
        }
    }
    
    return papyrus_oracle_data


def main():
    """Main function to convert CSV to JSON."""
    
    # Input and output files
    csv_file = "/Users/jneumann/Repos/cleros/oracle_queries_pack_v0.4 (1).csv"
    output_file = "/Users/jneumann/Repos/cleros/data/sources/papyrus_oracle_queries_raw.json"
    
    print("🏺 CONVERTING PAPYRUS ORACLE QUERIES")
    print("=" * 50)
    print(f"📖 Input CSV: {csv_file}")
    print(f"💾 Output JSON: {output_file}")
    
    # Create the JSON data
    papyrus_data = create_papyrus_oracle_queries_json(csv_file)
    
    # Save to file
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(papyrus_data, f, indent=2, ensure_ascii=False)
    
    # Print summary
    queries = papyrus_data["content"]["queries"]
    print(f"\n📊 Conversion Summary:")
    print(f"   Total queries: {len(queries)}")
    print(f"   Queries with Greek text: {len([q for q in queries if q['translation']['greek']])}")
    print(f"   Categories: {', '.join(papyrus_data['structure']['categories'])}")
    print(f"   Formula types: {len(papyrus_data['structure']['formula_types'])}")
    
    # Show sample entries
    print(f"\n📝 Sample Entries:")
    for i, query in enumerate(queries[:3], 1):
        print(f"   {i}. {query['id']}: {query['category']} - {query['translation']['english'][:60]}...")
        if query['translation']['greek']:
            print(f"      Greek: {query['translation']['greek'][:60]}...")
    
    print(f"\n✅ Conversion complete! Ready for translation.")
    return output_file


if __name__ == "__main__":
    main()
