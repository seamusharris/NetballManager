
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
import { useClub } from '@/contexts/ClubContext';

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
  const { currentClub, currentTeam } = useClub();

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (customItems) {
      return customItems;
    }

    const pathSegments = location.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Always start with Club Dashboard
    breadcrumbs.push({ 
      label: 'Club Dashboard', 
      href: '/dashboard' 
    });

    // Handle root paths - just club dashboard
    if (pathSegments.length === 0 || location === '/' || location === '/dashboard') {
      return breadcrumbs.slice(0, 1); // Remove href to make it current page
    }

    let currentPath = '';

    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i];
      currentPath += `/${segment}`;
      
      // Skip if this is the last segment (current page)
      const isLastSegment = i === pathSegments.length - 1;

      // Handle team routes like /team/123 or /team/123/games
      if (segment === 'team' && pathSegments[i + 1]) {
        const teamId = pathSegments[i + 1];
        const nextSegment = pathSegments[i + 2];
        
        // Add Team Dashboard breadcrumb
        if (nextSegment) {
          breadcrumbs.push({ 
            label: 'Team Dashboard', 
            href: `/team/${teamId}` 
          });
        }
        
        // Handle team sub-routes
        if (nextSegment === 'games') {
          breadcrumbs.push({ 
            label: 'Games', 
            href: isLastSegment ? undefined : `/team/${teamId}/games` 
          });
        } else if (nextSegment === 'preparation') {
          breadcrumbs.push({ 
            label: 'Game Preparation', 
            href: isLastSegment ? undefined : `/team/${teamId}/preparation` 
          });
        } else if (nextSegment === 'roster') {
          breadcrumbs.push({ 
            label: 'Roster Management', 
            href: isLastSegment ? undefined : `/team/${teamId}/roster` 
          });
        } else if (!nextSegment) {
          // Just /team/123 - this is the team dashboard page
          breadcrumbs.push({ label: 'Team Dashboard' });
        }
        
        // Skip the team ID segment and next segment if it exists
        i += 1;
        if (nextSegment) i += 1;
        currentPath = `/team/${teamId}${nextSegment ? `/${nextSegment}` : ''}`;
        continue;
      }

      // Handle game routes without team context
      if (segment === 'games' && pathSegments[i + 1] && !isNaN(Number(pathSegments[i + 1]))) {
        // Add team dashboard if we have current team context
        if (currentTeam) {
          breadcrumbs.push({ 
            label: 'Team Dashboard', 
            href: `/team/${currentTeam.id}` 
          });
          breadcrumbs.push({ 
            label: 'Games', 
            href: `/team/${currentTeam.id}/games` 
          });
        } else {
          breadcrumbs.push({ label: 'Games', href: '/games' });
        }
        
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
        if (currentTeam) {
          breadcrumbs.push({ 
            label: 'Team Dashboard', 
            href: `/team/${currentTeam.id}` 
          });
          breadcrumbs.push({ 
            label: 'Games', 
            href: `/team/${currentTeam.id}/games` 
          });
        } else {
          breadcrumbs.push({ label: 'Games', href: '/games' });
        }
        breadcrumbs.push({ label: `Game ${gameId}`, href: `/games/${gameId}` });
        breadcrumbs.push({ label: 'Roster Management' });
        break;
      }

      // Handle player availability routes
      if (segment === 'player-availability' && pathSegments[i + 1]) {
        const gameId = pathSegments[i + 1];
        if (currentTeam) {
          breadcrumbs.push({ 
            label: 'Team Dashboard', 
            href: `/team/${currentTeam.id}` 
          });
          breadcrumbs.push({ 
            label: 'Games', 
            href: `/team/${currentTeam.id}/games` 
          });
        } else {
          breadcrumbs.push({ label: 'Games', href: '/games' });
        }
        breadcrumbs.push({ label: `Game ${gameId}`, href: `/games/${gameId}` });
        breadcrumbs.push({ label: 'Player Availability' });
        break;
      }

      // Handle standalone /games route
      if (segment === 'games' && pathSegments.length === 1) {
        // Add team dashboard if we have current team context
        if (currentTeam) {
          breadcrumbs.push({ 
            label: 'Team Dashboard', 
            href: `/team/${currentTeam.id}` 
          });
        }
        breadcrumbs.push({ label: 'Games' });
        break;
      }

      // Handle standard routes
      const routeLabels: Record<string, string> = {
        'dashboard': 'Club Dashboard',
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
        {breadcrumbItems.map((item, index) => [
          index > 0 && <BreadcrumbSeparator key={`separator-${index}`} />,
          <BreadcrumbItem key={`item-${index}`}>
            {index === 0 && !hideHome ? (
              <BreadcrumbLink 
                onClick={() => navigate('/dashboard')}
                className="cursor-pointer flex items-center"
              >
                <Home className="h-4 w-4 mr-1" />
                {item.label}
              </BreadcrumbLink>
            ) : index === breadcrumbItems.length - 1 ? (
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
