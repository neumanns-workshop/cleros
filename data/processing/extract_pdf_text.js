const fs = require('fs');
const pdfParse = require('pdf-parse');

async function extractPdfText(pdfPath, outputPath) {
    try {
        // Read the PDF file
        const dataBuffer = fs.readFileSync(pdfPath);
        
        // Parse the PDF
        const data = await pdfParse(dataBuffer);
        
        // Write the text to the output file
        fs.writeFileSync(outputPath, data.text, 'utf8');
        
        console.log(`Text extraction complete! Output saved to: ${outputPath}`);
        console.log(`Number of pages: ${data.numpages}`);
        
    } catch (error) {
        console.error('An error occurred:', error.message);
    }
}

// Define input and output paths
const pdfPath = 'sources/orphic_hymns.pdf';
const outputPath = 'sources/orphic_hymns.txt';

// Extract text from PDF
extractPdfText(pdfPath, outputPath); 