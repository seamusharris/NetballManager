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

interface PlayerAvailabilityManagerProps {
  gameId: number;
  players: Player[];
  games: Game[];
  onComplete?: () => void;
  onAvailabilityChange?: (availablePlayerIds: number[]) => void;
  onGameChange?: (gameId: number) => void;
}

export default function PlayerAvailabilityManager({
  gameId,
  players,
  games,
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
                
                // Helper function to convert Tailwind class to hex for dynamic styling
                const getPlayerColorHex = (avatarColor?: string): string => {
                  if (!avatarColor) return '#6b7280'; // gray-500 fallback

                  const colorMap: Record<string, string> = {
                    'bg-red-500': '#ef4444', 'bg-red-600': '#dc2626', 'bg-red-700': '#b91c1c',
                    'bg-orange-500': '#f97316', 'bg-orange-600': '#ea580c', 'bg-orange-700': '#c2410c',
                    'bg-amber-500': '#f59e0b', 'bg-amber-600': '#d97706', 'bg-amber-700': '#b45309',
                    'bg-yellow-500': '#eab308', 'bg-yellow-600': '#ca8a04', 'bg-yellow-700': '#a16207',
                    'bg-lime-500': '#84cc16', 'bg-lime-600': '#65a30d', 'bg-lime-700': '#4d7c0f',
                    'bg-green-500': '#22c55e', 'bg-green-600': '#16a34a', 'bg-green-700': '#15803d',
                    'bg-emerald-500': '#10b981', 'bg-emerald-600': '#059669', 'bg-emerald-700': '#047857',
                    'bg-teal-500': '#14b8a6', 'bg-teal-600': '#0d9488', 'bg-teal-700': '#0f766e',
                    'bg-cyan-500': '#06b6d4', 'bg-cyan-600': '#0891b2', 'bg-cyan-700': '#0e7490',
                    'bg-sky-500': '#0ea5e9', 'bg-sky-600': '#0284c7', 'bg-sky-700': '#0369a1',
                    'bg-blue-500': '#3b82f6', 'bg-blue-600': '#2563eb', 'bg-blue-700': '#1d4ed8',
                    'bg-indigo-500': '#6366f1', 'bg-indigo-600': '#4f46e5', 'bg-indigo-700': '#4338ca',
                    'bg-violet-500': '#8b5cf6', 'bg-violet-600': '#7c3aed', 'bg-violet-700': '#6d28d9',
                    'bg-purple-500': '#a855f7', 'bg-purple-600': '#9333ea', 'bg-purple-700': '#7e22ce',
                    'bg-fuchsia-500': '#d946ef', 'bg-fuchsia-600': '#c026d3', 'bg-fuchsia-700': '#a21caf',
                    'bg-pink-500': '#ec4899', 'bg-pink-600': '#db2777', 'bg-pink-700': '#be185d',
                    'bg-rose-500': '#f43f5e', 'bg-rose-600': '#e11d48', 'bg-rose-700': '#be123c',
                    'bg-gray-500': '#6b7280', 'bg-gray-600': '#4b5563', 'bg-gray-700': '#374151'
                  };

                  return colorMap[avatarColor] || '#6b7280';
                };

                const getDarkerColorHex = (avatarColor?: string): string => {
                  if (!avatarColor) return '#374151'; // gray-700 fallback

                  const darkerColorMap: Record<string, string> = {
                    'bg-red-500': '#b91c1c', 'bg-red-600': '#991b1b', 'bg-red-700': '#7f1d1d',
                    'bg-orange-500': '#c2410c', 'bg-orange-600': '#9a3412', 'bg-orange-700': '#7c2d12',
                    'bg-amber-500': '#b45309', 'bg-amber-600': '#92400e', 'bg-amber-700': '#78350f',
                    'bg-yellow-500': '#a16207', 'bg-yellow-600': '#854d0e', 'bg-yellow-700': '#713f12',
                    'bg-lime-500': '#4d7c0f', 'bg-lime-600': '#365314', 'bg-lime-700': '#1a2e05',
                    'bg-green-500': '#15803d', 'bg-green-600': '#166534', 'bg-green-700': '#14532d',
                    'bg-emerald-500': '#047857', 'bg-emerald-600': '#065f46', 'bg-emerald-700': '#064e3b',
                    'bg-teal-500': '#0f766e', 'bg-teal-600': '#0d9488', 'bg-teal-700': '#134e4a',
                    'bg-cyan-500': '#0e7490', 'bg-cyan-600': '#0891b2', 'bg-cyan-700': '#155e75',
                    'bg-sky-500': '#0369a1', 'bg-sky-600': '#0284c7', 'bg-sky-700': '#0c4a6e',
                    'bg-blue-500': '#1d4ed8', 'bg-blue-600': '#1e40af', 'bg-blue-700': '#1e3a8a',
                    'bg-indigo-500': '#4338ca', 'bg-indigo-600': '#3730a3', 'bg-indigo-700': '#312e81',
                    'bg-violet-500': '#6d28d9', 'bg-violet-600': '#5b21b6', 'bg-violet-700': '#4c1d95',
                    'bg-purple-500': '#7e22ce', 'bg-purple-600': '#6b21a8', 'bg-purple-700': '#581c87',
                    'bg-fuchsia-500': '#a21caf', 'bg-fuchsia-600': '#86198f', 'bg-fuchsia-700': '#701a75',
                    'bg-pink-500': '#be185d', 'bg-pink-600': '#9d174d', 'bg-pink-700': '#831843',
                    'bg-rose-500': '#be123c', 'bg-rose-600': '#9f1239', 'bg-rose-700': '#881337',
                    'bg-gray-500': '#374151', 'bg-gray-600': '#1f2937', 'bg-gray-700': '#111827'
                  };

                  return darkerColorMap[avatarColor] || '#374151';
                };

                const playerColorHex = getPlayerColorHex(player.avatarColor);
                const darkerColorHex = getDarkerColorHex(player.avatarColor);
                
                return (
                  <div key={player.id} className="relative">
                    <div 
                      className="absolute top-1/2 right-3 w-6 h-6 rounded flex items-center justify-center cursor-pointer text-white z-10 transform -translate-y-1/2 mr-3 transition-all duration-200"
                      style={{ 
                        backgroundColor: isSelected ? darkerColorHex : 'transparent', 
                        border: isSelected ? 'none' : `2px solid ${darkerColorHex}80` 
                      }}
                      onClick={() => {
                        const newData = { ...availabilityData, [player.id]: !isSelected };
                        handleAvailabilityChange(newData);
                      }}
                    >
                      {isSelected && '✓'}
                    </div>
                    <PlayerBox 
                      player={player}
                      size="md"
                      showPositions={true}
                      hasSelect={true}
                      className="shadow-md transition-all duration-200 hover:shadow-lg cursor-pointer"
                      style={{ 
                        backgroundColor: isSelected ? '#ffffff' : `${playerColorHex}15`,
                        borderColor: playerColorHex,
                        color: darkerColorHex
                      }}
                      onClick={() => {
                        const newData = { ...availabilityData, [player.id]: !isSelected };
                        handleAvailabilityChange(newData);
                      }}
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