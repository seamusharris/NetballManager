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
import PlayerCombinationAnalysis from './PlayerCombinationAnalysis';
import TeamPositionAnalysis from './TeamPositionAnalysis';
import UpcomingGameRecommendations from './UpcomingGameRecommendations';

interface DashboardSummaryProps {
  players: any[];
  games: any[];
  seasons: any[];
  activeSeason?: any;
  isLoading: boolean;
  centralizedRosters?: Record<number, any[]>;
  centralizedStats?: Record<number, any[]>;
  centralizedScores?: Record<number, any[]>;
  isBatchDataLoading?: boolean;
  teams?: any[];
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
  isBatchDataLoading,
  teams
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
    // Only invalidate season-specific queries, not all queries
    // This prevents cache thrashing and duplicate API calls
    if (selectedSeasonId !== 'current') {
      queryClient.invalidateQueries({ 
        queryKey: ['seasons', selectedSeasonId],
        exact: false 
      });
    }

    // Update the refresh key to trigger component updates
    setRefreshKey(prev => prev + 1);
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
    <div className="space-y-8">
      

      {/* Enhanced No Data Message */}
      {filteredGames.length === 0 && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-blue-50/50">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Games Available</h3>
            <p className="text-slate-600 mb-4 max-w-md mx-auto">
              {selectedSeasonId === 'current' 
                ? 'There are no games in the current season yet. Start by adding your first game to see performance metrics.' 
                : 'There are no games in the selected season. Try selecting a different season or add new games.'}
            </p>
            <div className="inline-flex items-center gap-2 text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Add games to unlock insights
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Performance Metrics Grid */}
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
              centralizedScores={centralizedScores}
            />
            <RecentGames 
              games={pastGames} 
              seasonFilter={selectedSeasonId} 
              activeSeason={activeSeason}
              centralizedStats={centralizedStats}
              centralizedScores={centralizedScores}
              teams={teams}
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
            <OpponentMatchups 
              games={filteredGames} 
              currentClubId={currentClub?.id || 0}
              centralizedStats={centralizedStats}
              centralizedScores={centralizedScores}
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