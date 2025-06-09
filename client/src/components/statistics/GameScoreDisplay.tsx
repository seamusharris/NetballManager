import React, { useMemo } from 'react';
import { useGameStatistics } from './hooks/useGameStatistics';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface GameScoreDisplayProps {
  gameId: number;
  compact?: boolean;
  preloadedStats?: any[];
  fallback?: string;
}

export function GameScoreDisplay({ gameId, compact = false, preloadedStats, fallback = "—" }: GameScoreDisplayProps) {
  // Use preloaded stats when available to avoid unnecessary API calls
  // Accept even empty arrays as valid preloaded data to prevent API calls
  const hasPreloadedStats = preloadedStats && Array.isArray(preloadedStats);

  // Get statistics data first - ALL HOOKS MUST BE CALLED UNCONDITIONALLY
  const { rawStats, scores, isLoading, error } = useGameStatistics(
    gameId, 
    false, // Never force fresh fetch in compact mode
    hasPreloadedStats ? preloadedStats : undefined
  );

  // Move useMemo to top to ensure hooks are always called in same order
  const filteredGameStats = useMemo(() => {
    if (!rawStats || !scores?.currentTeam?.id) return rawStats || [];

    // For inter-club games, only use stats from the current team
    if (scores?.isInterClub) {
      return rawStats.filter(stat => stat.teamId === scores.currentTeam.id);
    }

    // For regular games, use all stats
    return rawStats;
  }, [rawStats, scores?.currentTeam?.id, scores?.isInterClub]);

  // Handle loading state
  if (isLoading) {
    return compact ? (
      <div className="flex space-x-2">
        <Skeleton className="h-8 w-16" />
        <span className="mx-1">-</span>
        <Skeleton className="h-8 w-16" />
      </div>
    ) : (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-8 w-48" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Handle error state
  if (error) {
    console.error('Error loading game stats:', error);

    // For completed games with no stats or any stats-related errors, show a dash instead of error
    const errorMessage = error.message?.toLowerCase() || '';
    const isStatsError = errorMessage.includes('no stats') || 
                        errorMessage.includes('stats not found') || 
                        errorMessage.includes('no stats available') ||
                        errorMessage.includes('stats not available') ||
                        errorMessage.includes('no goal stats') ||
                        errorMessage.includes('no statistics');

    if (isStatsError) {
      return compact ? (
        <div className="text-muted-foreground">
          —
        </div>
      ) : (
        <div className="text-muted-foreground">
          No scores recorded
        </div>
      );
    }

    // Only show "Score Error" for actual technical errors, not missing data
    return compact ? (
      <div className="text-destructive">
        Score Error
      </div>
    ) : (
      <div className="text-destructive">
        Unable to load game scores. Please try again.
      </div>
    );
  }

  // Handle no scores
  if (!scores) {
    return (
      <div className="text-muted-foreground">
        {fallback}
      </div>
    );
  }

  // Convert between different score formats
  const displayScores = (() => {
    if (!scores) return null;

    // Handle new gameScoreService format (has quarterScores array)
    if (scores.quarterScores && Array.isArray(scores.quarterScores)) {
      return {
        quarterScores: scores.quarterScores.reduce((acc: any, q: any) => {
          acc[q.quarter.toString()] = { for: q.teamScore, against: q.opponentScore };
          return acc;
        }, {}),
        finalScore: { for: scores.totalTeamScore, against: scores.totalOpponentScore }
      };
    }

    // Handle legacy statisticsService format (already in correct format)
    return scores;
  })();

  // Render compact view for lists and tables
  if (compact) {
    // Determine win/loss/draw status
    const isWin = displayScores.finalScore.for > displayScores.finalScore.against;
    const isLoss = displayScores.finalScore.for < displayScores.finalScore.against;
    const isDraw = displayScores.finalScore.for === displayScores.finalScore.against;

    // Set background color based on game result
    const bgColor = isWin 
      ? "bg-green-100 border-green-200" 
      : isLoss 
        ? "bg-red-100 border-red-200" 
        : "bg-amber-100 border-amber-200";

    return (
      <div className="font-semibold text-left">
        <div className={`inline-flex items-center px-3 py-1 rounded border text-gray-900 ${bgColor}`}>
          <span className={isWin ? "font-bold" : ""}>{displayScores.finalScore.for}</span>
          <span className="mx-2">-</span>
          <span className={isLoss ? "font-bold" : ""}>{displayScores.finalScore.against}</span>
        </div>
      </div>
    );
  }

  // Render full score breakdown



  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Final Score</span>
          <span>
            <span className="text-green-600 text-2xl font-bold">{displayScores.finalScore.for}</span>
            <span className="mx-2">-</span>
            <span className="text-red-600 text-2xl font-bold">{displayScores.finalScore.against}</span>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quarter</TableHead>
              <TableHead className="text-right">For</TableHead>
              <TableHead className="text-right">Against</TableHead>
              <TableHead className="text-right">Diff</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(displayScores.quarterScores).map(([quarter, score]) => (
              <TableRow key={quarter}>
                <TableCell className="font-medium">Q{quarter}</TableCell>
                <TableCell className="text-right text-green-600">{score.for}</TableCell>
                <TableCell className="text-right text-red-600">{score.against}</TableCell>
                <TableCell className="text-right font-semibold">
                  {score.for - score.against > 0 && '+'}{score.for - score.against}
                </TableCell>
              </TableRow>
            ))}
</TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}