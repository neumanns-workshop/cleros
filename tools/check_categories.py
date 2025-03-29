#!/usr/bin/env python3
"""
Script to check entity classifications
"""

import json
from pathlib import Path
from collections import Counter

# Load classifications
classifications_path = Path("data/enriched/deities/deity_classifications.json")

with open(classifications_path, 'r') as f:
    data = json.load(f)

# Count categories
categories = Counter()
for item in data:
    categories[item['category']] += 1

print("Categories found:")
for category, count in sorted(categories.items(), key=lambda x: (-x[1], x[0])):
    print(f"  {category}: {count}")

# Check for common mispellings or variance in Titan
titan_variants = []
for item in data:
    if "titan" in item['category'].lower() and item['category'] != "Titan":
        titan_variants.append((item['entity'], item['category']))

if titan_variants:
    print("\nVariants of 'Titan':")
    for entity, category in titan_variants:
        print(f"  {entity}: {category}")

# Check for IRRELEVANT entities
irrelevant = []
for item in data:
    if item['category'] == "IRRELEVANT":
        irrelevant.append(item['entity'])

if irrelevant:
    print("\nEntities marked as IRRELEVANT:")
    for entity in irrelevant:
        print(f"  {entity}") 