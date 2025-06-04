
import { Helmet } from 'react-helmet';
import { useQuery } from '@tanstack/react-query';
import { useClub } from '@/contexts/ClubContext';
import { apiClient } from '@/lib/apiClient';
import { Loader2, TrendingUp, Target, Award, BarChart3 } from 'lucide-react';
import { useBatchGameStatistics } from '@/components/statistics/hooks/useBatchGameStatistics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface TeamStats {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  avgScoreFor: number;
  avgScoreAgainst: number;
  scoreDifferential: number;
  recentForm: string[];
}

interface OpponentTeamData {
  teamId: number;
  teamName: string;
  clubName: string;
  division: string;
  stats: TeamStats;
}

export default function TeamAnalysis() {
  const { currentClub, currentClubId, isLoading: clubLoading } = useClub();

  const { data: games = [], isLoading: isLoadingGames } = useQuery<any[]>({
    queryKey: ['games', currentClubId],
    queryFn: () => apiClient.get('/api/games'),
    enabled: !!currentClubId,
  });

  const { data: teams = [], isLoading: isLoadingTeams } = useQuery<any[]>({
    queryKey: ['teams-all', currentClubId],
    queryFn: () => apiClient.get('/api/teams/all'),
    enabled: !!currentClubId,
  });

  // Get completed games for stats
  const completedGames = games.filter(game => game.statusIsCompleted);
  const gameIds = completedGames.map(game => game.id);

  // Fetch batch statistics for all completed games
  const { statsMap: centralizedStats = {}, isLoading: isLoadingStats } = useBatchGameStatistics(gameIds);

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

  const isLoading = isLoadingGames || isLoadingStats || isLoadingTeams;

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

  // Calculate opponent team data
  const opponentTeamsData: OpponentTeamData[] = [];
  const processedTeams = new Set<number>();

  completedGames.forEach(game => {
    // Determine which team is the opponent (not from our club)
    const isHomeGame = game.homeClubId === currentClubId;
    const opponentTeamId = isHomeGame ? game.awayTeamId : game.homeTeamId;
    const opponentTeamName = isHomeGame ? game.awayTeamName : game.homeTeamName;
    const opponentClubName = isHomeGame ? game.awayClubName : game.homeClubName;
    
    if (!processedTeams.has(opponentTeamId)) {
      processedTeams.add(opponentTeamId);
      
      // Get all games against this opponent
      const gamesVsOpponent = completedGames.filter(g => {
        const isHome = g.homeClubId === currentClubId;
        const oppId = isHome ? g.awayTeamId : g.homeTeamId;
        return oppId === opponentTeamId;
      });

      if (gamesVsOpponent.length > 0) {
        // Calculate stats using centralized statistics
        let wins = 0;
        let losses = 0;
        let draws = 0;
        let totalScoreFor = 0;
        let totalScoreAgainst = 0;
        const recentForm: string[] = [];

        gamesVsOpponent.forEach(g => {
          const isHome = g.homeClubId === currentClubId;
          const gameStats = centralizedStats[g.id] || [];
          
          // Calculate scores from game statistics
          let ourScore = 0;
          let theirScore = 0;
          
          if (gameStats.length > 0) {
            gameStats.forEach(stat => {
              ourScore += stat.goalsFor || 0;
              theirScore += stat.goalsAgainst || 0;
            });
          } else {
            // Fallback to game status scores if no stats available
            ourScore = isHome ? (g.statusTeamGoals || 0) : (g.statusOpponentGoals || 0);
            theirScore = isHome ? (g.statusOpponentGoals || 0) : (g.statusTeamGoals || 0);
          }

          totalScoreFor += ourScore;
          totalScoreAgainst += theirScore;
          
          if (ourScore > theirScore) {
            wins++;
            recentForm.push('W');
          } else if (ourScore < theirScore) {
            losses++;
            recentForm.push('L');
          } else {
            draws++;
            recentForm.push('D');
          }
        });

        const totalGamesVsOpponent = gamesVsOpponent.length;
        const stats: TeamStats = {
          totalGames: totalGamesVsOpponent,
          wins,
          losses,
          draws,
          winRate: totalGamesVsOpponent > 0 ? (wins / totalGamesVsOpponent) * 100 : 0,
          avgScoreFor: totalGamesVsOpponent > 0 ? totalScoreFor / totalGamesVsOpponent : 0,
          avgScoreAgainst: totalGamesVsOpponent > 0 ? totalScoreAgainst / totalGamesVsOpponent : 0,
          scoreDifferential: totalGamesVsOpponent > 0 ? (totalScoreFor - totalScoreAgainst) / totalGamesVsOpponent : 0,
          recentForm: recentForm.slice(-5) // Last 5 games
        };

        opponentTeamsData.push({
          teamId: opponentTeamId,
          teamName: opponentTeamName,
          clubName: opponentClubName,
          division: '', // Could extract from team data if needed
          stats
        });
      }
    }
  });

  // Sort by total games played (most frequent opponents first)
  opponentTeamsData.sort((a, b) => b.stats.totalGames - a.stats.totalGames);

  // Calculate overall stats
  const totalGamesPlayed = completedGames.length;
  const totalWins = opponentTeamsData.reduce((sum, team) => sum + team.stats.wins, 0);
  const totalLosses = opponentTeamsData.reduce((sum, team) => sum + team.stats.losses, 0);
  const totalDraws = opponentTeamsData.reduce((sum, team) => sum + team.stats.draws, 0);
  const overallWinRate = totalGamesPlayed > 0 ? (totalWins / totalGamesPlayed) * 100 : 0;
  const avgScoreFor = opponentTeamsData.length > 0 ? opponentTeamsData.reduce((sum, team) => sum + (team.stats.avgScoreFor * team.stats.totalGames), 0) / totalGamesPlayed : 0;
  const avgScoreAgainst = opponentTeamsData.length > 0 ? opponentTeamsData.reduce((sum, team) => sum + (team.stats.avgScoreAgainst * team.stats.totalGames), 0) / totalGamesPlayed : 0;

  const getFormBadgeColor = (result: string) => {
    switch (result) {
      case 'W': return 'bg-green-500';
      case 'L': return 'bg-red-500';
      case 'D': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <>
      <Helmet>
        <title>Team Analysis | {currentClub?.name} Stats Tracker</title>
        <meta name="description" content={`Detailed analysis of ${currentClub?.name} performance against opposing teams`} />
      </Helmet>

      <div className="container py-6 mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-heading font-bold text-neutral-dark">
              Team Analysis
            </h1>
            <p className="text-lg text-gray-600">
              Performance analysis against all opposing teams
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Games</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalGamesPlayed}</div>
              <p className="text-xs text-muted-foreground">
                Completed matches
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallWinRate.toFixed(1)}%</div>
              <Progress value={overallWinRate} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {totalWins}W - {totalLosses}L - {totalDraws}D
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Opponents Faced</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{opponentTeamsData.length}</div>
              <p className="text-xs text-muted-foreground">
                Different teams
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgScoreFor.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                vs {avgScoreAgainst.toFixed(1)} against
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Opponent Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Opponent Performance Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {opponentTeamsData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No completed games found.</p>
                <p className="text-sm mt-2">Performance data will appear here after games are completed.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {opponentTeamsData.map((opponent) => (
                  <div key={opponent.teamId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{opponent.teamName}</h3>
                        <p className="text-sm text-gray-600">{opponent.clubName}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          {opponent.stats.wins}-{opponent.stats.losses}
                          {opponent.stats.draws > 0 && `-${opponent.stats.draws}`}
                        </div>
                        <div className="text-sm text-gray-600">W-L{opponent.stats.draws > 0 ? '-D' : ''} Record</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3">
                      <div className="text-center">
                        <div className="text-lg font-semibold">{opponent.stats.totalGames}</div>
                        <div className="text-xs text-gray-600">Games</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{opponent.stats.winRate.toFixed(1)}%</div>
                        <div className="text-xs text-gray-600">Win Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{opponent.stats.avgScoreFor.toFixed(1)}</div>
                        <div className="text-xs text-gray-600">Avg For</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{opponent.stats.avgScoreAgainst.toFixed(1)}</div>
                        <div className="text-xs text-gray-600">Avg Against</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-semibold ${opponent.stats.scoreDifferential >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {opponent.stats.scoreDifferential >= 0 ? '+' : ''}{opponent.stats.scoreDifferential.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-600">Score Diff</div>
                      </div>
                    </div>

                    {opponent.stats.recentForm.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Recent Form:</span>
                        <div className="flex gap-1">
                          {opponent.stats.recentForm.map((result, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary" 
                              className={`w-6 h-6 p-0 flex items-center justify-center text-white ${getFormBadgeColor(result)}`}
                            >
                              {result}
                            </Badge>
                          ))}
                        </div>
                        <span className="text-xs text-gray-600 ml-2">
                          (Most recent {opponent.stats.recentForm.length} games)
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
