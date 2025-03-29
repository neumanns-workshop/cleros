#!/usr/bin/env node

/**
 * Pre-deployment script that runs all checks to ensure code quality
 * before deploying to production.
 */

const { execSync } = require('child_process');
const chalk = require('chalk'); // You may need to npm install chalk

// Helper function to run a command and log its output
function runStep(name, command) {
  console.log(chalk.cyan(`\n📋 ${name}`));
  console.log(chalk.dim(`Running: ${command}`));
  console.log(chalk.dim('-------------------------------------------'));
  
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(chalk.green(`✅ ${name} completed successfully`));
    return true;
  } catch (error) {
    console.log(chalk.red(`❌ ${name} failed`));
    return false;
  }
}

// Main execution
console.log(chalk.bold('🚀 Starting pre-deployment checks\n'));

let success = true;

// Step 1: Lint code
success = runStep('Linting code', 'npm run lint') && success;

// Step 2: Run tests
success = runStep('Running tests', 'npm test -- --watchAll=false') && success;

// Step 3: Check for unused code
success = runStep('Checking for unused files', 'npm run find-unused') && success;

// Step 4: Analyze bundle
success = runStep('Analyzing bundle', 'npm run analyze:full') && success;

// Step 5: Build for production
if (success) {
  success = runStep('Building for production', 'npm run build:prod') && success;
}

// Final output
console.log('\n-------------------------------------------');
if (success) {
  console.log(chalk.bold.green('✅ All pre-deployment checks passed!'));
  console.log(chalk.green('Your application is ready for deployment.'));
} else {
  console.log(chalk.bold.red('❌ Some pre-deployment checks failed.'));
  console.log(chalk.yellow('Please fix the issues before deploying.'));
  process.exit(1);
} 