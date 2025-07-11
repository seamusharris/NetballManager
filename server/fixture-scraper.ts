
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

      // NetballConnect specific selectors and enhanced parsing
      console.log('Looking for NetballConnect fixture data...');
      
      // Log page structure for debugging
      console.log('Available divs:', $('div').length);
      console.log('Available tables:', $('table').length);
      console.log('Available spans:', $('span').length);
      console.log('Page title:', $('title').text());
      console.log('Available IDs:', $('[id]').map((i, el) => $(el).attr('id')).get().slice(0, 10));
      
      // NetballConnect specific approaches
      
      // Approach 1: Look for NetballConnect specific elements
      const netballConnectSelectors = [
        '.fixture-row',
        '.game-row', 
        '.match-row',
        '[class*="fixture"]',
        '[class*="game"]',
        '[class*="match"]',
        '[class*="livescore"]',
        '[id*="fixture"]',
        '[id*="game"]',
        '[id*="match"]'
      ];

      for (const selector of netballConnectSelectors) {
        const elements = $(selector);
        console.log(`Selector "${selector}" found ${elements.length} elements`);
        
        elements.each((index, element) => {
          const $element = $(element);
          const text = $element.text().trim();
          console.log(`${selector}[${index}]:`, text.substring(0, 150));
          
          const fixture = this.extractFixtureFromText(text);
          if (fixture && !this.isDuplicateFixture(fixtures, fixture)) {
            fixtures.push(fixture);
            console.log(`✓ Added fixture from ${selector}: ${fixture.homeTeam} vs ${fixture.awayTeam}`);
          }
        });
      }

      // Approach 2: Look for tables with fixture data
      if (fixtures.length === 0) {
        console.log('Analyzing tables for fixture data...');
        
        $('table').each((tableIndex, table) => {
          const $table = $(table);
          const tableClass = $table.attr('class') || '';
          const tableId = $table.attr('id') || '';
          
          console.log(`Table ${tableIndex}: class="${tableClass}", id="${tableId}"`);
          
          // Look for fixture-related table classes/ids
          if (tableClass.toLowerCase().includes('fixture') || 
              tableClass.toLowerCase().includes('game') ||
              tableClass.toLowerCase().includes('livescore') ||
              tableId.toLowerCase().includes('fixture') ||
              tableId.toLowerCase().includes('game')) {
            
            console.log(`Found potential fixture table: ${tableClass || tableId}`);
            
            $table.find('tr').each((rowIndex, row) => {
              const $row = $(row);
              const cells = $row.find('td, th');
              
              if (cells.length >= 2) {
                const cellTexts = cells.map((i, cell) => $(cell).text().trim()).get();
                const rowText = cellTexts.join(' | ');
                
                console.log(`Table row ${rowIndex}:`, rowText);
                
                // Try to extract from individual cells first
                for (let i = 0; i < cellTexts.length - 1; i++) {
                  const combinedText = cellTexts[i] + ' ' + cellTexts[i + 1];
                  const fixture = this.extractFixtureFromText(combinedText);
                  if (fixture && !this.isDuplicateFixture(fixtures, fixture)) {
                    fixtures.push(fixture);
                    console.log(`✓ Added fixture from table cells: ${fixture.homeTeam} vs ${fixture.awayTeam}`);
                    break;
                  }
                }
                
                // Then try the full row
                if (fixtures.length === 0) {
                  const fixture = this.extractFixtureFromText(rowText);
                  if (fixture && !this.isDuplicateFixture(fixtures, fixture)) {
                    fixtures.push(fixture);
                    console.log(`✓ Added fixture from table row: ${fixture.homeTeam} vs ${fixture.awayTeam}`);
                  }
                }
              }
            });
          }
        });
      }

      // Approach 3: Deep dive into all text content
      if (fixtures.length === 0) {
        console.log('Performing deep text analysis...');
        
        // Get all text-containing elements
        const textElements = $('*').filter(function() {
          return $(this).children().length === 0 && $(this).text().trim().length > 5;
        });
        
        console.log(`Found ${textElements.length} text elements to analyze`);
        
        textElements.each((index, element) => {
          const $element = $(element);
          const text = $element.text().trim();
          
          // Look for team vs team patterns
          if (text.length > 10 && text.length < 300 && this.containsTeamPattern(text)) {
            console.log(`Analyzing text element ${index}:`, text);
            
            const fixture = this.extractFixtureFromText(text);
            if (fixture && !this.isDuplicateFixture(fixtures, fixture)) {
              fixtures.push(fixture);
              console.log(`✓ Added fixture from text element: ${fixture.homeTeam} vs ${fixture.awayTeam}`);
            }
          }
        });
      }

      // Approach 4: Look for script data
      if (fixtures.length === 0) {
        console.log('Searching for JavaScript data...');
        
        $('script').each((index, script) => {
          const scriptContent = $(script).html() || '';
          
          // Look for fixture arrays or objects
          const fixturePatterns = [
            /fixtures?\s*[:=]\s*\[.*?\]/gi,
            /games?\s*[:=]\s*\[.*?\]/gi,
            /matches?\s*[:=]\s*\[.*?\]/gi,
            /"homeTeam"\s*:\s*"[^"]+"/gi,
            /"awayTeam"\s*:\s*"[^"]+"/gi
          ];
          
          fixturePatterns.forEach((pattern, patternIndex) => {
            const matches = scriptContent.match(pattern);
            if (matches) {
              console.log(`Script ${index}, Pattern ${patternIndex}: Found ${matches.length} matches`);
              matches.forEach((match, matchIndex) => {
                console.log(`Match ${matchIndex}:`, match.substring(0, 200));
                // Try to extract team names from the match
                const fixture = this.extractFixtureFromText(match);
                if (fixture && !this.isDuplicateFixture(fixtures, fixture)) {
                  fixtures.push(fixture);
                  console.log(`✓ Added fixture from script: ${fixture.homeTeam} vs ${fixture.awayTeam}`);
                }
              });
            }
          });
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

  private isDuplicateFixture(fixtures: ScrapedFixture[], newFixture: ScrapedFixture): boolean {
    return fixtures.some(f => 
      f.homeTeam.toLowerCase() === newFixture.homeTeam.toLowerCase() && 
      f.awayTeam.toLowerCase() === newFixture.awayTeam.toLowerCase()
    );
  }

  private containsTeamPattern(text: string): boolean {
    const teamPatterns = [
      /\bv\s+/i,
      /\bvs\s+/i,
      /\bversus\s+/i,
      /\s-\s/,
      /\bplaying\s+/i,
      /\bagainst\s+/i
    ];
    
    return teamPatterns.some(pattern => pattern.test(text));
  }

  private extractFixtureFromText(text: string): ScrapedFixture | null {
    // Clean the text first
    const cleanText = text.replace(/\s+/g, ' ').trim();
    
    // Enhanced team matching patterns for NetballConnect
    const teamPatterns = [
      // Standard vs patterns
      /(.+?)\s+(?:v\s+|vs\s+|V\s+|versus\s+)(.+?)(?:\s+(?:\d{1,2}[\/\-]|\d{1,2}:|\d{4}|$))/i,
      /(.+?)\s+vs?\s+(.+?)(?:\s+(?:\d{1,2}[\/\-]|\d{1,2}:|\d{4}|$))/i,
      
      // Dash separated
      /(.+?)\s+-\s+(.+?)(?:\s+(?:\d{1,2}[\/\-]|\d{1,2}:|\d{4}|$))/i,
      
      // Pipe separated
      /(.+?)\s+\|\s+(.+?)(?:\s+(?:\d{1,2}[\/\-]|\d{1,2}:|\d{4}|$))/i,
      
      // Playing/Against patterns
      /(.+?)\s+(?:playing|against)\s+(.+?)(?:\s+(?:\d{1,2}[\/\-]|\d{1,2}:|\d{4}|$))/i,
      
      // NetballConnect specific patterns
      /(.+?)\s+v\s+(.+?)(?:\s+(?:Round|Week|Game|\d))/i,
      
      // Team names in quotes or brackets
      /"(.+?)"\s+(?:v|vs)\s+"(.+?)"/i,
      /\((.+?)\)\s+(?:v|vs)\s+\((.+?)\)/i,
      
      // More flexible patterns
      /^(.+?)\s+(?:v|vs|versus|playing)\s+(.+?)$/i,
      
      // Split by common separators and look for team names
      /(.+?)\s*[:-]\s*(.+?)(?:\s+\d|\s*$)/i
    ];

    for (const pattern of teamPatterns) {
      const teamMatch = cleanText.match(pattern);
      if (teamMatch && teamMatch[1] && teamMatch[2]) {
        let homeTeam = this.cleanTeamName(teamMatch[1]);
        let awayTeam = this.cleanTeamName(teamMatch[2]);
        
        // Validate team names
        if (this.isValidTeamName(homeTeam) && this.isValidTeamName(awayTeam)) {
          
          // Extract additional information
          const dateMatch = cleanText.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
          const timeMatch = cleanText.match(/(\d{1,2}:\d{2}(?:\s*[AP]M)?)/i);
          const roundMatch = cleanText.match(/(?:Round|Week|Game)\s*(\d+)/i);
          const venueMatch = cleanText.match(/(?:at|@)\s+([^,\d]+?)(?:\s|,|$)/i);
          
          return {
            date: dateMatch ? this.normalizeDate(dateMatch[1]) : '',
            time: timeMatch ? this.normalizeTime(timeMatch[1]) : '',
            homeTeam,
            awayTeam,
            venue: venueMatch ? venueMatch[1].trim() : '',
            round: roundMatch ? `Round ${roundMatch[1]}` : ''
          };
        }
      }
    }
    
    return null;
  }

  private cleanTeamName(name: string): string {
    return name
      .trim()
      .replace(/^["'`]|["'`]$/g, '') // Remove quotes
      .replace(/^\(|\)$/g, '') // Remove parentheses
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
  }

  private isValidTeamName(name: string): boolean {
    // Must be reasonable length
    if (name.length < 2 || name.length > 50) return false;
    
    // Must not be just numbers
    if (/^\d+$/.test(name)) return false;
    
    // Must not be common date/time/venue words
    const excludeWords = ['am', 'pm', 'time', 'date', 'venue', 'round', 'week', 'game', 'court', 'field'];
    if (excludeWords.includes(name.toLowerCase())) return false;
    
    // Must contain at least some letters
    if (!/[a-zA-Z]/.test(name)) return false;
    
    return true;
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
