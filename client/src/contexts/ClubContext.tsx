
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

interface ClubContextType {
  currentClub: Club | null;
  userClubs: UserClubAccess[];
  switchClub: (clubId: number) => void;
  hasPermission: (permission: keyof UserClubAccess['permissions']) => boolean;
  isLoading: boolean;
  isReady: boolean;
}

// Create context with stable default values to prevent undefined issues
const ClubContext = createContext<ClubContextType>({
  currentClub: null,
  userClubs: [],
  switchClub: () => {},
  hasPermission: () => false,
  isLoading: true,
  isReady: false,
});

export function ClubProvider({ children }: { children: React.ReactNode }) {
  const [currentClubId, setCurrentClubId] = useState<number | null>(() => {
    // Initialize from localStorage immediately
    const stored = localStorage.getItem('currentClubId');
    return stored ? parseInt(stored, 10) : null;
  });
  const [isReady, setIsReady] = useState(false);
  const queryClient = useQueryClient();

  // Fetch user clubs with simplified error handling
  const { data: userClubs = [], isLoading: isLoadingClubs, error: clubsError } = useQuery<UserClubAccess[]>({
    queryKey: ['user-clubs'],
    queryFn: async () => {
      try {
        return await apiClient.get('/api/user/clubs');
      } catch (error) {
        console.error('Failed to fetch user clubs:', error);
        throw error;
      }
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch current club details only when we have a valid club ID
  const { data: currentClub = null, isLoading: isLoadingClub } = useQuery<Club>({
    queryKey: ['club', currentClubId],
    queryFn: async () => {
      if (!currentClubId) return null;
      try {
        return await apiClient.get(`/api/clubs/${currentClubId}`);
      } catch (error) {
        console.error(`Failed to fetch club ${currentClubId}:`, error);
        throw error;
      }
    },
    enabled: !!currentClubId,
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });

  // Initialize club selection on first load
  useEffect(() => {
    if (userClubs.length > 0 && !isReady) {
      let targetClubId = currentClubId;

      // If no current club or invalid club, pick a default
      if (!targetClubId || !userClubs.some(club => club.clubId === targetClubId)) {
        // Prefer Warrandyte (54) if available, otherwise first club
        const warrandyteClub = userClubs.find(club => club.clubId === 54);
        targetClubId = warrandyteClub ? 54 : userClubs[0].clubId;
      }

      if (targetClubId !== currentClubId) {
        setCurrentClubId(targetClubId);
        localStorage.setItem('currentClubId', targetClubId.toString());
        apiClient.setCurrentClubId(targetClubId);
      }
      
      setIsReady(true);
    }
  }, [userClubs, currentClubId, isReady]);

  const switchClub = useCallback((clubId: number) => {
    console.log('Switching to club:', clubId);
    setCurrentClubId(clubId);
    localStorage.setItem('currentClubId', clubId.toString());
    apiClient.setCurrentClubId(clubId);
    
    // Invalidate all queries to refetch with new club context
    queryClient.invalidateQueries();
  }, [queryClient]);

  const hasPermission = useCallback((permission: keyof UserClubAccess['permissions']) => {
    if (!currentClubId || !userClubs.length) return false;
    const clubAccess = userClubs.find(club => club.clubId === currentClubId);
    return clubAccess?.permissions[permission] || false;
  }, [currentClubId, userClubs]);

  const contextValue: ClubContextType = {
    currentClub,
    userClubs,
    switchClub,
    hasPermission,
    isLoading: isLoadingClubs || isLoadingClub || !isReady,
    isReady,
  };

  return (
    <ClubContext.Provider value={contextValue}>
      {children}
    </ClubContext.Provider>
  );
}

export const useClub = () => {
  return useContext(ClubContext);
};
