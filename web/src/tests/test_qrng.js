/**
 * Test script for Query-based Random Number Generator (QRNG)
 */

// Mock embedding vector
const mockEmbedding = [0.1, 0.2, -0.3, 0.4, -0.5, 0.6, -0.7, 0.8];

// Import the function we want to test
const { getRandomNumberFromEmbedding } = require('../services/qrng');

// Test the embedding-based random number generation
function testEmbeddingRandomness() {
  console.log('Testing embedding-based randomness...');
  
  // Generate a random number using the mock embedding
  const randomNumber = getRandomNumberFromEmbedding(mockEmbedding);
  console.log(`Selected hymn number: ${randomNumber}`);
  
  // Verify the result is within expected range
  if (randomNumber >= 0 && randomNumber < 88) {
    console.log('✅ Random number is within expected range (0-87)');
  } else {
    console.error('❌ Random number out of expected range:', randomNumber);
  }
  
  // Verify determinism (same input should produce same output)
  const secondRun = getRandomNumberFromEmbedding(mockEmbedding);
  if (randomNumber === secondRun) {
    console.log('✅ Function is deterministic for the same input (without temporal elements)');
  } else {
    console.error('❌ Function is not deterministic:', randomNumber, secondRun);
  }
  
  // Test with a slightly different embedding
  const alteredEmbedding = [...mockEmbedding];
  alteredEmbedding[3] += 0.01; // Small change
  const alteredResult = getRandomNumberFromEmbedding(alteredEmbedding);
  console.log(`Altered embedding produces: ${alteredResult}`);
  
  // Demonstrate temporal influence (run this twice to see different results)
  console.log('Running with temporal elements...');
  setTimeout(() => {
    const temporalResult = getRandomNumberFromEmbedding(mockEmbedding);
    console.log(`Result with temporal influence: ${temporalResult}`);
  }, 1000);
}

// Run the tests
testEmbeddingRandomness(); 