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
      
      <div className="flex justify-center my-4">
        <div className="flex items-start space-x-16">
          {/* Court diagram */}
          <div className="relative w-full max-w-lg aspect-[2/3] bg-green-100 rounded-lg border border-green-300">
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
          
          {/* Position roster buttons arranged by court thirds */}
          <div className="flex flex-col justify-between h-[500px] w-[220px]">
            {/* Top third - GS, GA */}
            <div className="flex flex-col space-y-2">
              {POSITIONS.slice(0, 2).map(position => {
                const entry = rosterByQuarter[quarter]?.[position];
                const playerName = getPlayerName(entry?.playerId);
                const playerColor = getPlayerColor(entry?.playerId);
                
                return (
                  <div 
                    key={position} 
                    className="p-3 border rounded-md shadow-sm flex flex-col"
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
            <div className="flex flex-col space-y-2">
              {POSITIONS.slice(2, 5).map(position => {
                const entry = rosterByQuarter[quarter]?.[position];
                const playerName = getPlayerName(entry?.playerId);
                const playerColor = getPlayerColor(entry?.playerId);
                
                return (
                  <div 
                    key={position} 
                    className="p-3 border rounded-md shadow-sm flex flex-col"
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
            <div className="flex flex-col space-y-2">
              {POSITIONS.slice(5).map(position => {
                const entry = rosterByQuarter[quarter]?.[position];
                const playerName = getPlayerName(entry?.playerId);
                const playerColor = getPlayerColor(entry?.playerId);
                
                return (
                  <div 
                    key={position} 
                    className="p-3 border rounded-md shadow-sm flex flex-col"
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
              <tr key={stat.position} className="border-b hover:bg-slate-50">
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

// Score breakdown component
const ScoreBreakdown = ({ quarterScores }) => {
  // Calculate totals
  const totals = quarterScores.reduce((acc, current, index) => {
    acc.teamTotal += current.teamScore;
    acc.opponentTotal += current.opponentScore;
    
    return acc;
  }, { teamTotal: 0, opponentTotal: 0 });
  
  // Determine win/loss/draw
  const teamWon = totals.teamTotal > totals.opponentTotal;
  const isDraw = totals.teamTotal === totals.opponentTotal;
  
  return (
    <div className="my-4">
      <h3 className="text-lg font-medium mb-4">Score Breakdown</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-4 py-2 text-left">Quarter</th>
              <th className="px-4 py-2 text-center">Team Score</th>
              <th className="px-4 py-2 text-center">Opponent Score</th>
              <th className="px-4 py-2 text-center">Difference</th>
            </tr>
          </thead>
          <tbody>
            {quarterScores.map(score => {
              const diff = score.teamScore - score.opponentScore;
              return (
                <tr key={`Q${score.quarter}`} className="border-b hover:bg-slate-50">
                  <td className="px-4 py-2 font-medium">Quarter {score.quarter}</td>
                  <td className="px-4 py-2 text-center">{score.teamScore}</td>
                  <td className="px-4 py-2 text-center">{score.opponentScore}</td>
                  <td className={`px-4 py-2 text-center ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : ''}`}>
                    {diff > 0 ? `+${diff}` : diff}
                  </td>
                </tr>
              );
            })}
            <tr className="bg-slate-100 font-semibold">
              <td className="px-4 py-2">Final Score</td>
              <td className="px-4 py-2 text-center">{totals.teamTotal}</td>
              <td className="px-4 py-2 text-center">{totals.opponentTotal}</td>
              <td className={`px-4 py-2 text-center ${teamWon ? 'text-green-600' : isDraw ? '' : 'text-red-600'}`}>
                {teamWon ? `+${totals.teamTotal - totals.opponentTotal}` : 
                 isDraw ? '0' : 
                 totals.teamTotal - totals.opponentTotal}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function GameDetails() {
  const { id } = useParams();
  const gameId = parseInt(id);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Use default tab of 'roster' unless coming from a stats-focused page
  const [activeTab, setActiveTab] = useState('roster');
  
  const { data: game, isLoading: gameLoading } = useQuery({
    queryKey: [`/api/games/${gameId}`],
    enabled: !isNaN(gameId),
  });
  
  const { data: players, isLoading: playersLoading } = useQuery({
    queryKey: ['/api/players'],
  });
  
  const { data: opponents, isLoading: opponentsLoading } = useQuery({
    queryKey: ['/api/opponents'],
  });
  
  const { data: roster, isLoading: rosterLoading } = useQuery({
    queryKey: [`/api/games/${gameId}/rosters`],
    enabled: !isNaN(gameId),
  });
  
  const { data: gameStats, isLoading: statsLoading } = useQuery({
    queryKey: [`/api/games/${gameId}/stats`],
    enabled: !isNaN(gameId),
  });
  
  // Calculate the scores based on the game stats
  const scores = calculateGameScores(game, gameStats);
  const isForfeit = game?.status === 'forfeit-win' || game?.status === 'forfeit-loss';
  
  // Calculate quarter scores
  const quarterScores = useMemo(() => {
    if (!game || (!gameStats && !isForfeit)) return [];
    return calculateQuarterScores(gameStats || [], game);
  }, [game, gameStats, isForfeit]);
  
  // Overall game result for display
  const teamScore = quarterScores.reduce((sum, q) => sum + q.teamScore, 0);
  const opponentScore = quarterScores.reduce((sum, q) => sum + q.opponentScore, 0);
  const teamWon = teamScore > opponentScore;
  const isDraw = teamScore === opponentScore;
  const resultText = teamWon ? 'Win' : isDraw ? 'Draw' : 'Loss';
  
  const isLoading = gameLoading || playersLoading || opponentsLoading || rosterLoading || statsLoading;
  
  // Function to render the game status with actions available based on the current status
  const renderGameStatusActions = (game) => {
    if (!game) return null;
    
    return (
      <GameDetailsStatusButton 
        game={game}
        onStatusChange={() => {
          // Invalidate game data after status change
          queryClient.invalidateQueries([`/api/games/${gameId}`]);
        }}
      />
    );
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center mb-4">
          <Link href="/games">
            <a className="flex items-center text-blue-600 hover:text-blue-800">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Games
            </a>
          </Link>
        </div>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="h-24 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <Helmet>
        <title>{`Game Details - ${getOpponentName(opponents || [], game?.opponentId)}`}</title>
      </Helmet>
      
      <div className="flex items-center mb-4">
        <Link href="/games">
          <Button variant="ghost" className="flex items-center p-0 mr-4">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Games
          </Button>
        </Link>
        
        <h1 className="text-2xl font-bold flex-grow">
          Game Details
        </h1>
        
        {renderGameStatusActions(game)}
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl">
                {game?.opponentId ? getOpponentName(opponents || [], game?.opponentId) : "BYE Round"}
              </CardTitle>
              <CardDescription>
                {formatDate(game?.date)} {game?.time && `at ${game?.time}`}
                {game?.venue && ` - ${game?.venue}`}
                {game?.round && ` - Round ${game?.round}`}
              </CardDescription>
            </div>
            
            <div className="flex flex-col items-end">
              {/* Score display with win/loss color coding */}
              <div 
                className={cn(
                  "px-4 py-2 rounded-md text-white text-center font-bold",
                  teamWon ? "bg-green-600" : 
                  isDraw ? "bg-amber-500" : 
                  "bg-red-600"
                )}
              >
                <span className="block text-lg">
                  {teamScore} - {opponentScore}
                </span>
                <span className="text-sm">{resultText}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="roster" className="flex items-center">
                <ClipboardList className="h-4 w-4 mr-2" />
                Roster
              </TabsTrigger>
              
              <TabsTrigger 
                value="stats" 
                className="flex items-center"
                disabled={isForfeit}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Statistics
              </TabsTrigger>
              
              <TabsTrigger value="scores" className="flex items-center">
                <Activity className="h-4 w-4 mr-2" />
                Scores
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="roster">
              <CourtPositionRoster roster={roster || []} players={players || []} quarter={1} />
            </TabsContent>
            
            <TabsContent value="stats">
              {isForfeit ? (
                <div className="text-center p-8 border rounded-md bg-gray-50">
                  <p className="text-lg text-gray-700">Statistics are not available for forfeit games.</p>
                </div>
              ) : (
                <DetailedStatistics gameStats={gameStats || []} />
              )}
            </TabsContent>
            
            <TabsContent value="scores">
              <ScoreBreakdown quarterScores={quarterScores} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}