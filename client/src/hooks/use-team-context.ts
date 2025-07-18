import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { useMemo } from 'react';

/**
 * Standard utility for extracting team context from URL
 * Handles both /team/:teamId and /club/:clubId/team/:teamId patterns
 */
export function useTeamContext() {
  const [location] = useLocation();

  // Extract team ID from URL - supports both patterns
  const teamId = useMemo(() => {
    // New pattern: /team/:teamId
    const newPatternMatch = location.match(/\/team\/(\d+)/);
    if (newPatternMatch) {
      return parseInt(newPatternMatch[1]);
    }
    
    // Legacy pattern: /club/:clubId/team/:teamId
    const legacyPatternMatch = location.match(/\/club\/\d+\/team\/(\d+)/);
    if (legacyPatternMatch) {
      return parseInt(legacyPatternMatch[1]);
    }
    
    return null;
  }, [location]);

  // Fetch team data
  const { data: team, isLoading: isLoadingTeam, error: teamError } = useQuery({
    queryKey: ['team-context', teamId],
    queryFn: async () => {
      if (!teamId) return null;
      return await apiClient.get(`/api/teams/${teamId}`);
    },
    enabled: !!teamId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch club data based on team's club ID
  const { data: club, isLoading: isLoadingClub, error: clubError } = useQuery({
    queryKey: ['club-context', team?.clubId],
    queryFn: async () => {
      if (!team?.clubId) return null;
      return await apiClient.get(`/api/clubs/${team.clubId}`);
    },
    enabled: !!team?.clubId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    // IDs
    teamId,
    clubId: team?.clubId || null,
    
    // Names (safe string extraction)
    teamName: (team?.name && typeof team.name === 'string') ? team.name : null,
    clubName: (club?.name && typeof club.name === 'string') ? club.name : null,
    
    // Full objects (for components that need more data)
    team,
    club,
    
    // Loading states
    isLoading: isLoadingTeam || isLoadingClub,
    isLoadingTeam,
    isLoadingClub,
    
    // Error states
    error: teamError || clubError,
    teamError,
    clubError,
    
    // Utility flags
    hasTeam: !!team,
    hasClub: !!club,
  };
}

/**
 * Utility function to extract team ID from URL
 * Can be used independently when you only need the ID
 */
export function extractTeamIdFromUrl(url?: string): number | null {
  const location = url || window.location.pathname;
  
  // New pattern: /team/:teamId
  const newPatternMatch = location.match(/\/team\/(\d+)/);
  if (newPatternMatch) {
    return parseInt(newPatternMatch[1]);
  }
  
  // Legacy pattern: /club/:clubId/team/:teamId
  const legacyPatternMatch = location.match(/\/club\/\d+\/team\/(\d+)/);
  if (legacyPatternMatch) {
    return parseInt(legacyPatternMatch[1]);
  }
  
  return null;
}

/**
 * Utility function to extract club ID from URL
 * Can be used independently when you only need the ID
 */
export function extractClubIdFromUrl(url?: string): number | null {
  const location = url || window.location.pathname;
  
  // Direct club pattern: /club/:clubId
  const clubPatternMatch = location.match(/\/club\/(\d+)/);
  if (clubPatternMatch) {
    return parseInt(clubPatternMatch[1]);
  }
  
  return null;
}