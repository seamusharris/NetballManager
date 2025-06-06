
import React from 'react';
import { Link } from 'wouter';
import { Game } from '@shared/schema';
import { formatShortDate, formatDate } from '@/lib/utils';
import { ScoreBadge } from '@/components/ui/score-badge';
import { GameBadge } from '@/components/ui/game-badge';
import { cn } from '@/lib/utils';

export type GameResultLayout = 'narrow' | 'medium' | 'wide';

interface GameResultCardProps {
  game: Game;
  layout?: GameResultLayout;
  className?: string;
  gameStats?: any[];
  showLink?: boolean;
  showDate?: boolean;
  showRound?: boolean;
  showScore?: boolean;
  compact?: boolean;
}

export function GameResultCard({ 
  game, 
  layout = 'medium',
  className,
  gameStats = [],
  showLink = true,
  showDate = true,
  showRound = true,
  showScore = true,
  compact = false
}: GameResultCardProps) {
  
  // Calculate scores from game stats
  const getScores = (): [number, number] => {
    if (gameStats.length === 0) {
      return [0, 0];
    }

    // Create a map of the latest stats for each position/quarter combination
    const latestPositionStats: Record<string, any> = {};

    // Find the latest stat for each position/quarter combination
    gameStats.forEach(stat => {
      if (!stat || !stat.quarter) return;

      // For position-based stats (with valid position)
      if (stat.position) {
        const key = `${stat.position}-${stat.quarter}`;
        if (!latestPositionStats[key] || stat.id > latestPositionStats[key].id) {
          latestPositionStats[key] = stat;
        }
      }
      // For legacy stats (with null position but valid data)
      else if (typeof stat.goalsFor === 'number' || typeof stat.goalsAgainst === 'number') {
        const key = `legacy-${stat.id}-${stat.quarter}`;
        latestPositionStats[key] = stat;
      }
    });

    // Calculate quarter goals
    const quarterGoals: Record<number, { for: number, against: number }> = {
      1: { for: 0, against: 0 },
      2: { for: 0, against: 0 },
      3: { for: 0, against: 0 },
      4: { for: 0, against: 0 }
    };

    Object.values(latestPositionStats).forEach(stat => {
      if (stat && stat.quarter >= 1 && stat.quarter <= 4) {
        quarterGoals[stat.quarter].for += (stat.goalsFor || 0);
        quarterGoals[stat.quarter].against += (stat.goalsAgainst || 0);
      }
    });

    // Calculate total goals
    const teamScore = Object.values(quarterGoals).reduce((sum, q) => sum + q.for, 0);
    const opponentScore = Object.values(quarterGoals).reduce((sum, q) => sum + q.against, 0);

    return [teamScore, opponentScore];
  };

  // Get opponent name
  const getOpponentName = (): string => {
    if (game.awayTeamName && game.awayTeamName !== 'Bye') {
      return game.awayTeamName;
    } else if (game.homeTeamName) {
      return game.homeTeamName;
    }
    return 'Unknown Opponent';
  };

  // Get result styling
  const [teamScore, opponentScore] = getScores();
  const isWin = teamScore > opponentScore;
  const isLoss = teamScore < opponentScore;
  const isDraw = teamScore === opponentScore;

  const getResultClass = () => {
    if (isWin) return 'border-green-500 bg-green-50';
    if (isLoss) return 'border-red-500 bg-red-50';
    return 'border-yellow-500 bg-yellow-50';
  };

  const getHoverClass = () => {
    if (isWin) return 'hover:bg-green-100';
    if (isLoss) return 'hover:bg-red-100';
    return 'hover:bg-yellow-100';
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
          vs {getOpponentName()}
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
        <div className="flex-shrink-0">
          <ScoreBadge 
            teamScore={teamScore} 
            opponentScore={opponentScore} 
            size={config.badgeSize}
          />
        </div>
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
