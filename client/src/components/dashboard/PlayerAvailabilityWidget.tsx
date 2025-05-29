
import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Users, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import BaseWidget from '@/components/ui/base-widget';
import { Game, Opponent, Player } from '@shared/schema';
import { formatShortDate } from '@/lib/utils';

interface PlayerAvailabilityWidgetProps {
  games: Game[];
  opponents: Opponent[];
  players: Player[];
  className?: string;
}

interface GameAvailability {
  gameId: number;
  availableCount: number;
  totalPlayers: number;
}

export default function PlayerAvailabilityWidget({ 
  games, 
  opponents, 
  players,
  className 
}: PlayerAvailabilityWidgetProps) {
  const [availabilityData, setAvailabilityData] = useState<Record<number, GameAvailability>>({});
  const [loading, setLoading] = useState(false);

  // Get upcoming games (next 3 games)
  const upcomingGames = games
    .filter(game => !game.completed && game.date >= new Date().toISOString().split('T')[0])
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  console.log('PlayerAvailabilityWidget rendering:', {
    totalGames: games.length,
    upcomingGames: upcomingGames.length,
    todayDate: new Date().toISOString().split('T')[0],
    games: games.map(g => ({ id: g.id, date: g.date, completed: g.completed }))
  });

  // Fetch availability data for upcoming games
  useEffect(() => {
    const fetchAvailability = async () => {
      if (upcomingGames.length === 0) return;
      
      setLoading(true);
      const newAvailabilityData: Record<number, GameAvailability> = {};

      try {
        for (const game of upcomingGames) {
          try {
            const response = await fetch(`/api/games/${game.id}/availability`);
            if (response.ok) {
              const availablePlayerIds = await response.json();
              newAvailabilityData[game.id] = {
                gameId: game.id,
                availableCount: availablePlayerIds.length,
                totalPlayers: players.filter(p => p.active).length
              };
            } else {
              // If no availability data exists, assume all players are available
              newAvailabilityData[game.id] = {
                gameId: game.id,
                availableCount: players.filter(p => p.active).length,
                totalPlayers: players.filter(p => p.active).length
              };
            }
          } catch (error) {
            console.error(`Error fetching availability for game ${game.id}:`, error);
            newAvailabilityData[game.id] = {
              gameId: game.id,
              availableCount: 0,
              totalPlayers: players.filter(p => p.active).length
            };
          }
        }

        setAvailabilityData(newAvailabilityData);
      } catch (error) {
        console.error('Error fetching player availability:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [upcomingGames.length, players.length]);

  const getAvailabilityStatus = (available: number, total: number) => {
    const percentage = total > 0 ? (available / total) * 100 : 0;
    if (percentage >= 85) return { color: 'bg-green-500', status: 'Excellent' };
    if (percentage >= 70) return { color: 'bg-blue-500', status: 'Good' };
    if (percentage >= 50) return { color: 'bg-yellow-500', status: 'Limited' };
    return { color: 'bg-red-500', status: 'Critical' };
  };

  if (upcomingGames.length === 0) {
    return (
      <BaseWidget title="Player Availability" className={className}>
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <Clock className="h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">No upcoming games</p>
        </div>
      </BaseWidget>
    );
  }

  return (
    <BaseWidget title="Player Availability" className={className}>
      <div className="space-y-3">
        {upcomingGames.map(game => {
          const opponent = opponents.find(o => o.id === game.opponentId);
          const availability = availabilityData[game.id];
          const { color, status } = availability ? 
            getAvailabilityStatus(availability.availableCount, availability.totalPlayers) :
            { color: 'bg-gray-400', status: 'Unknown' };

          return (
            <div key={game.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${color}`} />
                  <span className="text-sm font-medium">
                    vs {opponent?.teamName || 'Unknown'}
                  </span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {formatShortDate(game.date)}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {loading ? '...' : availability ? 
                      `${availability.availableCount}/${availability.totalPlayers}` : 
                      'Not set'
                    }
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${color.replace('bg-', 'text-')} border-current`}
                  >
                    {status}
                  </Badge>
                  <Link href={`/roster/${game.id}`}>
                    <Button variant="outline" size="sm" className="text-xs px-2 py-1">
                      Manage
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </BaseWidget>
  );
}
