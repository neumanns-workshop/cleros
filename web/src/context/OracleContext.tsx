import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { ProcessedSentenceData, ProcessedClauseData } from "../types";
import {
  HymnEmbeddings,
  loadHymnEmbeddings,
  loadHymnData,
} from "../services/hymns";
import {
  initializeEmbedder,
  getQueryEmbedding,
  cosineSimilarity,
} from "../services/embeddings";
import { fetchLocalData } from "../services/api";
import type * as useTypes from "@tensorflow-models/universal-sentence-encoder";

// Define constants
// const HYMN_COUNT = 121; // Removed unused constant

// Types for raw span data maps
interface SpanEmbeddingsMap {
  [id: string]: number[];
}
interface SpanMetadata {
  text: string;
  category: string;
  hymn_id: string;
  sentence_index: number;
  confidence?: string;
  start_char: number;
  end_char: number;
  span_id?: string;
}
interface SpanMetadataMap {
  [id: string]: SpanMetadata;
}

// Types for the data files
interface SpanEmbeddingsFileData {
  m: string;
  d: number;
  e: SpanEmbeddingsMap;
}
interface SpanMetadataFileData {
  spans: SpanMetadataMap;
  contexts?: any;
}

// Define categories type
const SPAN_CATEGORIES = [
  "action",
  "artifact",
  "beast",
  "celestial_sphere",
  "deity",
  "epithet",
  "hero",
  "mortal",
  "nature",
  "other",
  "other_divinity",
  "place",
] as const;
type SpanCategory = (typeof SPAN_CATEGORIES)[number];

// Interface for the context state
interface OracleContextType {
  isLoading: boolean;
  modelLoading: boolean;
  isContextDataLoading: boolean;
  error: string | null;
  selectedHymnNumber: number | null;
  selectedHymnTitle: string | null;
  selectedHymnOrigin: string | null;
  divinationTimestamp: string | null;
  primarySentence: ProcessedSentenceData | null;
  allSentencesForHymn: ProcessedSentenceData[] | null;
  topHymnClauseIds?: Set<string>;
  topHymnClausesMap?: Record<string, ProcessedClauseData>;
  userQuery?: string | null;
  performDivination: (userQuery: string) => Promise<void>;

  // Retain potentially useful context parts if needed by other components
  hymnEmbeddings: HymnEmbeddings | null;
  isTyping: boolean;
  setIsTyping: React.Dispatch<React.SetStateAction<boolean>>;
  expanded: boolean;
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  infoOpen: boolean;
  setInfoOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const OracleContext = createContext<OracleContextType | undefined>(
  undefined,
);

// Helper function to convert ArrayBuffer to hex string
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const OracleProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // State for loading, errors, and pre-loaded data
  const [isLoading, setIsLoading] = useState(false);
  const [modelLoading, setModelLoading] = useState(true);
  const [isContextDataLoading, setIsContextDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hymnEmbeddings, setHymnEmbeddings] = useState<HymnEmbeddings | null>(
    null,
  );
  const [embedderInstance, setEmbedderInstance] =
    useState<useTypes.UniversalSentenceEncoder | null>(null);

  // State for UI interaction (expand/collapse, etc.)
  const [isTyping, setIsTyping] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  // State for divination results
  const [selectedHymnNumber, setSelectedHymnNumber] = useState<number | null>(
    null,
  );
  const [selectedHymnOrigin, setSelectedHymnOrigin] = useState<string | null>(
    null,
  );
  const [selectedHymnTitle, setSelectedHymnTitle] = useState<string | null>(
    null,
  );
  const [divinationTimestamp, setDivinationTimestamp] = useState<string | null>(
    null,
  );
  const [primarySentence, setPrimarySentence] =
    useState<ProcessedSentenceData | null>(null);
  const [allSentencesForHymn, setAllSentencesForHymn] = useState<
    ProcessedSentenceData[] | null
  >(null);
  const [topHymnClauseIds, setTopHymnClauseIds] = useState<Set<string>>(
    new Set(),
  );
  const [topHymnClausesMap, setTopHymnClausesMap] = useState<
    Record<string, ProcessedClauseData>
  >({});
  const [userQuery, setUserQuery] = useState<string | null>(null);
  const [availableHymnKeys, setAvailableHymnKeys] = useState<string[]>([]);

