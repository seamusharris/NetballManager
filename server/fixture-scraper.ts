
import puppeteer from 'puppeteer';
import { db } from './db.js';
import { games, teams, gameStatuses } from '../shared/schema.js';
import { eq, and } from 'drizzle-orm';

export interface ScrapedFixture {
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  venue?: string;
  round?: string;
  division?: string;
}

export class NetballConnectScraper {
  private browser: puppeteer.Browser | null = null;

  async init() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async scrapeFixtures(url: string): Promise<ScrapedFixture[]> {
    if (!this.browser) {
      throw new Error('Scraper not initialized. Call init() first.');
    }

    const page = await this.browser.newPage();
    
    try {
      // Navigate to the fixtures page
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      // Wait for fixture content to load
      await page.waitForSelector('.fixture-row, .game-row, table tbody tr', { timeout: 10000 });

      // Extract fixture data
      const fixtures = await page.evaluate(() => {
        const fixtures: ScrapedFixture[] = [];
        
        // Try multiple selectors as NetballConnect might use different layouts
        const rows = document.querySelectorAll('.fixture-row, .game-row, table tbody tr');
        
        rows.forEach(row => {
          try {
            // Extract data from each row - this will need adjustment based on actual HTML structure
            const dateElement = row.querySelector('.date, .fixture-date, td:nth-child(1)');
            const timeElement = row.querySelector('.time, .fixture-time, td:nth-child(2)');
            const homeTeamElement = row.querySelector('.home-team, td:nth-child(3)');
            const awayTeamElement = row.querySelector('.away-team, td:nth-child(4)');
            const venueElement = row.querySelector('.venue, td:nth-child(5)');
            const roundElement = row.querySelector('.round, td:nth-child(6)');

            if (dateElement && homeTeamElement && awayTeamElement) {
              fixtures.push({
                date: dateElement.textContent?.trim() || '',
                time: timeElement?.textContent?.trim() || '',
                homeTeam: homeTeamElement.textContent?.trim() || '',
                awayTeam: awayTeamElement.textContent?.trim() || '',
                venue: venueElement?.textContent?.trim(),
                round: roundElement?.textContent?.trim()
              });
            }
          } catch (error) {
            console.error('Error parsing fixture row:', error);
          }
        });

        return fixtures;
      });

      return fixtures;
    } finally {
      await page.close();
    }
  }

  async importFixtures(url: string, clubId: number, seasonId: number): Promise<{
    imported: number;
    skipped: number;
    errors: string[];
  }> {
    const fixtures = await this.scrapeFixtures(url);
    const results = {
      imported: 0,
      skipped: 0,
      errors: [] as string[]
    };

    // Get default game status for imported games
    const upcomingStatus = await db.select()
      .from(gameStatuses)
      .where(eq(gameStatuses.name, 'upcoming'))
      .limit(1);

    if (upcomingStatus.length === 0) {
      results.errors.push('No "upcoming" game status found in database');
      return results;
    }

    // Get teams for this club
    const clubTeams = await db.select()
      .from(teams)
      .where(eq(teams.clubId, clubId));

    for (const fixture of fixtures) {
      try {
        // Parse date - you may need to adjust format based on NetballConnect's date format
        const gameDate = this.parseDate(fixture.date);
        
        // Find matching team by name similarity
        const homeTeam = this.findTeamByName(clubTeams, fixture.homeTeam);
        const awayTeam = this.findTeamByName(clubTeams, fixture.awayTeam);

        if (!homeTeam && !awayTeam) {
          results.skipped++;
          results.errors.push(`No matching teams found for ${fixture.homeTeam} vs ${fixture.awayTeam}`);
          continue;
        }

        // Use the team that belongs to this club
        const teamId = homeTeam?.id || awayTeam?.id;
        const opponent = homeTeam ? fixture.awayTeam : fixture.homeTeam;
        const isHome = !!homeTeam;

        // Check if game already exists
        const existingGame = await db.select()
          .from(games)
          .where(and(
            eq(games.teamId, teamId!),
            eq(games.date, gameDate),
            eq(games.seasonId, seasonId)
          ))
          .limit(1);

        if (existingGame.length > 0) {
          results.skipped++;
          continue;
        }

        // Create new game
        await db.insert(games).values({
          teamId: teamId!,
          date: gameDate,
          time: fixture.time || '00:00',
          opponent: opponent,
          venue: fixture.venue || '',
          isHome: isHome,
          seasonId: seasonId,
          statusId: upcomingStatus[0].id,
          round: fixture.round || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        results.imported++;
      } catch (error) {
        results.errors.push(`Error importing fixture ${fixture.homeTeam} vs ${fixture.awayTeam}: ${error}`);
      }
    }

    return results;
  }

  private parseDate(dateStr: string): string {
    // Handle common date formats from NetballConnect
    // You may need to adjust this based on the actual format
    try {
      // Try parsing DD/MM/YYYY format first
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        return `${year}-${month}-${day}`;
      }
      
      // Try parsing other formats
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
      
      throw new Error(`Invalid date format: ${dateStr}`);
    } catch (error) {
      throw new Error(`Unable to parse date: ${dateStr}`);
    }
  }

  private findTeamByName(teams: any[], teamName: string): any {
    // Simple name matching - you might want to make this more sophisticated
    return teams.find(team => 
      team.name.toLowerCase().includes(teamName.toLowerCase()) ||
      teamName.toLowerCase().includes(team.name.toLowerCase())
    );
  }
}
