import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import RosterManager from '@/components/roster/RosterManager';
import RosterSummary from '@/components/roster/RosterSummary';
import { useLocation } from 'wouter';

export default function Roster() {
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [_, navigate] = useLocation();
  
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
  
  const { data: players = [], isLoading: isLoadingPlayers } = useQuery({
    queryKey: ['/api/players'],
  });
  
  const { data: games = [], isLoading: isLoadingGames } = useQuery({
    queryKey: ['/api/games'],
  });
  
  const { data: opponents = [], isLoading: isLoadingOpponents } = useQuery({
    queryKey: ['/api/opponents'],
  });
  
  // Get roster data for selected game
  const { data: rosters = [], isLoading: isLoadingRosters } = useQuery({
    queryKey: ['/api/games', selectedGameId, 'rosters'],
    enabled: !!selectedGameId,
    staleTime: 0, // Don't use cached data
    refetchOnWindowFocus: true, // Refetch when window gets focus
  });
  
  const isLoading = isLoadingPlayers || isLoadingGames || isLoadingOpponents || 
    (selectedGameId ? isLoadingRosters : false);
  
  // Filter to only active players
  const activePlayers = players.filter(player => player.active);
  
  return (
    <>
      <Helmet>
        <title>Roster | NetballManager</title>
        <meta name="description" content="Manage your netball team roster, assign players to positions for each quarter" />
      </Helmet>
      
      {/* Display the Roster Summary if a game is selected */}
      {selectedGameId && (
        <RosterSummary 
          selectedGameId={selectedGameId}
        />
      )}
      
      <RosterManager 
        players={activePlayers}
        games={games}
        opponents={opponents}
        rosters={rosters}
        selectedGameId={selectedGameId}
        setSelectedGameId={setSelectedGameId}
        isLoading={isLoading}
      />
    </>
  );
}
