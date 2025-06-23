import React, { useState, useEffect, useMemo } from 'react';
import { BaseWidget } from '@/components/ui/base-widget';
import { Game, Player, GameStat } from '@shared/schema';
import { cn, getInitials } from '@/lib/utils';
import { ViewMoreButton } from '@/components/ui/view-more-button';
import { PlayerBox } from '@/components/ui/player-box';

interface TopPlayersWidgetProps {
  players: Player[];
  games: Game[];
  className?: string;
  seasonFilter?: string;
  activeSeason?: any;
  teamId?: number;
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

  // Filter for completed games that allow statistics
  const validGames = filteredGames.filter(game => 
    game.statusIsCompleted === true && 
    game.statusAllowsStatistics === true
  );

  const gameIds = validGames.map(game => game.id);

  // Use centralized data instead of making separate API calls
  const gameStatsMap = centralizedStats || {};
  const gameRostersMap = centralizedRosters || {};

  // Calculate player statistics from centralized data
  useEffect(() => {
    if (!gameStatsMap || !players || players.length === 0) return;

    const newPlayerStatsMap: Record<number, PlayerStats> = {};

    // Initialize stats for team players or all players if no team filter
    const playersToAnalyze = teamId 
      ? players.filter(player => {
          // Check if player appears in any rosters for this team
          return validGames.some(game => {
            const rosters = gameRostersMap[game.id] || [];
            return rosters.some((roster: any) => 
              roster.playerId === player.id &&
              ((game.homeTeamId === teamId) || (game.awayTeamId === teamId))
            );
          });
        })
      : players;

    playersToAnalyze.forEach(player => {
      let gamesPlayed = 0;
      let totalGoals = 0;
      let totalRebounds = 0;
      let totalIntercepts = 0;
      let totalRatings = 0;
      let ratingsCount = 0;

      // Check each valid game for this player's stats
      validGames.forEach(game => {
        const gameStats = gameStatsMap[game.id] || [];
        const gameRosters = gameRostersMap[game.id] || [];

        // Check if player was rostered for this game (for this team if teamId specified)
        const wasRostered = gameRosters.some((roster: any) => {
          if (roster.playerId !== player.id) return false;
          if (!teamId) return true;
          return (game.homeTeamId === teamId) || (game.awayTeamId === teamId);
        });

        if (wasRostered) {
          // Find stats for this player in this game
          const playerGameStats = gameStats.filter((stat: any) => 
            stat.playerId === player.id
          );

          if (playerGameStats.length > 0) {
            gamesPlayed++;

            playerGameStats.forEach((stat: any) => {
              totalGoals += stat.goalsFor || 0;
              totalRebounds += stat.rebounds || 0;
              totalIntercepts += stat.intercepts || 0;

              if (stat.rating && stat.rating > 0) {
                totalRatings += stat.rating;
                ratingsCount++;
              }
            });
          }
        }
      });

      if (gamesPlayed > 0) {
        newPlayerStatsMap[player.id] = {
          playerId: player.id,
          gamesPlayed,
          goals: totalGoals,
          rebounds: totalRebounds,
          intercepts: totalIntercepts,
          rating: ratingsCount > 0 ? totalRatings / ratingsCount : 0
        };
      }
    });

    setPlayerStatsMap(newPlayerStatsMap);
  }, [gameStatsMap, gameRostersMap, players, teamId]);

  // Get players with their stats and sort by performance
  const playersWithStats = players
    .filter(player => playerStatsMap[player.id])
    .map(player => ({
      ...player,
      stats: playerStatsMap[player.id]
    }))
    .sort((a, b) => {
      // Sort by total contribution (goals + rebounds + intercepts)
      const aTotal = a.stats.goals + a.stats.rebounds + a.stats.intercepts;
      const bTotal = b.stats.goals + b.stats.rebounds + b.stats.intercepts;
      return bTotal - aTotal;
    });

  // Take top 3 players
  const topPlayers = playersWithStats.slice(0, 3);

