
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, Target, Users, BarChart3, Trophy, AlertTriangle } from 'lucide-react';
import { TeamPositionAnalysis } from '@/components/dashboard/TeamPositionAnalysis';
import PlayerPerformance from '@/components/dashboard/PlayerPerformance';
import { useBatchGameStatistics } from '@/components/statistics/hooks/useBatchGameStatistics';
import { useBatchRosterData } from '@/components/statistics/hooks/useBatchRosterData';
import { Game, Player, GameStat, TeamStats } from '@shared/schema';

interface AnalysisTabProps {
  gameId: number;
  teamId: number;
  opponentId: number;
  historicalGames: Game[];
  playerStats: any[];
  teamStats: any;
  players: Player[];
  clubId: number;
}

interface AnalysisSection {
  title: string;
  description: string;
  data: any;
  isLoading: boolean;
  error?: string;
}

interface HeadToHeadRecord {
  wins: number;
  losses: number;
  draws: number;
  totalGames: number;
  winRate: number;
  averageGoalsFor: number;
  averageGoalsAgainst: number;
  lastMeetingResult: string;
  recentForm: string[];
}

interface QuarterPerformance {
  quarter: number;
  averageGoalsFor: number;
  averageGoalsAgainst: number;
  winRate: number;
  effectiveness: number;
}

