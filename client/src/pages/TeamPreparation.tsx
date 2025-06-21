import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useClub } from '@/contexts/ClubContext';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, TrendingDown, Minus, Target, Users, Trophy, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

interface Team {
  id: number;
  name: string;
  division: string;
  club_id: number;
  season_id: number;
}

interface Game {
  id: number;
  date: string;
  time: string;
  homeTeamId: number | null;
  awayTeamId: number | null;
  homeTeamName?: string;
  awayTeamName?: string;
  statusId: number | null;
  statusDisplayName?: string;
  round?: string;
  venue?: string;
  seasonId: number | null;
}

export default function TeamPreparation() {
  const { currentTeamId, currentClubId } = useClub();
  const [selectedOpponentId, setSelectedOpponentId] = useState<number | null>(null);
  const [, setLocation] = useLocation();

  // Get current team details
  const { data: currentTeam } = useQuery<Team>({
    queryKey: ['/api/teams', currentTeamId],
    enabled: !!currentTeamId,
  });

  // Get all teams in the same division/section
  const { data: allTeams = [] } = useQuery<Team[]>({
    queryKey: ['/api/teams'],
    enabled: !!currentClubId && !!currentTeam,
  });

  // Filter teams to same division, excluding current team
  const samesSectionTeams = useMemo(() => {
    if (!currentTeam || !allTeams.length) return [];
    return allTeams.filter(team => 
      team.division === currentTeam.division && 
      team.id !== currentTeamId &&
      team.season_id === currentTeam.season_id
    );
  }, [allTeams, currentTeam, currentTeamId]);

  // Get games for analysis
  const { data: allGames = [] } = useQuery<Game[]>({
    queryKey: ['/api/games'],
    enabled: !!currentClubId,
  });

  // Get historical games between current team and selected opponent
  const historicalGames = useMemo(() => {
    if (!selectedOpponentId || !currentTeamId) return [];
    return allGames.filter(game => 
      (game.homeTeamId === currentTeamId && game.awayTeamId === selectedOpponentId) ||
      (game.homeTeamId === selectedOpponentId && game.awayTeamId === currentTeamId)
    );
  }, [allGames, currentTeamId, selectedOpponentId]);

  // Get opponent team details
  const selectedOpponent = samesSectionTeams.find(team => team.id === selectedOpponentId);

  // Get games for current team (for season analysis)
  const currentTeamGames = useMemo(() => {
    if (!currentTeamId) return [];
    return allGames.filter(game => 
      game.homeTeamId === currentTeamId || game.awayTeamId === currentTeamId
    );
  }, [allGames, currentTeamId]);

  // Get games for opponent team (for season analysis)
  const opponentGames = useMemo(() => {
    if (!selectedOpponentId) return [];
    return allGames.filter(game => 
      game.homeTeamId === selectedOpponentId || game.awayTeamId === selectedOpponentId
    );
  }, [allGames, selectedOpponentId]);

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (current < previous) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  if (!currentTeam) {
    return (
      <PageTemplate title="Team Preparation">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Please select a team to begin preparation analysis.</p>
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate title="Team Preparation">
      <div className="space-y-6">
        {/* Header with team selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Team Matchup Analysis
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Compare {currentTeam?.name} against other teams in {currentTeam?.division}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-50">
                    Your Team
                  </Badge>
                  <span className="font-medium">{currentTeam?.name}</span>
                </div>
                <span className="text-muted-foreground">vs</span>
                <div className="flex-1">
                  <Select 
                    value={selectedOpponentId?.toString() || ""} 
                    onValueChange={(value) => setSelectedOpponentId(value ? parseInt(value) : null)}
                  >
                    <SelectTrigger className="w-full max-w-xs">
                      <SelectValue placeholder="Select opponent team..." />
                    </SelectTrigger>
                    <SelectContent>
                      {samesSectionTeams.map((team) => (
                        <SelectItem key={team.id} value={team.id.toString()}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {samesSectionTeams.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No other teams found in {currentTeam?.division}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {selectedOpponent && (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="season">Season Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Head-to-Head Record */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-600" />
                    Head-to-Head Record
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {historicalGames.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {historicalGames.filter(game => 
                              (game.homeTeamId === currentTeamId && game.statusDisplayName?.includes('Win')) ||
                              (game.awayTeamId === currentTeamId && game.statusDisplayName?.includes('Loss'))
                            ).length}
                          </div>
                          <p className="text-sm text-muted-foreground">Wins</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">
                            {historicalGames.filter(game => 
                              (game.homeTeamId === currentTeamId && game.statusDisplayName?.includes('Loss')) ||
                              (game.awayTeamId === currentTeamId && game.statusDisplayName?.includes('Win'))
                            ).length}
                          </div>
                          <p className="text-sm text-muted-foreground">Losses</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-600">
                            {historicalGames.length}
                          </div>
                          <p className="text-sm text-muted-foreground">Total Games</p>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <h4 className="font-semibold">Recent Matchups</h4>
                        {historicalGames.slice(0, 5).map((game) => (
                          <div key={game.id} className="flex justify-between items-center p-2 rounded bg-gray-50">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{game.date}</span>
                              <Badge variant="outline" className="text-xs">
                                {game.round || 'Regular'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">
                                {game.homeTeamId === currentTeamId ? currentTeam?.name : selectedOpponent?.name} vs{' '}
                                {game.awayTeamId === currentTeamId ? currentTeam?.name : selectedOpponent?.name}
                              </span>
                              {game.statusDisplayName && (
                                <Badge variant={
                                  (game.homeTeamId === currentTeamId && game.statusDisplayName.includes('Win')) ||
                                  (game.awayTeamId === currentTeamId && game.statusDisplayName.includes('Loss'))
                                    ? 'default' : 'destructive'
                                }>
                                  {game.statusDisplayName}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No previous games found between these teams</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        This will be a fresh matchup!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Team Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <h4 className="font-semibold text-blue-600 mb-3">{currentTeam?.name}</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Games Played</span>
                          <Badge variant="outline">{currentTeamGames.length}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Division</span>
                          <Badge variant="secondary">{currentTeam?.division}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Recent Form</span>
                          <div className="flex gap-1">
                            {currentTeamGames.slice(-5).map((game, idx) => (
                              <div 
                                key={game.id} 
                                className={`w-2 h-2 rounded-full ${
                                  game.statusDisplayName?.includes('Win') ? 'bg-green-500' :
                                  game.statusDisplayName?.includes('Loss') ? 'bg-red-500' : 'bg-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-red-600 mb-3">{selectedOpponent.name}</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Games Played</span>
                          <Badge variant="outline">{opponentGames.length}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Division</span>
                          <Badge variant="secondary">{selectedOpponent.division}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Recent Form</span>
                          <div className="flex gap-1">
                            {opponentGames.slice(-5).map((game, idx) => (
                              <div 
                                key={game.id} 
                                className={`w-2 h-2 rounded-full ${
                                  game.statusDisplayName?.includes('Win') ? 'bg-green-500' :
                                  game.statusDisplayName?.includes('Loss') ? 'bg-red-500' : 'bg-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="season" className="space-y-6">
              {/* Season Performance Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    Season Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-blue-600">{currentTeam.name}</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span>Win Rate</span>
                          <Badge className="bg-blue-100 text-blue-800">
                            {currentTeamGames.length > 0 
                              ? Math.round((currentTeamGames.filter(g => g.statusDisplayName?.includes('Win')).length / currentTeamGames.length) * 100)
                              : 0}%
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Total Games</span>
                          <Badge variant="outline">{currentTeamGames.length}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Wins</span>
                          <Badge className="bg-green-100 text-green-800">
                            {currentTeamGames.filter(g => g.statusDisplayName?.includes('Win')).length}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Losses</span>
                          <Badge className="bg-red-100 text-red-800">
                            {currentTeamGames.filter(g => g.statusDisplayName?.includes('Loss')).length}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-semibold text-red-600">{selectedOpponent.name}</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span>Win Rate</span>
                          <Badge className="bg-red-100 text-red-800">
                            {opponentGames.length > 0 
                              ? Math.round((opponentGames.filter(g => g.statusDisplayName?.includes('Win')).length / opponentGames.length) * 100)
                              : 0}%
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Total Games</span>
                          <Badge variant="outline">{opponentGames.length}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Wins</span>
                          <Badge className="bg-green-100 text-green-800">
                            {opponentGames.filter(g => g.statusDisplayName?.includes('Win')).length}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Losses</span>
                          <Badge className="bg-red-100 text-red-800">
                            {opponentGames.filter(g => g.statusDisplayName?.includes('Loss')).length}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Schedule Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <h4 className="font-semibold mb-3">{currentTeam.name} - Next Games</h4>
                      <div className="space-y-2">
                        {currentTeamGames
                          .filter(game => new Date(game.date) > new Date())
                          .slice(0, 3)
                          .map((game) => (
                            <div key={game.id} className="flex justify-between items-center p-2 rounded bg-blue-50">
                              <span className="text-sm">{game.date}</span>
                              <span className="text-sm font-medium">
                                vs {game.homeTeamId === currentTeamId ? game.awayTeamName : game.homeTeamName}
                              </span>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">{selectedOpponent.name} - Next Games</h4>
                      <div className="space-y-2">
                        {opponentGames
                          .filter(game => new Date(game.date) > new Date())
                          .slice(0, 3)
                          .map((game) => (
                            <div key={game.id} className="flex justify-between items-center p-2 rounded bg-red-50">
                              <span className="text-sm">{game.date}</span>
                              <span className="text-sm font-medium">
                                vs {game.homeTeamId === selectedOpponentId ? game.awayTeamName : game.homeTeamName}
                              </span>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Action Buttons */}
        {selectedOpponent && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Button 
                  onClick={() => setLocation('/game-preparation')}
                  className="flex items-center gap-2"
                >
                  <Target className="h-4 w-4" />
                  View Game Preparation
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setLocation('/statistics')}
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  View Detailed Stats
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageTemplate>
  );
}