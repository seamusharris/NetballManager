import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { TEAM_NAME } from '@/lib/settings';
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
  ChevronLeft, Edit, BarChart3, ClipboardList, Activity,
  Shield as ShieldIcon, Target as ScoreIcon, 
  HandMetal as HandIcon, ArrowDown as ArrowDownIcon 
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { formatDate, cn } from '@/lib/utils';
import { GameStatus, Position, POSITIONS, allGameStatuses } from '@shared/schema';
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
const CourtPositionRoster = ({ roster, players, quarter: initialQuarter = 1 }) => {
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
      'WD': 'top-1/2 right-14', // Swapped WD and WA
      'C': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
      'WA': 'bottom-1/2 left-14', // Swapped WA and WD
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
  
  // Convert Tailwind color classes to hex color values
  const convertTailwindToHex = (tailwindClass) => {
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
    
    // Log missing colors to help with debugging
    if (!colorMap[tailwindClass] && tailwindClass?.startsWith('bg-')) {
      console.log(`Missing color mapping for ${tailwindClass}, using default color`);
    }
    
    return colorMap[tailwindClass] || '#6366f1'; // default to indigo-500 if not found
  };
  
  // Function to get player color, converting from Tailwind class names to hex
  const getPlayerColor = (playerId) => {
    if (!players || !playerId) return '#cccccc';
    const player = players.find(p => p.id === playerId);
    
    // First, check if we need to use a default color
    if (!player || !player.avatarColor || player.avatarColor === '#FFFFFF' || player.avatarColor === '#ffffff') {
      // Use a very obvious, distinctive color based on player ID for maximum visibility
      const defaultColors = [
        '#FF5733', '#33FF57', '#3357FF', '#F033FF', '#FF33F0', 
        '#33FFF0', '#F0FF33', '#8C33FF', '#FF8C33', '#33FF8C'
      ];
      const color = defaultColors[playerId % defaultColors.length];
      console.log(`Using default color for player ${playerId}: ${color}`);
      return color;
    }
    
    // Check if the avatarColor is a Tailwind class (starts with 'bg-')
    if (player.avatarColor.startsWith('bg-')) {
      const hexColor = convertTailwindToHex(player.avatarColor);
      console.log(`Converting ${player.avatarColor} to hex: ${hexColor} for player ${playerId}`);
      return hexColor;
    }
    
    // If it's already a hex color, return it
    console.log(`Using player ${playerId} avatar color: ${player.avatarColor}`);
    return player.avatarColor;
  };
  
  // Get player performance stats for display from the actual game statistics
  const getPlayerPerformanceStats = (position) => {
    const entry = rosterByQuarter[quarter]?.[position];
    if (!entry || !entry.playerId) return null;
    
    const playerName = getPlayerName(entry.playerId);
    if (!playerName) return null;
    
    // Find the statistics for this position in this quarter
    // Since we don't have access to gameStats here, return basic stats with the player info
    return {
      playerId: entry.playerId,
      name: playerName,
      stats: {
        goals: 0,
        intercepts: 0,
        rebounds: 0,
        assists: 0,
      }
    };
  };
  
  return (
    <div className="mt-4">
      <div className="mb-4 flex justify-center items-center">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(q => (
            <Button 
              key={q} 
              variant={q === quarter ? "default" : "outline"} 
              size="sm"
              onClick={() => setQuarter(q)}
            >
              Q{q}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Two-column layout with equal width columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto px-4">
        {/* Left column - Court diagram (half width) */}
        <div className="flex flex-col">
          <div className="relative w-full mx-auto aspect-[2/3] bg-green-100 rounded-lg border border-green-300 shadow-md">
            {/* Court markings - three equal sections */}
            <div className="absolute inset-0 flex flex-col">
              <div className="h-1/3 border-b border-white"></div>
              <div className="h-1/3 border-b border-white"></div>
              <div className="h-1/3"></div>
            </div>

            {/* Position markers */}
            {POSITIONS.map(position => {
              const entry = rosterByQuarter[quarter]?.[position];
              const playerName = getPlayerName(entry?.playerId);
              const playerColor = getPlayerColor(entry?.playerId);
              
              // Use the player's avatar color for the background
              const bgColor = playerName ? playerColor : 'white';
              
              // Use white text for player positions, red for unassigned
              const textColor = playerName ? 'white' : '#ef4444'; // Red color for unassigned
              
              return (
                <div key={position} className={`absolute ${getPositionCoordinates(position)}`}>
                  <div 
                    style={{ 
                      backgroundColor: bgColor,
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
                      border: playerName ? '3px solid white' : '2px solid red',
                      width: '5rem',
                      height: '5rem',
                      borderRadius: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '0.25rem'
                    }}
                  >
                    <div className="font-bold text-center text-base md:text-lg" style={{ color: textColor }}>{position}</div>
                    {playerName && (
                      <div className="text-xs md:text-sm text-center font-medium leading-tight mx-1" style={{ color: textColor }}>{playerName}</div>
                    )}
                    {!playerName && (
                      <div className="text-xs text-red-500 text-center">Unassigned</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Right column - Roster positions with stats (half width) */}
        <div>
          <div className="flex flex-col space-y-0 justify-between h-full">
            {/* Top third - Attack positions (GS, GA) */}
            <div className="space-y-2 mb-2" style={{ height: '33%' }}>
              {POSITIONS.slice(0, 2).map(position => {
                const entry = rosterByQuarter[quarter]?.[position];
                const playerName = getPlayerName(entry?.playerId);
                const playerColor = getPlayerColor(entry?.playerId);
                const playerStats = getPlayerPerformanceStats(position);
                
                return (
                  <div 
                    key={position} 
                    className="p-2 border rounded-md shadow-sm flex items-center gap-2"
                    style={{ 
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                    }}
                  >
                    {/* Position circle - matching court style */}
                    <div 
                      className="h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ 
                        backgroundColor: playerName ? playerColor : '#cbd5e1',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                      }}
                    >
                      {position}
                    </div>
                    
                    <div className="flex-1">
                      <div 
                        className={`${playerName ? 'text-gray-900 font-medium' : 'text-red-500 italic'} text-xs`}
                      >
                        {playerName || 'Unassigned'}
                      </div>
                      
                      {playerName && playerStats && (
                        <div className="grid grid-cols-2 gap-1 text-xs mt-1">
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">Goals:</span>
                            <span className="font-medium">{playerStats.stats.goals}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">Int:</span>
                            <span className="font-medium">{playerStats.stats.intercepts}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Middle third positions (WA, C, WD) */}
            <div className="space-y-2 my-2" style={{ height: '33%' }}>
              {POSITIONS.slice(2, 5).map(position => {
                const entry = rosterByQuarter[quarter]?.[position];
                const playerName = getPlayerName(entry?.playerId);
                const playerColor = getPlayerColor(entry?.playerId);
                const playerStats = getPlayerPerformanceStats(position);
                
                return (
                  <div 
                    key={position} 
                    className="p-2 border rounded-md shadow-sm flex items-center gap-2"
                    style={{ 
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                    }}
                  >
                    {/* Position circle - matching court style */}
                    <div 
                      className="h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ 
                        backgroundColor: playerName ? playerColor : '#cbd5e1',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                      }}
                    >
                      {position}
                    </div>
                    
                    <div className="flex-1">
                      <div 
                        className={`${playerName ? 'text-gray-900 font-medium' : 'text-red-500 italic'} text-xs`}
                      >
                        {playerName || 'Unassigned'}
                      </div>
                      
                      {playerName && playerStats && (
                        <div className="grid grid-cols-2 gap-1 text-xs mt-1">
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">Rebounds:</span>
                            <span className="font-medium">{playerStats.stats.rebounds}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">Int:</span>
                            <span className="font-medium">{playerStats.stats.intercepts}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Bottom third - Defense positions (GD, GK) */}
            <div className="space-y-2 mt-2" style={{ height: '33%' }}>
              {POSITIONS.slice(5).map(position => {
                const entry = rosterByQuarter[quarter]?.[position];
                const playerName = getPlayerName(entry?.playerId);
                const playerColor = getPlayerColor(entry?.playerId);
                const playerStats = getPlayerPerformanceStats(position);
                
                return (
                  <div 
                    key={position} 
                    className="p-2 border rounded-md shadow-sm flex items-center gap-2"
                    style={{ 
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                    }}
                  >
                    {/* Position circle - matching court style */}
                    <div 
                      className="h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ 
                        backgroundColor: playerName ? playerColor : '#cbd5e1',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                      }}
                    >
                      {position}
                    </div>
                    
                    <div className="flex-1">
                      <div 
                        className={`${playerName ? 'text-gray-900 font-medium' : 'text-red-500 italic'} text-xs`}
                      >
                        {playerName || 'Unassigned'}
                      </div>
                      
                      {playerName && playerStats && (
                        <div className="grid grid-cols-2 gap-1 text-xs mt-1">
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">Against:</span>
                            <span className="font-medium">{playerStats.stats.goals}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">Int:</span>
                            <span className="font-medium">{playerStats.stats.intercepts}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// This component handles fetching the game stats for the court view
// It's simpler than the full view, but only shows the basic statistics
const StatsView = ({ gameId, quarter: initialQuarter = 1 }) => {
  const [quarter, setQuarter] = useState(initialQuarter);
  
  // Fetch roster and stats for this game
  const { data: roster = [] } = useQuery({
    queryKey: [`/api/games/${gameId}/rosters`]
  });
  
  const { data: players = [] } = useQuery({
    queryKey: ['/api/players']
  });
  
  const { data: gameStats = [] } = useQuery({
    queryKey: [`/api/games/${gameId}/stats`]
  });
  
  // Create a map of position stats by quarter
  const statsByPositionAndQuarter = useMemo(() => {
    return gameStats.reduce((acc, stat) => {
      if (!acc[stat.quarter]) acc[stat.quarter] = {};
      acc[stat.quarter][stat.position] = stat;
      return acc;
    }, {});
  }, [gameStats]);

  // Get the complete list of all stats for a position
  const getPositionStatsByQuarter = (position, quarter) => {
    return statsByPositionAndQuarter[quarter]?.[position] || null;
  };
  
  // Update the player performance stats getter
  const getPlayerPerformanceStats = (position) => {
    const stats = getPositionStatsByQuarter(position, quarter);
    if (!stats) return null;
    
    return {
      goalsFor: stats.goalsFor || 0,
      goalsAgainst: stats.goalsAgainst || 0,
      missedGoals: stats.missedGoals || 0,
      rebounds: stats.rebounds || 0,
      intercepts: stats.intercepts || 0,
      badPass: stats.badPass || 0,
      handlingError: stats.handlingError || 0,
      pickUp: stats.pickUp || 0,
      infringement: stats.infringement || 0,
      rating: stats.rating
    };
  };
  
  return (
    <CourtPositionRoster 
      roster={roster} 
      players={players}
      quarter={quarter}
      gameStats={gameStats}
    />
  );
};

const GameDetails = () => {
  const params = useParams<{ id: string }>();
  const gameId = parseInt(params.id);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Set page title with the game info once loaded
  useEffect(() => {
    if (game && opponents.length > 0) {
      const opponentName = getOpponentName(opponents, game.opponentId);
      document.title = `${TEAM_NAME} vs ${opponentName} | Game Details`;
    }
  }, [game, opponents]);
  
  // Game data
  const { data: game } = useQuery({
    queryKey: [`/api/games/${gameId}`]
  });
  
  // Get all the game stats
  const { data: gameStats = [] } = useQuery({
    queryKey: [`/api/games/${gameId}/stats`]
  });
  
  // Use for opponent name lookup
  const { data: opponents = [] } = useQuery({
    queryKey: ['/api/opponents']
  });
  
  // Get the game roster
  const { data: roster = [] } = useQuery({
    queryKey: [`/api/games/${gameId}/rosters`]
  });
  
  // Get all players
  const { data: players = [] } = useQuery({
    queryKey: ['/api/players']
  });
  
  // Calculate game scores
  const scores = useMemo(() => {
    if (!game || !gameStats) return { forTotal: 0, againstTotal: 0, result: '?' };
    return calculateGameScores(gameStats, game);
  }, [game, gameStats]);
  
  // Calculate quarter-by-quarter scores
  const quarterScores = useMemo(() => {
    return calculateQuarterScores(gameStats, game);
  }, [gameStats, game]);
  
  // Format quarter scores for display, with running totals
  const formattedQuarterScores = useMemo(() => {
    // First calculate the cumulative running totals
    const runningTotals = quarterScores.reduce((acc, current, index) => {
      if (index === 0) {
        // For the first quarter, the running total is just the quarter score
        return [{ 
          quarter: current.quarter,
          teamTotal: current.teamScore,
          opponentTotal: current.opponentScore,
          teamQuarter: current.teamScore,
          opponentQuarter: current.opponentScore
        }];
      }
      
      // For subsequent quarters, add to the previous running total
      const prev = acc[index - 1];
      return [...acc, {
        quarter: current.quarter,
        teamTotal: prev.teamTotal + current.teamScore,
        opponentTotal: prev.opponentTotal + current.opponentScore,
        teamQuarter: current.teamScore,
        opponentQuarter: current.opponentScore
      }];
    }, []);
    
    return runningTotals;
  }, [quarterScores]);
  
  // Total for all quarters
  const totalScores = useMemo(() => {
    return {
      teamTotal: quarterScores.reduce((sum, q) => sum + q.teamScore, 0),
      opponentTotal: quarterScores.reduce((sum, q) => sum + q.opponentScore, 0)
    };
  }, [quarterScores]);
  
  // Determine if we won, lost, or tied
  const gameResult = useMemo(() => {
    if (totalScores.teamTotal > totalScores.opponentTotal) return 'win';
    if (totalScores.teamTotal < totalScores.opponentTotal) return 'loss';
    return 'tie';
  }, [totalScores]);
  
  // Score display class based on game result
  const getScoreDisplayClass = (score) => {
    if (score.teamTotal > score.opponentTotal) return 'bg-green-100 text-green-700';
    if (score.teamTotal < score.opponentTotal) return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };
  
  const handleStatusChange = async (newStatus: GameStatus) => {
    try {
      const response = await fetch(`/api/games/${gameId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: newStatus,
          completed: newStatus === 'completed' || newStatus === 'forfeit-win' || newStatus === 'forfeit-loss'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update game status');
      }
      
      // Update cache
      queryClient.invalidateQueries({ queryKey: [`/api/games/${gameId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/games'] });
      
      toast({
        title: 'Status updated',
        description: `Game status changed to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update game status',
        variant: 'destructive',
      });
    }
  };
  
  if (!game) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="text-center my-12">
          <h1 className="text-2xl font-bold">Loading game details...</h1>
        </div>
      </div>
    );
  }
  
  const opponentName = getOpponentName(opponents, game.opponentId);
  const isForfeitGame = game.status === 'forfeit-win' || game.status === 'forfeit-loss';
  
  return (
    <div className="container max-w-6xl mx-auto pb-16 px-4">
      <Helmet>
        <title>{TEAM_NAME} vs {opponentName} | Game Details</title>
      </Helmet>
      
      <div className="flex items-center justify-between mb-6">
        <Link href="/games">
          <Button variant="ghost" size="sm" className="gap-1">
            <ChevronLeft className="h-4 w-4" />
            Back to games
          </Button>
        </Link>
        
        <div className="flex items-center gap-3">
          <GameDetailsStatusButton 
            gameId={gameId} 
            currentStatus={game.status as GameStatus}
          />
          
          <Link href={`/game/${gameId}/statistics`}>
            <Button variant="outline" className="gap-1">
              <BarChart3 className="h-4 w-4" />
              View Statistics
            </Button>
          </Link>
          
          <Link href={`/game/${gameId}/edit`}>
            <Button variant="outline" className="gap-1">
              <Edit className="h-4 w-4" />
              Edit Game
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">{TEAM_NAME} vs {opponentName}</h1>
                <p className="text-gray-500 mt-1">
                  {formatDate(game.date)} • {game.time}
                </p>
              </div>
              
              <Badge className={cn(
                "text-sm uppercase font-medium",
                getGameStatusColor(game.status as GameStatus)
              )}>
                {game.status || "Upcoming"}
              </Badge>
            </div>
            
            {/* Score display */}
            <div className="mt-6 mb-2">
              <div className="flex flex-col space-y-6">
                {/* Quarter by quarter breakdown */}
                <div className="border rounded-md overflow-hidden">
                  <div className="bg-gray-50 p-3">
                    <h3 className="font-semibold text-gray-900">Quarter Scores</h3>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-5 gap-4">
                      <div className="font-medium text-gray-500 text-sm">Team</div>
                      {[1, 2, 3, 4].map(q => (
                        <div key={q} className="font-medium text-gray-500 text-sm text-center">Q{q}</div>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-5 gap-4 mt-2">
                      <div className="font-semibold">{TEAM_NAME}</div>
                      {formattedQuarterScores.map(score => (
                        <div key={`team-q${score.quarter}`} className="text-center font-medium">
                          {score.teamQuarter}
                        </div>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-5 gap-4 mt-2">
                      <div className="font-semibold">{opponentName}</div>
                      {formattedQuarterScores.map(score => (
                        <div key={`opp-q${score.quarter}`} className="text-center font-medium">
                          {score.opponentQuarter}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Game totals */}
                <div className="border rounded-md overflow-hidden">
                  <div className="bg-gray-50 p-3">
                    <h3 className="font-semibold text-gray-900">Game Scores</h3>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-center">
                      <div className={`rounded-md p-6 ${getScoreDisplayClass(totalScores)}`}>
                        <div className="text-center">
                          <div className="text-3xl font-bold">{totalScores.teamTotal} - {totalScores.opponentTotal}</div>
                          <div className="text-sm mt-1 uppercase tracking-wider font-semibold">
                            {gameResult === 'win' ? 'Victory' : gameResult === 'loss' ? 'Defeat' : 'Draw'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
              
          <Tabs value={activeTab} onValueChange={setActiveTab} className="p-6">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="overview">Court View</TabsTrigger>
              <TabsTrigger value="roster">Team Roster</TabsTrigger>
              <TabsTrigger value="timeline">Game Timeline</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              {!isForfeitGame && <StatsView gameId={gameId} />}
              
              {isForfeitGame && (
                <div className="text-center py-10 bg-gray-50 rounded-md">
                  <div className="text-3xl font-bold text-gray-400 mb-2">Forfeit Game</div>
                  <p className="text-gray-500 max-w-md mx-auto">
                    This game was recorded as a {game.status === 'forfeit-win' ? 'forfeit win' : 'forfeit loss'}.
                    No player statistics are available.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="roster" className="space-y-4">
              {/* Team roster content */}
              <div className="bg-gray-50 p-6 rounded-md">
                <h3 className="font-semibold text-xl mb-4">Team Roster</h3>
                {/* Implement roster display here */}
                <p className="text-gray-500">Team roster coming soon</p>
              </div>
            </TabsContent>
            
            <TabsContent value="timeline" className="space-y-4">
              {/* Game timeline content */}
              <div className="bg-gray-50 p-6 rounded-md">
                <h3 className="font-semibold text-xl mb-4">Game Timeline</h3>
                {/* Implement timeline display here */}
                <p className="text-gray-500">Game timeline coming soon</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default GameDetails;