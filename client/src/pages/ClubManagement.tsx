
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fetchApi } from '@/lib/apiClient';
import { Building2, Users, Plus, Edit, Trash2 } from 'lucide-react';
import { useClub } from '@/contexts/ClubContext';

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

export default function ClubManagement() {
  const { currentClub } = useClub();
  const queryClient = useQueryClient();

  // Fetch all clubs (admin only)
  const { data: clubs, isLoading } = useQuery({
    queryKey: ['clubs'],
    queryFn: async () => {
      const response = await fetchApi('/api/clubs');
      return response as ClubWithStats[];
    }
  });

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
        <Button>
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
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
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
                  <Button variant="outline" size="sm">
                    Manage Players
                  </Button>
                  <Button variant="outline" size="sm">
                    Manage Teams
                  </Button>
                  <Button variant="outline" size="sm">
                    View Games
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
