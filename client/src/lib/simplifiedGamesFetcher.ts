import { apiClient } from './apiClient';

export interface SimpleGame {
  id: number;
  date: string;
  round?: number;
  status: 'completed' | 'scheduled' | 'forfeit-win' | 'forfeit-loss' | 'bye';
  homeTeam: { id: number; name: string };
  awayTeam?: { id: number; name: string }; // Optional for BYE games
  quarterScores?: Array<{ homeScore: number; awayScore: number }>;
  hasStats: boolean;
}

export interface SimplifiedGamesData {
  games: SimpleGame[];
  isLoading: boolean;
  error?: string;
}

/**
 * Simplified games fetcher for DISPLAY ONLY (Level 1)
 * 
 * Use Cases:
 * - Games list pages
 * - Dashboard game widgets
 * - Quick game overviews
 * 
 * What it provides:
 * - Essential game fields only
 * - Team names included in query (no N+1 lookups)
 * - Quarter scores for basic breakdown
 * - Simple boolean for stats existence
 * 
 * What it DOESN'T provide:
 * - Detailed player statistics (use /api/games/:id/statistics)
 * - Attack/defense breakdowns (use /api/games/:id/statistics)
 * - Roster information (use /api/games/:id/rosters)
 * - Historical analysis data (use /api/teams/:id/games)
 */
export class SimplifiedGamesFetcher {
  
  static async fetchGamesForClub(clubId: number, teamId?: number): Promise<SimpleGame[]> {
    try {
      // Single optimized query that returns everything we need
      const endpoint = teamId 
        ? `/api/teams/${teamId}/games/simplified`
        : `/api/clubs/${clubId}/games/simplified`;
      
      const response = await apiClient.get(endpoint);
      
      // Transform API response to our simple format
      return response.map((game: any) => ({
        id: game.id,
        date: game.date,
        round: parseInt(game.round) || undefined,
        status: this.mapStatus(game.status_name || game.statusName, game.status_is_completed || game.statusIsCompleted),
        homeTeam: { 
          id: game.home_team_id || game.homeTeamId, 
          name: game.home_team_name || game.homeTeamName
        },
        awayTeam: (game.away_team_id || game.awayTeamId) ? { 
          id: game.away_team_id || game.awayTeamId, 
          name: game.away_team_name || game.awayTeamName
        } : undefined,
        quarterScores: Array.isArray(game.quarter_scores || game.quarterScores) ? (game.quarter_scores || game.quarterScores) : [],
        hasStats: (game.stats_count || game.statsCount || 0) > 0
      }));
      
    } catch (error) {
      console.error('Error fetching simplified games:', error);
      throw error;
    }
  }
  
  private static mapStatus(statusName: string, isCompleted: boolean): SimpleGame['status'] {
    if (statusName === 'bye') return 'bye';
    if (statusName === 'forfeit-win') return 'forfeit-win';
    if (statusName === 'forfeit-loss') return 'forfeit-loss';
    if (isCompleted) return 'completed';
    return 'scheduled';
  }
}