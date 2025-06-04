
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
    queryKey: ['games', currentClubId],
    queryFn: () => apiClient.get('/api/games'),
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

  const isLoading = isLoadingPlayers || isLoadingGames || isLoadingTeams || isLoadingSeasons || isLoadingActiveSeason;

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
  const activePlayers = players.filter(player => player.isActive);

  // Team performance metrics
  const teamPerformance = activeTeams.map(team => {
    const teamGames = games.filter(game => 
      game.homeTeamId === team.id || game.awayTeamId === team.id
    );
    const teamCompletedGames = teamGames.filter(game => game.statusIsCompleted);
    
    const wins = teamCompletedGames.filter(game => {
      if (game.homeTeamId === team.id) {
        return game.statusName === 'completed' && game.statusTeamGoals > game.statusOpponentGoals;
      } else {
        return game.statusName === 'completed' && game.statusOpponentGoals > game.statusTeamGoals;
      }
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

      <div className="container py-8 mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Club Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of {currentClub?.name} performance across all teams
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            {activeSeason?.name || 'No Active Season'}
          </Badge>
        </div>

        {/* Key Metrics Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Teams</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeTeams.length}</div>
              <p className="text-xs text-muted-foreground">
                Competing in {activeSeason?.name}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Players</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activePlayers.length}</div>
              <p className="text-xs text-muted-foreground">
                Active across all teams
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Games Played</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedGames.length}</div>
              <p className="text-xs text-muted-foreground">
                {upcomingGames.length} upcoming
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Club Win Rate</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {teamPerformance.length > 0 
                  ? Math.round(teamPerformance.reduce((sum, team) => sum + team.winRate, 0) / teamPerformance.length)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Average across teams
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Team Performance Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Team Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamPerformance.map((team) => (
                <div key={team.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div>
                      <h4 className="font-semibold">{team.name}</h4>
                      <p className="text-sm text-muted-foreground">{team.division}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-semibold">{team.totalGames}</div>
                      <div className="text-muted-foreground">Games</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">{team.wins}</div>
                      <div className="text-muted-foreground">Wins</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">{Math.round(team.winRate)}%</div>
                      <div className="text-muted-foreground">Win Rate</div>
                    </div>
                    <Badge variant={team.winRate >= 60 ? "default" : team.winRate >= 40 ? "secondary" : "destructive"}>
                      {team.winRate >= 60 ? "Strong" : team.winRate >= 40 ? "Average" : "Needs Focus"}
                    </Badge>
                  </div>
                </div>
              ))}
              {teamPerformance.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No team performance data available
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
