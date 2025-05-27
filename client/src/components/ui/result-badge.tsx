
import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export type GameResult = 'Win' | 'Loss' | 'Draw';

interface ResultBadgeProps {
  result: GameResult;
  className?: string;
  size?: 'sm' | 'md' | 'default';
}

export function ResultBadge({ result, className, size = 'default' }: ResultBadgeProps) {
  const sizeClasses = {
    'sm': 'px-1.5 py-0.5 text-xs',
    'md': 'px-2 py-0.5 text-xs', 
    'default': 'px-2.5 py-0.5 text-xs'
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        sizeClasses[size],
        result === 'Win' ? 'bg-green-50 text-green-700 border-green-200' :
        result === 'Loss' ? 'bg-red-50 text-red-700 border-red-200' :
        'bg-yellow-50 text-yellow-700 border-yellow-200',
        className
      )}
    >
      {result === 'Win' ? 'W' : result === 'Loss' ? 'L' : 'D'}
    </Badge>
  );
}
