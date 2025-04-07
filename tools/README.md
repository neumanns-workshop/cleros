# Cleros Data Processing Tools

This directory contains the Python scripts used for data processing, entity classification, and analysis in the Cleros project.

## Main Tools

- **entity_classifier.py** - Classifies deities and entities from the Orphic Hymns into categories
- **visualize_classifications.py** - Creates visualizations of the deity classification results
- **sentence_classifier.py** - Classifies sentences from the corpus based on their content
- **normalize_categories.py** - Normalizes and standardizes entity categories
- **check_categories.py** - Utility to check the distribution of entity categories
- **check_numbers.py** - Analyzes numerical patterns in the corpus
- **clean_classifications.py** - Cleans up and formats entity classification results

## Usage

### Entity Classification

```bash
# Interactive mode
python entity_classifier.py interactive

# Batch classification
python entity_classifier.py batch --output ../data/enriched/deities/deity_classifications.json
```

### Visualization

```bash
# Display visualizations
python visualize_classifications.py --show

# Save visualizations to a directory
python visualize_classifications.py --output-dir ../data/enriched/deities/visualizations

# Export to CSV
python visualize_classifications.py --csv deity_classifications.csv
```

## Data Flow

The tools in this directory support the following data processing flow:

1. Raw text extraction from source materials
2. Entity identification and extraction
3. Entity classification by category
4. Enhanced data creation for web application use
5. Visualization and analysis of classification results

## Requirements

These tools require Python 3.9+ and the following packages:
- spaCy
- matplotlib
- pandas
- seaborn
- wordcloud
- tqdm

Install dependencies using:
```bash
pip install -r ../requirements.txt
```

## Notes for Development

When extending the classification system:
1. Ensure all new entities are properly categorized
2. Update alias mappings when adding new entities
3. Regenerate visualizations after significant changes
4. Ensure the web application's deity highlighting system is updated with new classifications 