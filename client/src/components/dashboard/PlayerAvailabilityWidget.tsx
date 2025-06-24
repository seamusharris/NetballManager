import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Users, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BaseWidget } from '@/components/ui/base-widget';
import { Game, Player } from '@shared/schema';
import { formatShortDate } from '@/lib/utils';
import { apiClient } from '@/lib/apiClient';
import { useClub } from '@/contexts/ClubContext';
import { useQueries } from '@tanstack/react-query';
import { CACHE_KEYS } from '@/lib/cacheKeys';

interface PlayerAvailabilityWidgetProps {
  games: Game[];
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
  players,
  className 
}: PlayerAvailabilityWidgetProps) {
  const { currentTeamId } = useClub();
  const [availabilityData, setAvailabilityData] = useState<Record<number, GameAvailability>>({});
  const [loading, setLoading] = useState(false);
  const [teamPlayers, setTeamPlayers] = useState<Player[]>([]);

  // Get upcoming games (next 3 games)
  const upcomingGames = games
    .filter(game => !game.gameStatus?.isCompleted && game.date >= new Date().toISOString().split('T')[0])
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  // Removed excessive logging that was causing console spam

  // Fetch current team players using Club context
  useEffect(() => {
    const fetchTeamPlayers = async () => {
      if (!currentTeamId) {
        setTeamPlayers(players);
        return;
      }

      try {
        const response = await apiClient.get(`/api/teams/${currentTeamId}/players`);
        setTeamPlayers(response);
      } catch (error) {
        console.error('PlayerAvailabilityWidget: Error fetching team players:', error);
        // Fallback to all players on error
        setTeamPlayers(players);
      }
    };

    fetchTeamPlayers();
  }, [currentTeamId, players]);

  // Use cached queries for availability data
  const availabilityQueries = useQueries({
    queries: upcomingGames.map(game => ({
      queryKey: CACHE_KEYS.playerAvailability(game.id),
      queryFn: () => apiClient.get(`/api/games/${game.id}/availability`),
      enabled: teamPlayers.length > 0,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      retry: 1
    }))
  });

  // Process availability query results with stable dependencies
  useEffect(() => {
    if (teamPlayers.length === 0) return;

    const totalActiveTeamPlayers = teamPlayers.filter(p => p.active).length;
    const teamPlayerIds = teamPlayers.map(p => p.id);
    const newAvailabilityData: Record<number, GameAvailability> = {};

    upcomingGames.forEach((game, index) => {
      const query = availabilityQueries[index];

      if (query.data) {
        // Handle different response formats
        const availablePlayerIds = Array.isArray(query.data) ? query.data : (query.data.availablePlayerIds || []);
        // Filter to only include team players
        const availableTeamPlayerIds = availablePlayerIds.filter(id => teamPlayerIds.includes(id));

        newAvailabilityData[game.id] = {
          gameId: game.id,
          availableCount: availableTeamPlayerIds.length,
          totalPlayers: totalActiveTeamPlayers
        };
      } else {
        // Default to all players available if no data
        newAvailabilityData[game.id] = {
          gameId: game.id,
          availableCount: totalActiveTeamPlayers,
          totalPlayers: totalActiveTeamPlayers
        };
      }
    });

    setAvailabilityData(newAvailabilityData);
    setLoading(availabilityQueries.some(q => q.isLoading));
  }, [teamPlayers.length, upcomingGames.length, JSON.stringify(availabilityQueries.map(q => q.data)), availabilityQueries.some(q => q.isLoading)]);

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
          const availability = availabilityData[game.id];
          const { color, status } = availability ? 
            getAvailabilityStatus(availability.availableCount, availability.totalPlayers) :
            { color: 'bg-gray-400', status: 'Unknown' };

          // Get the opponent team name (the team we're playing against)
          const getOpponentTeamName = (game: Game) => {
            // If we're the home team, opponent is away team
            if (game.homeTeamName && game.awayTeamName) {
              // Assume we're usually the home team for now, but this could be made dynamic
              return game.awayTeamName;
            }
            return 'Unknown Team';
          };

          return (
            <div key={game.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${color}`} />
                  <span className="text-sm font-medium">
                    vs {getOpponentTeamName(game)}
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
                    {loading ? 'Loading...' : availability ? 
                      `${availability.availableCount}/${availability.totalPlayers} available` : 
                      'Not set'
                    }
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {!loading && availability && (
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${color.replace('bg-', 'text-')} border-current`}
                    >
                      {status}
                    </Badge>
                  )}
                  <Link href={`/roster/${game.id}`}>
                    <Button variant="outline" size="sm" className="text-xs px-2 py-1">
                      {availability && availability.availableCount > 0 ? 'Manage' : 'Set Availability'}
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