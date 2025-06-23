
import React from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageTemplate from '@/components/layout/PageTemplate';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target, 
  Trophy, 
  Calendar,
  BarChart3,
  Activity,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Zap,
  Shield,
  Eye,
  Edit,
  Trash2,
  Download,
  Share,
  ArrowUp,
  ArrowDown,
  Minus,
  MapPin,
  Timer,
  Flame,
  TrendingFlat
} from 'lucide-react';

const sampleWidgets = [
  {
    title: "Team Performance",
    value: "67%",
    subtitle: "Win Rate",
    trend: "up",
    trendValue: "+12%",
    icon: <Trophy className="h-5 w-5" />,
    color: "bg-green-500"
  },
  {
    title: "Goals Scored",
    value: "324",
    subtitle: "This Season",
    trend: "up",
    trendValue: "+8",
    icon: <Target className="h-5 w-5" />,
    color: "bg-blue-500"
  },
  {
    title: "Active Players",
    value: "18",
    subtitle: "Available",
    trend: "neutral",
    trendValue: "Same",
    icon: <Users className="h-5 w-5" />,
    color: "bg-purple-500"
  },
  {
    title: "Next Game",
    value: "2 days",
    subtitle: "vs Emeralds",
    trend: "neutral",
    trendValue: "Away",
    icon: <Calendar className="h-5 w-5" />,
    color: "bg-orange-500"
  }
];

const recentGames = [
  { opponent: "Emeralds", result: "W", score: "32-28", round: "R12", date: "May 31", margin: "+4" },
  { opponent: "Kool Kats", result: "L", score: "24-31", round: "R11", date: "May 24", margin: "-7" },
  { opponent: "Gems", result: "W", score: "35-22", round: "R10", date: "May 17", margin: "+13" },
  { opponent: "Pumas", result: "W", score: "28-25", round: "R9", date: "May 10", margin: "+3" },
  { opponent: "Tigers", result: "L", score: "20-29", round: "R8", date: "May 3", margin: "-9" }
];

const upcomingGames = [
  { opponent: "Emeralds", date: "Jun 14", time: "10:00 AM", venue: "Home", lastResult: "W", lastScore: "32-28" },
  { opponent: "Panthers", date: "Jun 21", time: "2:00 PM", venue: "Away", lastResult: "W", lastScore: "29-22" },
  { opponent: "Wildcats", date: "Jun 28", time: "11:00 AM", venue: "Home", lastResult: "L", lastScore: "18-25" }
];

const topPlayers = [
  { name: "Sarah Johnson", position: "GA", goals: 42, rating: 8.5, trend: "up" },
  { name: "Emma Wilson", position: "C", assists: 28, rating: 8.2, trend: "up" },
  { name: "Kate Brown", position: "GK", intercepts: 35, rating: 8.1, trend: "same" },
  { name: "Lily Chen", position: "WA", feeds: 52, rating: 7.9, trend: "down" }
];

const teamAnalytics = [
  { label: "Quarter 1 Avg", value: "9.2", trend: "up", trendValue: "+0.8" },
  { label: "Quarter 2 Avg", value: "8.7", trend: "down", trendValue: "-0.3" },
  { label: "Quarter 3 Avg", value: "7.8", trend: "down", trendValue: "-1.2" },
  { label: "Quarter 4 Avg", value: "9.5", trend: "up", trendValue: "+1.1" }
];

const opponentMatchups = [
  { team: "Emeralds", scoreDiff: "+4", formVs: "3-1-1", lastMeeting: "W 32-28", strength: "High" },
  { team: "Panthers", scoreDiff: "+7", formVs: "4-1-0", lastMeeting: "W 29-22", strength: "Medium" },
  { team: "Wildcats", scoreDiff: "-7", formVs: "1-3-1", lastMeeting: "L 18-25", strength: "Low" },
  { team: "Tigers", scoreDiff: "-9", formVs: "2-2-1", lastMeeting: "L 20-29", strength: "Medium" }
];

