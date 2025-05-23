import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { TEAM_NAME } from '@/lib/settings';
import { StatItemBox } from '@/components/games/StatItemBox';
import { PositionStatsBox } from '@/components/games/PositionStatsBox';
import { PositionBox } from '@/components/games/PositionBox';
import { GamePositionStatsBox } from '@/components/games/GamePositionStatsBox';
import GameForm from '@/components/games/GameForm';
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
  ChevronLeft, Edit, BarChart3, ClipboardList, Activity, CalendarRange, ActivitySquare, Trash2
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { formatDate, cn } from '@/lib/utils';
import { GameStatus, Position, POSITIONS, allGameStatuses } from '@shared/schema';
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

// Function to get opponent name
const getOpponentName = (opponents: any[], opponentId: number | null) => {
  if (!opponentId) return 'BYE Round';
  const opponent = opponents.find(o => o.id === opponentId);
  return opponent ? opponent.teamName : 'Unknown Opponent';
};

export default function GameDetails() {
  const { id } = useParams();
  const gameId = parseInt(id);
  const [activeTab, setActiveTab] = useState('roster');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch game data
  const { 
    data: game,
    isLoading: isLoadingGame,
    refetch: refetchGame
  } = useQuery({
    queryKey: ['/api/games', gameId],
    queryFn: () => fetch(`/api/games/${gameId}`).then(res => res.json()),
    enabled: !isNaN(gameId)
  });
  
  // Fetch opponents list for form
  const { 
    data: opponents,
    isLoading: isLoadingOpponents
  } = useQuery({
    queryKey: ['/api/opponents'],
    queryFn: () => fetch('/api/opponents').then(res => res.json())
  });
  
  // Fetch players list for roster and stats
  const { 
    data: players,
    isLoading: isLoadingPlayers
  } = useQuery({
    queryKey: ['/api/players'],
    queryFn: () => fetch('/api/players').then(res => res.json())
  });
  
  // Fetch roster assignments for this game
  const { 
    data: roster,
    isLoading: isLoadingRoster,
    refetch: refetchRosters
  } = useQuery({
    queryKey: ['/api/games', gameId, 'rosters'],
    queryFn: () => fetch(`/api/games/${gameId}/rosters`).then(res => res.json()),
    enabled: !isNaN(gameId)
  });
  
  // Refresh the rosters when game is updated
  useEffect(() => {
    if (gameId) {
      refetchRosters();
    }
  }, [gameId, refetchRosters]);
  
  // Fetch game stats
  const { 
    data: gameStats,
    isLoading: isLoadingStats
  } = useQuery({
    queryKey: ['/api/games', gameId, 'stats'],
    queryFn: () => fetch(`/api/games/${gameId}/stats`).then(res => res.json()),
    enabled: !isNaN(gameId)
  });
  
  // Calculate quarter scores
  const quarterScores = useMemo(() => {
    if (!gameStats || !game) return [];
    return calculateQuarterScores(gameStats, game);
  }, [gameStats, game]);
  
  // Loading state
  if (isLoadingGame || isLoadingPlayers || isLoadingOpponents || isLoadingRoster) {
    return (
      <div className="py-10 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
        <p>Loading game details...</p>
      </div>
    );
  }
  
  if (!game) {
    return (
      <div className="py-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Game Not Found</h1>
        <p className="mb-6">The game you're looking for doesn't exist or has been removed.</p>
        <Button variant="outline" asChild>
          <Link to="/games">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Games
          </Link>
        </Button>
      </div>
    );
  }
  
  // Check if this is a forfeit game, which has special display and restrictions
  const isForfeitGame = game.status === 'forfeit-win' || game.status === 'forfeit-loss';
  const opponentName = getOpponentName(opponents || [], game.opponentId);

  return (
    <div className="container py-8 mx-auto">
      <Helmet>
        <title>Game Details | Netball Stats Tracker</title>
      </Helmet>
      
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gray-50 p-6 rounded-lg">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Button 
              variant="outline" 
              size="sm" 
              asChild
              className="border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              <Link to="/games">
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back to Games
              </Link>
            </Button>
          </div>
          
          <h1 className="text-2xl font-bold">
            {game.opponentId ? (
              <span>
                {TEAM_NAME} vs {opponentName}
              </span>
            ) : (
              <span>BYE Round</span>
            )}
          </h1>
        </div>
        
        <div className="flex flex-wrap gap-2 justify-end self-start mt-2 sm:mt-0">
            
            {/* Roster Button */}
            {!game.isBye && (
              <Button 
                variant="outline" 
                size="sm" 
                asChild
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-900"
              >
                <Link to={`/roster?game=${gameId}`}>
                  <CalendarRange className="mr-2 h-4 w-4" />
                  Manage Roster
                </Link>
              </Button>
            )}
            
            {/* Live Stats Button */}
            {!game.isBye && !game.completed && (
              <Button 
                variant="outline" 
                size="sm" 
                asChild 
                className="border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-900"
              >
                <Link to={`/game/${gameId}/livestats`}>
                  <ActivitySquare className="mr-2 h-4 w-4" />
                  Live Stats
                </Link>
              </Button>
            )}
            
            {/* Edit Game Button */}
            <Button 
              variant="outline" 
              size="sm"
              className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-900"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Game
            </Button>
            
            {/* Delete Game Button */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-900"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Game
                </Button>
              </AlertDialogTrigger>
              
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this {game.isBye ? "BYE round" : `game against ${game.opponentId ? opponents?.find(o => o.id === game.opponentId)?.teamName : 'unknown opponent'}`}? 
                    This will also delete all roster assignments and statistics for this game.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    className="bg-red-500 hover:bg-red-600"
                    onClick={async () => {
                      try {
                        await fetch(`/api/games/${gameId}`, {
                          method: 'DELETE',
                        });
                        
                        // Invalidate queries
                        queryClient.invalidateQueries({
                          queryKey: ['/api/games'],
                        });
                        
                        toast({
                          title: "Game deleted",
                          description: "Game has been deleted successfully",
                        });
                        
                        // Redirect to games list
                        window.location.href = '/games';
                      } catch (error) {
                        console.error("Error deleting game:", error);
                        toast({
                          title: "Error",
                          description: "Failed to delete game",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            {/* Edit Game Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="sm:max-w-[550px]">
                <DialogTitle>Edit Game Details</DialogTitle>
                {opponents && game && (
                  <GameForm
                    game={game}
                    opponents={opponents}
                    isSubmitting={false}
                    onSubmit={async (formData) => {
                      try {
                        const response = await fetch(`/api/games/${gameId}`, {
                          method: 'PATCH',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify(formData),
                        });
                        
                        if (!response.ok) {
                          throw new Error('Failed to update game');
                        }
                        
                        // Invalidate queries
                        queryClient.invalidateQueries({
                          queryKey: ['/api/games'],
                        });
                        queryClient.invalidateQueries({
                          queryKey: ['/api/games', gameId],
                        });
                        
                        // Refetch this game immediately
                        refetchGame();
                        
                        // Close dialog
                        setIsEditDialogOpen(false);
                        
                        toast({
                          title: "Game updated",
                          description: "Game details have been updated successfully",
                        });
                      } catch (error) {
                        console.error("Error updating game:", error);
                        toast({
                          title: "Error",
                          description: "Failed to update game details",
                          variant: "destructive",
                        });
                      }
                    }}
                  />
                )}
              </DialogContent>
            </Dialog>
        </div>
      </div>

      <div className="flex items-center mb-4">
        <div className="text-gray-500 font-medium">
          {formatDate(game.date)} {game.time && `at ${game.time}`}
          {game.round && <span className="ml-2">• Round {game.round}</span>}
        </div>
        <div className="ml-auto text-sm">
          {game.status && (
            <Badge 
              className={cn(
                "ml-auto",
                getGameStatusColor(game.status as GameStatus),
              )}
            >
              {game.status.replace('-', ' ')}
            </Badge>
          )}
        </div>
      </div>
      
      {/* Show quarter scores summary */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Quarter Scores</h2>
        <div className="overflow-hidden border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                  Quarter
                </th>
                {quarterScores.map(score => (
                  <th key={`q${score.quarter}`} scope="col" className="px-6 py-3 text-center text-xs font-medium text-blue-800 uppercase tracking-wider">
                    Q{score.quarter}
                  </th>
                ))}
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-blue-800 uppercase tracking-wider">
                  Final
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {TEAM_NAME}
                </td>
                {quarterScores.map(score => (
                  <td key={`team-q${score.quarter}`} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                    {score.teamScore}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-blue-600">
                  {quarterScores.reduce((sum, q) => sum + q.teamScore, 0)}
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Opponent
                </td>
                {quarterScores.map(score => (
                  <td key={`opp-q${score.quarter}`} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                    {score.opponentScore}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-blue-600">
                  {quarterScores.reduce((sum, q) => sum + q.opponentScore, 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="roster">
              <ClipboardList className="mr-2 h-4 w-4" />
              Court Positions
            </TabsTrigger>
            <TabsTrigger value="stats">
              <Activity className="mr-2 h-4 w-4" />
              Position Statistics
            </TabsTrigger>
            <TabsTrigger value="players">
              <BarChart3 className="mr-2 h-4 w-4" />
              Player Statistics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="roster" className="mt-6">
            {game.isBye ? (
              <div className="py-8 text-center">
                <p className="text-lg text-gray-500">This is a BYE round. No roster is needed.</p>
              </div>
            ) : roster && roster.length > 0 ? (
              <div className="flex justify-center">
                <div className="relative bg-green-100 rounded-md w-full max-w-2xl h-[500px] mb-8">
                  {/* Court outline */}
                  <div className="absolute inset-0 border-2 border-green-600 rounded-md">
                    {/* Center court line */}
                    <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-green-600"></div>
                    {/* Third lines */}
                    <div className="absolute top-1/3 left-0 right-0 h-[2px] bg-green-600"></div>
                    <div className="absolute bottom-1/3 left-0 right-0 h-[2px] bg-green-600"></div>
                  </div>
                  
                  {/* Render positions on court */}
                  {POSITIONS.map(position => {
                    const positionClass = {
                      'GS': 'top-12 left-1/2 transform -translate-x-1/2',
                      'GA': 'top-28 right-16',
                      'WD': 'top-1/2 right-14',
                      'C': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
                      'WA': 'bottom-1/2 left-14',
                      'GD': 'bottom-28 left-16',
                      'GK': 'bottom-12 left-1/2 transform -translate-x-1/2',
                    }[position];
                    
                    // Find player in this position for current quarter (default to 1)
                    const playerEntry = roster.find(
                      r => r.position === position && r.quarter === 1
                    );
                    
                    const playerName = playerEntry ? 
                      players?.find(p => p.id === playerEntry.playerId)?.displayName : null;
                    
                    const playerColor = playerEntry ?
                      players?.find(p => p.id === playerEntry.playerId)?.avatarColor : null;
                    
                    // Calculate background color based on position or player color
                    let bgColor = '#f0f9ff'; // default light blue
                    
                    if (playerColor) {
                      // If it's a tailwind class
                      if (playerColor.startsWith('bg-')) {
                        // Extract the color from the class for use in CSS
                        const colorParts = playerColor.split('-');
                        const colorName = colorParts[1];
                        const shade = colorParts[2] || '500';
                        
                        // Set a transparent version of the player's color
                        switch (colorName) {
                          case 'red': bgColor = '#FEE2E2'; break; // red-100
                          case 'blue': bgColor = '#DBEAFE'; break; // blue-100
                          case 'green': bgColor = '#DCFCE7'; break; // green-100
                          case 'purple': bgColor = '#F3E8FF'; break; // purple-100
                          case 'orange': bgColor = '#FFEDD5'; break; // orange-100
                          case 'yellow': bgColor = '#FEF9C3'; break; // yellow-100
                          case 'pink': bgColor = '#FCE7F3'; break; // pink-100
                          case 'indigo': bgColor = '#E0E7FF'; break; // indigo-100
                          case 'emerald': bgColor = '#D1FAE5'; break; // emerald-100
                          case 'teal': bgColor = '#CCFBF1'; break; // teal-100
                          default: bgColor = '#f0f9ff'; // Default light blue
                        }
                      } else {
                        // If it's a hex color, make a lighter version
                        bgColor = playerColor + '30'; // Add 30% opacity
                      }
                    }
                    
                    return (
                      <div key={position} className={`absolute ${positionClass}`}>
                        <div 
                          style={{ 
                            backgroundColor: bgColor,
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
                            border: playerName ? '3px solid white' : '2px solid red',
                            width: '5rem',
                            height: '5rem',
                            borderRadius: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            textAlign: 'center',
                            flexDirection: 'column',
                            fontWeight: 'bold',
                            padding: '0.3rem',
                            zIndex: playerName ? 20 : 10,
                            transform: 'translate(-50%, -50%)',
                          }}
                        >
                          <div className="text-xs">{position}</div>
                          {playerName && <div className="text-xs mt-1">{playerName}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-lg text-gray-500 mb-4">No roster has been set up for this game yet.</p>
                <Button asChild>
                  <Link to={`/roster?game=${gameId}`}>
                    <CalendarRange className="mr-2 h-4 w-4" />
                    Set Up Roster
                  </Link>
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="stats" className="mt-6">
            {game.isBye ? (
              <div className="py-8 text-center">
                <p className="text-lg text-gray-500">This is a BYE round. No statistics are tracked.</p>
              </div>
            ) : gameStats && gameStats.length > 0 ? (
              <div className="space-y-4">
                {POSITIONS.map(position => {
                  const positionStats = gameStats.filter(stat => stat.position === position);
                  const stats = {
                    goals: 0,
                    goalsAgainst: 0,
                    missedGoals: 0,
                    rebounds: 0,
                    intercepts: 0,
                    badPass: 0,
                    handlingError: 0,
                    pickUp: 0,
                    infringement: 0
                  };
                  
                  // Combine all quarters for this position
                  positionStats.forEach(stat => {
                    stats.goals += stat.goalsFor || 0;
                    stats.goalsAgainst += stat.goalsAgainst || 0;
                    stats.missedGoals += stat.missedGoals || 0;
                    stats.rebounds += stat.rebounds || 0;
                    stats.intercepts += stat.intercepts || 0;
                    stats.badPass += stat.badPass || 0;
                    stats.handlingError += stat.handlingError || 0;
                    stats.pickUp += stat.pickUp || 0;
                    stats.infringement += stat.infringement || 0;
                  });
                  
                  return (
                    <Card key={position} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <CardTitle>Position {position}</CardTitle>
                        <CardDescription>Statistics for all quarters</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                          {position === 'GS' || position === 'GA' ? (
                            <>
                              <StatItemBox label="Goals" value={stats.goals} />
                              <StatItemBox label="Missed Goals" value={stats.missedGoals} />
                              <StatItemBox label="Rebounds" value={stats.rebounds} />
                            </>
                          ) : position === 'GD' || position === 'GK' ? (
                            <>
                              <StatItemBox label="Goals Against" value={stats.goalsAgainst} />
                              <StatItemBox label="Rebounds" value={stats.rebounds} />
                              <StatItemBox label="Pick Ups" value={stats.pickUp} />
                            </>
                          ) : (
                            <>
                              <StatItemBox label="Pick Ups" value={stats.pickUp} />
                              <StatItemBox label="Rebounds" value={stats.rebounds} />
                              <StatItemBox label="Infringements" value={stats.infringement} />
                            </>
                          )}
                          <StatItemBox label="Intercepts" value={stats.intercepts} />
                          <StatItemBox label="Bad Pass" value={stats.badPass} />
                          <StatItemBox label="Handling Error" value={stats.handlingError} />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-lg text-gray-500 mb-4">No statistics have been recorded for this game yet.</p>
                {!game.completed && (
                  <Button asChild>
                    <Link to={`/game/${gameId}/livestats`}>
                      <ActivitySquare className="mr-2 h-4 w-4" />
                      Record Live Stats
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="players" className="mt-6">
            {game.isBye ? (
              <div className="py-8 text-center">
                <p className="text-lg text-gray-500">This is a BYE round. No player statistics are available.</p>
              </div>
            ) : roster && roster.length > 0 && gameStats && gameStats.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Group the players by their IDs first */}
                {(() => {
                  // Create a Set of unique player IDs
                  const playerIds = new Set();
                  roster.forEach(r => {
                    if (r.playerId) playerIds.add(r.playerId);
                  });
                
                  // For each player, get their positions and accumulate stats
                  return Array.from(playerIds).map(playerId => {
                    const playerPositions = {};
                    const playerName = players?.find(p => p.id === playerId)?.displayName || 'Unknown Player';
                    const playerColor = players?.find(p => p.id === playerId)?.avatarColor || 'bg-gray-400';
                    const playerData = { name: playerName, color: playerColor, stats: { total: {} } };
                    
                    // Find all positions this player played
                    roster.filter(r => r.playerId === playerId).forEach(r => {
                      if (!playerPositions[r.quarter]) playerPositions[r.quarter] = {};
                      playerPositions[r.quarter][r.position] = true;
                    });
                    
                    // For each quarter and position, find stats
                    Object.entries(playerPositions).forEach(([quarter, positions]) => {
                      if (!playerData.stats[quarter]) playerData.stats[quarter] = {};
                      
                      Object.keys(positions).forEach(position => {
                        // Find stats for this position in this quarter
                        const stat = gameStats.find(
                          s => s.position === position && s.quarter === parseInt(quarter)
                        );
                        
                        if (stat) {
                          playerData.stats[quarter][position] = {
                            goals: position === 'GS' || position === 'GA' ? stat.goalsFor : 0,
                            missedGoals: position === 'GS' || position === 'GA' ? stat.missedGoals : 0,
                            goalsAgainst: position === 'GD' || position === 'GK' ? stat.goalsAgainst : 0,
                            rebounds: stat.rebounds,
                            intercepts: stat.intercepts,
                            badPass: stat.badPass,
                            handlingError: stat.handlingError,
                            pickUp: stat.pickUp,
                            infringement: stat.infringement
                          };
                          
                          // Add to totals
                          if (!playerData.stats.total[position]) {
                            playerData.stats.total[position] = {
                              goals: 0,
                              missedGoals: 0,
                              goalsAgainst: 0,
                              rebounds: 0,
                              intercepts: 0,
                              badPass: 0,
                              handlingError: 0,
                              pickUp: 0,
                              infringement: 0
                            };
                          }
                          
                          Object.keys(playerData.stats[quarter][position]).forEach(key => {
                            playerData.stats.total[position][key] += playerData.stats[quarter][position][key] || 0;
                          });
                        }
                      });
                    });
                    
                    // Calculate combined totals across all positions
                    playerData.stats.combined = {
                      goals: 0,
                      missedGoals: 0,
                      goalsAgainst: 0,
                      rebounds: 0,
                      intercepts: 0,
                      badPass: 0,
                      handlingError: 0,
                      pickUp: 0,
                      infringement: 0
                    };
                    
                    Object.values(playerData.stats.total).forEach(posStats => {
                      Object.keys(posStats).forEach(key => {
                        playerData.stats.combined[key] += posStats[key] || 0;
                      });
                    });
                    
                    // Convert Tailwind class to CSS color for display
                    let bgColorClass = '';
                    let textColor = '';
                    
                    if (playerColor.startsWith('bg-')) {
                      bgColorClass = playerColor.replace('bg-', 'bg-') + '/10';
                      textColor = playerColor.replace('bg-', 'text-');
                    }
                    
                    return (
                      <Card key={playerId} className={`overflow-hidden ${bgColorClass}`}>
                        <CardHeader className="pb-2">
                          <CardTitle className={`${textColor}`}>{playerName}</CardTitle>
                          <CardDescription>Combined statistics</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4">
                            <StatItemBox label="Goals" value={playerData.stats.combined.goals} />
                            <StatItemBox label="Missed Goals" value={playerData.stats.combined.missedGoals} />
                            <StatItemBox label="Goals Against" value={playerData.stats.combined.goalsAgainst} />
                            <StatItemBox label="Rebounds" value={playerData.stats.combined.rebounds} />
                            <StatItemBox label="Intercepts" value={playerData.stats.combined.intercepts} />
                            <StatItemBox label="Bad Pass" value={playerData.stats.combined.badPass} />
                            <StatItemBox label="Handling Error" value={playerData.stats.combined.handlingError} />
                            <StatItemBox label="Pick Up" value={playerData.stats.combined.pickUp} />
                            <StatItemBox label="Infringement" value={playerData.stats.combined.infringement} />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  });
                })()}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-lg text-gray-500 mb-4">
                  {!roster || roster.length === 0 
                    ? "No roster has been set up for this game yet." 
                    : "No statistics have been recorded for this game yet."}
                </p>
                {!roster || roster.length === 0 ? (
                  <Button asChild>
                    <Link to={`/roster?game=${gameId}`}>
                      <CalendarRange className="mr-2 h-4 w-4" />
                      Set Up Roster
                    </Link>
                  </Button>
                ) : !game.completed && (
                  <Button asChild>
                    <Link to={`/game/${gameId}/livestats`}>
                      <ActivitySquare className="mr-2 h-4 w-4" />
                      Record Live Stats
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Calculate quarter by quarter scores
const calculateQuarterScores = (gameStats: any[], game: any) => {
  // Special handling for forfeit games - use consistent scoring for forfeit games
  if (game && (game.status === 'forfeit-win' || game.status === 'forfeit-loss')) {
    const isWin = game.status === 'forfeit-win';
    
    // For forfeit-loss: 5 goals in Q1 against GK and 5 in Q1 against GD
    // For forfeit-win: GS and GA score 5 goals each in Q1
    return [
      { quarter: 1, teamScore: isWin ? 10 : 0, opponentScore: isWin ? 0 : 10 },
      { quarter: 2, teamScore: 0, opponentScore: 0 },
      { quarter: 3, teamScore: 0, opponentScore: 0 },
      { quarter: 4, teamScore: 0, opponentScore: 0 }
    ];
  }
  
  // For non-forfeit games, calculate normally
  const quarters = [1, 2, 3, 4];
  
  return quarters.map(quarter => {
    const quarterStats = gameStats.filter(stat => stat.quarter === quarter);
    
    const teamScore = quarterStats.reduce((total, stat) => 
      total + (stat.goalsFor || 0), 0);
    
    const opponentScore = quarterStats.reduce((total, stat) => 
      total + (stat.goalsAgainst || 0), 0);
    
    return {
      quarter,
      teamScore,
      opponentScore
    };
  });
};
