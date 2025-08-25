import { useState, useEffect, useCallback } from 'react';
import { ViewType, SearchMode } from '../types/app';
import { OracleResponse, CounselResponse } from '../types/oracle';
import { AllCorpusData, CorpusPart, SourceLink } from '../types/corpus';
import { oracleService } from '../services/oracleService';
import { counselService } from '../services/counselService';
import { formatTitle } from '../utils/stringUtils';

// Note: Raw corpus data structure is inferred from the JSON files

export const useAppState = () => {
  // View state
  const [currentView, setCurrentView] = useState<ViewType>('home');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('oracle');
  
  // Corpus state
  const [selectedSource, setSelectedSource] = useState('hymns');
  const [selectedSection, setSelectedSection] = useState('');
  
  // Response state
  const [currentOracleResponse, setCurrentOracleResponse] = useState<OracleResponse | null>(null);
  const [currentCounselResponse, setCurrentCounselResponse] = useState<CounselResponse | null>(null);
  
  // Loading state
  const [isGeneratingOracle, setIsGeneratingOracle] = useState(false);
  const [isGeneratingCounsel, setIsGeneratingCounsel] = useState(false);
  const [isRandomOrgAvailable, setIsRandomOrgAvailable] = useState<boolean | null>(null);
  const [isEmbeddingsAvailable, setIsEmbeddingsAvailable] = useState<boolean | null>(null);
  
  // Personal reports
  const [personalOracleReports, setPersonalOracleReports] = useState<OracleResponse[]>([]);
  const [personalCounselReports, setPersonalCounselReports] = useState<CounselResponse[]>([]);
  
  // Corpus data
  const [corpusData, setCorpusData] = useState<AllCorpusData>({
    hymns: null,
    argonautica: null,
    lithica: null,
    tablets: null,
    queries: null,
    papyrusQueries: null
  });
  const [loading, setLoading] = useState(true);

  // Check API availability and embeddings status
  useEffect(() => {
    const checkAvailability = async () => {
      // Check random.org availability
      try {
        const available = await oracleService.checkRandomOrgAvailability();
        setIsRandomOrgAvailable(available);
        console.log(`🎲 Random.org ${available ? 'available' : 'unavailable'} - Oracle mode ${available ? 'enabled' : 'DISABLED'}`);
        
        // If random.org is unavailable and user is in oracle mode, switch to counsel
        if (!available && searchMode === 'oracle') {
          setSearchMode('counsel');
        }
      } catch (error) {
        console.error('Failed to check random.org availability:', error);
        setIsRandomOrgAvailable(false);
        if (searchMode === 'oracle') {
          setSearchMode('counsel');
        }
      }
      
      // Check embeddings availability via the global flag
      const checkEmbeddings = () => {
        // Using Window interface extension from embeddingService.ts
        const available = !!window.__EMBEDDINGS_AVAILABLE__;
        const unavailable = !!window.__EMBEDDINGS_UNAVAILABLE__;
        
        if (available) {
          setIsEmbeddingsAvailable(true);
          console.log('✨ Semantic features ENABLED - Embeddings available');
        } else if (unavailable) {
          setIsEmbeddingsAvailable(false);
          console.log('⚠️ Semantic features DISABLED - Embeddings unavailable');
        } else {
          // Not determined yet
          setIsEmbeddingsAvailable(null);
        }
      };
      
      // Check immediately and also listen for status changes
      checkEmbeddings();
      window.addEventListener('embeddingStatusChanged', checkEmbeddings);
      
      return () => {
        window.removeEventListener('embeddingStatusChanged', checkEmbeddings);
      };
    };

    checkAvailability();
    loadPersonalReports();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // searchMode intentionally excluded to prevent re-checking on mode changes

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

  // Lazy load corpus data only when needed (for search or corpus view)
  const loadCorpusDataOnDemand = useCallback(async () => {
    if (corpusData) return corpusData; // Already loaded
    
    try {
      console.log('📚 Loading corpus data on-demand...');
      const [hymnsResponse, argonauticaResponse, lithicaResponse, tabletsResponse, queriesResponse, papyrusQueriesResponse] = await Promise.all([
        fetch('/corpus_20250822_121628/hymns.json'),
        fetch('/corpus_20250822_121628/argonautica.json'), 
        fetch('/corpus_20250822_121628/lithica.json'),
        fetch('/corpus_20250822_121628/tablets.json'),
        fetch('/corpus_20250822_121628/dodona_queries.json'),
        fetch('/corpus_20250822_121628/papyrus_queries.json')
      ]);

        const [hymnsData, argonauticaData, lithicaData, tabletsData, queriesData, papyrusQueriesData] = await Promise.all([
          hymnsResponse.json(),
          argonauticaResponse.json(),
          lithicaResponse.json(),
          tabletsResponse.json(),
          queriesResponse.json(),
          papyrusQueriesResponse.json()
        ]);

        // Use the raw parts structure directly
        const processedData = {
          hymns: {
            metadata: hymnsData.metadata,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            parts: (hymnsData.parts as any[]).map((part): CorpusPart => ({
              ...part,
              key: String(part.part_number),
              title_english: formatTitle(part.part_title)
            }))
          },
          argonautica: {
            metadata: argonauticaData.metadata,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            parts: (argonauticaData.parts as any[]).map((part): CorpusPart => ({
              ...part,
              key: String(part.part_number),
              title_english: part.part_title
            }))
          },
          lithica: {
            metadata: lithicaData.metadata,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            parts: (lithicaData.parts as any[]).map((part): CorpusPart => ({
              ...part,
              key: String(part.part_number),
              title_english: part.part_title
            }))
          },
          tablets: {
            metadata: tabletsData.metadata,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            parts: (tabletsData.parts as any[]).map((part): CorpusPart => ({
              ...part,
              key: part.tablet_id || `tablet${part.part_number}`,
              title_english: part.part_title
            }))
          },
          queries: {
            metadata: queriesData.metadata,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            parts: (queriesData.parts as any[]).map((part): CorpusPart => ({
              ...part,
              key: part.query_id || `query${part.part_number}`,
              title_english: part.part_title
            }))
          },
          papyrusQueries: {
            metadata: papyrusQueriesData.metadata,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            parts: (papyrusQueriesData.parts as any[]).map((part): CorpusPart => ({
              ...part,
              key: part.query_id || `query${part.part_number}`,
              title_english: part.part_title
            }))
          }
        };

        setCorpusData(processedData);
        console.log('✅ Corpus data loaded and processed successfully.');
        return processedData;
      } catch (error) {
        console.error('❌ Failed to load corpus data:', error);
        throw error;
      }
    }, [corpusData, setCorpusData]);



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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSource, selectedSection, personalOracleReports, personalCounselReports]); // currentOracleResponse and currentCounselResponse intentionally excluded to prevent infinite loops

  // Handle search
  const handleSearch = async (query = searchQuery) => {
    if (query.trim()) {
      console.log(`Searching (${searchMode} mode):`, query);
      
      // Load corpus data before performing search (needed for results display)
      setLoading(true);
      try {
        await loadCorpusDataOnDemand();
      } catch (error) {
        console.error('Failed to load corpus data for search:', error);
        alert('Failed to load corpus data. Please check your internet connection.');
        setLoading(false);
        return;
      }
      
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
          setLoading(false);
        }
      } else {
        // Counsel mode uses semantic search - requires embeddings
        if (!isEmbeddingsAvailable) {
          alert('Semantic features are disabled or not yet initialized. Please try again later or check your internet connection.');
          setLoading(false);
          return;
        }
        
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
          setCurrentCounselResponse(response as CounselResponse);
        } catch (error) {
          console.error('Error generating counsel response:', error);
          if (!isEmbeddingsAvailable) {
            alert('Semantic features are disabled or not yet initialized.');
          } else {
            alert('Failed to generate counsel response. Please check the console for details.');
          }
        } finally {
          setIsGeneratingCounsel(false);
          setLoading(false);
        }
      }
    }
  };

  // Navigate to source corpus location
  const navigateToSource = async (sourceLink: SourceLink) => {
    try {
      console.log('🔗 Navigating to source:', sourceLink);
      
      // Load corpus data if needed
      setLoading(true);
      const data = await loadCorpusDataOnDemand();
      
      // Set the source corpus first
      setSelectedSource(sourceLink.corpus);
      
      // Navigate directly using the key, or find it by sectionTitle
      if (sourceLink.key !== undefined) {
        setSelectedSection(sourceLink.key.toString());
        console.log(`📍 Navigating to part: ${sourceLink.key}`);
      } else if (sourceLink.sectionTitle && data[sourceLink.corpus as keyof typeof data]) {
        // Fallback: find the part by matching sectionTitle
        const corpus = data[sourceLink.corpus as keyof typeof data];
        const part = corpus?.parts?.find((p: CorpusPart) => 
          p.title_english === sourceLink.sectionTitle || 
          p.title === sourceLink.sectionTitle ||
          p.part_title === sourceLink.sectionTitle
        );
        if (part) {
          setSelectedSection(part.key.toString());
          console.log(`📍 Found part by title '${sourceLink.sectionTitle}': ${part.key}`);
        } else {
          console.log(`⚠️ Could not find part with title '${sourceLink.sectionTitle}' in ${sourceLink.corpus}`);
        }
      } else {
        console.log('⚠️ No key or sectionTitle provided in sourceLink:', sourceLink);
      }
      
      // Clear current responses AFTER setting the new source/section to avoid race condition
      setTimeout(() => {
        setCurrentOracleResponse(null);
        setCurrentCounselResponse(null);
      }, 100);
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to navigate to source:', error);
      alert('Could not navigate to original source location.');
      setLoading(false);
    }
  };

  // Load corpus data when navigating to corpus view
  useEffect(() => {
    if (currentView === 'corpus' && !corpusData) {
      console.log('📖 Loading corpus data for corpus view...');
      setLoading(true);
      loadCorpusDataOnDemand().then(() => {
        setLoading(false);
      }).catch((error) => {
        console.error('Failed to load corpus data for corpus view:', error);
        setLoading(false);
      });
    }
  }, [currentView, corpusData, loadCorpusDataOnDemand]);

  return {
    // View state
    currentView,
    setCurrentView,
    
    // Search state
    searchQuery,
    setSearchQuery,
    searchMode,
    setSearchMode,
    
    // Corpus state
    selectedSource,
    setSelectedSource,
    selectedSection,
    setSelectedSection,
    corpusData,
    loading,
    
    // Response state
    currentOracleResponse,
    currentCounselResponse,
    
    // Loading state
    isGeneratingOracle,
    isGeneratingCounsel,
    isRandomOrgAvailable,
    isEmbeddingsAvailable,
    
    // Personal reports
    personalOracleReports,
    personalCounselReports,
    
    // Actions
    handleSearch,
    navigateToSource,
    loadPersonalReports
  };
};
