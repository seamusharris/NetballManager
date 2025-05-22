import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { TEAM_NAME } from '@/lib/settings';
import { PositionBox } from '@/components/games/PositionBox';
import { StatItemBox } from '@/components/games/StatItemBox';
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
  ChevronLeft, Edit, BarChart3, ClipboardList, Activity
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { formatDate, cn } from '@/lib/utils';
import { GameStatus, Position, POSITIONS, allGameStatuses } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { GameStatusBadge } from '@/components/games/GameStatusBadge';
import { GameStatusButton } from '@/components/games/GameStatusButton';
import { GameDetailsStatusButton } from '@/components/games/GameDetailsStatusButton';
import { apiRequest } from '@/lib/queryClient';

// Component for rendering a player circle on the court
const PlayerCircle = ({ position, playerName, playerColor, x, y }) => {
  return (
    <div 
      className="absolute rounded-full flex items-center justify-center text-white font-semibold"
      style={{
        width: '32px',
        height: '32px',
        backgroundColor: playerColor || '#ccc',
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)'
      }}
    >
      {position}
    </div>
  );
};

// Utility function to transform roster data for the quarter
const getRosterByQuarter = ({ roster, players }) => {
  if (!roster || !players) return {};
  
  // Build a map of position -> player for each quarter
  return roster.reduce((acc, entry) => {
    const { quarter, position, playerId } = entry;
    if (!acc[quarter]) acc[quarter] = {};
    acc[quarter][position] = { 
      playerId, 
      position 
    };
    return acc;
  }, {});
};

