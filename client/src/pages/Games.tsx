import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GameForm } from '@/components/games/GameForm';
import { GamesList } from '@/components/games/GamesList';
import { CrudDialog } from '@/components/ui/crud-dialog';
import { Plus } from 'lucide-react';
import { apiRequest } from '@/lib/apiClient';
import { Game, Opponent, Player } from '@shared/schema';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useGameStatuses } from '@/hooks/use-game-statuses';
import { filterGamesByStatus } from '@/lib/gameFilters';

interface QueryParams {
  status?: string;
  season?: string;
}

export default function Games() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Get URL search params
  const urlParams = new URLSearchParams(window.location.search);

  useEffect(() => {
    const status = urlParams.get('status');
    if (status) {
      setStatusFilter(status);
    }
  }, []);

  // Fetch game statuses from database
  const { data: gameStatuses = [], isLoading: isLoadingStatuses } = useGameStatuses();

  // Fetch games
  const { data: games = [], isLoading: isLoadingGames } = useQuery<Game[]>({
    queryKey: ['games'],
    queryFn: () => apiRequest('GET', '/api/games') as Promise<Game[]>,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch opponents
  const { data: opponents = [] } = useQuery<Opponent[]>({
    queryKey: ['opponents'],
    queryFn: () => apiRequest('GET', '/api/opponents') as Promise<Opponent[]>,
  });

  // Fetch players
  const { data: players = [] } = useQuery<Player[]>({
    queryKey: ['players'],
    queryFn: () => apiRequest('GET', '/api/players') as Promise<Player[]>,
  });

  // Filter games based on status using shared filtering logic
  const filteredGames = filterGamesByStatus(games, statusFilter);

  const handleCreate = async (game: Game) => {
    try {
      console.log('Creating game with data:', game);
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

  const handleUpdate = async (game: Game) => {
    if (!editingGame) return;
    try {
      console.log('Updating game with data:', game);
      await apiRequest('PATCH', `/api/games/${editingGame.id}`, game);
      queryClient.invalidateQueries({ queryKey: ['games'] });
      setEditingGame(null);
      toast({
        title: 'Success',
        description: 'Game updated successfully.',
      });
    } catch (error) {
      console.error('Failed to update game:', error);
      toast({
        title: 'Error',
        description: 'Failed to update game.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiRequest('DELETE', `/api/games/${id}`);
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

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Games</CardTitle>
          <CardDescription>Manage games here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between pb-4">
            <div className="flex items-center gap-4">
              <div className="min-w-[200px]">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Games</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    {gameStatuses
                      .filter(status => status.isActive)
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map(status => (
                        <SelectItem key={status.id} value={status.name}>
                          {status.displayName}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Game
            </Button>
          </div>
          <GamesList games={filteredGames} opponents={opponents} onDelete={handleDelete} onEdit={setEditingGame} />
        </CardContent>
      </Card>

      <CrudDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        title="Add Game"
        onSubmit={handleCreate}
      >
        <GameForm opponents={opponents} players={players} />
      </CrudDialog>

      <CrudDialog
        isOpen={!!editingGame}
        setIsOpen={() => setEditingGame(null)}
        title="Edit Game"
        onSubmit={handleUpdate}
      >
        <GameForm game={editingGame} opponents={opponents} players={players} />
      </CrudDialog>
    </>
  );
}