  return (
    <BaseWidget
      title="Top Players"
      icon="Trophy"
      className={cn("", className)}
      actions={
        <ViewMoreButton 
          href="/players" 
          label="View All Players"
        />
      }
    >
      <div className="space-y-3">
        {topPlayers.length > 0 ? (
          topPlayers.map((player, index) => {
            const stats = player.stats;
            const rank = index + 1;
            const totalContributions = stats.goals + stats.rebounds + stats.intercepts;

            return (
              <PlayerBox
                key={player.id}
                playerId={player.id}
                playerName={player.displayName || `${player.firstName} ${player.lastName}`}
                playerColor={player.avatarColor || 'bg-gray-500'}
                displayName={`#${rank} ${player.displayName}`}
                subtitle={`${totalContributions} contributions in ${stats.gamesPlayed} games`}
                onClick={() => `/players/${player.id}`}
                className="transition-all duration-200 hover:scale-[1.02]"
              >
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>{stats.goals}G</span>
                  <span>{stats.rebounds}R</span>
                  <span>{stats.intercepts}I</span>
                  {stats.rating > 0 && <span>{stats.rating.toFixed(1)}★</span>}
                </div>
              </PlayerBox>
            );
          })
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No player statistics available</p>
            <p className="text-sm mt-1">Complete some games to see top performers</p>
          </div>
        )}
      </div>
    </BaseWidget>
  );
}
const calculatePlayerPerformance = (players: Player[], centralizedStats: Record<number, any[]>, games: Game[]) => {
  const playerPerformanceMap: Record<number, { gamesPlayed: number; performanceScore: number }> = {};

  if (!centralizedStats || !players || players.length === 0) return playerPerformanceMap;

    // Create a map of game IDs to easily check if a game is valid
  const validGameIds = games.filter(game => game.statusIsCompleted === true && game.statusAllowsStatistics === true).map(game => game.id);

  players.forEach(player => {
      let gamesPlayed = 0;
      let totalGoals = 0;
      let totalRebounds = 0;
      let totalIntercepts = 0;

      validGameIds.forEach(gameId => {
          const gameStats = centralizedStats[gameId] || [];
          const playerGameStats = gameStats.filter((stat: any) => stat.playerId === player.id);

          if (playerGameStats.length > 0) {
              gamesPlayed++;
              playerGameStats.forEach((stat: any) => {
                  totalGoals += stat.goalsFor || 0;
                  totalRebounds += stat.rebounds || 0;
                  totalIntercepts += stat.intercepts || 0;
              });
          }
      });

      if (gamesPlayed > 0) {
          const performanceScore = totalGoals + totalRebounds + totalIntercepts; // Simple performance score
          playerPerformanceMap[player.id] = {
              gamesPlayed,
              performanceScore,
          };
      }
  });

  return playerPerformanceMap;
};

interface Props {
  players: Player[];
  games: Game[];
  limit: number;
  className?: string;
  seasonFilter?: string;
  activeSeason?: any;
  teamId?: number;
  centralizedStats?: Record<number, any[]>;
  centralizedRosters?: Record<number, any[]>;
}

export function TopPlayersWidgetMemo({
  players,
  games,
  limit,
  className,
  seasonFilter,
  activeSeason,
  teamId,
  centralizedStats,
  centralizedRosters,
}: Props): JSX.Element {
  
  const topPlayers = useMemo(() => {
    if (!players || !centralizedStats || !games) return [];

    const playerPerformanceMap = calculatePlayerPerformance(
      players,
      centralizedStats,
      games
    );

    return Object.entries(playerPerformanceMap)
      .map(([playerId, stats]) => ({
        player: players.find(p => p.id === parseInt(playerId)),
        ...stats
      }))
      .filter(item => item.player && item.gamesPlayed > 0)
      .sort((a, b) => b.performanceScore - a.performanceScore)
      .slice(0, limit);
  }, [players, centralizedStats, games, limit]);

  return (
    <BaseWidget
      title="Top Players"
      icon="Trophy"
      className={cn("", className)}
      actions={
        <ViewMoreButton 
          href="/players" 
          label="View All Players"
        />
      }
    >
      <div className="space-y-3">
        {topPlayers.length > 0 ? (
          topPlayers.map((item: any, index) => {
            const player = item.player;
            const stats = item;
            const rank = index + 1;
            const totalContributions = stats.performanceScore;

            return (
              <PlayerBox
                key={player.id}
                playerId={player.id}
                playerName={player.displayName || `${player.firstName} ${player.lastName}`}
                playerColor={player.avatarColor || 'bg-gray-500'}
                displayName={`#${rank} ${player.displayName}`}
                subtitle={`${totalContributions} contributions in ${stats.gamesPlayed} games`}
                onClick={() => `/players/${player.id}`}
                className="transition-all duration-200 hover:scale-[1.02]"
              >
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  {/* <span>{stats.goals}G</span>
                  <span>{stats.rebounds}R</span>
                  <span>{stats.intercepts}I</span> */}
                  {/* {stats.rating > 0 && <span>{stats.rating.toFixed(1)}★</span>} */}
                </div>
              </PlayerBox>
            );
          })
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No player statistics available</p>
            <p className="text-sm mt-1">Complete some games to see top performers</p>
          </div>
        )}
      </div>
    </BaseWidget>
  );
}