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

const winGame: Game = {
  id: 2,
  date: '2024-06-16',
  time: '16:00',
  homeTeamId: 116,
  awayTeamId: 118,
  homeTeamName: 'WNC Dingoes',
  awayTeamName: 'Cobras',
  round: 6,
  statusIsCompleted: true,
  statusName: 'completed',
  seasonId: 1,
  clubId: 54,
  venue: 'Court 2',
  isBye: false,
  statusTeamGoals: 60,
  statusOpponentGoals: 40
};

const winStats = [
  { id: 5, gameId: 2, position: 'GS', quarter: 1, goalsFor: 10, goalsAgainst: 5 },
  { id: 6, gameId: 2, position: 'GA', quarter: 1, goalsFor: 5, goalsAgainst: 2 }
];

const lossGame: Game = {
  id: 3,
  date: '2024-06-17',
  time: '18:00',
  homeTeamId: 119,
  awayTeamId: 116,
  homeTeamName: 'Sharks',
  awayTeamName: 'WNC Dingoes',
  round: 7,
  statusIsCompleted: true,
  statusName: 'completed',
  seasonId: 1,
  clubId: 54,
  venue: 'Court 3',
  isBye: false,
  statusTeamGoals: 35,
  statusOpponentGoals: 30
};

const lossStats = [
  { id: 7, gameId: 3, position: 'GS', quarter: 1, goalsFor: 7, goalsAgainst: 9 },
  { id: 8, gameId: 3, position: 'GA', quarter: 1, goalsFor: 4, goalsAgainst: 6 }
];

const drawGame: Game = {
  id: 4,
  date: '2024-06-18',
  time: '20:00',
  homeTeamId: 116,
  awayTeamId: 120,
  homeTeamName: 'WNC Dingoes',
  awayTeamName: 'Lions',
  round: 8,
  statusIsCompleted: true,
  statusName: 'completed',
  seasonId: 1,
  clubId: 54,
  venue: 'Court 4',
  isBye: false,
  statusTeamGoals: 45,
  statusOpponentGoals: 45
};

const drawStats = [
  { id: 9, gameId: 4, position: 'GS', quarter: 1, goalsFor: 9, goalsAgainst: 9 },
  { id: 10, gameId: 4, position: 'GA', quarter: 1, goalsFor: 6, goalsAgainst: 6 }
];

const byeGame: Game = {
  id: 5,
  date: '2024-06-19',
  time: '00:00',
  homeTeamId: 116,
  awayTeamId: null,
  homeTeamName: 'WNC Dingoes',
  awayTeamName: null,
  round: 9,
  statusIsCompleted: true,
  statusName: 'completed',
  seasonId: 1,
  clubId: 54,
  venue: null,
  isBye: true,
  statusTeamGoals: null,
  statusOpponentGoals: null
};

const upcomingGame: Game = {
  id: 6,
  date: '2024-06-20',
  time: '14:00',
  homeTeamId: 116,
  awayTeamId: 121,
  homeTeamName: 'WNC Dingoes',
  awayTeamName: 'Tigers',
  round: 10,
  statusIsCompleted: false,
  statusName: 'scheduled',
  seasonId: 1,
  clubId: 54,
  venue: 'Court 1',
  isBye: false,
  statusTeamGoals: null,
  statusOpponentGoals: null
};


export function GameResultCardExamples() {
  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold mb-4">GameResultCard Examples</h2>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Game Outcomes - Win, Loss, Draw, Bye</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-medium mb-2 text-green-700">Win Example</h4>
            <MediumGameResultCard 
              game={winGame} 
              gameStats={winStats}
              currentTeamId={116}
              showLink={false}
            />
          </div>

          <div>
            <h4 className="text-md font-medium mb-2 text-red-700">Loss Example</h4>
            <MediumGameResultCard 
              game={lossGame} 
              gameStats={lossStats}
              currentTeamId={116}
              showLink={false}
            />
          </div>

          <div>
            <h4 className="text-md font-medium mb-2 text-yellow-700">Draw Example</h4>
            <MediumGameResultCard 
              game={drawGame} 
              gameStats={drawStats}
              currentTeamId={116}
              showLink={false}
            />
          </div>

          <div>
            <h4 className="text-md font-medium mb-2 text-gray-700">Bye Example</h4>
            <MediumGameResultCard 
              game={byeGame} 
              gameStats={[]}
              currentTeamId={116}
              showLink={false}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Narrow Layout (sidebar, mobile)</h3>
        <div className="max-w-xs space-y-2">
          <NarrowGameResultCard 
            game={winGame} 
            gameStats={winStats}
            currentTeamId={116}
            showLink={false}
          />
          <NarrowGameResultCard 
            game={byeGame} 
            gameStats={[]}
            currentTeamId={116}
            showLink={false}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Wide Layout (lists, tables)</h3>
        <div className="max-w-2xl space-y-2">
          <WideGameResultCard 
            game={winGame} 
            gameStats={winStats}
            currentTeamId={116}
            showLink={false}
          />
          <WideGameResultCard 
            game={upcomingGame} 
            gameStats={[]}
            currentTeamId={116}
            showLink={false}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Custom Configuration</h3>
        <div className="max-w-lg">
          <GameResultCard
            game={drawGame}
            gameStats={drawStats}
            currentTeamId={116}
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
        <h3 className="text-lg font-semibold">Mixed Results Grid</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <GameResultCard
            game={winGame}
            gameStats={winStats}
            currentTeamId={116}
            layout="medium"
            showLink={false}
          />
          <GameResultCard
            game={lossGame}
            gameStats={lossStats}
            currentTeamId={116}
            layout="medium"
            showLink={false}
          />
          <GameResultCard
            game={drawGame}
            gameStats={drawStats}
            currentTeamId={116}
            layout="medium"
            showLink={false}
          />
          <GameResultCard
            game={byeGame}
            gameStats={[]}
            currentTeamId={116}
            layout="medium"
            showLink={false}
          />
          <GameResultCard
            game={upcomingGame}
            gameStats={[]}
            currentTeamId={116}
            layout="medium"
            showLink={false}
          />
        </div>
      </div>
    </div>
  );
}