
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlayerBox } from '@/components/ui/player-box';
import { TeamBox } from '@/components/ui/team-box';
import { GameBadge } from '@/components/ui/game-badge';
import { ResultBadge } from '@/components/ui/result-badge';
import { ScoreBadge } from '@/components/ui/score-badge';
import { BaseWidget } from '@/components/ui/base-widget';
import { CourtDisplay } from '@/components/ui/court-display';
import { PlayerAvatar } from '@/components/ui/player-avatar';
import { GameResultCard } from '@/components/ui/game-result-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Trophy, Target, BarChart3, Users, Calendar, Clock, MapPin,
  TrendingUp, TrendingDown, Award, Shield, Star, Zap, Eye,
  Edit, Settings, Plus, Play, Pause, RotateCcw, CheckCircle,
  AlertTriangle, Info, ArrowUp, ArrowDown, Equal, Crown,
  Medal, Flag, Crosshair, Activity, Timer, User
} from 'lucide-react';

export default function SportSpecificExamples() {
  const [selectedQuarter, setSelectedQuarter] = useState("1");
  const [selectedPosition, setSelectedPosition] = useState("");

  // Sample netball-specific data
  const positions = [
    { code: 'GS', name: 'Goal Shooter', area: 'Attack' },
    { code: 'GA', name: 'Goal Attack', area: 'Attack' },
    { code: 'WA', name: 'Wing Attack', area: 'Attack' },
    { code: 'C', name: 'Centre', area: 'Midcourt' },
    { code: 'WD', name: 'Wing Defence', area: 'Defence' },
    { code: 'GD', name: 'Goal Defence', area: 'Defence' },
    { code: 'GK', name: 'Goal Keeper', area: 'Defence' }
  ];

  const samplePlayers = [
    { id: 1, displayName: "Sarah J", firstName: "Sarah", lastName: "Johnson", positionPreferences: ["GS", "GA"], avatarColor: "bg-red-500", active: true },
    { id: 2, displayName: "Emma K", firstName: "Emma", lastName: "Kelly", positionPreferences: ["GK", "GD"], avatarColor: "bg-blue-500", active: true },
    { id: 3, displayName: "Lisa M", firstName: "Lisa", lastName: "Miller", positionPreferences: ["C", "WA", "WD"], avatarColor: "bg-green-500", active: true },
    { id: 4, displayName: "Amy R", firstName: "Amy", lastName: "Roberts", positionPreferences: ["WD", "GD"], avatarColor: "bg-purple-500", active: true },
    { id: 5, displayName: "Kate W", firstName: "Kate", lastName: "Wilson", positionPreferences: ["GA", "WA"], avatarColor: "bg-yellow-500", active: true },
    { id: 6, displayName: "Jess T", firstName: "Jess", lastName: "Taylor", positionPreferences: ["GS"], avatarColor: "bg-pink-500", active: true },
    { id: 7, displayName: "Mel D", firstName: "Mel", lastName: "Davis", positionPreferences: ["GK"], avatarColor: "bg-indigo-500", active: true }
  ];

  const sampleTeams = [
    { id: 1, name: "Thunder Hawks", division: "A Grade", clubName: "Metro Netball Club", clubCode: "MNC", seasonName: "2024 Season" },
    { id: 2, name: "Lightning Bolts", division: "A Grade", clubName: "City Netball", clubCode: "CNC", seasonName: "2024 Season" },
    { id: 3, name: "Storm Eagles", division: "B Grade", clubName: "Valley Sports", clubCode: "VSC", seasonName: "2024 Season" },
    { id: 4, name: "Fire Panthers", division: "C Grade", clubName: "Riverside Club", clubCode: "RSC", seasonName: "2024 Season" }
  ];

  const sampleGames = [
    { 
      id: 1, round: "5", homeTeamName: "Thunder Hawks", awayTeamName: "Lightning Bolts", 
      date: "2024-03-15", time: "10:00", homeScore: 42, awayScore: 38, status: "completed",
      venue: "Metro Sports Centre", isInterClub: false 
    },
    { 
      id: 2, round: "6", homeTeamName: "Storm Eagles", awayTeamName: "Thunder Hawks", 
      date: "2024-03-22", time: "11:30", homeScore: 35, awayScore: 41, status: "completed",
      venue: "Valley Arena", isInterClub: true 
    },
    { 
      id: 3, round: "7", homeTeamName: "Thunder Hawks", awayTeamName: "Fire Panthers", 
      date: "2024-03-29", time: "09:00", homeScore: null, awayScore: null, status: "upcoming",
      venue: "Metro Sports Centre", isInterClub: false 
    }
  ];

  const performanceStats = [
    { quarter: 1, goalsFor: 12, goalsAgainst: 8, shooting: "75%", turnovers: 3 },
    { quarter: 2, goalsFor: 10, goalsAgainst: 10, shooting: "67%", turnovers: 5 },
    { quarter: 3, goalsFor: 11, goalsAgainst: 12, shooting: "73%", turnovers: 2 },
    { quarter: 4, goalsFor: 9, goalsAgainst: 8, shooting: "69%", turnovers: 4 }
  ];

  const playerStats = [
    { name: "Sarah J", position: "GS", goals: 28, attempts: 32, accuracy: 87.5, assists: 2 },
    { name: "Emma K", position: "GK", intercepts: 12, rebounds: 8, deflections: 15, penalties: 3 },
    { name: "Lisa M", position: "C", feeds: 35, assists: 22, turnovers: 4, intercepts: 6 },
    { name: "Amy R", position: "WD", intercepts: 8, deflections: 12, penalties: 2, turnovers: 3 }
  ];

  const courtPositions = {
    GS: { x: 85, y: 20 },
    GA: { x: 85, y: 50 },
    WA: { x: 65, y: 30 },
    C: { x: 50, y: 50 },
    WD: { x: 35, y: 70 },
    GD: { x: 15, y: 50 },
    GK: { x: 15, y: 80 }
  };

  return (
    <PageTemplate 
      title="Sport-Specific Examples" 
      description="Netball-specific components and patterns"
    >
      <Helmet>
        <title>Sport-Specific Examples - Netball Manager</title>
      </Helmet>

      <div className="space-y-8">
        {/* Netball Positions */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Netball Positions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Position Overview */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Position Guide</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-red-600 mb-2">Attack Positions</h4>
                    <div className="space-y-2">
                      {positions.filter(p => p.area === 'Attack').map(pos => (
                        <div key={pos.code} className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-red-50 border-red-200">
                            {pos.code}
                          </Badge>
                          <span className="text-sm">{pos.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-600 mb-2">Midcourt</h4>
                    <div className="space-y-2">
                      {positions.filter(p => p.area === 'Midcourt').map(pos => (
                        <div key={pos.code} className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-blue-50 border-blue-200">
                            {pos.code}
                          </Badge>
                          <span className="text-sm">{pos.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-600 mb-2">Defence Positions</h4>
                    <div className="space-y-2">
                      {positions.filter(p => p.area === 'Defence').map(pos => (
                        <div key={pos.code} className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-green-50 border-green-200">
                            {pos.code}
                          </Badge>
                          <span className="text-sm">{pos.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Position Selector */}
            <Card>
              <CardHeader>
                <CardTitle>Position Selector</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Select Position</Label>
                  <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose position" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map(pos => (
                        <SelectItem key={pos.code} value={pos.code}>
                          {pos.code} - {pos.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedPosition && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">
                        {selectedPosition}
                      </Badge>
                      <span className="font-medium">
                        {positions.find(p => p.code === selectedPosition)?.name}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Area: {positions.find(p => p.code === selectedPosition)?.area}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Court Visualizations */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Court Layouts</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <Card>
              <CardHeader>
                <CardTitle>Interactive Court</CardTitle>
              </CardHeader>
              <CardContent>
                <CourtDisplay 
                  players={samplePlayers.slice(0, 7)}
                  positions={courtPositions}
                  showPositionLabels={true}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Position Combinations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Starting Seven</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {positions.map(pos => (
                      <div key={pos.code} className="flex items-center gap-2 p-2 bg-muted rounded">
                        <Badge variant="outline" className="w-8">
                          {pos.code}
                        </Badge>
                        <PlayerAvatar 
                          player={samplePlayers[positions.indexOf(pos)]} 
                          size="sm" 
                        />
                        <span className="text-sm">
                          {samplePlayers[positions.indexOf(pos)]?.displayName}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Substitutions Available</h4>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Rotate Attack
                    </Button>
                    <Button size="sm" variant="outline">
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Rotate Defence
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Game Components */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Game Components</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Score Components */}
            <Card>
              <CardHeader>
                <CardTitle>Score Components</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Score Badges</h4>
                  <div className="flex gap-2">
                    <ScoreBadge homeScore={42} awayScore={38} />
                    <ScoreBadge homeScore={35} awayScore={41} />
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium">Result Badges</h4>
                  <div className="flex gap-2">
                    <ResultBadge result="win" />
                    <ResultBadge result="loss" />
                    <ResultBadge result="draw" />
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium">Game Badges</h4>
                  <div className="space-y-2">
                    <GameBadge variant="round">Round 5</GameBadge>
                    <GameBadge variant="status">Completed</GameBadge>
                    <GameBadge variant="venue">Metro Centre</GameBadge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quarter Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Quarter Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={selectedQuarter} onValueChange={setSelectedQuarter}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="1">Q1</TabsTrigger>
                    <TabsTrigger value="2">Q2</TabsTrigger>
                    <TabsTrigger value="3">Q3</TabsTrigger>
                    <TabsTrigger value="4">Q4</TabsTrigger>
                  </TabsList>
                  {performanceStats.map(stat => (
                    <TabsContent key={stat.quarter} value={stat.quarter.toString()}>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Score</span>
                          <Badge variant="outline">
                            {stat.goalsFor} - {stat.goalsAgainst}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Shooting</span>
                          <Badge variant="outline">{stat.shooting}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Turnovers</span>
                          <Badge variant={stat.turnovers <= 3 ? "default" : "destructive"}>
                            {stat.turnovers}
                          </Badge>
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>

            {/* Player Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Player Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {playerStats.slice(0, 3).map((player, index) => (
                    <div key={index} className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <PlayerAvatar 
                          player={samplePlayers.find(p => p.displayName === player.name)!} 
                          size="sm" 
                        />
                        <div>
                          <div className="font-medium text-sm">{player.name}</div>
                          <Badge variant="outline" className="text-xs">
                            {player.position}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {'goals' in player ? 
                          `${player.goals}/${player.attempts} goals (${player.accuracy}%)` :
                          'intercepts' in player ?
                          `${player.intercepts} intercepts, ${player.rebounds} rebounds` :
                          `${player.feeds} feeds, ${player.assists} assists`
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Team Management */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Team Management</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <Card>
              <CardHeader>
                <CardTitle>Team Cards</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sampleTeams.slice(0, 3).map(team => (
                  <TeamBox key={team.id} team={team} variant="default" />
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Player Grid</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {samplePlayers.slice(0, 6).map(player => (
                    <PlayerBox key={player.id} player={player} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Statistics Widgets */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Statistics Widgets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <BaseWidget title="Shooting Accuracy" description="Team shooting performance">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Overall</span>
                  <Badge variant="outline">73.5%</Badge>
                </div>
                <Progress value={73.5} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Goals: 42</span>
                  <span>Attempts: 57</span>
                </div>
              </div>
            </BaseWidget>

            <BaseWidget title="Defensive Stats" description="Team defensive performance">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">28</div>
                    <div className="text-xs text-muted-foreground">Intercepts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">15</div>
                    <div className="text-xs text-muted-foreground">Rebounds</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">7</div>
                  <div className="text-xs text-muted-foreground">Turnovers Forced</div>
                </div>
              </div>
            </BaseWidget>

            <BaseWidget title="Quarter Breakdown" description="Performance by quarter">
              <div className="space-y-2">
                {performanceStats.map(stat => (
                  <div key={stat.quarter} className="flex justify-between items-center">
                    <span className="text-sm">Q{stat.quarter}</span>
                    <div className="flex items-center gap-2">
                      <ScoreBadge 
                        homeScore={stat.goalsFor} 
                        awayScore={stat.goalsAgainst} 
                      />
                      {stat.goalsFor > stat.goalsAgainst ? 
                        <TrendingUp className="h-4 w-4 text-green-500" /> :
                        stat.goalsFor < stat.goalsAgainst ?
                        <TrendingDown className="h-4 w-4 text-red-500" /> :
                        <Equal className="h-4 w-4 text-gray-500" />
                      }
                    </div>
                  </div>
                ))}
              </div>
            </BaseWidget>
          </div>
        </section>

        {/* Game Results */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Game Results</h2>
          <div className="space-y-4">
            {sampleGames.map(game => (
              <GameResultCard key={game.id} game={game} />
            ))}
          </div>
        </section>

        {/* Statistics Table */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Player Statistics</h2>
          <Card>
            <CardHeader>
              <CardTitle>Season Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Primary Stat</TableHead>
                    <TableHead>Secondary Stat</TableHead>
                    <TableHead>Accuracy</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {playerStats.map((player, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <PlayerAvatar 
                            player={samplePlayers.find(p => p.displayName === player.name)!} 
                            size="sm" 
                          />
                          {player.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{player.position}</Badge>
                      </TableCell>
                      <TableCell>
                        {'goals' in player ? `${player.goals} goals` :
                         'intercepts' in player ? `${player.intercepts} intercepts` :
                         `${player.feeds} feeds`}
                      </TableCell>
                      <TableCell>
                        {'attempts' in player ? `${player.attempts} attempts` :
                         'rebounds' in player ? `${player.rebounds} rebounds` :
                         `${player.assists} assists`}
                      </TableCell>
                      <TableCell>
                        {'accuracy' in player && (
                          <div className="flex items-center gap-2">
                            <Progress value={player.accuracy} className="h-2 w-16" />
                            <span className="text-sm">{player.accuracy}%</span>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>

        {/* External Links */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Related Examples</h2>
          <Card>
            <CardHeader>
              <CardTitle>Court Layout Examples</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Explore comprehensive court layout examples and advanced position management patterns.
                </p>
                <Button asChild>
                  <a href="/court-layout-examples">
                    <Eye className="h-4 w-4 mr-2" />
                    View Court Layouts
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Action Patterns */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Game Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" size="sm">
                  <Play className="h-4 w-4 mr-2" />
                  Start Game
                </Button>
                <Button className="w-full" size="sm" variant="outline">
                  <Pause className="h-4 w-4 mr-2" />
                  Quarter Break
                </Button>
                <Button className="w-full" size="sm" variant="outline">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  End Game
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Player Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" size="sm" variant="outline">
                  <User className="h-4 w-4 mr-2" />
                  Substitute
                </Button>
                <Button className="w-full" size="sm" variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Rotate Positions
                </Button>
                <Button className="w-full" size="sm" variant="outline">
                  <Timer className="h-4 w-4 mr-2" />
                  Time Out
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" size="sm" variant="outline">
                  <Target className="h-4 w-4 mr-2" />
                  Record Goal
                </Button>
                <Button className="w-full" size="sm" variant="outline">
                  <Shield className="h-4 w-4 mr-2" />
                  Record Intercept
                </Button>
                <Button className="w-full" size="sm" variant="outline">
                  <Activity className="h-4 w-4 mr-2" />
                  Add Stat
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" size="sm" variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Stats
                </Button>
                <Button className="w-full" size="sm" variant="outline">
                  <Trophy className="h-4 w-4 mr-2" />
                  Game Report
                </Button>
                <Button className="w-full" size="sm" variant="outline">
                  <Award className="h-4 w-4 mr-2" />
                  Awards
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </PageTemplate>
  );
}
