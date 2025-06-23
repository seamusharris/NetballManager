import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, startTransition, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

import { CACHE_KEYS } from '@/lib/cacheKeys';

interface Club {
  id: number;
  name: string;
  code: string;
  primaryColor: string;
  secondaryColor: string;
}

interface UserClubAccess {
  clubId: number;
  clubName: string;
  clubCode: string;
  role: string;
  permissions: {
    canManagePlayers: boolean;
    canManageGames: boolean;
    canManageStats: boolean;
    canViewOtherTeams: boolean;
  };
}

interface Team {
  id: number;
  name: string;
  clubId: number;
}

interface ClubContextType {
  currentClub: Club | null;
  currentClubId: number | null;
  currentTeamId: number | null;
  currentTeam: Team | null;
  userClubs: UserClubAccess[];
  clubTeams: Team[];
  switchClub: (clubId: number) => void;
  setCurrentTeamId: (teamId: number | null) => void;
  hasPermission: (permission: keyof UserClubAccess['permissions']) => boolean;
  isLoading: boolean;
  isInitialized: boolean;
}

const ClubContext = createContext<ClubContextType | undefined>(undefined);

function ClubProvider({ children }: { children: React.ReactNode }) {
  const [currentClubId, setCurrentClubId] = useState<number | null>(null);
  const [currentTeamId, setCurrentTeamId] = useState<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const teamChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const queryClient = useQueryClient();

  // Fetch user's club access
  const { data: userClubs = [], isLoading: isLoadingClubs } = useQuery<UserClubAccess[]>({
    queryKey: ['user-clubs'],
    queryFn: () => apiClient.get('/api/user/clubs'),
  });

  // Fetch current club details
  const { data: currentClub = null, isLoading: isLoadingClub } = useQuery<Club>({
    queryKey: ['club', currentClubId],
    queryFn: () => apiClient.get(`/api/clubs/${currentClubId}`),
    enabled: !!currentClubId,
  });

  // Fetch teams when club changes
  const { data: clubTeams = [], isLoading: isLoadingTeams } = useQuery<Team[]>({
    queryKey: ['teams', currentClubId],
    queryFn: () => apiClient.get(`/api/clubs/${currentClubId}/teams`),
    enabled: !!currentClubId
  });

  // Single initialization effect - runs only once when userClubs are loaded
  useEffect(() => {
    console.log('ClubContext: Initialization effect triggered', { 
      hasUserClubs: Array.isArray(userClubs) && userClubs.length > 0,
      currentClubId,
      isInitialized,
      isLoadingClubs
    });

    // Only run if we have user clubs, haven't initialized yet, and aren't currently loading
    if (Array.isArray(userClubs) && userClubs.length > 0 && !isInitialized && !isLoadingClubs) {
      console.log('ClubContext: Starting initialization...');

      let targetClubId: number;

      // Try to get stored club ID first
      const storedClubId = localStorage.getItem('currentClubId');
      if (storedClubId) {
        const storedId = parseInt(storedClubId, 10);
        const isValidClub = userClubs.some(club => club.clubId === storedId);
        if (isValidClub) {
          targetClubId = storedId;
          console.log('ClubContext: Using valid stored club ID:', storedId);
        } else {
          console.warn('ClubContext: Stored club ID invalid, resetting...');
          localStorage.removeItem('currentClubId');
          const warrandyteClub = userClubs.find(club => club.clubId === 54);
          targetClubId = warrandyteClub ? 54 : userClubs[0].clubId;
        }
      } else {
        // No stored club - prefer Warrandyte (54) if available
        const warrandyteClub = userClubs.find(club => club.clubId === 54);
        targetClubId = warrandyteClub ? 54 : userClubs[0].clubId;
        console.log('ClubContext: No stored club, selecting:', targetClubId);
      }

      // Set everything synchronously
      localStorage.setItem('currentClubId', targetClubId.toString());
      apiClient.setClubContext({ currentClubId: targetClubId });
      startTransition(() => {
        setCurrentClubId(targetClubId);
      });
      setIsInitialized(true);

      console.log('ClubContext: Initialization completed with club:', targetClubId);
    }
  }, [userClubs, isLoadingClubs, isInitialized]);

  // Load saved team from localStorage when teams are available
  useEffect(() => {
    const savedTeamId = localStorage.getItem('current-team-id');
    if (savedTeamId && !currentTeamId && clubTeams.length > 0) {
      const teamId = parseInt(savedTeamId, 10);
      const teamExists = clubTeams.some(team => team.id === teamId);
      if (teamExists) {
        console.log('ClubContext: Restoring saved team:', teamId);
        setCurrentTeamId(teamId);
      } else {
        console.log('ClubContext: Saved team not found, clearing...');
        localStorage.removeItem('current-team-id');
      }
    }
  }, [clubTeams, currentTeamId]);

  // Keep API client in sync with context changes
  useEffect(() => {
    if (currentClubId !== null) {
      console.log('ClubContext: Syncing API client with context:', { currentClubId, currentTeamId });
      apiClient.setClubContext({ currentClubId, currentTeamId });
    }
  }, [currentClubId, currentTeamId]);

  const switchClub = useCallback((clubId: number) => {
    console.log('ClubContext: Switching club to:', clubId);

    // Validate access
    if (!Array.isArray(userClubs) || !userClubs.some(club => club.clubId === clubId)) {
      console.error('ClubContext: Access denied to club:', clubId);
      return;
    }

    // Store old club for cache management
    const oldClubId = currentClubId;

    // Update everything synchronously
    localStorage.setItem('currentClubId', clubId.toString());
    apiClient.setClubContext({ currentClubId: clubId });
    startTransition(() => {
      setCurrentClubId(clubId);
    });

    // Clear team selection when switching clubs
    startTransition(() => {
      setCurrentTeamId(null);
    });
    localStorage.removeItem('current-team-id');

    // Cache invalidation disabled to prevent race conditions
    // Let React Query handle cache naturally through query key changes

    console.log('ClubContext: Club switch completed to:', clubId);
  }, [currentClubId, userClubs]);

  const handleSetCurrentTeamId = useCallback((teamId: number | null) => {
    console.log('ClubContext: Setting team to:', teamId);

    // Clear any pending team change
    if (teamChangeTimeoutRef.current) {
      clearTimeout(teamChangeTimeoutRef.current);
    }

    // Debounce team changes by 100ms to prevent rapid successive updates
    teamChangeTimeoutRef.current = setTimeout(() => {
      // Update localStorage first
      if (teamId !== null) {
        localStorage.setItem('current-team-id', teamId.toString());
      } else {
        localStorage.removeItem('current-team-id');
      }

      // Update API client context with the NEW team ID immediately
      // This ensures API calls use the correct context before React re-renders
      apiClient.setClubContext({ currentClubId, currentTeamId: teamId });

      // Update state after API client is set
      startTransition(() => {
          setCurrentTeamId(teamId);
      });

      // Cache invalidation disabled to prevent race conditions
      // Let React Query handle cache naturally through query key changes

      console.log('ClubContext: Team context updated to:', teamId);
    }, 100);
  }, [currentClubId]);

  const hasPermission = useCallback((permission: keyof UserClubAccess['permissions']) => {
    if (!currentClubId || !Array.isArray(userClubs)) return false;
    const clubAccess = userClubs.find(club => club.clubId === currentClubId);
    return clubAccess?.permissions[permission] || false;
  }, [currentClubId, userClubs]);

  // Get current team object
  const currentTeam = useMemo(() => {
    if (!currentTeamId || !clubTeams || clubTeams.length === 0) {
      return null;
    }
    return clubTeams.find(team => team.id === currentTeamId) || null;
  }, [clubTeams, currentTeamId]);

  const contextValue: ClubContextType = useMemo(() => ({
    currentClub,
    currentClubId,
    currentTeamId,
    currentTeam,
    userClubs,
    clubTeams,
    switchClub,
    setCurrentTeamId: handleSetCurrentTeamId,
    hasPermission,
    isLoading: isLoadingClubs || (!!currentClubId && isLoadingClub) || isLoadingTeams,
    isInitialized,
  }), [
    currentClub,
    currentClubId,
    currentTeamId,
    currentTeam,
    userClubs,
    clubTeams,
    switchClub,
    handleSetCurrentTeamId,
    hasPermission,
    isLoadingClubs,
    isLoadingClub,
    isLoadingTeams,
    isInitialized
  ]);

  console.log('ClubContext: Rendering with:', {
    currentClubId,
    currentTeamId,
    hasCurrentClub: !!currentClub,
    userClubsCount: userClubs.length,
    isLoading: contextValue.isLoading,
    isInitialized
  });

  return (
    <ClubContext.Provider value={contextValue}>
      {children}
    </ClubContext.Provider>
  );
}

const useClub = () => {
  const context = useContext(ClubContext);
  if (context === undefined) {
    console.error('useClub called outside ClubProvider. Check component hierarchy.');
    throw new Error('useClub must be used within a ClubProvider');
  }
  return context;
};

export default ClubProvider;
export { useClub };