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
  const [location, navigate] = useLocation();
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  
  // Parse game ID from URL query parameter if present - similar to how Roster page handles it
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const gameId = queryParams.get('game');
    
    if (gameId && !isNaN(Number(gameId))) {
      console.log(`Setting selected game ID to ${gameId} from URL parameter`);
      // Set the selected game ID
      setSelectedGameId(Number(gameId));
      // Replace the URL without the query parameter for cleaner navigation
      navigate('/statistics', { replace: true });
    }
  }, [navigate]);
  
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
  
  // Use state to store roster data
  const [rosterData, setRosterData] = useState<Roster[]>([]);
  const [loadingRosters, setLoadingRosters] = useState(false);
  
  // Fetch roster data directly when selectedGameId changes
  useEffect(() => {
    if (!selectedGameId) return;
    
    async function fetchRosters() {
      setLoadingRosters(true);
      try {
        const response = await fetch(`/api/games/${selectedGameId}/rosters`);
        if (!response.ok) throw new Error('Failed to fetch rosters');
        const data = await response.json();
        console.log(`Manually fetched ${data.length} roster entries`);
        setRosterData(data);
      } catch (error) {
        console.error('Error fetching roster data:', error);
        setRosterData([]);
      } finally {
        setLoadingRosters(false);
      }
    }
    
    fetchRosters();
  }, [selectedGameId]);
  
  // Attempt to fetch roster data again when selectedGameId changes
  useEffect(() => {
    if (selectedGameId) {
      console.log(`Loading roster data for game ${selectedGameId}`);
      fetch(`/api/games/${selectedGameId}/rosters`)
        .then(res => res.json())
        .then(data => {
          console.log(`Directly fetched ${data.length} roster entries for game ${selectedGameId}`);
          if (Array.isArray(data) && data.length > 0) {
            data.forEach(entry => {
              if ('position' in entry && 'playerId' in entry && 'quarter' in entry) {
                console.log("Found valid roster entry:", entry);
              }
            });
          }
          setRosterData(data);
        })
        .catch(err => {
          console.error("Error fetching roster data:", err);
          setRosterData([]);
        });
    }
  }, [selectedGameId]);
  
  // Use our manually fetched roster data instead of the query result
  const rosters = rosterData;
  const isLoadingRosters = loadingRosters;
  
  // Get statistics for selected game
  const { data: gameStats = [], isLoading: isLoadingStats } = useQuery<GameStat[]>({
    queryKey: ['/api/games', selectedGameId, 'stats'],
    enabled: !!selectedGameId,
  });
  
  // Check to ensure we have valid roster entries with the expected fields
  const hasValidRosterEntries = Array.isArray(rosters) && 
    rosters.length > 0 && 
    'position' in rosters[0] && 
    'playerId' in rosters[0] &&
    'quarter' in rosters[0];
  
  // If we don't have valid roster entries, use an empty array
  const fixedRosters = hasValidRosterEntries ? rosters : [];
  
  // Debug log showing the data we're working with
  console.log("Statistics roster data:", {
    hasValidRosterEntries,
    entries: fixedRosters.length,
    sample: fixedRosters.length > 0 ? fixedRosters[0] : null
  });
  
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
