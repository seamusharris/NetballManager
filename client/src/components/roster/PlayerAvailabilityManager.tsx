import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Search, XCircle } from 'lucide-react';
import { Player, Game, Opponent } from '@shared/schema';
import { formatShortDate, cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface PlayerAvailabilityManagerProps {
  players: Player[];
  game: Game | undefined;
  opponent: Opponent | undefined;
  availablePlayers: number[];
  onAvailabilityChange: (playerId: number, isAvailable: boolean) => void;
  onComplete: () => void;
}

export default function PlayerAvailabilityManager({
  players,
  game,
  opponent,
  availablePlayers,
  onAvailabilityChange,
  onComplete
}: PlayerAvailabilityManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');

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
          {game && opponent && (
            <span className="font-normal text-gray-600 ml-2">
              for {formatShortDate(game.date)} vs {opponent.teamName}
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
                {availablePlayers.length}
              </Badge>
              Available
            </Label>
            <Button 
              onClick={onComplete}
              disabled={availablePlayers.length === 0}
              className="ml-2"
            >
              <Check className="mr-2 h-4 w-4" />
              Continue to Roster
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
          {filteredPlayers.length > 0 ? (
            filteredPlayers.map(player => {
              const isAvailable = availablePlayers.includes(player.id);
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
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: colorHex }}
                      >
                        {displayName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">{displayName}</div>
                        {player.positionPreferences && player.positionPreferences.length > 0 && (
                          <div className="text-xs text-gray-500">
                            Preferred: {player.positionPreferences.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={isAvailable}
                        onCheckedChange={(checked) => {
                          onAvailabilityChange(player.id, checked);
                        }}
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