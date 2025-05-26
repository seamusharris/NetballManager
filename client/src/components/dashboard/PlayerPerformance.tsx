import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Game, Player, GameStat, Season } from '@shared/schema';
import { cn, getInitials } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useBatchGameStatistics } from '@/components/statistics/hooks/useBatchGameStatistics';

interface PlayerPerformanceProps {
  players: Player[];
  games: Game[];
  className?: string;
  seasonFilter?: string;
  activeSeason?: Season | null;
}

interface PlayerStats {
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
}

type SortField = 'name' | 'gamesPlayed' | 'goals' | 'goalsAgainst' | 'missedGoals' | 'rebounds' | 'intercepts' | 
                'badPass' | 'handlingError' | 'pickUp' | 'infringement' | 'rating';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export default function PlayerPerformance({ players, games, className, seasonFilter, activeSeason }: PlayerPerformanceProps): JSX.Element {
  const [timeRange, setTimeRange] = useState('season');
  const [playerStatsMap, setPlayerStatsMap] = useState<Record<number, PlayerStats>>({});
  // Add this key to force re-calculation when time range changes or season filter changes
  const [statsKey, setStatsKey] = useState(0);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'rating', direction: 'desc' });

  // Force refresh when seasonFilter or activeSeason changes
  useEffect(() => {
    // Clear the player stats map to force a clean rebuild
    setPlayerStatsMap({});

    // Update statsKey with a timestamp to ensure uniqueness
    setStatsKey(Date.now());

    console.log(`PlayerPerformance refreshed with season: ${seasonFilter}, active: ${activeSeason?.name || 'none'}`);
  }, [seasonFilter, activeSeason]);

  // Filter games by selected season
  const filteredGames = games.filter(game => {
    if (seasonFilter === 'current' && activeSeason) {
      return game.seasonId === activeSeason.id;
    } else if (seasonFilter && seasonFilter !== 'current') {
      const seasonId = parseInt(seasonFilter);
      return game.seasonId === seasonId;
    }
    return true;
  });

  // Get only completed games
  const completedGames = filteredGames.filter(game => game.completed);
  const gameIds = completedGames.map(game => game.id);
  const enableQuery = gameIds.length > 0;

  // Use the batch stats hook instead of individual requests
  const { statsMap: gameStatsMap, isLoading: isLoadingStats } = useBatchGameStatistics(gameIds, false);

  // Fetch roster data for tracking games played
  const { data: gameRostersMap, isLoading: isLoadingRosters } = useQuery({
    queryKey: ['gameRosters', ...gameIds],
    queryFn: async () => {
      if (gameIds.length === 0) {
        return {};
      }

      // Fetch rosters for each game to count games played
      const rosterPromises = gameIds.map(async (gameId) => {
        const response = await fetch(`/api/games/${gameId}/rosters`);
        const rosters = await response.json();
        return { gameId, rosters };
      });

      const results = await Promise.all(rosterPromises);

      // Create a map of game ID to rosters array
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

  // Combined loading state
  const isLoading = isLoadingStats || isLoadingRosters;

  // When game stats or players change, recalculate player statistics
  useEffect(() => {
    if (!gameStatsMap || isLoading || players.length === 0) return;

    const newPlayerStatsMap: Record<number, PlayerStats> = {};

    // Initialize all players with zeros
    players.forEach(player => {
      newPlayerStatsMap[player.id] = {
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
        rating: 0
      };
    });

    // Define a variable to hold filtered game ids for later use
    let filteredGameIds = [...gameIds];
    const now = new Date();

    // First filter out forfeit games - they should not count in player statistics
    const validGames = completedGames.filter(game => game.status !== 'forfeit');

    // Filter games based on time range
    if (timeRange === 'last5') {
      // Sort games by date (newest first) and get the 5 most recent
      filteredGameIds = validGames
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
        .map(game => game.id);
    } 
    else if (timeRange === 'month') {
      // Filter to include only this month's games
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      filteredGameIds = validGames
        .filter(game => {
          const gameDate = new Date(game.date);
          return gameDate.getMonth() === currentMonth && gameDate.getFullYear() === currentYear;
        })
        .map(game => game.id);
    }
    else {
      // Even with 'season' (all games), we still need to filter out forfeit games
      filteredGameIds = validGames.map(game => game.id);
    }

    console.log(`Filtering player performance to ${filteredGameIds.length} games based on time range: ${timeRange}`);

    // Count games played from both rosters and game stats - but only for filtered games
    if ((gameRostersMap && Object.keys(gameRostersMap).length > 0) || 
        (gameStatsMap && Object.keys(gameStatsMap).length > 0)) {

      // Track which games each player participated in
      const playerGameIds: Record<number, Set<number>> = {};

      // Initialize sets for each player
      players.forEach(player => {
        playerGameIds[player.id] = new Set();
      });

      // First, process game rosters to find participation (only for filtered games)
      if (gameRostersMap) {
        Object.entries(gameRostersMap).forEach(([gameIdStr, rosters]) => {
          const gameId = parseInt(gameIdStr);

          // Skip if this game is not in our filtered set
          if (!filteredGameIds.includes(gameId)) return;

          // For each roster entry in this game
          if (Array.isArray(rosters)) {
            // Create a map to track which players were on court (in actual positions) for at least one quarter
            const playersOnCourt: Record<number, boolean> = {};

            rosters.forEach((roster: any) => {
              const playerId = roster.playerId;

              // Only count actual playing positions (GS, GA, WA, C, WD, GD, GK), not "off"
              // This excludes players who were only listed as "off" for all quarters
              if (playerId && roster.position && 
                  ['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'].includes(roster.position) && 
                  playerGameIds[playerId]) {
                playersOnCourt[playerId] = true;
              }
            });

            // Add this game to the player's games played only if they had an on-court position
            Object.keys(playersOnCourt).forEach(playerIdStr => {
              const playerId = parseInt(playerIdStr);
              if (playerGameIds[playerId]) {
                playerGameIds[playerId].add(gameId);
              }
            });
          }
        });
      }

      // Remove this section - we should only count games played based on roster data, not stats
      // This prevents players who have stats but are no longer on the roster from being counted

      // Update games played count for each player
      players.forEach(player => {
        if (playerGameIds[player.id] && newPlayerStatsMap[player.id]) {
          newPlayerStatsMap[player.id].gamesPlayed = playerGameIds[player.id].size;
        }
      });
    }

    // Define a variable to hold filtered game stats
    let filteredGameStats: Record<number, GameStat[]> = {};

    // Process game stats based on selected time range
    if (Object.keys(gameStatsMap).length > 0) {
      // We already have the filtered game IDs from above

      console.log(`Filtering player performance to ${filteredGameIds.length} games based on time range: ${timeRange}`);

      // Filter game stats to only include the games in our filtered list
      filteredGameStats = Object.entries(gameStatsMap)
        .filter(([gameId]) => filteredGameIds.includes(Number(gameId)))
        .reduce((acc, [gameId, stats]) => {
          acc[Number(gameId)] = stats;
          return acc;
        }, {} as Record<number, GameStat[]>);

      // Process combined stats from filtered games
      const allGameStats = Object.values(filteredGameStats).flatMap(stats => stats);

      // Process stats using a de-duplication approach to handle duplicate records
      // Create a map to track the most recent stat entry for each player in each quarter of each game
      const dedupedStats: Record<number, Record<string, GameStat>> = {};

      // In the position-based model, we need to match positions to players via the roster
      // For each game and position/quarter combo, we need to find the player who was in that position

      // Process all stats for filtered games
      Object.entries(filteredGameStats).forEach(([gameIdStr, stats]) => {
        const gameId = parseInt(gameIdStr);
        const gameRosters = gameRostersMap[gameId] || [];

        // Process each stat entry for this game
        stats.forEach(stat => {
          if (!stat || !stat.position || !stat.quarter || !stat.gameId) return;

          // Find which player was playing this position in this quarter
          const rosterEntry = gameRosters.find((r: any) => 
            r.position === stat.position && 
            r.quarter === stat.quarter
          );

          // Skip if no player was assigned to this position
          if (!rosterEntry || !rosterEntry.playerId) return;

          const playerId = rosterEntry.playerId;

          // Skip if this player is not in our tracked players
          if (!newPlayerStatsMap[playerId]) return;

          const uniqueKey = `${stat.gameId}-${stat.quarter}-${stat.position}`; // Unique key per game, quarter, and position

          // Initialize player's stats map if needed
          if (!dedupedStats[playerId]) {
            dedupedStats[playerId] = {};
          }

          // Keep only the most recent stat for this position, player, and quarter in this game
          if (!dedupedStats[playerId][uniqueKey] || 
              stat.id > dedupedStats[playerId][uniqueKey].id) {
            dedupedStats[playerId][uniqueKey] = stat;
          }
        });
      });

      // Now process only the de-duplicated stats to get player totals across all games
      // Create a map of quarters where each player was on court in an actual position for each game
      const onCourtMap: Record<number, Record<number, Record<number, boolean>>> = {};

      // Build the "on court" map from roster data for each player, game, and quarter
      if (gameRostersMap) {
        Object.entries(gameRostersMap).forEach(([gameIdStr, rosters]) => {
          const gameId = parseInt(gameIdStr);

          // Skip if this game is not in our filtered set
          if (!filteredGameIds.includes(gameId)) return;

          // Process each roster entry
          if (Array.isArray(rosters)) {
            rosters.forEach((roster: any) => {
              const playerId = roster.playerId;
              const quarter = roster.quarter;

              // Skip if not a valid player or quarter
              if (!playerId || !quarter || !newPlayerStatsMap[playerId]) return;

              // Only track quarters where player was in an actual playing position
              if (roster.position && ['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'].includes(roster.position)) {
                // Initialize game map for this player if needed
                if (!onCourtMap[playerId]) {
                  onCourtMap[playerId] = {};
                }
                // Initialize quarter map for this game if needed
                if (!onCourtMap[playerId][gameId]) {
                  onCourtMap[playerId][gameId] = {};
                }
                // Mark this quarter as one where player was on court
                onCourtMap[playerId][gameId][quarter] = true;
              }
            });
          }
        });
      }

      // Process stats for each player based on the positions they played
      Object.entries(dedupedStats).forEach(([playerIdStr, playerQuarterStats]) => {
        const playerId = parseInt(playerIdStr);
        if (!newPlayerStatsMap[playerId]) return;

        // Process each position-based stat for this player
        Object.values(playerQuarterStats).forEach(stat => {
          // Add this player's stats from the position they played
          newPlayerStatsMap[playerId].goals += stat.goalsFor || 0;
          newPlayerStatsMap[playerId].goalsAgainst += stat.goalsAgainst || 0;
          newPlayerStatsMap[playerId].missedGoals += stat.missedGoals || 0;
          newPlayerStatsMap[playerId].rebounds += stat.rebounds || 0;
          newPlayerStatsMap[playerId].intercepts += stat.intercepts || 0;
          newPlayerStatsMap[playerId].badPass += stat.badPass || 0;
          newPlayerStatsMap[playerId].handlingError += stat.handlingError || 0;
          newPlayerStatsMap[playerId].pickUp += stat.pickUp || 0;
          newPlayerStatsMap[playerId].infringement += stat.infringement || 0;
        });
      });

      console.log(`Using stats from ${Object.keys(filteredGameStats).length} games (filtered from ${Object.keys(gameStatsMap).length} total) for dashboard player performance`);
    }

    // Process player ratings from position-based stats - use the most recent quarter 1 stats
    players.forEach(player => {
      if (!newPlayerStatsMap[player.id]) return;

      // Find all positions this player has played in the first quarter of any game
      let mostRecentRating = null;
      let mostRecentDate = new Date(0); // Start with oldest possible date

      // Get the appropriate stats source - prefer filtered stats if available
      const statsToUse = filteredGameStats && Object.keys(filteredGameStats).length > 0 
        ? filteredGameStats 
        : gameStatsMap;

      // Look through all filtered games
      Object.entries(gameRostersMap || {}).forEach(([gameIdStr, rosters]) => {
        const gameId = parseInt(gameIdStr);

        // Skip if not in filtered games
        if (!filteredGameIds.includes(gameId)) return;

        const gameDate = new Date(games.find(g => g.id === gameId)?.date || '');

        // Find quarter 1 roster entries for this player
        const playerQ1Rosters = rosters.filter((r: any) => 
          r.playerId === player.id && 
          r.quarter === 1 && 
          r.position // Make sure they had a position
        );

        // For each position this player played in quarter 1
        playerQ1Rosters.forEach((roster: any) => {
          // Find the stats for this position and quarter
          const gameStats = statsToUse[gameId] || [];
          const positionStat = gameStats.find((s: GameStat) => 
            s.position === roster.position && 
            s.quarter === 1 &&
            s.rating !== null && 
            s.rating !== undefined
          );

          // If found and has a rating and is more recent than what we have
          if (positionStat?.rating !== undefined && positionStat?.rating !== null && gameDate > mostRecentDate) {
            mostRecentRating = positionStat.rating;
            mostRecentDate = gameDate;
          }
        });
      });

      // Update with the most recent rating we found, or calculate a default
      if (mostRecentRating !== null) {
        newPlayerStatsMap[player.id].rating = mostRecentRating;
      } else {
        // Calculate default rating based on performance stats
        const calculatedRating = 5 + 
          (newPlayerStatsMap[player.id].goals * 0.2) +
          (newPlayerStatsMap[player.id].rebounds * 0.3) + 
          (newPlayerStatsMap[player.id].intercepts * 0.4);

        newPlayerStatsMap[player.id].rating = Math.min(10, Math.max(1, calculatedRating));
      }
    });

    setPlayerStatsMap(newPlayerStatsMap);
  }, [gameStatsMap, isLoading, players]);

  // Get the player's stored avatar color
  const getAvatarColor = (player: Player): string => {
    // If the player has a stored avatar color, use it
    if (player?.avatarColor) {
      return player.avatarColor;
    }

    // Default fallback if the player has no stored color
    return 'bg-gray-500';
  };

  const getRatingClass = (rating: number): string => {
    if (rating >= 9) return 'bg-success/20 text-success';
    if (rating >= 8) return 'bg-accent/20 text-accent';
    if (rating >= 7) return 'bg-warning/20 text-warning';
    return 'bg-error/20 text-error';
  };

  // Sort handler function
  const handleSort = (field: SortField) => {
    // If clicking the same field, toggle direction, otherwise set to default (desc)
    const direction = 
      sortConfig.field === field && sortConfig.direction === 'desc' ? 'asc' : 'desc';

    setSortConfig({ field, direction });
  };

  // Get players with their stats
  const playersWithStats = players
    .map(player => ({
      ...player,
      stats: playerStatsMap[player.id] || {
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
        rating: 5.0
      }
    }))
    .sort((a, b) => {
      // Sort by the selected field and direction
      const { field, direction } = sortConfig;

      // Handle name sorting separately
      if (field === 'name') {
        if (direction === 'asc') {
          return a.displayName.localeCompare(b.displayName);
        } else {
          return b.displayName.localeCompare(a.displayName);
        }
      }

      // For numeric fields, sort numerically
      const aValue = field === 'rating' ? a.stats[field] : a.stats[field];
      const bValue = field === 'rating' ? b.stats[field] : b.stats[field];

      if (direction === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

  // Column definitions with categories
  const statCategories = [
    { 
      name: 'Games', 
      fields: [
        { field: 'gamesPlayed', label: 'Played' },
        { field: 'rating', label: 'Rating' },
      ]
    },
    { 
      name: 'Shooting', 
      fields: [
        { field: 'goals', label: 'For' },
        { field: 'goalsAgainst', label: 'Agn' },
        { field: 'missedGoals', label: 'Miss' },
      ]
    },
    { 
      name: 'Defense', 
      fields: [
        { field: 'intercepts', label: 'Int' },
        { field: 'rebounds', label: 'Reb' },
        { field: 'pickUp', label: 'Pick' },
      ]
    },
    { 
      name: 'Errors', 
      fields: [
        { field: 'badPass', label: 'Pass' },
        { field: 'handlingError', label: 'Hand' },
        { field: 'infringement', label: 'Pen' },
      ]
    },
  ];

  // Helper to render sort indicator
  const renderSortIndicator = (field: SortField) => {
    if (sortConfig.field !== field) {
      return <ArrowUpDown className="ml-1 h-3 w-3 inline" />;
    }

    return sortConfig.direction === 'asc' ? 
      <ArrowUp className="ml-1 h-3 w-3 inline text-primary" /> : 
      <ArrowDown className="ml-1 h-3 w-3 inline text-primary" />;
  };

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-heading font-semibold text-neutral-dark">Player Performance</h3>

          <Select 
            value={timeRange} 
            onValueChange={(value) => {
              setTimeRange(value);
              // Force a recalculation when time range changes
              setStatsKey(prev => prev + 1);
            }}
          >
            <SelectTrigger className="bg-white border rounded-md w-[140px] h-8 text-sm">
              <SelectValue placeholder="Last 5 Games" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last5">Last 5 Games</SelectItem>
              <SelectItem value="season">This Season</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto border-t border-l border-b rounded-md">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead 
                  className="min-w-[120px] border-b cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('name')}
                >
                  Player {renderSortIndicator('name')}
                </TableHead>
                <TableHead className="text-center w-10 border-r border-b"></TableHead>

                {/* Stat category headers */}
                {statCategories.map((category, index) => (
                  <TableHead 
                    key={category.name} 
                    colSpan={category.fields.length}
                    className={`text-center bg-blue-50 border-r border-b ${index === 0 ? 'border-l' : ''}`}
                  >
                    {category.name}
                  </TableHead>
                ))}
              </TableRow>

              {/* Stat field headers */}
              <TableRow>
                <TableHead className="border-b"></TableHead>
                <TableHead className="border-r border-b"></TableHead>

                {statCategories.map((category, categoryIndex) => (
                  category.fields.map((field, fieldIndex) => {
                    // Add right border to last column in each category
                    const isLastInCategory = fieldIndex === category.fields.length - 1;
                    // Add left border to first column in each category (except the first category)
                    const isFirstInCategory = fieldIndex === 0;
                    const needsLeftBorder = isFirstInCategory && categoryIndex > 0;

                    return (
                      <TableHead 
                        key={field.field}
                        className={`text-center px-1 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50 border-b ${isLastInCategory ? 'border-r' : ''} ${needsLeftBorder ? 'border-l' : ''} ${sortConfig.field === field.field ? 'bg-gray-50' : ''}`}
                        onClick={() => handleSort(field.field as SortField)}
                      >
                        {field.label} {renderSortIndicator(field.field as SortField)}
                      </TableHead>
                    );
                  })
                ))}
              </TableRow>
            </TableHeader>

            <TableBody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-4 text-gray-500 border-b">Loading player statistics...</TableCell>
                </TableRow>
              ) : playersWithStats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-4 text-gray-500 border-b">No player statistics available</TableCell>
                </TableRow>
              ) : (
                playersWithStats.map((player, playerIndex) => (
                  <TableRow 
                    key={player.id} 
                    className={`hover:bg-gray-100 cursor-pointer transition-colors duration-150 ${playerIndex === playersWithStats.length - 1 ? "" : "border-b"}`}
                    onClick={() => window.location.href = `/player/${player.id}`}
                  >
                    {/* Player column */}
                    <TableCell className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-white", player.avatarColor || 'bg-gray-500')}>
                          <span className="text-xs font-semibold">
                            {getInitials(player.firstName, player.lastName)}
                          </span>
                        </div>
                        <div className="ml-3">
                          <span className="text-sm font-medium text-blue-600">
                            {player.displayName}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="border-r"></TableCell>

                    {/* Games Played */}
                    <TableCell className="px-2 py-2 whitespace-nowrap text-sm text-center font-mono border-r">
                      {player.stats.gamesPlayed}
                    </TableCell>

                    {/* Rating */}
                    <TableCell className="px-2 py-2 whitespace-nowrap text-center border-r">
                      <span className={cn("text-sm font-mono", getRatingClass(player.stats.rating))}>
                        {player.stats.rating.toFixed(1)}
                      </span>
                    </TableCell>

                    {/* Shooting stats */}
                    <TableCell className="px-2 py-2 whitespace-nowrap text-sm text-center font-mono">
                      {player.stats.goals}
                    </TableCell>
                    <TableCell className="px-2 py-2 whitespace-nowrap text-sm text-center font-mono">
                      {player.stats.goalsAgainst}
                    </TableCell>
                    <TableCell className="px-2 py-2 whitespace-nowrap text-sm text-center font-mono border-r">
                      {player.stats.missedGoals}
                    </TableCell>

                    {/* Defense stats */}
                    <TableCell className="px-2 py-2 whitespace-nowrap text-sm text-center font-mono">
                      {player.stats.intercepts}
                    </TableCell>
                    <TableCell className="px-2 py-2 whitespace-nowrap text-sm text-center font-mono">
                      {player.stats.rebounds}
                    </TableCell>
                    <TableCell className="px-2 py-2 whitespace-nowrap text-sm text-center font-mono border-r">
                      {player.stats.pickUp}
                    </TableCell>

                    {/* Errors stats */}
                    <TableCell className="px-2 py-2 whitespace-nowrap text-sm text-center font-mono">
                      {player.stats.badPass}
                    </TableCell>
                    <TableCell className="px-2 py-2 whitespace-nowrap text-sm text-center font-mono">
                      {player.stats.handlingError}
                    </TableCell>
                    <TableCell className="px-2 py-2 whitespace-nowrap text-sm text-center font-mono border-r">
                      {player.stats.infringement}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}