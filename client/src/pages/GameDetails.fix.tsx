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
      
      {/* Tab contents remain the same */}
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
