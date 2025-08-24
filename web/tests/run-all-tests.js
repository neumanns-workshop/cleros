#!/usr/bin/env node
/**
 * Test runner - runs all embedding tests
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const tests = [
    'test-transformers-basic.js',
    'test-embedding-service.js', 
    'test-query-embeddings.js'
];

async function runTest(testFile) {
    return new Promise((resolve) => {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`🧪 Running: ${testFile}`);
        console.log(`${'='.repeat(60)}\n`);
        
        const testPath = join(__dirname, testFile);
        const child = spawn('npx', ['tsx', testPath], { 
            stdio: 'inherit',
            cwd: join(__dirname, '..') 
        });
        
        child.on('close', (code) => {
            resolve(code === 0);
        });
    });
}

async function runAllTests() {
    console.log('🔮 Running all transformers.js embedding tests...\n');
    
    let passed = 0;
    let failed = 0;
    
    for (const test of tests) {
        const success = await runTest(test);
        if (success) {
            passed++;
            console.log(`\n✅ ${test} PASSED`);
        } else {
            failed++;
            console.log(`\n❌ ${test} FAILED`);
        }
    }
    
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 TEST SUMMARY');
    console.log(`${'='.repeat(60)}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Total:  ${passed + failed}`);
    
    if (failed === 0) {
        console.log('\n🎉 ALL TESTS PASSED! Transformers.js is working correctly.');
        process.exit(0);
    } else {
        console.log('\n💥 SOME TESTS FAILED! Check the output above for details.');
        process.exit(1);
    }
}

runAllTests();
