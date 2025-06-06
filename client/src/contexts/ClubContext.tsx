import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

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
      // Set API client context immediately during initialization
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
          targetClubId = isValidClub ? storedId : userClubs[0].clubId;
          console.log('ClubContext: Using stored club ID:', storedId, 'valid:', isValidClub);
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

  // Keep API client in sync with currentClubId and currentTeamId changes
  useEffect(() => {
    console.log('ClubContext: Updating apiClient context to:', { currentClubId, currentTeamId });
    apiClient.setClubContext({ currentClubId, currentTeamId });

    // Force a check that the context was set properly
    if (currentClubId !== null) {
      console.log('ClubContext: Verifying API client has club and team context set');
    }
  }, [currentClubId, currentTeamId]);

  const switchClub = useCallback((clubId: number) => {
    console.log('ClubContext: Switching club from', currentClubId, 'to', clubId);

    // Update all three synchronously to prevent race conditions
    localStorage.setItem('currentClubId', clubId.toString());
    apiClient.setClubContext({ currentClubId: clubId });
    setCurrentClubId(() => {
      console.log('ClubContext: React state switched to:', clubId);
      return clubId;
    });

    // Invalidate and refetch queries
    queryClient.invalidateQueries();
    queryClient.refetchQueries({ queryKey: ['games'] });

    console.log('ClubContext: Club switch completed to:', clubId);
  }, [currentClubId, queryClient]);

  const hasPermission = (permission: keyof UserClubAccess['permissions']) => {
    if (!currentClubId || !Array.isArray(userClubs)) return false;
    const clubAccess = userClubs.find(club => club.clubId === currentClubId);
    return clubAccess?.permissions[permission] || false;
  };

    // Handle team selection
    const handleSetCurrentTeamId = useCallback((teamId: number | null) => {
      console.log('ClubContext: Setting team ID to:', teamId);
      setCurrentTeamId(teamId);
      if (teamId) {
        localStorage.setItem('current-team-id', teamId.toString());
      } else {
        localStorage.removeItem('current-team-id');
      }
      
      // Update API client context immediately with new team ID
      apiClient.setClubContext({ currentClubId, currentTeamId: teamId });
      console.log('ClubContext: Updated API client with team ID:', teamId);
      
      // Don't invalidate any cached data - let React Query handle caching
      // Team switches should use existing cached data for better performance
    }, [currentClubId]);
  
  // Load saved team from localStorage
  useEffect(() => {
    const savedTeamId = localStorage.getItem('current-team-id');
    if (savedTeamId && !currentTeamId) {
      setCurrentTeamId(parseInt(savedTeamId, 10));
    }
  }, [currentTeamId]);

  // Get current team object
  const currentTeam = useMemo(() => {
    return clubTeams.find(team => team.id === currentTeamId) || null;
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