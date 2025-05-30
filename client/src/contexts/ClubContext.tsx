import React, { createContext, useContext, useState, useEffect } from 'react';
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
}

const ClubContext = createContext<ClubContextType | undefined>(undefined);

export function ClubProvider({ children }: { children: React.ReactNode }) {
  const [currentClubId, setCurrentClubId] = useState<number | null>(null);
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
    if (Array.isArray(userClubs) && userClubs.length > 0 && !currentClubId) {
      const storedClubId = localStorage.getItem('currentClubId');
      const clubId = storedClubId ? parseInt(storedClubId) : userClubs[0].clubId;

      // Verify user has access to stored club
      const hasAccess = userClubs.some(club => club.clubId === clubId);
      const finalClubId = hasAccess ? clubId : userClubs[0].clubId;
      
      console.log('Setting initial club ID:', finalClubId, 'from userClubs:', userClubs);
      setCurrentClubId(finalClubId);
      localStorage.setItem('currentClubId', finalClubId.toString());
      
      // Update the API client with the current club
      apiClient.setCurrentClubId(finalClubId);
    }
  }, [userClubs, currentClubId]);

  const switchClub = async (clubId: number) => {
    console.log('Switching to club:', clubId, 'Current club:', currentClubId);
    
    // Verify user has access to this club
    const hasAccess = userClubs.some(club => club.clubId === clubId);
    if (!hasAccess) {
      console.error('User does not have access to club:', clubId);
      return;
    }
    
    // Don't switch if already on this club
    if (currentClubId === clubId) {
      console.log('Already on club:', clubId);
      return;
    }
    
    setCurrentClubId(clubId);
    localStorage.setItem('currentClubId', clubId.toString());
    console.log('Club switched in context to:', clubId);

    // Invalidate all club-dependent queries to refetch with new club context
    await queryClient.invalidateQueries({
      predicate: (query) => {
        const queryKey = query.queryKey[0];
        if (typeof queryKey === 'string') {
          // Invalidate queries that depend on club context
          return queryKey.includes('/api/players') ||
                 queryKey.includes('/api/games') ||
                 queryKey.includes('/api/teams') ||
                 queryKey.includes('/api/opponents') ||
                 queryKey.includes('/api/stats') ||
                 queryKey.includes('/api/rosters') ||
                 queryKey.includes('/api/availability');
        }
        return false;
      }
    });
    
    // Also invalidate club-specific queries by exact match
    await queryClient.invalidateQueries({ queryKey: ['club', clubId] });
    console.log('Queries invalidated for club:', clubId);
  };

  const hasPermission = (permission: keyof UserClubAccess['permissions']) => {
    if (!currentClubId || !Array.isArray(userClubs)) return false;
    const clubAccess = userClubs.find(club => club.clubId === currentClubId);
    return clubAccess?.permissions[permission] || false;
  };

  return (
    <ClubContext.Provider
      value={{
        currentClub,
        userClubs,
        switchClub,
        hasPermission,
        isLoading: isLoadingClubs || isLoadingClub,
      }}
    >
      {children}
    </ClubContext.Provider>
  );
}

export function useClub() {
  const context = useContext(ClubContext);
  if (context === undefined) {
    throw new Error('useClub must be used within a ClubProvider');
  }
  return context;
}