  // Initialize TF model and load data
  useEffect(() => {
    const initializeAndLoadData = async () => {
      // Reset state
      setIsContextDataLoading(true);
      setError(null);
      setModelLoading(true);
      let loadError: string | null = null;

      try {
        console.log("[OracleContext] Initializing & Loading Essential Data...");
        const instance = await initializeEmbedder();
        setEmbedderInstance(instance);
        console.log("[OracleContext] Embedder Initialized.");
        setModelLoading(false);

        // --- Load ONLY Sentence Embeddings ---
        const loadedHymnEmbeddings = await loadHymnEmbeddings();
        setHymnEmbeddings(loadedHymnEmbeddings);
        console.log(
          `[OracleContext] Loaded sentence embeddings: ${loadedHymnEmbeddings ? Object.keys(loadedHymnEmbeddings).length : 0} hymns.`,
        );
        // Store the available keys
        setAvailableHymnKeys(
          loadedHymnEmbeddings ? Object.keys(loadedHymnEmbeddings) : [],
        );
        console.log(
          `[OracleContext] Stored ${loadedHymnEmbeddings ? Object.keys(loadedHymnEmbeddings).length : 0} available hymn keys.`,
        );

        // --- REMOVED Load Raw Span Data Maps ---
        // Span data will be loaded lazily in performDivination

      } catch (err) {
        console.error(
          "[OracleContext] Initialization or essential data loading failed:",
          err,
        );
        loadError = `Initialization failed: ${err instanceof Error ? err.message : String(err)}. Please refresh.`;
        setModelLoading(false); // Ensure model loading is false even on error
      }

      // Set loading false after essential data (model + sentence embeddings) is done
      setError(loadError);
      setIsContextDataLoading(false);
      console.log(
        `[OracleContext] Init & Essential Load Complete. Context Loading: false, Model Loading: ${modelLoading}`,
      );
    };
    initializeAndLoadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Core Divination Function
  const performDivination = useCallback(
    async (query: string) => {
      console.log(
        `[OracleContext] Performing divination... for query: "${query}"`,
      );

      // --- Add Checks for Dependencies ---
      if (isLoading) {
        console.warn(
          "[OracleContext] Divination already in progress. Ignoring.",
        );
        return;
      }
      if (!embedderInstance || !hymnEmbeddings) {
        console.error(
          "[OracleContext] Dependencies not ready (embedder, sentence embeddings). Aborting.",
        );
        setError("Oracle components not fully loaded. Please wait or refresh.");
        setIsLoading(false); // Ensure loading state is reset
        return;
      }
      if (availableHymnKeys.length === 0) {
        console.error(
          "[OracleContext] No available hymn keys loaded. Aborting.",
        );
        setError("Hymn data not loaded correctly. Cannot perform divination.");
        setIsLoading(false); // Ensure loading state is reset
        return;
      }
      // --- End Checks ---

      setIsLoading(true);
      setError(null);
      setPrimarySentence(null);
      setAllSentencesForHymn(null);
      setTopHymnClauseIds(new Set());
      setTopHymnClausesMap({});
      setUserQuery(query);
      setDivinationTimestamp(new Date().toISOString());

      // Temporary storage for lazily loaded span data
      let fetchedSpanEmbeddings: Record<SpanCategory, SpanEmbeddingsMap> | null = null;
      let fetchedSpanMetadata: Record<SpanCategory, SpanMetadataMap> | null = null;
      let spanLoadErrorOccurred = false;

      try {
        // === Step 0: Lazy Load Span Data ===
        console.log("[OracleContext] Lazily loading span data...");
        const tempEmbeddingsMaps = {} as Record<SpanCategory, SpanEmbeddingsMap>;
        const tempMetadataMaps = {} as Record<SpanCategory, SpanMetadataMap>;
        const spanLoadPromises = SPAN_CATEGORIES.map(async (category) => {
          try {
            const embPath = `/data/span_embeddings_${category}.json`;
            const metaPath = `/data/span_metadata_${category}.json`;
            const [embRes, metaRes] = await Promise.all([
              fetchLocalData<SpanEmbeddingsFileData>(embPath),
              fetchLocalData<SpanMetadataFileData>(metaPath),
            ]);
            if (embRes.success && embRes.data?.e) {
              tempEmbeddingsMaps[category] = embRes.data.e;
            } else {
              console.error(`Failed span emb load: ${category}`, embRes.error);
              spanLoadErrorOccurred = true; // Mark error but continue
            }
            if (metaRes.success && metaRes.data?.spans) {
              tempMetadataMaps[category] = metaRes.data.spans;
            } else {
              console.error(`Failed span meta load: ${category}`, metaRes.error);
              spanLoadErrorOccurred = true; // Mark error but continue
            }
          } catch (catError) {
            console.error(`Error loading span category ${category}:`, catError);
            spanLoadErrorOccurred = true; // Mark error but continue
          }
        });
        await Promise.all(spanLoadPromises);

        fetchedSpanEmbeddings = tempEmbeddingsMaps;
        fetchedSpanMetadata = tempMetadataMaps;
        console.log("[OracleContext] Span data loaded (or attempted).");
        if (spanLoadErrorOccurred) {
            console.warn("[OracleContext] One or more span data files failed to load. Clause highlighting may be incomplete.");
            // Optionally set a non-blocking error/warning state here if needed
        }

        // === Step 1: Timestamp & Context String ===
        const timestamp = Date.now();
        const displayTimestamp = new Date(divinationTimestamp || timestamp).toLocaleString();
        setDivinationTimestamp(displayTimestamp);

        // Create a more unique context string
        const userAgent = navigator.userAgent || "unknown";
        const screenWidth = window.screen.width || 0;
        const screenHeight = window.screen.height || 0;
        const contextString = `${timestamp}-${userAgent}-${screenWidth}x${screenHeight}`;
        console.log(`[OracleContext] Hashing context string: ${contextString}`); // Log the context string

        // Hash the combined context string
        const contextBuffer = new TextEncoder().encode(contextString);
        const hashBuffer = await crypto.subtle.digest("SHA-256", contextBuffer);
        const hashHex = bufferToHex(hashBuffer);
        const hashInt = BigInt(`0x${hashHex}`);
        // Select random index based on number of AVAILABLE keys
        const randomIndex = Number(hashInt % BigInt(availableHymnKeys.length));
        const hymnKey = availableHymnKeys[randomIndex]; // Get the actual key
        console.log(`[OracleContext] Selected Hymn Key: ${hymnKey}`);

        // === Re-add Step 1.5: Load Hymn Details (Title etc.) ===
        try {
          console.log(`[OracleContext] Loading details for ${hymnKey}...`);
          const hymnDetails = await loadHymnData(hymnKey);
          setSelectedHymnTitle(hymnDetails.title);
          console.log(`[OracleContext] Loaded Title: ${hymnDetails.title}`);
        } catch (detailsError) {
          console.error(
            `[OracleContext] Failed to load hymn details for ${hymnKey}:`,
            detailsError,
          );
          setSelectedHymnTitle("Unknown Title"); // Set fallback title
        }

        // Determine display number and origin
        let displayNum = null;
        let origin = null;
        try {
          const parts = hymnKey.split("-");
          if (parts.length > 1) {
            // Extract origin (capitalize first letter)
            origin = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
            setSelectedHymnOrigin(origin);
            console.log(`[OracleContext] Determined Origin: ${origin}`);

            // Extract display number
            displayNum = parseInt(parts[parts.length - 1]) + 1;
            setSelectedHymnNumber(displayNum);
            console.log(
              `[OracleContext] Determined Display Hymn Number: ${displayNum}`,
            );
          }
        } catch (parseError) {
          console.error(
            `[OracleContext] Could not parse display number/origin from key: ${hymnKey}`,
            parseError,
          );
          setSelectedHymnNumber(null);
          setSelectedHymnOrigin(null);
        }

        // === Step 2: Query Embedding ===
        console.log("[OracleContext] Generating query embedding...");
        const queryEmbedding = await getQueryEmbedding(query);
        if (!queryEmbedding) {
          throw new Error("Failed query embedding.");
        }
        console.log("[OracleContext] Query embedding generated.");

        // === Step 3 (Simplified): Process Selected Hymn using ONLY Query Embedding ===
        console.log(
          `[OracleContext] Processing sentences for Hymn Key ${hymnKey} using combined score...`,
        );
        const hymnSentencesData = hymnEmbeddings[hymnKey];
        if (!hymnSentencesData)
          throw new Error(`Data for Hymn Key ${hymnKey} not found.`);

        // Check if span data loaded successfully before proceeding with clause logic
        if (!fetchedSpanEmbeddings || !fetchedSpanMetadata) {
            console.error("[OracleContext] Cannot process clauses as span data failed to load.");
            // Handle this case - maybe skip clause processing or throw a more specific error
            // For now, we'll proceed but clause similarity will be 0
            spanLoadErrorOccurred = true; // Ensure this is marked
        }

        const processedSentences: ProcessedSentenceData[] = [];
        let topSentence: ProcessedSentenceData | null = null;
        let maxFinalScore = -Infinity;
        const WEIGHT_SIM = 0.7; // Weight for overall sentence similarity
        const WEIGHT_CLAUSE = 0.3; // Weight for max clause similarity
        let allClausesInHymn: ProcessedClauseData[] = []; // Aggregate all clauses here

        for (const [sentenceIndexStr, sentenceData] of Object.entries(
          hymnSentencesData,
        )) {
          const sentenceIndex = parseInt(sentenceIndexStr);

          // --- Add Diagnostic Log --- 
          console.log(`[OracleContext] Processing Sentence ${hymnKey}-${sentenceIndex}: Type = ${typeof sentenceData.text}, Content =`, sentenceData.text);
          // --- End Diagnostic Log --- 

          // Calculate similarity to the user query
          const querySimilarity = cosineSimilarity(
            queryEmbedding,
            sentenceData.embedding,
          );

          // Find relevant clauses and their similarities within this sentence
          const clausesForSentence: ProcessedClauseData[] = [];
          let currentMaxClauseSimilarity = 0;

          // Use fetched span data if available
          if (fetchedSpanEmbeddings && fetchedSpanMetadata) {
              for (const category of SPAN_CATEGORIES) {
                  const metaMap = fetchedSpanMetadata[category];
                  const embMap = fetchedSpanEmbeddings[category];
                  if (!metaMap || !embMap) continue; // Skip if category data is missing

                  const sentenceSpanEntries = Object.entries(metaMap).filter(
                      ([_, meta]) =>
                          meta.hymn_id === hymnKey &&
                          meta.sentence_index === sentenceIndex,
                  );

                  for (const [spanKey, spanMeta] of sentenceSpanEntries) {
                      const spanEmb = embMap[spanKey];
                      if (spanEmb) {
                          // Calculate similarity to the QUERY embedding
                          const clauseQuerySimilarity = cosineSimilarity(
                              queryEmbedding,
                              spanEmb,
                          );

                          if (clauseQuerySimilarity > currentMaxClauseSimilarity) {
                              currentMaxClauseSimilarity = clauseQuerySimilarity;
                          }

                          const clauseData: ProcessedClauseData = {
                              hymn_id: hymnKey,
                              sentence_index: sentenceIndex,
                              text: spanMeta.text,
                              category: spanMeta.category,
                              similarity: clauseQuerySimilarity, // Store similarity
                              start_char: spanMeta.start_char,
                              end_char: spanMeta.end_char,
                              // span_id: spanKey // Optionally add spanKey if needed
                          };
                          clausesForSentence.push(clauseData);
                          allClausesInHymn.push(clauseData); // Add to the hymn-wide list
                      }
                  }
              }
          } else {
              // Handle case where span data didn't load - log or default behavior
              if (!spanLoadErrorOccurred) { // Log only once per divination if it hasn't already
                  console.warn("[OracleContext] Span data unavailable, skipping clause processing for sentences.");
                  spanLoadErrorOccurred = true;
              }
          }
          // Sort clauses by start character (still useful if we need the full list later)
          clausesForSentence.sort((a, b) => a.start_char - b.start_char);

          // Calculate final weighted score for ranking
          const finalScore =
            WEIGHT_SIM * querySimilarity +
            WEIGHT_CLAUSE * currentMaxClauseSimilarity;

          // Store processed sentence data, including new scores and the top clause
          const currentProcessedSentence: ProcessedSentenceData = {
            hymn_id: hymnKey,
            sentence_index: sentenceIndex,
            text: sentenceData.text,
            query_similarity: querySimilarity,
            clauses: clausesForSentence, // Store the full list for this sentence
            max_clause_similarity: currentMaxClauseSimilarity,
            combined_score: finalScore,
          };
          processedSentences.push(currentProcessedSentence);

          if (finalScore > maxFinalScore) {
            maxFinalScore = finalScore;
            topSentence = currentProcessedSentence;
          }
        }

        // Sort all sentences by index
        processedSentences.sort((a, b) => a.sentence_index - b.sentence_index);

        // --- Calculate Top Hymn-Level Clauses Per Category ---
        const tempTopClausesMap: Record<string, ProcessedClauseData> = {};
        for (const clause of allClausesInHymn) {
          if (
            !tempTopClausesMap[clause.category] ||
            clause.similarity > tempTopClausesMap[clause.category].similarity
          ) {
            tempTopClausesMap[clause.category] = clause;
          }
        }
        // Extract the IDs of these top clauses
        const winningIds = new Set<string>();
        for (const category in tempTopClausesMap) {
          const topClause = tempTopClausesMap[category];
          const spanId = `${topClause.hymn_id}-s${topClause.sentence_index}-${topClause.start_char}`;
          winningIds.add(spanId);
        }
        setTopHymnClauseIds(winningIds); // Update IDs state
        setTopHymnClausesMap(tempTopClausesMap); // Update Map state
        console.log(
          `[OracleContext] Identified ${winningIds.size} top hymn-level clauses (Map generated).`,
        );
        // --- End Calculation ---

        setPrimarySentence(topSentence);
        setAllSentencesForHymn(processedSentences);
        console.log(
          `[OracleContext] Processed ${processedSentences.length} sentences for Hymn Key ${hymnKey}. Primary sentence index: ${topSentence?.sentence_index} (Score: ${maxFinalScore.toFixed(4)})`,
        );

        // --- Add Diagnostic Logging --- 
        if (topSentence && processedSentences) {
            console.log("--- Divination Result Analysis ---");
            console.log(`User Query: "${query}"`);
            console.log("Primary Sentence Selected:", topSentence);
            
            // Prepare data for table view, sorted by score
            const sentencesForTable = processedSentences
                .map(s => ({
                    index: s.sentence_index,
                    text: s.text.substring(0, 100) + (s.text.length > 100 ? "..." : ""), // Truncate for readability
                    querySim: s.query_similarity.toFixed(4),
                    maxClauseSim: s.max_clause_similarity.toFixed(4),
                    combinedScore: s.combined_score.toFixed(4),
                }))
                .sort((a, b) => parseFloat(b.combinedScore) - parseFloat(a.combinedScore));

            console.log("All Sentences in Selected Hymn (Sorted by Combined Score):");
            console.table(sentencesForTable);
            console.log("------------------------------------");
        }
        // --- End Diagnostic Logging ---

      } catch (err: any) {
        console.error(
          "[OracleContext] Error during key-based divination:",
          err,
        );
        setError(`Divination failed: ${err.message || "Unknown error"}`);
        setSelectedHymnNumber(null);
        setSelectedHymnOrigin(null);
        setSelectedHymnTitle(null);
        setDivinationTimestamp(null);
        setPrimarySentence(null);
        setAllSentencesForHymn(null);
        setTopHymnClauseIds(new Set()); // Clear IDs on error
        setTopHymnClausesMap({}); // Clear map on error
        setUserQuery(null); // Clear query on error
      } finally {
        setIsLoading(false);
        console.log("[OracleContext] Key-based divination process complete.");
      }
    },
    [
      isLoading,
      embedderInstance,
      hymnEmbeddings,
      availableHymnKeys,
    ],
  );

  // Memoize the context value to prevent unnecessary re-renders of consumers
  const value = useMemo(
    () => ({
      isLoading,
      modelLoading,
      isContextDataLoading,
      error,
      selectedHymnNumber,
      selectedHymnTitle,
      selectedHymnOrigin,
      divinationTimestamp,
      primarySentence,
      allSentencesForHymn,
      topHymnClauseIds,
      topHymnClausesMap,
      userQuery,
      performDivination,
      hymnEmbeddings,
      isTyping,
      setIsTyping,
      expanded,
      setExpanded,
      infoOpen,
      setInfoOpen,
    }),
    [
      isLoading,
      modelLoading,
      isContextDataLoading,
      error,
      selectedHymnNumber,
      selectedHymnTitle,
      selectedHymnOrigin,
      divinationTimestamp,
      primarySentence,
      allSentencesForHymn,
      topHymnClauseIds,
      topHymnClausesMap,
      userQuery,
      performDivination,
      hymnEmbeddings,
      isTyping,
      setIsTyping,
      expanded,
      setExpanded,
      infoOpen,
      setInfoOpen,
    ],
  );

  return (
    <OracleContext.Provider value={value}>{children}</OracleContext.Provider>
  );
};

// Custom hook remains the same
export const useOracleContext = () => {
  const context = useContext(OracleContext);
  if (context === undefined) {
    throw new Error("useOracleContext must be used within an OracleProvider");
  }
  return context;
};
