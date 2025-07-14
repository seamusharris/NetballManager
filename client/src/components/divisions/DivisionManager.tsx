import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Users, Layers } from 'lucide-react';
import AgeGroupForm from './AgeGroupForm';
import SectionForm from './SectionForm';
import DivisionForm from './DivisionForm';
import camelcaseKeys from 'camelcase-keys';
import snakecaseKeys from 'snakecase-keys';

interface AgeGroup {
  id: number;
  name: string;
  displayName: string;
  isActive: boolean;
  divisionCount: number;
}

interface Section {
  id: number;
  name: string;
  displayName: string;
  isActive: boolean;
  divisionCount: number;
}

interface Division {
  id: number;
  ageGroupId: number;
  sectionId: number;
  seasonId: number;
  displayName: string;
  isActive: boolean;
  teamCount: number;
  ageGroupName: string;
  sectionName: string;
}

interface DivisionManagerProps {
  seasonId: number;
  seasonName: string;
}

// Helper to map camelCase to snake_case for division data
const mapDivisionData = (data: any) => ({
  ...data,
  age_group_id: data.ageGroupId,
  section_id: data.sectionId,
  season_id: data.seasonId,
  display_name: data.displayName,
  is_active: data.isActive,
});

export default function DivisionManager({ seasonId, seasonName }: DivisionManagerProps) {
  const [activeTab, setActiveTab] = useState('divisions');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [dialogType, setDialogType] = useState<'ageGroup' | 'section' | 'division'>('division');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch age groups
  const { data: ageGroups = [], isLoading: ageGroupsLoading } = useQuery<AgeGroup[]>({
    queryKey: ['age-groups'],
    queryFn: () => apiClient.get('/api/age-groups'),
  });

  // Fetch sections
  const { data: sections = [], isLoading: sectionsLoading } = useQuery<Section[]>({
    queryKey: ['sections'],
    queryFn: () => apiClient.get('/api/sections'),
  });

  // Fetch divisions for this season
  const { data: rawDivisions = [], isLoading: divisionsLoading } = useQuery<any[]>({
    queryKey: ['divisions', seasonId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/seasons/${seasonId}/divisions`);
      // Convert all division objects to camelCase
      return Array.isArray(response) ? response.map((d) => camelcaseKeys(d, { deep: true })) : [];
    },
  });
  const divisions: Division[] = rawDivisions;
  console.log('Divisions after camelcaseKeys:', divisions);

  // Create mutations
  const createAgeGroupMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/api/age-groups', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['age-groups'] });
      setIsCreateDialogOpen(false);
      toast({ title: "Age group created successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating age group",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const createSectionMutation = useMutation({
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

  const createDivisionMutation = useMutation({
    mutationFn: (data: any) => apiClient.post(`/api/seasons/${seasonId}/divisions`, snakecaseKeys(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['divisions', seasonId] });
      setIsCreateDialogOpen(false);
      toast({ title: "Division created successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating division",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update mutations
  const updateAgeGroupMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiClient.patch(`/api/age-groups/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['age-groups'] });
      setEditingItem(null);
      setIsCreateDialogOpen(false);
      toast({ title: "Age group updated successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating age group",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const updateSectionMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiClient.patch(`/api/sections/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      setEditingItem(null);
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

  const updateDivisionMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiClient.patch(`/api/divisions/${id}`, snakecaseKeys(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['divisions', seasonId] });
      setEditingItem(null);
      setIsCreateDialogOpen(false);
      toast({ title: "Division updated successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating division",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete mutations
  const deleteAgeGroupMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/api/age-groups/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['age-groups'] });
      toast({ title: "Age group deleted successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting age group",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const deleteSectionMutation = useMutation({
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

  const deleteDivisionMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/api/divisions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['divisions', seasonId] });
      toast({ title: "Division deleted successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting division",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleCreate = async (data: any) => {
    switch (dialogType) {
      case 'ageGroup':
        createAgeGroupMutation.mutate(data);
        break;
      case 'section':
        createSectionMutation.mutate(data);
        break;
      case 'division':
        createDivisionMutation.mutate(data);
        break;
    }
  };

  const handleUpdate = async (data: any) => {
    if (!editingItem) return;
    
    switch (dialogType) {
      case 'ageGroup':
        updateAgeGroupMutation.mutate({ id: editingItem.id, data });
        break;
      case 'section':
        updateSectionMutation.mutate({ id: editingItem.id, data });
        break;
      case 'division':
        updateDivisionMutation.mutate({ id: editingItem.id, data });
        break;
    }
  };

  const handleDelete = (item: any, type: 'ageGroup' | 'section' | 'division') => {
    const countField = type === 'ageGroup' ? 'divisionCount' : type === 'section' ? 'divisionCount' : 'teamCount';
    const count = item[countField];
    
    if (count > 0) {
      toast({
        title: `Cannot delete ${type}`,
        description: `This ${type} has ${count} ${type === 'division' ? 'teams' : 'divisions'} assigned. Please reassign first.`,
        variant: "destructive"
      });
      return;
    }

    const name = type === 'ageGroup' ? item.displayName : type === 'section' ? item.displayName : item.displayName;
    if (confirm(`Are you sure you want to delete ${type} ${name}?`)) {
      switch (type) {
        case 'ageGroup':
          deleteAgeGroupMutation.mutate(item.id);
          break;
        case 'section':
          deleteSectionMutation.mutate(item.id);
          break;
        case 'division':
          deleteDivisionMutation.mutate(item.id);
          break;
      }
    }
  };

  const openCreateDialog = (type: 'ageGroup' | 'section' | 'division') => {
    setDialogType(type);
    setEditingItem(null);
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (item: any, type: 'ageGroup' | 'section' | 'division') => {
    setDialogType(type);
    // For divisions, ensure editingItem is camelCase
    const editing = type === 'division' ? camelcaseKeys(item, { deep: true }) : item;
    if (type === 'division') {
      console.log('Editing division object:', editing);
    }
    setEditingItem(editing);
    setIsCreateDialogOpen(true);
  };

  const isLoading = ageGroupsLoading || sectionsLoading || divisionsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading divisions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Divisions - {seasonName}</h2>
          <p className="text-muted-foreground">
            Manage age groups, sections, and divisions for the season
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => openCreateDialog('ageGroup')} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Age Group
          </Button>
          <Button onClick={() => openCreateDialog('section')} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Section
          </Button>
          <Button onClick={() => openCreateDialog('division')}>
            <Plus className="h-4 w-4 mr-2" />
            Division
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="divisions">Divisions</TabsTrigger>
          <TabsTrigger value="ageGroups">Age Groups</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
        </TabsList>

        <TabsContent value="divisions" className="space-y-4">
          {divisions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground mb-4">No divisions created yet</p>
                <Button onClick={() => openCreateDialog('division')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Division
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {divisions.map((division: Division) => (
                <Card key={division.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{division.displayName}</CardTitle>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(division, 'division')}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(division, 'division')}
                          disabled={division.teamCount > 0}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm">
                          <Users className="h-4 w-4 mr-1" />
                          {division.teamCount} teams
                        </div>
                        <Badge variant="default">
                          {division.ageGroupName} / {division.sectionName}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="ageGroups" className="space-y-4">
          {ageGroups.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground mb-4">No age groups created yet</p>
                <Button onClick={() => openCreateDialog('ageGroup')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Age Group
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {ageGroups.map((ageGroup: AgeGroup) => (
                <Card key={ageGroup.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{ageGroup.displayName}</CardTitle>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(ageGroup, 'ageGroup')}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(ageGroup, 'ageGroup')}
                          disabled={ageGroup.divisionCount > 0}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm">
                          <Layers className="h-4 w-4 mr-1" />
                          {ageGroup.divisionCount} divisions
                        </div>
                        <Badge variant={ageGroup.isActive ? "default" : "secondary"}>
                          {ageGroup.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sections" className="space-y-4">
          {sections.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground mb-4">No sections created yet</p>
                <Button onClick={() => openCreateDialog('section')}>
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
                          onClick={() => openEditDialog(section, 'section')}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(section, 'section')}
                          disabled={section.divisionCount > 0}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm">
                          <Layers className="h-4 w-4 mr-1" />
                          {section.divisionCount} divisions
                        </div>
                        <Badge variant={section.isActive ? "default" : "secondary"}>
                          {section.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? `Edit ${dialogType}` : `Create ${dialogType}`}
            </DialogTitle>
          </DialogHeader>
          {dialogType === 'ageGroup' && (
            <AgeGroupForm
              ageGroup={editingItem}
              onSubmit={editingItem ? handleUpdate : handleCreate}
              onCancel={() => setIsCreateDialogOpen(false)}
              isSubmitting={createAgeGroupMutation.isPending || updateAgeGroupMutation.isPending}
            />
          )}
          {dialogType === 'section' && (
            <SectionForm
              section={editingItem}
              onSubmit={editingItem ? handleUpdate : handleCreate}
              onCancel={() => setIsCreateDialogOpen(false)}
              isSubmitting={createSectionMutation.isPending || updateSectionMutation.isPending}
            />
          )}
          {dialogType === 'division' && (
            <DivisionForm
              division={editingItem}
              seasonId={seasonId}
              onSubmit={editingItem ? handleUpdate : handleCreate}
              onCancel={() => setIsCreateDialogOpen(false)}
              isSubmitting={createDivisionMutation.isPending || updateDivisionMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 