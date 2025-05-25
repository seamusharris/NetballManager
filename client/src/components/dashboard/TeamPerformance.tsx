import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Game, GameStat } from '@shared/schema';
import { useEffect, useState } from 'react';
import { getWinLoseLabel } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface TeamPerformanceProps {
  games: Game[];
  className?: string;
  activeSeason?: any; // The current active season
  selectedSeason?: any; // The season selected in the dropdown
}

export default function TeamPerformance({ games, className, activeSeason, selectedSeason }: TeamPerformanceProps) {
  const [quarterPerformance, setQuarterPerformance] = useState<{
    avgTeamScoreByQuarter: Record<number, number>;
    avgOpponentScoreByQuarter: Record<number, number>;
    teamWinRate: number;
    avgTeamScore: number;
    avgOpponentScore: number;
    goalsPercentage: number;
  }>({
    avgTeamScoreByQuarter: { 1: 0, 2: 0, 3: 0, 4: 0 },
    avgOpponentScoreByQuarter: { 1: 0, 2: 0, 3: 0, 4: 0 },
    teamWinRate: 0,
    avgTeamScore: 0,
    avgOpponentScore: 0,
    goalsPercentage: 0
  });
  
  // Calculate basic performance metrics
  const totalGames = games.length;
  const completedGamesArray = games.filter(game => game.completed);
  const completedGamesCount = completedGamesArray.length;
  
  // Add a key to force refresh when seasons change
  const [statsKey, setStatsKey] = useState(0);
  
  // Force refresh when selectedSeason or activeSeason changes
  useEffect(() => {
    // Reset component state
    setQuarterPerformance({
      avgTeamScoreByQuarter: { 1: 0, 2: 0, 3: 0, 4: 0 },
      avgOpponentScoreByQuarter: { 1: 0, 2: 0, 3: 0, 4: 0 },
      teamWinRate: 0,
      avgTeamScore: 0,
      avgOpponentScore: 0,
      goalsPercentage: 0
    });
    
    // Use a timestamp to ensure uniqueness
    const newKey = Date.now();
    setStatsKey(newKey);
    console.log(`TeamPerformance refreshed with key ${newKey} for season: ${selectedSeason?.name || 'current'}`);
  }, [selectedSeason, activeSeason]);
  
  // Get game IDs for completed games to fetch their stats
  const completedGameIds = completedGamesArray.map(game => game.id);
  const enableQuery = completedGameIds.length > 0;
  
  // Fetch stats for all completed games individually since batch endpoint is unreliable
  const { data: gameStatsMap, isLoading } = useQuery({
    queryKey: ['batchTeamPerformanceStats', completedGameIds.join(','), statsKey, selectedSeason],
    queryFn: async () => {
      if (completedGameIds.length === 0) {
        return {};
      }
      
      // Instead of using the batch endpoint, fetch each game's stats individually
      const statsMap: Record<number, any[]> = {};
      
      // Process each game ID sequentially
      for (const gameId of completedGameIds) {
        try {
          const stats = await apiRequest('GET', `/api/games/${gameId}/stats`);
          statsMap[gameId] = stats;
        } catch (error) {
          console.error(`Error fetching stats for game ${gameId}:`, error);
          statsMap[gameId] = []; // Use empty array for failed fetches
        }
      }
      
      console.log(`Fetched stats for ${Object.keys(statsMap).length} games individually`);
      return statsMap;
    },
    enabled: enableQuery,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000    // Keep in cache for 15 minutes
  });
  
  // Calculate team performance metrics from game stats
  useEffect(() => {
    if (!gameStatsMap || isLoading || completedGameIds.length === 0) return;
    
    // Initialize counters
    const quarterScores: Record<number, { team: number, opponent: number, count: number }> = {
      1: { team: 0, opponent: 0, count: 0 },
      2: { team: 0, opponent: 0, count: 0 },
      3: { team: 0, opponent: 0, count: 0 },
      4: { team: 0, opponent: 0, count: 0 }
    };
    
    let totalTeamScore = 0;
    let totalOpponentScore = 0;
    let wins = 0;
    let losses = 0;
    let draws = 0;
    
    // Process each completed game
    let actualGamesWithStats = 0; // Count only games that have statistics
    
    completedGameIds.forEach(gameId => {
      const gameStats = gameStatsMap[gameId];
      if (!gameStats || gameStats.length === 0) return;
      
      // Increment counter for games with actual stats
      actualGamesWithStats++;
      
      // Calculate scores by quarter
      const gameQuarterScores: Record<number, { team: number, opponent: number }> = {
        1: { team: 0, opponent: 0 },
        2: { team: 0, opponent: 0 },
        3: { team: 0, opponent: 0 },
        4: { team: 0, opponent: 0 }
      };
      
      // Sum goals for each quarter
      gameStats.forEach(stat => {
        if (stat.quarter < 1 || stat.quarter > 4) return;
        
        const quarter = stat.quarter;
        gameQuarterScores[quarter].team += stat.goalsFor || 0;
        gameQuarterScores[quarter].opponent += stat.goalsAgainst || 0;
      });
      
      // Add this game's quarter scores to the overall totals
      Object.keys(gameQuarterScores).forEach(quarterStr => {
        const quarter = parseInt(quarterStr);
        const quarterScore = gameQuarterScores[quarter];
        
        quarterScores[quarter].team += quarterScore.team;
        quarterScores[quarter].opponent += quarterScore.opponent;
        quarterScores[quarter].count += 1;
      });
      
      // Calculate total score for this game
      const gameTeamScore = Object.values(gameQuarterScores).reduce((sum, q) => sum + q.team, 0);
      const gameOpponentScore = Object.values(gameQuarterScores).reduce((sum, q) => sum + q.opponent, 0);
      
      totalTeamScore += gameTeamScore;
      totalOpponentScore += gameOpponentScore;
      
      // Determine outcome
      const result = getWinLoseLabel(gameTeamScore, gameOpponentScore);
      if (result === 'Win') wins++;
      else if (result === 'Loss') losses++;
      else draws++;
    });
    
    // Calculate averages
    const avgTeamScoreByQuarter: Record<number, number> = {};
    const avgOpponentScoreByQuarter: Record<number, number> = {};
    
    Object.keys(quarterScores).forEach(quarterStr => {
      const quarter = parseInt(quarterStr);
      const count = quarterScores[quarter].count || 1; // Avoid division by zero
      
      avgTeamScoreByQuarter[quarter] = Math.round((quarterScores[quarter].team / count) * 10) / 10;
      avgOpponentScoreByQuarter[quarter] = Math.round((quarterScores[quarter].opponent / count) * 10) / 10;
    });
    
    // Calculate overall metrics using only games that have actual statistics
    const winRate = actualGamesWithStats > 0 ? Math.round((wins / actualGamesWithStats) * 100) : 0;
    
    // Calculate dynamic average team score from actual game data
    const avgTeamScore = actualGamesWithStats > 0 
      ? Math.round((totalTeamScore / actualGamesWithStats) * 10) / 10 
      : 0;
      
    // Calculate average opponent score
    const avgOpponentScore = actualGamesWithStats > 0
      ? Math.round((totalOpponentScore / actualGamesWithStats) * 10) / 10
      : 0;
      
    // Calculate performance percentage as (goals for / goals against) * 100
    const goalsPercentage = totalOpponentScore > 0
      ? Math.round((totalTeamScore / totalOpponentScore) * 100)
      : 0;
      
    console.log(`Team Performance: ${actualGamesWithStats} games with stats, ${totalTeamScore} total goals for, ${totalOpponentScore} total goals against`);
    
    setQuarterPerformance({
      avgTeamScoreByQuarter,
      avgOpponentScoreByQuarter,
      teamWinRate: winRate,
      avgTeamScore,
      avgOpponentScore,
      goalsPercentage
    });
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStatsMap, isLoading]);
  
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-heading font-semibold text-neutral-dark">Team Performance</h3>
          <Badge variant="outline" className="bg-accent/10 text-accent px-2 py-1 rounded-full text-xs font-semibold">
            {selectedSeason ? 
              (typeof selectedSeason === 'string' && selectedSeason === 'current' && activeSeason ? 
                `${activeSeason.name} (Current)` : 
                (selectedSeason.name || "Selected Season")
              ) : 
              (activeSeason ? activeSeason.name : "Current Season")}
          </Badge>
        </div>
        
        {/* Key performance indicators - 3x2 grid for more statistics */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center bg-gray-50 p-3 rounded-lg">
            <p className="text-gray-500 text-sm mb-1">Win Rate</p>
            <p className="text-3xl font-bold text-primary">{quarterPerformance.teamWinRate}%</p>
          </div>
          <div className="text-center bg-gray-50 p-3 rounded-lg">
            <p className="text-gray-500 text-sm mb-1">Percentage</p>
            <p className="text-3xl font-bold text-primary">{quarterPerformance.goalsPercentage}%</p>
          </div>
          <div className="text-center bg-gray-50 p-3 rounded-lg">
            <p className="text-gray-500 text-sm mb-1">Played</p>
            <p className="text-3xl font-bold text-primary">{completedGamesCount}</p>
          </div>
          
          <div className="text-center bg-gray-50 p-3 rounded-lg">
            <p className="text-gray-500 text-sm mb-1">For</p>
            <p className="text-3xl font-bold text-primary">{quarterPerformance.avgTeamScore}</p>
          </div>
          <div className="text-center bg-gray-50 p-3 rounded-lg">
            <p className="text-gray-500 text-sm mb-1">Against</p>
            <p className="text-3xl font-bold text-primary">{quarterPerformance.avgOpponentScore}</p>
          </div>
          <div className="text-center bg-gray-50 p-3 rounded-lg">
            <p className="text-gray-500 text-sm mb-1">Upcoming</p>
            <p className="text-3xl font-bold text-primary">{games.filter(game => !game.completed && !game.isBye).length}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}