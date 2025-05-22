import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { TEAM_NAME } from '@/lib/settings';
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
import GameStatusBadge from '@/components/games/GameStatusBadge';
import GameStatusButton from '@/components/games/GameStatusButton';
import CourtPositionRoster from '@/components/roster/CourtPositionRoster';
import { capitalize } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';
import GameDetailsStatusButton from '@/components/games/GameDetailsStatusButton';

// Simplified Position Box Component that uses StatItemBox
const PositionStatsBox = ({ position, playerName, playerColor, playerStats }) => {
  return (
    <div 
      key={position} 
      className="p-3 border rounded-md shadow-sm flex-1 flex flex-col"
      style={{ 
        backgroundColor: playerName ? `${playerColor}10` : 'white',
        border: playerName ? `2px solid ${playerColor}` : '1px solid #ddd',
      }}
    >
      {playerName && playerStats && (
        <div className="mt-1 bg-gray-50 p-3 rounded-md border border-gray-100">
          <div className="flex flex-col space-y-2 text-sm">
            <StatItemBox label="Goals" value={playerStats.stats.goals} />
            <StatItemBox label="Rebounds" value={playerStats.stats.rebounds} />
            <StatItemBox label="Int" value={playerStats.stats.intercepts} />
            <StatItemBox label="Assists" value={playerStats.stats.assists} />
          </div>
        </div>
      )}
    </div>
  );
};

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

