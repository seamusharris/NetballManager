import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import SimpleRosterManager from '@/components/roster/SimpleRosterManager';
import PlayerAvailabilityManager from '@/components/roster/PlayerAvailabilityManager';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Roster() {
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [showAvailability, setShowAvailability] = useState(true);
  const [availablePlayers, setAvailablePlayers] = useState<number[]>([]);
  const [_, navigate] = useLocation();
  const queryClient = useQueryClient();
  
  // Load players data
  const { data: players = [], isLoading: isLoadingPlayers } = useQuery({
    queryKey: ['/api/players'],
  });
  
  // Parse URL query parameters to get game ID
  useEffect(() => {
    // Get the game ID from the URL query parameter if it exists
    const queryParams = new URLSearchParams(window.location.search);
    const gameId = queryParams.get('game');
    
    if (gameId && !isNaN(Number(gameId))) {
      // Set the selected game ID and update the URL to remove the query parameter
      setSelectedGameId(Number(gameId));
      // Replace the URL without the query parameter for cleaner navigation
      navigate('/roster', { replace: true });
    }
  }, [navigate]);

  // Local storage key for available players
  const getAvailabilityStorageKey = (gameId: number) => `netball_available_players_${gameId}`;

  // Load available players from local storage when game changes
  useEffect(() => {
    if (selectedGameId && players && players.length > 0) {
      const storageKey = getAvailabilityStorageKey(selectedGameId);
      const storedAvailability = localStorage.getItem(storageKey);
      
      if (storedAvailability) {
        try {
          const parsedAvailability = JSON.parse(storedAvailability);
          setAvailablePlayers(parsedAvailability);
        } catch (error) {
          console.error('Error parsing stored player availability:', error);
          // Default to all active players being available if there was an error
          const activePlayerIds = players.filter(p => p.active).map(p => p.id);
          setAvailablePlayers(activePlayerIds);
        }
      } else {
        // Default to all active players being available if no previous selection
        const activePlayerIds = players.filter(p => p.active).map(p => p.id);
        setAvailablePlayers(activePlayerIds);
      }
    }
  }, [selectedGameId, players]);
  
  // Load games data
  const { data: games = [], isLoading: isLoadingGames } = useQuery({
    queryKey: ['/api/games'],
  });
  
  // Load opponents data
  const { data: opponents = [], isLoading: isLoadingOpponents } = useQuery({
    queryKey: ['/api/opponents'],
  });
  
  // Get roster data for selected game
  const { data: rosters = [], isLoading: isLoadingRosters } = useQuery({
    queryKey: ['/api/games', selectedGameId, 'rosters'],
    enabled: !!selectedGameId,
  });
  
  // Check if any data is still loading
  const isLoading = isLoadingPlayers || isLoadingGames || isLoadingOpponents || 
    (selectedGameId ? isLoadingRosters : false);
  
  // Filter to only active players
  const activePlayers = players.filter(player => player.active);
  
  // Get the selected game
  const selectedGame = selectedGameId ? games.find(game => game.id === selectedGameId) : undefined;
  
  // Get the opponent for the selected game
  const selectedOpponent = selectedGame?.opponentId 
    ? opponents.find(opponent => opponent.id === selectedGame.opponentId) 
    : undefined;
  
  // Handle player availability change
  const handleAvailabilityChange = (playerId: number, isAvailable: boolean) => {
    // Create a new array to ensure we don't have duplicate IDs
    let newAvailablePlayers;
    
    if (isAvailable) {
      // Only add the player if they're not already in the list
      if (!availablePlayers.includes(playerId)) {
        newAvailablePlayers = [...availablePlayers, playerId];
      } else {
        newAvailablePlayers = [...availablePlayers]; // No change needed
      }
    } else {
      // Remove the player from the list
      newAvailablePlayers = availablePlayers.filter(id => id !== playerId);
    }
    
    setAvailablePlayers(newAvailablePlayers);

    // Save to local storage if we have a game selected
    if (selectedGameId) {
      const storageKey = getAvailabilityStorageKey(selectedGameId);
      localStorage.setItem(storageKey, JSON.stringify(newAvailablePlayers));
    }
  };

  // Handle completion of availability selection
  const handleAvailabilityComplete = () => {
    setShowAvailability(false);
  };
  
  // Function to go back to availability selection
  const handleBackToAvailability = () => {
    setShowAvailability(true);
  };
  
  // Callback for when roster is saved to database
  const handleRosterSaved = () => {
    // Invalidate the roster query to refresh data
    if (selectedGameId) {
      // Invalidate both the roster data and the game data to ensure proper re-fetching
      queryClient.invalidateQueries({ queryKey: ['/api/games', selectedGameId, 'rosters'] });
      queryClient.invalidateQueries({ queryKey: ['/api/games', selectedGameId] });
      
      // Also invalidate the general games list to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['/api/games'] });
    }
  };
  
  return (
    <div className="container py-6">
      <Helmet>
        <title>Roster | NetballManager</title>
        <meta name="description" content="Manage your netball team roster, assign players to positions for each quarter" />
      </Helmet>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Team Roster</h1>
        {selectedGameId && (
          <Button 
            variant="outline" 
            asChild
          >
            <Link to={`/game/${selectedGameId}`}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Game Details
            </Link>
          </Button>
        )}
      </div>
      
      {!selectedGameId && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select a Game</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <Users className="h-4 w-4 mr-2" />
              <AlertDescription>
                Please select a game from the dropdown below to manage its roster.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
      
      {selectedGameId && showAvailability && (
        <PlayerAvailabilityManager
          players={activePlayers}
          game={selectedGame}
          opponent={selectedOpponent}
          availablePlayers={availablePlayers}
          onAvailabilityChange={handleAvailabilityChange}
          onComplete={handleAvailabilityComplete}
        />
      )}
      
      {selectedGameId && !showAvailability && (
        <>
          <Button 
            variant="outline" 
            onClick={handleBackToAvailability} 
            className="mb-4"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Player Availability
          </Button>
          
          <SimpleRosterManager 
            players={activePlayers.filter(player => availablePlayers.includes(player.id))}
            games={games}
            opponents={opponents}
            selectedGameId={selectedGameId}
            setSelectedGameId={setSelectedGameId}
            isLoading={isLoading}
            onRosterSaved={handleRosterSaved}
          />
        </>
      )}
      
      {!selectedGameId && (
        <SimpleRosterManager 
          players={activePlayers}
          games={games}
          opponents={opponents}
          selectedGameId={selectedGameId}
          setSelectedGameId={setSelectedGameId}
          isLoading={isLoading}
          onRosterSaved={handleRosterSaved}
        />
      )}
    </div>
  );
}
