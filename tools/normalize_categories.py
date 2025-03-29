#!/usr/bin/env python3
"""
Script to normalize entity classifications
"""

import json
from pathlib import Path

# Load classifications
classifications_path = Path("data/enriched/deities/deity_classifications.json")

with open(classifications_path, 'r') as f:
    data = json.load(f)

# Count before normalization
before_counts = {}
for item in data:
    category = item['category']
    before_counts[category] = before_counts.get(category, 0) + 1

print("Categories before normalization:")
for category, count in sorted(before_counts.items(), key=lambda x: (-x[1], x[0])):
    print(f"  {category}: {count}")

# Normalize categories
changes = 0
for item in data:
    # Fix Titan variants
    if "titan" in item['category'].lower() and item['category'] != "Titan":
        print(f"Normalizing '{item['entity']}' from '{item['category']}' to 'Titan'")
        item['category'] = "Titan"
        changes += 1
    
    # Reclassify IRRELEVANT to appropriate categories
    if item['category'] == "IRRELEVANT":
        if item['entity'] == "Lydians":
            print(f"Reclassifying '{item['entity']}' from 'IRRELEVANT' to 'Other'")
            item['category'] = "Other"
            changes += 1

# Count after normalization
after_counts = {}
for item in data:
    category = item['category']
    after_counts[category] = after_counts.get(category, 0) + 1

print("\nCategories after normalization:")
for category, count in sorted(after_counts.items(), key=lambda x: (-x[1], x[0])):
    print(f"  {category}: {count}")

print(f"\nTotal changes: {changes}")

# Save normalized classifications
if changes > 0:
    with open(classifications_path, 'w') as f:
        json.dump(data, f, indent=2)
    print(f"Updated classifications saved to {classifications_path}")
else:
    print("No changes needed, file not updated.") 