
import React from 'react';
import { Helmet } from 'react-helmet';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  LineChart, 
  PieChart, 
  AreaChart,
  RadarChart,
  ScatterChart,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Trophy,
  Users,
  Calendar,
  Clock,
  Star,
  Zap,
  Shield,
  Award,
  Eye,
  Download
} from 'lucide-react';

export default function ChartExamples() {
  // Sample data for different chart types
  const quarterPerformanceData = [
    { quarter: 'Q1', goals: 8, turnovers: 3, intercepts: 2 },
    { quarter: 'Q2', goals: 12, turnovers: 2, intercepts: 4 },
    { quarter: 'Q3', goals: 10, turnovers: 4, intercepts: 3 },
    { quarter: 'Q4', goals: 15, turnovers: 1, intercepts: 5 }
  ];

  const seasonProgressData = [
    { game: 1, winRate: 100, goals: 28, turnovers: 8 },
    { game: 2, winRate: 50, goals: 32, turnovers: 6 },
    { game: 3, winRate: 67, goals: 35, turnovers: 5 },
    { game: 4, winRate: 75, goals: 29, turnovers: 7 },
    { game: 5, winRate: 80, goals: 38, turnovers: 4 },
    { game: 6, winRate: 83, goals: 42, turnovers: 3 },
    { game: 7, winRate: 86, goals: 36, turnovers: 5 },
    { game: 8, winRate: 75, goals: 24, turnovers: 9 }
  ];

  const positionDistributionData = [
    { position: 'GS', percentage: 18 },
    { position: 'GA', percentage: 16 },
    { position: 'WA', percentage: 15 },
    { position: 'C', percentage: 14 },
    { position: 'WD', percentage: 15 },
    { position: 'GD', percentage: 12 },
    { position: 'GK', percentage: 10 }
  ];

  const playerRatingsData = [
    { player: 'Sarah J', shooting: 85, passing: 90, defense: 70, movement: 88 },
    { player: 'Emma W', shooting: 75, passing: 95, defense: 80, movement: 85 },
    { player: 'Kate B', shooting: 40, passing: 70, defense: 95, movement: 75 },
    { player: 'Lily C', shooting: 65, passing: 88, defense: 75, movement: 92 }
  ];

  const opponentAnalysisData = [
    { opponent: 'Eagles', homeWins: 2, awayWins: 1, avgScore: 32 },
    { opponent: 'Tigers', homeWins: 1, awayWins: 0, avgScore: 28 },
    { opponent: 'Panthers', homeWins: 0, awayWins: 1, avgScore: 35 },
    { opponent: 'Wolves', homeWins: 2, awayWins: 2, avgScore: 30 }
  ];

  const timeOfDayPerformance = [
    { time: '9:00 AM', performance: 72, games: 3 },
    { time: '11:00 AM', performance: 85, games: 5 },
    { time: '1:00 PM', performance: 78, games: 4 },
    { time: '3:00 PM', performance: 92, games: 6 },
    { time: '5:00 PM', performance: 68, games: 2 }
  ];

  const monthlyTrendsData = [
    { month: 'Jan', goals: 180, assists: 95, intercepts: 45 },
    { month: 'Feb', goals: 220, assists: 110, intercepts: 52 },
    { month: 'Mar', goals: 195, assists: 88, intercepts: 38 },
    { month: 'Apr', goals: 240, assists: 125, intercepts: 58 },
    { month: 'May', goals: 210, assists: 102, intercepts: 48 },
    { month: 'Jun', goals: 265, assists: 140, intercepts: 62 }
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
        <Helmet>
          <title>Chart Examples - Netball App</title>
        </Helmet>

        <div className="prose max-w-none">
          <p className="text-lg text-gray-700">
            Comprehensive data visualization examples using various chart types for netball statistics and analytics.
          </p>
        </div>

        {/* Bar Charts */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Bar Charts</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Quarter Performance */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <BarChart className="h-5 w-5" />
                  <span>Quarter Performance</span>
                </CardTitle>
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {quarterPerformanceData.map((quarter, index) => (
                    <div key={quarter.quarter} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{quarter.quarter}</span>
                        <span>{quarter.goals} goals</span>
                      </div>
                      <div className="flex space-x-1">
                        <div 
                          className="bg-blue-500 h-6 rounded-l" 
                          style={{ width: `${(quarter.goals / 15) * 100}%` }}
                        ></div>
                        <div 
                          className="bg-red-500 h-6" 
                          style={{ width: `${(quarter.turnovers / 15) * 50}%` }}
                        ></div>
                        <div 
                          className="bg-green-500 h-6 rounded-r" 
                          style={{ width: `${(quarter.intercepts / 15) * 50}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{quarter.turnovers} turnovers</span>
                        <span>{quarter.intercepts} intercepts</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex space-x-4 text-xs">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span>Goals</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span>Turnovers</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Intercepts</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Position Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Position Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {positionDistributionData.map((pos, index) => (
                    <div key={pos.position} className="flex items-center space-x-3">
                      <span className="w-8 text-sm font-medium">{pos.position}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full"
                          style={{ width: `${pos.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold">{pos.percentage}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Line Charts */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Line Charts</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Season Progress */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <LineChart className="h-5 w-5" />
                  <span>Season Progress</span>
                </CardTitle>
                <div className="flex space-x-2">
                  <Badge variant="outline">8 Games</Badge>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-48 relative">
                  <svg className="w-full h-full" viewBox="0 0 400 200">
                    {/* Grid lines */}
                    {[0, 25, 50, 75, 100].map(y => (
                      <line key={y} x1="40" y1={160 - (y * 1.2)} x2="380" y2={160 - (y * 1.2)} 
                            stroke="#e5e7eb" strokeWidth="1" />
                    ))}
                    
                    {/* Win Rate Line */}
                    <polyline
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="3"
                      points={seasonProgressData.map((d, i) => 
                        `${60 + (i * 40)},${160 - (d.winRate * 1.2)}`
                      ).join(' ')}
                    />
                    
                    {/* Data points */}
                    {seasonProgressData.map((d, i) => (
                      <circle
                        key={i}
                        cx={60 + (i * 40)}
                        cy={160 - (d.winRate * 1.2)}
                        r="4"
                        fill="#3b82f6"
                      />
                    ))}
                    
                    {/* Y-axis labels */}
                    {[0, 25, 50, 75, 100].map(y => (
                      <text key={y} x="35" y={165 - (y * 1.2)} fontSize="10" fill="#6b7280" textAnchor="end">
                        {y}%
                      </text>
                    ))}
                    
                    {/* X-axis labels */}
                    {seasonProgressData.map((d, i) => (
                      <text key={i} x={60 + (i * 40)} y="180" fontSize="10" fill="#6b7280" textAnchor="middle">
                        G{d.game}
                      </text>
                    ))}
                  </svg>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">75%</div>
                    <div className="text-sm text-gray-500">Current Win Rate</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      <TrendingUp className="h-5 w-5 inline mr-1" />
                      +5%
                    </div>
                    <div className="text-sm text-gray-500">vs Last Month</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">8</div>
                    <div className="text-sm text-gray-500">Games Played</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Time of Day Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Performance by Time</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 relative">
                  <svg className="w-full h-full" viewBox="0 0 400 200">
                    {/* Area fill */}
                    <path
                      d={`M 60,${160 - (timeOfDayPerformance[0].performance * 1.2)} ${timeOfDayPerformance.map((d, i) => 
                        `L ${80 + (i * 60)},${160 - (d.performance * 1.2)}`
                      ).join(' ')} L 320,160 L 60,160 Z`}
                      fill="rgba(59, 130, 246, 0.2)"
                    />
                    
                    {/* Performance line */}
                    <polyline
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="3"
                      points={timeOfDayPerformance.map((d, i) => 
                        `${80 + (i * 60)},${160 - (d.performance * 1.2)}`
                      ).join(' ')}
                    />
                    
                    {/* Data points with game count */}
                    {timeOfDayPerformance.map((d, i) => (
                      <g key={i}>
                        <circle
                          cx={80 + (i * 60)}
                          cy={160 - (d.performance * 1.2)}
                          r="5"
                          fill="#3b82f6"
                        />
                        <text
                          x={80 + (i * 60)}
                          y={160 - (d.performance * 1.2) - 15}
                          fontSize="10"
                          fill="#374151"
                          textAnchor="middle"
                        >
                          {d.games}
                        </text>
                      </g>
                    ))}
                    
                    {/* X-axis labels */}
                    {timeOfDayPerformance.map((d, i) => (
                      <text key={i} x={80 + (i * 60)} y="180" fontSize="9" fill="#6b7280" textAnchor="middle">
                        {d.time}
                      </text>
                    ))}
                  </svg>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  Numbers above points indicate games played at each time slot
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Radar/Spider Charts */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Radar Charts</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Player Skills Radar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5" />
                  <span>Player Skills Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {playerRatingsData.map((player, index) => (
                    <div key={player.player} className="text-center">
                      <h4 className="font-medium mb-2">{player.player}</h4>
                      <div className="relative w-24 h-24 mx-auto">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          {/* Background circles */}
                          <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="1" />
                          <circle cx="50" cy="50" r="30" fill="none" stroke="#e5e7eb" strokeWidth="1" />
                          <circle cx="50" cy="50" r="20" fill="none" stroke="#e5e7eb" strokeWidth="1" />
                          <circle cx="50" cy="50" r="10" fill="none" stroke="#e5e7eb" strokeWidth="1" />
                          
                          {/* Axes */}
                          <line x1="50" y1="10" x2="50" y2="90" stroke="#e5e7eb" strokeWidth="1" />
                          <line x1="10" y1="50" x2="90" y2="50" stroke="#e5e7eb" strokeWidth="1" />
                          
                          {/* Data polygon */}
                          <polygon
                            points={`50,${50 - (player.shooting * 0.4)} ${50 + (player.passing * 0.4)},50 50,${50 + (player.defense * 0.4)} ${50 - (player.movement * 0.4)},50`}
                            fill={`rgba(${index * 60 + 59}, 130, 246, 0.3)`}
                            stroke={`rgb(${index * 60 + 59}, 130, 246)`}
                            strokeWidth="2"
                          />
                        </svg>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-xs mt-2">
                        <div>Shoot: {player.shooting}</div>
                        <div>Pass: {player.passing}</div>
                        <div>Def: {player.defense}</div>
                        <div>Move: {player.movement}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Team Comparison Radar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Team vs League Average</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative w-48 h-48 mx-auto">
                  <svg className="w-full h-full" viewBox="0 0 200 200">
                    {/* Background grid */}
                    {[20, 40, 60, 80].map(r => (
                      <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="#e5e7eb" strokeWidth="1" />
                    ))}
                    
                    {/* Axes for 6 metrics */}
                    {[0, 1, 2, 3, 4, 5].map(i => {
                      const angle = (i * 60 - 90) * (Math.PI / 180);
                      const x2 = 100 + 80 * Math.cos(angle);
                      const y2 = 100 + 80 * Math.sin(angle);
                      return (
                        <line key={i} x1="100" y1="100" x2={x2} y2={y2} stroke="#e5e7eb" strokeWidth="1" />
                      );
                    })}
                    
                    {/* Team data (our team) */}
                    <polygon
                      points="100,40 140,70 130,140 100,160 70,140 60,70"
                      fill="rgba(59, 130, 246, 0.3)"
                      stroke="#3b82f6"
                      strokeWidth="3"
                    />
                    
                    {/* League average */}
                    <polygon
                      points="100,50 130,80 120,130 100,150 80,130 70,80"
                      fill="rgba(156, 163, 175, 0.2)"
                      stroke="#9ca3af"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                    />
                    
                    {/* Labels */}
                    <text x="100" y="30" fontSize="12" fill="#374151" textAnchor="middle">Goals</text>
                    <text x="150" y="75" fontSize="12" fill="#374151" textAnchor="start">Assists</text>
                    <text x="140" y="150" fontSize="12" fill="#374151" textAnchor="start">Defense</text>
                    <text x="100" y="175" fontSize="12" fill="#374151" textAnchor="middle">Turnovers</text>
                    <text x="60" y="150" fontSize="12" fill="#374151" textAnchor="end">Intercepts</text>
                    <text x="50" y="75" fontSize="12" fill="#374151" textAnchor="end">Rebound</text>
                  </svg>
                </div>
                <div className="mt-4 flex justify-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span>Our Team</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-gray-400 border-dashed rounded"></div>
                    <span>League Avg</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Pie Charts */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Pie Charts</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Game Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5" />
                  <span>Season Results</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative w-32 h-32 mx-auto">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    {/* Wins - 60% */}
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="20" 
                            strokeDasharray="150.8 251.2" transform="rotate(-90 50 50)" />
                    {/* Losses - 30% */}
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#ef4444" strokeWidth="20" 
                            strokeDasharray="75.4 326.6" strokeDashoffset="-150.8" transform="rotate(-90 50 50)" />
                    {/* Draws - 10% */}
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" strokeWidth="20" 
                            strokeDasharray="25.1 376.9" strokeDashoffset="-226.2" transform="rotate(-90 50 50)" />
                  </svg>
                </div>
                <div className="space-y-2 mt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Wins</span>
                    </div>
                    <span className="font-bold">60%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm">Losses</span>
                    </div>
                    <span className="font-bold">30%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                      <span className="text-sm">Draws</span>
                    </div>
                    <span className="font-bold">10%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Playing Time Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Playing Time</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative w-32 h-32 mx-auto">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    {/* Starters - 70% */}
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="20" 
                            strokeDasharray="175.9 251.3" transform="rotate(-90 50 50)" />
                    {/* Reserves - 20% */}
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#8b5cf6" strokeWidth="20" 
                            strokeDasharray="50.3 377" strokeDashoffset="-175.9" transform="rotate(-90 50 50)" />
                    {/* Bench - 10% */}
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#6b7280" strokeWidth="20" 
                            strokeDasharray="25.1 376.9" strokeDashoffset="-226.2" transform="rotate(-90 50 50)" />
                  </svg>
                </div>
                <div className="space-y-2 mt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Starters</span>
                    </div>
                    <span className="font-bold">70%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm">Reserves</span>
                    </div>
                    <span className="font-bold">20%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                      <span className="text-sm">Bench</span>
                    </div>
                    <span className="font-bold">10%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Court Zones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Goal Zones</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative w-32 h-32 mx-auto">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    {/* Close Range - 45% */}
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="20" 
                            strokeDasharray="113.1 288.1" transform="rotate(-90 50 50)" />
                    {/* Mid Range - 35% */}
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" strokeWidth="20" 
                            strokeDasharray="87.9 313.3" strokeDashoffset="-113.1" transform="rotate(-90 50 50)" />
                    {/* Long Range - 20% */}
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#ef4444" strokeWidth="20" 
                            strokeDasharray="50.3 351" strokeDashoffset="-201" transform="rotate(-90 50 50)" />
                  </svg>
                </div>
                <div className="space-y-2 mt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Close</span>
                    </div>
                    <span className="font-bold">45%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                      <span className="text-sm">Mid</span>
                    </div>
                    <span className="font-bold">35%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm">Long</span>
                    </div>
                    <span className="font-bold">20%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Scatter Plots */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Scatter Plots</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Goals vs Game Time */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ScatterChart className="h-5 w-5" />
                  <span>Goals vs Playing Time</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 relative">
                  <svg className="w-full h-full" viewBox="0 0 400 200">
                    {/* Grid */}
                    {[0, 25, 50, 75, 100].map(x => (
                      <line key={x} x1={40 + (x * 3.2)} y1="20" x2={40 + (x * 3.2)} y2="160" 
                            stroke="#e5e7eb" strokeWidth="1" />
                    ))}
                    {[0, 5, 10, 15, 20].map(y => (
                      <line key={y} x1="40" y1={160 - (y * 7)} x2="360" y2={160 - (y * 7)} 
                            stroke="#e5e7eb" strokeWidth="1" />
                    ))}
                    
                    {/* Data points */}
                    {[
                      {time: 85, goals: 18, player: 'Sarah'}, {time: 70, goals: 12, player: 'Emma'},
                      {time: 60, goals: 8, player: 'Kate'}, {time: 90, goals: 20, player: 'Lily'},
                      {time: 45, goals: 6, player: 'Amy'}, {time: 75, goals: 14, player: 'Jane'},
                      {time: 55, goals: 7, player: 'Beth'}, {time: 80, goals: 16, player: 'Zoe'}
                    ].map((point, i) => (
                      <circle
                        key={i}
                        cx={40 + (point.time * 3.2)}
                        cy={160 - (point.goals * 7)}
                        r="5"
                        fill="#3b82f6"
                        opacity="0.7"
                      />
                    ))}
                    
                    {/* Trend line */}
                    <line x1="40" y1="150" x2="320" y2="30" stroke="#ef4444" strokeWidth="2" strokeDasharray="5,5" />
                    
                    {/* Axes labels */}
                    <text x="200" y="190" fontSize="12" fill="#6b7280" textAnchor="middle">Playing Time (%)</text>
                    <text x="15" y="90" fontSize="12" fill="#6b7280" textAnchor="middle" transform="rotate(-90 15 90)">Goals</text>
                  </svg>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  Strong positive correlation (r = 0.89) between playing time and goals scored
                </div>
              </CardContent>
            </Card>

            {/* Accuracy vs Pressure */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Shooting Under Pressure</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 relative">
                  <svg className="w-full h-full" viewBox="0 0 400 200">
                    {/* Quadrant backgrounds */}
                    <rect x="40" y="20" width="160" height="70" fill="rgba(239, 68, 68, 0.1)" />
                    <rect x="200" y="20" width="160" height="70" fill="rgba(16, 185, 129, 0.1)" />
                    <rect x="40" y="90" width="160" height="70" fill="rgba(245, 158, 11, 0.1)" />
                    <rect x="200" y="90" width="160" height="70" fill="rgba(59, 130, 246, 0.1)" />
                    
                    {/* Data points with different sizes for shot volume */}
                    {[
                      {pressure: 85, accuracy: 75, shots: 45}, {pressure: 30, accuracy: 90, shots: 30},
                      {pressure: 60, accuracy: 80, shots: 35}, {pressure: 90, accuracy: 65, shots: 50},
                      {pressure: 40, accuracy: 85, shots: 25}, {pressure: 70, accuracy: 70, shots: 40},
                      {pressure: 20, accuracy: 95, shots: 20}, {pressure: 80, accuracy: 60, shots: 55}
                    ].map((point, i) => (
                      <circle
                        key={i}
                        cx={40 + (point.pressure * 3.2)}
                        cy={160 - (point.accuracy * 1.4)}
                        r={3 + (point.shots / 15)}
                        fill="#8b5cf6"
                        opacity="0.7"
                      />
                    ))}
                    
                    {/* Axes */}
                    <line x1="40" y1="160" x2="360" y2="160" stroke="#374151" strokeWidth="2" />
                    <line x1="40" y1="20" x2="40" y2="160" stroke="#374151" strokeWidth="2" />
                    
                    {/* Quadrant labels */}
                    <text x="120" y="40" fontSize="11" fill="#6b7280" textAnchor="middle">High Accuracy</text>
                    <text x="120" y="52" fontSize="11" fill="#6b7280" textAnchor="middle">Low Pressure</text>
                    
                    <text x="280" y="40" fontSize="11" fill="#6b7280" textAnchor="middle">High Accuracy</text>
                    <text x="280" y="52" fontSize="11" fill="#6b7280" textAnchor="middle">High Pressure</text>
                    
                    <text x="120" y="140" fontSize="11" fill="#6b7280" textAnchor="middle">Low Accuracy</text>
                    <text x="120" y="152" fontSize="11" fill="#6b7280" textAnchor="middle">Low Pressure</text>
                    
                    <text x="280" y="140" fontSize="11" fill="#6b7280" textAnchor="middle">Low Accuracy</text>
                    <text x="280" y="152" fontSize="11" fill="#6b7280" textAnchor="middle">High Pressure</text>
                  </svg>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  Circle size represents shot volume. Target: top-right quadrant (high accuracy under pressure)
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Stacked Area Charts */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Area Charts</h2>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <AreaChart className="h-5 w-5" />
                <span>Monthly Statistics Trends</span>
              </CardTitle>
              <div className="flex space-x-2">
                <Badge>6 Months</Badge>
                <Button size="sm" variant="outline">Export</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 relative">
                <svg className="w-full h-full" viewBox="0 0 600 250">
                  {/* Grid lines */}
                  {[0, 50, 100, 150, 200, 250].map(y => (
                    <line key={y} x1="60" y1={200 - (y * 0.6)} x2="540" y2={200 - (y * 0.6)} 
                          stroke="#e5e7eb" strokeWidth="1" />
                  ))}
                  
                  {/* Goals area */}
                  <path
                    d={`M 80,${200 - (monthlyTrendsData[0].goals * 0.6)} ${monthlyTrendsData.map((d, i) => 
                      `L ${100 + (i * 80)},${200 - (d.goals * 0.6)}`
                    ).join(' ')} L 500,200 L 80,200 Z`}
                    fill="rgba(59, 130, 246, 0.6)"
                  />
                  
                  {/* Assists area */}
                  <path
                    d={`M 80,${200 - ((monthlyTrendsData[0].goals + monthlyTrendsData[0].assists) * 0.6)} ${monthlyTrendsData.map((d, i) => 
                      `L ${100 + (i * 80)},${200 - ((d.goals + d.assists) * 0.6)}`
                    ).join(' ')} ${monthlyTrendsData.map((d, i) => 
                      `L ${500 - (i * 80)},${200 - (d.goals * 0.6)}`
                    ).reverse().join(' ')} Z`}
                    fill="rgba(16, 185, 129, 0.6)"
                  />
                  
                  {/* Intercepts area */}
                  <path
                    d={`M 80,${200 - ((monthlyTrendsData[0].goals + monthlyTrendsData[0].assists + monthlyTrendsData[0].intercepts) * 0.6)} ${monthlyTrendsData.map((d, i) => 
                      `L ${100 + (i * 80)},${200 - ((d.goals + d.assists + d.intercepts) * 0.6)}`
                    ).join(' ')} ${monthlyTrendsData.map((d, i) => 
                      `L ${500 - (i * 80)},${200 - ((d.goals + d.assists) * 0.6)}`
                    ).reverse().join(' ')} Z`}
                    fill="rgba(245, 158, 11, 0.6)"
                  />
                  
                  {/* X-axis labels */}
                  {monthlyTrendsData.map((d, i) => (
                    <text key={i} x={100 + (i * 80)} y="220" fontSize="12" fill="#6b7280" textAnchor="middle">
                      {d.month}
                    </text>
                  ))}
                  
                  {/* Y-axis labels */}
                  {[0, 100, 200, 300].map(y => (
                    <text key={y} x="50" y={205 - (y * 0.6)} fontSize="10" fill="#6b7280" textAnchor="end">
                      {y}
                    </text>
                  ))}
                </svg>
              </div>
              <div className="mt-6 flex justify-center space-x-8">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-sm">Goals</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm">Assists</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-amber-500 rounded"></div>
                  <span className="text-sm">Intercepts</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Heatmaps */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Heatmaps</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Position Performance Heatmap */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Position Performance Matrix</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'].map((position, posIndex) => (
                    <div key={position} className="flex items-center space-x-2">
                      <span className="w-8 text-sm font-medium">{position}</span>
                      <div className="flex space-x-1">
                        {['Goals', 'Assists', 'Defense', 'Accuracy', 'Movement'].map((metric, metricIndex) => {
                          const intensity = Math.random() * 100;
                          const color = intensity > 75 ? 'bg-green-500' : 
                                      intensity > 50 ? 'bg-yellow-500' : 
                                      intensity > 25 ? 'bg-orange-500' : 'bg-red-500';
                          return (
                            <div key={metric} className={`w-8 h-6 ${color} rounded text-xs text-white flex items-center justify-center`}>
                              {Math.round(intensity)}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center space-x-2 mt-4">
                    <span className="w-8"></span>
                    {['Goals', 'Assists', 'Defense', 'Accuracy', 'Movement'].map(metric => (
                      <span key={metric} className="w-8 text-xs text-center">{metric.slice(0,4)}</span>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span>0</span>
                  <div className="flex space-x-1">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <div className="w-4 h-4 bg-orange-500 rounded"></div>
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                  </div>
                  <span>100</span>
                </div>
              </CardContent>
            </Card>

            {/* Game Time Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Weekly Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, dayIndex) => (
                    <div key={day} className="flex items-center space-x-1">
                      <span className="w-8 text-xs">{day}</span>
                      {Array.from({length: 12}, (_, hourIndex) => {
                        const games = Math.random() > 0.7 ? Math.floor(Math.random() * 5) : 0;
                        const color = games > 3 ? 'bg-green-500' : 
                                    games > 1 ? 'bg-blue-500' : 
                                    games > 0 ? 'bg-yellow-500' : 'bg-gray-200';
                        return (
                          <div key={hourIndex} className={`w-6 h-4 ${color} rounded-sm`} title={`${games} games`}></div>
                        );
                      })}
                    </div>
                  ))}
                  <div className="flex items-center space-x-1 mt-2">
                    <span className="w-8 text-xs"></span>
                    {Array.from({length: 12}, (_, i) => (
                      <span key={i} className="w-6 text-xs text-center">{i + 8}</span>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span>0 games</span>
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-gray-200 rounded"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                  </div>
                  <span>4+ games</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Circular Progress Charts */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Circular Progress Charts</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Win Rate Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5" />
                  <span>Win Rate Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <div className="relative w-32 h-32">
                    <svg width="128" height="128" className="transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#22c55e"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${(78 / 100) * 352} 352`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">78%</div>
                        <div className="text-xs text-gray-500">Win Rate</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <div className="text-sm text-gray-600">7 wins, 2 losses, 1 draw</div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Rating */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5" />
                  <span>Performance Rating</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <div className="relative w-32 h-32">
                    <svg width="128" height="128" className="transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#3b82f6"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${(85 / 100) * 352} 352`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">85</div>
                        <div className="text-xs text-gray-500">Rating</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <div className="text-sm text-gray-600">Season Average</div>
                </div>
              </CardContent>
            </Card>

            {/* Goal Efficiency */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Goal Efficiency</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <div className="relative w-32 h-32">
                    <svg width="128" height="128" className="transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#f59e0b"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${(92 / 100) * 352} 352`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-amber-600">92%</div>
                        <div className="text-xs text-gray-500">Efficiency</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <div className="text-sm text-gray-600">Goals/Attempts</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Horizontal Bar Progress Charts */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Horizontal Progress Bars</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Goals Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Goals Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 min-w-[80px]">Goals For</span>
                    <div className="flex-1 mx-3">
                      <div className="bg-gray-200 rounded-full h-4 relative overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full transition-all duration-1000"
                          style={{ width: '75%' }}
                        />
                      </div>
                    </div>
                    <span className="text-lg font-bold text-green-600 min-w-[40px] text-right">
                      15.2
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 min-w-[80px]">Goals Against</span>
                    <div className="flex-1 mx-3">
                      <div className="bg-gray-200 rounded-full h-4 relative overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-red-400 to-red-600 h-full rounded-full transition-all duration-1000"
                          style={{ width: '60%' }}
                        />
                      </div>
                    </div>
                    <span className="text-lg font-bold text-red-600 min-w-[40px] text-right">
                      12.1
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <span className="text-sm text-gray-600">Goal Ratio</span>
                    <span className="text-lg font-bold text-blue-600">
                      126%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Season Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Season Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Games Played</span>
                    <span>10 / 14</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-6">
                    <div 
                      className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-3"
                      style={{ width: '71%' }}
                    >
                      <span className="text-sm text-white font-bold">
                        71%
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div>
                      <div className="font-bold text-green-600">7</div>
                      <div className="text-gray-500">Wins</div>
                    </div>
                    <div>
                      <div className="font-bold text-red-600">2</div>
                      <div className="text-gray-500">Losses</div>
                    </div>
                    <div>
                      <div className="font-bold text-amber-600">1</div>
                      <div className="text-gray-500">Draws</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Mini Performance Radars */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Mini Performance Radars</h2>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {Array.from({length: 4}, (_, index) => {
              const playerNames = ['Sarah J', 'Emma W', 'Kate B', 'Lily C'];
              const playerColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
              return (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-center">{playerNames[index]}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-center">
                      <svg width="120" height="120" viewBox="0 0 120 120">
                        {/* Background grid */}
                        <circle cx="60" cy="60" r="45" stroke="#e5e7eb" strokeWidth="1" fill="none" />
                        <circle cx="60" cy="60" r="30" stroke="#e5e7eb" strokeWidth="1" fill="none" />
                        <circle cx="60" cy="60" r="15" stroke="#e5e7eb" strokeWidth="1" fill="none" />
                        
                        {/* Axes */}
                        <line x1="60" y1="15" x2="60" y2="105" stroke="#e5e7eb" strokeWidth="1" />
                        <line x1="15" y1="60" x2="105" y2="60" stroke="#e5e7eb" strokeWidth="1" />
                        
                        {/* Performance polygon */}
                        <polygon
                          points={`60,${30 + Math.random() * 20} ${75 + Math.random() * 15},60 60,${75 + Math.random() * 15} ${45 - Math.random() * 15},60`}
                          fill={`${playerColors[index]}40`}
                          stroke={playerColors[index]}
                          strokeWidth="2"
                        />
                        
                        {/* Labels */}
                        <text x="60" y="10" fontSize="10" fill="#6b7280" textAnchor="middle">Goals</text>
                        <text x="110" y="65" fontSize="10" fill="#6b7280" textAnchor="middle">Pass</text>
                        <text x="60" y="115" fontSize="10" fill="#6b7280" textAnchor="middle">Def</text>
                        <text x="10" y="65" fontSize="10" fill="#6b7280" textAnchor="middle">Move</text>
                      </svg>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Gradient Bar Charts */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Gradient Bar Charts</h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart className="h-5 w-5" />
                <span>Position Performance Distribution</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { position: 'GS', value: 88, games: 12 },
                  { position: 'GA', value: 76, games: 8 },
                  { position: 'WA', value: 82, games: 15 },
                  { position: 'C', value: 79, games: 10 },
                  { position: 'WD', value: 85, games: 14 },
                  { position: 'GD', value: 71, games: 6 },
                  { position: 'GK', value: 69, games: 5 }
                ].map((pos, index) => (
                  <div key={pos.position} className="flex items-center space-x-4">
                    <span className="w-8 text-sm font-medium">{pos.position}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-6">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-6 rounded-full flex items-center justify-between px-3"
                        style={{ width: `${pos.value}%` }}
                      >
                        <span className="text-white text-sm font-bold">{pos.value}%</span>
                        <span className="text-white text-xs">{pos.games}g</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Small Metric Displays */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Compact Metric Displays</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Goals Distribution Pie */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-center">Goals Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <svg width="80" height="80" viewBox="0 0 80 80">
                    {/* Team goals: 60% */}
                    <path d="M 40 40 L 40 10 A 30 30 0 1 1 65.98 55 Z" fill="#3b82f6" />
                    {/* Opponent goals: 40% */}
                    <path d="M 40 40 L 65.98 55 A 30 30 0 0 1 40 10 Z" fill="#ef4444" />
                    <circle cx="40" cy="40" r="12" fill="white" />
                    <text x="40" y="45" textAnchor="middle" className="text-sm font-bold fill-current">
                      60%
                    </text>
                  </svg>
                </div>
                <div className="flex justify-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span className="text-xs text-gray-600">For</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span className="text-xs text-gray-600">Against</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Heatmap */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-center">Performance Matrix</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-1">
                  {['Win%', 'Goals', 'Def'].map((metric, index) => {
                    const values = [78, 85, 71];
                    const colors = ['bg-green-500', 'bg-blue-500', 'bg-amber-500'];
                    return (
                      <div key={index} className="text-center">
                        <div 
                          className={`w-12 h-12 ${colors[index]} rounded flex items-center justify-center text-white text-xs font-bold mx-auto`}
                        >
                          {values[index]}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{metric}</div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Trend Indicators */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-center">Recent Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: 'Goals', value: '+5%', trend: 'up' },
                    { label: 'Defense', value: '+12%', trend: 'up' },
                    { label: 'Turnovers', value: '-8%', trend: 'down' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{item.label}</span>
                      <div className={`flex items-center space-x-1 ${item.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {item.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        <span className="text-sm font-bold">{item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Interactive Chart Guidelines */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Chart Implementation Guidelines</h2>
          <Card>
            <CardHeader>
              <CardTitle>Best Practices for Netball Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Color Conventions</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span>Positive metrics (goals, wins, improvements)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <span>Negative metrics (turnovers, losses, penalties)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span>Neutral metrics (time, positions, general stats)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-amber-500 rounded"></div>
                      <span>Warning metrics (close games, draws, attention needed)</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Chart Selection Guide</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Bar Charts:</strong> Comparing categories (positions, players, teams)</div>
                    <div><strong>Line Charts:</strong> Trends over time (performance, scores, win rates)</div>
                    <div><strong>Pie Charts:</strong> Parts of a whole (results, time distribution)</div>
                    <div><strong>Radar Charts:</strong> Multi-dimensional comparison (player skills)</div>
                    <div><strong>Scatter Plots:</strong> Correlations (time vs performance)</div>
                    <div><strong>Area Charts:</strong> Cumulative data (statistics over seasons)</div>
                    <div><strong>Heatmaps:</strong> Pattern identification (performance matrices)</div>
                    <div><strong>Progress Charts:</strong> Goal completion and performance tracking</div>
                    <div><strong>Gradient Bars:</strong> Visual emphasis on performance levels</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </PageTemplate>
  );
}
