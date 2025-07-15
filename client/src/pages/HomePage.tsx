import React from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Trophy, Calendar, Activity } from 'lucide-react';
import { Helmet } from 'react-helmet';

interface Club {
  id: number;
  name: string;
  description?: string;
  teamCount?: number;
  activeSeason?: string;
}

export default function HomePage() {
  const [, navigate] = useLocation();

  // Fetch all clubs
  const { data: clubs = [], isLoading } = useQuery<Club[]>({
    queryKey: ['clubs'],
    queryFn: async () => {
      const result = await apiClient.get('/api/clubs') as Club[];
      return result;
    },
    staleTime: 300000, // 5 minutes
  });

  const handleClubSelect = (clubId: number) => {
    navigate(`/club/${clubId}`);
  };

  // Find Warrandyte club for default highlighting
  const warrandyteClub = clubs.find(club => 
    club.name.toLowerCase().includes('warrandyte')
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading Clubs</h2>
          <p className="text-muted-foreground">Please wait while we load available clubs...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Netball Manager - Select Club</title>
        <meta name="description" content="Select your club to manage teams, games, and statistics" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Netball Manager
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Select your club to manage teams, track games, and analyze performance
            </p>
          </div>

          {/* Clubs Grid */}
          <div className="max-w-4xl mx-auto">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {clubs.map((club) => (
                <Card 
                  key={club.id} 
                  className={`group hover:shadow-lg transition-all duration-300 cursor-pointer ${
                    warrandyteClub?.id === club.id 
                      ? 'ring-2 ring-primary/50 border-primary/30' 
                      : 'border-gray-200'
                  }`}
                  onClick={() => handleClubSelect(club.id)}
                >
                  <CardHeader className="bg-gradient-to-br from-slate-50 to-slate-100 group-hover:from-primary/5 group-hover:to-primary/10 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 group-hover:bg-primary/20 rounded-full flex items-center justify-center transition-colors duration-300">
                          <span className="text-primary font-bold text-lg">
                            {club.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <CardTitle className="text-lg group-hover:text-primary transition-colors duration-300">
                            {club.name}
                          </CardTitle>
                          {warrandyteClub?.id === club.id && (
                            <Badge variant="default" className="mt-1 text-xs">
                              Default
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {club.description && (
                        <p className="text-sm text-muted-foreground">
                          {club.description}
                        </p>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors duration-300">
                          <div className="font-bold text-xl text-blue-700">
                            {club.teamCount || 'N/A'}
                          </div>
                          <div className="text-xs text-blue-600">Teams</div>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors duration-300">
                          <div className="font-bold text-xl text-green-700">
                            {club.activeSeason || 'N/A'}
                          </div>
                          <div className="text-xs text-green-600">Season</div>
                        </div>
                      </div>

                      <Button 
                        className="w-full group-hover:bg-primary group-hover:text-white transition-all duration-300"
                        variant="outline"
                      >
                        <Activity className="h-4 w-4 mr-2" />
                        Open Dashboard
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {clubs.length === 0 && (
              <Card className="p-12 text-center border-2 border-dashed border-gray-300">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No clubs available</h3>
                <p className="text-muted-foreground mb-4">
                  No clubs have been set up yet. Please contact your administrator.
                </p>
              </Card>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-12 text-sm text-muted-foreground">
            <p>Select a club to get started with team management and game tracking</p>
          </div>
        </div>
      </div>
    </>
  );
}