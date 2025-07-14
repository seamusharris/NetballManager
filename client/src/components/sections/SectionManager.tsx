
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import SectionForm from './SectionForm';
import { Plus, Edit, Trash2, Users } from 'lucide-react';

interface Section {
  id: number;
  name: string;
  displayName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  divisionCount: number; // <-- Add this
}

interface SectionManagerProps {
  seasonName: string;
}

export default function SectionManager({ seasonName }: SectionManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sections = [], isLoading } = useQuery<Section[]>({
    queryKey: ['sections'],
    queryFn: () => apiClient.get('/api/sections'),
    select: (data) => {
      return (data || []).map((section: any) => ({
        ...section,
        displayName: section.displayName || section.name,
        divisionCount: typeof section.divisionCount === 'number' ? section.divisionCount : (typeof section.division_count === 'number' ? section.division_count : 0)
      }));
    }
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/api/sections', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      setIsCreateDialogOpen(false);
      toast({ title: "Section created successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating section",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => {
      console.log('PATCH /api/sections/' + id, data);
      return apiClient.patch(`/api/sections/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      setEditingSection(null);
      setIsCreateDialogOpen(false);
      toast({ title: "Section updated successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating section",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/api/sections/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      toast({ title: "Section deleted successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting section",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleCreate = async (data: any) => {
    createMutation.mutate(data);
  };

  const handleUpdate = async (data: any) => {
    if (editingSection) {
      updateMutation.mutate({ id: editingSection.id, data });
    }
  };

  const handleDelete = (section: Section) => {
    if (confirm(`Are you sure you want to delete section ${section.displayName}?`)) {
      deleteMutation.mutate(section.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading sections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Sections - {seasonName}</h2>
          <p className="text-muted-foreground">
            Manage sections for the season
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Section
        </Button>
      </div>

      {sections.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">No sections created yet</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Section
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sections.map((section: Section) => (
            <Card key={section.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{section.displayName}</CardTitle>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingSection(section)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(section)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="default">
                      {section.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {section.divisionCount} division{section.divisionCount === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit/Create Section Dialog */}
      <Dialog open={isCreateDialogOpen || !!editingSection} onOpenChange={() => { setIsCreateDialogOpen(false); setEditingSection(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSection ? 'Edit Section' : 'Create Section'}</DialogTitle>
          </DialogHeader>
          <SectionForm
            section={editingSection || undefined}
            onSubmit={editingSection ? handleUpdate : handleCreate}
            onCancel={() => { setIsCreateDialogOpen(false); setEditingSection(null); }}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
