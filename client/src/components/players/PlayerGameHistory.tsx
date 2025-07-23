import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PlayerGameHistoryProps {
  playerId: number;
}

const PlayerGameHistory: React.FC<PlayerGameHistoryProps> = ({ playerId }) => {
  // Fetch player's game history
  const { data: games, isLoading, error } = useQuery({
    queryKey: [`/api/players/${playerId}/games`],
    queryFn: () => apiClient.get(`/api/players/${playerId}/games`),
    enabled: !!playerId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Game History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading game history...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Game History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-red-600">
            Error loading game history
          </div>
        </CardContent>
      </Card>
    );
  }

  const gameHistory = (games as any[]) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Game History</CardTitle>
      </CardHeader>
      <CardContent>
        {gameHistory.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No games found for this player
          </div>
        ) : (
          <div className="space-y-3">
            {gameHistory.map((game: any) => (
              <div key={game.id} className="border rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">
                      {game.teamName} vs {game.opponentName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(game.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {game.teamScore} - {game.opponentScore}
                    </div>
                    <div className="text-sm text-gray-500">
                      {game.result}
                    </div>
                  </div>
                </div>
                {game.position && (
                  <div className="mt-2 text-sm text-gray-600">
                    Position: {game.position}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlayerGameHistory; 