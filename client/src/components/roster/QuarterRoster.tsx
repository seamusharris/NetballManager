import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Avatar } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { Player, Position } from '@shared/schema';
import { POSITION_NAMES } from '@/lib/constants';

interface QuarterRosterProps {
  quarter: string;
  players: Player[];
  positions: Position[];
  assignments: Record<Position, number | null>;
  availablePlayersForPosition: (position: Position, currentPlayerId: number | null) => Player[];
  onAssignPlayer: (position: Position, playerId: number) => void;
  isPending: boolean;
}

export default function QuarterRoster({
  quarter,
  players,
  positions,
  assignments,
  availablePlayersForPosition,
  onAssignPlayer,
  isPending
}: QuarterRosterProps) {
  
  // Get player by ID
  const getPlayer = (playerId: number | null) => {
    if (playerId === null) return null;
    return players.find(p => p.id === playerId) || null;
  };
  
  // Filter players by position preference
  const filterPlayersByPosition = (playersList: Player[], position: Position) => {
    // Return players who have this position in their preferences
    return playersList.filter(player => 
      (player.positionPreferences as Position[]).includes(position)
    );
  };
  
  // Find the player's position preference rank
  const getPreferenceRank = (player: Player | null, position: Position) => {
    if (!player) return null;
    
    const preferences = player.positionPreferences as Position[];
    const rank = preferences.indexOf(position);
    
    if (rank === -1) return null;
    return rank + 1; // 1-based index for display
  };
  
  // Get player's primary position
  const getPrimaryPosition = (player: Player | null) => {
    if (!player) return '';
    
    const preferences = player.positionPreferences as Position[];
    return preferences.length > 0 ? preferences[0] : '';
  };
  
  // Calculate position box width based on screen size (responsive grid)
  // For real app, would use more robust approach with responsive layout
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {positions.map(position => {
        const assignedPlayerId = assignments[position];
        const assignedPlayer = getPlayer(assignedPlayerId);
        // Show all available players, not just those with position preferences
        const availablePlayers = availablePlayersForPosition(position, assignedPlayerId);
        
        return (
          <div key={position} className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 text-neutral-dark">
              {POSITION_NAMES[position]} ({position})
            </h4>
            
            <Select 
              value={assignedPlayerId?.toString() || 'none'} 
              onValueChange={(value) => {
                if (value !== 'none') {
                  onAssignPlayer(position, Number(value));
                  // Handle clearing position (passing null)
                  onAssignPlayer(position, 0);
                }
              }}
              disabled={isPending}
            >
              <SelectTrigger className="w-full mb-2">
                <SelectValue placeholder="Select player" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Select player</SelectItem>
                {availablePlayers.map(player => {
                  const preferenceRank = getPreferenceRank(player, position);
                  const displayText = preferenceRank 
                    ? `${player.displayName} (Pref: #${preferenceRank})`
                    : `${player.displayName} (Not preferred)`;
                  
                  return (
                    <SelectItem key={player.id} value={player.id.toString()}>
                      {displayText}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            
            {assignedPlayer && (
              <div className="flex justify-between text-xs text-gray-500">
                <span>Primary Position: {getPrimaryPosition(assignedPlayer)}</span>
                <span>
                  {getPreferenceRank(assignedPlayer, position) 
                    ? `Preference: #${getPreferenceRank(assignedPlayer, position)}`
                    : 'Not preferred'}
                </span>
              </div>
            )}
          </div>
        );
      })}
      
      {/* Unassigned Players box */}
      <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
        <h4 className="font-semibold text-gray-600 mb-3 text-center">Unassigned Players</h4>
        
        {/* List of unassigned players */}
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {players.filter(player => 
            !Object.values(assignments).includes(player.id) && player.active
          ).map(player => (
            <div key={player.id} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
              <div className="flex items-center">
                <Avatar className={`h-6 w-6 mr-2 ${player.avatarColor || 'bg-primary'} text-white text-xs`}>
                  <span>{getInitials(player.firstName, player.lastName)}</span>
                </Avatar>
                <span className="text-sm font-medium">{player.displayName}</span>
              </div>
              <div className="text-xs text-gray-500">
                {(player.positionPreferences as Position[])[0] || 'No pref'}
              </div>
            </div>
          ))}
          
          {players.filter(player => 
            !Object.values(assignments).includes(player.id) && player.active
          ).length === 0 && (
            <p className="text-xs text-gray-500 text-center py-2">
              All active players are assigned
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
