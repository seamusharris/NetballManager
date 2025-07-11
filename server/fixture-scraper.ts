
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
    console.log('NetballConnectScraper: Using Puppeteer for JavaScript-rendered content');
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

      // First try with regular HTTP fetch
      const fixtures = await this.scrapeWithFetch(url);
      
      if (fixtures.length === 0) {
        console.log('No fixtures found with HTTP fetch, trying Puppeteer for JavaScript-rendered content...');
        return await this.scrapeWithPuppeteer(url);
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
    
    // Check if this is a JavaScript-rendered page
    if (html.includes('id="root"') && html.includes('Loading...')) {
      console.log('Detected JavaScript-rendered page, returning empty for fallback to Puppeteer');
      return [];
    }

    return this.parseHtmlForFixtures(html);
  }

  private async scrapeWithPuppeteer(url: string): Promise<ScrapedFixture[]> {
    console.log('Launching Puppeteer browser...');
    
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    
    // Set user agent and viewport
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await this.page.setViewport({ width: 1920, height: 1080 });
    
    console.log('Navigating to page and waiting for content...');
    
    // Navigate to the page
    await this.page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for content to load - NetballConnect specific approach
    console.log('Waiting for NetballConnect content to load...');
    await this.page.waitForTimeout(12000); // Increased wait time for React app to load
    
    // Try to wait for specific NetballConnect elements
    try {
      await this.page.waitForSelector('table, .fixture, .game, [class*="fixture"], [class*="game"]', { timeout: 10000 });
      console.log('Found fixture-related elements on page');
    } catch (error) {
      console.log('No specific fixture elements found, proceeding with generic extraction');
    }
    
    // Enhanced fixture extraction for NetballConnect
    const fixtures = await this.page.evaluate(() => {
      const foundFixtures: any[] = [];
      
      console.log('=== PUPPETEER PAGE ANALYSIS ===');
      console.log('Page title:', document.title);
      console.log('Page URL:', window.location.href);
      console.log('Body classes:', document.body.className);
      console.log('Available tables:', document.querySelectorAll('table').length);
      console.log('Available divs:', document.querySelectorAll('div').length);
      console.log('Available spans:', document.querySelectorAll('span').length);
      
      // Log page content sample
      const bodyText = document.body.textContent || '';
      console.log('Body text sample (first 500 chars):', bodyText.substring(0, 500));
      
      // NetballConnect specific selectors
      const netballConnectSelectors = [
        'table tr',
        '.fixture-row',
        '.game-row',
        '.match-row',
        '[class*="fixture"]',
        '[class*="game"]',
        '[class*="match"]',
        '[class*="livescore"]',
        '[data-fixture]',
        '[data-game]',
        'tbody tr',
        '.table-row',
        '.data-row'
      ];
      
      // Try each selector pattern
      netballConnectSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        console.log(`Selector "${selector}" found ${elements.length} elements`);
        
        elements.forEach((element, index) => {
          const text = element.textContent?.trim() || '';
          if (text.length > 10 && text.length < 500) {
            console.log(`${selector}[${index}] text:`, text.substring(0, 150));
            
            // Enhanced team matching patterns for NetballConnect
            const teamPatterns = [
              // Standard vs patterns
              /(.+?)\s+(?:v\s+|vs\s+|V\s+|versus\s+)(.+?)(?:\s+(?:\d{1,2}[\/\-]|\d{1,2}:|\d{4}|Round|Week|Game|$))/i,
              // Team names separated by various delimiters
              /^([A-Za-z\s]{3,30})\s+(?:v|vs|versus|playing)\s+([A-Za-z\s]{3,30})(?:\s|$)/i,
              // NetballConnect specific patterns
              /([A-Za-z\s]{3,30})\s+v\s+([A-Za-z\s]{3,30})/i,
              // Table cell patterns (team names in separate cells)
              /^([A-Za-z\s]{3,30}).*?([A-Za-z\s]{3,30})$/i
            ];
            
            for (const pattern of teamPatterns) {
              const match = text.match(pattern);
              if (match && match[1] && match[2]) {
                const homeTeam = match[1].trim();
                const awayTeam = match[2].trim();
                
                // Enhanced validation
                const isValidTeam = (name: string) => {
                  return name.length >= 3 && 
                         name.length <= 40 && 
                         /[A-Za-z]/.test(name) && 
                         !['Date', 'Time', 'Venue', 'Round', 'Week', 'Game', 'vs', 'v'].includes(name) &&
                         !/^\d+$/.test(name);
                };
                
                if (isValidTeam(homeTeam) && isValidTeam(awayTeam) && homeTeam !== awayTeam) {
                  // Extract additional information
                  const dateMatch = text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
                  const timeMatch = text.match(/(\d{1,2}:\d{2}(?:\s*[AP]M)?)/i);
                  const roundMatch = text.match(/(?:Round|Week|Game)\s*(\d+)/i);
                  const venueMatch = text.match(/(?:at|@)\s+([^,\d]+?)(?:\s|,|$)/i);
                  
                  const fixture = {
                    homeTeam,
                    awayTeam,
                    date: dateMatch ? dateMatch[1] : '',
                    time: timeMatch ? timeMatch[1] : '',
                    round: roundMatch ? `Round ${roundMatch[1]}` : '',
                    venue: venueMatch ? venueMatch[1].trim() : ''
                  };
                  
                  // Check for duplicates
                  const isDuplicate = foundFixtures.some(f => 
                    f.homeTeam.toLowerCase() === fixture.homeTeam.toLowerCase() && 
                    f.awayTeam.toLowerCase() === fixture.awayTeam.toLowerCase()
                  );
                  
                  if (!isDuplicate) {
                    foundFixtures.push(fixture);
                    console.log(`✓ Found fixture: ${homeTeam} vs ${awayTeam}`);
                    break; // Stop trying other patterns for this element
                  }
                }
              }
            }
          }
        });
      });
      
      // If still no fixtures, try a more aggressive text-based approach
      if (foundFixtures.length === 0) {
        console.log('No fixtures found with selectors, trying aggressive text search...');
        
        // Get all text content and split by common separators
        const allText = document.body.textContent || '';
        const lines = allText.split(/[\n\r]+/).map(line => line.trim()).filter(line => line.length > 5);
        
        lines.forEach((line, index) => {
          if (line.length < 200 && /\s+v\s+|\s+vs\s+/i.test(line)) {
            console.log(`Text line ${index}:`, line);
            
            const vsMatch = line.match(/([A-Za-z\s]{3,30})\s+(?:v|vs)\s+([A-Za-z\s]{3,30})/i);
            if (vsMatch) {
              const homeTeam = vsMatch[1].trim();
              const awayTeam = vsMatch[2].trim();
              
              if (homeTeam.length >= 3 && awayTeam.length >= 3 && homeTeam !== awayTeam) {
                const isDuplicate = foundFixtures.some(f => 
                  f.homeTeam.toLowerCase() === homeTeam.toLowerCase() && 
                  f.awayTeam.toLowerCase() === awayTeam.toLowerCase()
                );
                
                if (!isDuplicate) {
                  foundFixtures.push({
                    homeTeam,
                    awayTeam,
                    date: '',
                    time: '',
                    round: '',
                    venue: ''
                  });
                  console.log(`✓ Found fixture from text: ${homeTeam} vs ${awayTeam}`);
                }
              }
            }
          }
        });
      }
      
      console.log(`=== FINAL RESULT: ${foundFixtures.length} fixtures found ===`);
      return foundFixtures;
    });
    
    console.log(`Found ${fixtures.length} fixtures with Puppeteer`);
    
    // Remove duplicates
    const uniqueFixtures = fixtures.filter((fixture, index, self) => 
      index === self.findIndex(f => f.homeTeam === fixture.homeTeam && f.awayTeam === fixture.awayTeam)
    );
    
    return uniqueFixtures;
  }

  private parseHtmlForFixtures(html: string): ScrapedFixture[] {
    try {
      // Comprehensive HTML structure logging
      console.log('HTML sample (first 1000 chars):', html.substring(0, 1000));
      console.log('HTML sample (last 1000 chars):', html.substring(Math.max(0, html.length - 1000)));
      
      // Look for JavaScript content that might contain fixture data
      const scriptMatches = html.match(/<script[^>]*>(.*?)<\/script>/gis);
      if (scriptMatches) {
        console.log(`Found ${scriptMatches.length} script tags`);
        scriptMatches.forEach((script, index) => {
          if (script.length > 100) { // Only log substantial scripts
            console.log(`Script ${index} (${script.length} chars):`, script.substring(0, 500));
          }
        });
      }
      
      // Look for data attributes or JSON that might contain fixtures
      const dataMatches = html.match(/data-[^=]*=["'][^"']*["']/gi);
      if (dataMatches) {
        console.log('Data attributes found:', dataMatches.slice(0, 10));
      }
      
      // Check for potential API endpoints or AJAX calls
      const apiMatches = html.match(/\/api\/[^"'\s]+/gi);
      if (apiMatches) {
        console.log('Potential API endpoints found:', apiMatches);
      }

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

      // Approach 4: Enhanced JavaScript data extraction
      if (fixtures.length === 0) {
        console.log('Searching for JavaScript data...');
        
        $('script').each((index, script) => {
          const scriptContent = $(script).html() || '';
          
          if (scriptContent.length < 50) return; // Skip tiny scripts
          
          console.log(`Analyzing script ${index} (${scriptContent.length} chars)`);
          
          // Look for JSON data structures
          const jsonPatterns = [
            /\{[^}]*"(?:home|away|team)"[^}]*\}/gi,
            /\[[^\]]*"(?:home|away|team)"[^\]]*\]/gi,
            /fixtures?\s*[:=]\s*(\[.*?\])/gi,
            /games?\s*[:=]\s*(\[.*?\])/gi,
            /matches?\s*[:=]\s*(\[.*?\])/gi,
            /data\s*[:=]\s*(\{.*?\})/gi,
            /window\.[^=]*=\s*(\{.*?\})/gi
          ];
          
          jsonPatterns.forEach((pattern, patternIndex) => {
            const matches = scriptContent.match(pattern);
            if (matches) {
              console.log(`Script ${index}, JSON Pattern ${patternIndex}: Found ${matches.length} matches`);
              matches.forEach((match, matchIndex) => {
                console.log(`JSON Match ${matchIndex}:`, match.substring(0, 300));
                
                // Try to parse as JSON
                try {
                  // Extract just the JSON part
                  const jsonMatch = match.match(/(\{.*\}|\[.*\])/);
                  if (jsonMatch) {
                    const jsonData = JSON.parse(jsonMatch[1]);
                    console.log('Parsed JSON data:', JSON.stringify(jsonData).substring(0, 200));
                    
                    // Recursively search for team names in the parsed data
                    const extractedFixtures = this.extractFixturesFromJSON(jsonData);
                    extractedFixtures.forEach(fixture => {
                      if (!this.isDuplicateFixture(fixtures, fixture)) {
                        fixtures.push(fixture);
                        console.log(`✓ Added fixture from JSON: ${fixture.homeTeam} vs ${fixture.awayTeam}`);
                      }
                    });
                  }
                } catch (error) {
                  // If JSON parsing fails, try text extraction
                  const fixture = this.extractFixtureFromText(match);
                  if (fixture && !this.isDuplicateFixture(fixtures, fixture)) {
                    fixtures.push(fixture);
                    console.log(`✓ Added fixture from script text: ${fixture.homeTeam} vs ${fixture.awayTeam}`);
                  }
                }
              });
            }
          });
          
          // Look for specific NetballConnect patterns
          if (scriptContent.includes('netball') || scriptContent.includes('livescore') || scriptContent.includes('fixture')) {
            console.log(`Script ${index} contains netball-related content, analyzing...`);
            
            // Look for team names in any format
            const teamNamePatterns = [
              /["']([A-Za-z\s]{3,25})["']\s*(?:vs?|versus|playing|against)\s*["']([A-Za-z\s]{3,25})["']/gi,
              /team["']?\s*[:=]\s*["']([A-Za-z\s]{3,25})["']/gi,
              /name["']?\s*[:=]\s*["']([A-Za-z\s]{3,25})["']/gi
            ];
            
            teamNamePatterns.forEach(pattern => {
              const matches = scriptContent.match(pattern);
              if (matches) {
                console.log('Found potential team names:', matches.slice(0, 5));
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

  private extractFixturesFromJSON(data: any): ScrapedFixture[] {
    const fixtures: ScrapedFixture[] = [];
    
    // Recursive function to search through nested objects/arrays
    const searchForFixtures = (obj: any, path: string = '') => {
      if (typeof obj === 'object' && obj !== null) {
        if (Array.isArray(obj)) {
          obj.forEach((item, index) => searchForFixtures(item, `${path}[${index}]`));
        } else {
          // Look for fixture-like objects
          const keys = Object.keys(obj);
          const hasHomeTeam = keys.some(k => k.toLowerCase().includes('home'));
          const hasAwayTeam = keys.some(k => k.toLowerCase().includes('away'));
          const hasTeams = keys.some(k => k.toLowerCase().includes('team'));
          
          if ((hasHomeTeam && hasAwayTeam) || hasTeams) {
            console.log(`Found potential fixture object at ${path}:`, obj);
            
            // Extract team names
            let homeTeam = '';
            let awayTeam = '';
            let date = '';
            let time = '';
            let venue = '';
            
            for (const [key, value] of Object.entries(obj)) {
              const lowerKey = key.toLowerCase();
              const strValue = typeof value === 'string' ? value : '';
              
              if (lowerKey.includes('home') && lowerKey.includes('team')) homeTeam = strValue;
              else if (lowerKey.includes('away') && lowerKey.includes('team')) awayTeam = strValue;
              else if (lowerKey.includes('team1')) homeTeam = strValue;
              else if (lowerKey.includes('team2')) awayTeam = strValue;
              else if (lowerKey.includes('date')) date = strValue;
              else if (lowerKey.includes('time')) time = strValue;
              else if (lowerKey.includes('venue')) venue = strValue;
            }
            
            if (this.isValidTeamName(homeTeam) && this.isValidTeamName(awayTeam)) {
              fixtures.push({
                homeTeam: this.cleanTeamName(homeTeam),
                awayTeam: this.cleanTeamName(awayTeam),
                date: date || '',
                time: time || '',
                venue: venue || '',
                round: ''
              });
            }
          }
          
          // Continue searching nested objects
          for (const value of Object.values(obj)) {
            searchForFixtures(value, `${path}.${Object.keys(obj).find(k => obj[k] === value)}`);
          }
        }
      }
    };
    
    searchForFixtures(data);
    return fixtures;
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
