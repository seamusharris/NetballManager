
import React from 'react';
import { cn } from '@/lib/utils';

export type GameResult = 'Win' | 'Loss' | 'Draw';

/**
 * Get consistent result colors for backgrounds
 */
export function getResultBgColor(result: GameResult): string {
  switch (result) {
    case 'Win':
      return 'bg-green-500';
    case 'Loss':
      return 'bg-red-500';
    case 'Draw':
      return 'bg-amber-500';
    default:
      return 'bg-gray-500';
  }
}

/**
 * Get consistent result colors for text
 */
export function getResultTextColor(result: GameResult): string {
  switch (result) {
    case 'Win':
      return 'text-green-600';
    case 'Loss':
      return 'text-red-600';
    case 'Draw':
      return 'text-amber-600';
    default:
      return 'text-gray-600';
  }
}

/**
 * Get consistent result colors for borders
 */
export function getResultBorderColor(result: GameResult): string {
  switch (result) {
    case 'Win':
      return 'border-green-200';
    case 'Loss':
      return 'border-red-200';
    case 'Draw':
      return 'border-amber-200';
    default:
      return 'border-gray-200';
  }
}

/**
 * Get consistent result colors for light backgrounds
 */
export function getResultLightBgColor(result: GameResult): string {
  switch (result) {
    case 'Win':
      return 'bg-green-50';
    case 'Loss':
      return 'bg-red-50';
    case 'Draw':
      return 'bg-amber-50';
    default:
      return 'bg-gray-50';
  }
}

/**
 * Round result badge component - consistent with player avatars
 */
interface ResultBadgeProps {
  result: GameResult;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ResultBadge({ result, size = 'md', className }: ResultBadgeProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  };

  const resultLetter = result.charAt(0);

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold text-white',
        getResultBgColor(result),
        sizeClasses[size],
        className
      )}
    >
      {resultLetter}
    </div>
  );
}

/**
 * Score display with result-based coloring
 */
interface ScoreDisplayProps {
  teamScore: number;
  opponentScore: number;
  compact?: boolean;
  className?: string;
}

export function ScoreDisplay({ teamScore, opponentScore, compact = false, className }: ScoreDisplayProps) {
  const result: GameResult = teamScore > opponentScore ? 'Win' : 
                            teamScore < opponentScore ? 'Loss' : 'Draw';

  if (compact) {
    return (
      <div className={cn(
        'inline-flex items-center px-3 py-1 rounded border text-gray-900',
        getResultLightBgColor(result),
        getResultBorderColor(result),
        className
      )}>
        <span className={teamScore > opponentScore ? "font-bold" : ""}>{teamScore}</span>
        <span className="mx-2">-</span>
        <span className={opponentScore > teamScore ? "font-bold" : ""}>{opponentScore}</span>
      </div>
    );
  }

  return (
    <div className={cn(
      'flex items-center justify-between p-4 rounded-lg border',
      getResultLightBgColor(result),
      getResultBorderColor(result),
      className
    )}>
      <div className="text-center">
        <div className="text-2xl font-bold">
          {teamScore}
        </div>
      </div>
      
      <div className="text-xl font-bold text-gray-400">vs</div>
      
      <div className="text-center">
        <div className="text-2xl font-bold">
          {opponentScore}
        </div>
      </div>
    </div>
  );
}
