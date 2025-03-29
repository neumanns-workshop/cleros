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
    // Define multiple possible paths to try
    const pathsToTry = [
        `/data/base/hymn_${hymnNumber}.json`,
        `/sortes-app/data/base/hymn_${hymnNumber}.json`,
        `${process.env.PUBLIC_URL}/data/base/hymn_${hymnNumber}.json`
    ];
    
    let lastError: any = null;
    
    // Try each path in sequence
    for (const path of pathsToTry) {
        try {
            console.log(`Attempting to load hymn data from: ${path}`);
            const response = await fetchLocalData<HymnData>(path);
            if (response.success) {
                console.log(`Successfully loaded hymn data from: ${path}`);
                return response.data;
            }
            lastError = new Error(response.error || 'Failed to load hymn data');
        } catch (error) {
            console.warn(`Failed to load hymn data from ${path}:`, error);
            lastError = error;
            // Continue to next path
        }
    }
    
    // If we get here, all paths failed
    console.error(`Error loading hymn ${hymnNumber} data, all paths failed:`, lastError);
    throw new Error('Failed to load hymn data');
}

export async function loadHymnEmbeddings(): Promise<HymnEmbeddings> {
    // Define multiple possible paths to try
    const pathsToTry = [
        '/data/enriched/embeddings/sentence_embeddings.json',
        '/sortes-app/data/enriched/embeddings/sentence_embeddings.json',
        `${process.env.PUBLIC_URL}/data/enriched/embeddings/sentence_embeddings.json`
    ];
    
    let lastError: any = null;
    
    // Try each path in sequence
    for (const path of pathsToTry) {
        try {
            console.log(`Attempting to load embeddings from: ${path}`);
            const response = await fetchLocalData<HymnEmbeddings>(path);
            if (response.success) {
                console.log(`Successfully loaded embeddings from: ${path}`);
                return response.data;
            }
            lastError = new Error(response.error || 'Failed to load hymn embeddings');
        } catch (error) {
            console.warn(`Failed to load embeddings from ${path}:`, error);
            lastError = error;
            // Continue to next path
        }
    }
    
    // If we get here, all paths failed
    console.error('Error loading hymn embeddings, all paths failed:', lastError);
    throw new Error('Failed to load hymn embeddings');
} 