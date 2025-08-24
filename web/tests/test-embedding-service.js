#!/usr/bin/env node
/**
 * EmbeddingService class test
 * Tests the application's embedding service wrapper
 */

import { embeddingService } from '../src/services/embeddingService.ts';

async function testEmbeddingService() {
    console.log('🔮 Testing EmbeddingService class...');
    
    try {
        const testQuery = "What guidance do the ancient texts offer?";
        console.log(`🧪 Testing query: "${testQuery}"`);
        
        console.log('⚙️ Getting query embedding...');
        const embedding = await embeddingService.getQueryEmbedding(testQuery);
        
        console.log('✅ Query embedding generated successfully!');
        console.log(`📊 Embedding dimensions: ${embedding.length}`);
        console.log(`🔢 First 5 values: [${embedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]`);
        
        // Test cosine similarity function
        const embedding2 = await embeddingService.getQueryEmbedding("oracle wisdom divination");
        const similarity = embeddingService.calculateCosineSimilarity(embedding, embedding2);
        
        console.log(`🔗 Cosine similarity test: ${similarity.toFixed(4)}`);
        
        // Test edge cases
        console.log('\n🧪 Testing edge cases...');
        
        // Empty vectors
        const emptySim = embeddingService.calculateCosineSimilarity([], []);
        console.log(`🔗 Empty vectors similarity: ${emptySim}`);
        
        // Mismatched dimensions
        const mismatchSim = embeddingService.calculateCosineSimilarity([1, 2, 3], [1, 2]);
        console.log(`🔗 Mismatched dimensions similarity: ${mismatchSim}`);
        
        // Same vectors
        const sameSim = embeddingService.calculateCosineSimilarity(embedding, embedding);
        console.log(`🔗 Identical vectors similarity: ${sameSim.toFixed(4)} (should be ~1.0)`);
        
        // Validate similarity is reasonable (between -1 and 1)
        if (similarity >= -1 && similarity <= 1) {
            console.log('✅ Similarity values are within valid range');
        } else {
            throw new Error(`Invalid similarity value: ${similarity}`);
        }
        
        // Validate embedding dimensions match expected
        if (embedding.length === 384) { // all-MiniLM-L6-v2 dimension
            console.log('✅ Embedding dimensions are correct (384)');
        } else {
            throw new Error(`Unexpected embedding dimension: ${embedding.length}, expected 384`);
        }
        
        console.log('\n🎉 EmbeddingService test PASSED!');
        return true;
        
    } catch (error) {
        console.error('❌ EmbeddingService test FAILED:', error);
        return false;
    }
}

// Run the test
testEmbeddingService();
