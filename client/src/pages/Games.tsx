import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { CrudDialog } from '@/components/ui/crud-dialog';
import NewGameForm from '@/components/games/NewGameForm';
import SimplifiedGamesList from '@/components/ui/simplified-games-list';
import { useSimplifiedGames } from '@/hooks/use-simplified-games';
import { apiClient } from '@/lib/apiClient';
import { Game, Player } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { useLocation, useParams } from 'wouter';
import { useTeamContext } from '@/hooks/use-team-context';
import { Badge } from '@/components/ui/badge';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CACHE_KEYS } from '@/lib/cacheKeys';
import { Helmet } from 'react-helmet';


// Import new UI standards
import { ContentBox, ActionButton } from '@/components/ui/ui-standards';
import PageTemplate from '@/components/layout/PageTemplate';

interface QueryParams {
  status?: string;
  season?: string;
}

export default function Games() {
  // Simple Games page - no complex monitoring or error handling

  const [, setLocation] = useLocation();
  
  // Use standardized team context utility
  const { teamId, teamName, clubId, clubName, isLoading: isLoadingContext } = useTeamContext();

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);

  // Handle status filter from URL parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const statusParam = searchParams.get('status');
    if (statusParam && ['upcoming', 'completed', 'in-progress', 'forfeit-win', 'forfeit-loss', 'bye', 'abandoned'].includes(statusParam)) {
      // The GamesList component will handle the status filter via its own URL parameter logic
    }
  }, []);

  // Simple data fetching like GamePreparation page - only what we need
  const { data: games = [], isLoading: isLoadingGames } = useSimplifiedGames(
    clubId,
    teamId
  );

  // Only fetch additional data when needed for game creation/editing
  const { data: seasons = [] } = useQuery({
    queryKey: ['seasons'], 
    queryFn: () => apiClient.get('/api/seasons'),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  const { data: gameStatuses = [] } = useQuery({
    queryKey: ['game-statuses'],
    queryFn: () => apiClient.get('/api/game-statuses'),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  const { data: activeSeason } = useQuery({
    queryKey: ['active-season'],
    queryFn: () => apiClient.get('/api/seasons/active'),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  const handleCreate = async (game: Game) => {
    try {
      console.log('Creating game with data:', game);

      // Ensure game has season context - use active season if not specified
      if (!game.seasonId) {
        try {
          const activeSeason = await apiClient.get('/api/seasons/active') as { id: number; name: string };
          game.seasonId = activeSeason.id;
          console.log(`Assigned game to active season: ${activeSeason.name} (ID: ${activeSeason.id})`);
        } catch (error) {
          console.warn('Could not get active season for new game:', error);
        }
      }

      await apiClient.post('/api/games', game);

      // Invalidate games queries using the correct query keys that match the actual queries
      if (clubId) {
        // Invalidate the specific games query for current team (matches the actual query key pattern)
        queryClient.invalidateQueries({
          queryKey: ['simplified-games', clubId, teamId]
        });

        // Invalidate team-specific games queries if we have a team
        if (teamId) {
          queryClient.invalidateQueries({
            predicate: (query) => {
              const key = query.queryKey;
              return Array.isArray(key) && 
                     key[0] === `team-games-${teamId}`;
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
      // Invalidate all game-related queries
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.invalidateQueries({ queryKey: ['simplified-games'] });
      queryClient.invalidateQueries({ queryKey: ['team-games'] });
      queryClient.invalidateQueries({ queryKey: ['/api/games'] });
      
      // Invalidate specific game queries
      if (editingGame?.id) {
        queryClient.invalidateQueries({ queryKey: ['/api/games', editingGame.id] });
        queryClient.invalidateQueries({ queryKey: ['teams', teamId, 'games', editingGame.id] });
      }
      
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
      
      // Invalidate all game-related queries
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.invalidateQueries({ queryKey: ['simplified-games'] });
      queryClient.invalidateQueries({ queryKey: ['team-games'] });
      queryClient.invalidateQueries({ queryKey: ['/api/games'] });
      
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

  // Remove unnecessary queries that cause flickering

  // Debug club context (removed to stop spam)

  // Generate page title with context - simplified using standardized utility
  const pageTitle = teamName 
    ? `Games - ${teamName}` 
    : 'Games';
  const pageSubtitle = teamName 
    ? `Manage and view game schedules and results for ${teamName}`
    : 'Manage and view game schedules and results';

  // Generate breadcrumbs
  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Games' }
  ];

  return (
    <>
       <Helmet>
        <title>{`Games - ${teamName || 'Team'}`}</title>
      </Helmet>
      <PageTemplate
        title={pageTitle}
        subtitle={pageSubtitle}
        actions={
          <ActionButton 
            action="create" 
            onClick={() => setIsDialogOpen(true)}
            icon={Plus}
          >
            Add Game
          </ActionButton>
        }
      >
        <ContentBox>
          <SimplifiedGamesList
            games={games}
            currentTeamId={teamId ?? 0}
            variant="all"
            layout="wide"
            showFilters={true}
            showQuarterScores={true}
            className="w-full"
          />
        </ContentBox>
      </PageTemplate>

      <CrudDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        title="Add Game"
      >
        <NewGameForm 
          seasons={seasons}
          onSubmit={handleCreate}
          isSubmitting={false}
          onCancel={() => setIsDialogOpen(false)}
          gameStatuses={gameStatuses}
          activeSeason={activeSeason}
        />
      </CrudDialog>

      <CrudDialog
        isOpen={!!editingGame}
        setIsOpen={(open) => !open && setEditingGame(null)}
        title="Edit Game"
      >
        {editingGame && (
          <NewGameForm 
            game={editingGame} 
            seasons={seasons}
            onSubmit={handleUpdate}
            isSubmitting={updateMutation.isPending}
            onCancel={() => setEditingGame(null)}
            gameStatuses={gameStatuses}
            activeSeason={activeSeason}
            isEditing={true}
          />
        )}
      </CrudDialog>
    </>
  );
}