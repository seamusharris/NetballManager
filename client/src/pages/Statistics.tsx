import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { useLocation } from 'wouter';
import GameStatistics from '@/components/statistics/GameStatistics';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Game, Player, Opponent, Roster, GameStat } from '@shared/schema';

export default function Statistics() {
  const [location] = useLocation();
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  
  // Parse game ID from URL query parameter if present
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    const gameId = params.get('game');
    if (gameId) {
      setSelectedGameId(Number(gameId));
    }
  }, [location]);
  
  // Type our data with explicit types from the schema
  const { data: games = [], isLoading: isLoadingGames } = useQuery<Game[]>({
    queryKey: ['/api/games'],
  });
  
  const { data: opponents = [], isLoading: isLoadingOpponents } = useQuery<Opponent[]>({
    queryKey: ['/api/opponents'],
  });
  
  const { data: players = [], isLoading: isLoadingPlayers } = useQuery<Player[]>({
    queryKey: ['/api/players'],
  });
  
  // Get rosters for selected game
  const { data: rosters = [], isLoading: isLoadingRosters } = useQuery<Roster[]>({
    queryKey: ['/api/games', selectedGameId, 'rosters'],
    enabled: !!selectedGameId,
    staleTime: 0, // Don't use cached data
    refetchOnWindowFocus: true, // Refetch when window gets focus
  });
  
  // Get statistics for selected game
  const { data: gameStats = [], isLoading: isLoadingStats } = useQuery<GameStat[]>({
    queryKey: ['/api/games', selectedGameId, 'stats'],
    enabled: !!selectedGameId,
  });
  
  // Debug log to verify what's being passed to the component
  console.log("Statistics page data:", {
    selectedGameId,
    rostersData: rosters,
    dataTypes: {
      rosters: Array.isArray(rosters) ? 'array' : typeof rosters,
      firstItem: rosters.length > 0 ? typeof rosters[0] : 'none'
    }
  });
  
  // Reset to an empty array if we received a game object instead of roster entries
  // This can happen in some API responses
  const fixedRosters = Array.isArray(rosters) && rosters.length > 0 && 'date' in rosters[0] 
    ? [] // This is a Game object, not roster entries
    : rosters;
  
  const isLoading = isLoadingGames || isLoadingOpponents || isLoadingPlayers || 
    (selectedGameId ? (isLoadingRosters || isLoadingStats) : false);
  
  // Filter to only completed games for statistics
  const completedGames = games.filter(game => game.completed);
  
  // Get selected game and opponent
  const selectedGame = selectedGameId 
    ? games.find(game => game.id === selectedGameId) 
    : null;
    
  const selectedOpponent = selectedGame
    ? opponents.find(opponent => opponent.id === selectedGame.opponentId)
    : null;
  
  return (
    <>
      <Helmet>
        <title>Statistics | NetballManager</title>
        <meta name="description" content="Track detailed netball game statistics, player performance metrics and game results" />
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-heading font-bold text-neutral-dark">Game Statistics</h2>
          <div className="flex space-x-3">
            <Select value={selectedGameId?.toString() || ''} onValueChange={(value) => setSelectedGameId(Number(value))}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select Game" />
              </SelectTrigger>
              <SelectContent>
                {completedGames.length === 0 ? (
                  <SelectItem value="none" disabled>No completed games</SelectItem>
                ) : (
                  completedGames.map(game => (
                    <SelectItem key={game.id} value={game.id.toString()}>
                      vs. {opponents.find(o => o.id === game.opponentId)?.teamName} - {game.date}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {isLoading ? (
          <Skeleton className="h-[500px] w-full" />
        ) : selectedGame && selectedOpponent ? (
          <GameStatistics 
            game={selectedGame}
            opponent={selectedOpponent}
            players={players}
            gameStats={gameStats}
            rosters={fixedRosters}
            isLoading={isLoading}
          />
        ) : (
          <Card className="flex flex-col items-center justify-center p-10 text-center">
            <h3 className="text-xl font-semibold mb-4">Select a Game to View Statistics</h3>
            <p className="text-gray-500 mb-4">
              Please select a completed game from the dropdown above to view and edit statistics
            </p>
            {completedGames.length === 0 && (
              <p className="text-warning">
                There are no completed games in the system yet. Mark a game as completed in the Games section to enter statistics.
              </p>
            )}
          </Card>
        )}
      </div>
    </>
  );
}
