import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { useLocation } from 'wouter';
import { ChevronLeft } from 'lucide-react';
import GameStatistics from '@/components/statistics/GameStatistics';
import SimpleStats from '@/components/statistics/SimpleStats';
import ExportButtons from '@/components/common/ExportButtons';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Game, Player, Opponent, Roster, GameStat } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { exportStatsToPDF, exportStatsToExcel } from '@/lib/exportUtils';
import { isGameValidForStatistics } from '@/lib/gameFilters';
import { useClub } from '@/contexts/ClubContext';
import { apiClient } from '@/lib/apiClient';

export default function Statistics() {
  const [location, navigate] = useLocation();
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const { toast } = useToast();
  const { currentClubId } = useClub();

  // Parse game ID from URL query parameter or route
  useEffect(() => {
    // Check for URL query parameter
    const queryParams = new URLSearchParams(window.location.search);
    const gameIdQuery = queryParams.get('game');

    // Check if we're on a route like /game/:id/stats
    const path = location;
    const gameIdFromPath = path.match(/^\/game\/(\d+)\/stats$/);

    if (gameIdQuery && !isNaN(Number(gameIdQuery))) {
      console.log(`Setting selected game ID to ${gameIdQuery} from URL parameter`);
      // Set the selected game ID
      setSelectedGameId(Number(gameIdQuery));
      // Replace the URL without the query parameter for cleaner navigation
      navigate(`/game/${gameIdQuery}/stats`, { replace: true });
    }
    else if (gameIdFromPath && gameIdFromPath[1] && !isNaN(Number(gameIdFromPath[1]))) {
      console.log(`Setting selected game ID to ${gameIdFromPath[1]} from URL path`);
      // Set the selected game ID from the path
      setSelectedGameId(Number(gameIdFromPath[1]));
      // We don't navigate away since this is the proper path format
    }
  }, [navigate, location]);

  // NEW: Use club-scoped data instead of global
  const { data: games = [], isLoading: isLoadingGames } = useQuery<Game[]>({
    queryKey: ['/api/clubs', currentClubId, 'games'],
    queryFn: () => apiClient.get(`/api/clubs/${currentClubId}/games`),
    enabled: !!currentClubId
  });

  // Keep opponents for now (will remove later)
  const { data: opponents = [], isLoading: isLoadingOpponents } = useQuery<Opponent[]>({
    queryKey: ['/api/opponents'],
  });

  const { data: players = [], isLoading: isLoadingPlayers } = useQuery<Player[]>({
    queryKey: ['/api/clubs', currentClubId, 'players'],
    queryFn: () => apiClient.get(`/api/clubs/${currentClubId}/players`),
    enabled: !!currentClubId
  });

  // Use state to store roster data
  const [rosterData, setRosterData] = useState<Roster[]>([]);
  const [loadingRosters, setLoadingRosters] = useState(false);

  // Fetch roster data directly when selectedGameId changes
  useEffect(() => {
    if (!selectedGameId) return;

    async function fetchRosters() {
      if (!currentClubId) return;
      
      setLoadingRosters(true);
      try {
        // Find the game to determine team context
        const game = games.find(g => g.id === selectedGameId);
        if (!game) throw new Error('Game not found');
        
        const rosterPromises = [];
        
        if (game.homeClubId === currentClubId) {
          rosterPromises.push(
            fetch(`/api/game/${selectedGameId}/team/${game.homeTeamId}/rosters`)
              .then(res => res.json())
          );
        }
        
        if (game.awayClubId === currentClubId && game.awayTeamId) {
          rosterPromises.push(
            fetch(`/api/game/${selectedGameId}/team/${game.awayTeamId}/rosters`)
              .then(res => res.json())
          );
        }
        
        const rosterArrays = await Promise.all(rosterPromises);
        const data = rosterArrays.flat();
        
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
  }, [selectedGameId, currentClubId, games]);

  // Use our manually fetched roster data instead of the query result
  const rosters = rosterData;
  const isLoadingRosters = loadingRosters;

  // State for game stats
  const [gameStatsData, setGameStatsData] = useState<GameStat[]>([]);
  const [loadingGameStats, setLoadingGameStats] = useState(false);

  // Fetch game statistics when selectedGameId changes
  useEffect(() => {
    if (!selectedGameId) return;

    async function fetchGameStats() {
      setLoadingGameStats(true);
      try {
        const response = await fetch(`/api/games/${selectedGameId}/stats`);
        if (!response.ok) throw new Error('Failed to fetch game stats');
        const data = await response.json();
        console.log(`Loaded ${data.length} game stat entries for game ${selectedGameId}`);
        setGameStatsData(data);
      } catch (error) {
        console.error('Error fetching game stats:', error);
        setGameStatsData([]);
      } finally {
        setLoadingGameStats(false);
      }
    }

    fetchGameStats();
  }, [selectedGameId]);

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
    (selectedGameId ? (isLoadingRosters || loadingGameStats) : false);

  // Filter to only completed games for statistics
  const completedGames = games.filter(game => isGameValidForStatistics(game));

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
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-heading font-bold text-neutral-dark">Game Statistics</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/games')}
              className="hidden sm:flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Games
            </Button>
          </div>
          {games.length === 0 ? (
            <div></div> /* Empty div to maintain flex layout */
          ) : (
            <div className="flex space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/games')}
                className="sm:hidden"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Button>
              <Select value={selectedGameId?.toString() || ''} onValueChange={(value) => setSelectedGameId(Number(value))}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Select Game" />
                </SelectTrigger>
                <SelectContent>
                  {completedGames.length === 0 ? (
                    <SelectItem value="none" disabled>No completed games</SelectItem>
                  ) : (
                    [...completedGames]
                      .sort((a, b) => (a.round || 0) - (b.round || 0))
                      .map(game => (
                        <SelectItem key={game.id} value={game.id.toString()}>
                          Round {game.round} - {opponents.find(o => o.id === game.opponentId)?.teamName}
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {isLoading ? (
          <Skeleton className="h-[500px] w-full" />
        ) : games.length === 0 ? (
          <Card className="mb-6 shadow-md">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">No Games Available</h3>
              <p className="text-muted-foreground mb-4">
                There are no games available for statistics tracking. Please create games first.
              </p>
              <button 
                className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
                onClick={() => window.location.href = '/games'}
              >
                Go to Games List
              </button>
            </CardContent>
          </Card>
        ) : selectedGame && selectedOpponent ? (
          <div className="space-y-6">
            <Card className="p-4">
              <CardContent className="pt-2">
                <h3 className="text-xl font-semibold mb-2">
                  Round {selectedGame.round} vs. {selectedOpponent.teamName}
                </h3>
                <p className="text-gray-600">{selectedGame.date} at {selectedGame.time}</p>

                {/* Export buttons */}
                <ExportButtons
                  onExportPDF={() => {
                    exportStatsToPDF(
                      selectedGame,
                      selectedOpponent,
                      gameStatsData,
                      players
                    );
                    toast({
                      title: "Success",
                      description: "Statistics have been exported to PDF",
                    });
                  }}
                  onExportExcel={() => {
                    exportStatsToExcel(
                      selectedGame,
                      selectedOpponent,
                      gameStatsData,
                      players
                    );
                    toast({
                      title: "Success",
                      description: "Statistics have been exported to Excel",
                    });
                  }}
                  className="mt-2"
                />
              </CardContent>
            </Card>

            {selectedGame.status === 'forfeit' ? (
              <Card className="p-6 text-center">
                <p className="text-gray-600 mb-2">This game is marked as a forfeit.</p>
                <p className="text-gray-600">Statistics editing is not available for forfeit games.</p>
              </Card>
            ) : fixedRosters.length > 0 ? (
              <SimpleStats
                gameId={selectedGame.id}
                players={players}
                rosters={fixedRosters}
                gameStats={gameStatsData}
              />
            ) : (
              <Card className="p-6 text-center">
                <p className="text-gray-600 mb-2">No roster data available for this game.</p>
                <p className="text-gray-600">Please set up the roster first before entering statistics.</p>
              </Card>
            )}
          </div>
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