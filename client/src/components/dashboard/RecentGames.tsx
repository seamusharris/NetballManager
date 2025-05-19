import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'wouter';
import { Game, Opponent, GameStat } from '@shared/schema';
import { formatShortDate } from '@/lib/utils';

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
    
  // State to store game stats for each game
  const [gameStats, setGameStats] = useState<Record<number, GameStat[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch game statistics for each completed game
  useEffect(() => {
    const fetchAllGameStats = async () => {
      if (recentGames.length === 0) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      
      try {
        const statsPromises = recentGames.map(game => 
          fetch(`/api/games/${game.id}/stats`)
            .then(res => res.json())
            .then(stats => ({ gameId: game.id, stats }))
        );
        
        const results = await Promise.all(statsPromises);
        const statsMap: Record<number, GameStat[]> = {};
        
        results.forEach(result => {
          statsMap[result.gameId] = result.stats;
        });
        
        setGameStats(statsMap);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching game stats:", error);
        setIsLoading(false);
      }
    };
    
    fetchAllGameStats();
  }, [recentGames]);
  
  const getOpponentName = (opponentId: number) => {
    const opponent = opponents.find(o => o.id === opponentId);
    return opponent ? opponent.teamName : 'Unknown Opponent';
  };
  
  // Calculate scores from game stats
  const getScores = (game: Game): [number, number] => {
    const gameStatsList = gameStats[game.id] || [];
    
    // Calculate team score and opponent score from actual stats
    const teamScore = gameStatsList.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
    const opponentScore = gameStatsList.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);
    
    return [teamScore, opponentScore];
  };
  
  const getResultClass = (game: Game) => {
    const [teamScore, opponentScore] = getScores(game);
    if (teamScore > opponentScore) return 'border-success bg-success/5';
    if (teamScore < opponentScore) return 'border-error bg-error/5';
    return 'border-warning bg-warning/5';
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
                  <p className="text-xs text-gray-500">{formatShortDate(game.date)}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${getResultTextClass(game)}`}>{getResultText(game)}</p>
                  <p className="text-xs text-gray-500">Home</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}