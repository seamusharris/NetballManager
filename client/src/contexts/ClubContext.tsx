import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { useCallback } from 'react';

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
}

const ClubContext = createContext<ClubContextType | undefined>(undefined);

export function ClubProvider({ children }: { children: React.ReactNode }) {
  const [currentClubId, setCurrentClubId] = useState<number | null>(null);
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

  // Set default club on load
  useEffect(() => {
    if (Array.isArray(userClubs) && userClubs.length > 0 && !currentClubId && !isInitialized) {
      // Get stored club ID from localStorage
      const storedClubId = localStorage.getItem('currentClubId');

      let targetClubId: number;

      if (storedClubId) {
        const storedId = parseInt(storedClubId, 10);
        // Check if the stored club ID is valid
        const isValidClub = userClubs.some(club => club.clubId === storedId);
        targetClubId = isValidClub ? storedId : userClubs[0].clubId;
      } else {
        // Prefer Warrandyte (54) if available, otherwise default to first club
        const warrandyteClub = userClubs.find(club => club.clubId === 54);
        targetClubId = warrandyteClub ? 54 : userClubs[0].clubId;
      }

      console.log('Setting initial club ID:', targetClubId, 'from userClubs:', userClubs);
      setCurrentClubId(targetClubId);
      localStorage.setItem('currentClubId', targetClubId.toString());
      apiClient.setCurrentClubId(targetClubId);
      setIsInitialized(true);
      
      // Force invalidate all queries to ensure they use the new club context
      queryClient.invalidateQueries();
    }
  }, [userClubs, currentClubId, isInitialized, queryClient]);

  const switchClub = useCallback((clubId: number) => {
    console.log('Switching to club:', clubId, 'Current club:', currentClubId);
    setCurrentClubId(clubId);
    localStorage.setItem('currentClubId', clubId.toString());
    apiClient.setCurrentClubId(clubId);

    console.log('Club switched in context to:', clubId, 'localStorage updated');

    // Invalidate all queries when switching clubs to ensure fresh data
    queryClient.invalidateQueries();

    // Force refetch of games specifically
    queryClient.refetchQueries({ queryKey: ['games'] });

    console.log('Queries invalidated and games refetched for club:', clubId);
  }, [currentClubId, queryClient]);

  const hasPermission = (permission: keyof UserClubAccess['permissions']) => {
    if (!currentClubId || !Array.isArray(userClubs)) return false;
    const clubAccess = userClubs.find(club => club.clubId === currentClubId);
    return clubAccess?.permissions[permission] || false;
  };

  // Don't render children until the context is properly initialized
  if (!isInitialized && isLoadingClubs) {
    return (
      <ClubContext.Provider
        value={{
          currentClub: null,
          userClubs: [],
          switchClub: () => {},
          hasPermission: () => false,
          isLoading: true,
        }}
      >
        {children}
      </ClubContext.Provider>
    );
  }

  return (
    <ClubContext.Provider
      value={{
        currentClub,
        userClubs,
        switchClub,
        hasPermission,
        isLoading: isLoadingClubs || isLoadingClub || !isInitialized,
      }}
    >
      {children}
    </ClubContext.Provider>
  );
}

export const useClub = () => {
  const context = useContext(ClubContext);
  if (context === undefined) {
    // More helpful error message with debugging info
    console.error('useClub called outside ClubProvider. Check component hierarchy.');
    console.error('Current component stack:', new Error().stack);
    throw new Error('useClub must be used within a ClubProvider');
  }
  return context;
};