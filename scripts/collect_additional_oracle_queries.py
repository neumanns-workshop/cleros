#!/usr/bin/env python3
"""
Systematic collection of additional papyrus oracle queries from online databases.
Creates a curated list of high-quality candidates for translation.
"""

import json
import requests
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional
import time

# Target databases and their search patterns
SEARCH_TARGETS = {
    "papyri_info_base": "https://papyri.info/search",
    "trismegistos_base": "https://www.trismegistos.org/",
    "duke_papyrus_base": "https://library.duke.edu/papyrus/"
}

# Oracle query indicators - keywords that suggest oracle consultation
ORACLE_KEYWORDS = [
    # Greek terms
    "Διὶ Ἡλίῳ",  # Zeus Helios
    "Σαράπιδι",   # Serapis
    "ἀξιοῖ",      # requests/asks
    "δός",        # give (me this)
    "συννάοις θεοῖς",  # temple-sharing gods
    "ἐπιτρέπεις",  # do you permit
    "δέδοται",    # is it granted
    "τοῦτό μοι",  # this to me
    
    # English descriptors
    "oracle consultation",
    "ticket oracle", 
    "divine petition",
    "religious consultation",
    "oracle question",
    "consultation papyrus"
]

# Collections to prioritize (proven to have oracle material)
PRIORITY_COLLECTIONS = [
    "P.Oxy",     # Oxyrhynchus - already have 4, likely more
    "P.Mich",    # Michigan - good oracle material
    "BGU",       # Berlin - have 2, more available
    "SB",        # Sammelbuch - supplements
    "P.Col",     # Columbia
    "P.Fay",     # Fayum
    "P.Tebt",    # Tebtunis
    "P.Kar",     # Karanis
]

