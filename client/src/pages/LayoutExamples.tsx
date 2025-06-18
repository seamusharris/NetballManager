
import React from 'react';
import { Helmet } from 'react-helmet';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlayerBox } from '@/components/ui/player-box';
import { TeamBox } from '@/components/ui/team-box';
import GameResultCard from '@/components/ui/game-result-card';
import { BaseWidget } from '@/components/ui/base-widget';
import { 
  Grid, Columns, Rows, Layout, Monitor, Smartphone, 
  Tablet, ArrowRight, Eye, Edit, Plus, BarChart3
} from 'lucide-react';

export default function LayoutExamples() {
  const samplePlayer = {
    id: 1,
    displayName: "Sarah Johnson",
    firstName: "Sarah",
    lastName: "Johnson",
    positionPreferences: ["GA", "GS"],
    avatarColor: "bg-blue-500",
    active: true
  };

  const sampleTeam = {
    id: 116,
    name: "Lightning Bolts",
    division: "A Grade",
    seasonName: "Spring 2025",
    clubName: "Thunder Netball Club",
    isActive: true
  };

  return (
    <PageTemplate 
      title="Layout Examples" 
      breadcrumbs={[
        { label: "Component Examples", href: "/component-examples" },
        { label: "Layout Examples" }
      ]}
    >
      <div className="space-y-8">
        <div className="prose max-w-none">
          <p className="text-lg text-gray-700">
            Standard page templates and layout patterns for consistent user experience across different screen sizes.
          </p>
        </div>

        {/* Page Layout Templates */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Page Layout Templates</h2>
          
          {/* Standard Page Layout */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                Standard Page Layout
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg bg-gray-50">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold">Page Title</h3>
                      <p className="text-muted-foreground">Page description or subtitle</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Primary Action
                      </Button>
                    </div>
                  </div>
                  <div className="h-48 bg-white border border-gray-200 rounded flex items-center justify-center text-muted-foreground">
                    Page Content Area
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dashboard Layout */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Grid className="h-5 w-5" />
                Dashboard Layout
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="h-32 bg-white border border-gray-200 rounded flex items-center justify-center text-muted-foreground">
                    Widget 1
                  </div>
                  <div className="h-32 bg-white border border-gray-200 rounded flex items-center justify-center text-muted-foreground">
                    Widget 2
                  </div>
                  <div className="h-32 bg-white border border-gray-200 rounded flex items-center justify-center text-muted-foreground">
                    Widget 3
                  </div>
                  <div className="md:col-span-2 h-48 bg-white border border-gray-200 rounded flex items-center justify-center text-muted-foreground">
                    Large Widget
                  </div>
                  <div className="h-48 bg-white border border-gray-200 rounded flex items-center justify-center text-muted-foreground">
                    Side Widget
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* List Layout */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rows className="h-5 w-5" />
                List Layout
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg bg-gray-50">
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-white border border-gray-200 rounded flex items-center justify-between px-4">
                      <span className="text-muted-foreground">List Item {i}</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Responsive Grid Examples */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Responsive Grid Layouts</h2>
          
          {/* Card Grid */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Card Grid Layout</CardTitle>
              <p className="text-sm text-muted-foreground">
                Responsive grid that adapts from 1 column on mobile to 4 columns on desktop
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <PlayerBox player={samplePlayer} />
                <PlayerBox player={{...samplePlayer, id: 2, displayName: "Emma Wilson", firstName: "Emma", lastName: "Wilson", avatarColor: "bg-green-500"}} />
                <PlayerBox player={{...samplePlayer, id: 3, displayName: "Kate Brown", firstName: "Kate", lastName: "Brown", avatarColor: "bg-purple-500"}} />
                <PlayerBox player={{...samplePlayer, id: 4, displayName: "Lily Chen", firstName: "Lily", lastName: "Chen", avatarColor: "bg-pink-500"}} />
              </div>
            </CardContent>
          </Card>

          {/* Mixed Grid */}
          <Card>
            <CardHeader>
              <CardTitle>Mixed Content Grid</CardTitle>
              <p className="text-sm text-muted-foreground">
                Combining different component types in a responsive grid
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <TeamBox team={sampleTeam} variant="default" />
                <BaseWidget title="Quick Stats" description="Key metrics">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <div className="text-xl font-bold text-blue-900">12</div>
                      <div className="text-xs text-blue-700">Games</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded">
                      <div className="text-xl font-bold text-green-900">9</div>
                      <div className="text-xs text-green-700">Wins</div>
                    </div>
                  </div>
                </BaseWidget>
                <div className="md:col-span-2 lg:col-span-1">
                  <GameResultCard
                    date="2025-06-08"
                    time="2:00 PM"
                    round="Round 5"
                    homeTeam="Lightning Bolts"
                    awayTeam="Storm Eagles"
                    homeScore={25}
                    awayScore={18}
                    result="won"
                    venue="Court 1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Responsive Breakpoints */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Responsive Breakpoints</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Mobile (320px+)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• Single column layout</li>
                  <li>• Stacked navigation</li>
                  <li>• Full-width components</li>
                  <li>• Touch-friendly buttons</li>
                  <li>• Simplified content</li>
                </ul>
                <div className="mt-4 p-3 bg-muted/30 rounded text-xs">
                  grid-cols-1
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tablet className="h-5 w-5" />
                  Tablet (768px+)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• 2-3 column layouts</li>
                  <li>• Sidebar navigation</li>
                  <li>• Balanced content areas</li>
                  <li>• Medium-sized components</li>
                  <li>• Optimized spacing</li>
                </ul>
                <div className="mt-4 p-3 bg-muted/30 rounded text-xs">
                  md:grid-cols-2
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Desktop (1024px+)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• 3-4 column layouts</li>
                  <li>• Full sidebar navigation</li>
                  <li>• Dense information display</li>
                  <li>• Compact components</li>
                  <li>• Generous whitespace</li>
                </ul>
                <div className="mt-4 p-3 bg-muted/30 rounded text-xs">
                  lg:grid-cols-3 xl:grid-cols-4
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Content Organization */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Content Organization Patterns</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <Card>
              <CardHeader>
                <CardTitle>Primary-Secondary Layout</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg bg-gray-50">
                  <div className="grid grid-cols-3 gap-4 h-48">
                    <div className="col-span-2 bg-white border border-gray-200 rounded flex items-center justify-center text-muted-foreground">
                      Primary Content (2/3)
                    </div>
                    <div className="bg-white border border-gray-200 rounded flex items-center justify-center text-muted-foreground">
                      Sidebar (1/3)
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Main content with supporting sidebar information
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Equal Columns Layout</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg bg-gray-50">
                  <div className="grid grid-cols-2 gap-4 h-48">
                    <div className="bg-white border border-gray-200 rounded flex items-center justify-center text-muted-foreground">
                      Content A
                    </div>
                    <div className="bg-white border border-gray-200 rounded flex items-center justify-center text-muted-foreground">
                      Content B
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Equal importance content side by side
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Header-Content-Footer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg bg-gray-50">
                  <div className="space-y-4">
                    <div className="h-12 bg-white border border-gray-200 rounded flex items-center justify-center text-muted-foreground">
                      Header Section
                    </div>
                    <div className="h-32 bg-white border border-gray-200 rounded flex items-center justify-center text-muted-foreground">
                      Main Content
                    </div>
                    <div className="h-8 bg-white border border-gray-200 rounded flex items-center justify-center text-muted-foreground">
                      Footer Section
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Traditional top-to-bottom content flow
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tab-Based Layout</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg bg-gray-50">
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      {['Tab 1', 'Tab 2', 'Tab 3'].map((tab, index) => (
                        <div 
                          key={tab}
                          className={`px-3 py-1 text-xs rounded ${
                            index === 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {tab}
                        </div>
                      ))}
                    </div>
                    <div className="h-32 bg-white border border-gray-200 rounded flex items-center justify-center text-muted-foreground">
                      Tab Content Panel
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Tabbed interface for organized content sections
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Layout Guidelines */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Layout Design Guidelines</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Grid className="h-4 w-4" />
                    Grid System
                  </h4>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>• Use 12-column grid system</li>
                    <li>• Consistent gap spacing (4, 6, 8px)</li>
                    <li>• Responsive breakpoints</li>
                    <li>• Auto-fit for dynamic content</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Layout className="h-4 w-4" />
                    Spacing
                  </h4>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>• 24px container padding</li>
                    <li>• 32px section spacing</li>
                    <li>• 16px component gaps</li>
                    <li>• 8px element margins</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Columns className="h-4 w-4" />
                    Content Width
                  </h4>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>• Max 1200px container width</li>
                    <li>• 65ch max for reading content</li>
                    <li>• Flexible component widths</li>
                    <li>• Center-aligned layouts</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Performance Considerations</h4>
                <ul className="text-sm space-y-1 text-blue-800">
                  <li>• Use CSS Grid and Flexbox for layouts</li>
                  <li>• Implement responsive images with proper sizing</li>
                  <li>• Minimize layout shifts with placeholder dimensions</li>
                  <li>• Optimize for mobile-first design approach</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </PageTemplate>
  );
}
