/**
 * Player Stats Service
 *
 * Utility functions to aggregate player statistics from position-based stats model.
 *
 * Usage:
 *   import { calculatePlayerStats } from './utils/playerStatsService';
 *   const stats = await calculatePlayerStats(playerId, { groupBy: ['season', 'team', 'club'] });
 *
 * API:
 *   calculatePlayerStats(playerId: number, options?: {
 *     groupBy?: Array<'season' | 'team' | 'club'>,
 *     seasonId?: number,
 *     teamId?: number,
 *     clubId?: number
 *   }): Promise<PlayerStatsBreakdown>
 *
 * Returns:
 *   {
 *     overall: PlayerStats,
 *     bySeason?: Record<string, PlayerStats>,
 *     byTeam?: Record<string, PlayerStats>,
 *     byClub?: Record<string, PlayerStats>
 *   }
 *
 * PlayerStats = { goals: number, assists: number, ... }
 */
import { db } from '../db';
import { gameStats, teams, games, rosters } from '@shared/schema';
import { eq, inArray } from 'drizzle-orm';

export interface PlayerStats {
  goals_for: number;
  goals_against: number;
  missed_goals: number;
  rebounds: number;
  intercepts: number;
  deflections: number;
  turnovers: number;
  gains: number;
  receives: number;
  penalties: number;
  rating: number;
}

export interface PlayerStatsBreakdown {
  overall: PlayerStats;
  bySeason?: Record<string, PlayerStats>;
  byTeam?: Record<string, PlayerStats>;
  byClub?: Record<string, PlayerStats>;
}

export async function calculatePlayerStats(
  playerId: number,
  options?: {
    groupBy?: Array<'season' | 'team' | 'club'>,
    seasonId?: number,
    teamId?: number,
    clubId?: number
  }
): Promise<PlayerStatsBreakdown> {
  // 1. Find all roster entries for this player (to get games, positions, quarters)
  const rosterRows = await db.select().from(rosters).where(eq(rosters.player_id, playerId));
  if (rosterRows.length === 0) {
    return { overall: emptyStats() };
  }

  // 2. Get all relevant games for these roster entries
  const gameIds = Array.from(new Set(rosterRows.map(r => r.game_id)));
  const gameRows = await db.select().from(games).where(inArray(games.id, gameIds));
  // Map game_id to season_id, home_team_id, away_team_id
  const gameMap = Object.fromEntries(gameRows.map(g => [g.id, g]));

  // 3. Get all relevant teams for these games
  const teamIds = Array.from(new Set(gameRows.flatMap(g => [g.home_team_id, g.away_team_id]).filter(Boolean)));
  const teamRows = await db.select().from(teams).where(inArray(teams.id, teamIds));
  // Map team_id to club_id, season_id
  const teamMap = Object.fromEntries(teamRows.map(t => [t.id, t]));

  // 4. Fetch all matching stats for these games
  const stats = await db.select().from(gameStats).where(inArray(gameStats.game_id, gameIds));

  // 5. Aggregate stats for each roster entry
  const overall: PlayerStats = emptyStats();
  const bySeason: Record<string, PlayerStats> = {};
  const byTeam: Record<string, PlayerStats> = {};
  const byClub: Record<string, PlayerStats> = {};

  for (const r of rosterRows) {
    const game = gameMap[r.game_id];
    if (!game) continue;
    // For each stat, match by game_id, position, quarter, and team_id
    // Try both home and away team for this game
    for (const teamType of ['home_team_id', 'away_team_id'] as const) {
      const teamId = game[teamType];
      if (!teamId) continue;
      const stat = stats.find(s =>
        s.game_id === r.game_id &&
        s.position === r.position &&
        s.quarter === r.quarter &&
        s.team_id === teamId
      );
      if (!stat) continue;
      // Add to overall
      addStats(overall, stat);
      // Add to groupings
      if (options?.groupBy?.includes('season')) {
        const seasonKey = String(game.season_id);
        if (!bySeason[seasonKey]) bySeason[seasonKey] = emptyStats();
        addStats(bySeason[seasonKey], stat);
      }
      if (options?.groupBy?.includes('team')) {
        const teamKey = String(teamId);
        if (!byTeam[teamKey]) byTeam[teamKey] = emptyStats();
        addStats(byTeam[teamKey], stat);
      }
      if (options?.groupBy?.includes('club')) {
        const team = teamMap[teamId];
        if (team) {
          const clubKey = String(team.club_id);
          if (!byClub[clubKey]) byClub[clubKey] = emptyStats();
          addStats(byClub[clubKey], stat);
        }
      }
    }
  }

  const result: PlayerStatsBreakdown = { overall };
  if (options?.groupBy?.includes('season')) result.bySeason = bySeason;
  if (options?.groupBy?.includes('team')) result.byTeam = byTeam;
  if (options?.groupBy?.includes('club')) result.byClub = byClub;
  return result;
}

function emptyStats(): PlayerStats {
  return {
    goals_for: 0,
    goals_against: 0,
    missed_goals: 0,
    rebounds: 0,
    intercepts: 0,
    deflections: 0,
    turnovers: 0,
    gains: 0,
    receives: 0,
    penalties: 0,
    rating: 0,
  };
}

function addStats(target: PlayerStats, stat: any) {
  target.goals_for += stat.goals_for || 0;
  target.goals_against += stat.goals_against || 0;
  target.missed_goals += stat.missed_goals || 0;
  target.rebounds += stat.rebounds || 0;
  target.intercepts += stat.intercepts || 0;
  target.deflections += stat.deflections || 0;
  target.turnovers += stat.turnovers || 0;
  target.gains += stat.gains || 0;
  target.receives += stat.receives || 0;
  target.penalties += stat.penalties || 0;
  target.rating += stat.rating || 0;
} 