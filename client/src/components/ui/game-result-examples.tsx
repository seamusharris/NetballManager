
import React from 'react';
import { GameResultCard, NarrowGameResultCard, MediumGameResultCard, WideGameResultCard } from './game-result-card';
import { Game } from '@shared/schema';

// Example game data for demonstration
const exampleGame: Game = {
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
  seasonId: 1,
  clubId: 54,
  venue: 'Court 1',
  isBye: false,
  statusTeamGoals: null,
  statusOpponentGoals: null
};

const exampleStats = [
  { id: 1, gameId: 1, position: 'GS', quarter: 1, goalsFor: 8, goalsAgainst: 0 },
  { id: 2, gameId: 1, position: 'GA', quarter: 1, goalsFor: 4, goalsAgainst: 0 },
  { id: 3, gameId: 1, position: 'GK', quarter: 1, goalsFor: 0, goalsAgainst: 3 },
  { id: 4, gameId: 1, position: 'GD', quarter: 1, goalsFor: 0, goalsAgainst: 2 }
];

export function GameResultCardExamples() {
  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold mb-4">GameResultCard Examples</h2>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Narrow Layout (sidebar, mobile)</h3>
        <div className="max-w-xs">
          <NarrowGameResultCard 
            game={exampleGame} 
            gameStats={exampleStats}
            showLink={false}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Medium Layout (default, cards)</h3>
        <div className="max-w-md">
          <MediumGameResultCard 
            game={exampleGame} 
            gameStats={exampleStats}
            showLink={false}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Wide Layout (lists, tables)</h3>
        <div className="max-w-2xl">
          <WideGameResultCard 
            game={exampleGame} 
            gameStats={exampleStats}
            showLink={false}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Custom Configuration</h3>
        <div className="max-w-lg">
          <GameResultCard
            game={exampleGame}
            gameStats={exampleStats}
            layout="medium"
            showDate={false}
            showRound={false}
            showScore={true}
            showLink={false}
            className="border-2"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Responsive Grid Example</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <GameResultCard
              key={i}
              game={{...exampleGame, id: i, awayTeamName: `Team ${i}`}}
              gameStats={exampleStats}
              layout="medium"
              showLink={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
