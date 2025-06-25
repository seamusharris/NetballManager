import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { TEAM_NAME } from '@/lib/settings';
import { 
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
  } from '@/components/ui/breadcrumb';
import { StatItemBox } from '@/components/games/StatItemBox';
import { PositionStatsBox } from '@/components/games/PositionStatsBox';
import { PositionBox } from '@/components/games/PositionBox';
import { GamePositionStatsBox } from '@/components/games/GamePositionStatsBox';
import AwardWinnerDisplay from '@/components/awards/AwardWinnerDisplay';
import GameForm from '@/components/games/GameForm';
import PrintableRosterSummary from '@/components/roster/PrintableRosterSummary';
import PrintableStatsSheet from '@/components/stats/PrintableStatsSheet';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
  } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Edit, BarChart3, ClipboardList, Activity, CalendarRange, ActivitySquare, Trash2,
  FileText, Printer
  } from 'lucide-react';
import BackButton from '@/components/ui/back-button';
import { Separator } from '@/components/ui/separator';
import { formatDate, cn, tailwindToHex, convertTailwindToHex, getInitials } from '@/lib/utils';
import { TeamSwitcher } from '@/components/layout/TeamSwitcher';
import { ScoreMismatchWarning } from '@/components/games/ScoreMismatchWarning';
import { validateInterClubScores, getScoreDiscrepancyWarning, getReconciledScore } from '@/lib/scoreValidation';
import { getPlayerColorHex } from '@/lib/playerColorUtils';

// Helper functions for player colors
const getPlayerColorForBorder = (avatarColor?: string): string => {
  if (!avatarColor) return "#7c3aed"; // Default violet-700

  // Map of background colors to border colors
  const colorMap: Record<string, string> = {
    'bg-red-500': '#b91c1c', // red-700
    'bg-orange-500': '#c2410c', // orange-700
    'bg-amber-500': '#b45309', // amber-700
    'bg-yellow-500': '#a16207', // yellow-700
    'bg-lime-500': '#4d7c0f', // lime-700
    'bg-green-500': '#15803d', // green-700
    'bg-emerald-500': '#047857', // emerald-700
    'bg-teal-500': '#0f766e', // teal-700
    'bg-cyan-500': '#0e7490', // cyan-700
    'bg-sky-500': '#0369a1', // sky-700
    'bg-blue-500': '#1d4ed8', // blue-700
    'bg-indigo-500': '#4338ca', // indigo-700
    'bg-violet-500': '#6d28d9', // violet-700
    'bg-purple-500': '#7e22ce', // purple-700
    'bg-fuchsia-500': '#a21caf', // fuchsia-700
    'bg-pink-500': '#be185d', // pink-700
    'bg-rose-500': '#be123c', // rose-700
    'bg-yellow-600': '#a16207', // yellow-700
    'bg-blue-600': '#1d4ed8', // blue-700
    'bg-violet-600': '#6d28d9', // violet-700
    'bg-orange-600': '#c2410c', // orange-700
    'bg-green-600': '#15803d', // green-700
    'bg-rose-600': '#be123c', // rose-50
    'bg-indigo-600': '#4338ca', // indigo-600
    'bg-pink-600': '#be185d', // pink-600
    'bg-purple-600': '#7e22ce' // purple-600
  };

  return colorMap[avatarColor] || "#7c3aed";
};

