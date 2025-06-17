
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Target, Calendar, Users } from 'lucide-react';
import { CourtDisplay } from '@/components/ui/court-display';
import { useLocation } from 'wouter';

interface UpcomingGameRecommendationsProps {
  games: any[];
  players: any[];
  centralizedStats: Record<number, any[]>;
  centralizedRosters: Record<number, any[]>;
  currentClubId?: number;
}

interface GameRecommendation {
  game: any;
  opponent: string;
  recommendedLineups: {
    formation: Record<string, string>;
    effectiveness: number;
    winRate: number;
    averageGoalsFor: number;
    averageGoalsAgainst: number;
    gamesPlayed: number;
  }[];
  historicalRecord: {
    wins: number;
    losses: number;
    draws: number;
    totalGames: number;
    winRate: number;
  };
}

export function UpcomingGameRecommendations({ 
  games, 
  players, 
  centralizedStats, 
  centralizedRosters,
  currentClubId 
}: UpcomingGameRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<GameRecommendation[]>([]);
  const [, navigate] = useLocation();

  useEffect(() => {
    calculateRecommendations();
  }, [games, centralizedStats, centralizedRosters, currentClubId]);

  const calculateRecommendations = () => {
    // Get upcoming games against teams we've played before
    const upcomingGames = games.filter(game => 
      !game.statusIsCompleted && 
      new Date(game.date) > new Date()
    );

    const completedGames = games.filter(game => 
      game.statusIsCompleted && 
      game.statusAllowsStatistics &&
      centralizedStats[game.id] &&
      centralizedRosters[game.id]
    );

    const gameRecommendations: GameRecommendation[] = [];

    upcomingGames.forEach(upcomingGame => {
      // Determine opponent
      let opponent = null;
      const isHomeGame = upcomingGame.homeClubId === currentClubId;
      const isAwayGame = upcomingGame.awayClubId === currentClubId;

      if (isHomeGame && !isAwayGame) {
        opponent = upcomingGame.awayTeamName;
      } else if (isAwayGame && !isHomeGame) {
        opponent = upcomingGame.homeTeamName;
      }

      if (!opponent || opponent === 'Bye') return;

      // Find historical games against this opponent
      const historicalGames = completedGames.filter(game => {
        const gameIsHome = game.homeClubId === currentClubId;
        const gameIsAway = game.awayClubId === currentClubId;
        
        if (gameIsHome && !gameIsAway) {
          return game.awayTeamName === opponent;
        } else if (gameIsAway && !gameIsHome) {
          return game.homeTeamName === opponent;
        }
        return false;
      });

      if (historicalGames.length === 0) return;

      // Calculate historical record
      let wins = 0, losses = 0, draws = 0;
      
      historicalGames.forEach(game => {
        const gameStats = centralizedStats[game.id] || [];
        const ourScore = gameStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
        const theirScore = gameStats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);
        
        if (ourScore > theirScore) wins++;
        else if (ourScore < theirScore) losses++;
        else draws++;
      });

      // Analyze effective lineups against this opponent
      const lineupMap = new Map();
      
      historicalGames.forEach(game => {
        const gameStats = centralizedStats[game.id] || [];
        const gameRosters = centralizedRosters[game.id] || [];
        
        // Group by quarter
        const quarterData = new Map();
        gameRosters.forEach(roster => {
          if (!quarterData.has(roster.quarter)) {
            quarterData.set(roster.quarter, { roster: [], stats: [] });
          }
          quarterData.get(roster.quarter).roster.push(roster);
        });
        
        gameStats.forEach(stat => {
          if (quarterData.has(stat.quarter)) {
            quarterData.get(stat.quarter).stats.push(stat);
          }
        });

        // Analyze each quarter
        quarterData.forEach((data, quarter) => {
          const positions = ['GK', 'GD', 'WD', 'C', 'WA', 'GA', 'GS'];
          const positionLineup = {};
          
          positions.forEach(position => {
            const playerInPosition = data.roster.find(r => r.position === position);
            if (playerInPosition) {
              const player = players.find(p => p.id === playerInPosition.playerId);
              positionLineup[position] = player ? player.displayName : `Player ${playerInPosition.playerId}`;
            }
          });

          if (Object.keys(positionLineup).length === 7) {
            const lineupKey = positions.map(pos => `${pos}:${positionLineup[pos]}`).join(',');
            
            if (!lineupMap.has(lineupKey)) {
              lineupMap.set(lineupKey, {
                formation: positionLineup,
                quarters: [],
                totalGoalsFor: 0,
                totalGoalsAgainst: 0,
                gamesPlayed: new Set()
              });
            }

            const lineupData = lineupMap.get(lineupKey);
            const quarterGoalsFor = data.stats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
            const quarterGoalsAgainst = data.stats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);
            
            lineupData.quarters.push(quarter);
            lineupData.totalGoalsFor += quarterGoalsFor;
            lineupData.totalGoalsAgainst += quarterGoalsAgainst;
            lineupData.gamesPlayed.add(game.id);
          }
        });
      });

      // Convert to recommendations
      const recommendedLineups = [];
      lineupMap.forEach((data, lineupKey) => {
        if (data.quarters.length >= 1) {
          const avgGoalsFor = data.totalGoalsFor / data.quarters.length;
          const avgGoalsAgainst = data.totalGoalsAgainst / data.quarters.length;
          const goalDiff = avgGoalsFor - avgGoalsAgainst;
          
          // Calculate win rate for games this lineup was used
          let lineupWins = 0;
          data.gamesPlayed.forEach(gameId => {
            const gameStats = centralizedStats[gameId] || [];
            const ourScore = gameStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
            const theirScore = gameStats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);
            if (ourScore > theirScore) lineupWins++;
          });
          
          const winRate = (lineupWins / data.gamesPlayed.size) * 100;
          const effectiveness = goalDiff + (winRate / 10);

          recommendedLineups.push({
            formation: data.formation,
            effectiveness,
            winRate,
            averageGoalsFor: avgGoalsFor,
            averageGoalsAgainst: avgGoalsAgainst,
            gamesPlayed: data.gamesPlayed.size
          });
        }
      });

      recommendedLineups.sort((a, b) => b.effectiveness - a.effectiveness);

      gameRecommendations.push({
        game: upcomingGame,
        opponent,
        recommendedLineups: recommendedLineups.slice(0, 3), // Top 3 lineups
        historicalRecord: {
          wins,
          losses,
          draws,
          totalGames: historicalGames.length,
          winRate: (wins / historicalGames.length) * 100
        }
      });
    });

    setRecommendations(gameRecommendations);
  };

  const formatFormationForCourt = (formation: Record<string, string>) => {
    return Object.entries(formation).map(([position, playerName]) => {
      const player = players.find(p => p.displayName === playerName);
      return {
        quarter: 1,
        position: position,
        playerId: player ? player.id : null,
        playerName: playerName,
      };
    });
  };

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Game Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">
            No upcoming games against previously faced opponents
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {recommendations.map((rec, index) => (
        <Card key={rec.game.id} className="border-2 border-blue-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                vs {rec.opponent}
              </CardTitle>
              <Badge variant="outline" className="text-sm">
                {new Date(rec.game.date).toLocaleDateString()}
              </Badge>
            </div>
            
            {/* Historical Record */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Historical Record:</span>
                <div className="flex items-center gap-4 text-sm">
                  <span>{rec.historicalRecord.wins}W-{rec.historicalRecord.losses}L-{rec.historicalRecord.draws}D</span>
                  <Badge className={rec.historicalRecord.winRate >= 50 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {rec.historicalRecord.winRate.toFixed(0)}% Win Rate
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Target className="h-4 w-4" />
              Recommended Lineups
            </h4>
            
            {rec.recommendedLineups.map((lineup, lineupIndex) => (
              <div key={lineupIndex} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <Badge className="bg-blue-100 text-blue-800">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    #{lineupIndex + 1} Effectiveness: {lineup.effectiveness.toFixed(1)}
                  </Badge>
                  
                  <div className="flex gap-4 text-sm">
                    <span className="font-medium">Win Rate: {lineup.winRate.toFixed(0)}%</span>
                    <span>Avg Goals: {lineup.averageGoalsFor.toFixed(1)}</span>
                    <span>Used in {lineup.gamesPlayed} games</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <CourtDisplay
                    roster={formatFormationForCourt(lineup.formation)}
                    players={players}
                    quarter={1}
                    layout="horizontal"
                    showPositionLabels={true}
                    className="max-w-4xl"
                  />
                </div>
              </div>
            ))}

            <div className="flex gap-2 pt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(`/game-details/${rec.game.id}`)}
              >
                View Game Details
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/team-analysis')}
              >
                Full Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default UpcomingGameRecommendations;
