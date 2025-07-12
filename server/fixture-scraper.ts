import * as cheerio from 'cheerio';
import fetch from 'node-fetch';

export interface ScrapedFixture {
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  venue: string;
  round: string;
}

export class NetballConnectScraper {
  private isNetballConnectUrl(url: string): boolean {
    return url.includes('netballconnect.com') || url.includes('netball.com.au');
  }

  async scrapeFixtures(url: string): Promise<ScrapedFixture[]> {
    try {
      console.log(`Scraping fixtures from: ${url}`);
      
      // Check if this is a NetballConnect URL
      if (this.isNetballConnectUrl(url)) {
        console.log('NetballConnect URL detected - attempting to fetch content...');
        
        // Try basic HTTP fetch first
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const html = await response.text();
        console.log(`Successfully fetched ${html.length} characters of HTML`);
        
        // Check if this appears to be JavaScript-rendered content
        if (this.isJavaScriptRendered(html)) {
          throw new Error('NetballConnect pages require JavaScript execution which is not supported in this environment. Please use alternative data import methods such as CSV export from NetballConnect or manual data entry.');
        }

        // Parse HTML for fixtures
        return this.parseHtmlForFixtures(html);
      } else {
        // For non-NetballConnect URLs, use basic scraping
        const response = await fetch(url);
        const html = await response.text();
        return this.parseHtmlForFixtures(html);
      }
      
    } catch (error) {
      console.error('Error in scrapeFixtures:', error);
      throw new Error(`Failed to scrape fixtures: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private isJavaScriptRendered(html: string): boolean {
    // Check for signs that this is a JavaScript-rendered page
    const indicators = [
      'Loading...',
      'Please wait',
      'javascript:void(0)',
      'noscript',
      'document.write',
      'angular',
      'react',
      'vue',
      'Loading fixtures',
      'Please enable JavaScript'
    ];
    
    const lowerHtml = html.toLowerCase();
    return indicators.some(indicator => lowerHtml.includes(indicator.toLowerCase())) ||
           html.length < 1000; // Very small HTML likely indicates JS-rendered content
  }

  private parseHtmlForFixtures(html: string): ScrapedFixture[] {
    try {
      const $ = cheerio.load(html);
      const fixtures: ScrapedFixture[] = [];

      // Basic fixture parsing - look for common patterns
      console.log('Parsing HTML for fixture data...');
      
      // Common selectors for fixture tables
      const fixtureSelectors = [
        'table tr',
        '.fixture-row',
        '.game-row',
        '.match-row',
        '[class*="fixture"]',
        '[class*="game"]',
        '[class*="match"]'
      ];

      for (const selector of fixtureSelectors) {
        const elements = $(selector);
        if (elements.length > 0) {
          console.log(`Found ${elements.length} elements with selector: ${selector}`);
          
          elements.each((index, element) => {
            const text = $(element).text().trim();
            if (text.length > 20) { // Only process substantial text
              const fixture = this.extractFixtureFromText(text);
              if (fixture && !this.isDuplicateFixture(fixtures, fixture)) {
                fixtures.push(fixture);
              }
            }
          });
        }
      }

      console.log(`Parsed ${fixtures.length} fixtures from HTML`);
      return fixtures;
      
    } catch (error) {
      console.error('Error parsing HTML:', error);
      throw new Error('Failed to parse fixture data from HTML');
    }
  }

  private extractFixtureFromText(text: string): ScrapedFixture | null {
    // Simple text patterns for fixture extraction
    const patterns = [
      /(\w+\s+\w*)\s+vs?\s+(\w+\s+\w*)\s+(\d{1,2}\/\d{1,2}\/\d{2,4})\s+(\d{1,2}:\d{2})/i,
      /(\w+)\s+v\s+(\w+)\s+(\d{1,2}\/\d{1,2})\s+(\d{1,2}:\d{2})/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return {
          homeTeam: match[1].trim(),
          awayTeam: match[2].trim(),
          date: match[3].trim(),
          time: match[4].trim(),
          venue: '',
          round: ''
        };
      }
    }

    return null;
  }

  private isDuplicateFixture(fixtures: ScrapedFixture[], newFixture: ScrapedFixture): boolean {
    return fixtures.some(f => 
      f.homeTeam === newFixture.homeTeam && 
      f.awayTeam === newFixture.awayTeam &&
      f.date === newFixture.date
    );
  }
}