import json

# Load the classifications
with open('data/enriched/deities/deity_classifications.json', 'r') as f:
    data = json.load(f)

# Count before changes
original_count = len(data)

# Remove IRRELEVANT entries
data = [item for item in data if item['category'] != 'IRRELEVANT']

# Standardize Titan categories
for item in data:
    if item['category'] == 'Titan (pre-Olympian primordial deities)':
        item['category'] = 'Titan'

# Save the modified data
with open('data/enriched/deities/deity_classifications.json', 'w') as f:
    json.dump(data, f, indent=2)

# Count after changes
new_count = len(data)
removed = original_count - new_count

print(f"Successfully processed deity classifications:")
print(f"- Removed {removed} IRRELEVANT entries")
print(f"- Standardized Titan categories")
print(f"- {new_count} entries saved to deity_classifications.json") 