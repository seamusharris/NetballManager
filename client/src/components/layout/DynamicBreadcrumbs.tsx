
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

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (customItems) {
      return customItems;
    }

    const pathSegments = location.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Handle root paths
    if (pathSegments.length === 0 || location === '/') {
      return [{ label: 'Club Dashboard' }];
    }

    let currentPath = '';

    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i];
      currentPath += `/${segment}`;
      
      // Skip if this is the last segment (current page)
      const isLastSegment = i === pathSegments.length - 1;

      if (segment === 'team' && pathSegments[i + 1]) {
        // Handle team routes like /team/123/games
        const teamId = pathSegments[i + 1];
        const nextSegment = pathSegments[i + 2];
        
        if (nextSegment === 'games') {
          breadcrumbs.push({ label: 'Games', href: isLastSegment ? undefined : `/team/${teamId}/games` });
        } else if (nextSegment === 'preparation') {
          breadcrumbs.push({ label: 'Game Preparation', href: isLastSegment ? undefined : `/team/${teamId}/preparation` });
        } else if (nextSegment === 'roster') {
          breadcrumbs.push({ label: 'Roster Management', href: isLastSegment ? undefined : `/team/${teamId}/roster` });
        } else {
          breadcrumbs.push({ label: 'Team Dashboard', href: isLastSegment ? undefined : `/team/${teamId}` });
        }
        
        // Skip the team ID segment
        i += 1;
        if (nextSegment) i += 1;
        currentPath = `/team/${teamId}${nextSegment ? `/${nextSegment}` : ''}`;
        continue;
      }

      // Handle game routes
      if (segment === 'games' && pathSegments[i + 1] && !isNaN(Number(pathSegments[i + 1]))) {
        breadcrumbs.push({ label: 'Games', href: '/games' });
        const gameId = pathSegments[i + 1];
        const subRoute = pathSegments[i + 2];
        
        if (subRoute === 'live-stats') {
          breadcrumbs.push({ label: `Game ${gameId}`, href: `/games/${gameId}` });
          breadcrumbs.push({ label: 'Live Stats' });
        } else if (subRoute === 'live-stats-by-position') {
          breadcrumbs.push({ label: `Game ${gameId}`, href: `/games/${gameId}` });
          breadcrumbs.push({ label: 'Live Stats by Position' });
        } else {
          breadcrumbs.push({ label: `Game ${gameId}` });
        }
        break;
      }

      // Handle roster with game ID
      if (segment === 'roster' && pathSegments[i + 1] === 'game' && pathSegments[i + 2]) {
        const gameId = pathSegments[i + 2];
        breadcrumbs.push({ label: 'Games', href: '/games' });
        breadcrumbs.push({ label: `Game ${gameId}`, href: `/games/${gameId}` });
        breadcrumbs.push({ label: 'Roster Management' });
        break;
      }

      // Handle player availability routes
      if (segment === 'player-availability' && pathSegments[i + 1]) {
        const gameId = pathSegments[i + 1];
        breadcrumbs.push({ label: 'Games', href: '/games' });
        breadcrumbs.push({ label: `Game ${gameId}`, href: `/games/${gameId}` });
        breadcrumbs.push({ label: 'Player Availability' });
        break;
      }

      // Handle standard routes
      const routeLabels: Record<string, string> = {
        'dashboard': 'Team Dashboard',
        'team-dashboard': 'Team Dashboard',
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

  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        {!hideHome && (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink 
                onClick={() => navigate('/dashboard')}
                className="cursor-pointer flex items-center"
              >
                <Home className="h-4 w-4" />
              </BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumbItems.length > 0 && <BreadcrumbSeparator />}
          </>
        )}
        
        {breadcrumbItems.map((item, index) => [
          index > 0 && <BreadcrumbSeparator key={`separator-${index}`} />,
          <BreadcrumbItem key={`item-${index}`}>
            {index === breadcrumbItems.length - 1 ? (
              <BreadcrumbPage>{item.label}</BreadcrumbPage>
            ) : (
              <BreadcrumbLink 
                onClick={() => item.href && navigate(item.href)}
                className={item.href ? "cursor-pointer" : ""}
              >
                {item.label}
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
        ]).flat().filter(Boolean)}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
