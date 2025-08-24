#!/usr/bin/env node
/**
 * Query embeddings integration test
 * Tests the complete query embedding pipeline used in the application
 */

import { embeddingService } from '../src/services/embeddingService.ts';

async function testQueryEmbeddings() {
    console.log('🔮 Testing query embeddings integration...');
    
    try {
        // Test queries that would be used in the application
        const testQueries = [
            "How can I find inner peace?",
            "What does the oracle say about love?",
            "Guide me through difficult times",
            "Show me wisdom about death",
            "What is the nature of the divine?",
            "Help me understand my purpose"
        ];
        
        console.log(`🧪 Testing ${testQueries.length} different query types...\n`);
        
        const embeddings = [];
        const similarities = [];
        
        // Generate embeddings for all queries
        for (let i = 0; i < testQueries.length; i++) {
            const query = testQueries[i];
            console.log(`📝 Query ${i + 1}: "${query}"`);
            
            const startTime = Date.now();
            const embedding = await embeddingService.getQueryEmbedding(query);
            const endTime = Date.now();
            
            embeddings.push(embedding);
            
            console.log(`   ⚡ Generated in ${endTime - startTime}ms`);
            console.log(`   📊 Dimensions: ${embedding.length}`);
            console.log(`   🔢 Sample: [${embedding.slice(0, 3).map(v => v.toFixed(3)).join(', ')}...]`);
            
            // Validate embedding
            if (embedding.length !== 384) {
                throw new Error(`Wrong embedding dimension: ${embedding.length}`);
            }
            
            if (embedding.some(val => isNaN(val))) {
                throw new Error('Embedding contains NaN values');
            }
            
            console.log(`   ✅ Valid embedding\n`);
        }
        
        // Test semantic similarity between different types of queries
        console.log('🔍 Testing semantic similarities...\n');
        
        const testPairs = [
            [0, 2], // "inner peace" vs "difficult times" - related
            [1, 4], // "oracle love" vs "divine nature" - related  
            [3, 5], // "death" vs "purpose" - different topics
            [0, 1], // "inner peace" vs "oracle love" - different topics
        ];
        
        for (const [i, j] of testPairs) {
            const sim = embeddingService.calculateCosineSimilarity(embeddings[i], embeddings[j]);
            similarities.push(sim);
            
            console.log(`🔗 "${testQueries[i]}" <-> "${testQueries[j]}"`);
            console.log(`   Similarity: ${sim.toFixed(4)}\n`);
            
            if (sim < -1 || sim > 1) {
                throw new Error(`Invalid similarity: ${sim}`);
            }
        }
        
        // Performance test - multiple embeddings in parallel
        console.log('⚡ Testing parallel embedding generation...');
        const parallelQueries = testQueries.slice(0, 3);
        
        const parallelStart = Date.now();
        const parallelEmbeddings = await Promise.all(
            parallelQueries.map(q => embeddingService.getQueryEmbedding(q))
        );
        const parallelEnd = Date.now();
        
        console.log(`   Generated ${parallelEmbeddings.length} embeddings in parallel: ${parallelEnd - parallelStart}ms`);
        console.log(`   Average: ${Math.round((parallelEnd - parallelStart) / parallelEmbeddings.length)}ms per embedding`);
        
        // Verify parallel results match sequential results
        for (let i = 0; i < parallelEmbeddings.length; i++) {
            const sequentialSim = embeddingService.calculateCosineSimilarity(embeddings[i], embeddings[i]);
            const parallelSim = embeddingService.calculateCosineSimilarity(embeddings[i], parallelEmbeddings[i]);
            
            if (Math.abs(parallelSim - 1.0) > 0.0001) {
                throw new Error(`Parallel embedding doesn't match sequential: ${parallelSim}`);
            }
        }
        
        console.log('   ✅ Parallel results match sequential results');
        
        console.log('\n📊 Test Summary:');
        console.log(`   Generated ${embeddings.length} embeddings successfully`);
        console.log(`   All embeddings have correct dimensions (384)`);
        console.log(`   Similarity values range: ${Math.min(...similarities).toFixed(4)} to ${Math.max(...similarities).toFixed(4)}`);
        console.log(`   Parallel processing works correctly`);
        
        console.log('\n🎉 Query embeddings integration test PASSED!');
        return true;
        
    } catch (error) {
        console.error('❌ Query embeddings integration test FAILED:', error);
        return false;
    }
}

// Run the test
testQueryEmbeddings();
