import React, { useMemo } from 'react';
import { useClub } from '@/contexts/ClubContext';
import { useOptimizedTeamGames } from '@/hooks/use-optimized-queries';
import { useQuery } from '@tanstack/react-query';
import GameResultCard from '@/components/ui/game-result-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function GameListTest() {
  const { currentClubId, currentTeamId } = useClub();
  
  // Get games data
  const { data: games = [] } = useOptimizedTeamGames(currentClubId, currentTeamId);
  
  // Get batch data for the games
  const EMPTY_ARRAY = useMemo(() => [] as any[], []);
  const EMPTY_OBJECT = useMemo(() => ({}), []);
  const gameIdsArray = useMemo(() => games?.map((g) => g.id).sort() || EMPTY_ARRAY, [games]);
  const gameIds = gameIdsArray.join(",");

  const { data: batchData } = useQuery({
    queryKey: ["test-batch-data", currentClubId, currentTeamId, gameIds],
    queryFn: async () => {
      if (gameIdsArray.length === 0) return { stats: {}, rosters: {}, scores: {} };

      try {
        const { dataFetcher } = await import("@/lib/unifiedDataFetcher");
        const result = await dataFetcher.batchFetchGameData({
          gameIds: gameIdsArray,
          clubId: currentClubId!,
          teamId: currentTeamId ?? undefined,
          includeStats: true,
          includeRosters: true,
          includeScores: true,
        });
        return result;
      } catch (error) {
        console.error("Test batch data fetch error:", error);
        throw error;
      }
    },
    enabled: !!currentClubId && !!currentTeamId && gameIdsArray.length > 0,
  });

  // Create stable references
  const gameStatsMap = useMemo(() => batchData?.stats || EMPTY_OBJECT, [batchData?.stats, EMPTY_OBJECT]);
  const gameScoresMap = useMemo(() => batchData?.scores || EMPTY_OBJECT, [batchData?.scores, EMPTY_OBJECT]);

  // Get last 5 completed games
  const recentGames = useMemo(() => 
    games?.filter(game => game.statusIsCompleted).slice(0, 5) || EMPTY_ARRAY, 
    [games, EMPTY_ARRAY]
  );

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Game List Test - No Flickering</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Games (Last 5)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentGames.map((game) => (
              <GameResultCard
                key={game.id}
                game={game}
                layout="wide"
                currentTeamId={currentTeamId ?? 0}
                currentClubId={currentClubId ?? 0}
                gameStats={gameStatsMap[game.id] || EMPTY_ARRAY}
                centralizedScores={gameScoresMap[game.id] || EMPTY_ARRAY}
                showQuarterScores={true}
                showLink={true}
                showDate={true}
                showRound={true}
                showScore={true}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}