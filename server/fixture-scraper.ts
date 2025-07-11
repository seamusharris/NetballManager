
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
      
      // Log a sample of the HTML to help debug structure
      console.log('HTML sample (first 500 chars):', html.substring(0, 500));
      console.log('HTML sample (last 500 chars):', html.substring(Math.max(0, html.length - 500)));

      const $ = cheerio.load(html);
      const fixtures: ScrapedFixture[] = [];

      // NetballConnect specific selectors
      console.log('Looking for NetballConnect fixture data...');
      
      // Log all available elements to understand structure
      console.log('Available divs:', $('div').length);
      console.log('Available tables:', $('table').length);
      console.log('Available spans:', $('span').length);
      console.log('Available classes:', $('[class]').map((i, el) => $(el).attr('class')).get().slice(0, 20));

      // Try multiple approaches for NetballConnect

      // Approach 1: Look for fixture-specific containers
      const fixtureContainers = $('.fixture, .game, .match, [class*="fixture"], [class*="game"], [class*="match"]');
      console.log(`Found ${fixtureContainers.length} potential fixture containers`);

      fixtureContainers.each((index, container) => {
        const $container = $(container);
        const containerText = $container.text().trim();
        console.log(`Container ${index}:`, containerText.substring(0, 100));
        
        // Try to extract fixture data from container
        const fixture = this.extractFixtureFromText(containerText);
        if (fixture) {
          fixtures.push(fixture);
          console.log(`✓ Added fixture from container: ${fixture.homeTeam} vs ${fixture.awayTeam}`);
        }
      });

      // Approach 2: Look for data in divs with specific patterns
      if (fixtures.length === 0) {
        console.log('Trying div-based extraction...');
        
        $('div').each((index, div) => {
          const $div = $(div);
          const text = $div.text().trim();
          
          // Look for fixture patterns in div text
          if (text.length > 10 && text.length < 200) {
            const fixture = this.extractFixtureFromText(text);
            if (fixture) {
              // Check for duplicates
              const exists = fixtures.some(f => 
                f.homeTeam === fixture.homeTeam && 
                f.awayTeam === fixture.awayTeam
              );
              if (!exists) {
                fixtures.push(fixture);
                console.log(`✓ Added fixture from div: ${fixture.homeTeam} vs ${fixture.awayTeam}`);
              }
            }
          }
        });
      }

      // Approach 3: Look in tables more thoroughly
      if (fixtures.length === 0) {
        console.log('Trying enhanced table extraction...');
        
        $('table').each((tableIndex, table) => {
          const $table = $(table);
          console.log(`Analyzing table ${tableIndex}...`);
          
          $table.find('tr').each((rowIndex, row) => {
            const $row = $(row);
            const cells = $row.find('td, th');
            
            if (cells.length >= 2) {
              const cellTexts = cells.map((i, cell) => $(cell).text().trim()).get();
              const rowText = cellTexts.join(' ');
              
              console.log(`Table ${tableIndex}, Row ${rowIndex}:`, rowText);
              
              const fixture = this.extractFixtureFromText(rowText);
              if (fixture) {
                const exists = fixtures.some(f => 
                  f.homeTeam === fixture.homeTeam && 
                  f.awayTeam === fixture.awayTeam
                );
                if (!exists) {
                  fixtures.push(fixture);
                  console.log(`✓ Added fixture from table: ${fixture.homeTeam} vs ${fixture.awayTeam}`);
                }
              }
            }
          });
        });
      }

      // Approach 4: Look for JSON data embedded in script tags
      if (fixtures.length === 0) {
        console.log('Looking for embedded JSON data...');
        
        $('script').each((index, script) => {
          const scriptContent = $(script).html() || '';
          
          // Look for fixture-related JSON patterns
          const jsonMatches = scriptContent.match(/\{[^}]*(?:fixture|game|match)[^}]*\}/gi);
          if (jsonMatches) {
            console.log(`Found ${jsonMatches.length} potential JSON fixtures in script ${index}`);
            
            jsonMatches.forEach((match, matchIndex) => {
              try {
                const data = JSON.parse(match);
                console.log(`JSON match ${matchIndex}:`, data);
                // Extract fixture data from JSON if structure matches
              } catch (e) {
                // Not valid JSON, continue
              }
            });
          }
        });
      }

      console.log(`Total fixtures found: ${fixtures.length}`);
      
      if (fixtures.length === 0) {
        // Log more debugging info
        console.log('No fixtures found. Page structure:');
        console.log('Body text sample:', $('body').text().substring(0, 1000));
        console.log('All text content:', $.text().substring(0, 1000));
      }
      
      return fixtures;

    } catch (error) {
      console.error('Scraping error:', error);
      throw new Error(`Failed to scrape fixtures: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private extractFixtureFromText(text: string): ScrapedFixture | null {
    // Multiple team matching patterns
    const teamPatterns = [
      /(.+?)\s+(?:v\s+|vs\s+|V\s+|versus\s+)(.+?)(?:\s|$|\d)/i,
      /(.+?)\s+vs?\s+(.+?)(?:\s|$|\d)/i,
      /(.+?)\s+-\s+(.+?)(?:\s|$|\d)/i
    ];

    for (const pattern of teamPatterns) {
      const teamMatch = text.match(pattern);
      if (teamMatch && teamMatch[1] && teamMatch[2]) {
        const homeTeam = teamMatch[1].trim();
        const awayTeam = teamMatch[2].trim();
        
        // Validate team names (reasonable length, not just numbers)
        if (homeTeam.length > 2 && homeTeam.length < 50 && 
            awayTeam.length > 2 && awayTeam.length < 50 &&
            !homeTeam.match(/^\d+$/) && !awayTeam.match(/^\d+$/)) {
          
          // Extract date and time from the same text
          const dateMatch = text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
          const timeMatch = text.match(/(\d{1,2}:\d{2}(?:\s*[AP]M)?)/i);
          
          return {
            date: dateMatch ? this.normalizeDate(dateMatch[1]) : '',
            time: timeMatch ? this.normalizeTime(timeMatch[1]) : '',
            homeTeam,
            awayTeam,
            venue: '',
            round: ''
          };
        }
      }
    }
    
    return null;
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
