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
      
      <div className="flex flex-row space-x-8 justify-center">
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
        
        {/* Vertical roster buttons with thirds alignment */}
        <div className="flex flex-col min-w-[200px] h-full">
          {/* Top third - GS, GA */}
          <div className="flex flex-col space-y-2 mb-auto">
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
          <div className="flex flex-col space-y-2 my-auto">
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
          <div className="flex flex-col space-y-2 mt-auto">
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
      if (!acc[stat.position]) {
        acc[stat.position] = [];
      }
      acc[stat.position].push(stat);
      return acc;
    }, {});
  }, [deduplicatedStats]);
  
  // Format stat with appropriate prefix
  const formatStat = (value) => {
    if (value === 0) return '0';
    if (!value) return '-';
    return value;
  };
  
  // Convert position stats map into array of objects for display
  const positionStats = useMemo(() => {
    return Object.entries(statsByPosition).map(([position, stats]) => {
      // Sort by quarter
      const sortedStats = [...stats].sort((a, b) => a.quarter - b.quarter);
      
      // Create a stats object with quarter totals
      return {
        position,
        quarters: sortedStats,
        totals: {
          goalsFor: sortedStats.reduce((sum, q) => sum + (q.goalsFor || 0), 0),
          goalsAgainst: sortedStats.reduce((sum, q) => sum + (q.goalsAgainst || 0), 0),
          missedGoals: sortedStats.reduce((sum, q) => sum + (q.missedGoals || 0), 0),
          rebounds: sortedStats.reduce((sum, q) => sum + (q.rebounds || 0), 0),
          intercepts: sortedStats.reduce((sum, q) => sum + (q.intercepts || 0), 0),
          badPass: sortedStats.reduce((sum, q) => sum + (q.badPass || 0), 0),
          handlingError: sortedStats.reduce((sum, q) => sum + (q.handlingError || 0), 0),
          pickUp: sortedStats.reduce((sum, q) => sum + (q.pickUp || 0), 0),
          infringement: sortedStats.reduce((sum, q) => sum + (q.infringement || 0), 0),
        }
      };
    });
  }, [statsByPosition]);

  return (
    <div className="mt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {positionStats.map(stat => (
          <Card key={stat.position} className="shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between items-center">
                <span>Position: {stat.position}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-2">Statistic</th>
                      <th className="text-center p-2">Q1</th>
                      <th className="text-center p-2">Q2</th>
                      <th className="text-center p-2">Q3</th>
                      <th className="text-center p-2">Q4</th>
                      <th className="text-center p-2 font-bold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="even:bg-muted/30">
                      <td className="p-2 font-medium">Goals For</td>
                      {[1, 2, 3, 4].map(q => {
                        const quarterStat = stat.quarters.find(s => s.quarter === q);
                        return (
                          <td key={q} className="text-center p-2">
                            {formatStat(quarterStat?.goalsFor)}
                          </td>
                        );
                      })}
                      <td className="text-center p-2 font-bold">{formatStat(stat.totals.goalsFor)}</td>
                    </tr>
                    <tr className="odd:bg-muted/30">
                      <td className="p-2 font-medium">Goals Against</td>
                      {[1, 2, 3, 4].map(q => {
                        const quarterStat = stat.quarters.find(s => s.quarter === q);
                        return (
                          <td key={q} className="text-center p-2">
                            {formatStat(quarterStat?.goalsAgainst)}
                          </td>
                        );
                      })}
                      <td className="text-center p-2 font-bold">{formatStat(stat.totals.goalsAgainst)}</td>
                    </tr>
                    <tr className="even:bg-muted/30">
                      <td className="p-2 font-medium">Missed Goals</td>
                      {[1, 2, 3, 4].map(q => {
                        const quarterStat = stat.quarters.find(s => s.quarter === q);
                        return (
                          <td key={q} className="text-center p-2">
                            {formatStat(quarterStat?.missedGoals)}
                          </td>
                        );
                      })}
                      <td className="text-center p-2 font-bold">{formatStat(stat.totals.missedGoals)}</td>
                    </tr>
                    <tr className="odd:bg-muted/30">
                      <td className="p-2 font-medium">Rebounds</td>
                      {[1, 2, 3, 4].map(q => {
                        const quarterStat = stat.quarters.find(s => s.quarter === q);
                        return (
                          <td key={q} className="text-center p-2">
                            {formatStat(quarterStat?.rebounds)}
                          </td>
                        );
                      })}
                      <td className="text-center p-2 font-bold">{formatStat(stat.totals.rebounds)}</td>
                    </tr>
                    <tr className="even:bg-muted/30">
                      <td className="p-2 font-medium">Intercepts</td>
                      {[1, 2, 3, 4].map(q => {
                        const quarterStat = stat.quarters.find(s => s.quarter === q);
                        return (
                          <td key={q} className="text-center p-2">
                            {formatStat(quarterStat?.intercepts)}
                          </td>
                        );
                      })}
                      <td className="text-center p-2 font-bold">{formatStat(stat.totals.intercepts)}</td>
                    </tr>
                    <tr className="odd:bg-muted/30">
                      <td className="p-2 font-medium">Bad Passes</td>
                      {[1, 2, 3, 4].map(q => {
                        const quarterStat = stat.quarters.find(s => s.quarter === q);
                        return (
                          <td key={q} className="text-center p-2">
                            {formatStat(quarterStat?.badPass)}
                          </td>
                        );
                      })}
                      <td className="text-center p-2 font-bold">{formatStat(stat.totals.badPass)}</td>
                    </tr>
                    <tr className="even:bg-muted/30">
                      <td className="p-2 font-medium">Handling Errors</td>
                      {[1, 2, 3, 4].map(q => {
                        const quarterStat = stat.quarters.find(s => s.quarter === q);
                        return (
                          <td key={q} className="text-center p-2">
                            {formatStat(quarterStat?.handlingError)}
                          </td>
                        );
                      })}
                      <td className="text-center p-2 font-bold">{formatStat(stat.totals.handlingError)}</td>
                    </tr>
                    <tr className="odd:bg-muted/30">
                      <td className="p-2 font-medium">Pick Ups</td>
                      {[1, 2, 3, 4].map(q => {
                        const quarterStat = stat.quarters.find(s => s.quarter === q);
                        return (
                          <td key={q} className="text-center p-2">
                            {formatStat(quarterStat?.pickUp)}
                          </td>
                        );
                      })}
                      <td className="text-center p-2 font-bold">{formatStat(stat.totals.pickUp)}</td>
                    </tr>
                    <tr className="even:bg-muted/30">
                      <td className="p-2 font-medium">Infringements</td>
                      {[1, 2, 3, 4].map(q => {
                        const quarterStat = stat.quarters.find(s => s.quarter === q);
                        return (
                          <td key={q} className="text-center p-2">
                            {formatStat(quarterStat?.infringement)}
                          </td>
                        );
                      })}
                      <td className="text-center p-2 font-bold">{formatStat(stat.totals.infringement)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Quarter scores component
const QuarterScores = ({ quarterScores }) => {
  const cumulativeScores = quarterScores.reduce((acc, current, index) => {
    if (index === 0) {
      return [
        {
          quarter: current.quarter,
          teamScore: current.teamScore,
          opponentScore: current.opponentScore,
          cumulativeTeamScore: current.teamScore,
          cumulativeOpponentScore: current.opponentScore
        }
      ];
    }
    
    const prevCumulative = acc[index - 1];
    return [
      ...acc,
      {
        quarter: current.quarter,
        teamScore: current.teamScore,
        opponentScore: current.opponentScore,
        cumulativeTeamScore: prevCumulative.cumulativeTeamScore + current.teamScore,
        cumulativeOpponentScore: prevCumulative.cumulativeOpponentScore + current.opponentScore
      }
    ];
  }, []);

  return (
    <div className="mt-4">
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle>Quarter by Quarter Scores</CardTitle>
          <CardDescription>Score progression throughout the game</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-2">Quarter</th>
                  <th className="text-center p-2">Team Score</th>
                  <th className="text-center p-2">Opponent Score</th>
                  <th className="text-center p-2">Running Team Score</th>
                  <th className="text-center p-2">Running Opponent Score</th>
                  <th className="text-center p-2">Margin</th>
                </tr>
              </thead>
              <tbody>
                {cumulativeScores.map(score => {
                  const scoreMargin = score.cumulativeTeamScore - score.cumulativeOpponentScore;
                  const marginClass = scoreMargin > 0 ? 'text-green-600' : (scoreMargin < 0 ? 'text-red-600' : 'text-gray-600');
                  
                  return (
                    <tr key={score.quarter} className={score.quarter % 2 === 0 ? 'even:bg-muted/30' : 'odd:bg-muted/30'}>
                      <td className="p-2 font-medium">Quarter {score.quarter}</td>
                      <td className="text-center p-2">{score.teamScore}</td>
                      <td className="text-center p-2">{score.opponentScore}</td>
                      <td className="text-center p-2 font-bold">{score.cumulativeTeamScore}</td>
                      <td className="text-center p-2 font-bold">{score.cumulativeOpponentScore}</td>
                      <td className={`text-center p-2 font-bold ${marginClass}`}>
                        {scoreMargin > 0 ? '+' : ''}{scoreMargin}
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-muted/70 font-bold">
                  <td className="p-2">Final</td>
                  <td className="text-center p-2">
                    {cumulativeScores.reduce((sum, q) => sum + q.teamScore, 0)}
                  </td>
                  <td className="text-center p-2">
                    {cumulativeScores.reduce((sum, q) => sum + q.opponentScore, 0)}
                  </td>
                  <td className="text-center p-2">
                    {cumulativeScores[cumulativeScores.length - 1]?.cumulativeTeamScore || 0}
                  </td>
                  <td className="text-center p-2">
                    {cumulativeScores[cumulativeScores.length - 1]?.cumulativeOpponentScore || 0}
                  </td>
                  <td className="text-center p-2">
                    {(() => {
                      const finalMargin = 
                        (cumulativeScores[cumulativeScores.length - 1]?.cumulativeTeamScore || 0) - 
                        (cumulativeScores[cumulativeScores.length - 1]?.cumulativeOpponentScore || 0);
                      const marginClass = finalMargin > 0 ? 'text-green-600' : (finalMargin < 0 ? 'text-red-600' : 'text-gray-600');
                      return <span className={marginClass}>{finalMargin > 0 ? '+' : ''}{finalMargin}</span>;
                    })()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Game details header component
const GameDetailsHeader = ({ game, opponents, gameStats = [] }) => {
  const opponentName = getOpponentName(opponents, game?.opponentId);
  const gameDate = game?.date ? formatDate(game.date) : 'TBD';
  const gameTime = game?.time || 'TBD';
  const gameLocation = game?.location || 'TBD';
  
  // Calculate game scores
  const scores = calculateGameScores(gameStats);
  
  return (
    <div>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link href="/games">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="font-bold text-2xl md:text-3xl">Game Details</h1>
        </div>
        <div>
          {game && <GameDetailsStatusButton game={game} />}
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Game Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Date:</span> {gameDate}
              </div>
              <div>
                <span className="font-medium">Time:</span> {gameTime}
              </div>
              <div>
                <span className="font-medium">Location:</span> {gameLocation}
              </div>
              <div>
                <span className="font-medium">Opponent:</span> {opponentName}
              </div>
              <div>
                <span className="font-medium">Round:</span> {game?.round || 'N/A'}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center space-x-4 text-2xl font-bold">
              <div 
                className={`py-2 px-4 rounded-md ${scores.teamScore > scores.opponentScore ? 'bg-green-100 text-green-800' : scores.teamScore < scores.opponentScore ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}
              >
                <span className="text-lg font-normal">Our Team</span>
                <div className="text-3xl">{scores.teamScore}</div>
              </div>
              <div className="text-xl">vs.</div>
              <div 
                className={`py-2 px-4 rounded-md ${scores.teamScore < scores.opponentScore ? 'bg-green-100 text-green-800' : scores.teamScore > scores.opponentScore ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}
              >
                <span className="text-lg font-normal">{opponentName}</span>
                <div className="text-3xl">{scores.opponentScore}</div>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <Badge className={scores.teamScore > scores.opponentScore ? 'bg-green-500 hover:bg-green-600' : 
                                scores.teamScore < scores.opponentScore ? 'bg-red-500 hover:bg-red-600' : 
                                'bg-gray-500 hover:bg-gray-600'}>
                {scores.teamScore > scores.opponentScore ? 'Win' : 
                 scores.teamScore < scores.opponentScore ? 'Loss' : 
                 'Draw'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default function GameDetails() {
  const { id } = useParams();
  const gameId = parseInt(id);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Game data
  const { data: game, isLoading: gameLoading, error: gameError } = useQuery({
    queryKey: ['/api/games', gameId],
    queryFn: () => fetch(`/api/games/${gameId}`).then(r => r.json()),
    enabled: !!gameId,
  });
  
  // Game stats
  const { data: gameStats = [], isLoading: statsLoading } = useQuery({
    queryKey: ['/api/games', gameId, 'stats'],
    queryFn: () => fetch(`/api/games/${gameId}/stats`).then(r => r.json()),
    enabled: !!gameId,
  });

  // Game roster data
  const { data: roster = [], isLoading: rosterLoading } = useQuery({
    queryKey: ['/api/games', gameId, 'rosters'],
    queryFn: () => fetch(`/api/games/${gameId}/rosters`).then(r => r.json()),
    enabled: !!gameId,
  });
  
  // Load all players 
  const { data: players = [], isLoading: playersLoading } = useQuery({
    queryKey: ['/api/players'],
    queryFn: () => fetch('/api/players').then(r => r.json()),
  });
  
  // Load all opponents
  const { data: opponents = [], isLoading: opponentsLoading } = useQuery({
    queryKey: ['/api/opponents'],
    queryFn: () => fetch('/api/opponents').then(r => r.json()),
  });
  
  // Calculate quarter by quarter scores 
  const quarterScores = useMemo(() => {
    if (!game || !gameStats.length) return [];
    return calculateQuarterScores(gameStats, game);
  }, [game, gameStats]);
  
  const isLoading = gameLoading || statsLoading || rosterLoading || playersLoading || opponentsLoading;
  
  // Handle error states
  if (gameError) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Link href="/games">
              <Button variant="outline" size="icon" className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="font-bold text-2xl">Game Details</h1>
          </div>
        </div>
        <Card className="w-full shadow-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Game</CardTitle>
          </CardHeader>
          <CardContent>
            <p>There was a problem loading this game. It may have been deleted or the ID is invalid.</p>
            <Link href="/games">
              <Button className="mt-4">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Games
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6">
      <Helmet>
        <title>Game Details - Netball Team Manager</title>
      </Helmet>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-lg">Loading game details...</p>
          </div>
        </div>
      ) : (
        <>
          <GameDetailsHeader game={game} opponents={opponents} gameStats={stats} />
          
          <div className="mt-6">
            <Tabs defaultValue="court">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="court">Court Positions</TabsTrigger>
                <TabsTrigger value="quarters">Quarter Scores</TabsTrigger>
                <TabsTrigger 
                  value="statistics" 
                  disabled={game?.status === 'forfeit-win' || game?.status === 'forfeit-loss'}
                >
                  Position Statistics
                </TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="court" className="mt-4">
                <CourtPositionRoster roster={roster} players={players} />
              </TabsContent>
              
              <TabsContent value="quarters" className="mt-4">
                <QuarterScores quarterScores={quarterScores} />
              </TabsContent>
              
              <TabsContent value="statistics" className="mt-4">
                {game?.status === 'forfeit-win' || game?.status === 'forfeit-loss' ? (
                  <Card className="shadow-md">
                    <CardHeader>
                      <CardTitle>No Statistics Available</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Position statistics are not available for forfeit games.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <DetailedStatistics gameStats={gameStats} />
                )}
              </TabsContent>
              
              <TabsContent value="actions" className="mt-4">
                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle>Game Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Link href={`/roster?gameId=${gameId}`}>
                        <Button className="w-full flex items-center justify-center" variant="outline">
                          <ClipboardList className="mr-2 h-4 w-4" />
                          Edit Roster
                        </Button>
                      </Link>
                      
                      {(game?.status !== 'forfeit-win' && game?.status !== 'forfeit-loss') && (
                        <Link href={`/live-stats?gameId=${gameId}`}>
                          <Button className="w-full flex items-center justify-center" variant="outline">
                            <Activity className="mr-2 h-4 w-4" />
                            Track Statistics
                          </Button>
                        </Link>
                      )}
                      
                      <Link href={`/live-stats-by-position?gameId=${gameId}`}>
                        <Button 
                          className="w-full flex items-center justify-center" 
                          variant="outline"
                          disabled={game?.status === 'forfeit-win' || game?.status === 'forfeit-loss'}
                        >
                          <BarChart3 className="mr-2 h-4 w-4" />
                          Position Statistics
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </>
      )}
    </div>
  );
}