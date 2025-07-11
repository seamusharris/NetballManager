
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

      // Look for NetballConnect specific fixture patterns
      console.log('Looking for NetballConnect fixture data...');
      
      // Try to find table rows with fixture data
      const tableRows = $('table tr');
      console.log(`Found ${tableRows.length} table rows`);

      tableRows.each((index, row) => {
        try {
          const $row = $(row);
          const cells = $row.find('td');
          
          if (cells.length >= 4) {
            // Try to extract data from table cells
            const cellTexts = cells.map((i, cell) => $(cell).text().trim()).get();
            
            // Look for team vs team pattern in any cell
            let homeTeam = '';
            let awayTeam = '';
            let date = '';
            let time = '';
            let venue = '';
            let round = '';
            
            for (let i = 0; i < cellTexts.length; i++) {
              const cellText = cellTexts[i];
              
              // Check for team matchup patterns
              const teamMatch = cellText.match(/(.+?)\s+(?:vs?\.?|v)\s+(.+)/i);
              if (teamMatch && !homeTeam && !awayTeam) {
                homeTeam = teamMatch[1].trim();
                awayTeam = teamMatch[2].trim();
              }
              
              // Check for date pattern
              const dateMatch = cellText.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
              if (dateMatch && !date) {
                date = this.normalizeDate(dateMatch[1]);
              }
              
              // Check for time pattern
              const timeMatch = cellText.match(/(\d{1,2}:\d{2}\s*(?:[AP]M)?)/i);
              if (timeMatch && !time) {
                time = this.normalizeTime(timeMatch[1]);
              }
              
              // Check for round pattern
              const roundMatch = cellText.match(/(round\s*\d+|r\d+)/i);
              if (roundMatch && !round) {
                round = roundMatch[1];
              }
              
              // Venue is often in a separate cell
              if (cellText.length > 0 && !cellText.match(/\d/) && cellText.length < 50 && !venue) {
                venue = cellText;
              }
            }
            
            if (homeTeam && awayTeam) {
              fixtures.push({
                date: date || '',
                time: time || '',
                homeTeam: homeTeam,
                awayTeam: awayTeam,
                venue: venue || '',
                round: round || ''
              });
              
              console.log(`Found fixture: ${homeTeam} vs ${awayTeam} on ${date} at ${time}`);
            }
          }
        } catch (error) {
          console.warn(`Error parsing row ${index}:`, error);
        }
      });

      // If no fixtures found in tables, try div-based approach
      if (fixtures.length === 0) {
        console.log('No table fixtures found, trying div-based approach...');
        
        const divs = $('div').filter((i, el) => {
          const text = $(el).text();
          return text.includes(' v ') || text.includes(' vs ');
        });
        
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
              
              console.log(`Found fixture in div: ${teamMatch[1].trim()} vs ${teamMatch[2].trim()}`);
            }
          } catch (error) {
            console.warn(`Error parsing div ${index}:`, error);
          }
        });
      }

      console.log(`Successfully scraped ${fixtures.length} fixtures`);
      
      // If still no fixtures found, log some debugging info
      if (fixtures.length === 0) {
        console.log('No fixtures found. Page content preview:');
        console.log('Page title:', $('title').text());
        console.log('Headers found:', $('h1, h2, h3').map((i, el) => $(el).text()).get());
        console.log('Tables found:', $('table').length);
        console.log('First 500 chars of body:', $('body').text().substring(0, 500));
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
