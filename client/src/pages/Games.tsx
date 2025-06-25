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
import { Badge } from '@/components/ui/badge';
import { TeamSwitcher } from '@/components/layout/TeamSwitcher';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CACHE_KEYS } from '@/lib/cacheKeys';
import { Helmet } from 'react-helmet';

// Import new UI standards
import { ContentBox, ActionButton, ResponsiveGrid } from '@/components/ui/ui-standards';
import PageTemplate from '@/components/layout/PageTemplate';

interface QueryParams {
  status?: string;
  season?: string;
}

export default function Games() {
  const params = useParams<{ clubId?: string; teamId?: string }>();
  const [location] = useLocation();
  const clubId = params.clubId ? Number(params.clubId) : null;
  const teamIdFromUrl = params.teamId ? parseInt(params.teamId) : null;

  // Fetch club details directly from URL parameter
  });

  // Detect if we're in club-wide games view
  const isClubWideGamesView = location.includes(`/club/${clubId}/games`);

  // For club-wide view, we should not use team context
  const effectiveTeamId = isClubWideGamesView ? null : teamIdFromUrl;

  // Clear team context when in club-wide view
  useEffect(() => {
    if (isClubWideGamesView && currentTeamId) {
      
    }
  }, [isClubWideGamesView, currentTeamId, 

  // Don't render anything until club context is fully loaded
  if (clubLoading || !club) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p className="mt-2 text-sm text-muted-foreground">Loading club data...</p>
        </div>
      </div>
    );
  }

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

  // Fetch teams - for club-wide view we need club teams, for team view we need all teams
      if (isClubWideGamesView) {
        return apiClient.get(`/api/clubs/${clubId}/teams`);
      } else {
        return apiClient.get('/api/teams');
      }
    },
  });

  // Auto-select team from URL if provided - but not for club-wide view
  useEffect(() => {
    if (!isClubWideGamesView && teamIdFromUrl && teams.length > 0) {
      const targetTeam = teams.find(t => t.id === teamIdFromUrl);
      if (targetTeam && currentTeamId !== teamIdFromUrl) {
        console.log(`Games: Setting team ${teamIdFromUrl} from URL`);
        
      }
    }
  }, [isClubWideGamesView, teamIdFromUrl, teams, currentTeamId, 

  // Fetch games - use team-specific endpoint when we have a team ID for better perspective handling
      if (isClubWideGamesView) {
        return apiClient.get(`/api/clubs/${clubId}/games`);
      } else if (effectiveTeamId) {
        // Use team-specific endpoint for better filtering and automatic perspective calculation
        return apiClient.get(`/api/teams/${effectiveTeamId}/games`);
      } else {
        return apiClient.get(`/api/clubs/${clubId}/games`);
      }
    },
  });

  // Centralized batch data fetching (same as Dashboard)
  const gameIdsArray = games?.map(g => g.id).sort() || [];
  const gameIds = gameIdsArray.join(',');

      if (gameIdsArray.length === 0) return { stats: {}, rosters: {}, scores: {} };

      console.log(`Games page fetching batch data for ${gameIdsArray.length} games with team ${effectiveTeamId}:`, gameIdsArray);

      try {
        const result = await dataFetcher.batchFetchGameData({
          gameIds: gameIdsArray,
          clubId: clubId!,
          teamId: effectiveTeamId ?? undefined,
          includeStats: true,
          includeRosters: true,
          includeScores: true
        });

        console.log('Games page batch data result for team', effectiveTeamId, ':', result);
        return result;
      } catch (error) {
        console.error('Games page batch data fetch error:', error);
        throw error;
      }
    },
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
  });

  // Fetch active season - no club context needed
  });

  // Fetch game statuses
    staleTime: 5 * 60 * 1000,
  });

  // Fetch players
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
      if (clubId) {
        // Invalidate the specific games query for current team (matches the actual query key pattern)
        queryClient.invalidateQueries({
        });

        // Invalidate team-specific games queries if we have a team
        if (effectiveTeamId) {
          queryClient.invalidateQueries({
            predicate: (query) => {
              const key = query.queryKey;
              return Array.isArray(key) && 
                     key[0] === `team-games-${effectiveTeamId}`;
            }
          });
        }

        // Invalidate Dashboard games queries (critical for UpcomingGames widget)
        queryClient.invalidateQueries({
          predicate: (query) => {
            const key = query.queryKey;
            return Array.isArray(key) && 
                   key[0] === 'games' && 
                   key[1] === clubId;
          }
        });

        // Invalidate batch data for the games list and dashboard
        queryClient.invalidateQueries({
          predicate: (query) => {
            const key = query.queryKey;
            return Array.isArray(key) && 
                   (key[0] === 'games-batch-data' || key[0] === 'batch-game-data') && 
                   key[1] === clubId;
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
  });

  // Debug club context
  console.log('Games page club context:', {
    club: club?.name,
    clubId,
    isClubWideGamesView,
    clubLoading
  });

  // Generate page title with context
  const pageTitle = isClubWideGamesView 
    ? `All Games - ${club?.name || 'Club'}` 
    : effectiveTeam 
      ? `Games - ${effectiveTeam.name}` 
      : 'Games';
  const pageSubtitle = isClubWideGamesView
    ? `View all game schedules and results for ${club?.name || 'the club'}`
    : effectiveTeamId 
      ? `Manage and view game schedules and results for ${effectiveTeam?.name || 'Selected Team'}`
      : 'Manage and view game schedules and results';

  // Generate breadcrumbs
  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Games' }
  ];

  return (
    <>
       <Helmet>
        <title>{`Games - ${club?.name || 'Club'}`}</title>
      </Helmet>
      <PageTemplate
        title={pageTitle}
        subtitle={pageSubtitle}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Games' }
        ]}
        actions={
          <>
            {isClubWideGamesView ? (
              <TeamSwitcher 
                mode="optional" 
                onTeamChange={(teamId) => {
                  if (teamId) {
                    setLocation(`/team/${teamId}/games`);
                  }
                }}
              />
            ) : (
              <>
                <div className="text-sm text-muted-foreground">
                  Team Filter (Optional):
                </div>
                <TeamSwitcher />
              </>
            )}
            <ActionButton 
              action="create" 
              onClick={() => setIsDialogOpen(true)}
              icon={Plus}
            >
              Add Game
            </ActionButton>
          </>
        }
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
            urlTeamId={effectiveTeamId} // Pass URL team ID for proper perspective
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