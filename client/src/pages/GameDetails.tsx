import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { TEAM_NAME } from '@/lib/settings';
import { StatItemBox } from '@/components/games/StatItemBox';
import { PositionStatsBox } from '@/components/games/PositionStatsBox';
import { PositionBox } from '@/components/games/PositionBox';
import { GamePositionStatsBox } from '@/components/games/GamePositionStatsBox';
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
    const positionStat = gameStats?.find?.(
      stat => stat.position === position && stat.quarter === quarter
    );
    
    // Return position-specific relevant statistics
    const stats = {
      // Common stats for all positions
      intercepts: positionStat?.intercepts || 0,
      badPass: positionStat?.badPass || 0,
      handlingError: positionStat?.handlingError || 0
    };
    
    // Add position-specific stats
    if (position === 'GS' || position === 'GA') {
      // Attacking positions
      return {
        playerId: entry.playerId,
        name: playerName,
        stats: {
          ...stats,
          goals: positionStat?.goalsFor || 0,
          missedGoals: positionStat?.missedGoals || 0,
          rebounds: positionStat?.rebounds || 0
        }
      };
    } else if (position === 'GD' || position === 'GK') {
      // Defending positions
      return {
        playerId: entry.playerId,
        name: playerName,
        stats: {
          ...stats,
          goalsAgainst: positionStat?.goalsAgainst || 0,
          rebounds: positionStat?.rebounds || 0,
          pickUp: positionStat?.pickUp || 0
        }
      };
    } else {
      // Mid-court positions (WA, C, WD)
      return {
        playerId: entry.playerId,
        name: playerName,
        stats: {
          ...stats,
          pickUp: positionStat?.pickUp || 0,
          rebounds: positionStat?.rebounds || 0,
          infringement: positionStat?.infringement || 0
        }
      };
    }
  };
  
  // Helper function to render position-specific stats
  const renderPositionStats = (position, playerStats) => {
    if (position === 'GS' || position === 'GA') {
      return (
        <>
          <StatItemBox label="Goals" value={playerStats.stats.goals} />
          <StatItemBox label="Missed Goals" value={playerStats.stats.missedGoals} />
          <StatItemBox label="Rebounds" value={playerStats.stats.rebounds} />
        </>
      );
    } else if (position === 'GD' || position === 'GK') {
      return (
        <>
          <StatItemBox label="Goals Against" value={playerStats.stats.goalsAgainst} />
          <StatItemBox label="Rebounds" value={playerStats.stats.rebounds} />
          <StatItemBox label="Pick Ups" value={playerStats.stats.pickUp} />
        </>
      );
    } else {
      return (
        <>
          <StatItemBox label="Pick Ups" value={playerStats.stats.pickUp} />
          <StatItemBox label="Rebounds" value={playerStats.stats.rebounds} />
          <StatItemBox label="Infringements" value={playerStats.stats.infringement} />
        </>
      );
    }
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
      
      {/* Horizontal court layout with stats below */}
      <div className="flex flex-col gap-6 max-w-7xl mx-auto px-4">
        {/* Horizontal court diagram - significantly taller and more proportional to an actual netball court */}
        <div className="relative w-full mx-auto h-96 bg-green-100 rounded-lg border border-green-300 shadow-md">
          {/* Court markings - only the three equal vertical sections for horizontal layout */}
          <div className="absolute inset-0 flex flex-row">
            <div className="w-1/3 border-r border-green-500"></div>
            <div className="w-1/3 border-r border-green-500"></div>
            <div className="w-1/3"></div>
          </div>

          {/* Updated position coordinates for horizontal court */}
          {POSITIONS.map(position => {
            const entry = rosterByQuarter[quarter]?.[position];
            const playerName = getPlayerName(entry?.playerId);
            const playerColor = getPlayerColor(entry?.playerId);
            
            // Use the player's avatar color for the background
            const bgColor = playerName ? playerColor : 'white';
            
            // Use white text for player positions, red for unassigned
            const textColor = playerName ? 'white' : '#ef4444'; // Red color for unassigned
            
            // New position coordinates for horizontal court with horizontal offsets
            const horizontalPositions = {
              // Attack end - left side
              'GS': 'top-[25%] left-[13%] -translate-x-1/2 -translate-y-1/2',
              'GA': 'top-[75%] left-[20%] -translate-x-1/2 -translate-y-1/2',
              
              // Mid-court - center
              'WA': 'top-[25%] left-[47%] -translate-x-1/2 -translate-y-1/2',
              'C': 'top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2',
              'WD': 'top-[75%] left-[53%] -translate-x-1/2 -translate-y-1/2',
              
              // Defense end - right side
              'GD': 'top-[25%] left-[80%] -translate-x-1/2 -translate-y-1/2',
              'GK': 'top-[75%] left-[87%] -translate-x-1/2 -translate-y-1/2',
            };
            
            const positionClass = horizontalPositions[position] || '';
            
            return (
              <div key={position} className={`absolute ${positionClass}`}>
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
                  <div className="font-bold text-center text-lg" style={{ color: textColor }}>{position}</div>
                  {playerName && (
                    <div className="text-sm text-center font-medium leading-tight" style={{ color: textColor }}>{playerName}</div>
                  )}
                  {!playerName && (
                    <div className="text-sm text-red-500 text-center">Unassigned</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Stats boxes in horizontal grid below the court */}
        <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
          {/* All positions in a single row */}
          {POSITIONS.map(position => {
            const entry = rosterByQuarter[quarter]?.[position];
            const playerName = getPlayerName(entry?.playerId);
            const playerColor = getPlayerColor(entry?.playerId);
            const playerStats = getPlayerPerformanceStats(position);
            
            return (
              <div key={position} className="col-span-1">
                <PositionBox 
                  position={position as Position}
                  playerName={playerName}
                  playerColor={playerColor}
                  playerStats={playerStats}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Position statistics renderer
const StatisticsByPosition = ({ gameStats }) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  
  // Group stats by position
  const statsByPosition = useMemo(() => {
    return gameStats.reduce((acc, stat) => {
      if (!acc[stat.position]) {
        acc[stat.position] = {};
      }
      
      if (!acc[stat.position][stat.quarter]) {
        acc[stat.position][stat.quarter] = {};
      }
      
      acc[stat.position][stat.quarter] = stat;
      return acc;
    }, {} as Record<string, Record<number, any>>);
  }, [gameStats]);
  
  // Get combined stats across quarters
  const combinedStats = useMemo(() => {
    return Object.entries(statsByPosition).reduce((acc: any, [position, quarters]) => {
      acc[position] = Object.values(quarters).reduce((stats: any, curr: any) => {
        stats.goalsFor = (stats.goalsFor || 0) + (curr.goalsFor || 0);
        stats.goalsAgainst = (stats.goalsAgainst || 0) + (curr.goalsAgainst || 0);
        stats.missedGoals = (stats.missedGoals || 0) + (curr.missedGoals || 0);
        stats.intercepts = (stats.intercepts || 0) + (curr.intercepts || 0);
        stats.rebounds = (stats.rebounds || 0) + (curr.rebounds || 0);
        stats.handlingError = (stats.handlingError || 0) + (curr.handlingError || 0);
        stats.badPass = (stats.badPass || 0) + (curr.badPass || 0);
        stats.pickUp = (stats.pickUp || 0) + (curr.pickUp || 0);
        stats.infringement = (stats.infringement || 0) + (curr.infringement || 0);
        return stats;
      }, {});
      return acc;
    }, {});
  }, [statsByPosition]);
  
  return (
    <div className="space-y-4">
      {POSITIONS.map(position => {
        const stats = combinedStats[position] || {};
        const isEmpty = Object.values(stats).every(val => !val);
        
        return (
          <Card key={position} className={isEmpty ? 'border-dashed' : ''}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">Position {position}</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setExpanded(expanded === position ? null : position)}
                >
                  {expanded === position ? 'Hide Details' : 'Show Details'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isEmpty ? (
                <div className="text-center text-gray-400 py-2">No statistics recorded</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-y-2 gap-x-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Goals For:</span>
                    <span className="font-medium">{stats.goalsFor || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Goals Against:</span>
                    <span className="font-medium">{stats.goalsAgainst || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Intercepts:</span>
                    <span className="font-medium">{stats.intercepts || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Rebounds:</span>
                    <span className="font-medium">{stats.rebounds || 0}</span>
                  </div>
                </div>
              )}
              
              {expanded === position && !isEmpty && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium mb-2">Quarter Breakdown</h4>
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map(quarter => {
                      const quarterStats = statsByPosition[position]?.[quarter] || {};
                      const hasStats = Object.values(quarterStats).some(val => val);
                      
                      if (!hasStats) return (
                        <div key={quarter} className="text-sm text-gray-400">
                          Q{quarter}: No statistics recorded
                        </div>
                      );
                      
                      return (
                        <div key={quarter} className="bg-gray-50 p-3 rounded-md">
                          <div className="font-medium mb-2">Quarter {quarter}</div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-1 gap-x-4 text-sm">
                            {quarterStats.goalsFor !== undefined && (
                              <div className="flex justify-between">
                                <span className="text-gray-500">Goals For:</span>
                                <span>{quarterStats.goalsFor}</span>
                              </div>
                            )}
                            {quarterStats.goalsAgainst !== undefined && (
                              <div className="flex justify-between">
                                <span className="text-gray-500">Goals Against:</span>
                                <span>{quarterStats.goalsAgainst}</span>
                              </div>
                            )}
                            {quarterStats.missedGoals !== undefined && (
                              <div className="flex justify-between">
                                <span className="text-gray-500">Missed Goals:</span>
                                <span>{quarterStats.missedGoals}</span>
                              </div>
                            )}
                            {quarterStats.intercepts !== undefined && (
                              <div className="flex justify-between">
                                <span className="text-gray-500">Intercepts:</span>
                                <span>{quarterStats.intercepts}</span>
                              </div>
                            )}
                            {quarterStats.rebounds !== undefined && (
                              <div className="flex justify-between">
                                <span className="text-gray-500">Rebounds:</span>
                                <span>{quarterStats.rebounds}</span>
                              </div>
                            )}
                            {quarterStats.handlingError !== undefined && (
                              <div className="flex justify-between">
                                <span className="text-gray-500">Handling Errors:</span>
                                <span>{quarterStats.handlingError}</span>
                              </div>
                            )}
                            {quarterStats.badPass !== undefined && (
                              <div className="flex justify-between">
                                <span className="text-gray-500">Bad Passes:</span>
                                <span>{quarterStats.badPass}</span>
                              </div>
                            )}
                            {quarterStats.pickUp !== undefined && (
                              <div className="flex justify-between">
                                <span className="text-gray-500">Pick Ups:</span>
                                <span>{quarterStats.pickUp}</span>
                              </div>
                            )}
                            {quarterStats.infringement !== undefined && (
                              <div className="flex justify-between">
                                <span className="text-gray-500">Infringements:</span>
                                <span>{quarterStats.infringement}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

// Quarter scores display
const QuarterScores = ({ quarterScores }) => {
  // Reshape the data to be quarter-by-quarter for easier rendering
  const scoringByQuarter = useMemo(() => {
    return quarterScores.reduce((acc, current, index) => {
      acc.push({
        quarter: index + 1,
        teamScore: current.teamScore,
        opponentScore: current.opponentScore
      });
      return acc;
    }, []);
  }, [quarterScores]);
  
  // Calculate total scores
  const totalTeamScore = quarterScores.reduce((sum, q) => sum + q.teamScore, 0);
  const totalOpponentScore = quarterScores.reduce((sum, q) => sum + q.opponentScore, 0);
  
  // Calculate cumulative scores by quarter
  const cumulativeScores = useMemo(() => {
    let teamRunningTotal = 0;
    let opponentRunningTotal = 0;
    
    return scoringByQuarter.map(score => {
      teamRunningTotal += score.teamScore;
      opponentRunningTotal += score.opponentScore;
      
      return {
        quarter: score.quarter,
        teamScore: score.teamScore,
        opponentScore: score.opponentScore,
        cumulativeTeamScore: teamRunningTotal,
        cumulativeOpponentScore: opponentRunningTotal
      };
    });
  }, [scoringByQuarter]);
  
  // Check if the team is winning, losing, or tied
  let scoreStatus;
  let statusColor;
  
  if (totalTeamScore > totalOpponentScore) {
    scoreStatus = 'winning';
    statusColor = 'bg-green-500';
  } else if (totalTeamScore < totalOpponentScore) {
    scoreStatus = 'losing';
    statusColor = 'bg-red-500';
  } else {
    scoreStatus = 'tied';
    statusColor = 'bg-amber-500';
  }
  
  return (
    <div>
      <div className="mt-4 max-w-2xl mx-auto">
        <div className={`rounded-md overflow-hidden border ${
          totalTeamScore > totalOpponentScore ? 'border-green-300' :
          totalTeamScore < totalOpponentScore ? 'border-red-300' : 'border-amber-300'
        }`}>
          <div className={`text-white p-4 text-center ${statusColor}`}>
            <div className="flex justify-center items-center text-xl">
              <span className="font-bold text-3xl">{totalTeamScore}</span>
              <span className="mx-4">-</span>
              <span className="font-bold text-3xl">{totalOpponentScore}</span>
            </div>
          </div>
          <div className="bg-white p-6">
            <div className="grid grid-cols-2 gap-10">
              <div className="border-r pr-4">
                <div className="text-center mb-3 font-medium text-base text-gray-700">Quarter Scores</div>
                <div className="grid grid-cols-4 gap-4">
                  {scoringByQuarter.map(score => (
                    <div key={`q-${score.quarter}`} className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Q{score.quarter}</div>
                      <div className="font-medium text-lg">
                        {score.teamScore}-{score.opponentScore}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pl-4">
                <div className="text-center mb-3 font-medium text-base text-gray-700">Game Scores</div>
                <div className="grid grid-cols-4 gap-4">
                  {cumulativeScores.map(score => (
                    <div key={`cumulative-${score.quarter}`} className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Q{score.quarter}</div>
                      <div className="font-medium text-lg">
                        {score.cumulativeTeamScore}-{score.cumulativeOpponentScore}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function GameDetails() {
  const { id } = useParams();
  const gameId = parseInt(id);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('roster');
  
  // Fetch game data
  const { 
    data: game,
    isLoading: isLoadingGame
  } = useQuery({
    queryKey: ['/api/games', gameId],
    queryFn: () => fetch(`/api/games/${gameId}`).then(res => res.json()),
    enabled: !isNaN(gameId)
  });
  
  // Fetch players
  const { 
    data: players,
    isLoading: isLoadingPlayers
  } = useQuery({
    queryKey: ['/api/players'],
    queryFn: () => fetch('/api/players').then(res => res.json())
  });
  
  // Fetch opponents
  const { 
    data: opponents,
    isLoading: isLoadingOpponents
  } = useQuery({
    queryKey: ['/api/opponents'],
    queryFn: () => fetch('/api/opponents').then(res => res.json())
  });
  
  // Fetch roster for this game
  const { 
    data: roster,
    isLoading: isLoadingRoster
  } = useQuery({
    queryKey: ['/api/games', gameId, 'rosters'],
    queryFn: () => fetch(`/api/games/${gameId}/rosters`).then(res => res.json()),
    enabled: !isNaN(gameId)
  });
  
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
      
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Button variant="outline" size="sm" asChild>
              <Link to="/games">
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back
              </Link>
            </Button>
            
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
          
          <h1 className="text-2xl font-bold">
            {game.opponentId ? (
              <span>
                {TEAM_NAME} vs {opponentName}
              </span>
            ) : (
              <span>BYE Round</span>
            )}
          </h1>
          
          <div className="text-gray-500">
            {formatDate(game.date)} {game.time && `at ${game.time}`}
            {game.location && ` · ${game.location}`}
            {game.round && ` · Round ${game.round}`}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {!isForfeitGame && (
            <Button asChild>
              <Link to={`/game/${gameId}/stats`}>
                <BarChart3 className="mr-2 h-4 w-4" />
                View Statistics
              </Link>
            </Button>
          )}
        </div>
      </div>
      
      {/* Show quarter scores summary */}
      <QuarterScores quarterScores={quarterScores} />
      
      <div className="mt-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="roster">
              <ClipboardList className="mr-2 h-4 w-4" />
              Court Positions
            </TabsTrigger>
            <TabsTrigger value="stats">
              <Activity className="mr-2 h-4 w-4" />
              Position Statistics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="roster" className="mt-6">
            {roster && roster.length > 0 ? (
              <CourtPositionRoster 
                roster={roster} 
                players={players || []}
                gameStats={gameStats || []}
              />
            ) : (
              <div className="text-center py-10 border rounded-lg bg-gray-50">
                <h3 className="text-lg font-medium mb-2">No roster assigned</h3>
                <p className="text-gray-500 mb-4">There are no positions assigned for this game yet.</p>
                <Button asChild>
                  <Link to={`/game/${gameId}/roster`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Set Up Roster
                  </Link>
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="stats" className="mt-6">
            {isForfeitGame ? (
              <div className="text-center py-10 border rounded-lg bg-gray-50">
                <h3 className="text-lg font-medium mb-2">Forfeit Game</h3>
                <p className="text-gray-500">
                  This game was a {game.status === 'forfeit-win' ? 'forfeit win' : 'forfeit loss'}.
                  No statistics are recorded for forfeit games.
                </p>
              </div>
            ) : gameStats && gameStats.length > 0 ? (
              <StatisticsByPosition gameStats={gameStats} />
            ) : (
              <div className="text-center py-10 border rounded-lg bg-gray-50">
                <h3 className="text-lg font-medium mb-2">No statistics recorded</h3>
                <p className="text-gray-500 mb-4">There are no statistics recorded for this game yet.</p>
                <Button asChild>
                  <Link to={`/games/${gameId}/stats`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Record Statistics
                  </Link>
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}