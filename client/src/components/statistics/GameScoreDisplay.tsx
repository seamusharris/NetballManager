import React from 'react';
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
  const hasPreloadedStats = preloadedStats && preloadedStats.length > 0;

  // Only fetch if we don't have preloaded stats
  // For compact mode (lists), we should rely on preloaded stats when available
  const { scores, isLoading, error } = useGameStatistics(
    gameId, 
    false, // Never force fresh fetch in compact mode
    hasPreloadedStats ? preloadedStats : undefined
  );

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

  if (error) {
    return (
      <div className="text-destructive">
        {compact ? 'Error loading score' : 'Unable to load game scores. Please try again.'}
      </div>
    );
  }

  if (!scores) {
    return (
      <div className="text-muted-foreground">
        {fallback}
      </div>
    );
  }

  // Render compact view for lists and tables
  if (compact) {
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
        <div className={`inline-flex items-center px-3 py-1 rounded border text-gray-900 ${bgColor}`}>
          <span className={isWin ? "font-bold" : ""}>{scores.finalScore.for}</span>
          <span className="mx-2">-</span>
          <span className={isLoss ? "font-bold" : ""}>{scores.finalScore.against}</span>
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
            <span className="text-green-600 text-2xl font-bold">{scores.finalScore.for}</span>
            <span className="mx-2">-</span>
            <span className="text-red-600 text-2xl font-bold">{scores.finalScore.against}</span>
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
            {Object.entries(scores.quarterScores).map(([quarter, score]) => (
              <TableRow key={quarter}>
                <TableCell className="font-medium">Q{quarter}</TableCell>
                <TableCell className="text-right text-green-600">{score.for}</TableCell>
                <TableCell className="text-right text-red-600">{score.against}</TableCell>
                <TableCell className="text-right font-semibold">
                  {score.for - score.against > 0 && '+'}{score.for - score.against}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="font-bold">
              <TableCell>Total</TableCell>
              <TableCell className="text-right text-green-600">{scores.finalScore.for}</TableCell>
              <TableCell className="text-right text-red-600">{scores.finalScore.against}</TableCell>
              <TableCell className="text-right">
                {scores.finalScore.for - scores.finalScore.against > 0 && '+'}
                {scores.finalScore.for - scores.finalScore.against}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}