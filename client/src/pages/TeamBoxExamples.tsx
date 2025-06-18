
import React from 'react';
import { Helmet } from 'react-helmet';
import PageTemplate from '@/components/layout/PageTemplate';
import { TeamBox } from '@/components/ui/team-box';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash2, Users, Calendar, Trophy, Target, TrendingUp, Eye, Star, BarChart3, Settings, Play, Award, Zap } from 'lucide-react';

export default function TeamBoxExamples() {
  const sampleTeams = [
    {
      id: 116,
      name: "WNC Dingoes",
      division: "13U/3s",
      clubName: "Warrandyte Netball Club",
      clubCode: "WNC",
      isActive: true,
      seasonName: "Autumn 2025"
    },
    {
      id: 123,
      name: "WNC Emus",
      division: "15U/1s",
      clubName: "Warrandyte Netball Club",
      clubCode: "WNC",
      isActive: true,
      seasonName: "Autumn 2025"
    },
    {
      id: 117,
      name: "Emeralds",
      division: "13U/3s",
      clubName: "Deep Creek",
      clubCode: "DC",
      isActive: true,
      seasonName: "Autumn 2025"
    },
    {
      id: 130,
      name: "Kool Kats",
      division: "13U/1s",
      clubName: "Doncaster",
      clubCode: "DO",
      isActive: true,
      seasonName: "Autumn 2025"
    },
    {
      id: 124,
      name: "Gems",
      division: "15U/1s",
      clubName: "Deep Creek",
      clubCode: "DC",
      isActive: false,
      seasonName: "Autumn 2025"
    },
    {
      id: 131,
      name: "Lightning",
      division: "Open A",
      clubName: "Eltham Panthers",
      clubCode: "EP",
      isActive: true,
      seasonName: "Autumn 2025"
    },
    {
      id: 132,
      name: "Thunder",
      division: "17U/A",
      clubName: "Waverley Rep",
      clubCode: "WR",
      isActive: true,
      seasonName: "Autumn 2025"
    }
  ];

  const samplePlayers = [
    {
      id: 60,
      displayName: "Abbey N",
      positionPreferences: ["GA", "GS", "C", "WA"],
      avatarColor: "bg-red-500",
      active: true
    },
    {
      id: 59,
      displayName: "Abby D",
      positionPreferences: ["GS", "GA"],
      avatarColor: "bg-orange-500",
      active: true
    },
    {
      id: 76,
      displayName: "Ava",
      positionPreferences: ["WA", "WD", "C", "GA"],
      avatarColor: "bg-teal-600",
      active: true
    },
    {
      id: 61,
      displayName: "Emily",
      positionPreferences: ["GD", "GK", "WD", "WA"],
      avatarColor: "bg-yellow-600",
      active: true
    },
    {
      id: 81,
      displayName: "Erin",
      positionPreferences: ["C", "WD", "WA", "GD"],
      avatarColor: "bg-green-700",
      active: true
    },
    {
      id: 63,
      displayName: "Evie",
      positionPreferences: ["GS", "GA"],
      avatarColor: "bg-purple-500",
      active: true
    },
    {
      id: 64,
      displayName: "Grace",
      positionPreferences: ["GD", "GK"],
      avatarColor: "bg-blue-500",
      active: true
    },
    {
      id: 65,
      displayName: "Hannah",
      positionPreferences: ["C", "WA"],
      avatarColor: "bg-pink-500",
      active: true
    }
  ];

  const sampleStats = [
    { label: "Games Played", value: 12 },
    { label: "Wins", value: 8 },
    { label: "Losses", value: 4 },
    { label: "Win Rate", value: "67%" },
    { label: "Avg Goals For", value: "24.3" },
    { label: "Avg Goals Against", value: "18.1" }
  ];

  return (
    <PageTemplate 
      title="TeamBox Design Gallery" 
      subtitle="Explore different team box layouts and styles"
      breadcrumbs={[
        { label: "Component Examples", href: "/component-examples" },
        { label: "TeamBox Examples" }
      ]}
    >
      <Helmet>
        <title>TeamBox Examples | Team Manager</title>
      </Helmet>
      
      <div className="space-y-12">
        
        {/* Hero Section with Featured Design */}
        <section className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-xl">
          <h2 className="text-3xl font-bold mb-6 text-center">Featured Team Design</h2>
          <div className="max-w-2xl mx-auto">
            <TeamBox 
              team={sampleTeams[0]} 
              variant="detailed"
              size="lg"
              showStats={true}
              showPlayers={true}
              players={samplePlayers.slice(0, 8)}
              stats={[
                { label: "Current Streak", value: "5 Wins" },
                { label: "Top Scorer", value: "Abbey N" },
                { label: "Best Quarter", value: "Q3" },
                { label: "Team Rating", value: "8.5" },
                { label: "Goals/Game", value: "28.5" },
                { label: "Defense", value: "Strong" }
              ]}
              actions={
                <div className="flex gap-3 mt-4">
                  <Button className="flex-1">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Team
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                  </Button>
                  <Button variant="outline">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              }
            />
          </div>
        </section>

        {/* Compact Grid Layout */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Compact Grid Layout</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sampleTeams.slice(0, 6).map((team, index) => (
              <TeamBox 
                key={team.id}
                team={team} 
                variant="minimal"
                size="sm"
                actions={
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                }
              />
            ))}
          </div>
        </section>

        {/* Performance Focused Cards */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Performance Dashboard Style</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TeamBox 
              team={sampleTeams[1]} 
              size="lg"
              showStats={true}
              stats={[
                { label: "Form", value: "W-W-W-L-W" },
                { label: "Goals", value: "145" },
                { label: "Conceded", value: "89" },
                { label: "Rating", value: "9.2" }
              ]}
              actions={
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <Button variant="default" size="sm">
                    <Trophy className="h-4 w-4 mr-2" />
                    View Games
                  </Button>
                  <Button variant="outline" size="sm">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Trends
                  </Button>
                  <Button variant="outline" size="sm">
                    <Users className="h-4 w-4 mr-2" />
                    Squad
                  </Button>
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule
                  </Button>
                </div>
              }
            />
            
            <TeamBox 
              team={sampleTeams[2]} 
              size="lg"
              showStats={true}
              showPlayers={true}
              players={samplePlayers.slice(0, 4)}
              stats={[
                { label: "Next Game", value: "Sat 2PM" },
                { label: "Opponent", value: "Lightning" },
                { label: "Venue", value: "Home" },
                { label: "Priority", value: "High" }
              ]}
              actions={
                <div className="flex gap-2 mt-4">
                  <Button className="flex-1">
                    <Play className="h-4 w-4 mr-2" />
                    Game Prep
                  </Button>
                  <Button variant="outline">
                    <Target className="h-4 w-4" />
                  </Button>
                </div>
              }
            />
          </div>
        </section>

        {/* Card-based Layout with Actions */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Action-Rich Cards</h2>
          <div className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <TeamBox 
                  team={sampleTeams[3]} 
                  showStats={true}
                  showPlayers={true}
                  players={samplePlayers.slice(2, 6)}
                  stats={[
                    { label: "Ladder", value: "2nd" },
                    { label: "Points", value: "24" },
                    { label: "For/Against", value: "+67" }
                  ]}
                  actions={
                    <div className="border-t p-4 bg-gray-50">
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="default">
                          <Users className="h-4 w-4 mr-2" />
                          Team Hub
                        </Button>
                        <Button size="sm" variant="outline">
                          <Calendar className="h-4 w-4 mr-2" />
                          Fixtures
                        </Button>
                        <Button size="sm" variant="outline">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Stats
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trophy className="h-4 w-4 mr-2" />
                          Results
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  }
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-0">
                <TeamBox 
                  team={sampleTeams[5]} 
                  showStats={true}
                  stats={[
                    { label: "Streak", value: "8 Wins" },
                    { label: "Top Form", value: "Attack" },
                    { label: "MVP", value: "Sarah K" }
                  ]}
                  actions={
                    <div className="border-t p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                          <Badge variant="default" className="bg-green-500">
                            <Star className="h-3 w-3 mr-1" />
                            Hot Streak
                          </Badge>
                          <Badge variant="outline">
                            <Award className="h-3 w-3 mr-1" />
                            League Leaders
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm">View Details</Button>
                          <Button size="sm" variant="outline">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  }
                />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Status-Based Designs */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Status & Priority Indicators</h2>
          <div className="space-y-4">
            
            {/* High Priority Team */}
            <div className="border-l-4 border-red-500 bg-red-50">
              <TeamBox 
                team={{...sampleTeams[0], name: "Priority Team - Game Tomorrow"}} 
                showStats={true}
                stats={[
                  { label: "Next Game", value: "16 hours" },
                  { label: "Preparation", value: "85%" },
                  { label: "Squad Status", value: "Ready" }
                ]}
                actions={
                  <div className="flex gap-2 mt-3">
                    <Button variant="destructive" size="sm">
                      <Zap className="h-4 w-4 mr-2" />
                      Final Prep
                    </Button>
                    <Button variant="outline" size="sm">Check Roster</Button>
                    <Button variant="outline" size="sm">Team Brief</Button>
                  </div>
                }
              />
            </div>

            {/* Warning Status Team */}
            <div className="border-l-4 border-yellow-500 bg-yellow-50">
              <TeamBox 
                team={{...sampleTeams[1], name: "Squad Issues - Need Attention"}} 
                showStats={true}
                stats={[
                  { label: "Available", value: "6/10" },
                  { label: "Injuries", value: "2" },
                  { label: "Status", value: "Concern" }
                ]}
                actions={
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm" className="border-yellow-600 text-yellow-700">
                      <Users className="h-4 w-4 mr-2" />
                      Manage Squad
                    </Button>
                    <Button variant="outline" size="sm">Find Cover</Button>
                    <Button variant="outline" size="sm">Medical Update</Button>
                  </div>
                }
              />
            </div>

            {/* Success Status Team */}
            <div className="border-l-4 border-green-500 bg-green-50">
              <TeamBox 
                team={{...sampleTeams[2], name: "Championship Winners"}} 
                showStats={true}
                stats={[
                  { label: "Trophy", value: "Champions" },
                  { label: "Record", value: "12-0-1" },
                  { label: "Achievement", value: "Perfect" }
                ]}
                actions={
                  <div className="flex gap-2 mt-3">
                    <Button className="bg-green-600 hover:bg-green-700" size="sm">
                      <Trophy className="h-4 w-4 mr-2" />
                      Celebrate
                    </Button>
                    <Button variant="outline" size="sm">Season Review</Button>
                    <Button variant="outline" size="sm">Awards</Button>
                  </div>
                }
              />
            </div>
          </div>
        </section>

        {/* Compact List View */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Compact List View</h2>
          <Card>
            <CardHeader>
              <CardTitle>All Teams Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {sampleTeams.map((team, index) => (
                <div key={team.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border">
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: team.clubCode === 'WNC' ? '#ff2c36' : team.clubCode === 'DC' ? '#10b981' : '#3b82f6' }}
                    >
                      {team.clubCode}
                    </div>
                    <div>
                      <div className="font-semibold">{team.name}</div>
                      <div className="text-sm text-gray-600">{team.division}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant={team.isActive ? "default" : "secondary"}>
                      {team.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        {/* Interactive Hover Effects */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Interactive Hover Effects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sampleTeams.slice(0, 4).map((team, index) => (
              <div 
                key={team.id}
                className="group relative overflow-hidden rounded-lg border-2 transition-all duration-300 hover:shadow-xl hover:scale-105"
                style={{ 
                  borderColor: team.clubCode === 'WNC' ? '#ff2c36' : team.clubCode === 'DC' ? '#10b981' : '#3b82f6'
                }}
              >
                <TeamBox 
                  team={team} 
                  showStats={true}
                  stats={[
                    { label: "Rank", value: `#${index + 1}` },
                    { label: "Form", value: "W-L-W" },
                    { label: "Rating", value: `${8 + index}.${2 + index}` }
                  ]}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300">
                  <div className="absolute bottom-4 left-4 right-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-white text-black shadow-lg">
                        Quick View
                      </Button>
                      <Button size="sm" variant="outline" className="bg-white shadow-lg">
                        Actions
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Advanced Analytics Layout */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Analytics Dashboard Style</h2>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <TeamBox 
                team={sampleTeams[0]} 
                size="lg"
                showStats={true}
                showPlayers={true}
                players={samplePlayers.slice(0, 8)}
                stats={[
                  { label: "Attack Rating", value: "92%" },
                  { label: "Defense Rating", value: "85%" },
                  { label: "Possession", value: "64%" },
                  { label: "Efficiency", value: "78%" },
                  { label: "Fitness", value: "91%" },
                  { label: "Team Chemistry", value: "88%" }
                ]}
                actions={
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <Button size="sm" variant="outline">
                      <BarChart3 className="h-4 w-4 mr-1" />
                      Reports
                    </Button>
                    <Button size="sm" variant="outline">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Trends
                    </Button>
                    <Button size="sm" variant="outline">
                      <Target className="h-4 w-4 mr-1" />
                      Goals
                    </Button>
                  </div>
                }
              />
            </div>
            <div className="space-y-4">
              <TeamBox 
                team={sampleTeams[1]} 
                variant="minimal"
                actions={
                  <Badge variant="default" className="bg-blue-500">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Improving
                  </Badge>
                }
              />
              <TeamBox 
                team={sampleTeams[2]} 
                variant="minimal"
                actions={
                  <Badge variant="default" className="bg-green-500">
                    <Star className="h-3 w-3 mr-1" />
                    Top Form
                  </Badge>
                }
              />
              <TeamBox 
                team={sampleTeams[3]} 
                variant="minimal"
                actions={
                  <Badge variant="default" className="bg-yellow-500">
                    <Zap className="h-3 w-3 mr-1" />
                    Watch
                  </Badge>
                }
              />
            </div>
          </div>
        </section>

        {/* Dark Mode Variations */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Dark Theme Variations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900 p-6 rounded-xl">
              <h3 className="text-white text-lg font-semibold mb-4">Dark Premium Card</h3>
              <div 
                className="p-6 rounded-lg border-2 bg-gray-800 text-white"
                style={{ borderColor: '#ff2c36' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: '#ff2c36' }}
                    >
                      WNC
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-white">Elite Squad</h3>
                      <p className="text-gray-300">Premium Division</p>
                    </div>
                  </div>
                  <Badge className="bg-gold text-black">VIP</Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gold">12</div>
                    <div className="text-xs text-gray-400">Championships</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gold">95%</div>
                    <div className="text-xs text-gray-400">Win Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gold">★</div>
                    <div className="text-xs text-gray-400">Hall of Fame</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black">
                    <Trophy className="h-4 w-4 mr-2" />
                    View Legacy
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-900 to-blue-900 p-6 rounded-xl">
              <h3 className="text-white text-lg font-semibold mb-4">Neon Glow Effect</h3>
              <div 
                className="p-6 rounded-lg bg-black/50 backdrop-blur-sm border-2 text-white shadow-2xl"
                style={{ 
                  borderColor: '#10b981',
                  boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)'
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold animate-pulse"
                      style={{ 
                        backgroundColor: '#10b981',
                        boxShadow: '0 0 15px rgba(16, 185, 129, 0.5)'
                      }}
                    >
                      DC
                    </div>
                    <div>
                      <h3 className="font-bold text-xl">Cyber Team</h3>
                      <p className="text-green-300">Digital League</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-400">ONLINE</div>
                    <div className="text-xs text-gray-400">Status</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-400">24/7</div>
                    <div className="text-xs text-gray-400">Active</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Card Deck Style */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Playing Card Inspired Designs</h2>
          <div className="flex flex-wrap gap-4 justify-center">
            {sampleTeams.slice(0, 4).map((team, index) => (
              <div 
                key={team.id}
                className="w-64 h-80 bg-white rounded-xl shadow-lg border-2 border-gray-200 relative overflow-hidden transform hover:scale-105 transition-transform duration-300"
                style={{ 
                  background: `linear-gradient(135deg, ${index % 2 === 0 ? '#ff2c36' : '#10b981'} 0%, white 30%)`
                }}
              >
                <div className="absolute top-4 left-4 text-white">
                  <div className="text-2xl font-bold">{team.clubCode}</div>
                  <div className="text-sm">#{index + 1}</div>
                </div>
                <div className="absolute top-4 right-4 text-white">
                  <Trophy className="h-6 w-6" />
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 bg-white p-4 rounded-t-xl">
                  <h3 className="font-bold text-lg mb-2">{team.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{team.division}</p>
                  <div className="flex justify-between text-sm">
                    <span>Rank: #{index + 1}</span>
                    <span>★ {8 + index}.{5 - index}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Social Media Style Cards */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Social Media Inspired</h2>
          <div className="space-y-6">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: '#ff2c36' }}
                  >
                    WNC
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">WNC Champions</h3>
                    <p className="text-sm text-gray-500">@wncchampions • 2h</p>
                  </div>
                  <Button size="sm" variant="outline">Follow</Button>
                </div>
                
                <p className="text-gray-800 mb-4">
                  🏆 Another incredible win! Our team chemistry is at an all-time high. 
                  Ready for the championship! #NetballLife #Champions
                </p>
                
                <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="font-bold text-lg">45</div>
                    <div className="text-xs text-gray-600">Goals</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg">12</div>
                    <div className="text-xs text-gray-600">Wins</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg">92%</div>
                    <div className="text-xs text-gray-600">Accuracy</div>
                  </div>
                </div>
                
                <div className="flex justify-between text-sm text-gray-500 border-t pt-3">
                  <button className="flex items-center space-x-1 hover:text-red-500">
                    <Heart className="h-4 w-4" />
                    <span>245 likes</span>
                  </button>
                  <button className="flex items-center space-x-1 hover:text-blue-500">
                    <Share className="h-4 w-4" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile App Style */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Mobile App Interface Style</h2>
          <div className="max-w-sm mx-auto bg-gray-100 p-4 rounded-3xl shadow-xl">
            <div className="space-y-3">
              {sampleTeams.slice(0, 3).map((team, index) => (
                <div 
                  key={team.id}
                  className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm"
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ backgroundColor: team.clubCode === 'WNC' ? '#ff2c36' : '#10b981' }}
                    >
                      {team.clubCode}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{team.name}</div>
                      <div className="text-xs text-gray-500">{team.division}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-green-600">LIVE</div>
                    <div className="text-xs text-gray-500">Q{index + 1}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Retro/Vintage Style */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Retro Championship Certificates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div 
              className="relative p-8 bg-gradient-to-br from-yellow-100 to-orange-100 border-8 border-double border-yellow-600 rounded-lg"
              style={{ 
                backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)'
              }}
            >
              <div className="text-center">
                <div className="text-4xl mb-2">🏆</div>
                <h3 className="text-2xl font-bold text-yellow-800 mb-2">CHAMPIONS</h3>
                <div className="text-lg font-semibold text-yellow-700">WNC Dingoes</div>
                <div className="text-sm text-yellow-600 mb-4">13U/3s Division</div>
                <div className="border-t-2 border-yellow-600 pt-4">
                  <div className="text-xs text-yellow-700">SEASON WINNERS</div>
                  <div className="text-lg font-bold text-yellow-800">AUTUMN 2025</div>
                </div>
              </div>
              <div className="absolute top-2 left-2 w-4 h-4 border-2 border-yellow-600 rounded-full"></div>
              <div className="absolute top-2 right-2 w-4 h-4 border-2 border-yellow-600 rounded-full"></div>
              <div className="absolute bottom-2 left-2 w-4 h-4 border-2 border-yellow-600 rounded-full"></div>
              <div className="absolute bottom-2 right-2 w-4 h-4 border-2 border-yellow-600 rounded-full"></div>
            </div>

            <div className="relative p-6 bg-black text-white rounded-lg overflow-hidden">
              <div 
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)'
                }}
              ></div>
              <div className="relative z-10">
                <div className="text-center mb-6">
                  <div className="text-green-400 text-4xl font-mono mb-2">█ HALL OF FAME █</div>
                  <div className="text-green-400 font-mono">{'>'} LEGENDARY STATUS {'<'}</div>
                </div>
                <div className="font-mono space-y-2">
                  <div className="text-green-400">> TEAM: <span className="text-white">WNC EMUS</span></div>
                  <div className="text-green-400">> DIVISION: <span className="text-white">15U/1s</span></div>
                  <div className="text-green-400">> STATUS: <span className="text-white blink">UNDEFEATED</span></div>
                  <div className="text-green-400">> WINS: <span className="text-white">24/24</span></div>
                </div>
                <div className="mt-6 text-center">
                  <div className="inline-block px-4 py-2 border border-green-400 text-green-400 font-mono text-sm">
                    [PRESS ENTER TO CONTINUE]
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Progressive Enhancement Demo */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Progressive Information Reveal</h2>
          <div className="space-y-4">
            <div className="group relative overflow-hidden rounded-lg border-2 border-blue-200 hover:border-blue-500 transition-all duration-500">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      WNC
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">WNC Eagles</h3>
                      <p className="text-sm text-gray-600">Hover for details</p>
                    </div>
                  </div>
                  <div className="text-2xl">→</div>
                </div>
              </div>
              
              <div className="absolute inset-0 bg-white transform translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-in-out">
                <div className="p-6 h-full flex flex-col justify-center">
                  <h3 className="font-bold text-xl mb-4">Detailed Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">15</div>
                      <div className="text-sm text-gray-600">Games Played</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">80%</div>
                      <div className="text-sm text-gray-600">Win Rate</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">342</div>
                      <div className="text-sm text-gray-600">Total Goals</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">3rd</div>
                      <div className="text-sm text-gray-600">League Position</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </PageTemplate>
  );
}
