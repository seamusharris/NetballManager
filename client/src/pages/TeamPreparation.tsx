import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useClub } from '@/contexts/ClubContext';
import { apiClient } from '@/lib/apiClient';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import PreviousGamesDisplay from '@/components/ui/previous-games-display';
import { useLocation } from 'wouter';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, TrendingDown, Minus, Target, Users, Trophy, Calendar } from 'lucide-react';

interface Team {
  id: number;
  name: string;
  division: string;
  club_id?: number;
  clubId?: number;
  season_id?: number;
  seasonId?: number;
  clubName?: string;
  clubCode?: string;
}

interface Game {
  id: number;
  date: string;
  time: string;
  homeTeamId: number | null;
  awayTeamId: number | null;
  homeTeamName?: string;
  awayTeamName?: string;
  homeTeamDivision?: string;
  awayTeamDivision?: string;
  homeClubName?: string;
  awayClubName?: string;
  homeClubCode?: string;
  awayClubCode?: string;
  statusId: number | null;
  statusDisplayName?: string;
  round?: string;
  venue?: string;
  seasonId: number | null;
}

export default function TeamPreparation() {
  const { currentClubId, currentTeamId } = useClub();
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [selectedOpponentId, setSelectedOpponentId] = useState<number | null>(null);
  const [, setLocation] = useLocation();

  // Get all teams from current club
  const { data: clubTeams = [], isLoading: teamsLoading, error: teamsError } = useQuery<Team[]>({
    queryKey: ['teams', currentClubId],
    enabled: !!currentClubId,
  });

  // Get selected team details
  const { data: selectedTeam } = useQuery<Team>({
    queryKey: ['/api/teams', selectedTeamId],
    enabled: !!selectedTeamId,
  });

  // Get games for analysis
  const { data: allGames = [], isLoading: gamesLoading } = useQuery<Game[]>({
    queryKey: ['games', currentClubId],
    queryFn: () => apiClient.get('/api/games'),
    enabled: !!currentClubId,
  });

  // Get all teams across all clubs to find opponent teams
  const { data: allTeams = [] } = useQuery<Team[]>({
    queryKey: ['/api/teams/all'],
    enabled: !!currentClubId,
  });

  // Debug logging
  console.log('Team loading debug:', {
    currentClubId,
    clubTeams,
    teamsLoading,
    teamsError,
    dataLength: clubTeams?.length,
    selectedTeamId,
    gamesCount: allGames?.length,
    gamesLoading,
    allGamesRaw: allGames
  });

  // Get teams that the selected team has played against
  const opponentTeamsFromGames = useMemo(() => {
    console.log('=== OPPONENT ANALYSIS START ===');
    console.log('selectedTeamId:', selectedTeamId);
    console.log('allGames.length:', allGames.length);
    console.log('gamesLoading:', gamesLoading);

    if (!selectedTeamId || !allGames.length || gamesLoading) {
      console.log('Early return - no team selected, no games, or still loading');
      return [];
    }

    const opponentIds = new Set<number>();
    const gamesForTeam = allGames.filter(game => 
      game.homeTeamId === selectedTeamId || game.awayTeamId === selectedTeamId
    );

    console.log('Games for selected team:', gamesForTeam.length);
    console.log('First few games for team:', gamesForTeam.slice(0, 3));

    gamesForTeam.forEach(game => {
      if (game.homeTeamId === selectedTeamId && game.awayTeamId) {
        opponentIds.add(game.awayTeamId);
        console.log('Found opponent (away):', game.awayTeamName, 'ID:', game.awayTeamId);
      } else if (game.awayTeamId === selectedTeamId && game.homeTeamId) {
        opponentIds.add(game.homeTeamId);
        console.log('Found opponent (home):', game.homeTeamName, 'ID:', game.homeTeamId);
      }
    });

    // Extract opponent teams directly from game data
    const opponents: Team[] = [];
    gamesForTeam.forEach(game => {
      if (game.homeTeamId === selectedTeamId && game.awayTeamId && game.awayTeamName) {
        const opponentTeam = {
          id: game.awayTeamId,
          name: game.awayTeamName,
          division: game.awayTeamDivision || '',
          clubName: game.awayClubName,
          clubCode: game.awayClubCode
        };
        if (!opponents.find(t => t.id === opponentTeam.id)) {
          opponents.push(opponentTeam);
        }
      } else if (game.awayTeamId === selectedTeamId && game.homeTeamId && game.homeTeamName) {
        const opponentTeam = {
          id: game.homeTeamId,
          name: game.homeTeamName,
          division: game.homeTeamDivision || '',
          clubName: game.homeClubName,
          clubCode: game.homeClubCode
        };
        if (!opponents.find(t => t.id === opponentTeam.id)) {
          opponents.push(opponentTeam);
        }
      }
    });

    console.log('=== FINAL OPPONENT RESULTS ===');
    console.log('Opponent IDs found:', Array.from(opponentIds));
    console.log('Opponent teams:', opponents);
    console.log('=== OPPONENT ANALYSIS END ===');

    return opponents;
  }, [selectedTeamId, allGames, gamesLoading]);

  // Get scores for games
  const gameIds = allGames.map(game => game.id);
  const { data: scoresMap = {} } = useQuery({
    queryKey: ['scores', gameIds],
    queryFn: () => apiClient.post('/api/games/scores/batch', { gameIds }),
    enabled: gameIds.length > 0,
  });

  // Get historical games between selected team and opponent with score data
  const historicalGames = useMemo(() => {
    if (!selectedOpponentId || !selectedTeamId) return [];

    const games = allGames.filter(game => 
      (game.homeTeamId === selectedTeamId && game.awayTeamId === selectedOpponentId) ||
      (game.homeTeamId === selectedOpponentId && game.awayTeamId === selectedTeamId)
    );

    // Enrich games with score data
    return games.map(game => {
      const scores = scoresMap[game.id] || [];

      // Calculate total scores for each team
      const homeScores = scores.filter(s => s.teamId === game.homeTeamId);
      const awayScores = scores.filter(s => s.teamId === game.awayTeamId);

      const homeScore = homeScores.reduce((sum, s) => sum + (s.score || 0), 0);
      const awayScore = awayScores.reduce((sum, s) => sum + (s.score || 0), 0);

      return {
        ...game,
        homeScore,
        awayScore,
        hasScores: scores.length > 0
      };
    });
  }, [allGames, selectedTeamId, selectedOpponentId, scoresMap]);

  // Get opponent team details
  const selectedOpponent = opponentTeamsFromGames.find(team => team.id === selectedOpponentId);

  // Get games for selected team (for season analysis)
  const selectedTeamGames = useMemo(() => {
    if (!selectedTeamId) return [];
    return allGames.filter(game => 
      game.homeTeamId === selectedTeamId || game.awayTeamId === selectedTeamId
    );
  }, [allGames, selectedTeamId]);

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
              Select a team from your club and choose an opponent to analyze
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Your Team</label>
                  <Select 
                    value={selectedTeamId?.toString() || ""} 
                    onValueChange={(value) => {
                      console.log('Team selection changed:', value);
                      const teamId = value ? parseInt(value) : null;
                      console.log('Setting selectedTeamId to:', teamId);
                      setSelectedTeamId(teamId);
                      setSelectedOpponentId(null); // Reset opponent when team changes
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a team from your club..." />
                    </SelectTrigger>
                    <SelectContent>
                      {clubTeams.map((team) => (
                        <SelectItem key={team.id} value={team.id.toString()}>
                          {team.name} ({team.division})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Opponent</label>
                  <Select 
                    value={selectedOpponentId?.toString() || ""} 
                    onValueChange={(value) => setSelectedOpponentId(value ? parseInt(value) : null)}
                    disabled={!selectedTeamId || opponentTeamsFromGames.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue 
                        placeholder={
                          !selectedTeamId 
                            ? "Select a team first..." 
                            : opponentTeamsFromGames.length === 0 
                            ? "No opponents found..." 
                            : "Choose opponent team..."
                        } 
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {opponentTeamsFromGames.map((team) => (
                        <SelectItem key={team.id} value={team.id.toString()}>
                          {team.name} ({team.clubName || team.clubCode || 'Unknown Club'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedTeamId && opponentTeamsFromGames.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  {selectedTeam?.name} hasn't played against any teams yet
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
                  <PreviousGamesDisplay
                    selectedTeamId={selectedTeamId}
                    selectedOpponentId={selectedOpponentId}
                    historicalGames={historicalGames}
                    selectedTeam={selectedTeam}
                    selectedOpponent={selectedOpponent}
                  />
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
                      <h4 className="font-semibold text-blue-600 mb-3">{selectedTeam?.name}</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Games Played</span>
                          <Badge variant="outline">{selectedTeamGames.length}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Division</span>
                          <Badge variant="secondary">{selectedTeam?.division}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Recent Form</span>
                          <div className="flex gap-1">
                            {selectedTeamGames.slice(-5).map((game, idx) => (
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
                      <h4 className="font-semibold text-red-600 mb-3">{selectedOpponent?.name}</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Games Played</span>
                          <Badge variant="outline">{opponentGames.length}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Division</span>
                          <Badge variant="secondary">{selectedOpponent?.division}</Badge>
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
                      <h4 className="font-semibold text-blue-600">{selectedTeam?.name}</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span>Win Rate</span>
                          <Badge className="bg-blue-100 text-blue-800">
                            {selectedTeamGames.length > 0 
                              ? Math.round((selectedTeamGames.filter(g => g.statusDisplayName?.includes('Win')).length / selectedTeamGames.length) * 100)
                              : 0}%
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Total Games</span>
                          <Badge variant="outline">{selectedTeamGames.length}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Wins</span>
                          <Badge className="bg-green-100 text-green-800">
                            {selectedTeamGames.filter(g => g.statusDisplayName?.includes('Win')).length}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Losses</span>
                          <Badge className="bg-red-100 text-red-800">
                            {selectedTeamGames.filter(g => g.statusDisplayName?.includes('Loss')).length}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-red-600">{selectedOpponent?.name}</h4>
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
                      <h4 className="font-semibold mb-3">{selectedTeam?.name} - Next Games</h4>
                      <div className="space-y-2">
                        {selectedTeamGames
                          .filter(game => new Date(game.date) > new Date())
                          .slice(0, 3)
                          .map((game) => (
                            <div key={game.id} className="flex justify-between items-center p-2 rounded bg-blue-50">
                              <span className="text-sm">{game.date}</span>
                              <span className="text-sm font-medium">
                                vs {game.homeTeamId === selectedTeamId ? game.awayTeamName : game.homeTeamName}
                              </span>
                            </div>
                          ))
                        }
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">{selectedOpponent?.name} - Next Games</h4>
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