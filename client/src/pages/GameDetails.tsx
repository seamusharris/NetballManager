import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
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
import { formatDate } from '@/lib/utils';
import { GameStatus, Position, POSITIONS } from '@shared/schema';
import { 
  calculateGameScores, 
  getGameStatusColor 
} from '@/lib/statisticsService';

// Function to get opponent name
const getOpponentName = (opponents: any[], opponentId: number | null) => {
  if (!opponentId) return 'BYE Round';
  const opponent = opponents.find(o => o.id === opponentId);
  return opponent ? opponent.teamName : 'Unknown Opponent';
};

// Helper to get status badge display
const getStatusBadge = (status: GameStatus) => {
  const colorMap = {
    'upcoming': 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-amber-100 text-amber-800',
    'completed': 'bg-green-100 text-green-800',
    'forfeit': 'bg-red-100 text-red-800'
  };
  
  const labelMap = {
    'upcoming': 'Upcoming',
    'in-progress': 'In Progress',
    'completed': 'Completed',
    'forfeit': 'Forfeit'
  };
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorMap[status]}`}>
      {labelMap[status]}
    </span>
  );
};

// Calculate quarter by quarter scores
const calculateQuarterScores = (gameStats: any[]) => {
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
      'GS': 'bottom-10 left-1/2 transform -translate-x-1/2',
      'GA': 'bottom-24 right-12',
      'WA': 'bottom-1/2 right-10',
      'C': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
      'WD': 'top-1/2 left-10',
      'GD': 'top-24 left-12',
      'GK': 'top-10 left-1/2 transform -translate-x-1/2',
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
    };
    
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
                  width: '4rem',
                  height: '4rem',
                  borderRadius: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <div className="font-bold text-center text-sm md:text-base" style={{ color: textColor }}>{position}</div>
                {playerName && (
                  <div className="text-xs md:text-sm text-center font-medium leading-tight" style={{ color: textColor }}>{playerName}</div>
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
  // Group stats by position
  const statsByPosition = useMemo(() => {
    return gameStats.reduce((acc, stat) => {
      if (!acc[stat.position]) acc[stat.position] = [];
      acc[stat.position].push(stat);
      return acc;
    }, {});
  }, [gameStats]);
  
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

export default function GameDetails() {
  // Get game ID from URL
  const params = useParams();
  const gameId = Number(params.id);
  
  // Fetch game data
  const { data: game, isLoading: isLoadingGame } = useQuery({
    queryKey: ['/api/games', gameId],
    queryFn: async () => {
      const response = await fetch(`/api/games/${gameId}`);
      if (!response.ok) throw new Error('Failed to fetch game');
      return response.json();
    },
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
    if (!gameStats || gameStats.length === 0) return [];
    return calculateQuarterScores(gameStats);
  }, [gameStats]);
  
  // Calculate game score
  const { teamScore, opponentScore } = useMemo(() => {
    if (!gameStats || gameStats.length === 0) return { teamScore: 0, opponentScore: 0 };
    return calculateGameScores(gameStats);
  }, [gameStats]);
  
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
      
      {/* Back button + page title */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="outline" size="sm" asChild className="mr-4">
            <Link to="/games">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Games
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">
            Game Details
          </h1>
        </div>
        
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
            <Link to="#">
              <Edit className="mr-1 h-4 w-4" />
              Edit Game
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
                {getStatusBadge(game.status as GameStatus)}
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