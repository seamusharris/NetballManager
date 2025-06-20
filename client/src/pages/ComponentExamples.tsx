import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageTemplate from '@/components/layout/PageTemplate';
import { Link } from 'wouter';
import { 
  Palette, 
  Layout, 
  Mouse, 
  Type, 
  Grid, 
  Users, 
  Search, 
  Bell, 
  Navigation, 
  Table, 
  BarChart3, 
  Settings,
  Gamepad2,
  Trophy,
  Target,
  Calendar,
  Clock,
  Zap,
  Layers,
  Box,
  List,
  Filter,
  ChevronRight,
  Activity
} from 'lucide-react';

interface ExampleSection {
  title: string;
  description: string;
  path: string;
  icon: React.ReactNode;
  category: 'Components' | 'Patterns' | 'Layouts';
  status: 'Complete' | 'In Progress' | 'Planned';
}

const examples: ExampleSection[] = [
  // Components
  {
    title: 'Player Boxes',
    description: 'Various styles and configurations for displaying player information in compact, attractive boxes.',
    path: '/player-box-examples',
    icon: <Users className="h-5 w-5" />,
    category: 'Components',
    status: 'Complete'
  },
  {
    title: 'Team Boxes',
    description: 'Different team display formats including stats, player listings, and action buttons.',
    path: '/team-box-examples',
    icon: <Users className="h-5 w-5" />,
    category: 'Components',
    status: 'Complete'
  },
  {
    title: 'Game Result Cards',
    description: 'Comprehensive examples of game result displays with different layouts and information density.',
    path: '/game-result-examples',
    icon: <Calendar className="h-5 w-5" />,
    category: 'Components',
    status: 'Complete'
  },
  {
    title: 'Round Badges',
    description: 'Various badge styles for displaying round numbers, competition levels, and status indicators.',
    path: '/round-badge-examples',
    icon: <Trophy className="h-5 w-5" />,
    category: 'Components',
    status: 'Complete'
  },
  {
    title: 'Action Buttons',
    description: 'Consistent action button patterns that work with various color schemes and contexts.',
    path: '/action-button-examples',
    icon: <Settings className="h-5 w-5" />,
    category: 'Components',
    status: 'Complete'
  },
  {
    title: 'Court Layouts',
    description: 'Court display components with various layouts and configurations for game visualization.',
    path: '/court-layout-examples',
    icon: <Target className="h-5 w-5" />,
    category: 'Components',
    status: 'Complete'
  },
  {
    title: 'Roster Management',
    description: 'Different interfaces for assigning players to positions.',
    path: '/roster-management-examples',
    icon: <Users className="h-5 w-5" />,
    category: 'Components',
    status: 'Complete'
  },
  {
    title: 'Live Stats Interface',
    description: 'Touch-optimized interfaces for recording live game statistics on tablets.',
    path: '/live-stats-interface-examples',
    icon: <Activity className="h-5 w-5" />,
    category: 'Sport-Specific',
    status: 'Complete'
  },

  // Navigation
  {
    title: 'Navigation Examples',
    description: 'Breadcrumb navigation, pagination, tabs, steppers, and other navigation patterns.',
    path: '/navigation-examples',
    icon: <Users className="h-5 w-5" />,
    category: 'Navigation',
    status: 'Complete'
  },

  // Data Display  
  {
    title: 'Table Examples',
    description: 'Different table layouts, sorting, filtering patterns, and data presentation styles.',
    path: '/table-examples',
    icon: <BarChart3 className="h-5 w-5" />,
    category: 'Data Display',
    status: 'Complete'
  },
  {
    title: 'List Examples',
    description: 'Various list styles including simple lists, detailed cards, and grid arrangements.',
    path: '/list-examples',
    icon: <Users className="h-5 w-5" />,
    category: 'Data Display',
    status: 'Complete'
  },
  {
    title: 'Timeline Examples',
    description: 'Activity feeds, game history timelines, and chronological data displays.',
    path: '/timeline-examples',
    icon: <Calendar className="h-5 w-5" />,
    category: 'Data Display',
    status: 'Complete'
  },
  {
    title: 'Statistics Cards',
    description: 'Different metric display patterns, stat cards, and performance indicators.',
    path: '/statistics-card-examples',
    icon: <BarChart3 className="h-5 w-5" />,
    category: 'Data Display',
    status: 'Complete'
  },

  // Interactive
  {
    title: 'Modal Examples',
    description: 'Different modal sizes, content types, confirmation dialogs, and overlay patterns.',
    path: '/modal-examples',
    icon: <Settings className="h-5 w-5" />,
    category: 'Interactive',
    status: 'Complete'
  },
  {
    title: 'Tooltip Examples',
    description: 'Various tooltip styles, positioning options, and information display patterns.',
    path: '/tooltip-examples',
    icon: <Target className="h-5 w-5" />,
    category: 'Interactive',
    status: 'Complete'
  },
  {
    title: 'Dropdown Examples',
    description: 'Different dropdown patterns including action menus, filters, and selection interfaces.',
    path: '/dropdown-examples',
    icon: <Settings className="h-5 w-5" />,
    category: 'Interactive',
    status: 'Complete'
  },
  {
    title: 'Search Examples',
    description: 'Search bars, filters, result displays, and data discovery patterns.',
    path: '/search-examples',
    icon: <Target className="h-5 w-5" />,
    category: 'Interactive',
    status: 'Complete'
  },

  // Loading & Error States
  {
    title: 'Loading Examples',
    description: 'Skeletons, spinners, progressive loading states, and performance indicators.',
    path: '/loading-examples',
    icon: <Settings className="h-5 w-5" />,
    category: 'States',
    status: 'Complete'
  },
  {
    title: 'Error Examples',
    description: 'Different error states, empty states, no-data displays, and error recovery patterns.',
    path: '/error-examples',
    icon: <Target className="h-5 w-5" />,
    category: 'States',
    status: 'Complete'
  },
  {
    title: 'Toast Examples',
    description: 'Success/error notifications, action confirmations, and feedback patterns.',
    path: '/toast-examples',
    icon: <Settings className="h-5 w-5" />,
    category: 'States',
    status: 'Complete'
  },

  // Patterns
  {
    title: 'Dashboard Widgets',
    description: 'Standardized widget patterns for dashboards with consistent backgrounds and styling.',
    path: '/widget-examples',
    icon: <BarChart3 className="h-5 w-5" />,
    category: 'Patterns',
    status: 'Complete'
  },
  {
    title: 'Form Patterns',
    description: 'Standard form layouts, validation patterns, and input combinations.',
    path: '/form-examples',
    icon: <Target className="h-5 w-5" />,
    category: 'Patterns',
    status: 'Complete'
  },
  {
    title: 'Data Visualization',
    description: 'Chart patterns, stat displays, and performance visualization components.',
    path: '/chart-examples',
    icon: <BarChart3 className="h-5 w-5" />,
    category: 'Patterns',
    status: 'Complete'
  },

  // Advanced Layout Patterns
  {
    title: 'Split View Examples',
    description: 'Master-detail layouts, sidebar patterns, and advanced layout compositions.',
    path: '/split-view-examples',
    icon: <Gamepad2 className="h-5 w-5" />,
    category: 'Advanced Layouts',
    status: 'Complete'
  },
  {
    title: 'Grid Examples',
    description: 'Masonry layouts, responsive grids, and dynamic grid arrangements.',
    path: '/grid-examples',
    icon: <Settings className="h-5 w-5" />,
    category: 'Advanced Layouts',
    status: 'Complete'
  },
  {
    title: 'Card Collection Examples',
    description: 'Different card arrangements, collection layouts, and organizational patterns.',
    path: '/card-collection-examples',
    icon: <Users className="h-5 w-5" />,
    category: 'Advanced Layouts',
    status: 'Complete'
  },

  // Sport-Specific Components
  {
    title: 'Lineup Recommendations',
    description: 'Player position analysis compared to quarter scores for tactical insights.',
    path: '/recommendation-examples',
    icon: <Trophy className="h-5 w-5" />,
    category: 'Sport-Specific',
    status: 'Complete'
  },
  {
    title: 'Tournament Brackets',
    description: 'Playoff visualization, bracket layouts, and tournament progression displays.',
    path: '/tournament-bracket-examples',
    icon: <Trophy className="h-5 w-5" />,
    category: 'Sport-Specific',
    status: 'Complete'
  },
  {
    title: 'Match Timeline',
    description: 'Quarter-by-quarter game flow, real-time progression, and match visualization.',
    path: '/match-timeline-examples',
    icon: <Calendar className="h-5 w-5" />,
    category: 'Sport-Specific',
    status: 'Complete'
  },
  {
    title: 'Position Rotation Patterns',
    description: 'Visual position switching guides, rotation strategies, and tactical displays.',
    path: '/position-rotation-examples',
    icon: <Target className="h-5 w-5" />,
    category: 'Sport-Specific',
    status: 'Complete'
  },
  {
    title: 'Team Formation Examples',
    description: 'Different tactical setups, formation layouts, and strategic visualizations.',
    path: '/team-formation-examples',
    icon: <Users className="h-5 w-5" />,
    category: 'Sport-Specific',
    status: 'Complete'
  },
  {
    title: 'Score Progression Charts',
    description: 'Real-time score tracking patterns, progression visualization, and performance metrics.',
    path: '/score-progression-examples',
    icon: <BarChart3 className="h-5 w-5" />,
    category: 'Sport-Specific',
    status: 'Complete'
  },
  {
    title: 'Player Substitution Flows',
    description: 'Bench management interfaces, substitution patterns, and player rotation tools.',
    path: '/substitution-flow-examples',
    icon: <Users className="h-5 w-5" />,
    category: 'Sport-Specific',
    status: 'Complete'
  },

  // Layouts
  {
    title: 'Page Layouts',
    description: 'Standard page templates and layout patterns for consistent user experience.',
    path: '/layout-examples',
    icon: <Gamepad2 className="h-5 w-5" />,
    category: 'Layouts',
    status: 'Complete'
  },
  {
    title: 'Color Schemes',
    description: 'Comprehensive color palette examples and theming patterns for the application.',
    path: '/color-examples',
    icon: <Palette className="h-5 w-5" />,
    category: 'Layouts',
    status: 'Complete'
  }
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
    case 'Patterns':
      return 'bg-orange-100 text-orange-800';
    case 'Layouts':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

export default function ComponentExamples() {
  const groupedExamples = examples.reduce((acc, example) => {
    if (!acc[example.category]) {
      acc[example.category] = [];
    }
    acc[example.category].push(example);
    return acc;
  }, {} as Record<string, ExampleSection[]>);

  return (
    <PageTemplate 
      title="Component Examples" 
      breadcrumbs={[{ label: "Component Examples" }]}
    >
      <div className="space-y-8">
        <div className="prose max-w-none">
          <p className="text-lg text-gray-700">
            Comprehensive showcase of all UI components, patterns, and layouts used throughout the application. 
            Use these examples as reference for consistent design and implementation.
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
                  {examples.filter(e => e.status === 'Complete').length}
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
                  {examples.filter(e => e.status === 'In Progress').length}
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
                  {examples.filter(e => e.status === 'Planned').length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Example Categories */}
        {Object.entries(groupedExamples).map(([category, categoryExamples]) => (
          <div key={category}>
            <div className="flex items-center space-x-3 mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{category}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(category)}`}>
                {categoryExamples.length} {categoryExamples.length === 1 ? 'Example' : 'Examples'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryExamples.map((example) => (
                <Card 
                  key={example.path} 
                  className={`transition-all duration-200 ${
                    example.status === 'Complete' 
                      ? 'hover:shadow-lg cursor-pointer' 
                      : 'opacity-60 cursor-not-allowed'
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          {example.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{example.title}</CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(example.status)}`}>
                              {example.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4">
                      {example.description}
                    </p>

                    {example.status === 'Complete' ? (
                      <Link href={example.path}>
                        <div className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200">
                          View Examples
                          <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </Link>
                    ) : (
                      <div className="inline-flex items-center px-4 py-2 bg-gray-300 text-gray-500 text-sm font-medium rounded-lg cursor-not-allowed">
                        {example.status === 'In Progress' ? 'Coming Soon' : 'Planned'}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {/* Design Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle>Design Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Color Consistency</h4>
                <p className="text-sm text-gray-600 mb-3">
                  All components follow a consistent color scheme with primary blue (#3B82F6), 
                  success green (#10B981), warning orange (#F59E0B), and danger red (#EF4444).
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Spacing Standards</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Components use Tailwind's spacing scale (4px increments) for consistent 
                  padding, margins, and gap spacing throughout the application.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Typography Scale</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Text follows a clear hierarchy with consistent font weights and sizes, 
                  ensuring readability across different screen sizes and contexts.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Interactive States</h4>
                <p className="text-sm text-gray-600 mb-3">
                  All interactive elements include hover, focus, and active states with 
                  smooth transitions for enhanced user experience.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
}