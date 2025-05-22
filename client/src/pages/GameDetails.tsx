import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
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
import { ChevronLeft, Edit, BarChart3, ClipboardList, Activity } from 'lucide-react';
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
      'GS': 'bottom-12 left-1/2 transform -translate-x-1/2',
      'GA': 'bottom-28 right-16',
      'WA': 'bottom-1/2 right-14',
      'C': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
      'WD': 'top-1/2 left-14',
      'GD': 'top-28 left-16',
      'GK': 'top-12 left-1/2 transform -translate-x-1/2',
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
  
  return (
    <div className="mt-4">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-medium">Court Positions View</h3>
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
      
      <div className="relative w-full max-w-md mx-auto aspect-[2/3] bg-green-100 rounded-lg border border-green-300">
        {/* Court markings */}
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
          
          // Calculate contrast color for text
          const isLightColor = (color: string) => {
            // Remove the # if present
            const hex = color.replace('#', '');
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);
            // Calculate luminance - if > 0.5, it's a light color
            return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5;
          };
          
          const textColor = playerName && isLightColor(playerColor) ? 'black' : 'white';
          
          return (
            <div key={position} className={`absolute ${getPositionCoordinates(position)}`}>
              <div 
                style={{ 
                  backgroundColor: playerName ? playerColor : 'white',
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
      
      {/* Roster list */}
      <div className="mt-6">
        <h3 className="text-md font-medium mb-2">Quarter {quarter} Roster</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {POSITIONS.map(position => {
            const entry = rosterByQuarter[quarter]?.[position];
            const playerName = getPlayerName(entry?.playerId);
            const playerColor = getPlayerColor(entry?.playerId);
            
            return (
              <div 
                key={position} 
                className="p-2 border rounded-md shadow-sm"
                style={{ 
                  backgroundColor: playerName ? `${playerColor}20` : 'white',
                  border: playerName ? `2px solid ${playerColor}` : '1px solid #ddd',
                }}
              >
                <div className="font-bold">{position}</div>
                <div 
                  className={playerName ? 'text-gray-900 font-medium' : 'text-red-500 italic'}
                  style={{ color: playerName ? playerColor : undefined }}
                >
                  {playerName || 'Unassigned'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Detailed statistics component
const DetailedStatistics = ({ gameStats }) => {
  // Get the latest stat for each position/quarter combination
  const deduplicatedStats = useMemo(() => {
    // Create a map of the latest stats for each position/quarter combination
    const latestPositionStats = {};
    
    // Process each stat to find the latest for each position/quarter
    gameStats.forEach(stat => {
      if (!stat || !stat.quarter || !stat.position) return;
      
      const key = `${stat.position}-${stat.quarter}`;
      
      // Always use the data with the highest ID value for each position/quarter
      if (!latestPositionStats[key] || stat.id > latestPositionStats[key].id) {
        latestPositionStats[key] = stat;
      }
    });
    
    // Convert map back to array
    return Object.values(latestPositionStats);
  }, [gameStats]);
  
  // Group deduplicated stats by position
  const statsByPosition = useMemo(() => {
    return deduplicatedStats.reduce((acc, stat) => {
      if (!acc[stat.position]) acc[stat.position] = [];
      acc[stat.position].push(stat);
      return acc;
    }, {});
  }, [deduplicatedStats]);
  
  // Calculate totals for each position
  const positionTotals = useMemo(() => {
    return Object.entries(statsByPosition).map(([position, stats]) => {
      const totals = stats.reduce((acc, stat) => {
        acc.goalsFor += stat.goalsFor || 0;
        acc.goalsAgainst += stat.goalsAgainst || 0;
        acc.missedGoals += stat.missedGoals || 0;
        acc.rebounds += stat.rebounds || 0;
        acc.intercepts += stat.intercepts || 0;
        acc.badPass += stat.badPass || 0;
        acc.handlingError += stat.handlingError || 0;
        acc.pickUp += stat.pickUp || 0;
        acc.infringement += stat.infringement || 0;
        return acc;
      }, {
        goalsFor: 0,
        goalsAgainst: 0,
        missedGoals: 0,
        rebounds: 0,
        intercepts: 0,
        badPass: 0,
        handlingError: 0,
        pickUp: 0,
        infringement: 0
      });
      
      return {
        position,
        ...totals
      };
    });
  }, [statsByPosition]);
  
  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-4">Position Statistics</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-4 py-2 text-left">Position</th>
              <th className="px-4 py-2 text-center">Goals For</th>
              <th className="px-4 py-2 text-center">Goals Against</th>
              <th className="px-4 py-2 text-center">Missed Goals</th>
              <th className="px-4 py-2 text-center">Rebounds</th>
              <th className="px-4 py-2 text-center">Intercepts</th>
              <th className="px-4 py-2 text-center">Bad Pass</th>
              <th className="px-4 py-2 text-center">Handling Error</th>
              <th className="px-4 py-2 text-center">Pick Up</th>
              <th className="px-4 py-2 text-center">Infringement</th>
            </tr>
          </thead>
          <tbody>
            {positionTotals.map(stat => (
              <tr key={stat.position} className="border-b">
                <td className="px-4 py-2 font-medium">{stat.position}</td>
                <td className="px-4 py-2 text-center">{stat.goalsFor}</td>
                <td className="px-4 py-2 text-center">{stat.goalsAgainst}</td>
                <td className="px-4 py-2 text-center">{stat.missedGoals}</td>
                <td className="px-4 py-2 text-center">{stat.rebounds}</td>
                <td className="px-4 py-2 text-center">{stat.intercepts}</td>
                <td className="px-4 py-2 text-center">{stat.badPass}</td>
                <td className="px-4 py-2 text-center">{stat.handlingError}</td>
                <td className="px-4 py-2 text-center">{stat.pickUp}</td>
                <td className="px-4 py-2 text-center">{stat.infringement}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Quarter Score Card
const QuarterScoreCard = ({ quarterScores }) => {
  // Calculate cumulative scores
  const cumulativeScores = quarterScores.reduce((acc, current, index) => {
    const prevTeamScore = index > 0 ? acc[index - 1].teamCumulative : 0;
    const prevOpponentScore = index > 0 ? acc[index - 1].opponentCumulative : 0;
    
    acc.push({
      quarter: current.quarter,
      teamScore: current.teamScore,
      opponentScore: current.opponentScore,
      teamCumulative: prevTeamScore + current.teamScore,
      opponentCumulative: prevOpponentScore + current.opponentScore
    });
    
    return acc;
  }, []);
  
  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-4">Quarter by Quarter</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-4 py-2 text-left">Quarter</th>
              <th className="px-4 py-2 text-center">Team Score</th>
              <th className="px-4 py-2 text-center">Opponent Score</th>
              <th className="px-4 py-2 text-center">Running Total</th>
            </tr>
          </thead>
          <tbody>
            {cumulativeScores.map(score => (
              <tr key={score.quarter} className="border-b">
                <td className="px-4 py-2 font-medium">Quarter {score.quarter}</td>
                <td className="px-4 py-2 text-center">{score.teamScore}</td>
                <td className="px-4 py-2 text-center">{score.opponentScore}</td>
                <td className="px-4 py-2 text-center">{score.teamCumulative} - {score.opponentCumulative}</td>
              </tr>
            ))}
            <tr className="bg-slate-50 font-semibold">
              <td className="px-4 py-2">Final</td>
              <td className="px-4 py-2 text-center">{cumulativeScores.reduce((sum, q) => sum + q.teamScore, 0)}</td>
              <td className="px-4 py-2 text-center">{cumulativeScores.reduce((sum, q) => sum + q.opponentScore, 0)}</td>
              <td className="px-4 py-2 text-center">
                {cumulativeScores[cumulativeScores.length - 1]?.teamCumulative} - {cumulativeScores[cumulativeScores.length - 1]?.opponentCumulative}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};



// Status change dialog component for game details page
const StatusChangeDialog = ({ game }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(game.status as GameStatus);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Keep selectedStatus in sync with game.status when it changes
  useEffect(() => {
    setSelectedStatus(game.status as GameStatus);
  }, [game.status]);
  
  const updateGameStatus = async () => {
    if (selectedStatus === game.status) {
      setIsOpen(false);
      return;
    }
    
    setIsSubmitting(true);
    try {
      await fetch(`/api/games/${game.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: selectedStatus })
      });
      
      // Force refresh all game data after status update
      queryClient.invalidateQueries();
      
      toast({
        title: 'Game status updated',
        description: `Game status has been updated to ${selectedStatus === 'in-progress' ? 'In Progress' : 
                      selectedStatus === 'completed' ? 'Completed' : 
                      selectedStatus === 'upcoming' ? 'Upcoming' : 
                      selectedStatus === 'forfeit-win' ? 'Forfeit Win' : 
                      'Forfeit Loss'}.`,
      });
      
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to update game status:', error);
      toast({
        title: 'Failed to update game status',
        description: 'An error occurred while updating the game status.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Badge 
          variant="outline" 
          className={`px-2 py-1 text-xs cursor-pointer rounded-full transition-colors
            ${game.status === 'upcoming' ? "bg-blue-100 text-blue-800 hover:bg-blue-200" : ""}
            ${game.status === 'in-progress' ? "bg-amber-100 text-amber-800 hover:bg-amber-200" : ""}
            ${game.status === 'completed' ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}
            ${game.status === 'forfeit-win' ? "bg-indigo-100 text-indigo-800 hover:bg-indigo-200" : ""}
            ${game.status === 'forfeit-loss' ? "bg-red-100 text-red-800 hover:bg-red-200" : ""}
          `}
        >
          {game.status === 'upcoming' && "Upcoming"}
          {game.status === 'in-progress' && "In Progress"}
          {game.status === 'completed' && "Completed"}
          {game.status === 'forfeit-win' && "Forfeit Win (10-0)"}
          {game.status === 'forfeit-loss' && "Forfeit Loss (0-10)"}
        </Badge>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Game Status</DialogTitle>
          <DialogDescription>
            Change the status of this game.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Select 
            value={selectedStatus} 
            onValueChange={(value) => setSelectedStatus(value as GameStatus)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {allGameStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status === 'upcoming' ? 'Upcoming' : 
                   status === 'in-progress' ? 'In Progress' : 
                   status === 'completed' ? 'Completed' : 
                   status === 'forfeit-win' ? 'Forfeit Win (10-0)' : 
                   'Forfeit Loss (0-10)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedStatus && (
            <div className="text-sm text-muted-foreground mt-2">
              {selectedStatus === 'forfeit-win' && (
                <p>Opponent forfeited the game. Score will be recorded as 10-0 in our favor.</p>
              )}
              {selectedStatus === 'forfeit-loss' && (
                <p>Our team forfeited the game. Score will be recorded as 0-10.</p>
              )}
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={updateGameStatus}
            disabled={isSubmitting || selectedStatus === game.status}
          >
            {isSubmitting ? 'Updating...' : 'Update Status'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function GameDetails() {
  // Get game ID from URL
  const params = useParams();
  const gameId = Number(params.id);
  const queryClient = useQueryClient();
  
  // Fetch game data
  const { data: game, isLoading: isLoadingGame } = useQuery({
    queryKey: ['/api/games', gameId],
    queryFn: async () => {
      // Add a timestamp to prevent caching
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/games/${gameId}?_t=${timestamp}`);
      if (!response.ok) throw new Error('Failed to fetch game');
      return response.json();
    },
    refetchOnMount: true,
    staleTime: 0,
    enabled: !!gameId
  });
  
  // Fetch opponents for display
  const { data: opponents, isLoading: isLoadingOpponents } = useQuery({
    queryKey: ['/api/opponents'],
    queryFn: async () => {
      const response = await fetch('/api/opponents');
      if (!response.ok) throw new Error('Failed to fetch opponents');
      return response.json();
    }
  });
  
  // Fetch players for roster display
  const { data: players, isLoading: isLoadingPlayers } = useQuery({
    queryKey: ['/api/players'],
    queryFn: async () => {
      const response = await fetch('/api/players');
      if (!response.ok) throw new Error('Failed to fetch players');
      return response.json();
    }
  });
  
  // Fetch game statistics
  const { data: gameStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/games', gameId, 'stats'],
    queryFn: async () => {
      // Add timestamp to force fresh data
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/games/${gameId}/stats?_t=${timestamp}`);
      if (!response.ok) throw new Error('Failed to fetch game stats');
      return response.json();
    },
    enabled: !!gameId,
    staleTime: 0, // Always refetch when needed
    refetchOnMount: true
  });
  
  // Fetch game roster
  const { data: roster, isLoading: isLoadingRoster } = useQuery({
    queryKey: ['/api/games', gameId, 'rosters'],
    queryFn: async () => {
      const response = await fetch(`/api/games/${gameId}/rosters`);
      if (!response.ok) throw new Error('Failed to fetch roster');
      return response.json();
    },
    enabled: !!gameId
  });
  
  // Calculate quarter scores
  const quarterScores = useMemo(() => {
    if (!game) return [];
    if (game.status === 'forfeit-win' || game.status === 'forfeit-loss') {
      // For forfeit games, use special handling
      const isWin = game.status === 'forfeit-win';
      return calculateQuarterScores([], game);
    }
    if (!gameStats || gameStats.length === 0) return [];
    return calculateQuarterScores(gameStats, game);
  }, [gameStats, game]);
  
  // Calculate game score
  const { teamScore, opponentScore } = useMemo(() => {
    if (!game) return { teamScore: 0, opponentScore: 0 };
    
    // For forfeit games, provide standard forfeit scores
    if (game.status === 'forfeit-win') {
      return { teamScore: 10, opponentScore: 0 };
    }
    if (game.status === 'forfeit-loss') {
      return { teamScore: 0, opponentScore: 10 };
    }
    
    if (!gameStats || gameStats.length === 0) return { teamScore: 0, opponentScore: 0 };
    return calculateGameScores(gameStats);
  }, [gameStats, game]);
  
  // Handle loading state
  if (isLoadingGame || isLoadingOpponents || isLoadingPlayers || isLoadingStats || isLoadingRoster) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-slate-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-60 bg-slate-200 rounded"></div>
            <div className="h-60 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!game) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold">Game Not Found</h2>
              <p className="text-gray-500 mt-2">The game you're looking for doesn't exist or has been deleted.</p>
              <Button asChild className="mt-4">
                <Link to="/games">
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back to Games
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <Helmet>
        <title>Game Details: {getOpponentName(opponents || [], game.opponentId)} | Netball Stats</title>
      </Helmet>
      
      {/* Page title and round number + back button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold">
            Game Details - Round {game.round || '(No Round)'}
          </h1>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/games">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Games
          </Link>
        </Button>
        
        <div className="flex gap-2">
          {!game.isBye && game.status !== 'forfeit' && (
            <Button variant="outline" size="sm" asChild>
              <Link to={`/games/${game.id}/livestats`}>
                <Activity className="mr-1 h-4 w-4" />
                Live Stats
              </Link>
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link to={`/statistics?game=${game.id}`} className="flex items-center">
              <Edit className="mr-1 h-4 w-4" />
              <span>Edit Stats</span>
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Game header card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">
                {game.isBye ? 'BYE Round' : `Our Team vs ${getOpponentName(opponents || [], game.opponentId)}`}
              </h2>
              <div className="flex items-center mt-1 space-x-3">
                <span className="text-gray-500">{formatDate(game.date)}</span>
                <span className="text-gray-500">{game.time}</span>
                <GameStatusButton 
                  game={game}
                  size="sm"
                  withDialog={true} 
                />
              </div>
            </div>
            
            <div className="mt-4 md:mt-0">
              {(game.status === 'completed' || game.status === 'forfeit' || game.status === 'in-progress') && (
                <div className="text-center">
                  <div className="text-gray-500 mb-1">Final Score</div>
                  <div className="text-3xl font-bold">{teamScore} - {opponentScore}</div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Game content tabs */}
      <Tabs defaultValue="summary" className="mt-6">
        <TabsList className="mb-4">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="roster">Team Roster</TabsTrigger>
          <TabsTrigger value="statistics">Game Statistics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Game Summary</CardTitle>
                <CardDescription>
                  Score breakdown for this match
                </CardDescription>
              </CardHeader>
              <CardContent>
                {game.status === 'forfeit' ? (
                  <div className="text-center py-4">
                    <div className="text-lg font-medium mb-2">This game was recorded as a forfeit</div>
                    <div className="text-gray-500">No statistics were recorded for this game.</div>
                    <div className="mt-4">
                      <Badge variant="destructive">Forfeit: 0-10</Badge>
                    </div>
                  </div>
                ) : game.isBye ? (
                  <div className="text-center py-4">
                    <div className="text-lg font-medium mb-2">This round was a BYE</div>
                    <div className="text-gray-500">No game was played.</div>
                  </div>
                ) : (
                  <>
                    {quarterScores.length > 0 ? (
                      <QuarterScoreCard quarterScores={quarterScores} />
                    ) : (
                      <div className="text-center py-4">
                        <div className="text-lg font-medium mb-2">No stats recorded yet</div>
                        <div className="text-gray-500">Record statistics to see the game summary.</div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="roster">
          <Card>
            <CardHeader>
              <CardTitle>Team Roster</CardTitle>
              <CardDescription>
                Player positions by quarter
              </CardDescription>
            </CardHeader>
            <CardContent>
              {game.isBye || game.status === 'forfeit' ? (
                <div className="text-center py-4">
                  <div className="text-lg font-medium mb-2">
                    {game.isBye ? 'No roster for BYE rounds' : 'No roster needed for forfeit games'}
                  </div>
                  <div className="text-gray-500">
                    {game.isBye ? 'BYE rounds don\'t require a team roster.' : 'Forfeit games don\'t have player assignments.'}
                  </div>
                </div>
              ) : roster && roster.length > 0 ? (
                <CourtPositionRoster roster={roster} players={players} quarter={1} />
              ) : (
                <div className="text-center py-4">
                  <div className="text-lg font-medium mb-2">No roster assigned yet</div>
                  <div className="text-gray-500">Set up the team roster for this game to see positions.</div>
                  <Button className="mt-4" asChild>
                    <Link to="/roster">
                      <ClipboardList className="mr-2 h-4 w-4" />
                      Set Up Roster
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="statistics">
          <Card>
            <CardHeader>
              <CardTitle>Game Statistics</CardTitle>
              <CardDescription>
                Detailed performance statistics by position
              </CardDescription>
            </CardHeader>
            <CardContent>
              {game.isBye || game.status === 'forfeit' ? (
                <div className="text-center py-4">
                  <div className="text-lg font-medium mb-2">
                    {game.isBye ? 'No statistics for BYE rounds' : 'No statistics for forfeit games'}
                  </div>
                  <div className="text-gray-500">
                    {game.isBye ? 'BYE rounds don\'t have any statistical data.' : 'Forfeit games don\'t have performance statistics.'}
                  </div>
                </div>
              ) : gameStats && gameStats.length > 0 ? (
                <DetailedStatistics gameStats={gameStats} />
              ) : (
                <div className="text-center py-4">
                  <div className="text-lg font-medium mb-2">No statistics recorded yet</div>
                  <div className="text-gray-500">Record stats during the game to see performance metrics.</div>
                  <Button className="mt-4" asChild>
                    <Link to={`/games/${game.id}/livestats`}>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Record Stats
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}