import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { TEAM_NAME } from '@/lib/settings';
import { StatItemBox } from '@/components/games/StatItemBox';
import { PositionStatsBox } from '@/components/games/PositionStatsBox';
import { PositionBox } from '@/components/games/PositionBox';
import { GamePositionStatsBox } from '@/components/games/GamePositionStatsBox';
import GameForm from '@/components/games/GameForm';
import PrintableRoster from '@/components/roster/PrintableRoster';
import PrintableRosterSummary from '@/components/roster/PrintableRosterSummary';
import PrintableStatsSheet from '@/components/stats/PrintableStatsSheet';
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
  ChevronLeft, Edit, BarChart3, ClipboardList, Activity, CalendarRange, ActivitySquare, Trash2,
  FileText, Printer
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { formatDate, cn, tailwindToHex } from '@/lib/utils';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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

// Component to display player statistics from their positions played
const PlayerStatsByQuarter = ({ roster, players, gameStats }: { roster: any[], players: any[], gameStats: any[] }) => {
  const [activeQuarter, setActiveQuarter] = useState<number>(0); // 0 means all quarters
  
  // Calculate player statistics by combining all positions they played
  const playerStats = useMemo(() => {
    // Create a set of all unique player IDs in the roster
    const uniquePlayerIds = new Set<number>();
    
    // Create a mapping of player ID to positions they played in each quarter
    const playerPositions: Record<number, { playerId: number, positions: Record<number, string> }> = {};
    
    // Add all players from roster
    roster.forEach(entry => {
      if (!entry.playerId) return;
      
      uniquePlayerIds.add(entry.playerId);
      
      if (!playerPositions[entry.playerId]) {
        playerPositions[entry.playerId] = {
          playerId: entry.playerId,
          positions: {}
        };
      }
      
      playerPositions[entry.playerId].positions[entry.quarter] = entry.position;
    });
    
    // For each player in the game, calculate their statistics
    const result: Record<number, any> = {};
    
    // Make sure all players in the roster are included
    players.forEach(player => {
      if (!uniquePlayerIds.has(player.id)) return;
      
      // Initialize stats for every player in the roster
      result[player.id] = {
        playerId: player.id,
        name: getPlayerName(players, player.id),
        color: getPlayerColor(players, player.id),
        quarterStats: {} as Record<number, any>,
        totalStats: {
          goals: 0,
          missedGoals: 0,
          goalsAgainst: 0,
          rebounds: 0,
          intercepts: 0,
          badPass: 0,
          handlingError: 0,
          pickUp: 0,
          infringement: 0
        }
      };
    });
    
    // Then calculate stats based on positions played
    Object.values(playerPositions).forEach(player => {
      // Get the player stats entry we created
      const playerStat = result[player.playerId];
      
      // Get stats for each quarter the player played in
      Object.entries(player.positions).forEach(([quarter, position]) => {
        const quarterNum = parseInt(quarter);
        // Find stat for this position and quarter
        const positionStat = gameStats.find(
          stat => stat.position === position && stat.quarter === quarterNum
        );
        
        if (positionStat) {
          // Initialize quarter stats if not already there
          if (!playerStat.quarterStats[quarterNum]) {
            playerStat.quarterStats[quarterNum] = {
              position,
              goals: 0,
              missedGoals: 0,
              goalsAgainst: 0,
              rebounds: 0,
              intercepts: 0,
              badPass: 0,
              handlingError: 0,
              pickUp: 0,
              infringement: 0
            };
          }
          
          // Add stats from this position in this quarter
          const stats = playerStat.quarterStats[quarterNum];
          
          // Increment stats based on what was recorded for this position
          if (position === 'GS' || position === 'GA') {
            stats.goals += positionStat.goalsFor || 0;
            stats.missedGoals += positionStat.missedGoals || 0;
          }
          
          if (position === 'GD' || position === 'GK') {
            stats.goalsAgainst += positionStat.goalsAgainst || 0;
          }
          
          // Common stats for all positions
          stats.rebounds += positionStat.rebounds || 0;
          stats.intercepts += positionStat.intercepts || 0;
          stats.badPass += positionStat.badPass || 0;
          stats.handlingError += positionStat.handlingError || 0;
          stats.pickUp += positionStat.pickUp || 0;
          stats.infringement += positionStat.infringement || 0;
          
          // Add to total stats
          playerStat.totalStats.goals += position === 'GS' || position === 'GA' ? (positionStat.goalsFor || 0) : 0;
          playerStat.totalStats.missedGoals += position === 'GS' || position === 'GA' ? (positionStat.missedGoals || 0) : 0;
          playerStat.totalStats.goalsAgainst += position === 'GD' || position === 'GK' ? (positionStat.goalsAgainst || 0) : 0;
          playerStat.totalStats.rebounds += positionStat.rebounds || 0;
          playerStat.totalStats.intercepts += positionStat.intercepts || 0;
          playerStat.totalStats.badPass += positionStat.badPass || 0;
          playerStat.totalStats.handlingError += positionStat.handlingError || 0;
          playerStat.totalStats.pickUp += positionStat.pickUp || 0;
          playerStat.totalStats.infringement += positionStat.infringement || 0;
        }
      });
      
      // Add player to results
      result[player.playerId] = playerStat;
    });
    
    return Object.values(result);
  }, [roster, players, gameStats]);
  
  // Helper function to get player name (moved from elsewhere in the file)
  function getPlayerName(players: any[], playerId: number) {
    if (!players || !playerId) return null;
    const player = players.find(p => p.id === playerId);
    return player ? (player.displayName || `${player.firstName} ${player.lastName}`) : null;
  }
  
  // Helper function to get player color (moved from elsewhere in the file)
  function getPlayerColor(players: any[], playerId: number) {
    if (!players || !playerId) return '#cccccc';
    const player = players.find(p => p.id === playerId);
    
    // First, check if we need to use a default color
    if (!player || !player.avatarColor || player.avatarColor === '#FFFFFF' || player.avatarColor === '#ffffff') {
      // Use a very obvious, distinctive color based on player ID for maximum visibility
      const defaultColors = [
        '#FF5733', '#33FF57', '#3357FF', '#F033FF', '#FF33F0', 
        '#33FFF0', '#F0FF33', '#8C33FF', '#FF8C33', '#33FF8C'
      ];
      return defaultColors[playerId % defaultColors.length];
    }
    
    // Check if the avatarColor is a Tailwind class (starts with 'bg-')
    if (player.avatarColor.startsWith('bg-')) {
      return convertTailwindToHex(player.avatarColor);
    }
    
    // If it's already a hex color, return it
    return player.avatarColor;
  }
  
  // Convert Tailwind color classes to hex color values
  function convertTailwindToHex(tailwindClass: string) {
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
    
    return colorMap[tailwindClass] || '#6366f1'; // default to indigo-500 if not found
  }
  
  // Render a quarter tab/button
  const renderQuarterButton = (quarter: number) => (
    <Button 
      key={quarter} 
      variant={activeQuarter === quarter ? "default" : "outline"} 
      size="sm"
      onClick={() => setActiveQuarter(quarter)}
      className="min-w-[60px]"
    >
      {quarter === 0 ? "All" : `Q${quarter}`}
    </Button>
  );
  
  // Render a player's statistics box
  const renderPlayerStatsBox = (player: any) => {
    // For 'All' quarters, use totalStats
    // For specific quarters, use quarterStats or create empty stats if not available
    let relevantStats;
    
    if (activeQuarter === 0) {
      relevantStats = player.totalStats;
    } else {
      // If no stats for this quarter, create empty stats object with zeros
      if (!player.quarterStats[activeQuarter]) {
        // Find position from roster
        const rosterEntry = roster.find(r => 
          r.playerId === player.playerId && r.quarter === activeQuarter
        );
        
        relevantStats = {
          position: rosterEntry?.position || 'N/A',
          goals: 0,
          missedGoals: 0,
          goalsAgainst: 0,
          rebounds: 0,
          intercepts: 0,
          badPass: 0,
          handlingError: 0,
          pickUp: 0,
          infringement: 0
        };
      } else {
        relevantStats = player.quarterStats[activeQuarter];
      }
    }
    
    // These stats are displayed for all players regardless of position
    return (
      <div 
        key={player.playerId}
        className="p-3 border rounded-md shadow-sm mb-4"
        style={{ 
          backgroundColor: `${player.color}10`,
          borderColor: player.color
        }}
      >
        <div className="flex justify-between items-center mb-3">
          <div 
            className="font-semibold text-lg"
            style={{ color: player.color }}
          >
            {player.name}
          </div>
          {activeQuarter > 0 && (
            <div className="text-sm bg-gray-100 px-2 py-1 rounded">
              {relevantStats.position || "N/A"}
            </div>
          )}
        </div>
        
        <div className="mt-1 bg-gray-50 p-3 rounded-md border border-gray-100">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              {/* Left column stats - shown for all players */}
              <StatItemBox label="Goals" value={relevantStats.goals || 0} />
              <StatItemBox label="Missed Goals" value={relevantStats.missedGoals || 0} />
              <StatItemBox label="Goals Against" value={relevantStats.goalsAgainst || 0} />
              <StatItemBox label="Rebounds" value={relevantStats.rebounds || 0} />
              <StatItemBox label="Intercepts" value={relevantStats.intercepts || 0} />
            </div>
            <div className="space-y-2">
              {/* Right column stats - shown for all players */}
              <StatItemBox label="Bad Pass" value={relevantStats.badPass || 0} />
              <StatItemBox label="Handling Errors" value={relevantStats.handlingError || 0} />
              <StatItemBox label="Pick Ups" value={relevantStats.pickUp || 0} />
              <StatItemBox label="Infringements" value={relevantStats.infringement || 0} />
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div>
      <div className="mb-4 flex justify-center items-center">
        <div className="flex gap-2">
          {[0, 1, 2, 3, 4].map(q => renderQuarterButton(q))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {playerStats
          .sort((a, b) => {
            // Sort players alphabetically by display name
            if (!a.name) return 1;
            if (!b.name) return -1;
            return a.name.localeCompare(b.name);
          })
          .map(player => renderPlayerStatsBox(player))
        }
      </div>
    </div>
  );
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
const CourtPositionRoster = ({ roster, players, gameStats }) => {
  const [quarter, setQuarter] = useState(1);
  
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
  const getPlayerName = (playerId: number) => {
    if (!players || !playerId) return 'Unassigned';
    const player = players.find(p => p.id === playerId);
    return player ? (player.displayName || `${player.firstName} ${player.lastName}`) : 'Unassigned';
  };

  // Helper to get player color
  const getPlayerColor = (playerId: number) => {
    if (!players || !playerId) return '#e11d48'; // Red for unassigned
    const player = players.find(p => p.id === playerId);
    return player?.avatarColor || '#e11d48';
  };

  // Get performance indicators for a position
  const getPositionPerformance = (position: string) => {
    if (!gameStats || gameStats.length === 0) return null;
    
    // Find stats for this position in this quarter
    const stat = gameStats.find(s => 
      s.position === position && s.quarter === quarter
    );
    
    if (!stat) return null;
    
    // Calculate primary and secondary stats based on position
    const primaryStats = {};
    const secondaryStats = {};
    
    // Use the centralized position stats configuration
    primaryPositionStats[position]?.forEach(statKey => {
      primaryStats[statKey] = stat[statKey] || 0;
    });
    
    secondaryPositionStats[position]?.forEach(statKey => {
      secondaryStats[statKey] = stat[statKey] || 0;
    });
    
    return {
      primaryStats,
      secondaryStats,
      rating: stat.rating || null
    };
  };
  
  // Render position box for court diagram
  const renderPositionBox = (position: Position) => {
    const quarterRoster = rosterByQuarter[quarter] || {};
    const rosterEntry = quarterRoster[position];
    const playerId = rosterEntry?.playerId;
    const playerName = getPlayerName(playerId);
    const playerColor = getPlayerColor(playerId);
    const positionPerformance = getPositionPerformance(position);
    
    return (
      <div 
        className={`absolute ${getPositionCoordinates(position)}`}
        key={position}
      >
        <PositionBox 
          position={position}
          playerName={playerName}
          color={playerColor}
          performanceData={positionPerformance}
          showPlayerRating
          showPerformanceIndicators
        />
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6 flex justify-center">
        <div className="flex space-x-2">
          {[1, 2, 3, 4].map(q => (
            <Button 
              key={q}
              variant={quarter === q ? "default" : "outline"}
              size="sm"
              onClick={() => setQuarter(q)}
            >
              Quarter {q}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="relative w-full max-w-2xl mx-auto h-[500px] border-2 border-gray-300 rounded-lg bg-green-100/50">
        {/* Court dividing line */}
        <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gray-300 transform -translate-y-1/2"></div>
        
        {/* Center circle */}
        <div className="absolute top-1/2 left-1/2 w-24 h-24 border-2 border-gray-300 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        
        {/* Shooting circles */}
        <div className="absolute top-0 left-1/2 w-[160px] h-[160px] border-2 border-gray-300 rounded-full transform -translate-x-1/2"></div>
        <div className="absolute bottom-0 left-1/2 w-[160px] h-[160px] border-2 border-gray-300 rounded-full transform -translate-x-1/2"></div>
        
        {/* Position boxes */}
        {POSITIONS.map(position => renderPositionBox(position as Position))}
      </div>
      
      <div className="mt-8 space-y-4">
        <h3 className="text-lg font-semibold">Positions by Quarter</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(q => {
            // Get roster for this quarter
            const quarterRoster = rosterByQuarter[q] || {};
            
            return (
              <Card key={q} className={cn(
                "border",
                quarter === q ? "ring-2 ring-primary" : ""
              )}>
                <CardHeader className="py-3">
                  <CardTitle className="text-base">Quarter {q}</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  {POSITIONS.map(position => {
                    const rosterEntry = quarterRoster[position as Position];
                    const playerId = rosterEntry?.playerId;
                    const playerName = getPlayerName(playerId);
                    const playerColor = getPlayerColor(playerId);
                    
                    const isUnassigned = !playerId;
                    
                    return (
                      <div 
                        key={position} 
                        className="flex items-center justify-between py-1 border-b last:border-0"
                      >
                        <div className="font-medium text-sm">{position}</div>
                        <div 
                          className={cn(
                            "px-2 py-1 rounded text-sm",
                            isUnassigned ? "bg-red-600 text-white" : "bg-gray-100"
                          )}
                          style={!isUnassigned ? { 
                            backgroundColor: `${playerColor}20`,
                            color: playerColor
                          } : {}}
                        >
                          {isUnassigned ? "—" : playerName}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Component to summarize position statistics across all quarters
const PositionStatsSummary = ({ gameStats }) => {
  // Group stats by position
  const statsByPosition = useMemo(() => {
    const result = {};
    
    POSITIONS.forEach(position => {
      // Get all stats for this position across all quarters
      const positionStats = gameStats.filter(stat => stat.position === position);
      
      if (positionStats.length === 0) {
        result[position] = {
          position,
          quarters: [],
          totalStats: {
            goalsFor: 0,
            goalsAgainst: 0,
            missedGoals: 0,
            rebounds: 0,
            intercepts: 0,
            badPass: 0,
            handlingError: 0,
            pickUp: 0,
            infringement: 0,
            rating: null
          }
        };
        return;
      }
      
      // Calculate total stats across all quarters
      const totalStats = positionStats.reduce((total, stat) => {
        return {
          goalsFor: (total.goalsFor || 0) + (stat.goalsFor || 0),
          goalsAgainst: (total.goalsAgainst || 0) + (stat.goalsAgainst || 0),
          missedGoals: (total.missedGoals || 0) + (stat.missedGoals || 0),
          rebounds: (total.rebounds || 0) + (stat.rebounds || 0),
          intercepts: (total.intercepts || 0) + (stat.intercepts || 0),
          badPass: (total.badPass || 0) + (stat.badPass || 0),
          handlingError: (total.handlingError || 0) + (stat.handlingError || 0),
          pickUp: (total.pickUp || 0) + (stat.pickUp || 0),
          infringement: (total.infringement || 0) + (stat.infringement || 0)
        };
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
      
      // Calculate average rating if ratings exist
      const ratingsCount = positionStats.filter(s => s.rating !== null && s.rating !== undefined).length;
      const ratingSum = positionStats.reduce((sum, s) => sum + (s.rating || 0), 0);
      const averageRating = ratingsCount > 0 ? Math.round(ratingSum / ratingsCount) : null;
      
      // Add average rating to total stats
      totalStats.rating = averageRating;
      
      // Save result
      result[position] = {
        position,
        quarters: positionStats.map(s => s.quarter),
        totalStats
      };
    });
    
    return result;
  }, [gameStats]);
  
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {POSITIONS.map(position => {
          const positionData = statsByPosition[position];
          if (!positionData) return null;
          
          // Get primary and secondary stats based on position
          const primaryStats = {};
          const secondaryStats = {};
          
          primaryPositionStats[position]?.forEach(statKey => {
            primaryStats[statKey] = positionData.totalStats[statKey] || 0;
          });
          
          secondaryPositionStats[position]?.forEach(statKey => {
            secondaryStats[statKey] = positionData.totalStats[statKey] || 0;
          });
          
          return (
            <PositionStatsBox
              key={position}
              position={position}
              quarters={positionData.quarters}
              primaryStats={primaryStats}
              secondaryStats={secondaryStats}
              rating={positionData.totalStats.rating}
            />
          );
        })}
      </div>
    </div>
  );
};

// Function to render game score summary with quarter breakdown
const GameScoreSummary = ({ gameStats, gameStatus }) => {
  // Calculate quarter scores
  const quarterScores = useMemo(() => {
    return [1, 2, 3, 4].map(quarter => {
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
  }, [gameStats]);
  
  // Calculate total scores
  const totalScores = useMemo(() => {
    const team = quarterScores.reduce((sum, q) => sum + q.teamScore, 0);
    const opponent = quarterScores.reduce((sum, q) => sum + q.opponentScore, 0);
    
    return {
      team,
      opponent,
      result: team > opponent ? 'win' : team < opponent ? 'loss' : 'draw'
    };
  }, [quarterScores]);
  
  // Handle forfeit games separately
  const isForfeit = gameStatus === 'forfeit-win' || gameStatus === 'forfeit-loss';
  const isWin = gameStatus === 'forfeit-win';
  
  // Use fixed scores for forfeit games: 10-0 for win, 0-10 for loss
  const forfeitScores = {
    team: isWin ? 10 : 0,
    opponent: isWin ? 0 : 10,
    result: isWin ? 'win' : 'loss'
  };
  
  // Use forfeit scores if it's a forfeit game
  const scores = isForfeit ? forfeitScores : totalScores;
  
  // Helper to get result styling
  const getResultStyles = (result) => {
    if (result === 'win') return 'bg-green-100 text-green-800 border-green-300';
    if (result === 'loss') return 'bg-red-100 text-red-800 border-red-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Score</CardTitle>
      </CardHeader>
      <CardContent>
        {isForfeit ? (
          <div className="text-center py-4">
            <div className={`inline-block px-4 py-2 rounded-md border ${getResultStyles(scores.result)}`}>
              <span className="text-xl font-bold">
                {isWin ? 'Forfeit Win (10-0)' : 'Forfeit Loss (0-10)'}
              </span>
            </div>
            <div className="mt-2 text-gray-500">
              {isWin 
                ? 'The opposing team forfeited this game.' 
                : 'This game was forfeited.'}
            </div>
          </div>
        ) : (
          <>
            <div className="text-center py-4">
              <div className={`inline-block px-4 py-2 rounded-md border ${getResultStyles(scores.result)}`}>
                <span className="text-3xl font-bold">
                  {scores.team} - {scores.opponent}
                </span>
              </div>
              <div className="mt-2 text-lg">
                {scores.result === 'win' && '🏆 Win'}
                {scores.result === 'loss' && '❌ Loss'}
                {scores.result === 'draw' && '🤝 Draw'}
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="font-medium mb-3">Quarter by Quarter</h3>
              <div className="grid grid-cols-5 gap-2 text-center">
                <div className="font-medium">Quarter</div>
                <div className="font-medium">Q1</div>
                <div className="font-medium">Q2</div>
                <div className="font-medium">Q3</div>
                <div className="font-medium">Q4</div>
                
                <div className="font-medium">{TEAM_NAME}</div>
                {quarterScores.map((q, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "py-1 rounded",
                      q.teamScore > q.opponentScore ? "bg-green-100" : 
                      q.teamScore < q.opponentScore ? "bg-red-100" : 
                      q.teamScore > 0 ? "bg-gray-100" : ""
                    )}
                  >
                    {q.teamScore}
                  </div>
                ))}
                
                <div className="font-medium">Opponent</div>
                {quarterScores.map((q, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "py-1 rounded",
                      q.opponentScore > q.teamScore ? "bg-red-100" : 
                      q.opponentScore < q.teamScore ? "bg-green-100" : 
                      q.opponentScore > 0 ? "bg-gray-100" : ""
                    )}
                  >
                    {q.opponentScore}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default function GameDetails() {
  const { gameId } = useParams<{ gameId: string }>();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // State for edit game dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // State for game notes
  const [gameNotes, setGameNotes] = useState<string>("");
  const [isEditingNotes, setIsEditingNotes] = useState<boolean>(false);
  
  const [activeTab, setActiveTab] = useState('overview');
  
  // Fetch game data
  const { 
    data: game,
    isLoading: isLoadingGame 
  } = useQuery({
    queryKey: ['/api/games', Number(gameId)],
    enabled: !!gameId,
  });
  
  // Fetch players
  const {
    data: players
  } = useQuery({
    queryKey: ['/api/players'],
  });
  
  // Fetch opponents
  const {
    data: opponents
  } = useQuery({
    queryKey: ['/api/opponents'],
  });
  
  // Fetch game roster
  const {
    data: roster,
    isLoading: isLoadingRoster
  } = useQuery({
    queryKey: ['/api/games', Number(gameId), 'rosters'],
    enabled: !!gameId,
  });
  
  // Fetch game stats
  const {
    data: gameStats,
    isLoading: isLoadingStats
  } = useQuery({
    queryKey: ['/api/games', Number(gameId), 'stats'],
    enabled: !!gameId,
  });
  
  // Derived values
  const opponent = useMemo(() => {
    if (!opponents || !game?.opponentId) return null;
    return opponents.find(o => o.id === game.opponentId);
  }, [opponents, game]);
  
  const isForfeitGame = useMemo(() => {
    return game?.status === 'forfeit-win' || game?.status === 'forfeit-loss';
  }, [game]);
  
  const scores = useMemo(() => {
    if (!gameStats || !game) return null;
    return calculateGameScores(gameStats, game.status);
  }, [gameStats, game]);
  
  if (isLoadingGame) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Loading game details...</h2>
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-gray-200 h-12 w-12"></div>
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!game) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Game not found</h2>
          <p className="text-gray-500 mb-6">The game you're looking for doesn't exist or has been deleted.</p>
          <Button asChild>
            <Link to="/games">
              <ChevronLeft className="mr-2 h-4 w-4" /> Back to Games
            </Link>
          </Button>
        </div>
      </div>
    );
  }
  
  // Format the game date for display
  const formattedDate = formatDate(game.date);
  
  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <Helmet>
        <title>{`Game Details - ${formattedDate} - ${TEAM_NAME}`}</title>
      </Helmet>
      
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/games">
                  <ChevronLeft className="mr-1 h-4 w-4" /> Back
                </Link>
              </Button>
              
              <GameStatusButton
                status={game.status}
                isBye={game.isBye}
              />
              
              {game.round && (
                <Badge variant="outline" className="ml-2">
                  Round {game.round}
                </Badge>
              )}
            </div>
            
            <h1 className="text-3xl font-bold">
              {game.isBye ? 'BYE Round' : (
                opponent ? opponent.teamName : 'Unspecified Opponent'
              )}
            </h1>
            
            <div className="flex items-center mt-1 text-gray-500">
              <CalendarRange className="mr-2 h-4 w-4" />
              <span>{formattedDate} at {game.time}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Game
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Edit Game</DialogTitle>
                  <DialogDescription>
                    Update the game details and status.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <GameForm 
                    initialGame={game}
                    onSuccess={() => {
                      setIsEditDialogOpen(false);
                      queryClient.invalidateQueries({ queryKey: ['/api/games', Number(gameId)] });
                      queryClient.invalidateQueries({ queryKey: ['/api/games'] });
                      toast({
                        title: "Game updated",
                        description: "Game details have been updated successfully.",
                      });
                    }}
                  />
                </div>
              </DialogContent>
            </Dialog>
            
            <Button asChild>
              <Link to={`/games/${gameId}/stats`}>
                <BarChart3 className="mr-2 h-4 w-4" />
                Update Stats
              </Link>
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Game</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this game? This action cannot be undone
                    and will also delete all associated roster positions and statistics.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => {
                      try {
                        const response = await fetch(`/api/games/${gameId}`, {
                          method: 'DELETE',
                        });
                        
                        if (response.ok) {
                          queryClient.invalidateQueries({ queryKey: ['/api/games'] });
                          window.location.href = '/games';
                          toast({
                            title: "Game deleted",
                            description: "Game has been deleted successfully.",
                          });
                        } else {
                          throw new Error('Failed to delete game');
                        }
                      } catch (error) {
                        toast({
                          variant: "destructive",
                          title: "Error",
                          description: "Failed to delete game. Please try again.",
                        });
                      }
                    }}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        
        {/* Game score summary card */}
        {(scores || isForfeitGame) && (
          <GameScoreSummary 
            gameStats={gameStats || []} 
            gameStatus={game.status}
          />
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="overview">
              <Activity className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="players">
              <ActivitySquare className="mr-2 h-4 w-4" />
              Player Statistics
            </TabsTrigger>
            <TabsTrigger value="print">
              <FileText className="mr-2 h-4 w-4" />
              Printable Roster
            </TabsTrigger>
            <TabsTrigger value="statssheet">
              <Printer className="mr-2 h-4 w-4" />
              Stats Sheet
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <div className="space-y-6">
              {/* Court Positions */}
              <Card>
                <CardHeader>
                  <CardTitle>Court Positions</CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>

              {/* Game Notes Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xl font-bold">Game Notes</CardTitle>
                  {!isEditingNotes ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setIsEditingNotes(true);
                        setGameNotes(game.notes || '');
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Notes
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setIsEditingNotes(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={async () => {
                          try {
                            const response = await fetch(`/api/games/${gameId}`, {
                              method: 'PATCH',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({ notes: gameNotes }),
                            });
                            
                            if (response.ok) {
                              // Invalidate the game query to refresh the data
                              queryClient.invalidateQueries({ queryKey: ['/api/games', gameId] });
                              setIsEditingNotes(false);
                              toast({
                                title: "Notes saved",
                                description: "Game notes have been updated successfully.",
                              });
                            } else {
                              throw new Error('Failed to save notes');
                            }
                          } catch (error) {
                            toast({
                              variant: "destructive",
                              title: "Error",
                              description: "Failed to save game notes. Please try again.",
                            });
                          }
                        }}
                      >
                        Save Notes
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {isEditingNotes ? (
                    <textarea
                      className="w-full h-64 p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={gameNotes}
                      onChange={(e) => setGameNotes(e.target.value)}
                      placeholder="Enter game notes here... (observations, player performances, areas for improvement, etc.)"
                    />
                  ) : (
                    <div className="min-h-[200px] p-4 bg-gray-50 rounded-md">
                      {game.notes ? (
                        <div className="whitespace-pre-wrap">{game.notes}</div>
                      ) : (
                        <div className="text-gray-500 italic">No notes have been added for this game yet.</div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="players" className="mt-6">
            <div className="space-y-6">
              {isForfeitGame ? (
                <div className="text-center py-10 border rounded-lg bg-gray-50">
                  <h3 className="text-lg font-medium mb-2">Forfeit Game</h3>
                  <p className="text-gray-500">
                    This game was a {game.status === 'forfeit-win' ? 'forfeit win' : 'forfeit loss'}.
                    No statistics are recorded for forfeit games.
                  </p>
                </div>
              ) : (roster && roster.length > 0 && gameStats && gameStats.length > 0) ? (
                <PlayerStatsByQuarter 
                  roster={roster} 
                  players={players || []}
                  gameStats={gameStats || []}
                />
              ) : (
                <div className="text-center py-10 border rounded-lg bg-gray-50">
                  <h3 className="text-lg font-medium mb-2">No data available</h3>
                  <p className="text-gray-500 mb-4">
                    {!roster || roster.length === 0 
                      ? "There are no positions assigned for this game yet." 
                      : "There are no statistics recorded for this game yet."}
                  </p>
                  <Button asChild>
                    <Link to={!roster || roster.length === 0 
                      ? `/game/${gameId}/roster` 
                      : `/games/${gameId}/stats`}>
                      <Edit className="mr-2 h-4 w-4" />
                      {!roster || roster.length === 0 
                        ? "Set Up Roster" 
                        : "Record Statistics"}
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="print" className="mt-6">
            <div className="space-y-6">
              <PrintableRoster 
                roster={roster || []} 
                players={players || []}
                game={game}
                opponent={opponent}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="statssheet" className="mt-6">
            <div className="space-y-6">
              <PrintableStatsSheet />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}