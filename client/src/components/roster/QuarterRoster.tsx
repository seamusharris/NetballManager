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

interface QuarterRosterProps {
  quarter: string;
  players: Player[];
  positions: Position[];
  positionLabels: Record<Position, string>;
  assignments: Record<Position, number | null>;
  availablePlayersForPosition: (position: Position, currentPlayerId: number | null) => Player[];
  onAssignPlayer: (position: Position, playerId: number) => void;
  isPending: boolean;
}

export default function QuarterRoster({
  quarter,
  players,
  positions,
  positionLabels,
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
        // Filter by position preference first, then by availability
        const availablePlayers = filterPlayersByPosition(
          availablePlayersForPosition(position, assignedPlayerId),
          position
        );
        
        return (
          <div key={position} className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 text-neutral-dark">
              {positionLabels[position]} ({position})
            </h4>
            
            <Select 
              value={assignedPlayerId?.toString() || 'none'} 
              onValueChange={(value) => value !== 'none' ? onAssignPlayer(position, Number(value)) : null}
              disabled={isPending}
            >
              <SelectTrigger className="w-full mb-2">
                <SelectValue placeholder="Select player" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Select player</SelectItem>
                {availablePlayers.map(player => (
                  <SelectItem key={player.id} value={player.id.toString()}>
                    {player.displayName}
                  </SelectItem>
                ))}
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
      
      {/* Substitutes box */}
      <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-300">
        <span className="text-gray-500 mb-2">ℹ️</span>
        <h4 className="font-semibold text-gray-600 mb-1">Available Substitutes</h4>
        <p className="text-xs text-gray-500">
          {players.filter(player => 
            !Object.values(assignments).includes(player.id) && player.active
          ).length} players available
        </p>
      </div>
    </div>
  );
}
