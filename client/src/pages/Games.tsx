import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { CrudDialog } from '@/components/ui/crud-dialog';
import GameForm from '@/components/games/GameForm';
import { GamesList } from '@/components/games/GamesList';
import { apiRequest, apiClient } from '@/lib/apiClient';
import { Game, Player } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { useLocation, useParams } from 'wouter';
import { useClub } from '@/contexts/ClubContext';
import { Badge } from '@/components/ui/badge';
import { TeamSwitcher } from '@/components/layout/TeamSwitcher';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CACHE_KEYS } from '@/lib/cacheKeys';

// Import new UI standards
import { ContentBox, ActionButton, ResponsiveGrid } from '@/components/ui/ui-standards';
import PageTemplate from '@/components/layout/PageTemplate';

interface QueryParams {
  status?: string;
  season?: string;
}

export default function Games() {
  const { currentClub, currentClubId, currentTeamId, currentTeam, setCurrentTeamId, isLoading: clubLoading } = useClub();
  const params = useParams();
  const teamIdFromUrl = params.teamId ? parseInt(params.teamId) : null;

  // Don't render anything until club context is fully loaded
  if (clubLoading || !currentClub) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p className="mt-2 text-sm text-muted-foreground">Loading club data...</p>
        </div>
      </div>
    );
  }

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [, setLocation] = useLocation();

  // Handle status filter from URL parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const statusParam = searchParams.get('status');
    if (statusParam && ['upcoming', 'completed', 'in-progress', 'forfeit-win', 'forfeit-loss', 'bye', 'abandoned'].includes(statusParam)) {
      // The GamesList component will handle the status filter via its own URL parameter logic
    }
  }, []);

  // Fetch teams first (needed for auto-select effect)
  const { data: teams = [], isLoading: isLoadingTeams } = useQuery<any[]>({
    queryKey: ['teams', currentClubId],
    queryFn: () => apiClient.get('/api/teams'),
    enabled: !!currentClubId,
  });

  // Auto-select team from URL if provided - optimize to prevent unnecessary updates
  useEffect(() => {
    if (teamIdFromUrl && teams.length > 0) {
      const targetTeam = teams.find(t => t.id === teamIdFromUrl);
      if (targetTeam && currentTeamId !== teamIdFromUrl) {
        console.log(`Games: Setting team ${teamIdFromUrl} from URL`);
        setCurrentTeamId(teamIdFromUrl);
      }
    }
  }, [teamIdFromUrl, teams, currentTeamId, setCurrentTeamId]);

  // Fetch games
  const { data: games = [], isLoading: isLoadingGames } = useQuery<any[]>({
    queryKey: ['games', currentClubId, teamIdFromUrl || currentTeamId],
    queryFn: () => apiClient.get('/api/games'),
    enabled: !!currentClubId,
  });

  // Centralized batch data fetching (same as Dashboard)
  const gameIdsArray = games?.map(g => g.id).sort() || [];
  const gameIds = gameIdsArray.join(',');

  const { data: batchData, isLoading: isLoadingBatchData } = useQuery({
    queryKey: ['games-batch-data', currentClubId, teamIdFromUrl || currentTeamId, gameIds],
    queryFn: async () => {
      if (gameIdsArray.length === 0) return { stats: {}, rosters: {}, scores: {} };

      console.log(`Games page fetching batch data for ${gameIdsArray.length} games with team ${teamIdFromUrl || currentTeamId}:`, gameIdsArray);

      try {
        const { dataFetcher } = await import('@/lib/unifiedDataFetcher');
        const result = await dataFetcher.batchFetchGameData({
          gameIds: gameIdsArray,
          clubId: currentClubId!,
          teamId: teamIdFromUrl || currentTeamId,
          includeStats: true,
          includeRosters: true,
          includeScores: true
        });

        console.log('Games page batch data result for team', teamIdFromUrl || currentTeamId, ':', result);
        return result;
      } catch (error) {
        console.error('Games page batch data fetch error:', error);
        throw error;
      }
    },
    enabled: !!currentClubId && !!(teamIdFromUrl || currentTeamId) && gameIdsArray.length > 0 && !isLoadingGames,
    staleTime: 2 * 60 * 1000, // 2 minutes - shorter for dynamic game data
    gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 1, // Allow one retry
  });

  const gameStatsMap = batchData?.stats || {};
  const gameRostersMap = batchData?.rosters || {};
  const gameScoresMap = batchData?.scores || {};

  // Fetch seasons - no club context needed
  const { data: seasons = [] } = useQuery({
    queryKey: ['seasons'], 
    queryFn: () => apiClient.get('/api/seasons')
  });

  // Fetch active season - no club context needed
  const { data: activeSeason } = useQuery({
    queryKey: ['seasons', 'active'],
    queryFn: () => apiClient.get('/api/seasons/active')
  });

  // Fetch game statuses
  const { data: gameStatuses = [], isLoading: isLoadingGameStatuses } = useQuery({
    queryKey: ['game-statuses'],
    queryFn: () => apiClient.get('/api/game-statuses'),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch players
  const { data: players = [] } = useQuery<Player[]>({
    queryKey: ['players'],
    queryFn: () => apiRequest('GET', '/api/players') as Promise<Player[]>,
  });

  const handleCreate = async (game: Game) => {
    try {
      console.log('Creating game with data:', game);

      // Ensure game has season context - use active season if not specified
      if (!game.seasonId) {
        try {
          const activeSeason = await apiRequest('GET', '/api/seasons/active');
          game.seasonId = activeSeason.id;
          console.log(`Assigned game to active season: ${activeSeason.name} (ID: ${activeSeason.id})`);
        } catch (error) {
          console.warn('Could not get active season for new game:', error);
        }
      }

      await apiRequest('POST', '/api/games', game);

      // Invalidate games queries using the correct query keys that match the actual queries
      if (currentClubId) {
        // Invalidate the specific games query for current team (matches the actual query key pattern)
        queryClient.invalidateQueries({
          queryKey: ['games', currentClubId, teamIdFromUrl || currentTeamId]
        });

        // Invalidate batch data for the games list
        queryClient.invalidateQueries({
          predicate: (query) => {
            const key = query.queryKey;
            return Array.isArray(key) && 
                   key[0] === 'games-batch-data' && 
                   key[1] === currentClubId;
          }
        });
      }
      setIsDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Game created successfully.',
      });
    } catch (error) {
      console.error('Failed to create game:', error);
      toast({
        title: 'Error',
        description: 'Failed to create game.',
        variant: 'destructive',
      });
    }
  };

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (game: Game) => {
      if (!editingGame?.id) throw new Error('No game selected for update');
      console.log('Updating game with ID:', editingGame.id, 'and data:', game);
      return await apiClient.patch(`/api/games/${editingGame.id}`, game);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      toast({
        title: "Success",
        description: "Game updated successfully",
      });
      setEditingGame(null);
    },
    onError: (error) => {
      console.error('Failed to update game:', error);
      toast({
        title: "Error",
        description: "Failed to update game",
        variant: "destructive",
      });
    }
  });

  const handleUpdate = async (game: Game) => {
    updateMutation.mutate(game);
  };

  const handleDelete = async (id: number) => {
    try {
      await apiClient.delete(`/api/games/${id}`);
      queryClient.invalidateQueries({ queryKey: ['games'] });
      toast({
        title: 'Success',
        description: 'Game deleted successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete game.',
        variant: 'destructive',
      });
    }
  };

  const handleViewStats = (gameId: number) => {
    setLocation(`/game/${gameId}`);
  };

  // Fetch all teams for inter-club games
  const { data: allTeams = [] } = useQuery({
    queryKey: ['teams', 'all'],
    queryFn: () => apiRequest('GET', '/api/teams/all')
  });

  // Generate page title with context
  const pageTitle = currentTeam ? `Games - ${currentTeam.name}` : 'Games';
  const pageSubtitle = currentTeamId 
    ? `Manage and view game schedules and results for ${currentTeam?.name || 'Selected Team'}`
    : 'Manage and view game schedules and results';

  // Generate breadcrumbs
  const pageActions = (
    <>
      <div className="text-sm text-muted-foreground">
        Team Filter (Optional):
      </div>
      <TeamSwitcher />
      <ActionButton 
        action="create" 
        onClick={() => setIsDialogOpen(true)}
        icon={Plus}
      >
        Add Game
      </ActionButton>
    </>
  );

  return (
    <PageTemplate
      title={pageTitle}
      subtitle={pageSubtitle}
      actions={pageActions}
    >
      <ContentBox>
        <GamesList 
          games={games} 
          opponents={[]} // Legacy prop - no longer used but component expects it
          isLoading={isLoadingGames || isLoadingBatchData}
          onDelete={handleDelete} 
          onEdit={setEditingGame}
          onViewStats={handleViewStats}
          isDashboard={false}
          showFilters={true}
          showActions={true}
          teams={teams}
          centralizedStats={gameStatsMap}
          centralizedScores={gameScoresMap}
        />
      </ContentBox>
    </PageTemplate>

    <CrudDialog
      isOpen={isDialogOpen}
      setIsOpen={setIsDialogOpen}
      title="Add Game"
    >
      {(isLoadingTeams || isLoadingGameStatuses) ? (
        <div className="p-4 text-center">
          <p className="text-gray-500 mb-4">
            Loading {isLoadingTeams ? 'teams' : 'game status'} data...
          </p>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
        </div>
      ) : (
        <GameForm 
          seasons={seasons}
          activeSeason={activeSeason}
          onSubmit={handleCreate}
          isSubmitting={false}
          onCancel={() => setIsDialogOpen(false)}
          gameStatuses={gameStatuses}
          teams={teams}
          allTeams={allTeams}
        />
      )}
    </CrudDialog>

    <CrudDialog
      isOpen={!!editingGame}
      setIsOpen={(open) => !open && setEditingGame(null)}
      title="Edit Game"
    >
      {editingGame && (
        <>
          {(teams.length === 0 || gameStatuses.length === 0) ? (
            <div className="p-4 text-center">
              <p className="text-gray-500 mb-4">
                Loading {teams.length === 0 ? 'teams' : 'game status'} data...
              </p>
              <Button variant="outline" onClick={() => setEditingGame(null)}>
                Cancel
              </Button>
            </div>
          ) : (
            <GameForm 
              game={editingGame} 
              seasons={seasons}
              activeSeason={activeSeason}
              onSubmit={handleUpdate}
              isSubmitting={updateMutation.isPending}
              onCancel={() => setEditingGame(null)}
              gameStatuses={gameStatuses}
              teams={teams}
              allTeams={allTeams}
              isEditing={true}
            />
          )}
        </>
      )}
    </CrudDialog>
  </>
  );
}