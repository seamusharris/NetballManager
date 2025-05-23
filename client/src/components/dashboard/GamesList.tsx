import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Game, Opponent } from '@shared/schema';
import { Badge } from '@/components/ui/badge';
import { cn, formatDate } from '@/lib/utils';
import { useState } from 'react';
import { GameScoreDisplay } from '../statistics/GameScoreDisplay';
import { Card, CardContent } from '@/components/ui/card';

interface GamesListProps {
  games: Game[];
  opponents: Opponent[];
  className?: string;
}

// Status badge colors
const statusColors = {
  'upcoming': 'bg-blue-100 text-blue-800 border-blue-200',
  'in-progress': 'bg-amber-100 text-amber-800 border-amber-200',
  'completed': 'bg-green-100 text-green-800 border-green-200',
  'forfeit-win': 'bg-purple-100 text-purple-800 border-purple-200',
  'forfeit-loss': 'bg-red-100 text-red-800 border-red-200',
};

export default function GamesList({ games, opponents, className }: GamesListProps): JSX.Element {
  const [displayMode, setDisplayMode] = useState('all');
  
  // Filter and sort games based on display mode
  const filteredGames = (() => {
    const currentDate = new Date().toISOString().split('T')[0];
    
    // First, filter based on the display mode
    let filtered = [...games];
    
    switch (displayMode) {
      case 'upcoming':
        filtered = filtered.filter(game => game.date >= currentDate && !game.completed);
        break;
      case 'completed':
        filtered = filtered.filter(game => game.completed);
        break;
      case 'recent':
        filtered = filtered.filter(game => game.completed)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5);
        break;
      // 'all' returns all games
    }
    
    // Finally, sort by date
    return filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  })();
  
  // Find opponent name for a game
  const getOpponentName = (game: Game) => {
    // Handle BYE games
    if (game.isBye) return '—';
    
    // Find opponent in list
    const opponent = opponents.find(opp => opp.id === game.opponentId);
    return opponent ? opponent.teamName : 'Unknown Opponent';
  };
  
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-heading font-semibold text-neutral-dark">Game Schedule</h3>
          <Select value={displayMode} onValueChange={setDisplayMode}>
            <SelectTrigger className="bg-white border rounded-md w-[140px] h-8 text-sm">
              <SelectValue placeholder="All Games" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Games</SelectItem>
              <SelectItem value="upcoming">Upcoming Games</SelectItem>
              <SelectItem value="completed">Completed Games</SelectItem>
              <SelectItem value="recent">Recent Games</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-32 border-r border-b">Date</TableHead>
                <TableHead className="border-r border-b">Opponent</TableHead>
                <TableHead className="w-24 text-center border-r border-b">Status</TableHead>
                <TableHead className="w-24 text-center border-b">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white divide-y divide-gray-200">
              {filteredGames.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-gray-500 border-b">
                    No games available
                  </TableCell>
                </TableRow>
              ) : (
                filteredGames.map(game => (
                  <TableRow 
                    key={game.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => window.location.href = `/games/${game.id}`}
                  >
                    <TableCell className="px-3 py-2 whitespace-nowrap border-r">
                      <div className="font-medium text-gray-900">{formatDate(game.date)}</div>
                      <div className="text-xs text-gray-500">{game.time}</div>
                    </TableCell>
                    
                    <TableCell className="px-3 py-2 whitespace-nowrap border-r">
                      <span className="font-medium">
                        {getOpponentName(game)}
                      </span>
                      {game.round && (
                        <span className="text-xs ml-2 text-gray-500">
                          Round {game.round}
                        </span>
                      )}
                    </TableCell>
                    
                    <TableCell className="px-2 py-2 whitespace-nowrap text-center border-r">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "font-normal text-xs px-2 py-0.5",
                          statusColors[game.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800 border-gray-200'
                        )}
                      >
                        {game.status}
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="px-2 py-2 whitespace-nowrap text-center">
                      {game.completed ? (
                        <GameScoreDisplay gameId={game.id} compact={true} />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}