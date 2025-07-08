import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { useLocation, useParams } from 'wouter';
import { useMemo, useEffect } from 'react';
import { TEAM_NAME } from '@/lib/settings';
import { useClub } from '@/contexts/ClubContext';
import { calculateTeamWinRate, calculateClubWinRate } from '@/lib/winRateCalculator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Trophy, Users, Calendar, TrendingUp, Target, Award, BarChart3, Settings, Plus, ArrowRight, Crown, Zap, Activity, Clock, Star } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { CACHE_KEYS } from '@/lib/cacheKeys';
import { Badge } from '@/components/ui/badge';
import { ClubSwitcher } from '@/components/layout/ClubSwitcher';
import RecentGames from '@/components/dashboard/RecentGames';
import PlayerStatsCard from '@/components/statistics/PlayerStatsCard';
import SeasonGamesDisplay from '@/components/ui/season-games-display';
import { cn } from '@/lib/utils';
import { winRateCalculator } from '@/lib/winRateCalculator';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

export default function ClubDashboard() {
  const params = useParams();
  const clubIdFromUrl = params.clubId ? parseInt(params.clubId) : null;
  const { currentClub, currentClubId, setCurrentClubId, setCurrentTeamId, isLoading: clubLoading } = useClub();
  const [, navigate] = useLocation();

  // Use URL club ID if available, otherwise fall back to context
  const effectiveClubId = clubIdFromUrl || currentClubId;

  // Set club context from URL if different
  useEffect(() => {
    if (clubIdFromUrl && clubIdFromUrl !== currentClubId) {
      setCurrentClubId(clubIdFromUrl);
    }
  }, [clubIdFromUrl, currentClubId, setCurrentClubId]);

  // Players data using REST endpoint - Stage 4
  const { data: players = [], isLoading: isLoadingPlayers } = useQuery<any[]>({
    queryKey: ['players', effectiveClubId, 'rest'],
    queryFn: () => apiClient.get(`/api/clubs/${effectiveClubId}/players`),
    enabled: !!effectiveClubId && !clubLoading,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000 // 30 minutes
  });

  // Get games data using REST endpoint - Stage 3
  const { data: games = [], isLoading: isLoadingGames } = useQuery<any[]>({
    queryKey: [CACHE_KEYS.games, effectiveClubId, 'rest'],
    queryFn: () => apiClient.get(`/api/clubs/${effectiveClubId}/games`),
    enabled: !!effectiveClubId && !clubLoading,
    staleTime: 15 * 60 * 1000, // 15 minutes (increased for club-wide data)
    gcTime: 60 * 60 * 1000 // 1 hour (much longer for club-wide data)
  });

  const { data: teams = [], isLoading: isLoadingTeams } = useQuery<any[]>({
    queryKey: ['clubs', effectiveClubId, 'teams'],
    queryFn: () => apiClient.get(`/api/clubs/${effectiveClubId}/teams`),
    enabled: !!effectiveClubId && !clubLoading,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000 // 30 minutes
  });

  const { data: seasons = [], isLoading: isLoadingSeasons } = useQuery<any[]>({
    queryKey: ['/api/seasons', effectiveClubId],
    queryFn: () => apiClient.get('/api/seasons'),
    enabled: !!effectiveClubId && !clubLoading,
    staleTime: 15 * 60 * 1000, // 15 minutes (seasons change infrequently)
    gcTime: 60 * 60 * 1000 // 1 hour
  });

  const { data: activeSeason, isLoading: isLoadingActiveSeason } = useQuery<any>({
    queryKey: ['/api/seasons/active', effectiveClubId],
    queryFn: () => apiClient.get('/api/seasons/active'),
    enabled: !!effectiveClubId && !clubLoading,
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
    queryKey: ['club-details', effectiveClubId],
    queryFn: () => apiClient.get(`/api/clubs/${effectiveClubId}`),
    enabled: !!effectiveClubId && userClubs.some(club => club.clubId === effectiveClubId),
  });

  // Fetch official scores for completed games only
  const completedGameIds = useMemo(() => {
    return games?.filter(game => 
      game.statusIsCompleted && game.statusAllowsStatistics
    ).map(game => game.id) || [];
  }, [games]);

    // All game ids for the club
    const allGameIds = useMemo(() => {
      return games?.map(game => game.id) || [];
    }, [games]);

  const { data: officialScores = {}, isLoading: isLoadingScores } = useQuery({
    queryKey: ['club-official-scores', allGameIds],
    queryFn: async () => {
      if (allGameIds.length === 0) return {};

      console.log('ClubDashboard: Fetching official scores for games:', allGameIds);
      const response = await apiClient.post('/api/games/scores/batch', {
        gameIds: allGameIds
      });
      console.log('ClubDashboard: Official scores batch response:', response);
      return response || {};
    },
    enabled: allGameIds.length > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes for faster updates
  });

  // Use unified data fetcher for consistency with other pages
  const { data: batchData, isLoading: isLoadingBatchData } = useQuery({
    queryKey: ['club-dashboard-batch-data', currentClubId, allGameIds.sort().join(',')],
    queryFn: async () => {
      if (allGameIds.length === 0) return { stats: {}, rosters: {}, scores: {} };

      console.log(`ClubDashboard fetching batch data for ${allGameIds.length} games`);

      try {
        const { dataFetcher } = await import('@/lib/unifiedDataFetcher');
        const result = await dataFetcher.batchFetchGameData({
          gameIds: allGameIds,
          clubId: currentClubId!,
          teamId: undefined, // Club-wide, no specific team
          includeStats: true,
          includeRosters: false, // Don't need rosters for club dashboard
          includeScores: true
        });

        console.log('ClubDashboard batch data result:', result);
        return result;
      } catch (error) {
        console.error('ClubDashboard batch data fetch error:', error);
        throw error;
      }
    },
    enabled: !!currentClubId && !clubLoading && allGameIds.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000 // 30 minutes
  });

  const centralizedStats = batchData?.stats || {};
  const isLoadingStats = isLoadingBatchData;

  // Calculate club-wide metrics (memoized to prevent unnecessary recalculations)
  const { activeTeams, completedGames, upcomingGames, totalPlayers, activePlayers, clubWinRate } = useMemo(() => {
    // Ensure all data is arrays before filtering
    const safeTeams = Array.isArray(teams) ? teams : [];
    const safeGames = Array.isArray(games) ? games : [];
    const safePlayers = Array.isArray(players) ? players : [];

    const activeTeams = safeTeams.filter(team => team.isActive && team.name !== 'BYE');
    const completedGames = safeGames.filter(game => game.statusIsCompleted);
    const upcomingGames = safeGames.filter(game => !game.statusIsCompleted);

    // Calculate club-wide win rate using official scores
    const clubWinRateData = calculateClubWinRate(safeGames, currentClubId!, officialScores);

    return {
      activeTeams,
      completedGames,
      upcomingGames,
      totalPlayers: safePlayers.length, // Count all players, not just active ones
      activePlayers: safePlayers.filter(player => player.active),
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
  const teamPerformance = useMemo(() => {
    if (!activeTeams.length || !games.length) return [];

    return activeTeams.map(team => {
      // Filter games for this specific team
      const teamGames = games.filter(game => 
        game.homeTeamId === team.id || game.awayTeamId === team.id
      );

      // Use shared win rate calculator for consistent logic with official scores
      const winRateData = calculateTeamWinRate(teamGames, team.id, currentClubId!, officialScores);

      console.log(`Team ${team.name} (${team.id}): ${teamGames.length} games, win rate data:`, winRateData);

      const teamPerf = {
        ...team,
        totalGames: winRateData.totalGames,
        wins: winRateData.wins,
        losses: winRateData.losses,
        draws: winRateData.draws,
        winRate: winRateData.winRate
      };

      return teamPerf;
    });
  }, [activeTeams, gamesHashKey, scoresHashKey, currentClubId]);

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <Crown className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-900">Loading Club Data</h3>
            <p className="text-sm text-slate-600">Please wait while we load your club information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <Activity className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-slate-900">Loading Dashboard</h2>
            <p className="text-slate-600 max-w-md">Gathering your club's performance data and team statistics...</p>
            <div className="w-64 mx-auto">
              <Progress value={66} className="h-2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Club Dashboard | ${currentClub?.name || 'Loading'} Stats Tracker`}</title>
        <meta name="description" content={`View ${currentClub?.name || 'club'} overall performance metrics and team statistics`} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        {/* Header Section */}
        <div className="bg-white border-b border-slate-200 shadow-sm">
          <div className="container mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                      Club Dashboard
                    </h1>
                    <p className="text-lg text-slate-600 mt-1">
                      {currentClub?.name} Performance Overview
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right space-y-2">
                  <ClubSwitcher />
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-sm bg-green-50 text-green-700 border-green-200">
                      <Activity className="w-3 h-3 mr-1" />
                      {activeSeason?.name || 'No Active Season'}
                    </Badge>
                    <Badge variant="secondary" className="text-sm">
                      {activeTeams.length} Teams
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8 space-y-8">
          {/* Key Metrics Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Active Teams Metric */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-medium text-blue-700">Active Teams</CardTitle>
                    <div className="text-3xl font-bold text-blue-900">{activeTeams.length}</div>
                  </div>
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-blue-600 font-medium">
                  Competing in {activeSeason?.name || 'current season'}
                </p>
              </CardContent>
            </Card>

            {/* Total Players Metric */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-emerald-50 to-emerald-100/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-medium text-emerald-700">Total Players</CardTitle>
                    <div className="text-3xl font-bold text-emerald-900">{totalPlayers}</div>
                  </div>
                  <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-emerald-600 font-medium">
                  {activePlayers.length} currently active
                </p>
              </CardContent>
            </Card>

            {/* Games Played Metric */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-medium text-purple-700">Games Played</CardTitle>
                    <div className="text-3xl font-bold text-purple-900">{clubWinRate.totalGames}</div>
                  </div>
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-purple-600 font-medium">
                  {upcomingGames.length} upcoming matches
                </p>
              </CardContent>
            </Card>

            {/* Club Win Rate Metric */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-amber-50 to-amber-100/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-medium text-amber-700">Club Win Rate</CardTitle>
                    <div className="text-3xl font-bold text-amber-900">
                      {Math.round(clubWinRate.winRate)}%
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <Progress value={clubWinRate.winRate} className="h-2" />
                  <p className="text-xs text-amber-600 font-medium">
                    {clubWinRate.wins}W • {clubWinRate.losses}L {clubWinRate.draws > 0 && `• ${clubWinRate.draws}D`}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Team Performance Overview */}
          <Card className="shadow-lg border-0 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 to-blue-900 text-white">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold">Team Performance Overview</CardTitle>
                      <p className="text-blue-100 text-sm mt-1">Click any team to view detailed analytics</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    {teamPerformance.length} Teams
                  </Badge>
                </div>
              </CardHeader>
            </div>

            <CardContent className="p-0">
              {teamPerformance.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {teamPerformance.map((team, index) => (
                    <div 
                      key={team.id} 
                      onClick={async () => {
                        console.log(`ClubDashboard: Setting team context to ${team.id} (${team.name})`);
                        setCurrentTeamId(team.id);
                        await new Promise(resolve => setTimeout(resolve, 50));
                        console.log(`ClubDashboard: Navigating to team ${team.id} dashboard`);
                        navigate(`/team/${team.id}/dashboard`);
                      }}
                      className="group p-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 cursor-pointer transition-all duration-300 transform hover:scale-[1.01]"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:shadow-xl transition-shadow">
                              {team.name.charAt(0)}
                            </div>
                            {team.winRate >= 70 && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                                <Star className="w-3 h-3 text-yellow-800" />
                              </div>
                            )}
                          </div>

                          <div className="space-y-1">
                            <h4 className="font-bold text-lg text-slate-900 group-hover:text-blue-700 transition-colors">
                              {team.name}
                            </h4>
                            <p className="text-sm text-slate-600 font-medium">{team.division}</p>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-slate-200 rounded-full h-1.5">
                                <div 
                                  className={`h-1.5 rounded-full transition-all duration-500 ${
                                    team.winRate >= 70 ? 'bg-emerald-500' : 
                                    team.winRate >= 50 ? 'bg-blue-500' : 
                                    team.winRate >= 30 ? 'bg-amber-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${Math.max(team.winRate, 5)}%` }}
                                />
                              </div>
                              <span className="text-xs text-slate-500">{Math.round(team.winRate)}%</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          {/* Stats Grid */}
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-3 bg-slate-50 rounded-lg group-hover:bg-white group-hover:shadow-md transition-all">
                              <div className="font-bold text-lg text-slate-900">{team.totalGames}</div>
                              <div className="text-xs text-slate-600 font-medium">Games</div>
                            </div>

                            <div className="text-center p-3 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 group-hover:shadow-md transition-all">
                              <div className="font-bold text-lg text-emerald-700">{team.wins}</div>
                              <div className="text-xs text-emerald-600 font-medium">Wins</div>
                            </div>

                            <div className="text-center p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 group-hover:shadow-md transition-all">
                              <div className="font-bold text-lg text-blue-700">{Math.round(team.winRate)}%</div>
                              <div className="text-xs text-blue-600 font-medium">Win Rate</div>
                            </div>
                          </div>

                          {/* Performance Badge */}
                          <div className="flex items-center gap-3">
                            <Badge 
                              variant={team.winRate >= 70 ? "default" : team.winRate >= 50 ? "secondary" : team.winRate >= 30 ? "outline" : "destructive"}
                              className={cn(
                                "px-3 py-1 font-semibold transition-all duration-300 group-hover:scale-110",
                                team.winRate >= 70 && "bg-emerald-500 hover:bg-emerald-600",
                                team.winRate >= 50 && team.winRate < 70 && "bg-blue-500 hover:bg-blue-600 text-white",
                                team.winRate >= 30 && team.winRate < 50 && "bg-amber-500 hover:bg-amber-600 text-white"
                              )}
                            >
                              {team.winRate >= 70 ? (
                                <><Star className="w-3 h-3 mr-1" /> Excellent</>
                              ) : team.winRate >= 50 ? (
                                <><Zap className="w-3 h-3 mr-1" /> Strong</>
                              ) : team.winRate >= 30 ? (
                                <><Clock className="w-3 h-3 mr-1" /> Developing</>
                              ) : (
                                <><Target className="w-3 h-3 mr-1" /> Focus Needed</>
                              )}
                            </Badge>

                            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 space-y-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                    <TrendingUp className="h-8 w-8 text-slate-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-slate-900">No Team Data Available</h3>
                    <p className="text-slate-600">Teams will appear here once games are played and recorded</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity & Quick Actions Row */}
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Recent Club Activity - Takes 2 columns */}
            
{/* Recent Form Widget */}
          <RecentFormWidget 
            games={games || []}
            currentTeamId={undefined} // Club-wide view
            currentClubId={currentClubId}
            gameScoresMap={officialScores || {}}
            gameStatsMap={centralizedStats || {}}
            className="border-0 shadow-lg bg-white/80 backdrop-blur-sm w-full"
          />

            {/* Quick Actions - Takes 1 column */}
            <Card className="shadow-lg border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Zap className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
                  </div>
                </CardHeader>
              </div>

              <CardContent className="p-6 space-y-3">
                <Button variant="ghost" className="w-full justify-start h-auto p-4 hover:bg-blue-50 hover:text-blue-700 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">Manage Teams</div>
                      <div className="text-sm text-slate-600">Add or edit team information</div>
                    </div>
                  </div>
                </Button>

                <Button variant="ghost" className="w-full justify-start h-auto p-4 hover:bg-emerald-50 hover:text-emerald-700 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                      <Target className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">Player Management</div>
                      <div className="text-sm text-slate-600">View all club players</div>
                    </div>
                  </div>
                </Button>

                <Button variant="ghost" className="w-full justify-start h-auto p-4 hover:bg-purple-50 hover:text-purple-700 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <Calendar className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">Schedule Games</div>
                      <div className="text-sm text-slate-600">Add upcoming fixtures</div>
                    </div>
                  </div>
                </Button>

                <Separator className="my-4" />

                <Button variant="ghost" className="w-full justify-start h-auto p-4 hover:bg-slate-50 hover:text-slate-700 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                      <Settings className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">Club Settings</div>
                      <div className="text-sm text-slate-600">Configure preferences</div>
                    </div>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}