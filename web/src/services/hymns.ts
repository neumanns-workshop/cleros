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
        const response = await fetchLocalData<HymnEmbeddings>('/data/enriched/embeddings/sentence_embeddings.json');
        if (!response.success) {
            throw new Error(response.error || 'Failed to load hymn embeddings');
        }
        return response.data;
    } catch (error) {
        console.error('Error loading hymn embeddings:', error);
        throw new Error('Failed to load hymn embeddings');
    }
} 