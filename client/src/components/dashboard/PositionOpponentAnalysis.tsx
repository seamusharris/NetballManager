import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { Target, TrendingUp, TrendingDown, Users } from 'lucide-react';
import { Game, GameStat, Player, Opponent, Roster, Position, allPositions } from '@shared/schema';
import { useBatchGameStats } from '@/hooks/use-game-stats';
import { apiClient } from '@/lib/apiClient';

interface PositionOpponentAnalysisProps {
  seasonId?: number;
}

interface PositionOpponentStats {
  position: Position;
  opponentId: number;
  opponentName: string;
  gamesPlayed: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifferential: number;
  efficiency: number; // goals for / (goals for + goals against)
}

interface PlayerPositionOpponentStats {
  playerId: number;
  playerName: string;
  position: Position;
  opponentId: number;
  opponentName: string;
  quartersPlayed: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifferential: number;
  efficiency: number;
}

export default function PositionOpponentAnalysis({ seasonId }: PositionOpponentAnalysisProps) {
  // Fetch all the data we need
  const { data: games = [] } = useQuery<Game[]>({
    queryKey: ['games'],
    queryFn: () => apiClient.get('/api/games'),
  });

  const { data: opponents = [] } = useQuery<Opponent[]>({
    queryKey: ['opponents'], 
    queryFn: () => apiClient.get('/api/opponents'),
  });

  const { data: players = [] } = useQuery<Player[]>({
    queryKey: ['players'],
    queryFn: () => apiClient.get('/api/players'),
  });

  // Filter games by season and completed status
  const completedGames = useMemo(() => {
    const filtered = games.filter(game => {
      // Check if game is completed and allows statistics
      const isValidGame = game.status === 'completed';
      if (!isValidGame) return false;

      // Handle season filtering - seasonId is now always numeric or undefined
      return seasonId ? game.seasonId === seasonId : true;
    });
    
    console.log('PositionOpponentAnalysis - Debug info:', {
      totalGames: games.length,
      seasonId,
      completedGames: filtered.length,
      sampleCompletedGame: filtered[0],
      allGames: games.slice(0, 3)
    });
    
    return filtered;
  }, [games, seasonId]);

  const gameIds = completedGames.map(g => g.id);

  // Get batch stats for all games
  const { data: gameStatsMap = {} } = useBatchGameStats(gameIds);

  // Get rosters for all games
  const { data: allRosters = [] } = useQuery({
    queryKey: ['rosters-batch', gameIds],
    queryFn: async () => {
      const rosterPromises = gameIds.map(gameId => 
        apiClient.get(`/api/games/${gameId}/rosters`).catch(() => [])
      );
      const results = await Promise.all(rosterPromises);
      return results.flat();
    },
    enabled: gameIds.length > 0,
  });

  // Calculate position vs opponent effectiveness
  const positionOpponentStats = useMemo(() => {
    const statsMap = new Map<string, PositionOpponentStats>();

    console.log('PositionOpponentAnalysis - Processing data:', {
      completedGames: completedGames.length,
      gameStatsMapKeys: Object.keys(gameStatsMap),
      gameStatsMapSample: gameStatsMap[Object.keys(gameStatsMap)[0]]?.slice(0, 3),
      opponents: opponents.length,
      allRosters: allRosters.length
    });

    completedGames.forEach(game => {
      const gameStats = gameStatsMap[game.id] || [];
      const opponent = opponents.find(o => o.id === game.opponentId);
      if (!opponent) {
        console.log('No opponent found for game:', game.id, 'opponentId:', game.opponentId);
        return;
      }

      // Group stats by position for this game
      const positionTotals: Record<Position, { goalsFor: number; goalsAgainst: number }> = {} as any;

      allPositions.forEach(pos => {
        positionTotals[pos] = { goalsFor: 0, goalsAgainst: 0 };
      });

      gameStats.forEach(stat => {
        if (stat.position && allPositions.includes(stat.position as Position)) {
          positionTotals[stat.position as Position].goalsFor += stat.goalsFor || 0;
          positionTotals[stat.position as Position].goalsAgainst += stat.goalsAgainst || 0;
        }
      });

      // Log first game's processing for debugging
      if (game.id === completedGames[0]?.id) {
        console.log('First game processing:', {
          gameId: game.id,
          opponent: opponent.teamName,
          gameStatsCount: gameStats.length,
          positionTotals: Object.entries(positionTotals).filter(([_, totals]) => 
            totals.goalsFor > 0 || totals.goalsAgainst > 0
          )
        });
      }

      // Update cumulative stats for each position
      allPositions.forEach(position => {
        const key = `${position}-${game.opponentId}`;
        const existing = statsMap.get(key);
        const posData = positionTotals[position];

        if (existing) {
          existing.gamesPlayed += 1;
          existing.goalsFor += posData.goalsFor;
          existing.goalsAgainst += posData.goalsAgainst;
          existing.goalDifferential = existing.goalsFor - existing.goalsAgainst;
          existing.efficiency = existing.goalsFor + existing.goalsAgainst > 0 
            ? existing.goalsFor / (existing.goalsFor + existing.goalsAgainst) 
            : 0;
        } else {
          statsMap.set(key, {
            position,
            opponentId: game.opponentId,
            opponentName: opponent.teamName,
            gamesPlayed: 1,
            goalsFor: posData.goalsFor,
            goalsAgainst: posData.goalsAgainst,
            goalDifferential: posData.goalsFor - posData.goalsAgainst,
            efficiency: posData.goalsFor + posData.goalsAgainst > 0 
              ? posData.goalsFor / (posData.goalsFor + posData.goalsAgainst) 
              : 0
          });
        }
      });
    });

    const result = Array.from(statsMap.values());
    
    console.log('PositionOpponentAnalysis - Final results:', {
      totalPositionOpponentStats: result.length,
      sampleStats: result.slice(0, 3),
      nonZeroStats: result.filter(s => s.goalsFor > 0 || s.goalsAgainst > 0).length
    });
    
    return result;
  }, [completedGames, gameStatsMap, opponents]);

  // Calculate player-position vs opponent effectiveness
  const playerPositionOpponentStats = useMemo(() => {
    const statsMap = new Map<string, PlayerPositionOpponentStats>();

    completedGames.forEach(game => {
      const gameStats = gameStatsMap[game.id] || [];
      const gameRosters = allRosters.filter((r: Roster) => r.gameId === game.id);
      const opponent = opponents.find(o => o.id === game.opponentId);
      if (!opponent) return;

      gameRosters.forEach((roster: Roster) => {
        const player = players.find(p => p.id === roster.playerId);
        if (!player) return;

        const key = `${roster.playerId}-${roster.position}-${game.opponentId}`;

        // Find stats for this position and quarter
        const stat = gameStats.find(s => 
          s.position === roster.position && s.quarter === roster.quarter
        );

        const goalsFor = stat?.goalsFor || 0;
        const goalsAgainst = stat?.goalsAgainst || 0;

        const existing = statsMap.get(key);
        if (existing) {
          existing.quartersPlayed += 1;
          existing.goalsFor += goalsFor;
          existing.goalsAgainst += goalsAgainst;
          existing.goalDifferential = existing.goalsFor - existing.goalsAgainst;
          existing.efficiency = existing.goalsFor + existing.goalsAgainst > 0 
            ? existing.goalsFor / (existing.goalsFor + existing.goalsAgainst) 
            : 0;
        } else {
          statsMap.set(key, {
            playerId: roster.playerId,
            playerName: player.displayName,
            position: roster.position,
            opponentId: game.opponentId,
            opponentName: opponent.teamName,
            quartersPlayed: 1,
            goalsFor,
            goalsAgainst,
            goalDifferential: goalsFor - goalsAgainst,
            efficiency: goalsFor + goalsAgainst > 0 ? goalsFor / (goalsFor + goalsAgainst) : 0
          });
        }
      });
    });

    return Array.from(statsMap.values());
  }, [completedGames, gameStatsMap, allRosters, opponents, players]);

  // Find best and worst matchups
  const bestPositionMatchups = useMemo(() => {
    return positionOpponentStats
      .filter(stat => stat.gamesPlayed >= 2) // Only positions played multiple times
      .sort((a, b) => b.goalDifferential - a.goalDifferential)
      .slice(0, 10);
  }, [positionOpponentStats]);

  const worstPositionMatchups = useMemo(() => {
    return positionOpponentStats
      .filter(stat => stat.gamesPlayed >= 2)
      .sort((a, b) => a.goalDifferential - b.goalDifferential)
      .slice(0, 10);
  }, [positionOpponentStats]);

  const bestPlayerPositionMatchups = useMemo(() => {
    return playerPositionOpponentStats
      .filter(stat => stat.quartersPlayed >= 2) // Only combinations played multiple times
      .sort((a, b) => b.goalDifferential - a.goalDifferential)
      .slice(0, 15);
  }, [playerPositionOpponentStats]);

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 0.6) return 'text-green-600 bg-green-50';
    if (efficiency >= 0.4) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getDifferentialColor = (diff: number) => {
    if (diff > 0) return 'text-green-600';
    if (diff < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Position & Player Matchup Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="position-overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="position-overview">Position vs Opponents</TabsTrigger>
            <TabsTrigger value="best-matchups">Best Matchups</TabsTrigger>
            <TabsTrigger value="worst-matchups">Problem Areas</TabsTrigger>
            <TabsTrigger value="player-combos">Player-Position Combos</TabsTrigger>
          </TabsList>

          <TabsContent value="position-overview">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Position Effectiveness by Opponent</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Position</TableHead>
                    <TableHead>Opponent</TableHead>
                    <TableHead className="text-right">Games</TableHead>
                    <TableHead className="text-right">Goals For</TableHead>
                    <TableHead className="text-right">Goals Against</TableHead>
                    <TableHead className="text-right">Goal Diff</TableHead>
                    <TableHead className="text-right">Efficiency</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {positionOpponentStats
                    .filter(stat => stat.gamesPlayed >= 1)
                    .sort((a, b) => b.goalDifferential - a.goalDifferential)
                    .map((stat, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{stat.position}</TableCell>
                      <TableCell>{stat.opponentName}</TableCell>
                      <TableCell className="text-right">{stat.gamesPlayed}</TableCell>
                      <TableCell className="text-right text-green-600">{stat.goalsFor}</TableCell>
                      <TableCell className="text-right text-red-600">{stat.goalsAgainst}</TableCell>
                      <TableCell className={`text-right font-medium ${getDifferentialColor(stat.goalDifferential)}`}>
                        {stat.goalDifferential > 0 ? '+' : ''}{stat.goalDifferential}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className={getEfficiencyColor(stat.efficiency)}>
                          {(stat.efficiency * 100).toFixed(0)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="best-matchups">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <h3 className="text-lg font-semibold">Your Strongest Position-Opponent Matchups</h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Position</TableHead>
                    <TableHead>vs Opponent</TableHead>
                    <TableHead className="text-right">Games</TableHead>
                    <TableHead className="text-right">Goal Advantage</TableHead>
                    <TableHead className="text-right">Efficiency</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bestPositionMatchups.map((stat, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{stat.position}</TableCell>
                      <TableCell>{stat.opponentName}</TableCell>
                      <TableCell className="text-right">{stat.gamesPlayed}</TableCell>
                      <TableCell className="text-right text-green-600 font-medium">
                        +{stat.goalDifferential}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="text-green-600 bg-green-50">
                          {(stat.efficiency * 100).toFixed(0)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="worst-matchups">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <h3 className="text-lg font-semibold">Positions That Struggle vs Specific Opponents</h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Position</TableHead>
                    <TableHead>vs Opponent</TableHead>
                    <TableHead className="text-right">Games</TableHead>
                    <TableHead className="text-right">Goal Deficit</TableHead>
                    <TableHead className="text-right">Efficiency</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {worstPositionMatchups.map((stat, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{stat.position}</TableCell>
                      <TableCell>{stat.opponentName}</TableCell>
                      <TableCell className="text-right">{stat.gamesPlayed}</TableCell>
                      <TableCell className="text-right text-red-600 font-medium">
                        {stat.goalDifferential}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className={getEfficiencyColor(stat.efficiency)}>
                          {(stat.efficiency * 100).toFixed(0)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="player-combos">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <h3 className="text-lg font-semibold">Best Player-Position-Opponent Combinations</h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>vs Opponent</TableHead>
                    <TableHead className="text-right">Quarters</TableHead>
                    <TableHead className="text-right">Goal Diff</TableHead>
                    <TableHead className="text-right">Efficiency</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bestPlayerPositionMatchups.map((stat, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{stat.playerName}</TableCell>
                      <TableCell>{stat.position}</TableCell>
                      <TableCell>{stat.opponentName}</TableCell>
                      <TableCell className="text-right">{stat.quartersPlayed}</TableCell>
                      <TableCell className={`text-right font-medium ${getDifferentialColor(stat.goalDifferential)}`}>
                        {stat.goalDifferential > 0 ? '+' : ''}{stat.goalDifferential}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className={getEfficiencyColor(stat.efficiency)}>
                          {(stat.efficiency * 100).toFixed(0)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}