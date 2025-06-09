import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Users, Calendar, Settings, ArrowRight, ClipboardList } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiRequest } from '@/lib/apiClient';
import SimpleRosterManager from '@/components/roster/SimpleRosterManager';
import PlayerAvailabilityManager from '@/components/roster/PlayerAvailabilityManager';
import { useLocation, useParams } from 'wouter';
import { Game, Player, Opponent } from '@shared/schema';
import { useClub } from '@/contexts/ClubContext';
import { PageTemplate } from '@/components/layout/PageTemplate';

export default function Roster() {
  const params = useParams();
  const [, navigate] = useLocation();
  const { currentClub } = useClub();

  // Extract gameId from URL params more reliably
  const gameIdFromUrl = React.useMemo(() => {
    console.log('Roster URL params:', params);
    if (params && 'gameId' in params && params.gameId) {
      const id = parseInt(params.gameId as string);
      console.log('Extracted gameId from URL:', id);
      return isNaN(id) ? null : id;
    }
    return null;
  }, [params]);

  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [availablePlayerIds, setAvailablePlayerIds] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState<'game-selection' | 'availability' | 'roster'>('game-selection');

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

  // Fetch opponents for legacy support
  const { data: opponents = [], isLoading: opponentsLoading, error: opponentsError } = useQuery({
    queryKey: ['opponents'],
    queryFn: async () => {
      try {
        const result = await apiRequest('GET', '/api/opponents');
        return Array.isArray(result) ? result : [];
      } catch (error) {
        console.warn('Opponents API not available (expected)');
        return [];
      }
    }
  });

  // Initialize available players to all active players when players load
  useEffect(() => {
    if (players.length > 0 && availablePlayerIds.length === 0) {
      const activePlayerIds = players.filter(p => p.active).map(p => p.id);
      setAvailablePlayerIds(activePlayerIds);
    }
  }, [players, availablePlayerIds.length]);

  // Set selected game and step on mount if from URL
  useEffect(() => {
    console.log('useEffect triggered - gameIdFromUrl:', gameIdFromUrl, 'selectedGameId:', selectedGameId);
    if (gameIdFromUrl && gameIdFromUrl !== selectedGameId) {
      console.log('Setting game from URL parameter:', gameIdFromUrl);
      setSelectedGameId(gameIdFromUrl);
      setCurrentStep('availability');
      console.log('Set current step to availability for game:', gameIdFromUrl);
    }
  }, [gameIdFromUrl]);

  // Debug logging for rendering conditions
  useEffect(() => {

  }, [currentStep, selectedGameId, gameIdFromUrl]);

  // Handle game selection
  const handleGameSelection = (gameId: number) => {
    console.log('Game selected:', gameId);
    // Only update if different to prevent loops
    if (gameId !== selectedGameId) {
      setSelectedGameId(gameId);
      setCurrentStep('availability');
    }
  };

  const isLoading = playersLoading || gamesLoading || opponentsLoading;
  const hasError = playersError || gamesError || opponentsError;

  // Filter out BYE games since they don't have rosters
  const gamesWithoutByes = games.filter(game => !game.isBye);

  // Sort games by date (most recent first)
  const sortedGames = gamesWithoutByes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const selectedGame = games.find(game => game.id === selectedGameId);

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

  const renderStepIndicator = () => (
    <div className="flex items-center gap-4 mb-6">
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
        currentStep === 'game-selection' ? 'bg-blue-100 text-blue-800' : 
        selectedGameId ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
      }`}>
        <Calendar className="h-4 w-4" />
        <span className="text-sm font-medium">Select Game</span>
        {selectedGameId && currentStep !== 'game-selection' && (
          <Badge variant="secondary" className="ml-1 text-xs">✓</Badge>
        )}
      </div>

      <ArrowRight className="h-4 w-4 text-gray-400" />

      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
        currentStep === 'availability' ? 'bg-blue-100 text-blue-800' : 
        (currentStep === 'roster' && availablePlayerIds.length > 0) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
      }`}>
        <Users className="h-4 w-4" />
        <span className="text-sm font-medium">Set Availability</span>
        {availablePlayerIds.length > 0 && (
          <Badge variant="secondary" className="ml-1 text-xs">
            {availablePlayerIds.length}
          </Badge>
        )}
      </div>

      <ArrowRight className="h-4 w-4 text-gray-400" />

      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
        currentStep === 'roster' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
      }`}>
        <ClipboardList className="h-4 w-4" />
        <span className="text-sm font-medium">Manage Roster</span>
      </div>
    </div>
  );

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Roster' }
  ];

  const pageActions = selectedGameId && currentStep !== 'game-selection' && (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={() => setCurrentStep('availability')}
        className="flex items-center gap-2"
      >
        <Users className="h-4 w-4" />
        Availability
      </Button>
      <Button
        variant="outline"
        onClick={() => setCurrentStep('roster')}
        disabled={availablePlayerIds.length === 0}
        className="flex items-center gap-2"
      >
        <ClipboardList className="h-4 w-4" />
        Roster
      </Button>
    </div>
  );

  return (
    <PageTemplate
      title="Roster Management"
      subtitle={`Manage game rosters for ${currentClub?.name || 'your club'}`}
      breadcrumbs={breadcrumbs}
      actions={pageActions}
    >
      {renderStepIndicator()}

      {selectedGame && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedGame.homeTeamName} vs {selectedGame.awayTeamName}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-3 w-3" />
                  {new Date(selectedGame.date).toLocaleDateString()} at {selectedGame.time}
                  {selectedGame.round && <Badge variant="outline">Round {selectedGame.round}</Badge>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 'game-selection' && !selectedGameId && (
        <Card>
          <CardHeader>
            <CardTitle>Select a Game</CardTitle>
          </CardHeader>
          <CardContent>
            <Select 
              value={selectedGameId?.toString() || ''} 
              onValueChange={(value) => handleGameSelection(Number(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a game to manage roster" />
              </SelectTrigger>
              <SelectContent>
                {sortedGames.map(game => (
                  <SelectItem key={game.id} value={game.id.toString()}>
                    Round {game.round} - {game.homeTeamName} vs {game.awayTeamName} 
                    <span className="text-gray-500 ml-2">
                      ({new Date(game.date).toLocaleDateString()})
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {selectedGameId && currentStep === 'availability' && (
        <PlayerAvailabilityManager
          gameId={selectedGameId}
          players={players}
          games={games}
          opponents={opponents}
          onComplete={() => setCurrentStep('roster')}
          onAvailabilityChange={setAvailablePlayerIds}
          onGameChange={handleGameSelection}
        />
      )}

      {selectedGameId && currentStep === 'roster' && (
        <SimpleRosterManager
          selectedGameId={selectedGameId}
          setSelectedGameId={handleGameSelection}
          players={players}
          games={games}
          opponents={opponents}
          isLoading={isLoading}
          availablePlayerIds={availablePlayerIds}
        />
      )}
    </PageTemplate>
  );
}