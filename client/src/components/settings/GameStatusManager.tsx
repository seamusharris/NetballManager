import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface GameStatus {
  id: number;
  name: string;
  displayName: string;
  points: number;
  opponentPoints: number;
  isCompleted: boolean;
  allowsStatistics: boolean;
  requiresOpponent: boolean;
  colorClass: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface GameStatusFormData {
  name: string;
  displayName: string;
  points: number;
  opponentPoints: number;
  isCompleted: boolean;
  allowsStatistics: boolean;
  requiresOpponent: boolean;
  colorClass: string;
  sortOrder: number;
}

export function GameStatusManager() {
  const [editingStatus, setEditingStatus] = useState<GameStatus | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<GameStatusFormData>({
    name: '',
    displayName: '',
    points: 0,
    opponentPoints: 0,
    isCompleted: false,
    allowsStatistics: true,
    requiresOpponent: true,
    colorClass: 'bg-gray-500',
    sortOrder: 0,
  });

  const queryClient = useQueryClient();

  // Fetch all game statuses (including inactive ones for management)
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: GameStatusFormData) => 
      apiRequest('POST', '/api/game-statuses', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/game-statuses'] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Game status created successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create game status',
        variant: 'destructive',
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<GameStatusFormData> }) =>
      apiRequest('PUT', `/api/game-statuses/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/game-statuses'] });
      setIsEditDialogOpen(false);
      setEditingStatus(null);
      resetForm();
      toast({
        title: 'Success',
        description: 'Game status updated successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update game status',
        variant: 'destructive',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/game-statuses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/game-statuses'] });
      toast({
        title: 'Success',
        description: 'Game status deleted successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete game status',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      displayName: '',
      points: 0,
      opponentPoints: 0,
      isCompleted: false,
      allowsStatistics: true,
      requiresOpponent: true,
      colorClass: 'bg-gray-500',
      sortOrder: 0,
    });
  };

  const handleEdit = (status: GameStatus) => {
    setEditingStatus(status);
    setFormData({
      name: status.name,
      displayName: status.displayName,
      points: status.points,
      opponentPoints: status.opponentPoints,
      isCompleted: status.isCompleted,
      allowsStatistics: status.allowsStatistics,
      requiresOpponent: status.requiresOpponent,
      colorClass: status.colorClass || 'bg-gray-500',
      sortOrder: status.sortOrder,
    });
    setIsEditDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStatus) {
      updateMutation.mutate({ id: editingStatus.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (status: GameStatus) => {
    if (confirm(`Are you sure you want to delete "${status.displayName}"?`)) {
      deleteMutation.mutate(status.id);
    }
  };

  if (isLoading) {
    return <div>Loading game statuses...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Status Management</CardTitle>
        <CardDescription>
          Manage game statuses, their points system, and behavior settings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Current Game Statuses</h3>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Status
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Game Status</DialogTitle>
                <DialogDescription>
                  Add a new game status with custom points and behavior settings.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., forfeit-win"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        value={formData.displayName}
                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                        placeholder="e.g., Forfeit Win"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="points">Points</Label>
                      <Input
                        id="points"
                        type="number"
                        value={formData.points}
                        onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="opponentPoints">Opponent Points</Label>
                      <Input
                        id="opponentPoints"
                        type="number"
                        value={formData.opponentPoints}
                        onChange={(e) => setFormData({ ...formData, opponentPoints: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="colorClass">Color Class</Label>
                      <Input
                        id="colorClass"
                        value={formData.colorClass}
                        onChange={(e) => setFormData({ ...formData, colorClass: e.target.value })}
                        placeholder="e.g., bg-green-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sortOrder">Sort Order</Label>
                      <Input
                        id="sortOrder"
                        type="number"
                        value={formData.sortOrder}
                        onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isCompleted"
                        checked={formData.isCompleted}
                        onCheckedChange={(checked) => setFormData({ ...formData, isCompleted: checked })}
                      />
                      <Label htmlFor="isCompleted">Marks game as completed</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="allowsStatistics"
                        checked={formData.allowsStatistics}
                        onCheckedChange={(checked) => setFormData({ ...formData, allowsStatistics: checked })}
                      />
                      <Label htmlFor="allowsStatistics">Allows statistics recording</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="requiresOpponent"
                        checked={formData.requiresOpponent}
                        onCheckedChange={(checked) => setFormData({ ...formData, requiresOpponent: checked })}
                      />
                      <Label htmlFor="requiresOpponent">Requires opponent</Label>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Creating...' : 'Create'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Display Name</TableHead>
              <TableHead>Internal Name</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Opponent Points</TableHead>
              <TableHead>Behavior</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {gameStatuses.map((status: GameStatus) => (
              <TableRow key={status.id}>
                <TableCell className="font-medium">{status.displayName}</TableCell>
                <TableCell>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">{status.name}</code>
                </TableCell>
                <TableCell>{status.points}</TableCell>
                <TableCell>{status.opponentPoints}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {status.isCompleted && <Badge variant="secondary">Completed</Badge>}
                    {status.allowsStatistics && <Badge variant="outline">Stats</Badge>}
                    {!status.requiresOpponent && <Badge variant="outline">No Opponent</Badge>}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={status.isActive ? "default" : "secondary"}>
                    {status.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(status)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(status)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Game Status</DialogTitle>
              <DialogDescription>
                Update the game status settings and behavior.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-name">Name *</Label>
                    <Input
                      id="edit-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., forfeit-win"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-displayName">Display Name</Label>
                    <Input
                      id="edit-displayName"
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      placeholder="e.g., Forfeit Win"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-points">Points</Label>
                    <Input
                      id="edit-points"
                      type="number"
                      value={formData.points}
                      onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-opponentPoints">Opponent Points</Label>
                    <Input
                      id="edit-opponentPoints"
                      type="number"
                      value={formData.opponentPoints}
                      onChange={(e) => setFormData({ ...formData, opponentPoints: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-colorClass">Color Class</Label>
                    <Input
                      id="edit-colorClass"
                      value={formData.colorClass}
                      onChange={(e) => setFormData({ ...formData, colorClass: e.target.value })}
                      placeholder="e.g., bg-green-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-sortOrder">Sort Order</Label>
                    <Input
                      id="edit-sortOrder"
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-isCompleted"
                      checked={formData.isCompleted}
                      onCheckedChange={(checked) => setFormData({ ...formData, isCompleted: checked })}
                    />
                    <Label htmlFor="edit-isCompleted">Marks game as completed</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-allowsStatistics"
                      checked={formData.allowsStatistics}
                      onCheckedChange={(checked) => setFormData({ ...formData, allowsStatistics: checked })}
                    />
                    <Label htmlFor="edit-allowsStatistics">Allows statistics recording</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-requiresOpponent"
                      checked={formData.requiresOpponent}
                      onCheckedChange={(checked) => setFormData({ ...formData, requiresOpponent: checked })}
                    />
                    <Label htmlFor="edit-requiresOpponent">Requires opponent</Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Updating...' : 'Update'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}