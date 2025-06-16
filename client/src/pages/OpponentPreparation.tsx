
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useQuery } from '@tanstack/react-query';
import { useClub } from '@/contexts/ClubContext';
import { apiClient } from '@/lib/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Loader2, Target, TrendingUp, FileText, Users, Clock, MapPin, Calendar } from 'lucide-react';
import { useBatchGameStatistics } from '@/components/statistics/hooks/useBatchGameStatistics';
import { useBatchRosterData } from '@/components/statistics/hooks/useBatchRosterData';
import { getWinLoseLabel } from '@/lib/utils';
import { TeamSwitcher } from '@/components/layout/TeamSwitcher';
import { ResultBadge } from '@/components/ui/result-badge';
import { formatShortDate } from '@/lib/utils';

interface OpponentTeam {
  teamId: number;
  teamName: string;
  clubName: string;
  division: string;
  games: any[];
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  lastPlayed: string;
  recentForm: string[];
}

interface GameAnalysis {
  game: any;
  ourScore: number;
  theirScore: number;
  result: string;
  margin: number;
  quarterBreakdown: {
    quarter: number;
    ourScore: number;
    theirScore: number;
    margin: number;
  }[];
  positionPerformance: Record<string, {
    goalsFor: number;
    goalsAgainst: number;
    efficiency: number;
  }>;
  playerStats: any[];
  roster: any[];
  notes: string;
}

