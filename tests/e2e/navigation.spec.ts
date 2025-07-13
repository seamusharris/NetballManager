import { test, expect } from '@playwright/test';

test.describe('Navigation and Core Functionality', () => {
  test('should load the application and show club switcher', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the app to load - look for the club switcher button
    await page.waitForSelector('button:has-text("Warrandyte Netball Club")', { timeout: 15000 });
    
    // Verify club switcher is visible
    await expect(page.locator('button:has-text("Warrandyte Netball Club")')).toBeVisible();
  });

  test('should navigate to teams page', async ({ page }) => {
    await page.goto('/teams');
    
    // Wait for teams to load - look for team cards
    await page.waitForSelector('.grid.gap-6', { timeout: 15000 });
    
    // Verify teams page loads by checking for team cards
    await expect(page.locator('.grid.gap-6')).toBeVisible();
  });

  test('should navigate to games page', async ({ page }) => {
    await page.goto('/games');
    
    // Wait for games to load - look for games content
    await page.waitForSelector('h1:has-text("Games")', { timeout: 15000 });
    
    // Verify games page loads
    await expect(page.locator('h1:has-text("Games")')).toBeVisible();
  });

  test('should navigate to players page', async ({ page }) => {
    await page.goto('/players');
    
    // Wait for players to load - look for players content
    await page.waitForSelector('h1:has-text("Players")', { timeout: 15000 });
    
    // Verify players page loads
    await expect(page.locator('h1:has-text("Players")')).toBeVisible();
  });
}); 