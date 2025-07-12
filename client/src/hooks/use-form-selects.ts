
import { useMemo } from 'react';
import { 
  useSeasonsSelect, 
  useSectionsSelect, 
  useTeamsSelect, 
  usePlayersSelect,
  useGameStatusesSelect 
} from './use-standard-selects';

// For team forms that need seasons and sections
export function useTeamFormSelects(selectedSeasonId?: number) {
  const seasonsQuery = useSeasonsSelect();
  const sectionsQuery = useSectionsSelect(selectedSeasonId);

  return {
    seasons: {
      data: seasonsQuery.data || [],
      isLoading: seasonsQuery.isLoading,
      error: seasonsQuery.error,
      refetch: seasonsQuery.refetch
    },
    sections: {
      data: sectionsQuery.data || [],
      isLoading: sectionsQuery.isLoading,
      error: sectionsQuery.error,
      refetch: sectionsQuery.refetch
    },
    isLoading: seasonsQuery.isLoading || sectionsQuery.isLoading,
    hasErrors: !!seasonsQuery.error || !!sectionsQuery.error
  };
}

// For game forms that need teams and statuses
export function useGameFormSelects() {
  const teamsQuery = useTeamsSelect();
  const statusesQuery = useGameStatusesSelect();

  return {
    teams: {
      data: teamsQuery.data || [],
      isLoading: teamsQuery.isLoading,
      error: teamsQuery.error,
      refetch: teamsQuery.refetch
    },
    statuses: {
      data: statusesQuery.data || [],
      isLoading: statusesQuery.isLoading,
      error: statusesQuery.error,
      refetch: statusesQuery.refetch
    },
    isLoading: teamsQuery.isLoading || statusesQuery.isLoading,
    hasErrors: !!teamsQuery.error || !!statusesQuery.error
  };
}

// For roster/availability forms that need players and teams
export function useRosterFormSelects(teamId?: number) {
  const playersQuery = usePlayersSelect();
  const teamsQuery = useTeamsSelect();

  // Filter players by team if teamId is provided
  const filteredPlayers = useMemo(() => {
    if (!teamId || !playersQuery.data) return playersQuery.data || [];
    return playersQuery.data.filter(player => 
      player.teams?.some((team: any) => team.id === teamId)
    );
  }, [playersQuery.data, teamId]);

  return {
    players: {
      data: filteredPlayers,
      isLoading: playersQuery.isLoading,
      error: playersQuery.error,
      refetch: playersQuery.refetch
    },
    teams: {
      data: teamsQuery.data || [],
      isLoading: teamsQuery.isLoading,
      error: teamsQuery.error,
      refetch: teamsQuery.refetch
    },
    isLoading: playersQuery.isLoading || teamsQuery.isLoading,
    hasErrors: !!playersQuery.error || !!teamsQuery.error
  };
}

// For section management that needs seasons
export function useSectionFormSelects() {
  const seasonsQuery = useSeasonsSelect({ filterActive: true });

  return {
    seasons: {
      data: seasonsQuery.data || [],
      isLoading: seasonsQuery.isLoading,
      error: seasonsQuery.error,
      refetch: seasonsQuery.refetch
    },
    isLoading: seasonsQuery.isLoading,
    hasErrors: !!seasonsQuery.error
  };
}
