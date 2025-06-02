
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Users, ArrowLeftRight, Plus, Trash2 } from 'lucide-react';
import { apiRequest } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import { useClub } from '@/contexts/ClubContext';

interface BorrowingRequest {
  id: number;
  playerId: number;
  playerName: string;
  gameId: number;
  gameDate: string;
  gameTime: string;
  borrowingTeamId: number;
  borrowingTeamName: string;
  lendingTeamId: number;
  lendingTeamName: string;
  approved: boolean;
  jerseyNumber?: number;
  notes?: string;
}

interface AvailablePlayer {
  id: number;
  displayName: string;
  positionPreferences: string[];
  teamId: number;
  teamName: string;
  seasonName: string;
}

export default function PlayerBorrowing() {
  const { currentClub } = useClub();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedGame, setSelectedGame] = useState<number | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [borrowForm, setBorrowForm] = useState({
    playerId: '',
    lendingTeamId: '',
    jerseyNumber: '',
    notes: ''
  });

  // Fetch borrowing requests for current club
  const { data: borrowingRequests = [], isLoading: isLoadingRequests } = useQuery<BorrowingRequest[]>({
    queryKey: ['borrowing-requests', currentClub?.clubId],
    queryFn: () => apiRequest('GET', `/api/clubs/${currentClub?.clubId}/player-borrowing`),
    enabled: !!currentClub?.clubId
  });

  // Fetch games for borrowing selection
  const { data: games = [] } = useQuery({
    queryKey: ['games'],
    queryFn: () => apiRequest('GET', '/api/games')
  });

  // Fetch teams for the current club
  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: () => apiRequest('GET', '/api/teams')
  });

  // Fetch available players for borrowing
  const { data: availablePlayers = [] } = useQuery<AvailablePlayer[]>({
    queryKey: ['available-players', currentClub?.clubId, selectedGame, selectedTeam],
    queryFn: () => apiRequest('GET', `/api/clubs/${currentClub?.clubId}/players/available-for-borrowing?gameId=${selectedGame}&excludeTeamId=${selectedTeam}`),
    enabled: !!currentClub?.clubId && !!selectedGame && !!selectedTeam
  });

  // Create borrowing request mutation
  const createBorrowingMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', `/api/clubs/${currentClub?.clubId}/player-borrowing`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['borrowing-requests'] });
      setIsCreateDialogOpen(false);
      setBorrowForm({ playerId: '', lendingTeamId: '', jerseyNumber: '', notes: '' });
      toast({
        title: 'Success',
        description: 'Player borrowing request created successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create borrowing request.',
        variant: 'destructive',
      });
    }
  });

  // Delete borrowing request mutation
  const deleteBorrowingMutation = useMutation({
    mutationFn: async (borrowingId: number) => {
      return apiRequest('DELETE', `/api/clubs/${currentClub?.clubId}/player-borrowing/${borrowingId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['borrowing-requests'] });
      toast({
        title: 'Success',
        description: 'Borrowing request removed successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove borrowing request.',
        variant: 'destructive',
      });
    }
  });

  const handleCreateBorrowing = () => {
    if (!selectedGame || !selectedTeam || !borrowForm.playerId) {
      toast({
        title: 'Error',
        description: 'Please select a game, team, and player.',
        variant: 'destructive',
      });
      return;
    }

    // Find the lending team for the selected player
    const selectedPlayer = availablePlayers.find(p => p.id.toString() === borrowForm.playerId);
    if (!selectedPlayer) {
      toast({
        title: 'Error',
        description: 'Selected player not found.',
        variant: 'destructive',
      });
      return;
    }

    createBorrowingMutation.mutate({
      gameId: selectedGame,
      playerId: parseInt(borrowForm.playerId),
      borrowingTeamId: selectedTeam,
      lendingTeamId: selectedPlayer.teamId,
      jerseyNumber: borrowForm.jerseyNumber ? parseInt(borrowForm.jerseyNumber) : undefined,
      notes: borrowForm.notes || undefined
    });
  };

  const upcomingGames = games.filter(game => !game.gameStatus?.isCompleted);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Player Borrowing</h1>
          <p className="text-gray-600">Manage player borrowing between teams</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Borrow Player
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Borrow Player for Game</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Game</Label>
                <Select onValueChange={(value) => setSelectedGame(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select game" />
                  </SelectTrigger>
                  <SelectContent>
                    {upcomingGames.map((game) => (
                      <SelectItem key={game.id} value={game.id.toString()}>
                        {game.date} at {game.time} - vs {game.opponent?.teamName || 'TBD'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Borrowing Team</Label>
                <Select onValueChange={(value) => setSelectedTeam(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team that needs player" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id.toString()}>
                        {team.name} ({team.division || 'No Division'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedGame && selectedTeam && (
                <>
                  <div>
                    <Label>Available Players</Label>
                    <Select onValueChange={(value) => setBorrowForm({...borrowForm, playerId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select player to borrow" />
                      </SelectTrigger>
                      <SelectContent>
                        {availablePlayers.map((player) => (
                          <SelectItem key={player.id} value={player.id.toString()}>
                            {player.displayName} - {player.teamName} ({player.seasonName})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  

                  <div>
                    <Label>Notes (Optional)</Label>
                    <Textarea
                      placeholder="Any additional notes..."
                      value={borrowForm.notes}
                      onChange={(e) => setBorrowForm({...borrowForm, notes: e.target.value})}
                    />
                  </div>

                  <Button 
                    onClick={handleCreateBorrowing}
                    disabled={createBorrowingMutation.isPending}
                    className="w-full"
                  >
                    {createBorrowingMutation.isPending ? 'Creating...' : 'Create Borrowing Request'}
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5" />
            Active Borrowing Requests
          </CardTitle>
          <CardDescription>
            Players borrowed between teams within your club
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingRequests ? (
            <div className="text-center py-4">Loading borrowing requests...</div>
          ) : borrowingRequests.length === 0 ? (
            <Alert>
              <Users className="h-4 w-4" />
              <AlertDescription>
                No player borrowing requests found. Create one to get started.
              </AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead>Game</TableHead>
                  <TableHead>From Team</TableHead>
                  <TableHead>To Team</TableHead>
                  <TableHead>Jersey #</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {borrowingRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.playerName}</TableCell>
                    <TableCell>
                      {request.gameDate} at {request.gameTime}
                    </TableCell>
                    <TableCell>{request.lendingTeamName}</TableCell>
                    <TableCell>{request.borrowingTeamName}</TableCell>
                    <TableCell>{request.jerseyNumber || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={request.approved ? 'default' : 'secondary'}>
                        {request.approved ? 'Approved' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteBorrowingMutation.mutate(request.id)}
                        disabled={deleteBorrowingMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
