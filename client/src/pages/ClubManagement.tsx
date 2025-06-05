import React from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Building2, Plus, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import ClubForm from "@/components/clubs/ClubForm";
import { 
  AlertDialog,
  AlertDialogAction, 
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { useClub } from '@/contexts/ClubContext';
import { useLocation } from 'wouter';

interface Club {
  id: number;
  name: string;
  code: string;
  primaryColor: string;
  secondaryColor: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  isActive: boolean;
}

interface ClubWithStats extends Club {
  playersCount: number;
  teamsCount: number;
}

async function fetchApi(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export default function ClubManagement() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingClub, setEditingClub] = useState<any>(null);
  const [deletingClub, setDeletingClub] = useState<any>(null);
  const { currentClub, switchClub } = useClub();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  // Fetch all clubs (admin only)
  const { data: clubs, isLoading } = useQuery({
    queryKey: ['clubs'],
    queryFn: async () => {
      const response = await fetch('/api/clubs', {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch clubs: ${response.status}`);
      }
      return response.json() as ClubWithStats[];
    }
  });

  // Create club mutation
  const createMutation = useMutation({
    mutationFn: async (clubData: any) => {
      const response = await fetch('/api/clubs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clubData)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Club created successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create club",
        variant: "destructive"
      });
    }
  });

  // Update club mutation
  const updateMutation = useMutation({
    mutationFn: async (clubData: any) => {
      const response = await fetch(`/api/clubs/${clubData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clubData)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
      setEditingClub(null);
      toast({
        title: "Success",
        description: "Club updated successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update club",
        variant: "destructive"
      });
    }
  });

  // Delete club mutation
  const deleteMutation = useMutation({
    mutationFn: async (clubId: number) => {
      const response = await fetch(`/api/clubs/${clubId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
      setDeletingClub(null);
      toast({
        title: "Success",
        description: "Club deleted successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete club",
        variant: "destructive"
      });
    }
  });

  const handleCreateClub = (clubData: any) => {
    createMutation.mutate(clubData);
  };

  const handleUpdateClub = (clubData: any) => {
    if (editingClub) {
      updateMutation.mutate({ ...clubData, id: editingClub.id });
    }
  };

  const handleDeleteClub = () => {
    if (deletingClub) {
      deleteMutation.mutate(deletingClub.id);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Club Management</h1>
          <p className="text-muted-foreground">Manage clubs and their settings</p>
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Club Management</h1>
          <p className="text-muted-foreground">Manage clubs and their settings</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Club
        </Button>
      </div>

      <div className="grid gap-6">
        {clubs?.map((club) => (
          <Card key={club.id} className={`${currentClub?.id === club.id ? 'ring-2 ring-primary' : ''}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: club.primaryColor }}
                  >
                    {club.code}
                  </div>
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <span>{club.name}</span>
                      {currentClub?.id === club.id && (
                        <Badge variant="default">Current</Badge>
                      )}
                      {!club.isActive && (
                        <Badge variant="destructive">Inactive</Badge>
                      )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">Code: {club.code}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEditingClub(club)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setDeletingClub(club)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{club.playersCount || 0} players</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{club.teamsCount || 0} teams</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {club.contactEmail && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Email: </span>
                      <span>{club.contactEmail}</span>
                    </div>
                  )}
                  {club.contactPhone && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Phone: </span>
                      <span>{club.contactPhone}</span>
                    </div>
                  )}
                  {club.address && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Address: </span>
                      <span>{club.address}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={async () => {
                      if (currentClub?.id !== club.id) {
                        switchClub(club.id);
                      }
                      navigate('/players');
                    }}
                  >
                    Manage Players
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={async () => {
                      if (currentClub?.id !== club.id) {
                        switchClub(club.id);
                      }
                      navigate('/teams');
                    }}
                  >
                    Manage Teams
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={async () => {
                      if (currentClub?.id !== club.id) {
                        switchClub(club.id);
                      }
                      navigate('/games');
                    }}
                  >
                    View Games
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Club Dialog */}
      {isCreateDialogOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center overflow-y-auto">
          <div className="relative bg-white dark:bg-slate-900 p-6 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <button 
              className="absolute right-4 top-4 rounded-sm opacity-70 text-gray-600 hover:opacity-100" 
              onClick={() => setIsCreateDialogOpen(false)}
            >
              ✕
              <span className="sr-only">Close</span>
            </button>

            <h2 className="text-xl font-semibold mb-2">Create New Club</h2>
            <p className="text-sm text-gray-500 mb-4">
              Enter the details for the new club.
            </p>

            <ClubForm 
              onSubmit={handleCreateClub}
              onCancel={() => setIsCreateDialogOpen(false)}
              isSubmitting={createMutation.isPending}
            />
          </div>
        </div>
      )}

      {/* Edit Club Dialog */}
      {editingClub && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center overflow-y-auto">
          <div className="relative bg-white dark:bg-slate-900 p-6 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <button 
              className="absolute right-4 top-4 rounded-sm opacity-70 text-gray-600 hover:opacity-100" 
              onClick={() => setEditingClub(null)}
            >
              ✕
              <span className="sr-only">Close</span>
            </button>

            <h2 className="text-xl font-semibold mb-2">Edit Club</h2>
            <p className="text-sm text-gray-500 mb-4">
              Make changes to the club details below.
            </p>

            <ClubForm 
              club={editingClub}
              onSubmit={handleUpdateClub}
              onCancel={() => setEditingClub(null)}
              isSubmitting={updateMutation.isPending}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingClub} onOpenChange={(open) => !open && setDeletingClub(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the club "{deletingClub?.name}". 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteClub}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}