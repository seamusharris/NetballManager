
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
  const params = useParams<{ clubId?: string; teamId?: string; gameId?: string }>();
  const { isInitialized } = useClub();

  // Extract parameters from URL: /club/:clubId/team/:teamId/availability/:gameId? (gameId optional)
  const clubId = React.useMemo(() => {
    if (params && params.clubId) {
      const id = parseInt(params.clubId);
      return isNaN(id) ? null : id;
    }
    return null;
  }, [params]);

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

  // Early validation
  if (!clubId || !teamId) {
    return (
      <PageTemplate
        title="Player Availability"
        subtitle="Invalid URL"
      >
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Invalid URL format. Expected /club/[clubId]/team/[teamId]/availability or /club/[clubId]/team/[teamId]/availability/[gameId]
          </AlertDescription>
        </Alert>
      </PageTemplate>
    );
  }

  // If no gameId, prompt user to select a game
  if (!gameId) {
    return (
      <PageTemplate
        title="Player Availability"
        subtitle="No Game Selected"
      >
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please select a game to manage player availability. You can do this from the team games page.
          </AlertDescription>
        </Alert>
      </PageTemplate>
    );
  }

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

  // Fetch home and away team names
  const { data: homeTeam } = useQuery<{ name: string } | null>({
    queryKey: ['team', selectedGame?.home_team_id],
    queryFn: async () => {
      if (!selectedGame?.home_team_id) return null;
      const result = await apiClient.get(`/api/teams/${selectedGame.home_team_id}`);
      if (result && typeof result === 'object' && typeof (result as { name?: unknown }).name === 'string') {
        return { name: (result as { name: string }).name };
      }
      return null;
    },
    enabled: !!selectedGame?.home_team_id
  });

  const { data: awayTeam } = useQuery<{ name: string } | null>({
    queryKey: ['team', selectedGame?.away_team_id],
    queryFn: async () => {
      if (!selectedGame?.away_team_id) return null;
      const result = await apiClient.get(`/api/teams/${selectedGame.away_team_id}`);
      if (result && typeof result === 'object' && typeof (result as { name?: unknown }).name === 'string') {
        return { name: (result as { name: string }).name };
      }
      return null;
    },
    enabled: !!selectedGame?.away_team_id
  });

  // Add debugging logs
  console.log('homeTeam', homeTeam);
  console.log('awayTeam', awayTeam);

  if (gameLoading || playersLoading) {
    return (
      <PageTemplate
        title="Player Availability"
        subtitle="Loading..."
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
      subtitle={`${homeTeam?.name || 'Unknown Team'} vs ${awayTeam?.name || 'Unknown Team'} - ${selectedGame?.date}`}
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
