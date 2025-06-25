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

// Helper functions for player colors
const getPlayerColorHex = (avatarColor?: string): string => {
  if (!avatarColor) return "#7c3aed";
  if (avatarColor.startsWith('bg-')) {
    return convertTailwindToHex(avatarColor);
  }
  return avatarColor;
};

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

  // State for edit mode
  const [isEditMode, setIsEditMode] = useState(false);
  const [showScoreMismatchDialog, setShowScoreMismatchDialog] = useState(false);
  const [showRosterPrint, setShowRosterPrint] = useState(false);
  const [showStatsPrint, setShowStatsPrint] = useState(false);

  // State for score mismatches
  const [scoreMismatchData, setScoreMismatchData] = useState<any>(null);

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

  // Fetch opponent teams if needed
  const { data: opponents = [] } = useQuery({
    queryKey: ['/api/teams/all'],
    queryFn: () => apiClient.get('/api/teams/all'),
    enabled: !!game
  });

  // Calculate scores using the unified service
  const { totalScores, quarterBreakdown } = useMemo(() => {
    if (!quarterScores || quarterScores.length === 0 || !game || !teams) {
      return { totalScores: null, quarterBreakdown: [] };
    }

    try {
      const clubTeamIds = teams.map(t => t.id);
      const scores = gameScoreService.calculateFromOfficialScores(
        game, 
        quarterScores, 
        clubTeamIds
      );
      
      return {
        totalScores: {
          homeScore: scores.ourScore,
          awayScore: scores.theirScore
        },
        quarterBreakdown: scores.quarterBreakdown || []
      };
    } catch (error) {
      console.error('Error calculating scores:', error);
      return { totalScores: null, quarterBreakdown: [] };
    }
  }, [quarterScores, game, teams]);

  // Calculate position-based statistics
  const positionStats = useMemo(() => {
    if (!gameStats || gameStats.length === 0) return {};
    
    const stats: Record<string, any> = {};
    
    gameStats.forEach(stat => {
      if (!stats[stat.position]) {
        stats[stat.position] = {
          goalsFor: 0,
          goalsAgainst: 0,
          missedGoals: 0,
          rebounds: 0,
          intercepts: 0,
          badPass: 0,
          handlingError: 0,
          pickUp: 0,
          infringement: 0,
          quarters: []
        };
      }
      
      stats[stat.position].goalsFor += stat.goalsFor || 0;
      stats[stat.position].goalsAgainst += stat.goalsAgainst || 0;
      stats[stat.position].missedGoals += stat.missedGoals || 0;
      stats[stat.position].rebounds += stat.rebounds || 0;
      stats[stat.position].intercepts += stat.intercepts || 0;
      stats[stat.position].badPass += stat.badPass || 0;
      stats[stat.position].handlingError += stat.handlingError || 0;
      stats[stat.position].pickUp += stat.pickUp || 0;
      stats[stat.position].infringement += stat.infringement || 0;
      stats[stat.position].quarters.push(stat.quarter);
    });
    
    return stats;
  }, [gameStats]);

  // Get position assignments from roster
  const positionAssignments = useMemo(() => {
    if (!roster || roster.length === 0) return {};
    
    const assignments: Record<string, any> = {};
    roster.forEach(assignment => {
      if (!assignments[assignment.position]) {
        assignments[assignment.position] = [];
      }
      const player = players.find(p => p.id === assignment.playerId);
      if (player) {
        assignments[assignment.position].push({
          ...player,
          quarter: assignment.quarter || 'All'
        });
      }
    });
    
    return assignments;
  }, [roster, players]);

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
  const opponentName = getOpponentName(opponents, game.awayTeamId);

  return (
    <div className="p-4 space-y-6">
      <Helmet>
        <title>{game.homeTeamName} vs {opponentName} - {TEAM_NAME}</title>
      </Helmet>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/games">Games</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbPage>Game Details</BreadcrumbPage>
              </BreadcrumbList>
            </Breadcrumb>
            <h1 className="text-2xl font-bold mt-2">
              {game.homeTeamName} vs {opponentName}
            </h1>
            <p className="text-muted-foreground">
              {formatDate(game.date)} at {game.time}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <TeamSwitcher />
          <Button variant="outline" onClick={() => setIsEditMode(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Game
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowRosterPrint(true)}
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Roster
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowStatsPrint(true)}
            disabled={!gameStats || gameStats.length === 0}
          >
            <FileText className="w-4 h-4 mr-2" />
            Print Stats
          </Button>
          {game?.statusAllowsStatistics && (
            <LiveStatsButton game={game} />
          )}
        </div>
      </div>

      <Separator />

      {/* Game Score Display */}
      {totalScores && quarterBreakdown.length > 0 && (
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Game Scores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GameScoreDisplay 
              scores={quarterScores}
              homeTeamName={game.homeTeamName}
              awayTeamName={opponentName}
            />
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="court" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="court">Court View</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
          <TabsTrigger value="roster">Roster</TabsTrigger>
          <TabsTrigger value="scores">Scores</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        {/* Court View Tab */}
        <TabsContent value="court" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Netball Court Display */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ActivitySquare className="w-5 h-5" />
                  Court Positions
                </CardTitle>
                <CardDescription>
                  Current player positions for {game.homeTeamName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative bg-green-50 border-2 border-green-200 rounded-lg p-4" 
                     style={{ aspectRatio: '3/4', minHeight: '400px' }}>
                  
                  {/* Court lines */}
                  <div className="absolute inset-4 border-2 border-green-400 rounded">
                    {/* Third lines */}
                    <div className="absolute top-1/3 left-0 right-0 h-0.5 bg-green-400"></div>
                    <div className="absolute top-2/3 left-0 right-0 h-0.5 bg-green-400"></div>
                    
                    {/* Goal circles */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-16 border-2 border-green-400 rounded-full -mt-8"></div>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-16 border-2 border-green-400 rounded-full -mb-8"></div>
                  </div>

                  {/* Position boxes */}
                  {POSITIONS.map((position, index) => {
                    const positionPlayers = positionAssignments[position] || [];
                    const positionStyle = getPositionStyle(position, index);
                    const stats = positionStats[position];
                    
                    return (
                      <div
                        key={position}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2"
                        style={positionStyle}
                      >
                        <PositionBox
                          position={position}
                          players={positionPlayers}
                          stats={stats}
                          onClick={() => {/* Handle position click */}}
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Position Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Position Statistics
                </CardTitle>
                <CardDescription>
                  Performance by court position
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {POSITIONS.map(position => {
                    const stats = positionStats[position];
                    const players = positionAssignments[position] || [];
                    
                    if (!stats && players.length === 0) return null;

                    return (
                      <GamePositionStatsBox
                        key={position}
                        position={position}
                        stats={stats}
                        players={players}
                      />
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="statistics" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatItemBox
              title="Total Goals"
              value={Object.values(positionStats).reduce((sum: number, stats: any) => sum + (stats?.goalsFor || 0), 0)}
              icon={<Activity className="w-5 h-5" />}
              color="green"
            />
            <StatItemBox
              title="Intercepts"
              value={Object.values(positionStats).reduce((sum: number, stats: any) => sum + (stats?.intercepts || 0), 0)}
              icon={<Activity className="w-5 h-5" />}
              color="blue"
            />
            <StatItemBox
              title="Rebounds"
              value={Object.values(positionStats).reduce((sum: number, stats: any) => sum + (stats?.rebounds || 0), 0)}
              icon={<Activity className="w-5 h-5" />}
              color="orange"
            />
            <StatItemBox
              title="Errors"
              value={Object.values(positionStats).reduce((sum: number, stats: any) => sum + (stats?.badPass || 0) + (stats?.handlingError || 0) + (stats?.infringement || 0), 0)}
              icon={<Activity className="w-5 h-5" />}
              color="red"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {POSITIONS.map(position => {
              const stats = positionStats[position];
              if (!stats) return null;

              return (
                <PositionStatsBox
                  key={position}
                  position={position}
                  stats={stats}
                  primaryStats={primaryPositionStats[position]}
                  secondaryStats={secondaryPositionStats[position]}
                />
              );
            })}
          </div>
        </TabsContent>

        {/* Roster Tab */}
        <TabsContent value="roster" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{game.homeTeamName} Roster</CardTitle>
                <CardDescription>
                  {roster.filter(r => r.teamId === game.homeTeamId).length} players assigned
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {POSITIONS.map(position => {
                    const assignments = roster.filter(r => 
                      r.teamId === game.homeTeamId && r.position === position
                    );
                    
                    return (
                      <div key={position} className="flex justify-between items-center p-2 border rounded">
                        <span className="font-medium">{position}</span>
                        <div className="flex gap-1">
                          {assignments.map((assignment, idx) => {
                            const player = players.find(p => p.id === assignment.playerId);
                            return (
                              <Badge key={idx} variant="secondary">
                                {player?.displayName || 'Unknown'}
                                {assignment.quarter && assignment.quarter !== 'All' && ` (Q${assignment.quarter})`}
                              </Badge>
                            );
                          })}
                          {assignments.length === 0 && (
                            <span className="text-muted-foreground text-sm">Not assigned</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {game.awayTeamId && awayTeam && (
              <Card>
                <CardHeader>
                  <CardTitle>{opponentName} Roster</CardTitle>
                  <CardDescription>
                    {roster.filter(r => r.teamId === game.awayTeamId).length} players assigned
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {POSITIONS.map(position => {
                      const assignments = roster.filter(r => 
                        r.teamId === game.awayTeamId && r.position === position
                      );
                      
                      return (
                        <div key={position} className="flex justify-between items-center p-2 border rounded">
                          <span className="font-medium">{position}</span>
                          <div className="flex gap-1">
                            {assignments.map((assignment, idx) => {
                              const player = players.find(p => p.id === assignment.playerId);
                              return (
                                <Badge key={idx} variant="secondary">
                                  {player?.displayName || 'Unknown'}
                                  {assignment.quarter && assignment.quarter !== 'All' && ` (Q${assignment.quarter})`}
                                </Badge>
                              );
                            })}
                            {assignments.length === 0 && (
                              <span className="text-muted-foreground text-sm">Not assigned</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="mt-6 flex gap-2">
            <Button asChild>
              <Link href={`/team/${game.homeTeamId}/roster/game/${gameId}`}>
                <ClipboardList className="w-4 h-4 mr-2" />
                Manage {game.homeTeamName} Roster
              </Link>
            </Button>
            {game.awayTeamId && awayTeam && (
              <Button variant="outline" asChild>
                <Link href={`/team/${game.awayTeamId}/roster/game/${gameId}`}>
                  <ClipboardList className="w-4 h-4 mr-2" />
                  Manage {opponentName} Roster
                </Link>
              </Button>
            )}
          </div>
        </TabsContent>

        {/* Scores Tab */}
        <TabsContent value="scores" className="mt-6">
          <div className="space-y-6">
            {quarterScores.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Quarter by Quarter</CardTitle>
                  <CardDescription>
                    Official scores entered during the game
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <GameScoreDisplay 
                    scores={quarterScores}
                    homeTeamName={game.homeTeamName}
                    awayTeamName={opponentName}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No Scores Recorded</CardTitle>
                  <CardDescription>
                    Scores will appear here once they are entered during the game
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <OfficialScoreEntry 
                    gameId={gameId}
                    homeTeamId={game.homeTeamId}
                    awayTeamId={game.awayTeamId}
                    homeTeamName={game.homeTeamName}
                    awayTeamName={opponentName}
                    onScoreUpdated={() => {
                      queryClient.invalidateQueries({ queryKey: ['/api/games', gameId, 'scores'] });
                    }}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Actions Tab */}
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
                  <Link href={`/team/${teamId || game.homeTeamId}/roster/game/${gameId}`}>
                    <div className="text-center">
                      <ClipboardList className="w-6 h-6 mx-auto mb-2" />
                      <div className="font-medium">Manage Roster</div>
                      <div className="text-sm text-muted-foreground">Set player positions</div>
                    </div>
                  </Link>
                </Button>
                {game?.statusAllowsStatistics && (
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

// Helper function to get position coordinates on the court
function getPositionStyle(position: Position, index: number) {
  const positions: Record<Position, { top: string; left: string }> = {
    'GS': { top: '85%', left: '50%' },
    'GA': { top: '75%', left: '30%' },
    'WA': { top: '65%', left: '20%' },
    'C': { top: '50%', left: '50%' },
    'WD': { top: '35%', left: '80%' },
    'GD': { top: '25%', left: '70%' },
    'GK': { top: '15%', left: '50%' }
  };

  return positions[position] || { top: '50%', left: '50%' };
}