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

  // Filter players by search query
  const filteredPlayers = players.filter(player => {
    const displayName = player.displayName || `${player.firstName} ${player.lastName}`;
    return displayName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Get player color based on avatarColor
  const getPlayerColor = (player: Player) => {
    // First, check if we need to use a default color
    if (!player.avatarColor || player.avatarColor === '#FFFFFF' || player.avatarColor === '#ffffff') {
      // Use a Tailwind color class based on player ID for consistency
      const colorIndex = player.id % 10;
      const colorClasses = [
        'bg-red-500', 'bg-emerald-600', 'bg-teal-600', 'bg-blue-600', 'bg-indigo-600',
        'bg-purple-600', 'bg-pink-600', 'bg-orange-500', 'bg-yellow-600', 'bg-rose-600'
      ];
      return colorClasses[colorIndex];
    }
    
    // Check if the avatarColor is a Tailwind class (starts with 'bg-')
    if (player.avatarColor.startsWith('bg-')) {
      return player.avatarColor;
    }
    
    // Otherwise, it's a hex color, return gray as default
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
      'bg-orange-500': '#f97316',
      'bg-yellow-600': '#ca8a04',
      'bg-rose-600': '#e11d48',
      'bg-gray-400': '#9ca3af'
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