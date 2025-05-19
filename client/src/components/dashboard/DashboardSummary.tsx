import { useState } from 'react';
import { Link } from 'wouter';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import TeamPerformance from './TeamPerformance';
import RecentGames from './RecentGames';
import UpcomingGames from './UpcomingGames';
import PlayerPerformance from './PlayerPerformance';

import PerformanceCharts from './PerformanceCharts';
import { Player, Game, Opponent } from '@shared/schema';
import { sortByDate } from '@/lib/utils';

interface DashboardSummaryProps {
  players: Player[];
  games: Game[];
  opponents: Opponent[];
  isLoading: boolean;
}

export default function DashboardSummary({ players, games, opponents, isLoading }: DashboardSummaryProps) {
  const [timeFrame, setTimeFrame] = useState('current');
  
  // Sort games by date (most recent first)
  const sortedGames = sortByDate(games);
  
  // Split into past and upcoming games based on date
  const currentDate = new Date().toISOString().split('T')[0];
  const pastGames = sortedGames.filter(game => game.date < currentDate);
  const upcomingGames = sortByDate(sortedGames.filter(game => game.date >= currentDate), true);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading font-bold text-neutral-dark">Dashboard</h2>
        <div className="flex space-x-3">
          <Select value={timeFrame} onValueChange={setTimeFrame}>
            <SelectTrigger className="bg-white border rounded-md w-[150px]">
              <SelectValue placeholder="Current Season" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Season</SelectItem>
              <SelectItem value="last">Last Season</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          
          <Button className="bg-primary hover:bg-primary-light text-white">
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
            <TeamPerformance games={pastGames} />
            <RecentGames games={pastGames} opponents={opponents} />
            <UpcomingGames games={upcomingGames} opponents={opponents} />
          </>
        )}
      </div>

      {/* Player Performance Row */}
      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
          <Skeleton className="h-[300px] w-full rounded-lg" />
        ) : (
          <PlayerPerformance players={players} games={pastGames} className="w-full" />
        )}
      </div>

      {/* Performance Charts */}
      {isLoading ? (
        <Skeleton className="h-[400px] w-full rounded-lg" />
      ) : (
        <PerformanceCharts games={pastGames} />
      )}
    </div>
  );
}
