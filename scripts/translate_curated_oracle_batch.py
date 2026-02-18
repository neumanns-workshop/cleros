#!/usr/bin/env python3
"""
Translate the curated papyrus oracle queries batch using GPT-5 chunk translator.
Processes the hand-picked oracle consultations for corpus expansion.
"""

import json
import os
from datetime import datetime
from pathlib import Path
import sys

REPO_ROOT = Path(__file__).resolve().parent.parent

# Add the orphica directory to the path so we can import chunk_translator
sys.path.append(str(REPO_ROOT / "attic" / "development_2025-08-21" / "orphica"))

from chunk_translator import ChunkTranslator, TranslatedLine, TranslationChunk
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path=str(REPO_ROOT / ".env"))

def translate_curated_oracle_batch():
    """Translate the curated papyrus oracle queries using GPT-5 reasoning."""
    
    # Input and output files
    input_file = str(REPO_ROOT / "data" / "sources" / "curated_oracle_queries_batch.json")
    output_file = str(REPO_ROOT / "data" / "gold_standard" / "papyrus_oracle_queries_translated.json")
    
    print("🏺 GPT-5 CURATED PAPYRUS ORACLE QUERIES TRANSLATION")
    print("=" * 65)
    print(f"📖 Source: {input_file}")
    print(f"💾 Output: {output_file}")
    
    # Load the curated queries data
    with open(input_file, 'r', encoding='utf-8') as f:
        batch_data = json.load(f)
    
    queries = batch_data['content']['queries']
    
    print(f"📊 Curated batch loaded:")
    print(f"   Total queries: {len(queries)}")
    print(f"   Geographic range: {', '.join(batch_data['translation_metadata']['batch_characteristics']['geographic_diversity'])}")
    print(f"   Consultation types: {len(batch_data['translation_metadata']['batch_characteristics']['consultation_types'])}")
    print(f"   Deity diversity: {len(batch_data['translation_metadata']['batch_characteristics']['deity_diversity'])}")
    
    # Papyrus Oracle Queries metadata - diverse Egyptian oracle consultations
    oracle_metadata = {
        "title": "Papyrus Oracle Queries",
        "author": "Ancient Egyptian Petitioners", 
        "genre": "Oracle Consultation Texts",
        "period": "1st-3rd century CE (Roman Egypt)",
        "style": "Formulaic petitions to Greco-Egyptian deities",
        "context": "Papyrus oracle tickets from Egyptian sites",
        "function": "Divine consultation formulae for health, marriage, business, and legal guidance"
    }
    
    # Initialize the translator with papyrus oracle context
    translator = ChunkTranslator(
        model="gpt-5", 
        effort="medium",
        text_metadata=oracle_metadata
    )
    
    # Process each query individually
    translated_queries = []
    failed_queries = []
    
    for i, query in enumerate(queries, 1):
        query_id = query['id']
        greek_text = query['translation']['greek']
        
        print(f"\\n🔄 Translating Query {i}/{len(queries)}: {query_id}")
        print(f"   Category: {query['category']}")
        print(f"   Addressee: {query['context']['addressee']}")
        print(f"   Provenance: {query['context']['provenance']}")
        print(f"   Greek: {greek_text[:80]}...")
        
        try:
            # Convert query to format expected by translator
            # Each query is treated as a single "line" since they're short consultation formulas
            query_line_data = [{
                'n': 1,
                'gr': greek_text
            }]
            
            # Translate the query as one chunk
            query_chunk = translator.translate_chunk(query_line_data, i)
            
            # Build the translated query result in gold standard format
            translated_query = {
                "id": query_id,
                "url": query['url'],
                "category": query['category'],
                "intent": query['intent'],
                "formula_type": query['formula_type'],
                "translation": {
                    "greek": greek_text,
                    "english": query_chunk.lines[0].english,
                    "note": query_chunk.lines[0].note
                },
                "context": {
                    "original_paraphrase": query['context']['original_paraphrase'],
                    "provenance": query['context']['provenance'],
                    "date": query['context']['date'],
                    "addressee": query['context']['addressee'],
                    "petitioner": query['context']['petitioner'],
                    "notes": query['context']['notes'],
                    "material": query['context']['material'],
                    "curator_notes": query['context'].get('curator_notes', '')
                }
            }
            
            translated_queries.append(translated_query)
            print(f"✅ Completed Query {query_id}")
            
            # Show sample translation
            sample_translation = query_chunk.lines[0]
            print(f"   Greek: {sample_translation.greek[:70]}...")
            print(f"      → {sample_translation.english[:70]}...")
            if sample_translation.note:
                print(f"   📝 {sample_translation.note[:70]}...")
                
        except Exception as e:
            print(f"❌ Failed Query {query_id}: {str(e)}")
            failed_queries.append({
                "id": query_id,
                "error": str(e),
                "greek_text": greek_text[:100] if greek_text else ""
            })
            continue
    
    # Create final output structure
    success_rate = len(translated_queries) / len(queries) * 100
    
    output_data = {
        "title": "Papyrus Oracle Queries — Scholarly Edition",
        "subtitle": "Curated Ancient Consultation Texts from Egyptian Oracle Sites",
        "editor": "GPT-5 Reasoning Translation System",
        "created": datetime.now().isoformat(),
        "source": {
            "title": batch_data['title'],
            "oracle_sites": "Multiple Egyptian sites (Oxyrhynchus, Karanis, Soknopaiou Nesos, etc.)",
            "period": "1st-3rd century CE (Roman period)",
            "genre": "Oracle Consultation Texts",
            "material": "Papyrus fragments",
            "curation_method": batch_data['source']['curation_method']
        },
        "structure": {
            "organization": "By consultation category and formula type",
            "categories": list(set(q["category"] for q in translated_queries)),
            "formula_types": list(set(q["formula_type"] for q in translated_queries)),
            "geographic_range": batch_data['translation_metadata']['batch_characteristics']['geographic_diversity'],
            "temporal_range": batch_data['translation_metadata']['batch_characteristics']['temporal_range']
        },
        "historical_context": {
            "oracle_function": "Egyptian oracle sites serving Greco-Egyptian religious syncretism",
            "consultation_method": "Written petitions on papyrus",
            "social_context": "Urban and rural Egyptian communities under Roman rule",
            "religious_background": "Hellenistic-Egyptian religious synthesis with Serapis prominence"
        },
        "translation_metadata": {
            "status": "GPT-5 translation complete",
            "total_queries": len(queries),
            "successful_translations": len(translated_queries),
            "failed_translations": len(failed_queries),
            "translation_method": "GPT-5 reasoning individual query translation (effort=medium)",
            "success_rate": f"{success_rate:.1f}%"
        },
        "content": {
            "queries": translated_queries
        }
    }
    
    # Add failed queries section if any
    if failed_queries:
        output_data["translation_failures"] = failed_queries
    
    # Save the final output
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
    
    # Print final summary
    print(f"\\n🎉 TRANSLATION BATCH COMPLETE!")
    print(f"📊 Final Statistics:")
    print(f"   Total queries processed: {len(queries)}")
    print(f"   Successful translations: {len(translated_queries)}")
    print(f"   Failed translations: {len(failed_queries)}")
    print(f"   Success rate: {success_rate:.1f}%")
    print(f"   Geographic coverage: {len(output_data['structure']['geographic_range'])} sites")
    print(f"   Consultation categories: {len(output_data['structure']['categories'])}")
    
    # Show sample results
    if translated_queries:
        print(f"\\n📝 Sample Translations:")
        for i, query in enumerate(translated_queries[:3], 1):
            print(f"   {i}. {query['id']} ({query['category']})")
            print(f"      → {query['translation']['english'][:60]}...")
    
    print(f"\\n💾 Complete translations saved to: {output_file}")
    
    return output_data

if __name__ == "__main__":
    translate_curated_oracle_batch()
