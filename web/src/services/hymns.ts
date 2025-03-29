import { fetchLocalData } from './api';

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

export async function loadHymnData(hymnNumber: number): Promise<HymnData> {
    try {
        const response = await fetchLocalData<HymnData>(`/data/base/hymn_${hymnNumber}.json`);
        
        if (!response.success) {
            throw new Error(response.error || 'Failed to load hymn data');
        }
        
        return response.data;
    } catch (error) {
        console.error('Error loading hymn data:', error);
        throw new Error('Failed to load hymn data');
    }
}

export async function loadHymnEmbeddings(): Promise<HymnEmbeddings> {
    try {
        const timestamp = Date.now();
        const response = await fetchLocalData<HymnEmbeddings>(`/data/enriched/embeddings/sentence_embeddings.json?t=${timestamp}`);
        
        if (!response.success) {
            throw new Error(response.error || 'Failed to load sentence embeddings');
        }
        
        return response.data;
    } catch (error) {
        console.error('Error loading sentence embeddings:', error);
        throw new Error('Failed to load sentence embeddings');
    }
} 