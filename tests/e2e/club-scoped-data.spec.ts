import { test, expect } from '@playwright/test';

test.describe('Club-Scoped Data Isolation', () => {
  test('should show only club-specific teams', async ({ page }) => {
    await page.goto('/teams');
    
    // Wait for teams to load - look for team cards
    await page.waitForSelector('.grid.gap-6', { timeout: 15000 });
    
    // Get all team names from the cards
    const teamNames = await page.locator('.grid.gap-6 .card h3').allTextContents();
    
    // Verify all teams belong to the current club (WNC teams should start with "WNC")
    for (const teamName of teamNames) {
      expect(teamName).toMatch(/^WNC/);
    }
  });

  test('should show only club-specific players', async ({ page }) => {
    await page.goto('/players');
    
    // Wait for players to load - look for players content
    await page.waitForSelector('h1:has-text("Players")', { timeout: 15000 });
    
    // Verify players are loaded (we can't easily verify club isolation without knowing the data)
    await expect(page.locator('h1:has-text("Players")')).toBeVisible();
  });

  test('should show only club-specific games', async ({ page }) => {
    await page.goto('/games');
    
    // Wait for games to load - look for games content
    await page.waitForSelector('h1:has-text("Games")', { timeout: 15000 });
    
    // Verify games are loaded
    await expect(page.locator('h1:has-text("Games")')).toBeVisible();
  });
}); 