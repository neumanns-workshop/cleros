import { pipeline } from '@xenova/transformers';

// Type for the transformers.js pipeline
type FeatureExtractionPipeline = any; // Note: @xenova/transformers doesn't export proper types yet

// Ensure there is only one instance of the embedding pipeline
class EmbeddingPipeline {
    static pipeline: FeatureExtractionPipeline | null = null;
    static instance: EmbeddingPipeline | null = null;

    static async getInstance(): Promise<EmbeddingPipeline> {
        if (this.instance === null) {
            console.log('🔮 Initializing transformers.js embedding pipeline...');
            this.pipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
            this.instance = new EmbeddingPipeline();
            console.log('✅ Embedding pipeline initialized successfully');
        }
        return this.instance;
    }

    async embed(text: string): Promise<number[]> {
        if (!EmbeddingPipeline.pipeline) {
            throw new Error('Embedding pipeline not initialized.');
        }
        
        try {
            // Generate embedding using the pipeline with mean pooling and normalization
            const output = await EmbeddingPipeline.pipeline(text, {
                pooling: 'mean',
                normalize: true
            });
            
            // Convert tensor to regular array
            return Array.from(output.data);
        } catch (error) {
            console.error('Embedding error:', error);
            throw error;
        }
    }
}


export interface LineEmbeddingData {
    metadata: {
        corpus: string;
        total_lines: number;
        embedding_dimension: number;
        model: string;
        created: string;
        mapping: Array<{
            id: string;
            index: number;
        }>;
    };
    embeddings: number[][];
}

export interface SentenceEmbeddingData {
    metadata: {
        mapping: Array<{
            sentence_id: number;
            index: number;
        }>;
    };
    embeddings: number[][];
}


class EmbeddingService {
    private modelPipeline: Promise<EmbeddingPipeline>;
    private lineEmbeddingsCache: Map<string, Promise<LineEmbeddingData>> = new Map();

    constructor() {
        this.modelPipeline = EmbeddingPipeline.getInstance();
    }

    private parseNumpyArray(buffer: ArrayBuffer): number[][] {
        const view = new DataView(buffer);
        let offset = 0;

        // Skip numpy magic bytes and version
        offset += 6; // Magic bytes b'\x93NUMPY'
        view.getUint8(offset++); // version byte
        offset++; // Minor version

        // Read header length
        const headerLen = view.getUint16(offset, true);
        offset += 2;

        // Skip header (contains dtype, shape info)
        offset += headerLen;

        // Get the actual float32 data
        const dataLength = (buffer.byteLength - offset) / 4; // 4 bytes per float32
        const floats = new Float32Array(buffer, offset, dataLength);

        // The data should be reshaped into [num_vectors, embedding_dim]
        // We'll determine this from the metadata
        const result: number[][] = [];
        const embeddingDim = 384; // all-MiniLM-L6-v2 dimension
        const numVectors = Math.floor(dataLength / embeddingDim);

        for (let i = 0; i < numVectors; i++) {
            const vector: number[] = [];
            for (let j = 0; j < embeddingDim; j++) {
                vector.push(floats[i * embeddingDim + j]);
            }
            result.push(vector);
        }

        return result;
    }

    private async loadLineEmbeddings(corpus: string): Promise<LineEmbeddingData> {
        if (!this.lineEmbeddingsCache.has(corpus)) {
            const promise = (async () => {
                const [metadataResponse] = await Promise.all([
                    fetch(`/embeddings/${corpus}/lines_metadata.json`)
                ]);

                if (!metadataResponse.ok) {
                    throw new Error(`Failed to load line metadata: ${metadataResponse.status}`);
                }

                const [metadata] = await Promise.all([
                    metadataResponse.json()
                ]);

                const embeddingResponse = await fetch(`/embeddings/${corpus}/lines.npy`);
                if (!embeddingResponse.ok) {
                    throw new Error(`Failed to load line embeddings: ${embeddingResponse.status}`);
                }

                const embeddingBuffer = await embeddingResponse.arrayBuffer();
                const embeddings = this.parseNumpyArray(embeddingBuffer);

                return { metadata, embeddings };
            })();

            this.lineEmbeddingsCache.set(corpus, promise);
        }
        return this.lineEmbeddingsCache.get(corpus)!;
    }

    public async getQueryEmbedding(query: string): Promise<number[]> {
        const pipeline = await this.modelPipeline;
        return pipeline.embed(query);
    }
    
    public async getLineEmbedding(corpus: string, lineId: string): Promise<number[] | undefined> {
        try {
            const embeddingData = await this.loadLineEmbeddings(corpus);
            
            // Find the mapping for this line ID in the format corpus_part_sentence_line
            const mapping = embeddingData.metadata.mapping.find(m => m.id === lineId);
            
            if (!mapping) {
                return undefined;
            }
            
            const embedding = embeddingData.embeddings[mapping.index];
            if (!embedding) {
                return undefined;
            }
            
            return embedding;
        } catch (_error) {
            return undefined;
        }
    }

    private sentenceEmbeddingsCache: Map<string, Promise<SentenceEmbeddingData>> = new Map();

    private async loadSentenceEmbeddings(corpus: string): Promise<SentenceEmbeddingData> {
        if (!this.sentenceEmbeddingsCache.has(corpus)) {
            const promise = (async () => {
                const [metadataResponse] = await Promise.all([
                    fetch(`/embeddings/${corpus}/sentences_metadata.json`)
                ]);

                if (!metadataResponse.ok) {
                    throw new Error(`Failed to load sentence metadata: ${metadataResponse.status}`);
                }

                const metadata = await metadataResponse.json();

                // Load the embedding vectors
                const embeddingResponse = await fetch(`/embeddings/${corpus}/sentences.npy`);
                if (!embeddingResponse.ok) {
                    throw new Error(`Failed to load sentence embeddings: ${embeddingResponse.status}`);
                }
                
                const embeddingBuffer = await embeddingResponse.arrayBuffer();
                const embeddings = this.parseNumpyArray(embeddingBuffer);

                return { metadata, embeddings };
            })();

            this.sentenceEmbeddingsCache.set(corpus, promise);
        }
        return this.sentenceEmbeddingsCache.get(corpus)!;
    }

    public async getSentenceEmbedding(corpus: string, sentenceId: number, partNumber: number = 1): Promise<number[] | undefined> {
        try {
            const embeddingData = await this.loadSentenceEmbeddings(corpus);
            
            // Construct the embedding ID in the format: corpus_part_sentence
            const embeddingId = `${corpus}_${partNumber}_${sentenceId}`;
            
            // Find the mapping for this embedding ID
            const mapping = embeddingData.metadata.mapping?.find((m: any) => m.id === embeddingId);
            
            if (!mapping) {
                return undefined;
            }
            
            const embedding = embeddingData.embeddings[mapping.index];
            if (!embedding) {
                return undefined;
            }
            
            return embedding;
        } catch (_error) {
            return undefined;
        }
    }

    public calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
        if (!vecA || !vecB || vecA.length !== vecB.length) {
            return 0;
        }

        let dotProduct = 0.0;
        let normA = 0.0;
        let normB = 0.0;
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        
        if (normA === 0 || normB === 0) {
            return 0;
        }

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}

export const embeddingService = new EmbeddingService();
