
import React from 'react';
import { Helmet } from 'react-helmet';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResultBadge } from '@/components/ui/result-badge';

export default function ResultBadgeExamples() {
  return (
    <PageTemplate
      title="Result Badge Examples"
      subtitle="Win/Loss/Draw circle badges and result indicators"
      breadcrumbs={[
        { label: 'Component Examples', href: '/component-examples' },
        { label: 'Result Badge Examples' }
      ]}
    >
      <Helmet>
        <title>Result Badge Examples | Team Manager</title>
      </Helmet>

      <div className="space-y-8">
        {/* Basic Result Badges */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Basic Result Badges</h2>
          <Card>
            <CardHeader>
              <CardTitle>Standard W/L/D Circles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <ResultBadge result="win" />
                  <p className="text-sm mt-2">Win</p>
                </div>
                <div className="text-center">
                  <ResultBadge result="loss" />
                  <p className="text-sm mt-2">Loss</p>
                </div>
                <div className="text-center">
                  <ResultBadge result="draw" />
                  <p className="text-sm mt-2">Draw</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Different Sizes */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Different Sizes</h2>
          <Card>
            <CardHeader>
              <CardTitle>Size Variations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Small (sm)</h3>
                  <div className="flex items-center space-x-3">
                    <ResultBadge result="win" size="sm" />
                    <ResultBadge result="loss" size="sm" />
                    <ResultBadge result="draw" size="sm" />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Medium (default)</h3>
                  <div className="flex items-center space-x-3">
                    <ResultBadge result="win" />
                    <ResultBadge result="loss" />
                    <ResultBadge result="draw" />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Large (lg)</h3>
                  <div className="flex items-center space-x-3">
                    <ResultBadge result="win" size="lg" />
                    <ResultBadge result="loss" size="lg" />
                    <ResultBadge result="draw" size="lg" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Usage in Game Results */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Usage in Game Results</h2>
          <Card>
            <CardHeader>
              <CardTitle>Game Result Cards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">vs Deep Creek</p>
                    <p className="text-sm text-gray-500">June 7, 2025</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-bold">45 - 42</span>
                    <ResultBadge result="win" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">vs Doncaster</p>
                    <p className="text-sm text-gray-500">May 31, 2025</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-bold">38 - 41</span>
                    <ResultBadge result="loss" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">vs Donvale</p>
                    <p className="text-sm text-gray-500">May 24, 2025</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-bold">35 - 35</span>
                    <ResultBadge result="draw" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Recent Form */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Recent Form Display</h2>
          <Card>
            <CardHeader>
              <CardTitle>Team Form Tracker</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Lyrebirds - Last 5 Games</h3>
                  <div className="flex items-center space-x-2">
                    <ResultBadge result="win" size="sm" />
                    <ResultBadge result="win" size="sm" />
                    <ResultBadge result="loss" size="sm" />
                    <ResultBadge result="win" size="sm" />
                    <ResultBadge result="draw" size="sm" />
                    <span className="text-sm text-gray-500 ml-2">(Most recent on right)</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Eagles - Last 5 Games</h3>
                  <div className="flex items-center space-x-2">
                    <ResultBadge result="loss" size="sm" />
                    <ResultBadge result="loss" size="sm" />
                    <ResultBadge result="win" size="sm" />
                    <ResultBadge result="loss" size="sm" />
                    <ResultBadge result="win" size="sm" />
                    <span className="text-sm text-gray-500 ml-2">(Most recent on right)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Compact List View */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Compact List View</h2>
          <Card>
            <CardHeader>
              <CardTitle>Game Results Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center space-x-3">
                    <ResultBadge result="win" size="sm" />
                    <span>vs Deep Creek</span>
                  </div>
                  <span className="text-sm font-medium">45-42</span>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center space-x-3">
                    <ResultBadge result="loss" size="sm" />
                    <span>vs Doncaster</span>
                  </div>
                  <span className="text-sm font-medium">38-41</span>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center space-x-3">
                    <ResultBadge result="win" size="sm" />
                    <span>vs Donvale</span>
                  </div>
                  <span className="text-sm font-medium">42-39</span>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center space-x-3">
                    <ResultBadge result="draw" size="sm" />
                    <span>vs Eltham Panthers</span>
                  </div>
                  <span className="text-sm font-medium">35-35</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Statistics Integration */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Statistics Integration</h2>
          <Card>
            <CardHeader>
              <CardTitle>Season Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="flex justify-center mb-2">
                    <ResultBadge result="win" size="lg" />
                  </div>
                  <p className="text-2xl font-bold text-green-700">12</p>
                  <p className="text-sm text-green-600">Wins</p>
                </div>
                
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="flex justify-center mb-2">
                    <ResultBadge result="loss" size="lg" />
                  </div>
                  <p className="text-2xl font-bold text-red-700">6</p>
                  <p className="text-sm text-red-600">Losses</p>
                </div>
                
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="flex justify-center mb-2">
                    <ResultBadge result="draw" size="lg" />
                  </div>
                  <p className="text-2xl font-bold text-yellow-700">2</p>
                  <p className="text-sm text-yellow-600">Draws</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </PageTemplate>
  );
}
