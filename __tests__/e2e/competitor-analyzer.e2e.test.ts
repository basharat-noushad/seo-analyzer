import { test, expect } from '@playwright/test';

test.describe('Competitor Analyzer E2E', () => {
  test('should analyze a URL and display results', async ({ page }) => {
    // Navigate to the page
    await page.goto('http://localhost:3000/competitor-analyzer');

    // Fill in the competitor URL
    await page.fill('input[id="competitorUrl"]', 'https://www.google.com');

    // Click the analyze button
    await page.click('button[type="submit"]');

    // Wait for the results to appear
    await page.waitForSelector('#results');

    // Expect the results to be visible
    await expect(page.locator('#results')).toBeVisible();

    // Take a screenshot
    await page.screenshot({ path: 'screenshot.png' });
  });
});
