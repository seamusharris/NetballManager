
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import GameResultCard, { NarrowGameResultCard, MediumGameResultCard, WideGameResultCard } from '@/components/ui/game-result-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Check, Printer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Game } from '@shared/schema';

// Sample game data for examples
const sampleGames: Game[] = [
  {
    id: 1,
    date: '2024-06-15',
    time: '14:00',
    homeTeamId: 116,
    awayTeamId: 117,
    homeTeamName: 'WNC Dingoes',
    awayTeamName: 'Emeralds',
    round: 5,
    statusIsCompleted: true,
    statusName: 'completed',
    statusId: 3,
    seasonId: 1,
    clubId: 54,
    venue: 'Court 1',
    isBye: false,
    statusTeamGoals: 45,
    statusOpponentGoals: 38,
    statusDisplayName: 'Completed',
    statusAllowsStatistics: true,
    seasonName: 'Autumn 2025',
    seasonStartDate: '2025-01-01',
    seasonEndDate: '2025-06-29',
    seasonIsActive: true,
    homeTeamDivision: '15U/1s',
    homeClubId: 54,
    homeClubName: 'Warrandyte Netball Club',
    homeClubCode: 'WNC',
    awayTeamDivision: '15U/1s',
    awayClubId: 15,
    awayClubName: 'East Doncaster',
    awayClubCode: 'EDNC',
    isInterClub: false,
    notes: null,
    awardWinnerId: null
  },
  {
    id: 2,
    date: '2024-06-22',
    time: '16:00',
    homeTeamId: 118,
    awayTeamId: 116,
    homeTeamName: 'Cobras',
    awayTeamName: 'WNC Dingoes',
    round: 6,
    statusIsCompleted: true,
    statusName: 'completed',
    statusId: 3,
    seasonId: 1,
    clubId: 54,
    venue: 'Away',
    isBye: false,
    statusTeamGoals: 28,
    statusOpponentGoals: 35,
    statusDisplayName: 'Completed',
    statusAllowsStatistics: true,
    seasonName: 'Autumn 2025',
    seasonStartDate: '2025-01-01',
    seasonEndDate: '2025-06-29',
    seasonIsActive: true,
    homeTeamDivision: '15U/1s',
    homeClubId: 15,
    homeClubName: 'East Doncaster',
    homeClubCode: 'EDNC',
    awayTeamDivision: '15U/1s',
    awayClubId: 54,
    awayClubName: 'Warrandyte Netball Club',
    awayClubCode: 'WNC',
    isInterClub: false,
    notes: null,
    awardWinnerId: null
  },
  {
    id: 3,
    date: '2024-07-15',
    time: '12:00',
    homeTeamId: 116,
    awayTeamId: 119,
    homeTeamName: 'WNC Dingoes',
    awayTeamName: 'Thunder Jets',
    round: 8,
    statusIsCompleted: false,
    statusName: 'upcoming',
    statusId: 1,
    seasonId: 1,
    clubId: 54,
    venue: 'Court 2',
    isBye: false,
    statusTeamGoals: null,
    statusOpponentGoals: null,
    statusDisplayName: 'Upcoming',
    statusAllowsStatistics: false,
    seasonName: 'Autumn 2025',
    seasonStartDate: '2025-01-01',
    seasonEndDate: '2025-06-29',
    seasonIsActive: true,
    homeTeamDivision: '15U/1s',
    homeClubId: 54,
    homeClubName: 'Warrandyte Netball Club',
    homeClubCode: 'WNC',
    awayTeamDivision: '15U/1s',
    awayClubId: 16,
    awayClubName: 'Thunder Sports',
    awayClubCode: 'TS',
    isInterClub: false,
    notes: null,
    awardWinnerId: null
  },
  {
    id: 4,
    date: '2024-06-08',
    time: '10:00',
    homeTeamId: 116,
    awayTeamId: null,
    homeTeamName: 'WNC Dingoes',
    awayTeamName: null,
    round: 4,
    statusIsCompleted: true,
    statusName: 'bye',
    statusId: 6,
    seasonId: 1,
    clubId: 54,
    venue: null,
    isBye: true,
    statusTeamGoals: null,
    statusOpponentGoals: null,
    statusDisplayName: 'Bye',
    statusAllowsStatistics: false,
    seasonName: 'Autumn 2025',
    seasonStartDate: '2025-01-01',
    seasonEndDate: '2025-06-29',
    seasonIsActive: true,
    homeTeamDivision: '15U/1s',
    homeClubId: 54,
    homeClubName: 'Warrandyte Netball Club',
    homeClubCode: 'WNC',
    awayTeamDivision: null,
    awayClubId: null,
    awayClubName: null,
    awayClubCode: null,
    isInterClub: false,
    notes: null,
    awardWinnerId: null
  }
];

