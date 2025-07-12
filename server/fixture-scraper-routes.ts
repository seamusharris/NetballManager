import { Request, Response } from 'express';
import { NetballConnectScraper } from './fixture-scraper.js';

export function registerFixtureScraperRoutes(app: any) {
  const scraper = new NetballConnectScraper();

  // Preview fixtures from a URL
  app.post('/api/fixtures/preview', async (req: Request, res: Response) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }

      console.log(`Fixture preview request for: ${url}`);
      
      const fixtures = await scraper.scrapeFixtures(url);
      
      res.json({
        success: true,
        fixtures: fixtures,
        count: fixtures.length,
        message: fixtures.length > 0 
          ? `Found ${fixtures.length} fixtures ready for import`
          : 'No fixtures found. NetballConnect pages may require manual data entry or CSV export.'
      });
      
    } catch (error) {
      console.error('Error previewing fixtures:', error);
      
      // Provide specific guidance for NetballConnect limitations
      if (error instanceof Error && error.message.includes('JavaScript execution')) {
        res.status(400).json({
          error: 'NetballConnect pages not supported',
          details: error.message,
          suggestions: [
            'Export fixtures as CSV from NetballConnect',
            'Use manual data entry for small fixture lists',
            'Contact your NetballConnect administrator for data export options'
          ]
        });
      } else {
        res.status(500).json({
          error: 'Failed to scrape fixtures',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });

  // Import fixtures (placeholder - would integrate with your existing game creation logic)
  app.post('/api/fixtures/import', async (req: Request, res: Response) => {
    try {
      const { fixtures } = req.body;
      
      if (!fixtures || !Array.isArray(fixtures)) {
        return res.status(400).json({ error: 'Fixtures array is required' });
      }

      // This would integrate with your existing game creation logic
      // For now, just return success
      res.json({
        success: true,
        imported: fixtures.length,
        message: `Successfully imported ${fixtures.length} fixtures`
      });
      
    } catch (error) {
      console.error('Error importing fixtures:', error);
      res.status(500).json({
        error: 'Failed to import fixtures',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}