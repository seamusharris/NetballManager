
import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export type GameResult = 'Win' | 'Loss' | 'Draw' | 'Bye';

interface ResultBadgeProps {
  result: GameResult;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function ResultBadge({ result, className, size = 'md' }: ResultBadgeProps) {
  const sizeClasses = {
    'sm': 'h-6 w-6 text-xs',
    'md': 'h-8 w-8 text-sm',
    'lg': 'h-10 w-10 text-base',
    'xl': 'h-12 w-12 text-lg'
  };

  const resultColors = {
    'Win': { bg: 'bg-green-500', border: '#22c55e' },
    'Loss': { bg: 'bg-red-500', border: '#ef4444' },
    'Draw': { bg: 'bg-yellow-500', border: '#eab308' },
    'Bye': { bg: 'bg-gray-500', border: '#6b7280' }
  };

  const { bg, border } = resultColors[result];

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full font-semibold text-white border border-white',
        sizeClasses[size],
        bg,
        className
      )}
      style={{
        boxShadow: `0 0 0 1px ${border}`
      }}
    >
      {result === 'Win' ? 'W' : result === 'Loss' ? 'L' : result === 'Draw' ? 'D' : 'B'}
    </div>
  );
}
