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
import { Helmet } from 'react-helmet'; // Added import

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

  // Fetch games using team-specific endpoint for player availability context
  const { data: games = [], isLoading: gamesLoading, error: gamesError } = useQuery({
    queryKey: ['games', teamId, 'team-specific'],
    queryFn: async () => {
      if (teamId) {
        console.log(`Fetching games for team ${teamId}`);
        const result = await apiRequest('GET', `/api/teams/${teamId}/games`) as Promise<Game[]>;
        console.log(`Team ${teamId} games response:`, result?.length, 'games');
        return result;
      } else {
        // Fallback to club games if no team context
        console.log(`Fetching club games for club ${currentClub?.id}`);
        return apiRequest('GET', `/api/clubs/${currentClub?.id}/games`) as Promise<Game[]>;
      }
    },
    retry: 2,
    enabled: !!currentClub?.id && isInitialized && !!teamId,
    staleTime: 30000 // 30 seconds
  });

  // Fetch roster for the selected game using team-specific context
  const { data: gameRoster = [], isLoading: isLoadingRoster } = useQuery({
    queryKey: ['teams', teamId, 'games', gameId, 'roster'],
    queryFn: () => {
      if (teamId && gameId) {
        return apiRequest('GET', `/api/teams/${teamId}/roster/${gameId}`) as Promise<any[]>;
      } else {
        // Fallback to general game roster endpoint
        return apiRequest('GET', `/api/games/${gameId}/rosters`) as Promise<any[]>;
      }
    },
    enabled: !!gameId && !!teamId
  });

  // Fetch team players (not club-wide players)
  const { data: players = [], isLoading: playersLoading, error: playersError } = useQuery({
    queryKey: ['teams', teamId, 'players'],
    queryFn: () => apiRequest('GET', `/api/teams/${teamId}/players`) as Promise<Player[]>,
    enabled: !!teamId && isInitialized
  });

  const selectedGame = games.find((game: Game) => game.id === gameId);
  
  // Debug logging
  console.log('PlayerAvailability Debug:', {
    gameId,
    teamId,
    gamesCount: games.length,
    gameIds: games.map(g => g.id),
    selectedGame: selectedGame?.id,
    isLoading: gamesLoading,
    hasError: gamesError
  });

  const isLoading = playersLoading || gamesLoading;
  const hasError = playersError || gamesError;

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

  // Load availability data using the new hook
  const { data: availabilityData, isLoading: availabilityLoading } = usePlayerAvailability(gameId || 0, teamId || undefined);

  if (!selectedGame && !isLoading && gameId && teamId) {
    // If we can't find the game in team games, load it directly
    console.log('Game not found in team games list, proceeding with availability data anyway');
    
    if (!availabilityData && availabilityLoading) {
      return (
        <PageTemplate
          title="Player Availability"
          subtitle="Loading game details..."
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Player Availability' }
          ]}
        >
          <div className="flex items-center justify-center h-64">
            Loading availability data...
          </div>
        </PageTemplate>
      );
    }

    // Proceed with a minimal game object if we have availability data
    const fallbackGame = {
      id: gameId,
      homeTeamName: `Team ${teamId}`,
      awayTeamName: 'Unknown Opponent',
      date: new Date().toISOString().split('T')[0],
      time: '10:00'
    } as Game;

    return (
      <PageTemplate
        title="Player Availability"
        subtitle={`Game ${gameId} - Player Availability`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Player Availability' }
        ]}
      >
        <div className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Game details not found in team roster. Proceeding with availability management.
            </AlertDescription>
          </Alert>
          <PlayerAvailabilityManager
            gameId={gameId}
            teamId={teamId}
            players={players}
            selectedGame={fallbackGame}
          />
        </div>
      </PageTemplate>
    );
  }

  const pageActions = (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={() => navigate(`/team/${teamId}/roster/${gameId}`)}
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
      <Helmet>
        <title>{`Player Availability - ${selectedGame?.homeTeamName || 'Team'} vs ${selectedGame?.awayTeamName || 'TBD'}`}</title>
      </Helmet>
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

      <FixedPlayerAvailabilityManager
        gameId={gameId}
        players={players}
        games={[selectedGame].filter(Boolean)}
        hideGameSelection={true}
      />
    </PageTemplate>
  );
}