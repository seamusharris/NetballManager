
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearch } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Game, Opponent, Player } from '@shared/schema';
import OpponentMatchups from '@/components/dashboard/OpponentMatchups';
import { apiRequest } from '@/lib/apiClient';

export default function OpponentAnalysis() {
  const [selectedOpponent, setSelectedOpponent] = useState<string>('all');
  const search = useSearch();

  // Initialize selected opponent from URL parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(search);
    const opponentParam = searchParams.get('opponent');
    if (opponentParam) {
      setSelectedOpponent(opponentParam);
    }
  }, [search]);

  const { data: games = [], isLoading: gamesLoading } = useQuery({
    queryKey: ['games'],
    queryFn: () => apiRequest('GET', '/api/games')
  });

  const { data: opponents = [], isLoading: opponentsLoading } = useQuery({
    queryKey: ['opponents'],
    queryFn: () => apiRequest('GET', '/api/opponents')
  });

  const { data: players = [], isLoading: playersLoading } = useQuery({
    queryKey: ['players'],
    queryFn: () => apiRequest('GET', '/api/players')
  });

  // Fetch centralized stats for all completed games
  const completedGameIds = games.filter((game: Game) => game.completed).map((game: Game) => game.id);
  
  const { data: centralizedStats = {} } = useQuery({
    queryKey: ['dashboardStats', completedGameIds.join(',')],
    queryFn: async () => {
      if (completedGameIds.length === 0) return {};
      
      try {
        const response = await apiRequest('GET', `/api/games/stats/batch?gameIds=${completedGameIds.join(',')}`);
        return response;
      } catch (error) {
        console.error('Error fetching centralized stats:', error);
        return {};
      }
    },
    enabled: completedGameIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const filteredGames = selectedOpponent === 'all' 
    ? games 
    : games.filter((game: Game) => game.opponentId === parseInt(selectedOpponent));

  const selectedOpponentData = selectedOpponent !== 'all' 
    ? opponents.find((opp: Opponent) => opp.id === parseInt(selectedOpponent))
    : null;

  // Calculate detailed stats for selected opponent
  const calculateDetailedStats = () => {
    if (!selectedOpponentData) return null;

    const opponentGames = games.filter((game: Game) => 
      game.opponentId === selectedOpponentData.id && game.completed
    );

    const gameResults = opponentGames.map((game: Game) => {
      const gameStats = centralizedStats[game.id] || [];
      const teamScore = gameStats.reduce((sum: number, stat: any) => sum + (stat.goalsFor || 0), 0);
      const opponentScore = gameStats.reduce((sum: number, stat: any) => sum + (stat.goalsAgainst || 0), 0);
      
      return {
        game,
        teamScore,
        opponentScore,
        result: getWinLoseLabel(teamScore, opponentScore),
        margin: teamScore - opponentScore
      };
    });

    const wins = gameResults.filter(r => r.result === 'Win').length;
    const losses = gameResults.filter(r => r.result === 'Loss').length;
    const draws = gameResults.filter(r => r.result === 'Draw').length;

    return {
      totalGames: opponentGames.length,
      wins,
      losses,
      draws,
      winRate: opponentGames.length > 0 ? Math.round((wins / opponentGames.length) * 100) : 0,
      avgMargin: gameResults.length > 0 ? Math.round(gameResults.reduce((sum, r) => sum + r.margin, 0) / gameResults.length) : 0,
      biggestWin: gameResults.filter(r => r.result === 'Win').reduce((max, r) => r.margin > max ? r.margin : max, 0),
      biggestLoss: Math.abs(gameResults.filter(r => r.result === 'Loss').reduce((min, r) => r.margin < min ? r.margin : min, 0)),
      gameResults: gameResults.sort((a, b) => new Date(b.game.date).getTime() - new Date(a.game.date).getTime())
    };
  };

  const detailedStats = calculateDetailedStats();

  if (gamesLoading || opponentsLoading || playersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading opponent analysis...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-heading font-bold text-neutral-dark">Opponent Analysis</h1>
        
        <Select value={selectedOpponent} onValueChange={setSelectedOpponent}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select opponent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Opponents</SelectItem>
            {opponents.map((opponent: Opponent) => (
              <SelectItem key={opponent.id} value={opponent.id.toString()}>
                {opponent.teamName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <OpponentMatchups 
        games={filteredGames}
        opponents={selectedOpponent === 'all' ? opponents : [selectedOpponentData].filter(Boolean)}
        centralizedStats={centralizedStats}
        className="w-full"
      />
    </div>
  );
}
