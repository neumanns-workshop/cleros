# Cleros: The New Vision
## Modern Web Interface for Ancient Wisdom

### Core Experience

**Cleros** combines ancient Greek consultation practices with modern semantic search in a beautiful, intuitive interface.

## Key Features

### 🎲 **True Random Oracle Mode**
- **RANDOM.ORG integration** for atmospheric noise-based true randomness
- Random source selection from main corpus (Hymns, Argonautica, Lithica)
- Random section/hymn within selected source
- Environmental variables: `RANDOMORG_API_KEY` and `RANDOMORG_ENDPOINT`

### 🔍 **Pure Semantic Mode** 
- Real-time semantic search across **main corpus** (Hymns, Argonautica, Lithica)
- Query-driven interpretation and response from **749 poetic/narrative units**
- Cross-corpus thematic discovery in sacred literature
- Transformers.js client-side embeddings (no server needed)

### 🌟 **Visual Interpretation Layer**
- **Semantic brightness modulation**: Text opacity reflects semantic similarity scores for progressive revelation
- **Query highlighting**: Keywords from user query highlighted in context
- **Responsive design**: Works beautifully on all devices

### 🏺 **Voices from the Past**
- **Oracle queries**: Rotating display of real ancient questions to Zeus at Dodona
- **Historical simulation**: Show how ancient queries would be answered using the corpus
- **Contextual wisdom**: Golden tablets provide mystical context and interpretation
- **Conversation across time**: Connect modern seekers with ancient questioners

### 📸 **Shareable Insights**
- Beautiful snapshot cards for sharing discoveries
- Include query, source, highlighted passages, timestamp
- Social media optimized formats
- Permanent URLs for specific consultations

## Technical Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for beautiful, responsive design
- **Framer Motion** for smooth animations
- **transformers.js** for client-side embeddings

### Data Integration
- **Search corpus**: 749 semantic units (Hymns, Argonautica, Lithica)
- **Context corpus**: 28 units (Oracle queries, Golden tablets) for ambient display
- **Client embeddings**: 384D vectors for real-time search of main corpus
- **Sentence chunking**: Optimal semantic granularity
- **Scholarly metadata**: Preserved line numbers, Greek text, notes

### Randomness & APIs
- **RANDOM.ORG API**: Atmospheric noise-based true randomness for oracle mode
- **Environment configuration**: Secure API key management
- **Fallback RNG**: Crypto.getRandomValues() if API unavailable

## User Experience Flow

### Oracle Mode
1. **Enter your question** (traditional consultation style)
2. **True random selection** of source (Hymns/Argonautica/Lithica) + section via RANDOM.ORG
3. **Semantic interpretation** finds most relevant sentences in selected section
4. **Visual brightness modulation** shows semantic relevance hierarchy
5. **Query highlighting** emphasizes related concepts
6. **Share snapshot** of the consultation

### Semantic Mode  
1. **Enter your query** (modern search style)
2. **Real-time search** across main corpus (Hymns, Argonautica, Lithica)
3. **Cross-corpus results** from 749 poetic/narrative units
4. **Contextual display** with source attribution and scholarly metadata
5. **Historical context**: See how similar ancient queries were posed
6. **Export findings** as shareable cards with golden tablet wisdom

### Ambient Elements
- **Rotating oracle queries**: "Concerning the safety of the child and wife: what should be done?" 
- **Contextual tablets**: Golden tablet wisdom appears relevant to current query
- **Visual simulation**: Show ancient query → modern corpus response pipeline

## Design Principles

### Visual Identity
- **Orphic egg logo** as the central symbol
- **Dark, mystical aesthetic** suitable for contemplation
- **Typography**: Classical serif for Greek, modern sans for English
- **Color palette**: Deep blues, golds, purples (ancient manuscript inspired)

### Interaction Design
- **Minimal, focused interface** that doesn't distract from content
- **Smooth animations** that enhance rather than overwhelm
- **Responsive scaling** from mobile to large displays
- **Keyboard shortcuts** for power users

### Content Presentation
- **Scholarly precision**: All metadata preserved and accessible
- **Progressive disclosure**: Start simple, reveal complexity on demand
- **Dual language support**: Greek and English side-by-side when desired
- **Citation ready**: Proper attribution for academic use

## Implementation Phases

### Phase 1: Core Foundation
- [ ] Modern React + Vite setup
- [ ] Tailwind CSS design system
- [ ] Client embedding integration
- [ ] Basic corpus display

### Phase 2: Oracle Mode
- [ ] RANDOM.ORG API integration
- [ ] Random source/section selection
- [ ] Semantic brightness modulation
- [ ] Query highlighting system

### Phase 3: Semantic Mode
- [ ] Real-time cross-corpus search
- [ ] Advanced result filtering
- [ ] Contextual result display
- [ ] Export functionality

### Phase 4: Polish & Sharing
- [ ] Snapshot card system
- [ ] URL sharing for consultations
- [ ] Performance optimization
- [ ] Mobile responsiveness
- [ ] Accessibility features

## Why This Is Special

### Beyond Traditional Digital Humanities
- **Living corpus**: Not just static display but interactive exploration
- **Semantic understanding**: AI that actually comprehends ancient concepts
- **Authentic consultation**: True randomness honors divinatory traditions
- **Scholarly integrity**: All academic metadata preserved and accessible

### Modern Technology, Ancient Wisdom
- **Client-side AI**: No servers needed for semantic search
- **Quantum randomness**: More "fated" than pseudorandom algorithms
- **Real-time interpretation**: Immediate insights from 3,000+ year old texts
- **Cross-corpus discovery**: Find connections across different ancient sources

### User-Centric Design
- **Intuitive for scholars**: Access all the metadata and precision needed
- **Approachable for seekers**: Beautiful, simple consultation interface
- **Shareable insights**: Turn ancient wisdom into modern conversations
- **Respectful presentation**: Honor the sacred nature of the source material

## Success Metrics

### Engagement
- Time spent exploring corpus content
- Number of consultations performed
- Cross-corpus discovery patterns
- Social sharing of insights

### Quality
- Semantic search relevance scores
- User satisfaction with randomness quality
- Scholarly citation usage
- Community feedback and contributions

### Technical
- Client-side performance metrics
- Search response times
- Mobile usability scores
- Accessibility compliance

---

*"The divine element is immanent within the interaction between questioner and system, rather than transcendent or external to it."*

**Cleros** embodies this principle through technology that serves wisdom rather than replacing it.
