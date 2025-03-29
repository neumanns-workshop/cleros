#!/usr/bin/env python3
"""
Entity Classifier for Sortes Orphicae

This script uses the local Ollama server to classify entities extracted from the Orphic Hymns
into different types of deities (e.g., Olympian, Chthonic, Titan, Nature, etc.).
"""

import json
import httpx
import argparse
from pathlib import Path
from typing import List, Dict, Any, Tuple
import asyncio
from pydantic import BaseModel

# Constants
DATA_DIR = Path("data")
LINGUISTICS_DIR = DATA_DIR / "enriched" / "linguistics"
OLLAMA_URL = "http://localhost:11434/api/generate"  # Default Ollama server URL
DEFAULT_MODEL = "gemma3:27b"  # Updated to use gemma3:27b

class DeityClassification(BaseModel):
    """Model for deity classification results"""
    entity: str
    category: str
    context: str = ""  # Added context field to store the line context
    start_char: int = -1  # Character offset start position
    end_char: int = -1  # Character offset end position
    hymn_id: str = ""  # Hymn ID
    line_num: int = -1  # Line number

async def load_entity_contexts() -> List[Tuple[str, str, int, int, str, int]]:
    """
    Load entities with their line contexts from linguistic_features.json
    
    Returns:
        List of (entity, context, start_char, end_char, hymn_id, line_num) tuples
    """
    # Define numeric words to filter out
    numeric_words = {
        "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
        "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth",
        "thrice", "twice", "once", "hundred", "thousand", "million"
    }
    
    # Counters for filtered entities
    total_entities = 0
    filtered_by_label = 0
    filtered_by_digit = 0
    filtered_by_pos = 0
    filtered_by_word = 0
    
    try:
        # Load the full linguistic features file
        features_path = LINGUISTICS_DIR / "linguistic_features.json"
        with open(features_path, 'r') as f:
            features_data = json.load(f)
        
        # Extract entities with their contexts
        entity_contexts = []
        
        # Process each hymn
        for hymn in features_data:
            hymn_id = hymn.get("hymn_id", "unknown")
            
            # Process each line in the hymn
            for line_data in hymn.get("per_line", []):
                line_num = line_data.get("line_num", 0)
                pos_tags = line_data.get("pos_tags", [])
                
                # Create a map of tokens to their POS tags for quick lookup
                token_pos_map = {}
                for pos_tag in pos_tags:
                    if isinstance(pos_tag, list) and len(pos_tag) >= 2:
                        token, pos = pos_tag[0], pos_tag[1]
                        token_pos_map[token] = pos
                
                # Get line entities
                for entity in line_data.get("entities", []):
                    total_entities += 1
                    entity_text = entity.get("text", "")
                    entity_label = entity.get("label", "")
                    start_char = entity.get("start_char", -1)
                    end_char = entity.get("end_char", -1)
                    
                    # Filter out entities that are not likely deities
                    
                    # 1. Skip if entity is labeled as a number by Spacy
                    if entity_label in ["CARDINAL", "ORDINAL", "QUANTITY"]:
                        filtered_by_label += 1
                        continue
                    
                    # 2. Skip if entity text is a pure number
                    if entity_text.isdigit():
                        filtered_by_digit += 1
                        continue
                    
                    # 3. Skip if POS tag is NUM
                    if token_pos_map.get(entity_text) == "NUM":
                        filtered_by_pos += 1
                        continue
                    
                    # 4. Skip if the entity text is a common numeric word
                    if entity_text.lower() in numeric_words:
                        filtered_by_word += 1
                        continue
                    
                    # Get the full context by extracting the text from pos_tags
                    line_text = " ".join([tag[0] for tag in pos_tags if isinstance(tag, list) and tag])
                    
                    # Create a context with hymn ID and line number
                    context = f"Hymn {hymn_id}, Line {line_num}: {line_text}"
                    
                    entity_contexts.append((
                        entity_text, 
                        context, 
                        start_char, 
                        end_char, 
                        hymn_id, 
                        line_num
                    ))
        
        # Print filtering statistics
        print(f"Entity filtering statistics:")
        print(f"  Total entities found: {total_entities}")
        print(f"  Filtered by entity label (CARDINAL/ORDINAL/QUANTITY): {filtered_by_label}")
        print(f"  Filtered by digit check: {filtered_by_digit}")
        print(f"  Filtered by POS tag (NUM): {filtered_by_pos}")
        print(f"  Filtered by numeric word list: {filtered_by_word}")
        print(f"  Remaining entities after filtering: {len(entity_contexts)}")
        
        return entity_contexts
    
    except Exception as e:
        print(f"Error loading entity contexts: {e}")
        return []

