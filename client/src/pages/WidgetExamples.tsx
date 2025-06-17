
import React from 'react';
import { Helmet } from 'react-helmet';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BaseWidget, CustomHeaderWidget } from '@/components/ui/base-widget';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, BarChart3, Users, Calendar, Trophy, 
  Settings, Download, Eye, Plus, Activity, Target,
  CheckCircle, AlertCircle, Clock, Star
} from 'lucide-react';

export default function WidgetExamples() {
  return (
    <PageTemplate 
      title="Widget Examples" 
      breadcrumbs={[
        { label: "Component Examples", href: "/component-examples" },
        { label: "Widget Examples" }
      ]}
    >
      <div className="space-y-8">
        <div className="prose max-w-none">
          <p className="text-lg text-gray-700">
            Standardized widget patterns for dashboards with consistent backgrounds and styling.
          </p>
        </div>

        {/* Basic Widgets */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Basic Widgets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Standard Widget */}
            <BaseWidget title="Team Performance" description="Recent form analysis">
              <div className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-3xl font-bold text-blue-900">78%</div>
                  <div className="text-sm text-blue-700">Win Rate</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-xl font-bold text-green-900">12</div>
                    <div className="text-xs text-green-700">Wins</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="text-xl font-bold text-red-900">3</div>
                    <div className="text-xs text-red-700">Losses</div>
                  </div>
                </div>
              </div>
            </BaseWidget>

            {/* Success Theme Widget */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Success Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center p-3 bg-green-200/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-900">95%</div>
                    <div className="text-sm text-green-700">Attendance Rate</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center p-2 bg-green-100 rounded">
                      <div className="font-bold text-green-900">18</div>
                      <div className="text-xs text-green-700">Active</div>
                    </div>
                    <div className="text-center p-2 bg-green-100 rounded">
                      <div className="font-bold text-green-900">1</div>
                      <div className="text-xs text-green-700">Injured</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Warning Theme Widget */}
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
              <CardHeader>
                <CardTitle className="text-amber-800 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Attention Required
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center p-3 bg-amber-200/50 rounded-lg">
                    <div className="text-2xl font-bold text-amber-900">65%</div>
                    <div className="text-sm text-amber-700">Form Completion</div>
                  </div>
                  <div className="text-xs text-amber-700">
                    3 players missing registration forms
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Widgets with Actions */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Widgets with Header Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <CustomHeaderWidget
              title="Top Performers"
              description="Players of the week"
              headerContent={
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              }
            >
              <div className="space-y-3">
                {['Sarah Johnson', 'Emma Wilson', 'Kate Brown'].map((name, index) => (
                  <div key={name} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {name[0]}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{name}</div>
                      <div className="text-sm text-muted-foreground">
                        {index === 0 ? 'Top Scorer' : index === 1 ? 'Most Assists' : 'Best Defense'}
                      </div>
                    </div>
                    <Badge variant="secondary">{95 - index * 10}</Badge>
                  </div>
                ))}
              </div>
            </CustomHeaderWidget>

            <CustomHeaderWidget
              title="Quick Actions"
              description="Common tasks"
              headerContent={
                <Button size="sm" variant="ghost">
                  <Settings className="h-4 w-4" />
                </Button>
              }
            >
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Plus className="h-5 w-5 text-green-600" />
                  <span className="text-sm">Add Player</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <span className="text-sm">Schedule</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  <span className="text-sm">Analytics</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Trophy className="h-5 w-5 text-orange-600" />
                  <span className="text-sm">Awards</span>
                </Button>
              </div>
            </CustomHeaderWidget>
          </div>
        </section>

        {/* Metric Widgets */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Metric Display Widgets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-blue-900">24</div>
                    <div className="text-sm text-blue-700">Total Games</div>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
                <div className="mt-2 text-xs text-blue-600">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  +2 from last month
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-green-900">18</div>
                    <div className="text-sm text-green-700">Active Players</div>
                  </div>
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <div className="mt-2 text-xs text-green-600">
                  <CheckCircle className="inline h-3 w-3 mr-1" />
                  All registered
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-purple-900">8.5</div>
                    <div className="text-sm text-purple-700">Avg Rating</div>
                  </div>
                  <Star className="h-8 w-8 text-purple-600" />
                </div>
                <div className="mt-2 text-xs text-purple-600">
                  <Target className="inline h-3 w-3 mr-1" />
                  Season high
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-orange-900">3</div>
                    <div className="text-sm text-orange-700">Upcoming</div>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
                <div className="mt-2 text-xs text-orange-600">
                  <Activity className="inline h-3 w-3 mr-1" />
                  Next in 2 days
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Widget Layout Guidelines */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Widget Design Guidelines</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Standard Dimensions</h4>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>• Small widgets: 280px min width</li>
                    <li>• Medium widgets: 400px min width</li>
                    <li>• Large widgets: 600px+ width</li>
                    <li>• Consistent 24px padding</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Color Themes</h4>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>• Neutral: Standard content widgets</li>
                    <li>• Success: Achievements, positive metrics</li>
                    <li>• Warning: Attention needed, mixed results</li>
                    <li>• Primary: Featured content, key metrics</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Typography</h4>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>• Title: font-semibold, text-base</li>
                    <li>• Description: text-sm, text-muted-foreground</li>
                    <li>• Metrics: font-bold, varying sizes</li>
                    <li>• Labels: text-xs, text-muted-foreground</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Interactive Elements</h4>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>• Actions in header for space efficiency</li>
                    <li>• Ghost buttons for secondary actions</li>
                    <li>• Consistent hover states</li>
                    <li>• Loading states for async content</li>
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
