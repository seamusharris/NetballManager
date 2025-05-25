import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import TeamPerformance from './TeamPerformance';
import RecentGames from './RecentGames';
import UpcomingGames from './UpcomingGames';
import PlayerPerformance from './PlayerPerformance';
import GamesList from './GamesList';

import PerformanceCharts from './PerformanceCharts';
import { Player, Game, Opponent, Season } from '@shared/schema';
import { sortByDate } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';

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
  const pastGames = sortedGames.filter(game => game.date < currentDate || game.completed);
  
  // Only include games that are from today or future AND not completed
  const upcomingGames = sortByDate(sortedGames.filter(game => 
    (game.date >= currentDate && !game.completed)
  ), true);
  
  // Handle refresh button click
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/games'] });
    queryClient.invalidateQueries({ queryKey: ['/api/players'] });
    queryClient.invalidateQueries({ queryKey: ['/api/opponents'] });
    queryClient.invalidateQueries({ queryKey: ['/api/seasons'] });
  };
  
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
          
          <Button 
            className="bg-primary hover:bg-primary-light text-white"
            onClick={handleRefresh}
          >
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
        </div>
      </div>

      {/* Team Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading ? (
          <>
            <Skeleton className="h-[200px] w-full rounded-lg" />
            <Skeleton className="h-[200px] w-full rounded-lg" />
            <Skeleton className="h-[200px] w-full rounded-lg" />
          </>
        ) : (
          <>
            <TeamPerformance games={filteredGames} />
            <RecentGames games={pastGames} opponents={opponents} />
            <UpcomingGames games={upcomingGames} opponents={opponents} />
          </>
        )}
      </div>

      {/* Games List */}
      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
          <Skeleton className="h-[300px] w-full rounded-lg" />
        ) : (
          <GamesList games={filteredGames} opponents={opponents} className="w-full" />
        )}
      </div>

      {/* Player Performance Row */}
      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
          <Skeleton className="h-[300px] w-full rounded-lg" />
        ) : (
          <PlayerPerformance players={players} games={pastGames} className="w-full" seasonFilter={selectedSeasonId} activeSeason={activeSeason} />
        )}
      </div>

      {/* Performance Charts */}
      {isLoading ? (
        <Skeleton className="h-[400px] w-full rounded-lg" />
      ) : (
        <PerformanceCharts games={pastGames} seasonFilter={selectedSeasonId} activeSeason={activeSeason} />
      )}
    </div>
  );
}
