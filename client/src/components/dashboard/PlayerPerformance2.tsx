import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Game, Player } from '@shared/schema';
import { useState } from 'react';
import { PlayerStatsCard } from '@/components/statistics/PlayerStatsCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PlayerPerformanceProps {
  players: Player[];
  games: Game[];
  className?: string;
}

export default function PlayerPerformance({ players, games, className }: PlayerPerformanceProps): JSX.Element {
  const [timeRange, setTimeRange] = useState('season');
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  
  // Get only completed games
  const completedGames = games.filter(game => game.completed);
  const gameIds = completedGames.map(game => game.id);
  
  // Filter games based on time range
  const filteredGameIds = (() => {
    const now = new Date();
    
    if (timeRange === 'last5') {
      // Sort games by date (newest first) and get the 5 most recent
      return completedGames
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
        .map(game => game.id);
    } 
    else if (timeRange === 'month') {
      // Filter to include only this month's games
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      return completedGames
        .filter(game => {
          const gameDate = new Date(game.date);
          return gameDate.getMonth() === currentMonth && gameDate.getFullYear() === currentYear;
        })
        .map(game => game.id);
    }
    // 'season' includes all games
    return gameIds;
  })();
  
  console.log(`Filtering player performance to ${filteredGameIds.length} games based on time range: ${timeRange}`);
  
  // Sort players by name for the tabs
  const sortedPlayers = [...players].sort((a, b) => 
    a.displayName.localeCompare(b.displayName)
  );
  
  // If no player is selected, default to the first player in the sorted list
  const activePlayer = selectedPlayer || (sortedPlayers.length > 0 ? sortedPlayers[0].id : null);
  
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-heading font-semibold text-neutral-dark">Player Performance</h3>
          
          <Select 
            value={timeRange} 
            onValueChange={(value) => {
              setTimeRange(value);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="season">Full Season</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="last5">Last 5 Games</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {players.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No player data available. Please add players to the roster.
          </div>
        ) : (
          <div className="space-y-6">
            <Tabs 
              defaultValue={activePlayer?.toString()} 
              onValueChange={(value) => setSelectedPlayer(Number(value))}
              className="w-full"
            >
              <TabsList className="w-full flex overflow-x-auto pb-1">
                {sortedPlayers.map((player) => (
                  <TabsTrigger 
                    key={player.id} 
                    value={player.id.toString()}
                    className="flex-shrink-0"
                  >
                    {player.displayName}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {sortedPlayers.map((player) => (
                <TabsContent key={player.id} value={player.id.toString()}>
                  <PlayerStatsCard
                    playerId={player.id}
                    playerName={player.displayName}
                    gameIds={filteredGameIds}
                    showPositionBreakdown={true}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
}