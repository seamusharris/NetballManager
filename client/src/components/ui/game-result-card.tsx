import React, { useMemo } from 'react';
import { Link } from 'wouter';
import { Game } from '@shared/schema';
import { formatShortDate, formatDate } from '@/lib/utils';
import { ScoreBadge } from '@/components/ui/score-badge';
import { GameBadge } from '@/components/ui/game-badge';
import { cn } from '@/lib/utils';
import { UnifiedGameScoreService } from '@/lib/unifiedGameScoreService';
import { useQuery } from '@tanstack/react-query';
import { Badge } from './badge';
import { Card } from './card';
import { apiClient } from '@/lib/apiClient';
import { useClub } from '@/contexts/ClubContext';
import { QuarterScoresDisplay } from './quarter-scores-display';

export type GameResultLayout = 'narrow' | 'medium' | 'wide';

interface GameResultCardProps {
  game: Game;
  layout?: GameResultLayout;
  className?: string;
  gameStats?: any[];
  centralizedScores?: any[];
  useOfficialPriority?: boolean;
  showLink?: boolean;
  showDate?: boolean;
  showRound?: boolean;
  showScore?: boolean;
  showQuarterScores?: boolean;
  compact?: boolean;
  currentTeamId?: number;
  clubTeams?: any[];
}