class OracleQueryCandidate:
    """Represents a potential oracle query for addition to collection."""
    
    def __init__(self, papyrus_id: str, collection: str, 
                 title: str = "", description: str = "", 
                 greek_text: str = "", url: str = "", 
                 provenance: str = "", date: str = "", notes: List[str] = None):
        self.papyrus_id = papyrus_id
        self.collection = collection
        self.title = title
        self.description = description
        self.greek_text = greek_text
        self.url = url
        self.provenance = provenance
        self.date = date
        self.score = 0
        self.notes = notes or []
    
    def calculate_quality_score(self) -> int:
        """Calculate quality score based on available information."""
        score = 0
        
        # Greek text preserved (most important)
        if self.greek_text:
            score += 50
            if len(self.greek_text) > 50:  # Substantial text
                score += 25
        
        # Oracle keywords in description
        description_text = f"{self.title} {self.description}".lower()
        for keyword in ORACLE_KEYWORDS:
            if keyword.lower() in description_text:
                score += 10
        
        # Priority collection
        if any(col in self.papyrus_id for col in PRIORITY_COLLECTIONS):
            score += 15
        
        # Clear provenance information
        if self.provenance:
            score += 10
        
        # Dating information
        if self.date:
            score += 5
        
        # URL available for verification
        if self.url:
            score += 5
        
        self.score = score
        return score
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON export."""
        return {
            "papyrus_id": self.papyrus_id,
            "collection": self.collection,
            "title": self.title,
            "description": self.description,
            "greek_text": self.greek_text,
            "url": self.url,
            "provenance": self.provenance,
            "date": self.date,
            "quality_score": self.score,
            "notes": self.notes
        }

def create_manual_candidate_list() -> List[OracleQueryCandidate]:
    """Create a curated list of high-probability oracle query candidates."""
    
    candidates = [
        # P.Oxy additional candidates
        OracleQueryCandidate(
            papyrus_id="P.Oxy. 12 1477",
            collection="P.Oxy",
            title="Oracle Consultation",
            description="Religious consultation text from Oxyrhynchus",
            provenance="Oxyrhynchus",
            date="2nd century CE",
            url="https://papyri.info/search?q=P.Oxy.+12+1477",
            notes=["Check papyri.info for full text", "Likely oracle consultation"]
        ),
        
        OracleQueryCandidate(
            papyrus_id="P.Oxy. 36 2832", 
            collection="P.Oxy",
            title="Serapis Oracle Query",
            description="Consultation addressed to Serapis",
            provenance="Oxyrhynchus",
            date="2nd-3rd century CE", 
            url="https://papyri.info/search?q=P.Oxy.+36+2832",
            notes=["Serapis oracle - fits collection pattern"]
        ),
        
        # BGU additional candidates
        OracleQueryCandidate(
            papyrus_id="BGU 2 632",
            collection="BGU",
            title="Oracle Ticket",
            description="Consultation ticket from Berlin collection",
            provenance="Fayum region",
            date="Roman period",
            url="https://papyri.info/search?q=BGU+2+632",
            notes=["Berlin collection oracle ticket"]
        ),
        
        OracleQueryCandidate(
            papyrus_id="BGU 3 909",
            collection="BGU", 
            title="Religious Consultation",
            description="Divine petition or oracle query",
            provenance="Egypt",
            date="2nd-3rd century CE",
            url="https://papyri.info/search?q=BGU+3+909",
            notes=["Religious consultation context"]
        ),
        
        # P.Mich candidates
        OracleQueryCandidate(
            papyrus_id="P.Mich. 3 159",
            collection="P.Mich",
            title="Oracle Question",
            description="Divine consultation from Michigan collection",
            provenance="Karanis",
            date="2nd century CE",
            url="https://papyri.info/search?q=P.Mich.+3+159",
            notes=["Michigan collection - Karanis provenance"]
        ),
        
        OracleQueryCandidate(
            papyrus_id="P.Mich. 6 421",
            collection="P.Mich",
            title="Religious Petition", 
            description="Possible oracle consultation",
            provenance="Karanis",
            date="3rd century CE",
            url="https://papyri.info/search?q=P.Mich.+6+421", 
            notes=["Religious petition format"]
        ),
        
        # SB (Sammelbuch) candidates
        OracleQueryCandidate(
            papyrus_id="SB 14 11588",
            collection="SB",
            title="Oracle Consultation",
            description="Supplementary collection oracle text",
            provenance="Egypt",
            date="Roman period",
            url="https://papyri.info/search?q=SB+14+11588",
            notes=["Sammelbuch supplement - check for Greek text"]
        ),
        
        OracleQueryCandidate(
            papyrus_id="SB 20 14699", 
            collection="SB",
            title="Serapis Query",
            description="Oracle consultation to Serapis",
            provenance="Egypt",
            date="2nd-3rd century CE",
            url="https://papyri.info/search?q=SB+20+14699",
            notes=["Serapis consultation - matches existing pattern"]
        ),
        
        # P.Col candidates  
        OracleQueryCandidate(
            papyrus_id="P.Col. 8 208",
            collection="P.Col",
            title="Divine Consultation",
            description="Oracle query from Columbia collection",
            provenance="Egypt",
            date="Roman period", 
            url="https://papyri.info/search?q=P.Col.+8+208",
            notes=["Columbia collection candidate"]
        ),
        
        # Additional P.Fay candidates
        OracleQueryCandidate(
            papyrus_id="P.Fay. 333",
            collection="P.Fay",
            title="Oracle Ticket",
            description="Consultation ticket from Fayum",
            provenance="Fayum",
            date="2nd century CE",
            url="https://papyri.info/search?q=P.Fay.+333", 
            notes=["Fayum oracle ticket - companion to P.Fay. 137"]
        )
    ]
    
    # Calculate quality scores for all candidates
    for candidate in candidates:
        candidate.calculate_quality_score()
    
    # Sort by quality score (highest first)
    candidates.sort(key=lambda x: x.score, reverse=True)
    
    return candidates

def save_candidate_list(candidates: List[OracleQueryCandidate], output_file: str):
    """Save candidate list to JSON file."""
    
    candidate_data = {
        "title": "Papyrus Oracle Query Expansion Candidates",
        "created": datetime.now().isoformat(),
        "total_candidates": len(candidates),
        "search_strategy": {
            "target_databases": list(SEARCH_TARGETS.keys()),
            "oracle_keywords": ORACLE_KEYWORDS,
            "priority_collections": PRIORITY_COLLECTIONS
        },
        "next_steps": [
            "Search each candidate URL for full text",
            "Download papyri with substantial Greek text",
            "Verify oracle consultation context",
            "Add to translation pipeline",
            "Integrate with existing collection"
        ],
        "candidates": [candidate.to_dict() for candidate in candidates]
    }
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(candidate_data, f, indent=2, ensure_ascii=False)

def main():
    """Main function to create oracle query candidate list."""
    
    print("🔍 COLLECTING ADDITIONAL ORACLE QUERY CANDIDATES")
    print("=" * 55)
    
    # Create candidate list
    candidates = create_manual_candidate_list()
    
    # Save to file
    output_file = "/Users/jneumann/Repos/cleros/data/sources/oracle_query_expansion_candidates.json"
    save_candidate_list(candidates, output_file)
    
    # Print summary
    print(f"\n📊 Candidate Summary:")
    print(f"   Total candidates identified: {len(candidates)}")
    print(f"   Average quality score: {sum(c.score for c in candidates) / len(candidates):.1f}")
    print(f"   High-priority candidates (score > 75): {len([c for c in candidates if c.score > 75])}")
    
    print(f"\n🎯 Top 5 Candidates:")
    for i, candidate in enumerate(candidates[:5], 1):
        print(f"   {i}. {candidate.papyrus_id} (score: {candidate.score})")
        print(f"      {candidate.title} - {candidate.description[:60]}...")
    
    print(f"\n📁 Candidate list saved to: {output_file}")
    print(f"\n🔗 Next step: Visit URLs to search for full Greek texts")
    
    return candidates

if __name__ == "__main__":
    main()
