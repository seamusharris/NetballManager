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
import { GameDetailsStatusButton } from '@/components/games/GameDetailsStatusButton';

// Function to get opponent name
const getOpponentName = (opponents: any[], opponentId: number | null) => {
  if (!opponentId) return 'BYE Round';
  const opponent = opponents.find(o => o.id === opponentId);
  return opponent ? opponent.teamName : 'Unknown Opponent';
};

// We now use the shared GameStatusButton component instead

// Using the imported StatItemBox from components

// Component to display player statistics from their positions played
const PlayerStatsByQuarter = ({ roster, players, gameStats }: { roster: any[], players: any[], gameStats: any[] }) => {
  const [activeQuarter, setActiveQuarter] = useState<number>(0); // 0 means all quarters
  
  // Calculate player statistics by combining all positions they played
  const playerStats = useMemo(() => {
    // Create a set of all unique player IDs in the roster
    const uniquePlayerIds = new Set<number>();
    
    // Create a mapping of player ID to positions they played in each quarter
    const playerPositions: Record<number, { playerId: number, positions: Record<number, string> }> = {};
    
    // Add all players from roster
    roster.forEach(entry => {
      if (!entry.playerId) return;
      
      uniquePlayerIds.add(entry.playerId);
      
      if (!playerPositions[entry.playerId]) {
        playerPositions[entry.playerId] = {
          playerId: entry.playerId,
          positions: {}
        };
      }
      
      playerPositions[entry.playerId].positions[entry.quarter] = entry.position;
    });
    
    // For each player in the game, calculate their statistics
    const result: Record<number, any> = {};
    
    // Make sure all players in the roster are included
    players.forEach(player => {
      if (!uniquePlayerIds.has(player.id)) return;
      
      // Initialize stats for every player in the roster
      result[player.id] = {
        playerId: player.id,
        name: getPlayerName(players, player.id),
        color: getPlayerColor(players, player.id),
        quarterStats: {} as Record<number, any>,
        totalStats: {
          goals: 0,
          missedGoals: 0,
          goalsAgainst: 0,
          rebounds: 0,
          intercepts: 0,
          badPass: 0,
          handlingError: 0,
          pickUp: 0,
          infringement: 0
        }
      };
    });
    
    // Then calculate stats based on positions played
    Object.values(playerPositions).forEach(player => {
      // Get the player stats entry we created
      const playerStat = result[player.playerId];
      
      // Get stats for each quarter the player played in
      Object.entries(player.positions).forEach(([quarter, position]) => {
        const quarterNum = parseInt(quarter);
        // Find stat for this position and quarter
        const positionStat = gameStats.find(
          stat => stat.position === position && stat.quarter === quarterNum
        );
        
        if (positionStat) {
          // Initialize quarter stats if not already there
          if (!playerStat.quarterStats[quarterNum]) {
            playerStat.quarterStats[quarterNum] = {
              position,
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
          
          // Add stats from this position in this quarter
          const stats = playerStat.quarterStats[quarterNum];
          
          // Increment stats based on what was recorded for this position
          if (position === 'GS' || position === 'GA') {
            stats.goals += positionStat.goalsFor || 0;
            stats.missedGoals += positionStat.missedGoals || 0;
          }
          
          if (position === 'GD' || position === 'GK') {
            stats.goalsAgainst += positionStat.goalsAgainst || 0;
          }
          
          // Common stats for all positions
          stats.rebounds += positionStat.rebounds || 0;
          stats.intercepts += positionStat.intercepts || 0;
          stats.badPass += positionStat.badPass || 0;
          stats.handlingError += positionStat.handlingError || 0;
          stats.pickUp += positionStat.pickUp || 0;
          stats.infringement += positionStat.infringement || 0;
          
          // Add to total stats
          playerStat.totalStats.goals += position === 'GS' || position === 'GA' ? (positionStat.goalsFor || 0) : 0;
          playerStat.totalStats.missedGoals += position === 'GS' || position === 'GA' ? (positionStat.missedGoals || 0) : 0;
          playerStat.totalStats.goalsAgainst += position === 'GD' || position === 'GK' ? (positionStat.goalsAgainst || 0) : 0;
          playerStat.totalStats.rebounds += positionStat.rebounds || 0;
          playerStat.totalStats.intercepts += positionStat.intercepts || 0;
          playerStat.totalStats.badPass += positionStat.badPass || 0;
          playerStat.totalStats.handlingError += positionStat.handlingError || 0;
          playerStat.totalStats.pickUp += positionStat.pickUp || 0;
          playerStat.totalStats.infringement += positionStat.infringement || 0;
        }
      });
      
      // Add player to results
      result[player.playerId] = playerStat;
    });
    
    return Object.values(result);
  }, [roster, players, gameStats]);
  
  // Helper function to get player name
  function getPlayerName(players: any[], playerId: number) {
    if (!players || !playerId) return null;
    const player = players.find(p => p.id === playerId);
    return player ? (player.displayName || `${player.firstName} ${player.lastName}`) : null;
  }
  
  // Helper function to get player color
  function getPlayerColor(players: any[], playerId: number) {
    if (!players || !playerId) return '#cccccc';
    const player = players.find(p => p.id === playerId);
    
    // First, check if we need to use a default color
    if (!player || !player.avatarColor || player.avatarColor === '#FFFFFF' || player.avatarColor === '#ffffff') {
      // Use a very obvious, distinctive color based on player ID for maximum visibility
      const defaultColors = [
        '#FF5733', '#33FF57', '#3357FF', '#F033FF', '#FF33F0', 
        '#33FFF0', '#F0FF33', '#8C33FF', '#FF8C33', '#33FF8C'
      ];
      return defaultColors[playerId % defaultColors.length];
    }
    
    // Check if the avatarColor is a Tailwind class (starts with 'bg-')
    if (player.avatarColor.startsWith('bg-')) {
      return convertTailwindToHex(player.avatarColor);
    }
    
    // If it's already a hex color, return it
    return player.avatarColor;
  }
  
  // Convert Tailwind color classes to hex color values
  function convertTailwindToHex(tailwindClass: string) {
    const colorMap = {
      'bg-red-500': '#ef4444',
      'bg-orange-500': '#f97316',
      'bg-yellow-600': '#ca8a04',
      'bg-green-500': '#22c55e',
      'bg-emerald-600': '#059669',
      'bg-teal-600': '#0d9488',
      'bg-blue-600': '#2563eb',
      'bg-indigo-600': '#4f46e5',
      'bg-purple-600': '#9333ea',
      'bg-pink-600': '#db2777',
      'bg-pink-500': '#ec4899',
      'bg-sky-600': '#0284c7',
      'bg-cyan-600': '#0891b2',
      'bg-lime-600': '#65a30d',
      'bg-amber-600': '#d97706',
      'bg-violet-600': '#7c3aed',
      'bg-fuchsia-600': '#c026d3',
      'bg-rose-600': '#e11d48',
    };
    
    return colorMap[tailwindClass] || '#6366f1'; // default to indigo-500 if not found
  }
  
  // Render a quarter tab/button
  const renderQuarterButton = (quarter: number) => (
    <Button 
      key={quarter} 
      variant={activeQuarter === quarter ? "default" : "outline"} 
      size="sm"
      onClick={() => setActiveQuarter(quarter)}
      className="min-w-[60px]"
    >
      {quarter === 0 ? "All" : `Q${quarter}`}
    </Button>
  );
  
  // Render a player's statistics box
  const renderPlayerStatsBox = (player: any) => {
    // For 'All' quarters, use totalStats
    // For specific quarters, use quarterStats or create empty stats if not available
    let relevantStats;
    
    if (activeQuarter === 0) {
      relevantStats = player.totalStats;
    } else {
      // If no stats for this quarter, create empty stats object with zeros
      if (!player.quarterStats[activeQuarter]) {
        // Find position from roster
        const rosterEntry = roster.find(r => 
          r.playerId === player.playerId && r.quarter === activeQuarter
        );
        
        relevantStats = {
          position: rosterEntry?.position || 'N/A',
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
      } else {
        relevantStats = player.quarterStats[activeQuarter];
      }
    }
    
    // These stats are displayed for all players regardless of position
    return (
      <div 
        key={player.playerId}
        className="p-3 border rounded-md shadow-sm mb-4"
        style={{ 
          backgroundColor: `${player.color}10`,
          borderColor: player.color
        }}
      >
        <div className="flex justify-between items-center mb-3">
          <div 
            className="font-semibold text-lg"
            style={{ color: player.color }}
          >
            {player.name}
          </div>
          {activeQuarter > 0 && (
            <div className="text-sm bg-gray-100 px-2 py-1 rounded">
              {relevantStats.position || "N/A"}
            </div>
          )}
        </div>
        
        <div className="mt-1 bg-gray-50 p-3 rounded-md border border-gray-100">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              {/* Left column stats - shown for all players */}
              <StatItemBox label="Goals" value={relevantStats.goals || 0} />
              <StatItemBox label="Missed Goals" value={relevantStats.missedGoals || 0} />
              <StatItemBox label="Goals Against" value={relevantStats.goalsAgainst || 0} />
              <StatItemBox label="Rebounds" value={relevantStats.rebounds || 0} />
              <StatItemBox label="Intercepts" value={relevantStats.intercepts || 0} />
            </div>
            <div className="space-y-2">
              {/* Right column stats - shown for all players */}
              <StatItemBox label="Bad Pass" value={relevantStats.badPass || 0} />
              <StatItemBox label="Handling Errors" value={relevantStats.handlingError || 0} />
              <StatItemBox label="Pick Ups" value={relevantStats.pickUp || 0} />
              <StatItemBox label="Infringements" value={relevantStats.infringement || 0} />
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div>
      <div className="mb-4 flex justify-center items-center">
        <div className="flex gap-2">
          {[0, 1, 2, 3, 4].map(q => renderQuarterButton(q))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {playerStats
          .sort((a, b) => {
            // Sort players alphabetically by display name
            if (!a.name) return 1;
            if (!b.name) return -1;
            return a.name.localeCompare(b.name);
          })
          .map(player => renderPlayerStatsBox(player))
        }
      </div>
    </div>
  );
};

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

// Court position roster component
const CourtPositionRoster = ({ roster, players, gameStats, quarter: initialQuarter = 1 }) => {
  const [quarter, setQuarter] = useState(initialQuarter);
  
  // Group roster by quarter and position
  const rosterByQuarter = useMemo(() => {
    return roster.reduce((acc, entry) => {
      if (!acc[entry.quarter]) acc[entry.quarter] = {};
      acc[entry.quarter][entry.position] = entry;
      return acc;
    }, {});
  }, [roster]);
  
  // Helper to get position coordinates on court diagram
  const getPositionCoordinates = (position: Position) => {
    const positionMap = {
      'GS': 'top-12 left-1/2 transform -translate-x-1/2',
      'GA': 'top-28 right-16',
      'WD': 'top-1/2 right-14', 
      'C': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
      'WA': 'bottom-1/2 left-14', 
      'GD': 'bottom-28 left-16',
      'GK': 'bottom-12 left-1/2 transform -translate-x-1/2',
    };
    
    return positionMap[position] || '';
  };

  // Helper to get player display name
  const getPlayerName = (playerId) => {
    if (!players || !playerId) return null;
    const player = players.find(p => p.id === playerId);
    return player ? (player.displayName || `${player.firstName} ${player.lastName}`) : null;
  };
  
  // Render a quarter tab
  const renderQuarterTab = (q: number) => (
    <Button 
      key={q}
      variant={quarter === q ? "default" : "outline"}
      size="sm"
      onClick={() => setQuarter(q)}
      className="min-w-[60px]"
    >
      Q{q}
    </Button>
  );
  
  return (
    <div>
      <div className="mb-4 flex justify-center">
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map(q => renderQuarterTab(q))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Court diagram - position layout */}
        <div className="relative w-full h-[450px] bg-blue-50 rounded-lg overflow-hidden border border-blue-200">
          {/* Center line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-blue-300 transform -translate-y-1/2"></div>
          
          {/* Goal third lines */}
          <div className="absolute top-1/3 left-0 right-0 h-0.5 bg-blue-300 transform -translate-y-1/2"></div>
          <div className="absolute top-2/3 left-0 right-0 h-0.5 bg-blue-300 transform -translate-y-1/2"></div>
          
          {/* Position boxes */}
          {POSITIONS.map(position => {
            const entry = rosterByQuarter[quarter]?.[position];
            const stats = gameStats.find(s => s.position === position && s.quarter === quarter);
            
            return (
              <div 
                key={position}
                className={`absolute ${getPositionCoordinates(position)}`}
              >
                <PositionBox
                  position={position}
                  playerId={entry?.playerId}
                  playerName={entry?.playerId ? getPlayerName(entry.playerId) : null}
                  players={players}
                />
              </div>
            );
          })}
        </div>
        
        {/* Quarter statistics */}
        <div>
          <div className="grid grid-cols-1 gap-4">
            {POSITIONS.map(position => {
              const stats = gameStats.find(s => s.position === position && s.quarter === quarter);
              const entry = rosterByQuarter[quarter]?.[position];
              
              return (
                <GamePositionStatsBox
                  key={position}
                  position={position}
                  stats={stats}
                  playerName={entry?.playerId ? getPlayerName(entry.playerId) : null}
                  players={players}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function GameDetails() {
  const { id } = useParams();
  const gameId = parseInt(id as string);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Get game details
  const { 
    data: game, 
    isLoading: isLoadingGame,
    error: gameError
  } = useQuery({ 
    queryKey: ['/api/games', gameId],
    queryFn: () => fetch(`/api/games/${gameId}`).then(res => res.json()),
    enabled: !!gameId && !isNaN(gameId)
  });
  
  // Get roster for this game
  const {
    data: roster,
    isLoading: isLoadingRoster,
    error: rosterError
  } = useQuery({
    queryKey: ['/api/games', gameId, 'roster'],
    queryFn: () => fetch(`/api/games/${gameId}/roster`).then(res => res.json()),
    enabled: !!gameId && !isNaN(gameId)
  });
  
  // Get stats for this game
  const {
    data: gameStats,
    isLoading: isLoadingStats,
    error: statsError
  } = useQuery({
    queryKey: ['/api/games', gameId, 'stats'],
    queryFn: () => fetch(`/api/games/${gameId}/stats`).then(res => res.json()),
    enabled: !!gameId && !isNaN(gameId)
  });
  
  // Get all players (to map IDs to names)
  const {
    data: players,
    isLoading: isLoadingPlayers,
    error: playersError
  } = useQuery({
    queryKey: ['/api/players'],
    queryFn: () => fetch('/api/players').then(res => res.json()),
  });
  
  // Get all opponents (to map IDs to team names)
  const {
    data: opponents,
    isLoading: isLoadingOpponents,
    error: opponentsError
  } = useQuery({
    queryKey: ['/api/opponents'],
    queryFn: () => fetch('/api/opponents').then(res => res.json()),
  });
  
  // Calculate quarter-by-quarter scores
  const quarterScores = useMemo(() => {
    if (gameStats && game) {
      return calculateQuarterScores(gameStats, game);
    }
    return [];
  }, [gameStats, game]);

  // Calculate game scores
  const { teamScore, opponentScore } = useMemo(() => {
    return calculateGameScores(gameStats || [], game);
  }, [gameStats, game]);
  
  // Handle loading state
  if (isLoadingGame || isLoadingRoster || isLoadingStats || isLoadingPlayers || isLoadingOpponents) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
        <span className="ml-3">Loading game details...</span>
      </div>
    );
  }
  
  // Handle errors
  if (gameError || rosterError || statsError || playersError || opponentsError) {
    return <div>Error loading game details</div>;
  }
  
  // Handle game not found
  if (!game) {
    return <div>Game not found</div>;
  }
  
  const isForfeitGame = game.status === 'forfeit-win' || game.status === 'forfeit-loss';
  const opponentName = getOpponentName(opponents || [], game.opponentId);

  return (
    <div className="container py-8 mx-auto">
      <Helmet>
        <title>Game Details | Netball Stats Tracker</title>
      </Helmet>
      
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gray-50 p-6 rounded-lg">
        <div className="w-full">
          <div className="flex justify-between items-center gap-3 mb-1 w-full">
            <Button 
              variant="outline" 
              size="sm" 
              asChild
              className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
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
          
          <div className="flex flex-wrap justify-between gap-2 mt-4 mb-4">
            {/* Game Status Button - stays on left */}
            <div>
              <GameDetailsStatusButton 
                game={game}
                onStatusChanged={(newStatus) => {
                  queryClient.invalidateQueries({
                    queryKey: ['/api/games', gameId],
                  });
                  queryClient.invalidateQueries({
                    queryKey: ['/api/games'],
                  });
                  toast({
                    title: "Game status updated",
                    description: `Game status changed to ${newStatus}`,
                  });
                }}
              />
            </div>
            
            {/* Action buttons container - right aligned */}
            <div className="flex flex-wrap gap-2">
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
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 my-6">
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium">Date</CardTitle>
              </CardHeader>
              <CardContent className="py-0">
                <p className="text-lg font-semibold">{formatDate(new Date(game.date))}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium">Round</CardTitle>
              </CardHeader>
              <CardContent className="py-0">
                <p className="text-lg font-semibold">{game.round || 'N/A'}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium">Location</CardTitle>
              </CardHeader>
              <CardContent className="py-0">
                <p className="text-lg font-semibold">{game.location || 'N/A'}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium">Score</CardTitle>
              </CardHeader>
              <CardContent className="py-0">
                <p className="text-lg font-semibold">
                  {isForfeitGame ? (
                    <span>
                      {game.status === 'forfeit-win' ? 'Win by forfeit' : 'Loss by forfeit'}
                    </span>
                  ) : (
                    `${teamScore} - ${opponentScore}`
                  )}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <div className="px-1">
        <Tabs defaultValue="quarter-stats" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="quarter-stats">
              <BarChart3 className="mr-2 h-4 w-4" />
              Quarter Stats
            </TabsTrigger>
            <TabsTrigger value="positions">
              <ClipboardList className="mr-2 h-4 w-4" />
              {game.isBye ? "BYE Round" : "Position Analysis"}
            </TabsTrigger>
            <TabsTrigger value="player-stats">
              <Activity className="mr-2 h-4 w-4" />
              Player Stats
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="quarter-stats">
            {game.isBye ? (
              <div className="text-center p-8 bg-gray-50 rounded-md">
                <p className="text-lg mb-4">This is a BYE round.</p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">Quarter Scores</h2>
                  
                  <div className="grid grid-cols-4 gap-4">
                    {quarterScores.map(score => (
                      <Card key={score.quarter}>
                        <CardHeader className="py-2 px-4 bg-blue-50">
                          <CardTitle className="text-sm text-center">Quarter {score.quarter}</CardTitle>
                        </CardHeader>
                        <CardContent className="py-3 px-4">
                          <div className="flex justify-between items-center">
                            <div className="text-center">
                              <p className="text-xs text-gray-500 mb-1">{TEAM_NAME}</p>
                              <p className="text-2xl font-bold">{score.teamScore}</p>
                            </div>
                            
                            <div className="text-2xl font-light text-gray-300">-</div>
                            
                            <div className="text-center">
                              <p className="text-xs text-gray-500 mb-1">{opponentName}</p>
                              <p className="text-2xl font-bold">{score.opponentScore}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                
                <div className="mb-6">
                  <Card>
                    <CardHeader className="py-4 bg-blue-50">
                      <div className="flex justify-between items-center">
                        <CardTitle>Final Score</CardTitle>
                        {game.completed && (
                          <Badge className={cn(
                            "ml-auto",
                            teamScore > opponentScore ? "bg-green-500" : 
                            teamScore < opponentScore ? "bg-red-500" : "bg-amber-500"
                          )}>
                            {teamScore > opponentScore ? "WIN" : 
                             teamScore < opponentScore ? "LOSS" : "DRAW"}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="py-6">
                      <div className="flex justify-center items-center text-center gap-x-12">
                        <div>
                          <p className="text-sm text-gray-500 mb-2">{TEAM_NAME}</p>
                          <p className="text-5xl font-bold">{teamScore}</p>
                        </div>
                        
                        <div className="text-3xl font-light text-gray-300">-</div>
                        
                        <div>
                          <p className="text-sm text-gray-500 mb-2">{opponentName}</p>
                          <p className="text-5xl font-bold">{opponentScore}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="positions">
            {game.isBye ? (
              <div className="text-center p-8 bg-gray-50 rounded-md">
                <p className="text-lg mb-4">This is a BYE round. No positions or statistics are tracked.</p>
              </div>
            ) : roster && roster.length > 0 && gameStats && gameStats.length > 0 ? (
              <CourtPositionRoster 
                roster={roster} 
                players={players || []} 
                gameStats={gameStats} 
              />
            ) : (
              <div className="text-center p-8 bg-gray-50 rounded-md">
                <p className="text-lg mb-4">
                  {!roster || roster.length === 0 
                    ? "There are no positions assigned for this game yet." 
                    : "There are no statistics recorded for this game yet."}
                </p>
                <Button asChild>
                  <Link to={!roster || roster.length === 0 
                    ? `/roster?game=${gameId}` 
                    : `/game/${gameId}/livestats`}>
                    <Edit className="mr-2 h-4 w-4" />
                    {!roster || roster.length === 0 
                      ? "Set Up Roster" 
                      : "Record Statistics"}
                  </Link>
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="player-stats">
            {game.isBye ? (
              <div className="text-center p-8 bg-gray-50 rounded-md">
                <p className="text-lg mb-4">This is a BYE round. No player statistics are tracked.</p>
              </div>
            ) : roster && roster.length > 0 && gameStats && gameStats.length > 0 ? (
              <PlayerStatsByQuarter 
                roster={roster} 
                players={players || []} 
                gameStats={gameStats} 
              />
            ) : (
              <div className="text-center p-8 bg-gray-50 rounded-md">
                <p className="text-lg mb-4">
                  {!roster || roster.length === 0 
                    ? "There are no positions assigned for this game yet." 
                    : "There are no statistics recorded for this game yet."}
                </p>
                <Button asChild>
                  <Link to={!roster || roster.length === 0 
                    ? `/roster?game=${gameId}` 
                    : `/game/${gameId}/livestats`}>
                    <Edit className="mr-2 h-4 w-4" />
                    {!roster || roster.length === 0 
                      ? "Set Up Roster" 
                      : "Record Statistics"}
                  </Link>
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Edit Game Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Game</DialogTitle>
            <DialogDescription>
              Update game details. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <GameForm 
              initialValues={game}
              onSubmit={async (values) => {
                try {
                  await fetch(`/api/games/${gameId}`, {
                    method: 'PATCH',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(values),
                  });
                  
                  // Invalidate queries
                  queryClient.invalidateQueries({
                    queryKey: ['/api/games', gameId],
                  });
                  queryClient.invalidateQueries({
                    queryKey: ['/api/games'],
                  });
                  
                  setIsEditDialogOpen(false);
                  
                  toast({
                    title: "Game updated",
                    description: "Game details have been updated successfully",
                  });
                } catch (error) {
                  console.error("Error updating game:", error);
                  toast({
                    title: "Error",
                    description: "Failed to update game",
                    variant: "destructive",
                  });
                }
              }}
              opponents={opponents || []}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}