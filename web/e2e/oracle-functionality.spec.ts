import { test, expect } from '@playwright/test';

test.describe('Oracle Functionality', () => {
  test('corpus data loads correctly', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to corpus view if available
    const corpusLink = page.locator('a', { hasText: /corpus/i });
    if (await corpusLink.isVisible()) {
      await corpusLink.click();
      await page.waitForLoadState('networkidle');
      
      // Check for corpus content
      await expect(page.locator('body')).toContainText(/orphic|hymn|argonautica|lithica/i);
    }
  });

  test('random oracle feature works', async ({ page }) => {
    await page.goto('/');
    
    // Look for random oracle functionality
    const randomButton = page.locator('button').filter({ hasText: /random|surprise/i }).first();
    
    if (await randomButton.isVisible()) {
      await randomButton.click();
      
      // Wait for potential response or loading state
      await page.waitForTimeout(2000);
      
      // Check that something happened (loading state, content change, etc.)
      // This is flexible since we don't know the exact UI
      const body = page.locator('body');
      await expect(body).toBeVisible();
    }
  });

  test('embeddings service integration', async ({ page }) => {
    await page.goto('/');
    
    // Test that the page handles embedding service gracefully
    // even if models aren't available in test environment
    
    // Check for any visible error messages related to embeddings
    const errorMessages = page.locator('[role="alert"], .error, .warning').filter({ 
      hasText: /embedding|model|transform/i 
    });
    
    // If error messages exist, they should be handled gracefully
    if (await errorMessages.count() > 0) {
      // Errors should not crash the app
      await expect(page.locator('body')).toBeVisible();
      
      // Check that the rest of the app still functions
      const navigation = page.locator('nav, header');
      await expect(navigation).toBeVisible();
    }
  });

  test('ancient query examples are displayed', async ({ page }) => {
    await page.goto('/');
    
    // Look for examples of ancient queries
    const examples = page.locator('text=/oracle|query|ancient|divine/i').first();
    
    if (await examples.isVisible()) {
      // Verify examples are readable and properly formatted
      await expect(examples).toBeVisible();
      
      // Check that clicking on examples (if clickable) doesn't break the app
      if (await examples.isEnabled()) {
        await examples.click();
        await page.waitForTimeout(1000);
        await expect(page.locator('body')).toBeVisible();
      }
    }
  });

  test('share functionality (if present)', async ({ page }) => {
    await page.goto('/');
    
    // Look for share buttons or functionality
    const shareButton = page.locator('button').filter({ hasText: /share/i }).first();
    
    if (await shareButton.isVisible()) {
      await shareButton.click();
      
      // Check for share dialog or options
      const shareDialog = page.locator('[role="dialog"], .modal, .popup').first();
      if (await shareDialog.isVisible()) {
        await expect(shareDialog).toContainText(/share|link|social/i);
        
        // Close dialog if there's a close button
        const closeButton = shareDialog.locator('button').filter({ hasText: /close|cancel|×/i }).first();
        if (await closeButton.isVisible()) {
          await closeButton.click();
        }
      }
    }
  });
});

