
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
  currentClubId: number | null;
  userClubs: UserClubAccess[];
  switchClub: (clubId: number) => void;
  hasPermission: (permission: keyof UserClubAccess['permissions']) => boolean;
  isLoading: boolean;
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

  // Initialize club context when userClubs are loaded and we don't have a currentClubId
  useEffect(() => {
    console.log('ClubContext initialization effect:', { 
      hasUserClubs: Array.isArray(userClubs) && userClubs.length > 0,
      currentClubId,
      userClubsLength: userClubs.length 
    });

    if (Array.isArray(userClubs) && userClubs.length > 0 && currentClubId === null) {
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
  }, [userClubs, queryClient]);

  // Keep API client in sync with currentClubId changes
  useEffect(() => {
    console.log('ClubContext: Updating apiClient club context to:', currentClubId);
    apiClient.setClubContext({ currentClubId });
  }, [currentClubId]);

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

  const contextValue = {
    currentClub,
    currentClubId,
    userClubs,
    switchClub,
    hasPermission,
    isLoading: isLoadingClubs || (!!currentClubId && isLoadingClub),
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
