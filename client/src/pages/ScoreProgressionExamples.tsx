
import React from 'react';
import { Helmet } from 'react-helmet';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function ScoreProgressionExamples() {
  const scoreData = [
    { quarter: 'Q1', home: 15, away: 12, trend: 'up' },
    { quarter: 'Q2', home: 27, away: 28, trend: 'down' },
    { quarter: 'Q3', home: 43, away: 39, trend: 'up' },
    { quarter: 'Q4', home: 58, away: 51, trend: 'up' },
  ];

  return (
    <PageTemplate
      title="Score Progression Examples"
      subtitle="Real-time score tracking patterns and visualization"
      breadcrumbs={[
        { label: 'Component Examples', href: '/component-examples' },
        { label: 'Score Progression Examples' }
      ]}
    >
      <Helmet>
        <title>Score Progression Examples | Team Manager</title>
      </Helmet>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Live Score Tracker</h2>
          <Card>
            <CardHeader>
              <CardTitle>WNC Dingoes vs Deep Creek</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="text-6xl font-bold text-red-600 mb-2">58 - 51</div>
                <Badge className="bg-green-600 text-lg px-4 py-2">Final Result</Badge>
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                {scoreData.map((quarter, index) => (
                  <div key={quarter.quarter} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="font-semibold text-gray-600 mb-2">{quarter.quarter}</div>
                    <div className="text-2xl font-bold mb-2">{quarter.home}-{quarter.away}</div>
                    <div className="flex items-center justify-center">
                      {quarter.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                      {quarter.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                      {quarter.trend === 'neutral' && <Minus className="w-4 h-4 text-gray-500" />}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Quarter Performance</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Scoring by Quarter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                    <span className="font-medium">Quarter 1</span>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-blue-600">15</Badge>
                      <span className="text-sm text-gray-600">vs 12</span>
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded">
                    <span className="font-medium">Quarter 2</span>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-orange-600">12</Badge>
                      <span className="text-sm text-gray-600">vs 16</span>
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                    <span className="font-medium">Quarter 3</span>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-600">16</Badge>
                      <span className="text-sm text-gray-600">vs 11</span>
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded">
                    <span className="font-medium">Quarter 4</span>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-purple-600">15</Badge>
                      <span className="text-sm text-gray-600">vs 12</span>
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Running Totals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="font-medium">End of Q1</span>
                    <div className="text-lg font-bold">15 - 12</div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="font-medium">End of Q2</span>
                    <div className="text-lg font-bold">27 - 28</div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="font-medium">End of Q3</span>
                    <div className="text-lg font-bold">43 - 39</div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded border-2 border-green-200">
                    <span className="font-medium">Final Score</span>
                    <div className="text-lg font-bold text-green-700">58 - 51</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Progress Indicators</h2>
          <Card>
            <CardHeader>
              <CardTitle>Game Momentum</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>WNC Dingoes</span>
                    <span>Deep Creek</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-red-600 h-3 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  <div className="text-center mt-2 text-sm font-medium">65% possession advantage</div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-blue-50 rounded">
                    <div className="text-2xl font-bold text-blue-600">7</div>
                    <div className="text-sm text-gray-600">Lead Changes</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded">
                    <div className="text-2xl font-bold text-green-600">+7</div>
                    <div className="text-sm text-gray-600">Final Margin</div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded">
                    <div className="text-2xl font-bold text-purple-600">16</div>
                    <div className="text-sm text-gray-600">Biggest Lead</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </PageTemplate>
  );
}
