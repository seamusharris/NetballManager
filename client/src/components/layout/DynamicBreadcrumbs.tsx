import React from 'react';
import { useLocation } from 'wouter';
import { Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Skeleton } from '@/components/ui/skeleton';
import { useTeamClubGameContext } from '@/hooks/use-team-club-game-context';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface DynamicBreadcrumbsProps {
  customItems?: BreadcrumbItem[];
  hideHome?: boolean;
}

export function DynamicBreadcrumbs({ customItems, hideHome = false }: DynamicBreadcrumbsProps) {
  const [location, navigate] = useLocation();
  
  // Use centralized context for all team/club/game data
  const { team, club, game, isLoading } = useTeamClubGameContext();

  const routeLabels: Record<string, string> = {
    'dashboard': 'Home',
    'games': 'Games',
    'players': 'Players',
    'teams': 'Teams',
    'roster': 'Roster',
    'seasons': 'Seasons',
    'statistics': 'Statistics',
    'settings': 'Settings',
    'data-management': 'Data Management',
    'opponent-preparation': 'Opponent Preparation',
    'preparation': 'Game Preparation',
    'clubs': 'Club Management',
    'opponent-analysis': 'Matchup Analysis'
  };

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (customItems) {
      return customItems;
    }

    const pathSegments = location.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Handle root paths
    if (pathSegments.length === 0 || location === '/') {
      return [{ label: 'Home' }];
    }

    // Always start with Home
    breadcrumbs.push({ label: 'Home', href: '/' });

    // If we have team data, add club and team
    if (team) {
      breadcrumbs.push({ 
        label: (club as any)?.name || 'Club', 
        href: `/club/${(club as any)?.id || ''}` 
      });
      breadcrumbs.push({ 
        label: (team as any).name || 'Team', 
        href: `/team/${(team as any).id}` 
      });
    }

    // Handle different route patterns
    if (pathSegments[0] === 'team' && pathSegments[1]) {
      const teamId = pathSegments[1];
      
      // Team dashboard
      if (pathSegments.length === 2) {
        return breadcrumbs;
      }

      // Team sub-routes
      if (pathSegments[2] === 'games') {
        breadcrumbs.push({ label: 'Games', href: `/team/${teamId}/games` });
        
        // Game details
        if (pathSegments[3] && !isNaN(Number(pathSegments[3]))) {
          const gameId = parseInt(pathSegments[3]);
          const gameLabel = game 
            ? `${(game as any).homeTeamName || 'Home'} vs ${(game as any).awayTeamName || 'Away'}`
            : `Game ${gameId}`;
          breadcrumbs.push({ label: gameLabel });
        }
        return breadcrumbs;
      }

      if (pathSegments[2] === 'players') {
        breadcrumbs.push({ label: 'Players' });
        return breadcrumbs;
      }

      if (pathSegments[2] === 'roster') {
        breadcrumbs.push({ label: 'Roster' });
        return breadcrumbs;
      }

      if (pathSegments[2] === 'analysis') {
        breadcrumbs.push({ label: 'Team Analysis' });
        return breadcrumbs;
      }

      if (pathSegments[2] === 'availability') {
        breadcrumbs.push({ label: 'Availability', href: `/team/${teamId}/availability` });
        
        // If there's a game ID
        if (pathSegments[3] && !isNaN(Number(pathSegments[3]))) {
          const gameId = parseInt(pathSegments[3]);
          const gameLabel = game 
            ? `${(game as any).homeTeamName || 'Home'} vs ${(game as any).awayTeamName || 'Away'}`
            : `Game ${gameId}`;
          breadcrumbs.push({ label: gameLabel });
        }
        return breadcrumbs;
      }

      // Handle /team/:teamId/game/:gameId pattern
      if (pathSegments[2] === 'game' && pathSegments[3] && !isNaN(Number(pathSegments[3]))) {
        const gameId = parseInt(pathSegments[3]);
        breadcrumbs.push({ label: 'Games', href: `/team/${teamId}/games` });
        
        const gameLabel = game 
          ? `${(game as any).homeTeamName || 'Home'} vs ${(game as any).awayTeamName || 'Away'}`
          : `Game ${gameId}`;
        breadcrumbs.push({ label: gameLabel });
        
        // Check if next segment is availability
        if (pathSegments[4] === 'availability') {
          breadcrumbs.push({ label: 'Availability' });
        }
        return breadcrumbs;
      }
    }

    // Handle club routes
    if (pathSegments[0] === 'club' && pathSegments[1]) {
      const clubId = pathSegments[1];
      
      // Club dashboard
      if (pathSegments.length === 2) {
        breadcrumbs.push({ label: (club as any)?.name || 'Club Dashboard' });
        return breadcrumbs;
      }

      // Club sub-routes
      if (pathSegments.length === 3) {
        const subLabel = routeLabels[pathSegments[2]] || pathSegments[2].charAt(0).toUpperCase() + pathSegments[2].slice(1);
        breadcrumbs.push({ label: (club as any)?.name || 'Club', href: `/club/${clubId}` });
        breadcrumbs.push({ label: subLabel });
        return breadcrumbs;
      }

      // Team routes under club
      if (pathSegments[2] === 'team' && pathSegments[3]) {
        const teamId = pathSegments[3];
        breadcrumbs.push({ label: (club as any)?.name || 'Club', href: `/club/${clubId}` });
        breadcrumbs.push({ label: (team as any)?.name || 'Team', href: `/club/${clubId}/team/${teamId}` });
        
        // Team sub-routes
        if (pathSegments[4] === 'games') {
          breadcrumbs.push({ label: 'Games' });
        } else if (pathSegments[4] === 'players') {
          breadcrumbs.push({ label: 'Players' });
        } else if (pathSegments[4] === 'roster') {
          breadcrumbs.push({ label: 'Roster' });
        }
        return breadcrumbs;
      }
    }

    // Handle other routes (fallback)
    let currentPath = '';
    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i];
      currentPath += `/${segment}`;
      const isLastSegment = i === pathSegments.length - 1;
      const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

      if (isLastSegment) {
        breadcrumbs.push({ label });
      } else {
        breadcrumbs.push({ label, href: currentPath });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbItems = generateBreadcrumbs();

  // If any required data is loading, show a skeleton
  if (isLoading) {
    return (
      <nav className="flex items-center space-x-2 mb-4" aria-label="Breadcrumb">
        <Skeleton className="h-6 w-2/3 rounded bg-gray-200 animate-pulse" />
      </nav>
    );
  }

  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => [
          index > 0 && <BreadcrumbSeparator key={`separator-${index}`} />,
          <BreadcrumbItem key={`item-${index}`}>
            {index === breadcrumbItems.length - 1 ? (
              <BreadcrumbPage>{typeof item.label === 'string' ? item.label : 'Page'}</BreadcrumbPage>
            ) : (
              <BreadcrumbLink 
                onClick={() => item.href && navigate(item.href)}
                className={item.href ? "cursor-pointer" : ""}
              >
                {typeof item.label === 'string' ? item.label : 'Link'}
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
        ]).flat().filter(Boolean)}
      </BreadcrumbList>
    </Breadcrumb>
  );
}