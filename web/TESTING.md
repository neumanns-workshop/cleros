# Testing Guide

This document outlines the testing setup and practices for the Cleros Oracle project.

## Testing Stack

- **Unit Testing**: Vitest with React Testing Library
- **E2E Testing**: Playwright
- **Linting**: ESLint with TypeScript support
- **Type Checking**: TypeScript compiler

## Running Tests

### From the web directory:

```bash
# Run all checks
npm run lint           # ESLint
npm run type-check     # TypeScript checking
npm run test           # Unit tests
npm run test:e2e       # E2E tests

# Development
npm run lint:fix       # Auto-fix ESLint issues
npm run test:ui        # Unit tests with UI
npm run test:e2e:ui    # E2E tests with UI
npm run test:e2e:headed # E2E tests in headed mode
```

### From the project root:

```bash
# Run individual test suites
npm run lint
npm run type-check
npm run test
npm run test:e2e

# Run everything
npm run test:all
```

## E2E Test Structure

E2E tests are located in the `e2e/` directory and cover:

1. **Basic Navigation**: Homepage loading, navigation between views
2. **Oracle Functionality**: Corpus data, random oracle, embeddings integration
3. **Responsive Design**: Mobile viewport testing
4. **Form Interactions**: Consultation form functionality

### E2E Test Features

- **Flexible**: Tests adapt to UI changes and handle missing elements gracefully
- **Non-destructive**: Tests avoid making actual API calls or submitting forms
- **Cross-browser**: Tests run on Chromium, Firefox, and WebKit
- **CI-ready**: Configured for headless execution in GitHub Actions

## CI/CD Pipeline

The project uses GitHub Actions for continuous integration:

- **Linting**: ESLint checks for code quality
- **Type Checking**: TypeScript compilation validation
- **Unit Tests**: Vitest test suite
- **E2E Tests**: Playwright cross-browser testing
- **Build**: Production build validation

## Writing Tests

### Unit Tests
Place unit tests next to the components they test with `.test.ts` or `.test.tsx` extensions.

### E2E Tests
Add E2E tests to the `e2e/` directory with `.spec.ts` extension. Follow these patterns:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/');
    // Test implementation
  });
});
```

## Troubleshooting

### E2E Tests
- Tests are designed to be resilient to UI changes
- If elements are missing, tests will skip gracefully
- Check Playwright reports for detailed failure information

### Linting Issues
- Run `npm run lint:fix` to auto-fix most issues
- Some rules may need manual attention for complex cases

### Type Errors
- Ensure all dependencies are installed
- Check for missing type definitions
- Verify import paths are correct