const getPlayerColorForBackground = (avatarColor?: string): string => {
  if (!avatarColor) return "rgb(245, 243, 255)"; // Default violet-50

  // Map of background colors to light background colors
  const colorMap: Record<string, string> = {
    'bg-red-500': '#fef2f2', // red-50
    'bg-orange-500': '#fff7ed', // orange-50
    'bg-amber-500': '#fffbeb', // amber-50
    'bg-yellow-500': '#fefce8', // yellow-50
    'bg-lime-500': '#f7fee7', // lime-50
    'bg-green-500': '#f0fdf4', // green-50
    'bg-emerald-500': '#ecfdf5', // emerald-50
    'bg-teal-500': '#f0fdfa', // teal-50
    'bg-cyan-500': '#ecfeff', // cyan-50
    'bg-sky-500': '#f0f9ff', // sky-50
    'bg-blue-500': '#eff6ff', // blue-50
    'bg-indigo-500': '#eef2ff', // indigo-50
    'bg-violet-500': '#f5f3ff', // violet-50
    'bg-purple-500': '#faf5ff', // purple-50
    'bg-fuchsia-500': '#fdf4ff', // fuchsia-50
    'bg-pink-500': '#fdf2f8', // pink-50
    'bg-rose-500': '#fff1f2', // rose-50
    'bg-yellow-600': '#fefce8', // yellow-50
    'bg-blue-600': '#eff6ff', // blue-50
    'bg-violet-600': '#f5f3ff', // violet-50
    'bg-orange-600': '#fff7ed', // orange-50
    'bg-green-600': '#f0fdf4', // green-50
    'bg-rose-600': '#fff1f2', // rose-50
    'bg-indigo-600': '#eef2ff', // indigo-50
    'bg-pink-600': '#fdf2f8', // pink-50
    'bg-purple-600': '#faf5ff' // purple-600
  };

  return colorMap[avatarColor] || "rgb(245, 243, 255)";
};

// Helper function to get a lighter shade of a color (used for background)
const getLighterColorHex = (avatarColor?: string): string => {
  if (!avatarColor) return "rgb(245, 243, 255)"; // Default violet-50

  // If the avatarColor is a Tailwind class (starts with 'bg-'), convert it to hex
  if (avatarColor.startsWith('bg-')) {
    avatarColor = convertTailwindToHex(avatarColor);
  }

  // If it's already a hex color, lighten it
  if (avatarColor.startsWith('#')) {
      let hex = avatarColor.replace(/^#/, '');
      // Handle short form hex color
      if (hex.length === 3) {
          hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);

      const lightenFactor = 0.9; // Adjust this value to control how much lighter the color becomes
      const newR = Math.min(255, Math.round(r + (255 - r) * lightenFactor));
      const newG = Math.min(255, Math.round(g + (255 - g) * lightenFactor));
      const newB = Math.min(255, Math.round(b + (255 - b) * lightenFactor));

      const newHex = "#" + ((1 << 24) + (newR << 16) + (newG << 8) + newB).toString(16).slice(1);
      return newHex;
  }

  return "rgb(245, 243, 255)";
};
import { GameStatus, Position, POSITIONS } from '@shared/schema';
import { primaryPositionStats, secondaryPositionStats, statLabels } from '@/lib/positionStats';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  } from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  } from '@/components/ui/select';
import { 
  calculateGameScores, 
  getGameStatusColor 
  } from '@/lib/statisticsService';
import { GameStatusButton } from '@/components/games/GameStatusButton';
import LiveStatsButton from '@/components/games/LiveStatsButton';
import { GameScoreDisplay } from '@/components/statistics/GameScoreDisplay';
import { OfficialScoreEntry } from '@/components/games/OfficialScoreEntry';
import { apiClient } from '@/lib/apiClient';
import { useClub } from '@/contexts/ClubContext';
import { gameScoreService } from '@/lib/gameScoreService';
import { CACHE_KEYS } from '@/lib/cacheKeys';

// Function to get opponent name
const getOpponentName = (opponents: any[], opponentId: number | null) => {
  if (!opponentId) return 'BYE Round';
  const opponent = opponents.find(o => o.id === opponentId);
  return opponent ? opponent.teamName : 'Unknown Opponent';
};

