import React from 'react';
import { Helmet } from 'react-helmet';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TeamBox } from '@/components/ui/team-box';
import { 
  Users, Calendar, Trophy, Eye, Edit, Settings, 
  Save, Trash2, Plus, Upload, Download, 
  Star, Heart, Shield, AlertTriangle,
  BarChart3, TrendingUp, Award, Target,
  Play, MoreHorizontal, UserPlus, Share,
  Zap, Clock
} from 'lucide-react';

export default function ActionButtonExamples() {
  const sampleTeam = {
    id: 116,
    name: "WNC Dingoes",
    division: "13U/3s",
    clubName: "Warrandyte Netball Club",
    clubCode: "WNC",
    isActive: true,
    seasonName: "Autumn 2025"
  };

  const sampleTeams = [
    {
      id: 1,
      name: "Lightning Bolts",
      division: "14U/2s",
      seasonName: "Summer 2024",
      description: "A competitive team known for their speed.",
      coach: "Jane Smith",
      contactEmail: "jane.smith@example.com"
    },
    {
      id: 2,
      name: "Net Burners",
      division: "16U/1s",
      seasonName: "Winter 2024",
      description: "An aggressive team focused on strong offense.",
      coach: "Mike Johnson",
      contactEmail: "mike.johnson@example.com"
    },
    {
      id: 3,
      name: "Shooting Stars",
      division: "18U/Premier",
      seasonName: "Spring 2025",
      description: "A skilled team with excellent accuracy.",
      coach: "Emily White",
      contactEmail: "emily.white@example.com"
    }
  ];

  const samplePlayer = {
    id: 1,
    displayName: "Sarah Johnson",
    firstName: "Sarah",
    lastName: "Johnson",
    positionPreferences: ["GA", "GS"],
    avatarColor: "bg-blue-500",
    active: true
  };

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
      positionPreferences: ["C"],
      avatarColor: "bg-green-500",
      active: true
    },
    {
      id: 3,
      displayName: "Kate Brown",
      firstName: "Kate",
      lastName: "Brown",
      positionPreferences: ["GK"],
      avatarColor: "bg-red-500",
      active: false
    },
    {
      id: 4,
      displayName: "Lily Chen",
      firstName: "Lily",
      lastName: "Chen",
      positionPreferences: ["WA"],
      avatarColor: "bg-yellow-500",
      active: true
    },
    {
      id: 5,
      displayName: "Amy Thompson",
      firstName: "Amy",
      lastName: "Thompson",
      positionPreferences: ["WD"],
      avatarColor: "bg-purple-500",
      active: true
    }
  ];

  const sampleStats = [
    { label: "Goals", value: 32 },
    { label: "Assists", value: 15 },
    { label: "Rating", value: "9.2" }
  ];

  return (
    <PageTemplate 
      title="Action Button Examples" 
      breadcrumbs={[
        { label: "Component Examples", href: "/component-examples" },
        { label: "Action Button Examples" }
      ]}
    >
      <div className="space-y-12">
        <div className="prose max-w-none">
          <p className="text-lg text-gray-700">
            Consistent action button patterns for team and player boxes.
          </p>
        </div>

        {/* Primary Actions */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Primary Actions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Team Management Actions</h3>
              <TeamBox 
                team={sampleTeam}
                actions={
                  <div className="flex gap-2">
                    <Button size="sm" variant="default">
                      <Users className="h-4 w-4 mr-2" />
                      Manage Team
                    </Button>
                    <Button size="sm" variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule
                    </Button>
                  </div>
                }
              />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Player Management Actions</h3>
              <PlayerBox 
                player={samplePlayer}
                actions={
                  <div className="flex gap-2">
                    <Button size="sm" variant="default">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add to Roster
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Player
                    </Button>
                  </div>
                }
              />
            </div>
          </div>
        </section>

        {/* Icon-Only Actions */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Icon-Only Actions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Compact Team Actions</h3>
              <TeamBox 
                team={sampleTeam}
                size="sm"
                actions={
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                }
              />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Compact Player Actions</h3>
              <PlayerBox 
                player={samplePlayer}
                size="sm"
                actions={
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline">
                      <Award className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                }
              />
            </div>
          </div>
        </section>

        {/* Mixed Action Types */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Mixed Action Patterns</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Primary + Secondary Actions</h3>
              <TeamBox 
                team={sampleTeam}
                showStats={true}
                stats={[
                  { label: "Games", value: 12 },
                  { label: "Wins", value: 8 },
                  { label: "Win Rate", value: "67%" }
                ]}
                actions={
                  <div className="flex gap-2">
                    <Button size="sm" variant="default">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      View Analytics
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                }
              />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Player with Stats + Actions</h3>
              <PlayerBox 
                player={samplePlayer}
                stats={sampleStats}
                actions={
                  <div className="flex gap-2">
                    <Button size="sm" variant="success">
                      <Play className="h-4 w-4 mr-2" />
                      Add to Game
                    </Button>
                    <Button size="sm" variant="outline">
                      <Trophy className="h-4 w-4" />
                    </Button>
                  </div>
                }
              />
            </div>
          </div>
        </section>

        {/* Status-Based Actions */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Status-Based Actions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Active vs Inactive States</h3>
              <div className="space-y-4">
                <TeamBox 
                  team={{...sampleTeam, isActive: true}}
                  actions={
                    <div className="flex gap-2 items-center">
                      <Badge variant="default" className="text-xs">Active</Badge>
                      <Button size="sm" variant="outline">
                        <Users className="h-4 w-4 mr-2" />
                        Manage
                      </Button>
                      <Button size="sm" variant="warning">
                        <Target className="h-4 w-4 mr-2" />
                        Deactivate
                      </Button>
                    </div>
                  }
                />

                <TeamBox 
                  team={{...sampleTeam, isActive: false}}
                  actions={
                    <div className="flex gap-2 items-center">
                      <Badge variant="secondary" className="text-xs">Inactive</Badge>
                      <Button size="sm" variant="success">
                        <Target className="h-4 w-4 mr-2" />
                        Reactivate
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  }
                />
              </div>
            </div>
          </div>
        </section>

        {/* Contextual Actions */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Contextual Actions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Game Day Actions</h3>
              <TeamBox 
                team={sampleTeam}
                actions={
                  <div className="flex gap-2">
                    <Button size="sm" variant="default">
                      <Play className="h-4 w-4 mr-2" />
                      Start Game
                    </Button>
                    <Button size="sm" variant="outline">
                      <Users className="h-4 w-4 mr-2" />
                      View Roster
                    </Button>
                    <Button size="sm" variant="outline">
                      <Calendar className="h-4 w-4" />
                    </Button>
                  </div>
                }
              />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Performance Review Actions</h3>
              <PlayerBox 
                player={samplePlayer}
                stats={sampleStats}
                actions={
                  <div className="flex gap-2">
                    <Button size="sm" variant="default">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Full Stats
                    </Button>
                    <Button size="sm" variant="outline">
                      <Star className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                }
              />
            </div>
          </div>
        </section>

        {/* Inside Box Actions */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Actions Inside Colored Boxes</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Integrated Team Actions</h3>
              <TeamBox 
                team={sampleTeam}
                showStats={true}
                stats={[
                  { label: "Games", value: 12 },
                  { label: "Wins", value: 8 },
                  { label: "Win Rate", value: "67%" }
                ]}
                actions={
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                }
                className="relative"
              />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Integrated Player Actions</h3>
              <PlayerBox 
                player={samplePlayer}
                stats={sampleStats}
                actions={
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                      <Award className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                }
                className="relative"
              />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Corner Action Badges</h3>
              <TeamBox 
                team={sampleTeam}
                actions={
                  <div className="absolute top-3 right-3">
                    <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white text-gray-700 shadow-sm">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Quick Stats
                    </Button>
                  </div>
                }
                className="relative"
              />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Floating Action Menu</h3>
              <PlayerBox 
                player={samplePlayer}
                actions={
                  <div className="absolute bottom-3 right-3">
                    <Button size="sm" className="bg-black/70 hover:bg-black/80 text-white backdrop-blur-sm">
                      <Play className="h-4 w-4 mr-1" />
                      Quick Add
                    </Button>
                  </div>
                }
                className="relative"
              />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Overlay Actions with Semi-Transparent Background</h3>
              <TeamBox 
                team={sampleTeam}
                showStats={true}
                stats={[
                  { label: "Recent Form", value: "W-W-L" },
                  { label: "Rating", value: "8.5" }
                ]}
                actions={
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-all duration-200 group">
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                      <Button size="sm" variant="secondary" className="bg-white shadow-md">
                        <Users className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="secondary" className="bg-white shadow-md">
                        <Calendar className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="secondary" className="bg-white shadow-md">
                        <Trophy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                }
                className="relative overflow-hidden"
              />
            </div>
          </div>
        </section>

        {/* Action Guidelines */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Action Button Guidelines</h2>
          <div className="bg-gray-50 p-6 rounded-lg space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Color Usage:</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li><strong>Default (Blue):</strong> Primary actions like "Manage", "View Details"</li>
                <li><strong>Success (Green):</strong> Positive actions like "Activate", "Add", "Approve"</li>
                <li><strong>Warning (Orange):</strong> Caution actions like "Deactivate", "Archive"</li>
                <li><strong>Outline:</strong> Secondary actions and icon-only buttons</li>
                <li><strong>Red text + Outline:</strong> Destructive actions like "Delete", "Remove"</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Positioning:</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li><strong>External:</strong> Actions positioned below colored boxes for clear separation</li>
                <li><strong>Integrated:</strong> Actions inside boxes using semi-transparent backgrounds</li>
                <li><strong>Overlay:</strong> Hover-revealed actions with backdrop blur or shadows</li>
                <li><strong>Corner badges:</strong> Small action buttons in corners for quick access</li>
                <li>Primary actions on the left, secondary/destructive on the right</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Integration Techniques:</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li><strong>Semi-transparent:</strong> bg-white/20 with white text for colored backgrounds</li>
                <li><strong>High contrast:</strong> bg-white with dark text for maximum readability</li>
                <li><strong>Backdrop blur:</strong> backdrop-blur-sm for floating effect</li>
                <li><strong>Hover reveals:</strong> opacity-0 to opacity-100 on parent hover</li>
              </ul>
            </div>
          </div>
        </section>

        {/* External Actions with Avatar Layout */}
        <section>
          <h2 className="text-2xl font-bold mb-6">External Actions with Avatar Layout</h2>

          {/* Player Cards with Right-Side Actions */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Player Cards - Standard Right Actions</CardTitle>
              <p className="text-sm text-muted-foreground">
                Action buttons positioned on the right side, mirroring avatar placement for visual balance
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {samplePlayers.slice(0, 4).map(player => (
                  <div key={player.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    {/* Left side - Player info with avatar */}
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 ${player.avatarColor} rounded-full flex items-center justify-center text-white font-bold`}>
                        {player.displayName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-semibold">{player.displayName}</p>
                        <p className="text-sm text-muted-foreground">
                          {player.positionPreferences?.slice(0, 2).join(', ') || 'No positions'}
                        </p>
                      </div>
                    </div>

                    {/* Right side - Action buttons */}
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" className="btn-view">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="btn-edit">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="btn-manage">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Team Cards with Right-Side Actions */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Team Cards - Right Side Action Groups</CardTitle>
              <p className="text-sm text-muted-foreground">
                Team information with action buttons grouped on the right
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "WNC Dingoes", division: "13U/3s", status: "active", players: 12, wins: 8, losses: 2 },
                  { name: "WNC Emus", division: "15U/1s", status: "active", players: 10, wins: 9, losses: 1 },
                  { name: "WNC Kangaroos", division: "13U/1s", status: "inactive", players: 8, wins: 5, losses: 5 },
                  { name: "Lyrebirds", division: "15U/2s", status: "active", players: 11, wins: 7, losses: 3 }
                ].map((team, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    {/* Left side - Team info with team avatar */}
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                        {team.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{team.name}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{team.division}</span>
                          <span>•</span>
                          <span>{team.players} players</span>
                          <span>•</span>
                          <span className="text-green-600">{team.wins}W</span>
                          <span className="text-red-600">{team.losses}L</span>
                        </div>
                      </div>
                    </div>

                    {/* Right side - Action button groups */}
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline" className="btn-view">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="btn-edit">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="w-px h-6 bg-border"></div>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline" className="btn-roster">
                          <Users className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="btn-schedule">
                          <Calendar className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="btn-stats">
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Game Cards with Right-Side Actions */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Game Cards - Contextual Right Actions</CardTitle>
              <p className="text-sm text-muted-foreground">
                Game information with status-appropriate actions on the right
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: 1, opponent: "Lightning Bolts", date: "2025-06-14", status: "upcoming", result: null, round: "R13" },
                  { id: 2, opponent: "Thunder Cats", date: "2025-06-07", status: "completed", result: "W 45-32", round: "R12" },
                  { id: 3, opponent: "Storm Eagles", date: "2025-05-31", status: "completed", result: "L 28-41", round: "R11" },
                  { id: 4, opponent: "Fire Hawks", date: "2025-05-24", status: "cancelled", result: null, round: "R10" }
                ].map((game) => (
                  <div key={game.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    {/* Left side - Game info with round avatar */}
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {game.round}
                      </div>
                      <div>
                        <p className="font-semibold">{game.opponent}</p>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>{game.date}</span>
                          {game.result && (
                            <>
                              <span>•</span>
                              <span className={game.result.startsWith('W') ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                {game.result}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right side - Status-specific actions */}
                    <div className="flex items-center space-x-2">
                      {game.status === 'upcoming' && (
                        <>
                          <Button size="sm" variant="outline" className="btn-roster">
                            <Users className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="btn-prep">
                            <Target className="h-4 w-4" />
                          </Button>
                          <Button size="sm" className="btn-live">
                            <Play className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {game.status === 'completed' && (
                        <>
                          <Button size="sm" variant="outline" className="btn-stats">
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="btn-view">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="btn-export">
                            <Download className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {game.status === 'cancelled' && (
                        <>
                          <Button size="sm" variant="outline" className="btn-reschedule">
                            <Calendar className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="btn-edit">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Compact List with Minimal Right Actions */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Compact Lists - Minimal Right Actions</CardTitle>
              <p className="text-sm text-muted-foreground">
                Dense layouts with essential actions on the right
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { name: "Sarah Johnson", role: "Goal Shooter", rating: 8.5, active: true },
                  { name: "Emma Wilson", role: "Centre", rating: 8.2, active: true },
                  { name: "Kate Brown", role: "Goal Keeper", rating: 8.1, active: false },
                  { name: "Lily Chen", role: "Wing Attack", rating: 7.9, active: true },
                  { name: "Amy Thompson", role: "Wing Defence", rating: 7.7, active: true },
                  { name: "Zoe Martinez", role: "Goal Defence", rating: 7.5, active: false }
                ].map((player, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                    {/* Left side - Compact player info */}
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {player.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{player.name}</span>
                          <span className="text-xs px-2 py-0.5 bg-muted rounded">{player.role}</span>
                          <span className="text-sm text-muted-foreground">★ {player.rating}</span>
                          {!player.active && (
                            <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-600 rounded">Inactive</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right side - Minimal actions */}
                    <div className="flex items-center space-x-1">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Floating Action Style */}
          <Card>
            <CardHeader>
              <CardTitle>Floating Style Right Actions</CardTitle>
              <p className="text-sm text-muted-foreground">
                Actions that appear to float on the right with subtle shadows
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {samplePlayers.slice(0, 3).map((player) => (
                  <div key={player.id} className="relative p-4 border rounded-lg hover:bg-muted/50 transition-all group">
                    {/* Left side - Player info */}
                    <div className="flex items-center space-x-4 pr-32">
                      <div className={`w-12 h-12 ${player.avatarColor} rounded-full flex items-center justify-center text-white font-bold`}>
                        {player.displayName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{player.displayName}</p>
                        <p className="text-sm text-muted-foreground">
                          Preferred: {player.positionPreferences?.slice(0, 3).join(', ') || 'No positions'}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" size="sm">12 Games</Badge>
                          <Badge variant="outline" size="sm">★ 8.2</Badge>
                        </div>
                      </div>
                    </div>

                    {/* Right side - Floating actions */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="outline" className="shadow-md hover:shadow-lg transition-shadow">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="shadow-md hover:shadow-lg transition-shadow">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" className="shadow-md hover:shadow-lg transition-shadow">
                        <Settings className="h-4 w-4 mr-1" />
                        Manage
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Enhanced Team Cards with Action Buttons */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Enhanced Team Action Layouts</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Floating Action Buttons */}
            <Card>
              <CardHeader>
                <CardTitle>Floating Action Style</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Action buttons with floating appearance and hover effects
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sampleTeams.slice(0, 2).map(team => (
                    <div key={team.id} className="relative p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-lg">{team.name}</h4>
                          <p className="text-muted-foreground">{team.division}</p>
                          <Badge className="mt-2">{team.seasonName}</Badge>
                        </div>

                        {/* Floating action cluster */}
                        <div className="flex flex-col space-y-2">
                          <Button size="sm" className="shadow-lg hover:shadow-xl transition-shadow bg-blue-600 hover:bg-blue-700">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Stats
                          </Button>
                          <Button size="sm" variant="outline" className="shadow-lg hover:shadow-xl transition-shadow">
                            <Users className="h-4 w-4 mr-2" />
                            Roster
                          </Button>
                          <Button size="sm" variant="outline" className="shadow-lg hover:shadow-xl transition-shadow">
                            <Settings className="h-4 w-4 mr-2" />
                            Manage
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Grouped Action Buttons */}
            <Card>
              <CardHeader>
                <CardTitle>Grouped Actions</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Related actions grouped together with visual separation
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sampleTeams.slice(0, 2).map(team => (
                    <div key={team.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-bold text-lg">{team.name}</h4>
                          <p className="text-muted-foreground">{team.division}</p>
                        </div>
                        <Badge variant="outline">{team.seasonName}</Badge>
                      </div>

                      {/* Grouped action sections */}
                      <div className="flex justify-between">
                        {/* View actions */}
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="btn-view">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline" className="btn-view">
                            <BarChart3 className="h-4 w-4 mr-1" />
                            Stats
                          </Button>
                        </div>

                        {/* Management actions */}
                        <div className="flex space-x-2">
                          <Button size="sm" className="btn-edit">
                            <Users className="h-4 w-4 mr-1" />
                            Roster
                          </Button>
                          <Button size="sm" className="btn-manage">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Contextual Action Buttons */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Contextual Action Patterns</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Success State Actions */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800">Success State</CardTitle>
                <p className="text-sm text-green-600">Actions for successful/active items</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-white rounded border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Active Team</p>
                        <p className="text-sm text-muted-foreground">Lightning Bolts</p>
                      </div>
                      <div className="flex space-x-1">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                          <Trophy className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="border-green-300">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Recent Win</p>
                        <p className="text-sm text-muted-foreground">vs Eagles 32-28</p>
                      </div>
                      <div className="flex space-x-1">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                          <Award className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="border-green-300">
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Warning State Actions */}
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="text-amber-800">Warning State</CardTitle>
                <p className="text-sm text-amber-600">Actions requiring attention</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-white rounded border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Incomplete Roster</p>
                        <p className="text-sm text-muted-foreground">2 positions empty</p>
                      </div>
                      <div className="flex space-x-1">
                        <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                          <Users className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="border-amber-300">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Game Tomorrow</p>
                        <p className="text-sm text-muted-foreground">vs Panthers</p>
                      </div>
                      <div className="flex space-x-1">
                        <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                          <Clock className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="border-amber-300">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Error State Actions */}
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800">Error State</CardTitle>
                <p className="text-sm text-red-600">Actions for problematic items</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-white rounded border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Inactive Player</p>
                        <p className="text-sm text-muted-foreground">Lily Chen</p>
                      </div>
                      <div className="flex space-x-1">
                        <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                          <Zap className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="border-red-300">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Missing Stats</p>
                        <p className="text-sm text-muted-foreground">Game vs Tigers</p>
                      </div>
                      <div className="flex space-x-1">
                        <Button size="sm" className="bg-red-600 hover:red-700 text-white">
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="border-red-300">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Compact Action Buttons */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Compact Action Layouts</h2>
          <Card>
            <CardHeader>
              <CardTitle>Dense Information with Actions</CardTitle>
              <p className="text-sm text-muted-foreground">
                Compact layouts with space-efficient action placement
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { name: "Sarah Johnson", pos: "GA", rating: 8.5, games: 12, status: "active" },
                  { name: "Emma Wilson", pos: "C", rating: 8.2, games: 10, status: "active" },
                  { name: "Kate Brown", pos: "GK", rating: 8.1, games: 11, status: "injured" },
                  { name: "Lily Chen", pos: "WA", rating: 7.9, games: 8, status: "inactive" },
                  { name: "Amy Thompson", pos: "WD", rating: 7.7, games: 9, status: "active" }
                ].map((player, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {player.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <span className="font-medium">{player.name}</span>
                          <Badge variant="outline" className="text-xs">{player.pos}</Badge>
                          <span className="text-sm text-muted-foreground">Rating: {player.rating}</span>
                          <span className="text-sm text-muted-foreground">{player.games} games</span>
                          <Badge variant={player.status === 'active' ? 'default' : player.status === 'injured' ? 'destructive' : 'secondary'} className="text-xs">
                            {player.status}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </PageTemplate>
  );
}