
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
      const $ = cheerio.load(html);
      const fixtures: ScrapedFixture[] = [];

      // Look for common fixture table patterns
      const fixtureRows = $('table tr, .fixture-row, .game-row').filter((i, el) => {
        const text = $(el).text().toLowerCase();
        return text.includes('vs') || text.includes('v ') || text.includes(' v ');
      });

      console.log(`Found ${fixtureRows.length} potential fixture rows`);

      fixtureRows.each((index, row) => {
        try {
          const $row = $(row);
          const text = $row.text();
          
          // Extract date (look for date patterns)
          const dateMatch = text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
          const date = dateMatch ? this.normalizeDate(dateMatch[1]) : '';

          // Extract time (look for time patterns)
          const timeMatch = text.match(/(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
          const time = timeMatch ? this.normalizeTime(timeMatch[1]) : '';

          // Extract teams (look for "vs" or "v" patterns)
          const teamMatch = text.match(/([^,\n]+?)\s+(?:vs?\.?)\s+([^,\n]+)/i);
          if (teamMatch) {
            const homeTeam = teamMatch[1].trim();
            const awayTeam = teamMatch[2].trim();

            // Extract venue if present
            const venueMatch = text.match(/venue[:\s]+([^,\n]+)/i);
            const venue = venueMatch ? venueMatch[1].trim() : '';

            // Extract round if present
            const roundMatch = text.match(/round[:\s]+(\d+)/i);
            const round = roundMatch ? roundMatch[1] : '';

            if (homeTeam && awayTeam) {
              fixtures.push({
                date,
                time,
                homeTeam,
                awayTeam,
                venue: venue || undefined,
                round: round || undefined
              });
            }
          }
        } catch (error) {
          console.warn(`Error parsing fixture row ${index}:`, error);
        }
      });

      // If no fixtures found with table approach, try alternative selectors
      if (fixtures.length === 0) {
        console.log('No fixtures found with table approach, trying alternative selectors...');
        
        // Look for any text containing team matchups
        const allText = $('body').text();
        const lines = allText.split('\n');
        
        lines.forEach(line => {
          const trimmed = line.trim();
          if (trimmed.includes(' vs ') || trimmed.includes(' v ')) {
            try {
              const dateMatch = trimmed.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
              const timeMatch = trimmed.match(/(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
              const teamMatch = trimmed.match(/([^,\n]+?)\s+(?:vs?\.?)\s+([^,\n]+)/i);
              
              if (teamMatch) {
                fixtures.push({
                  date: dateMatch ? this.normalizeDate(dateMatch[1]) : '',
                  time: timeMatch ? this.normalizeTime(timeMatch[1]) : '',
                  homeTeam: teamMatch[1].trim(),
                  awayTeam: teamMatch[2].trim()
                });
              }
            } catch (error) {
              // Ignore parsing errors for individual lines
            }
          }
        });
      }

      console.log(`Successfully scraped ${fixtures.length} fixtures`);
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

      // Get or create teams and import fixtures
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
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return '';
      }
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
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
