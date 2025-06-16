import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { useLocation } from 'wouter';
import { useMemo } from 'react';
import { TEAM_NAME } from '@/lib/settings';
import { useClub } from '@/contexts/ClubContext';
import { calculateTeamWinRate, calculateClubWinRate } from '@/lib/winRateCalculator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Trophy, Users, Calendar, TrendingUp, Target, Award } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { Badge } from '@/components/ui/badge';
import { ClubSwitcher } from '@/components/layout/ClubSwitcher';
import RecentGames from '@/components/dashboard/RecentGames';

export default function ClubDashboard() {
  const { currentClub, currentClubId, setCurrentTeamId, isLoading: clubLoading } = useClub();
  const [, navigate] = useLocation();

  // Always call all hooks - handle enabled state through query options
  const { data: players = [], isLoading: isLoadingPlayers } = useQuery<any[]>({
    queryKey: ['club-players', currentClubId],
    queryFn: () => apiClient.get('/api/players'),
    enabled: !!currentClubId && !clubLoading,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000 // 30 minutes
  });

  const { data: games = [], isLoading: isLoadingGames, error: gamesError } = useQuery<any[]>({
    queryKey: ['games', currentClubId, 'all-teams'],
    queryFn: () => apiClient.get('/api/games', { 'x-club-wide': 'true' }),
    enabled: !!currentClubId && !clubLoading,
    staleTime: 15 * 60 * 1000, // 15 minutes (increased for club-wide data)
    gcTime: 60 * 60 * 1000 // 1 hour (much longer for club-wide data)
  });

  const { data: teams = [], isLoading: isLoadingTeams } = useQuery<any[]>({
    queryKey: ['teams', currentClubId],
    queryFn: () => apiClient.get('/api/teams'),
    enabled: !!currentClubId && !clubLoading,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000 // 30 minutes
  });

  const { data: seasons = [], isLoading: isLoadingSeasons } = useQuery<any[]>({
    queryKey: ['/api/seasons', currentClubId],
    queryFn: () => apiClient.get('/api/seasons'),
    enabled: !!currentClubId && !clubLoading,
    staleTime: 15 * 60 * 1000, // 15 minutes (seasons change infrequently)
    gcTime: 60 * 60 * 1000 // 1 hour
  });

  const { data: activeSeason, isLoading: isLoadingActiveSeason } = useQuery<any>({
    queryKey: ['/api/seasons/active', currentClubId],
    queryFn: () => apiClient.get('/api/seasons/active'),
    enabled: !!currentClubId && !clubLoading,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 60 * 60 * 1000 // 1 hour
  });

  // Fetch user's club access
  const { data: userClubs = [], isLoading: isLoadingClubs } = useQuery<any[]>({
    queryKey: ['user-clubs'],
    queryFn: () => apiClient.get('/api/user/clubs'),
  });

  // Fetch current club details - only if we have a valid club ID that the user has access to
  const { data: clubDetails = null, isLoading: isLoadingClubDetails } = useQuery<any>({
    queryKey: ['club-details', currentClubId],
    queryFn: () => apiClient.get(`/api/clubs/${currentClubId}`),
    enabled: !!currentClubId && userClubs.some(club => club.clubId === currentClubId),
  });

  // Fetch official scores for completed games only
  const completedGameIds = useMemo(() => {
    return games?.filter(game => 
      game.statusIsCompleted && game.statusAllowsStatistics
    ).map(game => game.id) || [];
  }, [games]);

  const { data: officialScores = {}, isLoading: isLoadingScores } = useQuery({
    queryKey: ['official-scores', currentClubId, completedGameIds.sort().join(',')],
    queryFn: async () => {
      if (completedGameIds.length === 0) return {};

      try {
        // Fetch official scores for all completed games
        const scoresMap: Record<number, any[]> = {};
        
        const scoresPromises = completedGameIds.map(async (gameId) => {
          try {
            const scores = await apiClient.get(`/api/games/${gameId}/scores`);
            return { gameId, scores: scores || [] };
          } catch (error) {
            console.error(`ClubDashboard: Error fetching scores for game ${gameId}:`, error);
            return { gameId, scores: [] };
          }
        });

        const results = await Promise.all(scoresPromises);
        results.forEach(({ gameId, scores }) => {
          scoresMap[gameId] = scores;
        });

        return scoresMap;
      } catch (error) {
        console.error('ClubDashboard: Error fetching official scores:', error);
        return {};
      }
    },
    enabled: !!currentClubId && !clubLoading && completedGameIds.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000 // 30 minutes
  });

  // Also fetch centralized stats for display purposes (RecentGames component)
  const { data: centralizedStats = {}, isLoading: isLoadingStats } = useQuery({
    queryKey: ['centralized-stats', currentClubId, completedGameIds.sort().join(',')],
    queryFn: async () => {
      if (completedGameIds.length === 0) return {};

      try {
        // Use batch endpoint for better performance
        const batchResponse = await apiClient.post('/api/games/stats/batch', {
          gameIds: completedGameIds
        });
        return batchResponse;
      } catch (error) {
        console.error('ClubDashboard: Batch stats fetch failed, falling back to individual requests:', error);

        // Fallback to individual requests
        const statsMap: Record<number, any[]> = {};
        for (const gameId of completedGameIds) {
          try {
            const stats = await apiClient.get(`/api/games/${gameId}/stats`);
            statsMap[gameId] = stats || [];
          } catch (error) {
            console.error(`ClubDashboard: Error fetching stats for game ${gameId}:`, error);
            statsMap[gameId] = [];
          }
        }
        return statsMap;
      }
    },
    enabled: !!currentClubId && !clubLoading && completedGameIds.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes (increased for better caching)
    gcTime: 30 * 60 * 1000 // 30 minutes (increased for better caching)
  });

  // Calculate club-wide metrics (memoized to prevent unnecessary recalculations)
  const { activeTeams, completedGames, upcomingGames, totalPlayers, activePlayers, clubWinRate } = useMemo(() => {
    const activeTeams = teams.filter(team => team.isActive && team.name !== 'BYE');
    const completedGames = games.filter(game => game.statusIsCompleted);
    const upcomingGames = games.filter(game => !game.statusIsCompleted);

    // Calculate club-wide win rate using official scores
    const clubWinRateData = calculateClubWinRate(games, currentClubId!, officialScores);

    return {
      activeTeams,
      completedGames,
      upcomingGames,
      totalPlayers: players.length, // Count all players, not just active ones
      activePlayers: players.filter(player => player.active),
      clubWinRate: clubWinRateData
    };
  }, [teams, games, players, currentClubId, officialScores]);

  // Memoize expensive calculations separately to prevent cascading re-renders
  const gamesHashKey = useMemo(() => 
    games.map(g => `${g.id}-${g.statusId}`).join(','), 
    [games]
  );
  
  const scoresHashKey = useMemo(() => 
    JSON.stringify(Object.keys(officialScores).sort()), 
    [officialScores]
  );

  // Team performance metrics (memoized to prevent unnecessary recalculations)
  const teamPerformance = useMemo(() => activeTeams.map(team => {
    // Use shared win rate calculator for consistent logic with official scores
    const winRateData = calculateTeamWinRate(games, team.id, currentClubId!, officialScores);

    const teamPerf = {
      ...team,
      totalGames: winRateData.totalGames,
      wins: winRateData.wins,
      losses: winRateData.losses,
      draws: winRateData.draws,
      winRate: winRateData.winRate
    };

    return teamPerf;
  }), [activeTeams, gamesHashKey, currentClubId, scoresHashKey]);

  // Recent games across all teams (memoized)
  const recentGames = useMemo(() => 
    completedGames
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5),
    [completedGames]
  );

  // Now handle loading states after all hooks are called
  const isLoading = isLoadingPlayers || isLoadingGames || isLoadingTeams || isLoadingSeasons || isLoadingActiveSeason || isLoadingStats || isLoadingScores || isLoadingClubs || isLoadingClubDetails;

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading Club Dashboard</h2>
          <p className="text-muted-foreground">Please wait while we load your club data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Club Dashboard | {currentClub?.name} Stats Tracker</title>
        <meta name="description" content={`View ${currentClub?.name} overall performance metrics and team statistics`} />
      </Helmet>

      <div className="container py-8 mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Club Dashboard
            </h1>
            <p className="text-lg text-muted-foreground">
              Overview of {currentClub?.name} performance across all teams
            </p>
          </div>
          <div className="text-right space-y-2">
            <div className="flex justify-end">
              <ClubSwitcher />
            </div>
            <Badge variant="outline" className="text-sm">
              {activeSeason?.name || 'No Active Season'}
            </Badge>
            <p className="text-sm text-muted-foreground">
              {activeTeams.length} active teams
            </p>
          </div>
        </div>

        {/* Key Metrics Row */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Active Teams</CardTitle>
              <div className="p-2 bg-blue-100 rounded-full">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{activeTeams.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Competing in {activeSeason?.name}
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Total Players</CardTitle>
              <div className="p-2 bg-green-100 rounded-full">
                <Target className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">{totalPlayers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {activePlayers.length} active players
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">Games Played</CardTitle>
              <div className="p-2 bg-purple-100 rounded-full">
                <Calendar className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">{clubWinRate.totalGames}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {completedGames.length} total completed, {upcomingGames.length} upcoming
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">Club Win Rate</CardTitle>
              <div className="p-2 bg-orange-100 rounded-full">
                <Trophy className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900">
                {Math.round(clubWinRate.winRate)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {clubWinRate.wins} wins from {clubWinRate.totalGames} games
                {clubWinRate.draws > 0 && `, ${clubWinRate.draws} draws`}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Team Performance Overview */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 bg-slate-200 rounded-full">
                <TrendingUp className="h-5 w-5 text-slate-700" />
              </div>
              Team Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {teamPerformance.map((team) => (
                <div 
                  key={team.id} 
                  onClick={() => {
                    // First set the team in context, then navigate
                    setCurrentTeamId(team.id);
                    navigate(`/team-dashboard/${team.id}`);
                  }}
                  className="flex items-center justify-between p-6 border-2 rounded-xl cursor-pointer transform transition-all duration-300 ease-in-out bg-gradient-to-r from-white to-slate-50 hover:from-blue-50 hover:to-blue-100 hover:shadow-lg hover:scale-[1.02] hover:border-blue-300 active:scale-[0.98]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center transition-colors duration-300 group-hover:bg-primary/20">
                      <span className="text-primary font-bold text-lg">
                        {team.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-slate-900 transition-colors duration-300 hover:text-primary">{team.name}</h4>
                      <p className="text-sm text-slate-600 font-medium">{team.division}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center p-3 bg-blue-50 rounded-lg transition-all duration-300 hover:bg-blue-100 hover:scale-105">
                      <div className="font-bold text-xl text-blue-700">{team.totalGames}</div>
                      <div className="text-blue-600 font-medium">Games</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg transition-all duration-300 hover:bg-green-100 hover:scale-105">
                      <div className="font-bold text-xl text-green-700">{team.wins}</div>
                      <div className="text-green-600 font-medium">Wins</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg transition-all duration-300 hover:bg-purple-100 hover:scale-105">
                      <div className="font-bold text-xl text-purple-700">{Math.round(team.winRate)}%</div>
                      <div className="text-purple-600 font-medium">Win Rate</div>
                    </div>
                    <Badge 
                      variant={team.winRate >= 60 ? "default" : team.winRate >= 40 ? "secondary" : "destructive"}
                      className="text-sm px-3 py-1 font-medium transition-all duration-300 hover:scale-110"
                    >
                      {team.winRate >= 60 ? "Strong" : team.winRate >= 40 ? "Average" : "Needs Focus"}
                    </Badge>
                  </div>

                </div>
              ))}
              {teamPerformance.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-lg font-medium">No team performance data available</p>
                  <p className="text-sm">Teams will appear here once games are played</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Club Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Recent Club Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <RecentGames 
              games={games} 
              opponents={[]} 
              className="md:col-span-2" 
              centralizedStats={centralizedStats}
              centralizedScores={officialScores}
              teams={teams}
              clubWide={true}
            />
              {recentGames.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No recent games to display
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <button className="p-4 border rounded-lg hover:bg-muted/50 transition-colors text-left">
                <div className="font-medium">Manage Teams</div>
                <div className="text-sm text-muted-foreground">Add or edit team information</div>
              </button>
              <button className="p-4 border rounded-lg hover:bg-muted/50 transition-colors text-left">
                <div className="font-medium">Player Management</div>
                <div className="text-sm text-muted-foreground">View all club players</div>
              </button>
              <button className="p-4 border rounded-lg hover:bg-muted/50 transition-colors text-left">
                <div className="font-medium">Schedule Games</div>
                <div className="text-sm text-muted-foreground">Add upcoming fixtures</div>
              </button>
              <button className="p-4 border rounded-lg hover:bg-muted/50 transition-colors text-left">
                <div className="font-medium">Club Settings</div>
                <div className="text-sm text-muted-foreground">Configure club preferences</div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}