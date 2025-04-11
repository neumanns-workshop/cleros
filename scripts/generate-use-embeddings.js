import * as fs from 'fs'; // Use ES Module import
import * as path from 'path'; // Use ES Module import
import { fileURLToPath } from 'url'; // Needed for __dirname equivalent
import * as tf from '@tensorflow/tfjs-node'; // Use ES Module import
// Import USE as a default import since it's a CommonJS module
import useModule from '@tensorflow-models/universal-sentence-encoder';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * PATCH for TensorFlow.js Node.js compatibility issue
 * 
 * In newer versions of Node.js, the util.isNullOrUndefined function was removed,
 * but TensorFlow.js Node.js backend still relies on it. This patch adds the 
 * missing function directly into the backend file.
 */
try {
  // Search for the backend file in common node_modules locations
  const possiblePaths = [
    path.join(__dirname, 'node_modules/@tensorflow/tfjs-node/dist/nodejs_kernel_backend.js'),
    path.join(__dirname, '../node_modules/@tensorflow/tfjs-node/dist/nodejs_kernel_backend.js')
  ];
  
  let backendPath = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      backendPath = p;
      break;
    }
  }
  
  if (backendPath) {
    console.log("Checking for TensorFlow.js Node.js backend patch at:", backendPath);
    let code = fs.readFileSync(backendPath, 'utf8');
    
    // Only apply patch if it seems like it's needed
    if (code.includes('util_1.isNullOrUndefined') && !code.includes('function isNullOrUndefined')) {
      console.log("Applying isNullOrUndefined patch...");
      // Prepend the missing function
      const patchedCode = 'function isNullOrUndefined(value) { return value === null || value === undefined; }\n' + code;
      // Replace all occurrences
      const finalCode = patchedCode.replace(/util_1\.isNullOrUndefined/g, 'isNullOrUndefined');
      
      fs.writeFileSync(backendPath, finalCode, 'utf8');
      console.log("Patch applied successfully");
    } else {
      console.log("Patch not needed or already applied");
    }
  } else {
    console.warn("Could not find TensorFlow.js Node.js backend file to patch");
    console.warn("You may need to run this script from the project root or install @tensorflow/tfjs-node");
  }
} catch (err) {
  console.warn("Couldn't apply patch:", err);
  console.warn("You may need to manually add isNullOrUndefined function to the nodejs_kernel_backend.js file");
  console.warn("Command: echo 'function isNullOrUndefined(value) { return value === null || value === undefined; }' > temp_patch.js && cat node_modules/@tensorflow/tfjs-node/dist/nodejs_kernel_backend.js >> temp_patch.js && sed -i '' 's/util_1\\.isNullOrUndefined/isNullOrUndefined/g' temp_patch.js && mv temp_patch.js node_modules/@tensorflow/tfjs-node/dist/nodejs_kernel_backend.js");
}

// --- Configuration ---
const INPUT_FILE = path.join(__dirname, '../web/public/data/hymns.json');
const OUTPUT_DIR = path.join(__dirname, '../web/public/data');
const MODEL_NAME = 'universal-sentence-encoder/1.3.3'; // For metadata
const EMBEDDING_DIMENSION = 512;
const CONTEXT_WORDS = 5; // Words before/after span for context

// --- Helper Functions ---

// Generates a unique ID for a sentence based on hymn ID and index
function getSentenceId(hymnId, sentenceIndex) {
    return `${hymnId}-s${sentenceIndex}`;
}

// Generates a unique ID for a span based on hymn ID, sentence index, and start char
function getSpanId(hymnId, sentenceIndex, startChar) {
    return `${hymnId}-s${sentenceIndex}-${startChar}`;
}

