import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SimpleGameResultCard from '@/components/ui/simple-game-result-card';
import { GamesContainer } from '@/components/ui/games-container';

// Simple test data for the simplified component
const testGames = [
  {
    homeTeam: { id: 1, name: 'Thunder Bolts' },
    awayTeam: { id: 2, name: 'Lightning Strikes' },
    quarterScores: [
      { homeScore: 15, awayScore: 12 },
      { homeScore: 13, awayScore: 13 }, // Q2 individual scores
      { homeScore: 14, awayScore: 13 },
      { homeScore: 23, awayScore: 20 }
    ],
    gameInfo: {
      id: 1,
      date: '2024-01-15',
      round: 5,
      status: 'completed' as const
    },
    hasStats: true
  },
  {
    homeTeam: { id: 3, name: 'Storm Chasers' },
    awayTeam: { id: 1, name: 'Thunder Bolts' },
    quarterScores: [
      { homeScore: 18, awayScore: 14 },
      { homeScore: 17, awayScore: 14 },
      { homeScore: 19, awayScore: 17 },
      { homeScore: 18, awayScore: 16 }
    ],
    gameInfo: {
      id: 2,
      date: '2024-01-22',
      round: 6,
      status: 'completed' as const
    },
    hasStats: false
  },
  {
    homeTeam: { id: 1, name: 'Thunder Bolts' },
    awayTeam: { id: 4, name: 'Wind Runners' },
    quarterScores: [],
    gameInfo: {
      id: 3,
      date: '2024-02-05',
      round: 7,
      status: 'scheduled' as const
    },
    hasStats: false
  },
  {
    homeTeam: { id: 1, name: 'Thunder Bolts' },
    awayTeam: { id: 6, name: 'Fire Birds' },
    quarterScores: [
      { homeScore: 16, awayScore: 16 },
      { homeScore: 16, awayScore: 16 },
      { homeScore: 16, awayScore: 16 },
      { homeScore: 16, awayScore: 16 }
    ],
    gameInfo: {
      id: 4,
      date: '2024-01-29',
      round: 4,
      status: 'completed' as const
    },
    hasStats: true
  },
  {
    homeTeam: { id: 1, name: 'Thunder Bolts' },
    awayTeam: { id: 5, name: 'Sky Hawks' },
    quarterScores: [],
    gameInfo: {
      id: 5,
      date: '2024-01-08',
      round: 3,
      status: 'forfeit-win' as const
    },
    hasStats: false
  },
  {
    homeTeam: { id: 1, name: 'Thunder Bolts' },
    awayTeam: undefined, // BYE game
    quarterScores: [],
    gameInfo: {
      id: 6,
      date: '2024-02-12',
      round: 8,
      status: 'bye' as const
    },
    hasStats: false
  }
];

export default function GameListTestPage() {
  const currentTeamId = 1; // Thunder Bolts perspective

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Simplified Game Result Card Test</h1>
        <p className="text-gray-600">
          Testing the new simplified GameResultCard component with clean, simple props.
        </p>
      </div>

      {/* Wide Layout with Quarter Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Wide Layout - With Quarter Scores & Hover</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Hover over these cards to test for flickering. Shows quarter-by-quarter and cumulative scores.
          </p>
          <GamesContainer spacing="normal">
            {testGames.map((game, index) => (
              <SimpleGameResultCard
                key={`wide-${index}`}
                homeTeam={game.homeTeam}
                awayTeam={game.awayTeam}
                quarterScores={game.quarterScores}
                currentTeamId={currentTeamId}
                gameInfo={game.gameInfo}
                layout="wide"
                showQuarterScores={true}
                showLink={true}
                showDate={true}
                showRound={true}
                showScore={true}
                hasStats={game.hasStats}
              />
            ))}
          </GamesContainer>
        </CardContent>
      </Card>

      {/* Medium Layout without Quarter Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Medium Layout - No Quarter Scores, No Hover</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Same games but medium layout, no quarter scores, and no hover effects for comparison.
          </p>
          <GamesContainer spacing="normal">
            {testGames.map((game, index) => (
              <SimpleGameResultCard
                key={`medium-${index}`}
                homeTeam={game.homeTeam}
                awayTeam={game.awayTeam}
                quarterScores={game.quarterScores}
                currentTeamId={currentTeamId}
                gameInfo={game.gameInfo}
                layout="medium"
                showQuarterScores={false}
                showLink={false}
                showDate={true}
                showRound={true}
                showScore={true}
                hasStats={game.hasStats}
              />
            ))}
          </GamesContainer>
        </CardContent>
      </Card>

      {/* Narrow Layout */}
      <Card>
        <CardHeader>
          <CardTitle>Narrow Layout - Compact Display</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Compact narrow layout for tight spaces.
          </p>
          <GamesContainer spacing="compact">
            {testGames.slice(0, 4).map((game, index) => (
              <SimpleGameResultCard
                key={`narrow-${index}`}
                homeTeam={game.homeTeam}
                awayTeam={game.awayTeam}
                quarterScores={game.quarterScores}
                currentTeamId={currentTeamId}
                gameInfo={game.gameInfo}
                layout="narrow"
                showQuarterScores={false}
                showLink={true}
                showDate={false}
                showRound={true}
                showScore={true}
                hasStats={game.hasStats}
              />
            ))}
          </GamesContainer>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Legend & Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-50 border-l-4 border-green-500 rounded"></div>
              <span>Win (65-58, 64-64 forfeit)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-50 border-l-4 border-red-500 rounded"></div>
              <span>Loss (72-61)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-amber-50 border-l-4 border-amber-500 rounded"></div>
              <span>Draw (64-64)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-50 border-l-4 border-blue-500 rounded"></div>
              <span>Upcoming</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-50 border-l-4 border-gray-500 rounded"></div>
              <span>Bye</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs">✓/×</span>
              <span>Has/No Stats</span>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <p><strong>Final Scores:</strong> Calculated by summing quarter scores</p>
            <p><strong>Result Colors:</strong> Based on Thunder Bolts perspective (Team ID: 1)</p>
            <p><strong>Quarter Scores:</strong> Individual quarter scores (top) and cumulative scores (bottom)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}