export default function GameResultCard({ 
  game, 
  layout = 'medium',
  className,
  gameStats = [],
  centralizedScores,
  useOfficialPriority = false,
  showLink = true,
  showDate = true,
  showRound = true,
  showScore = true,
  showQuarterScores = false,
  compact = false,
  currentTeamId,
  clubTeams = []
}: GameResultCardProps) {
  const { currentClubId } = useClub();
  const statusIsCompleted = game.statusIsCompleted;

  // Early return if no game data
  if (!game) {
    return (
      <div className="border border-gray-200 rounded p-3 bg-gray-50">
        <span className="text-gray-500">No game data available</span>
      </div>
    );
  }

  // Use unified game score service for all calculations
  const scoreResult = useMemo(() => {
    // For club-wide view, detect which team from our club is playing and use their perspective
    let perspective: number | 'club-wide' = currentTeamId || 'club-wide';
    
    // If we're in club-wide view but this game involves one of our teams, use that team's perspective
    if (!currentTeamId && teams.length > 0) {
      // Check if home team is from our club
      if (game.homeTeamId && teams.some(team => team.id === game.homeTeamId)) {
        perspective = game.homeTeamId;
      }
      // Check if away team is from our club  
      else if (game.awayTeamId && teams.some(team => team.id === game.awayTeamId)) {
        perspective = game.awayTeamId;
      }
    }
    
    // Debug for any team 128 game
    if (game.homeTeamId === 128 || game.awayTeamId === 128) {
      console.log(`🔍 GAME RESULT CARD - Team 128 game ${game.id} inputs:`, {
        originalPerspective: currentTeamId || 'club-wide',
        finalPerspective: perspective,
        currentTeamId,
        centralizedScoresCount: centralizedScores?.length || 0,
        gameData: {
          homeTeamId: game.homeTeamId,
          awayTeamId: game.awayTeamId,
          statusIsCompleted: game.statusIsCompleted
        }
      });
    }
    
    const result = UnifiedGameScoreService.calculateGameScore(game, centralizedScores || [], perspective);
    
    // Debug for any team 128 game
    if (game.homeTeamId === 128 || game.awayTeamId === 128) {
      console.log(`🔍 GAME RESULT CARD - Team 128 game ${game.id} result:`, {
        perspective,
        result: result.result,
        ourScore: result.ourScore,
        theirScore: result.theirScore,
        hasValidScore: result.hasValidScore,
        scoreSource: result.scoreSource,
        team128IsHome: game.homeTeamId === 128,
        team128IsAway: game.awayTeamId === 128
      });
    }
    
    return result;
  }, [game, centralizedScores, currentTeamId, teams]);

  // Convert to legacy format for backward compatibility with existing UI
  const scores = useMemo(() => {
    if (!scoreResult.hasValidScore) {
      return null;
    }
    
    return {
      finalScore: {
        for: scoreResult.ourScore,
        against: scoreResult.theirScore
      },
      result: scoreResult.result,
      quarterBreakdown: scoreResult.quarterBreakdown,
      hasValidScore: scoreResult.hasValidScore,
      scoreSource: scoreResult.scoreSource
    };
  }, [scoreResult]);

  // Check if this is a BYE game using game status only
  const isByeGame = game.statusId === 6 || game.statusName === 'bye';
  const isUpcoming = !game.statusIsCompleted && !isByeGame;

  const getGameDisplay = (): string => {
    // Handle BYE games
    if (isByeGame) {
      return 'Bye';
    }

    // Always show Home vs Away format for consistency
    return `${game.homeTeamName || 'Unknown'} vs ${game.awayTeamName || 'Unknown'}`;
  };

  // Use the unified service result directly - it already handles perspective correctly
  const actualResult = scoreResult.result;
  const isWin = actualResult === 'win';
  const isLoss = actualResult === 'loss';
  const isDraw = actualResult === 'draw';



  const getResultClass = () => {
    if (isByeGame) return 'border-gray-500 bg-gray-50'; // check byes first
    if (isUpcoming) return 'border-blue-500 bg-blue-50'; // upcoming games
    if (isWin) return 'border-green-500 bg-green-50';
    if (isLoss) return 'border-red-500 bg-red-50';
    if (isDraw) return 'border-amber-500 bg-amber-50';
    return 'border-gray-400 bg-gray-100'; // other completed states without results
  };

  const getHoverClass = () => {
    if (isByeGame) return 'hover:bg-gray-100'; // check byes first
    if (isUpcoming) return 'hover:bg-blue-100'; // upcoming games
    if (isWin) return 'hover:bg-green-100';
    if (isLoss) return 'hover:bg-red-100';
    if (isDraw) return 'hover:bg-amber-100';
    return 'hover:bg-gray-200';
  };

  // Layout configurations
  const getLayoutConfig = () => {
    switch (layout) {
      case 'narrow':
        return {
          containerClass: 'flex items-center justify-between p-2 space-x-2',
          showDate: false,
          showRound: showRound,
          textSize: 'text-sm',
          badgeSize: 'sm' as const
        };
      case 'wide':
        return {
          containerClass: 'flex items-center justify-between p-4 space-x-4',
          showDate: showDate,
          showRound: showRound,
          textSize: 'text-base',
          badgeSize: 'md' as const
        };
      default: // medium
        return {
          containerClass: 'flex items-center justify-between p-3 space-x-3',
          showDate: showDate,
          showRound: showRound,
          textSize: 'text-sm',
          badgeSize: 'md' as const
        };
    }
  };

  const config = getLayoutConfig();

  // Create custom round display with forfeit status if applicable
  const customRoundDisplay = useMemo(() => {
    if (!game.round) return null;

    const baseRound = layout === 'narrow' ? `R${game.round}` : `Round ${game.round}`;

    // Add forfeit status if game is completed with forfeit status
    if (game.statusIsCompleted && game.statusName && game.statusName.startsWith('forfeit-')) {
      const forfeitType = game.statusName === 'forfeit-win' ? 'Forfeit Win' : 'Forfeit Loss';
      return `${baseRound} • ${forfeitType}`;
    }

    return baseRound;
  }, [game.round, game.statusIsCompleted, game.statusName, layout]);

  // Helper function for timeline round badge styling
  const getRoundBadgeVariant = () => {
    if (game.statusIsCompleted) return "round-timeline";
    return "round-pill"; // Default for upcoming games
  };

  const getRoundBadgeClass = () => {
    if (game.statusIsCompleted) {
      if (isWin) return "bg-green-200 text-green-800";
      if (isLoss) return "bg-red-200 text-red-800";
      return "bg-yellow-200 text-yellow-800"; // draws
    }
    return "bg-blue-200 text-blue-800"; // upcoming games
  };

  // Display score in home-away format always
  const getScoreDisplay = () => {
    if (!game) return "—";

    // For BYE games, don't show scores
    if (isByeGame) return "BYE";

    // For upcoming games, show dash
    if (isUpcoming) return "—";

    // Use unified service scores - convert perspective scores to home-away display
    if (scores && scores.finalScore.for !== undefined && scores.finalScore.against !== undefined) {
      let homeScore = 0;
      let awayScore = 0;

      if (currentTeamId) {
        // Team perspective: convert "for/against" to "home/away" display
        if (game.homeTeamId === currentTeamId) {
          // Current team is home - for=home, against=away
          homeScore = scores.finalScore.for;
          awayScore = scores.finalScore.against;
        } else if (game.awayTeamId === currentTeamId) {
          // Current team is away - for=away, against=home
          homeScore = scores.finalScore.against;
          awayScore = scores.finalScore.for;
        }
      } else {
        // Club-wide view - scores should already be in correct format
        homeScore = scores.finalScore.for;
        awayScore = scores.finalScore.against;
      }

      return `${homeScore}-${awayScore}`;
    }

    // For completed games without scores, show placeholder
    if (game.statusIsCompleted) {
      return "0-0";
    }

    // Default fallback
    return "—";
  };

  const CardContent = () => (
    <div 
      className={cn(
        'border-l-4 border-t border-r border-b rounded transition-colors',
        getResultClass(),
        showLink ? `cursor-pointer ${getHoverClass()}` : '',
        config.containerClass,
        className
      )}
    >
      {/* Left side - Opponent and details */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-800 truncate text-base">
          {isByeGame ? "Bye" : getGameDisplay()}
        </div>

        {/* Details row */}
        <div className="flex items-center gap-2 mt-1">
          {config.showDate && (
            <span className="text-xs text-gray-600">
              {layout === 'wide' ? formatDate(game.date) : formatShortDate(game.date)}
            </span>
          )}

          {config.showDate && config.showRound && game.round && (
            <span className="text-xs text-gray-500 mx-1">•</span>
          )}

          {config.showRound && game.round && (
            <span className="text-xs text-gray-600">
              {customRoundDisplay || (layout === 'narrow' ? `R${game.round}` : `Round ${game.round}`)}
            </span>
          )}
        </div>
      </div>

      {/* Right side - Score and Quarter Scores */}
      <div className="ml-auto flex items-center gap-4">
        {/* Quarter scores if enabled and available */}
        {showQuarterScores && scores && scores.quarterBreakdown && scores.quarterBreakdown.length > 0 && (
          <QuarterScoresDisplay
            quarterScores={scores.quarterBreakdown.map(q => ({
              quarter: q.quarter,
              teamScore: q.ourScore,
              opponentScore: q.theirScore
            }))}
            size="sm"
            className="mr-4"
          />
        )}

        {/* Main score */}
        {showScore && (
          isByeGame ? (
            <div className="px-3 py-1 text-sm font-medium text-white bg-gray-600 rounded">
              —
            </div>
          ) : !game.statusIsCompleted ? (
            <div className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded">
              —
            </div>
          ) : scores ? (
            <ScoreBadge 
              teamScore={scores.finalScore.for} 
              opponentScore={scores.finalScore.against}
              result={scores.result}
            />
          ) : (
            <div className="px-3 py-1 text-sm font-medium text-gray-500 bg-gray-50 rounded border border-gray-200">
              —
            </div>
          )
        )}
      </div>
    </div>
  );

  if (showLink) {
    return (
      <Link href={`/game/${game.id}`}>
        <CardContent />
      </Link>
    );
  }

  return <CardContent />;
}

// Convenience components for specific layouts
export function NarrowGameResultCard(props: Omit<GameResultCardProps, 'layout'>) {
  return <GameResultCard {...props} layout="narrow" />;
}

export function MediumGameResultCard(props: Omit<GameResultCardProps, 'layout'>) {
  return <GameResultCard {...props} layout="medium" />;
}

export function WideGameResultCard(props: Omit<GameResultCardProps, 'layout'>) {
  return <GameResultCard {...props} layout="wide" />;
}

// Convenience components for different use cases
export function OfficialGameResultCard(props: Omit<GameResultCardProps, 'useOfficialPriority'>) {
  return <GameResultCard {...props} useOfficialPriority={true} />;
}

export function PerformanceGameResultCard(props: Omit<GameResultCardProps, 'useOfficialPriority'>) {
  return <GameResultCard {...props} useOfficialPriority={false} />;
}