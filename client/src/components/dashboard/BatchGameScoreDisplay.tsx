import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useGamesScores } from '../statistics/hooks/useGamesScores';
import { cn } from '@/lib/utils';

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
  
  if (hasError || !scores) {
    return (
      <div className="text-destructive text-sm">
        Error loading score
      </div>
    );
  }
  
  // Determine win/loss/draw status
  const isWin = scores.finalScore.for > scores.finalScore.against;
  const isLoss = scores.finalScore.for < scores.finalScore.against;
  const isDraw = scores.finalScore.for === scores.finalScore.against;
  
  // Set background color based on game result
  const bgColor = isWin 
    ? "bg-green-100 border-green-200" 
    : isLoss 
      ? "bg-red-100 border-red-200" 
      : "bg-amber-100 border-amber-200";
  
  return (
    <div className="font-semibold text-left">
      <div className={cn("inline-flex items-center px-3 py-1 rounded border text-gray-900", bgColor)}>
        <span className={isWin ? "font-bold" : ""}>{scores.finalScore.for}</span>
        <span className="mx-2">-</span>
        <span className={isLoss ? "font-bold" : ""}>{scores.finalScore.against}</span>
      </div>
    </div>
  );
}