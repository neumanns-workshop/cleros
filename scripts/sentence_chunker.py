#!/usr/bin/env python3
"""
Sentence-based chunking script for Cleros gold standard data.

Transforms line-by-line parallel JSON files into sentence-based chunks
while preserving all line metadata and scholarly apparatus.
"""

import json
import re
from pathlib import Path
from typing import List, Dict, Any
from datetime import datetime

def chunk_lines_by_sentences(lines: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Group lines into sentence chunks based on period endings.
    
    Args:
        lines: List of line objects with 'english' text and metadata
        
    Returns:
        List of sentence chunk objects
    """
    chunks = []
    current_chunk_lines = []
    sentence_id = 1
    
    for line in lines:
        current_chunk_lines.append(line)
        
        # Check if this line ends a sentence (period at end of English text)
        english_text = line.get('english', '')
        if english_text.rstrip().endswith('.'):
            # Complete sentence found - create chunk
            chunk = create_sentence_chunk(current_chunk_lines, sentence_id)
            chunks.append(chunk)
            
            # Reset for next sentence
            current_chunk_lines = []
            sentence_id += 1
    
    # Handle any remaining lines that don't end with period
    if current_chunk_lines:
        chunk = create_sentence_chunk(current_chunk_lines, sentence_id)
        chunks.append(chunk)
    
    return chunks

def create_sentence_chunk(lines: List[Dict[str, Any]], sentence_id: int) -> Dict[str, Any]:
    """
    Create a sentence chunk object from grouped lines.
    
    Args:
        lines: List of line objects that form a complete sentence
        sentence_id: Sequential ID for this sentence
        
    Returns:
        Sentence chunk object with combined text and preserved line details
    """
    # Combine English text from all lines
    english_parts = []
    greek_parts = []
    line_numbers = []
    
    for line in lines:
        english_text = line.get('english', '').strip()
        greek_text = line.get('greek', '').strip()
        line_num = line.get('line', 0)
        
        if english_text:
            english_parts.append(english_text)
        if greek_text:
            greek_parts.append(greek_text)
        if line_num:
            line_numbers.append(line_num)
    
    # Join texts with appropriate spacing
    combined_english = ' '.join(english_parts)
    combined_greek = ' '.join(greek_parts)
    
    # Clean up punctuation spacing
    combined_english = re.sub(r'\s+([,.;:])', r'\1', combined_english)
    combined_greek = re.sub(r'\s+([,.;:·])', r'\1', combined_greek)
    
    return {
        'sentence_id': sentence_id,
        'line_range': {
            'start': line_numbers[0] if line_numbers else 0,
            'end': line_numbers[-1] if line_numbers else 0,
            'lines': line_numbers
        },
        'text': {
            'english': combined_english,
            'greek': combined_greek
        },
        'line_count': len(lines),
        'line_details': lines
    }

def process_parallel_json(input_file: Path, output_file: Path) -> Dict[str, Any]:
    """
    Process a parallel JSON file and create sentence-chunked version.
    
    Args:
        input_file: Path to input parallel JSON file
        output_file: Path for output chunked JSON file
        
    Returns:
        Processing statistics
    """
    print(f"Processing {input_file.name}...")
    
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Initialize output structure
    output_data = {
        'title': data.get('title', '').replace('Parallel', 'Sentence-Chunked'),
        'source_file': input_file.name,
        'created': datetime.now().isoformat(),
        'format': 'Sentence-based chunks preserving line structure',
        'chunking_method': 'Period-boundary sentence detection',
        'sections': []
    }
    
    total_lines = 0
    total_sentences = 0
    
    # Process different JSON structures
    if 'sections' in data:
        # Orphic Hymns format
        for section in data['sections']:
            if 'lines' in section:
                chunks = chunk_lines_by_sentences(section['lines'])
                
                section_output = {
                    'title': section.get('title', ''),
                    'type': section.get('type', ''),
                    'original_line_count': len(section['lines']),
                    'sentence_count': len(chunks),
                    'sentences': chunks
                }
                
                output_data['sections'].append(section_output)
                total_lines += len(section['lines'])
                total_sentences += len(chunks)
    
    elif 'parallel_text' in data:
        # Handle different parallel text formats
        lines_data = []
        for item in data['parallel_text']:
            # Check if nested under 'parallel' key (Argonautica) or direct (Lithica)
            if 'parallel' in item:
                # Argonautica format
                line_obj = {
                    'line': item.get('line', 0),
                    'english': item['parallel']['english'],
                    'greek': item['parallel']['greek'],
                    'note': item.get('commentary', '')
                }
            else:
                # Lithica format (direct fields)
                line_obj = {
                    'line': item.get('line', 0),
                    'english': item.get('english', ''),
                    'greek': item.get('greek', ''),
                    'note': item.get('note', '')
                }
            lines_data.append(line_obj)
        
        chunks = chunk_lines_by_sentences(lines_data)
        
        section_output = {
            'title': data.get('title', ''),
            'type': 'epic_poem',
            'original_line_count': len(lines_data),
            'sentence_count': len(chunks),
            'sentences': chunks
        }
        
        output_data['sections'].append(section_output)
        total_lines += len(lines_data)
        total_sentences += len(chunks)
    
    else:
        print(f"  → Skipped: Unknown format structure")
        return {'total_original_lines': 0, 'total_sentences': 0, 'compression_ratio': 0, 'avg_lines_per_sentence': 0}
    
    # Add summary statistics
    output_data['statistics'] = {
        'total_original_lines': total_lines,
        'total_sentences': total_sentences,
        'compression_ratio': round(total_lines / total_sentences, 2) if total_sentences > 0 else 0,
        'avg_lines_per_sentence': round(total_lines / total_sentences, 2) if total_sentences > 0 else 0
    }
    
    # Write output file
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
    
    print(f"  → {total_lines} lines → {total_sentences} sentences")
    print(f"  → Avg {output_data['statistics']['avg_lines_per_sentence']} lines per sentence")
    print(f"  → Output: {output_file.name}")
    
    return output_data['statistics']

def main():
    """Main processing function."""
    REPO_ROOT = Path(__file__).resolve().parent.parent
    gold_standard_dir = REPO_ROOT / "data" / "gold_standard"
    output_dir = gold_standard_dir / 'chunked'
    output_dir.mkdir(exist_ok=True)
    
    # Find parallel JSON files, excluding tablets and oracle queries (already atomic)
    parallel_files = list(gold_standard_dir.glob('*_parallel.json'))
    
    # Exclude files that are already atomic/complete units
    excluded_patterns = ['golden_tablets', 'oracle_queries']
    parallel_files = [f for f in parallel_files if not any(pattern in f.name for pattern in excluded_patterns)]
    
    excluded_files = [f for f in gold_standard_dir.glob('*_parallel.json') if any(pattern in f.name for pattern in excluded_patterns)]
    
    print(f"Found {len(parallel_files)} parallel JSON files to process")
    print(f"Excluding {len(excluded_files)} atomic files (tablets/queries): {[f.name for f in excluded_files]}")
    print()
    
    total_stats = {'total_lines': 0, 'total_sentences': 0}
    
    for input_file in parallel_files:
        # Create output filename
        output_name = input_file.stem.replace('_parallel', '_sentences') + '.json'
        output_file = output_dir / output_name
        
        # Process file
        stats = process_parallel_json(input_file, output_file)
        total_stats['total_lines'] += stats['total_original_lines']
        total_stats['total_sentences'] += stats['total_sentences']
        print()
    
    print("="*60)
    print(f"SUMMARY: {total_stats['total_lines']} lines → {total_stats['total_sentences']} sentences")
    print(f"Overall compression: {total_stats['total_lines'] / total_stats['total_sentences']:.2f} lines per sentence")
    print(f"Output directory: {output_dir}")

if __name__ == '__main__':
    main()
