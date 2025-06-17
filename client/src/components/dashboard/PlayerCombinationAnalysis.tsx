import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Target, Users, Zap } from 'lucide-react';

interface PlayerCombinationAnalysisProps {
  games: any[];
  players: any[];
  centralizedStats: Record<number, any[]>;
  centralizedRosters: Record<number, any[]>;
  currentClubId?: number;
}

interface CombinationResult {
  combination: string[];
  playerNames: string[];
  gamesPlayed: number;
  totalGoalsFor: number;
  totalGoalsAgainst: number;
  goalDifferential: number;
  averageGoalsFor: number;
  averageGoalsAgainst: number;
  winRate: number;
  effectiveness: number;
  positions: string[];
}

interface TeamSpecificResult extends CombinationResult {
  opponent: string;
  opponentGames: number;
}

function PlayerCombinationAnalysis({ 
  games, 
  players, 
  centralizedStats, 
  centralizedRosters,
  currentClubId 
}: PlayerCombinationAnalysisProps) {
  const [selectedOpponent, setSelectedOpponent] = useState<string>('all');
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [combinationSize, setCombinationSize] = useState<number>(2);
  const [generalCombinations, setGeneralCombinations] = useState<CombinationResult[]>([]);
  const [teamSpecificCombinations, setTeamSpecificCombinations] = useState<TeamSpecificResult[]>([]);
  const [opponents, setOpponents] = useState<string[]>([]);

  const positions = ['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'];

  // Get unique opponents from games (exclude our own teams)
  useEffect(() => {
    const uniqueOpponents = Array.from(new Set(
      games
        .filter(game => game.statusIsCompleted && game.statusAllowsStatistics)
        .map(game => {
          const isHomeGame = game.homeClubId === currentClubId;
          const isAwayGame = game.awayClubId === currentClubId;

          if (isHomeGame && !isAwayGame) {
            return game.awayTeamName;
          } else if (isAwayGame && !isHomeGame) {
            return game.homeTeamName;
          }
          return null; // Skip intra-club games
        })
        .filter(Boolean)
        .filter(teamName => teamName !== 'Bye')
    ));
    setOpponents(uniqueOpponents);
  }, [games, currentClubId]);

  // Calculate player combinations effectiveness
  useEffect(() => {
    if (!centralizedStats || !centralizedRosters || Object.keys(centralizedStats).length === 0) {
      return;
    }

    calculateCombinations();
  }, [centralizedStats, centralizedRosters, combinationSize, selectedPositions, selectedOpponent, currentClubId]);

  const getPlayerCombinations = (playerIds: number[], size: number): number[][] => {
    if (size > playerIds.length) return [];
    if (size === 1) return playerIds.map(id => [id]);
    if (size === playerIds.length) return [playerIds];

    const combinations: number[][] = [];

    function backtrack(start: number, currentCombination: number[]) {
      if (currentCombination.length === size) {
        combinations.push([...currentCombination]);
        return;
      }

      for (let i = start; i < playerIds.length; i++) {
        currentCombination.push(playerIds[i]);
        backtrack(i + 1, currentCombination);
        currentCombination.pop();
      }
    }

    backtrack(0, []);
    return combinations;
  };

  const calculateCombinations = () => {
    const completedGames = games.filter(game => 
      game.statusIsCompleted && 
      game.statusAllowsStatistics &&
      centralizedStats[game.id] &&
      centralizedRosters[game.id]
    );

    // Get all player combinations that have played together
    const combinationMap = new Map<string, {
      gamesPlayed: any[];
      totalGoalsFor: number;
      totalGoalsAgainst: number;
      wins: number;
      positions: Set<string>;
      opponents: Map<string, any[]>;
    }>();

    completedGames.forEach(game => {
      const gameStats = centralizedStats[game.id] || [];
      const gameRosters = centralizedRosters[game.id] || [];

      if (gameStats.length === 0 || gameRosters.length === 0) return;

      // Calculate game totals
      const gameGoalsFor = gameStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
      const gameGoalsAgainst = gameStats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);
      const gameWon = gameGoalsFor > gameGoalsAgainst;

      // Get players who played in this game
      const playersInGame = Array.from(new Set(gameRosters.map(r => r.playerId))).filter(Boolean);

      // Filter by position if specified
      let filteredPlayers = playersInGame;
      if (selectedPositions.length > 0) {
        filteredPlayers = playersInGame.filter(playerId => {
          return gameRosters.some(roster => 
            roster.playerId === playerId && 
            selectedPositions.includes(roster.position)
          );
        });
      }

      if (filteredPlayers.length < combinationSize) return;

      // Generate combinations for this game
      const combinations = getPlayerCombinations(filteredPlayers, combinationSize);

      combinations.forEach(combination => {
        const sortedCombination = combination.sort((a, b) => a - b);
        const combinationKey = sortedCombination.join('-');

        if (!combinationMap.has(combinationKey)) {
          combinationMap.set(combinationKey, {
            gamesPlayed: [],
            totalGoalsFor: 0,
            totalGoalsAgainst: 0,
            wins: 0,
            positions: new Set(),
            opponents: new Map()
          });
        }

        const combData = combinationMap.get(combinationKey)!;
        combData.gamesPlayed.push(game);
        combData.totalGoalsFor += gameGoalsFor;
        combData.totalGoalsAgainst += gameGoalsAgainst;
        if (gameWon) combData.wins++;

        // Track positions played by this combination
        combination.forEach(playerId => {
          const playerPositions = gameRosters
            .filter(r => r.playerId === playerId)
            .map(r => r.position);
          playerPositions.forEach(pos => combData.positions.add(pos));
        });

        // Track opponent-specific performance - determine which team is the opponent
        let opponent = null;
        const isHomeGame = game.homeClubId === currentClubId;
        const isAwayGame = game.awayClubId === currentClubId;

        if (isHomeGame && !isAwayGame) {
          // We are home team, opponent is away team
          opponent = game.awayTeamName;
        } else if (isAwayGame && !isHomeGame) {
          // We are away team, opponent is home team  
          opponent = game.homeTeamName;
        }
        // Skip intra-club games (both teams from same club)
        if (opponent && opponent !== 'Bye') {
          if (!combData.opponents.has(opponent)) {
            combData.opponents.set(opponent, []);
          }
          combData.opponents.get(opponent)!.push({
            game,
            goalsFor: gameGoalsFor,
            goalsAgainst: gameGoalsAgainst,
            won: gameWon
          });
        }
      });
    });

    // Convert to results arrays
    const generalResults: CombinationResult[] = [];
    const teamSpecificResults: TeamSpecificResult[] = [];

    combinationMap.forEach((data, combinationKey) => {
      const playerIds = combinationKey.split('-').map(Number);
      const playerNames = playerIds.map(id => {
        const player = players.find(p => p.id === id);
        return player ? player.displayName : `Player ${id}`;
      });

      const baseResult = {
        combination: combinationKey.split('-'),
        playerNames,
        gamesPlayed: data.gamesPlayed.length,
        totalGoalsFor: data.totalGoalsFor,
        totalGoalsAgainst: data.totalGoalsAgainst,
        goalDifferential: data.totalGoalsFor - data.totalGoalsAgainst,
        averageGoalsFor: data.totalGoalsFor / data.gamesPlayed.length,
        averageGoalsAgainst: data.totalGoalsAgainst / data.gamesPlayed.length,
        winRate: (data.wins / data.gamesPlayed.length) * 100,
        effectiveness: ((data.totalGoalsFor - data.totalGoalsAgainst) / data.gamesPlayed.length) + 
                      ((data.wins / data.gamesPlayed.length) * 10), // Weighted effectiveness score
        positions: Array.from(data.positions)
      };

      // Only include combinations with significant sample size
      if (data.gamesPlayed.length >= 2) {
        generalResults.push(baseResult);
      }

      // Generate team-specific results
      data.opponents.forEach((opponentGames, opponent) => {
        if (opponentGames.length >= 1) { // At least 1 game vs specific opponent
          const opponentGoalsFor = opponentGames.reduce((sum, g) => sum + g.goalsFor, 0);
          const opponentGoalsAgainst = opponentGames.reduce((sum, g) => sum + g.goalsAgainst, 0);
          const opponentWins = opponentGames.filter(g => g.won).length;

          teamSpecificResults.push({
            ...baseResult,
            opponent,
            opponentGames: opponentGames.length,
            totalGoalsFor: opponentGoalsFor,
            totalGoalsAgainst: opponentGoalsAgainst,
            goalDifferential: opponentGoalsFor - opponentGoalsAgainst,
            averageGoalsFor: opponentGoalsFor / opponentGames.length,
            averageGoalsAgainst: opponentGoalsAgainst / opponentGames.length,
            winRate: (opponentWins / opponentGames.length) * 100,
            effectiveness: ((opponentGoalsFor - opponentGoalsAgainst) / opponentGames.length) + 
                          ((opponentWins / opponentGames.length) * 10)
          });
        }
      });
    });

    // Sort by effectiveness
    generalResults.sort((a, b) => b.effectiveness - a.effectiveness);
    teamSpecificResults.sort((a, b) => b.effectiveness - a.effectiveness);

    setGeneralCombinations(generalResults.slice(0, 20)); // Top 20
    setTeamSpecificCombinations(teamSpecificResults.slice(0, 30)); // Top 30
  };

  const filteredTeamSpecific = selectedOpponent === 'all' 
    ? teamSpecificCombinations 
    : teamSpecificCombinations.filter(combo => combo.opponent === selectedOpponent);

  const getEffectivenessColor = (effectiveness: number) => {
    if (effectiveness >= 8) return 'text-green-600 bg-green-100';
    if (effectiveness >= 5) return 'text-blue-600 bg-blue-100';
    if (effectiveness >= 2) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getEffectivenessIcon = (effectiveness: number) => {
    if (effectiveness >= 8) return <TrendingUp className="h-4 w-4" />;
    if (effectiveness >= 2) return <Target className="h-4 w-4" />;
    return <TrendingDown className="h-4 w-4" />;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Player Combination Analysis
        </CardTitle>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Combination Size:</label>
            <Select value={combinationSize.toString()} onValueChange={(value) => setCombinationSize(parseInt(value))}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="5">5</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Filter Positions:</label>
            <Select value={selectedPositions.length > 0 ? selectedPositions.join(',') : 'all'} onValueChange={(value) => setSelectedPositions(value === 'all' ? [] : value.split(','))}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                <SelectItem value="GS,GA">Attack</SelectItem>
                <SelectItem value="WA,C,WD">Midcourt</SelectItem>
                <SelectItem value="GD,GK">Defense</SelectItem>
                {positions.map(pos => (
                  <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">General Effectiveness</TabsTrigger>
            <TabsTrigger value="team-specific">Vs Specific Teams</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Showing the most effective player combinations based on goal differential and win rate.
            </div>

            {generalCombinations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No combinations found with sufficient data.</p>
                <p className="text-sm">Try adjusting the combination size or position filters.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {generalCombinations.map((combo, index) => (
                  <Card key={combo.combination.join('-')} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-sm">
                            #{index + 1}
                          </Badge>
                          <h4 className="font-semibold text-lg">
                            {combo.playerNames.join(' + ')}
                          </h4>
                          <Badge className={getEffectivenessColor(combo.effectiveness)}>
                            {getEffectivenessIcon(combo.effectiveness)}
                            {combo.effectiveness.toFixed(1)}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <div className="font-medium text-gray-600">Games Played</div>
                            <div className="text-lg font-semibold">{combo.gamesPlayed}</div>
                          </div>
                          <div>
                            <div className="font-medium text-gray-600">Win Rate</div>
                            <div className="text-lg font-semibold">{combo.winRate.toFixed(1)}%</div>
                          </div>
                          <div>
                            <div className="font-medium text-gray-600">Avg Goals For</div>
                            <div className="text-lg font-semibold text-green-600">{combo.averageGoalsFor.toFixed(1)}</div>
                          </div>
                          <div>
                            <div className="font-medium text-gray-600">Goal Diff/Game</div>
                            <div className={`text-lg font-semibold ${combo.goalDifferential >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {combo.goalDifferential >= 0 ? '+' : ''}{(combo.goalDifferential / combo.gamesPlayed).toFixed(1)}
                            </div>
                          </div>
                        </div>

                        <div className="mt-2">
                          <div className="text-xs text-gray-500">
                            Positions: {combo.positions.join(', ')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="team-specific" className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Opponent:</label>
                <Select value={selectedOpponent} onValueChange={setSelectedOpponent}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Opponents</SelectItem>
                    {opponents.map(opponent => (
                      <SelectItem key={opponent} value={opponent}>{opponent}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {filteredTeamSpecific.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No team-specific combinations found.</p>
                <p className="text-sm">Try selecting a different opponent or adjusting filters.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTeamSpecific.map((combo, index) => (
                  <Card key={`${combo.combination.join('-')}-${combo.opponent}`} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-sm">
                            #{index + 1}
                          </Badge>
                          <h4 className="font-semibold text-lg">
                            {combo.playerNames.join(' + ')}
                          </h4>
                          <Badge variant="secondary" className="text-sm">
                            vs {combo.opponent}
                          </Badge>
                          <Badge className={getEffectivenessColor(combo.effectiveness)}>
                            {getEffectivenessIcon(combo.effectiveness)}
                            {combo.effectiveness.toFixed(1)}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                          <div>
                            <div className="font-medium text-gray-600">Games vs Opponent</div>
                            <div className="text-lg font-semibold">{combo.opponentGames}</div>
                          </div>
                          <div>
                            <div className="font-medium text-gray-600">Win Rate</div>
                            <div className="text-lg font-semibold">{combo.winRate.toFixed(1)}%</div>
                          </div>
                          <div>
                            <div className="font-medium text-gray-600">Avg Goals For</div>
                            <div className="text-lg font-semibold text-green-600">{combo.averageGoalsFor.toFixed(1)}</div>
                          </div>
                          <div>
                            <div className="font-medium text-gray-600">Avg Goals Against</div>
                            <div className="text-lg font-semibold text-red-600">{combo.averageGoalsAgainst.toFixed(1)}</div>
                          </div>
                          <div>
                            <div className="font-medium text-gray-600">Goal Diff/Game</div>
                            <div className={`text-lg font-semibold ${combo.goalDifferential >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {combo.goalDifferential >= 0 ? '+' : ''}{(combo.goalDifferential / combo.opponentGames).toFixed(1)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}


export default PlayerCombinationAnalysis;