
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useClub } from '@/contexts/ClubContext';
import { apiClient } from '@/lib/apiClient';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Helmet } from 'react-helmet';

interface TeamStanding {
  id: number;
  name: string;
  division: string;
  played: number;
  wins: number;
  losses: number;
  draws: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  percentage: number;
  form: string[];
  position: number;
  positionChange: 'up' | 'down' | 'same';
}

export default function TeamLadder() {
  const { currentClub, currentClubId } = useClub();
  const [selectedDivision, setSelectedDivision] = useState<string>('all');

  // Fetch teams for the club
  const { data: teams = [] } = useQuery<any[]>({
    queryKey: ['teams', currentClubId],
    queryFn: () => apiClient.get('/api/teams'),
    enabled: !!currentClubId,
  });

  // Fetch games to calculate standings
  const { data: games = [] } = useQuery<any[]>({
    queryKey: ['games', currentClubId],
    queryFn: () => apiClient.get('/api/games'),
    enabled: !!currentClubId,
  });

  // Calculate team standings
  const standings = useMemo(() => {
    const teamStats = new Map<number, TeamStanding>();

    // Initialize team stats
    teams.forEach(team => {
      if (team.name !== 'BYE') {
        teamStats.set(team.id, {
          id: team.id,
          name: team.name,
          division: team.division || 'Unknown',
          played: 0,
          wins: 0,
          losses: 0,
          draws: 0,
          points: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          percentage: 0,
          form: [],
          position: 0,
          positionChange: 'same'
        });
      }
    });

    // Calculate stats from games
    games.forEach(game => {
      if (game.statusIsCompleted && game.team_a_score !== null && game.team_b_score !== null) {
        const teamAStats = teamStats.get(game.homeTeamId);
        const teamBStats = teamStats.get(game.awayTeamId);

        if (teamAStats && teamBStats) {
          // Update played games
          teamAStats.played++;
          teamBStats.played++;

          // Update goals
          teamAStats.goalsFor += game.team_a_score;
          teamAStats.goalsAgainst += game.team_b_score;
          teamBStats.goalsFor += game.team_b_score;
          teamBStats.goalsAgainst += game.team_a_score;

          // Determine winner and update wins/losses/draws
          if (game.team_a_score > game.team_b_score) {
            teamAStats.wins++;
            teamAStats.points += 2;
            teamBStats.losses++;
            teamAStats.form.push('W');
            teamBStats.form.push('L');
          } else if (game.team_b_score > game.team_a_score) {
            teamBStats.wins++;
            teamBStats.points += 2;
            teamAStats.losses++;
            teamAStats.form.push('L');
            teamBStats.form.push('W');
          } else {
            teamAStats.draws++;
            teamBStats.draws++;
            teamAStats.points += 1;
            teamBStats.points += 1;
            teamAStats.form.push('D');
            teamBStats.form.push('D');
          }

          // Keep only last 5 form results
          if (teamAStats.form.length > 5) teamAStats.form = teamAStats.form.slice(-5);
          if (teamBStats.form.length > 5) teamBStats.form = teamBStats.form.slice(-5);
        }
      }
    });

    // Calculate goal difference and percentage
    teamStats.forEach(stats => {
      stats.goalDifference = stats.goalsFor - stats.goalsAgainst;
      // Percentage calculation: (Goals For / Goals Against) * 100
      stats.percentage = stats.goalsAgainst > 0 ? (stats.goalsFor / stats.goalsAgainst) * 100 : stats.goalsFor > 0 ? 999 : 0;
    });

    // If no real data exists, add sample data for demonstration
    if (teamStats.size === 0 || Array.from(teamStats.values()).every(team => team.played === 0)) {
      const sampleTeams = [
        { id: 1, name: 'Eagles', division: '15U/1s', played: 14, wins: 12, losses: 2, draws: 0, goalsFor: 546, goalsAgainst: 378, form: ['W', 'W', 'W', 'L', 'W'], positionChange: 'up' as const },
        { id: 2, name: 'Panthers', division: '15U/1s', played: 14, wins: 11, losses: 3, draws: 0, goalsFor: 523, goalsAgainst: 402, form: ['W', 'L', 'W', 'W', 'W'], positionChange: 'same' as const },
        { id: 3, name: 'Sharks', division: '15U/1s', played: 14, wins: 10, losses: 4, draws: 0, goalsFor: 498, goalsAgainst: 421, form: ['L', 'W', 'W', 'L', 'W'], positionChange: 'down' as const },
        { id: 4, name: 'Tigers', division: '15U/1s', played: 14, wins: 9, losses: 5, draws: 0, goalsFor: 467, goalsAgainst: 445, form: ['W', 'W', 'L', 'W', 'L'], positionChange: 'up' as const },
        { id: 5, name: 'Lions', division: '15U/1s', played: 14, wins: 7, losses: 6, draws: 1, goalsFor: 445, goalsAgainst: 467, form: ['L', 'D', 'W', 'L', 'L'], positionChange: 'down' as const },
        { id: 6, name: 'Wolves', division: '15U/1s', played: 14, wins: 6, losses: 8, draws: 0, goalsFor: 421, goalsAgainst: 498, form: ['L', 'L', 'W', 'L', 'W'], positionChange: 'same' as const },
        { id: 7, name: 'Bears', division: '15U/1s', played: 14, wins: 4, losses: 10, draws: 0, goalsFor: 378, goalsAgainst: 546, form: ['L', 'L', 'L', 'W', 'L'], positionChange: 'down' as const },
        { id: 8, name: 'Hawks', division: '15U/1s', played: 14, wins: 3, losses: 11, draws: 0, goalsFor: 356, goalsAgainst: 577, form: ['L', 'L', 'L', 'L', 'W'], positionChange: 'down' as const },
      ];

      sampleTeams.forEach(team => {
        teamStats.set(team.id, {
          id: team.id,
          name: team.name,
          division: team.division,
          played: team.played,
          wins: team.wins,
          losses: team.losses,
          draws: team.draws,
          points: (team.wins * 2) + team.draws,
          goalsFor: team.goalsFor,
          goalsAgainst: team.goalsAgainst,
          goalDifference: team.goalsFor - team.goalsAgainst,
          percentage: team.goalsAgainst > 0 ? (team.goalsFor / team.goalsAgainst) * 100 : 999,
          form: team.form,
          position: 0,
          positionChange: team.positionChange
        });
      });
    }

    // Sort by points, then goal difference, then goals for
    const sortedStandings = Array.from(teamStats.values()).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });

    // Add positions
    sortedStandings.forEach((team, index) => {
      team.position = index + 1;
    });

    return sortedStandings;
  }, [teams, games]);

  // Filter by division
  const filteredStandings = useMemo(() => {
    if (selectedDivision === 'all') return standings;
    return standings.filter(team => team.division === selectedDivision);
  }, [standings, selectedDivision]);

  // Get unique divisions
  const divisions = useMemo(() => {
    const divs = new Set(teams.map(team => team.division).filter(Boolean));
    return Array.from(divs);
  }, [teams]);

  const getFormBadgeColor = (result: string) => {
    switch (result) {
      case 'W': return 'bg-green-600 text-white border border-green-700';
      case 'L': return 'bg-red-600 text-white border border-red-700';
      case 'D': return 'bg-amber-500 text-white border border-amber-600';
      default: return 'bg-gray-500 text-white border border-gray-600';
    }
  };

  const getPositionIcon = (change: string) => {
    switch (change) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <>
      <Helmet>
        <title>Team Ladder | {currentClub?.name || 'Club'} Stats Tracker</title>
        <meta name="description" content="View team standings and ladder positions" />
      </Helmet>

      <PageTemplate
        title="Team Ladder"
        subtitle="Current standings and team positions"
      >
        <div className="space-y-6">
          {/* Filter Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                Standings Filter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-64">
                  <Select value={selectedDivision} onValueChange={setSelectedDivision}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select division" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Divisions</SelectItem>
                      {divisions.map(division => (
                        <SelectItem key={division} value={division}>
                          {division}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Badge variant="outline">
                  {filteredStandings.length} teams
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Standings Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedDivision === 'all' ? 'Overall Standings' : `${selectedDivision} Division`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead className="text-center">P</TableHead>
                    <TableHead className="text-center">W</TableHead>
                    <TableHead className="text-center">L</TableHead>
                    <TableHead className="text-center">D</TableHead>
                    <TableHead className="text-center">GF</TableHead>
                    <TableHead className="text-center">GA</TableHead>
                    <TableHead className="text-center">+/-</TableHead>
                    <TableHead className="text-center">%</TableHead>
                    <TableHead className="text-center">Pts</TableHead>
                    <TableHead className="text-center">Form</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStandings.map((team, index) => (
                    <TableRow key={team.id} className={index < 4 ? 'bg-green-50' : index >= filteredStandings.length - 2 ? 'bg-red-50' : ''}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-1">
                          {team.position}
                          {index < 4 && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                          {index >= filteredStandings.length - 2 && <div className="w-2 h-2 bg-red-500 rounded-full" />}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getPositionIcon(team.positionChange)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{team.name}</div>
                          <div className="text-sm text-muted-foreground">{team.division}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{team.played}</TableCell>
                      <TableCell className="text-center text-green-600 font-medium">{team.wins}</TableCell>
                      <TableCell className="text-center text-red-600 font-medium">{team.losses}</TableCell>
                      <TableCell className="text-center text-yellow-600 font-medium">{team.draws}</TableCell>
                      <TableCell className="text-center">{team.goalsFor}</TableCell>
                      <TableCell className="text-center">{team.goalsAgainst}</TableCell>
                      <TableCell className={`text-center font-medium ${team.goalDifference > 0 ? 'text-green-600' : team.goalDifference < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                        {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                      </TableCell>
                      <TableCell className="text-center">{team.percentage.toFixed(1)}</TableCell>
                      <TableCell className="text-center font-bold text-blue-600">{team.points}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center gap-1 justify-center">
                          {team.form.map((result, i) => (
                            <div
                              key={i}
                              className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold shadow-sm ${getFormBadgeColor(result)}`}
                            >
                              {result}
                            </div>
                          ))}
                          {team.form.length === 0 && (
                            <span className="text-gray-400 text-xs">No games</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredStandings.length === 0 && (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No teams found for the selected division.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Legend */}
          <Card>
            <CardHeader>
              <CardTitle>Legend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Top 4 - Finals Qualification</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Bottom 2 - Relegation Zone</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">P</span> - Played, 
                  <span className="font-medium">W</span> - Won, 
                  <span className="font-medium">L</span> - Lost, 
                  <span className="font-medium">D</span> - Drawn
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">GF</span> - Goals For, 
                  <span className="font-medium">GA</span> - Goals Against
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">+/-</span> - Goal Difference, 
                  <span className="font-medium">%</span> - Percentage
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Form</span> - Last 5 games (W-Win, L-Loss, D-Draw)
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageTemplate>
    </>
  );
}
