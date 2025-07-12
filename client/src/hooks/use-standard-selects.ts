
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

// Base types for select options
export interface SelectOption {
  id: number;
  name: string;
  displayName?: string;
  isActive?: boolean;
  [key: string]: any;
}

export interface StandardSelectHookOptions extends Omit<UseQueryOptions, 'queryKey' | 'queryFn'> {
  transform?: (data: any) => SelectOption[];
  filterActive?: boolean;
}

// Seasons
export function useSeasonsSelect(options: StandardSelectHookOptions = {}) {
  const { transform, filterActive = false, ...queryOptions } = options;
  
  return useQuery({
    queryKey: ['seasons'],
    queryFn: () => apiClient.get('/api/seasons'),
    select: (data) => {
      let seasons = data || [];
      if (filterActive) {
        seasons = seasons.filter((s: any) => s.isActive);
      }
      return transform ? transform(seasons) : seasons.map((season: any) => ({
        id: season.id,
        name: season.name,
        displayName: `${season.name} (${season.year})${season.isActive ? ' (Active)' : ''}`,
        isActive: season.isActive,
        year: season.year,
        ...season
      }));
    },
    ...queryOptions
  });
}

// Sections for a specific season
export function useSectionsSelect(seasonId: number | undefined, options: StandardSelectHookOptions = {}) {
  const { transform, ...queryOptions } = options;
  
  return useQuery({
    queryKey: ['sections', seasonId],
    queryFn: () => seasonId ? apiClient.get(`/api/seasons/${seasonId}/sections`) : Promise.resolve([]),
    select: (data) => {
      const sections = data || [];
      return transform ? transform(sections) : sections.map((section: any) => ({
        id: section.id,
        name: section.sectionName || section.name,
        displayName: `${section.displayName} (${section.teamCount || 0} teams)`,
        ageGroup: section.ageGroup,
        teamCount: section.teamCount || 0,
        maxTeams: section.maxTeams,
        ...section
      }));
    },
    enabled: !!seasonId,
    ...queryOptions
  });
}

// Teams for current club
export function useTeamsSelect(options: StandardSelectHookOptions = {}) {
  const { transform, filterActive = true, ...queryOptions } = options;
  
  // Get the current club ID from the URL or context
  const getCurrentClubId = () => {
    // Try to get club ID from URL first - check multiple patterns
    const pathname = window.location.pathname;
    
    // Pattern 1: /club/123/teams
    let urlMatch = pathname.match(/\/club\/(\d+)/);
    if (urlMatch) {
      return parseInt(urlMatch[1]);
    }
    
    // Pattern 2: /club/123 (without /teams)
    urlMatch = pathname.match(/\/club\/(\d+)$/);
    if (urlMatch) {
      return parseInt(urlMatch[1]);
    }
    
    // Pattern 3: /club/123/anything
    urlMatch = pathname.match(/\/club\/(\d+)\//);
    if (urlMatch) {
      return parseInt(urlMatch[1]);
    }
    
    // Fallback to context (for backward compatibility)
    return null;
  };
  
  const clubId = getCurrentClubId();
  const endpoint = clubId ? `/api/clubs/${clubId}/teams` : '/api/teams';
  const queryKey = clubId ? ['teams', clubId] : ['teams'];
  
  return useQuery({
    queryKey,
    queryFn: () => apiClient.get(endpoint),
    select: (data) => {
      let teams = data || [];
      if (filterActive) {
        teams = teams.filter((t: any) => t.isActive);
      }
      return transform ? transform(teams) : teams.map((team: any) => ({
        id: team.id,
        name: team.name,
        displayName: `${team.name} (${team.division || team.seasonName})`,
        division: team.division,
        seasonName: team.seasonName,
        isActive: team.isActive,
        ...team
      }));
    },
    ...queryOptions
  });
}

// Players for current club
export function usePlayersSelect(options: StandardSelectHookOptions = {}) {
  const { transform, filterActive = true, ...queryOptions } = options;
  
  return useQuery({
    queryKey: ['players'],
    queryFn: () => apiClient.get('/api/players'),
    select: (data) => {
      let players = data || [];
      if (filterActive) {
        players = players.filter((p: any) => p.isActive !== false);
      }
      return transform ? transform(players) : players.map((player: any) => ({
        id: player.id,
        name: player.displayName || `${player.firstName} ${player.lastName}`,
        displayName: player.displayName || `${player.firstName} ${player.lastName}`,
        positions: player.positionPreferences || [],
        ...player
      }));
    },
    ...queryOptions
  });
}

// Game statuses
export function useGameStatusesSelect(options: StandardSelectHookOptions = {}) {
  const { transform, ...queryOptions } = options;
  
  return useQuery({
    queryKey: ['game-statuses'],
    queryFn: () => apiClient.get('/api/game-statuses'),
    select: (data) => {
      const statuses = data || [];
      return transform ? transform(statuses) : statuses.map((status: any) => ({
        id: status.id,
        name: status.name,
        displayName: status.displayName || status.name,
        isCompleted: status.isCompleted,
        allowsStatistics: status.allowsStatistics,
        ...status
      }));
    },
    ...queryOptions
  });
}

// Clubs (for admin users)
export function useClubsSelect(options: StandardSelectHookOptions = {}) {
  const { transform, ...queryOptions } = options;
  
  return useQuery({
    queryKey: ['user-clubs'],
    queryFn: () => apiClient.get('/api/user/clubs'),
    select: (data) => {
      const clubs = data || [];
      return transform ? transform(clubs) : clubs.map((club: any) => ({
        id: club.clubId,
        name: club.clubName,
        displayName: `${club.clubName} (${club.clubCode})`,
        code: club.clubCode,
        role: club.role,
        ...club
      }));
    },
    ...queryOptions
  });
}
