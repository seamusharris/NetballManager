import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/apiClient';
import { Game, Player } from '@shared/schema';
import { useClub } from '@/contexts/ClubContext';
import PageTemplate from '@/components/layout/PageTemplate';
import SimplePlayerAvailabilityManager from '@/components/roster/SimplePlayerAvailabilityManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Users, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DynamicBreadcrumbs } from '@/components/layout/DynamicBreadcrumbs';

export default function PlayerAvailability() {
  const params = useParams();
  const [, navigate] = useLocation();
  const { currentClub, isInitialized } = useClub();

  // Extract gameId and teamId from URL params
  const gameId = React.useMemo(() => {
    console.log('PlayerAvailability URL params:', params);
    if (params && 'gameId' in params && params.gameId) {
      const id = parseInt(params.gameId as string);
      console.log('Extracted gameId from URL:', id);
      return isNaN(id) ? null : id;
    }
    return null;
  }, [params]);

  const teamId = React.useMemo(() => {
    if (params && 'teamId' in params && params.teamId) {
      const id = parseInt(params.teamId as string);
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
    enabled: !!currentClub?.id && isInitialized
  });

  // Fetch team players (not club-wide players)
  const { data: players = [], isLoading: playersLoading, error: playersError } = useQuery({
    queryKey: ['teams', teamId, 'players'],
    queryFn: () => apiRequest('GET', `/api/teams/${teamId}/players`),
    enabled: !!teamId && isInitialized
  });

  // Fetch existing player availability for this game
  const { data: existingAvailability, isLoading: availabilityLoading } = useQuery({
    queryKey: ['games', gameId, 'availability'],
    queryFn: () => apiRequest('GET', `/api/games/${gameId}/availability`),
    enabled: !!gameId && isInitialized
  });

  const selectedGame = games.find(game => game.id === gameId);

  const isLoading = playersLoading || gamesLoading || availabilityLoading;
  const hasError = playersError || gamesError;

  // Initialize available players from existing availability data when it loads
  useEffect(() => {
    if (existingAvailability?.availablePlayerIds) {
      setAvailablePlayerIds(existingAvailability.availablePlayerIds);
    } else if (players.length > 0 && availablePlayerIds.length === 0) {
      // Fallback: set all active players as available if no existing data
      const activePlayerIds = players.filter(p => p.active).map(p => p.id);
      setAvailablePlayerIds(activePlayerIds);
    }
  }, [existingAvailability, players, availablePlayerIds.length]);

  // Memoized callback to prevent infinite re-renders
  const handleAvailabilityChange = useCallback((newAvailablePlayerIds: number[]) => {
    setAvailablePlayerIds(newAvailablePlayerIds);
  }, []);

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
        title="Player Availability"
        subtitle="No game specified"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Player Availability' }
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
        title="Player Availability"
        subtitle="Game not found"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Player Availability' }
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

  const pageActions = (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={() => navigate(`/roster/game/${gameId}`)}
        className="flex items-center gap-2"
      >
        Roster Management
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <PageTemplate
      title="Player Availability"
      subtitle={`Set player availability for ${selectedGame.homeTeamName} vs ${selectedGame.awayTeamName || 'BYE'}`}
      actions={pageActions}
    >
      {/* Breadcrumbs */}
      <DynamicBreadcrumbs />
      {selectedGame && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedGame.homeTeamName} vs {selectedGame.awayTeamName || 'BYE'}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{new Date(selectedGame.date).toLocaleDateString()} at {selectedGame.time}</span>
                  {selectedGame.round && <span>• Round {selectedGame.round}</span>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <SimplePlayerAvailabilityManager
        gameId={gameId}
        players={players}
        games={[selectedGame]}
        onAvailabilityChange={setAvailablePlayerIds}
        hideGameSelection={true}
      />

      {availablePlayerIds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  {availablePlayerIds.length} players are available for this game.
                </p>
                <p className="text-sm text-gray-500">
                  Ready to manage the roster for this game?
                </p>
              </div>
              <Button
                onClick={() => navigate(`/team/${teamId}/roster/${gameId}`)}
                className="flex items-center gap-2"
              >
                Manage Roster
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </PageTemplate>
  );
}