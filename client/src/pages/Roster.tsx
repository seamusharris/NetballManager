import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import SimpleRosterManager from '@/components/roster/SimpleRosterManager';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export default function Roster() {
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [_, navigate] = useLocation();
  const queryClient = useQueryClient();
  
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
  
  // Load players data
  const { data: players = [], isLoading: isLoadingPlayers } = useQuery({
    queryKey: ['/api/players'],
  });
  
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
  
  // Callback for when roster is saved to database
  const handleRosterSaved = () => {
    // Invalidate the roster query to refresh data
    if (selectedGameId) {
      queryClient.invalidateQueries({ queryKey: ['/api/games', selectedGameId, 'rosters'] });
    }
  };
  
  return (
    <div className="container py-6">
      <Helmet>
        <title>Roster | NetballManager</title>
        <meta name="description" content="Manage your netball team roster, assign players to positions for each quarter" />
      </Helmet>
      
      <div className="mb-6">
        {selectedGameId && (
          <Button 
            variant="outline" 
            size="sm" 
            asChild
            className="mb-4" 
          >
            <Link to={`/game/${selectedGameId}`}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Game
            </Link>
          </Button>
        )}
        
        <SimpleRosterManager 
          players={activePlayers}
          games={games}
          opponents={opponents}
          selectedGameId={selectedGameId}
          setSelectedGameId={setSelectedGameId}
          isLoading={isLoading}
          onRosterSaved={handleRosterSaved}
        />
      </div>
    </div>
  );
}
