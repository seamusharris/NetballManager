
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Activity,
  ArrowUp,
  ArrowDown,
  Minus,
  Zap,
  Shield,
  Sword,
  Award,
  Clock
} from 'lucide-react';

// Sample data - in real implementation, this would come from the game score service
const sampleTeamStats = {
  teamName: "WNC Emus",
  totalGames: 14,
  wins: 9,
  losses: 4,
  draws: 1,
  winRate: 64.3,
  
  // Score statistics
  totalGoalsFor: 168,
  totalGoalsAgainst: 142,
  averageGoalsFor: 12.0,
  averageGoalsAgainst: 10.1,
  goalDifferential: 26,
  goalRatio: 118.3,
  
  // Performance extremes
  highestScoreFor: 24,
  highestScoreAgainst: 18,
  lowestScoreFor: 6,
  lowestScoreAgainst: 4,
  
  // Quarter performance
  quarterPerformance: {
    q1: { for: 42, against: 35, avg: 3.0 },
    q2: { for: 45, against: 38, avg: 3.2 },
    q3: { for: 41, against: 34, avg: 2.9 },
    q4: { for: 40, against: 35, avg: 2.9 }
  },
  
  // Additional insights
  cleanSheets: 2, // Games where opponent scored < 5
  highScoringGames: 5, // Games where team scored > 15
  closeGames: 3, // Games decided by 3 or less
  bigWins: 4, // Games won by 10+
  recentForm: ['W', 'W', 'L', 'W', 'W'], // Last 5 games
  
  // Performance trends
  firstHalfAvg: 6.2,
  secondHalfAvg: 5.8,
  homeRecord: { wins: 5, losses: 1, draws: 0 },
  awayRecord: { wins: 4, losses: 3, draws: 1 }
};

