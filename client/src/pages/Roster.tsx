import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import RosterManager from '@/components/roster/RosterManager';
import RosterSummary from '@/components/roster/RosterSummary';
import { useLocation } from 'wouter';

export default function Roster() {
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [rosterUpdated, setRosterUpdated] = useState<number>(0); // Counter to trigger refetch
  const [_, navigate] = useLocation();
  const queryClient = useQueryClient();
  
  // Add state for local roster changes (before saving to database)
  const [localRosterByQuarter, setLocalRosterByQuarter] = useState<Record<string, Record<string, number | null>>>({
    '1': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
    '2': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
    '3': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
    '4': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null }
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
    refetchOnWindowFocus: true // Refetch when window gets focus
  });
  
  // Update local state only when rosters first load or when game changes
  useEffect(() => {
    if (selectedGameId && rosters && Array.isArray(rosters)) {
      console.log(`Loading roster data for game ${selectedGameId}, found ${rosters.length} roster entries`);
      
      // Create empty roster template
      const newRosterByQuarter = {
        '1': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
        '2': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
        '3': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
        '4': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null }
      };
      
      // Fill with new roster data
      rosters.forEach((roster: any) => {
        if (roster.quarter >= 1 && roster.quarter <= 4) {
          const quarterKey = roster.quarter.toString() as '1' | '2' | '3' | '4';
          newRosterByQuarter[quarterKey][roster.position] = roster.playerId;
        }
      });
      
      // Only update the state if we're loading a new game or first loading
      setLocalRosterByQuarter(newRosterByQuarter);
    }
  }, [selectedGameId, rosters.length]);
  
  const isLoading = isLoadingPlayers || isLoadingGames || isLoadingOpponents || 
    (selectedGameId ? isLoadingRosters : false);
  
  // Filter to only active players
  const activePlayers = players.filter(player => player.active);
  
  // Callback for when roster positions are changed locally (before save)
  const handleRosterChanged = (quarterKey: string, position: string, playerId: number | null) => {
    console.log(`Roster changed - Quarter: ${quarterKey}, Position: ${position}, Player: ${playerId}`);
    
    setLocalRosterByQuarter(prev => {
      const newState = {...prev};
      newState[quarterKey] = {
        ...newState[quarterKey],
        [position]: playerId
      };
      console.log('Updated roster state:', newState);
      return newState;
    });
    
    // Increment update counter to trigger re-renders
    setRosterUpdated(prev => prev + 1);
  };
  
  // Callback for when roster is saved to database
  const handleRosterSaved = () => {
    console.log("Roster saved, refreshing data");
    
    // Invalidate the roster query to refresh data
    if (selectedGameId) {
      queryClient.invalidateQueries({ queryKey: ['/api/games', selectedGameId, 'rosters'] });
      queryClient.refetchQueries({ queryKey: ['/api/games', selectedGameId, 'rosters'] });
    }
  };
  
  return (
    <>
      <Helmet>
        <title>Roster | NetballManager</title>
        <meta name="description" content="Manage your netball team roster, assign players to positions for each quarter" />
      </Helmet>
      
      {/* Display the Roster Summary if a game is selected */}
      <RosterSummary 
        selectedGameId={selectedGameId}
        localRosterState={localRosterByQuarter} // Pass local roster state 
        players={players}
      />
      
      <RosterManager 
        players={activePlayers}
        games={games}
        opponents={opponents}
        rosters={rosters}
        selectedGameId={selectedGameId}
        setSelectedGameId={setSelectedGameId}
        isLoading={isLoading}
        onRosterSaved={handleRosterSaved}
        onRosterChanged={handleRosterChanged} // Add callback for local roster changes
        localRosterState={localRosterByQuarter} // Pass local roster state
      />
    </>
  );
}
