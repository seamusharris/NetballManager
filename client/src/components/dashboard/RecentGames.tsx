import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'wouter';
import { Game, Opponent, GameStat } from '@shared/schema';
import { formatShortDate } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

interface RecentGamesProps {
  games: Game[];
  opponents: Opponent[];
  className?: string;
}

export default function RecentGames({ games, opponents, className }: RecentGamesProps) {
  // Take the 3 most recent completed games
  const recentGames = games
    .filter(game => game.completed)
    .slice(0, 3);
  
  // Use a single query to fetch stats for all games if there are any
  const gameIds = recentGames.map(game => game.id);
  const enableQuery = gameIds.length > 0;
  
  // Cache game stats using React Query
  const { data: allGameStats, isLoading } = useQuery({
    queryKey: ['gameStats', ...gameIds],
    queryFn: async () => {
      if (gameIds.length === 0) {
        return {};
      }
      
      // Create a map to store stats by game ID
      const statsMap: Record<number, GameStat[]> = {};
      
      // Fetch stats for each game
      const statsPromises = gameIds.map(async (gameId) => {
        const response = await fetch(`/api/games/${gameId}/stats`);
        const stats = await response.json();
        return { gameId, stats };
      });
      
      const results = await Promise.all(statsPromises);
      
      // Organize stats by game ID
      results.forEach(result => {
        statsMap[result.gameId] = result.stats;
      });
      
      return statsMap;
    },
    enabled: enableQuery,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 15 * 60 * 1000,   // Keep data in cache for 15 minutes
  });
  
  const getOpponentName = (opponentId: number | null) => {
    if (!opponentId) return 'Unknown Opponent';
    const opponent = opponents.find(o => o.id === opponentId);
    return opponent ? opponent.teamName : 'Unknown Opponent';
  };
  
  // Calculate scores from game stats
  const getScores = (game: Game): [number, number] => {
    const gameStatsList = allGameStats?.[game.id] || [];
    
    // If no stats found, return 0-0
    if (gameStatsList.length === 0) {
      return [0, 0];
    }
    
    // Use the same calculation method as in GamesList.tsx
    // First, calculate goals by quarter
    const quarterGoals: Record<number, { for: number, against: number }> = {
      1: { for: 0, against: 0 },
      2: { for: 0, against: 0 },
      3: { for: 0, against: 0 },
      4: { for: 0, against: 0 }
    };
    
    // Create a map of the latest stats for each player and quarter combination
    const latestPlayerStats: Record<string, GameStat> = {};
    
    // Find the latest stat for each player and quarter
    gameStatsList.forEach(stat => {
      const key = `${stat.playerId}-${stat.quarter}`;
      if (!latestPlayerStats[key] || stat.id > latestPlayerStats[key].id) {
        latestPlayerStats[key] = stat;
      }
    });
    
    // Use only the latest stats for calculating quarter goals
    Object.values(latestPlayerStats).forEach(stat => {
      if (stat.quarter >= 1 && stat.quarter <= 4) {
        quarterGoals[stat.quarter].for += (stat.goalsFor || 0);
        quarterGoals[stat.quarter].against += (stat.goalsAgainst || 0);
      }
    });
    
    // Calculate total goals
    const teamScore = Object.values(quarterGoals).reduce((sum, q) => sum + q.for, 0);
    const opponentScore = Object.values(quarterGoals).reduce((sum, q) => sum + q.against, 0);
    
    return [teamScore, opponentScore];
  };
  
  const getResultClass = (game: Game) => {
    // Always use blue accent styling to match upcoming games
    return 'border-accent bg-accent/5';
  };
  
  const getResultText = (game: Game) => {
    const [teamScore, opponentScore] = getScores(game);
    if (teamScore > opponentScore) return `W ${teamScore}-${opponentScore}`;
    if (teamScore < opponentScore) return `L ${teamScore}-${opponentScore}`;
    return `D ${teamScore}-${opponentScore}`;
  };
  
  const getResultTextClass = (game: Game) => {
    const [teamScore, opponentScore] = getScores(game);
    if (teamScore > opponentScore) return 'text-success';
    if (teamScore < opponentScore) return 'text-error';
    return 'text-warning';
  };
  
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-heading font-semibold text-neutral-dark">Recent Games</h3>
          <Link href="/games">
            <a className="text-accent text-sm hover:underline">View all</a>
          </Link>
        </div>
        <div className="space-y-4">
          {isLoading ? (
            <p className="text-gray-500 text-center py-4">Loading recent games...</p>
          ) : recentGames.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent games to display</p>
          ) : (
            recentGames.map(game => (
              <div 
                key={game.id} 
                className={`flex justify-between items-center p-3 border-l-4 rounded ${getResultClass(game)}`}
              >
                <div>
                  <p className="font-semibold">vs. {getOpponentName(game.opponentId)}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-500">{formatShortDate(game.date)}</p>
                    {game.round && (
                      <span className="text-xs px-1.5 py-0.5 bg-secondary/10 text-secondary rounded-full">
                        Round {game.round}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${getResultTextClass(game)}`}>{getResultText(game)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}