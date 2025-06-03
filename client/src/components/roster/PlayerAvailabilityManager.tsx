import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Search, XCircle } from 'lucide-react';
import { Player, Game, Opponent } from '@shared/schema';
import { formatShortDate, cn, getInitials } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useDataLoader } from '@/hooks/use-data-loader';
import { apiClient } from '@/lib/apiClient';

// Define the PlayerAvatar component
interface PlayerAvatarProps {
  firstName: string;
  lastName: string;
  avatarColor: string;
  size: 'sm' | 'md' | 'lg';
}

function PlayerAvatar({ firstName, lastName, avatarColor, size }: PlayerAvatarProps) {
  let avatarSizeClass = 'w-6 h-6 text-[0.6rem]'; // Default small size
  if (size === 'md') {
    avatarSizeClass = 'w-8 h-8 text-sm';
  } else if (size === 'lg') {
    avatarSizeClass = 'w-10 h-10 text-base';
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center text-white font-bold flex-shrink-0",
        avatarSizeClass,
        avatarColor
      )}
    >
      <span className="font-semibold">
        {getInitials(firstName, lastName)}
      </span>
    </div>
  );
}

interface PlayerAvailabilityManagerProps {
  gameId: number;
  players: Player[];
  games: Game[];
  opponents: Opponent[];
  onComplete?: () => void;
  onAvailabilityChange?: (availablePlayerIds: number[]) => void;
}

