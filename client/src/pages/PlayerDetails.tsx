import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  AlertDialog,
  AlertDialogAction, 
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Player, Game, GameStat, allPositions, Position, Season } from "@shared/schema";
import { cn, getInitials } from "@/lib/utils";
import PlayerAvatar from "@/components/ui/player-avatar";
import BackButton from "@/components/ui/back-button";
import { Award, Target, Shield, Activity, Edit, Trash2, Calendar, Users } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/apiClient";
import PlayerForm from "@/components/players/PlayerForm";
import PlayerClubsManager from '@/components/players/PlayerClubsManager';
import PlayerSeasonsManager from '@/components/players/PlayerSeasonsManager';
import PlayerTeamsManager from '@/components/players/PlayerTeamsManager';
import { isGameValidForStatistics } from '@/lib/gameFilters';
import { // useClub removed } from 'wouter';

export default function PlayerDetails() {
  const { id } = useParams<{ id: string }>();
  const playerId = parseInt(id);
  const [_, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { currentClubId } = // useClub removed();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSeasonManagerOpen, setIsSeasonManagerOpen] = useState(false);
  const [isClubManagerOpen, setIsClubManagerOpen] = useState(false);
  const [isTeamManagerOpen, setIsTeamManagerOpen] = useState(false);

  // Fetch player data
  const { data: player, isLoading: isLoadingPlayer } = useQuery<Player>({
    queryKey: [`/api/players/${playerId}`],
    queryFn: () => apiClient.get(`/api/players/${playerId}`),
    enabled: !isNaN(playerId),
  });

  // Fetch all games with club context
  const { data: games = [], isLoading: isLoadingGames } = useQuery<Game[]>({
    queryKey: ['/api/games'],
    queryFn: () => apiClient.get('/api/games'),
  });

  // Fetch all seasons for the seasons manager
  const { data: seasons = [], isLoading: isLoadingSeasons } = useQuery<Season[]>({
    queryKey: ['/api/seasons'],
    queryFn: () => apiClient.get('/api/seasons'),
  });

  // Get completed games using same filtering as Team Dashboard PlayerAnalyticsWidget
  const completedGames = (games as Game[]).filter(game => 
    game.statusIsCompleted === true && game.statusAllowsStatistics === true
  );
  const completedGameIds = completedGames.map(game => game.id);

  // Use Team Dashboard's exact cache keys to share data - stats
  const { data: allGameStats = {}, isLoading: isLoadingStats } = useQuery<Record<number, GameStat[]>>({
    queryKey: ['centralized-stats', currentClubId, completedGameIds.sort().join(',')],
    queryFn: async () => {
      if (completedGameIds.length === 0) return {};

      console.log(`PlayerDetails: Using batch endpoint for stats fetch of ${completedGameIds.length} completed games`);

      try {
        // Use batch endpoint for better performance and cache consistency
        const batchResponse = await apiClient.post('/api/games/stats/batch', {
          gameIds: completedGameIds
        });
        console.log(`PlayerDetails: Batch stats fetch completed for ${Object.keys(batchResponse).length} games`);
        return batchResponse;
      } catch (error) {
        console.error('PlayerDetails: Batch stats fetch failed, falling back to individual requests:', error);

        // Fallback to individual requests
        const statsMap: Record<number, GameStat[]> = {};
        for (const gameId of completedGameIds) {
          try {
            const stats = await apiClient.get(`/api/games/${gameId}/stats`);
            statsMap[gameId] = stats || [];
          } catch (error) {
            console.error(`PlayerDetails: Error fetching stats for game ${gameId}:`, error);
            statsMap[gameId] = [];
          }
        }
        return statsMap;
      }
    },
    enabled: !!currentClubId && completedGameIds.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes (increased for better caching)
    gcTime: 30 * 60 * 1000, // 30 minutes (increased for better caching)
  });

  // Use Team Dashboard's exact cache keys to share data - rosters
  const { data: allGameRosters = {}, isLoading: isLoadingRosters } = useQuery<Record<number, any[]>>({
    queryKey: ['centralized-rosters', currentClubId, completedGameIds.sort().join(',')],
    queryFn: async () => {
      if (completedGameIds.length === 0) return {};

      console.log(`PlayerDetails: Using individual requests for roster fetch of ${completedGameIds.length} games`);
      const rostersMap: Record<number, any[]> = {};

      // Fetch rosters for all completed games
      for (const gameId of completedGameIds) {
        try {
          const roster = await apiClient.get(`/api/games/${gameId}/rosters`);
          rostersMap[gameId] = roster || [];
        } catch (error) {
          console.error(`PlayerDetails: Error fetching roster for game ${gameId}:`, error);
          rostersMap[gameId] = [];
        }
      }

      console.log(`PlayerDetails: Centralized roster fetch completed for ${Object.keys(rostersMap).length} games`);
      return rostersMap;
    },
    enabled: !!currentClubId && completedGameIds.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes (increased for better caching)
    gcTime: 30 * 60 * 1000, // 30 minutes (increased for better caching)
  });

  const isLoading = isLoadingPlayer || isLoadingGames || isLoadingStats || isLoadingRosters;

  // Calculate aggregate stats
  const calculateAggregateStats = () => {
    // Only count games where the player is on the roster
    // This ensures we don't count games where a player has stats but was later removed from the roster
    const allParticipatedGameIds = new Set(
      Object.keys(allGameRosters).map(id => parseInt(id))
    );

    if (allParticipatedGameIds.size === 0) {
      return {
        totalGames: 0,
        totalGoals: 0,
        totalGoalsAgainst: 0,
        totalMissedGoals: 0,
        totalRebounds: 0,
        totalIntercepts: 0,
        totalBadPasses: 0,
        totalHandlingErrors: 0,
        totalPickUps: 0,
        totalInfringements: 0,
        averageRating: 0,
        positionCounts: {},
        totalQuartersPlayed: 0,
        gameStats: []
      };
    }

    let totalGames = 0;
    let totalGoals = 0;
    let totalGoalsAgainst = 0;
    let totalMissedGoals = 0;
    let totalRebounds = 0;
    let totalIntercepts = 0;
    let totalBadPasses = 0;
    let totalHandlingErrors = 0;
    let totalPickUps = 0;
    let totalInfringements = 0;
    let ratingSum = 0;
    let ratingCount = 0;

    const gameStatSummaries: {
      gameId: number,
      date: string,
      opponent: string,
      goals: number,
      goalsAgainst: number,
      rebounds: number,
      intercepts: number,
      rating: number
    }[] = [];

    // Initialize position counts
    const positionCounts: Record<string, number> = {};
    let totalQuartersPlayed = 0;

    // Process each game this player participated in
    allParticipatedGameIds.forEach(gameId => {
      const game = games.find(g => g.id === gameId);
      if (!game) return;

      // First check if player played in an actual position in this game
      const gameRosters = allGameRosters[gameId] || [];
      const playedOnCourt = gameRosters.some((roster: any) => 
        roster.playerId === playerId && allPositions.includes(roster.position)
      );

      // Only process games where player was actually on court
      if (!playedOnCourt) return;

      // Increment games count since player was actually on court
      totalGames++;

      // Get stats for this game if available
      const stats: GameStat[] = allGameStats[gameId] || [];

      // Get opponent team name from game data (use the team we're playing against)
      const opponentName = game.awayTeamName || game.homeTeamName || `Unknown Team`;

      // Count positions played in this game (only count actual playing positions, not "off")
      gameRosters.forEach((roster: any) => {
        if (roster.playerId === playerId) {
          // Only count actual playing positions (those in allPositions)
          if (allPositions.includes(roster.position)) {
            positionCounts[roster.position] = (positionCounts[roster.position] || 0) + 1;
            totalQuartersPlayed++;
          }
        }
      });

      // Sum stats for this game - but only for quarters the player actually played on court
      let gameGoals = 0;
      let gameGoalsAgainst = 0;
      let gameMissedGoals = 0;
      let gameRebounds = 0;
      let gameIntercepts = 0;
      let gameBadPasses = 0;
      let gameHandlingErrors = 0;
      let gamePickUps = 0;
      let gameInfringements = 0;
      let gameRating = 0;

      // Create a map of positions played by quarter
      const positionsByQuarter = gameRosters.reduce((map, roster) => {
        if (roster.playerId === playerId && allPositions.includes(roster.position)) {
          map[roster.quarter] = roster.position;
        }
        return map;
      }, {} as Record<number, Position>);

      // Create maps for tracking stats by position
      const statsByPosition: Record<Position, {
        quarters: number;
        goalsFor: number;
        goalsAgainst: number;
        missedGoals: number;
        rebounds: number;
        intercepts: number;
        badPass: number;
        handlingError: number;
        pickUp: number;
        infringement: number;
      }> = {} as any;

      // Initialize stats by position counters
      allPositions.forEach(pos => {
        statsByPosition[pos] = {
          quarters: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          missedGoals: 0,
          rebounds: 0,
          intercepts: 0,
          badPass: 0,
          handlingError: 0,
          pickUp: 0,
          infringement: 0
        };
      });

      // Track ratings for this specific game
      let gameRatingSum = 0;
      let gameRatingCount = 0;

      stats.forEach((stat: GameStat) => {
        // In position-based model, we need to match stats to the positions the player played
        // Only process stats for positions the player actually played in this quarter
        const positionPlayed = positionsByQuarter[stat.quarter];

        // Match stat positions with positions player actually played
        if (positionPlayed && stat.position === positionPlayed) {
          const position = stat.position;

          // Increment stats for this position
          if (position && statsByPosition[position]) {
            statsByPosition[position].quarters++;
            statsByPosition[position].goalsFor += stat.goalsFor || 0;
            statsByPosition[position].goalsAgainst += stat.goalsAgainst || 0;
            statsByPosition[position].missedGoals += stat.missedGoals || 0;
            statsByPosition[position].rebounds += stat.rebounds || 0;
            statsByPosition[position].intercepts += stat.intercepts || 0;
            statsByPosition[position].badPass += stat.badPass || 0;
            statsByPosition[position].handlingError += stat.handlingError || 0;
            statsByPosition[position].pickUp += stat.pickUp || 0;
            statsByPosition[position].infringement += stat.infringement || 0;
          }

          // Also increment game totals
          gameGoals += stat.goalsFor || 0;
          gameGoalsAgainst += stat.goalsAgainst || 0;
          gameMissedGoals += stat.missedGoals || 0;
          gameRebounds += stat.rebounds || 0;
          gameIntercepts += stat.intercepts || 0;
          gameBadPasses += stat.badPasses || 0;
          gameHandlingErrors += stat.handlingErrors || 0;
          gamePickUps += stat.pickUps || 0;
          gameInfringements += stat.infringements || 0;

          // Track ratings for this specific game
          if (typeof stat.rating === 'number') {
            gameRatingSum += stat.rating;
            gameRatingCount++;
            ratingSum += stat.rating; // Also add to overall rating sum
            ratingCount++; // And overall rating count
          }
        }
      });

      // Calculate average rating for this game
      if (gameRatingCount > 0) {
        gameRating = gameRatingSum / gameRatingCount;
      }

      // Add to totals
      totalGoals += gameGoals;
      totalGoalsAgainst += gameGoalsAgainst;
      totalMissedGoals += gameMissedGoals;
      totalRebounds += gameRebounds;
      totalIntercepts += gameIntercepts;
      totalBadPasses += gameBadPasses;
      totalHandlingErrors += gameHandlingErrors;
      totalPickUps += gamePickUps;
      totalInfringements += gameInfringements;

      // Add game summary
      gameStatSummaries.push({
        gameId,
        date: game.date,
        opponent: opponentName,
        goals: gameGoals,
        goalsAgainst: gameGoalsAgainst,
        rebounds: gameRebounds,
        intercepts: gameIntercepts,
        rating: gameRating
      });
    });

    // Sort game summaries by date (most recent first)
    gameStatSummaries.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return {
      totalGames,
      totalGoals,
      totalGoalsAgainst,
      totalMissedGoals,
      totalRebounds,
      totalIntercepts,
      totalBadPasses,
      totalHandlingErrors,
      totalPickUps,
      totalInfringements,
      averageRating: ratingCount > 0 ? Math.round((ratingSum / ratingCount) * 10) / 10 : 0,
      positionCounts,
      totalQuartersPlayed,
      gameStats: gameStatSummaries
    };
  };

  const stats = calculateAggregateStats();

  // Delete mutation handled separately like Seasons and Teams to avoid 404 issues
  const deletePlayerMutation = useMutation({
    mutationFn: (playerId: number) => apiClient.delete(`/api/players/${playerId}`),
    onSuccess: () => {
      // Navigate to players list first
      navigate('/players');

      // Invalidate queries to update the list
      queryClient.invalidateQueries({ queryKey: ['/api/players'] });

      toast({
        title: "Success",
        description: "Player deleted successfully",
      });
    },
    onError: (error: any) => {
      // Handle 404 errors gracefully (React Strict Mode double execution)
      const errorMessage = error.message?.toLowerCase() || '';
      const is404Error = errorMessage.includes("not found") || 
                         errorMessage.includes("404") || 
                         (error as any).status === 404 ||
                         (error as any).response?.status === 404;

      // Always navigate away first
      navigate('/players');

      if (is404Error) {
        // Player was already deleted, treat as success
        queryClient.invalidateQueries({ queryKey: ['/api/players'] });
        toast({
          title: "Success",
          description: "Player deleted successfully",
        });
      } else {
        toast({
          title: "Error", 
          description: error.message || "Failed to delete player",
          variant: "destructive",
        });
      }
    },
  });

  const handleDeletePlayer = () => {
    if (deletePlayerMutation.isPending) return; // Prevent duplicate calls
    if (confirm('Are you sure you want to delete this player?')) {
      deletePlayerMutation.mutate(playerId);
    }
  };

  const updateMutation = useMutation({
    mutationFn: (data: any) => apiClient.patch(`/api/players/${playerId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/players/${playerId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/players'] });
      toast({
        title: "Success",
        description: "Player updated successfully",
      });
      setIsEditModalOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update player",
        variant: "destructive",
      });
    },
  });

  const handleEditPlayer = () => {
    if (updateMutation.isPending) return; // Prevent opening if update is pending
    setIsEditModalOpen(true);
  };

  const handleUpdatePlayer = (data: any) => {
    if (updateMutation.isPending) return; // Prevent duplicate calls
    updateMutation.mutate(data);
  };

  // Get the player's avatar color
  // The avatar color function is no longer used since we're directly using player.avatarColor in the JSX

  const getRatingClass = (rating: number): string => {
    if (rating >= 9) return 'bg-success/20 text-success';
    if (rating >= 8) return 'bg-accent/20 text-accent';
    if (rating >= 7) return 'bg-warning/20 text-warning';
    return 'bg-error/20 text-error';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center mb-4">

          <h1 className="text-2xl font-bold">Loading player data...</h1>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center mb-4">

          <h1 className="text-2xl font-bold">Player not found</h1>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{player.displayName} - Player Details | Netball Team Manager</title>
        <meta name="description" content={`Performance statistics and details for ${player.displayName}`} />
      </Helmet>

      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <BackButton fallbackPath="/dashboard" variant="ghost" className="mr-2">

            </BackButton>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center" 
              onClick={() => setIsSeasonManagerOpen(true)}
            >
              <Calendar className="h-4 w-4 mr-1" /> Manage Seasons
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center" 
              onClick={() => setIsClubManagerOpen(true)}
            >
              <Shield className="h-4 w-4 mr-1" /> Manage Clubs
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center" 
              onClick={() => setIsTeamManagerOpen(true)}
            >
              <Users className="h-4 w-4 mr-1" /> Manage Teams
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center" 
              onClick={handleEditPlayer}
            >
              <Edit className="h-4 w-4 mr-1" /> Edit
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              className="flex items-center"
              onClick={handleDeletePlayer}
              disabled={deletePlayerMutation.isPending}
            >
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 mb-6">
          {/* Player Info Card */}
          <Card className="flex-grow md:w-1/3 md:max-w-md">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="mr-4">
                  <PlayerAvatar 
                    firstName={player.firstName}
                    lastName={player.lastName}
                    avatarColor={player.avatarColor || 'bg-gray-500'}
                    size="xl"
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold mb-1">{player.displayName}</h1>
                  <p className="text-gray-600">{player.firstName} {player.lastName}</p>
                  {player.dateOfBirth && (
                    <p className="text-sm text-gray-500 mt-1">
                      DOB: {new Date(player.dateOfBirth).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Position Preferences</h3>
                <div className="flex flex-wrap gap-2">
                  {player.positionPreferences?.map((position, index) => (
                    <span key={index} className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium", 
                      index === 0 ? "bg-primary/20 text-primary" : "bg-gray-100 text-gray-700"
                    )}>
                      {position} {index === 0 && <span className="ml-1">(Primary)</span>}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-center">
                <span className="mr-2">Status:</span>
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  player.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                )}>
                  {player.active ? "Active" : "Inactive"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Performance Summary Card */}
          <Card className="flex-grow">
            <CardHeader className="pb-2">
              <CardTitle>Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
                  <Award className="h-6 w-6 text-primary mb-2" />
                  <span className="text-sm text-gray-600">Average Rating</span>
                  <span className={cn("mt-1 px-2 py-1 rounded-full text-sm font-semibold", getRatingClass(stats.averageRating))}>
                    {stats.averageRating.toFixed(1)}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
                  <Target className="h-6 w-6 text-primary mb-2" />
                  <span className="text-sm text-gray-600">Goals Scored</span>
                  <span className="mt-1 text-lg font-semibold">{stats.totalGoals}</span>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
                  <Shield className="h-6 w-6 text-primary mb-2" />
                  <span className="text-sm text-gray-600">Intercepts</span>
                  <span className="mt-1 text-lg font-semibold">{stats.totalIntercepts}</span>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
                  <Activity className="h-6 w-6 text-primary mb-2" />
                  <span className="text-sm text-gray-600">Rebounds</span>
                  <span className="mt-1 text-lg font-semibold">{stats.totalRebounds}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="games">Games</TabsTrigger>
            <TabsTrigger value="stats">Detailed Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Positions Played</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4 mb-6">
                      {allPositions.map((position: Position) => (
                        <div key={position} className="bg-gray-50 p-3 rounded-lg text-center">
                          <p className="text-md font-medium mb-1">{position}</p>
                          <p className="text-2xl font-semibold">{stats.positionCounts[position] || 0}</p>
                          <p className="text-xs text-gray-500">
                            {stats.totalQuartersPlayed > 0 
                              ? `${Math.round((stats.positionCounts[position] || 0) / stats.totalQuartersPlayed * 100)}%` 
                              : '0%'}
                          </p>
                        </div>
                      ))}
                    </div>

                    <h3 className="text-lg font-medium mb-3">Season Statistics</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Games Played</p>
                        <p className="text-lg font-semibold">{stats.totalGames}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Goals Scored</p>
                        <p className="text-lg font-semibold">{stats.totalGoals}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Goals Against</p>
                        <p className="text-lg font-semibold">{stats.totalGoalsAgainst}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Missed Goals</p>
                        <p className="text-lg font-semibold">{stats.totalMissedGoals}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Rebounds</p>
                        <p className="text-lg font-semibold">{stats.totalRebounds}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Intercepts</p>
                        <p className="text-lg font-semibold">{stats.totalIntercepts}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Bad Passes</p>
                        <p className="text-lg font-semibold">{stats.totalBadPasses}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Handling Errors</p>
                        <p className="text-lg font-semibold">{stats.totalHandlingErrors}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Pick Ups</p>
                        <p className="text-lg font-semibold">{stats.totalPickUps}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Infringements</p>
                        <p className="text-lg font-semibold">{stats.totalInfringements}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-3">Game Performance</h3>
                    {stats.gameStats.length === 0 ? (
                      <p className="text-gray-500">No game statistics available</p>
                    ) : (
                      <div className="overflow-x-auto border-t border-l border-b rounded-md">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-slate-50">
                              <TableHead className="min-w-[100px] border-b">Date</TableHead>
                              <TableHead className="min-w-[120px] border-b">Opponent</TableHead>
                              <TableHead className="text-center w-10 border-r border-b"></TableHead>

                              {/* Game Info Category */}
                              <TableHead colSpan={2} className="text-center bg-blue-50 border-r border-b">
                                Game
                              </TableHead>

                              {/* Shooting Category */}
                              <TableHead colSpan={3} className="text-center bg-blue-50 border-r border-b">
                                Shooting
                              </TableHead>

                              {/* Defense Category */}
                              <TableHead colSpan={3} className="text-center bg-blue-50 border-r border-b">
                                Defense
                              </TableHead>

                              {/* Errors Category */}
                              <TableHead colSpan={3} className="text-center bg-blue-50 border-r border-b">
                                Errors
                              </TableHead>
                            </TableRow>

                            {/* Stat field headers */}
                            <TableRow>
                              <TableHead className="border-b"></TableHead>
                              <TableHead className="border-b"></TableHead>
                              <TableHead className="border-r border-b"></TableHead>

                              {/* Game Info Fields */}
                              <TableHead className="text-center px-1 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                Round
                              </TableHead>
                              <TableHead className="text-center px-1 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-r">
                                Rating
                              </TableHead>

                              {/* Shooting Fields */}
                              <TableHead className="text-center px-1 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                For
                              </TableHead>
                              <TableHead className="text-center px-1 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                Agn
                              </TableHead>
                              <TableHead className="text-center px-1 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-r">
                                Miss
                              </TableHead>

                              {/* Defense Fields */}
                              <TableHead className="text-center px-1 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                Int
                              </TableHead>
                              <TableHead className="text-center px-1 py-2 text-xs font-mediumtext-gray-500 uppercase tracking-wider border-b">
                                Reb
                              </TableHead>
                              <TableHead className="text-center px-1 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-r">
                                Pick
                              </TableHead>

                              {/* Errors Fields */}
                              <TableHead className="text-center px-1 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                Pass
                              </TableHead>
                              <TableHead className="text-center px-1 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                Hand
                              </TableHead>
                              <TableHead className="text-center px-1 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-r">
                                Pen
                              </TableHead>
                            </TableRow>
                          </TableHeader>

                          <TableBody className="bg-white divide-y divide-gray-200">
                            {stats.gameStats.map((game, index) => {
                              // Find the game to get the round number
                              const gameData = games.find(g => g.id === game.gameId);
                              const roundNumber = gameData?.round || '-';

                              // Double check player is on roster for this game and has an actual roster and has an actual position (not "off")
                              const gameRosters = allGameRosters[game.gameId] || [];
                              const isOnRoster = gameRosters.some((roster: any) => 
                                roster.playerId === playerId && allPositions.includes(roster.position)
                              );

                              if (!isOnRoster) return null; // Skip if not on roster or only "off" position

                              return (
                                <TableRow 
                                  key={game.gameId}
                                  className={`hover:bg-gray-100 transition-colors duration-150 ${index === stats.gameStats.length - 1 ? "" : "border-b"}`}
                                >
                                  {/* Date column */}
                                  <TableCell className="px-3 py-2 whitespace-nowrap">
                                    {new Date(game.date).toLocaleDateString()}
                                  </TableCell>

                                  {/* Opponent column */}
                                  <TableCell className="px-3 py-2 whitespace-nowrap">
                                    <span className="text-sm font-medium text-blue-600">
                                      {game.opponent}
                                    </span>
                                  </TableCell>

                                  <TableCell className="border-r"></TableCell>

                                  {/* Round */}
                                  <TableCell className="px-2 py-2 whitespace-nowrap text-sm text-center font-mono">
                                    {roundNumber}
                                  </TableCell>

                                  {/* Rating */}
                                  <TableCell className="px-2 py-2 whitespace-nowrap text-center border-r">
                                    <span className={cn("text-sm font-mono", getRatingClass(game.rating))}>
                                      {game.rating.toFixed(1)}
                                    </span>
                                  </TableCell>

                                  {/* Shooting stats */}
                                  <TableCell className="px-2 py-2 whitespace-nowrap text-sm text-center font-mono">
                                    {game.goals}
                                  </TableCell>
                                  <TableCell className="px-2 py-2 whitespace-nowrap text-sm text-center font-mono">
                                    {game.goalsAgainst}
                                  </TableCell>
                                  <TableCell className="px-2 py-2 whitespace-nowrap text-sm text-center font-mono border-r">
                                    {/* Calculate missedGoals from position stats for this player */}
                                    {(() => {
                                      const gameRosters = allGameRosters[game.gameId] || [];
                                      const gameStats = allGameStats[game.gameId] || [];
                                      let playerMissedGoals = 0;

                                      gameRosters.forEach((roster: any) => {
                                        if (roster.playerId === playerId) {
                                          const positionStat = gameStats.find(s => 
                                            s.position === roster.position && s.quarter === roster.quarter
                                          );
                                          if (positionStat) {
                                            playerMissedGoals += positionStat.missedGoals || 0;
                                          }
                                        }
                                      });

                                      return playerMissedGoals;
                                    })()}
                                  </TableCell>

                                  {/* Defense stats */}
                                  <TableCell className="px-2 py-2 whitespace-nowrap text-sm text-center font-mono">
                                    {game.intercepts}
                                  </TableCell>
                                  <TableCell className="px-2 py-2 whitespace-nowrap text-sm text-center font-mono">
                                    {game.rebounds}
                                  </TableCell>
                                  <TableCell className="px-2 py-2 whitespace-nowrap text-sm text-center font-mono border-r">
                                    {/* Calculate pickUp from position stats for this player */}
                                    {(() => {
                                      const gameRosters = allGameRosters[game.gameId] || [];
                                      const gameStats = allGameStats[game.gameId] || [];
                                      let playerPickUps = 0;

                                      gameRosters.forEach((roster: any) => {
                                        if (roster.playerId === playerId) {
                                          const positionStat = gameStats.find(s => 
                                            s.position === roster.position && s.quarter === roster.quarter
                                          );
                                          if (positionStat) {
                                            playerPickUps += positionStat.pickUp || 0;
                                          }
                                        }
                                      });

                                      return playerPickUps;
                                    })()}
                                  </TableCell>

                                  {/* Errors stats */}
                                  <TableCell className="px-2 py-2 whitespace-nowrap text-sm text-center font-mono">
                                    {/* Calculate badPass from position stats for this player */}
                                    {(() => {
                                      const gameRosters = allGameRosters[game.gameId] || [];
                                      const gameStats = allGameStats[game.gameId] || [];
                                      let playerBadPasses = 0;

                                      gameRosters.forEach((roster: any) => {
                                        if (roster.playerId === playerId) {
                                          const positionStat = gameStats.find(s => 
                                            s.position === roster.position && s.quarter === roster.quarter
                                          );
                                          if (positionStat) {
                                            playerBadPasses += positionStat.badPass || 0;
                                          }
                                        }
                                      });

                                      return playerBadPasses;
                                    })()}
                                  </TableCell>
                                  <TableCell className="px-2 py-2 whitespace-nowrap text-sm text-center font-mono">
                                    {/* Calculate handlingError from position stats for this player */}
                                    {(() => {
                                      const gameRosters = allGameRosters[game.gameId] || [];
                                      const gameStats = allGameStats[game.gameId] || [];
                                      let playerHandlingErrors = 0;

                                      gameRosters.forEach((roster: any) => {
                                        if (roster.playerId === playerId) {
                                          const positionStat = gameStats.find(s => 
                                            s.position === roster.position && s.quarter === roster.quarter
                                          );
                                          if (positionStat) {
                                            playerHandlingErrors += positionStat.handlingError || 0;
                                          }
                                        }
                                      });

                                      return playerHandlingErrors;
                                    })()}
                                  </TableCell>
                                  <TableCell className="px-2 py-2 whitespace-nowrap text-sm text-center font-mono border-r">
                                    {/* Calculate infringement from position stats for this player */}
                                    {(() => {
                                      const gameRosters = allGameRosters[game.gameId] || [];
                                      const gameStats = allGameStats[game.gameId] || [];
                                      let playerInfringements = 0;

                                      gameRosters.forEach((roster: any) => {
                                        if (roster.playerId === playerId) {
                                          const positionStat = gameStats.find(s => 
                                            s.position === roster.position && s.quarter === roster.quarter
                                          );
                                          if (positionStat) {
                                            playerInfringements += positionStat.infringement || 0;
                                          }
                                        }
                                      });

                                      return playerInfringements;
                                    })()}
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="games">
            <Card>
              <CardHeader>
                <CardTitle>Game History</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.gameStats.length === 0 ? (
                  <p className="text-gray-500">No game statistics available</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-2">Date</th>
                          <th className="text-left py-2 px-2">Opponent</th>
                          <th className="text-left py-2 px-2">Round</th>
                          <th className="text-center py-2 px-2">Position</th>
                          <th className="text-center py-2 px-2">Rating</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.gameStats.map((game) => {
                          // Find the game to get the round number
                          const gameData = games.find(g => g.id === game.gameId);
                          const roundNumber = gameData?.round || '-';

                          // Find the player's positions for this game
                          const gameRosters = allGameRosters[game.gameId] || [];
                          const positionRosters = gameRosters.filter((roster: any) => 
                            roster.playerId === playerId && allPositions.includes(roster.position)
                          );

                          // Skip if player is not on roster for this game or only has "off" positions
                          if (positionRosters.length === 0) return null;

                          const positions = positionRosters
                            .map((roster: any) => `Q${roster.quarter}: ${roster.position}`)
                            .join(', ');

                          return (
                            <tr key={game.gameId} className="border-b hover:bg-gray-50">
                              <td className="py-2 px-2">{new Date(game.date).toLocaleDateString()}</td>
                              <td className="py-2 px-2">{game.opponent}</td>
                              <td className="py-2 px-2">{roundNumber}</td>
                              <td className="py-2 px-2 text-center">{positions || 'Unknown'}</td>
                              <td className="py-2 px-2 text-center">
                                <span className={cn("px-2 py-1 text-xs font-semibold rounded-full", getRatingClass(game.rating))}>
                                  {game.rating.toFixed(1)}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Offensive Stats */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Offensive Stats</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium">Scoring</h4>
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Goals Scored:</span>
                            <span className="font-semibold">{stats.totalGoals}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Missed Goals:</span>
                            <span className="font-semibold">{stats.totalMissedGoals}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Shooting %:</span>
                            <span className="font-semibold">
                              {stats.totalGoals + stats.totalMissedGoals > 0 
                                ? Math.round((stats.totalGoals / (stats.totalGoals + stats.totalMissedGoals)) * 100) 
                                : 0}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium">Ball Control</h4>
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Pick Ups:</span>
                            <span className="font-semibold">{stats.totalPickUps}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Bad Passes:</span>
                            <span className="font-semibold">{stats.totalBadPasses}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Handling Errors:</span>
                            <span className="font-semibold">{stats.totalHandlingErrors}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Defensive Stats */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Defensive Stats</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium">Defense</h4>
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Intercepts:</span>
                            <span className="font-semibold">{stats.totalIntercepts}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Rebounds:</span>
                            <span className="font-semibold">{stats.totalRebounds}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Goals Against:</span>
                            <span className="font-semibold">{stats.totalGoalsAgainst}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium">Discipline</h4>
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Infringements:</span>
                            <span className="font-semibold">{stats.totalInfringements}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Infringements per Game:</span>
                            <span className="font-semibold">
                              {stats.totalGames > 0 
                                ? (stats.totalInfringements / stats.totalGames).toFixed(1) 
                                : "0.0"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Per Game Averages */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Per Game Averages</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {stats.totalGames > 0 ? (
                        <>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">Goals</p>
                            <p className="text-lg font-semibold">
                              {(stats.totalGoals / stats.totalGames).toFixed(1)}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">Rebounds</p>
                            <p className="text-lg font-semibold">
                              {(stats.totalRebounds / stats.totalGames).toFixed(1)}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">Intercepts</p>
                            <p className="text-lg font-semibold">
                              {(stats.totalIntercepts / stats.totalGames).toFixed(1)}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">Bad Passes</p>
                            <p className="text-lg font-semibold">
                              {(stats.totalBadPasses / stats.totalGames).toFixed(1)}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">Handling Errors</p>
                            <p className="text-lg font-semibold">
                              {(stats.totalHandlingErrors / stats.totalGames).toFixed(1)}
                            </p>
                          </div>
                        </>
                      ) : (
                        <p className="text-gray-500 col-span-5">No game data available</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

          <div className="grid gap-6">
          {/* Teams are now managed via the modal */}
        </div>

      {/* Season Manager Modal */}
      {isSeasonManagerOpen && player && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center overflow-y-auto">
          <div className="relative bg-white dark:bg-slate-900 p-6 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <button 
              className="absolute right-4 top-4 rounded-sm opacity-70 text-gray-600 hover:opacity-100" 
              onClick={() => setIsSeasonManagerOpen(false)}
            >
              ✕
              <span className="sr-only">Close</span>
            </button>

            <h2 className="text-xl font-semibold mb-2">Manage Seasons</h2>
            <p className="text-sm text-gray-500 mb-4">
              Select which seasons {player.displayName} is participating in.
            </p>
            <PlayerSeasonsManager 
              player={player}
              seasons={seasons}
              isOpen={isSeasonManagerOpen}
              onClose={() => setIsSeasonManagerOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Player Modal */}
      {isEditModalOpen && player && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center overflow-y-auto">
          <div className="relative bg-white dark:bg-slate-900 p-6 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <button 
              className="absolute right-4 top-4 rounded-sm opacity-70 text-gray-600 hover:opacity-100" 
              onClick={() => setIsEditModalOpen(false)}
            >
              ✕
              <span className="sr-only">Close</span>
            </button>

            <h2 className="text-xl font-semibold mb-2">Edit Player</h2>
            <p className="text-sm text-gray-500 mb-4">
              Make changes to {player.displayName}'s details below.
            </p>

            <PlayerForm 
              player={player}
              clubId={player.clubId || 54}
              onSuccess={() => setIsEditModalOpen(false)}
              onCancel={() => setIsEditModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Club Manager Modal */}
      {isClubManagerOpen && player && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center overflow-y-auto">
          <div className="relative bg-white dark:bg-slate-900 p-6 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <button 
              className="absolute right-4 top-4 rounded-sm opacity-70 text-gray-600 hover:opacity-100" 
              onClick={() => setIsClubManagerOpen(false)}
            >
              ✕
              <span className="sr-only">Close</span>
            </button>

            <h2 className="text-xl font-semibold mb-2">Manage Clubs</h2>
            <p className="text-sm text-gray-500 mb-4">
              Select which clubs {player.displayName} is associated with.
            </p>
            <PlayerClubsManager 
              player={player}
              isOpen={isClubManagerOpen}
              onClose={() => setIsClubManagerOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Team Manager Modal */}
      {isTeamManagerOpen && player && (
        <PlayerTeamsManager 
          player={player}
          isOpen={isTeamManagerOpen}
          onClose={() => setIsTeamManagerOpen(false)}
        />
      )}
    </>
  );
}