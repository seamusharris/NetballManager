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
  const filteredGames = useMemo(() => {
    return games.filter(game => {
      // Season filter
      let passesSeasonFilter = true;
      if (seasonFilter === 'current' && activeSeason) {
        passesSeasonFilter = game.season_id === activeSeason.id;
      } else if (seasonFilter && seasonFilter !== 'current') {
        const filterSeasonId = parseInt(seasonFilter);
        passesSeasonFilter = game.season_id === filterSeasonId;
      }

      // Team filter - only apply if teamId is provided
      let passesTeamFilter = true;
      if (teamId) {
        passesTeamFilter = game.home_team_id === teamId || game.away_team_id === teamId;
      }

      return passesSeasonFilter && passesTeamFilter;
    });
  }, [games, seasonFilter, activeSeason, teamId]);

  // Filter for completed games that allow statistics
  const validGames = useMemo(() => {
    // If status_is_completed/status_allows_statistics do not exist, use status_id mapping
    return filteredGames.filter(game => {
      // If status_is_completed and status_allows_statistics exist, use them
      if ('status_is_completed' in game && 'status_allows_statistics' in game) {
        return game.status_is_completed === true && game.status_allows_statistics === true;
      }
      // Otherwise, use status_id mapping (assuming 3 = completed, 1 = upcoming, etc.)
      // You may need to adjust these mappings based on your schema
      return game.status_id === 3; // 3 = completed
    });
  }, [filteredGames]);

  const gameIds = useMemo(() => {
    return validGames.map(game => game.id);
  }, [validGames]);

  // Use centralized data instead of making separate API calls
  const gameStatsMap = centralizedStats || {};
  const gameRostersMap = centralizedRosters || {};

  // Calculate player statistics from centralized data
  useEffect(() => {
    if (!gameStatsMap || !players || players.length === 0 || !gameRostersMap) return;

    const newPlayerStatsMap: Record<number, PlayerStats> = {};

    // Initialize stats for team players or all players if no team filter
    const playersToAnalyze = teamId 
      ? players.filter(player => {
          // Check if player appears in any rosters for this team
          return validGames.some(game => {
            const rosters = gameRostersMap[game.id] || [];
            return rosters.some((roster: any) => 
              roster.playerId === player.id &&
              (game.home_team_id === teamId || game.away_team_id === teamId)
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
          return game.home_team_id === teamId || game.away_team_id === teamId;
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
  }, [
    gameStatsMap, 
    gameRostersMap, 
    players, 
    teamId, 
    games, 
    seasonFilter, 
    activeSeason
  ]);

  // Get players with their stats and sort by performance
  const playersWithStats = useMemo(() => {
    return players
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
  }, [players, playerStatsMap]);

  // Take top 3 players
  const topPlayers = playersWithStats.slice(0, 3);

  return (
    <BaseWidget
      title="Top Players"
      className={cn("", className)}
    >
      <ViewMoreButton href="/players" />
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
                playerName={player.display_name || `${player.first_name} ${player.last_name}`}
                playerColor={player.avatar_color || 'bg-gray-500'}
                displayName={`#${rank} ${player.display_name}`}
                subtitle={`${totalContributions} contributions in ${stats.gamesPlayed} games`}
                onClick={() => `/players/${player.id}`}
                className="transition-all duration-200 hover:scale-[1.02]"
              />
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