import React from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageTemplate from '@/components/layout/PageTemplate';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
  ChevronUp,
  ChevronDown,
  Circle,
  Dot
} from 'lucide-react';

// Sample data for visual components
const recentGames = [
  { opponent: "Emeralds", result: "W", score: "32-28", round: "R12", date: "May 31", margin: "+4", color: "bg-green-500" },
  { opponent: "Kool Kats", result: "L", score: "24-31", round: "R11", date: "May 24", margin: "-7", color: "bg-red-500" },
  { opponent: "Gems", result: "W", score: "35-22", round: "R10", date: "May 17", margin: "+13", color: "bg-green-500" },
  { opponent: "Pumas", result: "W", score: "28-25", round: "R9", date: "May 10", margin: "+3", color: "bg-green-500" },
  { opponent: "Tigers", result: "L", score: "20-29", round: "R8", date: "May 3", margin: "-9", color: "bg-red-500" }
];

const upcomingGames = [
  { opponent: "Emeralds", date: "Jun 14", time: "10:00 AM", venue: "Home", lastResult: "W", lastScore: "32-28", strength: 85 },
  { opponent: "Panthers", date: "Jun 21", time: "2:00 PM", venue: "Away", lastResult: "W", lastScore: "29-22", strength: 72 },
  { opponent: "Wildcats", date: "Jun 28", time: "11:00 AM", venue: "Home", lastResult: "L", lastScore: "18-25", strength: 45 }
];

const quarterStats = [
  { quarter: "Q1", average: 9.2, trend: "up", percentage: 92, color: "bg-blue-500" },
  { quarter: "Q2", average: 8.7, trend: "down", percentage: 87, color: "bg-green-500" },
  { quarter: "Q3", average: 7.8, trend: "down", percentage: 78, color: "bg-orange-500" },
  { quarter: "Q4", average: 9.5, trend: "up", percentage: 95, color: "bg-purple-500" }
];

const playerPerformance = [
  { name: "Sarah J", position: "GA", rating: 9.2, goals: 42, trend: "up", performance: 92 },
  { name: "Emma W", position: "C", rating: 8.8, assists: 28, trend: "up", performance: 88 },
  { name: "Kate B", position: "GK", rating: 8.5, intercepts: 35, trend: "same", performance: 85 },
  { name: "Lily C", position: "WA", rating: 8.1, feeds: 52, trend: "down", performance: 81 }
];

const opponentMatchups = [
  { team: "Emeralds", scoreDiff: 4, formVs: "3-1-1", winRate: 75, strength: "High" },
  { team: "Panthers", scoreDiff: 7, formVs: "4-1-0", winRate: 80, strength: "Medium" },
  { team: "Wildcats", scoreDiff: -7, formVs: "1-3-1", winRate: 25, strength: "Low" },
  { team: "Tigers", scoreDiff: -3, formVs: "2-2-1", winRate: 50, strength: "Medium" }
];