// Extracts context around a span
function getContext(fullSentenceText, spanStart, spanEnd) {
    const words = fullSentenceText.split(/\s+/);
    const sentenceUpToSpan = fullSentenceText.substring(0, spanStart);
    const wordsBefore = sentenceUpToSpan.split(/\s+/).filter(w => w.length > 0);
    const wordsAfter = fullSentenceText.substring(spanEnd).split(/\s+/).filter(w => w.length > 0);

    const contextBefore = wordsBefore.slice(-CONTEXT_WORDS).join(' ');
    const contextAfter = wordsAfter.slice(0, CONTEXT_WORDS).join(' ');
    const spanText = fullSentenceText.substring(spanStart, spanEnd);

    return `${contextBefore} [${spanText}] ${contextAfter}`.trim();
}

// Function to process hymns data and extract sentences and spans
function extractData(hymnsData) {
    const sentences = {}; // { sentenceId: { text: '...', hymnId: '...' } }
    const spansByCategory = {}; // { category: { spanId: { text: '...', category: '...', hymnId: '...', sentenceIndex: ..., confidence: '...', start_char: ..., end_char: ... } } }
    const contexts = {}; // { category: { spanId: { context: '...', full_sentence: '...' } } }

    for (const hymn of hymnsData.hymns) {
        const hymnId = hymn.id;
        for (const sentence of hymn.sentences) {
            const sentenceIndex = sentence.index;
            const sentenceId = getSentenceId(hymnId, sentenceIndex);
            const sentenceText = sentence.text;

            sentences[sentenceId] = { text: sentenceText, hymnId: hymnId };

            for (const span of sentence.spans) {
                const category = span.category;
                const spanId = getSpanId(hymnId, sentenceIndex, span.start_char);

                if (!spansByCategory[category]) {
                    spansByCategory[category] = {};
                    contexts[category] = {};
                }

                spansByCategory[category][spanId] = {
                    text: span.text,
                    category: category,
                    hymn_id: hymnId,
                    sentence_index: sentenceIndex,
                    confidence: span.confidence,
                    start_char: span.start_char, // Keep original info if needed
                    end_char: span.end_char,     // Keep original info if needed
                };

                contexts[category][spanId] = {
                    context: getContext(sentenceText, span.start_char, span.end_char),
                    full_sentence: sentenceText,
                };
            }
        }
    }
    return { sentences, spansByCategory, contexts };
}

// Function to generate embeddings in batches
async function generateEmbeddings(model, texts) {
    console.log(`  Generating embeddings for ${texts.length} items...`);
    
    // Use a smaller batch size to avoid OOM errors
    const BATCH_SIZE = 100;
    const batches = [];
    
    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
        console.log(`  Processing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(texts.length/BATCH_SIZE)}`);
        const batch = texts.slice(i, i + BATCH_SIZE);
        const embeddingsTensor = await model.embed(batch);
        const embeddings = await embeddingsTensor.array();
        batches.push(...embeddings);
        
        // Force garbage collection
        embeddingsTensor.dispose();
        tf.dispose();
    }
    
    console.log(`  All embeddings generated.`);
    return batches;
}

