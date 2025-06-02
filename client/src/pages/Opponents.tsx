import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import OpponentsList from '@/components/opponents/OpponentsList';
import OpponentForm from '@/components/opponents/OpponentForm';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { Opponent } from '@shared/schema';

export default function Opponents() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingOpponent, setEditingOpponent] = useState<Opponent | null>(null);
  const { toast } = useToast();
  
  const { data: opponents = [], isLoading } = useQuery({
    queryKey: ['/api/opponents'],
  });
  
  const createMutation = useMutation({
    mutationFn: async (newOpponent: any) => {
      const res = await apiRequest('POST', '/api/opponents', newOpponent);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/opponents'] });
      toast({
        title: "Success",
        description: "Opponent created successfully",
      });
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create opponent: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: async ({ id, opponent }: { id: number, opponent: any }) => {
      const res = await apiRequest('PATCH', `/api/opponents/${id}`, opponent);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/opponents'] });
      toast({
        title: "Success",
        description: "Opponent updated successfully",
      });
      setEditingOpponent(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update opponent: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/opponents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/opponents'] });
      toast({
        title: "Success",
        description: "Opponent deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete opponent: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  const handleCreateOpponent = (data: any) => {
    createMutation.mutate(data);
  };
  
  const handleUpdateOpponent = (data: any) => {
    if (editingOpponent) {
      updateMutation.mutate({ id: editingOpponent.id, opponent: data });
    }
  };
  
  const handleDeleteOpponent = (id: number) => {
    deleteMutation.mutate(id);
  };
  
  return (
    <>
      <Helmet>
        <title>Opponents | NetballManager</title>
        <meta name="description" content="Manage your netball teams opponents, track teams and their contact information" />
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-heading font-bold text-neutral-dark">Opponent Management</h2>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-primary hover:bg-primary-light text-white"
          >
            <Plus className="w-4 h-4 mr-1" /> Add Opponent
          </Button>
        </div>
        
        <OpponentsList 
          opponents={opponents} 
          isLoading={isLoading}
          onEdit={setEditingOpponent}
          onDelete={handleDeleteOpponent}
        />
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <OpponentForm 
              onSubmit={handleCreateOpponent} 
              isSubmitting={createMutation.isPending} 
            />
          </DialogContent>
        </Dialog>
        
        <Dialog open={!!editingOpponent} onOpenChange={(open) => !open && setEditingOpponent(null)}>
          <DialogContent className="sm:max-w-[550px]">
            <OpponentForm 
              opponent={editingOpponent || undefined}
              onSubmit={handleUpdateOpponent} 
              isSubmitting={updateMutation.isPending} 
            />
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