export default function OpponentPreparation() {
  const { currentClub, currentClubId, currentTeamId, isLoading: clubLoading } = useClub();
  const [selectedOpponent, setSelectedOpponent] = useState<string>('');
  const [opponents, setOpponents] = useState<OpponentTeam[]>([]);
  const [selectedGameAnalysis, setSelectedGameAnalysis] = useState<GameAnalysis | null>(null);

  const { data: games = [], isLoading: isLoadingGames } = useQuery<any[]>({
    queryKey: ['games', currentClubId, currentTeamId],
    queryFn: () => {
      const headers: Record<string, string> = {};
      if (currentTeamId) {
        headers['x-current-team-id'] = currentTeamId.toString();
      }
      return apiClient.get('/api/games', { headers });
    },
    enabled: !!currentClubId,
  });

  const { data: players = [], isLoading: isLoadingPlayers } = useQuery<any[]>({
    queryKey: ['players', currentClubId],
    queryFn: () => apiClient.get('/api/players'),
    enabled: !!currentClubId,
  });

  // Get completed games for stats
  const completedGames = games.filter(game => game.statusIsCompleted && game.statusAllowsStatistics);
  const gameIds = completedGames.map(game => game.id);

  // Fetch batch statistics for all completed games
  const { statsMap: centralizedStats = {}, isLoading: isLoadingStats } = useBatchGameStatistics(gameIds);

  // Fetch batch roster data
  const { rostersMap: centralizedRosters = {}, isLoading: isLoadingRosters } = useBatchRosterData(gameIds);

  useEffect(() => {
    if (!centralizedStats || Object.keys(centralizedStats).length === 0 || completedGames.length === 0) return;

    const opponentTeamsMap = new Map<number, OpponentTeam>();

    completedGames.forEach(game => {
      // Determine which team is the opponent
      let opponentTeamId: number | null = null;
      let opponentTeamName = '';
      let opponentClubName = '';
      let opponentDivision = '';

      const isHomeGame = game.homeClubId === currentClubId;
      const isAwayGame = game.awayClubId === currentClubId;

      // Note: We include intra-club games for opponent preparation analysis

      if (isHomeGame && !isAwayGame) {
        opponentTeamId = game.awayTeamId;
        opponentTeamName = game.awayTeamName;
        opponentClubName = game.awayClubName;
        opponentDivision = game.awayTeamDivision;
      } else if (isAwayGame && !isHomeGame) {
        opponentTeamId = game.homeTeamId;
        opponentTeamName = game.homeTeamName;
        opponentClubName = game.homeClubName;
        opponentDivision = game.homeTeamDivision;
      }

      if (!opponentTeamId || opponentTeamName === 'Bye') return;

      if (!opponentTeamsMap.has(opponentTeamId)) {
        opponentTeamsMap.set(opponentTeamId, {
          teamId: opponentTeamId,
          teamName: opponentTeamName,
          clubName: opponentClubName,
          division: opponentDivision,
          games: [],
          totalGames: 0,
          wins: 0,
          losses: 0,
          draws: 0,
          winRate: 0,
          lastPlayed: '',
          recentForm: []
        });
      }

      const opponent = opponentTeamsMap.get(opponentTeamId)!;
      opponent.games.push(game);
    });

    // Calculate stats for each opponent
    const opponentsList: OpponentTeam[] = [];
    opponentTeamsMap.forEach(opponent => {
      const sortedGames = opponent.games.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const recentForm: string[] = [];

      sortedGames.forEach(game => {
        const gameStats = centralizedStats[game.id] || [];
        const ourScore = gameStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
        const theirScore = gameStats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);
        const result = getWinLoseLabel(ourScore, theirScore);

        if (result === 'Win') {
          opponent.wins++;
          recentForm.push('W');
        } else if (result === 'Loss') {
          opponent.losses++;
          recentForm.push('L');
        } else {
          opponent.draws++;
          recentForm.push('D');
        }
      });

      opponent.totalGames = opponent.games.length;
      opponent.winRate = opponent.totalGames > 0 ? (opponent.wins / opponent.totalGames) * 100 : 0;
      opponent.lastPlayed = sortedGames[0]?.date || '';
      opponent.recentForm = recentForm.slice(0, 5); // Last 5 games

      opponentsList.push(opponent);
    });

    // Sort by last played date (most recent first)
    opponentsList.sort((a, b) => new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime());

    setOpponents(opponentsList);
  }, [centralizedStats, completedGames, currentClubId]);

  const analyzeGame = (game: any): GameAnalysis => {
    const gameStats = centralizedStats[game.id] || [];
    const gameRoster = centralizedRosters[game.id] || [];

    const ourScore = gameStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
    const theirScore = gameStats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);
    const result = getWinLoseLabel(ourScore, theirScore);

    // Quarter breakdown
    const quarterBreakdown = [1, 2, 3, 4].map(quarter => {
      const quarterStats = gameStats.filter(stat => stat.quarter === quarter);
      const qOurScore = quarterStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
      const qTheirScore = quarterStats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);
      return {
        quarter,
        ourScore: qOurScore,
        theirScore: qTheirScore,
        margin: qOurScore - qTheirScore
      };
    });

    // Position performance
    const positionPerformance: Record<string, any> = {};
    const positions = ['GK', 'GD', 'WD', 'C', 'WA', 'GA', 'GS'];

    positions.forEach(position => {
      const posStats = gameStats.filter(stat => stat.position === position);
      const goalsFor = posStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
      const goalsAgainst = posStats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);
      
      positionPerformance[position] = {
        goalsFor,
        goalsAgainst,
        efficiency: goalsFor - goalsAgainst
      };
    });

    // Player stats with names
    const playerStats = gameStats.map(stat => {
      const player = players.find(p => p.id === stat.playerId);
      return {
        ...stat,
        playerName: player?.displayName || 'Unknown Player'
      };
    });

    return {
      game,
      ourScore,
      theirScore,
      result,
      margin: ourScore - theirScore,
      quarterBreakdown,
      positionPerformance,
      playerStats,
      roster: gameRoster,
      notes: game.notes || ''
    };
  };

  if (clubLoading || !currentClubId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p className="mt-2 text-sm text-muted-foreground">Loading club data...</p>
        </div>
      </div>
    );
  }

  const isLoading = isLoadingGames || isLoadingStats || isLoadingRosters || isLoadingPlayers;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading Opponent Analysis</h2>
          <p className="text-muted-foreground">Analyzing previous matchups and performance data...</p>
        </div>
      </div>
    );
  }

  const selectedOpponentData = opponents.find(opp => opp.teamId.toString() === selectedOpponent);

  return (
    <>
      <Helmet>
        <title>Opponent Preparation | {currentClub?.name} Stats Tracker</title>
        <meta name="description" content={`Prepare for upcoming games by analyzing previous performance against opposing teams`} />
      </Helmet>

      <div className="container py-6 mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-heading font-bold text-neutral-dark">
              Opponent Preparation
            </h1>
            <p className="text-lg text-gray-600">
              Analyze previous matchups to prepare your tactical approach
              {currentTeamId && (
                <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Filtered by selected team
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <TeamSwitcher mode="optional" />
          </div>
        </div>

        {/* Opponent Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Select Opponent Team
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Select value={selectedOpponent} onValueChange={setSelectedOpponent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an opponent team to analyze..." />
                  </SelectTrigger>
                  <SelectContent>
                    {opponents.map(opponent => (
                      <SelectItem key={opponent.teamId} value={opponent.teamId.toString()}>
                        <div className="flex items-center justify-between w-full">
                          <span>{opponent.teamName} ({opponent.clubName})</span>
                          <div className="flex items-center gap-2 ml-4">
                            <Badge variant="outline" className="text-xs">
                              {opponent.totalGames} games
                            </Badge>
                            <Badge 
                              variant={opponent.winRate >= 60 ? "default" : opponent.winRate >= 40 ? "secondary" : "destructive"}
                              className="text-xs"
                            >
                              {opponent.winRate.toFixed(0)}% win rate
                            </Badge>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedOpponentData && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700">{selectedOpponentData.totalGames}</div>
                    <div className="text-sm text-blue-600">Total Games</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-700">{selectedOpponentData.winRate.toFixed(0)}%</div>
                    <div className="text-sm text-green-600">Win Rate</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-sm font-bold text-purple-700">
                      {formatShortDate(selectedOpponentData.lastPlayed)}
                    </div>
                    <div className="text-sm text-purple-600">Last Played</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Analysis Content */}
        {selectedOpponentData && (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="games">Game History</TabsTrigger>
              <TabsTrigger value="patterns">Patterns</TabsTrigger>
              <TabsTrigger value="preparation">Preparation</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Head-to-Head Record */}
                <Card>
                  <CardHeader>
                    <CardTitle>Head-to-Head Record</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Record:</span>
                        <span className="font-bold">
                          {selectedOpponentData.wins}W - {selectedOpponentData.losses}L
                          {selectedOpponentData.draws > 0 && ` - ${selectedOpponentData.draws}D`}
                        </span>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <span>Win Rate</span>
                          <span>{selectedOpponentData.winRate.toFixed(1)}%</span>
                        </div>
                        <Progress value={selectedOpponentData.winRate} className="h-2" />
                      </div>

                      <div className="flex items-center gap-2">
                        <span>Recent Form:</span>
                        <div className="flex gap-1">
                          {selectedOpponentData.recentForm.map((result, index) => (
                            <ResultBadge 
                              key={index}
                              result={result === 'W' ? 'Win' : result === 'L' ? 'Loss' : 'Draw'}
                              size="sm"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Trends */}
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(() => {
                        const avgScores = selectedOpponentData.games.map(game => {
                          const gameStats = centralizedStats[game.id] || [];
                          const ourScore = gameStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
                          const theirScore = gameStats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);
                          return { ourScore, theirScore };
                        });

                        const avgOurScore = avgScores.length > 0 
                          ? avgScores.reduce((sum, s) => sum + s.ourScore, 0) / avgScores.length 
                          : 0;
                        const avgTheirScore = avgScores.length > 0 
                          ? avgScores.reduce((sum, s) => sum + s.theirScore, 0) / avgScores.length 
                          : 0;

                        return (
                          <>
                            <div className="flex justify-between">
                              <span>Our Average Score:</span>
                              <span className="font-bold">{avgOurScore.toFixed(1)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Their Average Score:</span>
                              <span className="font-bold">{avgTheirScore.toFixed(1)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Average Margin:</span>
                              <span className={`font-bold ${avgOurScore - avgTheirScore >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {avgOurScore - avgTheirScore >= 0 ? '+' : ''}{(avgOurScore - avgTheirScore).toFixed(1)}
                              </span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Games History Tab */}
            <TabsContent value="games" className="space-y-4">
              <div className="grid gap-4">
                {selectedOpponentData.games
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((game, index) => {
                    const analysis = analyzeGame(game);
                    return (
                      <Card key={game.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div>
                                <h3 className="font-semibold">{formatShortDate(game.date)}</h3>
                                <p className="text-sm text-gray-600">
                                  Round {game.round} • {game.seasonName}
                                </p>
                              </div>
                              <ResultBadge result={analysis.result as any} />
                              <div className="text-center">
                                <div className="text-lg font-bold">
                                  {analysis.ourScore} - {analysis.theirScore}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Margin: {analysis.margin >= 0 ? '+' : ''}{analysis.margin}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedGameAnalysis(analysis)}
                            >
                              View Details
                            </Button>
                          </div>
                        </CardHeader>
                        
                        {analysis.notes && (
                          <CardContent className="pt-0">
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                              <div className="flex items-start gap-2">
                                <FileText className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-sm font-medium text-yellow-800">Coach Notes:</p>
                                  <p className="text-sm text-yellow-700 mt-1">{analysis.notes}</p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    );
                  })}
              </div>
            </TabsContent>

            {/* Patterns Tab */}
            <TabsContent value="patterns" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quarter Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quarter Performance Patterns</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const quarterAnalysis = [1, 2, 3, 4].map(quarter => {
                        const quarterData = selectedOpponentData.games.map(game => {
                          const gameStats = centralizedStats[game.id] || [];
                          const quarterStats = gameStats.filter(stat => stat.quarter === quarter);
                          const ourScore = quarterStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
                          const theirScore = quarterStats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);
                          return { ourScore, theirScore };
                        });

                        const avgOurScore = quarterData.length > 0 
                          ? quarterData.reduce((sum, d) => sum + d.ourScore, 0) / quarterData.length 
                          : 0;
                        const avgTheirScore = quarterData.length > 0 
                          ? quarterData.reduce((sum, d) => sum + d.theirScore, 0) / quarterData.length 
                          : 0;

                        return {
                          quarter,
                          avgOurScore,
                          avgTheirScore,
                          margin: avgOurScore - avgTheirScore
                        };
                      });

                      return (
                        <div className="space-y-3">
                          {quarterAnalysis.map(qa => (
                            <div key={qa.quarter} className="flex items-center justify-between p-2 rounded bg-gray-50">
                              <span className="font-medium">Q{qa.quarter}</span>
                              <span>{qa.avgOurScore.toFixed(1)} - {qa.avgTheirScore.toFixed(1)}</span>
                              <span className={`font-bold ${qa.margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {qa.margin >= 0 ? '+' : ''}{qa.margin.toFixed(1)}
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>

                {/* Key Success Factors */}
                <Card>
                  <CardHeader>
                    <CardTitle>Success Patterns</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const wins = selectedOpponentData.games.filter(game => {
                        const gameStats = centralizedStats[game.id] || [];
                        const ourScore = gameStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
                        const theirScore = gameStats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);
                        return getWinLoseLabel(ourScore, theirScore) === 'Win';
                      });

                      const losses = selectedOpponentData.games.filter(game => {
                        const gameStats = centralizedStats[game.id] || [];
                        const ourScore = gameStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
                        const theirScore = gameStats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);
                        return getWinLoseLabel(ourScore, theirScore) === 'Loss';
                      });

                      return (
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-green-700 mb-2">When We Win ({wins.length} games):</h4>
                            <ul className="text-sm space-y-1 text-green-600">
                              <li>• Higher scoring games typically favor us</li>
                              <li>• Strong quarter starts are crucial</li>
                              <li>• Review winning game notes for patterns</li>
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-red-700 mb-2">When We Struggle ({losses.length} games):</h4>
                            <ul className="text-sm space-y-1 text-red-600">
                              <li>• Close games require better execution</li>
                              <li>• Check defensive positioning adjustments</li>
                              <li>• Review loss game notes for improvements</li>
                            </ul>
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Preparation Tab */}
            <TabsContent value="preparation" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Game Preparation Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Key Tactical Points:</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500">•</span>
                          <span>Overall record: {selectedOpponentData.wins}W-{selectedOpponentData.losses}L ({selectedOpponentData.winRate.toFixed(0)}% win rate)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500">•</span>
                          <span>Most recent encounter: {formatShortDate(selectedOpponentData.lastPlayed)}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500">•</span>
                          <span>Recent form indicates {selectedOpponentData.recentForm[0] === 'W' ? 'we won last time' : selectedOpponentData.recentForm[0] === 'L' ? 'we lost last time' : 'last game was a draw'}</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Focus Areas:</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-green-500">•</span>
                          <span>Review all previous game notes for tactical insights</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-500">•</span>
                          <span>Analyze quarter-by-quarter performance patterns</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-500">•</span>
                          <span>Consider position combinations that worked well</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-500">•</span>
                          <span>Plan for their likely tactical approach based on history</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* All Game Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    All Coaching Notes vs {selectedOpponentData.teamName}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedOpponentData.games
                      .filter(game => game.notes && game.notes.trim())
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(game => (
                        <div key={game.id} className="border-l-4 border-blue-400 pl-4 py-2 bg-blue-50 rounded-r">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-blue-800">{formatShortDate(game.date)} - Round {game.round}</span>
                            <ResultBadge result={(() => {
                              const gameStats = centralizedStats[game.id] || [];
                              const ourScore = gameStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
                              const theirScore = gameStats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);
                              return getWinLoseLabel(ourScore, theirScore) as any;
                            })()} size="sm" />
                          </div>
                          <p className="text-sm text-blue-700">{game.notes}</p>
                        </div>
                      ))}
                    
                    {selectedOpponentData.games.filter(game => game.notes && game.notes.trim()).length === 0 && (
                      <p className="text-gray-500 text-center py-4">No coaching notes recorded for games against this opponent.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Game Detail Modal */}
        {selectedGameAnalysis && (
          <Card className="fixed inset-4 z-50 bg-white shadow-2xl overflow-auto">
            <CardHeader className="sticky top-0 bg-white border-b">
              <div className="flex items-center justify-between">
                <CardTitle>
                  Game Analysis - {formatShortDate(selectedGameAnalysis.game.date)}
                </CardTitle>
                <Button variant="outline" onClick={() => setSelectedGameAnalysis(null)}>
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quarter Breakdown */}
                <div>
                  <h4 className="font-semibold mb-3">Quarter Breakdown</h4>
                  <div className="space-y-2">
                    {selectedGameAnalysis.quarterBreakdown.map(q => (
                      <div key={q.quarter} className="flex items-center justify-between p-2 rounded bg-gray-50">
                        <span>Q{q.quarter}</span>
                        <span>{q.ourScore} - {q.theirScore}</span>
                        <span className={`font-bold ${q.margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {q.margin >= 0 ? '+' : ''}{q.margin}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Position Performance */}
                <div>
                  <h4 className="font-semibold mb-3">Position Performance</h4>
                  <div className="space-y-2">
                    {Object.entries(selectedGameAnalysis.positionPerformance).map(([position, perf]) => (
                      <div key={position} className="flex items-center justify-between p-2 rounded bg-gray-50">
                        <span className="font-medium">{position}</span>
                        <span>{perf.goalsFor} - {perf.goalsAgainst}</span>
                        <span className={`font-bold ${perf.efficiency >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {perf.efficiency >= 0 ? '+' : ''}{perf.efficiency}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Game Notes */}
              {selectedGameAnalysis.notes && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Coaching Notes</h4>
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                    <p className="text-sm">{selectedGameAnalysis.notes}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* No opponents message */}
        {!isLoading && opponents.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Previous Opponents</h3>
              <p className="text-gray-600">
                You haven't played any completed games against other teams yet. 
                Once you complete games against opponents, their analysis will appear here.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
