# Cleros: Ancient Greek Religious Corpus

## Overview

**Cleros** (κλῆρος - "divine portion, sacred lot") is a comprehensive digital collection of ancient Greek religious texts, spanning eight centuries of sacred literature from mystery cults to public oracles. This corpus provides both scholarly research tools and resources for understanding ancient consultation practices.

## Complete Corpus Contents

### **Orphic Argonautica**
- **Genre**: Epic narrative poetry
- **Period**: 4th-6th century CE
- **Content**: Jason's heroic quest with Orphic theological elements
- **Lines**: 1,376 lines of dactylic hexameter
- **Annotation**: 1,313 philological notes (95.4% coverage)

### **Orphic Lithica**
- **Genre**: Didactic poetry on mineralogy
- **Period**: 4th-6th century CE
- **Content**: Magical and medicinal properties of stones
- **Lines**: 779 lines of hexameter verse
- **Annotation**: 775 philological notes (99.5% coverage)

### **Orphic Hymns**
- **Genre**: Ritual religious poetry
- **Period**: 2nd-3rd century CE
- **Content**: 88 hymns to deities + proem + appendix
- **Lines**: 1,173 total lines (45 proem + 1,096 hymns + 32 appendix)
- **Annotation**: 1,137 philological notes (96.9% coverage)

### **Orphic Golden Tablets**
- **Genre**: Funerary ritual texts
- **Period**: 5th-2nd century BCE
- **Content**: Gold leaf inscriptions from mystery cult graves
- **Items**: 10 tablets with formulaic afterlife passwords
- **Annotation**: 10 philological notes (100% coverage)

### **Dodona Oracle Queries**
- **Genre**: Oracle consultation texts
- **Period**: 5th-2nd century BCE
- **Content**: Lead tablet questions to Zeus at Dodona
- **Items**: 18 queries covering family, legal, agricultural concerns
- **Annotation**: 18 philological notes (100% coverage)

## Corpus Statistics

| **Collection** | **Texts** | **Lines/Items** | **Annotation** | **Success Rate** | **Formats** |
|----------------|-----------|-----------------|----------------|------------------|-------------|
| Argonautica | 1 epic | 1,376 lines | 95.4% | 100% | 4 editions |
| Lithica | 1 poem | 779 lines | 99.5% | 100% | 4 editions |
| Hymns | 90 pieces | 1,173 lines | 96.9% | 100% | 4 editions |
| Golden Tablets | 10 tablets | 10 formulae | 100% | 100% | 4 editions |
| Dodona Queries | 18 queries | 18 consultations | 100% | 100% | 4 editions |
| **TOTAL** | **120 texts** | **3,356 items** | **97.0%** | **100%** | **20 editions** |

## Available Formats

Each collection is available in **four standardized formats**:

### 1. **Scholarly JSON** (`*.json`)
- **Purpose**: Academic research and digital humanities
- **Content**: Complete metadata, philological apparatus, textual notes
- **Features**: Structured data with line-by-line Greek text, English translation, and scholarly commentary
- **Ideal for**: Research databases, computational analysis, citation

### 2. **Parallel Edition** (`*_parallel.json`)
- **Purpose**: Comparative study and language learning
- **Content**: Side-by-side Greek and English with simplified structure
- **Features**: Clean alignment for easy comparison and parsing
- **Ideal for**: Educational applications, translation study, parallel corpora

### 3. **Greek Text** (`*_greek.txt`)
- **Purpose**: Classical philology and textual analysis
- **Content**: Pure ancient Greek text with line numbers
- **Features**: Clean, readable format preserving original language
- **Ideal for**: Manuscript study, linguistic analysis, recitation

### 4. **English Translation** (`*_english.txt`)
- **Purpose**: General readers and accessibility
- **Content**: Complete English translations in readable format
- **Features**: Scholarly accuracy with modern readability
- **Ideal for**: General study, meditation, practical consultation

## Translation Methodology

### **AI-Assisted Approach**
- **System**: GPT-5 reasoning with "medium effort" cognitive processing
- **Method**: Large-scale ancient text corpus using advanced AI reasoning
- **Accuracy**: Verified semantic accuracy across 3,356+ texts
- **Quality**: 97% average philological annotation coverage

### **Specialized Translation Context**
- **Metadata-driven prompts**: Genre-specific context prevents cultural misunderstandings
- **Chunk-based processing**: Manages long texts while maintaining coherence
- **Error correction pipeline**: Systematic validation ensures 100% success rates
- **Scholarly validation**: Each translation verified for semantic accuracy

### **Quality Assurance**
- **Dialectical preservation**: Maintains Doric, Ionic, and Attic Greek features
- **Technical terminology**: Accurate rendering of religious, legal, and scientific vocabulary
- **Cultural context**: Preserves ancient worldview and religious concepts
- **Editorial consistency**: Uniform nomenclature and scholarly standards throughout

## Religious Practice Integration

