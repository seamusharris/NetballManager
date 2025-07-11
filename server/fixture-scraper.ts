
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
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
  async scrapeFixtures(url: string): Promise<ScrapedFixture[]> {
    try {
      // Fetch the HTML content
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      const fixtures: ScrapedFixture[] = [];
      
      // Try multiple selectors as NetballConnect might use different layouts
      const rows = $('.fixture-row, .game-row, table tbody tr, .fixture-item, .match-row');
      
      rows.each((index, element) => {
        try {
          const $row = $(element);
          
          // Extract data from each row - this will need adjustment based on actual HTML structure
          const dateElement = $row.find('.date, .fixture-date, td:nth-child(1), .match-date').first();
          const timeElement = $row.find('.time, .fixture-time, td:nth-child(2), .match-time').first();
          const homeTeamElement = $row.find('.home-team, td:nth-child(3), .team-home').first();
          const awayTeamElement = $row.find('.away-team, td:nth-child(4), .team-away').first();
          const venueElement = $row.find('.venue, td:nth-child(5), .match-venue').first();
          const roundElement = $row.find('.round, td:nth-child(6), .match-round').first();

          // Also try finding teams in combined elements
          if (!homeTeamElement.length || !awayTeamElement.length) {
            const teamsText = $row.find('.teams, .match-teams').text();
            const vsMatch = teamsText.match(/(.+)\s+v\s+(.+)/i);
            if (vsMatch) {
              const homeTeam = vsMatch[1].trim();
              const awayTeam = vsMatch[2].trim();
              
              if (dateElement.length && homeTeam && awayTeam) {
                fixtures.push({
                  date: dateElement.text().trim(),
                  time: timeElement.text().trim() || '',
                  homeTeam: homeTeam,
                  awayTeam: awayTeam,
                  venue: venueElement.text().trim() || '',
                  round: roundElement.text().trim() || ''
                });
              }
              return;
            }
          }

          if (dateElement.length && homeTeamElement.length && awayTeamElement.length) {
            fixtures.push({
              date: dateElement.text().trim(),
              time: timeElement.text().trim() || '',
              homeTeam: homeTeamElement.text().trim(),
              awayTeam: awayTeamElement.text().trim(),
              venue: venueElement.text().trim() || '',
              round: roundElement.text().trim() || ''
            });
          }
        } catch (error) {
          console.error('Error parsing fixture row:', error);
        }
      });

      return fixtures;
    } catch (error) {
      throw new Error(`Failed to scrape fixtures: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
