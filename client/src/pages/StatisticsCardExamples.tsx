
import React from 'react';
import { Helmet } from 'react-helmet';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Target, Award, BarChart3, Activity } from 'lucide-react';

export default function StatisticsCardExamples() {
  const playerStats = [
    { name: "Abbey N", goals: 28, accuracy: 85, games: 8, trend: "up" },
    { name: "Ava", intercepts: 15, passes: 142, accuracy: 78, trend: "up" },
    { name: "Emily", rebounds: 22, saves: 18, success: 88, trend: "down" },
    { name: "Evie", feeds: 95, assists: 34, conversion: 72, trend: "up" }
  ];

  const teamMetrics = [
    { label: "Win Rate", value: 75, color: "bg-green-500" },
    { label: "Goal Accuracy", value: 82, color: "bg-blue-500" },
    { label: "Turnovers", value: 45, color: "bg-yellow-500", inverse: true },
    { label: "Possession", value: 68, color: "bg-purple-500" }
  ];

  return (
    <PageTemplate
      title="Statistics Card Examples"
      subtitle="Various statistical display patterns and metric cards"
      breadcrumbs={[
        { label: 'Component Examples', href: '/component-examples' },
        { label: 'Statistics Cards' }
      ]}
    >
      <Helmet>
        <title>Statistics Card Examples | Team Manager</title>
      </Helmet>

      <div className="space-y-8">
        {/* Key Performance Indicators */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Key Performance Indicators</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Goals</p>
                    <p className="text-3xl font-bold">342</p>
                    <div className="flex items-center text-sm text-green-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      +12% from last month
                    </div>
                  </div>
                  <Target className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Win Rate</p>
                    <p className="text-3xl font-bold">75%</p>
                    <div className="flex items-center text-sm text-green-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      +5% improvement
                    </div>
                  </div>
                  <Award className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Score</p>
                    <p className="text-3xl font-bold">38.5</p>
                    <div className="flex items-center text-sm text-red-600">
                      <TrendingDown className="w-4 h-4 mr-1" />
                      -2.1 from target
                    </div>
                  </div>
                  <BarChart3 className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Team Rating</p>
                    <p className="text-3xl font-bold">8.2</p>
                    <div className="flex items-center text-sm text-green-600">
                      <Activity className="w-4 h-4 mr-1" />
                      Excellent form
                    </div>
                  </div>
                  <Award className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Player Performance Cards */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Player Performance Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {playerStats.map((player, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{player.name}</CardTitle>
                    <Badge variant={player.trend === 'up' ? 'default' : 'destructive'}>
                      {player.trend === 'up' ? 
                        <TrendingUp className="w-3 h-3 mr-1" /> : 
                        <TrendingDown className="w-3 h-3 mr-1" />
                      }
                      {player.trend === 'up' ? 'Improving' : 'Declining'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {player.goals && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Goals Scored</span>
                        <span className="font-bold text-lg">{player.goals}</span>
                      </div>
                    )}
                    {player.intercepts && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Intercepts</span>
                        <span className="font-bold text-lg">{player.intercepts}</span>
                      </div>
                    )}
                    {player.rebounds && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Rebounds</span>
                        <span className="font-bold text-lg">{player.rebounds}</span>
                      </div>
                    )}
                    {player.feeds && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Feeds</span>
                        <span className="font-bold text-lg">{player.feeds}</span>
                      </div>
                    )}
                    <div className="pt-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Accuracy</span>
                        <span>{player.accuracy}%</span>
                      </div>
                      <Progress value={player.accuracy} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Team Metrics Dashboard */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Team Metrics Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMetrics.map((metric, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">{metric.label}</span>
                      <span className="text-2xl font-bold">{metric.value}%</span>
                    </div>
                    <Progress 
                      value={metric.value} 
                      className={`h-3 ${metric.color}`}
                    />
                    <div className="text-xs text-gray-500">
                      {metric.inverse ? 'Lower is better' : 'Target: 80%+'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Comparison Cards */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Performance Comparison</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>This Season vs Last Season</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Goals per Game</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">38.5</span>
                      <span className="text-green-600">→</span>
                      <span className="font-bold">42.1</span>
                      <Badge variant="outline" className="text-green-600">+9%</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Turnovers</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">12.3</span>
                      <span className="text-red-600">→</span>
                      <span className="font-bold">8.7</span>
                      <Badge variant="outline" className="text-green-600">-29%</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Win Rate</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">62%</span>
                      <span className="text-green-600">→</span>
                      <span className="font-bold">75%</span>
                      <Badge variant="outline" className="text-green-600">+21%</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>League Position</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary">2nd</div>
                    <div className="text-sm text-gray-600">out of 8 teams</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Points</span>
                      <span className="font-medium">24</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Goal Difference</span>
                      <span className="font-medium text-green-600">+42</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Next Match</span>
                      <span className="font-medium">vs Deep Creek</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </PageTemplate>
  );
}
