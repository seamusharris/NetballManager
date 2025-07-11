import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageTemplate from '@/components/layout/PageTemplate';
import { ResultBadge } from '@/components/ui/result-badge';
import { PlayerBox } from '@/components/ui/player-box';
import { Link } from 'wouter';
import { 
  Trophy,
  Users,
  Target,
  Palette,
  Box,
  Activity,
  ChevronRight
} from 'lucide-react';
import GameResultCard from '@/components/ui/game-result-card';
import { Game } from '@shared/schema';

interface ReferenceItem {
  title: string;
  description: string;
  path: string;
  icon: React.ReactNode;
  category: 'Components' | 'Utilities' | 'Styles';
  status: 'Complete' | 'In Progress' | 'Planned';
}

const referenceItems: ReferenceItem[] = [
  {
    title: 'Result Badge Component',
    description: 'Standardized win/loss/draw/bye result badges with consistent colors and sizing system.',
    path: '/reference/result-badge-component',
    icon: <Trophy className="h-5 w-5" />,
    category: 'Components',
    status: 'Complete'
  },
  {
    title: 'PlayerBox Component',
    description: 'Versatile player display component with selection states, statistics, and multiple size variants for team management.',
    path: '/reference/playerbox-component',
    icon: <Users className="h-5 w-5" />,
    category: 'Components',
    status: 'Complete'
  },
  {
    title: 'GameResultCard Component',
    description: 'Comprehensive game result display component with score tracking, team information, and multiple layout variants.',
    path: '/reference/game-result-card-component',
    icon: <Activity className="h-5 w-5" />,
    category: 'Components',
    status: 'Complete'
  },
  {
    title: 'Position Component',
    description: 'Netball position badges with dual border styling, standardized colors, and size variants for consistent position display.',
    path: '/reference/position-component',
    icon: <Target className="h-5 w-5" />,
    category: 'Components',
    status: 'Complete'
  },
  // Add more reference items here as they are created
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Complete':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'In Progress':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Planned':
      return 'bg-gray-100 text-gray-600 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200';
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Components':
      return 'bg-purple-100 text-purple-800';
    case 'Utilities':
      return 'bg-orange-100 text-orange-800';
    case 'Styles':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

export default function Reference() {
  // Position color scheme from the style guide
  const positions = [
    { code: "GS", name: "Goal Shooter", color: "#dc2626" },
    { code: "GA", name: "Goal Attack", color: "#ea580c" },
    { code: "WA", name: "Wing Attack", color: "#f59e0b" },
    { code: "C", name: "Centre", color: "#10b981" },
    { code: "WD", name: "Wing Defence", color: "#0891b2" },
    { code: "GD", name: "Goal Defence", color: "#2563eb" },
    { code: "GK", name: "Goal Keeper", color: "#4338ca" }
  ];

  // Sample game data for GameResultCard examples
  const sampleGames: Game[] = [
    {
      id: 1,
      date: '2024-06-15',
      time: '14:00',
      homeTeamId: 116,
      awayTeamId: 117,
      homeTeamName: 'WNC Dingoes',
      awayTeamName: 'Emeralds',
      round: 5,
      statusIsCompleted: true,
      statusName: 'completed',
      statusId: 3,
      seasonId: 1,
      clubId: 54,
      venue: 'Court 1',
      isBye: false,
      statusTeamGoals: 45,
      statusOpponentGoals: 38,
      statusDisplayName: 'Completed',
      statusAllowsStatistics: true,
      seasonName: 'Autumn 2025',
      seasonStartDate: '2025-01-01',
      seasonEndDate: '2025-06-29',
      seasonIsActive: true,
      homeTeamDivision: '15U/1s',
      homeClubId: 54,
      homeClubName: 'Warrandyte Netball Club',
      homeClubCode: 'WNC',
      awayTeamDivision: '15U/1s',
      awayClubId: 15,
      awayClubName: 'East Doncaster',
      awayClubCode: 'EDNC',
      isInterClub: false,
      notes: null,
      awardWinnerId: null
    },
    {
      id: 2,
      date: '2024-06-22',
      time: '16:00',
      homeTeamId: 118,
      awayTeamId: 116,
      homeTeamName: 'Cobras',
      awayTeamName: 'WNC Dingoes',
      round: 6,
      statusIsCompleted: true,
      statusName: 'completed',
      statusId: 3,
      seasonId: 1,
      clubId: 54,
      venue: 'Away',
      isBye: false,
      statusTeamGoals: 28,
      statusOpponentGoals: 35,
      statusDisplayName: 'Completed',
      statusAllowsStatistics: true,
      seasonName: 'Autumn 2025',
      seasonStartDate: '2025-01-01',
      seasonEndDate: '2025-06-29',
      seasonIsActive: true,
      homeTeamDivision: '15U/1s',
      homeClubId: 15,
      homeClubName: 'East Doncaster',
      homeClubCode: 'EDNC',
      awayTeamDivision: '15U/1s',
      awayClubId: 54,
      awayClubName: 'Warrandyte Netball Club',
      awayClubCode: 'WNC',
      isInterClub: false,
      notes: null,
      awardWinnerId: null
    },
    {
      id: 3,
      date: '2024-07-15',
      time: '12:00',
      homeTeamId: 116,
      awayTeamId: 119,
      homeTeamName: 'WNC Dingoes',
      awayTeamName: 'Thunder Jets',
      round: 8,
      statusIsCompleted: false,
      statusName: 'upcoming',
      statusId: 1,
      seasonId: 1,
      clubId: 54,
      venue: 'Court 2',
      isBye: false,
      statusTeamGoals: null,
      statusOpponentGoals: null,
      statusDisplayName: 'Upcoming',
      statusAllowsStatistics: false,
      seasonName: 'Autumn 2025',
      seasonStartDate: '2025-01-01',
      seasonEndDate: '2025-06-29',
      seasonIsActive: true,
      homeTeamDivision: '15U/1s',
      homeClubId: 54,
      homeClubName: 'Warrandyte Netball Club',
      homeClubCode: 'WNC',
      awayTeamDivision: '15U/1s',
      awayClubId: 16,
      awayClubName: 'Thunder Sports',
      awayClubCode: 'TS',
      isInterClub: false,
      notes: null,
      awardWinnerId: null
    },
    {
      id: 4,
      date: '2024-06-08',
      time: '10:00',
      homeTeamId: 116,
      awayTeamId: null,
      homeTeamName: 'WNC Dingoes',
      awayTeamName: null,
      round: 4,
      statusIsCompleted: true,
      statusName: 'bye',
      statusId: 6,
      seasonId: 1,
      clubId: 54,
      venue: null,
      isBye: true,
      statusTeamGoals: null,
      statusOpponentGoals: null,
      statusDisplayName: 'Bye',
      statusAllowsStatistics: false,
      seasonName: 'Autumn 2025',
      seasonStartDate: '2025-01-01',
      seasonEndDate: '2025-06-29',
      seasonIsActive: true,
      homeTeamDivision: '15U/1s',
      homeClubId: 54,
      homeClubName: 'Warrandyte Netball Club',
      homeClubCode: 'WNC',
      awayTeamDivision: null,
      awayClubId: null,
      awayClubName: null,
      awayClubCode: null,
      isInterClub: false,
      notes: null,
      awardWinnerId: null
    }
  ];

  const groupedReferences = referenceItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ReferenceItem[]>);

  return (
    <PageTemplate 
      title="Component Reference" 
      breadcrumbs={[
        { label: "Development", href: "/component-examples" },
        { label: "Reference" }
      ]}
    >
      <div className="space-y-8">
        <div className="prose max-w-none">
          <p className="text-lg text-gray-700">
            Detailed component reference documentation with implementation guidelines, 
            props specifications, and usage patterns for consistent development.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Complete</span>
                <span className="text-2xl font-bold ml-auto">
                  {referenceItems.filter(e => e.status === 'Complete').length}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium">In Progress</span>
                <span className="text-2xl font-bold ml-auto">
                  {referenceItems.filter(e => e.status === 'In Progress').length}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 bg-gray-400 rounded-full"></div>
                <span className="text-sm font-medium">Planned</span>
                <span className="text-2xl font-bold ml-auto">
                  {referenceItems.filter(e => e.status === 'Planned').length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reference Categories */}
        {Object.entries(groupedReferences).map(([category, categoryItems]) => (
          <div key={category}>
            <div className="flex items-center space-x-3 mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{category}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(category)}`}>
                {categoryItems.length} {categoryItems.length === 1 ? 'Reference' : 'References'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryItems.map((item) => (
                <Card 
                  key={item.path} 
                  className={`transition-all duration-200 ${
                    item.status === 'Complete' 
                      ? 'hover:shadow-lg cursor-pointer' 
                      : 'opacity-60 cursor-not-allowed'
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          {item.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                              {item.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4">
                      {item.description}
                    </p>

                    {/* Live Example for Result Badge Component */}
                    {item.title === 'Result Badge Component' && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs font-medium text-gray-600 mb-2">Live Example:</div>
                        <div className="flex items-center gap-2">
                          <ResultBadge result="Win" size="sm" />
                          <ResultBadge result="Loss" size="sm" />
                          <ResultBadge result="Draw" size="sm" />
                          <ResultBadge result="Bye" size="sm" />
                        </div>
                      </div>
                    )}

                    {/* Live Example for PlayerBox Component */}
                    {item.title === 'PlayerBox Component' && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs font-medium text-gray-600 mb-2">Live Example:</div>
                        <div className="space-y-2">
                          <PlayerBox 
                            player={{
                              id: 999,
                              displayName: "Emma Wilson",
                              positionPreferences: ["GA", "GS"],
                              avatarColor: "bg-blue-500",
                              active: true
                            }}
                            size="sm"
                          />
                        </div>
                      </div>
                    )}

                    {/* Live Example for Position Component */}
                    {item.title === 'Position Component' && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs font-medium text-gray-600 mb-2">Live Example:</div>
                        <div className="flex items-center gap-2">
                          {[
                            { code: "GS", name: "Goal Shooter", color: "#dc2626" },
                            { code: "C", name: "Centre", color: "#10b981" },
                            { code: "GK", name: "Goal Keeper", color: "#4338ca" }
                          ].map((position) => (
                            <div key={position.code} className="relative">
                              <div 
                                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white relative overflow-hidden"
                                style={{ backgroundColor: position.color }}
                              >
                                <div 
                                  className="absolute inset-1 rounded-md border-2 border-white/30"
                                  style={{ borderColor: `${position.color}40` }}
                                />
                                <span className="relative z-10 text-white font-bold text-xs">{position.code}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Live Example for GameResultCard Component */}
                    {item.title === 'GameResultCard Component' && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs font-medium text-gray-600 mb-2">Live Example:</div>
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <div className="text-xs font-medium mb-1 text-green-700">Win Example</div>
                              <GameResultCard 
                                game={sampleGames[0]} 
                                currentTeamId={116}
                                layout="medium"
                                showLink={false}
                              />
                            </div>
                            <div>
                              <div className="text-xs font-medium mb-1 text-red-700">Loss Example</div>
                              <GameResultCard 
                                game={sampleGames[1]} 
                                currentTeamId={116}
                                layout="medium"
                                showLink={false}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <div className="text-xs font-medium mb-1 text-blue-700">Upcoming Game</div>
                              <GameResultCard 
                                game={sampleGames[2]} 
                                currentTeamId={116}
                                layout="medium"
                                showLink={false}
                              />
                            </div>
                            <div>
                              <div className="text-xs font-medium mb-1 text-gray-700">Bye Game</div>
                              <GameResultCard 
                                game={sampleGames[3]} 
                                currentTeamId={116}
                                layout="medium"
                                showLink={false}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {item.status === 'Complete' ? (
                      <Link href={item.path}>
                        <div className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200">
                          View Reference
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </div>
                      </Link>
                    ) : (
                      <div className="inline-flex items-center px-4 py-2 bg-gray-300 text-gray-500 text-sm font-medium rounded-lg cursor-not-allowed">
                        {item.status === 'In Progress' ? 'Coming Soon' : 'Planned'}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {/* Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle>Reference Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Component Documentation</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Each component reference includes props specification, size variants, 
                  usage examples, and implementation guidelines for consistent development.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Implementation Standards</h4>
                <p className="text-sm text-gray-600 mb-3">
                  References follow standardized patterns for sizing, spacing, colors, 
                  and accessibility to ensure consistency across the application.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Code Examples</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Live code examples demonstrate proper usage with working components 
                  and TypeScript definitions for development efficiency.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Design System</h4>
                <p className="text-sm text-gray-600 mb-3">
                  All components align with the design system standards for colors, 
                  typography, spacing, and interaction patterns.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
}