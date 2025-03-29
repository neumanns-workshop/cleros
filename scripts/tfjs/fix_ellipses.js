/**
 * Script to fix improperly broken ellipses in hymn files
 * This edits the source files directly
 */

const fs = require('fs');
const path = require('path');

// Configuration
const BASE_DIR = path.join(__dirname, '../../web/public/data/base');

// Process all hymn files
async function fixHymnFiles() {
    console.log('Fixing improperly broken ellipses in hymn files...');
    
    try {
        const files = fs.readdirSync(BASE_DIR);
        let modifiedFilesCount = 0;
        
        for (const file of files) {
            if (file.startsWith('hymn_') && file.endsWith('.json')) {
                try {
                    const filePath = path.join(BASE_DIR, file);
                    const content = fs.readFileSync(filePath, 'utf-8');
                    const hymnData = JSON.parse(content);
                    
                    // Store original lines for comparison
                    const originalLines = [...hymnData.lines];
                    const processedLines = [];
                    
                    // Process lines to fix broken ellipses
                    let i = 0;
                    while (i < originalLines.length) {
                        let currentLine = originalLines[i];
                        
                        // Check if this is the start of an improperly broken ellipsis
                        let j = i + 1;
                        let shouldMerge = false;
                        
                        // If current line ends with "." and next line is just "." or starts with ","
                        while (j < originalLines.length && 
                              ((currentLine.endsWith('.') && originalLines[j] === '.') ||
                               (currentLine.endsWith('.') && originalLines[j].startsWith(',')))) {
                            shouldMerge = true;
                            
                            // For single dot lines, add without space
                            if (originalLines[j] === '.') {
                                currentLine += '.';
                            }
                            // For comma continuation, join with the comma
                            else if (originalLines[j].startsWith(',')) {
                                currentLine += originalLines[j];
                            }
                            
                            j++;
                        }
                        
                        if (shouldMerge) {
                            processedLines.push(currentLine);
                            i = j; // Skip the merged lines
                        } else {
                            processedLines.push(currentLine);
                            i++;
                        }
                    }
                    
                    // Only update file if lines were changed
                    if (processedLines.length !== originalLines.length) {
                        console.log(`Fixing hymn ${hymnData.hymn_id}: Reduced from ${originalLines.length} to ${processedLines.length} lines`);
                        
                        // Create backup of original file
                        const backupPath = path.join(BASE_DIR, `${file}.backup-${Date.now()}`);
                        fs.writeFileSync(backupPath, content);
                        console.log(`Created backup at ${backupPath}`);
                        
                        // Update the hymn data with fixed lines
                        hymnData.lines = processedLines;
                        
                        // Restructure line_mappings if needed
                        // Note: This is complex and may require manual adjustment
                        console.log(`Warning: Line mappings for hymn ${hymnData.hymn_id} may need to be updated manually`);
                        
                        // Write updated file
                        fs.writeFileSync(filePath, JSON.stringify(hymnData, null, 2));
                        console.log(`Updated ${file}`);
                        
                        modifiedFilesCount++;
                    }
                } catch (fileError) {
                    console.error(`Error processing file ${file}:`, fileError);
                }
            }
        }
        
        console.log(`\nCompleted processing. Modified ${modifiedFilesCount} files.`);
        
    } catch (error) {
        console.error('Error fixing hymn files:', error);
    }
}

// Run the script
fixHymnFiles(); 