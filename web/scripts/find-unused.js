#!/usr/bin/env node

/**
 * This script helps identify potentially unused files in your React project.
 * It's not 100% accurate but provides a good starting point for cleanup.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Directories to scan
const SRC_DIR = path.resolve(__dirname, '../src');
const IGNORE_DIRS = ['node_modules', 'build', 'public'];
const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.css', '.scss', '.json'];

// Get all source files
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (!IGNORE_DIRS.includes(file)) {
        getAllFiles(filePath, fileList);
      }
    } else if (EXTENSIONS.includes(path.extname(file))) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Find potential unused files
function findUnusedFiles() {
  const allFiles = getAllFiles(SRC_DIR);
  console.log(`Found ${allFiles.length} files to check`);
  
  const potentiallyUnused = [];
  
  allFiles.forEach(file => {
    const relativePath = path.relative(process.cwd(), file);
    const fileName = path.basename(file);
    
    // Skip index files and test files
    if (fileName === 'index.ts' || fileName === 'index.tsx' || fileName.includes('.test.') || fileName.includes('.spec.')) {
      return;
    }
    
    try {
      // Use grep to find imports of this file
      const grepCommand = `grep -r --include="*.{js,jsx,ts,tsx}" "${fileName.split('.')[0]}" "${SRC_DIR}" | grep -v "${relativePath}"`;
      const result = execSync(grepCommand, { stdio: 'pipe' }).toString();
      
      if (!result) {
        potentiallyUnused.push(relativePath);
      }
    } catch (error) {
      // grep returns non-zero exit code if no matches found
      potentiallyUnused.push(relativePath);
    }
  });
  
  return potentiallyUnused;
}

// Main execution
console.log('Scanning for potentially unused files...');
const unusedFiles = findUnusedFiles();

if (unusedFiles.length > 0) {
  console.log('\nPotentially unused files:');
  unusedFiles.forEach(file => console.log(`- ${file}`));
  console.log(`\nFound ${unusedFiles.length} potentially unused files.`);
  console.log('Note: This is not 100% accurate. Please verify before deleting.');
} else {
  console.log('No potentially unused files found!');
} 