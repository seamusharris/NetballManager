
import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/apiClient';
import { Game, Player } from '@shared/schema';
import { useClub } from '@/contexts/ClubContext';
import PageTemplate from '@/components/layout/PageTemplate';
import DragDropRosterManager from '@/components/roster/DragDropRosterManager';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Users, Calendar } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function RosterGame() {
  const params = useParams();
  const [, navigate] = useLocation();
  const { currentClub } = useClub();

  // Extract gameId from URL params
  const gameId = React.useMemo(() => {
    console.log('RosterGame URL params:', params);
    if (params && 'gameId' in params && params.gameId) {
      const id = parseInt(params.gameId as string);
      console.log('Extracted gameId from URL:', id);
      return isNaN(id) ? null : id;
    }
    return null;
  }, [params]);

  const [availablePlayerIds, setAvailablePlayerIds] = useState<number[]>([]);

  // Fetch games
  const { data: games = [], isLoading: gamesLoading, error: gamesError } = useQuery({
    queryKey: ['games', currentClub?.id],
    queryFn: () => apiRequest('GET', '/api/games'),
    retry: 1,
    enabled: !!currentClub?.id
  });

  // Fetch players
  const { data: players = [], isLoading: playersLoading, error: playersError } = useQuery({
    queryKey: ['players', currentClub?.id],
    queryFn: () => apiRequest('GET', '/api/players'),
    enabled: !!currentClub?.id
  });

  // Load availability for this game
  const { data: availabilityData, isLoading: availabilityLoading } = useQuery({
    queryKey: ['availability', gameId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/games/${gameId}/availability`);
      return response;
    },
    enabled: !!gameId,
    retry: 1
  });

  const selectedGame = games.find(game => game.id === gameId);

  const isLoading = playersLoading || gamesLoading || availabilityLoading;
  const hasError = playersError || gamesError;

  // Set available players from availability data
  useEffect(() => {
    if (availabilityData?.availablePlayerIds) {
      setAvailablePlayerIds(availabilityData.availablePlayerIds);
    } else if (players.length > 0 && availablePlayerIds.length === 0) {
      // Fallback: all active players
      const activePlayerIds = players.filter(p => p.active).map(p => p.id);
      setAvailablePlayerIds(activePlayerIds);
    }
  }, [availabilityData, players, availablePlayerIds.length]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (hasError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load data. Please refresh the page.
        </AlertDescription>
      </Alert>
    );
  }

  if (!gameId) {
    return (
      <PageTemplate
        title="Roster Management"
        subtitle="No game specified"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Roster Management' }
        ]}
      >
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No game ID provided in the URL.
          </AlertDescription>
        </Alert>
      </PageTemplate>
    );
  }

  if (!selectedGame) {
    return (
      <PageTemplate
        title="Roster Management"
        subtitle="Game not found"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Roster Management' }
        ]}
      >
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Game with ID {gameId} not found.
          </AlertDescription>
        </Alert>
      </PageTemplate>
    );
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Games', href: `/team/${selectedGame?.homeTeamId}/games` },
    { label: `Game ${selectedGame.round}`, href: `/games/${gameId}` },
    { label: 'Roster Management' }
  ];

  const pageActions = (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={() => navigate(`/availability/game/${gameId}`)}
        className="flex items-center gap-2"
      >
        <Users className="h-4 w-4" />
        Player Availability
      </Button>
    </div>
  );

  return (
    <PageTemplate
      title="Roster Management"
      subtitle={`Manage roster for ${selectedGame.homeTeamName} vs ${selectedGame.awayTeamName || 'BYE'}`}
      breadcrumbs={breadcrumbs}
      actions={pageActions}
    >
      {selectedGame && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedGame.homeTeamName} vs {selectedGame.awayTeamName || 'BYE'}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-3 w-3" />
                  {new Date(selectedGame.date).toLocaleDateString()} at {selectedGame.time}
                  {selectedGame.round && <span>• Round {selectedGame.round}</span>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {availablePlayerIds.length === 0 && !availabilityLoading && (
        <Alert className="mb-6">
          <Users className="h-4 w-4" />
          <AlertDescription>
            No player availability has been set for this game. 
            <Button 
              variant="link" 
              className="p-0 h-auto font-normal underline ml-1"
              onClick={() => navigate(`/availability/game/${gameId}`)}
            >
              Set player availability first
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <DragDropRosterManager
        availablePlayers={players.filter(p => availablePlayerIds.includes(p.id))}
        gameInfo={{
          opponent: selectedGame?.awayTeamName || selectedGame?.homeTeamName || 'Unknown',
          date: selectedGame?.date || '',
          time: selectedGame?.time || ''
        }}
        gameId={gameId}
        onRosterChange={() => {}}
        onRosterSaved={() => {
          // Optional: Add success toast or other feedback
        }}
      />
    </PageTemplate>
  );
}
