
import { Helmet } from 'react-helmet';
import { useQuery } from '@tanstack/react-query';
import { useClub } from '@/contexts/ClubContext';
import { apiClient } from '@/lib/apiClient';
import { Loader2 } from 'lucide-react';
import TeamMatchups from '@/components/dashboard/OpponentMatchups';
import { useBatchGameStatistics } from '@/components/statistics/hooks/useBatchGameStatistics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TeamAnalysis() {
  const { currentClub, currentClubId, isLoading: clubLoading } = useClub();

  const { data: games = [], isLoading: isLoadingGames } = useQuery<any[]>({
    queryKey: ['games', currentClubId],
    queryFn: () => apiClient.get('/api/games'),
    enabled: !!currentClubId,
  });

  // Get completed games for stats
  const completedGames = games.filter(game => game.statusIsCompleted);
  const gameIds = completedGames.map(game => game.id);

  // Fetch batch statistics for all completed games
  const { data: centralizedStats = {}, isLoading: isLoadingStats } = useBatchGameStatistics(gameIds);

  if (clubLoading || !currentClubId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p className="mt-2 text-sm text-muted-foreground">Loading club data...</p>
        </div>
      </div>
    );
  }

  const isLoading = isLoadingGames || isLoadingStats;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading Team Analysis</h2>
          <p className="text-muted-foreground">Analyzing matchups and performance data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Team Analysis | {currentClub?.name} Stats Tracker</title>
        <meta name="description" content={`Detailed analysis of ${currentClub?.name} performance against opposing teams`} />
      </Helmet>

      <div className="container py-8 mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Team Analysis
            </h1>
            <p className="text-lg text-muted-foreground">
              Detailed matchup analysis and team performance insights
            </p>
          </div>
        </div>

        {/* Main Analysis Content */}
        <div className="grid gap-6">
          {/* Team Matchups - Full Width */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Team Matchup Analysis</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <TeamMatchups 
                games={games}
                currentClubId={currentClubId}
                centralizedStats={centralizedStats}
                className="border-0 shadow-none"
              />
            </CardContent>
          </Card>

          {/* Additional Analysis Sections */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-700">{completedGames.length}</div>
                      <div className="text-sm text-blue-600">Games Played</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-700">
                        {Object.keys(centralizedStats).length}
                      </div>
                      <div className="text-sm text-green-600">With Statistics</div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Comprehensive analysis of team performance across all matchups
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Analysis Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Head-to-head win/loss records</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Scoring differential analysis</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm">Recent form tracking</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">Performance trends</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
