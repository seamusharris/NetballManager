import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useGamesScores } from '../statistics/hooks/useGamesScores';
import { cn } from '@/lib/utils';
import { ScoreDisplay } from '@/lib/resultUtils';

interface BatchGameScoreDisplayProps {
  gameId: number;
}

/**
 * Optimized game score display component that uses batched score fetching
 * This component is specifically designed for the dashboard display to improve performance
 */
export function BatchGameScoreDisplay({ gameId }: BatchGameScoreDisplayProps) {
  // Use our optimized batch hook with pre-existing cache
  const { scoresMap, isLoading, hasError } = useGamesScores([gameId], false);
  
  // Get this specific game's scores from the batch result
  const scores = scoresMap[gameId];
  
  if (isLoading) {
    return (
      <div className="flex space-x-2">
        <Skeleton className="h-6 w-12" />
        <span className="mx-1">-</span>
        <Skeleton className="h-6 w-12" />
      </div>
    );
  }
  
  if (hasError) {
    return (
      <div className="text-destructive text-sm">
        Error loading score
      </div>
    );
  }
  
  if (!scores) {
    return (
      <div className="text-muted-foreground text-sm">
        —
      </div>
    );
  }
  
  return (
    <div className="font-semibold text-left">
      <ScoreDisplay 
        teamScore={scores.finalScore.for} 
        opponentScore={scores.finalScore.against} 
        compact 
      />
    </div>
  );
}