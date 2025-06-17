
import React from 'react';
import { Helmet } from 'react-helmet';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function GridExamples() {
  return (
    <PageTemplate
      title="Grid Examples"
      subtitle="Masonry layouts, responsive grids, and card arrangements"
      breadcrumbs={[
        { label: 'Component Examples', href: '/component-examples' },
        { label: 'Grid Examples' }
      ]}
    >
      <Helmet>
        <title>Grid Examples | Team Manager</title>
      </Helmet>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Responsive Player Grid</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      A{i + 1}
                    </div>
                    <div>
                      <div className="font-medium">Player {i + 1}</div>
                      <div className="text-sm text-gray-600">Position: GA</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Masonry Layout</h2>
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            <Card className="break-inside-avoid">
              <CardHeader>
                <CardTitle>Team Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Games Won</span>
                    <Badge>12</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Games Lost</span>
                    <Badge variant="outline">3</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="break-inside-avoid">
              <CardHeader>
                <CardTitle>Recent Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  The team has been showing excellent form in recent matches, with strong performances across all positions.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Average Score</span>
                    <Badge>52.3</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Goals Conceded</span>
                    <Badge variant="outline">45.1</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Goal Difference</span>
                    <Badge className="bg-green-600">+7.2</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="break-inside-avoid">
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">85%</div>
                  <div className="text-sm text-gray-600">Win Rate</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </PageTemplate>
  );
}
