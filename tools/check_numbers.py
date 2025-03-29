#!/usr/bin/env python3
"""
Script to check how numerals are labeled in the linguistic features.
"""

import json
from pathlib import Path

# Load the linguistic features data
LINGUISTICS_DIR = Path("data") / "enriched" / "linguistics"
features_path = LINGUISTICS_DIR / "linguistic_features.json"

with open(features_path, 'r') as f:
    features_data = json.load(f)

# Words to check
numeric_words = [
    "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
    "first", "second", "third", "fourth", "fifth", 
    "thrice", "twice", "once"
]

# Track findings
findings = []

# Search through data
for hymn in features_data[:20]:  # Limit to first 20 hymns for speed
    hymn_id = hymn.get("hymn_id", "unknown")
    
    for line_data in hymn.get("per_line", []):
        line_num = line_data.get("line_num", 0)
        pos_tags = line_data.get("pos_tags", [])
        
        for pos_tag in pos_tags:
            if isinstance(pos_tag, list) and len(pos_tag) >= 2:
                word, pos = pos_tag[0], pos_tag[1]
                
                if word.lower() in numeric_words:
                    # Check if this word is also in entities
                    is_entity = False
                    entity_label = None
                    for entity in line_data.get("entities", []):
                        if entity.get("text") == word:
                            is_entity = True
                            entity_label = entity.get("label", "")
                            break
                    
                    findings.append({
                        "word": word,
                        "pos": pos,
                        "hymn_id": hymn_id,
                        "line_num": line_num,
                        "is_entity": is_entity,
                        "entity_label": entity_label
                    })

# Print findings
if findings:
    print(f"Found {len(findings)} numeric words:")
    for finding in findings:
        print(f"Word: {finding['word']}, POS: {finding['pos']}, Is Entity: {finding['is_entity']}, Entity Label: {finding['entity_label']}, Location: Hymn {finding['hymn_id']}, Line {finding['line_num']}")
else:
    print("No numeric words found in the checked hymns.")

# Now check how numeric values are labeled
numeric_values = []

for hymn in features_data[:20]:  # Limit to first 20 hymns for speed
    hymn_id = hymn.get("hymn_id", "unknown")
    
    for line_data in hymn.get("per_line", []):
        line_num = line_data.get("line_num", 0)
        
        for entity in line_data.get("entities", []):
            entity_text = entity.get("text", "")
            entity_label = entity.get("label", "")
            
            # Check if entity is a number or looks like a number
            if entity_text.isdigit() or (entity_text and entity_text[0].isdigit()):
                numeric_values.append({
                    "entity": entity_text,
                    "label": entity_label,
                    "hymn_id": hymn_id,
                    "line_num": line_num
                })

if numeric_values:
    print(f"\nFound {len(numeric_values)} numeric entities:")
    for value in numeric_values:
        print(f"Entity: {value['entity']}, Label: {value['label']}, Location: Hymn {value['hymn_id']}, Line {value['line_num']}")
else:
    print("\nNo numeric entities found in the checked hymns.") 