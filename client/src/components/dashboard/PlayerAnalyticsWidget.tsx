
import { useState, useEffect } from 'react';
import { BaseWidget } from '@/components/ui/base-widget';
import { Game, Player, GameStat } from '@shared/schema';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { isGameValidForStatistics } from '@/lib/gameFilters';
import { PlayerBox } from '@/components/ui/player-box';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Target, Users, Award } from 'lucide-react';

interface PlayerAnalyticsWidgetProps {
  players: Player[];
  games: Game[];
  className?: string;
  centralizedStats?: Record<number, GameStat[]>;
  centralizedRosters?: Record<number, any[]>;
}

interface PlayerStats {
  playerId: number;
  quarters: number;
  games: number;
  goals: number;
  goalsAgainst: number;
  goalsRatio: number;
  avgGoalsPerGame: number;
  avgGoalsAgainstPerGame: number;
}

interface AwardWinner {
  gameId: number;
  playerId: number;
  playerName: string;
  round: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
}

export default function PlayerAnalyticsWidget({ 
  players, 
  games, 
  className, 
  centralizedStats,
  centralizedRosters 
}: PlayerAnalyticsWidgetProps) {
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);
  const [awardWinners, setAwardWinners] = useState<AwardWinner[]>([]);
  const [teamGoalsAnalysis, setTeamGoalsAnalysis] = useState({
    totalGames: 0,
    totalGoalsFor: 0,
    totalGoalsAgainst: 0,
    avgGoalsPerGame: 0,
    avgGoalsAgainstPerGame: 0,
    goalsDifferential: 0
  });

  // Process player statistics
  useEffect(() => {
    if (!players || !games || !centralizedStats || !centralizedRosters) return;

    const validGames = games.filter(isGameValidForStatistics);
    const newPlayerStats: Record<number, PlayerStats> = {};
    const newAwardWinners: AwardWinner[] = [];
    
    let totalGoalsFor = 0;
    let totalGoalsAgainst = 0;

    // Initialize player stats
    players.forEach(player => {
      newPlayerStats[player.id] = {
        playerId: player.id,
        quarters: 0,
        games: 0,
        goals: 0,
        goalsAgainst: 0,
        goalsRatio: 0,
        avgGoalsPerGame: 0,
        avgGoalsAgainstPerGame: 0
      };
    });

    // Process each valid game
    validGames.forEach(game => {
      const gameStats = centralizedStats[game.id] || [];
      const gameRosters = centralizedRosters[game.id] || [];
      
      // Track goals for team analysis
      gameStats.forEach(stat => {
        totalGoalsFor += stat.goalsFor || 0;
        totalGoalsAgainst += stat.goalsAgainst || 0;
      });

      // Track award winners
      if (game.awardWinnerId && players.find(p => p.id === game.awardWinnerId)) {
        const winner = players.find(p => p.id === game.awardWinnerId);
        if (winner) {
          newAwardWinners.push({
            gameId: game.id,
            playerId: game.awardWinnerId,
            playerName: winner.displayName,
            round: game.round || 'N/A',
            date: game.date,
            homeTeam: game.homeTeamName || 'Unknown',
            awayTeam: game.awayTeamName || 'Unknown'
          });
        }
      }

      // Track which players played in this game
      const playersInGame = new Set<number>();
      
      gameRosters.forEach(roster => {
        const playerId = roster.playerId;
        if (newPlayerStats[playerId]) {
          newPlayerStats[playerId].quarters++;
          playersInGame.add(playerId);
          
          // Find stats for this player's position/quarter
          const playerStat = gameStats.find(stat => 
            stat.position === roster.position && stat.quarter === roster.quarter
          );
          
          if (playerStat) {
            newPlayerStats[playerId].goals += playerStat.goalsFor || 0;
            newPlayerStats[playerId].goalsAgainst += playerStat.goalsAgainst || 0;
          }
        }
      });

      // Increment games count for players who played
      playersInGame.forEach(playerId => {
        newPlayerStats[playerId].games++;
      });
    });

    // Calculate ratios and averages
    Object.values(newPlayerStats).forEach(stats => {
      if (stats.games > 0) {
        stats.avgGoalsPerGame = stats.goals / stats.games;
        stats.avgGoalsAgainstPerGame = stats.goalsAgainst / stats.games;
        stats.goalsRatio = stats.goalsAgainst > 0 ? stats.goals / stats.goalsAgainst : stats.goals;
      }
    });

    // Sort by goals scored (descending)
    const sortedStats = Object.values(newPlayerStats)
      .filter(stats => stats.games > 0)
      .sort((a, b) => b.goals - a.goals);

    // Sort award winners by date (most recent first)
    const sortedAwards = newAwardWinners.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    setPlayerStats(sortedStats);
    setAwardWinners(sortedAwards);
    
    // Set team analysis
    setTeamGoalsAnalysis({
      totalGames: validGames.length,
      totalGoalsFor,
      totalGoalsAgainst,
      avgGoalsPerGame: validGames.length > 0 ? totalGoalsFor / validGames.length : 0,
      avgGoalsAgainstPerGame: validGames.length > 0 ? totalGoalsAgainst / validGames.length : 0,
      goalsDifferential: totalGoalsFor - totalGoalsAgainst
    });

  }, [players, games, centralizedStats, centralizedRosters]);

  const getPlayerName = (playerId: number) => {
    return players.find(p => p.id === playerId)?.displayName || 'Unknown';
  };

  const getRatioColor = (ratio: number) => {
    if (ratio >= 2) return 'text-green-600';
    if (ratio >= 1) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <BaseWidget 
      title="Player Analytics" 
      className={cn("col-span-full", className)}
      icon={<Target className="w-4 h-4" />}
    >
      <Tabs defaultValue="participation" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="participation" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Participation
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Goals Analysis
          </TabsTrigger>
          <TabsTrigger value="awards" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Awards
          </TabsTrigger>
        </TabsList>

        {/* Participation Tab */}
        <TabsContent value="participation" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Team Overview</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Games Played: <span className="font-semibold">{teamGoalsAnalysis.totalGames}</span></div>
                <div>Total Quarters: <span className="font-semibold">{playerStats.reduce((sum, p) => sum + p.quarters, 0)}</span></div>
                <div>Avg Goals/Game: <span className="font-semibold">{teamGoalsAnalysis.avgGoalsPerGame.toFixed(1)}</span></div>
                <div>Goals Differential: <span className={cn("font-semibold", teamGoalsAnalysis.goalsDifferential >= 0 ? "text-green-600" : "text-red-600")}>
                  {teamGoalsAnalysis.goalsDifferential > 0 ? '+' : ''}{teamGoalsAnalysis.goalsDifferential}
                </span></div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-2 font-semibold">Player</th>
                  <th className="text-center p-2 font-semibold">Games</th>
                  <th className="text-center p-2 font-semibold">Quarters</th>
                  <th className="text-center p-2 font-semibold">Quarters/Game</th>
                  <th className="text-center p-2 font-semibold">Goals</th>
                  <th className="text-center p-2 font-semibold">Goals Against</th>
                </tr>
              </thead>
              <tbody>
                {playerStats.map(stats => {
                  const player = players.find(p => p.id === stats.playerId);
                  if (!player) return null;
                  
                  return (
                    <tr key={stats.playerId} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: player.avatarColor || '#6B7280' }}
                          />
                          <span className="font-medium">{player.displayName}</span>
                        </div>
                      </td>
                      <td className="text-center p-2">{stats.games}</td>
                      <td className="text-center p-2">{stats.quarters}</td>
                      <td className="text-center p-2">{(stats.quarters / Math.max(stats.games, 1)).toFixed(1)}</td>
                      <td className="text-center p-2 font-semibold text-green-600">{stats.goals}</td>
                      <td className="text-center p-2 font-semibold text-red-600">{stats.goalsAgainst}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Goals Analysis Tab */}
        <TabsContent value="goals" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{teamGoalsAnalysis.totalGoalsFor}</div>
              <div className="text-sm text-green-700">Total Goals For</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">{teamGoalsAnalysis.totalGoalsAgainst}</div>
              <div className="text-sm text-red-700">Total Goals Against</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{teamGoalsAnalysis.avgGoalsPerGame.toFixed(1)}</div>
              <div className="text-sm text-blue-700">Avg Goals/Game</div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-2 font-semibold">Player</th>
                  <th className="text-center p-2 font-semibold">Goals</th>
                  <th className="text-center p-2 font-semibold">Goals Against</th>
                  <th className="text-center p-2 font-semibold">Ratio</th>
                  <th className="text-center p-2 font-semibold">Avg/Game</th>
                  <th className="text-center p-2 font-semibold">Games</th>
                </tr>
              </thead>
              <tbody>
                {playerStats.map(stats => {
                  const player = players.find(p => p.id === stats.playerId);
                  if (!player) return null;
                  
                  return (
                    <tr key={stats.playerId} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: player.avatarColor || '#6B7280' }}
                          />
                          <span className="font-medium">{player.displayName}</span>
                        </div>
                      </td>
                      <td className="text-center p-2 font-semibold text-green-600">{stats.goals}</td>
                      <td className="text-center p-2 font-semibold text-red-600">{stats.goalsAgainst}</td>
                      <td className={cn("text-center p-2 font-semibold", getRatioColor(stats.goalsRatio))}>
                        {stats.goalsRatio.toFixed(2)}
                      </td>
                      <td className="text-center p-2">{stats.avgGoalsPerGame.toFixed(1)}</td>
                      <td className="text-center p-2 text-gray-600">{stats.games}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Awards Tab */}
        <TabsContent value="awards" className="space-y-4">
          {awardWinners.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No award winners recorded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm text-gray-600 mb-4">
                Total Awards: <span className="font-semibold">{awardWinners.length}</span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-2 font-semibold">Player</th>
                      <th className="text-center p-2 font-semibold">Round</th>
                      <th className="text-left p-2 font-semibold">Game</th>
                      <th className="text-center p-2 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {awardWinners.map((award, index) => (
                      <tr key={`${award.gameId}-${award.playerId}`} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-yellow-500" />
                            <span className="font-medium">{award.playerName}</span>
                          </div>
                        </td>
                        <td className="text-center p-2">
                          <Badge variant="outline" className="text-xs">
                            Round {award.round}
                          </Badge>
                        </td>
                        <td className="p-2 text-sm">
                          {award.homeTeam} vs {award.awayTeam}
                        </td>
                        <td className="text-center p-2 text-gray-600">
                          {new Date(award.date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </BaseWidget>
  );
}
