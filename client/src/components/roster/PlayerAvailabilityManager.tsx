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
import { PlayerBox } from '@/components/ui/player-box';
import { getPlayerColorHex, getDarkerColorHex, getLighterColorHex, getMediumColorHex } from '@/lib/playerColorUtils';

interface PlayerAvailabilityManagerProps {
  gameId: number;
  players: Player[];
  games: Game[];
  onComplete?: () => void;
  onAvailabilityChange?: (availablePlayerIds: number[]) => void;
  onAvailabilityStateChange?: (availabilityState: Record<number, boolean>) => void;
  onGameChange?: (gameId: number) => void;
  hideGameSelection?: boolean;
}

export default function PlayerAvailabilityManager({
  gameId,
  players,
  games,
  onComplete,
  onAvailabilityChange,
  onAvailabilityStateChange,
  onGameChange,
  hideGameSelection = false
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

      const selectedGame = games.find(g => g.id === gameId);
      if (!selectedGame) {
        setTeamPlayers([]);
        return;
      }

      setIsLoadingTeamPlayers(true);
      try {
        // Get current team context from Club context
        const currentTeamIdFromContext = window.localStorage.getItem('selectedTeamId');
        
        let teamToLoad = selectedGame.homeTeamId;

        // If we have current team context and it matches one of the teams in this game, use that
        if (currentTeamIdFromContext) {
          const currentTeamIdNum = parseInt(currentTeamIdFromContext);
          if (currentTeamIdNum === selectedGame.homeTeamId || currentTeamIdNum === selectedGame.awayTeamId) {
            teamToLoad = currentTeamIdNum;
          }
        }

        console.log(`Loading team players for team ${teamToLoad} (game ${gameId})`);

        try {
          const response = await apiClient.get(`/api/teams/${teamToLoad}/players`);
          console.log(`Loaded ${Array.isArray(response) ? response.length : 'unknown count'} team players for team ${teamToLoad}`);
          setTeamPlayers(Array.isArray(response) ? response : []);
        } catch (teamError) {
          console.log('Team players endpoint failed, filtering provided players by team');
          // Filter provided players by the team if API call fails
          if (players && players.length > 0) {
            // Filter players that belong to the current team
            const filteredPlayers = players.filter(player => {
              // If player has teamId property, use it; otherwise include all (fallback)
              return !player.teamId || player.teamId === teamToLoad;
            });
            console.log(`Filtered ${filteredPlayers.length} players from ${players.length} total for team ${teamToLoad}`);
            setTeamPlayers(filteredPlayers);
          } else {
            setTeamPlayers([]);
          }
        }
      } catch (error) {
        console.error('Error loading team players:', error);
        setTeamPlayers([]);
      } finally {
        setIsLoadingTeamPlayers(false);
      }
    };

    loadTeamPlayers();
  }, [gameId, games]); // Depend on games as well to ensure we have game data

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
      onAvailabilityStateChange?.(defaultAvailabilityData);
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
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">
            Player Availability 
            {selectedGame && (
              <span className="font-normal text-gray-600 ml-2">
                for {selectedGame.date}
              </span>
            )}
          </CardTitle>
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

        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline" className="mr-1">
            {availableCount}
          </Badge>
          <span className="text-sm text-gray-600">Available Players</span>
        </div>

        {!hideGameSelection && (
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
            <Button 
              onClick={onComplete}
              disabled={availableCount === 0}
              className="ml-2"
            >
              <Check className="mr-2 h-4 w-4" />
              Continue to Roster ({availableCount} available)
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Player Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {teamPlayers
              .sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''))
              .map(player => {
                const isSelected = availabilityData[player.id] === true;
                const playerColorHex = getPlayerColorHex(player.avatarColor);
                const darkerTextColor = getDarkerColorHex(player.avatarColor);
                const lightBackgroundColor = getLighterColorHex(player.avatarColor);
                const mediumBackgroundColor = getMediumColorHex(player.avatarColor);

                const handlePlayerClick = () => {
                  const newData = { ...availabilityData, [player.id]: !isSelected };
                  handleAvailabilityChange(newData);
                };

                return (
                  <div key={player.id} className="relative">
                    <div 
                      className="absolute top-1/2 right-3 w-6 h-6 rounded flex items-center justify-center cursor-pointer text-white z-10 transform -translate-y-1/2 mr-3 transition-all duration-200"
                      style={{ 
                        backgroundColor: isSelected ? darkerTextColor : 'transparent', 
                        border: isSelected ? 'none' : `2px solid ${darkerTextColor}`
                      }}
                      onClick={handlePlayerClick}
                    >
                      {isSelected && '✓'}
                    </div>
                    <PlayerBox 
                      player={player}
                      size="md"
                      showPositions={true}
                      hasSelect={true}
                      className="shadow-md transition-all duration-200 hover:shadow-lg cursor-pointer"
                      onClick={handlePlayerClick}
                    />
                  </div>
                );
              })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}