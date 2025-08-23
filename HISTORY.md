# Project History: Cleros

This document provides a technical and conceptual history of the Cleros project, from its inception as SORTES to its current version.

## Project Prehistory: Motivations and Insights

Cleros was born from the insight that modern AI's mastery of semantics provides a powerful new lens for ancient divinatory practices like bibliomancy. The core motivation was to create a system that doesn't just give a random answer, but guides the user toward an interpretation, much like a traditional oracle would.

The project is built on these foundational ideas:

1.  **AI as an Interpretive Proxy**: Contemporary language models can act as a proxy for an oracle's interpretive function. Their ability to understand semantics across vast datasets (from ancient scholarship to modern language) allows them to "interpret" a user's query in a way that is contextually rich and nuanced.

2.  **Dual-Aspect Divination**: A key innovation is the two-fold use of the user's query. The system was designed to first introduce an element of fated chance, and then to provide a focused interpretation.
    *   **Random Selection**: First, the system uses the query's semantic embedding combined with temporal data to pseudo-randomly select a hymn. This mirrors the casting of lots (*klēros*) and honors the element of chance found in traditional divination.
    *   **Surfacing Interpretation**: Second, the *same* semantic embedding is used to find the most contextually relevant passages and entities (spans) within the corpus. This moves beyond pure randomness to "surface an interpretation," highlighting specific lines that resonate with the user's question.

3.  **Semantics as the Bridge**: The semantic embedding of the user's query is the crucial link. It connects the querent's intent to both the "random" hymn selection and the specific highlighted interpretations, ensuring that the entire process, while containing chance, is guided by the meaning of the query.

This philosophical framework—combining chance with deep semantic interpretation—guided the technical architecture, aiming for an experience that feels authentically oracular rather than merely algorithmic.

## Project Timeline

*   **March 28, 2025 (`bba7972`):** The project began as **SORTES**. The initial commit established a comprehensive framework, including the React-based frontend and a full data processing pipeline with individual JSON files for each hymn (`/data/base/hymn_*.json`). This commit laid the foundation for the semantic search and text analysis capabilities.

*   **March 28-29, 2025:** The initial development phase focused heavily on setting up the deployment pipeline to GitHub Pages. Key architectural improvements during this period included:
    * Refactoring the text embedding architecture to use line-level embeddings only (`9abfd66`)
    * Adding Python scripts for generating TensorFlow.js compatible embeddings (`11c1a78`)
    * Fixing hymn text ellipses and regenerating embeddings for v1.0.1-beta (`b19e9ae`)
    * Updating API and deities services to use axios directly (`7efdae2`)

*   **April 7, 2025 (`89a262b`):** The project was renamed from **SORTES** to **Cleros**. The original name, "Sortes," has broad connotations, while the project's focus had narrowed to the specific context of Greek tradition and bibliomancy. The name "Cleros," which refers to the casting of lots in ancient Greece (*klēros*), was a better fit for the project's core mechanism and thematic focus. This change was applied across documentation, application code, and metadata files including workflow configurations, package definitions, and UI components.

*   **April 11, 2025:** Development for version `2.0.0` focused on performance, stability, and automation:
    * Adding new JSON data files for span-based entity categorization (`40a2ca0`)
    * Applying performance improvements and QA feedback (`e2ab82f`)
    * Adding embedding generation step to GitHub Actions workflow (`b97d659`)
    * Preparing for GitHub Pages deployment as a submodule (`9c80920`)
    * Fixing UI color schemes and component placement (`d402321`, `988df7f`)

## Core Technical Components

### Computational Bibliomancy via Temporally-Seeded Search

Cleros implements computational bibliomancy through a deterministic search algorithm with temporal seeding. The implementation in `web/src/services/qrng.ts` combines semantic vector properties with temporal data to generate a consistent yet unpredictable result.

The process follows these steps:
1.  The application generates a semantic vector embedding from the user's query using TensorFlow.js.
2.  The system calculates statistical properties of the vector: sum, mean, standard deviation, and max/min values.
3.  The current timestamp (down to milliseconds) is captured.
4.  These two data streams are concatenated into a single string.
5.  This string is hashed using a bitwise hashing function to produce a 32-bit integer seed.
6.  The final result is calculated as the absolute value of the hash modulo 88 (the number of hymns).

This method connects the semantic content of the query to the specific moment of inquiry, creating a deterministic yet contextually relevant result.

### AI-Powered Entity Classification

The entity classification system uses a Large Language Model to categorize entities within the hymn corpus. The `tools/entity_classifier.py` script implements this functionality:

1.  The script extracts entities and their surrounding text from linguistic feature data, filtering out non-relevant entities.
2.  For each entity, it constructs a prompt for the LLM.
3.  The prompt is sent to a local Ollama server running the `gemma3:27b` model.
4.  The LLM classifies each entity into categories including "Olympian," "Chthonic," "Titan," "Nature," "Abstract," "Hero/Mortal," "Other," or "IRRELEVANT."
5.  The structured classification data is saved for use in the application.

### Unified Hymn Corpus

Version 2.0.0 introduced a significant architectural change with the consolidation of individual hymn files into a unified data model:

1. The system now combines both Homeric and Orphic Hymns into a single corpus.
2. The data structure was redesigned to support a comprehensive span-based entity system.
3. Entity spans are categorized with additional metadata for richer information display.
4. The embedding architecture was optimized to work with this consolidated structure.

### Entity Span System

The application implements a sophisticated entity span system that:

1. Identifies and categorizes entities within the hymn texts.
2. Provides contextual span highlighting with improved categorization.
3. Supports multiple entity types including:
   * deity - Named gods and goddesses
   * epithet - Divine titles and honorifics
   * place - Sacred and mythological locations
   * mortal - Human and mortal references
   * artifact - Objects or items associated with the gods
   * nature - Natural phenomena or objects
   * celestial_sphere - Stars, planets, and other celestial bodies
   * beast - Mythical creatures or animals
   * hero - Human or demigod heroes
   * action - Significant actions or events
   * other - Other categories not yet defined
   * other_divinity - Other divine beings falling outside of the above categories
4. Includes span metadata for enhanced information display.

This system enables the application to provide deeper context for terms within the hymn passages it displays.
