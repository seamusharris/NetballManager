import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check } from 'lucide-react';
import { Player, Game, Opponent } from '@shared/schema';
import { formatShortDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useDataLoader } from '@/hooks/use-data-loader';
import { apiClient } from '@/lib/apiClient';
import { useQueryClient } from '@tanstack/react-query';
import { UnifiedPlayerAvailability } from '@/components/ui/unified-player-availability';

interface PlayerAvailabilityManagerProps {
  gameId: number;
  players: Player[];
  games: Game[];
  opponents: Opponent[];
  onComplete?: () => void;
  onAvailabilityChange?: (availablePlayerIds: number[]) => void;
  onGameChange?: (gameId: number) => void;
}

export default function PlayerAvailabilityManager({
  gameId,
  players,
  games,
  opponents,
  onComplete,
  onAvailabilityChange,
  onGameChange
}: PlayerAvailabilityManagerProps) {
  const [teamPlayers, setTeamPlayers] = useState<Player[]>([]);
  const [isLoadingTeamPlayers, setIsLoadingTeamPlayers] = useState(false);
  const [availabilityData, setAvailabilityData] = useState<Record<number, boolean>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Use centralized data loading for availability
  const { 
    data: availabilityResponse, 
    isLoading, 
    error: availabilityError,
    refetch: refetchAvailability
  } = useDataLoader<{availablePlayerIds: number[]}>(`/api/games/${gameId}/availability`, {
    enabled: !!gameId,
    retry: 1,
    onError: (error) => {
      console.log('Player availability API error, falling back to all active players:', error);
    }
  });

  // Load team players for the selected game
  useEffect(() => {
    const loadTeamPlayers = async () => {
      if (!gameId) {
        setTeamPlayers([]);
        return;
      }

      const selectedGame = games.find(g => g.id === gameId);
      if (!selectedGame) {
        setTeamPlayers([]);
        return;
      }

      setIsLoadingTeamPlayers(true);
      try {
        // Get current team context from URL or session storage
        const urlParams = new URLSearchParams(window.location.search);
        const teamFromUrl = urlParams.get('teamId');
        const teamFromSession = sessionStorage.getItem('currentTeamId');
        const currentTeamId = teamFromUrl || teamFromSession;

        let teamToLoad = selectedGame.homeTeamId;

        // If we have current team context and it matches one of the teams in this game, use that
        if (currentTeamId) {
          const currentTeamIdNum = parseInt(currentTeamId);
          if (currentTeamIdNum === selectedGame.homeTeamId || currentTeamIdNum === selectedGame.awayTeamId) {
            teamToLoad = currentTeamIdNum;
          }
        }

        console.log(`Loading team players for team ${teamToLoad} (game ${gameId})`);

        try {
          const response = await apiClient.get(`/api/teams/${teamToLoad}/players`);
          console.log(`Loaded ${response.length} team players for team ${teamToLoad}`);
          setTeamPlayers(response);
        } catch (teamError) {
          // If team-specific endpoint fails, try loading all club players and filter
          console.log('Team players endpoint failed, trying club players with filter');
          const allPlayers = await apiClient.get('/api/players');
          console.log(`Loaded ${allPlayers.length} club players, using all as fallback`);
          setTeamPlayers(allPlayers);
        }
      } catch (error) {
        console.error('Error loading team players:', error);
        // Final fallback to props players
        console.log('Final fallback to props players');
        setTeamPlayers(players);
      } finally {
        setIsLoadingTeamPlayers(false);
      }
    };

    loadTeamPlayers();
  }, [gameId, games, players]);

  // Invalidate and refetch availability data when gameId changes
  useEffect(() => {
    if (gameId) {
      console.log('PlayerAvailabilityManager: gameId changed, refetching availability for game:', gameId);
      queryClient.invalidateQueries({ 
        queryKey: [`/api/games/${gameId}/availability`] 
      });
      refetchAvailability();
    }
  }, [gameId, queryClient, refetchAvailability]);

  // Convert API response to shared component format
  useEffect(() => {
    console.log('PlayerAvailabilityManager useEffect triggered:', {
      gameId,
      isLoading,
      isLoadingTeamPlayers,
      teamPlayersLength: teamPlayers.length,
      availabilityResponse
    });

    if (!gameId) {
      console.log('PlayerAvailabilityManager: No gameId, skipping conversion');
      return;
    }

    // Handle case when team players are available
    if (teamPlayers.length > 0) {
      if (availabilityResponse && Array.isArray(availabilityResponse.availablePlayerIds)) {
        console.log('PlayerAvailabilityManager: Converting API response to availability data');
        console.log('TeamPlayers:', teamPlayers.map(p => ({ id: p.id, name: p.displayName })));
        console.log('Available IDs from API:', availabilityResponse.availablePlayerIds);
        
        // Convert from API format (availablePlayerIds array) to boolean format
        const teamPlayerIds = teamPlayers.map(p => p.id);
        const filteredAvailableIds = availabilityResponse.availablePlayerIds.filter(id => teamPlayerIds.includes(id));

        const newAvailabilityData: Record<number, boolean> = {};
        teamPlayers.forEach(player => {
          newAvailabilityData[player.id] = filteredAvailableIds.includes(player.id);
        });

        console.log('PlayerAvailabilityManager: Final availability data:', newAvailabilityData);
        setAvailabilityData(newAvailabilityData);

        // Notify parent component
        onAvailabilityChange?.(filteredAvailableIds);
      } else if (availabilityError || !availabilityResponse) {
        console.log('PlayerAvailabilityManager: Using fallback availability (all active players)');
        // Fallback to all active team players on error or no response
        const activeTeamPlayerIds = teamPlayers.filter(p => p.active).map(p => p.id);
        const fallbackAvailabilityData: Record<number, boolean> = {};
        teamPlayers.forEach(player => {
          fallbackAvailabilityData[player.id] = player.active;
        });

        console.log('PlayerAvailabilityManager: Fallback availability data:', fallbackAvailabilityData);
        setAvailabilityData(fallbackAvailabilityData);
        onAvailabilityChange?.(activeTeamPlayerIds);
      }
    }
  }, [availabilityResponse, isLoading, availabilityError, teamPlayers, isLoadingTeamPlayers, gameId, onAvailabilityChange]);

  // Handle availability change from shared component
  const handleAvailabilityChange = (newAvailabilityData: Record<number, boolean>) => {
    setAvailabilityData(newAvailabilityData);

    // Convert back to array format for parent component
    const availablePlayerIds = Object.entries(newAvailabilityData)
      .filter(([_, isAvailable]) => isAvailable)
      .map(([playerId, _]) => parseInt(playerId));

    onAvailabilityChange?.(availablePlayerIds);
  };

  // Early return if no gameId
  if (!gameId) {
    console.log('PlayerAvailabilityManager: No game ID provided');
    return (
      <Card className="mb-6">
        <CardContent className="pt-6 text-center">
          <p className="text-gray-500">Please select a game to manage player availability.</p>
        </CardContent>
      </Card>
    );
  }

  const selectedGame = games.find(game => game.id === gameId);
  const opponent = selectedGame?.opponentId ? opponents.find(o => o.id === selectedGame.opponentId) : null;

  if ((isLoading || isLoadingTeamPlayers) && teamPlayers.length === 0) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="text-center">Loading team players and availability...</div>
        </CardContent>
      </Card>
    );
  }

  const availableCount = Object.values(availabilityData).filter(isAvailable => isAvailable === true).length;

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">
          Player Availability 
          {selectedGame && opponent && (
            <span className="font-normal text-gray-600 ml-2">
              for Round {selectedGame.round} vs {opponent.teamName}
            </span>
          )}
        </CardTitle>

        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center gap-4">
            {/* Game selection dropdown */}
            <Select 
              value={gameId?.toString() || ''} 
              onValueChange={(value) => {
                const newGameId = Number(value);
                onGameChange?.(newGameId);
              }}
            >
              <SelectTrigger className="w-[400px]">
                <SelectValue placeholder="Switch Game" />
              </SelectTrigger>
              <SelectContent>
                {games.length === 0 ? (
                  <SelectItem value="no-games" disabled>No games available</SelectItem>
                ) : (
                  [...games]
                    .sort((a, b) => (a.round || 0) - (b.round || 0))
                    .map(game => (
                      <SelectItem key={game.id} value={game.id.toString()}>
                        Round {game.round} - {game.homeTeamName} vs {game.awayTeamName} {game.statusIsCompleted ? "(Past)" : ""}
                      </SelectItem>
                    ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="mr-1">
              {availableCount}
            </Badge>
            <span className="text-sm font-medium">Available</span>
            <Button 
              onClick={onComplete}
              disabled={availableCount === 0}
              className="ml-2"
            >
              <Check className="mr-2 h-4 w-4" />
              Continue to Roster ({availableCount} available)
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <UnifiedPlayerAvailability
          players={teamPlayers}
          availabilityData={availabilityData}
          onAvailabilityChange={handleAvailabilityChange}
          title=""
          showQuickActions={true}
          gameId={gameId}
          variant="detailed"
          autoSave={true}
        />
      </CardContent>
    </Card>
  );
}