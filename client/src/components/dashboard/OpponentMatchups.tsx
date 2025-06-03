
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { BaseWidget } from '@/components/ui/base-widget';
import { Badge } from '@/components/ui/badge';
import { Game } from '@shared/schema';
import { getWinLoseLabel, getWinLoseClass } from '@/lib/utils';
import { GameResult } from '@/lib/resultUtils';
import { ViewMoreButton } from '@/components/ui/view-more-button';
import { ResultBadge } from '@/components/ui/result-badge';
import { isGameValidForStatistics } from '@/lib/gameFilters';

interface TeamMatchup {
  teamId: number;
  teamName: string;
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
  recentForm: string[]; // Last 3 games: 'W', 'L', 'D'
  trend: 'improving' | 'declining' | 'stable';
}

interface TeamMatchupsProps {
  games: Game[];
  currentClubId: number;
  centralizedStats?: Record<number, any[]>;
  className?: string;
}

export default function TeamMatchups({ 
  games, 
  currentClubId,
  centralizedStats = {},
  className 
}: TeamMatchupsProps) {
  const [matchups, setMatchups] = useState<TeamMatchup[]>([]);
  const [, navigate] = useLocation();

  useEffect(() => {
    const calculateMatchups = () => {
      const teamMatchups: TeamMatchup[] = [];
      
      // Get all unique opposing teams from games
      const opposingTeams = new Map<number, { id: number; name: string; division?: string }>();
      
      games.forEach(game => {
        if (isGameValidForStatistics(game)) {
          // Determine which team is the opposing team
          let opposingTeamId: number | null = null;
          let opposingTeamName = '';
          
          // Check if we're home or away team
          if (game.homeTeamId && game.awayTeamId) {
            // Find which team belongs to current club
            const isHomeTeamOurs = game.homeTeamClubId === currentClubId;
            
            if (isHomeTeamOurs && game.awayTeamId) {
              opposingTeamId = game.awayTeamId;
              opposingTeamName = game.awayTeamName || `Team ${game.awayTeamId}`;
            } else if (!isHomeTeamOurs && game.homeTeamId) {
              opposingTeamId = game.homeTeamId;
              opposingTeamName = game.homeTeamName || `Team ${game.homeTeamId}`;
            }
            
            if (opposingTeamId && !opposingTeams.has(opposingTeamId)) {
              opposingTeams.set(opposingTeamId, {
                id: opposingTeamId,
                name: opposingTeamName,
                division: isHomeTeamOurs ? game.awayTeamDivision : game.homeTeamDivision
              });
            }
          }
        }
      });

      opposingTeams.forEach(team => {
        const teamGames = games.filter(game => {
          if (!isGameValidForStatistics(game)) return false;
          
          // Check if this game involves the opposing team
          const isHomeTeamOurs = game.homeTeamClubId === currentClubId;
          
          if (isHomeTeamOurs && game.awayTeamId === team.id) return true;
          if (!isHomeTeamOurs && game.homeTeamId === team.id) return true;
          
          return false;
        });

        if (teamGames.length === 0) return;

        let wins = 0;
        let losses = 0;
        let draws = 0;
        let totalScoreFor = 0;
        let totalScoreAgainst = 0;
        const recentResults: string[] = [];

        // Sort games by date for recent form calculation
        const sortedGames = [...teamGames].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        sortedGames.forEach((game, index) => {
          const gameStats = centralizedStats[game.id] || [];
          const isHomeTeamOurs = game.homeTeamClubId === currentClubId;

          // Calculate our team and opposing team scores from stats
          const ourScore = gameStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
          const opposingScore = gameStats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);

          totalScoreFor += ourScore;
          totalScoreAgainst += opposingScore;

          const result = getWinLoseLabel(ourScore, opposingScore);

          if (result === 'Win') wins++;
          else if (result === 'Loss') losses++;
          else draws++;

          // Track recent form (last 3 games)
          if (index < 3) {
            recentResults.push(result === 'Win' ? 'W' : result === 'Loss' ? 'L' : 'D');
          }
        });

        const totalGames = teamGames.length;
        const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
        const avgScoreFor = totalGames > 0 ? Math.round(totalScoreFor / totalGames) : 0;
        const avgScoreAgainst = totalGames > 0 ? Math.round(totalScoreAgainst / totalGames) : 0;
        const scoreDifferential = avgScoreFor - avgScoreAgainst;
        const goalsPercentage = totalScoreAgainst > 0 ? Math.round((totalScoreFor / totalScoreAgainst) * 100) : 0;

        // Determine trend based on recent form vs overall performance
        let trend: 'improving' | 'declining' | 'stable' = 'stable';
        if (recentResults.length >= 2) {
          const recentWins = recentResults.filter(r => r === 'W').length;
          const recentWinRate = (recentWins / recentResults.length) * 100;

          if (recentWinRate > winRate + 20) trend = 'improving';
          else if (recentWinRate < winRate - 20) trend = 'declining';
        }

        teamMatchups.push({
          teamId: team.id,
          teamName: team.name,
          games: teamGames,
          wins,
          losses,
          draws,
          totalGamesPlayed: totalGames,
          winRate,
          avgScoreFor,
          avgScoreAgainst,
          scoreDifferential,
          goalsPercentage,
          recentForm: recentResults,
          trend
        });
      });

      // Sort by win rate by default
      teamMatchups.sort((a, b) => b.winRate - a.winRate);

      setMatchups(teamMatchups);
    };

    calculateMatchups();
  }, [games, currentClubId, centralizedStats]);

  const bestMatchup = matchups.length > 0 ? matchups[0] : null;
  const worstMatchup = matchups.length > 0 ? matchups[matchups.length - 1] : null;
  const totalGames = matchups.reduce((sum, matchup) => sum + matchup.totalGamesPlayed, 0);
  const totalWins = matchups.reduce((sum, matchup) => sum + matchup.wins, 0);
  const overallWinRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;

  const calculateStreak = (form: string[]) => {
    if (form.length === 0) return { type: 'None', count: 0 };
    
    const mostRecent = form[0];
    let count = 1;
    
    for (let i = 1; i < form.length; i++) {
      if (form[i] === mostRecent) {
        count++;
      } else {
        break;
      }
    }
    
    return {
      type: mostRecent === 'W' ? 'Win' : mostRecent === 'L' ? 'Loss' : 'Draw',
      count
    };
  };

  const getFormDisplay = (form: string[], matchup: OpponentMatchup) => {
    // Get the most recent 3 games for this opponent, but show in chronological order
    const recentGames = matchup.games
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3)
      .reverse(); // Reverse to show oldest to newest

    return form.slice(0, 3).reverse().map((result, index) => {
      const gameResult: GameResult = result === 'W' ? 'Win' : result === 'L' ? 'Loss' : 'Draw';
      const game = recentGames[index];

      if (!game) {
        return (
          <ResultBadge 
            key={index}
            result={gameResult}
            size="sm"
            className="mx-0.5"
          />
        );
      }

      // Calculate scores for this game
      const gameStats = centralizedStats[game.id] || [];
      const teamScore = gameStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
      const opponentScore = gameStats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);

      return (
        <div key={index} className="relative group mx-0.5">
          <ResultBadge 
            result={gameResult}
            size="sm"
          />
          {/* Tooltip on hover */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
            {teamScore}-{opponentScore}
          </div>
        </div>
      );
    });
  };

  return (
    <BaseWidget 
      title="Team Matchups" 
      className={className}
      contentClassName="px-4 py-6 pb-2"
    >
      {matchups.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          No completed games against other teams yet
        </p>
      ) : (
        <div className="space-y-4">
          {/* Overall Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Teams Faced</p>
              <p className="text-lg font-bold text-gray-700">{matchups.length}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Overall Win Rate</p>
              <p className="text-lg font-bold text-gray-700">{overallWinRate}%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Total Games</p>
              <p className="text-lg font-bold text-gray-700">{totalGames}</p>
            </div>
          </div>

          {/* Option 1: Head-to-Head Win/Loss Streaks */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 mb-4">
            <div className="flex justify-center items-center space-x-2 mb-3">
              <span className="text-xs text-gray-500 font-medium">Current Streaks</span>
            </div>
            <div className="space-y-2">
              {matchups.slice(0, 3).map(matchup => {
                const streak = calculateStreak(matchup.recentForm);
                return (
                  <div key={matchup.teamId} className="flex items-center justify-between text-xs">
                    <span className="truncate max-w-20">{matchup.teamName.slice(0, 12)}</span>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      streak.type === 'Win' ? 'bg-green-100 text-green-700' :
                      streak.type === 'Loss' ? 'bg-red-100 text-red-700' : 
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {streak.count}{streak.type.charAt(0)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Option 2: Scoring Differential Chart */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 mb-4">
            <div className="flex justify-center items-center space-x-2 mb-3">
              <span className="text-xs text-gray-500 font-medium">Scoring Differential</span>
            </div>
            <div className="space-y-2">
              {matchups.slice(0, 4).map(matchup => (
                <div key={matchup.teamId} className="flex items-center space-x-2">
                  <span className="text-xs w-16 truncate">{matchup.teamName.slice(0, 8)}</span>
                  <div className="flex-1 relative h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`absolute left-1/2 top-0 h-full ${
                        matchup.scoreDifferential >= 0 ? 'bg-blue-500' : 'bg-red-400'
                      }`}
                      style={{
                        width: `${Math.min(50, Math.abs(matchup.scoreDifferential) * 5)}%`,
                        [matchup.scoreDifferential >= 0 ? 'left' : 'right']: '50%'
                      }}
                    />
                    <div className="absolute left-1/2 top-0 w-px h-full bg-gray-400 transform -translate-x-1/2" />
                  </div>
                  <span className="text-xs w-8">{matchup.scoreDifferential > 0 ? '+' : ''}{matchup.scoreDifferential}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Option 3: Matchup Difficulty Meter */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 mb-4">
            <div className="flex justify-center items-center space-x-2 mb-3">
              <span className="text-xs text-gray-500 font-medium">Difficulty Meters</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {matchups.slice(0, 4).map(matchup => {
                const difficulty = 100 - matchup.winRate;
                return (
                  <div key={matchup.teamId} className="text-center">
                    <div className="text-xs text-gray-600 mb-1 truncate">{matchup.teamName.slice(0, 10)}</div>
                    <div className="relative w-16 h-16 mx-auto">
                      <svg width="64" height="64" viewBox="0 0 64 64">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="#e5e7eb"
                          strokeWidth="4"
                          fill="none"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke={difficulty > 70 ? '#ef4444' : difficulty > 40 ? '#f59e0b' : '#10b981'}
                          strokeWidth="4"
                          fill="none"
                          strokeDasharray={`${(difficulty / 100) * 175.93} 175.93`}
                          strokeDashoffset="43.98"
                          transform="rotate(-90 32 32)"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold">{difficulty}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Option 4: Recent Form Timeline */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 mb-4">
            <div className="flex justify-center items-center space-x-2 mb-3">
              <span className="text-xs text-gray-500 font-medium">Recent Form Timeline</span>
            </div>
            <div className="space-y-2">
              {matchups.slice(0, 3).map(matchup => (
                <div key={matchup.teamId} className="flex items-center justify-between">
                  <span className="text-xs w-20 truncate">{matchup.teamName.slice(0, 12)}</span>
                  <div className="flex space-x-1">
                    {/* Timeline line */}
                    <div className="flex items-center space-x-0.5">
                      {getFormDisplay(matchup.recentForm, matchup)}
                    </div>
                  </div>
                  <span className="text-xs w-8 text-gray-500">{matchup.winRate}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Option 5: Performance vs Opponent Type */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 mb-4">
            <div className="flex justify-center items-center space-x-2 mb-3">
              <span className="text-xs text-gray-500 font-medium">Opponent Categories</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {(() => {
                const strong = matchups.filter(m => m.winRate >= 70);
                const balanced = matchups.filter(m => m.winRate >= 30 && m.winRate < 70);
                const challenging = matchups.filter(m => m.winRate < 30);
                
                return [
                  { label: 'Strong vs', count: strong.length, color: 'text-green-600' },
                  { label: 'Balanced vs', count: balanced.length, color: 'text-yellow-600' },
                  { label: 'Struggle vs', count: challenging.length, color: 'text-red-600' }
                ].map((category, index) => (
                  <div key={index} className="p-2 bg-white rounded border">
                    <div className={`text-lg font-bold ${category.color}`}>{category.count}</div>
                    <div className="text-xs text-gray-500">{category.label}</div>
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* Best Matchup */}
          {bestMatchup && (
            <div className="flex items-center justify-between p-4 mb-4 mt-2 bg-green-50 border-l-4 border-green-500 border-t border-r border-b border-t-green-500 border-r-green-500 border-b-green-500 rounded">
              <div>
                <p className="font-semibold text-gray-800 mb-2">{bestMatchup.teamName}</p>
                <Badge variant="outline" className="text-green-700 border-green-300">Strength</Badge>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-700 mb-1">{bestMatchup.winRate}%</p>
                <div className="flex">{getFormDisplay(bestMatchup.recentForm, bestMatchup)}</div>
              </div>
            </div>
          )}

          {/* Worst Matchup */}
          {worstMatchup && worstMatchup !== bestMatchup && (
            <div className="flex items-center justify-between p-4 mb-4 mt-2 bg-red-50 border-l-4 border-red-500 border-t border-r border-b border-t-red-500 border-r-red-500 border-b-red-500 rounded">
              <div>
                <p className="font-semibold text-gray-800 mb-2">{worstMatchup.teamName}</p>
                <Badge variant="outline" className="text-red-700 border-red-300">Challenge</Badge>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-red-700 mb-1">{worstMatchup.winRate}%</p>
                <div className="flex">{getFormDisplay(worstMatchup.recentForm, worstMatchup)}</div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-4">
        {matchups.length > 0 ? (
          <ViewMoreButton href="/team-analysis">
            View more →
          </ViewMoreButton>
        ) : (
          <div className="mb-4" />
        )}
      </div>
    </BaseWidget>
  );
}
