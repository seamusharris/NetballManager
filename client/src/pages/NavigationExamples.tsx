
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ChevronLeft, ChevronRight, Home, Users, Calendar,
  MoreHorizontal, ArrowRight, Grid, Settings
} from 'lucide-react';

export default function NavigationExamples() {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('players');
  
  const totalPages = 10;
  
  const BreadcrumbExample = ({ variant }: { variant: 'default' | 'with-icons' | 'compact' }) => {
    const breadcrumbs = [
      { label: 'Dashboard', href: '/', icon: <Home className="h-3 w-3" /> },
      { label: 'Teams', href: '/teams', icon: <Users className="h-3 w-3" /> },
      { label: 'Lightning Bolts', href: '/teams/116', icon: null },
      { label: 'Game Schedule', href: null, icon: <Calendar className="h-3 w-3" /> }
    ];

    if (variant === 'compact') {
      return (
        <nav className="flex items-center space-x-1 text-sm">
          <Button variant="ghost" size="sm" className="p-1">
            <Home className="h-4 w-4" />
          </Button>
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
          <span>...</span>
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
          <span className="font-medium">Game Schedule</span>
        </nav>
      );
    }

    return (
      <nav className="flex items-center space-x-1 text-sm">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            )}
            <div className="flex items-center space-x-1">
              {variant === 'with-icons' && crumb.icon}
              {crumb.href ? (
                <Button variant="ghost" size="sm" className="h-auto p-0 font-normal">
                  {crumb.label}
                </Button>
              ) : (
                <span className="font-medium text-foreground">{crumb.label}</span>
              )}
            </div>
          </React.Fragment>
        ))}
      </nav>
    );
  };

  const PaginationExample = ({ variant }: { variant: 'default' | 'compact' | 'simple' }) => {
    const getVisiblePages = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];

      for (let i = Math.max(2, currentPage - delta); 
           i <= Math.min(totalPages - 1, currentPage + delta); 
           i++) {
        range.push(i);
      }

      if (currentPage - delta > 2) {
        rangeWithDots.push(1, '...');
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (currentPage + delta < totalPages - 1) {
        rangeWithDots.push('...', totalPages);
      } else {
        rangeWithDots.push(totalPages);
      }

      return rangeWithDots;
    };

    if (variant === 'simple') {
      return (
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      );
    }

    if (variant === 'compact') {
      return (
        <div className="flex items-center space-x-1">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="px-3 py-1 text-sm">{currentPage}</span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-1">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {getVisiblePages().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-2">
                <MoreHorizontal className="h-4 w-4" />
              </span>
            ) : (
              <Button
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(Number(page))}
              >
                {page}
              </Button>
            )}
          </React.Fragment>
        ))}
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <PageTemplate 
      title="Navigation Examples" 
      breadcrumbs={[
        { label: "Component Examples", href: "/component-examples" },
        { label: "Navigation Examples" }
      ]}
    >
      <div className="space-y-8">
        <Helmet>
          <title>Navigation Examples - Netball App</title>
        </Helmet>

        <div className="prose max-w-none">
          <p className="text-lg text-gray-700">
            Navigation components including breadcrumbs, pagination, tabs, and navigation patterns for user flow.
          </p>
        </div>

        {/* Breadcrumb Examples */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Breadcrumb Navigation</h2>
          <div className="space-y-6">
            
            <Card>
              <CardHeader>
                <CardTitle>Default Breadcrumbs</CardTitle>
              </CardHeader>
              <CardContent>
                <BreadcrumbExample variant="default" />
                <div className="mt-4 text-sm text-muted-foreground">
                  Standard breadcrumb with text links and separators
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Breadcrumbs with Icons</CardTitle>
              </CardHeader>
              <CardContent>
                <BreadcrumbExample variant="with-icons" />
                <div className="mt-4 text-sm text-muted-foreground">
                  Enhanced breadcrumbs with contextual icons for better visual hierarchy
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compact Breadcrumbs</CardTitle>
              </CardHeader>
              <CardContent>
                <BreadcrumbExample variant="compact" />
                <div className="mt-4 text-sm text-muted-foreground">
                  Space-saving version for mobile or narrow containers
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Pagination Examples */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Pagination Patterns</h2>
          <div className="space-y-6">
            
            <Card>
              <CardHeader>
                <CardTitle>Full Pagination</CardTitle>
              </CardHeader>
              <CardContent>
                <PaginationExample variant="default" />
                <div className="mt-4 text-sm text-muted-foreground">
                  Complete pagination with numbered pages and smart truncation
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compact Pagination</CardTitle>
              </CardHeader>
              <CardContent>
                <PaginationExample variant="compact" />
                <div className="mt-4 text-sm text-muted-foreground">
                  Minimal pagination for tight spaces
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Simple Pagination</CardTitle>
              </CardHeader>
              <CardContent>
                <PaginationExample variant="simple" />
                <div className="mt-4 text-sm text-muted-foreground">
                  Basic previous/next navigation with page indicator
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Tab Navigation */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Tab Navigation</h2>
          <div className="space-y-6">
            
            <Card>
              <CardHeader>
                <CardTitle>Standard Tabs</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="players">Players</TabsTrigger>
                    <TabsTrigger value="games">Games</TabsTrigger>
                    <TabsTrigger value="stats">Statistics</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>
                  <TabsContent value="players" className="mt-4">
                    <div className="p-4 border rounded-lg bg-muted/30">
                      <h4 className="font-medium mb-2">Players Content</h4>
                      <p className="text-sm text-muted-foreground">Player management and roster information</p>
                    </div>
                  </TabsContent>
                  <TabsContent value="games" className="mt-4">
                    <div className="p-4 border rounded-lg bg-muted/30">
                      <h4 className="font-medium mb-2">Games Content</h4>
                      <p className="text-sm text-muted-foreground">Game schedules and match information</p>
                    </div>
                  </TabsContent>
                  <TabsContent value="stats" className="mt-4">
                    <div className="p-4 border rounded-lg bg-muted/30">
                      <h4 className="font-medium mb-2">Statistics Content</h4>
                      <p className="text-sm text-muted-foreground">Performance metrics and analytics</p>
                    </div>
                  </TabsContent>
                  <TabsContent value="settings" className="mt-4">
                    <div className="p-4 border rounded-lg bg-muted/30">
                      <h4 className="font-medium mb-2">Settings Content</h4>
                      <p className="text-sm text-muted-foreground">Configuration and preferences</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Icon Tabs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-1 p-1 bg-muted rounded-lg">
                  {[
                    { id: 'overview', icon: <Grid className="h-4 w-4" />, label: 'Overview' },
                    { id: 'players', icon: <Users className="h-4 w-4" />, label: 'Players' },
                    { id: 'schedule', icon: <Calendar className="h-4 w-4" />, label: 'Schedule' },
                    { id: 'settings', icon: <Settings className="h-4 w-4" />, label: 'Settings' }
                  ].map(tab => (
                    <Button
                      key={tab.id}
                      variant={activeTab === tab.id ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setActiveTab(tab.id)}
                      className="flex items-center space-x-2"
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pill Tabs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {['All Games', 'Upcoming', 'Completed', 'Cancelled'].map(tab => (
                    <Button
                      key={tab}
                      variant={tab === 'All Games' ? "default" : "outline"}
                      size="sm"
                      className="rounded-full"
                    >
                      {tab}
                      {tab === 'Upcoming' && (
                        <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
                          3
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Step Navigation */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Step Navigation</h2>
          <Card>
            <CardHeader>
              <CardTitle>Wizard Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                {[
                  { step: 1, label: 'Team Details', completed: true },
                  { step: 2, label: 'Add Players', completed: true },
                  { step: 3, label: 'Schedule Games', completed: false, current: true },
                  { step: 4, label: 'Review & Confirm', completed: false }
                ].map(({ step, label, completed, current }) => (
                  <React.Fragment key={step}>
                    <div className="flex items-center space-x-2">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                        ${completed ? 'bg-green-500 text-white' : 
                          current ? 'bg-blue-500 text-white' : 
                          'bg-muted text-muted-foreground border-2'}
                      `}>
                        {completed ? '✓' : step}
                      </div>
                      <div className="text-sm">
                        <div className={current ? 'font-medium' : 'text-muted-foreground'}>
                          {label}
                        </div>
                      </div>
                    </div>
                    {step < 4 && (
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Navigation Guidelines */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Navigation Guidelines</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div>
                  <h4 className="font-semibold mb-3">Breadcrumb Best Practices</h4>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>• Use breadcrumbs for hierarchical navigation</li>
                    <li>• Keep labels concise and descriptive</li>
                    <li>• Don't include the current page as a link</li>
                    <li>• Use icons sparingly for better scannability</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Pagination Guidelines</h4>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>• Show page numbers when space allows</li>
                    <li>• Use ellipsis (...) for truncated ranges</li>
                    <li>• Always include first and last page</li>
                    <li>• Disable buttons when not applicable</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Tab Navigation</h4>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>• Limit to 5-7 tabs for usability</li>
                    <li>• Use consistent tab heights and spacing</li>
                    <li>• Provide clear active state indication</li>
                    <li>• Consider vertical tabs for narrow spaces</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Accessibility</h4>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>• Use proper ARIA labels and roles</li>
                    <li>• Support keyboard navigation</li>
                    <li>• Ensure sufficient color contrast</li>
                    <li>• Provide focus indicators</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </PageTemplate>
  );
}
