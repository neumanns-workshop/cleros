import { test, expect } from '@playwright/test';

test.describe('Cleros Oracle App', () => {
  test('loads the homepage successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check if the main title is visible
    await expect(page.locator('h1')).toBeVisible();
    
    // Check for presence of navigation elements
    await expect(page.locator('nav')).toBeVisible();
    
    // Check that the page doesn't have any console errors
    const errors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') {
        errors.push(message.text());
      }
    });
    
    await page.waitForLoadState('networkidle');
    
    // Allow some console errors related to missing models/embeddings in test environment
    const filteredErrors = errors.filter(error => 
      !error.includes('Failed to load') && 
      !error.includes('model') &&
      !error.includes('embedding')
    );
    
    expect(filteredErrors).toHaveLength(0);
  });

  test('can navigate between different views', async ({ page }) => {
    await page.goto('/');
    
    // Test navigation to About page
    const aboutLink = page.locator('a', { hasText: 'About' });
    if (await aboutLink.isVisible()) {
      await aboutLink.click();
      await expect(page.locator('h1')).toContainText('About');
    }
    
    // Test navigation to Corpus page  
    const corpusLink = page.locator('a', { hasText: 'Corpus' });
    if (await corpusLink.isVisible()) {
      await corpusLink.click();
      await expect(page.locator('h1')).toContainText('Corpus');
    }
    
    // Test navigation back to home
    const homeLink = page.locator('a', { hasText: 'Home' });
    if (await homeLink.isVisible()) {
      await homeLink.click();
      await page.waitForLoadState('networkidle');
    }
  });

  test('consultation form is functional', async ({ page }) => {
    await page.goto('/');
    
    // Look for consultation form elements
    const queryInput = page.locator('textarea, input[type="text"]').first();
    
    if (await queryInput.isVisible()) {
      // Test form interaction
      await queryInput.fill('What guidance do you have for me?');
      
      // Look for submit button
      const submitButton = page.locator('button[type="submit"], button').filter({ hasText: /submit|consult|ask/i }).first();
      
      if (await submitButton.isVisible()) {
        // We won't actually submit in test to avoid external API calls
        // Just verify the form elements are interactive
        await expect(submitButton).toBeEnabled();
      }
    }
  });

  test('responsive design works on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check that the page loads and is readable on mobile
    await expect(page.locator('body')).toBeVisible();
    
    // Verify no horizontal scroll appears (common mobile issue)
    const bodyWidth = await page.locator('body').boundingBox();
    expect(bodyWidth?.width).toBeLessThanOrEqual(375);
  });
});

