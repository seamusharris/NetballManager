import { useState, useEffect } from 'react';
import { useSearch, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, Trophy } from 'lucide-react';
import { Game, Opponent, Season } from '@shared/schema';
import { getWinLoseLabel } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/apiClient';
import { GameResult } from '@/lib/resultUtils';
import { ResultBadge } from '@/components/ui/result-badge';

interface OpponentMatchup {
  opponent: Opponent;
  games: Game[];
  wins: number;
  losses: number;
  draws: number;
  totalGamesPlayed: number;
  winRate: number;
  avgScoreFor: number;
  avgScoreAgainst: number;
  scoreDifferential: number;
  goalsPercentage: number;
  recentForm: string[];
  trend: 'improving' | 'declining' | 'stable';
  lastGameDate?: string;
  nextGameDate?: string;
}

export default function OpponentAnalysis() {
  const [selectedSeason, setSelectedSeason] = useState<string>('current');
  const [matchups, setMatchups] = useState<OpponentMatchup[]>([]);
  const search = useSearch();
  const [, navigate] = useLocation();

  const { data: games = [], isLoading: gamesLoading } = useQuery({
    queryKey: ['games'],
    queryFn: () => apiRequest('GET', '/api/games')
  });

  const { data: opponents = [], isLoading: opponentsLoading } = useQuery({
    queryKey: ['opponents'],
    queryFn: () => apiRequest('GET', '/api/opponents')
  });

  const { data: seasons = [], isLoading: seasonsLoading } = useQuery({
    queryKey: ['seasons'],
    queryFn: () => apiRequest('GET', '/api/seasons')
  });

  const { data: activeSeason } = useQuery({
    queryKey: ['activeSeason'],
    queryFn: () => apiRequest('GET', '/api/seasons/active')
  });

  // Fetch centralized stats for all completed games that allow statistics
  const completedGameIds = games.filter((game: Game) => 
    game.gameStatus?.isCompleted && game.gameStatus?.allowsStatistics
  ).map((game: Game) => game.id);

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

  // Filter games by season
  const filteredGames = selectedSeason === 'current' 
    ? activeSeason?.id 
      ? games.filter((game: Game) => game.seasonId === activeSeason.id)
      : games // If no active season, show all games
    : selectedSeason === 'all'
    ? games
    : games.filter((game: Game) => game.seasonId === parseInt(selectedSeason));

  useEffect(() => {
    const calculateMatchups = () => {
      console.log('OpponentAnalysis: Calculating matchups');
      console.log('- Total games:', games.length);
      console.log('- Filtered games:', filteredGames.length);
      console.log('- Total opponents:', opponents.length);
      console.log('- Selected season:', selectedSeason);
      console.log('- Active season:', activeSeason);
      
      // Debug game status filtering
      const gamesWithValidStatus = filteredGames.filter(game => 
        game.gameStatus?.isCompleted && game.gameStatus?.allowsStatistics
      );
      console.log('- Games with valid status for statistics:', gamesWithValidStatus.length);
      
      if (filteredGames.length > 0) {
        console.log('- Sample game statuses:', filteredGames.slice(0, 3).map(g => ({
          id: g.id,
          hasGameStatus: !!g.gameStatus,
          isCompleted: g.gameStatus?.isCompleted,
          allowsStatistics: g.gameStatus?.allowsStatistics,
          statusName: g.gameStatus?.name
        })));
      }
      
      const opponentMatchups: OpponentMatchup[] = [];

      opponents.forEach((opponent: Opponent) => {
        const opponentGames = filteredGames.filter((game: Game) => 
          game.opponentId === opponent.id
        );

        if (opponentGames.length === 0) {
          // Still show opponents with no games
          opponentMatchups.push({
            opponent,
            games: [],
            wins: 0,
            losses: 0,
            draws: 0,
            totalGamesPlayed: 0,
            winRate: 0,
            avgScoreFor: 0,
            avgScoreAgainst: 0,
            scoreDifferential: 0,
            goalsPercentage: 0,
            recentForm: [],
            trend: 'stable',
            lastGameDate: undefined,
            nextGameDate: opponentGames.find(g => !g.completed)?.date
          });
          return;
        }

        const completedGames = opponentGames.filter((game: Game) => 
          game.gameStatus?.isCompleted && game.gameStatus?.allowsStatistics
        );
        const upcomingGames = opponentGames.filter((game: Game) => 
          !game.gameStatus?.isCompleted
        );

        let wins = 0;
        let losses = 0;
        let draws = 0;
        let totalScoreFor = 0;
        let totalScoreAgainst = 0;
        const recentResults: string[] = [];

        // Sort completed games by date for recent form calculation
        const sortedCompletedGames = [...completedGames].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        sortedCompletedGames.forEach((game, index) => {
          const gameStats = centralizedStats[game.id] || [];

          // Calculate team and opponent scores from stats
          const teamScore = gameStats.reduce((sum: any, stat: any) => sum + (stat.goalsFor || 0), 0);
          const opponentScore = gameStats.reduce((sum: any, stat: any) => sum + (stat.goalsAgainst || 0), 0);

          totalScoreFor += teamScore;
          totalScoreAgainst += opponentScore;

          const result = getWinLoseLabel(teamScore, opponentScore);

          if (result === 'Win') wins++;
          else if (result === 'Loss') losses++;
          else draws++;

          // Track recent form (last 3 games)
          if (index < 3) {
            recentResults.push(result === 'Win' ? 'W' : result === 'Loss' ? 'L' : 'D');
          }
        });

        const totalCompletedGames = completedGames.length;
        const winRate = totalCompletedGames > 0 ? Math.round((wins / totalCompletedGames) * 100) : 0;
        const avgScoreFor = totalCompletedGames > 0 ? Math.round((totalScoreFor / totalCompletedGames) * 10) / 10 : 0;
        const avgScoreAgainst = totalCompletedGames > 0 ? Math.round((totalScoreAgainst / totalCompletedGames) * 10) / 10 : 0;
        const scoreDifferential = Math.round((avgScoreFor - avgScoreAgainst) * 10) / 10;

        // Determine trend based on recent form vs overall performance
        let trend: 'improving' | 'declining' | 'stable' = 'stable';
        if (recentResults.length >= 2) {
          const recentWins = recentResults.filter(r => r === 'W').length;
          const recentWinRate = (recentWins / recentResults.length) * 100;

          if (recentWinRate > winRate + 20) trend = 'improving';
          else if (recentWinRate < winRate - 20) trend = 'declining';
        }

        opponentMatchups.push({
          opponent,
          games: opponentGames,
          wins,
          losses,
          draws,
          totalGamesPlayed: totalCompletedGames,
          winRate,
          avgScoreFor,
          avgScoreAgainst,
          scoreDifferential,
          goalsPercentage: totalScoreAgainst > 0 ? Math.round((totalScoreFor / totalScoreAgainst) * 100) : 0,
          recentForm: recentResults,
          trend,
          lastGameDate: sortedCompletedGames[0]?.date,
          nextGameDate: upcomingGames.sort((a, b) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
          )[0]?.date
        });
      });

      // Sort by total games played, then by win rate
      opponentMatchups.sort((a, b) => {
        if (a.totalGamesPlayed !== b.totalGamesPlayed) {
          return b.totalGamesPlayed - a.totalGamesPlayed;
        }
        return b.winRate - a.winRate;
      });

      setMatchups(opponentMatchups);
    };

    if (opponents.length > 0) {
      calculateMatchups();
    }
  }, [filteredGames, opponents, centralizedStats]);

  const getFormDisplay = (form: string[]) => {
    return form.slice(0, 5).map((result, index) => {
      const gameResult: GameResult = result === 'W' ? 'Win' : result === 'L' ? 'Loss' : 'Draw';
      return (
        <ResultBadge 
          key={index} 
          result={gameResult} 
          size="sm" 
          className="mx-0.5"
        />
      );
    });
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleRowClick = (opponentId: number) => {
    navigate(`/opponent-analysis/detailed/${opponentId}`);
  };

  if (gamesLoading || opponentsLoading || seasonsLoading) {
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

        <Select value={selectedSeason} onValueChange={setSelectedSeason}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select season" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current">Current Season</SelectItem>
            <SelectItem value="all">All Seasons</SelectItem>
            {seasons.map((season: any) => (
              <SelectItem key={season.id} value={season.id.toString()}>
                {season.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Opponent Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Opponent</TableHead>
                  <TableHead className="text-center">Games Played</TableHead>
                  <TableHead className="text-center">Win Rate</TableHead>
                  <TableHead className="text-center">Record (W-L-D)</TableHead>
                  <TableHead className="text-center">Avg Score For</TableHead>
                  <TableHead className="text-center">Avg Score Against</TableHead>
                  <TableHead className="text-center">Score Diff</TableHead>
                  <TableHead className="text-center">Recent Form</TableHead>
                  <TableHead className="text-center">Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matchups.map((matchup) => (
                  <TableRow 
                    key={matchup.opponent.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleRowClick(matchup.opponent.id)}
                  >
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{matchup.opponent.teamName}</div>
                        <div className="text-sm text-gray-500">
                          {matchup.opponent.playerName && `vs ${matchup.opponent.playerName}`}
                        </div>
                        {matchup.lastGameDate && (
                          <div className="text-xs text-gray-400">
                            Last: {new Date(matchup.lastGameDate).toLocaleDateString()}
                          </div>
                        )}
                        {matchup.nextGameDate && (
                          <div className="text-xs text-blue-600">
                            Next: {new Date(matchup.nextGameDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{matchup.totalGamesPlayed}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant={matchup.winRate >= 60 ? "default" : matchup.winRate >= 40 ? "secondary" : "destructive"}
                      >
                        {matchup.winRate}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="text-sm">
                        <span className="text-green-600 font-semibold">{matchup.wins}</span>
                        <span className="mx-1">-</span>
                        <span className="text-red-600 font-semibold">{matchup.losses}</span>
                        <span className="mx-1">-</span>
                        <span className="text-yellow-600 font-semibold">{matchup.draws}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {matchup.totalGamesPlayed > 0 ? matchup.avgScoreFor : '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      {matchup.totalGamesPlayed > 0 ? matchup.avgScoreAgainst : '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      {matchup.totalGamesPlayed > 0 ? (
                        <Badge 
                          variant={matchup.scoreDifferential > 0 ? "default" : matchup.scoreDifferential < 0 ? "destructive" : "secondary"}
                        >
                          {matchup.scoreDifferential > 0 ? '+' : ''}{matchup.scoreDifferential}
                        </Badge>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center items-center">
                        {matchup.recentForm.length > 0 ? getFormDisplay(matchup.recentForm) : '-'}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        {getTrendIcon(matchup.trend)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {matchups.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No opponents found for the selected season.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}