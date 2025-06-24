import React from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/apiClient';
import { Game, Player } from '@shared/schema';
import { useClub } from '@/contexts/ClubContext';
import PageTemplate from '@/components/layout/PageTemplate';
import FixedPlayerAvailabilityManager from '@/components/roster/FixedPlayerAvailabilityManager';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DynamicBreadcrumbs } from '@/components/layout/DynamicBreadcrumbs';
import { usePlayerAvailability } from '@/hooks/use-player-availability';
import { Helmet } from 'react-helmet';

export default function PlayerAvailability() {
  const params = useLocation()[1];
  const { currentClub, isInitialized } = useClub();

  // Extract parameters from URL - always call these hooks
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

  // ALL HOOKS MUST BE CALLED UNCONDITIONALLY - no early returns before this point
  
  // Fetch specific game
  const { data: selectedGame, isLoading: gameLoading, error: gameError } = useQuery({
    queryKey: ['game', gameId],
    queryFn: async () => {
      console.log(`Fetching specific game ${gameId}`);
      const result = await apiRequest('GET', `/api/games/${gameId}`) as Promise<Game>;
      console.log(`Game ${gameId} response:`, result);
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
      console.log(`Fetching players for team ${teamId}`);
      const result = await apiRequest('GET', `/api/teams/${teamId}/players`) as Promise<Player[]>;
      console.log(`Team ${teamId} players response:`, result?.length, 'players');
      return result;
    },
    enabled: !!teamId && isInitialized
  });

  // Load availability data - always call this hook
  const { data: availabilityData, isLoading: availabilityLoading } = usePlayerAvailability(gameId || 0, teamId || undefined);

  // Debug logging
  console.log('PlayerAvailability Debug:', {
    gameId,
    teamId,
    selectedGame: selectedGame?.id,
    playersCount: players.length,
    isLoading: gameLoading || playersLoading,
    hasError: gameError || playersError
  });

  // NOW we can do conditional rendering - all hooks have been called
  const isLoading = playersLoading || gameLoading;
  const hasError = playersError || gameError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        Loading game and player data...
      </div>
    );
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
        <title>Player Availability - Game {gameId} | Netball Manager</title>
        <meta name="description" content={`Manage player availability for game ${gameId}`} />
      </Helmet>
      
      <FixedPlayerAvailabilityManager
        gameId={gameId}
        teamId={teamId}
        players={players}
        games={[selectedGame].filter(Boolean)}
        hideGameSelection={true}
      />
    </PageTemplate>
  );
}