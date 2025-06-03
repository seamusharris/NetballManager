import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Users, Calendar, Settings } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiRequest } from '@/lib/apiClient';
import SimpleRosterManager from '@/components/roster/SimpleRosterManager';
import PlayerAvailabilityManager from '@/components/roster/PlayerAvailabilityManager';
import { useLocation, useParams } from 'wouter';
import { Game, Player, Opponent } from '@shared/schema';
import { useClub } from '@/contexts/ClubContext';

export default function Roster() {
  const params = useParams();
  const gameIdFromUrl = params.gameId ? parseInt(params.gameId) : null;
  const [selectedGameId, setSelectedGameId] = useState<number | null>(gameIdFromUrl);
  const [showPlayerAvailability, setShowPlayerAvailability] = useState(true); // Start with availability if coming from direct link
  const [, navigate] = useLocation();
  const { currentClub } = useClub();

  // Fetch games
  const { data: games = [], isLoading: gamesLoading, error: gamesError } = useQuery({
    queryKey: ['games', currentClub?.id],
    queryFn: () => apiRequest('GET', '/api/games'),
    retry: 1,
    enabled: !!currentClub?.id
  });

  // Fetch players  
  const { data: players = [], isLoading: playersLoading } = useQuery({
    queryKey: ['players', currentClub?.id],
    queryFn: () => apiRequest('GET', '/api/players'),
    enabled: !!currentClub?.id
  });

  // Fetch opponents for legacy support
  const { data: opponents = [] } = useQuery({
    queryKey: ['opponents'],
    queryFn: async () => {
      try {
        const result = await apiRequest('GET', '/api/opponents');
        return Array.isArray(result) ? result : [];
      } catch (error) {
        console.warn('Opponents API not available (expected)');
        return [];
      }
    }
  });

  const isLoading = gamesLoading || playersLoading;

  // Check if club context is available
  if (!currentClub?.id) {
    return (
      <div className="container py-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Club Selected</h3>
              <p className="text-gray-500 mb-4">
                Please select a club to manage rosters.
              </p>
              <Button onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filter out completed games for roster management
  const availableGames = games.filter((game: Game) => 
    !game.statusIsCompleted && !game.completed
  );

  // Auto-select first available game if none selected and no URL parameter
  useEffect(() => {
    if (!selectedGameId && availableGames.length > 0 && !gameIdFromUrl) {
      setSelectedGameId(availableGames[0].id);
    }
  }, [availableGames, selectedGameId, gameIdFromUrl]);

  // If URL parameter provided, ensure it's valid
  useEffect(() => {
    if (gameIdFromUrl && availableGames.length > 0) {
      const gameExists = availableGames.find(game => game.id === gameIdFromUrl);
      if (gameExists) {
        setSelectedGameId(gameIdFromUrl);
      } else {
        // Game ID from URL is not valid, redirect to roster without game ID
        navigate('/roster');
      }
    }
  }, [gameIdFromUrl, availableGames, navigate]);

  const selectedGame = games.find((game: Game) => game.id === selectedGameId);

  // Handle no games case
  if (!isLoading && games.length === 0) {
    return (
      <div className="container py-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Games Available</h3>
              <p className="text-gray-500 mb-4">
                There are no games available for {currentClub.name}. Create your first game to start managing rosters.
              </p>
              <Button onClick={() => navigate('/games')}>
                Go to Games
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle no available (non-completed) games case
  if (!isLoading && games.length > 0 && availableGames.length === 0) {
    return (
      <div className="container py-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Upcoming Games</h3>
              <p className="text-gray-500 mb-4">
                All games for {currentClub.name} have been completed. Rosters can only be managed for upcoming games.
              </p>
              <Button onClick={() => navigate('/games')}>
                View All Games
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <h1>Roster</h1>
      <p>Club: {currentClub?.name}</p>

      <div className="mb-4 flex gap-4 items-center">
        <Select value={selectedGameId?.toString()} onValueChange={(value) => setSelectedGameId(parseInt(value))}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a game" />
          </SelectTrigger>
          <SelectContent>
            {availableGames.map((game: Game) => (
              <SelectItem key={game.id} value={game.id.toString()}>
                {game.name} - {game.date}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedGameId && (
          <Button
            variant="outline"
            onClick={() => setShowPlayerAvailability(!showPlayerAvailability)}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            {showPlayerAvailability ? 'Manage Roster' : 'Player Availability'}
          </Button>
        )}
      </div>

      {gamesError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to fetch games.
          </AlertDescription>
        </Alert>
      )}

      {selectedGame && (
        <div className="mb-4">
          <h2>{selectedGame.name}</h2>
          <Badge variant="secondary">
            <Calendar className="h-3 w-3 mr-1" />
            {selectedGame.date}
          </Badge>
        </div>
      )}

      {showPlayerAvailability ? (
        <PlayerAvailabilityManager
          gameId={selectedGameId!}
          players={players}
          games={games}
          opponents={opponents}
          onComplete={() => setShowPlayerAvailability(false)}
        />
      ) : (
        <SimpleRosterManager
          selectedGameId={selectedGameId}
          setSelectedGameId={setSelectedGameId}
          players={players}
          games={games}
          opponents={opponents}
          isLoading={isLoading}
        />
      )}

    </div>
  );
}