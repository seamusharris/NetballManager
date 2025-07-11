import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import puppeteer from 'puppeteer';
import { db } from './db';
import { sql } from 'drizzle-orm';

export interface ScrapedFixture {
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  venue?: string;
  round?: string;
}

export interface ImportResult {
  success: boolean;
  message: string;
  imported: number;
  skipped: number;
  errors: string[];
}

export class NetballConnectScraper {
  private browser: any = null;
  private page: any = null;

  constructor() {
    console.log('NetballConnectScraper: Using HTTP fetch for static HTML content');
  }

  async close() {
    if (this.page) {
      await this.page.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
  }

  async scrapeFixtures(url: string): Promise<ScrapedFixture[]> {
    try {
      console.log(`Scraping fixtures from: ${url}`);

      // Try with regular fetch first
      const fixtures = await this.scrapeWithFetch(url);
      
      if (fixtures.length === 0) {
        console.log('No fixtures found with HTTP fetch. JavaScript-rendered content detected.');
        console.log('Note: NetballConnect pages may require JavaScript to load fixture data.');
        console.log('For best results, consider using the fixture data from the page source or API endpoints.');
        
        // Return empty result with informative message instead of failing
        return [];
      }
      
      return fixtures;
    } catch (error) {
      console.error('Scraping error:', error);
      throw new Error(`Failed to scrape fixtures: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async scrapeWithFetch(url: string): Promise<ScrapedFixture[]> {
    console.log(`Fetching HTML from: ${url}`);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    console.log(`Successfully fetched ${html.length} characters of HTML`);
    
    return this.parseHtmlForFixtures(html);
  }

  private parseHtmlForFixtures(html: string): ScrapedFixture[] {
    const $ = cheerio.load(html);
    const fixtures: ScrapedFixture[] = [];

    console.log('Parsing HTML for fixtures...');
    
    // Look for common fixture patterns in tables
    $('table tr').each((index, row) => {
      const $row = $(row);
      const cells = $row.find('td, th');
      
      if (cells.length >= 2) {
        const cellTexts = cells.map((i, cell) => $(cell).text().trim()).get();
        const rowText = cellTexts.join(' | ');
        
        // Look for team vs team patterns
        const vsPattern = /(.+?)\s+(?:v\s+|vs\s+|V\s+|versus\s+)(.+?)(?:\s|$)/i;
        const match = rowText.match(vsPattern);
        
        if (match && match[1] && match[2]) {
          const homeTeam = match[1].trim();
          const awayTeam = match[2].trim();
          
          // Basic validation
          if (homeTeam.length > 1 && awayTeam.length > 1 && 
              homeTeam !== awayTeam && 
              !homeTeam.includes('Date') && !homeTeam.includes('Time') &&
              !awayTeam.includes('Date') && !awayTeam.includes('Time')) {
            
            // Extract additional info
            const dateMatch = rowText.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
            const timeMatch = rowText.match(/(\d{1,2}:\d{2}(?:\s*[AP]M)?)/i);
            const roundMatch = rowText.match(/(?:Round|Week|Game)\s*(\d+)/i);
            
            const fixture = {
              homeTeam,
              awayTeam,
              date: dateMatch ? dateMatch[1] : '',
              time: timeMatch ? timeMatch[1] : '',
              round: roundMatch ? `Round ${roundMatch[1]}` : '',
              venue: ''
            };
            
            // Check for duplicates
            const isDuplicate = fixtures.some(f => 
              f.homeTeam.toLowerCase() === fixture.homeTeam.toLowerCase() && 
              f.awayTeam.toLowerCase() === fixture.awayTeam.toLowerCase()
            );
            
            if (!isDuplicate) {
              fixtures.push(fixture);
            }
          }
        }
      }
    });

    // Also look for div-based fixtures
    $('div').each((index, div) => {
      const $div = $(div);
      const text = $div.text().trim();
      
      if (text.length > 5 && text.length < 200) {
        const vsPattern = /(.+?)\s+(?:v\s+|vs\s+|V\s+|versus\s+)(.+?)(?:\s|$)/i;
        const match = text.match(vsPattern);
        
        if (match && match[1] && match[2]) {
          const homeTeam = match[1].trim();
          const awayTeam = match[2].trim();
          
          if (homeTeam.length > 1 && awayTeam.length > 1 && 
              homeTeam !== awayTeam && 
              !homeTeam.includes('Date') && !homeTeam.includes('Time') &&
              !awayTeam.includes('Date') && !awayTeam.includes('Time')) {
            
            const dateMatch = text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
            const timeMatch = text.match(/(\d{1,2}:\d{2}(?:\s*[AP]M)?)/i);
            const roundMatch = text.match(/(?:Round|Week|Game)\s*(\d+)/i);
            
            const fixture = {
              homeTeam,
              awayTeam,
              date: dateMatch ? dateMatch[1] : '',
              time: timeMatch ? timeMatch[1] : '',
              round: roundMatch ? `Round ${roundMatch[1]}` : '',
              venue: ''
            };
            
            // Check for duplicates
            const isDuplicate = fixtures.some(f => 
              f.homeTeam.toLowerCase() === fixture.homeTeam.toLowerCase() && 
              f.awayTeam.toLowerCase() === fixture.awayTeam.toLowerCase()
            );
            
            if (!isDuplicate) {
              fixtures.push(fixture);
            }
          }
        }
      }
    });

    console.log(`Found ${fixtures.length} fixtures`);
    return fixtures;
  }

  private async scrapeWithPuppeteer(url: string): Promise<ScrapedFixture[]> {
    // Puppeteer is not available in this environment due to missing system dependencies
    throw new Error('Puppeteer browser automation is not available in this environment. Please use static HTML content or consider alternative scraping methods.');
  }

  async importFixtures(url: string, clubId: number, seasonId: number): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      message: '',
      imported: 0,
      skipped: 0,
      errors: []
    };

    try {
      const fixtures = await this.scrapeFixtures(url);

      if (fixtures.length === 0) {
        result.message = 'No fixtures found to import';
        return result;
      }

      for (const fixture of fixtures) {
        try {
          // Find or create teams
          const homeTeamResult = await this.findOrCreateTeam(fixture.homeTeam, clubId, seasonId);
          const awayTeamResult = await this.findOrCreateTeam(fixture.awayTeam, clubId, seasonId);

          // Create game
          await db.execute(sql`
            INSERT INTO games (
              date, time, home_team_id, away_team_id, season_id, 
              venue, round, status_id, is_inter_club
            )
            VALUES (
              ${fixture.date || null},
              ${fixture.time || null},
              ${homeTeamResult.id},
              ${awayTeamResult.id},
              ${seasonId},
              ${fixture.venue || null},
              ${fixture.round || null},
              1,
              true
            )
          `);

          result.imported++;
        } catch (error) {
          console.error(`Error importing fixture: ${fixture.homeTeam} vs ${fixture.awayTeam}`, error);
          result.errors.push(`${fixture.homeTeam} vs ${fixture.awayTeam}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          result.skipped++;
        }
      }

      result.success = result.imported > 0;
      result.message = `Imported ${result.imported} fixtures, skipped ${result.skipped}`;

      return result;
    } catch (error) {
      result.message = `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      result.errors.push(result.message);
      return result;
    }
  }

  private async findOrCreateTeam(teamName: string, clubId: number, seasonId: number) {
    const existingTeam = await db.execute(sql`
      SELECT id FROM teams 
      WHERE name = ${teamName} AND season_id = ${seasonId}
      LIMIT 1
    `);

    if (existingTeam.rows.length > 0) {
      return existingTeam.rows[0];
    }

    const newTeam = await db.execute(sql`
      INSERT INTO teams (name, club_id, season_id, is_active)
      VALUES (${teamName}, ${clubId}, ${seasonId}, true)
      RETURNING id
    `);

    return newTeam.rows[0];
  }
}