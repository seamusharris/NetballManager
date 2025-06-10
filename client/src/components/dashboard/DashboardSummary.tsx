import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import TeamPerformance from '@/components/dashboard/TeamPerformance';
import RecentGames from '@/components/dashboard/RecentGames';
import UpcomingGames from '@/components/dashboard/UpcomingGames';
import QuarterPerformanceWidget from '@/components/dashboard/QuarterPerformanceWidget';
import RecentFormWidget from '@/components/dashboard/RecentFormWidget';
import AdvancedTeamAnalytics from '@/components/dashboard/AdvancedTeamAnalytics';
import { Card, CardContent } from "@/components/ui/card"
import { Users } from "lucide-react"
import { GamesList } from '@/components/games/GamesList';
import PerformanceCharts from '@/components/dashboard/PerformanceCharts';

import OpponentMatchups from './OpponentMatchups';
import TopPlayersWidget from './TopPlayersWidget';
import PlayerAvailabilityWidget from './PlayerAvailabilityWidget';
import QuickActionsWidget from './QuickActionsWidget';
import { Player, Game, Opponent, Season } from '@shared/schema';
import { sortByDate } from '@/lib/utils';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useGameStatuses } from '@/hooks/use-game-statuses';
import { useClub } from '@/contexts/ClubContext';
import { Suspense } from 'react'; // Import Suspense
// Assuming PositionOpponentAnalysis is in the same directory, otherwise adjust path
import PositionOpponentAnalysis from './PositionOpponentAnalysis';
import PlayerAnalyticsWidget from './PlayerAnalyticsWidget';
import { PlayerCombinationAnalysis } from './PlayerCombinationAnalysis';
import { TeamPositionAnalysis } from './TeamPositionAnalysis';
import { UpcomingGameRecommendations } from './UpcomingGameRecommendations';

interface DashboardSummaryProps {
  players: any[];
  games: Game[];
  seasons: any[];
  activeSeason?: any;
  isLoading: boolean;
  centralizedRosters?: Record<number, any[]>;
  centralizedStats?: Record<number, any[]>;
  centralizedScores?: Record<number, any[]>;
  isBatchDataLoading?: boolean;
}

