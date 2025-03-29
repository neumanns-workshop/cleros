/**
 * Generate embeddings for hymns using TensorFlow.js Universal Sentence Encoder
 * This ensures compatibility with browser-based embeddings
 */

const fs = require('fs');
const path = require('path');
const tf = require('@tensorflow/tfjs-node');
const use = require('@tensorflow-models/universal-sentence-encoder');

// Configuration
const BASE_DIR = path.join(__dirname, '../../web/public/data/base');
const OUTPUT_DIR = path.join(__dirname, '../../web/public/data/enriched/embeddings');

async function loadHymnData() {
    try {
        const hymns = {};
        const files = fs.readdirSync(BASE_DIR);
        
        for (const file of files) {
            if (file.startsWith('hymn_') && file.endsWith('.json')) {
                try {
                    const content = fs.readFileSync(path.join(BASE_DIR, file), 'utf-8');
                    const hymnData = JSON.parse(content);
                    hymns[hymnData.hymn_id] = hymnData;
                } catch (fileError) {
                    console.error(`Error reading file ${file}:`, fileError);
                }
            }
        }
        
        return hymns;
    } catch (error) {
        console.error('Error loading hymn data:', error);
        throw error;
    }
}

async function generateEmbeddings(hymns) {
    try {
        console.log('Loading Universal Sentence Encoder model...');
        const model = await use.load();
        console.log('Model loaded successfully');
        
        const sentenceEmbeddings = {};
        let totalLines = 0;
        
        console.log(`Processing ${Object.keys(hymns).length} hymns...`);
        
        for (const [hymnId, hymnData] of Object.entries(hymns)) {
            console.log(`Processing hymn ${hymnId}...`);
            
            try {
                // Process individual lines
                sentenceEmbeddings[hymnId] = {};
                
                // Process each line individually to avoid batch processing issues
                for (let lineIndex = 0; lineIndex < hymnData.lines.length; lineIndex++) {
                    const text = hymnData.lines[lineIndex];
                    console.log(`  Line ${lineIndex}: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`);
                    
                    // Process a single line at a time to avoid potential batch issues
                    try {
                        const lineEmbedding = await model.embed([text]);
                        const lineEmbeddingArray = await lineEmbedding.array();
                        
                        sentenceEmbeddings[hymnId][lineIndex.toString()] = {
                            text: text,
                            embedding: Array.from(lineEmbeddingArray[0])
                        };
                        
                        totalLines++;
                    } catch (lineError) {
                        console.error(`    Error embedding line ${lineIndex}:`, lineError);
                        // Skip this line but continue with others
                    }
                }
            } catch (hymnError) {
                console.error(`Error processing hymn ${hymnId}:`, hymnError);
                // Skip this hymn but continue with others
            }
        }
        
        // Generate and save metadata
        const firstHymnId = Object.keys(sentenceEmbeddings)[0];
        const firstLineId = Object.keys(sentenceEmbeddings[firstHymnId])[0];
        const embeddingDimension = sentenceEmbeddings[firstHymnId][firstLineId].embedding.length;
        
        const metadata = {
            model_name: 'tensorflow/universal-sentence-encoder',
            embedding_dimension: embeddingDimension,
            total_hymns: Object.keys(sentenceEmbeddings).length,
            total_sentences: totalLines,
            generated_at: new Date().toISOString()
        };
        
        return { sentenceEmbeddings, metadata };
    } catch (error) {
        console.error('Error generating embeddings:', error);
        throw error;
    }
}

async function main() {
    try {
        console.log('TensorFlow.js version:', tf.version);
        console.log('Universal Sentence Encoder version:', use.version || 'unknown');
        
        // Clear TensorFlow.js memory/cache
        console.log('Clearing TensorFlow.js memory...');
        tf.engine().startScope();
        tf.engine().endScope();
        tf.engine().disposeVariables();
        
        console.log('Loading hymn data...');
        const hymns = await loadHymnData();
        
        console.log('Generating embeddings...');
        const { sentenceEmbeddings, metadata } = await generateEmbeddings(hymns);
        
        console.log('Saving embeddings...');
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        
        // Backup original embeddings
        const originalEmbeddingsPath = path.join(OUTPUT_DIR, 'sentence_embeddings.json');
        if (fs.existsSync(originalEmbeddingsPath)) {
            const backupPath = path.join(OUTPUT_DIR, `sentence_embeddings.backup-${Date.now()}.json`);
            fs.copyFileSync(originalEmbeddingsPath, backupPath);
            console.log(`Original embeddings backed up to: ${backupPath}`);
        }
        
        // Save new embeddings
        fs.writeFileSync(
            path.join(OUTPUT_DIR, 'sentence_embeddings.json'),
            JSON.stringify(sentenceEmbeddings, null, 2)
        );
        
        // Save metadata
        fs.writeFileSync(
            path.join(OUTPUT_DIR, 'embeddings_metadata.json'),
            JSON.stringify(metadata, null, 2)
        );
        
        console.log('Done!');
        console.log(`Output saved to: ${OUTPUT_DIR}`);
        
        // Print statistics
        console.log('\nStatistics:');
        console.log(`Total hymns processed: ${metadata.total_hymns}`);
        console.log(`Total sentences embedded: ${metadata.total_sentences}`);
        console.log(`Embedding dimension: ${metadata.embedding_dimension}`);
        
    } catch (error) {
        console.error('Error generating embeddings:', error);
        process.exit(1);
    }
}

main(); 