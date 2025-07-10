import React from 'react';
import { Helmet } from 'react-helmet';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ResultBadge } from '@/components/ui/result-badge';
import { Trophy, Target, TrendingUp, Users } from 'lucide-react';

export default function ResultBadgeExamples() {
  return (
    <PageTemplate
      title="Result Badge Examples"
      subtitle="Standardized win/loss/draw badges and result indicators"
      breadcrumbs={[
        { label: 'Component Examples', href: '/component-examples' },
        { label: 'Result Badge Examples' }
      ]}
    >
      <Helmet>
        <title>Result Badge Examples | Team Manager</title>
      </Helmet>

      <div className="space-y-8">
        {/* Quick Reference - Single Pixel Double Border */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Quick Reference - Single Pixel Double Border</h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Recommended Border Style - All Sizes
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Main color → White border (1px) → Main color outer border (1px) - Works on all backgrounds
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Small */}
                <div>
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-sm font-medium w-16">sm (24px):</span>
                    <span className="text-xs text-muted-foreground">For compact lists and inline use</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white rounded-lg border">
                      <p className="text-xs text-gray-600 mb-2">On white background:</p>
                      <div className="flex gap-2">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold border border-white" style={{boxShadow: '0 0 0 1px #22c55e'}}>
                          W
                        </div>
                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold border border-white" style={{boxShadow: '0 0 0 1px #ef4444'}}>
                          L
                        </div>
                        <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold border border-white" style={{boxShadow: '0 0 0 1px #eab308'}}>
                          D
                        </div>
                        <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs font-bold border border-white" style={{boxShadow: '0 0 0 1px #6b7280'}}>
                          B
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-300 mb-2">On dark background:</p>
                      <div className="flex gap-2">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold border border-white" style={{boxShadow: '0 0 0 1px #22c55e'}}>
                          W
                        </div>
                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold border border-white" style={{boxShadow: '0 0 0 1px #ef4444'}}>
                          L
                        </div>
                        <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold border border-white" style={{boxShadow: '0 0 0 1px #eab308'}}>
                          D
                        </div>
                        <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs font-bold border border-white" style={{boxShadow: '0 0 0 1px #6b7280'}}>
                          B
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Medium */}
                <div>
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-sm font-medium w-16">md (32px):</span>
                    <span className="text-xs text-muted-foreground">Standard size for cards and widgets</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white rounded-lg border">
                      <p className="text-xs text-gray-600 mb-2">On white background:</p>
                      <div className="flex gap-2">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold border border-white" style={{boxShadow: '0 0 0 1px #22c55e'}}>
                          W
                        </div>
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold border border-white" style={{boxShadow: '0 0 0 1px #ef4444'}}>
                          L
                        </div>
                        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-bold border border-white" style={{boxShadow: '0 0 0 1px #eab308'}}>
                          D
                        </div>
                        <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-sm font-bold border border-white" style={{boxShadow: '0 0 0 1px #6b7280'}}>
                          B
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-300 mb-2">On dark background:</p>
                      <div className="flex gap-2">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold border border-white" style={{boxShadow: '0 0 0 1px #22c55e'}}>
                          W
                        </div>
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold border border-white" style={{boxShadow: '0 0 0 1px #ef4444'}}>
                          L
                        </div>
                        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-bold border border-white" style={{boxShadow: '0 0 0 1px #eab308'}}>
                          D
                        </div>
                        <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-sm font-bold border border-white" style={{boxShadow: '0 0 0 1px #6b7280'}}>
                          B
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Large */}
                <div>
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-sm font-medium w-16">lg (40px):</span>
                    <span className="text-xs text-muted-foreground">For headers and emphasis</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white rounded-lg border">
                      <p className="text-xs text-gray-600 mb-2">On white background:</p>
                      <div className="flex gap-2">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white text-base font-bold border border-white" style={{boxShadow: '0 0 0 1px #22c55e'}}>
                          W
                        </div>
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white text-base font-bold border border-white" style={{boxShadow: '0 0 0 1px #ef4444'}}>
                          L
                        </div>
                        <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white text-base font-bold border border-white" style={{boxShadow: '0 0 0 1px #eab308'}}>
                          D
                        </div>
                        <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center text-white text-base font-bold border border-white" style={{boxShadow: '0 0 0 1px #6b7280'}}>
                          B
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-300 mb-2">On dark background:</p>
                      <div className="flex gap-2">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white text-base font-bold border border-white" style={{boxShadow: '0 0 0 1px #22c55e'}}>
                          W
                        </div>
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white text-base font-bold border border-white" style={{boxShadow: '0 0 0 1px #ef4444'}}>
                          L
                        </div>
                        <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white text-base font-bold border border-white" style={{boxShadow: '0 0 0 1px #eab308'}}>
                          D
                        </div>
                        <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center text-white text-base font-bold border border-white" style={{boxShadow: '0 0 0 1px #6b7280'}}>
                          B
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Extra Large */}
                <div>
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-sm font-medium w-16">xl (48px):</span>
                    <span className="text-xs text-muted-foreground">For dashboard highlights</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white rounded-lg border">
                      <p className="text-xs text-gray-600 mb-2">On white background:</p>
                      <div className="flex gap-2">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-lg font-bold border border-white" style={{boxShadow: '0 0 0 1px #22c55e'}}>
                          W
                        </div>
                        <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white text-lg font-bold border border-white" style={{boxShadow: '0 0 0 1px #ef4444'}}>
                          L
                        </div>
                        <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-white text-lg font-bold border border-white" style={{boxShadow: '0 0 0 1px #eab308'}}>
                          D
                        </div>
                        <div className="w-12 h-12 bg-gray-500 rounded-full flex items-center justify-center text-white text-lg font-bold border border-white" style={{boxShadow: '0 0 0 1px #6b7280'}}>
                          B
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-300 mb-2">On dark background:</p>
                      <div className="flex gap-2">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-lg font-bold border border-white" style={{boxShadow: '0 0 0 1px #22c55e'}}>
                          W
                        </div>
                        <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white text-lg font-bold border border-white" style={{boxShadow: '0 0 0 1px #ef4444'}}>
                          L
                        </div>
                        <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-white text-lg font-bold border border-white" style={{boxShadow: '0 0 0 1px #eab308'}}>
                          D
                        </div>
                        <div className="w-12 h-12 bg-gray-500 rounded-full flex items-center justify-center text-white text-lg font-bold border border-white" style={{boxShadow: '0 0 0 1px #6b7280'}}>
                          B
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Quick Reference - Standard Component Sizes */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Quick Reference - Standard Component Sizes</h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Result Badge Component
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Standard sizing system: <code>sm</code>, <code>md</code>, <code>lg</code>, <code>xl</code>
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Extra Small */}
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium w-16">sm:</span>
                  <div className="flex gap-2">
                    <ResultBadge result="Win" size="sm" />
                    <ResultBadge result="Loss" size="sm" />
                    <ResultBadge result="Draw" size="sm" />
                    <ResultBadge result="Bye" size="sm" />
                  </div>
                  <span className="text-xs text-muted-foreground">24px - For compact lists and inline use</span>
                </div>

                {/* Medium */}
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium w-16">md:</span>
                  <div className="flex gap-2">
                    <ResultBadge result="Win" size="md" />
                    <ResultBadge result="Loss" size="md" />
                    <ResultBadge result="Draw" size="md" />
                    <ResultBadge result="Bye" size="md" />
                  </div>
                  <span className="text-xs text-muted-foreground">32px - Standard size for cards and widgets</span>
                </div>

                {/* Large */}
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium w-16">lg:</span>
                  <div className="flex gap-2">
                    <ResultBadge result="Win" size="lg" />
                    <ResultBadge result="Loss" size="lg" />
                    <ResultBadge result="Draw" size="lg" />
                    <ResultBadge result="Bye" size="lg" />
                  </div>
                  <span className="text-xs text-muted-foreground">40px - For headers and emphasis</span>
                </div>

                {/* Extra Large */}
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium w-16">xl:</span>
                  <div className="flex gap-2">
                    <ResultBadge result="Win" size="xl" />
                    <ResultBadge result="Loss" size="xl" />
                    <ResultBadge result="Draw" size="xl" />
                    <ResultBadge result="Bye" size="xl" />
                  </div>
                  <span className="text-xs text-muted-foreground">48px - For dashboard highlights</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Basic Result Badges */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Basic Result Badges</h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Standard Result Badges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-3">
                  <h3 className="font-semibold text-green-800">Win</h3>
                  <div className="flex justify-center">
                    <ResultBadge result="Win" />
                  </div>
                  <p className="text-sm text-muted-foreground">Green background for wins</p>
                </div>

                <div className="text-center space-y-3">
                  <h3 className="font-semibold text-red-800">Loss</h3>
                  <div className="flex justify-center">
                    <ResultBadge result="Loss" />
                  </div>
                  <p className="text-sm text-muted-foreground">Red background for losses</p>
                </div>

                <div className="text-center space-y-3">
                  <h3 className="font-semibold text-yellow-800">Draw</h3>
                  <div className="flex justify-center">
                    <ResultBadge result="Draw" />
                  </div>
                  <p className="text-sm text-muted-foreground">Yellow background for draws</p>
                </div>

                <div className="text-center space-y-3">
                  <h3 className="font-semibold text-gray-800">Bye</h3>
                  <div className="flex justify-center">
                    <ResultBadge result="Bye" />
                  </div>
                  <p className="text-sm text-muted-foreground">Grey background for byes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        

        {/* Usage Examples */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Usage Examples</h2>

          {/* Recent Games */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Recent Games</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { opponent: 'Doncaster Eagles', result: 'Win' as const, score: '45-38', date: '2024-03-15' },
                  { opponent: 'Eltham Panthers', result: 'Loss' as const, score: '32-41', date: '2024-03-08' },
                  { opponent: 'Warrandyte Wolves', result: 'Draw' as const, score: '35-35', date: '2024-03-01' },
                  { opponent: 'Deep Creek Demons', result: 'Win' as const, score: '42-29', date: '2024-02-23' },
                  { opponent: 'Donvale Dragons', result: 'Loss' as const, score: '28-39', date: '2024-02-16' },
                ].map((game, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <ResultBadge result={game.result} />
                      <div>
                        <p className="font-medium">{game.opponent}</p>
                        <p className="text-sm text-muted-foreground">{game.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{game.score}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Team Performance Summary */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Team Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="flex justify-center mb-2">
                    <ResultBadge result="Win" />
                  </div>
                  <p className="text-2xl font-bold text-green-800">8</p>
                  <p className="text-sm text-green-600">Wins</p>
                </div>

                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="flex justify-center mb-2">
                    <ResultBadge result="Loss" />
                  </div>
                  <p className="text-2xl font-bold text-red-800">3</p>
                  <p className="text-sm text-red-600">Losses</p>
                </div>

                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="flex justify-center mb-2">
                    <ResultBadge result="Draw" />
                  </div>
                  <p className="text-2xl font-bold text-yellow-800">1</p>
                  <p className="text-sm text-yellow-600">Draws</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Form (Last 5 Games)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Oldest</span>
                <div className="flex space-x-1">
                  <ResultBadge result="Loss" size="sm" />
                  <ResultBadge result="Win" size="sm" />
                  <ResultBadge result="Win" size="sm" />
                  <ResultBadge result="Draw" size="sm" />
                  <ResultBadge result="Win" size="sm" />
                </div>
                <span className="text-sm text-muted-foreground">Newest</span>
              </div>
              <div className="mt-3 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Good form:</strong> 3 wins, 1 draw, 1 loss in last 5 games
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Component Usage Documentation */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Component Usage</h2>
          <Card>
            <CardHeader>
              <CardTitle>How to Use the ResultBadge Component</CardTitle>
              <p className="text-sm text-muted-foreground">
                Simple usage examples with just size and result props
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-semibold mb-2">Basic Usage</h4>
                  <code className="text-sm bg-white p-2 rounded border block">
                    {`<ResultBadge result="Win" size="md" />`}
                  </code>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-semibold mb-2">All Available Props</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>result:</strong> "Win" | "Loss" | "Draw" | "Bye"</p>
                    <p><strong>size:</strong> "sm" | "md" | "lg" | "xl" (default: "md")</p>
                    <p><strong>className:</strong> optional additional CSS classes</p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-semibold mb-2">Live Examples</h4>
                  <div className="flex gap-3 items-center">
                    <code className="text-xs">sm:</code>
                    <ResultBadge result="Win" size="sm" />
                    <code className="text-xs">md:</code>
                    <ResultBadge result="Loss" size="md" />
                    <code className="text-xs">lg:</code>
                    <ResultBadge result="Draw" size="lg" />
                    <code className="text-xs">xl:</code>
                    <ResultBadge result="Bye" size="xl" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Integration Examples */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Integration Examples</h2>

          {/* With Player Stats */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Player Performance with Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { player: 'Sarah Johnson', position: 'GS', games: 5, results: ['Win', 'Win', 'Loss', 'Win', 'Draw'] as const },
                  { player: 'Emma Wilson', position: 'C', games: 4, results: ['Win', 'Loss', 'Win', 'Win'] as const },
                  { player: 'Kate Brown', position: 'GD', games: 6, results: ['Win', 'Win', 'Loss', 'Draw', 'Win', 'Loss'] as const },
                ].map((player, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium">{player.player}</p>
                        <p className="text-sm text-muted-foreground">{player.position} • {player.games} games</p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      {player.results.map((result, idx) => (
                        <ResultBadge key={idx} result={result} size="sm" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* With Team Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Head-to-Head Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="text-center">
                    <p className="font-semibold">Warrandyte Wolves</p>
                    <p className="text-sm text-muted-foreground">vs Doncaster Eagles</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-center">
                      <div className="flex space-x-1 mb-1">
                        <ResultBadge result="Win" size="sm" />
                        <ResultBadge result="Loss" size="sm" />
                        <ResultBadge result="Win" size="sm" />
                      </div>
                      <p className="text-xs text-muted-foreground">Last 3 games</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Win Rate</p>
                    <p className="text-lg font-bold">67%</p>
                    <div className="flex justify-center space-x-1 mt-1">
                      <ResultBadge result="Win" size="sm" />
                      <ResultBadge result="Win" size="sm" />
                      <ResultBadge result="Loss" size="sm" />
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Current Streak</p>
                    <p className="text-lg font-bold">1 Win</p>
                    <div className="flex justify-center mt-1">
                      <ResultBadge result="Win" size="sm" />
                    </div>
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