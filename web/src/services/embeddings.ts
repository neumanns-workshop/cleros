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
    hymns: {
        [key: string]: {
            text: string;
            embedding: number[];
        };
    };
    lines: {
        [key: string]: {
            [lineIndex: string]: HymnLine;
        };
    };
}

let embedder: useTypes.UniversalSentenceEncoder | null = null;
let tfjs: typeof tfTypes | null = null;
let useModel: typeof useTypes | null = null;

// Dynamically load TensorFlow.js and the Universal Sentence Encoder only when needed
async function loadDependencies(): Promise<[typeof tfTypes, typeof useTypes]> {
    if (!tfjs || !useModel) {
        tfjs = await import('@tensorflow/tfjs');
        useModel = await import('@tensorflow-models/universal-sentence-encoder');
        
        // Initialize backend
        try {
            await tfjs.setBackend('webgl');
        } catch {
            await tfjs.setBackend('cpu');
        }
    }
    return [tfjs, useModel];
}

export async function initializeEmbedder(): Promise<useTypes.UniversalSentenceEncoder> {
    if (!embedder) {
        try {
            const [tf, use] = await loadDependencies();
            
            // Make sure we have a backend
            const backend = tf.getBackend();
            if (!backend) {
                throw new Error('No TensorFlow.js backend available');
            }
            
            embedder = await use.load();
        } catch (error: any) {
            console.error('Error initializing embedder:', error?.message || 'Unknown error');
            throw error;
        }
    }
    return embedder;
}

// Optimized embedder initialization for production
export async function initializeEmbedderOptimized(): Promise<useTypes.UniversalSentenceEncoder> {
    if (!embedder) {
        try {
            const [tf, use] = await loadDependencies();
            
            // Force WebGL backend for better performance if available
            if (tf.engine().backendNames().includes('webgl')) {
                await tf.setBackend('webgl');
                
                // Set memory management for WebGL
                if (tf.getBackend() === 'webgl') {
                    const gl = (tf.backend() as any).getGPGPUContext().gl;
                    if (gl) {
                        // Set WebGL parameters to optimize memory usage
                        gl.disable(gl.DEPTH_TEST);
                        gl.disable(gl.STENCIL_TEST);
                        gl.disable(gl.BLEND);
                        gl.disable(gl.DITHER);
                        gl.disable(gl.POLYGON_OFFSET_FILL);
                        gl.disable(gl.SAMPLE_COVERAGE);
                        gl.disable(gl.SAMPLE_ALPHA_TO_COVERAGE);
                    }
                }
            } else {
                await tf.setBackend('cpu');
            }
            
            // Load the model with caching enabled
            embedder = await use.load();
            
            // Explicitly run garbage collection
            try {
                tf.tidy(() => {});
                tf.disposeVariables();
            } catch (e) {
                console.warn('Error during TF memory cleanup:', e);
            }
        } catch (error: any) {
            console.error('Error initializing optimized embedder:', error?.message || 'Unknown error');
            throw error;
        }
    }
    return embedder;
}

export async function getQueryEmbedding(query: string): Promise<number[]> {
    try {
        const model = await initializeEmbedder();
        const embeddings = await model.embed([query]);
        const embedding = await embeddings.array();
        return embedding[0];
    } catch (error: any) {
        console.error('Error getting query embedding:', error?.message || 'Unknown error');
        throw new Error('Failed to process your question. Please try again.');
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
    hymnEmbeddings: HymnEmbeddings
): Promise<{ line: string; similarity: number }> {
    const queryEmbedding = await getQueryEmbedding(query);
    
    const hymnLines = hymnEmbeddings.lines[hymnNumber.toString()];
    
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

export async function findMostRelevantHymn(
    query: string,
    hymnEmbeddings: HymnEmbeddings
): Promise<{ hymnId: string; similarity: number }> {
    const queryEmbedding = await getQueryEmbedding(query);
    
    let bestMatch = {
        hymnId: '',
        similarity: -1
    };
    
    Object.keys(hymnEmbeddings.hymns).forEach(hymnId => {
        const hymnData = hymnEmbeddings.hymns[hymnId];
        const similarity = cosineSimilarity(queryEmbedding, hymnData.embedding);
        
        if (similarity > bestMatch.similarity) {
            bestMatch = {
                hymnId,
                similarity
            };
        }
    });
    
    return bestMatch;
} 