def is_numeric_entity(text: str) -> bool:
    """
    Check if an entity is numeric or primarily numeric.
    
    Args:
        text: The entity text to check
        
    Returns:
        True if the entity is numeric or primarily numeric, False otherwise
    """
    # Check if entity is purely numeric
    if text.isdigit():
        return True
    
    # Check if entity is a numeric pattern with some letters (like "1st", "2nd")
    if text and text[0].isdigit() and any(c.isdigit() for c in text):
        digit_count = sum(1 for c in text if c.isdigit())
        # If more than half the characters are digits, likely a numeric entity
        if digit_count / len(text) > 0.5:
            return True
    
    return False

async def classify_entity(
    entity: str, 
    context: str = "", 
    start_char: int = -1,
    end_char: int = -1,
    hymn_id: str = "",
    line_num: int = -1,
    model: str = DEFAULT_MODEL, 
    ollama_url: str = OLLAMA_URL
) -> DeityClassification:
    """
    Classify an entity using the Ollama LLM.
    
    Args:
        entity: The entity name to classify
        context: Context about the entity (line from the hymn)
        start_char: Character offset start position
        end_char: Character offset end position
        hymn_id: Hymn ID
        line_num: Line number
        model: The Ollama model to use
        ollama_url: The URL of the Ollama API
        
    Returns:
        DeityClassification with category
    """
    # Construct the prompt for classification
    prompt = f"""
    As an expert in Greek mythology and the Orphic tradition, your task is to analyze and classify the deity or entity '{entity}' based on the following context:
    
    CONTEXT: {context}
    
    Classify '{entity}' into one of these categories:
    - Olympian (major gods residing on Mount Olympus)
    - Chthonic (underworld or earth deities)
    - Titan (pre-Olympian primordial deities)
    - Nature (deities representing natural forces)
    - Abstract (deities representing concepts)
    - Hero/Mortal (deified humans or heroes)
    - Other (specify if none of the above but still a mythological figure)
    - IRRELEVANT (not a deity, mythological figure, or relevant entity - e.g., common nouns, places, or other misidentified entities)
    
    Provide your answer strictly in the following JSON format:
    {{
      "category": "THE_CATEGORY"
    }}
    
    Return ONLY the JSON with no additional text, explanations, or formatting.
    """
    
    # Prepare the request to Ollama
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False,
        "format": "json"
    }
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(ollama_url, json=payload)
            response.raise_for_status()
            result = response.json()
            
            # Extract the response text
            response_text = result.get("response", "")
            
            # Parse the JSON response
            try:
                # Try to parse the JSON directly
                classification_data = json.loads(response_text)
                
                # Create DeityClassification object
                classification = DeityClassification(
                    entity=entity,
                    category=classification_data.get("category", "Unknown"),
                    context=context,  # Store the context with the classification
                    start_char=start_char,
                    end_char=end_char,
                    hymn_id=hymn_id,
                    line_num=line_num
                )
                return classification
                
            except json.JSONDecodeError:
                # Fallback for malformed JSON
                return DeityClassification(
                    entity=entity,
                    category="Unknown",
                    context=context,
                    start_char=start_char,
                    end_char=end_char,
                    hymn_id=hymn_id,
                    line_num=line_num
                )
                
    except Exception as e:
        print(f"Error classifying entity {entity}: {e}")
        return DeityClassification(
            entity=entity,
            category="Error",
            context=context,
            start_char=start_char,
            end_char=end_char,
            hymn_id=hymn_id,
            line_num=line_num
        )

