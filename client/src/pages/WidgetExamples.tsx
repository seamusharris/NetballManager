
import React from 'react';
import { Link } from 'wouter';
import { 
  CalendarPlus, 
  UserPlus, 
  ClipboardList, 
  BarChart3, 
  Settings, 
  Download,
  Target,
  TrendingUp,
  Users,
  Trophy
} from 'lucide-react';
import { StandardWidget, MinimalWidget, ContentWidget } from '@/components/ui/standard-widget';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SimpleGameResultCard from '@/components/ui/simple-game-result-card';
import QuarterPerformanceAnalysisWidget from '@/components/ui/quarter-performance-analysis-widget';
import AttackDefenseDisplay from '@/components/ui/attack-defense-display';
import CompactAttackDefenseWidget from '@/components/ui/compact-attack-defense-widget';

// Example widget components demonstrating different approaches

// 1. StandardWidget Example (Most Common)
function ExampleQuickActionsWidget({ className }: { className?: string }) {
  const actions = [
    {
      icon: CalendarPlus,
      label: 'Add Game',
      href: '/games/new',
      color: 'bg-blue-500 hover:bg-blue-600',
      description: 'Schedule new game'
    },
    {
      icon: UserPlus,
      label: 'Add Player',
      href: '/players/new',
      color: 'bg-green-500 hover:bg-green-600',
      description: 'Register new player'
    },
    {
      icon: ClipboardList,
      label: 'Manage Availability',
      href: '/availability',
      color: 'bg-purple-500 hover:bg-purple-600',
      description: 'Set player availability'
    },
    {
      icon: BarChart3,
      label: 'View Stats',
      href: '/statistics',
      color: 'bg-orange-500 hover:bg-orange-600',
      description: 'Performance data'
    }
  ];

  return (
    <StandardWidget 
      title="Quick Actions" 
      description="Common team management tasks"
      className={className}
    >
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link key={index} href={action.href}>
              <Button
                variant="outline"
                className={`
                  h-auto p-3 flex flex-col items-center justify-center space-y-2 
                  hover:shadow-md transition-all duration-200 group
                  border-gray-200 hover:border-gray-300
                `}
              >
                <div className={`p-2 rounded-lg ${action.color} text-white group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium text-gray-900 group-hover:text-gray-700">
                    {action.label}
                  </div>
                  <div className="text-[10px] text-gray-500 group-hover:text-gray-600">
                    {action.description}
                  </div>
                </div>
              </Button>
            </Link>
          );
        })}
      </div>
    </StandardWidget>
  );
}

// 2. StandardWidget with Header Content Example
function ExampleTeamStatsWidget({ className }: { className?: string }) {
  return (
    <StandardWidget 
      title="Team Performance"
      description="Current season statistics"
      headerContent={
        <Badge variant="outline" className="text-green-600 border-green-300">
          <TrendingUp className="h-3 w-3 mr-1" />
          +12% vs last season
        </Badge>
      }
      className={className}
    >
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">85%</div>
          <div className="text-sm text-gray-600">Win Rate</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">12.3</div>
          <div className="text-sm text-gray-600">Avg Goals</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">8.1</div>
          <div className="text-sm text-gray-600">Avg Against</div>
        </div>
      </div>
    </StandardWidget>
  );
}

// 3. MinimalWidget Example (No Header)
function ExamplePlayerListWidget({ className }: { className?: string }) {
  const players = [
    { id: 1, name: 'Sarah Johnson', position: 'GS', availability: 'Available' },
    { id: 2, name: 'Emma Davis', position: 'GA', availability: 'Unavailable' },
    { id: 3, name: 'Mia Wilson', position: 'WA', availability: 'Available' },
    { id: 4, name: 'Sophie Brown', position: 'C', availability: 'Available' }
  ];

  return (
    <MinimalWidget className={className}>
      <div className="space-y-3">
        {players.map((player) => (
          <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="font-medium text-gray-900">{player.name}</div>
                <div className="text-sm text-gray-500">{player.position}</div>
              </div>
            </div>
            <Badge 
              variant={player.availability === 'Available' ? 'default' : 'secondary'}
              className={player.availability === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
            >
              {player.availability}
            </Badge>
          </div>
        ))}
      </div>
    </MinimalWidget>
  );
}

// 4. ContentWidget Example (No Card Wrapper)
function ExampleGameScoreWidget({ className }: { className?: string }) {
  return (
    <ContentWidget className={className}>
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-800">24</div>
            <div className="text-sm text-gray-600">Home Team</div>
          </div>
          <div className="text-2xl font-bold text-gray-400">vs</div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-800">18</div>
            <div className="text-sm text-gray-600">Away Team</div>
          </div>
        </div>
        <div className="flex justify-center space-x-2">
          <Badge className="bg-green-100 text-green-800">Q1: 6-4</Badge>
          <Badge className="bg-green-100 text-green-800">Q2: 6-5</Badge>
          <Badge className="bg-red-100 text-red-800">Q3: 5-6</Badge>
          <Badge className="bg-green-100 text-green-800">Q4: 7-3</Badge>
        </div>
      </div>
    </ContentWidget>
  );
}

// 5. Compact Widget Example
function ExampleCompactWidget({ className }: { className?: string }) {
  return (
    <StandardWidget 
      title="Recent Form"
      compact={true}
      className={className}
    >
      <div className="flex space-x-2">
        <Badge className="bg-green-100 text-green-800">W</Badge>
        <Badge className="bg-green-100 text-green-800">W</Badge>
        <Badge className="bg-red-100 text-red-800">L</Badge>
        <Badge className="bg-green-100 text-green-800">W</Badge>
        <Badge className="bg-amber-100 text-amber-800">D</Badge>
      </div>
    </StandardWidget>
  );
}

// 6. Game Results Widget Example (using existing SimpleGameResultCard)
function ExampleGameResultsWidget({ className }: { className?: string }) {
  // Sample game data
  const sampleGames = [
    {
      id: 1,
      homeTeam: { id: 1, name: 'Team A' },
      awayTeam: { id: 2, name: 'Team B' },
      gameInfo: {
        id: 1,
        date: '2024-01-15',
        round: 3,
        status: 'completed' as const,
        venue: 'Main Court'
      },
      quarterScores: [
        { homeScore: 6, awayScore: 4 },
        { homeScore: 5, awayScore: 6 },
        { homeScore: 7, awayScore: 3 },
        { homeScore: 6, awayScore: 5 }
      ],
      hasStats: true
    },
    {
      id: 2,
      homeTeam: { id: 1, name: 'Team A' },
      awayTeam: { id: 3, name: 'Team C' },
      gameInfo: {
        id: 2,
        date: '2024-01-22',
        round: 4,
        status: 'completed' as const,
        venue: 'Court 2'
      },
      quarterScores: [
        { homeScore: 4, awayScore: 6 },
        { homeScore: 6, awayScore: 5 },
        { homeScore: 3, awayScore: 7 },
        { homeScore: 5, awayScore: 6 }
      ],
      hasStats: true
    },
    {
      id: 3,
      homeTeam: { id: 1, name: 'Team A' },
      awayTeam: { id: 4, name: 'Team D' },
      gameInfo: {
        id: 3,
        date: '2024-01-29',
        round: 5,
        status: 'scheduled' as const,
        venue: 'Main Court'
      },
      quarterScores: [],
      hasStats: false
    }
  ];

  return (
    <StandardWidget 
      title="Recent Games"
      description="Latest team performance results"
      className={className}
    >
      <div className="space-y-3">
        {sampleGames.map((game) => (
          <SimpleGameResultCard
            key={game.id}
            homeTeam={game.homeTeam}
            awayTeam={game.awayTeam}
            quarterScores={game.quarterScores}
            currentTeamId={1} // Team A's perspective
            gameInfo={game.gameInfo}
            layout="medium"
            showLink={true}
            showDate={true}
            showRound={true}
            showScore={true}
            showQuarterScores={false}
            hasStats={game.hasStats}
          />
        ))}
      </div>
    </StandardWidget>
  );
}

// 7. Quarter Performance Analysis Widget Example (using existing QuarterPerformanceAnalysis)
function ExampleQuarterPerformanceWidget({ className }: { className?: string }) {
  // Sample game data with quarter scores
  const sampleGames = [
    {
      id: 1,
      statusName: 'completed',
      // Sample quarter scores for this game
      scores: [
        { teamId: 1, quarter: 1, score: 6 },
        { teamId: 2, quarter: 1, score: 4 },
        { teamId: 1, quarter: 2, score: 5 },
        { teamId: 2, quarter: 2, score: 6 },
        { teamId: 1, quarter: 3, score: 7 },
        { teamId: 2, quarter: 3, score: 3 },
        { teamId: 1, quarter: 4, score: 6 },
        { teamId: 2, quarter: 4, score: 5 }
      ]
    },
    {
      id: 2,
      statusName: 'completed',
      scores: [
        { teamId: 1, quarter: 1, score: 4 },
        { teamId: 3, quarter: 1, score: 6 },
        { teamId: 1, quarter: 2, score: 6 },
        { teamId: 3, quarter: 2, score: 5 },
        { teamId: 1, quarter: 3, score: 3 },
        { teamId: 3, quarter: 3, score: 7 },
        { teamId: 1, quarter: 4, score: 5 },
        { teamId: 3, quarter: 4, score: 6 }
      ]
    },
    {
      id: 3,
      statusName: 'completed',
      scores: [
        { teamId: 1, quarter: 1, score: 8 },
        { teamId: 4, quarter: 1, score: 3 },
        { teamId: 1, quarter: 2, score: 9 },
        { teamId: 4, quarter: 2, score: 4 },
        { teamId: 1, quarter: 3, score: 7 },
        { teamId: 4, quarter: 3, score: 5 },
        { teamId: 1, quarter: 4, score: 8 },
        { teamId: 4, quarter: 4, score: 6 }
      ]
    }
  ];

  // Transform sample data to match expected format
  const batchScores = sampleGames.reduce((acc, game) => {
    acc[game.id] = game.scores;
    return acc;
  }, {} as Record<number, any[]>);

  return (
    <QuarterPerformanceAnalysisWidget
      games={sampleGames}
      currentTeamId={1} // Team A's perspective
      batchScores={batchScores}
      excludeSpecialGames={true}
      className={className}
    />
  );
}

// 8. Attack vs Defense Breakdown Widget Example (using existing AttackDefenseDisplay)
function ExampleAttackDefenseWidget({ className }: { className?: string }) {
  // Sample position averages data
  const samplePositionAverages = {
    gsAvgGoalsFor: 8.5,
    gaAvgGoalsFor: 6.2,
    gdAvgGoalsAgainst: 4.8,
    gkAvgGoalsAgainst: 3.1,
    attackingPositionsTotal: 14.7, // GS + GA
    defendingPositionsTotal: 7.9,  // GD + GK
    gamesWithPositionStats: 12
  };

  // Sample quarter breakdown data
  const sampleQuarterData = [
    {
      quarter: 1,
      gsGoalsFor: 2.1,
      gaGoalsFor: 1.8,
      gdGoalsAgainst: 1.2,
      gkGoalsAgainst: 0.9
    },
    {
      quarter: 2,
      gsGoalsFor: 2.3,
      gaGoalsFor: 1.5,
      gdGoalsAgainst: 1.4,
      gkGoalsAgainst: 0.8
    },
    {
      quarter: 3,
      gsGoalsFor: 2.0,
      gaGoalsFor: 1.6,
      gdGoalsAgainst: 1.1,
      gkGoalsAgainst: 0.7
    },
    {
      quarter: 4,
      gsGoalsFor: 2.1,
      gaGoalsFor: 1.3,
      gdGoalsAgainst: 1.1,
      gkGoalsAgainst: 0.7
    }
  ];

  return (
    <StandardWidget 
      title="Attack vs Defense Performance"
      description="Position-based scoring breakdown (GS/GA vs GD/GK)"
      className={className}
    >
      <AttackDefenseDisplay
        averages={samplePositionAverages}
        label="Team Performance Breakdown"
        showQuarterBreakdown={true}
        quarterData={sampleQuarterData}
      />
    </StandardWidget>
  );
}

// CompactAttackDefenseWidget example
function ExampleCompactAttackDefenseWidget({ className }: { className?: string }) {
  // Sample position averages data
  const samplePositionAverages = {
    gsAvgGoalsFor: 8.5,
    gaAvgGoalsFor: 6.2,
    gdAvgGoalsAgainst: 4.8,
    gkAvgGoalsAgainst: 3.1,
    attackingPositionsTotal: 14.7, // GS + GA
    defendingPositionsTotal: 7.9,  // GD + GK
    gamesWithPositionStats: 12
  };

  // Sample quarter breakdown data
  const sampleQuarterData = [
    {
      quarter: 1,
      gsGoalsFor: 2.1,
      gaGoalsFor: 1.8,
      gdGoalsAgainst: 1.2,
      gkGoalsAgainst: 0.9
    },
    {
      quarter: 2,
      gsGoalsFor: 2.3,
      gaGoalsFor: 1.5,
      gdGoalsAgainst: 1.4,
      gkGoalsAgainst: 0.8
    },
    {
      quarter: 3,
      gsGoalsFor: 2.0,
      gaGoalsFor: 1.6,
      gdGoalsAgainst: 1.1,
      gkGoalsAgainst: 0.7
    },
    {
      quarter: 4,
      gsGoalsFor: 2.1,
      gaGoalsFor: 1.3,
      gdGoalsAgainst: 1.1,
      gkGoalsAgainst: 0.7
    }
  ];

  return (
    <StandardWidget 
      title=""
      description=""
      className={className}
    >
      <CompactAttackDefenseWidget
        averages={samplePositionAverages}
        quarterData={sampleQuarterData}
      />
    </StandardWidget>
  );
}

export default function WidgetExamples() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Widget Standardization Examples</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          This page demonstrates the standardized widget approach for consistent UI components across the application.
          Each widget type serves a specific purpose and provides consistent formatting and behavior.
        </p>
      </div>

      {/* Widget Type Guidelines */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Widget Type Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-800">StandardWidget</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Widget has a clear title/description</li>
                <li>• Widget is a standalone component</li>
                <li>• Widget needs consistent card styling</li>
                <li>• Widget will be placed in grid layouts</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-800">MinimalWidget</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Widget needs card styling but no header</li>
                <li>• Widget content is self-explanatory</li>
                <li>• Widget is part of a larger component</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-800">ContentWidget</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Widget is just content without card styling</li>
                <li>• Widget is embedded in another component</li>
                <li>• Widget needs custom styling</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Layout Examples */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Layout Examples</h2>
        
        {/* Dashboard Layout */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">Dashboard Layout (2x2 Grid)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ExampleQuickActionsWidget />
            <ExampleTeamStatsWidget />
            <ExamplePlayerListWidget />
            <ExampleCompactWidget />
          </div>
        </div>

        {/* Game Results Layout */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">Game Results Layout (Using Existing Component)</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ExampleGameResultsWidget />
            <ExampleTeamStatsWidget />
          </div>
        </div>

        {/* Quarter Performance Layout */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">QuarterPerformanceAnalysisWidget</h3>
          <div className="grid grid-cols-1 gap-6">
            <ExampleQuarterPerformanceWidget />
          </div>
        </div>

        {/* CompactAttackDefenseWidget Layout */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">CompactAttackDefenseWidget</h3>
          <div className="grid grid-cols-1 gap-6">
            <ExampleCompactAttackDefenseWidget />
          </div>
        </div>

        {/* Sidebar Layout */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">Sidebar Layout (Compact)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <ExampleTeamStatsWidget />
            </div>
            <div className="space-y-4">
              <ExampleCompactWidget />
              <ExamplePlayerListWidget />
            </div>
          </div>
        </div>

        {/* Content Area Layout */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">Content Area Layout (Full Width)</h3>
          <div className="space-y-4">
            <ExampleQuickActionsWidget />
            <ExampleGameScoreWidget />
            <ExamplePlayerListWidget />
          </div>
        </div>

        {/* Mixed Layout */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">Mixed Layout (Different Widget Types)</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ExampleTeamStatsWidget />
            </div>
            <div className="space-y-4">
              <ExampleCompactWidget />
              <ExamplePlayerListWidget />
            </div>
          </div>
        </div>
      </div>

      {/* Usage Guidelines */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle>Implementation Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">When to Use Each Widget Type</h4>
              <ul className="text-sm space-y-1">
                <li><strong>StandardWidget:</strong> Most common use case - widgets with titles and descriptions</li>
                <li><strong>MinimalWidget:</strong> When you need card styling but no header content</li>
                <li><strong>ContentWidget:</strong> For content areas that don't need card styling</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Best Practices</h4>
              <ul className="text-sm space-y-1">
                <li>• Always use one of the three widget types for consistency</li>
                <li>• Use <code>compact</code> prop for smaller spaces</li>
                <li>• Use <code>headerContent</code> for additional header elements</li>
                <li>• Customize with <code>className</code> for specific styling needs</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Migration Guide */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-yellow-900">Migration Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-yellow-800 mb-2">Replace BaseWidget</h4>
              <code className="text-yellow-700">BaseWidget → StandardWidget</code>
            </div>
            <div>
              <h4 className="font-semibold text-yellow-800 mb-2">Replace CustomHeaderWidget</h4>
              <code className="text-yellow-700">CustomHeaderWidget → StandardWidget + headerContent</code>
            </div>
            <div>
              <h4 className="font-semibold text-yellow-800 mb-2">Replace Direct Card Usage</h4>
              <code className="text-yellow-700">Card → StandardWidget</code>
            </div>
            <div>
              <h4 className="font-semibold text-yellow-800 mb-2">Replace Custom Div Containers</h4>
              <code className="text-yellow-700">Custom div → ContentWidget</code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
