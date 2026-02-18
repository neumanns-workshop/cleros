#!/usr/bin/env python3
"""
Create properly structured versions of Argonautica and Lithica with natural episode/section divisions.
This replaces the arbitrary line-number divisions with content-based structural divisions.
"""

import json
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

def create_structured_argonautica():
    """Create Argonautica with 6 natural episodes based on narrative structure."""
    
    # Load the original sentence-chunked data
    source_file = REPO_ROOT / "data" / "gold_standard" / "chunked" / "orphic_argonautica_sentences.json"
    with open(source_file, 'r', encoding='utf-8') as f:
        original_data = json.load(f)
    
    # Extract all sentences from the original single section
    all_sentences = original_data['sections'][0]['sentences']
    
    # Define episode boundaries based on narrative content
    episodes = [
        {
            "title": "Invocation & Preparation", 
            "type": "episode",
            "lines": (1, 95),
            "description": "Apollo invocation, Orpheus's previous works, Jason's recruitment"
        },
        {
            "title": "Assembly of Heroes", 
            "type": "episode", 
            "lines": (96, 240),
            "description": "Cataloguing heroes, ship launching, departure ceremonies"
        },
        {
            "title": "Early Adventures", 
            "type": "episode",
            "lines": (241, 484), 
            "description": "Cheiron episode, Lemnian women, Hellespont passage"
        },
        {
            "title": "Trials & Challenges", 
            "type": "episode",
            "lines": (485, 760),
            "description": "Cyzicus, Phineus, Clashing Rocks, various peoples encountered"
        },
        {
            "title": "Arrival at Colchis", 
            "type": "episode",
            "lines": (761, 1019),
            "description": "Meeting Aeetes, Medea's love, dragon guardian, retrieval of fleece"
        },
        {
            "title": "Return Journey", 
            "type": "episode",
            "lines": (1020, 1376),
            "description": "Escape with Medea, murder of Apsyrtus, long return voyage, homecoming"
        }
    ]
    
    # Create new structured data
    structured_data = {
        "title": "Orphic Argonautica — Episode-Structured Edition",
        "source_file": "orphic_argonautica_sentences.json", 
        "created": "2025-01-18T12:00:00.000000",
        "format": "Episode-based structure preserving sentence chunking",
        "structure_method": "Content-based narrative analysis",
        "sections": []
    }
    
    for i, episode in enumerate(episodes):
        start_line, end_line = episode["lines"]
        
        # Find sentences that fall within this episode's line range
        episode_sentences = []
        for sentence in all_sentences:
            # Check if any line in this sentence falls within episode range
            sentence_lines = sentence.get("line_range", {}).get("lines", [])
            if any(start_line <= line <= end_line for line in sentence_lines):
                episode_sentences.append(sentence)
        
        # Count lines in this episode
        all_episode_lines = set()
        for sentence in episode_sentences:
            all_episode_lines.update(sentence.get("line_range", {}).get("lines", []))
        line_count = len([line for line in all_episode_lines if start_line <= line <= end_line])
        
        episode_section = {
            "title": episode["title"],
            "type": episode["type"], 
            "episode_number": i + 1,
            "line_range": {"start": start_line, "end": end_line},
            "original_line_count": line_count,
            "sentence_count": len(episode_sentences),
            "description": episode["description"],
            "sentences": episode_sentences
        }
        
        structured_data["sections"].append(episode_section)
    
    # Write structured file
    output_file = REPO_ROOT / "web" / "public" / "orphic_argonautica_episodes.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(structured_data, f, indent=2, ensure_ascii=False)
    
    print(f"Created structured Argonautica with {len(episodes)} episodes")
    return output_file

def create_structured_lithica():
    """Create Lithica with 4 natural sections based on thematic content."""
    
    # Load the original sentence-chunked data
    source_file = REPO_ROOT / "data" / "gold_standard" / "chunked" / "orphic_lithica_sentences.json"
    with open(source_file, 'r', encoding='utf-8') as f:
        original_data = json.load(f)
    
    # Extract all sentences from the original single section
    all_sentences = original_data['sections'][0]['sentences']
    
    # Define section boundaries based on thematic content
    sections = [
        {
            "title": "Introduction & Divine Gifts",
            "type": "section", 
            "lines": (1, 198),
            "description": "Hermes' gifts, nature of divine knowledge, general principles"
        },
        {
            "title": "Precious & Protective Stones",
            "type": "section",
            "lines": (199, 398), 
            "description": "Adamas, agate, jasper, topaz, protective stones and their properties"
        },
        {
            "title": "Magical & Healing Stones",
            "type": "section",
            "lines": (399, 598),
            "description": "Siderite, ophites, coral origin myth, various healing stones"
        },
        {
            "title": "Divinatory & Celestial Stones", 
            "type": "section",
            "lines": (599, 779),
            "description": "Complex rituals, serpent ceremonies, final stones, conclusion"
        }
    ]
    
    # Create new structured data
    structured_data = {
        "title": "Orphic Lithica — Section-Structured Edition",
        "source_file": "orphic_lithica_sentences.json",
        "created": "2025-01-18T12:00:00.000000", 
        "format": "Section-based structure preserving sentence chunking",
        "structure_method": "Content-based thematic analysis",
        "sections": []
    }
    
    for i, section in enumerate(sections):
        start_line, end_line = section["lines"]
        
        # Find sentences that fall within this section's line range
        section_sentences = []
        for sentence in all_sentences:
            # Check if any line in this sentence falls within section range
            sentence_lines = sentence.get("line_range", {}).get("lines", [])
            if any(start_line <= line <= end_line for line in sentence_lines):
                section_sentences.append(sentence)
        
        # Count lines in this section
        all_section_lines = set()
        for sentence in section_sentences:
            all_section_lines.update(sentence.get("line_range", {}).get("lines", []))
        line_count = len([line for line in all_section_lines if start_line <= line <= end_line])
        
        section_data = {
            "title": section["title"],
            "type": section["type"],
            "section_number": i + 1, 
            "line_range": {"start": start_line, "end": end_line},
            "original_line_count": line_count,
            "sentence_count": len(section_sentences),
            "description": section["description"],
            "sentences": section_sentences
        }
        
        structured_data["sections"].append(section_data)
    
    # Write structured file
    output_file = REPO_ROOT / "web" / "public" / "orphic_lithica_sections.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(structured_data, f, indent=2, ensure_ascii=False)
    
    print(f"Created structured Lithica with {len(sections)} sections")
    return output_file

if __name__ == "__main__":
    print("Creating structured corpora with natural divisions...")
    
    argonautica_file = create_structured_argonautica()
    lithica_file = create_structured_lithica()
    
    print(f"\nCreated files:")
    print(f"- {argonautica_file}")
    print(f"- {lithica_file}")
    print("\nNow update the web app to load these structured versions.")
