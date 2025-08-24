# Papyrus Oracle Query Expansion Plan

## Target: 15-25 High-Quality Oracle Queries with Greek Text

### Phase 1: Systematic Database Searches

#### 1. Papyri.info Advanced Search
**URL**: https://papyri.info/search
**Search Strategy**:
- Keywords: "oracle", "Serapis", "Zeus Helios", "συννάοις θεοῖς", "ἀξιοῖ"
- Collections to focus on: P.Oxy, P.Mich, P.Col, BGU, SB
- Date range: 1-300 CE (Roman period)
- Filter for: Greek text preserved

#### 2. Trismegistos Targeted Search  
**URL**: https://www.trismegistos.org/
**Search for**:
- Text type: "Oracle consultation"
- Material: Papyrus
- Geographic focus: Oxyrhynchus, Karanis, Soknopaiou Nesos

#### 3. Duke Papyrus Archive
**URL**: https://library.duke.edu/papyrus/
**Browse by**: Religious aspects → Oracle consultations

### Phase 2: Specific Targets to Download

#### Known Additional P.Oxy Oracle Queries:
1. **P.Oxy. 12 1477** - Oracle consultation (check if available)
2. **P.Oxy. 36 2832** - Serapis oracle query  
3. **P.Oxy. 17 2133** - Divine consultation

#### BGU Collection Expansion:
4. **BGU 2 632** - Oracle ticket (Berlin collection)
5. **BGU 3 909** - Religious consultation

#### P.Mich Candidates:
6. **P.Mich. 3 159** - Oracle question
7. **P.Mich. 6 421** - Religious petition

#### SB Supplements:
8. **SB 14 11588** - Oracle consultation
9. **SB 20 14699** - Serapis query

### Phase 3: Reference Materials to Download

#### Scholarly Articles (PDF):
1. **"Oracle Consultations in Roman Egypt"** - Search academia.edu
2. **"Ticket Oracles and Popular Religion"** - JSTOR/Project MUSE
3. **"Serapis Oracle Practices"** - papyrological journals

#### Primary Source Collections:
4. **Oxyrhynchus Papyri Volumes** (selective download)
5. **Berlin Papyrus Collection** catalog pages

### Search Methodology

#### Keywords for Database Searches:
**Greek Terms**:
- Διὶ Ἡλίῳ (Zeus Helios)
- Σαράπιδι (Serapis)  
- ἀξιοῖ (requests/asks)
- τοῦτό μοι δός (give me this)
- συννάοις θεοῖς (temple-sharing gods)

**English Terms**:
- "oracle consultation"
- "ticket oracle" 
- "divine petition"
- "religious consultation"
- "lot oracle"

#### Quality Criteria:
✅ **Include**: Greek text preserved (even partial)
✅ **Include**: Clear oracle consultation context
✅ **Include**: Roman period (1-300 CE)
✅ **Include**: Egyptian provenance
❌ **Skip**: Summary only, no Greek
❌ **Skip**: Too fragmentary
❌ **Skip**: Uncertain oracle context

### Expected Yield by Collection:
- **P.Oxy**: 8-10 additional queries
- **P.Mich**: 3-4 queries  
- **BGU**: 2-3 queries
- **SB/Other**: 2-3 queries
- **Total**: ~15-20 quality additions

### Download Organization:
```
data/sources/
├── papyrus_oracle_queries_raw.json (existing)
├── papyrus_oracle_expansion_v1.json (new batch)
├── references/
│   ├── scholarly_articles/
│   ├── collection_catalogs/
│   └── primary_sources/
```

### Next Steps:
1. Start with papyri.info advanced search
2. Document findings in JSON format
3. Download 2-3 reference articles
4. Process new queries through translation pipeline
5. Integrate with existing collection