const StatusIndicator = ({ status, label }: { status: 'excellent' | 'good' | 'warning' | 'danger', label: string }) => {
  const statusConfig = {
    excellent: { color: 'bg-green-500', icon: CheckCircle, pulse: false },
    good: { color: 'bg-blue-500', icon: CheckCircle, pulse: false },
    warning: { color: 'bg-yellow-500', icon: AlertCircle, pulse: true },
    danger: { color: 'bg-red-500', icon: XCircle, pulse: true }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="flex items-center space-x-2">
      <div className={`relative ${config.color} rounded-full p-1`}>
        <Icon className="h-3 w-3 text-white" />
        {config.pulse && (
          <div className={`absolute inset-0 ${config.color} rounded-full animate-ping opacity-75`}></div>
        )}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
};

const CircularProgress = ({ percentage, size = 60, strokeWidth = 6, color = "text-blue-500" }: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${percentage * circumference / 100} ${circumference}`;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          className={color}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute text-sm font-bold">
        {percentage}%
      </div>
    </div>
  );
};

const MiniChart = ({ data, color = "bg-blue-500" }: { data: number[], color?: string }) => {
  const max = Math.max(...data);
  return (
    <div className="flex items-end space-x-1 h-8">
      {data.map((value, index) => (
        <div
          key={index}
          className={`${color} rounded-sm w-2`}
          style={{ height: `${(value / max) * 100}%` }}
        />
      ))}
    </div>
  );
};

export default function DashboardExamples() {
  return (
    <PageTemplate 
      title="Visual Dashboard Examples" 
      breadcrumbs={[
        { label: "Component Examples", href: "/component-examples" },
        { label: "Dashboard Examples" }
      ]}
    >
      <div className="prose max-w-none mb-8">
        <p className="text-lg text-gray-700">
          Rich, interactive dashboard layouts with charts, progress indicators, and visual analytics for modern team management.
        </p>
      </div>
      <div className="space-y-12">
        <Helmet>
          <title>Visual Dashboard Examples - Netball App</title>
        </Helmet>

        {/* Layout 1: Performance Analytics Dashboard */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Performance Analytics Dashboard</h2>
          <div className="space-y-6">

            {/* Top Row - KPI Cards with Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Win Rate</p>
                      <p className="text-3xl font-bold text-blue-900">78%</p>
                    </div>
                    <CircularProgress percentage={78} size={50} color="text-blue-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <MiniChart data={[5, 8, 6, 9, 7, 8, 10]} color="bg-blue-500" />
                    <StatusIndicator status="excellent" label="Trending Up" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium text-green-600">Goals/Game</p>
                      <p className="text-3xl font-bold text-green-900">31.2</p>
                    </div>
                    <div className="relative">
                      <Target className="h-12 w-12 text-green-600" />
                      <div className="absolute -top-1 -right-1">
                        <TrendingUp className="h-4 w-4 text-green-700 bg-green-200 rounded-full p-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>vs Target (28)</span>
                      <span className="font-bold text-green-700">+3.2</span>
                    </div>
                    <Progress value={89} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Team Rating</p>
                      <p className="text-3xl font-bold text-purple-900">8.7</p>
                    </div>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`h-4 w-4 ${star <= 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center p-2 bg-purple-200 rounded">
                      <div className="font-bold">Attack</div>
                      <div>9.1</div>
                    </div>
                    <div className="text-center p-2 bg-purple-200 rounded">
                      <div className="font-bold">Defense</div>
                      <div>8.5</div>
                    </div>
                    <div className="text-center p-2 bg-purple-200 rounded">
                      <div className="font-bold">Flow</div>
                      <div>8.4</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium text-orange-600">Form Streak</p>
                      <p className="text-3xl font-bold text-orange-900">4W</p>
                    </div>
                    <Flame className="h-12 w-12 text-orange-600" />
                  </div>
                  <div className="flex justify-center space-x-1 mb-2">
                    {['W', 'W', 'L', 'W', 'W'].map((result, i) => (
                      <div key={i} className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        result === 'W' ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                        {result}
                      </div>
                    ))}
                  </div>
                  <StatusIndicator status="good" label="Hot Streak!" />
                </CardContent>
              </Card>
            </div>

            {/* Quarter Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Quarter Performance Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {quarterStats.map((quarter, index) => (
                    <div key={index} className="text-center">
                      <div className="mb-4">
                        <CircularProgress 
                          percentage={quarter.percentage} 
                          size={80} 
                          color={quarter.color.replace('bg-', 'text-')}
                        />
                      </div>
                      <h3 className="font-bold text-lg">{quarter.quarter}</h3>
                      <p className="text-2xl font-bold">{quarter.average}</p>
                      <div className="flex items-center justify-center mt-2">
                        {quarter.trend === 'up' && <ChevronUp className="h-4 w-4 text-green-500" />}
                        {quarter.trend === 'down' && <ChevronDown className="h-4 w-4 text-red-500" />}
                        <span className={`text-sm ${
                          quarter.trend === 'up' ? 'text-green-500' : 
                          quarter.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                        }`}>
                          {quarter.trend === 'up' ? 'Improving' : quarter.trend === 'down' ? 'Declining' : 'Stable'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Layout 2: Game Intelligence Dashboard */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Game Intelligence Dashboard</h2>
          <div className="space-y-6">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Games with Visual Results */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>Recent Form Analysis</span>
                  </CardTitle>
                  <div className="flex space-x-1">
                    {recentGames.map((game, i) => (
                      <div key={i} className={`w-3 h-8 ${game.color} rounded-sm opacity-80`} />
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentGames.map((game, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Badge variant={game.result === 'W' ? 'default' : 'destructive'} className="w-8 h-8 rounded-full p-0 flex items-center justify-center font-bold">
                            {game.result}
                          </Badge>
                          <div>
                            <p className="font-medium">vs {game.opponent}</p>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <span>{game.round}</span>
                              <Dot className="h-3 w-3" />
                              <span>{game.date}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{game.score}</p>
                          <div className="flex items-center space-x-1">
                            {game.result === 'W' ? 
                              <TrendingUp className="h-3 w-3 text-green-500" /> : 
                              <TrendingDown className="h-3 w-3 text-red-500" />
                            }
                            <span className={`text-sm font-medium ${
                              game.result === 'W' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {game.margin}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Games with Strength Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Upcoming Challenge Analysis</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingGames.map((game, index) => (
                      <div key={index} className="p-4 border rounded-lg bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-medium text-lg">vs {game.opponent}</p>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <span>{game.date} at {game.time}</span>
                              <Dot className="h-3 w-3" />
                              <MapPin className="h-3 w-3" />
                              <span>{game.venue}</span>
                            </div>
                          </div>
                          <CircularProgress 
                            percentage={game.strength} 
                            size={45} 
                            color={game.strength > 70 ? "text-green-500" : game.strength > 50 ? "text-orange-500" : "text-red-500"}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant={game.lastResult === 'W' ? 'default' : 'destructive'} className="text-xs">
                              Last: {game.lastResult}
                            </Badge>
                            <span className="text-sm text-gray-600">{game.lastScore}</span>
                          </div>
                          <StatusIndicator 
                            status={game.strength > 70 ? "good" : game.strength > 50 ? "warning" : "danger"} 
                            label={`${game.strength}% Win Chance`} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Player Performance Grid */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Player Performance Matrix</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {playerPerformance.map((player, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-gradient-to-br from-white to-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {player.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-medium">{player.name}</p>
                            <p className="text-xs text-gray-500">{player.position}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {player.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                          {player.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                          {player.trend === 'same' && <Minus className="h-4 w-4 text-gray-500" />}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Performance</span>
                          <span className="font-bold">{player.rating}</span>
                        </div>
                        <Progress value={player.performance} className="h-2" />
                        <div className="text-xs text-gray-600">
                          {player.goals && `${player.goals} goals`}
                          {player.assists && `${player.assists} assists`}
                          {player.intercepts && `${player.intercepts} intercepts`}
                          {player.feeds && `${player.feeds} feeds`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Layout 3: Strategic Overview Dashboard */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Strategic Overview Dashboard</h2>
          <div className="space-y-6">

            {/* Opponent Matchup Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Opponent Strength Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {opponentMatchups.map((opponent, index) => (
                    <div key={index} className="p-4 border rounded-lg relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 opacity-10">
                        <CircularProgress percentage={opponent.winRate} size={64} />
                      </div>
                      <div className="relative">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium">{opponent.team}</h4>
                          <Badge variant={opponent.strength === 'High' ? 'default' : opponent.strength === 'Medium' ? 'secondary' : 'outline'}>
                            {opponent.strength}
                          </Badge>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Win Rate vs Them</span>
                            <div className="flex items-center space-x-2">
                              <Progress value={opponent.winRate} className="w-12 h-2" />
                              <span className="text-sm font-medium">{opponent.winRate}%</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Avg Differential</span>
                            <div className="flex items-center space-x-2">
                              {opponent.scoreDiff > 0 ? 
                                <TrendingUp className="h-3 w-3 text-green-500" /> : 
                                <TrendingDown className="h-3 w-3 text-red-500" />
                              }
                              <span className={`text-sm font-medium ${
                                opponent.scoreDiff > 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {opponent.scoreDiff > 0 ? '+' : ''}{opponent.scoreDiff}
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            Head-to-Head: {opponent.formVs}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Status Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="font-bold text-lg text-green-800 mb-2">Team Readiness</h3>
                  <div className="space-y-2">
                    <StatusIndicator status="excellent" label="Full Squad Available" />
                    <StatusIndicator status="good" label="Fitness: 95%" />
                    <StatusIndicator status="excellent" label="Training: 92%" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6 text-center">
                  <BarChart3 className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="font-bold text-lg text-blue-800 mb-2">Performance Trend</h3>
                  <div className="space-y-2">
                    <StatusIndicator status="excellent" label="Attack: Improving" />
                    <StatusIndicator status="good" label="Defense: Stable" />
                    <StatusIndicator status="warning" label="Fitness: Monitor" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="p-6 text-center">
                  <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="font-bold text-lg text-orange-800 mb-2">Action Items</h3>
                  <div className="space-y-2">
                    <StatusIndicator status="warning" label="Roster Due: 2 days" />
                    <StatusIndicator status="good" label="Strategy Review" />
                    <StatusIndicator status="danger" label="Injury Report Overdue" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Design Guidelines */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Visual Dashboard Design Guidelines</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Visual Elements Used</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CircularProgress percentage={75} size={30} />
                    <span className="text-sm">Circular progress indicators for percentages and ratings</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MiniChart data={[3, 6, 4, 8, 5]} color="bg-blue-500" />
                    <span className="text-sm">Mini charts for trend visualization</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <StatusIndicator status="excellent" label="Status indicators" />
                    <span className="text-sm">for real-time system states</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Progress value={68} className="w-20 h-2" />
                    <span className="text-sm">Progress bars for performance tracking</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Design Principles</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Visual hierarchy with color-coded metrics</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Interactive elements with hover states</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Gradient backgrounds for visual depth</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Status indicators for immediate feedback</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Charts and graphs for data storytelling</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </PageTemplate>
  );
}