
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { TEAM_NAME } from '@/lib/settings';
import { useClub } from '@/contexts/ClubContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Trophy, Users, Calendar, TrendingUp, Target, Award } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { Badge } from '@/components/ui/badge';

export default function ClubDashboard() {
  const { currentClub, currentClubId, isLoading: clubLoading } = useClub();

  // Fetch all club data
  const { data: players = [], isLoading: isLoadingPlayers } = useQuery<any[]>({
    queryKey: ['players', currentClubId],
    queryFn: () => apiClient.get('/api/players'),
    enabled: !!currentClubId,
  });

  const { data: games = [], isLoading: isLoadingGames } = useQuery<any[]>({
    queryKey: ['club-games', currentClubId],
    queryFn: () => apiClient.get('/api/games', { 
      'x-club-wide': 'true',
      'x-current-team-id': '' // Clear any team filter for club-wide view
    }),
    enabled: !!currentClubId,
  });

  const { data: teams = [], isLoading: isLoadingTeams } = useQuery<any[]>({
    queryKey: ['teams', currentClubId],
    queryFn: () => apiClient.get('/api/teams'),
    enabled: !!currentClubId,
  });

  const { data: seasons = [], isLoading: isLoadingSeasons } = useQuery<any[]>({
    queryKey: ['/api/seasons', currentClubId],
    queryFn: () => apiClient.get('/api/seasons'),
    enabled: !!currentClubId,
  });

  const { data: activeSeason, isLoading: isLoadingActiveSeason } = useQuery<any>({
    queryKey: ['/api/seasons/active', currentClubId],
    queryFn: () => apiClient.get('/api/seasons/active'),
    enabled: !!currentClubId,
  });

  // Centralized stats fetching for completed games only
  const completedGameIds = games?.filter(game => 
    game.statusIsCompleted && game.statusAllowsStatistics
  ).map(game => game.id) || [];

  const { data: centralizedStats = {}, isLoading: isLoadingStats } = useQuery({
    queryKey: ['club-centralizedStats', currentClubId, completedGameIds.join(',')],
    queryFn: async () => {
      if (completedGameIds.length === 0) return {};

      console.log(`ClubDashboard centralizing stats fetch for ${completedGameIds.length} completed games`);
      const statsMap: Record<number, any[]> = {};

      // Fetch stats for completed games only
      for (const gameId of completedGameIds) {
        try {
          const stats = await apiClient.get(`/api/games/${gameId}/stats`);
          statsMap[gameId] = stats || [];
        } catch (error) {
          console.error(`Error fetching stats for game ${gameId}:`, error);
          statsMap[gameId] = [];
        }
      }

      console.log(`ClubDashboard centralized stats fetch completed for ${Object.keys(statsMap).length} games`);
      return statsMap;
    },
    enabled: !!currentClubId && completedGameIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000 // 15 minutes
  });

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

  const isLoading = isLoadingPlayers || isLoadingGames || isLoadingTeams || isLoadingSeasons || isLoadingActiveSeason || isLoadingStats;

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

  // Calculate club-wide metrics
  const activeTeams = teams.filter(team => team.isActive && team.name !== 'BYE');
  const completedGames = games.filter(game => game.statusIsCompleted);
  const upcomingGames = games.filter(game => !game.statusIsCompleted);
  const totalPlayers = players.length; // Count all players, not just active ones
  const activePlayers = players.filter(player => player.isActive);

  // Team performance metrics
  const teamPerformance = activeTeams.map(team => {
    // Filter games where this team is playing (either home or away)
    const teamGames = games.filter(game => 
      game.homeTeamId === team.id || game.awayTeamId === team.id
    );
    const teamCompletedGames = teamGames.filter(game => game.statusIsCompleted);
    
    const wins = teamCompletedGames.filter(game => {
      // Use game statistics which are always from our team's perspective
      const gameStats = centralizedStats[game.id] || [];
      if (gameStats.length === 0) return false;
      
      // Calculate total goals for and against from all quarters
      const totalGoalsFor = gameStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
      const totalGoalsAgainst = gameStats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);
      
      return totalGoalsFor > totalGoalsAgainst;
    }).length;

    return {
      ...team,
      totalGames: teamCompletedGames.length,
      wins,
      winRate: teamCompletedGames.length > 0 ? (wins / teamCompletedGames.length) * 100 : 0
    };
  });

  // Recent games across all teams
  const recentGames = completedGames
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

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
          <div className="text-right">
            <Badge variant="outline" className="text-sm mb-2">
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
              <div className="text-3xl font-bold text-purple-900">{completedGames.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {upcomingGames.length} upcoming
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
                {(() => {
                  const totalWins = teamPerformance.reduce((sum, team) => sum + team.wins, 0);
                  const totalGames = teamPerformance.reduce((sum, team) => sum + team.totalGames, 0);
                  return totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;
                })()}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {teamPerformance.reduce((sum, team) => sum + team.wins, 0)} wins from {teamPerformance.reduce((sum, team) => sum + team.totalGames, 0)} games
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
                  onClick={() => window.location.href = `/dashboard/${team.id}`}
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
                  <div className="flex items-center opacity-60 transition-opacity duration-300 hover:opacity-100">
                    <div className="text-sm text-slate-500 font-medium">
                      Click to view →
                    </div>
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
              {recentGames.map((game) => (
                <div key={game.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <div className="text-sm">
                      <div className="font-medium">
                        {game.homeTeamName} vs {game.awayTeamName}
                      </div>
                      <div className="text-muted-foreground">
                        {new Date(game.date).toLocaleDateString()} • {game.seasonName}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {game.statusTeamGoals !== null && game.statusOpponentGoals !== null ? (
                      <Badge variant="outline">
                        {game.statusTeamGoals}-{game.statusOpponentGoals}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        {game.statusDisplayName}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
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
