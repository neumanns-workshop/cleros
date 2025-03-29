// Type-only import to ensure the types are available without loading the actual module
import type * as tfTypes from '@tensorflow/tfjs';
import type * as useTypes from '@tensorflow-models/universal-sentence-encoder';

interface HymnLine {
    text: string;
    embedding: number[];
}

interface HymnData {
    hymn_id: string;
    title: string;
    lines: string[];
    line_mappings: Record<string, number>;
}

interface HymnEmbeddings {
    [hymnId: string]: {
        [lineIndex: string]: HymnLine;
    };
}

// Use a CDN-hosted model that works reliably in browsers
// The correct URL format for TensorFlow Hub models
const MODEL_URL = 'https://tfhub.dev/tensorflow/tfjs-model/universal-sentence-encoder-lite/1/default/1';

let embedder: useTypes.UniversalSentenceEncoder | null = null;
let tfjs: typeof tfTypes | null = null;
let useModel: typeof useTypes | null = null;

// Dynamically load TensorFlow.js and the Universal Sentence Encoder only when needed
async function loadDependencies(): Promise<[typeof tfTypes, typeof useTypes]> {
    if (!tfjs || !useModel) {
        console.log('Loading TensorFlow.js and Universal Sentence Encoder...');
        tfjs = await import('@tensorflow/tfjs');
        useModel = await import('@tensorflow-models/universal-sentence-encoder');
        
        // Initialize backend
        try {
            await tfjs.setBackend('webgl');
            console.log('Using WebGL backend');
        } catch {
            await tfjs.setBackend('cpu');
            console.log('Using CPU backend');
        }
    }
    return [tfjs, useModel];
}

export async function initializeEmbedder(onLoadingChange?: (loading: boolean) => void): Promise<useTypes.UniversalSentenceEncoder> {
    if (!embedder) {
        onLoadingChange?.(true);
        try {
            const [, use] = await loadDependencies();
            
            console.log('Loading Universal Sentence Encoder model...');
            
            // Load the default model without specifying a URL
            // This will use the small model which has 512 dimensions
            embedder = await use.load();
            
            console.log('Embedding model loaded successfully');
        } catch (error: any) {
            console.error('Error initializing embedder:', error?.message || 'Unknown error');
            throw error;
        } finally {
            onLoadingChange?.(false);
        }
    }
    return embedder;
}

// Get query embedding using the same dimensionality as the data
export async function getQueryEmbedding(query: string, onLoadingChange?: (loading: boolean) => void): Promise<number[]> {
    try {
        onLoadingChange?.(true);
        console.log('Getting embedding for query:', query);
        
        const model = await initializeEmbedder(onLoadingChange);
        console.log('Model loaded, generating embedding...');
        
        const embeddings = await model.embed([query]);
        console.log('Embedding generated successfully');
        
        const embedding = await embeddings.array();
        console.log('Embedding dimension:', embedding[0].length);
        
        return embedding[0];
    } catch (error: any) {
        console.error('Error getting query embedding:', error?.message || 'Unknown error');
        throw new Error('Failed to process your question. Please try again.');
    } finally {
        onLoadingChange?.(false);
    }
}

export function cosineSimilarity(a: number[], b: number[]): number {
    if (!a || !b || a.length !== b.length) {
        console.error('Invalid vectors for similarity calculation');
        throw new Error('Invalid vectors for similarity calculation');
    }

    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    
    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0;
    }

    const similarity = dotProduct / (magnitudeA * magnitudeB);
    
    // Ensure the similarity is between -1 and 1
    return Math.max(-1, Math.min(1, similarity));
}

export async function findMostRelevantLine(
    query: string,
    hymnNumber: number,
    hymnData: HymnData,
    hymnEmbeddings: HymnEmbeddings,
    onLoadingChange?: (loading: boolean) => void
): Promise<{ line: string; similarity: number }> {
    const queryEmbedding = await getQueryEmbedding(query, onLoadingChange);
    
    const hymnLines = hymnEmbeddings[hymnNumber.toString()];
    
    let bestMatch = {
        line: '',
        similarity: -1,
        lineIndex: -1
    };
    
    Object.keys(hymnLines).forEach(lineIndex => {
        const lineData = hymnLines[lineIndex];
        const similarity = cosineSimilarity(queryEmbedding, lineData.embedding);
        
        if (similarity > bestMatch.similarity) {
            bestMatch = {
                line: lineData.text,
                similarity,
                lineIndex: parseInt(lineIndex)
            };
        }
    });
    
    return {
        line: bestMatch.line,
        similarity: bestMatch.similarity
    };
}

// NOTE: This function won't work with the updated structure that doesn't have hymn-level embeddings
// If you need this functionality, you'll need to recreate the hymn-level embeddings or adjust the approach
export async function findMostRelevantHymn(
    query: string,
    hymnEmbeddings: HymnEmbeddings,
    onLoadingChange?: (loading: boolean) => void
): Promise<{ hymnId: string; similarity: number }> {
    const queryEmbedding = await getQueryEmbedding(query, onLoadingChange);
    
    let bestMatch = {
        hymnId: '',
        similarity: -1
    };
    
    // Since we don't have hymn-level embeddings, we'll compare against the average of all line embeddings
    Object.keys(hymnEmbeddings).forEach(hymnId => {
        const hymnLines = hymnEmbeddings[hymnId];
        
        // Calculate average similarity across all lines
        let totalSimilarity = 0;
        let lineCount = 0;
        
        Object.keys(hymnLines).forEach(lineIndex => {
            const lineData = hymnLines[lineIndex];
            const similarity = cosineSimilarity(queryEmbedding, lineData.embedding);
            totalSimilarity += similarity;
            lineCount++;
        });
        
        const avgSimilarity = lineCount > 0 ? totalSimilarity / lineCount : 0;
        
        if (avgSimilarity > bestMatch.similarity) {
            bestMatch = {
                hymnId,
                similarity: avgSimilarity
            };
        }
    });
    
    return bestMatch;
} 