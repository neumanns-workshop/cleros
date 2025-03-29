const fs = require('fs');
const path = require('path');
const { pipeline } = require('@xenova/transformers');

// Configuration
const MODEL_NAME = 'Xenova/all-MiniLM-L6-v2'; // Lightweight but effective model
const BASE_DIR = path.join(__dirname, '../data/base');
const OUTPUT_DIR = path.join(__dirname, '../data/enriched/embeddings');

async function generateEmbeddings() {
    try {
        console.log('Loading model...');
        const embedder = await pipeline('feature-extraction', MODEL_NAME);
        
        console.log('Processing hymns...');
        const hymnEmbeddings = {};
        const sentenceEmbeddings = {};
        
        // Get all hymn files
        const hymnFiles = fs.readdirSync(BASE_DIR)
            .filter(f => f.startsWith('hymn_') && f.endsWith('.json'))
            .sort((a, b) => {
                const numA = parseInt(a.match(/\d+/)[0]);
                const numB = parseInt(b.match(/\d+/)[0]);
                return numA - numB;
            });
            
        let processedHymns = 0;
        for (const hymnFile of hymnFiles) {
            const hymnPath = path.join(BASE_DIR, hymnFile);
            const hymn = JSON.parse(fs.readFileSync(hymnPath, 'utf8'));
            const hymnId = hymn.hymn_id;
            
            // Combine all lines for hymn-level embedding
            const fullText = hymn.lines.join(' ');
            
            // Generate hymn-level embedding
            const hymnOutput = await embedder(fullText, {
                pooling: 'mean',
                normalize: true
            });
            hymnEmbeddings[hymnId] = Array.from(hymnOutput.data);
            
            // Generate sentence-level embeddings
            sentenceEmbeddings[hymnId] = {};
            
            // Each line is already a sentence
            for (const [lineIndex, sentence] of hymn.lines.entries()) {
                const sentenceOutput = await embedder(sentence, {
                    pooling: 'mean',
                    normalize: true
                });
                sentenceEmbeddings[hymnId][lineIndex] = {
                    text: sentence,
                    embedding: Array.from(sentenceOutput.data)
                };
            }
            
            processedHymns++;
            if (processedHymns % 10 === 0) {
                console.log(`Processed ${processedHymns} hymns...`);
            }
        }
        
        // Ensure output directory exists
        if (!fs.existsSync(OUTPUT_DIR)) {
            fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        }
        
        // Save embeddings
        console.log('Saving embeddings...');
        fs.writeFileSync(
            path.join(OUTPUT_DIR, 'hymn_embeddings.json'),
            JSON.stringify(hymnEmbeddings, null, 2)
        );
        fs.writeFileSync(
            path.join(OUTPUT_DIR, 'sentence_embeddings.json'),
            JSON.stringify(sentenceEmbeddings, null, 2)
        );
        
        // Generate and save metadata
        const metadata = {
            model_name: MODEL_NAME,
            embedding_dimension: hymnEmbeddings[Object.keys(hymnEmbeddings)[0]].length,
            total_hymns: Object.keys(hymnEmbeddings).length,
            total_sentences: Object.values(sentenceEmbeddings).reduce((total, hymn) => {
                return total + Object.keys(hymn).length;
            }, 0),
            generated_at: new Date().toISOString()
        };
        
        fs.writeFileSync(
            path.join(OUTPUT_DIR, 'embeddings_metadata.json'),
            JSON.stringify(metadata, null, 2)
        );
        
        console.log('Embeddings generated successfully!');
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

generateEmbeddings(); 