export default function AnalysisTab({
  gameId,
  teamId,
  opponentId,
  historicalGames,
  playerStats,
  teamStats,
  players,
  clubId
}: AnalysisTabProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');
  const [analysisData, setAnalysisData] = useState<{
    headToHead: HeadToHeadRecord | null;
    quarterAnalysis: QuarterPerformance[];
    positionEffectiveness: Record<string, any>;
    playerMatchups: Record<string, any>;
  }>({
    headToHead: null,
    quarterAnalysis: [],
    positionEffectiveness: {},
    playerMatchups: {}
  });

  // Filter historical games against this specific opponent
  const opponentGames = useMemo(() => {
    return historicalGames.filter(game => {
      const isHomeGame = game.homeTeamId === teamId;
      const isAwayGame = game.awayTeamId === teamId;
      
      if (isHomeGame && game.awayTeamId === opponentId) return true;
      if (isAwayGame && game.homeTeamId === opponentId) return true;
      
      return false;
    }).filter(game => game.statusIsCompleted);
  }, [historicalGames, teamId, opponentId]);

  const gameIds = opponentGames.map(game => game.id);
  
  // Fetch statistics for opponent games

  // Debug roster data
  useEffect(() => {
    console.log('AnalysisTab: Roster data received:', {
      gameIds,
      rostersMapKeys: Object.keys(rostersMap || {}),
      isLoadingRosters,
      sampleRosterData: rostersMap && Object.keys(rostersMap).length > 0 ? 
        Object.entries(rostersMap).slice(0, 2).reduce((acc, [gameId, rosters]) => {
          acc[gameId] = rosters;
          return acc;
        }, {} as Record<string, any>) : 'No data'
    });
  }, [rostersMap, isLoadingRosters, gameIds]);

  // Calculate analysis data
  useEffect(() => {
    if (!statsMap || isLoadingStats || isLoadingRosters || !opponentGames.length) {
      return;
    }

    calculateAnalysisData();
  }, [statsMap, isLoadingStats, isLoadingRosters, opponentGames, selectedTimeRange]);

  const calculateAnalysisData = () => {
    // Filter games by time range
    let filteredGames = [...opponentGames];
    if (selectedTimeRange === 'last5') {
      filteredGames = opponentGames.slice(-5);
    } else if (selectedTimeRange === 'season') {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      filteredGames = opponentGames.filter(game => 
        new Date(game.date).getFullYear() === currentYear
      );
    }

    // Calculate head-to-head record
    const headToHead = calculateHeadToHeadRecord(filteredGames);
    
    // Calculate quarter analysis
    const quarterAnalysis = calculateQuarterAnalysis(filteredGames);
    
    // Calculate position effectiveness
    const positionEffectiveness = calculatePositionEffectiveness(filteredGames);
    
    // Calculate player matchups
    const playerMatchups = calculatePlayerMatchups(filteredGames);

    setAnalysisData({
      headToHead,
      quarterAnalysis,
      positionEffectiveness,
      playerMatchups
    });
  };

  const calculateHeadToHeadRecord = (games: Game[]): HeadToHeadRecord => {
    let wins = 0;
    let losses = 0;
    let draws = 0;
    let totalGoalsFor = 0;
    let totalGoalsAgainst = 0;
    const recentForm: string[] = [];

    games.forEach(game => {
      const gameStats = statsMap[game.id] || [];
      const teamGoals = gameStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
      const opponentGoals = gameStats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);

      totalGoalsFor += teamGoals;
      totalGoalsAgainst += opponentGoals;

      if (teamGoals > opponentGoals) {
        wins++;
        recentForm.push('W');
      } else if (teamGoals < opponentGoals) {
        losses++;
        recentForm.push('L');
      } else {
        draws++;
        recentForm.push('D');
      }
    });

    const totalGames = games.length;
    const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;
    const averageGoalsFor = totalGames > 0 ? totalGoalsFor / totalGames : 0;
    const averageGoalsAgainst = totalGames > 0 ? totalGoalsAgainst / totalGames : 0;

    return {
      wins,
      losses,
      draws,
      totalGames,
      winRate,
      averageGoalsFor,
      averageGoalsAgainst,
      lastMeetingResult: recentForm[recentForm.length - 1] || 'N/A',
      recentForm: recentForm.slice(-5)
    };
  };

  const calculateQuarterAnalysis = (games: Game[]): QuarterPerformance[] => {
    const quarterData: Record<number, {
      goalsFor: number[];
      goalsAgainst: number[];
      wins: number;
      total: number;
    }> = {};

    // Initialize quarters 1-4
    for (let q = 1; q <= 4; q++) {
      quarterData[q] = { goalsFor: [], goalsAgainst: [], wins: 0, total: 0 };
    }

    games.forEach(game => {
      const gameStats = statsMap[game.id] || [];
      
      // Group stats by quarter
      const quarterStats: Record<number, GameStat[]> = {};
      gameStats.forEach(stat => {
        if (!quarterStats[stat.quarter]) {
          quarterStats[stat.quarter] = [];
        }
        quarterStats[stat.quarter].push(stat);
      });

      // Calculate quarter performance
      Object.entries(quarterStats).forEach(([quarter, stats]) => {
        const q = parseInt(quarter);
        if (q >= 1 && q <= 4) {
          const goalsFor = stats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
          const goalsAgainst = stats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);
          
          quarterData[q].goalsFor.push(goalsFor);
          quarterData[q].goalsAgainst.push(goalsAgainst);
          quarterData[q].total++;
          
          if (goalsFor > goalsAgainst) {
            quarterData[q].wins++;
          }
        }
      });
    });

    // Convert to analysis format
    return Object.entries(quarterData).map(([quarter, data]) => {
      const q = parseInt(quarter);
      const avgGoalsFor = data.goalsFor.length > 0 
        ? data.goalsFor.reduce((sum, goals) => sum + goals, 0) / data.goalsFor.length 
        : 0;
      const avgGoalsAgainst = data.goalsAgainst.length > 0 
        ? data.goalsAgainst.reduce((sum, goals) => sum + goals, 0) / data.goalsAgainst.length 
        : 0;
      const winRate = data.total > 0 ? (data.wins / data.total) * 100 : 0;
      const effectiveness = avgGoalsFor - avgGoalsAgainst + (winRate / 20);

      return {
        quarter: q,
        averageGoalsFor: avgGoalsFor,
        averageGoalsAgainst: avgGoalsAgainst,
        winRate,
        effectiveness
      };
    });
  };

  const calculatePositionEffectiveness = (games: Game[]) => {
    const positions = ['GK', 'GD', 'WD', 'C', 'WA', 'GA', 'GS'];
    const positionData: Record<string, {
      goalsFor: number;
      goalsAgainst: number;
      games: number;
      effectiveness: number;
    }> = {};

    positions.forEach(position => {
      positionData[position] = { goalsFor: 0, goalsAgainst: 0, games: 0, effectiveness: 0 };
    });

    games.forEach(game => {
      const gameStats = statsMap[game.id] || [];
      
      gameStats.forEach(stat => {
        if (positions.includes(stat.position)) {
          positionData[stat.position].goalsFor += stat.goalsFor || 0;
          positionData[stat.position].goalsAgainst += stat.goalsAgainst || 0;
          positionData[stat.position].games++;
        }
      });
    });

    // Calculate effectiveness scores
    Object.keys(positionData).forEach(position => {
      const data = positionData[position];
      if (data.games > 0) {
        const avgGoalsFor = data.goalsFor / data.games;
        const avgGoalsAgainst = data.goalsAgainst / data.games;
        data.effectiveness = avgGoalsFor - avgGoalsAgainst;
      }
    });

    return positionData;
  };

  const calculatePlayerMatchups = (games: Game[]) => {
    const playerMatchups: Record<string, {
      games: number;
      goalsFor: number;
      goalsAgainst: number;
      effectiveness: number;
      bestPosition: string;
    }> = {};

    games.forEach(game => {
      const gameStats = statsMap[game.id] || [];
      const gameRosters = rostersMap[game.id] || [];

      // Match stats to players via roster
      gameStats.forEach(stat => {
        const rosterEntry = gameRosters.find(r => 
          r.position === stat.position && r.quarter === stat.quarter
        );
        
        if (rosterEntry) {
          const player = players.find(p => p.id === rosterEntry.playerId);
          if (player) {
            const playerName = player.displayName;
            
            if (!playerMatchups[playerName]) {
              playerMatchups[playerName] = {
                games: 0,
                goalsFor: 0,
                goalsAgainst: 0,
                effectiveness: 0,
                bestPosition: stat.position
              };
            }
            
            playerMatchups[playerName].games++;
            playerMatchups[playerName].goalsFor += stat.goalsFor || 0;
            playerMatchups[playerName].goalsAgainst += stat.goalsAgainst || 0;
          }
        }
      });
    });

    // Calculate effectiveness and find best positions
    Object.keys(playerMatchups).forEach(playerName => {
      const data = playerMatchups[playerName];
      data.effectiveness = (data.goalsFor - data.goalsAgainst) / Math.max(data.games, 1);
    });

    return playerMatchups;
  };

  const getEffectivenessColor = (effectiveness: number) => {
    if (effectiveness >= 2) return 'text-green-600 bg-green-100';
    if (effectiveness >= 0) return 'text-blue-600 bg-blue-100';
    if (effectiveness >= -2) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getWinRateColor = (winRate: number) => {
    if (winRate >= 70) return 'text-green-600';
    if (winRate >= 50) return 'text-blue-600';
    if (winRate >= 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const HistoricalPerformance = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Historical Performance vs Opponent
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoadingStats ? (
          <div className="text-center py-4">Loading historical data...</div>
        ) : analysisData.headToHead ? (
          <div className="space-y-4">
            {/* Head-to-Head Record */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {analysisData.headToHead.wins}-{analysisData.headToHead.losses}
                  {analysisData.headToHead.draws > 0 && `-${analysisData.headToHead.draws}`}
                </div>
                <div className="text-sm text-gray-600">Head-to-Head</div>
              </div>
              
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className={`text-2xl font-bold ${getWinRateColor(analysisData.headToHead.winRate)}`}>
                  {analysisData.headToHead.winRate.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600">Win Rate</div>
              </div>
              
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {analysisData.headToHead.averageGoalsFor.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Avg Goals For</div>
              </div>
              
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {analysisData.headToHead.averageGoalsAgainst.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Avg Goals Against</div>
              </div>
            </div>

            {/* Recent Form */}
            <div>
              <h4 className="font-semibold mb-2">Recent Form (Last 5 Games)</h4>
              <div className="flex gap-2">
                {analysisData.headToHead.recentForm.map((result, index) => (
                  <Badge 
                    key={index}
                    variant={result === 'W' ? 'default' : result === 'L' ? 'destructive' : 'secondary'}
                  >
                    {result}
                  </Badge>
                ))}
                {analysisData.headToHead.recentForm.length === 0 && (
                  <span className="text-gray-500">No recent games</span>
                )}
              </div>
            </div>

            {/* Key Insights */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Key Insights
              </h4>
              <ul className="space-y-1 text-sm">
                {analysisData.headToHead.winRate >= 60 && (
                  <li className="text-green-600">• Strong historical performance against this opponent</li>
                )}
                {analysisData.headToHead.winRate < 40 && (
                  <li className="text-red-600">• Challenging matchup - need strategic adjustments</li>
                )}
                {analysisData.headToHead.averageGoalsFor > analysisData.headToHead.averageGoalsAgainst + 5 && (
                  <li className="text-green-600">• Typically dominant in scoring</li>
                )}
                {analysisData.headToHead.averageGoalsFor < analysisData.headToHead.averageGoalsAgainst - 5 && (
                  <li className="text-red-600">• Historically struggle to score against this opponent</li>
                )}
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No historical data available against this opponent</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const QuarterAnalysis = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Quarter-by-Quarter Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        {analysisData.quarterAnalysis.length > 0 ? (
          <div className="space-y-4">
            {analysisData.quarterAnalysis.map(quarter => (
              <div key={quarter.quarter} className="p-3 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold">Quarter {quarter.quarter}</h4>
                  <Badge className={getEffectivenessColor(quarter.effectiveness)}>
                    {quarter.effectiveness > 0 ? '+' : ''}{quarter.effectiveness.toFixed(1)}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Avg Goals For</div>
                    <div className="font-medium text-green-600">
                      {quarter.averageGoalsFor.toFixed(1)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Avg Goals Against</div>
                    <div className="font-medium text-red-600">
                      {quarter.averageGoalsAgainst.toFixed(1)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Win Rate</div>
                    <div className={`font-medium ${getWinRateColor(quarter.winRate)}`}>
                      {quarter.winRate.toFixed(0)}%
                    </div>
                  </div>
                </div>
                
                <div className="mt-2">
                  <Progress 
                    value={quarter.winRate} 
                    className="h-2" 
                  />
                </div>
              </div>
            ))}

            {/* Quarter Insights */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Quarter Insights
              </h4>
              <ul className="space-y-1 text-sm">
                {(() => {
                  const bestQuarter = analysisData.quarterAnalysis.reduce((best, current) => 
                    current.effectiveness > best.effectiveness ? current : best
                  );
                  const worstQuarter = analysisData.quarterAnalysis.reduce((worst, current) => 
                    current.effectiveness < worst.effectiveness ? current : worst
                  );
                  
                  return [
                    <li key="best" className="text-green-600">
                      • Strongest in Quarter {bestQuarter.quarter} (Effectiveness: {bestQuarter.effectiveness.toFixed(1)})
                    </li>,
                    <li key="worst" className="text-red-600">
                      • Focus needed in Quarter {worstQuarter.quarter} (Effectiveness: {worstQuarter.effectiveness.toFixed(1)})
                    </li>
                  ];
                })()}
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No quarter analysis data available
          </div>
        )}
      </CardContent>
    </Card>
  );

  const PositionAnalysis = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Position Effectiveness vs Opponent
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Use existing TeamPositionAnalysis component filtered for opponent */}
          <TeamPositionAnalysis
            games={opponentGames}
            players={players}
            centralizedStats={statsMap}
            centralizedRosters={rostersMap}
            clubId={clubId}
          />
        </div>
      </CardContent>
    </Card>
  );

  const PlayerMatchups = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Player Performance vs Opponent
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Use existing PlayerPerformance component filtered for opponent games */}
          <PlayerPerformance
            players={players}
            games={opponentGames}
            className="border-0"
          />
          
          {/* Additional matchup insights */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Matchup Recommendations</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium text-green-600 mb-1">Key Players vs Opponent</h5>
                <ul className="space-y-1">
                  {Object.entries(analysisData.playerMatchups)
                    .sort(([,a], [,b]) => b.effectiveness - a.effectiveness)
                    .slice(0, 3)
                    .map(([playerName, data]) => (
                      <li key={playerName}>
                        • {playerName} (Effectiveness: {data.effectiveness.toFixed(1)})
                      </li>
                    ))}
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-blue-600 mb-1">Position Recommendations</h5>
                <ul className="space-y-1">
                  {Object.entries(analysisData.positionEffectiveness)
                    .sort(([,a], [,b]) => b.effectiveness - a.effectiveness)
                    .slice(0, 3)
                    .map(([position, data]) => (
                      <li key={position}>
                        • {position}: {data.effectiveness >= 0 ? 'Strong' : 'Needs Focus'} 
                        ({data.effectiveness.toFixed(1)})
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Time Range Filter */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Game Analysis</h3>
        <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Historical Games</SelectItem>
            <SelectItem value="season">This Season</SelectItem>
            <SelectItem value="last5">Last 5 Games</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <HistoricalPerformance />
          <QuarterAnalysis />
        </div>
        
        {/* Right Column */}
        <div className="space-y-6">
          <PositionAnalysis />
          <PlayerMatchups />
        </div>
      </div>
    </div>
  );
}
