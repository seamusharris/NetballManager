import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Users, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BaseWidget } from '@/components/ui/base-widget';
import { Game, Player } from '@shared/schema';
import { formatShortDate } from '@/lib/utils';

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
  const [availabilityData, setAvailabilityData] = useState<Record<number, GameAvailability>>({});
  const [loading, setLoading] = useState(false);
  const [teamPlayers, setTeamPlayers] = useState<Player[]>([]);

  // Get upcoming games (next 3 games)
  const upcomingGames = games
    .filter(game => !game.gameStatus?.isCompleted && game.date >= new Date().toISOString().split('T')[0])
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  console.log('PlayerAvailabilityWidget rendering:', {
    totalGames: games.length,
    upcomingGames: upcomingGames.length,
    todayDate: new Date().toISOString().split('T')[0],
    games: games.map(g => ({ id: g.id, date: g.date, completed: g.completed }))
  });

  // Fetch current team players
  useEffect(() => {
    const fetchTeamPlayers = async () => {
      if (upcomingGames.length === 0) return;

      try {
        // Get the team ID from the first upcoming game
        const firstGame = upcomingGames[0];
        const teamId = firstGame.homeTeamId; // Assuming we're usually the home team
        
        const response = await fetch(`/api/teams/${teamId}/players`);
        if (response.ok) {
          const teamPlayerData = await response.json();
          setTeamPlayers(teamPlayerData);
          console.log('Fetched team players:', teamPlayerData.length, 'for team:', teamId);
        } else {
          // Fallback to all players if team-specific fetch fails
          console.log('Failed to fetch team players, using all players as fallback');
          setTeamPlayers(players);
        }
      } catch (error) {
        console.error('Error fetching team players:', error);
        // Fallback to all players on error
        setTeamPlayers(players);
      }
    };

    fetchTeamPlayers();
  }, [upcomingGames.length, players]);

  // Fetch availability data for upcoming games
  useEffect(() => {
    const fetchAvailability = async () => {
      if (upcomingGames.length === 0 || teamPlayers.length === 0) return;

      setLoading(true);
      const newAvailabilityData: Record<number, GameAvailability> = {};
      const totalActiveTeamPlayers = teamPlayers.filter(p => p.active).length;

      try {
        for (const game of upcomingGames) {
          try {
            // Add team context headers for proper team-specific availability
            const headers: HeadersInit = {
              'Content-Type': 'application/json'
            };

            // Get team ID from the game (assuming we're the home team)
            if (game.homeTeamId) {
              headers['x-current-team-id'] = game.homeTeamId.toString();
            }

            const response = await fetch(`/api/games/${game.id}/availability`, { headers });
            if (response.ok) {
              const data = await response.json();
              // Handle different response formats
              const availablePlayerIds = Array.isArray(data) ? data : (data.availablePlayerIds || []);
              // Filter to only include team players
              const teamPlayerIds = teamPlayers.map(p => p.id);
              const availableTeamPlayerIds = availablePlayerIds.filter(id => teamPlayerIds.includes(id));
              
              newAvailabilityData[game.id] = {
                gameId: game.id,
                availableCount: availableTeamPlayerIds.length || totalActiveTeamPlayers,
                totalPlayers: totalActiveTeamPlayers
              };
            } else if (response.status === 404) {
              // No availability data exists yet, assume all team players are available
              newAvailabilityData[game.id] = {
                gameId: game.id,
                availableCount: totalActiveTeamPlayers,
                totalPlayers: totalActiveTeamPlayers
              };
            } else {
              // Other error, fallback to showing all team players as available
              newAvailabilityData[game.id] = {
                gameId: game.id,
                availableCount: totalActiveTeamPlayers,
                totalPlayers: totalActiveTeamPlayers
              };
            }
          } catch (error) {
            console.error(`Error fetching availability for game ${game.id}:`, error);
            // On error, assume all team players are available
            newAvailabilityData[game.id] = {
              gameId: game.id,
              availableCount: totalActiveTeamPlayers,
              totalPlayers: totalActiveTeamPlayers
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
  }, [upcomingGames.length, teamPlayers.length]);

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