
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
    console.log('NetballConnectScraper: Using lightweight HTML parser (cheerio + node-fetch)');
  }

  async close() {
    // No cleanup needed for HTTP-based scraper
  }

  async scrapeFixtures(url: string): Promise<ScrapedFixture[]> {
    try {
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

      const $ = cheerio.load(html);
      const fixtures: ScrapedFixture[] = [];

      // Log what we're looking for
      console.log('Looking for fixture tables...');
      const tableCount = $('table').length;
      console.log(`Found ${tableCount} tables to analyze`);

      // Look for table rows with fixture data
      $('table tr').each((index, row) => {
        const $row = $(row);
        const cells = $row.find('td');

        if (cells.length >= 3) {
          const cellTexts = cells.map((i, cell) => $(cell).text().trim()).get();
          console.log(`Row ${index} cells:`, cellTexts);

          // Look for team matchup patterns
          let homeTeam = '';
          let awayTeam = '';
          let date = '';
          let time = '';
          let venue = '';

          for (const cellText of cellTexts) {
            // Check for team vs team pattern
            const teamMatch = cellText.match(/(.+?)\s+(?:v\s+|vs\s+|V\s+)(.+)/i);
            if (teamMatch && !homeTeam) {
              homeTeam = teamMatch[1].trim();
              awayTeam = teamMatch[2].trim();
              console.log(`Found teams: ${homeTeam} vs ${awayTeam}`);
            }

            // Check for date pattern
            const dateMatch = cellText.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
            if (dateMatch && !date) {
              date = this.normalizeDate(dateMatch[1]);
              console.log(`Found date: ${date}`);
            }

            // Check for time pattern
            const timeMatch = cellText.match(/(\d{1,2}:\d{2}(?:\s*[AP]M)?)/i);
            if (timeMatch && !time) {
              time = this.normalizeTime(timeMatch[1]);
              console.log(`Found time: ${time}`);
            }

            // Venue detection
            if (cellText.length > 0 && !cellText.match(/\d/) && cellText.length < 50 && !venue && !cellText.includes('v ')) {
              venue = cellText;
              console.log(`Found venue: ${venue}`);
            }
          }

          if (homeTeam && awayTeam) {
            fixtures.push({
              date: date || '',
              time: time || '',
              homeTeam,
              awayTeam,
              venue: venue || '',
              round: ''
            });

            console.log(`✓ Added fixture: ${homeTeam} vs ${awayTeam}`);
          }
        }
      });

      // Fallback: look for any text containing team vs team patterns
      if (fixtures.length === 0) {
        console.log('No table fixtures found, trying text-based approach...');

        $('*').each((i, elem) => {
          const text = $(elem).text().trim();
          const teamMatch = text.match(/(.+?)\s+(?:v\s+|vs\s+|V\s+)(.+?)(?:\s|$)/i);

          if (teamMatch && teamMatch[1].length < 50 && teamMatch[2].length < 50) {
            const homeTeam = teamMatch[1].trim();
            const awayTeam = teamMatch[2].trim();
            
            // Avoid duplicates
            const exists = fixtures.some(f => f.homeTeam === homeTeam && f.awayTeam === awayTeam);
            if (!exists) {
              fixtures.push({
                date: '',
                time: '',
                homeTeam,
                awayTeam,
                venue: '',
                round: ''
              });

              console.log(`✓ Added text fixture: ${homeTeam} vs ${awayTeam}`);
            }
          }
        });
      }

      console.log(`Total fixtures found: ${fixtures.length}`);
      return fixtures;

    } catch (error) {
      console.error('Scraping error:', error);
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

  private normalizeDate(dateStr: string): string {
    try {
      const parts = dateStr.split(/[\/\-]/);
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]);
        const year = parseInt(parts[2]);

        const fullYear = year < 100 ? 2000 + year : year;
        const date = new Date(fullYear, month - 1, day);
        return date.toISOString().split('T')[0];
      }
      return '';
    } catch {
      return '';
    }
  }

  private normalizeTime(timeStr: string): string {
    try {
      const time = timeStr.trim().toUpperCase();

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