// This is a helper component that normalizes roster data into a format easier to work with
const RosterSummary = ({ roster, players }) => {
  // Build a position-to-player lookup
  const positionData = useMemo(() => {
    if (!roster || !players) return {};
    
    return roster.reduce((acc, entry) => {
      // Each entry has: quarter, position, playerId
      if (!acc[entry.quarter]) {
        acc[entry.quarter] = {};
      }
      
      acc[entry.quarter][entry.position] = entry.playerId;
      return acc;
    }, {});
  }, [roster, players]);

  return positionData;
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
    data: roster,
    isLoading: rosterLoading
  } = useQuery({ 
    queryKey: ['/api/games', id, 'rosters'],
    queryFn: () => apiRequest(`/api/games/${id}/rosters`),
    enabled: !!id
  });

  // Fetch all players
  const { 
    data: players,
    isLoading: playersLoading
  } = useQuery({ 
    queryKey: ['/api/players'],
    queryFn: () => apiRequest('/api/players')
  });

  // Fetch game stats
  const { 
    data: gameStats,
    isLoading: statsLoading,
    refetch: refetchStats
  } = useQuery({ 
    queryKey: ['/api/games', id, 'stats'],
    queryFn: () => apiRequest(`/api/games/${id}/stats`),
    enabled: !!id
  });

  // Fetch all opponents
  const { 
    data: opponents,
    isLoading: opponentsLoading
  } = useQuery({ 
    queryKey: ['/api/opponents'],
    queryFn: () => apiRequest('/api/opponents')
  });

  const rosterByQuarter = useMemo(() => {
    return roster ? RosterSummary({ roster, players }).rosterData : {};
  }, [roster, players]);

  const getPlayerName = (playerId) => {
    if (!playerId || !players) return null;
    const player = players.find(p => p.id === playerId);
    return player ? player.displayName : null;
  };

  const getPlayerColor = (playerId) => {
    if (!playerId || !players) return null;
    const player = players.find(p => p.id === playerId);
    if (!player || !player.avatarColor) return null;
    
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
      'bg-pink-500': '#ec4899',
      'bg-rose-600': '#e11d48',
      'bg-slate-500': '#64748b',
      'bg-zinc-500': '#71717a',
      'bg-stone-500': '#78716c',
    };
    
    console.log(`Converting ${player.avatarColor} to hex: ${colorMap[player.avatarColor]} for player ${playerId}`);
    return colorMap[player.avatarColor] || '#64748b'; // Default to slate if color not found
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
    if (!gameStats || !position) return null;
    
    // Filter stats for this position and quarter
    const positionStats = gameStats.filter(
      stat => stat.position === position && stat.quarter === quarter
    )[0];
    
    if (!positionStats) return { stats: { goals: 0, missedGoals: 0, rebounds: 0, intercepts: 0, assists: 0 } };
    
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
  const quarterScores = useMemo(() => {
    if (!gameStats) return [];
    
    // Group stats by quarter
    const scoresByQuarter = gameStats.reduce((acc, stat) => {
      const quarterIdx = stat.quarter - 1;
      if (!acc[quarterIdx]) {
        acc[quarterIdx] = { 
          quarter: stat.quarter, 
          teamScore: 0, 
          opponentScore: 0 
        };
      }
      
      // Only count goals from GS and GA positions
      if (stat.position === 'GS' || stat.position === 'GA') {
        acc[quarterIdx].teamScore += (stat.goalsFor || 0);
      }
      
      // Count opponent goals scored against GD and GK
      if (stat.position === 'GD' || stat.position === 'GK') {
        acc[quarterIdx].opponentScore += (stat.goalsAgainst || 0);
      }
      
      return acc;
    }, []);
    
    // Fill in any missing quarters (in case there are no stats for a quarter yet)
    const filledScores = [];
    for (let i = 0; i < 4; i++) {
      filledScores[i] = scoresByQuarter[i] || { 
        quarter: i + 1, 
        teamScore: 0, 
        opponentScore: 0 
      };
    }
    
    // Generate running totals
    const runningTotals = filledScores.reduce((acc, current, index) => {
      if (index === 0) {
        acc.push({
          quarter: current.quarter,
          teamTotal: current.teamScore,
          opponentTotal: current.opponentScore,
          teamQuarter: current.teamScore,
          opponentQuarter: current.opponentScore
        });
      } else {
        acc.push({
          quarter: current.quarter,
          teamTotal: acc[index - 1].teamTotal + current.teamScore,
          opponentTotal: acc[index - 1].opponentTotal + current.opponentScore,
          teamQuarter: current.teamScore,
          opponentQuarter: current.opponentScore
        });
      }
      return acc;
    }, []);
    
    return runningTotals;
  }, [gameStats]);

  const finalScore = quarterScores.length > 0 ? {
    teamScore: quarterScores.reduce((sum, q) => sum + q.teamQuarter, 0),
    opponentScore: quarterScores.reduce((sum, q) => sum + q.opponentQuarter, 0)
  } : { teamScore: 0, opponentScore: 0 };

  const teamWon = finalScore.teamScore > finalScore.opponentScore;
  const teamLost = finalScore.teamScore < finalScore.opponentScore;
  const isDraw = finalScore.teamScore === finalScore.opponentScore && game?.status === 'completed';

  // Set score for forfeit games and bye rounds
  useEffect(() => {
    if (game?.status === 'forfeit-win') {
      // Set a default score of 10-0 for forfeit wins
      finalScore.teamScore = 10;
      finalScore.opponentScore = 0;
    } else if (game?.status === 'forfeit-loss') {
      // Set a default score of 0-10 for forfeit losses
      finalScore.teamScore = 0;
      finalScore.opponentScore = 10;
    } else if (game?.isBye) {
      // BYE rounds have no score
      finalScore.teamScore = 0;
      finalScore.opponentScore = 0;
    }
  }, [game]);

  // Handler for status change
  const handleStatusChange = async (newStatus) => {
    if (!id) return;
    
    try {
      await apiRequest(`/api/games/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      
      // Invalidate and refetch game data
      queryClient.invalidateQueries(['/api/games', id]);
      queryClient.invalidateQueries(['/api/games']);
      
      toast({
        title: "Game updated!",
        description: `Game status changed to ${newStatus}`,
      });
      
      setStatusDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error updating game",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (gameLoading || rosterLoading || playersLoading || opponentsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-2xl font-semibold mb-2">Loading game details...</div>
          <div className="text-gray-500">Please wait</div>
        </div>
      </div>
    );
  }

  if (gameError || !game) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-2xl font-semibold mb-2">Game not found</div>
          <div className="text-gray-500 mb-4">The game you're looking for doesn't exist</div>
          <Button asChild>
            <Link href="/games">Back to Games</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Format game date and time
  const gameDate = formatDate(game.date);
  const gameTime = game.time;
  
  // Get opponent name
  const opponentName = getOpponentName(game.opponentId);
  const round = game.round ? `Round ${game.round}` : "";
  const gameTitle = `${TEAM_NAME} vs ${opponentName}`;

  // Based on the game status, determine if we can edit rosters & stats
  const canEditRoster = game.status !== 'forfeit-win' && game.status !== 'forfeit-loss' && !game.isBye;
  const canEditStats = game.status !== 'forfeit-win' && game.status !== 'forfeit-loss' && !game.isBye;
  
  // Disable roster controls for "in progress" games
  const disableRosterControls = game.status === 'in-progress' || game.status === 'completed';
  
  return (
    <>
      <Helmet>
        <title>{gameTitle} | Netball Stats</title>
      </Helmet>
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/games" className="flex items-center">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Games
            </Link>
          </Button>
          
          <GameDetailsStatusButton 
            gameId={parseInt(id)}
            currentStatus={game.status as GameStatus}
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
            
            {canEditStats && game.status !== 'upcoming' && (
              <Button asChild variant="outline">
                <Link href={`/games/${id}/stats`}>
                  <ClipboardList className="mr-2 h-4 w-4" />
                  {statsLoading ? "Loading Stats..." : "Edit Statistics"}
                </Link>
              </Button>
            )}
          </div>
        </div>
        
        {/* Score overview */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="font-bold text-lg">Game Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Score display */}
              <div>
                <h3 className="text-sm font-medium mb-2">Game Scores</h3>
                <div 
                  className={cn("flex items-center justify-between p-4 rounded-lg", {
                    "bg-green-50 border border-green-200": teamWon && game.status === 'completed',
                    "bg-red-50 border border-red-200": teamLost && game.status === 'completed',
                    "bg-yellow-50 border border-yellow-200": isDraw,
                    "bg-gray-50 border border-gray-200": game.status !== 'completed' && game.status !== 'forfeit-win' && game.status !== 'forfeit-loss',
                    "bg-green-50 border border-green-200": game.status === 'forfeit-win',
                    "bg-red-50 border border-red-200": game.status === 'forfeit-loss'
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
                  
                  <div className="text-xl font-bold text-gray-400">vs</div>
                  
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
              
              {/* Quarter Scores */}
              <div>
                <h3 className="text-sm font-medium mb-2">Quarter Scores</h3>
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                  <div className="grid grid-cols-5 gap-1 text-center">
                    <div className="font-medium text-gray-500"></div>
                    {quarterScores.map(score => (
                      <div key={`q-${score.quarter}`} className="font-medium text-gray-500">
                        Q{score.quarter}
                      </div>
                    ))}
                    
                    <div className="font-medium text-gray-800">{TEAM_NAME}</div>
                    {quarterScores.map(score => (
                      <div key={`team-${score.quarter}`} className="font-medium">
                        {score.teamQuarter}
                      </div>
                    ))}
                    
                    <div className="font-medium text-gray-800">{opponentName}</div>
                    {quarterScores.map(score => (
                      <div key={`opp-${score.quarter}`} className="font-medium">
                        {score.opponentQuarter}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      
        {/* Court and positions display */}
        {canEditRoster && !game.isBye && (
          <Card>
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <CardTitle>Court Positions</CardTitle>
                <Tabs 
                  defaultValue="1" 
                  className="w-auto" 
                  value={quarter.toString()}
                  onValueChange={(value) => setQuarter(parseInt(value))}
                >
                  <TabsList>
                    <TabsTrigger value="1">Q1</TabsTrigger>
                    <TabsTrigger value="2">Q2</TabsTrigger>
                    <TabsTrigger value="3">Q3</TabsTrigger>
                    <TabsTrigger value="4">Q4</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Left column - Court diagram (half width) */}
                <div className="flex-1 relative">
                  {/* Court diagram goes here */}
                  <div 
                    className="border-2 border-blue-600 rounded-md bg-blue-50 relative mx-auto"
                    style={{
                      width: '100%',
                      height: '380px', // Fixed height
                      maxWidth: '500px'
                    }}
                  >
                    {/* Court center line */}
                    <div 
                      className="absolute bg-blue-600" 
                      style={{ height: '2px', width: '100%', top: '50%' }}
                    />
                    
                    {/* Court circle */}
                    <div 
                      className="absolute rounded-full border-2 border-blue-600"
                      style={{ 
                        width: '80px', 
                        height: '80px', 
                        left: '50%', 
                        top: '50%', 
                        transform: 'translate(-50%, -50%)' 
                      }}
                    />
                    
                    {/* Player positions */}
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
                  <div className="flex flex-col space-y-0 justify-between h-full">
                    {/* Top third - Attack positions (GS, GA) */}
                    <div className="flex space-x-3 my-3 items-start" style={{ height: '33%' }}>
                      {POSITIONS.slice(0, 2).map(position => {
                        const entry = rosterByQuarter[quarter]?.[position];
                        const playerName = getPlayerName(entry?.playerId);
                        const playerColor = getPlayerColor(entry?.playerId);
                        const playerStats = getPlayerPerformanceStats(position);
                        
                        return (
                          <PositionStatsBox
                            position={position}
                            playerName={playerName}
                            playerColor={playerColor}
                            playerStats={playerStats}
                          />
                        );
                      })}
                    </div>
                    
                    {/* Middle third positions (WA, C, WD) */}
                    <div className="flex space-x-3 my-3" style={{ height: '33%' }}>
                      {POSITIONS.slice(2, 5).map(position => {
                        const entry = rosterByQuarter[quarter]?.[position];
                        const playerName = getPlayerName(entry?.playerId);
                        const playerColor = getPlayerColor(entry?.playerId);
                        const playerStats = getPlayerPerformanceStats(position);
                        
                        return (
                          <PositionStatsBox
                            position={position}
                            playerName={playerName}
                            playerColor={playerColor}
                            playerStats={playerStats}
                          />
                        );
                      })}
                    </div>
                    
                    {/* Bottom third - Defense positions (GD, GK) */}
                    <div className="flex space-x-3 my-3" style={{ height: '33%' }}>
                      {POSITIONS.slice(5).map(position => {
                        const entry = rosterByQuarter[quarter]?.[position];
                        const playerName = getPlayerName(entry?.playerId);
                        const playerColor = getPlayerColor(entry?.playerId);
                        const playerStats = getPlayerPerformanceStats(position);
                        
                        return (
                          <PositionStatsBox
                            position={position}
                            playerName={playerName}
                            playerColor={playerColor}
                            playerStats={playerStats}
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
        
        {/* For BYE rounds or forfeits */}
        {(game.isBye || game.status === 'forfeit-win' || game.status === 'forfeit-loss') && (
          <Card>
            <CardHeader>
              <CardTitle>
                {game.isBye ? "BYE Round" : (game.status === 'forfeit-win' ? "Forfeit Win" : "Forfeit Loss")}
              </CardTitle>
              <CardDescription>
                {game.isBye 
                  ? "This is a bye round. No game is played."
                  : (game.status === 'forfeit-win' 
                      ? `${opponentName} forfeited this game.`
                      : `${TEAM_NAME} forfeited this game.`
                    )
                }
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </>
  );
}