### **Orphic Texts**
- **Cosmic Theology**: Divine order and universal principles
- **Afterlife Instructions**: Soul's journey after death
- **Sacred Substances**: Gemstone and material properties
- **Ritual Invocations**: Approaches to specific deities

### **Oracle Consultation Texts**
- **Consultation Formulae**: Patterns for approaching the divine
- **Life Guidance**: Questions about family, health, business, legal matters
- **Sacred Communication**: Ancient Greek consultation practices
- **Decision Framework**: Divine guidance for practical choices

### **Integrated Corpus**
These texts provide both theological framework and practical methodology for understanding ancient Greek religious consultation practices.

## Usage Guide

### **For Scholars**
```python
import json

# Load scholarly edition with full apparatus
with open('orphic_hymns.json', 'r') as f:
    hymns = json.load(f)

# Access individual hymn with notes
hymn_1 = hymns['content']['hymns'][0]
print(f"Hymn to {hymn_1['title']}")
print(f"Greek: {hymn_1['lines'][0]['greek']}")
print(f"English: {hymn_1['lines'][0]['english']}")
print(f"Note: {hymn_1['lines'][0]['note']}")
```

### **For Practitioners**
- **Daily Consultation**: Use Dodona query patterns for modern questions
- **Ritual Practice**: Follow Orphic hymn structures for divine invocations  
- **Meditation**: Engage with English translations for spiritual reflection
- **Sacred Study**: Learn authentic ancient approaches to the divine

### **For Developers**
- **API Integration**: JSON formats ready for database import
- **Search Functionality**: Structured metadata enables sophisticated queries
- **Multi-format Support**: Choose appropriate format for application needs
- **Cross-referencing**: Linked scholarly apparatus for comprehensive research

## 🎓 Academic Standards

### **Editorial Principles**
1. **Semantic Accuracy**: Every translation verified for meaning
2. **Cultural Authenticity**: Ancient concepts preserved without modernization
3. **Scholarly Rigor**: Complete philological apparatus with textual notes
4. **Linguistic Precision**: Dialectical features and technical terms maintained
5. **Editorial Consistency**: Uniform standards across entire corpus

### **Source Standards**
- **Orphic Texts**: Based on critical editions (Abel, Quandt, Ricciardelli)
- **Golden Tablets**: From archaeological publications (Graf-Johnston, Edmonds)
- **Dodona Queries**: Dodona Online (DOL) curated scholarly database
- **Manuscript Tradition**: Respects scholarly consensus on readings

### **Annotation Standards**
- **Philological Notes**: Technical explanations of difficult terms
- **Textual Variants**: Documentation of manuscript differences
- **Historical Context**: Cultural and religious background information
- **Cross-references**: Connections between related passages

## Project Characteristics

### **Scope and Coverage**
- **Comprehensive Collection**: Digital corpus of ancient Greek religious literature
- **AI Translation**: Ancient text corpus translated using GPT-5 reasoning
- **Integration**: Unified collection combining mystical and practical traditions
- **Quality**: 97% annotation density with verified accuracy

### **Applications**
- **Research Resource**: Scholarly editions for academic use
- **Digital Humanities**: Structured data for computational research
- **Educational Tool**: Texts for classical studies curricula
- **Cultural Documentation**: Ancient religious voices preserved digitally

### **Technical Approach**
- **Methodology**: AI-assisted classical translation
- **Accuracy**: Systematic validation of translation quality
- **Scale**: Large-scale application of reasoning models to ancient languages
- **Standards**: Digital critical edition standards

## Citation Guidelines

### **Academic Citation**
```
Cleros Ancient Greek Religious Corpus. GPT-5 Translation with Philological 
Review. Digital Humanities Project, 2025. [Specific collection and format].
```

### **Individual Works**
```
"Orphic Hymns: Complete Collection with Commentary." Cleros Corpus, 
translated by GPT-5 Reasoning System with scholarly annotation, 2025.
```

### **Data Citation**
```
Dataset: Cleros Ancient Greek Religious Corpus (JSON format). 
5 collections, 20 editions, 3,356 texts. 
```

## License & Usage

**Public Domain**: All source texts are ancient and in the public domain. The English translations and scholarly apparatus created for this corpus are released under **Creative Commons CC0** (public domain dedication).

**Usage Permissions**: 
- Academic research and publication
- Educational and teaching applications  
- Commercial and non-commercial projects
- Religious and spiritual practice
- Digital humanities and computational research
- Integration into larger databases or applications

**Attribution**: While not required, attribution is appreciated to support ongoing digital humanities work.

## About Cleros

**Cleros** (κλῆρος) means "divine portion" or "sacred lot" in ancient Greek. This corpus provides access to ancient wisdom through systematic translation while preserving authentic ancient voices.

**Project Goal**: To make ancient Greek religious literature available in accurate, scholarly translations for both academic research and understanding of historical consultation practices.

---

**Created**: August 2025  
**Translation Method**: GPT-5 Reasoning + Scholarly Review  
**Status**: Complete — Production Ready  
**Corpus Version**: 1.0