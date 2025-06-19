import React from 'react';
import GameResultCard, { NarrowGameResultCard, MediumGameResultCard, WideGameResultCard } from './game-result-card';
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
  statusTeamGoals: 30,
  statusOpponentGoals: 45
};

const lossStats = [
  { id: 7, gameId: 3, position: 'GS', quarter: 1, goalsFor: 6, goalsAgainst: 12 },
  { id: 8, gameId: 3, position: 'GA', quarter: 1, goalsFor: 4, goalsAgainst: 8 }
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

      <div className="space-y-8">
        <h3 className="text-lg font-semibold">Quarter-by-Quarter Score Displays</h3>
        <p className="text-sm text-gray-600">Full-width game cards with detailed quarter breakdowns showing wins/losses per quarter</p>

        {/* Horizontal Quarter Chips Style */}
        <div>
          <h4 className="text-md font-medium mb-3 text-gray-700">Style 1: Horizontal Quarter Chips</h4>
          <div className="max-w-4xl">
            <div className="border-l-4 border-green-500 bg-green-50 rounded transition-colors cursor-pointer hover:bg-green-100 p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 text-base mb-2">
                    WNC Dingoes vs Cobras
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm text-gray-600">2024-06-16</span>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Round 6</span>
                  </div>
                  
                  {/* Quarter by Quarter */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">Quarters:</span>
                    <div className="flex gap-2">
                      <div className="px-3 py-1 rounded-full text-xs font-medium bg-green-200 text-green-800 border border-green-300">
                        Q1: 15-12 ✓
                      </div>
                      <div className="px-3 py-1 rounded-full text-xs font-medium bg-red-200 text-red-800 border border-red-300">
                        Q2: 12-16 ✗
                      </div>
                      <div className="px-3 py-1 rounded-full text-xs font-medium bg-green-200 text-green-800 border border-green-300">
                        Q3: 16-8 ✓
                      </div>
                      <div className="px-3 py-1 rounded-full text-xs font-medium bg-green-200 text-green-800 border border-green-300">
                        Q4: 17-14 ✓
                      </div>
                    </div>
                    <div className="ml-auto text-sm text-gray-600">
                      Quarters Won: <span className="font-medium text-green-700">3/4</span>
                    </div>
                  </div>
                </div>
                <div className="ml-6 px-4 py-2 text-lg font-bold text-white bg-green-600 rounded">
                  60-40
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grid Quarter Boxes Style */}
        <div>
          <h4 className="text-md font-medium mb-3 text-gray-700">Style 2: Quarter Grid Boxes</h4>
          <div className="max-w-4xl">
            <div className="border-l-4 border-red-500 bg-red-50 rounded transition-colors cursor-pointer hover:bg-red-100 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 text-base mb-2">
                    Sharks vs WNC Dingoes
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm text-gray-600">2024-06-17</span>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Round 7</span>
                  </div>
                  
                  {/* Quarter Grid */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700 mb-2">Quarter Breakdown:</div>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">Q1</div>
                        <div className="bg-red-100 border border-red-300 rounded p-2 min-h-[3rem] flex flex-col items-center justify-center">
                          <div className="font-medium text-sm">6-12</div>
                          <div className="text-xs text-red-700 mt-1">LOSS</div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">Q2</div>
                        <div className="bg-red-100 border border-red-300 rounded p-2 min-h-[3rem] flex flex-col items-center justify-center">
                          <div className="font-medium text-sm">8-10</div>
                          <div className="text-xs text-red-700 mt-1">LOSS</div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">Q3</div>
                        <div className="bg-green-100 border border-green-300 rounded p-2 min-h-[3rem] flex flex-col items-center justify-center">
                          <div className="font-medium text-sm">9-7</div>
                          <div className="text-xs text-green-700 mt-1">WIN</div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">Q4</div>
                        <div className="bg-red-100 border border-red-300 rounded p-2 min-h-[3rem] flex flex-col items-center justify-center">
                          <div className="font-medium text-sm">7-16</div>
                          <div className="text-xs text-red-700 mt-1">LOSS</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="ml-6 px-4 py-2 text-lg font-bold text-white bg-red-600 rounded">
                  30-45
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progressive Bar Style */}
        <div>
          <h4 className="text-md font-medium mb-3 text-gray-700">Style 3: Progressive Score Bars</h4>
          <div className="max-w-4xl">
            <div className="border-l-4 border-amber-500 bg-amber-50 rounded transition-colors cursor-pointer hover:bg-amber-100 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 text-base mb-2">
                    WNC Dingoes vs Lions
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm text-gray-600">2024-06-18</span>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Round 8</span>
                  </div>
                  
                  {/* Progressive Bars */}
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-gray-700">Quarter Progression:</div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 text-xs font-medium text-gray-600">Q1</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                          <div className="absolute left-0 top-0 h-full bg-amber-400 rounded-full flex items-center justify-center text-xs font-medium text-white" style={{ width: '52%' }}>
                            11
                          </div>
                          <div className="absolute right-0 top-0 h-full bg-gray-400 rounded-full flex items-center justify-center text-xs font-medium text-white" style={{ width: '48%' }}>
                            10
                          </div>
                        </div>
                        <div className="w-12 text-xs text-amber-700 font-medium">DRAW</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 text-xs font-medium text-gray-600">Q2</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                          <div className="absolute left-0 top-0 h-full bg-amber-400 rounded-full flex items-center justify-center text-xs font-medium text-white" style={{ width: '45%' }}>
                            9
                          </div>
                          <div className="absolute right-0 top-0 h-full bg-gray-400 rounded-full flex items-center justify-center text-xs font-medium text-white" style={{ width: '55%' }}>
                            11
                          </div>
                        </div>
                        <div className="w-12 text-xs text-red-700 font-medium">LOSS</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 text-xs font-medium text-gray-600">Q3</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                          <div className="absolute left-0 top-0 h-full bg-amber-400 rounded-full flex items-center justify-center text-xs font-medium text-white" style={{ width: '60%' }}>
                            12
                          </div>
                          <div className="absolute right-0 top-0 h-full bg-gray-400 rounded-full flex items-center justify-center text-xs font-medium text-white" style={{ width: '40%' }}>
                            8
                          </div>
                        </div>
                        <div className="w-12 text-xs text-green-700 font-medium">WIN</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 text-xs font-medium text-gray-600">Q4</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                          <div className="absolute left-0 top-0 h-full bg-amber-400 rounded-full flex items-center justify-center text-xs font-medium text-white" style={{ width: '54%' }}>
                            13
                          </div>
                          <div className="absolute right-0 top-0 h-full bg-gray-400 rounded-full flex items-center justify-center text-xs font-medium text-white" style={{ width: '46%' }}>
                            11
                          </div>
                        </div>
                        <div className="w-12 text-xs text-green-700 font-medium">WIN</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="ml-6 px-4 py-2 text-lg font-bold text-white bg-amber-600 rounded">
                  45-45
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vertical Timeline Style */}
        <div>
          <h4 className="text-md font-medium mb-3 text-gray-700">Style 4: Quarter Timeline</h4>
          <div className="max-w-4xl">
            <div className="border-l-4 border-green-500 bg-green-50 rounded transition-colors cursor-pointer hover:bg-green-100 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 text-base mb-2">
                    WNC Dingoes vs Cobras
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm text-gray-600">2024-06-16</span>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Round 6</span>
                  </div>
                  
                  {/* Timeline */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700 mb-3">Game Flow:</div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center">
                          1
                        </div>
                        <div className="text-sm">
                          <div className="font-medium text-green-700">15-12</div>
                          <div className="text-xs text-gray-600">+3 lead</div>
                        </div>
                      </div>
                      <div className="w-4 h-0.5 bg-gray-300"></div>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                          2
                        </div>
                        <div className="text-sm">
                          <div className="font-medium text-red-700">27-28</div>
                          <div className="text-xs text-gray-600">-1 behind</div>
                        </div>
                      </div>
                      <div className="w-4 h-0.5 bg-gray-300"></div>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center">
                          3
                        </div>
                        <div className="text-sm">
                          <div className="font-medium text-green-700">43-39</div>
                          <div className="text-xs text-gray-600">+4 lead</div>
                        </div>
                      </div>
                      <div className="w-4 h-0.5 bg-gray-300"></div>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center">
                          4
                        </div>
                        <div className="text-sm">
                          <div className="font-medium text-green-700">60-51</div>
                          <div className="text-xs text-gray-600">+9 final</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="ml-6 px-4 py-2 text-lg font-bold text-white bg-green-600 rounded">
                  60-51
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mini Court Layout Style */}
        <div>
          <h4 className="text-md font-medium mb-3 text-gray-700">Style 5: Court-Inspired Layout</h4>
          <div className="max-w-4xl">
            <div className="border-l-4 border-green-500 bg-green-50 rounded transition-colors cursor-pointer hover:bg-green-100 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 text-base mb-2">
                    WNC Dingoes vs Cobras
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm text-gray-600">2024-06-16</span>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Round 6</span>
                  </div>
                  
                  {/* Court-style quarters */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700 mb-3">Quarter Results:</div>
                    <div className="grid grid-cols-2 gap-3 max-w-md">
                      <div className="space-y-2">
                        <div className="bg-white border-2 border-green-300 rounded-lg p-3 text-center">
                          <div className="text-xs font-medium text-gray-600 mb-1">Q1</div>
                          <div className="text-lg font-bold text-green-700">15-12</div>
                          <div className="text-xs text-green-600">WIN</div>
                        </div>
                        <div className="bg-white border-2 border-green-300 rounded-lg p-3 text-center">
                          <div className="text-xs font-medium text-gray-600 mb-1">Q3</div>
                          <div className="text-lg font-bold text-green-700">16-11</div>
                          <div className="text-xs text-green-600">WIN</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="bg-white border-2 border-red-300 rounded-lg p-3 text-center">
                          <div className="text-xs font-medium text-gray-600 mb-1">Q2</div>
                          <div className="text-lg font-bold text-red-700">12-16</div>
                          <div className="text-xs text-red-600">LOSS</div>
                        </div>
                        <div className="bg-white border-2 border-green-300 rounded-lg p-3 text-center">
                          <div className="text-xs font-medium text-gray-600 mb-1">Q4</div>
                          <div className="text-lg font-bold text-green-700">17-12</div>
                          <div className="text-xs text-green-600">WIN</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="ml-6 flex flex-col items-center">
                  <div className="px-4 py-2 text-lg font-bold text-white bg-green-600 rounded mb-2">
                    60-51
                  </div>
                  <div className="text-xs text-green-700 font-medium">
                    3/4 Quarters Won
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stacked Score Display */}
        <div>
          <h4 className="text-md font-medium mb-3 text-gray-700">Style 6: Stacked Quarter Scores</h4>
          <div className="max-w-4xl">
            <div className="border-l-4 border-amber-500 bg-amber-50 rounded transition-colors cursor-pointer hover:bg-amber-100 p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 text-base mb-2">
                    WNC Dingoes vs Lions
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm text-gray-600">2024-06-18</span>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Round 8</span>
                  </div>
                </div>
                
                {/* Stacked quarters and final score */}
                <div className="flex items-center gap-4">
                  <div className="flex gap-1">
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Q1</div>
                      <div className="bg-amber-200 border border-amber-400 rounded px-2 py-1">
                        <div className="text-xs font-bold text-amber-800">11</div>
                        <div className="text-xs font-bold text-amber-800">10</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Q2</div>
                      <div className="bg-red-200 border border-red-400 rounded px-2 py-1">
                        <div className="text-xs font-bold text-red-800">9</div>
                        <div className="text-xs font-bold text-red-800">11</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Q3</div>
                      <div className="bg-green-200 border border-green-400 rounded px-2 py-1">
                        <div className="text-xs font-bold text-green-800">12</div>
                        <div className="text-xs font-bold text-green-800">8</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Q4</div>
                      <div className="bg-green-200 border border-green-400 rounded px-2 py-1">
                        <div className="text-xs font-bold text-green-800">13</div>
                        <div className="text-xs font-bold text-green-800">11</div>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-2 text-lg font-bold text-white bg-amber-600 rounded">
                    45-40
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Inline Style */}
        <div>
          <h4 className="text-md font-medium mb-3 text-gray-700">Style 7: Compact Inline Quarters</h4>
          <div className="max-w-4xl space-y-2">
            <div className="border-l-4 border-green-500 bg-green-50 rounded transition-colors cursor-pointer hover:bg-green-100 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-800 text-sm">WNC Dingoes vs Cobras</div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-600">2024-06-16 • Round 6</span>
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-gray-600">Q:</span>
                      <span className="px-1 py-0.5 bg-green-200 text-green-800 rounded font-medium">15-12</span>
                      <span className="px-1 py-0.5 bg-red-200 text-red-800 rounded font-medium">12-16</span>
                      <span className="px-1 py-0.5 bg-green-200 text-green-800 rounded font-medium">16-11</span>
                      <span className="px-1 py-0.5 bg-green-200 text-green-800 rounded font-medium">17-12</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-green-700 font-medium">3W-1L</div>
                  <div className="px-3 py-1 text-sm font-bold text-white bg-green-600 rounded">60-51</div>
                </div>
              </div>
            </div>
            <div className="border-l-4 border-red-500 bg-red-50 rounded transition-colors cursor-pointer hover:bg-red-100 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-800 text-sm">Sharks vs WNC Dingoes</div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-600">2024-06-17 • Round 7</span>
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-gray-600">Q:</span>
                      <span className="px-1 py-0.5 bg-red-200 text-red-800 rounded font-medium">6-12</span>
                      <span className="px-1 py-0.5 bg-red-200 text-red-800 rounded font-medium">8-10</span>
                      <span className="px-1 py-0.5 bg-green-200 text-green-800 rounded font-medium">9-7</span>
                      <span className="px-1 py-0.5 bg-red-200 text-red-800 rounded font-medium">7-16</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-red-700 font-medium">1W-3L</div>
                  <div className="px-3 py-1 text-sm font-bold text-white bg-red-600 rounded">30-45</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Same Layout with Q-by-Q Between Team Name and Final Score */}
        <div>
          <h4 className="text-md font-medium mb-3 text-gray-700">Style 8: Quarters Between Team Name and Score</h4>
          <div className="max-w-4xl space-y-3">
            
            {/* Classic Layout with centered quarters */}
            <div className="border-l-4 border-green-500 bg-green-50 rounded transition-colors cursor-pointer hover:bg-green-100 p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 text-base mb-2">
                    WNC Dingoes vs Cobras
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm text-gray-600">2024-06-16</span>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Round 6</span>
                  </div>
                  
                  {/* Quarter scores between name and final */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-600 font-medium">Quarters:</span>
                    <div className="flex gap-1">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 border border-green-300 rounded">15-12</span>
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 border border-red-300 rounded">12-16</span>
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 border border-green-300 rounded">16-11</span>
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 border border-green-300 rounded">17-12</span>
                    </div>
                  </div>
                </div>
                <div className="ml-6 px-4 py-2 text-lg font-bold text-white bg-green-600 rounded">
                  60-51
                </div>
              </div>
            </div>

            {/* Vertical Stack Layout */}
            <div className="border-l-4 border-red-500 bg-red-50 rounded transition-colors cursor-pointer hover:bg-red-100 p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 text-base mb-2">
                    Sharks vs WNC Dingoes
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm text-gray-600">2024-06-17</span>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Round 7</span>
                  </div>
                  
                  {/* Quarter breakdown in grid */}
                  <div className="grid grid-cols-4 gap-1 max-w-xs">
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Q1</div>
                      <div className="bg-red-100 border border-red-300 rounded px-1 py-1">
                        <div className="text-xs font-medium text-red-800">6-12</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Q2</div>
                      <div className="bg-red-100 border border-red-300 rounded px-1 py-1">
                        <div className="text-xs font-medium text-red-800">8-10</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Q3</div>
                      <div className="bg-green-100 border border-green-300 rounded px-1 py-1">
                        <div className="text-xs font-medium text-green-800">9-7</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Q4</div>
                      <div className="bg-red-100 border border-red-300 rounded px-1 py-1">
                        <div className="text-xs font-medium text-red-800">7-16</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="ml-6 px-4 py-2 text-lg font-bold text-white bg-red-600 rounded">
                  30-45
                </div>
              </div>
            </div>

            {/* Table-style quarters */}
            <div className="border-l-4 border-amber-500 bg-amber-50 rounded transition-colors cursor-pointer hover:bg-amber-100 p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 text-base mb-2">
                    WNC Dingoes vs Lions
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm text-gray-600">2024-06-18</span>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Round 8</span>
                  </div>
                  
                  {/* Horizontal table-style quarters */}
                  <div className="bg-white border border-gray-200 rounded overflow-hidden">
                    <div className="grid grid-cols-5 divide-x divide-gray-200">
                      <div className="px-2 py-1 bg-gray-50 text-xs font-medium text-gray-600 text-center">Quarters</div>
                      <div className="px-2 py-1 text-center text-xs">
                        <div className="font-medium text-gray-700">Q1</div>
                        <div className="font-bold text-amber-700">11-10</div>
                      </div>
                      <div className="px-2 py-1 text-center text-xs">
                        <div className="font-medium text-gray-700">Q2</div>
                        <div className="font-bold text-red-700">9-11</div>
                      </div>
                      <div className="px-2 py-1 text-center text-xs">
                        <div className="font-medium text-gray-700">Q3</div>
                        <div className="font-bold text-green-700">12-8</div>
                      </div>
                      <div className="px-2 py-1 text-center text-xs">
                        <div className="font-medium text-gray-700">Q4</div>
                        <div className="font-bold text-green-700">13-11</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="ml-6 px-4 py-2 text-lg font-bold text-white bg-amber-600 rounded">
                  45-40
                </div>
              </div>
            </div>

            {/* Minimal Dot Indicators */}
            <div className="border-l-4 border-green-500 bg-green-50 rounded transition-colors cursor-pointer hover:bg-green-100 p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 text-base mb-2">
                    WNC Dingoes vs Eagles
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm text-gray-600">2024-06-19</span>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Round 9</span>
                  </div>
                  
                  {/* Dot-style minimal quarters */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 font-medium">Q-by-Q:</span>
                    <div className="flex items-center gap-1">
                      <div className="flex items-center gap-0.5">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs font-medium text-green-700">14-11</span>
                      </div>
                      <div className="w-1 h-0.5 bg-gray-300 mx-1"></div>
                      <div className="flex items-center gap-0.5">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs font-medium text-green-700">13-9</span>
                      </div>
                      <div className="w-1 h-0.5 bg-gray-300 mx-1"></div>
                      <div className="flex items-center gap-0.5">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-xs font-medium text-red-700">8-12</span>
                      </div>
                      <div className="w-1 h-0.5 bg-gray-300 mx-1"></div>
                      <div className="flex items-center gap-0.5">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs font-medium text-green-700">15-10</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="ml-6 px-4 py-2 text-lg font-bold text-white bg-green-600 rounded">
                  50-42
                </div>
              </div>
            </div>

            {/* Compact Single Row */}
            <div className="border-l-4 border-purple-500 bg-purple-50 rounded transition-colors cursor-pointer hover:bg-purple-100 p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 text-base mb-3">
                    WNC Dingoes vs Thunder
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">2024-06-20</span>
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Round 10</span>
                    </div>
                    
                    {/* Single line quarters */}
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-gray-600">Q1-4:</span>
                      <span className="font-medium text-purple-700">12-10</span>
                      <span className="text-gray-400">•</span>
                      <span className="font-medium text-purple-700">14-8</span>
                      <span className="text-gray-400">•</span>
                      <span className="font-medium text-red-700">7-13</span>
                      <span className="text-gray-400">•</span>
                      <span className="font-medium text-purple-700">16-9</span>
                    </div>
                  </div>
                </div>
                <div className="ml-6 px-4 py-2 text-lg font-bold text-white bg-purple-600 rounded">
                  49-40
                </div>
              </div>
            </div>

            {/* Progressive Scoring */}
            <div className="border-l-4 border-indigo-500 bg-indigo-50 rounded transition-colors cursor-pointer hover:bg-indigo-100 p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 text-base mb-2">
                    WNC Dingoes vs Panthers
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm text-gray-600">2024-06-21</span>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Round 11</span>
                  </div>
                  
                  {/* Progressive quarter scores showing cumulative */}
                  <div className="space-y-1">
                    <div className="text-xs text-gray-600 font-medium mb-1">Progressive Score:</div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <span className="w-5 text-gray-500">Q1:</span>
                        <span className="font-medium text-indigo-700">13</span>
                        <span className="text-gray-400">-</span>
                        <span className="font-medium text-gray-700">11</span>
                      </div>
                      <span className="text-gray-300">→</span>
                      <div className="flex items-center gap-1">
                        <span className="w-5 text-gray-500">Q2:</span>
                        <span className="font-medium text-indigo-700">25</span>
                        <span className="text-gray-400">-</span>
                        <span className="font-medium text-gray-700">20</span>
                      </div>
                      <span className="text-gray-300">→</span>
                      <div className="flex items-center gap-1">
                        <span className="w-5 text-gray-500">Q3:</span>
                        <span className="font-medium text-indigo-700">34</span>
                        <span className="text-gray-400">-</span>
                        <span className="font-medium text-gray-700">33</span>
                      </div>
                      <span className="text-gray-300">→</span>
                      <div className="flex items-center gap-1">
                        <span className="w-5 text-gray-500">Q4:</span>
                        <span className="font-medium text-indigo-700">47</span>
                        <span className="text-gray-400">-</span>
                        <span className="font-medium text-gray-700">42</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="ml-6 px-4 py-2 text-lg font-bold text-white bg-indigo-600 rounded">
                  47-42
                </div>
              </div>
            </div>
          </div>

          {/* Style 9: Compact with Quarter/Cumulative Split */}
          <div>
            <h4 className="text-md font-medium mb-3 text-gray-700">Style 9: Compact with Quarter/Cumulative Split</h4>
            <div className="max-w-4xl space-y-3">
              
              {/* Win Example with Q-by-Q and Cumulative */}
              <div className="border border-gray-200 border-l-4 border-l-green-500 bg-green-50 rounded transition-colors cursor-pointer hover:bg-green-100 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 text-sm mb-2">WNC Dingoes vs Cobras</div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-600">2024-06-16 • Round 6</span>
                    </div>
                  </div>
                  
                  {/* Quarter scores positioned closer to final score */}
                  <div className="flex items-center gap-4">
                    <div className="text-xs space-y-1">
                      {/* Quarter-by-quarter scores on top (lighter) */}
                      <div className="grid grid-cols-4 gap-1">
                        <span className="px-1 py-0.5 bg-green-100 text-green-700 border border-green-400 rounded font-medium text-center">15-12</span>
                        <span className="px-1 py-0.5 bg-red-100 text-red-700 border border-red-400 rounded font-medium text-center">12-16</span>
                        <span className="px-1 py-0.5 bg-green-100 text-green-700 border border-green-400 rounded font-medium text-center">16-11</span>
                        <span className="px-1 py-0.5 bg-green-100 text-green-700 border border-green-400 rounded font-medium text-center">17-12</span>
                      </div>
                      {/* Cumulative scores underneath (darker) */}
                      <div className="grid grid-cols-4 gap-1">
                        <span className="px-1 py-0.5 bg-green-200 text-green-800 border border-green-500 rounded text-xs text-center">15-12</span>
                        <span className="px-1 py-0.5 bg-red-200 text-red-800 border border-red-500 rounded text-xs text-center">27-28</span>
                        <span className="px-1 py-0.5 bg-green-200 text-green-800 border border-green-500 rounded text-xs text-center">43-39</span>
                        <span className="px-1 py-0.5 bg-green-200 text-green-800 border border-green-500 rounded text-xs text-center">60-51</span>
                      </div>
                    </div>
                    <div className="px-3 py-1 text-sm font-bold text-white bg-green-600 rounded">60-51</div>
                  </div>
                </div>
              </div>

              {/* Loss Example */}
              <div className="border border-gray-200 border-l-4 border-l-red-500 bg-red-50 rounded transition-colors cursor-pointer hover:bg-red-100 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 text-sm mb-2">Sharks vs WNC Dingoes</div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-600">2024-06-17 • Round 7</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-xs space-y-1">
                      <div className="grid grid-cols-4 gap-1">
                        <span className="px-1 py-0.5 bg-red-100 text-red-700 border border-red-400 rounded font-medium text-center">6-12</span>
                        <span className="px-1 py-0.5 bg-red-100 text-red-700 border border-red-400 rounded font-medium text-center">8-10</span>
                        <span className="px-1 py-0.5 bg-green-100 text-green-700 border border-green-400 rounded font-medium text-center">9-7</span>
                        <span className="px-1 py-0.5 bg-red-100 text-red-700 border border-red-400 rounded font-medium text-center">7-16</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1">
                        <span className="px-1 py-0.5 bg-red-200 text-red-800 border border-red-500 rounded text-xs text-center">6-12</span>
                        <span className="px-1 py-0.5 bg-red-200 text-red-800 border border-red-500 rounded text-xs text-center">14-22</span>
                        <span className="px-1 py-0.5 bg-red-200 text-red-800 border border-red-500 rounded text-xs text-center">23-29</span>
                        <span className="px-1 py-0.5 bg-red-200 text-red-800 border border-red-500 rounded text-xs text-center">30-45</span>
                      </div>
                    </div>
                    <div className="px-3 py-1 text-sm font-bold text-white bg-red-600 rounded">30-45</div>
                  </div>
                </div>
              </div>

              {/* Draw Example */}
              <div className="border border-gray-200 border-l-4 border-l-amber-500 bg-amber-50 rounded transition-colors cursor-pointer hover:bg-amber-100 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 text-sm mb-2">WNC Dingoes vs Lions</div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-600">2024-06-18 • Round 8</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-xs space-y-1">
                      <div className="grid grid-cols-4 gap-1">
                        <span className="px-1 py-0.5 bg-green-100 text-green-700 border border-green-400 rounded font-medium text-center">11-10</span>
                        <span className="px-1 py-0.5 bg-red-100 text-red-700 border border-red-400 rounded font-medium text-center">9-11</span>
                        <span className="px-1 py-0.5 bg-green-100 text-green-700 border border-green-400 rounded font-medium text-center">12-8</span>
                        <span className="px-1 py-0.5 bg-green-100 text-green-700 border border-green-400 rounded font-medium text-center">13-11</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1">
                        <span className="px-1 py-0.5 bg-green-200 text-green-800 border border-green-500 rounded text-xs text-center">11-10</span>
                        <span className="px-1 py-0.5 bg-red-200 text-red-800 border border-red-500 rounded text-xs text-center">20-21</span>
                        <span className="px-1 py-0.5 bg-green-200 text-green-800 border border-green-500 rounded text-xs text-center">32-29</span>
                        <span className="px-1 py-0.5 bg-amber-200 text-amber-800 border border-amber-500 rounded text-xs text-center">45-45</span>
                      </div>
                    </div>
                    <div className="px-3 py-1 text-sm font-bold text-white bg-amber-600 rounded">45-45</div>
                  </div>
                </div>
              </div>

              {/* Tighter spacing version */}
              <div className="border border-gray-200 border-l-4 border-l-purple-500 bg-purple-50 rounded transition-colors cursor-pointer hover:bg-purple-100 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 text-sm mb-1">WNC Dingoes vs Thunder</div>
                    <div className="text-xs text-gray-600">2024-06-20 • Round 10</div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-xs">
                      <div className="grid grid-cols-4 gap-0.5 mb-0.5">
                        <span className="px-1 bg-green-100 text-green-700 border border-green-400 rounded text-xs font-medium text-center">12-10</span>
                        <span className="px-1 bg-green-100 text-green-700 border border-green-400 rounded text-xs font-medium text-center">14-8</span>
                        <span className="px-1 bg-red-100 text-red-700 border border-red-400 rounded text-xs font-medium text-center">7-13</span>
                        <span className="px-1 bg-green-100 text-green-700 border border-green-400 rounded text-xs font-medium text-center">16-9</span>
                      </div>
                      <div className="grid grid-cols-4 gap-0.5">
                        <span className="px-1 bg-green-200 text-green-800 border border-green-500 rounded text-xs text-center">12-10</span>
                        <span className="px-1 bg-green-200 text-green-800 border border-green-500 rounded text-xs text-center">26-18</span>
                        <span className="px-1 bg-red-200 text-red-800 border border-red-500 rounded text-xs text-center">33-31</span>
                        <span className="px-1 bg-green-200 text-green-800 border border-green-500 rounded text-xs text-center">49-40</span>
                      </div>
                    </div>
                    <div className="px-3 py-1 text-sm font-bold text-white bg-purple-600 rounded">49-40</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Hover Effect Comparisons</h3>
        
        {/* Background Darkening Effects */}
        <div>
          <h4 className="text-md font-medium mb-3 text-gray-700">Background Darkening Hover Effects</h4>
          <div className="bg-white p-6 rounded-lg border space-y-4">
            <p className="text-sm text-gray-600 mb-4">Game result cards with background darkening on hover (similar to games list)</p>
            
            {/* Light Background Darkening */}
            <div>
              <h5 className="text-sm font-medium mb-2 text-gray-600">Light Background Darkening</h5>
              <div className="max-w-lg space-y-2">
                {[winGame, lossGame, drawGame].map((game, index) => {
                  const gameStats = index === 0 ? winStats : index === 1 ? lossStats : drawStats;
                  return (
                    <div 
                      key={`bg-light-${game.id}`}
                      className="border-l-4 border-t border-r border-b rounded transition-all duration-300 cursor-pointer flex items-center justify-between p-3 space-x-3"
                      style={{
                        borderColor: index === 0 ? '#10b981' : index === 1 ? '#ef4444' : '#f59e0b',
                        backgroundColor: index === 0 ? '#dcfdf7' : index === 1 ? '#fef2f2' : '#fef3c7'
                      }}
                      onMouseEnter={(e) => {
                        const bgColor = index === 0 ? '#d1fae5' : index === 1 ? '#fee2e2' : '#fef3c7';
                        e.currentTarget.style.backgroundColor = bgColor;
                      }}
                      onMouseLeave={(e) => {
                        const bgColor = index === 0 ? '#dcfdf7' : index === 1 ? '#fef2f2' : '#fef3c7';
                        e.currentTarget.style.backgroundColor = bgColor;
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-800 truncate text-sm">
                          vs {game.awayTeamName}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-600">
                            {game.date}
                          </span>
                        </div>
                      </div>
                      <div className="ml-auto px-3 py-1 text-sm font-medium text-white rounded"
                           style={{backgroundColor: index === 0 ? '#10b981' : index === 1 ? '#ef4444' : '#f59e0b'}}>
                        {index === 0 ? '60-40' : index === 1 ? '30-45' : '45-45'}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="text-xs text-gray-500 mt-2">Background Darkening Effect</div>
            </div>
          </div>
        </div>

        {/* Shadow Variations */}
        <div>
          <h4 className="text-md font-medium mb-3 text-gray-700">Shadow Hover Variations</h4>
          <div className="bg-white p-6 rounded-lg border space-y-4">
            <p className="text-sm text-gray-600 mb-4">Game result cards with different shadow hover effects</p>
            
            {/* Minimal Shadow Change */}
            <div>
              <h5 className="text-sm font-medium mb-2 text-gray-600">Minimal Shadow Change</h5>
              <div className="max-w-lg space-y-2">
                {[winGame, lossGame, drawGame].map((game, index) => {
                  const gameStats = index === 0 ? winStats : index === 1 ? lossStats : drawStats;
                  return (
                    <div 
                      key={`shadow-minimal-${game.id}`}
                      className="border-l-4 border-t border-r border-b rounded shadow-sm transition-shadow duration-300 hover:shadow-md cursor-pointer flex items-center justify-between p-3 space-x-3"
                      style={{
                        borderColor: index === 0 ? '#10b981' : index === 1 ? '#ef4444' : '#f59e0b',
                        backgroundColor: index === 0 ? '#dcfdf7' : index === 1 ? '#fef2f2' : '#fef3c7'
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-800 truncate text-sm">
                          vs {game.awayTeamName}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-600">
                            {game.date}
                          </span>
                        </div>
                      </div>
                      <div className="ml-auto px-3 py-1 text-sm font-medium text-white rounded"
                           style={{backgroundColor: index === 0 ? '#10b981' : index === 1 ? '#ef4444' : '#f59e0b'}}>
                        {index === 0 ? '60-40' : index === 1 ? '30-45' : '45-45'}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="text-xs text-gray-500 mt-2">Minimal Shadow Change (shadow-sm → shadow-md)</div>
            </div>

            {/* Standard Shadow Change */}
            <div>
              <h5 className="text-sm font-medium mb-2 text-gray-600">Standard Shadow Change</h5>
              <div className="max-w-lg space-y-2">
                {[winGame, lossGame, drawGame].map((game, index) => {
                  const gameStats = index === 0 ? winStats : index === 1 ? lossStats : drawStats;
                  return (
                    <div 
                      key={`shadow-standard-${game.id}`}
                      className="border-l-4 border-t border-r border-b rounded shadow-md transition-shadow duration-300 hover:shadow-lg cursor-pointer flex items-center justify-between p-3 space-x-3"
                      style={{
                        borderColor: index === 0 ? '#10b981' : index === 1 ? '#ef4444' : '#f59e0b',
                        backgroundColor: index === 0 ? '#dcfdf7' : index === 1 ? '#fef2f2' : '#fef3c7'
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-800 truncate text-sm">
                          vs {game.awayTeamName}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-600">
                            {game.date}
                          </span>
                        </div>
                      </div>
                      <div className="ml-auto px-3 py-1 text-sm font-medium text-white rounded"
                           style={{backgroundColor: index === 0 ? '#10b981' : index === 1 ? '#ef4444' : '#f59e0b'}}>
                        {index === 0 ? '60-40' : index === 1 ? '30-45' : '45-45'}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="text-xs text-gray-500 mt-2">Standard Shadow Change (shadow-md → shadow-lg)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}