import { useState, useEffect, useMemo } from 'react';
import './App.css';
import { useTypewriter } from './hooks/useTypewriter';
import { oracleService, OracleResponse } from './services/oracleService';
import { counselService, CounselResponse } from './services/counselService';
import OracleLine from './components/OracleLine'; // Import the new component
import { formatTitle } from './utils/stringUtils';
import { Header } from './components/layout/Header';
import { ViewType } from './types/app';



// Oracle queries for the typewriter carousel
const ancientQueries = [
  {
    id: "DVC 219B",
    text: "To which of the gods should I pray concerning my household and safety?",
    category: "Household & Safety"
  },
  {
    id: "DVC 1093A",
    text: "Concerning the safety of the child and the wife: what should be done?",
    category: "Safety of Family"
  },
  {
    id: "DVC 632",
    text: "To which of the gods am I to sacrifice and pray, in order that I may prosper?",
    category: "Success / Which god"
  },
  {
    id: "DVC 1124B",
    text: "Concerning the lawsuit: what should be done?",
    category: "Legal Dispute"
  },
  {
    id: "DVC 2525A",
    text: "Concerning my body: what should I do to be in good health?",
    category: "Health"
  },
  {
    id: "DVC 1313B",
    text: "Concerning a business undertaking: what is more advantageous and better?",
    category: "Business"
  },
  {
    id: "DVC 1395A",
    text: "Concerning the manumission of a slave: what is better and more advantageous?",
    category: "Manumission"
  },
  {
    id: "DVC 2521A",
    text: "Shall I win the lawsuit?",
    category: "Legal Victory"
  },
  {
    id: "DVC 1268A",
    text: "Concerning progeny: To which of the gods should I pray or offer sacrifice, so that children may be born?",
    category: "Fertility"
  },
  {
    id: "DVC 1148A",
    text: "Concerning a journey: is it safe? What is preferable?",
    category: "Travel Safety"
  },
  {
    id: "P.Oxy. 9 1213",
    text: "Menandros asks whether it has been granted to me to marry. Grant me this.",
    category: "Marriage"
  },
  {
    id: "P.Oxy. 42 3078",
    text: "If you permit me to consult Hermeinos the physician for treatment of the eyes, and this is to my advantage, grant me this.",
    category: "Medical Consultation"
  },
  {
    id: "SB 26 16731",
    text: "Sotas petitions: if the nomarch is not going to be angry with me because I write Valerius' pittakia, grant me this.",
    category: "Administrative Anxiety"
  },
  {
    id: "P.Oxy. 8 1149",
    text: "Nike asks whether it is to her advantage to purchase Sarapion, a boy, from Tasarapion.",
    category: "Business Decision"
  },

  {
    id: "BGU 1 154",
    text: "Concerning marriage: whether it is expedient for Dionysios to marry Herais, daughter of Herakleides.",
    category: "Marriage Arrangement"
  },
  {
    id: "P.Oslo 3 143",
    text: "Apollonios asks whether it is to his advantage to counter-sue Herakleides about inheritance claims.",
    category: "Legal Strategy"
  },
  {
    id: "SB 12 10929",
    text: "Herakleides asks whether it is advantageous for him to go up to Alexandria for his business.",
    category: "Business Travel"
  }
];

