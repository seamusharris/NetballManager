import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, startTransition } from 'react';
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
  currentClubTeams: Team[];
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
    // Only run if we have user clubs, haven't initialized yet, and aren't currently loading
    if (Array.isArray(userClubs) && userClubs.length > 0 && !isInitialized && !isLoadingClubs) {
  

      let targetClubId: number;

      // Try to get stored club ID first
      const storedClubId = localStorage.getItem('currentClubId');
      if (storedClubId) {
        const storedId = parseInt(storedClubId, 10);
        const isValidClub = userClubs.some(club => club.clubId === storedId);
        if (isValidClub) {
          targetClubId = storedId;
        } else {
          localStorage.removeItem('currentClubId');
          const warrandyteClub = userClubs.find(club => club.clubId === 54);
          targetClubId = warrandyteClub ? 54 : userClubs[0].clubId;
        }
      } else {
        // No stored club - prefer Warrandyte (54) if available
        const warrandyteClub = userClubs.find(club => club.clubId === 54);
        targetClubId = warrandyteClub ? 54 : userClubs[0].clubId;
      }

      // Set everything immediately
      localStorage.setItem('currentClubId', targetClubId.toString());
      apiClient.setClubContext({ currentClubId: targetClubId });
      setCurrentClubId(targetClubId);
      setIsInitialized(true);

      
    }
  }, [userClubs, isLoadingClubs, isInitialized]);

  // Load saved team from localStorage when teams are available
  useEffect(() => {
    const savedTeamId = localStorage.getItem('current-team-id');
    if (savedTeamId && clubTeams.length > 0) {
      const teamId = parseInt(savedTeamId, 10);
      const teamExists = clubTeams.some(team => team.id === teamId);
      if (teamExists) {
        setCurrentTeamId(teamId);
      } else {
        localStorage.removeItem('current-team-id');
      }
    }
  }, [clubTeams]);

  // Keep API client in sync with context changes
  useEffect(() => {
    if (currentClubId !== null) {
      apiClient.setClubContext({ currentClubId, currentTeamId });
    }
  }, [currentClubId, currentTeamId]);

  const switchClub = useCallback((clubId: number) => {
    // Validate access
    if (!Array.isArray(userClubs) || !userClubs.some(club => club.clubId === clubId)) {
      return;
    }

    // Update everything immediately
    localStorage.setItem('currentClubId', clubId.toString());
    apiClient.setClubContext({ currentClubId: clubId });
    setCurrentClubId(clubId);

    // Clear team selection when switching clubs
    setCurrentTeamId(null);
    localStorage.removeItem('current-team-id');
  }, [userClubs]);

  const handleSetCurrentTeamId = useCallback((teamId: number | null) => {
    if (teamId === currentTeamId) {
      return; // No change needed
    }

    // Update localStorage first
    if (teamId !== null) {
      localStorage.setItem('current-team-id', teamId.toString());
    } else {
      localStorage.removeItem('current-team-id');
    }

    // Update API client context
    apiClient.setClubContext({ currentClubId, currentTeamId: teamId });

    // Update state
    setCurrentTeamId(teamId);
  }, [currentClubId, currentTeamId]);

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
    currentClubTeams: clubTeams || [],
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

  // Removed console.log to prevent object rendering issues

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