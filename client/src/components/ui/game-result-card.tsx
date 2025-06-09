
import React from 'react';
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
  showLink = true,
  showDate = true,
  showRound = true,
  showScore = true,
  compact = false,
  currentTeamId,
  clubTeams = []
}: GameResultCardProps) {
  
  // Calculate scores using the unified gameScoreService
  const getScores = (): [number, number] => {
    if (gameStats.length === 0) {
      return [0, 0];
    }

    // Determine if this is an inter-club game
    const isInterClub = game.homeTeamId && game.awayTeamId && 
                       clubTeams.some(t => t.id === game.homeTeamId) && 
                       clubTeams.some(t => t.id === game.awayTeamId);

    // For now, use synchronous calculation (official scores fetching will be added in a future enhancement)
    // This properly handles inter-club games without double-counting
    const quarterScores = [];
    
    if (isInterClub && game.homeTeamId && game.awayTeamId && currentTeamId) {
      // Inter-club game: calculate from both teams' perspectives
      for (let quarter = 1; quarter <= 4; quarter++) {
        const quarterStats = gameStats.filter(stat => stat.quarter === quarter);
        
        const homeTeamStats = quarterStats.filter(stat => stat.teamId === game.homeTeamId);
        const awayTeamStats = quarterStats.filter(stat => stat.teamId === game.awayTeamId);
        
        let homeScore = 0;
        let awayScore = 0;
        
        if (homeTeamStats.length > 0) {
          homeScore = homeTeamStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
          awayScore = homeTeamStats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);
        } else if (awayTeamStats.length > 0) {
          homeScore = awayTeamStats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);
          awayScore = awayTeamStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
        }
        
        quarterScores.push({
          quarter,
          teamScore: currentTeamId === game.homeTeamId ? homeScore : awayScore,
          opponentScore: currentTeamId === game.homeTeamId ? awayScore : homeScore
        });
      }
    } else {
      // Regular game: filter by current team if specified
      for (let quarter = 1; quarter <= 4; quarter++) {
        let quarterStats = gameStats.filter(stat => stat.quarter === quarter);
        
        if (currentTeamId) {
          quarterStats = quarterStats.filter(stat => stat.teamId === currentTeamId);
        }
        
        const teamScore = quarterStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
        const opponentScore = quarterStats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);
        
        quarterScores.push({
          quarter,
          teamScore,
          opponentScore
        });
      }
    }

    const totalTeamScore = quarterScores.reduce((sum, q) => sum + q.teamScore, 0);
    const totalOpponentScore = quarterScores.reduce((sum, q) => sum + q.opponentScore, 0);

    return [totalTeamScore, totalOpponentScore];
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