function App() {
  const [currentIndex, setCurrentIndex] = useState(() => {
    const randomIndex = Math.floor(Math.random() * ancientQueries.length);
    console.log(`🎲 Carousel: Starting with random query ${randomIndex} (${ancientQueries[randomIndex]?.id}) of ${ancientQueries.length} total queries`);
    console.log(`📜 Query text: "${ancientQueries[randomIndex]?.text}"`);
    return randomIndex;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState('oracle'); // 'oracle' or 'sage'
  const [currentView, setCurrentView] = useState<ViewType>('home'); // 'home', 'corpus', or 'about'
  const [selectedLine, setSelectedLine] = useState<any>(null);
  const [selectedSource, setSelectedSource] = useState('hymns');
  const [selectedSection, setSelectedSection] = useState('');
  const [currentOracleResponse, setCurrentOracleResponse] = useState<OracleResponse | null>(null);
  const [currentCounselResponse, setCurrentCounselResponse] = useState<CounselResponse | null>(null);
  const [isGeneratingOracle, setIsGeneratingOracle] = useState(false);
  const [isGeneratingCounsel, setIsGeneratingCounsel] = useState(false);
  const [isRandomOrgAvailable, setIsRandomOrgAvailable] = useState<boolean | null>(null);
  const [personalOracleReports, setPersonalOracleReports] = useState<OracleResponse[]>([]);
  const [personalCounselReports, setPersonalCounselReports] = useState<CounselResponse[]>([]);
  // Removed highlightedSentenceId as it's not currently used

  const currentQuery = ancientQueries[currentIndex];
  
  // Typewriter effect for the current query
  const { displayedText } = useTypewriter({
    text: currentQuery.text,
    speed: 80,
    startDelay: 200
  });

  // Check random.org availability for Oracle mode
  useEffect(() => {
    const checkRandomOrg = async () => {
      try {
        const available = await oracleService.checkRandomOrgAvailability();
        setIsRandomOrgAvailable(available);
        console.log(`🎲 Random.org ${available ? 'available' : 'unavailable'} - Oracle mode ${available ? 'enabled' : 'DISABLED'}`);
        
        // If random.org is unavailable and user is in oracle mode, switch to counsel
        if (!available && searchMode === 'oracle') {
          setSearchMode('sage');
        }
      } catch (error) {
        console.error('Failed to check random.org availability:', error);
        setIsRandomOrgAvailable(false);
        if (searchMode === 'oracle') {
          setSearchMode('sage');
        }
      }
    };

    checkRandomOrg();
    
    // Load personal oracle and counsel reports from cache
    loadPersonalReports();
  }, []);

  // Load personal oracle and counsel reports from localStorage
  const loadPersonalReports = () => {
    try {
      // Load oracle reports
      const oracleKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('oracle_response_') && key !== 'oracle_response_latest'
      );
      
      const oracleReports: OracleResponse[] = [];
      oracleKeys.forEach(key => {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const cacheData = JSON.parse(cached);
            oracleReports.push(cacheData.response);
          }
        } catch (error) {
          console.warn(`Failed to parse cached oracle response ${key}:`, error);
        }
      });
      
      // Load counsel reports
      const counselKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('counsel_response_') && key !== 'counsel_response_latest'
      );
      
      const counselReports: CounselResponse[] = [];
      counselKeys.forEach(key => {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const cacheData = JSON.parse(cached);
            counselReports.push(cacheData.response);
          }
        } catch (error) {
          console.warn(`Failed to parse cached counsel response ${key}:`, error);
        }
      });
      
      // Sort by timestamp (newest first)
      oracleReports.sort((a, b) => b.timestamp - a.timestamp);
      counselReports.sort((a, b) => b.timestamp - a.timestamp);
      
      setPersonalOracleReports(oracleReports);
      setPersonalCounselReports(counselReports);
      
      console.log(`📋 Loaded ${oracleReports.length} oracle reports and ${counselReports.length} counsel reports`);
    } catch (error) {
      console.error('Failed to load personal reports:', error);
    }
  };

  // Format oracle or counsel report as lines for display
  const formatReportAsLines = (report: OracleResponse | CounselResponse) => {
    const lines = [];

    // Determine report type and source info
    const isOracle = 'randomSource' in report;
    const source = isOracle ? 'True Random.org' : 'Semantic Search';
    const mode = isOracle ? 'ORACLE' : 'COUNSEL';
    
    // QUERY section header (no line number)
    lines.push({
      line: null,
      english: `QUERY (${mode})`,
      note: `Generated ${new Date(report.timestamp).toLocaleString()} via ${source}`,
      isHeader: true
    });

    // Query text (line 1)
    lines.push({
      line: 1,
      english: report.query,
      note: 'User submitted oracle query'
    });



    // INVOCATION section
    if (report.selections.hymns) {
      const hymnsSelection = report.selections.hymns;
      const selectionNote = isOracle 
        ? `Random selection ${(hymnsSelection as any).randomIndex + 1} of ${hymnsSelection.totalSentences} sentences`
        : `Semantic match: ${((hymnsSelection as any).semanticScore * 100).toFixed(1)}% relevance of ${hymnsSelection.totalSentences} sentences`;
      
      const bestLineInfo = !isOracle && (hymnsSelection as any).bestLine 
        ? ` • Best line: ${(hymnsSelection as any).bestLine.lineNumber} (${((hymnsSelection as any).bestLine.score * 100).toFixed(1)}%)`
        : '';
      
      const hymnsTitle = hymnsSelection.incense
        ? `${hymnsSelection.source} • ${formatTitle(hymnsSelection.sectionTitle)} • ${hymnsSelection.incense.english}`
        : `${hymnsSelection.source} • ${formatTitle(hymnsSelection.sectionTitle)}`;

      lines.push({
        line: null,
        english: hymnsTitle,
        note: selectionNote + bestLineInfo,
        isHeader: true,
        sourceLink: {
          corpus: 'hymns',
          sentenceId: hymnsSelection.sentenceId,
          sectionTitle: hymnsSelection.sectionTitle,
          key: (hymnsSelection as any).partNumber
        }
      });

      // Add each line from the sentence with original line numbers
      if (report.selections.hymns.lineDetails && report.selections.hymns.lineDetails.length > 0) {

        report.selections.hymns.lineDetails.forEach((lineDetail: any) => {
          const lineNote = isOracle
            ? `Line ${lineDetail.line} • Sentence ${report.selections.hymns!.sentenceId} • Random selection ${(report.selections.hymns as any).randomIndex + 1} of ${report.selections.hymns!.totalSentences}`
            : `Line ${lineDetail.line} • Sentence ${report.selections.hymns!.sentenceId} • Semantic match: ${((report.selections.hymns as any).semanticScore * 100).toFixed(1)}% relevance`;
          
          lines.push({
            ...lineDetail,
            note: lineDetail.note || lineNote, // Preserve original commentary, fallback to generated note
            // Include context needed for semantic scoring
            part_number: (report.selections.hymns as any).partNumber,
            sentence_id: report.selections.hymns!.sentenceId,
            corpus_name: (report.selections.hymns as any).corpusName,
            sourceLink: {
              corpus: 'hymns',
              sentenceId: report.selections.hymns!.sentenceId,
              sectionTitle: report.selections.hymns!.sectionTitle,
              lineNumber: lineDetail.line
            }
          });
        });
      } else {
        // Fallback to combined text if line details not available
        const fallbackNote = isOracle
          ? `Sentence ${report.selections.hymns!.sentenceId} • Random selection ${(report.selections.hymns as any).randomIndex + 1} of ${report.selections.hymns!.totalSentences}`
          : `Sentence ${report.selections.hymns!.sentenceId} • Semantic match: ${((report.selections.hymns as any).semanticScore * 100).toFixed(1)}% relevance`;
        
        lines.push({
          line: 1,
          english: report.selections.hymns.text.english,
          note: fallbackNote,
          sourceLink: {
            corpus: 'hymns',
            sentenceId: report.selections.hymns!.sentenceId,
            sectionTitle: report.selections.hymns!.sectionTitle
          }
        });
      }
    }

    // NARRATIVE section
    if (report.selections.argonautica) {
      const argonauticaSelection = report.selections.argonautica;
      const selectionNote = isOracle 
        ? `Random selection ${(argonauticaSelection as any).randomIndex + 1} of ${argonauticaSelection.totalSentences} sentences`
        : `Semantic match: ${((argonauticaSelection as any).semanticScore * 100).toFixed(1)}% relevance of ${argonauticaSelection.totalSentences} sentences`;
      
      const bestLineInfo = !isOracle && (argonauticaSelection as any).bestLine 
        ? ` • Best line: ${(argonauticaSelection as any).bestLine.lineNumber} (${((argonauticaSelection as any).bestLine.score * 100).toFixed(1)}%)`
        : '';
      
      lines.push({
        line: null,
        english: `${argonauticaSelection.source} • ${formatTitle(argonauticaSelection.sectionTitle)}`,
        note: selectionNote + bestLineInfo,
        isHeader: true,
        sourceLink: {
          corpus: 'argonautica',
          sentenceId: argonauticaSelection.sentenceId,
          sectionTitle: argonauticaSelection.sectionTitle
        }
      });

      // Add each line from the sentence with original line numbers
      if (report.selections.argonautica.lineDetails && report.selections.argonautica.lineDetails.length > 0) {
        report.selections.argonautica.lineDetails.forEach((lineDetail: any) => {
          const lineNote = isOracle
            ? `Line ${lineDetail.line} • Sentence ${report.selections.argonautica!.sentenceId} • Random selection ${(report.selections.argonautica as any).randomIndex + 1} of ${report.selections.argonautica!.totalSentences}`
            : `Line ${lineDetail.line} • Sentence ${report.selections.argonautica!.sentenceId} • Semantic match: ${((report.selections.argonautica as any).semanticScore * 100).toFixed(1)}% relevance`;
          
          lines.push({
            ...lineDetail,
            note: lineDetail.note || lineNote, // Preserve original commentary, fallback to generated note
            // Include context needed for semantic scoring
            part_number: (report.selections.argonautica as any).partNumber,
            sentence_id: report.selections.argonautica!.sentenceId,
            corpus_name: (report.selections.argonautica as any).corpusName,
            sourceLink: {
              corpus: 'argonautica',
              sentenceId: report.selections.argonautica!.sentenceId,
              sectionTitle: report.selections.argonautica!.sectionTitle,
              lineNumber: lineDetail.line
            }
          });
        });
      } else {
        // Fallback to combined text if line details not available
        const fallbackNote = isOracle
          ? `Sentence ${report.selections.argonautica!.sentenceId} • Random selection ${(report.selections.argonautica as any).randomIndex + 1} of ${report.selections.argonautica!.totalSentences}`
          : `Sentence ${report.selections.argonautica!.sentenceId} • Semantic match: ${((report.selections.argonautica as any).semanticScore * 100).toFixed(1)}% relevance`;
        
        lines.push({
          line: 1,
          english: report.selections.argonautica.text.english,
          note: fallbackNote,
          sourceLink: {
            corpus: 'argonautica',
            sentenceId: report.selections.argonautica!.sentenceId,
            sectionTitle: report.selections.argonautica!.sectionTitle
          }
        });
      }
    }

    // PRAXIS section
    if (report.selections.lithica) {
      const lithicaSelection = report.selections.lithica;
      const selectionNote = isOracle 
        ? `Random selection ${(lithicaSelection as any).randomIndex + 1} of ${lithicaSelection.totalSentences} sentences`
        : `Semantic match: ${((lithicaSelection as any).semanticScore * 100).toFixed(1)}% relevance of ${lithicaSelection.totalSentences} sentences`;
      
      const bestLineInfo = !isOracle && (lithicaSelection as any).bestLine 
        ? ` • Best line: ${(lithicaSelection as any).bestLine.lineNumber} (${((lithicaSelection as any).bestLine.score * 100).toFixed(1)}%)`
        : '';
      
      lines.push({
        line: null,
        english: `${lithicaSelection.source} • ${formatTitle(lithicaSelection.sectionTitle)}`,
        note: selectionNote + bestLineInfo,
        isHeader: true,
        sourceLink: {
          corpus: 'lithica',
          sentenceId: lithicaSelection.sentenceId,
          sectionTitle: lithicaSelection.sectionTitle
        }
      });

      // Add each line from the sentence with original line numbers
      if (report.selections.lithica.lineDetails && report.selections.lithica.lineDetails.length > 0) {
        report.selections.lithica.lineDetails.forEach((lineDetail: any) => {
          const lineNote = isOracle
            ? `Line ${lineDetail.line} • Sentence ${report.selections.lithica!.sentenceId} • Random selection ${(report.selections.lithica as any).randomIndex + 1} of ${report.selections.lithica!.totalSentences}`
            : `Line ${lineDetail.line} • Sentence ${report.selections.lithica!.sentenceId} • Semantic match: ${((report.selections.lithica as any).semanticScore * 100).toFixed(1)}% relevance`;
          
          lines.push({
            ...lineDetail,
            note: lineDetail.note || lineNote, // Preserve original commentary, fallback to generated note
            // Include context needed for semantic scoring
            part_number: (report.selections.lithica as any).partNumber,
            sentence_id: report.selections.lithica!.sentenceId,
            corpus_name: (report.selections.lithica as any).corpusName,
            sourceLink: {
              corpus: 'lithica',
              sentenceId: report.selections.lithica!.sentenceId,
              sectionTitle: report.selections.lithica!.sectionTitle,
              lineNumber: lineDetail.line
            }
          });
        });
      } else {
        // Fallback to combined text if line details not available
        const fallbackNote = isOracle
          ? `Sentence ${report.selections.lithica!.sentenceId} • Random selection ${(report.selections.lithica as any).randomIndex + 1} of ${report.selections.lithica!.totalSentences}`
          : `Sentence ${report.selections.lithica!.sentenceId} • Semantic match: ${((report.selections.lithica as any).semanticScore * 100).toFixed(1)}% relevance`;
        
        lines.push({
          line: 1,
          english: report.selections.lithica.text.english,
          note: fallbackNote,
          sourceLink: {
            corpus: 'lithica',
            sentenceId: report.selections.lithica!.sentenceId,
            sectionTitle: report.selections.lithica!.sectionTitle
          }
        });
      }
    }

    return lines;
  };

  // Real corpus data loaded from JSON files
  const [corpusData, setCorpusData] = useState<any>({
    hymns: null,
    argonautica: null,
    lithica: null,
    tablets: null,
    queries: null
  });
  const [loading, setLoading] = useState(true);

  // Set default section after corpus data loads
  useEffect(() => {
    // Only set default if a section hasn't been chosen yet and data is loaded
    if (!selectedSection && !loading && corpusData.hymns && corpusData.hymns.parts.length > 0) {
      console.log('Defaulting to first hymns section');
      setSelectedSection(corpusData.hymns.parts[0].key);
    }
  }, [loading, corpusData, selectedSection]);

  // Load all corpus data from JSON files
  useEffect(() => {
    const loadAllCorpusData = async () => {
      try {
        console.log('Loading corpus data...');
        const [hymnsResponse, argonauticaResponse, lithicaResponse, tabletsResponse, queriesResponse, papyrusQueriesResponse] = await Promise.all([
          fetch('/corpus_20250822_121628/hymns.json'),
          fetch('/corpus_20250822_121628/argonautica.json'), 
          fetch('/corpus_20250822_121628/lithica.json'),
          fetch('/corpus_20250822_121628/tablets.json'),
          fetch('/corpus_20250822_121628/dodona_queries.json'),
          fetch('/corpus_20250822_121628/papyrus_queries.json')
        ]);

        console.log('Responses received:', hymnsResponse.status, argonauticaResponse.status, lithicaResponse.status, tabletsResponse.status, queriesResponse.status, papyrusQueriesResponse.status);

        const [hymnsData, argonauticaData, lithicaData, tabletsData, queriesData, papyrusQueriesData] = await Promise.all([
          hymnsResponse.json(),
          argonauticaResponse.json(),
          lithicaResponse.json(),
          tabletsResponse.json(),
          queriesResponse.json(),
          papyrusQueriesResponse.json()
        ]);

        console.log('Raw data loaded:', {
          hymns: hymnsData.parts?.length || 0,
          argonautica: argonauticaData.parts?.length || 0,
          lithica: lithicaData.parts?.length || 0,
          tablets: tabletsData.parts?.length || 0,
          queries: queriesData.parts?.length || 0,
          papyrusQueries: papyrusQueriesData.parts?.length || 0
        });
        console.log('Raw hymns data:', hymnsData);
        console.log('Raw argonautica data:', argonauticaData);
        console.log('Raw lithica data:', lithicaData);
        console.log('Raw tablets data:', tabletsData);
        console.log('Raw queries data:', queriesData);
        console.log('Raw papyrus queries data:', papyrusQueriesData);

        // Use the raw parts structure directly
        const processedData = {
          hymns: {
            metadata: hymnsData.metadata,
            parts: hymnsData.parts.map((part: any) => ({
              ...part,
              key: String(part.part_number),
              title_english: formatTitle(part.part_title)
            }))
          },
          argonautica: {
            metadata: argonauticaData.metadata,
            parts: argonauticaData.parts.map((part: any) => ({
              ...part,
              key: String(part.part_number),
              title_english: formatTitle(part.part_title)
            }))
          },
          lithica: {
            metadata: lithicaData.metadata,
            parts: lithicaData.parts.map((part: any) => ({
              ...part,
              key: String(part.part_number),
              title_english: formatTitle(part.part_title)
            }))
          },
          tablets: {
            metadata: tabletsData.metadata,
            parts: tabletsData.parts.map((part: any) => ({
              ...part,
              key: part.tablet_id || `tablet${part.part_number}`,
              title_english: part.part_title
            }))
          },
          queries: {
            metadata: queriesData.metadata,
            parts: queriesData.parts.map((part: any) => ({
              ...part,
              key: part.query_id || `query${part.part_number}`,
              title_english: part.part_title
            }))
          },
          papyrusQueries: {
            metadata: papyrusQueriesData.metadata,
            parts: papyrusQueriesData.parts.map((part: any) => ({
              ...part,
              key: part.query_id || `query${part.part_number}`,
              title_english: part.part_title
            }))
          }
        };

        console.log('Processed data:', processedData);
        setCorpusData(processedData);
        console.log('✅ Corpus data loaded and processed successfully.');
      } catch (error) {
        console.error('Failed to load corpus data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAllCorpusData();
  }, []);

  // Get current part data
  const getCurrentPartData = () => {
    if (selectedSource === 'personal') {
      if (selectedSection.startsWith('oracle_')) {
        const timestamp = parseInt(selectedSection.replace('oracle_', ''), 10);
        const report = personalOracleReports.find(r => r.timestamp === timestamp);
        if (report) {
          return formatReportAsLines(report);
        }
      } else if (selectedSection.startsWith('counsel_')) {
        const timestamp = parseInt(selectedSection.replace('counsel_', ''), 10);
        const report = personalCounselReports.find(r => r.timestamp === timestamp);
        if (report) {
          return formatReportAsLines(report);
        }
      }
      return [];
    }
    
    const sourceData = corpusData[selectedSource as keyof typeof corpusData];
    if (sourceData && sourceData.parts) {
      // Find the selected part
      const part = sourceData.parts.find((s: any) => s.key === selectedSection);
      if (part) {

        
        // Generate lines from the unified structure with proper context
        const lines: any[] = [];
        
        // Add part header
        const formattedTitle = formatTitle(part.part_title);
        const headerText = part.incense 
          ? `${formattedTitle} • ${part.incense}`
          : formattedTitle;
        
        lines.push({
          line: 'header',
          english: headerText,
          isHeader: true,
          sourceLink: {
            corpus: selectedSource,
            source: formattedTitle,
            key: part.part_number
          }
        });

        // Add lines from sentences with embedding context
        for (const sentence of part.sentences || []) {

          
          for (const lineDetail of sentence.line_details || []) {
            const lineWithContext = {
              ...lineDetail,
              // Include context needed for line embeddings
              part_number: part.part_number,
              sentence_id: sentence.sentence_id,
              corpus_name: selectedSource,
              sourceLink: {
                corpus: selectedSource,
                source: part.part_title,
                key: part.key
              }
            };
            

            
            lines.push(lineWithContext);
          }
        }
        
        return lines;
      }
    }
    return [];
  };

  const currentLines = useMemo(() => {
    return getCurrentPartData();
  }, [selectedSource, selectedSection, corpusData, personalOracleReports, personalCounselReports]);

  // Update currentOracleResponse and currentCounselResponse when switching to personal reports
  useEffect(() => {
    if (selectedSource === 'personal') {
      if (!selectedSection) {
        setCurrentOracleResponse(null);
        setCurrentCounselResponse(null);
        return;
      }
      if (selectedSection.startsWith('oracle_')) {
        const timestamp = parseInt(selectedSection.replace('oracle_', ''), 10);
        const report = personalOracleReports.find(r => r.timestamp === timestamp);
        if (report) {
          console.log(`🔮 Loading personal oracle report: ${report.query.substring(0, 50)}...`);
          setCurrentOracleResponse(report);
          setCurrentCounselResponse(null);
        } else {
          console.warn(`⚠️ Personal oracle report not found for timestamp: ${timestamp}`);
        }
      } else if (selectedSection.startsWith('counsel_')) {
        const timestamp = parseInt(selectedSection.replace('counsel_', ''), 10);
        const report = personalCounselReports.find(r => r.timestamp === timestamp);
        if (report) {
          console.log(`🧠 Loading personal counsel report: ${report.query.substring(0, 50)}...`);
          setCurrentCounselResponse(report);
          setCurrentOracleResponse(null);
        } else {
          console.warn(`⚠️ Personal counsel report not found for timestamp: ${timestamp}`);
        }
      }
    } else if (selectedSource !== 'personal') {
      // Clear responses when not viewing personal reports
      if (currentOracleResponse || currentCounselResponse) {
        console.log(`🔄 Clearing responses (switched from personal to ${selectedSource})`);
        setCurrentOracleResponse(null);
        setCurrentCounselResponse(null);
      }
    }
  }, [selectedSource, selectedSection, personalOracleReports, personalCounselReports]);

  // Navigate to source corpus location
  const navigateToSource = (sourceLink: any) => {
    try {
      console.log('🔗 Navigating to source:', sourceLink);
      
      // Clear current responses to show regular corpus view
      setCurrentOracleResponse(null);
      setCurrentCounselResponse(null);
      
      // Set the source corpus
      setSelectedSource(sourceLink.corpus);
      
      // Navigation to source complete (highlighting functionality removed for now)
      
      // Navigate directly using the key
      if (sourceLink.key) {
        setSelectedSection(sourceLink.key);
        console.log(`📍 Navigating to part: ${sourceLink.key}`);
      } else {
        console.log(`⚠️ No key provided in sourceLink:`, sourceLink);
      }

      
    } catch (error) {
      console.error('Failed to navigate to source:', error);
      alert('Could not navigate to original source location.');
    }
  };

  // Get current part metadata
  const getCurrentPartMetadata = () => {
    const sourceData = corpusData[selectedSource as keyof typeof corpusData];
    if (sourceData && sourceData.parts) {
      const part = sourceData.parts.find((s: any) => s.key === selectedSection);
      return part;
    }
    return null;
  };

  getCurrentPartMetadata();


  // Query cycling with enhanced randomization
  useEffect(() => {
    const recentQueries = [currentIndex]; // Track recent queries to avoid immediate repeats
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        let nextIndex;
        let attempts = 0;
        
        // Try to get a query that wasn't recently shown
        do {
          nextIndex = Math.floor(Math.random() * ancientQueries.length);
          attempts++;
        } while (recentQueries.includes(nextIndex) && attempts < 10);
        
        // Add to recent queries and keep only last 3-4 queries in memory
        recentQueries.push(nextIndex);
        if (recentQueries.length > Math.min(4, Math.floor(ancientQueries.length / 3))) {
          recentQueries.shift();
        }
        
        console.log(`🔄 Carousel: Switching from ${prev} (${ancientQueries[prev]?.id}) to ${nextIndex} (${ancientQueries[nextIndex]?.id})`);
        console.log(`📜 New query: "${ancientQueries[nextIndex]?.text}"`);
        console.log(`🎯 Recent indices: [${recentQueries.join(', ')}]`);
        
        return nextIndex;
      });
    }, 15000);
    
    return () => clearInterval(interval);
  }, []); // Remove currentIndex dependency to prevent restarting the interval


  const handleSearch = async (query = searchQuery) => {
    if (query.trim()) {
      console.log(`Searching (${searchMode} mode):`, query);
      
      if (searchMode === 'oracle') {
        // Oracle mode requires true randomness - no compromises
        if (isRandomOrgAvailable === false) {
          alert('Oracle mode is disabled: True randomness (random.org) is required for principled divination.');
          return;
        }
        
        setIsGeneratingOracle(true);
        try {
          const response = await oracleService.generateOracleResponse(query.trim());
          // Cache the oracle response for corpus page
          oracleService.cacheOracleResponse(response);
          
          // Reload personal reports to include the new one
          loadPersonalReports();
          
          // Redirect to corpus page and select personal reports
          setCurrentView('corpus');
          setSelectedSource('personal');
          setSelectedSection(`oracle_${response.timestamp}`);
          setCurrentOracleResponse(response);
        } catch (error) {
          console.error('Error generating oracle response:', error);
          alert('The oracle requires true randomness and cannot function at this time. Random.org is unavailable.');
        } finally {
          setIsGeneratingOracle(false);
        }
      } else {
        // Counsel mode uses semantic search - no randomness required
        setIsGeneratingCounsel(true);
        try {
          const response = await counselService.generateCounselResponse(query.trim());
          // Cache the counsel response for corpus page
          counselService.cacheCounselResponse(response);
          
          // Reload personal reports to include the new one
          loadPersonalReports();
          
          // Redirect to corpus page and select personal reports
          setCurrentView('corpus');
          setSelectedSource('personal');
          setSelectedSection(`counsel_${response.timestamp}`);
          setCurrentCounselResponse(response);
        } catch (error) {
          console.error('Error generating counsel response:', error);
          alert('Failed to generate counsel response. Please check the console for details.');
        } finally {
          setIsGeneratingCounsel(false);
        }
      }
    }
  };

  const handleAncientQueryClick = () => {
    const queryText = currentQuery.text;
    setSearchQuery(queryText);
    handleSearch(queryText);
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  if (currentView === 'corpus') {
    return (
      <div className="app">
        <Header currentView={currentView} setCurrentView={setCurrentView} />
        
        <div className="corpus-view">
          <div className="corpus-header">
            <div className="corpus-controls">
              <select 
                className="source-selector" 
                value={selectedSource} 
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  const newSource = e.target.value;
                  console.log(`📖 Source changed to: ${newSource}`);
                  setSelectedSource(newSource);
                  
                  // Reset to first part of selected source
                  if (newSource === 'personal') {
                    // For personal reports, set to most recent report if available
                    const allReports = [
                      ...personalOracleReports.map(r => ({ ...r, type: 'oracle' })),
                      ...personalCounselReports.map(r => ({ ...r, type: 'counsel' }))
                    ].sort((a, b) => b.timestamp - a.timestamp);
                    
                    if (allReports.length > 0) {
                      const mostRecent = allReports[0];
                      setSelectedSection(`${mostRecent.type}_${mostRecent.timestamp}`);
                    } else {
                      setSelectedSection(''); // Clear selection if no reports
                    }
                  } else {
                    // For regular corpus data
                    const newSourceData = corpusData[newSource as keyof typeof corpusData];
                    if (newSourceData && newSourceData.parts && newSourceData.parts.length > 0) {
                      setSelectedSection(newSourceData.parts[0].key);
                    } else {
                      setSelectedSection(''); // Explicitly clear if no parts
                    }
                  }
                }}
              >
                <option value="hymns">Hymns</option>
                <option value="argonautica">Argonautica</option>
                <option value="lithica">Lithica</option>
                <option value="tablets">Golden Tablets</option>
                <option value="queries">Oracle Queries (Dodona)</option>
                <option value="papyrusQueries">Oracle Queries (Papyrus)</option>
                <option value="personal">Personal Reports</option>
              </select>
              {(selectedSource === 'personal' ? (personalOracleReports.length > 0 || personalCounselReports.length > 0) : corpusData[selectedSource] && corpusData[selectedSource].parts && corpusData[selectedSource].parts.length > 0) && (
                <select 
                  className="section-selector" 
                  value={selectedSection} 
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    const newSection = e.target.value;
                    console.log(`📄 Section changed to: ${newSection}`);
                    setSelectedSection(newSection);
                  }}
                >
                  {selectedSource === 'personal' ? (
                    <>
                      {personalOracleReports.map((report) => (
                        <option key={`oracle_${report.timestamp}`} value={`oracle_${report.timestamp}`}>
                          [ORACLE] {new Date(report.timestamp).toLocaleString()} - &quot;{report.query.substring(0, 40)}...&quot;
                        </option>
                      ))}
                      {personalCounselReports.map((report) => (
                        <option key={`counsel_${report.timestamp}`} value={`counsel_${report.timestamp}`}>
                          [COUNSEL] {new Date(report.timestamp).toLocaleString()} - &quot;{report.query.substring(0, 40)}...&quot;
                        </option>
                      ))}
                    </>
                  ) : (
                    // Use unified corpus structure - all parts have proper titles
                    corpusData[selectedSource].parts.map((part: any) => (
                      <option key={`${selectedSource}_${part.key}`} value={part.key}>
                        {part.title_english || part.title}
                      </option>
                    ))
                  )}
                </select>
              )}
            </div>
          </div>
          

          
          <div className="corpus-content">
            {loading ? (
              <div className="no-content">
                <p>Loading corpus data...</p>
              </div>
            ) : (
              <div className="line-display">
                {currentLines.length > 0 ? (
                  currentLines.map((lineData: any, index: number) => (
                    <OracleLine
                      key={`${index}_${lineData.line}`}
                      lineData={lineData}
                      oracleResponse={selectedSource === 'personal' ? (currentOracleResponse || currentCounselResponse) : null}
                      onNavigate={navigateToSource}
                      onLineClick={setSelectedLine}
                    />
                  ))
                ) : (
                  <div className="no-content">
                    <p>
                      {selectedSource === 'personal' && personalOracleReports.length === 0 && personalCounselReports.length === 0
                        ? "You have no personal reports. Generate one from the Home page."
                        : "No content available for this selection."
                      }
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {selectedLine && (
            <div className="modal-overlay" onClick={() => setSelectedLine(null)}>
              <div className="line-modal" onClick={(e) => e.stopPropagation()}>
                <div className="line-modal-header">
                  <h3>Line {selectedLine.line}</h3>
                  <button onClick={() => setSelectedLine(null)} className="close-button">×</button>
                </div>
                <div className="line-modal-content">
                  <div className="line-section">
                    <h4>English</h4>
                    <p className="english-text">{selectedLine.english}</p>
                  </div>
                  <div className="line-section">
                    <h4>Greek</h4>
                    <p className="greek-text">{selectedLine.greek}</p>
                  </div>
                  <div className="line-section">
                    <h4>Commentary</h4>
                    <p className="commentary-text">
                      {selectedLine.note && selectedLine.note.trim() 
                        ? selectedLine.note 
                        : <em>No commentary available for this line.</em>
                      }
                    </p>
                  </div>
                  {selectedLine.sourceLink && (
                    <div className="line-section">
                      <button 
                        className="source-button"
                        onClick={() => {
                          setSelectedLine(null);
                          navigateToSource(selectedLine.sourceLink);
                        }}
                      >
                        Go to {selectedLine.sourceLink.corpus.charAt(0).toUpperCase() + selectedLine.sourceLink.corpus.slice(1)}: {selectedLine.sourceLink.sectionTitle || `Line ${selectedLine.sourceLink.lineNumber}`}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <footer className="app-footer">
          <p>© 2025 Galaxy Brain Entertainment</p>
        </footer>
      </div>
    );
  }

  if (currentView === 'about') {
    return (
      <div className="app">
        <Header currentView={currentView} setCurrentView={setCurrentView} />
        
        <div className="about-view">
          <h2>About Cleros</h2>
          
          <section className="about-section">
            <h3>Digital Bibliomancy</h3>
            <p>
              Cleros is a digital bibliomancy application that uses computational methods to consult ancient texts. 
              Where Greeks and Romans sought guidance in Homer&apos;s <em>Iliad</em> and Virgil&apos;s <em>Aeneid</em>, this application 
              draws upon Orphic literature: the <em>Hymni</em>, <em>Argonautica</em>, and <em>Lithica</em>.
            </p>
            <p>
              Each text appears in parallel Greek-English translation with AI commentary. Though no historical bibliomantic 
              tradition for Orphic texts has survived, their focus on death, rebirth, and spiritual transformation makes them 
              suitable for consultation. The collection includes Orphic Golden Tablets and oracle queries from Dodona.
            </p>
          </section>

          <section className="about-section">
            <h3>Etymology</h3>
            <p>
              The name &quot;Cleros&quot; derives from κλῆρος (klēros), the Greek word meaning &quot;lot&quot; or &quot;allotted portion&quot;—
              the share of fate assigned to each person. Beyond simple chance, κλῆρος was the mechanism through 
              which divine will was thought to manifest in human affairs.
            </p>
          </section>

          <section className="about-section">
            <h3>Two Methods</h3>
            
            <div className="mode-description">
              <h4>Oracle Mode</h4>
              <p>
                Oracle mode provides responses through lot-casting. Your query triggers true randomness powered by atmospheric noise, 
                selecting passages that are then highlighted for keyword matches and semantic similarity to your question.
              </p>
              <p>
                This follows the tradition that meaningful coincidence can emerge from random selection.
              </p>
            </div>

            <div className="mode-description">
              <h4>Counsel Mode</h4>
              <p>
                Counsel mode uses semantic search to find the most relevant passages for your question. Algorithms analyze 
                the corpus for content similarity, returning passages ranked by relevance. No randomness—only computational 
                matching of your query to text content.
              </p>
              <p>
                This treats the texts as a searchable database, using computational methods to surface relevant content.
              </p>
            </div>
          </section>

          <section className="about-section">
            <h3>The Corpus</h3>
            
            <div className="corpus-description">
              <div className="corpus-text">
                <h4>Orphic Hymns</h4>
                <p>
                  Eighty-seven invocations to deities and cosmic forces, likely used in mystery initiations. Each hymn 
                  addresses its subject through epithets and requests for blessings, representing Orphic theological concepts 
                  in liturgical form. The hymns include prescriptions for specific incenses to burn during each invocation.
                </p>
              </div>

              <div className="corpus-text">
                <h4>Orphic Argonautica</h4>
                <p>
                  An epic poem recounting Jason&apos;s quest for the Golden Fleece from Orpheus&apos;s perspective. The text combines 
                  adventure narrative with Orphic theology, presenting the hero&apos;s journey as spiritual allegory.
                </p>
              </div>

              <div className="corpus-text">
                <h4>Orphic Lithica</h4>
                <p>
                  A treatise on the properties of stones and gems, describing their supposed powers for healing, protection, 
                  and spiritual effects. The text bridges material and metaphysical concerns through detailed descriptions 
                  of various minerals.
                </p>
              </div>

              <div className="corpus-text">
                <h4>Golden Tablets</h4>
                <p>
                  Funeral texts inscribed on gold sheets and buried with initiates, containing instructions for the afterlife journey. 
                  These artifacts preserve ritual passwords and declarations, providing insight into mystery religion practices.
                </p>
              </div>

              <div className="corpus-text">
                <h4>Oracle Queries</h4>
                <p>
                  Historical questions submitted to oracles at Dodona, preserved on papyrus. Covering daily concerns like health, 
                  marriage, business, and legal matters, these queries demonstrate how people consulted oracles for guidance.
                </p>
              </div>
            </div>
          </section>

          <section className="about-section">
            <h3>Response Structure</h3>
            <p>
              Each consultation returns three passages—one from each primary Orphic text—providing different perspectives on your question.
            </p>
          </section>

          <section className="about-section">
            <h3>Technical Implementation</h3>
            <p>
              The system uses transformer models to encode each sentence into mathematical vectors for semantic search. 
              For Oracle mode, atmospheric noise provides true randomness for passage selection. All texts appear in 
              parallel Greek-English format with AI-generated commentary. This tool is intended for educational and exploratory purposes. For serious academic research or spiritual practice, 
              please refer to established scholarly editions and commentaries of these ancient texts.
            </p>
          </section>

          <section className="about-section">
            <h3>Important Disclaimer</h3>
            <p>
              <strong>All English translations and commentary in this application are AI-generated and may contain inaccuracies.</strong> 
              While efforts have been made to ensure quality, users should consult the original Greek sources and scholarly 
              references listed below for authoritative information. English translations generated by GPT-5 reasoning system from original Greek texts.
            </p>
          </section>

          <section className="about-section">
            <h3>Sources</h3>
            <div className="bibliography">
              <h4>Greek Source Texts</h4>
              <ul>
                <li><strong>Orphic Hymns</strong> (2nd-3rd century CE): Greek text from Thomas Taylor, <em>The Mystical Hymns of Orpheus</em> (London, 1787)</li>
                <li><strong>Orphic Argonautica</strong> (4th century CE): Greek text from Hermann Abel, <em>Orphica</em> (Leipzig: Teubner, 1885)</li>
                <li><strong>Orphic Lithica</strong> (4th-6th century CE): Greek text from Hermann Abel, <em>Orphica</em> (Leipzig: Teubner, 1885)</li>
                <li><strong>Orphic Golden Tablets</strong> (5th-2nd century BCE): Graf & Johnston, <em>Ritual Texts for the Afterlife</em>; Edmonds (2010)</li>
                <li><strong>Dodona Oracle Queries</strong> (5th-2nd century BCE): Dodona Online (DOL) curated scholarly database</li>
              </ul>
              
              <h4>Further Reading</h4>
              <ul>
                <li>Athanassakis, Apostolos N. & Benjamin M. Wolkow. <em>The Orphic Hymns</em>. Baltimore: Johns Hopkins University Press, 2013.</li>
                <li>Bernabé, Alberto. <em>Poetae Epici Graeci: Testimonia et Fragmenta</em>. Berlin: De Gruyter, 2004-2007.</li>
                <li>Edmonds, Radcliffe G. <em>Myths of the Underworld Journey: Plato, Aristophanes, and the 'Orphic' Gold Tablets</em>. Cambridge: Cambridge University Press, 2004.</li>
                <li>Edmonds, Radcliffe G. <em>Redefining Ancient Orphism: A Study in Greek Religion</em>. Cambridge: Cambridge University Press, 2013.</li>
                <li>Graf, Fritz & Sarah Iles Johnston. <em>Ritual Texts for the Afterlife: Orpheus and the Bacchic Gold Tablets</em>. London: Routledge, 2007.</li>
                <li>Johnston, Sarah Iles. <em>Ancient Greek Divination</em>. Chichester: Wiley-Blackwell, 2008.</li>
                <li>Johnston, Sarah Iles. <em>Restless Dead: Encounters Between the Living and the Dead in Ancient Greece</em>. Berkeley: University of California Press, 1999.</li>
                <li>Morand, Anne-France. <em>Études sur les Hymnes Orphiques</em>. Leiden: Brill, 2001.</li>
                <li>Parker, Robert. <em>On Greek Religion</em>. Ithaca: Cornell University Press, 2011.</li>
                <li>West, M.L. <em>The Orphic Poems</em>. Oxford: Oxford University Press, 1983.</li>
              </ul>
            </div>
          </section>

          <section className="about-section">
            <h3>Contact</h3>
            <p>
              For questions, feedback, or collaboration inquiries, contact us at{' '}
              <a href="mailto:social@neumannsworkshop.com" style={{color: '#a0a0a0', textDecoration: 'underline'}}>
                social@neumannsworkshop.com
              </a>
            </p>
          </section>
        </div>
        
        <footer className="app-footer">
          <p>© 2025 Galaxy Brain Entertainment</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="app">
      <Header currentView={currentView} setCurrentView={setCurrentView} />


      
      <main className="main-content">
        <div className="mode-switcher">
          <button 
            className={`mode-button ${searchMode === 'oracle' ? 'active' : ''}`}
            title="Random selection using atmospheric noise"
            onClick={() => {
              if (isRandomOrgAvailable === false) {
                alert('Oracle mode requires true randomness from random.org for principled divination.');
                return;
              }
              setSearchMode('oracle');
            }}
            disabled={isRandomOrgAvailable === false}
            style={{ 
              opacity: isRandomOrgAvailable === false ? 0.5 : 1,
              cursor: isRandomOrgAvailable === false ? 'not-allowed' : 'pointer'
            }}
          >
            Oracle {isRandomOrgAvailable === false && '(Disabled)'}
          </button>
          <button 
            className={`mode-button ${searchMode === 'sage' ? 'active' : ''}`}
            title="Semantic search for relevant passages"
            onClick={() => setSearchMode('sage')}
          >
            Counsel
          </button>
        </div>
        {isRandomOrgAvailable === false && (
          <div className="intro-text">
            <p>
              <span style={{ color: '#ff6b6b', fontSize: '0.9em', display: 'block' }}>
                ⚠️ Oracle mode disabled: True randomness required
              </span>
            </p>
          </div>
        )}
        
        <form className="consultation-form" onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder={searchMode === 'oracle' ? "Ask for divine guidance (random)" : "Seek rational advice (semantic)"}
            className="query-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="submit-button">→</button>
        </form>
        
        <div className="ancient-query-carousel" onClick={handleAncientQueryClick}>
          <div className="query-text">
            {displayedText}
          </div>

        </div>
      </main>
      
      <footer className="app-footer">
        <p>© 2025 Galaxy Brain Entertainment</p>
      </footer>

      {/* Loading Overlay */}
      {(isGeneratingOracle || isGeneratingCounsel) && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: '2px solid transparent',
              borderTop: '2px solid #9370db',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}></div>
            <p style={{ color: 'white', fontSize: '1.2rem', margin: '0 0 8px 0' }}>
              {isGeneratingOracle ? 'Consulting the Oracle...' : 'Seeking Wisdom...'}
            </p>
            <p style={{ color: '#a0a0a0', fontSize: '0.9rem', margin: 0 }}>
              {isGeneratingOracle ? 'The fates are aligning...' : 'Analyzing sacred texts...'}
            </p>
          </div>
        </div>
      )}


    </div>
  );
}

export default App;