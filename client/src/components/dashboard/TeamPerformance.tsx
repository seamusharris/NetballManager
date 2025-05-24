import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Game, GameStat } from '@shared/schema';
import { useEffect, useState } from 'react';
import { getWinLoseLabel } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

interface TeamPerformanceProps {
  games: Game[];
  className?: string;
}

export default function TeamPerformance({ games, className }: TeamPerformanceProps) {
  const [quarterPerformance, setQuarterPerformance] = useState<{
    avgTeamScoreByQuarter: Record<number, number>;
    avgOpponentScoreByQuarter: Record<number, number>;
    teamWinRate: number;
    avgTeamScore: number;
    avgOpponentScore: number;
    winPercentage: number;
  }>({
    avgTeamScoreByQuarter: { 1: 0, 2: 0, 3: 0, 4: 0 },
    avgOpponentScoreByQuarter: { 1: 0, 2: 0, 3: 0, 4: 0 },
    teamWinRate: 0,
    avgTeamScore: 0,
    avgOpponentScore: 0,
    winPercentage: 0
  });
  
  // Calculate basic performance metrics
  const totalGames = games.length;
  const completedGamesArray = games.filter(game => game.completed);
  const completedGamesCount = completedGamesArray.length;
  
  // Get game IDs for completed games to fetch their stats
  const completedGameIds = completedGamesArray.map(game => game.id);
  const enableQuery = completedGameIds.length > 0;
  
  // Fetch stats for all completed games using batch endpoint
  const { data: gameStatsMap, isLoading } = useQuery({
    queryKey: ['batchTeamPerformanceStats', completedGameIds.join(',')],
    queryFn: async () => {
      if (completedGameIds.length === 0) {
        return {};
      }
      
      // Use the batch endpoint to fetch all stats in a single request
      const idsParam = completedGameIds.join(',');
      const response = await fetch(`/api/games/stats/batch?ids=${idsParam}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch batch statistics for games ${idsParam}`);
      }
      
      return await response.json();
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
    completedGameIds.forEach(gameId => {
      const gameStats = gameStatsMap[gameId];
      if (!gameStats || gameStats.length === 0) return;
      
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
    
    // Calculate overall metrics
    const winRate = completedGamesCount > 0 ? Math.round((wins / completedGamesCount) * 100) : 0;
    
    // Calculate dynamic average team score from actual game data
    const avgTeamScore = completedGamesCount > 0 
      ? Math.round((totalTeamScore / completedGamesCount) * 10) / 10 
      : 0;
      
    // Calculate average opponent score
    const avgOpponentScore = completedGamesCount > 0
      ? Math.round((totalOpponentScore / completedGamesCount) * 10) / 10
      : 0;
      
    // Calculate winning percentage (different from win rate as it includes draws)
    const totalPoints = wins * 3 + draws * 1; // 3 points for win, 1 for draw
    const maxPossiblePoints = completedGamesCount * 3; // Maximum possible points if all games were won
    const winPercentage = maxPossiblePoints > 0
      ? Math.round((totalPoints / maxPossiblePoints) * 100)
      : 0;
    
    setQuarterPerformance({
      avgTeamScoreByQuarter,
      avgOpponentScoreByQuarter,
      teamWinRate: winRate,
      avgTeamScore,
      avgOpponentScore,
      winPercentage
    });
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStatsMap, isLoading]);
  
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-heading font-semibold text-neutral-dark">Team Performance</h3>
          <Badge variant="outline" className="bg-accent/10 text-accent px-2 py-1 rounded-full text-xs font-semibold">
            Season 2025
          </Badge>
        </div>
        
        {/* Key performance indicators - 3x2 grid for more statistics */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center bg-gray-50 p-3 rounded-lg">
            <p className="text-gray-500 text-sm mb-1">Win Rate</p>
            <p className="text-3xl font-bold text-primary">{quarterPerformance.teamWinRate}%</p>
          </div>
          <div className="text-center bg-gray-50 p-3 rounded-lg">
            <p className="text-gray-500 text-sm mb-1">Team Performance</p>
            <p className="text-3xl font-bold text-primary">{quarterPerformance.winPercentage}%</p>
          </div>
          <div className="text-center bg-gray-50 p-3 rounded-lg">
            <p className="text-gray-500 text-sm mb-1">Games Played</p>
            <p className="text-3xl font-bold text-primary">{completedGamesCount}</p>
          </div>
          
          <div className="text-center bg-gray-50 p-3 rounded-lg">
            <p className="text-gray-500 text-sm mb-1">Avg. Goals For</p>
            <p className="text-3xl font-bold text-success">{quarterPerformance.avgTeamScore}</p>
          </div>
          <div className="text-center bg-gray-50 p-3 rounded-lg">
            <p className="text-gray-500 text-sm mb-1">Avg. Goals Against</p>
            <p className="text-3xl font-bold text-error">{quarterPerformance.avgOpponentScore}</p>
          </div>
          <div className="text-center bg-gray-50 p-3 rounded-lg">
            <p className="text-gray-500 text-sm mb-1">Upcoming Games</p>
            <p className="text-3xl font-bold text-accent">{games.filter(game => !game.completed && !game.isBye).length}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}