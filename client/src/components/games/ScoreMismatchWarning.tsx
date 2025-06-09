
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { validateInterClubScores, getScoreDiscrepancyWarning } from '@/lib/scoreValidation';

interface ScoreMismatchWarningProps {
  homeTeamStats: {
    teamId: number;
    goalsFor: number;
    goalsAgainst: number;
  };
  awayTeamStats: {
    teamId: number;
    goalsFor: number;
    goalsAgainst: number;
  };
  className?: string;
}

export function ScoreMismatchWarning({ 
  homeTeamStats, 
  awayTeamStats, 
  className 
}: ScoreMismatchWarningProps) {
  const validation = validateInterClubScores(homeTeamStats, awayTeamStats);
  const warning = getScoreDiscrepancyWarning(validation);
  
  if (!warning) {
    return null;
  }
  
  return (
    <Alert variant="destructive" className={className}>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        {warning}
        <div className="mt-2 text-sm">
          <div>Home Team: {homeTeamStats.goalsFor} for, {homeTeamStats.goalsAgainst} against</div>
          <div>Away Team: {awayTeamStats.goalsFor} for, {awayTeamStats.goalsAgainst} against</div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
