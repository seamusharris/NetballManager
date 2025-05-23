import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { TEAM_NAME } from '@/lib/settings';
import { StatItemBox } from '@/components/games/StatItemBox';
import { PositionStatsBox } from '@/components/games/PositionStatsBox';
import { PositionBox } from '@/components/games/PositionBox';
import { GamePositionStatsBox } from '@/components/games/GamePositionStatsBox';
import GameForm from '@/components/games/GameForm';
import { apiRequest } from '@/lib/queryClient';
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
  ChevronLeft, Edit, BarChart3, ClipboardList, Activity, CalendarRange, ActivitySquare
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
  
  // Organize roster by quarter and position
  const rosterByQuarter = useMemo(() => {
    if (!roster) return {};
    
    return roster.reduce((acc, entry) => {
      if (!acc[entry.quarter]) {
        acc[entry.quarter] = {};
      }
      
      acc[entry.quarter][entry.position] = entry;
      return acc;
    }, {});
  }, [roster]);
  
  // Get player by ID (for display name)
  const getPlayerById = (playerId) => {
    if (!playerId || !players) return null;
    return players.find(p => p.id === playerId);
  };
  
  // Map tailwind background classes to hex colors for player circles
  const getTailwindColorHex = (tailwindClass) => {
    // Colors for player circles
    const colorMap = {
      'bg-red-500': '#ef4444', // Red
      'bg-orange-500': '#f97316', // Orange 
      'bg-yellow-600': '#ca8a04', // Yellow
      'bg-green-500': '#22c55e', // Green
      'bg-emerald-600': '#059669', // Emerald
      'bg-teal-600': '#0d9488', // Teal
      'bg-blue-600': '#2563eb', // Blue
      'bg-indigo-600': '#4f46e5', // Indigo
      'bg-purple-600': '#9333ea', // Purple
      'bg-pink-500': '#ec4899', // Pink
      'bg-rose-600': '#e11d48', // Rose
      'bg-sky-500': '#0ea5e9', // Sky
      'bg-lime-600': '#65a30d', // Lime
      'bg-amber-600': '#d97706', // Amber
      'bg-violet-600': '#7c3aed', // Violet
      'bg-fuchsia-600': '#c026d3', // Fuchsia
      'bg-cyan-600': '#0891b2', // Cyan
    };
    
    console.log(`Converting ${tailwindClass} to hex: ${colorMap[tailwindClass]} for player ${playerId}`);
    
    return colorMap[tailwindClass] || '#6b7280'; // Return a default gray if not found
  };
  
  // Get color for player based on their ID
  const getPlayerColor = (playerId) => {
    if (!playerId || !players) return '#6b7280';
    const player = getPlayerById(playerId);
    return player?.color ? getTailwindColorHex(player.color) : '#6b7280';
  };
  
  // Get player initials based on ID
  const getPlayerInitials = (playerId) => {
    if (!playerId || !players) return '';
    const player = getPlayerById(playerId);
    return player ? player.displayName.substring(0, 2) : '';
  };
  
  // Aggregate stats for a specific position in the selected quarter
  const getPositionStats = (position) => {
    if (!gameStats) return {};
    
    const relevantStats = gameStats.filter(
      stat => stat.position === position && stat.quarter === quarter
    );
    
    if (relevantStats.length === 0) return {};
    return relevantStats[0];
  };
  
  // Get quarters for selection dropdown
  const quarters = [1, 2, 3, 4];
  
  // Court dimensions and configuration
  const courtWidth = 450;
  const courtHeight = 600;
  const thirdHeight = courtHeight / 3;
  const circleRadius = 32;
  
  // Position coordinates for circles - adjusted to spread them horizontally
  const positionCoordinates = {
    // Attacking third
    GS: { x: courtWidth * 1/4, y: thirdHeight / 2 },
    GA: { x: courtWidth * 3/4, y: thirdHeight / 2 },
    
    // Center third
    WA: { x: courtWidth * 1/4, y: thirdHeight + (thirdHeight / 2) },
    C: { x: courtWidth / 2, y: thirdHeight + (thirdHeight / 2) },
    WD: { x: courtWidth * 3/4, y: thirdHeight + (thirdHeight / 2) },
    
    // Defending third
    GD: { x: courtWidth * 1/4, y: (thirdHeight * 2) + (thirdHeight / 2) },
    GK: { x: courtWidth * 3/4, y: (thirdHeight * 2) + (thirdHeight / 2) },
  };
  
  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Court Positions</h3>
        <Select value={quarter.toString()} onValueChange={(value) => setQuarter(parseInt(value))}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Quarter" />
          </SelectTrigger>
          <SelectContent>
            {quarters.map((q) => (
              <SelectItem key={q} value={q.toString()}>
                Quarter {q}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="relative mx-auto" style={{ width: courtWidth, height: courtHeight, border: '2px solid #d1d5db', borderRadius: '8px', overflow: 'hidden' }}>
        {/* Court thirds lines */}
        <div style={{ position: 'absolute', top: thirdHeight, left: 0, right: 0, height: '2px', backgroundColor: '#d1d5db' }}></div>
        <div style={{ position: 'absolute', top: thirdHeight * 2, left: 0, right: 0, height: '2px', backgroundColor: '#d1d5db' }}></div>
        
        {/* Position circles */}
        {Object.entries(positionCoordinates).map(([position, { x, y }]) => {
          const positionKey = position as Position;
          const currentRoster = rosterByQuarter[quarter] || {};
          const playerIdForPosition = currentRoster[positionKey]?.playerId || null;
          const stats = getPositionStats(positionKey);
          
          return (
            <div 
              key={position}
              style={{
                position: 'absolute',
                top: y - circleRadius,
                left: x - circleRadius,
                width: circleRadius * 2,
                height: circleRadius * 2,
                borderRadius: '50%',
                backgroundColor: playerIdForPosition ? getPlayerColor(playerIdForPosition) : '#f3f4f6',
                border: '2px solid #d1d5db',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: playerIdForPosition ? 'white' : '#4b5563',
                fontWeight: 'bold',
                fontSize: '13px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {playerIdForPosition ? getPlayerInitials(playerIdForPosition) : position}
            </div>
          );
        })}
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 mt-6">
        {POSITIONS.map((position) => {
          const currentRoster = rosterByQuarter[quarter] || {};
          const playerIdForPosition = currentRoster[position]?.playerId || null;
          const player = getPlayerById(playerIdForPosition);
          const stats = getPositionStats(position);
          
          return (
            <Card key={position} className="overflow-hidden">
              <CardHeader className="py-3 px-4 bg-gray-50 border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base font-medium">{position}</CardTitle>
                  {player && (
                    <Badge variant="outline" style={{
                      backgroundColor: getPlayerColor(player.id),
                      color: 'white',
                      borderColor: getPlayerColor(player.id),
                    }}>
                      {player.displayName}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-3">
                {stats && Object.keys(stats).length > 0 ? (
                  <div className="grid grid-cols-2 gap-1 text-sm">
                    {primaryPositionStats[position].map(stat => (
                      <div key={stat} className="flex justify-between">
                        <span className="text-gray-500">{statLabels[stat]}:</span>
                        <span className="font-medium">{stats[stat] || 0}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 text-center py-1">No stats recorded</div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// Game stats summary component
const GameStatsSummary = ({ gameStats }) => {
  // Total scores
  const totalStats = useMemo(() => {
    if (!gameStats || gameStats.length === 0) return {
      goalsFor: 0,
      goalsAgainst: 0,
      missedGoals: 0,
      intercepts: 0,
      rebounds: 0
    };
    
    return gameStats.reduce((acc, stat) => {
      return {
        goalsFor: (acc.goalsFor || 0) + (stat.goalsFor || 0),
        goalsAgainst: (acc.goalsAgainst || 0) + (stat.goalsAgainst || 0),
        missedGoals: (acc.missedGoals || 0) + (stat.missedGoals || 0),
        intercepts: (acc.intercepts || 0) + (stat.intercepts || 0),
        rebounds: (acc.rebounds || 0) + (stat.rebounds || 0),
      };
    }, {});
  }, [gameStats]);
  
  // Position-based stats by quarter
  const statsByPosition = useMemo(() => {
    if (!gameStats || gameStats.length === 0) return {};
    
    // Group by position first
    const positions = Object.values(POSITIONS);
    const result = {};
    
    // Initialize with empty structure
    positions.forEach(position => {
      result[position] = {
        quarters: {
          1: {},
          2: {},
          3: {},
          4: {}
        },
        total: {}
      };
    });
    
    // Fill in actual stats
    gameStats.forEach(stat => {
      if (!stat.position || !positions.includes(stat.position)) return;
      
      // Add to the appropriate quarter
      if (stat.quarter >= 1 && stat.quarter <= 4) {
        result[stat.position].quarters[stat.quarter] = stat;
      }
      
      // Add to totals (we'll calculate these later)
    });
    
    // Calculate totals for each position
    positions.forEach(position => {
      const posStats = result[position];
      const quarters = Object.values(posStats.quarters);
      
      // Sum up stat values across quarters
      posStats.total = quarters.reduce((total, quarter) => {
        if (!quarter || Object.keys(quarter).length === 0) return total;
        
        // For each stat in this quarter, add to total
        Object.entries(quarter).forEach(([key, value]) => {
          // Skip non-numeric properties
          if (typeof value !== 'number' || ['id', 'gameId', 'quarter', 'playerId'].includes(key)) return;
          
          total[key] = (total[key] || 0) + value;
        });
        
        return total;
      }, {});
    });
    
    return result;
  }, [gameStats]);
  
  if (!gameStats || gameStats.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-gray-500">No statistics recorded for this game yet.</p>
      </div>
    );
  }
  
  // Extract unique array of quarters from the stats
  const quarters = Array.from(new Set(gameStats.map(stat => stat.quarter))).sort();
  
  return (
    <div className="mt-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatItemBox 
          title="Goals Scored" 
          value={totalStats.goalsFor || 0}
          icon={<BarChart3 className="h-4 w-4" />}
          type="primary"
        />
        
        <StatItemBox 
          title="Goals Against" 
          value={totalStats.goalsAgainst || 0}
          icon={<BarChart3 className="h-4 w-4" />}
          type="secondary"
        />
        
        <StatItemBox 
          title="Intercepts" 
          value={totalStats.intercepts || 0}
          icon={<Activity className="h-4 w-4" />}
          type="accent"
        />
        
        <StatItemBox 
          title="Rebounds" 
          value={totalStats.rebounds || 0}
          icon={<ClipboardList className="h-4 w-4" />}
          type="accent"
        />
      </div>
      
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Stats by Position</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-2 text-left font-medium">Position</th>
                {quarters.map(q => (
                  <th key={q} className="px-4 py-2 text-center font-medium">Q{q}</th>
                ))}
                <th className="px-4 py-2 text-center font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {POSITIONS.map(position => {
                const posData = statsByPosition[position];
                if (!posData) return null;
                
                return (
                  <tr key={position} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{position}</td>
                    
                    {quarters.map(quarter => {
                      const quarterStats = posData.quarters[quarter] || {};
                      
                      return (
                        <td key={`${position}-${quarter}`} className="px-4 py-2 text-center">
                          {quarterStats.goalsFor || quarterStats.goalsAgainst ? (
                            <span>
                              {quarterStats.goalsFor || 0}
                              {' / '}
                              {quarterStats.goalsAgainst || 0}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      );
                    })}
                    
                    <td className="px-4 py-2 text-center font-medium">
                      {posData.total.goalsFor || posData.total.goalsAgainst ? (
                        <span>
                          {posData.total.goalsFor || 0}
                          {' / '}
                          {posData.total.goalsAgainst || 0}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="text-xs text-gray-500 mt-2">
          Stats shown as Goals For / Goals Against
        </div>
      </div>
    </div>
  );
};

// Game score summary component
const GameScoreSummary = ({ quarterScores }) => {
  // Format scores as a table of quarters
  const formattedScores = useMemo(() => {
    if (!quarterScores || quarterScores.length === 0) return [];
    
    return quarterScores.reduce((acc, current, index) => {
      acc.push({
        quarter: `Q${current.quarter}`,
        teamScore: current.teamScore,
        opponentScore: current.opponentScore,
        isRunningTotal: false
      });
      
      // Add running total after each quarter
      if (index < quarterScores.length - 1) {
        const totalTeamScore = quarterScores.slice(0, index + 1).reduce((sum, q) => sum + q.teamScore, 0);
        const totalOpponentScore = quarterScores.slice(0, index + 1).reduce((sum, q) => sum + q.opponentScore, 0);
        
        acc.push({
          quarter: `After Q${current.quarter}`,
          teamScore: totalTeamScore,
          opponentScore: totalOpponentScore,
          isRunningTotal: true
        });
      }
      
      return acc;
    }, []);
  }, [quarterScores]);
  
  // Calculate final score
  const finalScore = useMemo(() => {
    if (!quarterScores || quarterScores.length === 0) return { teamScore: 0, opponentScore: 0 };
    
    const teamScore = quarterScores.reduce((sum, score) => sum + score.teamScore, 0);
    const opponentScore = quarterScores.reduce((sum, score) => sum + score.opponentScore, 0);
    
    return { teamScore, opponentScore };
  }, [quarterScores]);
  
  return (
    <div className="mt-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h3 className="text-lg font-medium">Game Score</h3>
        
        <div className="mt-2 sm:mt-0 flex items-center">
          <div className="flex items-center mr-8">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            <span className="text-sm font-medium">{TEAM_NAME}</span>
          </div>
          
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
            <span className="text-sm font-medium">Opponent</span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Final Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-center h-24">
              <div className="text-center">
                <span className="block text-4xl font-bold text-blue-600">{finalScore.teamScore}</span>
                <span className="text-sm text-gray-500">{TEAM_NAME}</span>
              </div>
              
              <div className="mx-4 text-xl font-light text-gray-400">-</div>
              
              <div className="text-center">
                <span className="block text-4xl font-bold text-orange-600">{finalScore.opponentScore}</span>
                <span className="text-sm text-gray-500">Opponent</span>
              </div>
            </div>
            
            <div className="text-center mt-2">
              <Badge variant={finalScore.teamScore > finalScore.opponentScore ? "success" : finalScore.teamScore < finalScore.opponentScore ? "destructive" : "secondary"}>
                {finalScore.teamScore > finalScore.opponentScore ? "Win" : finalScore.teamScore < finalScore.opponentScore ? "Loss" : "Draw"}
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quarter by Quarter</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left font-medium">Quarter</th>
                  <th className="py-2 text-center font-medium text-blue-600">Us</th>
                  <th className="py-2 text-center font-medium text-orange-600">Them</th>
                </tr>
              </thead>
              <tbody>
                {quarterScores.map((score) => (
                  <tr key={`Q${score.quarter}`} className="border-b last:border-0">
                    <td className="py-2">Q{score.quarter}</td>
                    <td className="py-2 text-center font-medium">{score.teamScore}</td>
                    <td className="py-2 text-center font-medium">{score.opponentScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default function GameDetails() {
  const { id } = useParams();
  const gameId = parseInt(id || '0');
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Update game mutation
  const updateMutation = useMutation({
    mutationFn: async (updatedGame: any) => {
      return await apiRequest(`/api/games/${gameId}`, {
        method: 'PATCH',
        data: updatedGame,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/games'] });
      queryClient.invalidateQueries({ queryKey: ['/api/games', gameId] });
      
      toast({
        title: 'Game updated',
        description: 'Game details have been successfully updated',
      });
      
      setIsEditDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error updating game',
        description: error.message || 'There was an error updating the game',
        variant: 'destructive',
      });
    }
  });
  
  // Fetch game data
  const { data: game, isLoading: isLoadingGame } = useQuery({
    queryKey: ['/api/games', gameId],
    enabled: !isNaN(gameId)
  });
  
  // Fetch roster data for this game
  const { data: roster, isLoading: isLoadingRoster } = useQuery({
    queryKey: ['/api/games', gameId, 'rosters'],
    enabled: !isNaN(gameId)
  });
  
  // Fetch players data
  const { data: players, isLoading: isLoadingPlayers } = useQuery({
    queryKey: ['/api/players'],
  });
  
  // Fetch opponents data
  const { data: opponents, isLoading: isLoadingOpponents } = useQuery({
    queryKey: ['/api/opponents'],
  });
  
  // Fetch game stats data
  const { data: gameStats, isLoading: isLoadingGameStats } = useQuery({
    queryKey: ['/api/games', gameId, 'stats'],
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
      
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Button variant="outline" size="sm" asChild>
              <Link to="/games">
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back
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
          
          <div className="flex flex-wrap gap-2 mt-4 mb-4">
            {/* Game Status Button */}
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
            
            {/* Roster Button */}
            {!game.isBye && (
              <Button 
                variant="outline" 
                size="sm" 
                asChild
                className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
              >
                <Link to={`/roster?game=${gameId}`}>
                  <CalendarRange className="mr-2 h-4 w-4 text-emerald-600" />
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
                className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
              >
                <Link to={`/game/${gameId}/livestats`}>
                  <ActivitySquare className="mr-2 h-4 w-4 text-purple-600" />
                  Live Stats
                </Link>
              </Button>
            )}
            
            {/* Edit Game Button */}
            <Button 
              variant="outline" 
              size="sm"
              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Edit className="mr-2 h-4 w-4 text-blue-600" />
              Edit Game
            </Button>
          </div>
          
          <div className="text-gray-500">
            {formatDate(game.date)} {game.time && `at ${game.time}`}
            {game.location && ` · ${game.location}`}
            {game.round && ` · Round ${game.round}`}
          </div>
          
          <div className="mt-2 flex items-center">
            <Badge 
              className={cn(
                getGameStatusColor(game.status as GameStatus)
              )}
            >
              {game.status || 'Upcoming'}
            </Badge>
          </div>
        </div>
      </div>
      
      {/* Game content */}
      {game.isBye ? (
        <div className="py-6 text-center bg-gray-50 rounded-lg">
          <p className="text-gray-500">This is a BYE round, no game statistics available.</p>
        </div>
      ) : (
        <>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="court">Court View</TabsTrigger>
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
              <TabsTrigger value="positions">Position Stats</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-6">
              <GameScoreSummary quarterScores={quarterScores} />
              <GameStatsSummary gameStats={gameStats} />
            </TabsContent>
            
            <TabsContent value="court" className="mt-6">
              <CourtPositionRoster 
                roster={roster} 
                players={players} 
                gameStats={gameStats} 
                quarter={1}
              />
            </TabsContent>
            
            <TabsContent value="statistics" className="mt-6">
              <GameStatsSummary gameStats={gameStats} />
            </TabsContent>
            
            <TabsContent value="positions" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {POSITIONS.map(position => (
                  <PositionStatsBox 
                    key={position}
                    position={position}
                    gameStats={gameStats?.filter(s => s.position === position) || []}
                    expanded={true}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
      
      {/* Game Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Game</DialogTitle>
            <DialogDescription>
              Make changes to the game details below.
            </DialogDescription>
          </DialogHeader>
          
          <GameForm 
            initialValues={game}
            opponents={opponents} 
            onSubmit={(values) => {
              updateMutation.mutate(values);
            }}
            isSubmitting={updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}