import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Target, Users, Zap, Trophy } from 'lucide-react';
import CourtDisplay from '@/components/ui/court-display';

interface TeamPositionAnalysisProps {
  games: any[];
  players: any[];
  centralizedStats: Record<number, any[]>;
  centralizedRosters: Record<number, any[]>;
  currentClubId?: number;
}

interface PositionLineup {
  formation: Record<string, string>; // position -> player name
  formationKey: string; // GK:Player1,GD:Player2,etc
  gamesPlayed: number;
  totalGoalsFor: number;
  totalGoalsAgainst: number;
  goalDifferential: number;
  averageGoalsFor: number;
  averageGoalsAgainst: number;
  winRate: number;
  effectiveness: number;
  quarters: number[];
}

interface OpponentSpecificLineup extends PositionLineup {
  opponent: string;
  opponentGames: number;
}

function TeamPositionAnalysis({ 
  games = [], 
  players = [], 
  centralizedStats = {}, 
  centralizedRosters = {},
  currentClubId 
}: TeamPositionAnalysisProps) {
  const [selectedOpponent, setSelectedOpponent] = useState<string>('all');
  const [selectedQuarter, setSelectedQuarter] = useState<string>('all');
  const [generalLineups, setGeneralLineups] = useState<PositionLineup[]>([]);
  const [opponentSpecificLineups, setOpponentSpecificLineups] = useState<OpponentSpecificLineup[]>([]);
  const [opponents, setOpponents] = useState<string[]>([]);

  const positions = ['GK', 'GD', 'WD', 'C', 'WA', 'GA', 'GS'];

  // Get unique opponents from games
  useEffect(() => {
    // Ensure games is an array before processing
    if (!Array.isArray(games)) {
      setOpponents([]);
      return;
    }

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
          return null;
        })
        .filter(Boolean)
        .filter(teamName => teamName !== 'Bye')
    ));
    setOpponents(uniqueOpponents);
  }, [games, currentClubId]);

  // Calculate position lineup effectiveness
  useEffect(() => {
    console.log('TeamPositionAnalysis: useEffect triggered with:', {
      statsKeys: Object.keys(centralizedStats || {}),
      rostersKeys: Object.keys(centralizedRosters || {}),
      gamesLength: games?.length,
      selectedQuarter,
      currentClubId
    });

    // Debug roster data structure
    if (centralizedRosters && Object.keys(centralizedRosters).length > 0) {
      const sampleGameId = Object.keys(centralizedRosters)[0];
      const sampleRoster = centralizedRosters[sampleGameId];
      console.log('TeamPositionAnalysis: Sample roster data structure:', {
        gameId: sampleGameId,
        rosterLength: sampleRoster?.length || 0,
        firstFewEntries: sampleRoster?.slice(0, 3),
        allPositions: sampleRoster?.map(r => r.position).filter((pos, idx, arr) => arr.indexOf(pos) === idx)
      });
    } else {
      console.log('TeamPositionAnalysis: No roster data available - this is the root cause');
    }

    if (!centralizedStats || !centralizedRosters || Object.keys(centralizedStats).length === 0 || Object.keys(centralizedRosters).length === 0) {
      console.log('TeamPositionAnalysis: Missing required data - skipping calculation', {
        hasStats: !!centralizedStats && Object.keys(centralizedStats).length > 0,
        hasRosters: !!centralizedRosters && Object.keys(centralizedRosters).length > 0,
        statsKeys: Object.keys(centralizedStats || {}),
        rostersKeys: Object.keys(centralizedRosters || {})
      });
      return;
    }

    calculatePositionLineups();
  }, [centralizedStats, centralizedRosters, selectedQuarter, currentClubId]);

  const calculatePositionLineups = () => {
    // Ensure games is an array before processing
    if (!Array.isArray(games)) {
      setGeneralLineups([]);
      setOpponentSpecificLineups([]);
      return;
    }

    const completedGames = games.filter(game => 
      game.statusIsCompleted && 
      game.statusAllowsStatistics &&
      centralizedStats[game.id] &&
      centralizedRosters[game.id]
    );

    console.log('TeamPositionAnalysis: Processing games:', games.map(g => ({ 
      id: g.id, 
      completed: g.statusIsCompleted, 
      allowsStats: g.statusAllowsStatistics,
      hasStats: !!centralizedStats[g.id],
      hasRosters: !!centralizedRosters[g.id],
      included: completedGames.some(cg => cg.id === g.id)
    })));

    // Map to track different position lineups and their performance
    const lineupMap = new Map<string, {
      formation: Record<string, string>;
      gamesPlayed: any[];
      quarters: number[];
      totalGoalsFor: number;
      totalGoalsAgainst: number;
      wins: number;
      opponents: Map<string, any[]>;
    }>();

    completedGames.forEach(game => {
      const gameStats = centralizedStats[game.id] || [];
      const gameRosters = centralizedRosters[game.id] || [];

      if (gameStats.length === 0 || gameRosters.length === 0) return;

      // Group by quarter to analyze quarter-specific lineups
      const quarterData = new Map<number, {
        roster: any[];
        stats: any[];
      }>();

      gameRosters.forEach(roster => {
        if (!quarterData.has(roster.quarter)) {
          quarterData.set(roster.quarter, { roster: [], stats: [] });
        }
        quarterData.get(roster.quarter)!.roster.push(roster);
      });

      gameStats.forEach(stat => {
        if (quarterData.has(stat.quarter)) {
          quarterData.get(stat.quarter)!.stats.push(stat);
        }
      });

      // Filter by selected quarter if specified
      const quartersToAnalyze = selectedQuarter === 'all' 
        ? Array.from(quarterData.keys()) 
        : [parseInt(selectedQuarter)];

      quartersToAnalyze.forEach(quarter => {
        if (!quarterData.has(quarter)) return;

        const quarterInfo = quarterData.get(quarter)!;
        const quarterRoster = quarterInfo.roster;
        const quarterStats = quarterInfo.stats;

        // Build position lineup for this quarter
        const positionLineup: Record<string, string> = {};

        positions.forEach(position => {
          const playerInPosition = quarterRoster.find(r => r.position === position);
          if (playerInPosition) {
            const player = players.find(p => p.id === playerInPosition.playerId);
            positionLineup[position] = player ? player.displayName : `Player ${playerInPosition.playerId}`;
          }
        });

        console.log(`Game ${game.id}, Quarter ${quarter}: Raw quarter roster data:`, quarterRoster);
        console.log(`Game ${game.id}, Quarter ${quarter}: Found ${Object.keys(positionLineup).length}/7 positions`, positionLineup);
        console.log(`Game ${game.id}, Quarter ${quarter}: Roster entries for this quarter:`, quarterRoster);
        console.log(`Game ${game.id}, Quarter ${quarter}: Players lookup:`, quarterRoster.map(r => {
          const player = players.find(p => p.id === r.playerId);
          return { position: r.position, playerId: r.playerId, playerFound: !!player, playerName: player?.displayName };
        }));
        
        // Debug the roster structure
        console.log(`Game ${game.id}, Quarter ${quarter}: All game rosters structure:`, centralizedRosters[game.id]);
        
        // Debug missing positions for Dingoes
        if (Object.keys(positionLineup).length < 7) {
          const missingPositions = positions.filter(pos => !positionLineup[pos]);
          console.log(`Game ${game.id}, Quarter ${quarter}: Missing positions:`, missingPositions);
          console.log(`Game ${game.id}, Quarter ${quarter}: Available roster entries:`, quarterRoster.map(r => ({ position: r.position, playerId: r.playerId })));
        }

        // Only analyze complete lineups (all 7 positions filled)
        if (Object.keys(positionLineup).length === 7) {
          // Create a consistent key for this lineup
          const lineupKey = positions
            .map(pos => `${pos}:${positionLineup[pos]}`)
            .join(',');

          if (!lineupMap.has(lineupKey)) {
            lineupMap.set(lineupKey, {
              formation: positionLineup,
              gamesPlayed: [],
              quarters: [],
              totalGoalsFor: 0,
              totalGoalsAgainst: 0,
              wins: 0,
              opponents: new Map()
            });
          }

          const lineupData = lineupMap.get(lineupKey)!;

          // Calculate quarter performance
          const quarterGoalsFor = quarterStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
          const quarterGoalsAgainst = quarterStats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);

          lineupData.totalGoalsFor += quarterGoalsFor;
          lineupData.totalGoalsAgainst += quarterGoalsAgainst;
          lineupData.quarters.push(quarter);

          // Track game-level data for unique game counting
          if (!lineupData.gamesPlayed.some(g => g.id === game.id)) {
            lineupData.gamesPlayed.push(game);

            // Calculate game result for win tracking
            const gameGoalsFor = gameStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
            const gameGoalsAgainst = gameStats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);
            if (gameGoalsFor > gameGoalsAgainst) {
              lineupData.wins++;
            }
          }

          // Track opponent-specific performance
          let opponent = null;
          const isHomeGame = game.homeClubId === currentClubId;
          const isAwayGame = game.awayClubId === currentClubId;

          if (isHomeGame && !isAwayGame) {
            opponent = game.awayTeamName;
          } else if (isAwayGame && !isHomeGame) {
            opponent = game.homeTeamName;
          }

          if (opponent && opponent !== 'Bye') {
            if (!lineupData.opponents.has(opponent)) {
              lineupData.opponents.set(opponent, []);
            }
            lineupData.opponents.get(opponent)!.push({
              game,
              quarter,
              goalsFor: quarterGoalsFor,
              goalsAgainst: quarterGoalsAgainst,
              won: quarterGoalsFor > quarterGoalsAgainst
            });
          }
        }
      });
    });

    // Convert to result arrays
    const generalResults: PositionLineup[] = [];
    const opponentSpecificResults: OpponentSpecificLineup[] = [];

    console.log(`Total lineups before filtering: ${lineupMap.size}`);
    
    lineupMap.forEach((data, lineupKey) => {
      const quartersPlayed = data.quarters.length;
      console.log(`Lineup ${lineupKey.substring(0, 50)}... has ${quartersPlayed} quarters`);

      // Use adaptive minimum sample size - 1 for specific quarters, 2 for all quarters
      const minSampleSize = selectedQuarter === 'all' ? 2 : 1;
      
      if (quartersPlayed >= minSampleSize) {
        const baseResult: PositionLineup = {
          formation: data.formation,
          formationKey: lineupKey,
          gamesPlayed: data.gamesPlayed.length,
          totalGoalsFor: data.totalGoalsFor,
          totalGoalsAgainst: data.totalGoalsAgainst,
          goalDifferential: data.totalGoalsFor - data.totalGoalsAgainst,
          averageGoalsFor: data.totalGoalsFor / quartersPlayed,
          averageGoalsAgainst: data.totalGoalsAgainst / quartersPlayed,
          winRate: (data.wins / data.gamesPlayed.length) * 100,
          effectiveness: ((data.totalGoalsFor - data.totalGoalsAgainst) / quartersPlayed) + 
                        ((data.wins / data.gamesPlayed.length) * 5), // Weighted effectiveness
          quarters: data.quarters
        };

        generalResults.push(baseResult);

        // Generate opponent-specific results
        data.opponents.forEach((opponentQuarters, opponent) => {
          if (opponentQuarters.length >= 1) {
            const opponentGoalsFor = opponentQuarters.reduce((sum, q) => sum + q.goalsFor, 0);
            const opponentGoalsAgainst = opponentQuarters.reduce((sum, q) => sum + q.goalsAgainst, 0);
            const opponentWins = opponentQuarters.filter(q => q.won).length;
            const opponentGames = new Set(opponentQuarters.map(q => q.game.id)).size;

            opponentSpecificResults.push({
              ...baseResult,
              opponent,
              opponentGames,
              totalGoalsFor: opponentGoalsFor,
              totalGoalsAgainst: opponentGoalsAgainst,
              goalDifferential: opponentGoalsFor - opponentGoalsAgainst,
              averageGoalsFor: opponentGoalsFor / opponentQuarters.length,
              averageGoalsAgainst: opponentGoalsAgainst / opponentQuarters.length,
              winRate: opponentGames > 0 ? (opponentWins / opponentGames) * 100 : 0,
              effectiveness: ((opponentGoalsFor - opponentGoalsAgainst) / opponentQuarters.length) + 
                            (opponentGames > 0 ? (opponentWins / opponentGames) * 5 : 0)
            });
          }
        });
      }
    });

    // Sort by effectiveness
    generalResults.sort((a, b) => b.effectiveness - a.effectiveness);
    opponentSpecificResults.sort((a, b) => b.effectiveness - a.effectiveness);

    setGeneralLineups(generalResults.slice(0, 15)); // Top 15
    setOpponentSpecificLineups(opponentSpecificResults.slice(0, 20)); // Top 20

    // Extract all unique opponents from the lineup data
    const allOpponents = new Set<string>();
    lineupMap.forEach((data) => {
      data.opponents.forEach((opponentData, opponentName) => {
        if (opponentName && opponentName !== 'Bye') {
          allOpponents.add(opponentName);
        }
      });
    });

    const sortedOpponents = Array.from(allOpponents).sort();
    console.log('Setting opponents dropdown to:', sortedOpponents);
    setOpponents(sortedOpponents);
  };

  const filteredOpponentSpecific = selectedOpponent === 'all' 
    ? opponentSpecificLineups 
    : opponentSpecificLineups.filter(lineup => lineup.opponent === selectedOpponent);

  const getEffectivenessColor = (effectiveness: number) => {
    if (effectiveness >= 5) return 'text-green-600 bg-green-100';
    if (effectiveness >= 2) return 'text-blue-600 bg-blue-100';
    if (effectiveness >= 0) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getEffectivenessIcon = (effectiveness: number) => {
    if (effectiveness >= 5) return <TrendingUp className="h-4 w-4" />;
    if (effectiveness >= 0) return <Target className="h-4 w-4" />;
    return <TrendingDown className="h-4 w-4" />;
  };

  const formatFormationForCourt = (formation: Record<string, string>) => {
      const roster = Object.entries(formation).map(([position, playerName]) => {
          const player = players.find(p => p.displayName === playerName);
          return {
              quarter: 1, // Assuming quarter 1 for all players in the formation
              position: position,
              playerId: player ? player.id : null, // Use player ID if available
              playerName: playerName,
          };
      });
      return roster;
  };

  const formatPlayersForCourt = (formation: Record<string, string>) => {
    const courtPlayers: Record<string, any> = {};
    Object.keys(formation).forEach(position => {
      const playerName = formation[position];
      const player = players.find(p => p.displayName === playerName);
      if (player) {
        courtPlayers[playerName] = player;
      }
    });
    return courtPlayers;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Team Position Effectiveness Analysis
        </CardTitle>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Quarter:</label>
            <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="1">Q1</SelectItem>
                <SelectItem value="2">Q2</SelectItem>
                <SelectItem value="3">Q3</SelectItem>
                <SelectItem value="4">Q4</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">Most Effective Lineups</TabsTrigger>
            <TabsTrigger value="opponent-specific">Vs Specific Opponents</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Showing the most effective 7-player position lineups based on goals scored and win rate.
            </div>

            {generalLineups.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No complete lineups found with sufficient data.</p>
                <p className="text-sm">Complete lineups require all 7 positions to be filled.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {generalLineups.map((lineup, index) => (
                  <Card key={lineup.formationKey} className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-sm">
                          #{index + 1}
                        </Badge>
                        <Badge className={getEffectivenessColor(lineup.effectiveness)}>
                          {getEffectivenessIcon(lineup.effectiveness)}
                          {lineup.effectiveness.toFixed(1)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-4 gap-3 text-sm">
                        <div className="text-center">
                          <div className="font-medium text-gray-600">Quarters</div>
                          <div className="text-lg font-semibold">{lineup.quarters.length}</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-gray-600">Win Rate</div>
                          <div className="text-lg font-semibold">{lineup.winRate.toFixed(1)}%</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-gray-600">Avg Goals/Q</div>
                          <div className="text-lg font-semibold text-green-600">{lineup.averageGoalsFor.toFixed(1)}</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-gray-600">Goal Diff/Q</div>
                          <div className={`text-lg font-semibold ${lineup.goalDifferential >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {lineup.goalDifferential >= 0 ? '+' : ''}{(lineup.goalDifferential / lineup.quarters.length).toFixed(1)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <CourtDisplay
                        roster={formatFormationForCourt(lineup.formation)}
                        players={players}
                        quarter={1}
                        layout="horizontal"
                        showPositionLabels={true}
                        className="max-w-4xl"
                      />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="opponent-specific" className="space-y-4">
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

            {filteredOpponentSpecific.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No opponent-specific lineups found.</p>
                <p className="text-sm">Try selecting a different opponent or adjusting filters.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOpponentSpecific.map((lineup, index) => (
                  <Card key={`${lineup.formationKey}-${lineup.opponent}`} className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-sm">
                          #{index + 1}
                        </Badge>
                        <Badge variant="secondary" className="text-sm">
                          vs {lineup.opponent}
                        </Badge>
                        <Badge className={getEffectivenessColor(lineup.effectiveness)}>
                          {getEffectivenessIcon(lineup.effectiveness)}
                          {lineup.effectiveness.toFixed(1)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-5 gap-3 text-sm">
                        <div className="text-center">
                          <div className="font-medium text-gray-600">Quarters</div>
                          <div className="text-lg font-semibold">{lineup.quarters.length}</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-gray-600">Games</div>
                          <div className="text-lg font-semibold">{lineup.opponentGames}</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-gray-600">Win Rate</div>
                          <div className="text-lg font-semibold">{lineup.winRate.toFixed(1)}%</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-gray-600">Avg Goals/Q</div>
                          <div className="text-lg font-semibold text-green-600">{lineup.averageGoalsFor.toFixed(1)}</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-gray-600">Goal Diff/Q</div>
                          <div className={`text-lg font-semibold ${lineup.goalDifferential >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {lineup.goalDifferential >= 0 ? '+' : ''}{(lineup.goalDifferential / lineup.quarters.length).toFixed(1)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <CourtDisplay
                        roster={formatFormationForCourt(lineup.formation)}
                        players={players}
                        quarter={1}
                        layout="horizontal"
                        showPositionLabels={true}
                        className="max-w-4xl"
                      />
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

export default TeamPositionAnalysis;