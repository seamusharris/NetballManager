import React, { useMemo } from 'react';
import { Link } from 'wouter';
import { Game } from '@shared/schema';
import { formatShortDate, formatDate } from '@/lib/utils';
import { ScoreBadge } from '@/components/ui/score-badge';
import { GameBadge } from '@/components/ui/game-badge';
import { cn } from '@/lib/utils';
import { gameScoreService } from '@/lib/gameScoreService';

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

export function GameResultCard({ 
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

  // Calculate scores using centralized gameScoreService
  const scores = useMemo(() => {
    if (!game) return null;

    try {
      return gameScoreService.calculateGameScoresSync(
        gameStats || [], 
        game.statusName, 
        { teamGoals: game.statusTeamGoals, opponentGoals: game.statusOpponentGoals },
        game.isInterClub,
        game.homeTeamId,
        game.awayTeamId,
        currentTeamId,
        useOfficialPriority ? centralizedScores : undefined
      );
    } catch (error) {
      // Silently handle errors to avoid console clutter
      return null;
    }
  }, [gameStats, centralizedScores, useOfficialPriority, game, currentTeamId]);

  // Check if this is a BYE game
  const isByeGame = game.isBye || 
                   game.awayTeamName === 'Bye' || 
                   game.homeTeamName === 'Bye' ||
                   (!game.awayTeamName && !game.homeTeamName);

  const getOpponentName = (): string => {
    // Handle team-based system with proper BYE detection
    if (isByeGame) {
      return 'Bye';
    }
    if (game.awayTeamName && game.awayTeamName !== 'Bye') {
      return game.awayTeamName;
    } else if (game.homeTeamName) {
      return game.homeTeamName;
    }
    return 'Unknown Opponent';
  };

  // Get result styling
  const isWin = scores && scores.result === 'win';
  const isLoss = scores && scores.result === 'loss';
  const isDraw = scores && scores.result === 'draw';

  const getResultClass = () => {
    if (isWin) return 'border-green-500 bg-green-50';
    if (isLoss) return 'border-red-500 bg-red-50';
    return 'border-gray-500 bg-gray-50';
  };

  const getHoverClass = () => {
    if (isWin) return 'hover:bg-green-100';
    if (isLoss) return 'hover:bg-red-100';
    return 'hover:bg-gray-100';
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

  // Display score or placeholder
  const getScoreDisplay = () => {
    if (!game) return "- -";

    // For BYE games, don't show scores
    if (game.isBye) return "BYE";

    // Show calculated scores if available
    if (scores && scores.totalTeamScore !== undefined && scores.totalOpponentScore !== undefined) {
      return `${scores.totalTeamScore}-${scores.totalOpponentScore}`;
    }

    // Show status scores if no calculated scores but status scores exist
    if (game.statusTeamGoals !== null && game.statusOpponentGoals !== null) {
      return `${game.statusTeamGoals}-${game.statusOpponentGoals}`;
    }

    // For completed games without scores, show placeholder
    if (game.statusIsCompleted) {
      return "0-0";
    }

    // Default for upcoming games
    return "- -";
  };

    const getOpponentDisplay = (): string => {
    if (isByeGame) {
      return "Bye";
    }
    return `vs ${getOpponentName()}`;
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
        <div className={cn('font-semibold text-gray-800 truncate', config.textSize)}>
          {getOpponentDisplay()}
        </div>

        {/* Details row */}
        <div className="flex items-center gap-2 mt-1">
          {config.showDate && (
            <span className="text-xs text-gray-600">
              {layout === 'wide' ? formatDate(game.date) : formatShortDate(game.date)}
            </span>
          )}

          {config.showRound && game.round && (
            <GameBadge variant="round" size={layout === 'narrow' ? 'sm' : 'default'}>
              {layout === 'narrow' ? `R${game.round}` : `Round ${game.round}`}
            </GameBadge>
          )}
        </div>
      </div>

      {/* Right side - Score */}
      {showScore && (
        (isByeGame || !game.statusIsCompleted) ? (
          <div className="ml-auto px-3 py-1 text-sm font-medium text-white bg-gray-600 rounded">
            —
          </div>
        ) : scores ? (
          <ScoreBadge 
            teamScore={scores.totalTeamScore} 
            opponentScore={scores.totalOpponentScore}
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