export default function DashboardSummary({ 
  players, 
  games, 
  seasons,
  activeSeason,
  isLoading,
  centralizedRosters,
  centralizedStats,
  centralizedScores,
  isBatchDataLoading
}: DashboardSummaryProps) {
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>('current');
  const queryClient = useQueryClient();
  const { currentClub, currentTeamId, clubTeams, isLoading: clubLoading } = useClub();

  // Derive currentTeam from currentTeamId and clubTeams
  const currentTeam = currentTeamId ? clubTeams?.find(team => team.id === currentTeamId) : null;

  // Early return if club context isn't ready
  if (clubLoading || !currentClub) {
    console.log('DashboardSummary waiting for club context:', { clubLoading, hasCurrentClub: !!currentClub });
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading Dashboard</h2>
          <p className="text-muted-foreground">Initializing club context...</p>
        </div>
      </div>
    );
  }

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

  // Use centralized data passed from parent - no need to fetch again

  // Handle refresh button click - with added logging for debugging
  const handleRefresh = () => {
    console.log("Manual refresh triggered - invalidating all queries");
    // Invalidate all queries instead of specific ones for a complete refresh
    queryClient.invalidateQueries();
    // Update refresh key
    setRefreshKey(prev => prev + 1);
  };

  console.log('=== Dashboard render check ===', { 
    isLoading, 
    hasPlayers: players?.length > 0,
    hasGames: games?.length > 0,
    hasSeasons: seasons?.length > 0,
    activeSeason: activeSeason?.name,
    filteredGamesCount: filteredGames?.length
  });

  // Only show loading if we truly have no data yet
  if (isLoading && (!players?.length || !games?.length || !seasons?.length)) {
    console.log("Dashboard still loading core data, showing loading state");
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading Dashboard</h2>
          <p className="text-muted-foreground">Please wait while we load your team data...</p>
        </div>
      </div>
    );
  }

  console.log('Dashboard proceeding with render - core data loaded');

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

      {/* Performance Metrics - 9 widget grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {isLoading ? (
          Array.from({ length: 9 }).map((_, i) => (
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
              seasonFilter={selectedSeasonId} 
              activeSeason={activeSeason}
              centralizedStats={centralizedStats}
              centralizedScores={centralizedScores}
            />
            <UpcomingGames 
              games={upcomingGames} 
              seasonFilter={selectedSeasonId} 
              activeSeason={activeSeason}
            />
            <QuarterPerformanceWidget 
              games={filteredGames} 
              activeSeason={activeSeason} 
              selectedSeason={selectedSeasonId === 'current' ? activeSeason : seasons.find(s => s.id.toString() === selectedSeasonId)} 
            />
            <RecentFormWidget 
              games={filteredGames} 
              centralizedStats={centralizedStats}
            />
            <OpponentMatchups 
              games={filteredGames} 
              currentClubId={currentClub?.id || 0}
              centralizedStats={centralizedStats}
            />
            <TopPlayersWidget 
              players={players} 
              games={filteredGames}
              seasonFilter={selectedSeasonId}
              activeSeason={activeSeason}
              teamId={currentTeam?.id}
            />
            <PlayerAvailabilityWidget 
              games={filteredGames}
              players={players}
              centralizedRosters={centralizedRosters}
            />
            <QuickActionsWidget />
            <AdvancedTeamAnalytics 
              games={filteredGames} 
              opponents={[]}
              activeSeason={activeSeason} 
              selectedSeason={selectedSeasonId === 'current' ? activeSeason : seasons.find(s => s.id.toString() === selectedSeasonId)} 
              centralizedStats={centralizedStats}
            />
            <PlayerAnalyticsWidget
              players={players}
              games={filteredGames}
              centralizedStats={centralizedStats}
              centralizedRosters={centralizedRosters}
            />
            <PlayerCombinationAnalysis 
              games={filteredGames} 
              players={players} 
              centralizedStats={centralizedStats}
              centralizedRosters={centralizedRosters}
              currentClubId={currentClub?.id || 0}
            />
            <TeamPositionAnalysis 
              games={filteredGames} 
              players={players} 
              centralizedStats={centralizedStats}
              centralizedRosters={centralizedRosters}
              currentClubId={currentClub?.id || 0}
            />
          </>
        )}
      </div>

      {/* Position vs Opponent Analysis - Full Width */}
      <div className="mb-6">
        {isLoading ? (
          <Skeleton className="h-[400px] w-full rounded-lg" />
        ) : (
          <Suspense fallback={<Skeleton className="h-[400px] w-full rounded-lg" />}>
            <PositionOpponentAnalysis 
              seasonId={selectedSeasonId === 'current' ? activeSeason?.id : 
                       selectedSeasonId === 'all' ? undefined : 
                       parseInt(selectedSeasonId)}
              currentClubId={currentClub?.id}
            />
          </Suspense>
        )}
      </div>

      {/* Games List */}
      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
          <Skeleton className="h-[300px] w-full rounded-lg" />
        ) : (
          <GamesList 
            games={filteredGames} 
            className="w-full" 
            centralizedStats={centralizedStats}
            centralizedRosters={centralizedRosters}
          />
        )}
      </div>

      {/* Performance Charts */}
      {isLoading ? (
        <Skeleton className="h-[400px] w-full rounded-lg" />
      ) : (
        <PerformanceCharts 
          games={pastGames} 
          seasonFilter={selectedSeasonId} 
          activeSeason={activeSeason}
          centralizedStats={centralizedStats}
        />
      )}
      {/* Upcoming Game Recommendations Section */}
      {!isLoading && (
        <div className="mt-8">
          <UpcomingGameRecommendations
            games={filteredGames}
            players={players}
            centralizedStats={centralizedStats}
            centralizedRosters={centralizedRosters}
            currentClubId={currentClub?.id}
          />
        </div>
      )}
    </div>
  );
}