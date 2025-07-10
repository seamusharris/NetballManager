
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { formatShortDate } from '@/lib/utils';
import GameResultCard from '@/components/ui/game-result-card';
import { ViewMoreButton } from '@/components/ui/view-more-button';
import { standardFilters, contextualFilters } from '@/lib/gameFilters';
import { Game } from '@shared/schema';

// Unified configuration for all game display scenarios
export interface UnifiedGameWidgetConfig {
  // Data and context
  games: Game[];
  currentTeamId?: number;
  currentClubId?: number;
  batchScores?: Record<number, any[]>;
  batchStats?: Record<number, any[]>;
  
  // Display configuration
  title?: string;
  mode: 'recent-form' | 'upcoming' | 'completed' | 'statistics-eligible' | 'all';
  maxGames?: number;
  compact?: boolean;
  
  // Styling
  className?: string;
  
  // Navigation
  showViewMore?: boolean;
  viewMoreHref?: string;
  viewMoreText?: string;
  
  // Analytics (for GameAnalysisWidget replacement)
  showAnalytics?: boolean;
  showQuarterScores?: boolean;
  excludeSpecialGames?: boolean;
  
  // Empty state
  emptyMessage?: string;
  emptyDescription?: string;
}

export function UnifiedGameWidget({
  games = [],
  currentTeamId,
  currentClubId,
  batchScores = {},
  batchStats = {},
  title,
  mode,
  maxGames = 5,
  compact = false,
  className = "",
  showViewMore = false,
  viewMoreHref,
  viewMoreText = "View more →",
  showAnalytics = false,
  showQuarterScores = true,
  excludeSpecialGames = false,
  emptyMessage,
  emptyDescription
}: UnifiedGameWidgetConfig) {
  
  // Apply standardized filtering based on mode and context
  const getFilteredGames = (): Game[] => {
    const filters = currentTeamId 
      ? contextualFilters.forTeam(games, currentTeamId)
      : currentClubId 
        ? contextualFilters.forClub(games, currentClubId)
        : null;
    
    switch (mode) {
      case 'recent-form':
        return filters ? filters.recent(maxGames) : standardFilters.recentForm(games, maxGames);
      
      case 'upcoming':
        return (filters ? filters.upcoming() : standardFilters.upcomingGames(games))
          .slice(0, maxGames);
      
      case 'completed':
        return (filters ? filters.completed() : standardFilters.completedGames(games))
          .slice(0, maxGames);
      
      case 'statistics-eligible':
        return standardFilters.statisticsEligibleGames(games).slice(0, maxGames);
      
      case 'all':
        return games.slice(0, maxGames);
      
      default:
        return [];
    }
  };

  const filteredGames = getFilteredGames();
  const hasMoreGames = games.length > maxGames;

  // Auto-generate title if not provided
  const displayTitle = title || (() => {
    const context = currentTeamId ? 'Team' : currentClubId ? 'Club' : '';
    switch (mode) {
      case 'recent-form': return `Recent ${context} Form`;
      case 'upcoming': return `Upcoming ${context} Games`;
      case 'completed': return `Recent ${context} Games`;
      case 'statistics-eligible': return `${context} Statistics`;
      default: return `${context} Games`;
    }
  })();

  // Auto-generate empty message if not provided
  const displayEmptyMessage = emptyMessage || (() => {
    switch (mode) {
      case 'recent-form': return 'No recent games available';
      case 'upcoming': return 'No upcoming games scheduled';
      case 'completed': return 'No completed games found';
      case 'statistics-eligible': return 'No games with statistics available';
      default: return 'No games available';
    }
  })();

  const displayEmptyDescription = emptyDescription || 'Games will appear here once they are available.';

  // Empty state
  if (filteredGames.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-800">
            {displayTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-8">
            <AlertCircle className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600">{displayEmptyMessage}</p>
            <p className="text-xs text-gray-500 mt-1">{displayEmptyDescription}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-800">
          {displayTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className={`space-y-${compact ? '2' : '3'}`}>
          {filteredGames.map((game) => (
            <GameResultCard
              key={game.id}
              game={game}
              currentTeamId={currentTeamId || 0}
              centralizedScores={batchScores[game.id] || []}
              gameStats={batchStats[game.id] || []}
              showLink={true}
              showQuarterScores={showQuarterScores}
              className="w-full"
            />
          ))}
        </div>

        {/* View More Button */}
        {showViewMore && viewMoreHref && hasMoreGames && (
          <div className="mt-3">
            <ViewMoreButton href={viewMoreHref}>
              {viewMoreText}
            </ViewMoreButton>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Convenience wrapper functions for common use cases
export const RecentFormWidget = (props: Omit<UnifiedGameWidgetConfig, 'mode'>) => 
  <UnifiedGameWidget {...props} mode="recent-form" />;

export const UpcomingGamesWidget = (props: Omit<UnifiedGameWidgetConfig, 'mode'>) => 
  <UnifiedGameWidget {...props} mode="upcoming" />;

export const CompletedGamesWidget = (props: Omit<UnifiedGameWidgetConfig, 'mode'>) => 
  <UnifiedGameWidget {...props} mode="completed" />;

export default UnifiedGameWidget;
