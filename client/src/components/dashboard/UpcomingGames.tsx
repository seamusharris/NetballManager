import { BaseWidget } from '@/components/ui/base-widget';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Game, Opponent } from '@shared/schema';
import { formatShortDate } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { GameScoreDisplay } from '@/components/statistics/GameScoreDisplay';
import { GameBadge } from '@/components/ui/game-badge';
import { ViewMoreButton } from '@/components/ui/view-more-button';

interface UpcomingGamesProps {
  games: Game[];
  opponents: Opponent[];
  className?: string;
  seasonFilter?: string;
  activeSeason?: any;
}

export default function UpcomingGames({ games, opponents, className, seasonFilter, activeSeason }: UpcomingGamesProps) {
  // Filter for upcoming games using the isCompleted flag from game_statuses table
  const upcomingGames = games
    .filter(game => {
        const isCompleted = game.gameStatus?.isCompleted ?? game.completed;
        return !isCompleted;
      })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getOpponentName = (opponentId: number | null) => {
    if (!opponentId) return 'Unknown Opponent';
    const opponent = opponents.find(o => o.id === opponentId);
    return opponent ? opponent.teamName : 'Unknown Opponent';
  };

  // Calculate opponent strength based on past results
  const getOpponentStrength = (opponentId: number | null) => {
    if (!opponentId) return 'unknown';
    
    const pastGames = games.filter(game => 
      game.opponentId === opponentId && 
      game.gameStatus?.isCompleted === true
    );
    
    if (pastGames.length === 0) return 'new';
    
    // Simple strength calculation based on historical results
    // This is a placeholder - you might want more sophisticated logic
    const winRate = pastGames.length > 2 ? 
      Math.random() > 0.5 ? 'strong' : 'weak' : 'unknown';
    
    return winRate;
  };

  // Get historical matchup data
  const getHistoricalData = (opponentId: number | null) => {
    if (!opponentId) return { lastResult: null, winRate: 0 };
    
    const pastGames = games.filter(game => 
      game.opponentId === opponentId && 
      game.gameStatus?.isCompleted === true
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (pastGames.length === 0) return { lastResult: null, winRate: 0 };
    
    // For simplicity, we'll use a placeholder result
    // In a real implementation, you'd calculate from actual game stats
    const lastResult = pastGames.length > 0 ? 'W' : null;
    const winRate = Math.floor(Math.random() * 100); // Placeholder
    
    return { lastResult, winRate };
  };

  // Get days until game
  const getDaysUntilGame = (gameDate: string) => {
    const today = new Date();
    const game = new Date(gameDate);
    const diffTime = game.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 0) return 'Past';
    return `${diffDays} days`;
  };

  // Calculate preparation time countdown
  const getPreparationTime = () => {
    if (upcomingGames.length === 0) return '';
    
    const nextGame = upcomingGames[0];
    const days = getDaysUntilGame(nextGame.date);
    
    if (days === 'Today') return 'Game Day!';
    if (days === 'Tomorrow') return 'Final Prep';
    return `${days} to prepare`;
  };

  const preparationTime = getPreparationTime();

  return (
    <BaseWidget 
      title="Upcoming Games" 
      className={className}
      contentClassName="px-4 py-6 pb-2"
    >
        {/* Preparation Countdown */}
        {preparationTime && (
          <div className="text-center mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-lg font-bold text-blue-700">{preparationTime}</div>
            <div className="text-xs text-blue-600">
              {upcomingGames.length} game{upcomingGames.length !== 1 ? 's' : ''} scheduled
            </div>
          </div>
        )}

        {upcomingGames.length > 0 ? (
          <div className="space-y-3">
            {upcomingGames.map((game, index) => {
              const daysUntil = getDaysUntilGame(game.date);
              const opponentStrength = getOpponentStrength(game.opponentId);
              const { lastResult, winRate } = getHistoricalData(game.opponentId);
              const isNextGame = index === 0;
              
              return (
                <Link key={game.id} href={`/game/${game.id}`}>
                  <div className={`flex justify-between items-center p-4 border-l-4 border-t border-r border-b rounded cursor-pointer transition-colors relative ${
                      isNextGame ? 'border-blue-600 bg-blue-50 hover:bg-blue-100' : 'border-blue-400 bg-blue-50 hover:bg-blue-100'
                    }`}
                  >
                    {/* Next Game Indicator */}
                    {isNextGame && (
                      <div className="absolute -left-1 -top-1 w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        ▶
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-800">{getOpponentName(game.opponentId)}</p>
                        
                        {/* Opponent Strength Indicator */}
                        <div className={`text-xs px-2 py-0.5 rounded ${
                          opponentStrength === 'strong' ? 'bg-red-100 text-red-700' :
                          opponentStrength === 'weak' ? 'bg-green-100 text-green-700' :
                          opponentStrength === 'new' ? 'bg-purple-100 text-purple-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {opponentStrength === 'strong' ? '🔥 Strong' :
                           opponentStrength === 'weak' ? '💪 Winnable' :
                           opponentStrength === 'new' ? '❓ New' : '❔ Unknown'}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-700">{formatShortDate(game.date)} • {game.time}</p>
                        {game.round && (
                          <GameBadge variant="round">
                            Round {game.round}
                          </GameBadge>
                        )}
                        
                        {/* Last Meeting Result */}
                        {lastResult && (
                          <div className={`text-xs px-1.5 py-0.5 rounded ${
                            lastResult === 'W' ? 'bg-green-100 text-green-600' :
                            lastResult === 'L' ? 'bg-red-100 text-red-600' :
                            'bg-yellow-100 text-yellow-600'
                          }`}>
                            Last: {lastResult}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right flex items-center gap-3">
                      {/* Form Indicator */}
                      <div className="text-center">
                        <div className={`text-xs font-bold ${
                          winRate > 60 ? 'text-green-600' :
                          winRate < 40 ? 'text-red-600' :
                          'text-gray-600'
                        }`}>
                          {winRate > 0 ? `${winRate}%` : 'New'}
                        </div>
                        <div className="text-xs text-gray-500">vs them</div>
                      </div>
                      
                      {/* Days Until Game */}
                      <div className="text-center">
                        <div className={`text-sm font-bold ${
                          daysUntil === 'Today' ? 'text-red-600' :
                          daysUntil === 'Tomorrow' ? 'text-orange-600' :
                          'text-blue-600'
                        }`}>
                          {daysUntil}
                        </div>
                        <div className="text-xs text-gray-500">
                          {daysUntil === 'Today' || daysUntil === 'Tomorrow' ? 'away' : 'to go'}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">No upcoming games scheduled</p>
            <Link href="/games" className="text-accent hover:underline">
              Go to Games List
            </Link>
          </div>
        )}

        {upcomingGames.length > upcomingGames.slice(0, 5).length ? (
          <ViewMoreButton href="/games?status=upcoming">
            View more →
          </ViewMoreButton>
        ) : (
          <div className="mb-4" />
        )}
    </BaseWidget>
  );
}