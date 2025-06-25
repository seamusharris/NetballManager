import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import PreviousGamesDisplay from '@/components/ui/previous-games-display';

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
    <Card className={`mb-8 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Recent Form
        </CardTitle>
      </CardHeader>
      <CardContent>
        <PreviousGamesDisplay
          historicalGames={recentGames}
          currentTeamId={currentTeamId || 0}
          currentClubId={currentClubId || 0}
          batchScores={gameScoresMap}
          batchStats={gameStatsMap}
          opponentName="Recent Opponents"
          className=""
        />
      </CardContent>
    </Card>
  );
}

export default RecentFormWidget;