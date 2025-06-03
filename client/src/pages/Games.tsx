import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import GameForm from '@/components/games/GameForm';
import { GamesList } from '@/components/games/GamesList';
import { CrudDialog } from '@/components/ui/crud-dialog';
import { Plus, Loader2 } from 'lucide-react';
import { apiRequest, apiClient } from '@/lib/apiClient';
import { Game, Player } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { useClub } from '@/contexts/ClubContext';
import { useGameStatuses } from '@/hooks/use-game-statuses';

interface QueryParams {
  status?: string;
  season?: string;
}

export default function Games() {
  const { currentClub, hasPermission, isLoading: clubLoading } = useClub();

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

  // Get current club context
  const currentClubId = apiClient.getCurrentClubId ? apiClient.getCurrentClubId() : null;

  // Fetch games
  const { data: games = [], isLoading: isLoadingGames } = useQuery<Game[]>({
    queryKey: ['games', currentClub?.id],
    queryFn: () => {
      console.log('Fetching games for club:', currentClubId);
      return apiClient.get('/api/games');
    },
    enabled: !!currentClub?.id, // Only fetch when we have a club ID
    staleTime: 0, // Disable caching temporarily to debug
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Debug logging
  console.log('Games page:', {
    currentClubId,
    gamesCount: games.length,
    isLoading: isLoadingGames,
    sampleGame: games[0]
  });

  // Fetch teams for current club
  const { data: teams = [], isLoading: isLoadingTeams } = useQuery({
    queryKey: ['teams', currentClub?.id],
    queryFn: () => apiClient.get('/api/teams'),
    enabled: !!currentClub?.id,
  });

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
  const { data: gameStatuses = [], isLoading: isLoadingGameStatuses, error: gameStatusesError } = useGameStatuses();

  // Debug game statuses
  console.log('Games page - Game statuses:', {
    gameStatuses: gameStatuses.length,
    isLoading: isLoadingGameStatuses,
    error: gameStatusesError,
    sampleStatus: gameStatuses[0]
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
      queryClient.invalidateQueries({ queryKey: ['games'] });
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

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Games</CardTitle>
          <CardDescription>Manage games here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end pb-4">
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Game
            </Button>
          </div>
          <GamesList 
            games={games} 
            opponents={[]} // Legacy prop - no longer used but component expects it
            isLoading={isLoadingGames}
            onDelete={handleDelete} 
            onEdit={setEditingGame}
            onViewStats={handleViewStats}
            isDashboard={false}
            showFilters={true}
            showActions={true}
          />
        </CardContent>
      </Card>

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
            {console.log('Games page - EditingGame GameForm props:', {
              game: editingGame,
              seasons: seasons.length,
              activeSeason,
              teams: teams.length,
              isSubmitting: updateMutation.isPending
            })}
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