export default function GameDetails() {
  const params = useParams();
  const gameId = params.gameId ? parseInt(params.gameId) : parseInt(params.id!);
  const teamId = params.teamId ? parseInt(params.teamId) : undefined;
  const { currentClub, currentTeam } = useClub();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch game details
  const { data: game, isLoading: gameLoading, error: gameError } = useQuery({
    queryKey: ['/api/games', gameId],
    queryFn: () => apiClient.get(`/api/games/${gameId}`),
    enabled: !!gameId && !!currentClub
  });

  // Fetch teams
  const { data: teams = [], isLoading: isLoadingTeams } = useQuery({
    queryKey: ['/api/teams'],
    queryFn: () => apiClient.get('/api/teams'),
    enabled: !!currentClub
  });

  // Fetch players
  const { data: players = [], isLoading: isLoadingPlayers } = useQuery({
    queryKey: ['/api/players'],
    queryFn: () => apiClient.get('/api/players'),
    enabled: !!currentClub
  });

  // Fetch game roster
  const { data: roster = [], isLoading: isLoadingRoster, refetch: refetchRosters } = useQuery({
    queryKey: teamId ? ['/api/teams', teamId, 'games', gameId, 'rosters'] : ['/api/games', gameId, 'rosters'],
    queryFn: () => {
      if (teamId) {
        return apiClient.get(`/api/teams/${teamId}/games/${gameId}/rosters`);
      }
      return apiClient.get(`/api/games/${gameId}/rosters`);
    },
    enabled: !!gameId
  });

  // Fetch game scores
  const { data: quarterScores = [], isLoading: scoresLoading } = useQuery({
    queryKey: ['/api/games', gameId, 'scores'],
    queryFn: () => apiClient.get(`/api/games/${gameId}/scores`),
    enabled: !!gameId && !!game
  });

  // Fetch game stats
  const { data: gameStats = [], isLoading: statsLoading } = useQuery({
    queryKey: ['/api/games', gameId, 'stats'],
    queryFn: () => apiClient.get(`/api/games/${gameId}/stats`),
    enabled: !!gameId && !!game
  });

  // Fetch game statuses
  const { data: gameStatuses = [] } = useQuery({
    queryKey: ['/api/game-statuses'],
    queryFn: () => apiClient.get('/api/game-statuses')
  });

  const isLoading = gameLoading || isLoadingTeams || isLoadingPlayers || isLoadingRoster || scoresLoading || statsLoading;

  if (isLoading) {
    return (
      <div className="py-10 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
        <p>Loading game details...</p>
      </div>
    );
  }

  if (gameError || !game) {
    return (
      <div className="py-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Game Not Found</h1>
        <p className="mb-6">The game you're looking for doesn't exist or has been removed.</p>
        <Button variant="outline" asChild>
          <Link href="/games">Back to Games</Link>
        </Button>
      </div>
    );
  }

  const homeTeam = teams.find(t => t.id === game.homeTeamId);
  const awayTeam = teams.find(t => t.id === game.awayTeamId);
  const gameStatus = gameStatuses.find(s => s.id === game.statusId);

  return (
    <div className="p-4 space-y-6">
      <Helmet>
        <title>{game.homeTeamName} vs {game.awayTeamName || 'BYE'} - {TEAM_NAME}</title>
      </Helmet>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-2xl font-bold">
              {game.homeTeamName} vs {game.awayTeamName || 'BYE'}
            </h1>
            <p className="text-muted-foreground">
              {formatDate(game.date)} at {game.time}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {teamId && (
            <Button 
              variant="outline" 
              asChild
              className="bg-primary/10 border-primary/20 hover:bg-primary/20"
            >
              <Link href={`/team/${teamId}/roster/game/${gameId}`}>
                <ClipboardList className="w-4 h-4 mr-2" />
                Manage Roster
              </Link>
            </Button>
          )}
          {game.statusAllowsStatistics && (
            <LiveStatsButton gameId={gameId} teamId={teamId || game.homeTeamId} />
          )}
        </div>
      </div>

      <Separator />

      {/* Game Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Game Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <CalendarRange className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{formatDate(game.date)}</p>
                <p className="text-sm text-muted-foreground">Date</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ActivitySquare className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{game.time}</p>
                <p className="text-sm text-muted-foreground">Time</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Edit className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{game.venue || 'TBA'}</p>
                <p className="text-sm text-muted-foreground">Venue</p>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-lg">{game.homeTeamName}</h3>
              <p className="text-sm text-muted-foreground">Home Team</p>
              <p className="text-xs text-muted-foreground mt-1">{homeTeam?.division}</p>
            </div>
            {game.awayTeamName && game.awayTeamName !== 'BYE' ? (
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <h3 className="font-semibold text-lg">{game.awayTeamName}</h3>
                <p className="text-sm text-muted-foreground">Away Team</p>
                <p className="text-xs text-muted-foreground mt-1">{awayTeam?.division}</p>
              </div>
            ) : (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-lg">BYE</h3>
                <p className="text-sm text-muted-foreground">No opponent</p>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-center">
            <Badge variant="secondary" className="px-3 py-1">
              {gameStatus?.displayName || 'Unknown Status'}
            </Badge>
          </div>

          {quarterScores.length > 0 && (
            <>
              <Separator className="my-4" />
              <GameScoreDisplay 
                scores={quarterScores}
                homeTeamName={game.homeTeamName}
                awayTeamName={game.awayTeamName}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Tabs for detailed information */}
      <Tabs defaultValue="roster" className="w-full">
        <TabsList>
          <TabsTrigger value="roster">Roster</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
          <TabsTrigger value="scores">Scores</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="roster" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                Team Rosters
              </CardTitle>
            </CardHeader>
            <CardContent>
              {roster && roster.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">{game.homeTeamName}</h4>
                      <div className="space-y-2">
                        {roster
                          .filter(r => r.teamId === game.homeTeamId)
                          .map((assignment, index) => {
                            const player = players.find(p => p.id === assignment.playerId);
                            return (
                              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <span className="font-medium">{assignment.position}</span>
                                <span>{player?.displayName || 'Not assigned'}</span>
                              </div>
                            );
                          })
                        }
                      </div>
                    </div>
                    {game.awayTeamName && game.awayTeamName !== 'BYE' && (
                      <div>
                        <h4 className="font-semibold mb-2">{game.awayTeamName}</h4>
                        <div className="space-y-2">
                          {roster
                            .filter(r => r.teamId === game.awayTeamId)
                            .map((assignment, index) => {
                              const player = players.find(p => p.id === assignment.playerId);
                              return (
                                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                  <span className="font-medium">{assignment.position}</span>
                                  <span>{player?.displayName || 'Not assigned'}</span>
                                </div>
                              );
                            })
                          }
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No roster data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Game Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {gameStats && gameStats.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {gameStats.filter(s => s.statType === 'goal').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Goals</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {gameStats.filter(s => s.statType === 'intercept').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Intercepts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {gameStats.filter(s => s.statType === 'rebound').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Rebounds</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {gameStats.filter(s => s.statType === 'error').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Errors</div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No statistics recorded yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scores" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Quarter Scores</CardTitle>
            </CardHeader>
            <CardContent>
              {quarterScores.length > 0 ? (
                <GameScoreDisplay 
                  scores={quarterScores}
                  homeTeamName={game.homeTeamName}
                  awayTeamName={game.awayTeamName}
                />
              ) : (
                <p className="text-muted-foreground">No scores recorded yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5" />
                Game Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-auto p-4" asChild>
                  <Link href={`/team/${teamId}/roster/game/${gameId}`}>
                    <div className="text-center">
                      <ClipboardList className="w-6 h-6 mx-auto mb-2" />
                      <div className="font-medium">Manage Roster</div>
                      <div className="text-sm text-muted-foreground">Set player positions</div>
                    </div>
                  </Link>
                </Button>
                {game.statusAllowsStatistics && (
                  <Button variant="outline" className="h-auto p-4" asChild>
                    <Link href={`/game/${gameId}/team/${teamId || game.homeTeamId}/stats/record`}>
                      <div className="text-center">
                        <BarChart3 className="w-6 h-6 mx-auto mb-2" />
                        <div className="font-medium">Record Stats</div>
                        <div className="text-sm text-muted-foreground">Live statistics entry</div>
                      </div>
                    </Link>
                  </Button>
                )}
                <Button variant="outline" className="h-auto p-4">
                  <div className="text-center">
                    <Printer className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-medium">Print Reports</div>
                    <div className="text-sm text-muted-foreground">Game summaries</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto p-4">
                  <div className="text-center">
                    <FileText className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-medium">Export Data</div>
                    <div className="text-sm text-muted-foreground">Game statistics</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}