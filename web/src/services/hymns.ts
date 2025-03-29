import axios from 'axios';

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
        const response = await axios.get(`/data/base/hymn_${hymnNumber}.json`);
        return response.data;
    } catch (error) {
        console.error('Error loading hymn data:', error);
        throw new Error('Failed to load hymn data');
    }
}

export async function loadHymnEmbeddings(): Promise<HymnEmbeddings> {
    try {
        const timestamp = Date.now();
        const response = await axios.get(`/data/enriched/embeddings/sentence_embeddings.json?t=${timestamp}`);
        return response.data;
    } catch (error) {
        console.error('Error loading sentence embeddings:', error);
        throw new Error('Failed to load sentence embeddings');
    }
} 