export default function PlayerAvailabilityManager({
  gameId,
  players,
  games,
  opponents,
  onComplete,
  onAvailabilityChange
}: PlayerAvailabilityManagerProps) {
  const { toast } = useToast();
  const [availablePlayerIds, setAvailablePlayerIds] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Use centralized data loading for availability
  const { 
    data: availabilityData, 
    isLoading, 
    error: availabilityError 
  } = useDataLoader<{availablePlayerIds: number[]}>(`/api/games/${gameId}/availability`, {
    enabled: !!gameId,
    onError: () => {
      // Fallback to all active players on error
      const activePlayerIds = players.filter(p => p.active).map(p => p.id);
      setAvailablePlayerIds(activePlayerIds);
    }
  });

  // Effect to load availability data and set fallbacks
  useEffect(() => {
    console.log('PlayerAvailabilityManager useEffect:', {
      availabilityData,
      isLoading,
      availabilityError,
      playersLength: players.length,
      gameId
    });

    // Only proceed if we have a valid gameId
    if (!gameId) {
      return;
    }

    // Wait for both availability loading to complete AND players to be loaded
    if (isLoading || players.length === 0) {
      return;
    }

    // Handle successful availability data
    if (availabilityData && Array.isArray(availabilityData.availablePlayerIds)) {
      // If we have an empty array, this could mean either:
      // 1. No availability has been set yet (new game) - default to all active players
      // 2. Availability was explicitly set to empty (rare case)
      // For new games (upcoming games), we default to all active players being available
      if (availabilityData.availablePlayerIds.length === 0) {
        const selectedGame = games.find(game => game.id === gameId);
        // For upcoming games, default to all active players
        if (selectedGame && selectedGame.statusName === 'upcoming') {
          const activePlayerIds = players.filter(p => p.active).map(p => p.id);
          console.log('Empty availability for upcoming game - defaulting to all active players:', activePlayerIds);
          setAvailablePlayerIds(activePlayerIds);
          onAvailabilityChange?.(activePlayerIds);
        } else {
          // For completed games, respect the empty array
          console.log('Setting available players from API (empty for completed game):', availabilityData.availablePlayerIds);
          setAvailablePlayerIds(availabilityData.availablePlayerIds);
          onAvailabilityChange?.(availabilityData.availablePlayerIds);
        }
      } else {
        // Use the exact availability data from the API
        console.log('Setting available players from API:', availabilityData.availablePlayerIds);
        setAvailablePlayerIds(availabilityData.availablePlayerIds);
        onAvailabilityChange?.(availabilityData.availablePlayerIds);
      }
    } else if (availabilityError) {
      // Only fallback to all active players if there's an actual error
      const activePlayerIds = players.filter(p => p.active).map(p => p.id);
      console.log('Setting fallback available players (error case):', activePlayerIds);
      setAvailablePlayerIds(activePlayerIds);
      onAvailabilityChange?.(activePlayerIds);
    }
    // If still loading, don't set anything - wait for the data
  }, [availabilityData, isLoading, availabilityError, players, gameId, onAvailabilityChange]);

  const [searchQuery, setSearchQuery] = useState('');

  // Early return if no gameId - moved after ALL hooks
  if (!gameId) {
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

  // Handle availability change
  const handleAvailabilityChange = async (playerId: number, isAvailable: boolean) => {
    // Update local state immediately for responsive UI
    setAvailablePlayerIds(prev => {
      const newIds = isAvailable
        ? prev.includes(playerId) ? prev : [...prev, playerId]
        : prev.filter(id => id !== playerId);

      // Notify parent component of the change
      onAvailabilityChange?.(newIds);

      return newIds;
    });

    // Optimistically update
    toast({
      title: isAvailable ? "Player added to available list." : "Player removed from available list.",
      duration: 2000,
    })

    // Save to backend using centralized API client
    try {
      setIsSaving(true);
      await apiClient.patch(`/api/games/${gameId}/availability/${playerId}`, { isAvailable });
    } catch (error) {
      console.error('Error updating availability:', error);
      toast({
        title: "Failed to update availability. Reverting...",
        variant: "destructive",
      });
      // Revert local state on error
      setAvailablePlayerIds(prev => {
        if (!isAvailable) {
          return prev.includes(playerId) ? prev : [...prev, playerId];
        } else {
          return prev.filter(id => id !== playerId);
        }
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && players.length === 0) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="text-center">Loading player availability...</div>
        </CardContent>
      </Card>
    );
  }

  // Filter players by search query and sort by display name
  const filteredPlayers = players
    .filter(player => {
      const displayName = player.displayName || `${player.firstName} ${player.lastName}`;
      return displayName.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      const displayNameA = a.displayName || `${a.firstName} ${a.lastName}`;
      const displayNameB = b.displayName || `${b.firstName} ${b.lastName}`;
      return displayNameA.localeCompare(displayNameB);
    });

  // Get player color using the player's own avatarColor property from their profile
  const getPlayerColor = (player: Player) => {
    // Use the player's stored avatarColor if it exists
    if (player.avatarColor) {
      // If it's already a Tailwind class (starts with 'bg-'), use it directly
      if (player.avatarColor.startsWith('bg-')) {
        return player.avatarColor;
      }
    }

    // If the player doesn't have an avatarColor or it's not a Tailwind class,
    // we use a default gray color - this should be very rare as all players
    // should have colors assigned in the database
    return 'bg-gray-400';
  };

  // Get color hex value for styling
  const getColorHex = (colorClass: string) => {
    // Convert bg-color-shade to a hex color for borders and text
    const colorMap: Record<string, string> = {
      'bg-red-500': '#ef4444',
      'bg-emerald-600': '#059669',
      'bg-teal-600': '#0d9488',
      'bg-blue-600': '#2563eb',
      'bg-indigo-600': '#4f46e5',
      'bg-purple-600': '#9333ea',
      'bg-pink-600': '#db2777',
      'bg-pink-500': '#ec4899',
      'bg-orange-500': '#f97316',
      'bg-yellow-600': '#ca8a04',
      'bg-rose-600': '#e11d48',
      'bg-lime-600': '#65a30d',
      'bg-sky-600': '#0284c7',
      'bg-violet-600': '#7c3aed',
      'bg-cyan-600': '#0891b2',   // Cyan - Holly's color
      'bg-gray-400': '#9ca3af',
      'bg-accent': '#0d9488',     // Accent (teal)
      'bg-secondary': '#7c3aed',  // Secondary (violet)
      'bg-primary': '#2563eb',    // Primary (blue)
      'bg-green-600': '#16a34a'   // Green
    };

    return colorMap[colorClass] || '#9ca3af';
  };

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
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Label className="text-sm font-medium">
              <Badge variant="outline" className="mr-1">
                {availablePlayerIds.length}
              </Badge>
              Available
            </Label>
            <Button 
              onClick={onComplete}
              disabled={availablePlayerIds.length === 0}
              className="ml-2"
            >
              <Check className="mr-2 h-4 w-4" />
              Continue to Roster ({availablePlayerIds.length} available)
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
          {filteredPlayers.length > 0 ? (
            filteredPlayers.map(player => {
              const isAvailable = availablePlayerIds.includes(player.id);
              const playerColor = getPlayerColor(player);
              const colorHex = getColorHex(playerColor);
              const displayName = player.displayName || `${player.firstName} ${player.lastName}`;

              return (
                <div 
                  key={player.id}
                  className={cn(
                    "p-4 border rounded-lg shadow-sm transition-all",
                    isAvailable 
                      ? "border-2 shadow" 
                      : "opacity-75 border border-gray-200"
                  )}
                  style={{
                    borderColor: isAvailable ? colorHex : '',
                    backgroundColor: isAvailable ? `${colorHex}10` : ''
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <PlayerAvatar 
                        firstName={player.firstName}
                        lastName={player.lastName}
                        avatarColor={playerColor}
                        size="md"
                      />
                      <div>
                        <div className="font-medium">{displayName}</div>
                        {player.positionPreferences && player.positionPreferences.length > 0 && (
                          <div className="text-xs text-gray-500">
                            {player.positionPreferences.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={isAvailable}
                        onCheckedChange={(checked) => {
                          handleAvailabilityChange(player.id, checked);
                        }}
                        disabled={isSaving}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-6 text-center text-gray-500">
              <XCircle className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2">No players found matching your search</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}