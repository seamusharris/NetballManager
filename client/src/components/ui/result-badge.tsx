
import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export type GameResult = 'Win' | 'Loss' | 'Draw';

interface ResultBadgeProps {
  result: GameResult;
  className?: string;
}

export function ResultBadge({ result, className }: ResultBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        result === 'Win' ? 'bg-green-50 text-green-700 border-green-200' :
        result === 'Loss' ? 'bg-red-50 text-red-700 border-red-200' :
        'bg-yellow-50 text-yellow-700 border-yellow-200',
        className
      )}
    >
      {result}
    </Badge>
  );
}
