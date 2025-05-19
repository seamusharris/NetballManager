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
  }>({
    avgTeamScoreByQuarter: { 1: 0, 2: 0, 3: 0, 4: 0 },
    avgOpponentScoreByQuarter: { 1: 0, 2: 0, 3: 0, 4: 0 },
    teamWinRate: 0,
    avgTeamScore: 0
  });
  
  // Calculate basic performance metrics
  const totalGames = games.length;
  const completedGamesArray = games.filter(game => game.completed);
  const completedGamesCount = completedGamesArray.length;
  
  // Get game IDs for completed games to fetch their stats
  const completedGameIds = completedGamesArray.map(game => game.id);
  const enableQuery = completedGameIds.length > 0;
  
  // Fetch stats for all completed games
  const { data: gameStatsMap, isLoading } = useQuery({
    queryKey: ['teamPerformanceStats', ...completedGameIds],
    queryFn: async () => {
      if (completedGameIds.length === 0) {
        return {};
      }
      
      // Fetch stats for each completed game
      const statsPromises = completedGameIds.map(async (gameId) => {
        const response = await fetch(`/api/games/${gameId}/stats?_t=${Date.now()}`);
        const stats = await response.json();
        return { gameId, stats };
      });
      
      const results = await Promise.all(statsPromises);
      
      // Create a map of game ID to stats array
      const statsMap: Record<number, GameStat[]> = {};
      results.forEach(result => {
        statsMap[result.gameId] = result.stats;
      });
      
      return statsMap;
    },
    enabled: enableQuery,
    staleTime: 60000 // 1 minute
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
    const avgTeamScore = completedGamesCount > 0 ? Math.round((totalTeamScore / completedGamesCount) * 10) / 10 : 0;
    
    setQuarterPerformance({
      avgTeamScoreByQuarter,
      avgOpponentScoreByQuarter,
      teamWinRate: winRate,
      avgTeamScore
    });
    
  }, [gameStatsMap, isLoading, completedGameIds, completedGamesCount]);
  
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-heading font-semibold text-neutral-dark">Team Performance</h3>
          <Badge variant="outline" className="bg-accent/10 text-accent px-2 py-1 rounded-full text-xs font-semibold">
            Season 2025
          </Badge>
        </div>
        
        {/* Key performance indicators */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center">
            <p className="text-gray-500 text-sm">Win Rate</p>
            <p className="text-3xl font-bold text-primary mt-1">{quarterPerformance.teamWinRate}%</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-sm">Avg. Score</p>
            <p className="text-3xl font-bold text-primary mt-1">{quarterPerformance.avgTeamScore}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-sm">Games Played</p>
            <p className="text-3xl font-bold text-primary mt-1">{completedGamesCount}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-sm">Upcoming</p>
            <p className="text-3xl font-bold text-primary mt-1">{Math.max(0, totalGames - completedGamesCount)}</p>
          </div>
        </div>
        
        {/* Quarter-by-quarter performance */}
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-500 mb-2">Quarter-by-Quarter Performance</h4>
          <div className="grid grid-cols-4 gap-2 text-sm">
            <div className="text-center bg-gray-50 py-1 font-medium">Q1</div>
            <div className="text-center bg-gray-50 py-1 font-medium">Q2</div>
            <div className="text-center bg-gray-50 py-1 font-medium">Q3</div>
            <div className="text-center bg-gray-50 py-1 font-medium">Q4</div>
            
            {/* Team average scores by quarter */}
            <div className="text-center py-1 font-mono text-primary">
              {quarterPerformance.avgTeamScoreByQuarter[1]}
            </div>
            <div className="text-center py-1 font-mono text-primary">
              {quarterPerformance.avgTeamScoreByQuarter[2]}
            </div>
            <div className="text-center py-1 font-mono text-primary">
              {quarterPerformance.avgTeamScoreByQuarter[3]}
            </div>
            <div className="text-center py-1 font-mono text-primary">
              {quarterPerformance.avgTeamScoreByQuarter[4]}
            </div>
            
            {/* Opponent average scores by quarter */}
            <div className="text-center py-1 font-mono text-gray-500">
              {quarterPerformance.avgOpponentScoreByQuarter[1]}
            </div>
            <div className="text-center py-1 font-mono text-gray-500">
              {quarterPerformance.avgOpponentScoreByQuarter[2]}
            </div>
            <div className="text-center py-1 font-mono text-gray-500">
              {quarterPerformance.avgOpponentScoreByQuarter[3]}
            </div>
            <div className="text-center py-1 font-mono text-gray-500">
              {quarterPerformance.avgOpponentScoreByQuarter[4]}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mt-1">
            <div className="text-center">Our Score</div>
            <div className="text-center">Opponent Score</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}