export default function DashboardExamples() {
  return (
    <PageTemplate 
      title="Dashboard Examples" 
      breadcrumbs={[
        { label: "Component Examples", href: "/component-examples" },
        { label: "Dashboard Examples" }
      ]}
    >
      <div className="prose max-w-none mb-8">
        <p className="text-lg text-gray-700">
          Creative dashboard layouts that consolidate team metrics and provide actionable insights for coaches and team managers.
        </p>
      </div>
      <div className="space-y-12">
        <Helmet>
          <title>Dashboard Examples - Netball App</title>
        </Helmet>

        {/* Layout 1: Performance-Focused Dashboard */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Performance-Focused Dashboard</h2>
          <div className="space-y-6">
            
            {/* Top Row - Key Performance Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Season Win Rate</p>
                      <p className="text-3xl font-bold text-green-900">78%</p>
                      <div className="flex items-center mt-2">
                        <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                        <span className="text-sm text-green-600">+12% vs last season</span>
                      </div>
                    </div>
                    <Trophy className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Average Score</p>
                      <p className="text-3xl font-bold text-blue-900">31.2</p>
                      <div className="flex items-center mt-2">
                        <TrendingUp className="h-4 w-4 text-blue-600 mr-1" />
                        <span className="text-sm text-blue-600">+2.8 vs opponents</span>
                      </div>
                    </div>
                    <Target className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Current Form</p>
                      <p className="text-3xl font-bold text-purple-900">W-W-L-W-W</p>
                      <div className="flex items-center mt-2">
                        <Flame className="h-4 w-4 text-purple-600 mr-1" />
                        <span className="text-sm text-purple-600">4 wins in last 5</span>
                      </div>
                    </div>
                    <Activity className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600">Next Game</p>
                      <p className="text-xl font-bold text-orange-900">vs Emeralds</p>
                      <div className="flex items-center mt-2">
                        <Clock className="h-4 w-4 text-orange-600 mr-1" />
                        <span className="text-sm text-orange-600">2 days, Home</span>
                      </div>
                    </div>
                    <Calendar className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Second Row - Recent Games & Quarter Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-lg">Recent Form & Results</CardTitle>
                  <Button size="sm" variant="outline">View All</Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentGames.map((game, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Badge variant={game.result === 'W' ? 'default' : 'destructive'} className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                            {game.result}
                          </Badge>
                          <div>
                            <p className="font-medium">vs {game.opponent}</p>
                            <p className="text-sm text-gray-500">{game.round} • {game.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{game.score}</p>
                          <p className={`text-sm ${game.result === 'W' ? 'text-green-600' : 'text-red-600'}`}>
                            {game.margin}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quarter Performance Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {teamAnalytics.map((quarter, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">{quarter.label}</span>
                        <div className="flex items-center space-x-3">
                          <span className="text-lg font-bold">{quarter.value}</span>
                          <div className="flex items-center space-x-1">
                            {quarter.trend === 'up' && <ArrowUp className="h-4 w-4 text-green-500" />}
                            {quarter.trend === 'down' && <ArrowDown className="h-4 w-4 text-red-500" />}
                            {quarter.trend === 'same' && <Minus className="h-4 w-4 text-gray-500" />}
                            <span className={`text-sm ${
                              quarter.trend === 'up' ? 'text-green-500' :
                              quarter.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                            }`}>
                              {quarter.trendValue}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Layout 2: Strategic Dashboard */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Strategic Planning Dashboard</h2>
          <div className="space-y-6">
            
            {/* Strategic Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="col-span-1 md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Upcoming Games & Strategy</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingGames.map((game, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="text-center min-w-[60px]">
                            <p className="font-bold text-lg">{game.date.split(' ')[1]}</p>
                            <p className="text-sm text-gray-500">{game.date.split(' ')[0]}</p>
                          </div>
                          <div>
                            <p className="font-medium">vs {game.opponent}</p>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <span>{game.time}</span>
                              <span>•</span>
                              <div className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                <span>{game.venue}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <Badge variant={game.lastResult === 'W' ? 'default' : 'destructive'} className="text-xs">
                              Last: {game.lastResult}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{game.lastScore}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Team Readiness</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <p className="font-bold text-green-800">Squad Complete</p>
                      <p className="text-sm text-green-600">18/18 players available</p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Fitness Level</span>
                        <span className="font-medium text-green-600">95%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Training Attendance</span>
                        <span className="font-medium text-blue-600">89%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Form Rating</span>
                        <span className="font-medium text-purple-600">8.2/10</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Opponent Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Opponent Matchup Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {opponentMatchups.map((opponent, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium">{opponent.team}</h4>
                        <Badge variant={opponent.strength === 'High' ? 'default' : opponent.strength === 'Medium' ? 'secondary' : 'outline'}>
                          {opponent.strength}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Avg Differential:</span>
                          <span className={opponent.scoreDiff.startsWith('+') ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                            {opponent.scoreDiff}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Head-to-Head:</span>
                          <span className="font-medium">{opponent.formVs}</span>
                        </div>
                        <div className="text-gray-600">
                          <span className="text-xs">Last: {opponent.lastMeeting}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Layout 3: Compact Overview Dashboard */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Compact Overview Dashboard</h2>
          <div className="space-y-6">
            
            {/* Compact Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <Card className="text-center">
                <CardContent className="p-4">
                  <Trophy className="h-6 w-6 mx-auto mb-2 text-green-500" />
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-xs text-gray-600">Wins</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-4">
                  <XCircle className="h-6 w-6 mx-auto mb-2 text-red-500" />
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-xs text-gray-600">Losses</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-4">
                  <Target className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                  <p className="text-2xl font-bold">31.2</p>
                  <p className="text-xs text-gray-600">Avg Score</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-4">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                  <p className="text-2xl font-bold">26.8</p>
                  <p className="text-xs text-gray-600">Opp Avg</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-4">
                  <Star className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                  <p className="text-2xl font-bold">8.2</p>
                  <p className="text-xs text-gray-600">Team Rating</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-4">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                  <p className="text-2xl font-bold">4</p>
                  <p className="text-xs text-gray-600">Win Streak</p>
                </CardContent>
              </Card>
            </div>

            {/* Combined Games View */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>Recent Results</span>
                    <div className="flex space-x-1">
                      {['W', 'W', 'L', 'W', 'W'].map((result, i) => (
                        <div key={i} className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          result === 'W' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}>
                          {result}
                        </div>
                      ))}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {recentGames.slice(0, 3).map((game, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="w-12 text-gray-500">{game.round}</span>
                          <span>{game.opponent}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{game.score}</span>
                          <Badge variant={game.result === 'W' ? 'default' : 'destructive'} className="text-xs">
                            {game.result}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Upcoming Fixtures</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {upcomingGames.map((game, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="w-12 text-gray-500">{game.date}</span>
                          <span>{game.opponent}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500">{game.time}</span>
                          <Badge variant="outline" className="text-xs">
                            {game.venue}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Layout 4: Coach's Action Dashboard */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Coach's Action Dashboard</h2>
          <div className="space-y-6">
            
            {/* Quick Actions & Alerts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <span>Action Required</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Roster Due</span>
                      <Badge variant="secondary">2 days</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Player Check-in</span>
                      <Badge variant="secondary">Tomorrow</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Injury Reports</span>
                      <Badge variant="destructive">Overdue</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Star className="h-5 w-5" />
                    <span>Top Performers</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topPlayers.slice(0, 3).map((player, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {player.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{player.name}</p>
                            <p className="text-xs text-gray-500">{player.position}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {player.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
                          {player.trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
                          {player.trend === 'same' && <TrendingFlat className="h-3 w-3 text-gray-500" />}
                          <span className="text-sm font-medium">{player.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Zap className="h-5 w-5" />
                    <span>Quick Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" variant="outline" className="h-16 flex-col space-y-1">
                      <Users className="h-4 w-4" />
                      <span className="text-xs">Roster</span>
                    </Button>
                    <Button size="sm" variant="outline" className="h-16 flex-col space-y-1">
                      <BarChart3 className="h-4 w-4" />
                      <span className="text-xs">Stats</span>
                    </Button>
                    <Button size="sm" variant="outline" className="h-16 flex-col space-y-1">
                      <Target className="h-4 w-4" />
                      <span className="text-xs">Strategy</span>
                    </Button>
                    <Button size="sm" variant="outline" className="h-16 flex-col space-y-1">
                      <Calendar className="h-4 w-4" />
                      <span className="text-xs">Schedule</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Game Focus Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Next Game Focus: vs Emeralds</span>
                    <Badge variant="outline">2 days</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-900">32-28</p>
                      <p className="text-sm text-blue-600">Last Result (W)</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-900">+4.2</p>
                      <p className="text-sm text-green-600">Avg vs Them</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-900">High</p>
                      <p className="text-sm text-purple-600">Win Probability</p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">Key Strategy Points:</p>
                    <ul className="text-sm text-gray-600 mt-1 space-y-1">
                      <li>• Focus on strong Q1 start (they're weak early)</li>
                      <li>• Target their weak GA position</li>
                      <li>• Maintain defensive pressure in Q3</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Season Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">78%</div>
                      <div className="text-sm text-gray-600">Season Complete</div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Games Played</span>
                        <span className="font-medium">15/19</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Current Position</span>
                        <span className="font-medium text-green-600">2nd</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Finals Chance</span>
                        <span className="font-medium text-green-600">95%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Design Guidelines */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Dashboard Design Guidelines</h2>
          <Card>
            <CardHeader>
              <CardTitle>Key Principles for Effective Dashboards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Essential Elements</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Recent games with clear win/loss indicators</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Upcoming fixtures with preparation time</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Key performance metrics with trends</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Actionable insights and recommendations</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Layout Considerations</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-blue-500" />
                      <span>Most important metrics in top-left quadrant</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-blue-500" />
                      <span>Consistent color coding for win/loss/neutral</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-blue-500" />
                      <span>Progressive information density</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-blue-500" />
                      <span>Clear visual hierarchy and grouping</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </PageTemplate>
  );
}
