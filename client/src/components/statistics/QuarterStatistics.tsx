import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Player, GameStat, Position } from '@shared/schema';
import { getInitials } from '@/lib/utils';

interface QuarterStatisticsProps {
  quarter: string;
  players: Player[];
  rosters: Record<Position, number | null> | null; // null for totals view
  stats: Record<number, GameStat>;
  onStatChange: (playerId: number, statName: keyof GameStat, value: number) => void;
  isEditable: boolean;
  isPending: boolean;
}

export default function QuarterStatistics({
  quarter,
  players,
  rosters,
  stats,
  onStatChange,
  isEditable,
  isPending
}: QuarterStatisticsProps) {
  
  // Get player by ID
  const getPlayer = (playerId: number) => {
    return players.find(p => p.id === playerId);
  };
  
  // Get position for a player in this quarter
  const getPlayerPosition = (playerId: number) => {
    if (!rosters) return '';
    
    // Find the position where this player is assigned
    const position = Object.entries(rosters).find(([_, id]) => id === playerId);
    return position ? position[0] : '';
  };
  
  // Get list of player IDs to show in the table
  const getPlayersToShow = () => {
    if (rosters) {
      // For a specific quarter, show the players assigned in roster
      const playerIds = Object.values(rosters).filter(id => id !== null) as number[];
      
      // If no players are found but we have stats, just use those player IDs
      if (playerIds.length === 0 && Object.keys(stats).length > 0) {
        return Object.keys(stats).map(Number);
      }
      
      return playerIds;
    } else {
      // For totals, show all players with stats
      return Object.keys(stats).map(Number);
    }
  };
  
  // Handle stat input change
  const handleStatChange = (
    playerId: number, 
    statName: keyof GameStat, 
    value: string
  ) => {
    const numericValue = parseInt(value) || 0;
    if (numericValue < 0) return; // Don't allow negative values
    
    onStatChange(playerId, statName, numericValue);
  };
  
  // Get stat value (or default to 0)
  const getStatValue = (playerId: number, statName: keyof GameStat) => {
    return stats[playerId]?.[statName] || 0;
  };
  
  const playersToShow = getPlayersToShow();
  
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="px-4 py-3 text-left">Player</TableHead>
            <TableHead className="px-4 py-3 text-center">Position</TableHead>
            <TableHead className="px-4 py-3 text-center">Goals For</TableHead>
            <TableHead className="px-4 py-3 text-center">Goals Against</TableHead>
            <TableHead className="px-4 py-3 text-center">Missed Goals</TableHead>
            <TableHead className="px-4 py-3 text-center">Rebounds</TableHead>
            <TableHead className="px-4 py-3 text-center">Intercepts</TableHead>
            <TableHead className="px-4 py-3 text-center">Bad Pass</TableHead>
            <TableHead className="px-4 py-3 text-center">Handling Error</TableHead>
            <TableHead className="px-4 py-3 text-center">Infringement</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {playersToShow.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-4 text-gray-500">
                {rosters 
                  ? "No players assigned to this quarter. Please complete the roster."
                  : "No statistics available for this game yet."
                }
              </TableCell>
            </TableRow>
          ) : (
            playersToShow.map(playerId => {
              const player = getPlayer(playerId);
              if (!player) return null;
              
              return (
                <TableRow key={playerId}>
                  <TableCell className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 bg-primary text-white flex items-center justify-center">
                        <span className="text-xs font-bold">{getInitials(player.firstName, player.lastName)}</span>
                      </Avatar>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{player.displayName}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-center">
                    {getPlayerPosition(playerId)}
                  </TableCell>
                  
                  {/* Goals For */}
                  <TableCell className="px-4 py-3 whitespace-nowrap">
                    {isEditable ? (
                      <Input
                        type="number"
                        value={getStatValue(playerId, 'goalsFor')}
                        onChange={(e) => handleStatChange(playerId, 'goalsFor', e.target.value)}
                        className="stats-input"
                        disabled={isPending}
                        min={0}
                      />
                    ) : (
                      <div className="text-center">{getStatValue(playerId, 'goalsFor')}</div>
                    )}
                  </TableCell>
                  
                  {/* Goals Against */}
                  <TableCell className="px-4 py-3 whitespace-nowrap">
                    {isEditable ? (
                      <Input
                        type="number"
                        value={getStatValue(playerId, 'goalsAgainst')}
                        onChange={(e) => handleStatChange(playerId, 'goalsAgainst', e.target.value)}
                        className="stats-input"
                        disabled={isPending}
                        min={0}
                      />
                    ) : (
                      <div className="text-center">{getStatValue(playerId, 'goalsAgainst')}</div>
                    )}
                  </TableCell>
                  
                  {/* Missed Goals */}
                  <TableCell className="px-4 py-3 whitespace-nowrap">
                    {isEditable ? (
                      <Input
                        type="number"
                        value={getStatValue(playerId, 'missedGoals')}
                        onChange={(e) => handleStatChange(playerId, 'missedGoals', e.target.value)}
                        className="stats-input"
                        disabled={isPending}
                        min={0}
                      />
                    ) : (
                      <div className="text-center">{getStatValue(playerId, 'missedGoals')}</div>
                    )}
                  </TableCell>
                  
                  {/* Rebounds */}
                  <TableCell className="px-4 py-3 whitespace-nowrap">
                    {isEditable ? (
                      <Input
                        type="number"
                        value={getStatValue(playerId, 'rebounds')}
                        onChange={(e) => handleStatChange(playerId, 'rebounds', e.target.value)}
                        className="stats-input"
                        disabled={isPending}
                        min={0}
                      />
                    ) : (
                      <div className="text-center">{getStatValue(playerId, 'rebounds')}</div>
                    )}
                  </TableCell>
                  
                  {/* Intercepts */}
                  <TableCell className="px-4 py-3 whitespace-nowrap">
                    {isEditable ? (
                      <Input
                        type="number"
                        value={getStatValue(playerId, 'intercepts')}
                        onChange={(e) => handleStatChange(playerId, 'intercepts', e.target.value)}
                        className="stats-input"
                        disabled={isPending}
                        min={0}
                      />
                    ) : (
                      <div className="text-center">{getStatValue(playerId, 'intercepts')}</div>
                    )}
                  </TableCell>
                  
                  {/* Bad Pass */}
                  <TableCell className="px-4 py-3 whitespace-nowrap">
                    {isEditable ? (
                      <Input
                        type="number"
                        value={getStatValue(playerId, 'badPass')}
                        onChange={(e) => handleStatChange(playerId, 'badPass', e.target.value)}
                        className="stats-input"
                        disabled={isPending}
                        min={0}
                      />
                    ) : (
                      <div className="text-center">{getStatValue(playerId, 'badPass')}</div>
                    )}
                  </TableCell>
                  
                  {/* Handling Error */}
                  <TableCell className="px-4 py-3 whitespace-nowrap">
                    {isEditable ? (
                      <Input
                        type="number"
                        value={getStatValue(playerId, 'handlingError')}
                        onChange={(e) => handleStatChange(playerId, 'handlingError', e.target.value)}
                        className="stats-input"
                        disabled={isPending}
                        min={0}
                      />
                    ) : (
                      <div className="text-center">{getStatValue(playerId, 'handlingError')}</div>
                    )}
                  </TableCell>
                  
                  {/* Infringement */}
                  <TableCell className="px-4 py-3 whitespace-nowrap">
                    {isEditable ? (
                      <Input
                        type="number"
                        value={getStatValue(playerId, 'infringement')}
                        onChange={(e) => handleStatChange(playerId, 'infringement', e.target.value)}
                        className="stats-input"
                        disabled={isPending}
                        min={0}
                      />
                    ) : (
                      <div className="text-center">{getStatValue(playerId, 'infringement')}</div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
