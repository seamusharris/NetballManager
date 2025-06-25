import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Clock, Trophy, Edit } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import PageTemplate from '@/components/layout/PageTemplate';

interface Game {
  id: number;
  homeTeamId: number;
  awayTeamId: number | null;
  homeTeam: { id: number; name: string; clubId: number };
  awayTeam: { id: number; name: string; clubId: number } | null;
  status: string;
  scheduledDate: string;
  venue: string;
  round: number;
  seasonId: number;
}

export default function GameDetails() {
  const params = useParams<{ gameId?: string; teamId?: string; clubId?: string }>();
  const [location, setLocation] = useLocation();
  const gameId = params.gameId ? Number(params.gameId) : null;
  const teamId = params.teamId ? Number(params.teamId) : null;
  const clubId = params.clubId ? Number(params.clubId) : null;

  const { data: game, isLoading: gameLoading, error: gameError } = useQuery({
    queryKey: ['game', gameId, teamId],
    queryFn: () => {
      if (teamId) {
        return apiClient.get<Game>(`/api/teams/${teamId}/games/${gameId}`);
      } else {
        return apiClient.get<Game>(`/api/games/${gameId}`);
      }
    },
    enabled: !!gameId,
  });

  const { data: club } = useQuery({
    queryKey: ['club', clubId],
    queryFn: () => apiClient.get(`/api/clubs/${clubId}`),
    enabled: !!clubId,
  });

  const { data: players = [] } = useQuery({
    queryKey: ['players', clubId],
    queryFn: () => apiClient.get(`/api/clubs/${clubId}/players`),
    enabled: !!clubId,
    staleTime: 5 * 60 * 1000
  });

  if (!gameId) {
    return (
      <PageTemplate title="Game Details" subtitle="Game not found">
        <div>Game ID not provided.</div>
      </PageTemplate>
    );
  }

  if (gameLoading) {
    return (
      <PageTemplate title="Game Details" subtitle="Loading...">
        <div>Loading game details...</div>
      </PageTemplate>
    );
  }

  if (gameError || !game) {
    return (
      <PageTemplate title="Game Details" subtitle="Error loading game">
        <div>Failed to load game details. Please try again.</div>
      </PageTemplate>
    );
  }

  const isHomeTeam = teamId ? game.homeTeamId === teamId : false;
  const currentTeam = isHomeTeam ? game.homeTeam : game.awayTeam;
  const opponentTeam = isHomeTeam ? game.awayTeam : game.homeTeam;

  return (
    <PageTemplate 
      title={`Game ${game.id}`}
      subtitle={`${game.homeTeam.name} vs ${game.awayTeam?.name || 'BYE'}`}
      breadcrumbs={[
        ...(clubId ? [{ label: 'Dashboard', href: `/club/${clubId}` }] : []),
        ...(teamId ? [{ label: 'Team', href: `/team/${teamId}` }] : []),
        { label: 'Game Details' }
      ]}
      actions={
        <div className="flex gap-2">
          {teamId && (
            <Button
              variant="outline"
              onClick={() => setLocation(`/team/${teamId}/roster/game/${gameId}`)}
            >
              <Users className="h-4 w-4 mr-2" />
              Manage Roster
            </Button>
          )}
          {teamId && game.status === 'upcoming' && (
            <Button
              onClick={() => setLocation(`/game/${gameId}/team/${teamId}/stats/record`)}
            >
              <Trophy className="h-4 w-4 mr-2" />
              Record Stats
            </Button>
          )}
        </div>
      }
    >
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Game Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Status</span>
              <Badge variant={game.status === 'completed' ? 'default' : 'secondary'}>
                {game.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Date</span>
              <span>{new Date(game.scheduledDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Time</span>
              <span>{new Date(game.scheduledDate).toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Venue
              </span>
              <span>{game.venue}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Round</span>
              <span>{game.round}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Teams
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Home Team</div>
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span>{game.homeTeam.name}</span>
                {isHomeTeam && <Badge variant="outline">Your Team</Badge>}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Away Team</div>
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span>{game.awayTeam?.name || 'BYE'}</span>
                {!isHomeTeam && game.awayTeam && <Badge variant="outline">Your Team</Badge>}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {currentTeam && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Team Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                onClick={() => setLocation(`/team/${currentTeam.id}/roster`)}
              >
                <Users className="h-4 w-4 mr-2" />
                View Roster
              </Button>
              {game.status === 'upcoming' && (
                <Button
                  variant="outline"
                  onClick={() => setLocation(`/game/${gameId}/team/${currentTeam.id}/preparation`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Game Preparation
                </Button>
              )}
              {game.status !== 'upcoming' && (
                <Button
                  variant="outline"
                  onClick={() => setLocation(`/game/${gameId}/team/${currentTeam.id}/stats`)}
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  View Stats
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </PageTemplate>
  );
}