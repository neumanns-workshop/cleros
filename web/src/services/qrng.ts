/**
 * Query-based Random Number Generator (QRNG)
 * Uses embedding vectors from user queries to generate deterministic yet unpredictable numbers
 * through semantic space complexity and temporal integration.
 */

export interface QRNGResponse {
    data: number[];
    success: boolean;
}

export class QueryRandomError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'QueryRandomError';
    }
}

/**
 * Generate a random number between 0 and 87 (for 88 hymns) based on the query embedding
 * This approach uses the semantic properties of the user's question as the source of randomness,
 * creating a meaningful connection between the question and the divination result.
 * Also incorporates the current time to ensure temporal variability while maintaining
 * the semantic connection to the query.
 * 
 * @param queryEmbedding The embedding vector of the user's query
 * @returns A number between 0 and 87
 */
export function getRandomNumberFromEmbedding(queryEmbedding: number[]): number {
    if (!queryEmbedding || queryEmbedding.length === 0) {
        throw new Error('Invalid query embedding');
    }
    
    // Use the sum of the embedding values as a seed
    const embeddingSum = queryEmbedding.reduce((sum, val) => sum + val, 0);
    
    // Use various properties of the embedding to create randomness
    const embeddingMean = embeddingSum / queryEmbedding.length;
    const embeddingMax = Math.max(...queryEmbedding);
    const embeddingMin = Math.min(...queryEmbedding);
    const embeddingStdDev = Math.sqrt(
        queryEmbedding.reduce((sum, val) => sum + Math.pow(val - embeddingMean, 2), 0) / queryEmbedding.length
    );
    
    // Incorporate temporal elements
    const now = new Date();
    const timeComponents = [
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        now.getHours(),
        now.getMinutes(),
        now.getSeconds(),
        now.getMilliseconds()
    ];
    
    // Create a hash from embedding properties and time components
    const hashInput = `${embeddingSum}-${embeddingMean}-${embeddingMax}-${embeddingMin}-${embeddingStdDev}-${timeComponents.join('-')}`;
    let hash = 0;
    for (let i = 0; i < hashInput.length; i++) {
        hash = ((hash << 5) - hash) + hashInput.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }
    
    // Get absolute value and take modulo 88
    return Math.abs(hash % 88);
}

// Legacy fallback function
export async function getFallbackRandomNumber(): Promise<number> {
    try {
        // Fallback to local random number generation
        return Math.floor(Math.random() * 88);
    } catch (error) {
        console.error('Error generating random number:', error);
        // Final fallback
        return Math.floor(Math.random() * 88);
    }
} 