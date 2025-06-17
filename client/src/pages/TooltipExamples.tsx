
import React from 'react';
import { Helmet } from 'react-helmet';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, HelpCircle, AlertTriangle, CheckCircle, Star, Settings } from 'lucide-react';

export default function TooltipExamples() {
  return (
    <PageTemplate
      title="Tooltip Examples"
      subtitle="Various tooltip styles and positioning examples"
      breadcrumbs={[
        { label: 'Component Examples', href: '/component-examples' },
        { label: 'Tooltip Examples' }
      ]}
    >
      <Helmet>
        <title>Tooltip Examples | Team Manager</title>
      </Helmet>

      <TooltipProvider>
        <div className="space-y-8">
          {/* Basic Tooltips */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Basic Tooltips</h2>
            <Card>
              <CardHeader>
                <CardTitle>Simple Tooltip Variations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline">Hover me</Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>This is a basic tooltip</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button>
                        <Info className="w-4 h-4 mr-2" />
                        Info Button
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Additional information about this action</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="secondary" className="cursor-help">
                        Position Rating
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Based on goals, accuracy, and defensive stats</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Icon Tooltips */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Icon Tooltips</h2>
            <Card>
              <CardHeader>
                <CardTitle>Interactive Icons with Tooltips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-6">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        <HelpCircle className="w-6 h-6 text-blue-500" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Click for help documentation</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        <AlertTriangle className="w-6 h-6 text-yellow-500" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Warning: This action cannot be undone</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Task completed successfully</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        <Settings className="w-6 h-6 text-gray-500" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Open settings panel</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Player Stats Tooltips */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Player Stats with Tooltips</h2>
            <Card>
              <CardHeader>
                <CardTitle>Interactive Player Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Abbey N</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center cursor-help">
                            <Star className="w-4 h-4 text-yellow-500 mr-1" />
                            <span>8.5</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1">
                            <p><strong>Player Rating: 8.5/10</strong></p>
                            <p>Goals: 28 (85% accuracy)</p>
                            <p>Games played: 8</p>
                            <p>Average per game: 3.5 goals</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Ava</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center cursor-help">
                            <Star className="w-4 h-4 text-yellow-500 mr-1" />
                            <span>7.8</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1">
                            <p><strong>Player Rating: 7.8/10</strong></p>
                            <p>Intercepts: 15</p>
                            <p>Passes: 142 (78% accuracy)</p>
                            <p>Strong defensive play</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Emily</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center cursor-help">
                            <Star className="w-4 h-4 text-yellow-500 mr-1" />
                            <span>8.2</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1">
                            <p><strong>Player Rating: 8.2/10</strong></p>
                            <p>Rebounds: 22</p>
                            <p>Saves: 18 (88% success)</p>
                            <p>Excellent goalkeeper</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Rich Content Tooltips */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Rich Content Tooltips</h2>
            <Card>
              <CardHeader>
                <CardTitle>Detailed Information Tooltips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        Game Performance Analysis
                        <Info className="w-4 h-4 ml-auto" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <div className="space-y-2">
                        <p className="font-semibold">Last Game vs Deep Creek</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>Goals: 42</div>
                          <div>Accuracy: 85%</div>
                          <div>Turnovers: 8</div>
                          <div>Penalties: 12</div>
                        </div>
                        <p className="text-xs text-gray-600">Strong attacking performance with room for defensive improvement</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        Position Rotation Strategy
                        <Info className="w-4 h-4 ml-auto" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <div className="space-y-2">
                        <p className="font-semibold">Recommended Rotations</p>
                        <div className="text-sm space-y-1">
                          <p><strong>Q1:</strong> Start with strongest defense</p>
                          <p><strong>Q2:</strong> Rotate attackers for fresh legs</p>
                          <p><strong>Q3:</strong> Bring in defensive specialists</p>
                          <p><strong>Q4:</strong> Deploy best goal scorers</p>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </TooltipProvider>
    </PageTemplate>
  );
}
