import React from 'react';
import { Link } from 'wouter';
import { formatShortDate, formatDate, cn } from '@/lib/utils';

export type GameResultLayout = 'narrow' | 'medium' | 'wide';

interface Team {
  id: number;
  name: string;
}

interface QuarterScore {
  homeScore: number;
  awayScore: number;
}

interface GameInfo {
  id: number;
  date: string;
  round?: number;
  status: 'completed' | 'scheduled' | 'forfeit-win' | 'forfeit-loss' | 'bye';
  venue?: string;
}

interface SimpleGameResultCardProps {
  homeTeam: Team;
  awayTeam?: Team; // Optional for BYE games
  quarterScores?: QuarterScore[];
  currentTeamId: number;
  gameInfo: GameInfo;
  layout?: GameResultLayout;
  className?: string;
  showLink?: boolean;
  showDate?: boolean;
  showRound?: boolean;
  showScore?: boolean;
  showQuarterScores?: boolean;
  hasStats?: boolean;
}

export default function SimpleGameResultCard({
  homeTeam,
  awayTeam,
  quarterScores = [],
  currentTeamId,
  gameInfo,
  layout = 'medium',
  className,
  showLink = true,
  showDate = true,
  showRound = true,
  showScore = true,
  showQuarterScores = false,
  hasStats = false
}: SimpleGameResultCardProps) {

  // Calculate final scores from quarter scores
  const finalScores = quarterScores.length > 0 
    ? quarterScores.reduce(
        (acc, quarter) => ({
          homeScore: acc.homeScore + quarter.homeScore,
          awayScore: acc.awayScore + quarter.awayScore
        }),
        { homeScore: 0, awayScore: 0 }
      )
    : null;

  // Determine game result from current team perspective
  const getGameResult = () => {
    if (gameInfo.status === 'bye') return 'bye';
    if (gameInfo.status === 'forfeit-win') {
      return currentTeamId === homeTeam.id ? 'win' : 'loss';
    }
    if (gameInfo.status === 'forfeit-loss') {
      return currentTeamId === homeTeam.id ? 'loss' : 'win';
    }
    if (gameInfo.status !== 'completed') return 'upcoming';
    
    if (!finalScores) return 'upcoming';
    
    const isHomeTeam = currentTeamId === homeTeam.id;
    const ourScore = isHomeTeam ? finalScores.homeScore : finalScores.awayScore;
    const theirScore = isHomeTeam ? finalScores.awayScore : finalScores.homeScore;
    
    if (ourScore > theirScore) return 'win';
    if (ourScore < theirScore) return 'loss';
    return 'draw';
  };

  const result = getGameResult();

  // Get styling based on result
  const getResultClass = () => {
    switch (result) {
      case 'bye': return 'border-gray-500 bg-gray-50';
      case 'upcoming': return 'border-blue-500 bg-blue-50';
      case 'win': return 'border-green-500 bg-green-50';
      case 'loss': return 'border-red-500 bg-red-50';
      case 'draw': return 'border-amber-500 bg-amber-50';
      default: return 'border-gray-400 bg-gray-100';
    }
  };

  const getHoverClass = () => {
    if (!showLink) return '';
    switch (result) {
      case 'bye': return 'hover:bg-gray-100';
      case 'upcoming': return 'hover:bg-blue-100';
      case 'win': return 'hover:bg-green-100';
      case 'loss': return 'hover:bg-red-100';
      case 'draw': return 'hover:bg-amber-100';
      default: return 'hover:bg-gray-200';
    }
  };

  // Layout configurations
  const getLayoutConfig = () => {
    switch (layout) {
      case 'narrow':
        return {
          containerClass: 'flex items-center justify-between p-2 space-x-2',
          textSize: 'text-sm',
          showDateInLayout: false
        };
      case 'wide':
        return {
          containerClass: 'flex items-center justify-between p-4 space-x-4',
          textSize: 'text-base',
          showDateInLayout: showDate
        };
      default: // medium
        return {
          containerClass: 'flex items-center justify-between p-3 space-x-3',
          textSize: 'text-sm',
          showDateInLayout: showDate
        };
    }
  };

  const config = getLayoutConfig();

  // Game display text
  const getGameDisplay = () => {
    if (gameInfo.status === 'bye') return 'Bye';
    return `${homeTeam.name} vs ${awayTeam?.name || 'TBD'}`;
  };

  // Score display
  const getScoreDisplay = () => {
    const baseClasses = "px-3 py-1 text-sm font-medium text-white rounded min-w-[80px] text-center";
    
    if (gameInfo.status === 'bye') {
      return <div className={`${baseClasses} bg-gray-500`}>—</div>;
    }
    
    if (gameInfo.status === 'forfeit-win' || gameInfo.status === 'forfeit-loss') {
      const isWin = (gameInfo.status === 'forfeit-win' && currentTeamId === homeTeam.id) ||
                    (gameInfo.status === 'forfeit-loss' && currentTeamId !== homeTeam.id);
      return (
        <div className={`${baseClasses} ${isWin ? 'bg-green-500' : 'bg-red-500'}`}>
          Forfeit
        </div>
      );
    }
    
    if (!finalScores || gameInfo.status !== 'completed') {
      return <div className={`${baseClasses} bg-blue-500`}>—</div>;
    }

    const scoreClass = result === 'win' ? 'bg-green-500' : 
                     result === 'loss' ? 'bg-red-500' : 
                     result === 'draw' ? 'bg-yellow-500' : 'bg-gray-500';

    return (
      <div className={`${baseClasses} font-mono ${scoreClass}`}>
        {finalScores.homeScore}:{finalScores.awayScore}
      </div>
    );
  };

  // Quarter scores display
  const getQuarterScoresDisplay = () => {
    if (!showQuarterScores || !quarterScores.length || gameInfo.status !== 'completed') {
      return null;
    }

    // Calculate cumulative scores
    const cumulativeScores = [];
    let homeTotal = 0;
    let awayTotal = 0;

    quarterScores.forEach((quarter, index) => {
      homeTotal += quarter.homeScore;
      awayTotal += quarter.awayScore;
      cumulativeScores.push({ homeScore: homeTotal, awayScore: awayTotal, quarter: index + 1 });
    });

    return (
      <div className="mr-4 flex items-center">
        <div className="text-xs space-y-1">
          {/* Quarter-by-quarter scores */}
          <div className="grid grid-cols-4 gap-1">
            {quarterScores.map((quarter, index) => {
              const qWin = quarter.homeScore > quarter.awayScore;
              const qLoss = quarter.homeScore < quarter.awayScore;
              const qClass = qWin ? 'bg-green-100 text-green-800 border-green-400' :
                            qLoss ? 'bg-red-100 text-red-800 border-red-400' :
                            'bg-amber-100 text-amber-800 border-amber-400';

              return (
                <span key={index} className={`w-16 px-2 py-0.5 ${qClass} border rounded font-mono font-medium text-center block`}>
                  {quarter.homeScore}:{quarter.awayScore}
                </span>
              );
            })}
          </div>
          {/* Cumulative scores */}
          <div className="grid grid-cols-4 gap-1">
            {cumulativeScores.map((cumulative, index) => {
              const cWin = cumulative.homeScore > cumulative.awayScore;
              const cLoss = cumulative.homeScore < cumulative.awayScore;
              const cClass = cWin ? 'bg-green-200 text-green-800 border-green-500' :
                            cLoss ? 'bg-red-200 text-red-800 border-red-500' :
                            'bg-amber-200 text-amber-800 border-amber-500';

              return (
                <span key={index} className={`w-18 px-2 py-0.5 ${cClass} border rounded font-mono text-xs text-center block`}>
                  {cumulative.homeScore}:{cumulative.awayScore}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const CardContent = () => (
    <div 
      className={cn(
        'border-l-4 border-t border-r border-b rounded transition-all duration-150 ease-in-out',
        getResultClass(),
        showLink ? `cursor-pointer ${getHoverClass()}` : '',
        config.containerClass,
        className
      )}
    >
      {/* Left side - Game info */}
      <div className="flex-1 min-w-0">
        <div className={`font-semibold text-gray-800 truncate ${config.textSize}`}>
          {getGameDisplay()}
        </div>

        {/* Details row */}
        <div className="flex items-center gap-2 mt-1">
          {config.showDateInLayout && (
            <span className="text-xs text-gray-600">
              {layout === 'wide' ? formatDate(gameInfo.date) : formatShortDate(gameInfo.date)}
            </span>
          )}

          {config.showDateInLayout && showRound && gameInfo.round && (
            <span className="text-xs text-gray-500 mx-1">•</span>
          )}

          {showRound && gameInfo.round && (
            <span className="text-xs text-gray-600">
              {layout === 'narrow' ? `R${gameInfo.round}` : `Round ${gameInfo.round}`}
            </span>
          )}

          {/* Stats indicator */}
          {gameInfo.status === 'completed' && (
            <>
              <span className="text-xs text-gray-500 mx-1">•</span>
              <span className="text-xs text-gray-500">
                {hasStats ? '✓' : '×'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Right side - Quarter scores and final score */}
      <div className="ml-auto flex items-center gap-4">
        {getQuarterScoresDisplay()}
        {showScore && getScoreDisplay()}
      </div>
    </div>
  );

  if (showLink) {
    return (
      <Link href={`/game/${gameInfo.id}`} className="block">
        <CardContent />
      </Link>
    );
  }

  return <CardContent />;
}