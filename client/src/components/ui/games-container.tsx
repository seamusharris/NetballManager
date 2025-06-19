
import React from 'react';
import { BaseWidget, CustomHeaderWidget } from '@/components/ui/base-widget';
import GameResultCard from '@/components/ui/game-result-card';
import { Game } from '@shared/schema';
import { cn } from '@/lib/utils';

interface GamesContainerProps {
  title: string;
  description?: string;
  games: Game[];
  centralizedScores?: any;
  currentTeamId?: number;
  players?: any[];
  className?: string;
  headerContent?: React.ReactNode;
  showQuickActions?: boolean;
  layout?: 'narrow' | 'medium' | 'wide';
  emptyMessage?: string;
  maxGames?: number;
}

export function GamesContainer({
  title,
  description,
  games,
  centralizedScores,
  currentTeamId,
  players = [],
  className,
  headerContent,
  showQuickActions = false,
  layout = 'medium',
  emptyMessage = "No games to display",
  maxGames
}: GamesContainerProps) {
  const displayGames = maxGames ? games.slice(0, maxGames) : games;

  const Widget = headerContent ? CustomHeaderWidget : BaseWidget;

  return (
    <Widget
      title={title}
      description={description}
      headerContent={headerContent}
      className={className}
    >
      {displayGames.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {emptyMessage}
        </div>
      ) : (
        <div className="space-y-4">
          {displayGames.map((game) => (
            <GameResultCard
              key={game.id}
              game={game}
              players={players}
              currentTeamId={currentTeamId}
              centralizedScores={centralizedScores}
              showQuickActions={showQuickActions}
              layout={layout}
              className="w-full"
            />
          ))}
        </div>
      )}
    </Widget>
  );
}

// Specialized containers for common use cases
export function RecentGamesContainer(props: Omit<GamesContainerProps, 'title'>) {
  return (
    <GamesContainer
      {...props}
      title="Recent Games"
      description="Latest completed games"
      emptyMessage="No recent games found"
    />
  );
}

export function UpcomingGamesContainer(props: Omit<GamesContainerProps, 'title'>) {
  return (
    <GamesContainer
      {...props}
      title="Upcoming Games"
      description="Scheduled games"
      emptyMessage="No upcoming games scheduled"
    />
  );
}

export function HistoricalGamesContainer(props: Omit<GamesContainerProps, 'title'>) {
  return (
    <GamesContainer
      {...props}
      title="Historical Games"
      description="Past game results"
      emptyMessage="No historical games found"
    />
  );
}

// Compact container for dashboard widgets
export function CompactGamesContainer(props: Omit<GamesContainerProps, 'layout' | 'className'>) {
  return (
    <GamesContainer
      {...props}
      layout="narrow"
      className="space-y-3"
    />
  );
}

// Full-width container for main pages
export function FullWidthGamesContainer(props: Omit<GamesContainerProps, 'layout'>) {
  return (
    <GamesContainer
      {...props}
      layout="wide"
    />
  );
}
