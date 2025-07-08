
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface QuarterPerformanceAnalysisProps {
  games: any[];
  currentTeamId: number;
  batchScores?: Record<number, any[]>;
  className?: string;
  excludeSpecialGames?: boolean; // Skip BYE and forfeit games
}

export default function QuarterPerformanceAnalysis({
  games,
  currentTeamId,
  batchScores,
  className = "",
  excludeSpecialGames = true
}: QuarterPerformanceAnalysisProps) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-5 gap-4 ${className}`}>
      {[1, 2, 3, 4].map(quarter => {
        // Calculate average scores for this quarter across all games
        let totalTeamScore = 0;
        let totalOpponentScore = 0;
        let gamesWithData = 0;

        games.forEach(game => {
          // Skip special status games if requested
          if (excludeSpecialGames && (
            game.statusName === 'bye' || 
            game.statusName === 'forfeit-win' || 
            game.statusName === 'forfeit-loss'
          )) return;

          const gameScores = batchScores?.[game.id] || [];
          const transformedScores = Array.isArray(gameScores) ? gameScores.map(score => ({
            id: score.id,
            gameId: score.gameId,
            teamId: score.teamId,
            quarter: score.quarter,
            score: score.score,
            enteredBy: score.enteredBy,
            enteredAt: score.enteredAt,
            updatedAt: score.updatedAt,
            notes: score.notes
          })) : [];

          const quarterTeamScore = transformedScores.find(s => s.teamId === currentTeamId && s.quarter === quarter)?.score || 0;
          const quarterOpponentScore = transformedScores.find(s => s.teamId !== currentTeamId && s.quarter === quarter)?.score || 0;

          totalTeamScore += quarterTeamScore;
          totalOpponentScore += quarterOpponentScore;

          if(quarterTeamScore > 0 || quarterOpponentScore > 0){
            gamesWithData++;
          }
        });

        const avgTeamScore = gamesWithData > 0 ? totalTeamScore / gamesWithData : 0;
        const avgOpponentScore = gamesWithData > 0 ? totalOpponentScore / gamesWithData : 0;

        const isWinning = avgTeamScore > avgOpponentScore;
        const isLosing = avgTeamScore < avgOpponentScore;
        const isDraw = Math.abs(avgTeamScore - avgOpponentScore) < 0.1;

        const getBackgroundClass = () => {
          if (isDraw) return 'bg-amber-100 border-amber-300';
          if (isWinning) return 'bg-green-100 border-green-300';
          return 'bg-red-100 border-red-300';
        };

        const getDiffTextColorClass = () => {
          if (isDraw) return 'text-amber-600 font-bold';
          return isWinning ? 'text-green-600 font-bold' : 'text-red-600 font-bold';
        };

        return (
          <div key={quarter} className={`text-center p-2 rounded-lg border-2 ${getBackgroundClass()} transition-colors relative`}>
            {/* Quarter badge in top-left corner */}
            <div className="absolute -top-2 -left-2">
              <Badge 
                className={`text-xs font-bold px-2 py-1 rounded-full shadow-sm border ${
                  isDraw ? 'bg-amber-500 text-white border-amber-600' :
                  isWinning ? 'bg-green-500 text-white border-green-600' : 
                  'bg-red-500 text-white border-red-600'
                }`}
              >
                Q{quarter}
              </Badge>
            </div>

            <div className="space-y-1 mt-1">
              <div className={`text-lg font-bold ${getDiffTextColorClass()}`}>
                {avgTeamScore.toFixed(1)}–{avgOpponentScore.toFixed(1)}
              </div>
              <div className={`text-base ${getDiffTextColorClass()}`}>
                {avgTeamScore - avgOpponentScore > 0 ? `+${(avgTeamScore - avgOpponentScore).toFixed(1)}` : (avgTeamScore - avgOpponentScore).toFixed(1)}
              </div>

              <div 
                className="w-full bg-gray-200 rounded-full h-2 mt-6 mb-4" 
                title="Our share of total quarter scoring"
              >
                <div 
                  className={`h-2 rounded-full ${
                    isWinning ? 'bg-green-500' : 
                    isLosing ? 'bg-red-500' : 'bg-amber-500'
                  }`}
                  style={{ 
                    width: `${Math.min(100, Math.max(0, (avgTeamScore / (avgTeamScore + avgOpponentScore)) * 100))}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Goal Difference Box - styled like quarter boxes */}
      {(() => {
        // Calculate overall goal difference for styling
        let totalGoalsFor = 0;
        let totalGoalsAgainst = 0;
        let gamesWithScores = 0;

        games.forEach(game => {
          // Skip special status games if requested
          if (excludeSpecialGames && (
            game.statusName === 'bye' || 
            game.statusName === 'forfeit-win' || 
            game.statusName === 'forfeit-loss'
          )) return;

          const gameScores = batchScores?.[game.id] || [];
          if (gameScores.length > 0) {
            gamesWithScores++;

            let gameGoalsFor = 0;
            let gameGoalsAgainst = 0;

            gameScores.forEach(score => {
              if (score.teamId === currentTeamId) {
                gameGoalsFor += score.score;
              } else {
                gameGoalsAgainst += score.score;
              }
            });

            totalGoalsFor += gameGoalsFor;
            totalGoalsAgainst += gameGoalsAgainst;
          }
        });

        const avgGoalsFor = gamesWithScores > 0 ? totalGoalsFor / gamesWithScores : 0;
        const avgGoalsAgainst = gamesWithScores > 0 ? totalGoalsAgainst / gamesWithScores : 0;
        const goalDifference = avgGoalsFor - avgGoalsAgainst;

        const isWinning = goalDifference > 0;
        const isLosing = goalDifference < 0;
        const isDraw = Math.abs(goalDifference) < 0.1;

        const getBackgroundClass = () => {
          if (isDraw) return 'bg-amber-100 border-amber-300';
          if (isWinning) return 'bg-green-100 border-green-300';
          return 'bg-red-100 border-red-300';
        };

        const getDiffTextColorClass = () => {
          if (isDraw) return 'text-amber-600 font-bold';
          return isWinning ? 'text-green-600 font-bold' : 'text-red-600 font-bold';
        };

        return (
          <div className={`text-center p-2 rounded-lg border-2 ${getBackgroundClass()} transition-colors relative`}>
            {/* Goal difference badge in top-left corner */}
            <div className="absolute -top-2 -left-2">
              <Badge 
                className={`text-xs font-bold px-2 py-1 rounded-full shadow-sm border ${
                  isDraw ? 'bg-amber-500 text-white border-amber-600' :
                  isWinning ? 'bg-green-500 text-white border-green-600' : 
                  'bg-red-500 text-white border-red-600'
                }`}
              >
                AVG
              </Badge>
            </div>

            <div className="space-y-1 mt-1">
              <div className={`text-lg font-bold ${getDiffTextColorClass()}`}>
                {avgGoalsFor.toFixed(1)}–{avgGoalsAgainst.toFixed(1)}
              </div>
              <div className={`text-base ${getDiffTextColorClass()}`}>
                {goalDifference >= 0 ? '+' : ''}{goalDifference.toFixed(1)}
              </div>

              <div 
                className="w-full bg-gray-200 rounded-full h-2 mt-6 mb-4" 
                title="Our share of total game scoring"
              >
                <div 
                  className={`h-2 rounded-full ${
                    isWinning ? 'bg-green-500' : 
                    isLosing ? 'bg-red-500' : 'bg-amber-500'
                  }`}
                  style={{ 
                    width: `${Math.min(100, Math.max(0, (avgGoalsFor / (avgGoalsFor + avgGoalsAgainst)) * 100))}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
