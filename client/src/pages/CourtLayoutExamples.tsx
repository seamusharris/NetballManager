
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CourtDisplay } from '@/components/ui/court-display';
import { CourtView } from '@/components/roster/CourtView';
import { BalancedCourtView } from '@/components/roster/BalancedCourtView';
import { 
  Grid, 
  Layout, 
  Users, 
  Target, 
  RotateCcw,
  Maximize,
  Eye,
  Download,
  Settings,
  Info
} from 'lucide-react';

export default function CourtLayoutExamples() {
  const [selectedQuarter, setSelectedQuarter] = useState(1);
  const [selectedLayout, setSelectedLayout] = useState<'vertical' | 'horizontal'>('vertical');

  // Sample data for demonstrations
  const samplePlayers = [
    { id: 1, displayName: 'Sarah J', firstName: 'Sarah', lastName: 'Johnson', avatarColor: '#3b82f6' },
    { id: 2, displayName: 'Emma W', firstName: 'Emma', lastName: 'Wilson', avatarColor: '#ef4444' },
    { id: 3, displayName: 'Kate B', firstName: 'Kate', lastName: 'Brown', avatarColor: '#10b981' },
    { id: 4, displayName: 'Lily C', firstName: 'Lily', lastName: 'Cooper', avatarColor: '#f59e0b' },
    { id: 5, displayName: 'Amy D', firstName: 'Amy', lastName: 'Davis', avatarColor: '#8b5cf6' },
    { id: 6, displayName: 'Zoe M', firstName: 'Zoe', lastName: 'Miller', avatarColor: '#ec4899' },
    { id: 7, displayName: 'Beth S', firstName: 'Beth', lastName: 'Smith', avatarColor: '#06b6d4' }
  ];

  const sampleRoster = [
    { quarter: 1, position: 'GS', playerId: 1 },
    { quarter: 1, position: 'GA', playerId: 2 },
    { quarter: 1, position: 'WA', playerId: 3 },
    { quarter: 1, position: 'C', playerId: 4 },
    { quarter: 1, position: 'WD', playerId: 5 },
    { quarter: 1, position: 'GD', playerId: 6 },
    { quarter: 1, position: 'GK', playerId: 7 },
    
    { quarter: 2, position: 'GS', playerId: 2 },
    { quarter: 2, position: 'GA', playerId: 1 },
    { quarter: 2, position: 'WA', playerId: 4 },
    { quarter: 2, position: 'C', playerId: 3 },
    { quarter: 2, position: 'WD', playerId: 6 },
    { quarter: 2, position: 'GD', playerId: 5 },
    { quarter: 2, position: 'GK', playerId: 7 },
    
    // Quarters 3 and 4 with some missing positions to show unassigned states
    { quarter: 3, position: 'GS', playerId: 1 },
    { quarter: 3, position: 'GA', playerId: 3 },
    { quarter: 3, position: 'WA', playerId: null },
    { quarter: 3, position: 'C', playerId: 4 },
    { quarter: 3, position: 'WD', playerId: 5 },
    { quarter: 3, position: 'GD', playerId: null },
    { quarter: 3, position: 'GK', playerId: 7 },
    
    { quarter: 4, position: 'GS', playerId: 2 },
    { quarter: 4, position: 'GA', playerId: 1 },
    { quarter: 4, position: 'WA', playerId: 3 },
    { quarter: 4, position: 'C', playerId: 5 },
    { quarter: 4, position: 'WD', playerId: 4 },
    { quarter: 4, position: 'GD', playerId: 6 },
    { quarter: 4, position: 'GK', playerId: 7 }
  ];

  const incompleteRoster = [
    { quarter: 1, position: 'GS', playerId: 1 },
    { quarter: 1, position: 'GA', playerId: null },
    { quarter: 1, position: 'WA', playerId: 3 },
    { quarter: 1, position: 'C', playerId: null },
    { quarter: 1, position: 'WD', playerId: 5 },
    { quarter: 1, position: 'GD', playerId: null },
    { quarter: 1, position: 'GK', playerId: 7 }
  ];

  return (
    <PageTemplate 
      title="Court Layout Examples" 
      breadcrumbs={[
        { label: "Component Examples", href: "/component-examples" },
        { label: "Court Layout Examples" }
      ]}
    >
      <div className="space-y-8">
        <Helmet>
          <title>Court Layout Examples - Netball App</title>
        </Helmet>

        <div className="prose max-w-none">
          <p className="text-lg text-gray-700">
            Comprehensive court layout components for visualizing player positions, roster assignments, and court diagrams.
          </p>
        </div>

        {/* Interactive Controls */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Interactive Court Display</h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Court Display Component</span>
              </CardTitle>
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex gap-2">
                  <span className="text-sm font-medium">Quarter:</span>
                  {[1, 2, 3, 4].map(q => (
                    <Button 
                      key={q} 
                      variant={q === selectedQuarter ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setSelectedQuarter(q)}
                    >
                      Q{q}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <span className="text-sm font-medium">Layout:</span>
                  <Button 
                    variant={selectedLayout === 'vertical' ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setSelectedLayout('vertical')}
                  >
                    Vertical
                  </Button>
                  <Button 
                    variant={selectedLayout === 'horizontal' ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setSelectedLayout('horizontal')}
                  >
                    Horizontal
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <CourtDisplay
                  roster={sampleRoster}
                  players={samplePlayers}
                  quarter={selectedQuarter}
                  layout={selectedLayout}
                  showPositionLabels={true}
                />
              </div>
              <div className="mt-4 text-sm text-gray-600 text-center">
                Interactive court display with quarter selection and layout switching
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Layout Variations */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Layout Variations</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Vertical Layout */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Layout className="h-5 w-5" />
                  <span>Vertical Layout</span>
                </CardTitle>
                <Badge variant="outline">Portrait</Badge>
              </CardHeader>
              <CardContent>
                <CourtDisplay
                  roster={sampleRoster}
                  players={samplePlayers}
                  quarter={1}
                  layout="vertical"
                  showPositionLabels={true}
                  className="max-w-sm mx-auto"
                />
                <div className="mt-4 text-sm text-gray-600">
                  <p><strong>Best for:</strong> Mobile devices, narrow containers</p>
                  <p><strong>Aspect ratio:</strong> 1:2 (portrait orientation)</p>
                  <p><strong>Positioning:</strong> Traditional netball court view</p>
                </div>
              </CardContent>
            </Card>

            {/* Horizontal Layout */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <RotateCcw className="h-5 w-5" />
                  <span>Horizontal Layout</span>
                </CardTitle>
                <Badge variant="outline">Landscape</Badge>
              </CardHeader>
              <CardContent>
                <CourtDisplay
                  roster={sampleRoster}
                  players={samplePlayers}
                  quarter={1}
                  layout="horizontal"
                  showPositionLabels={true}
                />
                <div className="mt-4 text-sm text-gray-600">
                  <p><strong>Best for:</strong> Desktop displays, wide containers</p>
                  <p><strong>Aspect ratio:</strong> 2:1 (landscape orientation)</p>
                  <p><strong>Positioning:</strong> Rotated for better screen utilization</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Specialized Court Views */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Specialized Court Views</h2>
          <div className="space-y-6">
            
            {/* Full Court View with Roster */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Grid className="h-5 w-5" />
                  <span>Court View with Position List</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CourtView
                  quarter={1}
                  roster={sampleRoster}
                  players={samplePlayers}
                />
                <div className="mt-4 text-sm text-gray-600">
                  Combined court diagram with detailed position assignments list
                </div>
              </CardContent>
            </Card>

            {/* Balanced Court View */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Balanced Court View</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BalancedCourtView
                  roster={sampleRoster}
                  players={samplePlayers}
                  initialQuarter={1}
                />
                <div className="mt-4 text-sm text-gray-600">
                  Interactive court view with built-in quarter controls and balanced layout
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* State Variations */}
        <section>
          <h2 className="text-2xl font-bold mb-6">State Variations</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Complete Roster */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Complete Roster</CardTitle>
              </CardHeader>
              <CardContent>
                <CourtDisplay
                  roster={sampleRoster}
                  players={samplePlayers}
                  quarter={1}
                  layout="vertical"
                  showPositionLabels={true}
                  className="max-w-xs mx-auto"
                />
                <div className="mt-4 text-center">
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    All positions filled
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Incomplete Roster */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Incomplete Roster</CardTitle>
              </CardHeader>
              <CardContent>
                <CourtDisplay
                  roster={incompleteRoster}
                  players={samplePlayers}
                  quarter={1}
                  layout="vertical"
                  showPositionLabels={true}
                  className="max-w-xs mx-auto"
                />
                <div className="mt-4 text-center">
                  <Badge variant="outline" className="bg-amber-50 text-amber-700">
                    Positions missing
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Empty Roster */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Empty Roster</CardTitle>
              </CardHeader>
              <CardContent>
                <CourtDisplay
                  roster={[]}
                  players={samplePlayers}
                  quarter={1}
                  layout="vertical"
                  showPositionLabels={true}
                  className="max-w-xs mx-auto"
                />
                <div className="mt-4 text-center">
                  <Badge variant="outline" className="bg-red-50 text-red-700">
                    No assignments
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Configuration Options */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Configuration Options</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* With Position Labels */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>With Position Labels</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CourtDisplay
                  roster={sampleRoster}
                  players={samplePlayers}
                  quarter={1}
                  layout="vertical"
                  showPositionLabels={true}
                  className="max-w-sm mx-auto"
                />
                <div className="mt-4 text-sm text-gray-600">
                  <code>showPositionLabels={`{true}`}</code> - Shows position abbreviations (GS, GA, etc.)
                </div>
              </CardContent>
            </Card>

            {/* Without Position Labels */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Without Position Labels</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CourtDisplay
                  roster={sampleRoster}
                  players={samplePlayers}
                  quarter={1}
                  layout="vertical"
                  showPositionLabels={false}
                  className="max-w-sm mx-auto"
                />
                <div className="mt-4 text-sm text-gray-600">
                  <code>showPositionLabels={`{false}`}</code> - Shows only player names for cleaner look
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Use Cases */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Common Use Cases</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Game Details Page */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Game Details Page</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-center gap-2 mb-4">
                    {[1, 2, 3, 4].map(q => (
                      <Button 
                        key={q} 
                        variant={q === 1 ? "default" : "outline"} 
                        size="sm"
                      >
                        Q{q}
                      </Button>
                    ))}
                  </div>
                  <CourtDisplay
                    roster={sampleRoster}
                    players={samplePlayers}
                    quarter={1}
                    layout="horizontal"
                    showPositionLabels={true}
                  />
                  <div className="text-sm text-gray-600">
                    Horizontal layout with quarter navigation for game analysis
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Roster Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Roster Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CourtView
                  quarter={1}
                  roster={sampleRoster}
                  players={samplePlayers}
                />
                <div className="mt-4 text-sm text-gray-600">
                  Combined view for editing and visualizing roster assignments
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Implementation Guidelines */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Implementation Guidelines</h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="h-5 w-5" />
                <span>Best Practices</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Layout Selection</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Vertical:</strong> Mobile-first, narrow containers, traditional view</div>
                    <div><strong>Horizontal:</strong> Desktop displays, wide screens, game analysis</div>
                    <div><strong>Responsive:</strong> Use media queries to switch layouts automatically</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Performance Considerations</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Memoization:</strong> Use React.memo for court components</div>
                    <div><strong>Data structure:</strong> Optimize roster lookup with useMemo</div>
                    <div><strong>Rendering:</strong> Avoid re-rendering on every quarter change</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Accessibility</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Alt text:</strong> Provide court position descriptions</div>
                    <div><strong>Color contrast:</strong> Ensure player colors meet WCAG standards</div>
                    <div><strong>Keyboard navigation:</strong> Support tab navigation for interactions</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">State Management</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Empty states:</strong> Handle missing player assignments gracefully</div>
                    <div><strong>Loading states:</strong> Show skeleton during data fetch</div>
                    <div><strong>Error states:</strong> Display fallback when data is invalid</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Component API Reference */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Component API Reference</h2>
          <Card>
            <CardHeader>
              <CardTitle>CourtDisplay Props</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Prop</th>
                        <th className="text-left p-2">Type</th>
                        <th className="text-left p-2">Default</th>
                        <th className="text-left p-2">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-2 font-mono">roster</td>
                        <td className="p-2">Array</td>
                        <td className="p-2">required</td>
                        <td className="p-2">Array of position assignments</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-mono">players</td>
                        <td className="p-2">Array</td>
                        <td className="p-2">required</td>
                        <td className="p-2">Array of player objects</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-mono">quarter</td>
                        <td className="p-2">number</td>
                        <td className="p-2">required</td>
                        <td className="p-2">Current quarter (1-4)</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-mono">layout</td>
                        <td className="p-2">'vertical' | 'horizontal'</td>
                        <td className="p-2">'vertical'</td>
                        <td className="p-2">Court orientation</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-mono">showPositionLabels</td>
                        <td className="p-2">boolean</td>
                        <td className="p-2">true</td>
                        <td className="p-2">Show position abbreviations</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-mono">className</td>
                        <td className="p-2">string</td>
                        <td className="p-2">''</td>
                        <td className="p-2">Additional CSS classes</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </PageTemplate>
  );
}
