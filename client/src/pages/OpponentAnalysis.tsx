
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearch } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Target, Trophy, Calendar, BarChart3 } from 'lucide-react';
import { Game, Opponent, Player } from '@shared/schema';
import { formatDate, getWinLoseLabel } from '@/lib/utils';
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

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed" disabled={!selectedOpponentData}>
            Detailed Analysis
          </TabsTrigger>
          <TabsTrigger value="history" disabled={!selectedOpponentData}>
            Game History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OpponentMatchups 
            games={filteredGames}
            opponents={selectedOpponent === 'all' ? opponents : [selectedOpponentData].filter(Boolean)}
            centralizedStats={centralizedStats}
            className="w-full"
          />
        </TabsContent>

        <TabsContent value="detailed">
          {detailedStats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Head-to-Head Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-600">{detailedStats.wins}</p>
                      <p className="text-sm text-gray-600">Wins</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-red-600">{detailedStats.losses}</p>
                      <p className="text-sm text-gray-600">Losses</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-yellow-600">{detailedStats.draws}</p>
                      <p className="text-sm text-gray-600">Draws</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600">{detailedStats.winRate}%</p>
                      <p className="text-sm text-gray-600">Win Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Average Margin</span>
                      <span className={`font-semibold ${
                        detailedStats.avgMargin > 0 ? 'text-green-600' : 
                        detailedStats.avgMargin < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {detailedStats.avgMargin > 0 ? '+' : ''}{detailedStats.avgMargin}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Biggest Win</span>
                      <span className="font-semibold text-green-600">+{detailedStats.biggestWin}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Biggest Loss</span>
                      <span className="font-semibold text-red-600">-{detailedStats.biggestLoss}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Games</span>
                      <span className="font-semibold">{detailedStats.totalGames}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          {detailedStats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Game History vs {selectedOpponentData?.teamName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {detailedStats.gameResults.map((result) => (
                    <div key={result.game.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{formatDate(result.game.date)}</p>
                        <p className="text-sm text-gray-600">{result.game.time}</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">
                          {result.teamScore} - {result.opponentScore}
                        </p>
                        <p className="text-sm text-gray-600">
                          {result.result === 'Win' ? '+' : result.result === 'Loss' ? '' : ''}{result.margin}
                        </p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={
                          result.result === 'Win' ? 'bg-green-50 text-green-700 border-green-200' :
                          result.result === 'Loss' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }
                      >
                        {result.result}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
