
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
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
  constructor() {
    // No initialization needed for cheerio/fetch approach
  }

  async close() {
    // No cleanup needed for cheerio/fetch approach
  }

  async scrapeFixtures(url: string): Promise<ScrapedFixture[]> {
    try {
      console.log(`Scraping fixtures from: ${url}`);
      
      // Fetch the HTML content
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      console.log(`Fetched HTML content, length: ${html.length} characters`);
      
      const $ = cheerio.load(html);
      const fixtures: ScrapedFixture[] = [];

      // Look for NetballConnect specific patterns
      console.log('Looking for NetballConnect fixture data...');
      
      // Try multiple selectors for NetballConnect fixture tables
      const tableSelectors = [
        'table[class*="fixture"]',
        'table[class*="season"]',
        'table[class*="match"]',
        '.fixture-table',
        '.season-fixture',
        'table:contains("Round")',
        'table:contains("vs")',
        'table tbody tr',
        'table tr'
      ];

      let foundFixtures = false;

      for (const selector of tableSelectors) {
        if (foundFixtures) break;
        
        const rows = $(selector);
        console.log(`Trying selector "${selector}" - found ${rows.length} elements`);
        
        rows.each((index, row) => {
          try {
            const $row = $(row);
            const rowText = $row.text().trim();
            
            // Skip empty rows, headers, or very short text
            if (!rowText || rowText.length < 10) return;
            
            // Look for team vs team patterns
            const teamPatterns = [
              /(.+?)\s+(?:vs?\.?|v)\s+(.+)/i,
              /(.+?)\s+v\s+(.+)/i,
              /(.+?)\s+-\s+(.+)/i
            ];
            
            let homeTeam = '';
            let awayTeam = '';
            
            for (const pattern of teamPatterns) {
              const match = rowText.match(pattern);
              if (match) {
                homeTeam = match[1].trim();
                awayTeam = match[2].trim();
                break;
              }
            }
            
            if (homeTeam && awayTeam) {
              // Extract additional info
              const dateMatch = rowText.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
              const timeMatch = rowText.match(/(\d{1,2}:\d{2}\s*(?:[AP]M)?)/i);
              const roundMatch = rowText.match(/(round\s*\d+|r\d+)/i);
              
              // Clean up team names (remove extra text that might be venue/time info)
              homeTeam = homeTeam.replace(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}).*/, '').trim();
              awayTeam = awayTeam.replace(/(\d{1,2}:\d{2}).*/, '').trim();
              
              if (homeTeam.length > 0 && awayTeam.length > 0) {
                fixtures.push({
                  date: dateMatch ? this.normalizeDate(dateMatch[1]) : '',
                  time: timeMatch ? this.normalizeTime(timeMatch[1]) : '',
                  homeTeam: homeTeam,
                  awayTeam: awayTeam,
                  venue: '',
                  round: roundMatch ? roundMatch[1] : ''
                });
                
                foundFixtures = true;
                console.log(`Found fixture: ${homeTeam} vs ${awayTeam}`);
              }
            }
          } catch (error) {
            console.warn(`Error parsing row ${index}:`, error);
          }
        });
      }

      // If still no fixtures found, try div-based approach
      if (!foundFixtures) {
        console.log('No table fixtures found, trying div-based approach...');
        
        const divSelectors = [
          '.fixture',
          '.game',
          '.match',
          '[class*="fixture"]',
          '[class*="game"]',
          '[class*="match"]',
          'div:contains("vs")',
          'div:contains(" v ")'
        ];
        
        for (const selector of divSelectors) {
          const divs = $(selector);
          console.log(`Trying div selector "${selector}" - found ${divs.length} elements`);
          
          divs.each((index, div) => {
            try {
              const $div = $(div);
              const text = $div.text().trim();
              
              const teamMatch = text.match(/(.+?)\s+(?:vs?\.?|v)\s+(.+?)(?:\s|$)/i);
              if (teamMatch) {
                const dateMatch = text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
                const timeMatch = text.match(/(\d{1,2}:\d{2}\s*(?:[AP]M)?)/i);
                
                fixtures.push({
                  date: dateMatch ? this.normalizeDate(dateMatch[1]) : '',
                  time: timeMatch ? this.normalizeTime(timeMatch[1]) : '',
                  homeTeam: teamMatch[1].trim(),
                  awayTeam: teamMatch[2].trim(),
                  venue: '',
                  round: ''
                });
                
                foundFixtures = true;
                console.log(`Found fixture in div: ${teamMatch[1].trim()} vs ${teamMatch[2].trim()}`);
              }
            } catch (error) {
              console.warn(`Error parsing div ${index}:`, error);
            }
          });
          
          if (foundFixtures) break;
        }
      }

      console.log(`Successfully scraped ${fixtures.length} fixtures`);
      
      // If no fixtures found, log some debugging info
      if (fixtures.length === 0) {
        console.log('No fixtures found. Page content preview:');
        console.log(html.substring(0, 500) + '...');
        
        // Look for any text that might indicate this is the right page
        const pageIndicators = $('title').text() + ' ' + $('h1, h2, h3').text();
        console.log('Page indicators:', pageIndicators);
      }
      
      return fixtures;
    } catch (error) {
      console.error('Error scraping fixtures:', error);
      throw new Error(`Failed to scrape fixtures: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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

      // Import each fixture
      for (const fixture of fixtures) {
        try {
          // Find or create home team
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
    // Try to find existing team
    const existingTeam = await db.execute(sql`
      SELECT id FROM teams 
      WHERE name = ${teamName} AND season_id = ${seasonId}
      LIMIT 1
    `);

    if (existingTeam.rows.length > 0) {
      return existingTeam.rows[0];
    }

    // Create new team
    const newTeam = await db.execute(sql`
      INSERT INTO teams (name, club_id, season_id, is_active)
      VALUES (${teamName}, ${clubId}, ${seasonId}, true)
      RETURNING id
    `);

    return newTeam.rows[0];
  }

  private normalizeDate(dateStr: string): string {
    try {
      // Handle various date formats
      const parts = dateStr.split(/[\/\-]/);
      if (parts.length === 3) {
        // Assume DD/MM/YYYY or MM/DD/YYYY format
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]);
        const year = parseInt(parts[2]);
        
        // If year is 2-digit, convert to 4-digit
        const fullYear = year < 100 ? 2000 + year : year;
        
        // Create date (month is 0-indexed in JS Date)
        const date = new Date(fullYear, month - 1, day);
        return date.toISOString().split('T')[0]; // YYYY-MM-DD format
      }
      return '';
    } catch {
      return '';
    }
  }

  private normalizeTime(timeStr: string): string {
    try {
      // Handle various time formats
      const time = timeStr.trim().toUpperCase();
      
      // Convert 12-hour to 24-hour format if needed
      if (time.includes('PM') && !time.startsWith('12')) {
        const hours = parseInt(time.split(':')[0]) + 12;
        return time.replace(/\d{1,2}/, hours.toString()).replace(/\s*PM/i, '');
      } else if (time.includes('AM') && time.startsWith('12')) {
        return time.replace('12', '00').replace(/\s*AM/i, '');
      }
      
      return time.replace(/\s*(AM|PM)/i, '');
    } catch {
      return '';
    }
  }
}
