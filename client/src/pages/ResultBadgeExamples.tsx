
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center space-y-4">
                  <h3 className="font-semibold">Small</h3>
                  <div className="flex justify-center space-x-2">
                    <ResultBadge result="Win" size="sm" />
                    <ResultBadge result="Loss" size="sm" />
                    <ResultBadge result="Draw" size="sm" />
                  </div>
                  <p className="text-sm text-muted-foreground">For compact displays</p>
                </div>

                <div className="text-center space-y-4">
                  <h3 className="font-semibold">Medium</h3>
                  <div className="flex justify-center space-x-2">
                    <ResultBadge result="Win" size="md" />
                    <ResultBadge result="Loss" size="md" />
                    <ResultBadge result="Draw" size="md" />
                  </div>
                  <p className="text-sm text-muted-foreground">Standard size for most uses</p>
                </div>

                <div className="text-center space-y-4">
                  <h3 className="font-semibold">Default</h3>
                  <div className="flex justify-center space-x-2">
                    <ResultBadge result="Win" />
                    <ResultBadge result="Loss" />
                    <ResultBadge result="Draw" />
                  </div>
                  <p className="text-sm text-muted-foreground">Default size</p>
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

        {/* Visual Style Variations */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Visual Style Variations</h2>
          
          {/* Bordered Variations */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Bordered Variations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-3">
                  <h3 className="font-semibold text-green-800">Thick Border</h3>
                  <div className="flex justify-center">
                    <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold border-4 border-green-800">
                      W
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Bold border for emphasis</p>
                </div>

                <div className="text-center space-y-3">
                  <h3 className="font-semibold text-red-800">Outlined Style</h3>
                  <div className="flex justify-center">
                    <div className="w-10 h-10 bg-white text-red-600 rounded-full flex items-center justify-center font-bold border-2 border-red-600">
                      L
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Clean outlined look</p>
                </div>

                <div className="text-center space-y-3">
                  <h3 className="font-semibold text-yellow-800">Double Border</h3>
                  <div className="flex justify-center">
                    <div className="w-12 h-12 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold border-2 border-white shadow-[0_0_0_2px_#eab308]">
                      D
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Double border effect</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shadow Variations */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Shadow Variations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center space-y-3">
                  <h3 className="font-semibold text-green-800">Soft Shadow</h3>
                  <div className="flex justify-center">
                    <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold shadow-md">
                      W
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Subtle depth</p>
                </div>

                <div className="text-center space-y-3">
                  <h3 className="font-semibold text-red-800">Hard Shadow</h3>
                  <div className="flex justify-center">
                    <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg">
                      L
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Strong shadow</p>
                </div>

                <div className="text-center space-y-3">
                  <h3 className="font-semibold text-yellow-800">Colored Shadow</h3>
                  <div className="flex justify-center">
                    <div className="w-10 h-10 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold shadow-lg shadow-yellow-300/50">
                      D
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Matching shadow</p>
                </div>

                <div className="text-center space-y-3">
                  <h3 className="font-semibold text-green-800">Glow Effect</h3>
                  <div className="flex justify-center">
                    <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold shadow-[0_0_20px_rgba(34,197,94,0.6)]">
                      W
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Glowing effect</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gradient Variations */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Gradient Variations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-3">
                  <h3 className="font-semibold text-green-800">Gradient Win</h3>
                  <div className="flex justify-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 text-white rounded-full flex items-center justify-center font-bold shadow-md">
                      W
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Subtle gradient depth</p>
                </div>

                <div className="text-center space-y-3">
                  <h3 className="font-semibold text-red-800">Gradient Loss</h3>
                  <div className="flex justify-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 text-white rounded-full flex items-center justify-center font-bold shadow-md">
                      L
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Rich gradient effect</p>
                </div>

                <div className="text-center space-y-3">
                  <h3 className="font-semibold text-yellow-800">Gradient Draw</h3>
                  <div className="flex justify-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 text-white rounded-full flex items-center justify-center font-bold shadow-md">
                      D
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Warm gradient</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3D and Modern Effects */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>3D and Modern Effects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center space-y-3">
                  <h3 className="font-semibold text-green-800">Raised 3D</h3>
                  <div className="flex justify-center">
                    <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold shadow-[0_4px_0_#15803d,0_6px_10px_rgba(0,0,0,0.3)] hover:shadow-[0_2px_0_#15803d,0_4px_8px_rgba(0,0,0,0.3)] transition-all active:shadow-[0_1px_0_#15803d,0_2px_4px_rgba(0,0,0,0.3)]">
                      W
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">3D button effect</p>
                </div>

                <div className="text-center space-y-3">
                  <h3 className="font-semibold text-red-800">Inset Style</h3>
                  <div className="flex justify-center">
                    <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center font-bold shadow-[inset_0_2px_4px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.1)]">
                      L
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Pressed in look</p>
                </div>

                <div className="text-center space-y-3">
                  <h3 className="font-semibold text-yellow-800">Neumorphism</h3>
                  <div className="flex justify-center">
                    <div className="w-12 h-12 bg-yellow-100 text-yellow-800 rounded-full flex items-center justify-center font-bold shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff]">
                      D
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Soft UI style</p>
                </div>

                <div className="text-center space-y-3">
                  <h3 className="font-semibold text-green-800">Neon Glow</h3>
                  <div className="flex justify-center">
                    <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold shadow-[0_0_10px_#22c55e,0_0_20px_#22c55e,0_0_30px_#22c55e] border border-green-400">
                      W
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Bright neon effect</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Size and Shape Variations */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Size and Shape Variations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center space-y-3">
                  <h3 className="font-semibold text-green-800">Mini Badge</h3>
                  <div className="flex justify-center">
                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md">
                      W
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Compact size</p>
                </div>

                <div className="text-center space-y-3">
                  <h3 className="font-semibold text-red-800">Square Badge</h3>
                  <div className="flex justify-center">
                    <div className="w-10 h-10 bg-red-600 text-white rounded-lg flex items-center justify-center font-bold shadow-md">
                      L
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Rounded square</p>
                </div>

                <div className="text-center space-y-3">
                  <h3 className="font-semibold text-yellow-800">Hexagon</h3>
                  <div className="flex justify-center">
                    <div className="w-12 h-12 bg-yellow-500 text-white flex items-center justify-center font-bold shadow-md" style={{clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)'}}>
                      D
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Geometric shape</p>
                </div>

                <div className="text-center space-y-3">
                  <h3 className="font-semibold text-green-800">Large Badge</h3>
                  <div className="flex justify-center">
                    <div className="w-14 h-14 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                      W
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Extra large size</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interactive States */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Interactive States</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-3">
                  <h3 className="font-semibold text-green-800">Hover Effects</h3>
                  <div className="flex justify-center">
                    <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold shadow-md hover:bg-green-700 hover:shadow-lg hover:scale-110 transition-all duration-200 cursor-pointer">
                      W
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Hover to see effect</p>
                </div>

                <div className="text-center space-y-3">
                  <h3 className="font-semibold text-red-800">Pulsing</h3>
                  <div className="flex justify-center">
                    <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center font-bold shadow-md animate-pulse">
                      L
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Attention grabbing</p>
                </div>

                <div className="text-center space-y-3">
                  <h3 className="font-semibold text-yellow-800">Bounce</h3>
                  <div className="flex justify-center">
                    <div className="w-10 h-10 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold shadow-md animate-bounce">
                      D
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Playful animation</p>
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
