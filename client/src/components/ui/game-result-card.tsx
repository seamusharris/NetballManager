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
import { useLocation } from 'wouter';

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
  currentClubId?: number;
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
  currentTeamId: propCurrentTeamId,
  clubTeams = [],
  currentClubId: propCurrentClubId
}: GameResultCardProps) {
  const { currentTeamId, currentClubId, currentClubTeams } = useClub();
  const [location] = useLocation();
  const effectiveTeamId = propCurrentTeamId || currentTeamId;

  // Extract club ID from URL or use prop - more reliable than context
  const urlClubId = useMemo(() => {
    const clubMatch = location.match(/\/club\/(\d+)/);
    return clubMatch ? parseInt(clubMatch[1]) : (propCurrentClubId || currentClubId);
  }, [location, propCurrentClubId, currentClubId]);
  const statusIsCompleted = game.statusIsCompleted;

  // Early return if no game data
  if (!game) {
    return (
      <div className="border border-gray-200 rounded p-3 bg-gray-50">
        <span className="text-gray-500">No game data available</span>
      </div>
    );
  }

  // Fetch club teams based on URL club ID for reliable team perspective
  const { data: urlClubTeams = [] } = useQuery<any[]>({
    queryKey: ['clubs', urlClubId, 'teams'],
    queryFn: () => apiClient.get(`/api/clubs/${urlClubId}/teams`),
    enabled: !!urlClubId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000 // 30 minutes
  });

  // Use unified game score service for all calculations
  const scoreResult = useMemo(() => {
    const perspective = 'club-wide'; // Always use club-wide for dashboard

    // Use URL-based club teams for reliable perspective calculation
    const clubTeamIds = urlClubTeams?.map(t => t.id) || [];

    // Debug logging for games where we need to verify perspective
    if (clubTeamIds.length > 0 && (clubTeamIds.includes(game.homeTeamId || 0) || clubTeamIds.includes(game.awayTeamId || 0))) {
      console.log(`🔍 GAME ${game.id} - Our team perspective:`, {
        perspective,
        clubTeamIds,
        urlClubId,
        homeTeamId: game.homeTeamId,
        awayTeamId: game.awayTeamId,
        homeIsOurs: clubTeamIds.includes(game.homeTeamId || 0),
        awayIsOurs: clubTeamIds.includes(game.awayTeamId || 0),
        calculatingFromPerspectiveOf: clubTeamIds.includes(game.homeTeamId || 0) ? 'home' : 
                                     clubTeamIds.includes(game.awayTeamId || 0) ? 'away' : 'neither'
      });
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

    const result = UnifiedGameScoreService.calculateGameScore(
      game, 
      centralizedScores || [], 
      perspective,
      clubTeamIds
    );

    // Debug result for Matrix team games
    if (game.homeTeamId === 1 || game.awayTeamId === 1) {
      console.log(`🔍 MATRIX GAME ${game.id} - Final result:`, {
        result: result.result,
        ourScore: result.ourScore,
        theirScore: result.theirScore,
        hasValidScore: result.hasValidScore,
        scoreSource: result.scoreSource,
        isInterClubGame: result.isInterClubGame
      });
    }

    return result;
  }, [game, centralizedScores, effectiveTeamId, urlClubId, urlClubTeams]);

  // Use the unified service result directly - no conversion needed

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

    // Use scoreResult directly - it already provides home/away scores
    if (scoreResult.hasValidScore) {
      return (
        <ScoreBadge 
          teamScore={scoreResult.homeScore} // Home team score (displayed first)
          opponentScore={scoreResult.awayScore} // Away team score (displayed second)
          result={scoreResult.result} // Use the unified service result for coloring
        />
      );
    }

    return (
      <div className="px-3 py-1 text-sm font-medium text-gray-500 bg-gray-50 rounded border border-gray-200">
        —
      </div>
    );
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

          {/* Position stats indicator */}
          {game.statusIsCompleted && (
            <>
              <span className="text-xs text-gray-500 mx-1">•</span>
              <span className="text-xs text-gray-500">
                {gameStats && gameStats.length > 0 ? '✓' : '×'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Right side - Score and Quarter Scores */}
      <div className="ml-auto flex items-center gap-4">
        {/* Quarter scores if enabled and available - matching recent form style */}
        {showQuarterScores && scoreResult.quarterBreakdown && scoreResult.quarterBreakdown.length > 0 && !isByeGame && !isUpcoming && (
          (() => {
            const quarterBreakdown = scoreResult.quarterBreakdown;
            
            // Determine team perspective for coloring
            const clubTeamIds = urlClubTeams?.map(t => t.id) || [];
            const isHomeOurs = clubTeamIds.includes(game.homeTeamId || 0);
            const isAwayOurs = clubTeamIds.includes(game.awayTeamId || 0);
            
            // Transform quarter breakdown to team/opponent perspective
            const quarterScores = quarterBreakdown.map(q => ({
              quarter: q.quarter,
              teamScore: isHomeOurs ? q.homeScore : q.awayScore,
              opponentScore: isHomeOurs ? q.awayScore : q.homeScore
            }));

            // Calculate cumulative scores
            const teamCumulative = [];
            const opponentCumulative = [];
            let teamTotal = 0;
            let opponentTotal = 0;

            for (let i = 0; i < quarterScores.length; i++) {
              teamTotal += quarterScores[i].teamScore;
              opponentTotal += quarterScores[i].opponentScore;
              teamCumulative.push(teamTotal);
              opponentCumulative.push(opponentTotal);
            }

            return (
              <div className="mr-4 flex items-center">
                <div className="text-xs space-y-1">
                  {/* Quarter-by-quarter scores on top (lighter) */}
                  <div className="grid grid-cols-4 gap-1">
                    {quarterScores.map((quarter, qIndex) => {
                      const quarterWin = quarter.teamScore > quarter.opponentScore;
                      const quarterLoss = quarter.teamScore < quarter.opponentScore;

                      // Display in Home-Away format but color by team perspective
                      let homeScore, awayScore;
                      if (isHomeOurs) {
                        // Current team is home
                        homeScore = quarter.teamScore;
                        awayScore = quarter.opponentScore;
                      } else {
                        // Current team is away
                        homeScore = quarter.opponentScore;
                        awayScore = quarter.teamScore;
                      }

                      const quarterClass = quarterWin 
                        ? 'bg-green-100 text-green-800 border border-green-400' 
                        : quarterLoss 
                          ? 'bg-red-100 text-red-800 border border-red-400'
                          : 'bg-amber-100 text-amber-800 border border-amber-400';

                      return (
                        <span key={qIndex} className={`w-16 px-1 py-0.5 ${quarterClass} rounded font-medium text-center block`}>
                          {homeScore}–{awayScore}
                        </span>
                      );
                    })}
                  </div>
                  {/* Cumulative scores underneath (darker) */}
                  <div className="grid grid-cols-4 gap-1">
                    {teamCumulative.map((teamCum, qIndex) => {
                      const opponentCum = opponentCumulative[qIndex];
                      const cumulativeWin = teamCum > opponentCum;
                      const cumulativeLoss = teamCum < opponentCum;

                      // Display in Home-Away format but color by team perspective
                      let homeCum, awayCum;
                      if (isHomeOurs) {
                        // Current team is home
                        homeCum = teamCum;
                        awayCum = opponentCum;
                      } else {
                        // Current team is away
                        homeCum = opponentCum;
                        awayCum = teamCum;
                      }

                      const cumulativeClass = cumulativeWin 
                        ? 'bg-green-200 text-green-800 border border-green-500' 
                        : cumulativeLoss 
                          ? 'bg-red-200 text-red-800 border border-red-500'
                          : 'bg-amber-200 text-amber-800 border border-amber-500';

                      return (
                        <span key={qIndex} className={`w-16 px-1 py-0.5 ${cumulativeClass} rounded text-xs text-center block`}>
                          {homeCum}–{awayCum}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()
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
          ) : scoreResult.hasValidScore ? (
            <ScoreBadge 
              teamScore={scoreResult.homeScore} // Home team score (displayed first)
              opponentScore={scoreResult.awayScore} // Away team score (displayed second)
              result={scoreResult.result} // Use the unified service result for coloring
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
    // Use team-based URL when currentTeamId is available, otherwise fall back to game-only URL
    const gameUrl = currentTeamId 
      ? `/team/${currentTeamId}/games/${game.id}`
      : `/game/${game.id}`;

    return (
      <Link href={gameUrl} className="block">
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