const sampleStats = [
  { id: 1, gameId: 1, position: 'GS', quarter: 1, goalsFor: 8, goalsAgainst: 0 },
  { id: 2, gameId: 1, position: 'GA', quarter: 1, goalsFor: 4, goalsAgainst: 0 }
];

const sampleScores = [
  { id: 1, gameId: 1, teamId: 116, quarter: 1, score: 12, enteredBy: 1, enteredAt: '2024-06-15T14:15:00Z', updatedAt: '2024-06-15T14:15:00Z', notes: null },
  { id: 2, gameId: 1, teamId: 117, quarter: 1, score: 8, enteredBy: 1, enteredAt: '2024-06-15T14:15:00Z', updatedAt: '2024-06-15T14:15:00Z', notes: null },
  { id: 3, gameId: 1, teamId: 116, quarter: 2, score: 11, enteredBy: 1, enteredAt: '2024-06-15T14:30:00Z', updatedAt: '2024-06-15T14:30:00Z', notes: null },
  { id: 4, gameId: 1, teamId: 117, quarter: 2, score: 10, enteredBy: 1, enteredAt: '2024-06-15T14:30:00Z', updatedAt: '2024-06-15T14:30:00Z', notes: null },
  { id: 5, gameId: 1, teamId: 116, quarter: 3, score: 10, enteredBy: 1, enteredAt: '2024-06-15T14:45:00Z', updatedAt: '2024-06-15T14:45:00Z', notes: null },
  { id: 6, gameId: 1, teamId: 117, quarter: 3, score: 10, enteredBy: 1, enteredAt: '2024-06-15T14:45:00Z', updatedAt: '2024-06-15T14:45:00Z', notes: null },
  { id: 7, gameId: 1, teamId: 116, quarter: 4, score: 12, enteredBy: 1, enteredAt: '2024-06-15T15:00:00Z', updatedAt: '2024-06-15T15:00:00Z', notes: null },
  { id: 8, gameId: 1, teamId: 117, quarter: 4, score: 10, enteredBy: 1, enteredAt: '2024-06-15T15:00:00Z', updatedAt: '2024-06-15T15:00:00Z', notes: null }
];

