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
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { getClubDisplayName } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

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
  const { currentClub } = useClub();

  // Fetch club name if we have a club ID
  const clubId = React.useMemo(() => {
    const match = location.match(/\/club\/(\d+)/);
    return match ? parseInt(match[1]) : null;
  }, [location]);

  // For legacy team routes, we need to get club ID from team data
  const legacyTeamId = React.useMemo(() => {
    const match = location.match(/\/team\/(\d+)/);
    return match ? parseInt(match[1]) : null;
  }, [location]);

  const { data: teamClubId, isLoading: isLoadingTeam } = useQuery({
    queryKey: ['team-club', legacyTeamId],
    queryFn: async () => {
      if (!legacyTeamId) return null;
      const team = await apiClient.get(`/api/teams/${legacyTeamId}`) as any;
      return team?.club_id || null;
    },
    enabled: !!legacyTeamId && !clubId,
    staleTime: 300000, // 5 minutes
  });

  // Use team's club ID for legacy routes if we don't have a club ID from URL
  const effectiveClubId = clubId || teamClubId;

  const { data: clubData, isLoading: isLoadingClub } = useQuery({
    queryKey: ['club', effectiveClubId],
    queryFn: async () => {
      if (!effectiveClubId) return null;
      const club = await apiClient.get(`/api/clubs/${effectiveClubId}`) as any;
      return club || null;
    },
    enabled: !!effectiveClubId,
    staleTime: 300000, // 5 minutes
  });

  const clubName = getClubDisplayName(clubData);

  // Fetch team name if we have a team ID
  const teamId = React.useMemo(() => {
    const match = location.match(/\/team\/(\d+)/);
    return match ? parseInt(match[1]) : null;
  }, [location]);

  const { data: teamName, isLoading: isLoadingTeamName } = useQuery({
    queryKey: ['team', teamId],
    queryFn: async () => {
      if (!teamId) return null;
      const team = await apiClient.get(`/api/teams/${teamId}`) as any;
      return team?.name || null;
    },
    enabled: !!teamId,
    staleTime: 300000, // 5 minutes
  });

  // Fetch game details if we have a game ID
  const gameId = React.useMemo(() => {
    const match = location.match(/\/game\/(\d+)/);
    return match ? parseInt(match[1]) : null;
  }, [location]);

  const { data: gameDetails, isLoading: isLoadingGame } = useQuery({
    queryKey: ['game', gameId],
    queryFn: async () => {
      if (!gameId) return null;
      const game = await apiClient.get(`/api/games/${gameId}`) as any;
      return game;
    },
    enabled: !!gameId,
    staleTime: 300000, // 5 minutes
  });

  const routeLabels: Record<string, string> = {
    'dashboard': 'Dashboard',
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

    // Handle club routes
    if (pathSegments[0] === 'club' && pathSegments[1]) {
      const clubId = pathSegments[1];
      // Club dashboard
      if (pathSegments.length === 2) {
        return [
          { label: 'Home', href: '/' },
          { label: clubName || 'Club Dashboard' }
        ];
      }
      // Club sub-routes (e.g., /club/:id/games, /club/:id/players, etc.)
      if (pathSegments.length === 3) {
        const subLabel = routeLabels[pathSegments[2]] || pathSegments[2].charAt(0).toUpperCase() + pathSegments[2].slice(1);
        return [
          { label: 'Home', href: '/' },
          { label: clubName || 'Club Dashboard', href: `/club/${clubId}` },
          { label: subLabel }
        ];
      }

      // Team routes
      if (pathSegments[2] === 'team' && pathSegments[3]) {
        const teamId = pathSegments[3];
        
        // Team dashboard
        if (pathSegments.length === 4) {
          return [
            { label: 'Home', href: '/' },
            { label: clubName, href: `/club/${clubId}` },
            { label: teamName || 'Team Dashboard' }
          ];
        }

        // Team sub-routes
        if (pathSegments[4] === 'games') {
          return [
            { label: 'Home', href: '/' },
            { label: clubName, href: `/club/${clubId}` },
            { label: teamName || 'Team', href: `/club/${clubId}/team/${teamId}` },
            { label: 'Games' }
          ];
        }

        if (pathSegments[4] === 'players') {
          return [
            { label: 'Home', href: '/' },
            { label: clubName, href: `/club/${clubId}` },
            { label: teamName || 'Team', href: `/club/${clubId}/team/${teamId}` },
            { label: 'Players' }
          ];
        }

        if (pathSegments[4] === 'roster') {
          return [
            { label: 'Home', href: '/' },
            { label: clubName, href: `/club/${clubId}` },
            { label: teamName || 'Team', href: `/club/${clubId}/team/${teamId}` },
            { label: 'Roster' }
          ];
        }

        // Game routes
        if (pathSegments[4] === 'game' && pathSegments[5]) {
          const gameId = pathSegments[5];
          
          // Game details
          if (pathSegments.length === 6) {
            const roundLabel = gameDetails && gameDetails.round ? `Round ${gameDetails.round}` : 'Game Details';
            return [
              { label: 'Home', href: '/' },
              { label: clubName, href: `/club/${clubId}` },
              { label: teamName || 'Team', href: `/club/${clubId}/team/${teamId}` },
              { label: 'Games', href: `/club/${clubId}/team/${teamId}/games` },
              { label: roundLabel }
            ];
          }

          // Game sub-routes (stats, etc.)
          if (pathSegments[6] === 'stats') {
            const statsAction = pathSegments[7] || 'view';
            const actionLabel = statsAction === 'record' ? 'Record Stats' : 
                              statsAction === 'view' ? 'View Stats' : 
                              statsAction === 'edit' ? 'Edit Stats' : 'Stats';
            
            const gameLabel = gameDetails 
              ? `${gameDetails.home_team_name || gameDetails.homeTeamName || 'Home'} vs ${gameDetails.away_team_name || gameDetails.awayTeamName || 'Away'}`
              : `Game ${gameId}`;
            
            return [
              { label: 'Home', href: '/' },
              { label: clubName, href: `/club/${clubId}` },
              { label: teamName || 'Team', href: `/club/${clubId}/team/${teamId}` },
              { label: 'Games', href: `/club/${clubId}/team/${teamId}/games` },
              { label: gameLabel, href: `/club/${clubId}/team/${teamId}/game/${gameId}` },
              { label: actionLabel }
            ];
          }
        }
      }
    }

    // Handle legacy team routes (for backward compatibility)
    if (pathSegments[0] === 'team' && pathSegments[1] && !isNaN(Number(pathSegments[1]))) {
      const teamId = parseInt(pathSegments[1]);
      // Team dashboard
      if (pathSegments.length === 2) {
        return [
          { label: 'Home', href: '/' },
          { label: isLoadingTeam || isLoadingClub ? '' : clubName, href: `/club/${effectiveClubId || 54}` },
          { label: teamName || 'Team Dashboard' }
        ];
      }
      // Team sub-routes
      if (pathSegments[2] === 'games') {
        // If loading team or club, show loading skeleton (handled in main render)
        // Game details
        if (pathSegments[3] && !isNaN(Number(pathSegments[3]))) {
          const gameId = parseInt(pathSegments[3]);
          const roundLabel = gameDetails && gameDetails.round ? `Round ${gameDetails.round}` : 'Game Details';
          return [
            { label: 'Home', href: '/' },
            { label: clubName, href: `/club/${effectiveClubId || 54}` },
            { label: teamName || 'Team', href: `/team/${teamId}` },
            { label: 'Games', href: `/team/${teamId}/games` },
            { label: roundLabel }
          ];
        }
        return [
          { label: 'Home', href: '/' },
          { label: clubName, href: `/club/${effectiveClubId || 54}` },
          { label: teamName || 'Team', href: `/team/${teamId}` },
          { label: 'Games' }
        ];
      }
      if (pathSegments[2] === 'players') {
        return [
          { label: 'Home', href: '/' },
          { label: clubName, href: `/club/${effectiveClubId || 54}` },
          { label: teamName || 'Team', href: `/team/${teamId}` },
          { label: 'Players' }
        ];
      }
      if (pathSegments[2] === 'roster') {
        return [
          { label: 'Home', href: '/' },
          { label: clubName, href: `/club/${effectiveClubId || 54}` },
          { label: teamName || 'Team', href: `/team/${teamId}` },
          { label: 'Roster' }
        ];
      }
      // Legacy game routes
      if (pathSegments[2] === 'games' && pathSegments[3] && !isNaN(Number(pathSegments[3]))) {
        const gameId = parseInt(pathSegments[3]);
        const roundLabel = gameDetails && gameDetails.round ? `Round ${gameDetails.round}` : 'Game Details';
        return [
          { label: 'Home', href: '/' },
          { label: clubName, href: `/club/${effectiveClubId || 54}` },
          { label: teamName || 'Team', href: `/team/${teamId}` },
          { label: 'Games', href: `/team/${teamId}/games` },
          { label: roundLabel }
        ];
      }
    }

    // Handle other legacy routes (for backward compatibility)
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

  // Add loading state detection for club, team, and game
  const isClubLoading = isLoadingClub;
  const isTeamLoading = isLoadingTeam;
  const isGameLoading = isLoadingGame;

  // If any required data is loading, show a skeleton
  if (isClubLoading || isTeamLoading || isGameLoading) {
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