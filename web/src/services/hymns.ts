import { fetchLocalData } from "./api";

export interface HymnData {
  hymn_id: string;
  title: string;
  incense: string;
  lines: string[];
  line_mappings: Record<string, number>;
}

interface HymnLine {
  text: string;
  embedding: number[];
}

export interface HymnEmbeddings {
  [hymnId: string]: {
    [lineIndex: string]: HymnLine;
  };
}

// New interfaces for the updated embeddings format
export interface SentenceEmbedding {
  text: string;
  embedding: number[];
  hymn_id: string;
  sentence_index: number;
}

export interface SentenceMetadata {
  text: string;
  hymn_id: string;
  sentence_index: number;
}

export interface EmbeddingsData {
  m: string; // model name
  d: number; // dimensions
  e: {
    [id: string]: number[]; // embeddings by ID
  };
}

export interface MetadataData {
  spans: {
    [id: string]: {
      text: string;
      hymn_id: string;
      sentence_index: number;
      confidence: string;
    };
  };
  contexts: {
    [id: string]: {
      context: string;
      full_sentence: string;
    };
  };
}

export async function loadHymnData(hymnId: string): Promise<HymnData> {
  try {
    // Load all hymns data from the correct path
    const response = await fetchLocalData<any>("/data/hymns.json");

    if (!response.success) {
      throw new Error(response.error || "Failed to load hymn data");
    }

    // Log the structure of the data for debugging
    console.log(`Hymn data loaded, looking for hymn: ${hymnId}`);

    // Check different possible data structures
    const hymnsData = response.data;

    // Extract the hymns array, checking different possible structures
    const hymns = Array.isArray(hymnsData.hymns)
      ? hymnsData.hymns
      : Array.isArray(hymnsData)
        ? hymnsData
        : [];

    console.log(`Found ${hymns.length} hymns in the data`);

    // Find the hymn with the matching ID - check both id and hymn_id properties
    const hymn = hymns.find(
      (h: any) =>
        (h.id && h.id === hymnId) || (h.hymn_id && h.hymn_id === hymnId),
    );

    if (!hymn) {
      throw new Error(`Hymn with ID ${hymnId} not found`);
    }

    // Extract lines and other data
    const lines: string[] = [];
    const line_mappings: Record<string, number> = {};

    // Process sentences to create a lines array and mappings
    // Check if sentences exist, otherwise use lines directly
    if (Array.isArray(hymn.sentences)) {
      hymn.sentences.forEach((sentence: any, index: number) => {
        const text = typeof sentence === "string" ? sentence : sentence.text;
        lines.push(text);
        line_mappings[index.toString()] = index;
      });
    } else if (Array.isArray(hymn.lines)) {
      hymn.lines.forEach((line: string, index: number) => {
        lines.push(line);
        line_mappings[index.toString()] = index;
      });
    } else {
      throw new Error(`Hymn ${hymnId} has no lines or sentences`);
    }

    // Return formatted hymn data
    return {
      hymn_id: hymn.id || hymn.hymn_id,
      title: hymn.title || `Hymn ${hymnId}`,
      incense: hymn.incense || "Unknown",
      lines,
      line_mappings,
    };
  } catch (error) {
    console.error("Error loading hymn data:", error);
    throw new Error("Failed to load hymn data");
  }
}

export async function loadHymnEmbeddings(): Promise<HymnEmbeddings> {
  try {
    console.log("[loadHymnEmbeddings] Fetching hymns, embeddings, and metadata in parallel...");
    const [hymnsResponse, embeddingsResponse, metadataResponse] = await Promise.all([
      fetchLocalData<any>("/data/hymns.json"),
      fetchLocalData<EmbeddingsData>("/data/sentence_embeddings.json"),
      fetchLocalData<any>("/data/sentence_metadata.json"),
    ]);
    console.log("[loadHymnEmbeddings] All data fetched.");

    // Check each response
    if (!hymnsResponse.success) {
      throw new Error(hymnsResponse.error || "Failed to load hymns data");
    }
    if (!embeddingsResponse.success) {
      throw new Error(
        embeddingsResponse.error || "Failed to load sentence embeddings",
      );
    }
    if (!metadataResponse.success) {
      throw new Error(
        metadataResponse.error || "Failed to load sentence metadata",
      );
    }

    // We don't need to use the hymns data here but we load it to verify it exists
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const hymnsData = hymnsResponse.data;
    const embeddingsData = embeddingsResponse.data;
    const metadataData = metadataResponse.data;

    // Add detailed logging for metadata structure
    console.log(
      `[loadHymnEmbeddings] Metadata loaded. Top-level keys: ${Object.keys(metadataData || {}).join(", ")}`,
    );
    console.log(
      `[loadHymnEmbeddings] Keys under metadataData.sentences: ${Object.keys(metadataData?.sentences || {}).length} keys found.`,
    );

    // Transform to the expected HymnEmbeddings format
    const hymnEmbeddings: HymnEmbeddings = {};

    // Verify the model is as expected
    console.log(
      `Loaded embeddings using model: ${embeddingsData.m} with ${embeddingsData.d} dimensions`,
    );

    // Check if the model name starts with the expected base name
    if (!embeddingsData.m?.startsWith("universal-sentence-encoder")) {
      console.warn(
        `Expected model name to start with 'universal-sentence-encoder' but found ${embeddingsData.m}`,
      );
    }

    if (embeddingsData.d !== 512) {
      console.warn(`Expected 512 dimensions but found ${embeddingsData.d}`);
    }

    // Process each sentence embedding
    Object.keys(embeddingsData.e).forEach((id) => {
      const embedding = embeddingsData.e[id];
      // Make sure metadataData.sentences exists before accessing it
      const metadata = metadataData?.sentences?.[id];

      if (!metadata) {
        // Log specifically when metadata is missing
        console.warn(
          `[loadHymnEmbeddings] Missing metadata for embedding id: ${id}. Skipping sentence.`,
        );
        return;
      }

      // Extract hymn ID and sentence index from the ID
      // Format is expected to be like "homeric-0-s0"
      const parts = id.split("-s");
      if (parts.length !== 2) {
        console.warn(`Invalid sentence ID format: ${id}`);
        return;
      }

      const hymnId = parts[0]; // e.g. "homeric-0"
      const sentenceIndex = parts[1]; // e.g. "0"

      // Log when initializing or adding to a hymn key
      if (!hymnEmbeddings[hymnId]) {
        // Log creation of a new hymn key
        console.log(`[loadHymnEmbeddings] Initializing key: ${hymnId}`);
        hymnEmbeddings[hymnId] = {};
      }

      // Add the line with its embedding
      hymnEmbeddings[hymnId][sentenceIndex] = {
        text: metadata.text,
        embedding: embedding,
      };
    });

    // Add logging for final keys AFTER the loop
    const finalKeys = Object.keys(hymnEmbeddings);
    console.log(
      `[loadHymnEmbeddings] Final generated keys (${finalKeys.length}): ${finalKeys.join(", ")}`,
    );

    return hymnEmbeddings;
  } catch (error) {
    console.error("Error loading sentence embeddings:", error);
    throw new Error("Failed to load sentence embeddings");
  }
}
