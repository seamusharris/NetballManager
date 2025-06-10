
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { Link } from 'wouter';
import { 
  Users, Calendar, Trophy, Settings, 
  Gamepad2, Target, BarChart, Palette,
  ArrowRight, Grid, Square, AlertCircle,
  Search, Clock, Columns, TrendingUp
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
  
  // Patterns
  {
    title: 'Dashboard Widgets',
    description: 'Standardized widget patterns for dashboards with consistent backgrounds and styling.',
    path: '/widget-examples',
    icon: <BarChart className="h-5 w-5" />,
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
    icon: <BarChart className="h-5 w-5" />,
    category: 'Patterns',
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
  },
  
  // Navigation Patterns
  {
    title: 'Navigation Patterns',
    description: 'Breadcrumbs, pagination, tabs, and navigation components for seamless user flow.',
    path: '/navigation-examples',
    icon: <ArrowRight className="h-5 w-5" />,
    category: 'Patterns',
    status: 'Planned'
  },
  {
    title: 'Table Examples',
    description: 'Comprehensive table layouts with sorting, filtering, and responsive patterns.',
    path: '/table-examples',
    icon: <Grid className="h-5 w-5" />,
    category: 'Components',
    status: 'Planned'
  },
  {
    title: 'Modal & Dialog Examples',
    description: 'Various modal patterns, dialogs, and overlay components for user interactions.',
    path: '/modal-examples',
    icon: <Square className="h-5 w-5" />,
    category: 'Components',
    status: 'Planned'
  },
  {
    title: 'Loading & Error States',
    description: 'Loading skeletons, error states, empty states, and notification patterns.',
    path: '/state-examples',
    icon: <AlertCircle className="h-5 w-5" />,
    category: 'Patterns',
    status: 'Planned'
  },
  {
    title: 'Search & Filter Examples',
    description: 'Search interfaces, filter components, and data discovery patterns.',
    path: '/search-examples',
    icon: <Search className="h-5 w-5" />,
    category: 'Patterns',
    status: 'Planned'
  },
  {
    title: 'Timeline Examples',
    description: 'Activity feeds, game history timelines, and chronological data displays.',
    path: '/timeline-examples',
    icon: <Clock className="h-5 w-5" />,
    category: 'Components',
    status: 'Planned'
  },
  {
    title: 'Advanced Layouts',
    description: 'Split views, masonry grids, and complex responsive layout patterns.',
    path: '/advanced-layout-examples',
    icon: <Columns className="h-5 w-5" />,
    category: 'Layouts',
    status: 'Planned'
  },
  {
    title: 'Statistics Cards',
    description: 'Various metric displays, KPI cards, and performance indicator patterns.',
    path: '/statistics-examples',
    icon: <TrendingUp className="h-5 w-5" />,
    category: 'Components',
    status: 'Planned'
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
