import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check } from 'lucide-react';
import { Player, Game } from '@shared/schema';
import { formatShortDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useDataLoader } from '@/hooks/use-data-loader';
import { apiClient } from '@/lib/apiClient';
import { useQueryClient } from '@tanstack/react-query';
import { SelectablePlayerBox } from '@/components/ui/selectable-player-box';

interface PlayerAvailabilityManagerProps {
  gameId: number;
  players: Player[];
  games: Game[];
  onComplete?: () => void;
  onAvailabilityChange?: (availablePlayerIds: number[]) => void;
  onAvailabilityStateChange?: (availabilityState: Record<number, boolean>) => void;
  onGameChange?: (gameId: number) => void;
}

export default function PlayerAvailabilityManager({
  gameId,
  players,
  games,
  onComplete,
  onAvailabilityChange,
  onAvailabilityStateChange,
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

  // Load team players for the selected game (only when gameId changes)
  useEffect(() => {
    const loadTeamPlayers = async () => {
      if (!gameId) {
        setTeamPlayers([]);
        return;
      }

      // Use provided players if available to avoid extra API calls
      if (players && players.length > 0) {
        console.log(`Using provided players (${players.length}) for game ${gameId}`);
        setTeamPlayers(players);
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
          console.log('Team players endpoint failed, using fallback to props players');
          setTeamPlayers(players);
        }
      } catch (error) {
        console.error('Error loading team players:', error);
        setTeamPlayers(players);
      } finally {
        setIsLoadingTeamPlayers(false);
      }
    };

    loadTeamPlayers();
  }, [gameId]); // Only depend on gameId to prevent excessive calls

  // Invalidate and refetch availability data when gameId changes
  useEffect(() => {
    if (gameId) {
      console.log('PlayerAvailabilityManager: gameId changed, refetching availability for game:', gameId);
      queryClient.invalidateQueries({ 
        queryKey: [`/api/games/${gameId}/availability`] 
      });
      refetchAvailability();
    }
  }, [gameId]);

  // Convert API response to shared component format
  useEffect(() => {
    console.log('PlayerAvailabilityManager useEffect triggered:', {
      gameId,
      isLoading,
      isLoadingTeamPlayers,
      teamPlayersLength: teamPlayers.length,
      availabilityResponse
    });

    if (!gameId || teamPlayers.length === 0) {
      console.log('PlayerAvailabilityManager: No gameId or no team players, skipping conversion');
      return;
    }

    // Prevent processing if still loading
    if (isLoading || isLoadingTeamPlayers) {
      return;
    }

    if (availabilityResponse && Array.isArray(availabilityResponse.availablePlayerIds) && availabilityResponse.availablePlayerIds.length > 0) {
      console.log('PlayerAvailabilityManager: Converting API response to availability data');

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
      if (onAvailabilityChange) {
        onAvailabilityChange(filteredAvailableIds);
      }
    } else {
      console.log('PlayerAvailabilityManager: No saved availability data, defaulting all active players to available');
      // Default to all active team players available (this is the proper default behavior)
      const activeTeamPlayerIds = teamPlayers.filter(p => p.active !== false).map(p => p.id);
      const defaultAvailabilityData: Record<number, boolean> = {};
      teamPlayers.forEach(player => {
        defaultAvailabilityData[player.id] = player.active !== false; // Default all active players to available
      });

      console.log('PlayerAvailabilityManager: Default availability data (all active available):', defaultAvailabilityData);
      setAvailabilityData(defaultAvailabilityData);
      if (onAvailabilityChange) {
        onAvailabilityChange(activeTeamPlayerIds);
      }
    }
  }, [availabilityResponse, isLoading, availabilityError, teamPlayers, gameId, isLoadingTeamPlayers]);

  // Handle availability change with auto-save
  const handleAvailabilityChange = async (newAvailabilityData: Record<number, boolean>) => {
    setAvailabilityData(newAvailabilityData);

    // Convert back to array format for parent component
    const availablePlayerIds = Object.entries(newAvailabilityData)
      .filter(([_, isAvailable]) => isAvailable)
      .map(([playerId, _]) => parseInt(playerId));

    onAvailabilityChange?.(availablePlayerIds);
    onAvailabilityStateChange?.(newAvailabilityData);

    // Auto-save if gameId is provided
    if (gameId) {
      try {
        await apiClient.post(`/api/games/${gameId}/availability`, {
          availablePlayerIds
        });

        toast({
          title: "Availability updated",
          description: "Player availability saved successfully.",
        });
      } catch (error) {
        console.error("Failed to save player availability:", error);
        toast({
          variant: "destructive",
          title: "Error saving availability",
          description: "Failed to save player availability. Please try again.",
        });
      }
    }
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
          {selectedGame && (
            <span className="font-normal text-gray-600 ml-2">
              for {selectedGame.date}
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
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map(game => (
                      <SelectItem key={game.id} value={game.id.toString()}>
                        {game.date} - {game.awayTeamId ? 'vs Away Team' : 'BYE'}
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
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  const newData: Record<number, boolean> = {};
                  teamPlayers.forEach(player => {
                    newData[player.id] = true;
                  });
                  handleAvailabilityChange(newData);
                }}
              >
                Select All
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  const newData: Record<number, boolean> = {};
                  teamPlayers.forEach(player => {
                    newData[player.id] = false;
                  });
                  handleAvailabilityChange(newData);
                }}
              >
                Clear All
              </Button>
            </div>
          </div>

          {/* Player Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {teamPlayers
              .sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''))
              .map(player => {
                const isSelected = availabilityData[player.id] === true;

                return (
                  <SelectablePlayerBox
                    key={player.id}
                    player={player}
                    isSelected={isSelected}
                    onSelectionChange={(playerId, selected) => {
                      const newData = { ...availabilityData, [playerId]: selected };
                      handleAvailabilityChange(newData);
                    }}
                    size="md"
                    showPositions={true}
                  />
                );
              })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}