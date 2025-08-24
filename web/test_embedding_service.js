#!/usr/bin/env node

// Test the actual EmbeddingService class
import { embeddingService } from './src/services/embeddingService.js';

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
        console.log('\n🎉 EmbeddingService is working correctly!');
        
    } catch (error) {
        console.error('❌ EmbeddingService test failed:', error);
        process.exit(1);
    }
}

testEmbeddingService();
