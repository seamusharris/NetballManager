import React from 'react';
import { cn } from '@/lib/utils';

interface ScoreBadgeProps {
  teamScore: number; // Home team score (first number displayed)
  opponentScore: number; // Away team score (second number displayed) 
  className?: string;
  size?: 'sm' | 'md' | 'default' | 'lg';
  result?: string;
}

export function ScoreBadge({ teamScore, opponentScore, className, size = 'default', result }: ScoreBadgeProps) {
  // teamScore = Home team score, opponentScore = Away team score for display consistency
  const sizeClasses = {
    'sm': 'px-2 py-1 text-xs',
    'md': 'px-2.5 py-1 text-sm', 
    'default': 'px-3 py-1.5 text-sm',
    'lg': 'px-4 py-2 text-base'
  };





  

  const getResultColor = () => {
    // Use the result from unified service if provided, otherwise calculate
    if (result) {
      if (result === 'win') return 'bg-green-500 text-white';
      if (result === 'loss') return 'bg-red-500 text-white';
      if (result === 'draw') return 'bg-yellow-500 text-white';
    }
    
    // Fallback to score comparison
    if (teamScore > opponentScore) return 'bg-green-500 text-white';
    if (teamScore < opponentScore) return 'bg-red-500 text-white';
    return 'bg-yellow-500 text-white';
  };

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded font-semibold border-0',
        sizeClasses[size],
        getResultColor(),
        className
      )}
    >
      {teamScore}:{opponentScore}
    </div>
  );
}