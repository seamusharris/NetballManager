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

// Stable empty array reference to prevent re-renders
const EMPTY_GAME_STATS: any[] = [];

export default function GameResultCard({ 
  game, 
  layout = 'medium',
  className,
  gameStats = EMPTY_GAME_STATS,
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
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false, // Prevent refetch on window focus
    refetchOnReconnect: false, // Prevent refetch on reconnect
    refetchInterval: false, // Disable automatic refetching
  });

  // Calculate score result once and keep it completely stable
  const scoreResult = useMemo(() => {
    const perspective = 'club-wide';
    
    // Don't use any changing data - calculate with empty club team IDs for consistency
    // The score calculation should work without needing club team context
    const clubTeamIds: number[] = [];
    
    return UnifiedGameScoreService.calculateGameScore(
      game, 
      centralizedScores || EMPTY_GAME_STATS, 
      perspective,
      clubTeamIds
    );
  }, [game.id, centralizedScores]); // Only depend on stable data

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



  // Memoize the game state calculation to prevent constant recalculation
  const gameState = useMemo(() => {
    if (isByeGame) return 'bye';
    if (isUpcoming) return 'upcoming';
    if (isWin) return 'win';
    if (isLoss) return 'loss';
    if (isDraw) return 'draw';
    return 'other';
  }, [isByeGame, isUpcoming, isWin, isLoss, isDraw]);

  const getResultClass = () => {
    switch (gameState) {
      case 'bye': return 'border-gray-500 bg-gray-50';
      case 'upcoming': return 'border-blue-500 bg-blue-50';
      case 'win': return 'border-green-500 bg-green-50';
      case 'loss': return 'border-red-500 bg-red-50';
      case 'draw': return 'border-amber-500 bg-amber-50';
      default: return 'border-gray-400 bg-gray-100';
    }
  };

  const getHoverClass = () => {
    // Return specific hover colors that match the theme
    switch (gameState) {
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
        'border-l-4 border-t border-r border-b rounded transition-all duration-150 ease-in-out',
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
            const clubTeamIds = useMemo(() => urlClubTeams?.map(t => t.id) || EMPTY_GAME_STATS, [urlClubTeams]);
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
    // Use canonical club/team/game route when IDs are available
    const clubId = propCurrentClubId || currentClubId || urlClubId;
    const teamId = propCurrentTeamId || currentTeamId || game.homeTeamId;
    let gameUrl = `/game/${game.id}`;
    if (clubId && teamId) {
      gameUrl = `/club/${clubId}/team/${teamId}/game/${game.id}`;
    }
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