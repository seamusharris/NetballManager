import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { useTeamContext } from "@/hooks/use-team-context";
import { useClub } from "@/contexts/ClubContext";
import { apiClient } from "@/lib/apiClient";
import { DynamicBreadcrumbs } from "@/components/layout/DynamicBreadcrumbs";
import { CompactAttackDefenseWidget } from "@/components/ui/compact-attack-defense-widget";
import QuarterPerformanceAnalysisWidget from "@/components/ui/quarter-performance-analysis-widget";
import GameResultCard from "@/components/ui/game-result-card";
import { formatShortDate } from "@/lib/utils";
import { useBatchGameStatistics } from "@/components/statistics/hooks/useBatchGameStatistics";

interface Game {
  id: number;
  date: string;
  time: string;
  homeTeamId: number;
  awayTeamId: number;
  homeTeamName: string;
  awayTeamName: string;
  statusIsCompleted: boolean;
  statusDisplayName: string;
  round: number;
  seasonName: string;
}

interface TeamGameResult extends Game {
  // Additional properties that might be needed
}

export default function GamePreparationAnalysis() {
  const params = useParams<{ teamId?: string; gameId?: string }>();
  const { teamId } = useTeamContext();
  const { currentClubId } = useClub();
  const gameId = params.gameId ? parseInt(params.gameId) : undefined;

  // Load game data
  const { data: game, isLoading: loadingGame } = useQuery<Game>({
    queryKey: ["teams", teamId, "games", gameId],
    queryFn: () => apiClient.get(`/api/teams/${teamId}/games/${gameId}`),
    enabled: !!teamId && !!gameId,
  });

  // Calculate opponent information using standard pattern
  const isHomeGame = game ? game.homeTeamId === teamId : false;
  const opponentTeamId = game ? (isHomeGame ? game.awayTeamId : game.homeTeamId) : null;
  const opponent = game ? (isHomeGame ? game.awayTeamName : game.homeTeamName) : null;

  // Load historical games against this opponent
  const { data: historicalGames = [], isLoading: loadingHistory } = useQuery<TeamGameResult[]>({
    queryKey: ["teams", teamId, "opponents", opponentTeamId, "games"],
    queryFn: async () => {
      if (!teamId || !opponentTeamId) return [];

      // Get all games for the current team
      const allGames = await apiClient.get(`/api/teams/${teamId}/games`);

      // Filter for completed games against this specific opponent
      const historicalMatches = (allGames as TeamGameResult[]).filter((g: any) => {
        // Skip the current game
        if (g.id === gameId) return false;

        // Only include completed games
        if (!g.statusIsCompleted) return false;

        // Check if this game was against the same opponent team ID
        const gameOpponentId = g.homeTeamId === teamId ? g.awayTeamId : g.homeTeamId;
        return gameOpponentId === opponentTeamId;
      });

      return historicalMatches;
    },
    enabled: !!teamId && !!opponentTeamId,
  });

  // Get batch scores for historical games
  const gameIdsArray = historicalGames.map((g) => g.id) || [];
  const { data: batchScores, isLoading: isLoadingBatchScores } = useQuery<Record<number, any[]>>({
    queryKey: ["games", "scores", "batch", gameIdsArray.join(",")],
    queryFn: async () => {
      if (gameIdsArray.length === 0) return {};
      // Use club endpoint like Dashboard does
      return apiClient.post(`/api/clubs/${currentClubId}/games/scores/batch`, { gameIds: gameIdsArray });
    },
    enabled: gameIdsArray.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  // Get batch statistics for historical games
  const { statsMap: batchStats, isLoading: isLoadingBatchStats } = useBatchGameStatistics(gameIdsArray);

  // Debug logging
  console.log('🔍 GamePreparationAnalysis Debug:');
  console.log('🔍 teamId:', teamId);
  console.log('🔍 gameId:', gameId);
  console.log('🔍 game:', game);
  console.log('🔍 opponentTeamId:', opponentTeamId);
  console.log('🔍 opponent:', opponent);
  console.log('🔍 historicalGames length:', historicalGames.length);
  console.log('🔍 gameIdsArray:', gameIdsArray);
  console.log('🔍 batchScores keys:', Object.keys(batchScores || {}));
  console.log('🔍 batchStats keys:', Object.keys(batchStats || {}));

  // Loading state
  if (loadingGame || !game) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p className="mt-2 text-sm text-muted-foreground">Loading game data...</p>
        </div>
      </div>
    );
  }

  // Error state - no opponent found
  if (!opponent || !opponentTeamId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-red-500" />
          <p className="mt-2 text-sm text-muted-foreground">Unable to determine opponent for this game.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Opponent Analysis - ${opponent} | Game Preparation`}</title>
        <meta name="description" content={`Analysis of historical performance against ${opponent}`} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="container py-8 mx-auto space-y-8">
          {/* Breadcrumbs */}
          <DynamicBreadcrumbs />

          {/* Header */}
          <Card className="border-0 shadow-lg text-white" style={{ backgroundColor: "#1e3a8a" }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">
                    Opponent Analysis
                  </h1>
                  <p className="text-blue-100">
                    Historical performance against {opponent} - {formatShortDate(game.date)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          <div className="space-y-6">
            {/* Historical Games Section */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Historical Games vs {opponent}</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingHistory ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading historical games...</span>
                  </div>
                ) : historicalGames.length > 0 ? (
                  <div className="space-y-3">
                    {historicalGames.map((game) => (
                      <Card key={game.id} className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">
                              {game.homeTeamName} vs {game.awayTeamName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatShortDate(game.date)} - Round {game.round}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">{game.statusDisplayName}</div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600">No previous matches against {opponent}</p>
                    <p className="text-xs text-gray-500 mt-1">This will show completed games against the same opponent team</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Analysis Widgets */}
            {historicalGames.length > 0 && (
              <>
                {/* Quarter Performance Analysis Widget */}
                <QuarterPerformanceAnalysisWidget
                  games={historicalGames}
                  currentTeamId={teamId ?? 0}
                  batchScores={batchScores || {}}
                  batchStats={batchStats || {}}
                  className="w-full"
                />

                {/* Compact Attack Defense Widget */}
                <CompactAttackDefenseWidget
                  games={historicalGames}
                  batchScores={batchScores || {}}
                  batchStats={batchStats || {}}
                  teamId={teamId ?? 0}
                  className="w-full"
                />
              </>
            )}

            {/* Fallback when no historical games */}
            {historicalGames.length === 0 && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quarter Performance Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500 text-center py-8">
                      No completed games against {opponent} available for analysis.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Attack vs Defense Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500 text-center py-8">
                      No completed games against {opponent} with position statistics available for analysis.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 