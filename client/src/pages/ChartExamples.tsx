
import React from 'react';
import { Helmet } from 'react-helmet';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, TrendingDown, Minus, BarChart3, 
  PieChart, Activity, Target, Award, Users
} from 'lucide-react';

export default function ChartExamples() {
  const performanceData = [
    { quarter: 'Q1', score: 8, opponent: 6, result: 'win' },
    { quarter: 'Q2', score: 6, opponent: 9, result: 'loss' },
    { quarter: 'Q3', score: 12, opponent: 8, result: 'win' },
    { quarter: 'Q4', score: 10, opponent: 7, result: 'win' }
  ];

  const playerStats = [
    { name: 'Sarah J', goals: 32, accuracy: 85, games: 12 },
    { name: 'Emma W', goals: 28, accuracy: 92, games: 11 },
    { name: 'Kate B', goals: 24, accuracy: 78, games: 12 },
    { name: 'Lily C', goals: 18, accuracy: 88, games: 10 }
  ];

  const winLossData = [
    { month: 'Jan', wins: 4, losses: 1, draws: 0 },
    { month: 'Feb', wins: 3, losses: 2, draws: 1 },
    { month: 'Mar', wins: 5, losses: 0, draws: 0 },
    { month: 'Apr', wins: 2, losses: 2, draws: 1 },
    { month: 'May', wins: 4, losses: 1, draws: 0 }
  ];

  return (
    <PageTemplate 
      title="Chart Examples" 
      breadcrumbs={[
        { label: "Component Examples", href: "/component-examples" },
        { label: "Chart Examples" }
      ]}
    >
      <div className="space-y-8">
        <div className="prose max-w-none">
          <p className="text-lg text-gray-700">
            Chart patterns, stat displays, and performance visualization components for data representation.
          </p>
        </div>

        {/* Performance Metrics */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Performance Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-green-900">78%</div>
                    <div className="text-sm text-green-700">Win Rate</div>
                  </div>
                  <div className="p-3 bg-green-200 rounded-full">
                    <TrendingUp className="h-6 w-6 text-green-700" />
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={78} className="h-2" />
                </div>
                <div className="mt-2 text-xs text-green-600">
                  +5% from last season
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-blue-900">24.5</div>
                    <div className="text-sm text-blue-700">Avg Score</div>
                  </div>
                  <div className="p-3 bg-blue-200 rounded-full">
                    <Target className="h-6 w-6 text-blue-700" />
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={65} className="h-2" />
                </div>
                <div className="mt-2 text-xs text-blue-600">
                  Season average
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-purple-900">92%</div>
                    <div className="text-sm text-purple-700">Attendance</div>
                  </div>
                  <div className="p-3 bg-purple-200 rounded-full">
                    <Users className="h-6 w-6 text-purple-700" />
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={92} className="h-2" />
                </div>
                <div className="mt-2 text-xs text-purple-600">
                  Excellent turnout
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-orange-900">8.5</div>
                    <div className="text-sm text-orange-700">Team Rating</div>
                  </div>
                  <div className="p-3 bg-orange-200 rounded-full">
                    <Award className="h-6 w-6 text-orange-700" />
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={85} className="h-2" />
                </div>
                <div className="mt-2 text-xs text-orange-600">
                  Above average
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Quarter Performance Chart */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Quarter-by-Quarter Performance</h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Latest Game Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceData.map((quarter, index) => (
                  <div key={quarter.quarter} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="font-medium text-sm w-8">{quarter.quarter}</span>
                        <Badge 
                          variant={quarter.result === 'win' ? 'default' : quarter.result === 'loss' ? 'destructive' : 'secondary'}
                          className="w-16 justify-center"
                        >
                          {quarter.result === 'win' ? 'Won' : quarter.result === 'loss' ? 'Lost' : 'Draw'}
                        </Badge>
                      </div>
                      <div className="text-sm font-medium">
                        {quarter.score} - {quarter.opponent}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 h-8">
                      <div className="flex-1 relative">
                        <div 
                          className="h-full bg-blue-500 rounded-l flex items-center justify-center text-white text-xs font-medium"
                          style={{ width: `${(quarter.score / (quarter.score + quarter.opponent)) * 100}%` }}
                        >
                          {quarter.score > 5 ? quarter.score : ''}
                        </div>
                        {quarter.score <= 5 && (
                          <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs font-medium text-blue-600">
                            {quarter.score}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 relative">
                        <div 
                          className="h-full bg-red-500 rounded-r flex items-center justify-center text-white text-xs font-medium ml-auto"
                          style={{ width: `${(quarter.opponent / (quarter.score + quarter.opponent)) * 100}%` }}
                        >
                          {quarter.opponent > 5 ? quarter.opponent : ''}
                        </div>
                        {quarter.opponent <= 5 && (
                          <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs font-medium text-red-600">
                            {quarter.opponent}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>Our Team</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Opposition</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Player Statistics */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Player Performance Rankings</h2>
          <Card>
            <CardHeader>
              <CardTitle>Top Goal Scorers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {playerStats.map((player, index) => (
                  <div key={player.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{player.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {player.goals} goals in {player.games} games
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{player.accuracy}%</div>
                        <div className="text-sm text-muted-foreground">accuracy</div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Goals Progress</span>
                        <span>{player.goals}/40 target</span>
                      </div>
                      <Progress value={(player.goals / 40) * 100} className="h-2" />
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Accuracy</span>
                        <span>{player.accuracy}%</span>
                      </div>
                      <Progress value={player.accuracy} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Win/Loss Trend */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Season Trend Analysis</h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Monthly Win/Loss Record
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {winLossData.map(month => {
                  const total = month.wins + month.losses + month.draws;
                  const winPercentage = (month.wins / total) * 100;
                  const lossPercentage = (month.losses / total) * 100;
                  const drawPercentage = (month.draws / total) * 100;
                  
                  return (
                    <div key={month.month} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{month.month}</span>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-green-600">{month.wins}W</span>
                          <span className="text-red-600">{month.losses}L</span>
                          {month.draws > 0 && <span className="text-yellow-600">{month.draws}D</span>}
                          <span className="text-muted-foreground">
                            ({Math.round(winPercentage)}% win rate)
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex h-4 rounded-full overflow-hidden">
                        <div 
                          className="bg-green-500"
                          style={{ width: `${winPercentage}%` }}
                        />
                        <div 
                          className="bg-red-500"
                          style={{ width: `${lossPercentage}%` }}
                        />
                        {drawPercentage > 0 && (
                          <div 
                            className="bg-yellow-500"
                            style={{ width: `${drawPercentage}%` }}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6 flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Wins</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Losses</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span>Draws</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Chart Guidelines */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Data Visualization Guidelines</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <Card>
              <CardHeader>
                <CardTitle>Color Usage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-sm">Green: Wins, positive metrics, success</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-sm">Red: Losses, negative metrics, problems</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span className="text-sm">Blue: Team data, primary metrics</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span className="text-sm">Yellow: Draws, warnings, neutral outcomes</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-purple-500 rounded"></div>
                    <span className="text-sm">Purple: Special metrics, awards, highlights</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Best Practices</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• Use consistent color coding across all charts</li>
                  <li>• Include legends for multi-series data</li>
                  <li>• Show progress indicators for target-based metrics</li>
                  <li>• Provide context with comparison data (e.g., "vs last season")</li>
                  <li>• Use appropriate chart types for data relationships</li>
                  <li>• Keep charts simple and focused on key insights</li>
                  <li>• Include hover states and tooltips where helpful</li>
                  <li>• Ensure accessibility with good contrast ratios</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </PageTemplate>
  );
}
