#!/usr/bin/env node
/**
 * Basic transformers.js functionality test
 * Tests the raw @xenova/transformers pipeline API
 */

import { pipeline } from '@xenova/transformers';

async function testBasicTransformers() {
    console.log('🔮 Testing basic transformers.js functionality...');
    
    try {
        console.log('📥 Loading feature extraction pipeline...');
        const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        
        console.log('✅ Pipeline loaded successfully!');
        
        const testQuery = "What is the meaning of life?";
        console.log(`🧪 Testing embedding generation for: "${testQuery}"`);
        
        console.log('⚙️ Generating embedding...');
        const output = await extractor(testQuery, {
            pooling: 'mean',
            normalize: true,
        });
        
        const embedding = Array.from(output.data);
        
        console.log('✅ Embedding generated successfully!');
        console.log(`📊 Embedding dimensions: ${embedding.length}`);
        console.log(`🔢 First 5 values: [${embedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]`);
        console.log(`📈 Magnitude: ${Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0)).toFixed(4)}`);
        
        // Test with another query to verify consistency
        const testQuery2 = "oracle divination ancient wisdom";
        console.log(`\n🧪 Testing second query: "${testQuery2}"`);
        
        const output2 = await extractor(testQuery2, {
            pooling: 'mean',
            normalize: true,
        });
        
        const embedding2 = Array.from(output2.data);
        
        // Calculate cosine similarity
        let dotProduct = 0;
        for (let i = 0; i < embedding.length; i++) {
            dotProduct += embedding[i] * embedding2[i];
        }
        
        console.log(`📊 Second embedding dimensions: ${embedding2.length}`);
        console.log(`🔗 Cosine similarity between queries: ${dotProduct.toFixed(4)}`);
        
        console.log('\n🎉 Basic transformers.js test PASSED!');
        return true;
        
    } catch (error) {
        console.error('❌ Basic transformers.js test FAILED:', error);
        return false;
    }
}

// Run the test
testBasicTransformers();
