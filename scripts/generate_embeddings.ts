import '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import * as fs from 'fs';
import * as path from 'path';

interface HymnData {
    hymn_id: string;
    title: string;
    lines: string[];
    line_mappings: Record<string, number>;
}

interface HymnLine {
    text: string;
    embedding: number[];
}

interface HymnEmbeddings {
    hymns: {
        [key: string]: {
            text: string;
            embedding: number[];
        };
    };
    lines: {
        [key: string]: {
            [lineIndex: string]: HymnLine;
        };
    };
}

async function loadHymnData(baseDir: string): Promise<Record<string, HymnData>> {
    const hymns: Record<string, HymnData> = {};
    const files = fs.readdirSync(baseDir);
    
    for (const file of files) {
        if (file.startsWith('hymn_') && file.endsWith('.json')) {
            const content = fs.readFileSync(path.join(baseDir, file), 'utf-8');
            const hymnData = JSON.parse(content);
            hymns[hymnData.hymn_id] = hymnData;
        }
    }
    
    return hymns;
}

async function generateEmbeddings(hymns: Record<string, HymnData>): Promise<HymnEmbeddings> {
    console.log('Loading Universal Sentence Encoder model...');
    const model = await use.load();
    
    const embeddings: HymnEmbeddings = {
        hymns: {},
        lines: {}
    };
    
    for (const [hymnId, hymnData] of Object.entries(hymns)) {
        console.log(`Processing hymn ${hymnId}...`);
        
        // Process the whole hymn
        const fullText = hymnData.lines.join(' ');
        const hymnEmbedding = await model.embed([fullText]);
        const hymnEmbeddingArray = await hymnEmbedding.array();
        
        embeddings.hymns[hymnId] = {
            text: fullText,
            embedding: hymnEmbeddingArray[0]
        };
        
        // Process individual lines
        embeddings.lines[hymnId] = {};
        const lineEmbeddings = await model.embed(hymnData.lines);
        const lineEmbeddingsArray = await lineEmbeddings.array();
        
        for (let i = 0; i < hymnData.lines.length; i++) {
            embeddings.lines[hymnId][i.toString()] = {
                text: hymnData.lines[i],
                embedding: lineEmbeddingsArray[i]
            };
        }
    }
    
    return embeddings;
}

async function main() {
    const baseDir = path.join(process.cwd(), 'web', 'public', 'data', 'base');
    const outputDir = path.join(process.cwd(), 'web', 'public', 'data', 'enriched', 'embeddings');
    
    console.log('Loading hymn data...');
    const hymns = await loadHymnData(baseDir);
    
    console.log('Generating embeddings...');
    const embeddings = await generateEmbeddings(hymns);
    
    console.log('Saving embeddings...');
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(
        path.join(outputDir, 'sentence_embeddings.json'),
        JSON.stringify(embeddings, null, 2)
    );
    
    console.log('Done!');
}

main().catch(console.error); 