import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { cacheManager } from '@/lib/cacheManager';
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

export function ClubProvider({ children }: { children: React.ReactNode }) {
  // Initialize state synchronously and ensure API client is immediately in sync
  const [currentClubId, setCurrentClubId] = useState<number | null>(() => {
    const stored = localStorage.getItem('currentClubId');
    const clubId = stored ? parseInt(stored, 10) : null;
    console.log('ClubProvider: Initializing with stored club ID:', clubId);

    if (clubId && !isNaN(clubId)) {
      // Note: We can't validate against userClubs here since they haven't loaded yet
      // Validation will happen in the useEffect when userClubs are available
      apiClient.setClubContext({ currentClubId: clubId });
      console.log('ClubProvider: API client initialized with club ID:', clubId);
      return clubId;
    }
    return null;
  });

  const [currentTeamId, setCurrentTeamId] = useState<number | null>(() => {
    const stored = localStorage.getItem('current-team-id');
    return stored ? parseInt(stored, 10) : null;
  });

  const [isInitialized, setIsInitialized] = useState(false);

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

  // Initialize club context when userClubs are loaded and we don't have a currentClubId
  useEffect(() => {
    console.log('ClubContext initialization effect:', { 
      hasUserClubs: Array.isArray(userClubs) && userClubs.length > 0,
      currentClubId,
      userClubsLength: userClubs.length,
      isLoadingClubs
    });

    if (Array.isArray(userClubs) && userClubs.length > 0) {
      if (currentClubId === null) {
        console.log('ClubContext: Need to initialize club selection');

        // Try to get stored club ID
        const storedClubId = localStorage.getItem('currentClubId');
        let targetClubId: number;

        if (storedClubId) {
          const storedId = parseInt(storedClubId, 10);
          const isValidClub = userClubs.some(club => club.clubId === storedId);
          if (isValidClub) {
            targetClubId = storedId;
            console.log('ClubContext: Using valid stored club ID:', storedId);
          } else {
            console.warn('ClubContext: Stored club ID', storedId, 'is invalid. Available clubs:', userClubs.map(c => c.clubId));
            // Clear invalid stored club ID
            localStorage.removeItem('currentClubId');
            // Prefer Warrandyte (54) if available, otherwise use first club
            const warrandyteClub = userClubs.find(club => club.clubId === 54);
            targetClubId = warrandyteClub ? 54 : userClubs[0].clubId;
            console.log('ClubContext: Reset to valid club:', targetClubId);
          }
        } else {
          // Prefer Warrandyte (54) if available, otherwise use first club
          const warrandyteClub = userClubs.find(club => club.clubId === 54);
          targetClubId = warrandyteClub ? 54 : userClubs[0].clubId;
          console.log('ClubContext: No stored club, selecting:', targetClubId);
        }

        console.log('ClubContext: Setting initial club to:', targetClubId);

        // Update all three synchronously
        localStorage.setItem('currentClubId', targetClubId.toString());
        apiClient.setClubContext({ currentClubId: targetClubId });
        setCurrentClubId(targetClubId);

        console.log('ClubContext: React state set to:', targetClubId);

        // Invalidate queries immediately since state is now set
        queryClient.invalidateQueries();
      }

      // Mark as initialized once we have user clubs data
      if (!isInitialized) {
        setIsInitialized(true);
      }
    }
  }, [userClubs, queryClient, currentClubId, isLoadingClubs, isInitialized]);

  // Validate current club ID against user's available clubs
  useEffect(() => {
    if (Array.isArray(userClubs) && userClubs.length > 0 && currentClubId !== null) {
      const hasAccess = userClubs.some(club => club.clubId === currentClubId);
      if (!hasAccess) {
        console.error('ClubContext: Current club ID', currentClubId, 'is not in user clubs:', userClubs.map(c => c.clubId));
        console.log('ClubContext: Forcing reset to valid club');

        // Reset to first available club
        const validClubId = userClubs[0].clubId;
        localStorage.setItem('currentClubId', validClubId.toString());
        apiClient.setClubContext({ currentClubId: validClubId });
        setCurrentClubId(validClubId);

        // Invalidate queries to refresh data
        queryClient.invalidateQueries();
      }
    }
  }, [userClubs, currentClubId, queryClient]);

  // Keep API client in sync with currentClubId and currentTeamId changes
  useEffect(() => {
    console.log('ClubContext: Updating apiClient context to:', { currentClubId, currentTeamId });
    apiClient.setClubContext({ currentClubId, currentTeamId });

    // Force a check that the context was set properly
    if (currentClubId !== null) {
      console.log('ClubContext: Verifying API client has club and team context set');

      // Add a small delay to ensure any pending requests use the new context
      setTimeout(() => {
        console.log('ClubContext: API client context update complete');
      }, 50);
    }
  }, [currentClubId, currentTeamId]);

  const switchClub = useCallback((clubId: number) => {
    console.log('ClubContext: Switching club from', currentClubId, 'to', clubId);

    // Validate that the user has access to this club
    if (!Array.isArray(userClubs) || userClubs.length === 0) {
      console.error('ClubContext: Cannot switch club - no user clubs available');
      return;
    }

    const hasAccess = userClubs.some(club => club.clubId === clubId);
    if (!hasAccess) {
      console.error('ClubContext: Access denied to club', clubId, 'Available clubs:', userClubs.map(c => c.clubId));

      // Reset to a valid club instead
      const validClubId = userClubs[0].clubId;
      console.log('ClubContext: Resetting to valid club:', validClubId);

      localStorage.setItem('currentClubId', validClubId.toString());
      apiClient.setClubContext({ currentClubId: validClubId });
      setCurrentClubId(validClubId);
      return;
    }

    // Store old club ID for cache management
    const oldClubId = currentClubId;

    // Update all three synchronously to prevent race conditions
    localStorage.setItem('currentClubId', clubId.toString());
    apiClient.setClubContext({ currentClubId: clubId });
    setCurrentClubId(() => {
      console.log('ClubContext: React state switched to:', clubId);
      return clubId;
    });

    // Use intelligent cache invalidation
    if (cacheManager) {
      cacheManager.invalidateOnClubSwitch(clubId, oldClubId);
    }

    console.log('ClubContext: Club switch completed to:', clubId);
  }, [currentClubId, queryClient, userClubs]);

  const hasPermission = (permission: keyof UserClubAccess['permissions']) => {
    if (!currentClubId || !Array.isArray(userClubs)) return false;
    const clubAccess = userClubs.find(club => club.clubId === currentClubId);
    return clubAccess?.permissions[permission] || false;
  };

  // Enhanced team context switching with minimal cache invalidation
  const setCurrentTeamIdEnhanced = useCallback((teamId: number | null) => {
    console.log('ClubContext: Setting team to:', teamId);

    // Only invalidate if the team actually changed
    if (teamId !== currentTeamId) {
      setCurrentTeamId(teamId);

      // Delay cache invalidation to allow UI to update first
      setTimeout(() => {
        if (teamId !== null) {
          // Only invalidate data that's actually team-specific and stale
          const teamSpecificKeys = [
            ['games', currentClubId, currentTeamId],
            ['players', currentClubId, currentTeamId], 
            ['dashboard-batch-data', currentClubId, currentTeamId]
          ];

          teamSpecificKeys.forEach(queryKey => {
            queryClient.removeQueries({ 
              queryKey,
              exact: false 
            });
          });
        }
      }, 100); // Small delay to prevent hanging
    }
  }, [setCurrentTeamId, queryClient, currentTeamId, currentClubId]);

  // Enhanced team context switching with minimal cache invalidation
  const handleSetCurrentTeamId = useCallback((teamId: number | null) => {
    console.log('ClubContext: Setting team to:', teamId);

    if (teamId !== null) {
      localStorage.setItem('current-team-id', teamId.toString());
    } else {
      localStorage.removeItem('current-team-id');
    }

    setCurrentTeamId(teamId);

    // Sync API client headers immediately
    apiClient.setClubContext({ currentClubId, currentTeamId: teamId });
    console.log('ClubContext: API client team context updated to:', teamId);

    // Use intelligent cache invalidation for team switching
    if (cacheManager && currentClubId) {
      cacheManager.invalidateOnTeamSwitch(currentClubId, teamId, currentTeamId);
    }

    console.log('ClubContext: Team context switch completed to:', teamId);
    }, [currentClubId, clubTeams]);

  // Load saved team from localStorage when teams are available
  useEffect(() => {
    const savedTeamId = localStorage.getItem('current-team-id');
    if (savedTeamId && !currentTeamId && clubTeams.length > 0) {
      const teamId = parseInt(savedTeamId, 10);
      // Validate that the saved team exists in current club's teams
      const teamExists = clubTeams.some(team => team.id === teamId);
      if (teamExists) {
        handleSetCurrentTeamId(teamId);
      } else {
        // Clear invalid saved team ID
        localStorage.removeItem('current-team-id');
      }
    }
  }, [currentTeamId, clubTeams, handleSetCurrentTeamId]);

  // Get current team object
  const currentTeam = useMemo(() => {
    if (!currentTeamId || !clubTeams || clubTeams.length === 0) {
      return null;
    }
    const team = clubTeams.find(team => team.id === currentTeamId);
    if (!team) {
      console.warn('ClubContext: currentTeamId', currentTeamId, 'not found in clubTeams');
    }
    return team || null;
  }, [clubTeams, currentTeamId]);

  const contextValue: ClubContextType = {
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
  };

  console.log('ClubContext: Rendering with:', {
    currentClubId,
    hasCurrentClub: !!currentClub,
    userClubsCount: userClubs.length,
    isLoading: contextValue.isLoading
  });

  return (
    <ClubContext.Provider value={contextValue}>
      {children}
    </ClubContext.Provider>
  );
}

export const useClub = () => {
  const context = useContext(ClubContext);
  if (context === undefined) {
    console.error('useClub called outside ClubProvider. Check component hierarchy.');
    throw new Error('useClub must be used within a ClubProvider');
  }
  return context;
};