export default function GameDetails() {
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [quarter, setQuarter] = useState(1);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  
  // Fetch game details
  const { 
    data: game,
    isLoading: gameLoading,
    error: gameError
  } = useQuery({ 
    queryKey: ['/api/games', id],
    queryFn: () => apiRequest(`/api/games/${id}`),
    enabled: !!id
  });

  // Fetch roster data for this game
  const { 
    data: roster = [],
    isLoading: rosterLoading
  } = useQuery({ 
    queryKey: ['/api/games', id, 'rosters'],
    queryFn: () => apiRequest(`/api/games/${id}/rosters`),
    enabled: !!id
  });

  // Fetch stats for this game
  const { 
    data: gameStats = [],
    isLoading: statsLoading
  } = useQuery({ 
    queryKey: ['/api/games', id, 'stats'],
    queryFn: () => apiRequest(`/api/games/${id}/stats`),
    enabled: !!id
  });

  // Fetch players
  const { 
    data: players = []
  } = useQuery({ 
    queryKey: ['/api/players'],
    queryFn: () => apiRequest('/api/players')
  });

  // Fetch opponents
  const { 
    data: opponents = []
  } = useQuery({ 
    queryKey: ['/api/opponents'],
    queryFn: () => apiRequest('/api/opponents')
  });

  // Set the document title
  useEffect(() => {
    if (game && game.opponentId) {
      const opponentName = getOpponentName(game.opponentId);
      document.title = `${TEAM_NAME} vs ${opponentName} | Game Details`;
    }
  }, [game]);

  if (gameLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading game details...</p>
        </div>
      </div>
    );
  }

  if (gameError) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center text-red-500">
          <p>Error loading game details.</p>
          <Button className="mt-4" asChild>
            <Link href="/games">Back to Games</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center text-red-500">
          <p>Game not found.</p>
          <Button className="mt-4" asChild>
            <Link href="/games">Back to Games</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Format the date and time
  const gameDate = formatDate(game.date);
  const gameTime = game.time;
  const round = game.round;
  
  // Get opponent name or mark as BYE
  const opponentName = game.isBye 
    ? "BYE" 
    : getOpponentName(game.opponentId);
    
  // Determine game title
  const gameTitle = game.isBye 
    ? `${TEAM_NAME} - BYE Round` 
    : `${TEAM_NAME} vs ${opponentName}`;

  // Helper functions
  const getPlayerName = (playerId) => {
    if (!playerId || !players) return null;
    const player = players.find(p => p.id === playerId);
    return player ? player.displayName : null;
  };
  
  const getPlayerColor = (playerId) => {
    if (!playerId || !players) return null;
    const player = players.find(p => p.id === playerId);
    return player ? player.avatarColor : null;
  };
  
  const getColorName = (color) => {
    const colorMap = {
      'bg-red-500': 'red',
      'bg-orange-500': 'orange',
      'bg-yellow-600': 'yellow',
      'bg-green-500': 'green',
      'bg-emerald-600': 'emerald',
      'bg-teal-600': 'teal',
      'bg-blue-600': 'blue',
      'bg-indigo-600': 'indigo',
      'bg-purple-600': 'purple',
      'bg-fuchsia-600': 'fuchsia',
      'bg-pink-600': 'pink',
      'bg-rose-600': 'rose',
      'bg-stone-500': 'gray'
    };
    return colorMap[color] || 'gray';
  };
  
  const getOpponentName = (opponentId) => {
    if (!opponentId || !opponents) return "Unknown Opponent";
    const opponent = opponents.find(p => p.id === opponentId);
    return opponent ? opponent.teamName : "Unknown Opponent";
  };

  // Get position coordinates for the court diagram
  const getPositionCoordinates = (position) => {
    // Define x and y as percentages of the court width/height
    // Adjust these based on the actual court layout
    switch (position) {
      case "GS": return { x: 30, y: 20 };
      case "GA": return { x: 70, y: 20 };
      case "WA": return { x: 30, y: 50 };
      case "C":  return { x: 50, y: 50 };
      case "WD": return { x: 70, y: 50 };
      case "GD": return { x: 30, y: 80 };
      case "GK": return { x: 70, y: 80 };
      default:   return { x: 50, y: 50 };
    }
  };

  const getPlayerPerformanceStats = (position) => {
    if (!gameStats || !position) {
      return { 
        stats: { 
          goals: 0, 
          missedGoals: 0, 
          rebounds: 0, 
          intercepts: 0, 
          assists: 0 
        } 
      };
    }
    
    // Filter stats for this position and quarter
    const positionStatsList = gameStats.filter(
      stat => stat.position === position && stat.quarter === quarter
    );
    
    if (!positionStatsList || positionStatsList.length === 0) {
      return { 
        stats: { 
          goals: 0, 
          missedGoals: 0, 
          rebounds: 0, 
          intercepts: 0, 
          assists: 0 
        } 
      };
    }
    
    const positionStats = positionStatsList[0];
    
    return {
      stats: {
        goals: positionStats.goalsFor || 0,
        missedGoals: positionStats.missedGoals || 0,
        rebounds: positionStats.rebounds || 0,
        intercepts: positionStats.intercepts || 0,
        assists: positionStats.assists || 0,
        rating: positionStats.rating
      }
    };
  };

  // Calculate quarter-by-quarter score breakdown
  const calculateQuarterScores = () => {
    if (!gameStats || gameStats.length === 0) {
      // Return empty scores for all quarters
      return Array(4).fill(0).map((_, i) => ({
        quarter: i + 1,
        teamScore: 0,
        opponentScore: 0
      }));
    }
    
    // Initialize all 4 quarters with zero scores
    const scoresByQuarter = Array(4).fill(0).map((_, i) => ({
      quarter: i + 1,
      teamScore: 0,
      opponentScore: 0
    }));
    
    // Add up the scores from game stats
    gameStats.forEach(stat => {
      const quarterIdx = stat.quarter - 1;
      if (quarterIdx >= 0 && quarterIdx < 4) {
        // Only count goals from GS and GA positions
        if (stat.position === 'GS' || stat.position === 'GA') {
          scoresByQuarter[quarterIdx].teamScore += (stat.goalsFor || 0);
        }
        
        // Count opponent goals scored against GD and GK
        if (stat.position === 'GD' || stat.position === 'GK') {
          scoresByQuarter[quarterIdx].opponentScore += (stat.goalsAgainst || 0);
        }
      }
    });
    
    return scoresByQuarter;
  };
  
  const quarterScores = calculateQuarterScores();
  
  // Calculate final score
  const finalScore = {
    teamScore: quarterScores.reduce((sum, q) => sum + q.teamScore, 0),
    opponentScore: quarterScores.reduce((sum, q) => sum + q.opponentScore, 0)
  };
  
  // Determine game result
  const teamWon = finalScore.teamScore > finalScore.opponentScore;
  const teamLost = finalScore.teamScore < finalScore.opponentScore;
  const isDraw = finalScore.teamScore === finalScore.opponentScore && game.status === 'completed';
  const isWin = teamWon && game.status === 'completed';
  const isLoss = teamLost && game.status === 'completed';
  
  // Handle status change
  const handleStatusChange = (newStatus) => {
    if (!id) return;
    
    apiRequest(`/api/games/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: newStatus
      })
    })
    .then(() => {
      queryClient.invalidateQueries({queryKey: ['/api/games']});
      queryClient.invalidateQueries({queryKey: [`/api/games/${id}`]});
      
      toast({
        title: "Game status updated",
        description: `Game status set to ${newStatus}`,
      });
      
      setStatusDialogOpen(false);
    })
    .catch(error => {
      toast({
        title: "Error updating game status",
        description: "An error occurred while updating the game status.",
        variant: "destructive"
      });
    });
  };
  
  // Organize roster data by quarter
  const rosterByQuarter = getRosterByQuarter({ roster, players });
  
  // Determine if the user can edit stats and roster
  const disableStatEditing = game.status === 'forfeit-win' || game.status === 'forfeit-loss' || game.isBye;
  const disableRosterControls = game.status === 'forfeit-win' || game.status === 'forfeit-loss' || game.isBye;
  const canEditStats = !disableStatEditing;
  const canEditRoster = !disableRosterControls && game.status !== 'completed';
  
  return (
    <>
      <Helmet>
        <title>{gameTitle} | Game Details</title>
      </Helmet>
      
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" asChild>
            <Link href="/games">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Games
            </Link>
          </Button>
          
          <GameDetailsStatusButton 
            game={game}
            onStatusChanged={(newStatus) => {
              queryClient.invalidateQueries({queryKey: ['/api/games']});
              queryClient.invalidateQueries({queryKey: [`/api/games/${id}`]});
            }}
          />
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{gameTitle}</h1>
            <div className="flex items-center mt-1 text-gray-500">
              {gameDate} at {gameTime} {round && `• ${round}`}
            </div>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-2">
            {canEditRoster && !disableRosterControls && (
              <Button asChild>
                <Link href={`/games/${id}/roster`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Roster
                </Link>
              </Button>
            )}
            
            {canEditStats && !disableStatEditing && (
              <Button variant="outline" asChild>
                <Link href={`/games/${id}/stats`}>
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Record Stats
                </Link>
              </Button>
            )}
          </div>
        </div>
        
        <Card className="mb-6">
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Score display */}
              <div>
                <h3 className="text-sm font-medium mb-2">Game Scores</h3>
                <div 
                  className={cn("flex items-center justify-between p-4 rounded-lg", {
                    "bg-green-50 border border-green-200": (teamWon && game.status === 'completed') || game.status === 'forfeit-win',
                    "bg-red-50 border border-red-200": (teamLost && game.status === 'completed') || game.status === 'forfeit-loss',
                    "bg-yellow-50 border border-yellow-200": isDraw,
                    "bg-gray-50 border border-gray-200": game.status !== 'completed' && game.status !== 'forfeit-win' && game.status !== 'forfeit-loss'
                  })}
                >
                  <div className="text-center">
                    <div className="text-sm font-medium">
                      {TEAM_NAME}
                    </div>
                    <div className="text-2xl font-bold">
                      {finalScore.teamScore}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <GameStatusBadge status={game.status || 'upcoming'} />
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm font-medium">
                      {opponentName}
                    </div>
                    <div className="text-2xl font-bold">
                      {finalScore.opponentScore}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Quarter-by-quarter breakdown */}
              <div>
                <h3 className="text-sm font-medium mb-2">Quarter Scores</h3>
                <div className="overflow-x-auto">
                  <div className="grid grid-cols-4 gap-2">
                    {quarterScores.map((score, i) => (
                      <div key={i} className="border border-gray-200 rounded p-2 text-center">
                        <div className="text-xs font-medium mb-1 text-gray-500">Q{score.quarter}</div>
                        <div className="grid grid-cols-2 gap-1">
                          <div>{score.teamScore}</div>
                          <div>{score.opponentScore}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {!disableRosterControls && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Player Positions and Statistics</CardTitle>
                <Tabs 
                  defaultValue="1" 
                  className="w-[200px]"
                  onValueChange={(value) => setQuarter(parseInt(value))}
                >
                  <TabsList className="grid grid-cols-4 w-full">
                    <TabsTrigger value="1">Q1</TabsTrigger>
                    <TabsTrigger value="2">Q2</TabsTrigger>
                    <TabsTrigger value="3">Q3</TabsTrigger>
                    <TabsTrigger value="4">Q4</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <CardDescription>
                Quarter {quarter} positions and player statistics
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                {/* Left column - Court diagram (half width) */}
                <div className="flex-1">
                  <div 
                    className="relative bg-green-100 border border-green-300 rounded-lg overflow-hidden"
                    style={{ 
                      height: '300px',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='none' stroke='%2386efac' stroke-width='2' stroke-dasharray='8' stroke-dashoffset='0' stroke-linecap='square'/%3E%3C/svg%3E")`,
                      backgroundSize: '10px 10px'
                    }}
                  >
                    {/* Horizontal center line */}
                    <div 
                      className="absolute left-0 w-full border-t-2 border-green-400"
                      style={{ top: '50%' }}
                    ></div>
                    
                    {/* Render player positions on the court diagram */}
                    {POSITIONS.map(position => {
                      const entry = rosterByQuarter[quarter]?.[position];
                      const playerName = getPlayerName(entry?.playerId);
                      const playerColor = getPlayerColor(entry?.playerId);
                      const { x, y } = getPositionCoordinates(position);
                      
                      return (
                        <PlayerCircle 
                          key={position}
                          position={position}
                          playerName={playerName}
                          playerColor={playerColor}
                          x={x}
                          y={y}
                        />
                      );
                    })}
                  </div>
                </div>
                
                {/* Right column - Roster positions with stats (half width) */}
                <div className="flex-1">
                  <div className="flex flex-col space-y-4">
                    {/* Top third - Attack positions (GS, GA) */}
                    <div className="flex justify-center space-x-4">
                      {POSITIONS.slice(0, 2).map(position => {
                        const entry = rosterByQuarter[quarter]?.[position];
                        const playerName = getPlayerName(entry?.playerId);
                        const playerColor = getPlayerColor(entry?.playerId);
                        const playerStats = getPlayerPerformanceStats(position);
                        
                        return (
                          <PositionBox
                            key={position}
                            position={position}
                            playerName={playerName}
                            playerColor={playerColor}
                            stats={{
                              goals: playerStats?.stats?.goals || 0,
                              rebounds: playerStats?.stats?.rebounds || 0,
                              intercepts: playerStats?.stats?.intercepts || 0,
                              assists: playerStats?.stats?.assists || 0
                            }}
                          />
                        );
                      })}
                    </div>
                    
                    {/* Middle third positions (WA, C, WD) */}
                    <div className="flex justify-center space-x-4">
                      {POSITIONS.slice(2, 5).map(position => {
                        const entry = rosterByQuarter[quarter]?.[position];
                        const playerName = getPlayerName(entry?.playerId);
                        const playerColor = getPlayerColor(entry?.playerId);
                        const playerStats = getPlayerPerformanceStats(position);

                        return (
                          <PositionBox
                            key={position}
                            position={position}
                            playerName={playerName}
                            playerColor={playerColor}
                            stats={{
                              goals: playerStats?.stats?.goals || 0,
                              rebounds: playerStats?.stats?.rebounds || 0,
                              intercepts: playerStats?.stats?.intercepts || 0,
                              assists: playerStats?.stats?.assists || 0
                            }}
                          />
                        );
                      })}
                    </div>
                    
                    {/* Bottom third positions (GD, GK) */}
                    <div className="flex justify-center space-x-4">
                      {POSITIONS.slice(5, 7).map(position => {
                        const entry = rosterByQuarter[quarter]?.[position];
                        const playerName = getPlayerName(entry?.playerId);
                        const playerColor = getPlayerColor(entry?.playerId);
                        const playerStats = getPlayerPerformanceStats(position);

                        return (
                          <PositionBox
                            key={position}
                            position={position}
                            playerName={playerName}
                            playerColor={playerColor}
                            stats={{
                              goals: playerStats?.stats?.goals || 0,
                              rebounds: playerStats?.stats?.rebounds || 0,
                              intercepts: playerStats?.stats?.intercepts || 0,
                              assists: playerStats?.stats?.assists || 0
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}