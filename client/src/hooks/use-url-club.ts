import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
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
  division?: string;
}

export function useURLClub() {
  const params = useParams<{ clubId?: string }>();
  const clubId = params.clubId ? parseInt(params.clubId) : null;

  // Fetch club details
  const { data: club, isLoading: isLoadingClub, error: clubError } = useQuery<Club>({
    queryKey: ['club-details', clubId],
    queryFn: () => apiClient.get(`/api/clubs/${clubId}`),
    enabled: !!clubId,
  });

  // Fetch user's club access
  const { data: userClubs = [], isLoading: isLoadingUserClubs } = useQuery<UserClubAccess[]>({
    queryKey: ['user-clubs'],
    queryFn: () => apiClient.get('/api/user/clubs'),
  });

  // Fetch teams for current club
  const { data: clubTeams = [], isLoading: isLoadingTeams } = useQuery<Team[]>({
    queryKey: ['club-teams', clubId],
    queryFn: () => apiClient.get(`/api/clubs/${clubId}/teams`),
    enabled: !!clubId,
  });

  // Check permissions for current club
  const hasPermission = (permission: keyof UserClubAccess['permissions']) => {
    if (!clubId || !userClubs.length) return false;
    const userClub = userClubs.find(c => c.clubId === clubId);
    return userClub?.permissions[permission] || false;
  };

  // Get current user's access info for this club
  const currentUserClub = userClubs.find(c => c.clubId === clubId);

  return {
    clubId,
    club,
    clubTeams,
    userClubs,
    currentUserClub,
    hasPermission,
    isLoading: isLoadingClub || isLoadingUserClubs || isLoadingTeams,
    clubError,
  };
}