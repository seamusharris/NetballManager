import React, { useMemo } from 'react';
import { Link } from 'wouter';
import { Game } from '@shared/schema';
import { formatShortDate, formatDate } from '@/lib/utils';
import { ScoreBadge } from '@/components/ui/score-badge';
import { GameBadge } from '@/components/ui/game-badge';
import { cn } from '@/lib/utils';
import { gameScoreService } from '@/lib/gameScoreService';
import { useQuery } from '@tanstack/react-query';
import { Badge } from './badge';
import { Card } from './card';
import { apiClient } from '@/lib/apiClient';
import { useClub } from '@/contexts/ClubContext';

export type GameResultLayout = 'narrow' | 'medium' | 'wide';

interface GameResultCardProps {
  game: Game;
  layout?: GameResultLayout;
  className?: string;
  gameStats?: any[];
  centralizedScores?: any[];
  useOfficialPriority?: boolean;
  showLink?: boolean;
  showDate?: boolean;
  showRound?: boolean;
  showScore?: boolean;
  compact?: boolean;
  currentTeamId?: number;
  clubTeams?: any[];
}

export default function GameResultCard({ 
  game, 
  layout = 'medium',
  className,
  gameStats = [],
  centralizedScores,
  useOfficialPriority = false,
  showLink = true,
  showDate = true,
  showRound = true,
  showScore = true,
  compact = false,
  currentTeamId,
  clubTeams = []
}: GameResultCardProps) {
  const { currentClubId } = useClub();
  const statusIsCompleted = game.statusIsCompleted;

  // Early return if no game data
  if (!game) {
    return (
      <div className="border border-gray-200 rounded p-3 bg-gray-50">
        <span className="text-gray-500">No game data available</span>
      </div>
    );
  }

  // Memoize score calculation to avoid unnecessary recalculations
  const scores = useMemo(() => {
    try {
      // Use only centralized scores - no API calls
      const officialScores = centralizedScores || [];

      console.log(`GameResultCard ${game.id}: Processing scores - statusIsCompleted: ${game.statusIsCompleted}, centralizedScores length: ${officialScores.length}`, officialScores.slice(0, 2));

      // Process scores for completed games
      if (game.statusIsCompleted) {
        // Check if game has fixed scores from status (forfeit, etc.)
        const hasFixedScores = game.statusTeamGoals !== null && game.statusTeamGoals !== undefined && 
                              game.statusOpponentGoals !== null && game.statusOpponentGoals !== undefined;

        if (hasFixedScores || officialScores.length > 0) {
          // Use the gameScoreService to properly calculate scores with game context
          const gameScores = gameScoreService.calculateGameScoresSync(
            [], // gameStats - not needed for official scores
            game.statusName, // game status
            { teamGoals: game.statusTeamGoals, opponentGoals: game.statusOpponentGoals }, // status scores
            game.isInterClub, // is inter club
            game.homeTeamId, // proper home team ID
            game.awayTeamId, // proper away team ID
            currentTeamId, // current team context
            officialScores // official scores
          );

          const scoreType = hasFixedScores ? 'fixed' : 'official';
          const scoreCount = hasFixedScores ? 'status scores' : `${officialScores.length} score entries`;
          console.log(`GameResultCard ${game.id}: ${scoreType} scores calculated - ${gameScores.totalTeamScore}-${gameScores.totalOpponentScore} (${gameScores.result}) from ${scoreCount}`);

          return {
            quarterScores: gameScores.quarterScores,
            finalScore: { for: gameScores.totalTeamScore, against: gameScores.totalOpponentScore },
            result: gameScores.result
          };
        }
      }

      // Return empty scores for games without official scores
      return {
        quarterScores: [],
        finalScore: { for: 0, against: 0 }
      };
    } catch (error) {
      console.error(`GameResultCard ${game.id}: Error processing scores:`, error);
      return {
        quarterScores: [],
        finalScore: { for: 0, against: 0 }
      };
    }
  }, [centralizedScores, game.id, game.statusIsCompleted, currentTeamId, game.homeTeamId, game.awayTeamId, game.isInterClub, game.statusName, game.statusTeamGoals, game.statusOpponentGoals]);

  // Check if this is a BYE game using game status only
  const isByeGame = game.statusId === 6 || game.statusName === 'bye';
  const isUpcoming = !game.statusIsCompleted && !isByeGame;

  const getOpponentName = (): string => {
    // Handle BYE games
    if (isByeGame) {
      return 'Bye';
    }

    // For inter-club games, determine opponent based on current team
    if (game.isInterClub && currentTeamId) {
      if (game.homeTeamId === currentTeamId) {
        return game.awayTeamName || 'Unknown';
      } else if (game.awayTeamId === currentTeamId) {
        return game.homeTeamName || 'Unknown';
      }
    }

    // Default fallback
    return game.awayTeamName || game.homeTeamName || 'Unknown Opponent';
  };

  // Get result styling
  const isWin = scores && scores.result === 'win';
  const isLoss = scores && scores.result === 'loss';
  const isDraw = scores && scores.result === 'draw';

  const getResultClass = () => {
    if (isByeGame) return 'border-gray-500 bg-gray-50'; // check byes first
    if (isUpcoming) return 'border-blue-500 bg-blue-50'; // upcoming games
    if (isWin) return 'border-green-500 bg-green-50';
    if (isLoss) return 'border-red-500 bg-red-50';
    if (isDraw) return 'border-amber-500 bg-amber-50';
    return 'border-gray-400 bg-gray-100'; // other completed states without results
  };

  const getHoverClass = () => {
    if (isByeGame) return 'hover:bg-gray-100'; // check byes first
    if (isUpcoming) return 'hover:bg-blue-100'; // upcoming games
    if (isWin) return 'hover:bg-green-100';
    if (isLoss) return 'hover:bg-red-100';
    if (isDraw) return 'hover:bg-amber-100';
    return 'hover:bg-gray-200';
  };

  // Layout configurations
  const getLayoutConfig = () => {
    switch (layout) {
      case 'narrow':
        return {
          containerClass: 'flex items-center justify-between p-2 space-x-2',
          showDate: false,
          showRound: showRound,
          textSize: 'text-sm',
          badgeSize: 'sm' as const
        };
      case 'wide':
        return {
          containerClass: 'flex items-center justify-between p-4 space-x-4',
          showDate: showDate,
          showRound: showRound,
          textSize: 'text-base',
          badgeSize: 'md' as const
        };
      default: // medium
        return {
          containerClass: 'flex items-center justify-between p-3 space-x-3',
          showDate: showDate,
          showRound: showRound,
          textSize: 'text-sm',
          badgeSize: 'md' as const
        };
    }
  };

  const config = getLayoutConfig();

  // Create custom round display with forfeit status if applicable
  const customRoundDisplay = useMemo(() => {
    if (!game.round) return null;
    
    const baseRound = layout === 'narrow' ? `R${game.round}` : `Round ${game.round}`;
    
    // Add forfeit status if game is completed with forfeit status
    if (game.statusIsCompleted && game.statusName && game.statusName.startsWith('forfeit-')) {
      const forfeitType = game.statusName === 'forfeit-win' ? 'Forfeit Win' : 'Forfeit Loss';
      return `${baseRound} • ${forfeitType}`;
    }
    
    return baseRound;
  }, [game.round, game.statusIsCompleted, game.statusName, layout]);

  // Helper function for timeline round badge styling
  const getRoundBadgeVariant = () => {
    if (game.statusIsCompleted) return "round-timeline";
    return "round-pill"; // Default for upcoming games
  };

  const getRoundBadgeClass = () => {
    if (game.statusIsCompleted) {
      if (isWin) return "bg-green-200 text-green-800";
      if (isLoss) return "bg-red-200 text-red-800";
      return "bg-yellow-200 text-yellow-800"; // draws
    }
    return "bg-blue-200 text-blue-800"; // upcoming games
  };

  // Display score or placeholder
  const getScoreDisplay = () => {
    if (!game) return "—";

    // For BYE games, don't show scores
    if (isByeGame) return "BYE";

    // For upcoming games, show dash
    if (isUpcoming) return "—";

    // Show calculated scores if available
    if (scores && scores.finalScore.for !== undefined && scores.finalScore.against !== undefined) {
      return `${scores.finalScore.for}–${scores.finalScore.against}`;
    }

    // Show status scores if no calculated scores but status scores exist
    if (game.statusTeamGoals !== null && game.statusOpponentGoals !== null) {
      return `${game.statusTeamGoals}–${game.statusOpponentGoals}`;
    }

    // For completed games without scores, show placeholder
    if (game.statusIsCompleted) {
      return "0-0";
    }

    // Default fallback
    return "—";
  };

    const getOpponentDisplay = (): string => {
    if (isByeGame) {
      return "Bye";
    }

    // Always show Home vs Away format
    return `${game.homeTeamName || 'Unknown'} vs ${game.awayTeamName || 'Unknown'}`;
  };

  const CardContent = () => (
    <div 
      className={cn(
        'border-l-4 border-t border-r border-b rounded transition-colors',
        getResultClass(),
        showLink ? `cursor-pointer ${getHoverClass()}` : '',
        config.containerClass,
        className
      )}
    >
      {/* Left side - Opponent and details */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-800 truncate text-base">
          {isByeGame ? "Bye" : `${game.homeTeamName || 'Unknown'} vs ${game.awayTeamName || 'Unknown'}`}
        </div>

        {/* Details row */}
        <div className="flex items-center gap-2 mt-1">
          {config.showDate && (
            <span className="text-xs text-gray-600">
              {layout === 'wide' ? formatDate(game.date) : formatShortDate(game.date)}
            </span>
          )}

          {config.showDate && config.showRound && game.round && (
            <span className="text-xs text-gray-500">•</span>
          )}

          {config.showRound && game.round && (
            <span className="text-xs text-gray-600">
              {customRoundDisplay || (layout === 'narrow' ? `R${game.round}` : `Round ${game.round}`)}
            </span>
          )}
        </div>
      </div>

      {/* Right side - Score */}
      {showScore && (
        isByeGame ? (
          <div className="ml-auto px-3 py-1 text-sm font-medium text-white bg-gray-600 rounded">
            —
          </div>
        ) : !game.statusIsCompleted ? (
          <div className="ml-auto px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded">
            —
          </div>
        ) : scores ? (
          <ScoreBadge 
            teamScore={scores.finalScore.for} 
            opponentScore={scores.finalScore.against}
            result={scores.result}
            className="ml-auto"
          />
        ) : (
          <div className="ml-auto px-3 py-1 text-sm font-medium text-gray-500 bg-gray-50 rounded border border-gray-200">
            —
          </div>
        )
      )}
    </div>
  );

  if (showLink) {
    return (
      <Link href={`/game/${game.id}`}>
        <CardContent />
      </Link>
    );
  }

  return <CardContent />;
}

// Convenience components for specific layouts
export function NarrowGameResultCard(props: Omit<GameResultCardProps, 'layout'>) {
  return <GameResultCard {...props} layout="narrow" />;
}

export function MediumGameResultCard(props: Omit<GameResultCardProps, 'layout'>) {
  return <GameResultCard {...props} layout="medium" />;
}

export function WideGameResultCard(props: Omit<GameResultCardProps, 'layout'>) {
  return <GameResultCard {...props} layout="wide" />;
}

// Convenience components for different use cases
export function OfficialGameResultCard(props: Omit<GameResultCardProps, 'useOfficialPriority'>) {
  return <GameResultCard {...props} useOfficialPriority={true} />;
}

export function PerformanceGameResultCard(props: Omit<GameResultCardProps, 'useOfficialPriority'>) {
  return <GameResultCard {...props} useOfficialPriority={false} />;
}