
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageTemplate from '@/components/layout/PageTemplate';
import { ResultBadge } from '@/components/ui/result-badge';
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
