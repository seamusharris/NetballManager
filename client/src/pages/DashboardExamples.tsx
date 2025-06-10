
import React from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageTemplate } from '@/components/layout/PageTemplate';
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
  Share
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
  { opponent: "Emeralds", result: "W", score: "32-28", round: "R12", date: "May 31" },
  { opponent: "Kool Kats", result: "L", score: "24-31", round: "R11", date: "May 24" },
  { opponent: "Gems", result: "W", score: "35-22", round: "R10", date: "May 17" },
  { opponent: "Pumas", result: "W", score: "28-25", round: "R9", date: "May 10" },
  { opponent: "Tigers", result: "L", score: "20-29", round: "R8", date: "May 3" }
];

const topPlayers = [
  { name: "Sarah Johnson", position: "GA", goals: 42, rating: 8.5 },
  { name: "Emma Wilson", position: "C", assists: 28, rating: 8.2 },
  { name: "Kate Brown", position: "GK", intercepts: 35, rating: 8.1 },
  { name: "Lily Chen", position: "WA", feeds: 52, rating: 7.9 }
];

const upcomingGames = [
  { opponent: "Emeralds", date: "Jun 14", time: "10:00 AM", venue: "Home" },
  { opponent: "Panthers", date: "Jun 21", time: "2:00 PM", venue: "Away" },
  { opponent: "Wildcats", date: "Jun 28", time: "11:00 AM", venue: "Home" }
];

export default function DashboardExamples() {
  return (
    <PageTemplate 
      title="Dashboard Examples" 
      breadcrumbs={[{ label: "Dashboard Examples" }]}
    >
      <div className="space-y-8">
        <Helmet>
          <title>Dashboard Examples - Netball App</title>
        </Helmet>

        <div className="prose max-w-none">
          <p className="text-lg text-gray-700">
            Comprehensive dashboard widget examples with consistent styling and color schemes.
          </p>
        </div>

        {/* Key Metrics Cards */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Key Metrics Widgets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sampleWidgets.map((widget, index) => (
              <Card key={index} className="relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">{widget.title}</p>
                      <p className="text-3xl font-bold">{widget.value}</p>
                      <p className="text-sm text-gray-500">{widget.subtitle}</p>
                    </div>
                    <div className={`p-3 rounded-full ${widget.color} text-white`}>
                      {widget.icon}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center space-x-2">
                    {widget.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                    {widget.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                    {widget.trend === 'neutral' && <Activity className="h-4 w-4 text-gray-500" />}
                    <span className={`text-sm font-medium ${
                      widget.trend === 'up' ? 'text-green-500' :
                      widget.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                    }`}>
                      {widget.trendValue}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Recent Games Widget */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Recent Games Widget</h2>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Recent Games</span>
              </CardTitle>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentGames.map((game, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant={game.result === 'W' ? 'default' : 'destructive'}>
                        {game.result}
                      </Badge>
                      <div>
                        <p className="font-medium">vs {game.opponent}</p>
                        <p className="text-sm text-gray-500">{game.round} • {game.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{game.score}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Top Players Widget */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Top Players Widget</h2>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Star className="h-5 w-5" />
                <span>Top Performers</span>
              </CardTitle>
              <Button size="sm" variant="outline">View All</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPlayers.map((player, index) => (
                  <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {player.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium">{player.name}</p>
                        <p className="text-sm text-gray-500">{player.position}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-bold">{player.rating}</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {player.goals && `${player.goals} goals`}
                        {player.assists && `${player.assists} assists`}
                        {player.intercepts && `${player.intercepts} intercepts`}
                        {player.feeds && `${player.feeds} feeds`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Upcoming Games Widget */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Upcoming Games Widget</h2>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Upcoming Games</span>
              </CardTitle>
              <Button size="sm" variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Manage
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingGames.map((game, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="font-bold text-lg">{game.date.split(' ')[1]}</p>
                        <p className="text-sm text-gray-500">{game.date.split(' ')[0]}</p>
                      </div>
                      <div>
                        <p className="font-medium">vs {game.opponent}</p>
                        <p className="text-sm text-gray-500">{game.time} • {game.venue}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm">
                        <Edit classroom="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Quick Actions Widget */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Quick Actions Widget</h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex-col space-y-2">
                  <Users className="h-6 w-6" />
                  <span className="text-sm">Roster</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col space-y-2">
                  <BarChart3 className="h-6 w-6" />
                  <span className="text-sm">Stats</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col space-y-2">
                  <Calendar className="h-6 w-6" />
                  <span className="text-sm">Schedule</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col space-y-2">
                  <Trophy className="h-6 w-6" />
                  <span className="text-sm">Reports</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Status Indicators */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Status Indicators</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="font-bold text-green-800">All Systems Good</p>
                    <p className="text-sm text-green-600">Team ready for next game</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="font-bold text-yellow-800">Attention Needed</p>
                    <p className="text-sm text-yellow-600">2 players unavailable</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <XCircle className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="font-bold text-red-800">Action Required</p>
                    <p className="text-sm text-red-600">Roster incomplete</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Color Scheme Guidelines */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Color Scheme Guidelines</h2>
          <Card>
            <CardHeader>
              <CardTitle>Recommended Widget Colors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Primary Colors</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-blue-500 rounded"></div>
                      <span className="text-sm">Blue (#3B82F6) - General metrics</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-500 rounded"></div>
                      <span className="text-sm">Green (#10B981) - Success/Wins</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-red-500 rounded"></div>
                      <span className="text-sm">Red (#EF4444) - Losses/Alerts</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-yellow-500 rounded"></div>
                      <span className="text-sm">Yellow (#F59E0B) - Warnings</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Accent Colors</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-purple-500 rounded"></div>
                      <span className="text-sm">Purple (#8B5CF6) - Players</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-orange-500 rounded"></div>
                      <span className="text-sm">Orange (#F97316) - Upcoming</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-gray-500 rounded"></div>
                      <span className="text-sm">Gray (#6B7280) - Neutral</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Widget Backgrounds */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Widget Background Options</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Standard White</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Default clean background for most widgets</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle>Light Gray</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Subtle background for secondary information</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
              <CardHeader>
                <CardTitle>Gradient Accent</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Eye-catching background for key metrics</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </PageTemplate>
  );
}
