#!/usr/bin/env node

/**
 * This script analyzes your bundle for potential optimizations.
 * It checks for large dependencies and suggests alternatives or optimizations.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Build the project first if needed
console.log('Checking if build exists...');
const buildDir = path.resolve(__dirname, '../build');
if (!fs.existsSync(buildDir) || !fs.existsSync(path.join(buildDir, 'static/js'))) {
  console.log('No build found. Building project first...');
  execSync('npm run build', { stdio: 'inherit' });
}

// Run source-map-explorer
console.log('\n📊 Running source-map-explorer...');
execSync('npx source-map-explorer "build/static/js/*.js" --html bundle-analysis.html', { 
  stdio: 'inherit',
  cwd: path.resolve(__dirname, '..') 
});

// Check dependencies
console.log('\n📦 Checking dependencies...');
const packageJson = require('../package.json');
const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

// Known large packages that might have alternatives
const largePackages = {
  'moment': 'Consider using date-fns or dayjs which are much smaller',
  'lodash': 'Consider importing only the specific lodash functions you need',
  '@tensorflow/tfjs': 'Consider loading TensorFlow dynamically only when needed',
  '@tensorflow/tfjs-node': 'This package is for Node.js. For browser use only @tensorflow/tfjs',
  'chart.js': 'Consider a lighter alternative like lightweight-charts if appropriate',
  'jquery': 'Modern React apps rarely need jQuery'
};

console.log('Potential optimizations:');
let foundIssues = false;

Object.keys(dependencies).forEach(dep => {
  if (largePackages[dep]) {
    console.log(`⚠️  ${dep}: ${largePackages[dep]}`);
    foundIssues = true;
  }
});

// Check for unused dependencies
console.log('\n🔍 Checking for unused dependencies...');
try {
  execSync('npx depcheck', { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });
} catch (error) {
  console.log('Error running depcheck, you may need to install it: npm install -g depcheck');
}

// Print summary
console.log('\n✅ Bundle analysis complete!');
console.log(`Bundle report saved to: ${path.resolve(__dirname, '../bundle-analysis.html')}`);
if (foundIssues) {
  console.log('👆 Some potential optimizations were found. Review the suggestions above.');
} else {
  console.log('🎉 No obvious optimizations found. Your bundle looks good!');
} 