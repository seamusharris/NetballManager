import React from 'react';
import PreviousGamesDisplay from '@/components/ui/previous-games-display';

interface SeasonGamesDisplayProps {
  seasonGames: any[];
  currentTeamId?: number;
  seasonName?: string;
  isLoading?: boolean;
  batchScores?: Record<string, any[]>;
  batchStats?: Record<string, any[]>;
  className?: string;
}

export default function SeasonGamesDisplay({
  seasonGames,
  currentTeamId,
  seasonName,
  isLoading = false,
  batchScores,
  batchStats,
  className = ""
}: SeasonGamesDisplayProps) {
  // Convert string keys to number keys for PreviousGamesDisplay
  const convertedBatchScores = batchScores ? Object.fromEntries(
    Object.entries(batchScores).map(([key, value]) => [parseInt(key), value])
  ) : undefined;

  const convertedBatchStats = batchStats ? Object.fromEntries(
    Object.entries(batchStats).map(([key, value]) => [parseInt(key), value])
  ) : undefined;

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-32 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading season games...</p>
        </div>
      </div>
    );
  }

  return (
    <PreviousGamesDisplay
      historicalGames={seasonGames}
      currentTeamId={currentTeamId || 0}
      currentClubId={0} // Not needed for season view
      batchScores={convertedBatchScores}
      batchStats={convertedBatchStats}
      opponentName="Season"
      title={`Season Games (${seasonName || 'Current Season'})`}
      className={className}
      showAnalytics={true}
      showQuarterScores={true}
      maxGames={undefined} // Show all season games
      excludeSpecialGames={true} // This is the key difference - exclude special games from analytics
    />
  );
}