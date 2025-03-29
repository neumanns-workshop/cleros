"""
Convert raw Orphic Hymns JSON into clean base dataset.

This script takes the raw data file (data/raw/orphic_hymns.json) that was extracted
from source texts and converts it into a clean, normalized base dataset. Each hymn
is processed and saved as a separate JSON file with a standardized format.

This is step 1 of the data pipeline, creating the foundation for all further
analysis and enrichment.

Directory Structure:
    data/
        raw/            # Raw input data
            orphic_hymns.json
        base/           # Clean normalized hymns
            hymn_0.json
            hymn_1.json
            ...
            processing_summary.json
        enriched/       # For future enrichment datasets
            linguistics/
            entities/
            semantics/
            rituals/

The base dataset format for each hymn:
    {
        "hymn_id": str,          # Unique identifier
        "title": str,            # Hymn title
        "dedication": str,        # Optional dedication
        "incense": str,          # Optional incense
        "lines": List[str],      # Normalized lines
        "line_mappings": Dict,   # Maps to original line numbers
        "sequence": int          # Position in collection
    }
"""

import json
from pathlib import Path
from datetime import datetime
import time
from typing import Dict, Any

from sortes.extractors.normalizer import OrphicLineNormalizer

# Constants
DATA_DIR = Path("data")
RAW_DATA = DATA_DIR / "raw" / "orphic_hymns.json"
BASE_DIR = DATA_DIR / "base"

def process_hymn(hymn_id: str, hymn_data: Dict[str, Any]) -> Dict[str, Any]:
    """Process a single hymn into clean base format"""
    
    # Create normalizer and process text
    normalizer = OrphicLineNormalizer()
    normalized = normalizer.normalize_hymn(hymn_data)
    
    return {
        "hymn_id": hymn_id,
        "title": hymn_data["title"],
        "dedication": hymn_data.get("dedication", ""),
        "incense": hymn_data.get("incense", ""),
        "lines": normalized["normalized_lines"],
        "line_mappings": normalized["line_mappings"],
        "sequence": int(hymn_id)  # Position in collection
    }

def process_raw_data(input_file: Path = RAW_DATA, output_dir: Path = BASE_DIR):
    """Process raw hymn data into clean base dataset
    
    Args:
        input_file: Path to raw orphic_hymns.json
        output_dir: Directory to save processed hymns
    """
    
    start_time = time.time()
    
    # Verify input file exists
    if not input_file.exists():
        raise FileNotFoundError(
            f"Raw data file not found: {input_file}\n"
            f"Please ensure {input_file.name} is in the data/raw/ directory."
        )
    
    # Load hymns
    print(f"\nLoading raw data from {input_file}...")
    with open(input_file, 'r') as f:
        hymns = json.load(f)
    
    # Create output directory
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Process each hymn
    total_hymns = len(hymns)
    successful = 0
    failed = 0
    
    print(f"\nProcessing {total_hymns} hymns...")
    
    for i, (hymn_id, hymn_data) in enumerate(hymns.items(), 1):
        hymn_start = time.time()
        print(f"\nProcessing hymn {hymn_id}: {hymn_data['title']} ({i}/{total_hymns})")
        
        try:
            # Process hymn
            processed = process_hymn(hymn_id, hymn_data)
            
            # Save result
            output_file = output_dir / f"hymn_{hymn_id}.json"
            with open(output_file, 'w') as f:
                json.dump(processed, f, indent=2)
            
            # Report progress
            elapsed = time.time() - hymn_start
            print(f"✓ Success: {len(processed['lines'])} lines in {elapsed:.1f}s")
            successful += 1
            
        except Exception as e:
            print(f"✗ Error processing hymn {hymn_id}: {e}")
            failed += 1
            continue
    
    # Save summary
    total_time = time.time() - start_time
    summary = {
        "timestamp": datetime.now().isoformat(),
        "input_file": str(input_file),
        "output_directory": str(output_dir),
        "total_hymns": total_hymns,
        "successful": successful,
        "failed": failed,
        "total_time": total_time,
        "average_time_per_hymn": total_time / total_hymns
    }
    
    with open(output_dir / "processing_summary.json", 'w') as f:
        json.dump(summary, f, indent=2)
    
    print(f"\nProcessing complete in {total_time:.1f}s!")
    print(f"Successful: {successful}/{total_hymns}")
    print(f"Failed: {failed}/{total_hymns}")
    print(f"Average time per hymn: {summary['average_time_per_hymn']:.1f}s")
    print(f"Results saved in: {output_dir}")

def main():
    """Main entry point with error handling"""
    try:
        process_raw_data()
    except Exception as e:
        print(f"\nError: {e}")
        exit(1)

if __name__ == "__main__":
    main() 