async def classify_all_entities_with_context(
    model: str = DEFAULT_MODEL, 
    output_file: str = "deity_classifications.json",
    max_entities: int = 500
) -> None:
    """
    Classify entities with their line contexts from the linguistics data.
    
    Args:
        model: The Ollama model to use
        output_file: Path to save the results
        max_entities: Maximum number of entities to process
    """
    print("Starting entity context loading...")
    entity_contexts = await load_entity_contexts()
    print(f"Entity contexts loaded: {len(entity_contexts)} instances")
    
    if not entity_contexts:
        print("No entity contexts found to classify.")
        return
    
    # Group entity instances by name
    entity_groups = {}
    for entity, context, start_char, end_char, hymn_id, line_num in entity_contexts:
        if entity not in entity_groups:
            entity_groups[entity] = []
        entity_groups[entity].append((context, start_char, end_char, hymn_id, line_num))
    
    print(f"Found {len(entity_contexts)} entity instances across {len(entity_groups)} unique entities")
    
    # Take the top entities based on frequency
    sorted_entities = sorted(entity_groups.keys(), 
                            key=lambda e: len(entity_groups[e]), 
                            reverse=True)
    
    # Limit to max_entities unique entities
    entities_to_process = sorted_entities[:max_entities]
    print(f"Processing top {len(entities_to_process)} unique entities...")
    
    # Classify each unique entity once
    classifications = []
    
    for i, entity in enumerate(entities_to_process):
        # Get all instances of this entity
        instances = entity_groups[entity]
        
        # Use the first instance for classification
        first_instance = instances[0]
        context, _, _, _, _ = first_instance
        
        print(f"Processing {i+1}/{len(entities_to_process)}: {entity} ({len(instances)} instances)")
        print(f"Using context for classification: {context}")
        
        try:
            # Classify the entity
            print(f"Calling Ollama API for {entity}...")
            classification = await classify_entity(
                entity, 
                context,
                model=model
            )
            print(f"Received classification: {classification.category}")
            
            # Create entry for each instance with its specific offsets
            for instance_context, start_char, end_char, hymn_id, line_num in instances:
                compact_classification = {
                    "entity": entity,
                    "category": classification.category,
                    "start_char": start_char,
                    "end_char": end_char,
                    "hymn_id": hymn_id,
                    "line_num": line_num
                }
                classifications.append(compact_classification)
            
        except Exception as e:
            print(f"Error classifying {entity}: {e}")
            print(f"Skipping {entity} and continuing...")
            continue
            
        # Small delay to prevent overloading Ollama
        await asyncio.sleep(0.5)
    
    # Save results
    print(f"Processing complete. Saving {len(classifications)} entity instances...")
    output_path = Path(output_file)
    with open(output_path, 'w') as f:
        json.dump(classifications, f, indent=2)
    
    print(f"Classifications saved to {output_path}")
    print(f"Processed {len(entities_to_process)} unique entities, saved {len(classifications)} instances")

async def classify_entity_interactive(model: str = DEFAULT_MODEL) -> None:
    """Interactive mode for classifying individual entities"""
    # Load entity contexts for lookup
    entity_contexts = await load_entity_contexts()
    entity_context_map = {entity: context for entity, context in entity_contexts}
    
    while True:
        entity = input("\nEnter entity to classify (or 'quit' to exit): ")
        if entity.lower() in ('quit', 'exit', 'q'):
            break
        
        # Try to find context for the entity
        context = entity_context_map.get(entity, "")
        if context:
            print(f"Found context: {context}")
            use_context = input("Use this context? (y/n, default: y): ").lower()
            if use_context != "n":
                pass  # Use the found context
            else:
                context = input("Enter custom context: ")
        else:
            print("No context found for this entity.")
            context = input("Enter custom context: ")
        
        print(f"\nClassifying '{entity}'...")
        classification = await classify_entity(entity, context, model)
        
        print("\nClassification Result:")
        print(f"Entity:      {classification.entity}")
        print(f"Context:     {classification.context}")
        print(f"Category:    {classification.category}")

def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description="Classify entities as deity types using Ollama")
    
    # Command options
    subparsers = parser.add_subparsers(dest="command", help="Command to run")
    
    # Batch classification command
    batch_parser = subparsers.add_parser("batch", help="Classify all entities in the dataset")
    batch_parser.add_argument("--model", type=str, default=DEFAULT_MODEL, help="Ollama model to use")
    batch_parser.add_argument("--output", type=str, default="data/enriched/deities/deity_classifications.json", 
                             help="Output file path")
    batch_parser.add_argument("--max", type=int, default=500, help="Maximum entities to process")
    
    # Interactive classification command
    interactive_parser = subparsers.add_parser("interactive", help="Interactively classify entities")
    interactive_parser.add_argument("--model", type=str, default=DEFAULT_MODEL, help="Ollama model to use")
    
    # Parse arguments
    args = parser.parse_args()
    
    # Create output directory if needed
    if args.command == "batch":
        output_path = Path(args.output)
        output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Run the appropriate command
    if args.command == "batch":
        asyncio.run(classify_all_entities_with_context(args.model, args.output, args.max))
    elif args.command == "interactive":
        asyncio.run(classify_entity_interactive(args.model))
    else:
        parser.print_help()

if __name__ == "__main__":
    main() 