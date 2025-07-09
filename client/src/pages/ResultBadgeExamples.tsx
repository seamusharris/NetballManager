
import React from 'react';
import { Helmet } from 'react-helmet';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResultBadge, type GameResult } from '@/components/ui/result-badge';
import { Badge } from '@/components/ui/badge';

export default function ResultBadgeExamples() {
  const gameResults: GameResult[] = ['Win', 'Loss', 'Draw'];
  
  return (
    <PageTemplate 
      title="Result Badge Examples" 
      breadcrumbs={[
        { label: "Component Examples", href: "/component-examples" },
        { label: "Result Badge Examples" }
      ]}
    >
      <Helmet>
        <title>Result Badge Examples - Component Library</title>
        <meta name="description" content="Standardized win/loss/draw result badges with different sizes and use cases" />
      </Helmet>

      <div className="prose max-w-none mb-6">
        <p className="text-lg text-gray-700">
          Standardized result badges for displaying game outcomes with consistent colors and sizing
        </p>
      </div>

      <div className="space-y-6">
        {/* Basic Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Result Badges</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="w-16 text-sm text-gray-600">Default:</span>
              {gameResults.map((result) => (
                <div key={result} className="flex items-center gap-2">
                  <ResultBadge result={result} />
                  <span className="text-sm text-gray-600">{result}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <span className="w-16 text-sm text-gray-600">Medium:</span>
              {gameResults.map((result) => (
                <div key={result} className="flex items-center gap-2">
                  <ResultBadge result={result} size="md" />
                  <span className="text-sm text-gray-600">{result}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <span className="w-16 text-sm text-gray-600">Small:</span>
              {gameResults.map((result) => (
                <div key={result} className="flex items-center gap-2">
                  <ResultBadge result={result} size="sm" />
                  <span className="text-sm text-gray-600">{result}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Color Standards */}
        <Card>
          <CardHeader>
            <CardTitle>Color Standards</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <ResultBadge result="Win" className="mx-auto mb-2" />
                <h4 className="font-semibold text-green-800">Win</h4>
                <p className="text-sm text-green-600">Green background (#22c55e)</p>
                <p className="text-xs text-gray-600">White text for contrast</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <ResultBadge result="Loss" className="mx-auto mb-2" />
                <h4 className="font-semibold text-red-800">Loss</h4>
                <p className="text-sm text-red-600">Red background (#ef4444)</p>
                <p className="text-xs text-gray-600">White text for contrast</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <ResultBadge result="Draw" className="mx-auto mb-2" />
                <h4 className="font-semibold text-yellow-800">Draw</h4>
                <p className="text-sm text-yellow-600">Yellow background (#eab308)</p>
                <p className="text-xs text-gray-600">White text for contrast</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Size Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Size Comparison</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-6">
              <div className="text-center">
                <ResultBadge result="Win" size="sm" className="mb-2" />
                <p className="text-xs text-gray-600">Small (24px)</p>
                <p className="text-xs text-gray-500">h-6 w-6</p>
              </div>
              <div className="text-center">
                <ResultBadge result="Win" size="md" className="mb-2" />
                <p className="text-xs text-gray-600">Medium (28px)</p>
                <p className="text-xs text-gray-500">h-7 w-7</p>
              </div>
              <div className="text-center">
                <ResultBadge result="Win" size="default" className="mb-2" />
                <p className="text-xs text-gray-600">Default (32px)</p>
                <p className="text-xs text-gray-500">h-8 w-8</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Common Use Cases */}
        <Card>
          <CardHeader>
            <CardTitle>Common Use Cases</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Recent Form Display */}
            <div>
              <h4 className="font-semibold mb-3">Recent Form (Last 5 Games)</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Team Form:</span>
                <ResultBadge result="Win" size="sm" />
                <ResultBadge result="Win" size="sm" />
                <ResultBadge result="Loss" size="sm" />
                <ResultBadge result="Win" size="sm" />
                <ResultBadge result="Draw" size="sm" />
                <span className="text-sm text-gray-500 ml-2">(W-W-L-W-D)</span>
              </div>
            </div>

            {/* Game Results List */}
            <div>
              <h4 className="font-semibold mb-3">Game Results List</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <ResultBadge result="Win" />
                    <span className="font-medium">vs Thunder Hawks</span>
                  </div>
                  <div className="text-sm text-gray-600">24-18</div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <ResultBadge result="Loss" />
                    <span className="font-medium">vs Lightning Bolts</span>
                  </div>
                  <div className="text-sm text-gray-600">15-22</div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <ResultBadge result="Draw" />
                    <span className="font-medium">vs Storm Riders</span>
                  </div>
                  <div className="text-sm text-gray-600">20-20</div>
                </div>
              </div>
            </div>

            {/* Season Summary */}
            <div>
              <h4 className="font-semibold mb-3">Season Summary</h4>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-blue-900">WNC Emus - Season Record</h5>
                  <Badge variant="outline">14 Games</Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col items-center">
                    <ResultBadge result="Win" className="mb-2" />
                    <span className="text-2xl font-bold text-green-600">9</span>
                    <span className="text-sm text-gray-600">Wins</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <ResultBadge result="Loss" className="mb-2" />
                    <span className="text-2xl font-bold text-red-600">4</span>
                    <span className="text-sm text-gray-600">Losses</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <ResultBadge result="Draw" className="mb-2" />
                    <span className="text-2xl font-bold text-yellow-600">1</span>
                    <span className="text-sm text-gray-600">Draws</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Compact Display */}
            <div>
              <h4 className="font-semibold mb-3">Compact Display (Dashboard Widgets)</h4>
              <div className="flex items-center gap-4 p-3 bg-white rounded-lg border">
                <span className="text-sm font-medium">Quick Stats:</span>
                <div className="flex items-center gap-1">
                  <ResultBadge result="Win" size="sm" />
                  <span className="text-sm">9</span>
                </div>
                <div className="flex items-center gap-1">
                  <ResultBadge result="Loss" size="sm" />
                  <span className="text-sm">4</span>
                </div>
                <div className="flex items-center gap-1">
                  <ResultBadge result="Draw" size="sm" />
                  <span className="text-sm">1</span>
                </div>
                <span className="text-sm text-gray-500">64% win rate</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Implementation Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Implementation Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Usage Guidelines</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use consistent colors across the application</li>
                <li>• Small size (sm) for compact displays and lists</li>
                <li>• Medium size (md) for cards and detailed views</li>
                <li>• Default size for prominent displays and summaries</li>
                <li>• Always pair with clear context (opponent, score, etc.)</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Technical Details</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Component: <code className="bg-gray-200 px-1 rounded">ResultBadge</code></li>
                <li>• Props: <code className="bg-gray-200 px-1 rounded">result, size?, className?</code></li>
                <li>• Results: <code className="bg-gray-200 px-1 rounded">'Win' | 'Loss' | 'Draw'</code></li>
                <li>• Sizes: <code className="bg-gray-200 px-1 rounded">'sm' | 'md' | 'default'</code></li>
                <li>• Always circular with centered letters (W/L/D)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
}
