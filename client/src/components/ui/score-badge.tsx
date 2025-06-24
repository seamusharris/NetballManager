import React from 'react';
import { cn } from '@/lib/utils';

interface ScoreBadgeProps {
  teamScore: number; // Home team score (first number displayed)
  awayScore: number; // Away team score (second number displayed) 
  className?: string;
  size?: 'sm' | 'md' | 'default' | 'lg';
  result?: string;
}

export function ScoreBadge({ teamScore, awayScore, className, size = 'default', result }: ScoreBadgeProps) {
  // teamScore = Home team score, awayScore = Away team score for display consistency
  const sizeClasses = {
    'sm': 'px-2 py-1 text-xs',
    'md': 'px-2.5 py-1 text-sm', 
    'default': 'px-3 py-1.5 text-sm',
    'lg': 'px-4 py-2 text-base'
  };





  // Debug for Team 128 
  if (teamScore === 5 && awayScore === 36) {
    console.log(`🔍 SCORE BADGE - Team 128 game (5-36):`, {
      teamScore,
      awayScore,
      result,
      expectedColor: 'red (loss)',
      willUseResult: !!result
    });
  }

  const getResultColor = () => {
    // Use the result from unified service if provided, otherwise calculate
    if (result) {
      if (result === 'win') return 'bg-green-500 text-white';
      if (result === 'loss') return 'bg-red-500 text-white';
      if (result === 'draw') return 'bg-yellow-500 text-white';
    }
    
    // Fallback to score comparison
    if (teamScore > awayScore) return 'bg-green-500 text-white';
    if (teamScore < awayScore) return 'bg-red-500 text-white';
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
      {teamScore}—{awayScore}
    </div>
  );
}