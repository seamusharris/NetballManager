import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'wouter';
import { Game, GameStats, GameScore } from '@shared/types';

interface StatsDebugTableProps {
  games: Game[];
  batchScores: Record<number, GameScore[]>;
  batchStats: Record<number, GameStats[]>;
  teamId: number;
  className?: string;
}

export function StatsDebugTable({ 
  games, 
  batchScores, 
  batchStats, 
  teamId, 
  className = "" 
}: StatsDebugTableProps) {
  const [, setLocation] = useLocation();
  const debugData = games
    .filter(game => game.status === 'completed' && game.statusAllowsStatistics === true)
    .map(game => {
      // Calculate official scores from batchScores
      const gameScores = batchScores[game.id] || [];
      const teamScores = gameScores.filter(score => score.teamId === teamId);
      const opponentScores = gameScores.filter(score => score.teamId !== teamId);
      
      const officialGoalsFor = teamScores.reduce((sum, score) => sum + (score.score || 0), 0);
      const officialGoalsAgainst = opponentScores.reduce((sum, score) => sum + (score.score || 0), 0);
      
      // Calculate position stats from batchStats
      const gameStats = batchStats[game.id] || [];
      const teamStats = gameStats.filter(stat => stat.teamId === teamId);
      
      const positionGoalsFor = teamStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
      const positionGoalsAgainst = teamStats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);
      
      // Calculate position breakdowns
      const gsGoals = teamStats.filter(stat => stat.position === 'GS').reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
      const gaGoals = teamStats.filter(stat => stat.position === 'GA').reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
      const gkGoals = teamStats.filter(stat => stat.position === 'GK').reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);
      const gdGoals = teamStats.filter(stat => stat.position === 'GD').reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);
      
      const hasMismatch = Math.abs(officialGoalsFor - positionGoalsFor) > 0.1 || Math.abs(officialGoalsAgainst - positionGoalsAgainst) > 0.1;
      
      return {
        gameId: game.id,
        date: game.date,
        opponent: game.homeTeamId === teamId ? game.awayTeamName : game.homeTeamName,
        officialGoalsFor,
        officialGoalsAgainst,
        positionGoalsFor,
        positionGoalsAgainst,
        gsGoals,
        gaGoals,
        gkGoals,
        gdGoals,
        hasMismatch,
        teamScores: teamScores.map(s => ({ quarter: s.quarter, score: s.score })),
        opponentScores: opponentScores.map(s => ({ quarter: s.quarter, score: s.score })),
        positionStats: teamStats.map(s => ({ position: s.position, quarter: s.quarter, goalsFor: s.goalsFor, goalsAgainst: s.goalsAgainst }))
      };
    });

  const gamesWithMismatches = debugData.filter(game => game.hasMismatch);
  const gamesWithoutMismatches = debugData.filter(game => !game.hasMismatch);

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Stats Debug Table</span>
            {gamesWithMismatches.length > 0 && (
              <Badge variant="destructive">
                {gamesWithMismatches.length} mismatch{gamesWithMismatches.length !== 1 ? 'es' : ''}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Game ID</th>
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Opponent</th>
                  <th className="text-left p-2">Official For</th>
                  <th className="text-left p-2">Official Against</th>
                  <th className="text-left p-2">Position For</th>
                  <th className="text-left p-2">Position Against</th>
                  <th className="text-left p-2">GS</th>
                  <th className="text-left p-2">GA</th>
                  <th className="text-left p-2">GK</th>
                  <th className="text-left p-2">GD</th>
                  <th className="text-left p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {debugData.map((game) => (
                  <tr 
                    key={game.gameId} 
                    className={`border-b cursor-pointer ${game.hasMismatch ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}`}
                    onClick={() => setLocation(`/team/${teamId}/game/${game.gameId}`)}
                  >
                    <td className="p-2 font-mono">{game.gameId}</td>
                    <td className="p-2">{new Date(game.date).toLocaleDateString()}</td>
                    <td className="p-2">{game.opponent}</td>
                    <td className="p-2 font-mono">{game.officialGoalsFor}</td>
                    <td className="p-2 font-mono">{game.officialGoalsAgainst}</td>
                    <td className="p-2 font-mono">{game.positionGoalsFor}</td>
                    <td className="p-2 font-mono">{game.positionGoalsAgainst}</td>
                    <td className="p-2 font-mono">{game.gsGoals}</td>
                    <td className="p-2 font-mono">{game.gaGoals}</td>
                    <td className="p-2 font-mono">{game.gkGoals}</td>
                    <td className="p-2 font-mono">{game.gdGoals}</td>
                    <td className="p-2">
                      {game.hasMismatch ? (
                        <Badge variant="destructive">MISMATCH</Badge>
                      ) : (
                        <Badge variant="secondary">OK</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {gamesWithMismatches.length > 0 && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-2">Mismatches Found:</h3>
              {gamesWithMismatches.map((game) => (
                <div key={game.gameId} className="mb-3 p-3 bg-white rounded border">
                  <div className="font-semibold">Game {game.gameId} vs {game.opponent}</div>
                  <div className="text-sm text-gray-600">
                    <div>Official: {game.officialGoalsFor} for, {game.officialGoalsAgainst} against</div>
                    <div>Position: {game.positionGoalsFor} for, {game.positionGoalsAgainst} against</div>
                    <div>Difference: {Math.abs(game.officialGoalsFor - game.positionGoalsFor)} for, {Math.abs(game.officialGoalsAgainst - game.positionGoalsAgainst)} against</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-4 text-sm text-gray-600">
            <div>Total games analyzed: {debugData.length}</div>
            <div>Games with mismatches: {gamesWithMismatches.length}</div>
            <div>Games without mismatches: {gamesWithoutMismatches.length}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 