// --- Main Execution ---
async function main() {
    console.log(`Reading input file: ${INPUT_FILE}`);
    const hymnsJson = fs.readFileSync(INPUT_FILE, 'utf-8');
    const hymnsData = JSON.parse(hymnsJson);
    console.log('Input data parsed.');

    console.log('Extracting sentences and spans...');
    const { sentences, spansByCategory, contexts } = extractData(hymnsData);
    console.log(`Found ${Object.keys(sentences).length} unique sentences.`);
    Object.keys(spansByCategory).forEach(cat => {
        console.log(`  Found ${Object.keys(spansByCategory[cat]).length} spans in category: ${cat}`);
    });

    console.log('Loading Universal Sentence Encoder model...');
    // Use the default export's load method
    const model = await useModule.load();
    console.log('Model loaded.');

    // --- Generate Sentence Embeddings ---
    console.log('Processing Sentences...');
    const sentenceIds = Object.keys(sentences);
    const sentenceTexts = sentenceIds.map(id => sentences[id].text);
    const sentenceEmbeddingsArray = await generateEmbeddings(model, sentenceTexts);

    const sentenceEmbeddingsOutput = {
        m: MODEL_NAME,
        d: EMBEDDING_DIMENSION,
        e: {},
    };
    sentenceIds.forEach((id, i) => {
        sentenceEmbeddingsOutput.e[id] = sentenceEmbeddingsArray[i];
    });

    const sentenceMetadataOutput = {
        sentences: {}, // Changed from README example for consistency? Or make it { id: text } ?
                         // Sticking closer to span format: { id: { text: '...' } }
    };
    sentenceIds.forEach(id => {
        sentenceMetadataOutput.sentences[id] = { text: sentences[id].text };
    });

    // --- Generate Span Embeddings (by category) ---
    console.log('Processing Spans by Category...');
    const spanEmbeddingsByCategory = {}; // { category: { m: ..., d: ..., e: { spanId: [...] } } }
    const spanMetadataByCategory = {}; // { category: { spans: { spanId: {...} }, contexts: { spanId: {...} } } }

    for (const category in spansByCategory) {
        console.log(` Processing category: ${category}`);
        const categorySpans = spansByCategory[category];
        const categoryContexts = contexts[category];
        const spanIds = Object.keys(categorySpans);
        const spanTexts = spanIds.map(id => categorySpans[id].text);

        if (spanTexts.length === 0) {
            console.log(`  Skipping empty category: ${category}`);
            continue;
        }

        const spanEmbeddingsArray = await generateEmbeddings(model, spanTexts);

        spanEmbeddingsByCategory[category] = {
            m: MODEL_NAME,
            d: EMBEDDING_DIMENSION,
            e: {},
        };
        spanIds.forEach((id, i) => {
            spanEmbeddingsByCategory[category].e[id] = spanEmbeddingsArray[i];
        });

        spanMetadataByCategory[category] = {
            spans: categorySpans,
            contexts: categoryContexts,
        };
    }

    // --- Write Output Files ---
    console.log('Writing output files...');

    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        console.log(`Created output directory: ${OUTPUT_DIR}`);
    }

    // MODIFIED: Write sentence files as plain JSON
    const sentenceEmbeddingsPath = path.join(OUTPUT_DIR, 'sentence_embeddings.json');
    fs.writeFileSync(sentenceEmbeddingsPath, JSON.stringify(sentenceEmbeddingsOutput)); // No indent for smaller embeddings file
    console.log(` Wrote: ${path.basename(sentenceEmbeddingsPath)}`);

    const sentenceMetadataPath = path.join(OUTPUT_DIR, 'sentence_metadata.json');
    fs.writeFileSync(sentenceMetadataPath, JSON.stringify(sentenceMetadataOutput, null, 2)); // Indented for readability
    console.log(` Wrote: ${path.basename(sentenceMetadataPath)}`);

    // MODIFIED: Write span files as plain JSON
    for (const category in spanEmbeddingsByCategory) {
        const spanEmbeddings = spanEmbeddingsByCategory[category];
        const spanMetadata = spanMetadataByCategory[category];

        const spanEmbeddingsPath = path.join(OUTPUT_DIR, `span_embeddings_${category}.json`);
        fs.writeFileSync(spanEmbeddingsPath, JSON.stringify(spanEmbeddings)); // No indent
        console.log(` Wrote: ${path.basename(spanEmbeddingsPath)}`);

        const spanMetadataPath = path.join(OUTPUT_DIR, `span_metadata_${category}.json`);
        fs.writeFileSync(spanMetadataPath, JSON.stringify(spanMetadata, null, 2)); // Indented
        console.log(` Wrote: ${path.basename(spanMetadataPath)}`);
    }

    console.log('Embedding generation complete.');
}

main().catch(error => {
    console.error("Script failed:", error);
    process.exit(1);
}); 