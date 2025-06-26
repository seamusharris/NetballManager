
import React from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { Game, Player } from '@shared/schema';
import { useClub } from '@/contexts/ClubContext';
import PageTemplate from '@/components/layout/PageTemplate';
import PlayerAvailabilityManager from '@/components/availability/PlayerAvailabilityManager';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DynamicBreadcrumbs } from '@/components/layout/DynamicBreadcrumbs';
import { Helmet } from 'react-helmet';

export default function PlayerAvailability() {
  const params = useParams();
  const { isInitialized } = useClub();

  // Extract parameters from URL: /team/:teamId/availability/:gameId
  const teamId = React.useMemo(() => {
    if (params && params.teamId) {
      const id = parseInt(params.teamId);
      return isNaN(id) ? null : id;
    }
    return null;
  }, [params]);

  const gameId = React.useMemo(() => {
    if (params && params.gameId) {
      const id = parseInt(params.gameId);
      return isNaN(id) ? null : id;
    }
    return null;
  }, [params]);

  // Fetch specific game
  const { data: selectedGame, isLoading: gameLoading, error: gameError } = useQuery({
    queryKey: ['game', gameId],
    queryFn: async () => {
      const result = await apiClient.get(`/api/games/${gameId}`) as Game;
      return result;
    },
    retry: 2,
    enabled: !!gameId,
    staleTime: 30000
  });

  // Fetch team players
  const { data: players = [], isLoading: playersLoading, error: playersError } = useQuery({
    queryKey: ['teams', teamId, 'players'],
    queryFn: async () => {
      const result = await apiClient.get(`/api/teams/${teamId}/players`) as Player[];
      return result;
    },
    enabled: !!teamId && isInitialized
  });

  // Early validation
  if (!teamId || !gameId) {
    return (
      <PageTemplate
        title="Player Availability"
        subtitle="Invalid URL"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Player Availability' }
        ]}
      >
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Invalid URL format. Expected /team/[teamId]/availability/[gameId]
          </AlertDescription>
        </Alert>
      </PageTemplate>
    );
  }

  if (gameLoading || playersLoading) {
    return (
      <PageTemplate
        title="Player Availability"
        subtitle="Loading..."
        breadcrumbs={<DynamicBreadcrumbs />}
      >
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">Loading game and player data...</div>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  if (gameError || playersError) {
    return (
      <PageTemplate
        title="Player Availability"
        subtitle="Error loading data"
        breadcrumbs={<DynamicBreadcrumbs />}
      >
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load game or player data. Please try again.
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
        breadcrumbs={<DynamicBreadcrumbs />}
      >
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Game {gameId} not found. Please check the game ID and try again.
          </AlertDescription>
        </Alert>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="Player Availability"
      subtitle={`${selectedGame?.homeTeamName} vs ${selectedGame?.awayTeamName || 'BYE'} - ${selectedGame?.date}`}
      breadcrumbs={<DynamicBreadcrumbs />}
    >
      <Helmet>
        <title>{`Player Availability - Game ${gameId} | Netball Manager`}</title>
        <meta name="description" content={`Manage player availability for game ${gameId}`} />
      </Helmet>
      
      <PlayerAvailabilityManager
        gameId={gameId}
        teamId={teamId}
        players={players}
        game={selectedGame}
      />
    </PageTemplate>
  );
}
