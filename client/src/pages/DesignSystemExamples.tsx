
import React from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayerBox } from '@/components/ui/player-box';
import { TeamBox } from '@/components/ui/team-box';
import { GameBadge } from '@/components/ui/game-badge';
import { ResultBadge } from '@/components/ui/result-badge';
import { ScoreBadge } from '@/components/ui/score-badge';
import { BaseWidget, CustomHeaderWidget } from '@/components/ui/base-widget';
import GameResultCard from '@/components/ui/game-result-card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, TrendingUp, Calendar, Edit, Eye, Trash2, Settings, 
  Plus, Trophy, Target, Award, Star, Clock, MapPin, Home,
  BarChart3, Activity, Zap, CheckCircle
} from 'lucide-react';

export default function DesignSystemExamples() {
  // Sample data for demonstrations
  const samplePlayers = [
    {
      id: 1,
      displayName: "Sarah Johnson",
      firstName: "Sarah",
      lastName: "Johnson",
      positionPreferences: ["GA", "GS"],
      avatarColor: "bg-blue-500",
      active: true
    },
    {
      id: 2,
      displayName: "Emma Wilson",
      firstName: "Emma", 
      lastName: "Wilson",
      positionPreferences: ["C", "WA", "WD"],
      avatarColor: "bg-green-500",
      active: true
    },
    {
      id: 3,
      displayName: "Kate Brown",
      firstName: "Kate",
      lastName: "Brown", 
      positionPreferences: ["GK", "GD"],
      avatarColor: "bg-purple-500",
      active: true
    },
    {
      id: 4,
      displayName: "Lily Chen",
      firstName: "Lily",
      lastName: "Chen",
      positionPreferences: ["GA", "WA"],
      avatarColor: "bg-pink-500",
      active: false
    }
  ];

  const sampleTeams = [
    {
      id: 1,
      name: "Lightning Bolts",
      division: "A Grade",
      seasonName: "Spring 2025",
      clubName: "Thunder Netball Club",
      isActive: true
    },
    {
      id: 2,
      name: "Storm Eagles",
      division: "B Grade", 
      seasonName: "Spring 2025",
      clubName: "Thunder Netball Club",
      isActive: true
    },
    {
      id: 3,
      name: "Fire Hawks",
      division: "C Grade",
      seasonName: "Spring 2025", 
      clubName: "Thunder Netball Club",
      isActive: true
    }
  ];

  return (
    <div className="container mx-auto py-6">
      <Helmet>
        <title>Design System Examples - Emerald Netball</title>
      </Helmet>
      
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Design System Showcase
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Complete component library with consistent styling and action patterns
        </p>
      </div>

      <div className="space-y-12">
        
        {/* Color Scheme & Background Standards */}
        <section className="content-section">
          <h2 className="section-header">Dashboard Color Scheme</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Neutral Widget Background */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Standard Widget</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Clean, neutral background for most dashboard widgets</p>
                <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                  <div className="text-sm font-medium">Sample Data</div>
                  <div className="text-2xl font-bold text-primary">24.5</div>
                </div>
              </CardContent>
            </Card>

            {/* Success/Win Background */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800">Success Theme</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-700">For wins, positive metrics, achievements</p>
                <div className="mt-4 p-3 bg-green-200/50 rounded-lg">
                  <div className="text-sm font-medium text-green-800">Win Rate</div>
                  <div className="text-2xl font-bold text-green-900">78%</div>
                </div>
              </CardContent>
            </Card>

            {/* Warning/Attention Background */}
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
              <CardHeader>
                <CardTitle className="text-amber-800">Warning Theme</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-amber-700">For draws, mixed results, attention needed</p>
                <div className="mt-4 p-3 bg-amber-200/50 rounded-lg">
                  <div className="text-sm font-medium text-amber-800">Attendance</div>
                  <div className="text-2xl font-bold text-amber-900">65%</div>
                </div>
              </CardContent>
            </Card>

            {/* Error/Loss Background */}
            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardHeader>
                <CardTitle className="text-red-800">Error Theme</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-700">For losses, negative metrics, problems</p>
                <div className="mt-4 p-3 bg-red-200/50 rounded-lg">
                  <div className="text-sm font-medium text-red-800">Turnovers</div>
                  <div className="text-2xl font-bold text-red-900">12</div>
                </div>
              </CardContent>
            </Card>

            {/* Primary/Brand Background */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-800">Primary Theme</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-700">For featured content, team highlights</p>
                <div className="mt-4 p-3 bg-blue-200/50 rounded-lg">
                  <div className="text-sm font-medium text-blue-800">Team Rating</div>
                  <div className="text-2xl font-bold text-blue-900">8.5</div>
                </div>
              </CardContent>
            </Card>

            {/* Accent/Secondary Background */}
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardHeader>
                <CardTitle className="text-purple-800">Accent Theme</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-purple-700">For special metrics, player of match</p>
                <div className="mt-4 p-3 bg-purple-200/50 rounded-lg">
                  <div className="text-sm font-medium text-purple-800">MVP Points</div>
                  <div className="text-2xl font-bold text-purple-900">95</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Action Button Integration Examples */}
        <section className="content-section">
          <h2 className="section-header">Action Button Integration</h2>
          
          {/* External Action Buttons */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>External Action Buttons</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Actions placed outside the component for consistent styling
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Player Box with External Actions */}
                <div className="space-y-3">
                  <h4 className="font-semibold">Player Components</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {samplePlayers.slice(0, 3).map(player => (
                      <div key={player.id} className="space-y-2">
                        <PlayerBox player={player} />
                        <div className="flex gap-2">
                          <Button size="sm" className="btn-edit">
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" className="btn-view">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Team Box with External Actions */}
                <div className="space-y-3">
                  <h4 className="font-semibold">Team Components</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sampleTeams.slice(0, 2).map(team => (
                      <div key={team.id} className="space-y-2">
                        <TeamBox team={team} variant="default" />
                        <div className="flex gap-2">
                          <Button size="sm" className="btn-manage">
                            <Settings className="h-3 w-3 mr-1" />
                            Manage
                          </Button>
                          <Button size="sm" className="btn-view">
                            <BarChart3 className="h-3 w-3 mr-1" />
                            Stats
                          </Button>
                          <Button size="sm" className="btn-edit">
                            <Users className="h-3 w-3 mr-1" />
                            Roster
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Integrated Action Buttons */}
            <Card>
              <CardHeader>
                <CardTitle>Integrated Action Buttons</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Actions integrated within components using neutral backgrounds
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Widget with Integrated Actions */}
                <CustomHeaderWidget
                  title="Team Performance"
                  description="Last 10 games analysis"
                  headerContent={
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" className="text-xs">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Detailed
                      </Button>
                      <Button size="sm" variant="ghost" className="text-xs">
                        <Settings className="h-3 w-3" />
                      </Button>
                    </div>
                  }
                >
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-sm text-green-700">Wins</div>
                      <div className="text-2xl font-bold text-green-900">7</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="text-sm text-red-700">Losses</div>
                      <div className="text-2xl font-bold text-red-900">2</div>
                    </div>
                    <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="text-sm text-amber-700">Draws</div>
                      <div className="text-2xl font-bold text-amber-900">1</div>  
                    </div>
                  </div>
                </CustomHeaderWidget>

                {/* Action Button Color Guide */}
                <Card className="bg-muted/30">
                  <CardHeader>
                    <CardTitle className="text-base">Action Button Color Guide</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                      <Button className="btn-create">
                        <Plus className="h-4 w-4 mr-2" />
                        Create
                      </Button>
                      <Button className="btn-edit">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button className="btn-view">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button className="btn-manage">
                        <Settings className="h-4 w-4 mr-2" />
                        Manage
                      </Button>
                      <Button className="btn-delete">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* PlayerBox Variations */}
        <section className="content-section">
          <h2 className="section-header">PlayerBox Variations</h2>
          <div className="space-y-6">
            
            {/* Size Variations */}
            <Card>
              <CardHeader>
                <CardTitle>Size Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="w-16 text-sm">Small:</span>
                    <PlayerBox player={samplePlayers[0]} size="sm" />
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="w-16 text-sm">Default:</span>
                    <PlayerBox player={samplePlayers[0]} />
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="w-16 text-sm">Large:</span>
                    <PlayerBox player={samplePlayers[0]} size="lg" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Variations */}
            <Card>
              <CardHeader>
                <CardTitle>Status & Activity States</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center space-y-2">
                    <PlayerBox player={samplePlayers[0]} />
                    <span className="text-xs text-muted-foreground">Active Player</span>
                  </div>
                  <div className="text-center space-y-2">
                    <PlayerBox player={samplePlayers[3]} />
                    <span className="text-xs text-muted-foreground">Inactive Player</span>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="opacity-60">
                      <PlayerBox player={samplePlayers[1]} />
                    </div>
                    <span className="text-xs text-muted-foreground">Unavailable</span>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="ring-2 ring-blue-400 ring-offset-2 rounded-lg">
                      <PlayerBox player={samplePlayers[2]} />
                    </div>
                    <span className="text-xs text-muted-foreground">Selected</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* TeamBox Variations */}
        <section className="content-section">
          <h2 className="section-header">TeamBox Variations</h2>
          <div className="space-y-6">
            
            {/* Basic Variants */}
            <Card>
              <CardHeader>
                <CardTitle>Display Variants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Minimal</h4>
                    <TeamBox team={sampleTeams[0]} variant="minimal" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Default</h4>
                    <TeamBox team={sampleTeams[0]} variant="default" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">With Stats</h4>
                    <TeamBox 
                      team={sampleTeams[0]} 
                      variant="default" 
                      showStats={true}
                      stats={[
                        { label: "Games", value: "12" },
                        { label: "Win Rate", value: "75%" },
                        { label: "Avg Score", value: "28.5" }
                      ]}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Size and Layout Options */}
            <Card>
              <CardHeader>
                <CardTitle>Size & Layout Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3">Small Cards Grid</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {sampleTeams.map(team => (
                        <TeamBox key={team.id} team={team} size="sm" variant="minimal" />
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Large Feature Card</h4>
                    <TeamBox 
                      team={sampleTeams[0]} 
                      size="lg"
                      showStats={true}
                      stats={[
                        { label: "Current Streak", value: "5 Wins" },
                        { label: "Top Scorer", value: "Sarah J" },
                        { label: "Best Quarter", value: "Q3" },
                        { label: "Team Rating", value: "8.5" }
                      ]}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Badge Components */}
        <section className="content-section">
          <h2 className="section-header">Badge Components</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Game Badges */}
            <Card>
              <CardHeader>
                <CardTitle>Game Badges</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <GameBadge variant="round">Round 5</GameBadge>
                  <GameBadge variant="round" size="sm">R5</GameBadge>
                  <GameBadge variant="tag">Semi Final</GameBadge>
                  <GameBadge variant="pill">Grand Final</GameBadge>
                </div>
              </CardContent>
            </Card>

            {/* Result Badges */}
            <Card>
              <CardHeader>
                <CardTitle>Result Badges</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <ResultBadge result="won" />
                  <ResultBadge result="lost" />
                  <ResultBadge result="draw" />
                  <ResultBadge result="bye" />
                  <ResultBadge result="cancelled" />
                </div>
              </CardContent>
            </Card>

            {/* Score Badges */}
            <Card>
              <CardHeader>
                <CardTitle>Score Badges</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <ScoreBadge teamScore={25} opponentScore={18} result="won" />
                  <ScoreBadge teamScore={22} opponentScore={28} result="lost" />
                  <ScoreBadge teamScore={24} opponentScore={24} result="draw" />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Widget Examples */}
        <section className="content-section">
          <h2 className="section-header">Dashboard Widgets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Performance Widget */}
            <BaseWidget title="Team Performance" description="Recent form analysis">
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-900">7</div>
                    <div className="text-sm text-green-700">Wins</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="text-2xl font-bold text-red-900">2</div>
                    <div className="text-sm text-red-700">Losses</div>
                  </div>
                  <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="text-2xl font-bold text-amber-900">1</div>
                    <div className="text-sm text-amber-700">Draws</div>
                  </div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-3xl font-bold text-blue-900">78%</div>
                  <div className="text-sm text-blue-700">Win Rate</div>
                </div>
              </div>
            </BaseWidget>

            {/* Player Highlights Widget */}
            <CustomHeaderWidget
              title="Player Highlights"
              description="Top performers this season"
              headerContent={
                <Button size="sm" variant="ghost">
                  <Award className="h-4 w-4" />
                </Button>
              }
            >
              <div className="space-y-3">
                {samplePlayers.slice(0, 3).map((player, index) => (
                  <div key={player.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className={`w-8 h-8 rounded-full ${player.avatarColor} flex items-center justify-center text-white text-sm font-bold`}>
                      {player.firstName[0]}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{player.displayName}</div>
                      <div className="text-sm text-muted-foreground">
                        {index === 0 ? 'Top Scorer' : index === 1 ? 'Most Assists' : 'Best Defense'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{index === 0 ? '125' : index === 1 ? '89' : '67'}</div>
                      <div className="text-xs text-muted-foreground">pts</div>
                    </div>
                  </div>
                ))}
              </div>
            </CustomHeaderWidget>

            {/* Quick Actions Widget */}
            <BaseWidget title="Quick Actions" description="Common team management tasks">
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <div className="p-2 bg-green-500 text-white rounded-lg">
                    <Plus className="h-4 w-4" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">Add Player</div>
                    <div className="text-xs text-muted-foreground">Register new</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <div className="p-2 bg-blue-500 text-white rounded-lg">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">Schedule Game</div>
                    <div className="text-xs text-muted-foreground">New fixture</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <div className="p-2 bg-purple-500 text-white rounded-lg">
                    <BarChart3 className="h-4 w-4" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">View Stats</div>
                    <div className="text-xs text-muted-foreground">Analytics</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <div className="p-2 bg-orange-500 text-white rounded-lg">
                    <Settings className="h-4 w-4" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">Settings</div>
                    <div className="text-xs text-muted-foreground">Configure</div>
                  </div>
                </Button>
              </div>
            </BaseWidget>

            {/* Upcoming Games Widget */}
            <BaseWidget title="Upcoming Games" description="Next fixtures">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                  <div className="text-center">
                    <div className="text-sm font-medium">Jun 15</div>
                    <div className="text-xs text-muted-foreground">Sat</div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">vs Storm Eagles</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      2:00 PM
                      <MapPin className="h-3 w-3 ml-2" />
                      Court 2
                    </div>
                  </div>
                  <GameBadge variant="round" size="sm">R6</GameBadge>
                </div>
                <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                  <div className="text-center">
                    <div className="text-sm font-medium">Jun 22</div>
                    <div className="text-xs text-muted-foreground">Sat</div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">@ Fire Hawks</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      4:30 PM
                      <MapPin className="h-3 w-3 ml-2" />
                      Away
                    </div>
                  </div>
                  <GameBadge variant="round" size="sm">R7</GameBadge>
                </div>
              </div>
            </BaseWidget>
          </div>
        </section>

        {/* Game Result Cards */}
        <section className="content-section">
          <h2 className="section-header">Game Result Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <GameResultCard
              game={{
                id: 1,
                date: "2025-06-08",
                time: "2:00 PM",
                round: "Round 5",
                homeTeamName: "Lightning Bolts",
                awayTeamName: "Storm Eagles",
                statusIsCompleted: true,
                statusDisplayName: "Completed",
                homeTeamId: 1,
                awayTeamId: 2
              }}
              currentTeamId={1}
              layout="medium"
              showLink={false}
            />
            <GameResultCard
              game={{
                id: 2,
                date: "2025-06-01",
                time: "4:30 PM",
                round: "Round 4",
                homeTeamName: "Fire Hawks",
                awayTeamName: "Lightning Bolts",
                statusIsCompleted: true,
                statusDisplayName: "Completed",
                homeTeamId: 3,
                awayTeamId: 1
              }}
              currentTeamId={1}
              layout="medium"
              showLink={false}
            />
            <GameResultCard
              game={{
                id: 3,
                date: "2025-05-25",
                time: "1:00 PM",
                round: "Round 3",
                homeTeamName: "Lightning Bolts",
                awayTeamName: "Thunder Jets",
                statusIsCompleted: true,
                statusDisplayName: "Completed",
                homeTeamId: 1,
                awayTeamId: 4
              }}
              currentTeamId={1}
              layout="medium"
              showLink={false}
            />
          </div>
        </section>

        {/* Status & Interactive Elements */}
        <section className="content-section">
          <h2 className="section-header">Status & Interactive Elements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Status Indicators */}
            <Card>
              <CardHeader>
                <CardTitle>Status Indicators</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Active / Available</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Inactive / Unavailable</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  <span>Warning / Attention</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Information / Selected</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span>Disabled / Neutral</span>
                </div>
              </CardContent>
            </Card>

            {/* Interactive States */}
            <Card>
              <CardHeader>
                <CardTitle>Interactive States</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                    Hover State
                  </div>
                  <div className="p-3 border-2 border-primary rounded-lg bg-primary/5">
                    Selected State
                  </div>
                  <div className="p-3 border rounded-lg bg-muted/30 text-muted-foreground">
                    Disabled State
                  </div>
                  <div className="p-3 border border-green-200 bg-green-50 text-green-800 rounded-lg">
                    Success State
                  </div>
                  <div className="p-3 border border-red-200 bg-red-50 text-red-800 rounded-lg">
                    Error State
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Typography & Content Hierarchy */}
        <section className="content-section">
          <h2 className="section-header">Typography & Content Hierarchy</h2>
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div>
                <h1 className="page-header">Page Header (H1)</h1>
                <p className="page-subtitle">Supporting subtitle with additional context</p>
              </div>
              <div>
                <h2 className="section-header">Section Header (H2)</h2>
                <p className="text-muted-foreground">Section description text</p>
              </div>
              <div>
                <h3 className="widget-header">Widget Header (H3)</h3>
                <p className="text-sm text-muted-foreground">Widget supporting text</p>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">LABEL TEXT</div>
                <div className="text-3xl font-bold">Primary Value</div>
                <div className="text-lg font-semibold text-muted-foreground">Secondary Value</div>
                <div className="text-sm text-muted-foreground">Supporting detail text</div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