const TeamPerformanceExamples = () => {
  const [selectedDesign, setSelectedDesign] = useState('compact');

  // Design 1: Compact Grid Layout
  const CompactDesign = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Compact Performance Overview</h2>
        <p className="text-gray-600">Dense, information-rich layout for quick scanning</p>
      </div>
      
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5 text-blue-600" />
            {sampleTeamStats.teamName} Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-4 gap-4 mb-4">
            {/* Win Rate Circle */}
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-2">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle cx="32" cy="32" r="28" stroke="#e5e7eb" strokeWidth="4" fill="none" />
                  <circle 
                    cx="32" cy="32" r="28" 
                    stroke="#3b82f6" 
                    strokeWidth="4" 
                    fill="none"
                    strokeDasharray={`${(sampleTeamStats.winRate / 100) * 176} 176`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">{sampleTeamStats.winRate}%</span>
                </div>
              </div>
              <p className="text-xs text-gray-600">Win Rate</p>
            </div>

            {/* Record */}
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {sampleTeamStats.wins}-{sampleTeamStats.losses}-{sampleTeamStats.draws}
              </div>
              <p className="text-xs text-gray-600">W-L-D</p>
            </div>

            {/* Goal Ratio */}
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {sampleTeamStats.goalRatio}%
              </div>
              <p className="text-xs text-gray-600">Goal Ratio</p>
            </div>

            {/* Goal Difference */}
            <div className="text-center">
              <div className={`text-2xl font-bold mb-1 ${sampleTeamStats.goalDifferential > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {sampleTeamStats.goalDifferential > 0 ? '+' : ''}{sampleTeamStats.goalDifferential}
              </div>
              <p className="text-xs text-gray-600">Goal Diff</p>
            </div>
          </div>

          {/* Detailed Stats Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-white p-3 rounded-lg border">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Avg Goals For</span>
                <span className="font-semibold text-green-600">{sampleTeamStats.averageGoalsFor}</span>
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Avg Goals Against</span>
                <span className="font-semibold text-red-600">{sampleTeamStats.averageGoalsAgainst}</span>
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Highest Score</span>
                <span className="font-semibold text-blue-600">{sampleTeamStats.highestScoreFor}</span>
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Most Conceded</span>
                <span className="font-semibold text-orange-600">{sampleTeamStats.highestScoreAgainst}</span>
              </div>
            </div>
          </div>

          {/* Recent Form */}
          <div className="mt-4 pt-3 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Recent Form</span>
              <div className="flex gap-1">
                {sampleTeamStats.recentForm.map((result, index) => (
                  <Badge 
                    key={index} 
                    variant={result === 'W' ? 'default' : result === 'L' ? 'destructive' : 'secondary'}
                    className="w-6 h-6 p-0 text-xs"
                  >
                    {result}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Design 2: Visual Dashboard Style
  const VisualDesign = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Visual Performance Dashboard</h2>
        <p className="text-gray-600">Rich visual elements with interactive components</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Overview */}
        <Card className="bg-gradient-to-br from-slate-50 to-blue-50 border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Win Rate with Progress Bar */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Win Rate</span>
                  <span className="text-sm font-bold text-blue-600">{sampleTeamStats.winRate}%</span>
                </div>
                <Progress value={sampleTeamStats.winRate} className="h-3" />
              </div>

              {/* Goals Comparison */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {sampleTeamStats.totalGoalsFor}
                  </div>
                  <div className="text-xs text-gray-600">Goals For</div>
                  <div className="text-sm text-green-600 mt-1">
                    Avg: {sampleTeamStats.averageGoalsFor}
                  </div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600 mb-1">
                    {sampleTeamStats.totalGoalsAgainst}
                  </div>
                  <div className="text-xs text-gray-600">Goals Against</div>
                  <div className="text-sm text-red-600 mt-1">
                    Avg: {sampleTeamStats.averageGoalsAgainst}
                  </div>
                </div>
              </div>

              {/* Performance Indicators */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-white rounded border">
                  <div className="text-lg font-bold text-green-600">{sampleTeamStats.bigWins}</div>
                  <div className="text-xs text-gray-600">Big Wins</div>
                </div>
                <div className="p-2 bg-white rounded border">
                  <div className="text-lg font-bold text-yellow-600">{sampleTeamStats.closeGames}</div>
                  <div className="text-xs text-gray-600">Close Games</div>
                </div>
                <div className="p-2 bg-white rounded border">
                  <div className="text-lg font-bold text-blue-600">{sampleTeamStats.cleanSheets}</div>
                  <div className="text-xs text-gray-600">Clean Sheets</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quarter Performance */}
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-600" />
              Quarter Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(sampleTeamStats.quarterPerformance).map(([quarter, data]) => (
                <div key={quarter} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-purple-600">{quarter.toUpperCase()}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span>For: {data.for}</span>
                      <span>Against: {data.against}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 h-2">
                      <div className="bg-green-200 rounded-full relative">
                        <div 
                          className="bg-green-500 h-full rounded-full"
                          style={{ width: `${(data.for / (data.for + data.against)) * 100}%` }}
                        />
                      </div>
                      <div className="bg-red-200 rounded-full relative">
                        <div 
                          className="bg-red-500 h-full rounded-full"
                          style={{ width: `${(data.against / (data.for + data.against)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-medium">
                    {data.for > data.against ? '+' : ''}{data.for - data.against}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Extremes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-orange-600" />
            Performance Extremes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-2">
                <ArrowUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Best Attack</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{sampleTeamStats.highestScoreFor}</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-2">
                <ArrowDown className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Worst Attack</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{sampleTeamStats.lowestScoreFor}</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-2">
                <ArrowUp className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Most Conceded</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">{sampleTeamStats.highestScoreAgainst}</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-2">
                <ArrowDown className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Best Defense</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">{sampleTeamStats.lowestScoreAgainst}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Design 3: Modern Card Layout
  const ModernDesign = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Modern Performance Cards</h2>
        <p className="text-gray-600">Clean, modern design with emphasis on key metrics</p>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Win Rate</p>
                <p className="text-3xl font-bold">{sampleTeamStats.winRate}%</p>
                <p className="text-blue-200 text-sm">
                  {sampleTeamStats.wins}W-{sampleTeamStats.losses}L-{sampleTeamStats.draws}D
                </p>
              </div>
              <Trophy className="h-12 w-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Goal Difference</p>
                <p className="text-3xl font-bold">+{sampleTeamStats.goalDifferential}</p>
                <p className="text-green-200 text-sm">
                  {sampleTeamStats.totalGoalsFor} for, {sampleTeamStats.totalGoalsAgainst} against
                </p>
              </div>
              <Target className="h-12 w-12 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Goal Ratio</p>
                <p className="text-3xl font-bold">{sampleTeamStats.goalRatio}%</p>
                <p className="text-purple-200 text-sm">
                  {sampleTeamStats.averageGoalsFor} avg for
                </p>
              </div>
              <Zap className="h-12 w-12 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sword className="h-5 w-5 text-red-600" />
              Attack Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Goals Scored</span>
                <span className="text-2xl font-bold text-green-600">{sampleTeamStats.averageGoalsFor}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Highest Score</span>
                <span className="text-xl font-semibold text-blue-600">{sampleTeamStats.highestScoreFor}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Lowest Score</span>
                <span className="text-xl font-semibold text-orange-600">{sampleTeamStats.lowestScoreFor}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">High-Scoring Games</span>
                <span className="text-xl font-semibold text-purple-600">{sampleTeamStats.highScoringGames}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">First Half Avg:</span>
                  <span className="font-semibold">{sampleTeamStats.firstHalfAvg}</span>
                  <span className="text-sm text-gray-600">Second Half:</span>
                  <span className="font-semibold">{sampleTeamStats.secondHalfAvg}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Defense Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Goals Conceded</span>
                <span className="text-2xl font-bold text-red-600">{sampleTeamStats.averageGoalsAgainst}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Most Conceded</span>
                <span className="text-xl font-semibold text-orange-600">{sampleTeamStats.highestScoreAgainst}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Best Defense</span>
                <span className="text-xl font-semibold text-green-600">{sampleTeamStats.lowestScoreAgainst}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Clean Sheets</span>
                <span className="text-xl font-semibold text-blue-600">{sampleTeamStats.cleanSheets}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Home:</span>
                    <span className="font-semibold ml-2">
                      {sampleTeamStats.homeRecord.wins}-{sampleTeamStats.homeRecord.losses}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Away:</span>
                    <span className="font-semibold ml-2">
                      {sampleTeamStats.awayRecord.wins}-{sampleTeamStats.awayRecord.losses}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form and Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Form & Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Recent Form (Last 5 Games)</h4>
              <div className="flex gap-2">
                {sampleTeamStats.recentForm.map((result, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <Badge 
                      variant={result === 'W' ? 'default' : result === 'L' ? 'destructive' : 'secondary'}
                      className="w-8 h-8 rounded-full p-0 text-sm"
                    >
                      {result}
                    </Badge>
                    <span className="text-xs text-gray-500 mt-1">{index + 1}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Key Insights</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-yellow-600" />
                  <span>{sampleTeamStats.bigWins} convincing wins (10+ goal margin)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-600" />
                  <span>{sampleTeamStats.closeGames} close games (≤3 goal margin)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>{sampleTeamStats.cleanSheets} games with strong defense (&lt;5 conceded)</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Team Performance Design Examples</h1>
        <p className="text-gray-600">
          Different approaches to displaying team performance statistics for the dashboard overview
        </p>
      </div>

      <Tabs value={selectedDesign} onValueChange={setSelectedDesign} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="compact">Compact Design</TabsTrigger>
          <TabsTrigger value="visual">Visual Dashboard</TabsTrigger>
          <TabsTrigger value="modern">Modern Cards</TabsTrigger>
        </TabsList>

        <TabsContent value="compact" className="mt-6">
          <CompactDesign />
        </TabsContent>

        <TabsContent value="visual" className="mt-6">
          <VisualDesign />
        </TabsContent>

        <TabsContent value="modern" className="mt-6">
          <ModernDesign />
        </TabsContent>
      </Tabs>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Implementation Notes:</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Data would come from the existing gameScoreService and unifiedStatsService</li>
          <li>• Uses quarter-by-quarter official scores when available, falls back to stats</li>
          <li>• All designs are responsive and follow the existing design system</li>
          <li>• Colors and styling match the current application theme</li>
          <li>• Performance metrics are calculated from completed games only</li>
        </ul>
      </div>
    </div>
  );
};

export default TeamPerformanceExamples;
