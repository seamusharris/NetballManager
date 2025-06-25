import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, Users, Trophy } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import PageTemplate from '@/components/layout/PageTemplate';
import { apiClient } from '@/lib/apiClient';

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

const clubFormSchema = z.object({
  name: z.string().min(1, 'Club name is required'),
  code: z.string().min(2, 'Club code must be at least 2 characters').max(10, 'Club code must be less than 10 characters'),
  primaryColor: z.string().min(1, 'Primary color is required'),
  secondaryColor: z.string().min(1, 'Secondary color is required'),
  address: z.string().optional(),
  contactEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  contactPhone: z.string().optional(),
});

type ClubFormData = z.infer<typeof clubFormSchema>;

export default function ClubManagement() {
  const [showForm, setShowForm] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [deletingClub, setDeletingClub] = useState<any>(null);
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const { data: clubs = [], isLoading } = useQuery({
    queryKey: ['clubs'],
    queryFn: () => apiClient.get('/api/clubs'),
    staleTime: 5 * 60 * 1000
  });

  const createMutation = useMutation({
    mutationFn: async (clubData: any) => {
      const response = await fetch('/api/clubs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clubData)
      });
      if (!response.ok) throw new Error('Failed to create club');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
      setShowForm(false);
    }
  });

  const form = useForm<ClubFormData>({
    resolver: zodResolver(clubFormSchema),
    defaultValues: {
      name: '',
      code: '',
      primaryColor: '#3B82F6',
      secondaryColor: '#EF4444',
      address: '',
      contactEmail: '',
      contactPhone: '',
    }
  });

  const onSubmit = (data: ClubFormData) => {
    createMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <PageTemplate title="Club Management" subtitle="Manage netball clubs">
        <div>Loading clubs...</div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate 
      title="Club Management" 
      subtitle="Manage netball clubs"
      actions={
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Club
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Club</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Club Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Club Code</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="primaryColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Color</FormLabel>
                        <FormControl>
                          <Input type="color" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="secondaryColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Secondary Color</FormLabel>
                        <FormControl>
                          <Input type="color" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Club'}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {clubs.map((club: ClubWithStats) => (
          <Card key={club.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{club.name}</CardTitle>
                <Badge variant={club.isActive ? 'default' : 'secondary'}>
                  {club.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: club.primaryColor }}
                />
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: club.secondaryColor }}
                />
                <span className="text-sm text-muted-foreground">{club.code}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    Players
                  </span>
                  <span>{club.playersCount || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center">
                    <Trophy className="h-4 w-4 mr-1" />
                    Teams
                  </span>
                  <span>{club.teamsCount || 0}</span>
                </div>
                {club.contactEmail && (
                  <div className="text-xs text-muted-foreground">
                    {club.contactEmail}
                  </div>
                )}
                {club.contactPhone && (
                  <div className="text-xs text-muted-foreground">
                    {club.contactPhone}
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/club/${club.id}`)}
                >
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageTemplate>
  );
}