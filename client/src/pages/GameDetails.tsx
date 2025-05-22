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
      
      <div className="flex justify-center mx-auto w-full max-w-5xl">
        <div className="flex items-start space-x-24">
          {/* Court diagram */}
          <div className="relative w-full max-w-lg aspect-[2/3] bg-green-100 rounded-lg border border-green-300">
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
          
          {/* Vertical roster buttons */}
          <div className="flex flex-col w-[220px]">
            {/* Top third - GS, GA */}
            <div className="mb-12">
              {POSITIONS.slice(0, 2).map(position => {
                const entry = rosterByQuarter[quarter]?.[position];
                const playerName = getPlayerName(entry?.playerId);
                const playerColor = getPlayerColor(entry?.playerId);
                
                return (
                  <div 
                    key={position} 
                    className="p-3 border rounded-md shadow-sm flex flex-col mb-2"
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
            
            {/* Middle third - WA, C, WD */}
            <div className="mb-12">
              {POSITIONS.slice(2, 5).map(position => {
                const entry = rosterByQuarter[quarter]?.[position];
                const playerName = getPlayerName(entry?.playerId);
                const playerColor = getPlayerColor(entry?.playerId);
                
                return (
                  <div 
                    key={position} 
                    className="p-3 border rounded-md shadow-sm flex flex-col mb-2"
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
            
            {/* Bottom third - GD, GK */}
            <div>
              {POSITIONS.slice(5).map(position => {
                const entry = rosterByQuarter[quarter]?.[position];
                const playerName = getPlayerName(entry?.playerId);
                const playerColor = getPlayerColor(entry?.playerId);
                
                return (
                  <div 
                    key={position} 
                    className="p-3 border rounded-md shadow-sm flex flex-col mb-2"
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

// Main game details component
export default function GameDetails() {
  const { id } = useParams();
  const gameId = parseInt(id || "0");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  // Get game data
  const { data: game, isLoading: gameLoading } = useQuery({
    queryKey: [`/api/games/${gameId}`],
    enabled: gameId > 0,
  });

  // Get all players
  const { data: players = [] } = useQuery({
    queryKey: ['/api/players'],
  });

  // Get all opponents
  const { data: opponents = [] } = useQuery({
    queryKey: ['/api/opponents'],
  });

  // Get roster data for this game
  const { data: roster = [], isLoading: rosterLoading } = useQuery({
    queryKey: [`/api/games/${gameId}/rosters`],
    enabled: gameId > 0,
  });

  // Get stats data for this game
  const { data: gameStats = [], isLoading: statsLoading } = useQuery({
    queryKey: [`/api/games/${gameId}/stats`],
    enabled: gameId > 0,
  });

  // Calculate quarter scores
  const quarterScores = useMemo(() => {
    return calculateQuarterScores(gameStats, game);
  }, [gameStats, game]);

  // Calculate overall score
  const { teamScore, opponentScore, teamWon } = useMemo(() => {
    return calculateGameScores(gameStats, game);
  }, [gameStats, game]);

  if (gameLoading || rosterLoading || statsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 w-2/3 bg-slate-200 rounded mb-4"></div>
          <div className="h-64 bg-slate-200 rounded mb-4"></div>
          <div className="h-32 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Game not found</h1>
        <p className="mb-4">The game you're looking for doesn't exist or has been deleted.</p>
        <Link href="/games">
          <Button variant="outline">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Games
          </Button>
        </Link>
      </div>
    );
  }

  // Handling for forfeit games
  const isForfeit = game.status === 'forfeit-win' || game.status === 'forfeit-loss';

  return (
    <div className="p-6">
      <Helmet>
        <title>Game Details - {getOpponentName(opponents, game.opponentId)}</title>
      </Helmet>
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link href="/games">
            <Button variant="outline" size="sm" className="mr-4">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Game vs {getOpponentName(opponents, game.opponentId)}</h1>
        </div>
        
        {/* Game status badge - using the reusable component for game details page */}
        <GameDetailsStatusButton game={game} />
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">
              {formatDate(game.date)} {game.time ? `at ${game.time}` : ''}
            </CardTitle>
            <div className="flex items-center mt-1 space-x-3">
              <div className="flex items-center">
                <div className={cn(
                  "px-4 py-2 rounded-lg text-lg font-semibold",
                  teamWon ? "bg-emerald-100 text-emerald-900" : "bg-red-100 text-red-900"
                )}>
                  {teamScore} - {opponentScore}
                </div>
              </div>
              
              <Link href={`/games/${gameId}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="mr-1 h-4 w-4" />
                  Edit Game
                </Button>
              </Link>
            </div>
          </div>
          <CardDescription>
            {game.venue && (
              <div>Venue: {game.venue}</div>
            )}
            {game.round && (
              <div>Round: {game.round}</div>
            )}
          </CardDescription>
        </CardHeader>
      </Card>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <Activity className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="roster">
            <ClipboardList className="h-4 w-4 mr-2" />
            Roster
          </TabsTrigger>
          {!isForfeit && (
            <TabsTrigger value="statistics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Statistics
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Game Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-medium mb-4">Game Information</h3>
                  <div className="space-y-2">
                    <div><strong>Date:</strong> {formatDate(game.date)}</div>
                    <div><strong>Time:</strong> {game.time || 'Not specified'}</div>
                    <div><strong>Opponent:</strong> {getOpponentName(opponents, game.opponentId)}</div>
                    <div><strong>Venue:</strong> {game.venue || 'Not specified'}</div>
                    <div><strong>Round:</strong> {game.round || 'Not specified'}</div>
                    <div><strong>Status:</strong> <Badge variant="outline" className={cn("uppercase", getGameStatusColor(game.status))}>{game.status?.replace('-', ' ')}</Badge></div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Score Summary</h3>
                  <QuarterScoreCard quarterScores={quarterScores} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="roster" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Team Roster</CardTitle>
            </CardHeader>
            <CardContent>
              <CourtPositionRoster 
                roster={roster} 
                players={players} 
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        {!isForfeit && (
          <TabsContent value="statistics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Game Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <DetailedStatistics gameStats={gameStats} />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}