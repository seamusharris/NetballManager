import GameAnalysisWidget from '@/components/ui/game-analysis-widget';
import { hasPositionStats } from '@/lib/positionStats';

interface RecentFormWidgetProps {
  games: any[];
  currentTeamId: number | null;
  currentClubId: number | null;
  gameScoresMap: Record<number, any[]>;
  gameStatsMap: Record<number, any[]>;
  className?: string;
}

export function RecentFormWidget({ 
  games, 
  currentTeamId, 
  currentClubId, 
  gameScoresMap, 
  gameStatsMap,
  className = ""
}: RecentFormWidgetProps) {
  // Get the last 5 completed games
  const completedGames = games?.filter(game => 
    game.statusIsCompleted && 
    !game.isBye && 
    game.statusName !== 'bye'
  ) || [];

  // Sort by date descending and take last 5
  const recentGames = completedGames
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  if (recentGames.length === 0) return null;

  return (
    <GameAnalysisWidget
        historicalGames={recentGames}
        currentTeamId={currentTeamId}
        currentClubId={currentClubId}
        batchScores={gameScoresMap}
        batchStats={gameStatsMap}
        title="Recent Form"
        showAnalytics={true}
        showQuarterScores={true}
        maxGames={5}
      />
  );
}

export default RecentFormWidget;