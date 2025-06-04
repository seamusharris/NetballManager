import { useState, useEffect } from 'react';
import { BaseWidget } from '@/components/ui/base-widget';
import { Game, Player, GameStat } from '@shared/schema';
import { cn, getInitials } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { useBatchGameStatistics } from '@/components/statistics/hooks/useBatchGameStatistics';
import { isGameValidForStatistics } from '@/lib/gameFilters';
import { ViewMoreButton } from '@/components/ui/view-more-button';
import { PlayerBox } from '@/components/player/player-box';

interface TopPlayersWidgetProps {
  players: Player[];
  games: Game[];
  className?: string;
  seasonFilter?: string;
  activeSeason?: any;
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
  activeSeason 
}: TopPlayersWidgetProps): JSX.Element {
  const [playerStatsMap, setPlayerStatsMap] = useState<Record<number, PlayerStats>>({});

  // Filter games by selected season and get valid games for statistics
  const filteredGames = games.filter(game => {
    if (seasonFilter === 'current' && activeSeason) {
      return game.seasonId === activeSeason.id;
    } else if (seasonFilter && seasonFilter !== 'current') {
      const seasonId = parseInt(seasonFilter);
      return game.seasonId === seasonId;
    }
    return true;
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

    // Initialize all players with zeros
    players.forEach(player => {
      newPlayerStatsMap[player.id] = {
        playerId: player.id,
        gamesPlayed: 0,
        goals: 0,
        rebounds: 0,
        intercepts: 0,
        rating: 0
      };
    });

    // Count games played from roster data
    if (gameRostersMap && Object.keys(gameRostersMap).length > 0) {
      const playerGameIds: Record<number, Set<number>> = {};

      players.forEach(player => {
        playerGameIds[player.id] = new Set();
      });

      Object.entries(gameRostersMap).forEach(([gameIdStr, rosters]) => {
        const gameId = parseInt(gameIdStr);

        if (Array.isArray(rosters)) {
          const playersOnCourt: Record<number, boolean> = {};

          rosters.forEach((roster: any) => {
            const playerId = roster.playerId;

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

      players.forEach(player => {
        if (playerGameIds[player.id] && newPlayerStatsMap[player.id]) {
          newPlayerStatsMap[player.id].gamesPlayed = playerGameIds[player.id].size;
        }
      });
    }

    // Process game stats
    if (Object.keys(gameStatsMap).length > 0) {
      const dedupedStats: Record<number, Record<string, GameStat>> = {};

      Object.entries(gameStatsMap).forEach(([gameIdStr, stats]) => {
        const gameId = parseInt(gameIdStr);
        const gameRosters = gameRostersMap[gameId] || [];

        stats.forEach(stat => {
          if (!stat || !stat.position || !stat.quarter || !stat.gameId) return;

          const rosterEntry = gameRosters.find((r: any) => 
            r.position === stat.position && 
            r.quarter === stat.quarter
          );

          if (!rosterEntry || !rosterEntry.playerId) return;

          const playerId = rosterEntry.playerId;

          if (!newPlayerStatsMap[playerId]) return;

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

    // Process player ratings
    players.forEach(player => {
      if (!newPlayerStatsMap[player.id]) return;

      let mostRecentRating = null;
      let mostRecentDate = new Date(0);

      Object.entries(gameRostersMap || {}).forEach(([gameIdStr, rosters]) => {
        const gameId = parseInt(gameIdStr);
        const gameDate = new Date(games.find(g => g.id === gameId)?.date || '');

        const playerQ1Rosters = rosters.filter((r: any) => 
          r.playerId === player.id && 
          r.quarter === 1 && 
          r.position
        );

        playerQ1Rosters.forEach((roster: any) => {
          const gameStats = gameStatsMap[gameId] || [];
          const positionStat = gameStats.find((s: GameStat) => 
            s.position === roster.position && 
            s.quarter === 1 &&
            s.rating !== null && 
            s.rating !== undefined
          );

          if (positionStat?.rating !== undefined && positionStat?.rating !== null && gameDate > mostRecentDate) {
            mostRecentRating = positionStat.rating;
            mostRecentDate = gameDate;
          }
        });
      });

      if (mostRecentRating !== null) {
        newPlayerStatsMap[player.id].rating = mostRecentRating;
      } else {
        const calculatedRating = 5 + 
          (newPlayerStatsMap[player.id].goals * 0.2) +
          (newPlayerStatsMap[player.id].rebounds * 0.3) + 
          (newPlayerStatsMap[player.id].intercepts * 0.4);

        newPlayerStatsMap[player.id].rating = Math.min(10, Math.max(1, calculatedRating));
      }
    });

    setPlayerStatsMap(newPlayerStatsMap);
  }, [gameStatsMap, gameRostersMap, isLoading, players, games]);

  // Get top 5 players by rating
  const topPlayers = players
    .map(player => ({
      ...player,
      stats: playerStatsMap[player.id] || {
        playerId: player.id,
        gamesPlayed: 0,
        goals: 0,
        rebounds: 0,
        intercepts: 0,
        rating: 5.0
      }
    }))
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
      </div>
    </BaseWidget>
  );
}