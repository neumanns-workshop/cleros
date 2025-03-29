#!/usr/bin/env python3
"""
Example: Deity Classification with Ollama

This example demonstrates how to use the Ollama API to classify a deity entity
from the Orphic Hymns corpus.
"""

import asyncio
import json
import httpx
from pathlib import Path
import sys

# Add parent directory to path to import from entity_classifier
sys.path.append(str(Path(__file__).resolve().parent.parent))
from entity_classifier import classify_entity, DeityClassification

# Sample data
EXAMPLE_ENTITIES = [
    ("Zeus", "Father of gods and men, ruler of Olympus, wielder of thunderbolts."),
    ("Persephone", "Queen of the underworld, daughter of Demeter, wife of Hades."),
    ("Dionysos", "God of wine, revelry, and ecstasy, twice-born son of Zeus."),
    ("Gaia", "Primordial earth goddess, mother of the Titans and Giants."),
    ("Hermes", "Messenger of the gods, guide of souls, patron of travelers and thieves.")
]

async def run_example():
    """Run the deity classification example"""
    print("=" * 60)
    print("DEITY CLASSIFICATION EXAMPLE WITH OLLAMA")
    print("=" * 60)
    print("\nThis example demonstrates how to classify Greek deities using a local Ollama server.\n")
    
    # Check if Ollama is running
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get("http://localhost:11434/api/tags")
            models = response.json().get("models", [])
            
            if not models:
                print("⚠️  Warning: No models found in your Ollama server.")
                print("   To install the recommended model, run: ollama pull gemma3:27b\n")
            else:
                print(f"✓ Connected to Ollama. Available models: {', '.join(m['name'] for m in models)}\n")
                
    except Exception as e:
        print(f"❌ Could not connect to Ollama server: {e}")
        print("   Make sure Ollama is running on http://localhost:11434")
        print("   You can start it with: ollama serve\n")
        return
    
    # Run classifications
    results = []
    
    print("Classifying example deities...\n")
    for entity, context in EXAMPLE_ENTITIES:
        print(f"Entity: {entity}")
        print(f"Context: {context}")
        
        try:
            # Call the classification function
            classification = await classify_entity(entity, context)
            
            # Print results
            print(f"Result: {classification.category} (confidence: {classification.confidence:.2f})")
            print(f"Description: {classification.description}")
            print(f"Attributes: {', '.join(classification.attributes)}")
            print("-" * 60)
            
            # Save for final output
            results.append(classification.dict())
            
        except Exception as e:
            print(f"Error classifying {entity}: {e}")
            print("-" * 60)
    
    # Save results to file
    output_file = Path("examples/classification_results.json")
    output_file.parent.mkdir(exist_ok=True)
    
    with open(output_file, "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"\nResults saved to {output_file}")
    print("\nTo use this functionality in your own code:")
    print("""
from entity_classifier import classify_entity

async def main():
    classification = await classify_entity(
        entity="Zeus", 
        context="King of the gods, wielder of thunder"
    )
    print(classification.dict())

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
    """)

if __name__ == "__main__":
    asyncio.run(run_example()) 