export default function GameResultCardReference() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const CodeBlock = ({ code, id }: { code: string; id: string }) => (
    <div className="relative">
      <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
        <code>{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2"
        onClick={() => handleCopy(code, id)}
      >
        {copiedCode === id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );

  return (
    <PageTemplate 
      title="GameResultCard Component Reference" 
      breadcrumbs={[
        { label: "Development", href: "/component-examples" },
        { label: "Reference", href: "/reference" },
        { label: "GameResultCard Component" }
      ]}
      actions={
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handlePrint}
          className="no-print flex items-center gap-2"
        >
          <Printer className="h-4 w-4" />
          Print Reference
        </Button>
      }
    >
      <Helmet>
        <title>GameResultCard Component Reference - Design System</title>
        <meta name="description" content="Complete reference documentation for the GameResultCard component including props, layouts, and usage examples." />
        <style type="text/css">{`
          @media print {
            .no-print { display: none !important; }
            body { font-size: 12px; line-height: 1.3; }
            .prose { max-width: none !important; }
          }
        `}</style>
      </Helmet>

      <div className="space-y-8">
        {/* Overview */}
        <div className="prose max-w-none">
          <p className="text-lg text-gray-700">
            The GameResultCard component is a versatile UI element for displaying game information 
            with support for different layouts, game states (wins/losses/draws/upcoming/bye), 
            scores, and various visual configurations.
          </p>
        </div>

        {/* Live Example Section */}
        <Card>
          <CardHeader>
            <CardTitle>Live Example</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Interactive examples showing different game states and layouts
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-2 text-green-700">Win Example</h4>
                <GameResultCard 
                  game={sampleGames[0]} 
                  gameStats={sampleStats}
                  currentTeamId={116}
                  showLink={false}
                />
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2 text-red-700">Loss Example</h4>
                <GameResultCard 
                  game={sampleGames[1]} 
                  gameStats={sampleStats}
                  currentTeamId={116}
                  showLink={false}
                />
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2 text-blue-700">Upcoming Game</h4>
                <GameResultCard 
                  game={sampleGames[2]} 
                  gameStats={[]}
                  currentTeamId={116}
                  showLink={false}
                />
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2 text-gray-700">Bye Game</h4>
                <GameResultCard 
                  game={sampleGames[3]} 
                  gameStats={[]}
                  currentTeamId={116}
                  showLink={false}
                />
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-medium mb-3">Quarter-by-Quarter Scoring</h4>
              <div className="space-y-4">
                <div>
                  <h5 className="text-xs font-medium mb-2 text-gray-600">Game with Quarter Breakdown</h5>
                  <GameResultCard 
                    game={sampleGames[0]} 
                    gameStats={sampleStats}
                    currentTeamId={116}
                    centralizedScores={sampleScores}
                    showQuarterScores={true}
                    layout="wide"
                    showLink={false}
                  />
                </div>

                <div>
                  <h5 className="text-xs font-medium mb-2 text-gray-600">Medium Layout with Quarter Scores</h5>
                  <GameResultCard 
                    game={sampleGames[0]} 
                    gameStats={sampleStats}
                    currentTeamId={116}
                    centralizedScores={sampleScores}
                    showQuarterScores={true}
                    layout="medium"
                    showLink={false}
                  />
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <h5 className="text-xs font-medium mb-2 text-blue-800">Quarter Score Breakdown Explained</h5>
                  <div className="text-xs text-blue-700 space-y-1">
                    <div>• Each quarter shows: Team Score - Opponent Score</div>
                    <div>• Green border = Quarter won</div>
                    <div>• Red border = Quarter lost</div>
                    <div>• Amber border = Quarter drawn</div>
                    <div>• Displays alongside final game score</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-medium mb-3">Different Layouts</h4>
              <div className="space-y-3">
                <div>
                  <h5 className="text-xs font-medium mb-1 text-gray-600">Wide Layout</h5>
                  <WideGameResultCard 
                    game={sampleGames[0]} 
                    gameStats={sampleStats}
                    currentTeamId={116}
                    showLink={false}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <h5 className="text-xs font-medium mb-1 text-gray-600">Medium Layout</h5>
                    <MediumGameResultCard 
                      game={sampleGames[0]} 
                      gameStats={sampleStats}
                      currentTeamId={116}
                      showLink={false}
                    />
                  </div>
                  <div>
                    <h5 className="text-xs font-medium mb-1 text-gray-600">Narrow Layout</h5>
                    <NarrowGameResultCard 
                      game={sampleGames[0]} 
                      gameStats={sampleStats}
                      currentTeamId={116}
                      showLink={false}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Reference */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Import</CardTitle>
          </CardHeader>
          <CardContent>
            <CodeBlock 
              code={`import GameResultCard, { 
  NarrowGameResultCard, 
  MediumGameResultCard, 
  WideGameResultCard 
} from '@/components/ui/game-result-card';`}
              id="import"
            />
          </CardContent>
        </Card>

        <Tabs defaultValue="layouts" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="layouts">Layouts</TabsTrigger>
            <TabsTrigger value="states">Game States</TabsTrigger>
            <TabsTrigger value="props">Props</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
          </TabsList>

          {/* Layouts Tab */}
          <TabsContent value="layouts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Layout Variants</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-3">Narrow Layout (sidebars, compact lists)</h4>
                  <NarrowGameResultCard 
                    game={sampleGames[0]} 
                    gameStats={sampleStats}
                    currentTeamId={116}
                    showLink={false}
                  />
                  <CodeBlock 
                    code={`<NarrowGameResultCard 
  game={game} 
  gameStats={gameStats}
  currentTeamId={116}
  showLink={false}
/>`}
                    id="narrow-layout"
                  />
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Medium Layout (cards, grids) - Default</h4>
                  <MediumGameResultCard 
                    game={sampleGames[0]} 
                    gameStats={sampleStats}
                    currentTeamId={116}
                    showLink={false}
                  />
                  <CodeBlock 
                    code={`<MediumGameResultCard 
  game={game} 
  gameStats={gameStats}
  currentTeamId={116}
  showLink={false}
/>`}
                    id="medium-layout"
                  />
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Wide Layout (lists, tables)</h4>
                  <WideGameResultCard 
                    game={sampleGames[0]} 
                    gameStats={sampleStats}
                    currentTeamId={116}
                    showLink={false}
                  />
                  <CodeBlock 
                    code={`<WideGameResultCard 
  game={game} 
  gameStats={gameStats}
  currentTeamId={116}
  showLink={false}
/>`}
                    id="wide-layout"
                  />
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Grid Layout Examples</h4>
                  <div className="space-y-4">
                    <div>
                      <h5 className="text-xs font-medium mb-2">Single Column (Full Width)</h5>
                      <div className="space-y-2">
                        <GameResultCard 
                          game={sampleGames[0]} 
                          layout="wide"
                          currentTeamId={116}
                          showLink={false}
                        />
                        <GameResultCard 
                          game={sampleGames[1]} 
                          layout="wide"
                          currentTeamId={116}
                          showLink={false}
                        />
                      </div>
                    </div>

                    <div>
                      <h5 className="text-xs font-medium mb-2">Two Columns</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <GameResultCard 
                          game={sampleGames[0]} 
                          layout="medium"
                          currentTeamId={116}
                          showLink={false}
                        />
                        <GameResultCard 
                          game={sampleGames[1]} 
                          layout="medium"
                          currentTeamId={116}
                          showLink={false}
                        />
                      </div>
                    </div>

                    <div>
                      <h5 className="text-xs font-medium mb-2">Three Columns</h5>
                      <div className="grid grid-cols-3 gap-2">
                        <GameResultCard 
                          game={sampleGames[0]} 
                          layout="narrow"
                          currentTeamId={116}
                          showLink={false}
                        />
                        <GameResultCard 
                          game={sampleGames[1]} 
                          layout="narrow"
                          currentTeamId={116}
                          showLink={false}
                        />
                        <GameResultCard 
                          game={sampleGames[2]} 
                          layout="narrow"
                          currentTeamId={116}
                          showLink={false}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <CodeBlock 
                    code={`// Single column
<div className="space-y-2">
  <GameResultCard game={game1} layout="wide" />
  <GameResultCard game={game2} layout="wide" />
</div>

// Two columns
<div className="grid grid-cols-2 gap-3">
  <GameResultCard game={game1} layout="medium" />
  <GameResultCard game={game2} layout="medium" />
</div>

// Three columns
<div className="grid grid-cols-3 gap-2">
  <GameResultCard game={game1} layout="narrow" />
  <GameResultCard game={game2} layout="narrow" />
  <GameResultCard game={game3} layout="narrow" />
</div>`}
                    id="grid-layouts"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Game States Tab */}
          <TabsContent value="states" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Game State Variants</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-3">Win (Green Border)</h4>
                  <GameResultCard 
                    game={sampleGames[0]} 
                    currentTeamId={116}
                    showLink={false}
                  />
                  <CodeBlock 
                    code={`// Win: currentTeamId matches winning team
<GameResultCard 
  game={winGame} 
  currentTeamId={116} // Home team won 45-38
/>`}
                    id="win-state"
                  />
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Loss (Red Border)</h4>
                  <GameResultCard 
                    game={sampleGames[1]} 
                    currentTeamId={116}
                    showLink={false}
                  />
                  <CodeBlock 
                    code={`// Loss: currentTeamId matches losing team
<GameResultCard 
  game={lossGame} 
  currentTeamId={116} // Away team lost 28-35
/>`}
                    id="loss-state"
                  />
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Upcoming Game (Blue Border)</h4>
                  <GameResultCard 
                    game={sampleGames[2]} 
                    currentTeamId={116}
                    showLink={false}
                  />
                  <CodeBlock 
                    code={`// Upcoming: statusIsCompleted = false
<GameResultCard 
  game={upcomingGame} 
  currentTeamId={116}
/>`}
                    id="upcoming-state"
                  />
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Bye Game (Gray Border)</h4>
                  <GameResultCard 
                    game={sampleGames[3]} 
                    currentTeamId={116}
                    showLink={false}
                  />
                  <CodeBlock 
                    code={`// Bye: statusId = 6 or statusName = 'bye'
<GameResultCard 
                    game={byeGame} 
  currentTeamId={116}
/>`}
                    id="bye-state"
                  />
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h5 className="text-sm font-semibold text-blue-900 mb-2">State Color System</h5>
                  <ul className="text-xs text-blue-800 space-y-1 list-disc pl-4">
                    <li><strong>Win:</strong> Green border & background (border-green-500 bg-green-50)</li>
                    <li><strong>Loss:</strong> Red border & background (border-red-500 bg-red-50)</li>
                    <li><strong>Draw:</strong> Yellow border & background (border-amber-500 bg-amber-50)</li>
                    <li><strong>Upcoming:</strong> Blue border & background (border-blue-500 bg-blue-50)</li>
                    <li><strong>Bye:</strong> Gray border & background (border-gray-500 bg-gray-50)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Props Tab */}
          <TabsContent value="props" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Props Reference</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 font-medium">Prop</th>
                        <th className="text-left p-2 font-medium">Type</th>
                        <th className="text-left p-2 font-medium">Default</th>
                        <th className="text-left p-2 font-medium">Description</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      <tr className="border-b">
                        <td className="p-2 font-mono">game</td>
                        <td className="p-2">Game</td>
                        <td className="p-2">-</td>
                        <td className="p-2">Game object with teams, date, scores, etc.</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-mono">layout</td>
                        <td className="p-2">'narrow' | 'medium' | 'wide'</td>
                        <td className="p-2">'medium'</td>
                        <td className="p-2">Layout variant for different use cases</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-mono">currentTeamId</td>
                        <td className="p-2">number</td>
                        <td className="p-2">undefined</td>
                        <td className="p-2">ID of current team for result calculation</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-mono">gameStats</td>
                        <td className="p-2">any[]</td>
                        <td className="p-2">[]</td>
                        <td className="p-2">Game statistics for indicators</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-mono">centralizedScores</td>
                        <td className="p-2">any[]</td>
                        <td className="p-2">undefined</td>
                        <td className="p-2">Centralized scoring data</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-mono">showLink</td>
                        <td className="p-2">boolean</td>
                        <td className="p-2">true</td>
                        <td className="p-2">Whether card should be clickable</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-mono">showDate</td>
                        <td className="p-2">boolean</td>
                        <td className="p-2">true</td>
                        <td className="p-2">Whether to display game date</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-mono">showRound</td>
                        <td className="p-2">boolean</td>
                        <td className="p-2">true</td>
                        <td className="p-2">Whether to display round number</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-mono">showScore</td>
                        <td className="p-2">boolean</td>
                        <td className="p-2">true</td>
                        <td className="p-2">Whether to display game score</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-mono">showQuarterScores</td>
                        <td className="p-2">boolean</td>
                        <td className="p-2">false</td>
                        <td className="p-2">Whether to show quarter-by-quarter scores</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-mono">useOfficialPriority</td>
                        <td className="p-2">boolean</td>
                        <td className="p-2">false</td>
                        <td className="p-2">Prioritize official scores over stats</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-mono">compact</td>
                        <td className="p-2">boolean</td>
                        <td className="p-2">false</td>
                        <td className="p-2">Compact display mode</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-mono">clubTeams</td>
                        <td className="p-2">any[]</td>
                        <td className="p-2">[]</td>
                        <td className="p-2">Club teams for perspective calculation</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-mono">currentClubId</td>
                        <td className="p-2">number</td>
                        <td className="p-2">undefined</td>
                        <td className="p-2">Current club ID for context</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-mono">className</td>
                        <td className="p-2">string</td>
                        <td className="p-2">""</td>
                        <td className="p-2">Additional CSS classes</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Examples Tab */}
          <TabsContent value="examples" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Common Usage Examples</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-3">Basic Game Display</h4>
                  <GameResultCard 
                    game={sampleGames[0]} 
                    currentTeamId={116}
                    showLink={false}
                  />
                  <CodeBlock 
                    code={`<GameResultCard 
  game={game} 
  currentTeamId={116}
/>`}
                    id="basic-example"
                  />
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Game with Custom Configuration</h4>
                  <GameResultCard 
                    game={sampleGames[0]} 
                    currentTeamId={116}
                    showDate={false}
                    showRound={false}
                    showScore={true}
                    showLink={false}
                    className="border-2"
                  />
                  <CodeBlock 
                    code={`<GameResultCard 
  game={game} 
  currentTeamId={116}
  showDate={false}
  showRound={false}
  showScore={true}
  className="border-2"
/>`}
                    id="custom-config-example"
                  />
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Game with Quarter Scores</h4>
                  <GameResultCard 
                    game={sampleGames[0]} 
                    currentTeamId={116}
                    centralizedScores={sampleScores}
                    showQuarterScores={true}
                    layout="wide"
                    showLink={false}
                  />
                  <CodeBlock 
                    code={`<GameResultCard 
  game={game} 
  currentTeamId={116}
  centralizedScores={quarterScores}
  showQuarterScores={true}
  layout="wide"
/>`}
                    id="quarter-scores-example"
                  />
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Games List Example</h4>
                  <div className="space-y-2">
                    {sampleGames.slice(0, 3).map(game => (
                      <GameResultCard
                        key={game.id}
                        game={game}
                        layout="wide"
                        currentTeamId={116}
                        showLink={false}
                      />
                    ))}
                  </div>
                  <CodeBlock 
                    code={`{games.map(game => (
  <GameResultCard
    key={game.id}
    game={game}
    layout="wide"
    currentTeamId={currentTeamId}
  />
))}`}
                    id="games-list-example"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Implementation Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Game Object Structure</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    The game prop should follow this interface:
                  </p>
                  <CodeBlock 
                    code={`interface Game {
  id: number;
  date: string;
  time?: string;
  homeTeamId: number;
  awayTeamId?: number | null;
  homeTeamName: string;
  awayTeamName?: string | null;
  round: number | string;
  statusIsCompleted: boolean;
  statusName: string;
  statusId: number;
  venue?: string | null;
  isBye?: boolean;
  statusTeamGoals?: number | null;
  statusOpponentGoals?: number | null;
  // ... additional fields
}`}
                    id="game-interface"
                  />
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Layout Selection Guidelines</h4>
                  <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                    <div className="text-xs">
                      <span className="font-semibold">Narrow:</span> Sidebars, compact widgets, mobile layouts
                    </div>
                    <div className="text-xs">
                      <span className="font-semibold">Medium:</span> Card grids, dashboard widgets, standard lists
                    </div>
                    <div className="text-xs">
                      <span className="font-semibold">Wide:</span> Full-width lists, tables, detailed views
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Result Calculation</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Game results are calculated using the UnifiedGameScoreService based on:
                  </p>
                  <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                    <div className="text-xs">
                      <span className="font-semibold">Win/Loss/Draw:</span> Compared against currentTeamId perspective
                    </div>
                    <div className="text-xs">
                      <span className="font-semibold">Score Sources:</span> Official scores → Centralized scores → Game stats
                    </div>
                    <div className="text-xs">
                      <span className="font-semibold">Priority:</span> useOfficialPriority determines scoring hierarchy
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Best Practices</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc pl-4">
                    <li>Always provide currentTeamId for proper result calculation</li>
                    <li>Use appropriate layout for your context (narrow for sidebars, wide for lists)</li>
                    <li>Include gameStats for completion indicators</li>
                    <li>Consider showLink=false for non-interactive displays</li>
                    <li>Use showQuarterScores for detailed game analysis</li>
                    <li>Provide clubTeams for accurate club-wide perspective</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Accessibility</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc pl-4">
                    <li>Color coding is supplemented with text labels</li>
                    <li>Interactive cards include proper hover states</li>
                    <li>Screen readers can access all game information</li>
                    <li>Focus states are clearly visible for keyboard navigation</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Performance Considerations</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc pl-4">
                    <li>Component uses React.memo for optimal re-rendering</li>
                    <li>Score calculations are memoized with useMemo</li>
                    <li>Large lists should implement virtualization</li>
                    <li>Consider lazy loading for extensive game histories</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTemplate>
  );
}
