import { useState, useEffect } from 'react';
import { BaseWidget } from '@/components/ui/base-widget';
import { Game, Player, GameStat } from '@shared/schema';
import { cn, getInitials } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { useBatchGameStatistics } from '@/components/statistics/hooks/useBatchGameStatistics';
import { isGameValidForStatistics } from '@/lib/gameFilters';
import { ViewMoreButton } from '@/components/ui/view-more-button';
import { PlayerBox } from '@/components/ui/player-box';

interface TopPlayersWidgetProps {
  players: Player[];
  games: Game[];
  className?: string;
  seasonFilter?: string;
  activeSeason?: any;
  teamId?: number; // Optional team ID for filtering
  centralizedStats?: Record<number, any[]>;
  centralizedRosters?: Record<number, any[]>;
}

interface PlayerStats {
  playerId: number;
  gamesPlayed: number;
  goals: number;
  rebounds: number;
  intercepts: number;
  rating: number;
}

export default function TopPlayersWidget({ 
  players, 
  games, 
  className, 
  seasonFilter, 
  activeSeason,
  teamId,
  centralizedStats,
  centralizedRosters
}: TopPlayersWidgetProps): JSX.Element {
  const [playerStatsMap, setPlayerStatsMap] = useState<Record<number, PlayerStats>>({});

  // Filter games by selected season and team
  const filteredGames = games.filter(game => {
    // Season filter
    let passesSeasonFilter = true;
    if (seasonFilter === 'current' && activeSeason) {
      passesSeasonFilter = game.seasonId === activeSeason.id;
    } else if (seasonFilter && seasonFilter !== 'current') {
      const seasonId = parseInt(seasonFilter);
      passesSeasonFilter = game.seasonId === seasonId;
    }

    // Team filter - only apply if teamId is provided
    let passesTeamFilter = true;
    if (teamId) {
      passesTeamFilter = game.homeTeamId === teamId || game.awayTeamId === teamId;
    }

    return passesSeasonFilter && passesTeamFilter;
  });

  // Filter for completed games that allow statistics using game status table
  const validGames = filteredGames.filter(game => 
    game.statusIsCompleted === true && 
    game.statusAllowsStatistics === true
  );

  const gameIds = validGames.map(game => game.id);
  const enableQuery = gameIds.length > 0;

  // Use the batch stats hook
  const { statsMap: gameStatsMap, isLoading: isLoadingStats } = useBatchGameStatistics(gameIds, false);

  // Fetch roster data
  const { data: gameRostersMap, isLoading: isLoadingRosters } = useQuery({
    queryKey: ['gameRosters', ...gameIds],
    queryFn: async () => {
      if (gameIds.length === 0) {
        return {};
      }

      const rosterPromises = gameIds.map(async (gameId) => {
        const response = await fetch(`/api/games/${gameId}/rosters`);
        const rosters = await response.json();
        return { gameId, rosters };
      });

      const results = await Promise.all(rosterPromises);
      const rostersMap: Record<number, any[]> = {};
      results.forEach(result => {
        rostersMap[result.gameId] = result.rosters;
      });

      return rostersMap;
    },
    enabled: enableQuery,
    staleTime: 0,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: true
  });

  const isLoading = isLoadingStats || isLoadingRosters;

  // Calculate player statistics
  useEffect(() => {
    if (!gameStatsMap || isLoading || players.length === 0) return;

    const newPlayerStatsMap: Record<number, PlayerStats> = {};

    const playerIdsInTeam = new Set<number>();

    // If we have a teamId, we need to find which players actually played for this team
    if (teamId && gameRostersMap && Object.keys(gameRostersMap).length > 0) {
      console.log('TopPlayersWidget: DIAGNOSTIC - Inspecting roster data structure');
      
      Object.entries(gameRostersMap).forEach(([gameIdStr, rosters]) => {
        const gameId = parseInt(gameIdStr);
        const game = validGames.find(g => g.id === gameId);

        // Only consider games where this team played
        if (game && (game.homeTeamId === teamId || game.awayTeamId === teamId)) {
          console.log(`TopPlayersWidget: Game ${gameId} roster entries (${rosters.length}):`, rosters);
          
          if (rosters.length > 0) {
            console.log(`TopPlayersWidget: Sample roster entry structure:`, {
              keys: Object.keys(rosters[0]),
              sample: rosters[0]
            });
          }
          
          rosters.forEach((roster: any, index: number) => {
            console.log(`TopPlayersWidget: Roster entry ${index}:`, {
              id: roster.id,
              gameId: roster.gameId,
              playerId: roster.playerId || roster.player_id,
              position: roster.position,
              quarter: roster.quarter,
              allKeys: Object.keys(roster)
            });
            
            // Try both playerId and player_id fields
            const actualPlayerId = roster.playerId || roster.player_id;
            
            if (actualPlayerId && roster.position && 
                ['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'].includes(roster.position)) {
              playerIdsInTeam.add(actualPlayerId);
              console.log(`TopPlayersWidget: Added player ${actualPlayerId} to team set`);
            } else {
              console.log(`TopPlayersWidget: Skipped roster entry - playerId: ${actualPlayerId}, position: ${roster.position}`);
            }
          });
        }
      });
      
      console.log(`TopPlayersWidget: Final playerIdsInTeam set size: ${playerIdsInTeam.size}`, Array.from(playerIdsInTeam));
    }

    // Initialize player stats for relevant players
    // If teamId is provided but no players found in rosters, fall back to all players
    const playersToProcess = teamId ? 
      (playerIdsInTeam.size > 0 ? players.filter(player => playerIdsInTeam.has(player.id)) : players) : 
      players;

    playersToProcess.forEach(player => {
      newPlayerStatsMap[player.id] = {
        playerId: player.id,
        gamesPlayed: 0,
        goals: 0,
        rebounds: 0,
        intercepts: 0,
        rating: 0
      };
    });

    // Count games played from roster data - only for team-relevant games
    if (gameRostersMap && Object.keys(gameRostersMap).length > 0) {
      const playerGameIds: Record<number, Set<number>> = {};

      playersToProcess.forEach(player => {
        playerGameIds[player.id] = new Set();
      });

      Object.entries(gameRostersMap).forEach(([gameIdStr, rosters]) => {
        const gameId = parseInt(gameIdStr);
        const game = validGames.find(g => g.id === gameId);

        // Only count games where this team played (if teamId filter is active)
        const shouldCountGame = teamId ? 
          (game && (game.homeTeamId === teamId || game.awayTeamId === teamId)) : 
          true;

        if (shouldCountGame && Array.isArray(rosters)) {
          const playersOnCourt: Record<number, boolean> = {};

          rosters.forEach((roster: any) => {
            // Try both playerId and player_id fields
            const playerId = roster.playerId || roster.player_id;

            if (playerId && roster.position && 
                ['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'].includes(roster.position) && 
                playerGameIds[playerId]) {
              playersOnCourt[playerId] = true;
            }
          });

          Object.keys(playersOnCourt).forEach(playerIdStr => {
            const playerId = parseInt(playerIdStr);
            if (playerGameIds[playerId]) {
              playerGameIds[playerId].add(gameId);
            }
          });
        }
      });

      playersToProcess.forEach(player => {
        if (playerGameIds[player.id] && newPlayerStatsMap[player.id]) {
          newPlayerStatsMap[player.id].gamesPlayed = playerGameIds[player.id].size;
        }
      });
    }

    // Process game stats - for Top Players we use live stats
    if (Object.keys(gameStatsMap).length > 0) {
      const dedupedStats: Record<number, Record<string, GameStat>> = {};

      Object.entries(gameStatsMap).forEach(([gameIdStr, stats]) => {
        const gameId = parseInt(gameIdStr);
        const game = validGames.find(g => g.id === gameId);

        // Only process stats for team-relevant games
        const shouldProcessGame = teamId ? 
          (game && (game.homeTeamId === teamId || game.awayTeamId === teamId)) : 
          true;

        if (!shouldProcessGame) return;

        const gameRosters = gameRostersMap?.[gameId] || [];

        // Build roster lookup for this game
        const rosterLookup: Record<string, number> = {};
        gameRosters.forEach((r: any) => {
          // Try both playerId and player_id fields
          const playerId = r.playerId || r.player_id;
          if (r.position && r.quarter && playerId) {
            const key = `${r.position}-${r.quarter}`;
            rosterLookup[key] = playerId;
          }
        });

        // Process stats with proper roster matching
        stats.forEach(stat => {
          if (!stat || !stat.position || !stat.quarter || !stat.gameId) return;

          const rosterKey = `${stat.position}-${stat.quarter}`;
          const playerId = rosterLookup[rosterKey];

          if (!playerId || !newPlayerStatsMap[playerId]) return;

          const uniqueKey = `${stat.gameId}-${stat.quarter}-${stat.position}`;

          if (!dedupedStats[playerId]) {
            dedupedStats[playerId] = {};
          }

          if (!dedupedStats[playerId][uniqueKey] || 
              stat.id > dedupedStats[playerId][uniqueKey].id) {
            dedupedStats[playerId][uniqueKey] = stat;
          }
        });
      });

      Object.entries(dedupedStats).forEach(([playerIdStr, playerQuarterStats]) => {
        const playerId = parseInt(playerIdStr);
        if (!newPlayerStatsMap[playerId]) return;

        Object.values(playerQuarterStats).forEach(stat => {
          newPlayerStatsMap[playerId].goals += stat.goalsFor || 0;
          newPlayerStatsMap[playerId].rebounds += stat.rebounds || 0;
          newPlayerStatsMap[playerId].intercepts += stat.intercepts || 0;
        });
      });
    }

    // Process player ratings - calculate average rating across all quarters played in team-relevant games
    playersToProcess.forEach(player => {
      if (!newPlayerStatsMap[player.id]) return;

      let totalRating = 0;
      let ratingCount = 0;

      // Look through team-relevant games and quarters for this player's ratings
      Object.entries(gameRostersMap || {}).forEach(([gameIdStr, rosters]) => {
        const gameId = parseInt(gameIdStr);
        const game = validGames.find(g => g.id === gameId);

        // Only include ratings from team-relevant games
        const shouldIncludeRating = teamId ? 
          (game && (game.homeTeamId === teamId || game.awayTeamId === teamId)) : 
          true;

        if (!shouldIncludeRating) return;

        const gameStats = gameStatsMap[gameId] || [];

        // Find all roster entries for this player in this game
        const playerRosters = rosters.filter((r: any) => (r.playerId || r.player_id) === player.id);

        playerRosters.forEach((roster: any) => {
          // Find the corresponding stat for this position/quarter
          const positionStat = gameStats.find((s: GameStat) => 
            s.position === roster.position && 
            s.quarter === roster.quarter &&
            s.rating !== null && 
            s.rating !== undefined &&
            s.rating > 0
          );

          if (positionStat?.rating) {
            totalRating += positionStat.rating;
            ratingCount++;
          }
        });
      });

      if (ratingCount > 0) {
        newPlayerStatsMap[player.id].rating = totalRating / ratingCount;
      } else {
        // Calculate rating based on performance stats with better baseline
        const playerStats = newPlayerStatsMap[player.id];
        const gamesPlayed = playerStats.gamesPlayed;

        if (gamesPlayed > 0) {
          // Average per game performance
          const avgGoals = playerStats.goals / gamesPlayed;
          const avgRebounds = playerStats.rebounds / gamesPlayed;
          const avgIntercepts = playerStats.intercepts / gamesPlayed;

          // Better rating calculation starting from 6.0 baseline
          const calculatedRating = 6.0 + 
            (avgGoals * 0.3) +
            (avgRebounds * 0.2) + 
            (avgIntercepts * 0.3);

          newPlayerStatsMap[player.id].rating = Math.min(10, Math.max(5, calculatedRating));
        } else {
          // Default rating for players with no games
          newPlayerStatsMap[player.id].rating = 6.0;
        }
      }
    });

    console.log('TopPlayersWidget: Final playerStatsMap:', Object.entries(newPlayerStatsMap).map(([id, stats]) => ({
      playerId: id,
      displayName: players.find(p => p.id === parseInt(id))?.displayName,
      gamesPlayed: stats.gamesPlayed,
      goals: stats.goals,
      rating: stats.rating
    })));

    setPlayerStatsMap(newPlayerStatsMap);
  }, [gameStatsMap, gameRostersMap, isLoading, players, games]);

  // Get players to show - filter by team membership if teamId is provided
  const playersToShow = teamId ? 
    players.filter(player => {
      const hasStats = playerStatsMap[player.id];
      const hasGames = hasStats && hasStats.gamesPlayed > 0;
      console.log(`TopPlayersWidget: Player ${player.displayName} - hasStats: ${!!hasStats}, gamesPlayed: ${hasStats?.gamesPlayed || 0}, hasGames: ${hasGames}`);
      return hasGames;
    }) : // Only players with stats who actually played
    players;

  const topPlayers = playersToShow
    .map(player => ({
      ...player,
      stats: playerStatsMap[player.id] || {
        playerId: player.id,
        gamesPlayed: 0,
        goals: 0,
        rebounds: 0,
        intercepts: 0,
        rating: 6.0
      }
    }))
    // Filter players based on games played
    .filter(player => {
      // Always require at least some game participation
      return player.stats.gamesPlayed > 0;
    })
    .sort((a, b) => b.stats.rating - a.stats.rating)
    .slice(0, 5);

  const getRatingClass = (rating: number): string => {
    if (rating >= 9) return 'bg-success/20 text-success';
    if (rating >= 8) return 'bg-accent/20 text-accent';
    if (rating >= 7) return 'bg-warning/20 text-warning';
    return 'bg-error/20 text-error';
  };

  return (
    <BaseWidget 
      title="Top Players" 
      className={className}
      contentClassName="px-4 py-6 pb-2"
    >
      {isLoading ? (
        <div className="text-center py-4 text-gray-500">Loading player statistics...</div>
      ) : topPlayers.length === 0 ? (
        <div className="text-center py-4 text-gray-500">No player statistics available</div>
      ) : (
        <div className="space-y-3">
          {topPlayers.map((player, index) => (
            <PlayerBox
              key={player.id}
              playerId={player.id}
              playerName={`${player.firstName} ${player.lastName}`}
              playerColor={player.avatarColor}
              displayName={player.displayName}
              subtitle={`${player.stats.gamesPlayed} games`}
              onClick={() => window.location.href = `/player/${player.id}`}
              className="flex items-center justify-between"
            >
              <div className="flex items-center space-x-4 text-xs ml-auto">
                <div className="text-center">
                  <p className="font-semibold text-gray-700">{player.stats.goals}</p>
                  <p className="text-gray-500">Goals</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-700">{player.stats.intercepts}</p>
                  <p className="text-gray-500">Int</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-700">{player.stats.rebounds}</p>
                  <p className="text-gray-500">Reb</p>
                </div>
                <div className="text-center">
                  <span className={cn("px-2 py-1 rounded text-xs font-semibold", getRatingClass(player.stats.rating))}>
                    {player.stats.rating.toFixed(1)}
                  </span>
                </div>
              </div>
            </PlayerBox>
          ))}
        </div>
      )}

      <div className="mt-4">
        <ViewMoreButton href="/players">
          View all players →
        </ViewMoreButton>
      </div>    </BaseWidget>
  );
}