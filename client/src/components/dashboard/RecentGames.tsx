import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'wouter';
import { Game, Opponent, GameStat } from '@shared/schema';
import { formatShortDate } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

interface RecentGamesProps {
  games: Game[];
  opponents: Opponent[];
  className?: string;
  seasonFilter?: string;
  activeSeason?: any;
}

export default function RecentGames({ games, opponents, className, seasonFilter, activeSeason }: RecentGamesProps) {
  // Take the 3 most recent completed games
  const recentGames = games
    .filter(game => game.completed)
    .slice(0, 3);
  
  // Use a single query to fetch stats for all games if there are any
  const gameIds = recentGames.map(game => game.id);
  const enableQuery = gameIds.length > 0;
  
  // Add a state for caching the data that forces component refresh
  const [refreshToken, setRefreshToken] = useState(Date.now());
  
  // Force refresh when props change
  useEffect(() => {
    setRefreshToken(Date.now());
  }, [games, seasonFilter, activeSeason]);
  
  // Query hook to fetch game stats for recent games
  const { 
    data: allGameStats,
    isLoading
  } = useQuery({
    queryKey: ['recentGamesStats', refreshToken, gameIds.join(',')],
    queryFn: async () => {
      if (gameIds.length === 0) return {};
      
      console.log("Recent Games loading scores for season:", seasonFilter || "current", "games:", gameIds.join(','));
      
      // Create a batch request to get stats for all games in one go
      let batchStats = {};
      
      try {
        // First try to use the batch endpoint if available
        const batchEndpoint = `/api/games/stats/batch?gameIds=${gameIds.join(',')}`;
        const batchRes = await fetch(batchEndpoint);
        
        if (batchRes.ok) {
          batchStats = await batchRes.json();
        } else {
          // Fallback to individual requests if batch fails
          const statsPromises = gameIds.map(async gameId => {
            const res = await fetch(`/api/games/${gameId}/stats`);
            const stats = await res.json();
            return { gameId, stats };
          });
          
          const results = await Promise.all(statsPromises);
          
          // Convert to same format as batch endpoint
          results.forEach(({ gameId, stats }) => {
            batchStats[gameId] = stats;
          });
        }
        
        console.log("Recent Games successfully loaded scores for", Object.keys(batchStats).length, "games");
      } catch (error) {
        console.error("Error loading game scores:", error);
      }
      
      return batchStats;
    },
    enabled: enableQuery,
    staleTime: 30000,
  });
  
  // Get opponent name
  const getOpponentName = (opponentId: number | null) => {
    if (!opponentId) return 'BYE Round';
    const opponent = opponents.find(o => o.id === opponentId);
    return opponent ? opponent.teamName : 'Unknown Opponent';
  };
  
  // Determine game result class for styling
  const getResultClass = (game: Game) => {
    if (!allGameStats || !allGameStats[game.id]) return '';
    
    if (game.status === 'forfeit-win') return 'border-success';
    if (game.status === 'forfeit-loss') return 'border-error';
    
    const stats = allGameStats[game.id];
    if (!stats || stats.length === 0) return '';
    
    // Calculate total score
    const teamScore = stats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
    const opponentScore = stats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);
    
    if (teamScore > opponentScore) return 'border-success';
    if (teamScore < opponentScore) return 'border-error';
    return 'border-secondary';
  };
  
  // Get result text (Win, Loss, Draw)
  const getResultText = (game: Game) => {
    if (!allGameStats || !allGameStats[game.id]) return '';
    
    if (game.status === 'forfeit-win') return 'Forfeit Win';
    if (game.status === 'forfeit-loss') return 'Forfeit Loss';
    
    const stats = allGameStats[game.id];
    if (!stats || stats.length === 0) return '';
    
    // Calculate total score
    const teamScore = stats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
    const opponentScore = stats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);
    
    if (teamScore > opponentScore) return `${teamScore}-${opponentScore} Win`;
    if (teamScore < opponentScore) return `${teamScore}-${opponentScore} Loss`;
    return `${teamScore}-${opponentScore} Draw`;
  };
  
  // Get result text color class
  const getResultTextClass = (game: Game) => {
    if (!allGameStats || !allGameStats[game.id]) return '';
    
    if (game.status === 'forfeit-win') return 'text-success';
    if (game.status === 'forfeit-loss') return 'text-error';
    
    const stats = allGameStats[game.id];
    if (!stats || stats.length === 0) return '';
    
    // Calculate total score
    const teamScore = stats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
    const opponentScore = stats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);
    
    if (teamScore > opponentScore) return 'text-success';
    if (teamScore < opponentScore) return 'text-error';
    return 'text-secondary';
  };
  
  return (
    <Card className={className}>
      <CardContent className="p-6 pb-2">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-heading font-semibold text-neutral-dark">Recent Games</h3>
          <Link href="/games" className="text-accent text-sm hover:underline">
            View all
          </Link>
        </div>
        <div className="space-y-8">
          {isLoading ? (
            <p className="text-gray-500 text-center py-4">Loading recent games...</p>
          ) : recentGames.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent games to display</p>
          ) : (
            recentGames.map(game => (
              <Link key={game.id} href={`/game/${game.id}`}>
                <div 
                  className={`flex justify-between items-center p-4 mb-4 mt-2 border-l-4 rounded ${getResultClass(game)} cursor-pointer hover:bg-accent/10 transition-colors`}
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
              </Link>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}