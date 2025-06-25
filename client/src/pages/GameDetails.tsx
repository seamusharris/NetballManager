import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Edit, BarChart3, ClipboardList, Activity, CalendarRange, Users,
  FileText, Printer, Trophy
} from 'lucide-react';
import BackButton from '@/components/ui/back-button';
import { Separator } from '@/components/ui/separator';
import { formatDate } from '@/lib/utils';
import { useClub } from '@/contexts/ClubContext';
import { apiClient } from '@/lib/apiClient';

export default function GameDetails() {
  const params = useParams();
  const gameId = parseInt(params.id!);
  const teamId = params.teamId ? parseInt(params.teamId) : undefined;
  const { currentClub, currentTeam } = useClub();

  // Fetch game details
  const { data: game, isLoading: gameLoading, error: gameError } = useQuery({
    queryKey: ['/api/games', gameId],
    queryFn: () => apiClient.get(`/api/games/${gameId}`),
    enabled: !!gameId && !isNaN(gameId)
  });

  // Fetch game scores
  const { data: quarterScores, isLoading: scoresLoading } = useQuery({
    queryKey: ['/api/games', gameId, 'scores'],
    queryFn: () => apiClient.get(`/api/games/${gameId}/scores`),
    enabled: !!gameId
  });

  // Fetch game stats
  const { data: gameStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/games', gameId, 'stats'],
    queryFn: () => apiClient.get(`/api/games/${gameId}/stats`),
    enabled: !!gameId
  });

  // Fetch roster data - use team-based endpoint if we have a team context
  const { data: roster, isLoading: rosterLoading } = useQuery({
    queryKey: teamId ? ['/api/teams', teamId, 'games', gameId, 'rosters'] : ['/api/games', gameId, 'rosters'],
    queryFn: () => {
      if (teamId) {
        return apiClient.get(`/api/teams/${teamId}/games/${gameId}/rosters`);
      }
      return apiClient.get(`/api/games/${gameId}/rosters`);
    },
    enabled: !!gameId
  });

  // Fetch players for the current club
  const { data: players } = useQuery({
    queryKey: ['/api/clubs', currentClub?.id, 'players'],
    queryFn: () => apiClient.get(`/api/clubs/${currentClub?.id}/players`),
    enabled: !!currentClub?.id
  });

  // Fetch team notes if we have team context
  const { data: teamNotes } = useQuery({
    queryKey: ['/api/games', gameId, 'team-notes'],
    queryFn: () => apiClient.get(`/api/games/${gameId}/team-notes`),
    enabled: !!gameId,
    retry: false
  });

  // Calculate final scores
  const finalTeamScore = useMemo(() => {
    if (!quarterScores || quarterScores.length === 0) return 0;
    return quarterScores.reduce((sum: number, q: any) => sum + (q.teamScore || 0), 0);
  }, [quarterScores]);

  const finalOpponentScore = useMemo(() => {
    if (!quarterScores || quarterScores.length === 0) return 0;
    return quarterScores.reduce((sum: number, q: any) => sum + (q.opponentScore || 0), 0);
  }, [quarterScores]);

  // Determine game result
  const gameResult = useMemo(() => {
    if (finalTeamScore > finalOpponentScore) return 'Win';
    if (finalTeamScore < finalOpponentScore) return 'Loss';
    return 'Draw';
  }, [finalTeamScore, finalOpponentScore]);

  // Loading state
  const isLoading = gameLoading || scoresLoading || statsLoading || rosterLoading;

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (gameError || !game) {
    return (
      <div className="p-4">
        <div className="text-red-600">
          Error loading game details: {gameError?.message || 'Game not found'}
        </div>
      </div>
    );
  }

  const getResultBadgeVariant = (result: string) => {
    switch (result) {
      case 'Win': return 'default';
      case 'Loss': return 'destructive';
      case 'Draw': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Helmet>
        <title>{`${game.homeTeamName} vs ${game.awayTeamName} - ${TEAM_NAME}`}</title>
        <meta name="description" content={`Game details for ${game.homeTeamName} vs ${game.awayTeamName} on ${formatDate(game.date)}`} />
      </Helmet>

      {/* Breadcrumbs */}
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/games">Games</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{game.homeTeamName} vs {game.awayTeamName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="mb-4">
        <BackButton />
      </div>

      {/* Game Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {game.homeTeamName} vs {game.awayTeamName}
        </h1>
        <p className="text-gray-600 mb-4">
          {formatDate(game.date)} at {game.time} • Round {game.round}
        </p>
        
        <div className="flex justify-center items-center gap-4 mb-4">
          <Badge variant="secondary">{game.statusDisplayName}</Badge>
          {game.statusIsCompleted && (
            <Badge variant={getResultBadgeVariant(gameResult)}>
              {gameResult}
            </Badge>
          )}
        </div>

        {/* Score Display */}
        {game.statusIsCompleted && (
          <div className="text-center mb-6">
            <div className="text-5xl font-bold mb-2">
              {finalTeamScore} - {finalOpponentScore}
            </div>
            <p className="text-gray-600">Final Score</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {teamId && (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/team/${teamId}/roster/game/${gameId}`}>
              <ClipboardList className="w-4 h-4 mr-2" />
              Manage Roster
            </Link>
          </Button>
        )}
        
        {game.statusAllowsStatistics && teamId && (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/game/${gameId}/team/${teamId}/stats/record`}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Record Stats
            </Link>
          </Button>
        )}

        <Button variant="outline" size="sm">
          <Edit className="w-4 h-4 mr-2" />
          Edit Game
        </Button>

        <Button variant="outline" size="sm">
          <Users className="w-4 h-4 mr-2" />
          Set Availability
        </Button>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="roster">Roster</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Game Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarRange className="w-5 h-5" />
                  Game Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Date:</span>
                    <p>{formatDate(game.date)}</p>
                  </div>
                  <div>
                    <span className="font-medium">Time:</span>
                    <p>{game.time}</p>
                  </div>
                  <div>
                    <span className="font-medium">Round:</span>
                    <p>{game.round}</p>
                  </div>
                  <div>
                    <span className="font-medium">Season:</span>
                    <p>{game.seasonName}</p>
                  </div>
                  {game.venue && (
                    <div className="col-span-2">
                      <span className="font-medium">Venue:</span>
                      <p>{game.venue}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quarter Scores */}
            {quarterScores && quarterScores.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Quarter Scores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {quarterScores.map((score: any) => (
                      <div key={score.quarter} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span className="font-medium">Quarter {score.quarter}</span>
                        <span className="text-lg font-bold">
                          {score.teamScore} - {score.opponentScore}
                        </span>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between items-center p-3 bg-primary/5 rounded font-bold">
                      <span>Final Score</span>
                      <span className="text-xl">
                        {finalTeamScore} - {finalOpponentScore}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Team Notes */}
          {teamNotes && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Team Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm">{teamNotes}</div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Roster Tab */}
        <TabsContent value="roster" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Game Roster
              </CardTitle>
            </CardHeader>
            <CardContent>
              {roster && roster.length > 0 ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(quarter => {
                    const quarterRoster = roster.filter((r: any) => r.quarter === quarter);
                    if (quarterRoster.length === 0) return null;

                    return (
                      <div key={quarter}>
                        <h4 className="font-semibold mb-2">Quarter {quarter}</h4>
                        <div className="grid grid-cols-7 gap-2 text-sm">
                          {['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'].map(position => {
                            const playerInPosition = quarterRoster.find((r: any) => r.position === position);
                            const player = players?.find((p: any) => p.id === playerInPosition?.playerId);
                            
                            return (
                              <div key={position} className="text-center p-2 border rounded">
                                <div className="font-medium text-xs mb-1">{position}</div>
                                <div className="text-xs">
                                  {player ? player.displayName : playerInPosition ? `Player ${playerInPosition.playerId}` : '-'}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground">No roster information available for this game.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
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
                  {[1, 2, 3, 4].map(quarter => {
                    const quarterStats = gameStats.filter((s: any) => s.quarter === quarter);
                    if (quarterStats.length === 0) return null;

                    return (
                      <div key={quarter}>
                        <h4 className="font-semibold mb-2">Quarter {quarter}</h4>
                        <div className="grid grid-cols-7 gap-2 text-xs">
                          {['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'].map(position => {
                            const positionStat = quarterStats.find((s: any) => s.position === position);
                            
                            return (
                              <div key={position} className="text-center p-2 border rounded">
                                <div className="font-medium mb-1">{position}</div>
                                {positionStat ? (
                                  <div className="space-y-1">
                                    {positionStat.goalsFor > 0 && <div>Goals: {positionStat.goalsFor}</div>}
                                    {positionStat.rebounds > 0 && <div>Reb: {positionStat.rebounds}</div>}
                                    {positionStat.intercepts > 0 && <div>Int: {positionStat.intercepts}</div>}
                                  </div>
                                ) : (
                                  <div className="text-muted-foreground">-</div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground">No statistics available for this game.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Game Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Game analysis features will be available here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}