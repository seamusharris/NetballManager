import { useMemo } from 'react';
import { GameStat, Player, Roster } from '@shared/schema';

export interface PlayerStats {
  playerId: number;
  gamesPlayed: number;
  goals: number;
  goalsAgainst: number;
  missedGoals: number;
  rebounds: number;
  intercepts: number;
  badPass: number;
  handlingError: number;
  pickUp: number;
  infringement: number;
  rating: number;
  quartersByPosition?: Record<string, number>;
}

/**
 * Shared hook for mapping position-based stats to players
 * Ensures consistent calculation across all components
 */
export function usePlayerStatsMapping(
  players: Player[],
  gameStatsMap: Record<number, GameStat[]>,
  gameRostersMap: Record<number, Roster[]>
): Record<number, PlayerStats> {

  return useMemo(() => {


    const playerStatsMap: Record<number, PlayerStats> = {};

    // Initialize all players with zeros
    players?.forEach(player => {
      playerStatsMap[player.id] = {
        playerId: player.id,
        gamesPlayed: 0,
        goals: 0,
        goalsAgainst: 0,
        missedGoals: 0,
        rebounds: 0,
        intercepts: 0,
        badPass: 0,
        handlingError: 0,
        pickUp: 0,
        infringement: 0,
        rating: 5.0,
        quartersByPosition: {
          'GS': 0, 'GA': 0, 'WA': 0, 'C': 0, 'WD': 0, 'GD': 0, 'GK': 0
        }
      };
    });

    if (!gameRostersMap || !gameStatsMap) {

      return playerStatsMap;
    }

    // Track which games each player participated in (for gamesPlayed count)
    const playerGameIds: Record<number, Set<number>> = {};
    players?.forEach(player => {
      playerGameIds[player.id] = new Set();
    });

    // First pass: determine games played from roster entries
    Object.entries(gameRostersMap).forEach(([gameIdStr, rosters]) => {
      const gameId = parseInt(gameIdStr);

      if (Array.isArray(rosters)) {
        rosters.forEach((roster: Roster) => {
          const playerId = roster.playerId;

          if (playerId && roster.position && playerGameIds[playerId]) {
            playerGameIds[playerId].add(gameId);

            // Count quarters by position
            if (playerStatsMap[playerId]?.quartersByPosition) {
              playerStatsMap[playerId].quartersByPosition[roster.position]++;
            }
          }
        });
      }
    });

    // Set games played count
    players?.forEach(player => {
      if (playerStatsMap[player.id] && playerGameIds[player.id]) {
        playerStatsMap[player.id].gamesPlayed = playerGameIds[player.id].size;
      }
    });

    // Second pass: map stats to players via position lookup
    const dedupedStats: Record<number, Record<string, GameStat>> = {};

    Object.entries(gameStatsMap).forEach(([gameIdStr, stats]) => {
      const gameId = parseInt(gameIdStr);
      const gameRosters = gameRostersMap[gameId] || [];

      stats?.forEach(stat => {
        if (!stat || !stat.position || !stat.quarter || !stat.gameId) return;

        // Additional validation: ensure the stat actually belongs to this game
        if (stat.gameId !== gameId) {

          return;
        }

        // Find which player was playing this position in this quarter
        const rosterEntry = gameRosters.find((r: Roster) => 
          r.position === stat.position && 
          r.quarter === stat.quarter
        );

        if (!rosterEntry || !rosterEntry.playerId) {

          return;
        }

        const playerId = rosterEntry.playerId;

        // Skip if this player is not in our tracked players
        if (!playerStatsMap[playerId]) {

          return;
        }



        const uniqueKey = `${stat.gameId}-${stat.quarter}-${stat.position}`;

        // Initialize player's deduped stats if needed
        if (!dedupedStats[playerId]) {
          dedupedStats[playerId] = {};
        }

        // Only process if we haven't seen this exact stat combination before
        if (!dedupedStats[playerId][uniqueKey]) {
          dedupedStats[playerId][uniqueKey] = stat;

          // Add stats to player totals
          playerStatsMap[playerId].goals += stat.goalsFor || 0;
          playerStatsMap[playerId].goalsAgainst += stat.goalsAgainst || 0;
          playerStatsMap[playerId].missedGoals += stat.missedGoals || 0;
          playerStatsMap[playerId].rebounds += stat.rebounds || 0;
          playerStatsMap[playerId].intercepts += stat.intercepts || 0;
          playerStatsMap[playerId].badPass += stat.badPass || 0;
          playerStatsMap[playerId].handlingError += stat.handlingError || 0;
          playerStatsMap[playerId].pickUp += stat.pickUp || 0;
          playerStatsMap[playerId].infringement += stat.infringement || 0;
        }
      });
    });

    // Calculate ratings by averaging all quarters where player was on court
    players?.forEach(player => {
      if (!playerStatsMap[player.id]) return;

      let totalRating = 0;
      let ratingCount = 0;

      // Find all ratings for this player across all games and quarters
      Object.entries(gameRostersMap || {}).forEach(([gameIdStr, rosters]) => {
        const gameId = parseInt(gameIdStr);
        const gameStats = gameStatsMap[gameId] || [];

        // Find all roster entries for this player (all quarters)
        const playerRosters = rosters.filter((r: Roster) => 
          r.playerId === player.id && 
          r.position &&
          ['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'].includes(r.position) // Only actual playing positions
        );

        playerRosters.forEach((roster: Roster) => {
          // Find the stat for this position and quarter
          const positionStat = gameStats.find((s: any) => 
            s.position === roster.position && 
            s.quarter === roster.quarter &&
            s.rating !== null && 
            s.rating !== undefined
          );

          if (positionStat?.rating !== undefined && positionStat?.rating !== null) {
            totalRating += positionStat.rating;
            ratingCount++;
          }
        });
      });

      // Update with the average rating we calculated, or calculate a default
      if (ratingCount > 0) {
        playerStatsMap[player.id].rating = totalRating / ratingCount;
      } else {
        playerStatsMap[player.id].rating = 5.0; //Default to 5 if there are no explicit ratings
      }
    });


    return playerStatsMap;

  }, [players, gameStatsMap, gameRostersMap]);
}