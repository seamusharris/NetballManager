import GameAnalysisWidget from '@/components/ui/game-analysis-widget';
import { useNextGame } from '@/hooks/use-next-game';

interface OpponentFormWidgetProps {
  games: any[];
  currentTeamId: number | null;
  currentClubId: number | null;
  gameScoresMap: Record<number, any[]>;
  gameStatsMap: Record<number, any[]>;
  className?: string;
}

export function OpponentFormWidget({ 
  games, 
  currentTeamId, 
  currentClubId, 
  gameScoresMap, 
  gameStatsMap,
  className = ""
}: OpponentFormWidgetProps) {
  const { data: nextGame } = useNextGame();

  if (!nextGame || !currentTeamId) {
    return (
      <div className={`bg-white/80 backdrop-blur-sm rounded-2xl border-0 shadow-lg p-8 text-center ${className}`}>
        <h3 className="text-xl font-semibold mb-4">Opponent Form</h3>
        <p className="text-muted-foreground">No upcoming games scheduled</p>
      </div>
    );
  }

  // Get the next opponent team ID
  const nextOpponentId = nextGame.homeTeamId === currentTeamId 
    ? nextGame.awayTeamId 
    : nextGame.homeTeamId;

  // Filter completed games against this specific opponent
  const opponentGames = games?.filter(game => 
    game.statusIsCompleted && 
    !game.isBye && 
    game.statusName !== 'bye' &&
    ((game.homeTeamId === currentTeamId && game.awayTeamId === nextOpponentId) ||
     (game.awayTeamId === currentTeamId && game.homeTeamId === nextOpponentId))
  ) || [];

  // Sort by date descending and take last 5
  const recentOpponentGames = opponentGames
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  if (recentOpponentGames.length === 0) {
    const opponentName = nextGame.homeTeamId === currentTeamId 
      ? nextGame.awayTeamName 
      : nextGame.homeTeamName;

    return (
      <div className={`bg-white/80 backdrop-blur-sm rounded-2xl border-0 shadow-lg p-8 text-center ${className}`}>
        <h3 className="text-xl font-semibold mb-4">Opponent Form vs {opponentName}</h3>
        <p className="text-muted-foreground">No previous games against this opponent</p>
      </div>
    );
  }

  const opponentName = nextGame.homeTeamId === currentTeamId 
    ? nextGame.awayTeamName 
    : nextGame.homeTeamName;

  return (
    <GameAnalysisWidget
      historicalGames={recentOpponentGames}
      currentTeamId={currentTeamId}
      currentClubId={currentClubId}
      batchScores={gameScoresMap}
      batchStats={gameStatsMap}
      title={`Opponent Form vs ${opponentName}`}
      showAnalytics={true}
      showQuarterScores={true}
      maxGames={5}
    />
  );
}

export default OpponentFormWidget;