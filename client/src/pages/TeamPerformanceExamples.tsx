
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

  // Design 4: Player Box Inspired Layout
  const PlayerBoxInspiredDesign = () => {
    // Additional sample teams for demonstration
    const sampleTeams = [
      {
        ...sampleTeamStats,
        teamName: "WNC Emus",
        teamCode: "WE",
        color: "blue"
      },
      {
        teamName: "Lightning Bolts",
        teamCode: "LB",
        color: "yellow",
        totalGames: 12,
        wins: 7,
        losses: 4,
        draws: 1,
        winRate: 58,
        goalRatio: 103,
        goalDifferential: 8,
        averageGoalsFor: 11,
        recentForm: ['L', 'W', 'W', 'L', 'W']
      },
      {
        teamName: "Thunder Hawks",
        teamCode: "TH",
        color: "purple",
        totalGames: 13,
        wins: 10,
        losses: 2,
        draws: 1,
        winRate: 77,
        goalRatio: 142,
        goalDifferential: 34,
        averageGoalsFor: 14,
        recentForm: ['W', 'W', 'W', 'D', 'W']
      },
      {
        teamName: "Storm Riders",
        teamCode: "SR",
        color: "green",
        totalGames: 11,
        wins: 4,
        losses: 6,
        draws: 1,
        winRate: 36,
        goalRatio: 87,
        goalDifferential: -15,
        averageGoalsFor: 9,
        recentForm: ['L', 'L', 'W', 'L', 'D']
      }
    ];

    const getTeamColorClasses = (color: string) => {
      switch (color) {
        case 'blue':
          return {
            gradient: 'from-blue-50 to-indigo-50',
            border: 'border-blue-200',
            avatar: 'from-blue-600 to-blue-700'
          };
        case 'yellow':
          return {
            gradient: 'from-yellow-50 to-orange-50',
            border: 'border-yellow-200',
            avatar: 'from-yellow-500 to-orange-500'
          };
        case 'purple':
          return {
            gradient: 'from-purple-50 to-pink-50',
            border: 'border-purple-200',
            avatar: 'from-purple-600 to-purple-700'
          };
        case 'green':
          return {
            gradient: 'from-green-50 to-emerald-50',
            border: 'border-green-200',
            avatar: 'from-green-600 to-green-700'
          };
        default:
          return {
            gradient: 'from-gray-50 to-slate-50',
            border: 'border-gray-200',
            avatar: 'from-gray-600 to-gray-700'
          };
      }
    };

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Player Box Inspired Layout</h2>
          <p className="text-gray-600">Taking design cues from player boxes with proper W/L/D circles and team listing</p>
        </div>

        <div className="space-y-4">
          {sampleTeams.map((team, index) => {
            const colorClasses = getTeamColorClasses(team.color);
            
            return (
              <Card key={index} className={`bg-gradient-to-r ${colorClasses.gradient} ${colorClasses.border}`}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    {/* Team Avatar/Logo Area */}
                    <div className="flex-shrink-0">
                      <div className={`w-16 h-16 bg-gradient-to-br ${colorClasses.avatar} rounded-full flex items-center justify-center border-4 border-white shadow-lg`}>
                        <span className="text-white font-bold text-lg">{team.teamCode}</span>
                      </div>
                    </div>

                    {/* Team Details */}
                    <div className="flex-1">
                      <div className="text-lg font-bold text-gray-800 mb-1">
                        {team.teamName}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-3">
                        <span>2024 Season</span>
                        <span className="mx-1">•</span>
                        
                        {/* W/L/D Circles */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">{Math.round(team.wins)}</span>
                            </div>
                            <span className="text-xs text-gray-500">W</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">{Math.round(team.losses)}</span>
                            </div>
                            <span className="text-xs text-gray-500">L</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">{Math.round(team.draws)}</span>
                            </div>
                            <span className="text-xs text-gray-500">D</span>
                          </div>
                        </div>
                        
                        <span className="mx-1">•</span>
                        <div className="flex gap-1">
                          {team.recentForm.map((result, formIndex) => (
                            <Badge 
                              key={formIndex} 
                              variant={result === 'W' ? 'win' : result === 'L' ? 'loss' : 'draw'}
                              className="w-5 h-5 p-0 text-xs"
                            >
                              {result}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid - Similar to player box stats */}
                    <div className="flex space-x-8">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{Math.round(team.winRate)}%</div>
                        <div className="text-xs text-gray-600">Win Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{Math.round(team.goalRatio)}%</div>
                        <div className="text-xs text-gray-600">Goal Ratio</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${team.goalDifferential >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {team.goalDifferential >= 0 ? '+' : ''}{Math.round(team.goalDifferential)}
                        </div>
                        <div className="text-xs text-gray-600">Goal Diff</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{Math.round(team.averageGoalsFor)}</div>
                        <div className="text-xs text-gray-600">Avg Goals</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  // Design 5: Game Result Card Style
  const GameResultCardStyle = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Game Result Card Style</h2>
        <p className="text-gray-600">Mimicking the game result card layout with left border and compact info</p>
      </div>

      <div className="border-l-4 border-green-500 bg-green-50 rounded transition-colors hover:bg-green-100 cursor-pointer">
        <div className="flex items-center justify-between p-4 space-x-4">
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-800 text-base mb-1">
              {sampleTeamStats.teamName} Season Performance
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{sampleTeamStats.totalGames} games</span>
              <span className="mx-1">•</span>
              <span>{sampleTeamStats.wins}W-{sampleTeamStats.losses}L-{sampleTeamStats.draws}D</span>
              <span className="mx-1">•</span>
              <span>Goals: {sampleTeamStats.totalGoalsFor}-{sampleTeamStats.totalGoalsAgainst}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{sampleTeamStats.winRate}%</div>
              <div className="text-xs text-gray-600">Win Rate</div>
            </div>
            <div className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded">
              +{sampleTeamStats.goalDifferential}
            </div>
          </div>
        </div>
      </div>

      {/* Additional performance cards */}
      <div className="space-y-2">
        <div className="border-l-4 border-blue-500 bg-blue-50 rounded p-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-800">Attack Performance</span>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Avg: {sampleTeamStats.averageGoalsFor}</span>
              <span className="text-sm text-gray-600">High: {sampleTeamStats.highestScoreFor}</span>
              <Badge variant="outline" className="text-blue-600 border-blue-600">{sampleTeamStats.highScoringGames} High</Badge>
            </div>
          </div>
        </div>

        <div className="border-l-4 border-red-500 bg-red-50 rounded p-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-800">Defense Performance</span>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Avg: {sampleTeamStats.averageGoalsAgainst}</span>
              <span className="text-sm text-gray-600">Best: {sampleTeamStats.lowestScoreAgainst}</span>
              <Badge variant="outline" className="text-red-600 border-red-600">{sampleTeamStats.cleanSheets} Clean</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Design 6: Horizontal Stats Bar
  const HorizontalStatsBar = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Horizontal Stats Bar</h2>
        <p className="text-gray-600">Compact horizontal layout with visual progress indicators</p>
      </div>

      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-slate-800 to-blue-800 text-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">{sampleTeamStats.teamName}</h3>
              <p className="text-blue-200 text-sm">Season Overview</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{sampleTeamStats.winRate}%</div>
              <div className="text-blue-200 text-sm">Win Rate</div>
            </div>
          </div>
        </div>
        
        <CardContent className="p-4">
          <div className="grid grid-cols-5 gap-4 mb-4">
            <div className="text-center p-2 bg-green-50 rounded border border-green-200">
              <div className="text-xl font-bold text-green-700">{sampleTeamStats.wins}</div>
              <div className="text-xs text-green-600">Wins</div>
            </div>
            <div className="text-center p-2 bg-red-50 rounded border border-red-200">
              <div className="text-xl font-bold text-red-700">{sampleTeamStats.losses}</div>
              <div className="text-xs text-red-600">Losses</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded border border-gray-200">
              <div className="text-xl font-bold text-gray-700">{sampleTeamStats.draws}</div>
              <div className="text-xs text-gray-600">Draws</div>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded border border-blue-200">
              <div className="text-xl font-bold text-blue-700">{sampleTeamStats.totalGoalsFor}</div>
              <div className="text-xs text-blue-600">Goals For</div>
            </div>
            <div className="text-center p-2 bg-orange-50 rounded border border-orange-200">
              <div className="text-xl font-bold text-orange-700">{sampleTeamStats.totalGoalsAgainst}</div>
              <div className="text-xs text-orange-600">Goals Against</div>
            </div>
          </div>

          {/* Progress bars for key metrics */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Win Rate</span>
                <span className="font-semibold">{sampleTeamStats.winRate}%</span>
              </div>
              <Progress value={sampleTeamStats.winRate} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Goal Efficiency</span>
                <span className="font-semibold">{sampleTeamStats.goalRatio}%</span>
              </div>
              <Progress value={sampleTeamStats.goalRatio} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Design 7: Badge Collection Style
  const BadgeCollectionStyle = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Badge Collection Style</h2>
        <p className="text-gray-600">Visual badges and achievements layout</p>
      </div>

      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">{sampleTeamStats.teamName}</CardTitle>
                <p className="text-sm text-gray-600">Performance Summary</p>
              </div>
            </div>
            <Badge variant="outline" className="text-blue-600 border-blue-600 font-semibold">
              {sampleTeamStats.totalGames} Games
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Achievement badges */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-3 bg-white rounded-lg border-2 border-green-200 shadow-sm">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-green-600 font-bold text-sm">{sampleTeamStats.winRate}%</span>
              </div>
              <div className="text-xs font-medium text-green-700">Win Rate</div>
            </div>
            
            <div className="text-center p-3 bg-white rounded-lg border-2 border-purple-200 shadow-sm">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-purple-600 font-bold text-sm">{sampleTeamStats.bigWins}</span>
              </div>
              <div className="text-xs font-medium text-purple-700">Big Wins</div>
            </div>
            
            <div className="text-center p-3 bg-white rounded-lg border-2 border-blue-200 shadow-sm">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-blue-600 font-bold text-sm">{sampleTeamStats.cleanSheets}</span>
              </div>
              <div className="text-xs font-medium text-blue-700">Clean Sheets</div>
            </div>
          </div>

          {/* Performance metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-lg p-3 border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Attack</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">{sampleTeamStats.averageGoalsFor}</div>
                  <div className="text-xs text-gray-600">avg per game</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-3 border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Defense</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">{sampleTeamStats.averageGoalsAgainst}</div>
                  <div className="text-xs text-gray-600">avg conceded</div>
                </div>
              </div>
            </div>
          </div>

          {/* Form indicator */}
          <div className="mt-4 p-3 bg-white rounded-lg border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Recent Form</span>
              <div className="flex gap-1">
                {sampleTeamStats.recentForm.map((result, index) => (
                  <div
                    key={index}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      result === 'W' ? 'bg-green-500 text-white' :
                      result === 'L' ? 'bg-red-500 text-white' :
                      'bg-gray-400 text-white'
                    }`}
                  >
                    {result}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Design 8: Minimal Status Style
  const MinimalStatusStyle = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Minimal Status Style</h2>
        <p className="text-gray-600">Clean, minimal approach focusing on key metrics</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
        <div className="p-4">
          {/* Header row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <h3 className="text-lg font-semibold text-gray-900">{sampleTeamStats.teamName}</h3>
              <Badge variant="secondary" className="text-xs">
                {sampleTeamStats.totalGames} games
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Win Rate</div>
              <div className="text-xl font-bold text-green-600">{sampleTeamStats.winRate}%</div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-6 gap-4 text-center text-sm">
            <div>
              <div className="text-gray-600 mb-1">Record</div>
              <div className="font-semibold">{sampleTeamStats.wins}-{sampleTeamStats.losses}-{sampleTeamStats.draws}</div>
            </div>
            <div>
              <div className="text-gray-600 mb-1">For</div>
              <div className="font-semibold text-green-600">{sampleTeamStats.totalGoalsFor}</div>
            </div>
            <div>
              <div className="text-gray-600 mb-1">Against</div>
              <div className="font-semibold text-red-600">{sampleTeamStats.totalGoalsAgainst}</div>
            </div>
            <div>
              <div className="text-gray-600 mb-1">Diff</div>
              <div className="font-semibold text-blue-600">+{sampleTeamStats.goalDifferential}</div>
            </div>
            <div>
              <div className="text-gray-600 mb-1">Avg For</div>
              <div className="font-semibold">{sampleTeamStats.averageGoalsFor}</div>
            </div>
            <div>
              <div className="text-gray-600 mb-1">Form</div>
              <div className="flex gap-0.5 justify-center">
                {sampleTeamStats.recentForm.slice(0, 3).map((result, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      result === 'W' ? 'bg-green-500' :
                      result === 'L' ? 'bg-red-500' :
                      'bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Bottom insights */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <span>• {sampleTeamStats.bigWins} dominant wins</span>
              <span>• {sampleTeamStats.cleanSheets} strong defensive games</span>
              <span>• {sampleTeamStats.closeGames} close contests</span>
            </div>
            <div className="text-xs text-gray-500">
              Last updated: 2 mins ago
            </div>
          </div>
        </div>
      </div>
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
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="compact">Compact</TabsTrigger>
          <TabsTrigger value="visual">Visual</TabsTrigger>
          <TabsTrigger value="modern">Modern</TabsTrigger>
          <TabsTrigger value="playerbox">Player Box</TabsTrigger>
          <TabsTrigger value="gamecard">Game Card</TabsTrigger>
          <TabsTrigger value="horizontal">Horizontal</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="minimal">Minimal</TabsTrigger>
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

        <TabsContent value="playerbox" className="mt-6">
          <PlayerBoxInspiredDesign />
        </TabsContent>

        <TabsContent value="gamecard" className="mt-6">
          <GameResultCardStyle />
        </TabsContent>

        <TabsContent value="horizontal" className="mt-6">
          <HorizontalStatsBar />
        </TabsContent>

        <TabsContent value="badges" className="mt-6">
          <BadgeCollectionStyle />
        </TabsContent>

        <TabsContent value="minimal" className="mt-6">
          <MinimalStatusStyle />
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
