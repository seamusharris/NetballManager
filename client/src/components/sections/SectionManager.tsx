
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
  seasonId: number;
  ageGroup: string;
  sectionName: string;
  displayName: string;
  description?: string;
  isActive: boolean;
  teamCount: number;
}

interface SectionManagerProps {
  seasonId: number;
  seasonName: string;
}

export default function SectionManager({ seasonId, seasonName }: SectionManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sections = [], isLoading } = useQuery({
    queryKey: ['sections', seasonId],
    queryFn: () => apiClient.get(`/api/seasons/${seasonId}/sections`),
    select: (data) => {
      return (data || []).map((section: any) => ({
        ...section,
        displayName: section.displayName || `${section.ageGroup} - ${section.sectionName}`
      }));
    }
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.post(`/api/seasons/${seasonId}/sections`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections', seasonId] });
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
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiClient.patch(`/api/sections/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections', seasonId] });
      setEditingSection(null);
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
      queryClient.invalidateQueries({ queryKey: ['sections', seasonId] });
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
    if (section.teamCount > 0) {
      toast({
        title: "Cannot delete section",
        description: "This section has teams assigned. Please reassign teams first.",
        variant: "destructive"
      });
      return;
    }

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
            Manage age groups and sections for the season
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
                      disabled={section.teamCount > 0}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {section.description && (
                    <p className="text-sm text-muted-foreground">
                      {section.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 mr-1" />
                      {section.teamCount} teams
                    </div>
                    <Badge variant="default">
                      Active
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Section Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Section</DialogTitle>
          </DialogHeader>
          <SectionForm
            seasonId={seasonId}
            onSubmit={handleCreate}
            onCancel={() => setIsCreateDialogOpen(false)}
            isSubmitting={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Section Dialog */}
      <Dialog open={!!editingSection} onOpenChange={() => setEditingSection(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Section</DialogTitle>
          </DialogHeader>
          {editingSection && (
            <SectionForm
              section={editingSection}
              seasonId={seasonId}
              onSubmit={handleUpdate}
              onCancel={() => setEditingSection(null)}
              isSubmitting={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
