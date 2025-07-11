import { Router } from 'express';
import { NetballConnectScraper } from './fixture-scraper-simple.js';

const router = Router();

// Preview fixtures from URL without importing
router.post('/api/fixtures/preview', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const scraper = new NetballConnectScraper();

  try {
    const fixtures = await scraper.scrapeFixtures(url);
    res.json({ fixtures, count: fixtures.length });
  } catch (error) {
    console.error('Error previewing fixtures:', error);

    let errorMessage = 'Failed to scrape fixtures';
    let details = error instanceof Error ? error.message : 'Unknown error';

    // Provide helpful error context
    if (details.includes('HTTP')) {
      errorMessage = 'Failed to fetch webpage';
      details = 'Could not access the NetballConnect page. Please check the URL is correct and accessible.';
    }

    res.status(500).json({ 
      error: errorMessage,
      details: details
    });
  } finally {
    await scraper.close();
  }
});

// Import fixtures into database
router.post('/api/fixtures/import', async (req, res) => {
  const { url, clubId, seasonId } = req.body;

  if (!url || !clubId || !seasonId) {
    return res.status(400).json({ 
      error: 'URL, clubId, and seasonId are required' 
    });
  }

  const scraper = new NetballConnectScraper();

  try {
    const results = await scraper.importFixtures(url, clubId, seasonId);
    res.json(results);
  } catch (error) {
    console.error('Error importing fixtures:', error);
    res.status(500).json({ 
      error: 'Failed to import fixtures',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    await scraper.close();
  }
});

export { router as fixtureScraperRoutes };