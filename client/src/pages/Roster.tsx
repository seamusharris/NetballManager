import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import RosterManager from '@/components/roster/RosterManager';

export default function Roster() {
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  
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
