import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import TeamPerformance from './TeamPerformance';
import PlayerPerformance from './PlayerPerformance';
import RecentGames from './RecentGames';
import GamesList from './GamesList';
import UpcomingGames from './UpcomingGames';
import PerformanceCharts from './PerformanceCharts';
import QuarterPerformanceWidget from './QuarterPerformanceWidget';
import { Card, CardContent } from "@/components/ui/card"
import { Users } from "lucide-react"

import OpponentMatchups from './OpponentMatchups';
import { Player, Game, Opponent, Season } from '@shared/schema';
import { sortByDate } from '@/lib/utils';
import { useQueryClient, useQuery } from '@tanstack/react-query';

interface DashboardSummaryProps {
  players: Player[];
  games: Game[];
  opponents: Opponent[];
  seasons: Season[];
  activeSeason: Season | null;
  isLoading: boolean;
}

export default function DashboardSummary({ 
  players, 
  games, 
  opponents, 
  seasons, 
  activeSeason, 
  isLoading 
}: DashboardSummaryProps) {
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>('current');
  const queryClient = useQueryClient();

  // Set active season as selected by default
  useEffect(() => {
    if (activeSeason && selectedSeasonId === 'current') {
      setSelectedSeasonId('current');
    }
  }, [activeSeason]);

  // Function to get season display name
  const getSeasonDisplayName = (season: Season) => {
    if (season.id === activeSeason?.id) {
      return `${season.name} (Current)`;
    }
    return season.name;
  };

  // Use a state variable to force refresh
  const [refreshKey, setRefreshKey] = useState(0);

  // Update the refresh key when selected season changes
  useEffect(() => {
    // Force a refresh of all query data by invalidating everything
    queryClient.invalidateQueries();

    // Create a small delay to ensure invalidation completes
    setTimeout(() => {
      // Then update the refresh key to trigger component updates
      setRefreshKey(prev => prev + 1);
    }, 100);
  }, [selectedSeasonId, queryClient]);

  // Filter games by selected season
  const filteredGames = games.filter(game => {
    if (selectedSeasonId === 'current' && activeSeason) {
      return game.seasonId === activeSeason.id;
    } else if (selectedSeasonId !== 'current') {
      const seasonId = parseInt(selectedSeasonId);
      return game.seasonId === seasonId;
    }
    return true;
  });

  // Sort games by date (most recent first)
  const sortedGames = sortByDate(filteredGames);

  // Split into past and upcoming games based on date and completion status
  const currentDate = new Date().toISOString().split('T')[0];

  // Include games that are either from past dates OR are completed (even if they're today)
  // Apply season filtering first, then filter by past/future date
  const pastGames = sortedGames.filter(game => game.date < currentDate || game.completed);

  // Only include games that are from today or future AND not completed
  const upcomingGames = sortByDate(sortedGames.filter(game => 
    (game.date >= currentDate && !game.completed)
  ), true);

  // Centralized stats fetching for all games to prevent redundant API calls
  const allGameIds = filteredGames.map(game => game.id);

  const { data: centralizedStats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboardStats', selectedSeasonId, allGameIds.join(',')],
    queryFn: async () => {
      console.log(`Dashboard centralizing stats fetch for ${allGameIds.length} games`);
      const statsMap: Record<number, any[]> = {};

      // Fetch stats for all games
      for (const gameId of allGameIds) {
        try {
          const response = await fetch(`/api/games/${gameId}/stats`);
          if (response.ok) {
            const stats = await response.json();
            statsMap[gameId] = stats;
          } else {
            statsMap[gameId] = [];
          }
        } catch (error) {
          console.error(`Error fetching stats for game ${gameId}:`, error);
          statsMap[gameId] = [];
        }
      }

      console.log(`Dashboard centralized fetch completed for ${Object.keys(statsMap).length} games`);
      return statsMap;
    },
    enabled: allGameIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000 // 15 minutes
  });

  // Handle refresh button click - with added logging for debugging
  const handleRefresh = () => {
    console.log("Manual refresh triggered - invalidating all queries");
    // Invalidate all queries instead of specific ones for a complete refresh
    queryClient.invalidateQueries();
    // Update refresh key
    setRefreshKey(prev => prev + 1);
  };

  if (isLoading || (allGameIds.length > 0 && statsLoading)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Loading Dashboard...</h3>
          <p className="text-gray-500">Please wait while we load your team data.</p>
        </div>
      </div>
    );
  }

  // Ensure we have the necessary data
  const statsMap = centralizedStats || {};
  console.log(`Dashboard rendering with ${Object.keys(statsMap).length} games stats loaded`);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading font-bold text-neutral-dark">Dashboard</h2>
        <div className="flex space-x-3">
          <Select value={selectedSeasonId} onValueChange={setSelectedSeasonId}>
            <SelectTrigger className="bg-white border rounded-md w-[200px]">
              <SelectValue placeholder={activeSeason ? `${activeSeason.name} (Current)` : "Select Season"} />
            </SelectTrigger>
            <SelectContent>
              {seasons.map((season) => (
                <SelectItem key={season.id} value={season.id === activeSeason?.id ? "current" : season.id.toString()}>
                  {getSeasonDisplayName(season)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Show a message if no data is available */}
      {filteredGames.length === 0 && (
        <Card className="p-6 shadow-md mb-6">
          <CardContent className="text-center">
            <h3 className="text-lg font-medium mb-2">No Games Available</h3>
            <p className="text-gray-500 mb-4">
              {selectedSeasonId === 'current' 
                ? 'There are no games in the current season yet.' 
                : 'There are no games in the selected season.'}
            </p>
            <p className="text-sm text-gray-400">
              Add some games to see your team's performance metrics.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {isLoading || statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))
        ) : (
          <>
            <TeamPerformance 
              games={filteredGames} 
              activeSeason={activeSeason} 
              selectedSeason={selectedSeasonId === 'current' ? 'current' : seasons.find(s => s.id.toString() === selectedSeasonId)} 
              centralizedStats={centralizedStats}
            />
            <RecentGames 
              games={pastGames} 
              opponents={opponents} 
              seasonFilter={selectedSeasonId} 
              activeSeason={activeSeason}
              centralizedStats={centralizedStats}
            />
            <UpcomingGames 
              games={upcomingGames} 
              opponents={opponents} 
              seasonFilter={selectedSeasonId} 
              activeSeason={activeSeason}
              centralizedStats={centralizedStats}
            />
            <OpponentMatchups 
              games={filteredGames} 
              opponents={opponents}
              centralizedStats={centralizedStats}
            />
          </>
        )}
      </div>

      {/* Player Performance */}
      <div className="grid grid-cols-1 gap-6">
        {isLoading || statsLoading ? (
          <Skeleton className="h-[300px] w-full rounded-lg" />
        ) : (
          <PlayerPerformance 
            players={players} 
            games={pastGames} 
            className="w-full" 
            seasonFilter={selectedSeasonId} 
            activeSeason={activeSeason}
            centralizedStats={centralizedStats}
          />
        )}
      </div>

      {/* Games List */}
      <div className="grid grid-cols-1 gap-6">
        {isLoading || statsLoading ? (
          <Skeleton className="h-[300px] w-full rounded-lg" />
        ) : (
          <GamesList 
            games={filteredGames} 
            opponents={opponents} 
            className="w-full" 
            centralizedStats={centralizedStats}
          />
        )}
      </div>

      {/* Performance Charts */}
      {isLoading || statsLoading ? (
        <Skeleton className="h-[400px] w-full rounded-lg" />
      ) : (
        <PerformanceCharts 
          games={pastGames} 
          seasonFilter={selectedSeasonId} 
          activeSeason={activeSeason}
          centralizedStats={centralizedStats}
        />
      )}
    </div>
  );
}