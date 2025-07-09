
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

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full font-semibold border-0',
        sizeClasses[size],
        result === 'Win' ? 'bg-green-500 text-white' :
        result === 'Loss' ? 'bg-red-500 text-white' :
        result === 'Draw' ? 'bg-yellow-500 text-white' :
        'bg-gray-500 text-white',
        className
      )}
    >
      {result === 'Win' ? 'W' : result === 'Loss' ? 'L' : result === 'Draw' ? 'D' : 'B'}
    </div>
  );
}
