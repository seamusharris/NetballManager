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
  ChevronLeft, Edit, BarChart3, ClipboardList, Activity, CalendarRange, ActivitySquare, Trash2
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { formatDate, cn } from '@/lib/utils';
import { GameStatus, Position, POSITIONS } from '@shared/schema';
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
const getOpponentName = (opponents, opponentId) => {
  if (!opponentId) return 'BYE Round';
  const opponent = opponents.find(o => o.id === opponentId);
  return opponent ? opponent.teamName : 'Unknown Opponent';
};

// Component to display player statistics from their positions played
const PlayerStatsByQuarter = ({ roster, players, gameStats }) => {
  const [activeQuarter, setActiveQuarter] = useState(0); // 0 means all quarters
  
  // Calculate player statistics by combining all positions they played
  const playerStats = useMemo(() => {
    // Create a set of all unique player IDs in the roster
    const uniquePlayerIds = new Set();
    
    // Create a mapping of player ID to positions they played in each quarter
    const playerPositions = {};
    
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
    const result = {};
    
    // Make sure all players in the roster are included
    players.forEach(player => {
      if (!uniquePlayerIds.has(player.id)) return;
      
      // Initialize stats for every player in the roster
      result[player.id] = {
        playerId: player.id,
        name: getPlayerName(players, player.id),
        color: getPlayerColor(players, player.id),
        quarterStats: {},
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
  function getPlayerName(players, playerId) {
    if (!players || !playerId) return null;
    const player = players.find(p => p.id === playerId);
    return player ? (player.displayName || `${player.firstName} ${player.lastName}`) : null;
  }
  
  // Helper function to get player color (moved from elsewhere in the file)
  function getPlayerColor(players, playerId) {
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
  function convertTailwindToHex(tailwindClass) {
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
  const renderQuarterButton = (quarter) => (
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
  const renderPlayerStatsBox = (player) => {
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
const calculateQuarterScores = (gameStats, game) => {
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
  const getPositionCoordinates = (position) => {
    const positionMap = {
      'GS': 'top-12 left-1/2 transform -translate-x-1/2',
      'GA': 'top-28 right-16',
      'WA': 'top-1/2 right-14',
      'C': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
      'WD': 'bottom-1/2 left-14',
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
  
  // Helper to get player color for visual indication
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
      return defaultColors[playerId % defaultColors.length];
    }
    
    // Check if the avatarColor is a Tailwind class (starts with 'bg-')
    if (player.avatarColor.startsWith('bg-')) {
      // Get hex value from mapping
      console.log(`Converting ${player.avatarColor} to hex: ${convertTailwindToHex(player.avatarColor)} for player ${playerId}`);
      return convertTailwindToHex(player.avatarColor);
    }
    
    // If it's already a hex color, return it
    return player.avatarColor;
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
    
    return colorMap[tailwindClass] || '#6366f1'; // default to indigo-500 if not found
  };
  
  // Method to get team score for a quarter
  const getQuarterScore = (quarter) => {
    const quarterStats = gameStats.filter(stat => stat.quarter === quarter);
    const teamScore = quarterStats.reduce((total, stat) => 
      total + (stat.goalsFor || 0), 0);
    const opponentScore = quarterStats.reduce((total, stat) => 
      total + (stat.goalsAgainst || 0), 0);
    
    return { teamScore, opponentScore };
  };
  
  // Get stats for a specific position and quarter
  const getPositionStats = (position, quarter) => {
    return gameStats.find(stat => 
      stat.position === position && stat.quarter === quarter
    ) || null;
  };
  
  // Render position and stats on court
  const renderPositionOnCourt = (position, playerStats) => {
    const hasStats = !!playerStats;
    
    // Different tailwind utility class based on position
    const positionData = {
      'GS': { className: 'bg-red-500', label: 'GS' },
      'GA': { className: 'bg-orange-500', label: 'GA' },
      'WA': { className: 'bg-amber-500', label: 'WA' },
      'C': { className: 'bg-green-500', label: 'C' },
      'WD': { className: 'bg-blue-500', label: 'WD' },
      'GD': { className: 'bg-indigo-500', label: 'GD' },
      'GK': { className: 'bg-purple-500', label: 'GK' },
    };
    
    // Get the roster entry for this position in this quarter
    const rosterEntry = rosterByQuarter[quarter]?.[position];
    const playerId = rosterEntry?.playerId;
    const playerName = getPlayerName(playerId);
    const playerColor = getPlayerColor(playerId);
    
    // Position coordinate class from helper function
    const positionCoords = getPositionCoordinates(position);
    
    return (
      <div 
        key={position} 
        className={`absolute ${positionCoords} flex flex-col items-center`}
      >
        <div 
          className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold`}
          style={{ backgroundColor: playerColor || '#cccccc' }}
        >
          {position}
        </div>
        
        {playerName && (
          <div className="mt-1 text-xs font-semibold bg-gray-100 rounded px-2 py-1 whitespace-nowrap">
            {playerName}
          </div>
        )}
        
        {/* Stats display for this position */}
        {hasStats && (
          <div className="mt-1 bg-white rounded-md border shadow-sm p-2 w-32">
            <div className="text-xs font-semibold mb-1 text-center">Stats</div>
            <div className="space-y-1">
              {position === 'GS' || position === 'GA' ? (
                <>
                  <div className="flex justify-between text-xs">
                    <span>Goals:</span>
                    <span>{playerStats.goalsFor || 0}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Missed:</span>
                    <span>{playerStats.missedGoals || 0}</span>
                  </div>
                </>
              ) : position === 'GD' || position === 'GK' ? (
                <div className="flex justify-between text-xs">
                  <span>Against:</span>
                  <span>{playerStats.goalsAgainst || 0}</span>
                </div>
              ) : null}
              
              <div className="flex justify-between text-xs">
                <span>Intercepts:</span>
                <span>{playerStats.intercepts || 0}</span>
              </div>
              
              <div className="flex justify-between text-xs">
                <span>Rebounds:</span>
                <span>{playerStats.rebounds || 0}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div>
      <div className="mb-4 flex justify-center">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(q => (
            <Button 
              key={q} 
              variant={quarter === q ? "default" : "outline"} 
              size="sm"
              onClick={() => setQuarter(q)}
            >
              Q{q}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="relative h-[600px] border rounded-lg bg-gray-50 flex flex-col">
        {/* Court layout */}
        <div className="flex-1 relative border-b border-gray-300">
          {/* Center third line */}
          <div className="absolute left-0 right-0 top-1/3 border-b border-gray-300"></div>
          <div className="absolute left-0 right-0 bottom-1/3 border-b border-gray-300"></div>
          
          {/* Center circle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-gray-300"></div>
          
          {/* Goal circles */}
          <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-20 h-20 rounded-full border border-gray-300"></div>
          <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 w-20 h-20 rounded-full border border-gray-300"></div>
          
          {/* Render positions on court */}
          {POSITIONS.map(position => renderPositionOnCourt(
            position, 
            getPositionStats(position, quarter)
          ))}
        </div>
        
        <div className="p-4 bg-white border-t flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Quarter {quarter} Score: {getQuarterScore(quarter).teamScore} - {getQuarterScore(quarter).opponentScore}
          </div>
          
          <Button asChild variant="outline" size="sm">
            <Link to={`/roster?game=${roster[0]?.gameId}`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Roster
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

// Component for displaying stats by position
const StatisticsByPosition = ({ gameStats }) => {
  const [quarter, setQuarter] = useState(0); // 0 means all quarters
  
  // Filter stats by selected quarter
  const filteredStats = useMemo(() => {
    if (quarter === 0) return gameStats;
    return gameStats.filter(stat => stat.quarter === quarter);
  }, [gameStats, quarter]);
  
  // Group stats by position
  const positionStats = useMemo(() => {
    // Structure to hold aggregated stats for each position
    const result = {};
    
    // Initialize stats for all positions
    POSITIONS.forEach(position => {
      result[position] = {
        position,
        goalsFor: 0,
        missedGoals: 0,
        goalsAgainst: 0,
        rebounds: 0,
        intercepts: 0,
        badPass: 0,
        handlingError: 0,
        pickUp: 0, 
        infringement: 0,
        rating: null
      };
    });
    
    // Aggregate stats from all filtered stats
    filteredStats.forEach(stat => {
      // Skip null positions
      if (!stat.position) return;
      
      // Add to aggregated stats
      const position = result[stat.position];
      position.goalsFor += stat.goalsFor || 0;
      position.missedGoals += stat.missedGoals || 0;
      position.goalsAgainst += stat.goalsAgainst || 0;
      position.rebounds += stat.rebounds || 0;
      position.intercepts += stat.intercepts || 0;
      position.badPass += stat.badPass || 0;
      position.handlingError += stat.handlingError || 0;
      position.pickUp += stat.pickUp || 0;
      position.infringement += stat.infringement || 0;
      // Only use rating from most recent quarter
      if (stat.rating !== null && (position.rating === null || stat.quarter > position.quarter)) {
        position.rating = stat.rating;
        position.quarter = stat.quarter;
      }
    });
    
    return Object.values(result);
  }, [filteredStats]);
  
  // Render a quarter tab/button
  const renderQuarterButton = (q) => (
    <Button 
      key={q} 
      variant={quarter === q ? "default" : "outline"} 
      size="sm"
      onClick={() => setQuarter(q)}
      className="min-w-[60px]"
    >
      {q === 0 ? "All" : `Q${q}`}
    </Button>
  );
  
  return (
    <div>
      <div className="mb-4 flex justify-center items-center">
        <div className="flex gap-2">
          {[0, 1, 2, 3, 4].map(q => renderQuarterButton(q))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {positionStats.map(stats => (
          <div key={stats.position} className="border rounded-md shadow-sm p-4">
            <div className="flex items-center mb-3">
              <div className={`h-8 w-8 rounded-full bg-${stats.position.toLowerCase()}-100 
                border border-${stats.position.toLowerCase()}-500 
                flex items-center justify-center text-${stats.position.toLowerCase()}-800 
                font-semibold text-xs mr-2`}
              >
                {stats.position}
              </div>
              <h3 className="font-semibold">{stats.position} Statistics</h3>
            </div>
            
            <div className="space-y-2">
              {/* Show relevant stats based on position */}
              {stats.position === 'GS' || stats.position === 'GA' ? (
                <>
                  <StatItemBox label="Goals" value={stats.goalsFor} />
                  <StatItemBox label="Missed Goals" value={stats.missedGoals} />
                </>
              ) : stats.position === 'GD' || stats.position === 'GK' ? (
                <StatItemBox label="Goals Against" value={stats.goalsAgainst} />
              ) : null}
              
              {/* Common stats for all positions */}
              <StatItemBox label="Rebounds" value={stats.rebounds} />
              <StatItemBox label="Intercepts" value={stats.intercepts} />
              <StatItemBox label="Bad Pass" value={stats.badPass} />
              <StatItemBox label="Handling Errors" value={stats.handlingError} />
              <StatItemBox label="Pick Ups" value={stats.pickUp} />
              <StatItemBox label="Infringements" value={stats.infringement} />
              
              {/* Rating display */}
              {stats.rating !== null && (
                <div className="mt-3 pt-2 border-t">
                  <div className="text-sm text-gray-500 mb-1">Coach Rating</div>
                  <div className="flex items-center">
                    <div className={`h-8 w-8 rounded-full 
                      ${stats.rating >= 4 ? 'bg-green-500' : 
                        stats.rating >= 3 ? 'bg-amber-500' : 
                        stats.rating >= 2 ? 'bg-orange-500' : 'bg-red-500'} 
                      text-white font-bold flex items-center justify-center`}
                    >
                      {stats.rating}
                    </div>
                    <div className="ml-2 text-sm">
                      {stats.rating >= 4 ? 'Excellent' : 
                       stats.rating >= 3 ? 'Good' : 
                       stats.rating >= 2 ? 'Fair' : 'Needs Improvement'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Component to display quarter scores
const QuarterScores = ({ quarterScores, gameStatus }) => {
  // Calculate totals
  const totals = useMemo(() => {
    // Accumulate scores
    const scoresByQuarter = quarterScores.reduce((acc, current, index) => {
      acc.push({
        quarter: current.quarter,
        teamScore: current.teamScore,
        opponentScore: current.opponentScore
      });
      return acc;
    }, []);
    
    // Calculate total
    const totalTeamScore = scoresByQuarter.reduce((sum, q) => sum + q.teamScore, 0);
    const totalOpponentScore = scoresByQuarter.reduce((sum, q) => sum + q.opponentScore, 0);
    
    return {
      scoresByQuarter,
      totalTeamScore,
      totalOpponentScore,
      result: totalTeamScore > totalOpponentScore ? 'win' : totalTeamScore < totalOpponentScore ? 'loss' : 'draw'
    };
  }, [quarterScores]);
  
  // Draw special badge if forfeit
  const isForfeitGame = gameStatus === 'forfeit-win' || gameStatus === 'forfeit-loss';
  
  // Determine full game result
  let gameResult = null;
  
  if (gameStatus === 'completed' || isForfeitGame) {
    if (isForfeitGame) {
      gameResult = gameStatus === 'forfeit-win' ? 'FORFEIT WIN' : 'FORFEIT LOSS';
    } else {
      const { totalTeamScore, totalOpponentScore } = totals;
      if (totalTeamScore > totalOpponentScore) {
        gameResult = 'WIN';
      } else if (totalTeamScore < totalOpponentScore) {
        gameResult = 'LOSS';
      } else {
        gameResult = 'DRAW';
      }
    }
  }
  
  // Function to render a quarter score
  const renderQuarterScore = (score) => {
    const { teamScore, opponentScore, quarter } = score;
    const isWinningQuarter = teamScore > opponentScore;
    const isLosingQuarter = teamScore < opponentScore;
    const isDrawQuarter = teamScore === opponentScore;
    
    return (
      <div 
        key={quarter}
        className={`px-4 py-2 rounded-md ${
          isWinningQuarter ? 'bg-green-50 border border-green-200' : 
          isLosingQuarter ? 'bg-red-50 border border-red-200' : 
          'bg-gray-50 border border-gray-200'
        }`}
      >
        <div className="text-xs font-medium text-gray-500 mb-1">Q{quarter}</div>
        <div className="text-lg font-bold">
          {teamScore} - {opponentScore}
        </div>
      </div>
    );
  };
  
  return (
    <div className="mt-2 border rounded-md p-4 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Quarter Scores</h3>
        
        {gameResult && (
          <div className={`px-3 py-1 rounded-md text-sm font-semibold ${
            gameResult === 'WIN' || gameResult === 'FORFEIT WIN' ? 'bg-green-100 text-green-800' : 
            gameResult === 'LOSS' || gameResult === 'FORFEIT LOSS' ? 'bg-red-100 text-red-800' : 
            'bg-gray-100 text-gray-800'
          }`}>
            {gameResult}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {totals.scoresByQuarter.map(renderQuarterScore)}
      </div>
      
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <div className="text-lg">
          <span className="font-semibold">Final Score:</span>
          <span className="ml-2 font-bold text-xl">
            {totals.totalTeamScore} - {totals.totalOpponentScore}
          </span>
        </div>
        
        <div className="text-sm text-gray-500">
          {isForfeitGame ? (
            <div className="text-red-500 font-semibold">
              {gameStatus === 'forfeit-win' ? 'Opposition Forfeit' : 'Team Forfeit'}
            </div>
          ) : gameStatus === 'completed' ? (
            <div className="text-green-500 font-semibold">Game Complete</div>
          ) : gameStatus === 'in-progress' ? (
            <div className="text-amber-500 font-semibold">Game In Progress</div>
          ) : (
            <div className="text-blue-500 font-semibold">Upcoming Game</div>
          )}
        </div>
      </div>
    </div>
  );
};

// Game Details Component
export default function GameDetails() {
  const { gameId } = useParams();
  const [activeTab, setActiveTab] = useState("roster");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch game data
  const { data: game, isLoading: isLoadingGame } = useQuery({
    queryKey: ['/api/games', parseInt(gameId)],
    enabled: !!gameId
  });
  
  // Fetch opponents for name lookup
  const { data: opponents, isLoading: isLoadingOpponents } = useQuery({
    queryKey: ['/api/opponents'],
  });
  
  // Fetch players for name lookup
  const { data: players, isLoading: isLoadingPlayers } = useQuery({
    queryKey: ['/api/players'],
  });
  
  // Fetch roster data for the game
  const { data: roster, isLoading: isLoadingRoster } = useQuery({
    queryKey: ['/api/games', parseInt(gameId), 'rosters'],
    enabled: !!gameId
  });
  
  // Fetch game statistics
  const { data: gameStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/games', parseInt(gameId), 'stats'],
    enabled: !!gameId
  });

  // Derive opponent name from the game data
  const opponentName = useMemo(() => {
    if (!game || !opponents) return "";
    return getOpponentName(opponents, game.opponentId);
  }, [game, opponents]);
  
  // Calculate quarter scores from the statistics
  const quarterScores = useMemo(() => {
    if (!gameStats || !game) return [];
    return calculateQuarterScores(gameStats, game);
  }, [gameStats, game]);
  
  // Check if this is a forfeit game
  const isForfeitGame = game?.status === 'forfeit-win' || game?.status === 'forfeit-loss';
  
  // Show loading state while data is being fetched
  if (isLoadingGame || isLoadingOpponents) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Handle case when game is not found
  if (!game) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Game not found</h1>
          <p className="mb-6">The game you're looking for doesn't exist or has been deleted.</p>
          <Button asChild>
            <Link to="/games">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Games
            </Link>
          </Button>
        </div>
      </div>
    );
  }
  
  // Main render
  return (
    <div className="container mx-auto py-6 pb-10 max-w-5xl">
      <Helmet>
        <title>{TEAM_NAME} vs {opponentName} | Game Details</title>
      </Helmet>
      
      <div className="mb-8">
        <div className="mb-4">
          <div className="flex">
            <Button 
              variant="outline" 
              size="sm"
              asChild
              className="border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              <Link to="/games">
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back to Games
              </Link>
            </Button>
          </div>
          
          <div className="flex justify-between items-start mt-4">
            <h1 className="text-2xl font-bold">
              {game.opponentId ? (
                <span>
                  {TEAM_NAME} vs {opponentName}
                </span>
              ) : (
                <span>BYE Round</span>
              )}
            </h1>
            
            <div className="flex flex-wrap gap-2 justify-end">
            
            {/* Roster Button */}
            {!game.isBye && (
              <Button 
                variant="outline" 
                size="sm" 
                asChild
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-900"
              >
                <Link to={`/roster?game=${gameId}`}>
                  <CalendarRange className="mr-2 h-4 w-4" />
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
                className="border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-900"
              >
                <Link to={`/game/${gameId}/livestats`}>
                  <ActivitySquare className="mr-2 h-4 w-4" />
                  Live Stats
                </Link>
              </Button>
            )}
            
            {/* Edit Game Button */}
            <Button 
              variant="outline" 
              size="sm"
              className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-900"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Game
            </Button>
            
            {/* Delete Game Button */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-900"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Game
                </Button>
              </AlertDialogTrigger>
              
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this {game.isBye ? "BYE round" : `game against ${game.opponentId ? opponents?.find(o => o.id === game.opponentId)?.teamName : 'unknown opponent'}`}? 
                    This will also delete all roster assignments and statistics for this game.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    className="bg-red-500 hover:bg-red-600"
                    onClick={async () => {
                      try {
                        await fetch(`/api/games/${gameId}`, {
                          method: 'DELETE',
                        });
                        
                        // Invalidate queries
                        queryClient.invalidateQueries({
                          queryKey: ['/api/games'],
                        });
                        
                        toast({
                          title: "Game deleted",
                          description: "Game has been deleted successfully",
                        });
                        
                        // Redirect to games list
                        window.location.href = '/games';
                      } catch (error) {
                        console.error("Error deleting game:", error);
                        toast({
                          title: "Error",
                          description: "Failed to delete game",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            {/* Edit Game Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="sm:max-w-[550px]">
                <DialogTitle>Edit Game Details</DialogTitle>
                {opponents && game && (
                  <GameForm
                    game={game}
                    opponents={opponents}
                    isSubmitting={false}
                    onSubmit={async (formData) => {
                      try {
                        await fetch(`/api/games/${gameId}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(formData)
                        });
                        
                        // Invalidate queries to refresh data
                        queryClient.invalidateQueries({
                          queryKey: ['/api/games', parseInt(gameId)],
                        });
                        queryClient.invalidateQueries({
                          queryKey: ['/api/games'],
                        });
                        
                        toast({
                          title: "Game updated",
                          description: "Game details have been updated successfully",
                        });
                        
                        setIsEditDialogOpen(false);
                      } catch (error) {
                        console.error("Error updating game:", error);
                        toast({
                          title: "Error",
                          description: "Failed to update game details",
                          variant: "destructive",
                        });
                      }
                    }}
                  />
                )}
              </DialogContent>
            </Dialog>
            </div>
          </div>
          
          <div className="text-gray-500">
            {formatDate(game.date)} {game.time && `at ${game.time}`}
            {game.location && ` · ${game.location}`}
            {game.round && ` · Round ${game.round}`}
          </div>
        </div>
        
        {/* View Statistics button removed - stats now available directly on this page */}
      </div>
      
      {/* Show quarter scores summary */}
      <QuarterScores quarterScores={quarterScores} gameStatus={game?.status} />
      
      <div className="mt-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="roster">
              <ClipboardList className="mr-2 h-4 w-4" />
              Court Positions
            </TabsTrigger>
            <TabsTrigger value="stats">
              <Activity className="mr-2 h-4 w-4" />
              Position Statistics
            </TabsTrigger>
            <TabsTrigger value="players">
              <ActivitySquare className="mr-2 h-4 w-4" />
              Player Statistics
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
                  <Link to={`/roster?game=${gameId}`}>
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
                  <Link to={`/game/${gameId}/livestats`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Record Statistics
                  </Link>
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="players" className="mt-6">
            {isForfeitGame ? (
              <div className="text-center py-10 border rounded-lg bg-gray-50">
                <h3 className="text-lg font-medium mb-2">Forfeit Game</h3>
                <p className="text-gray-500">
                  This game was a {game.status === 'forfeit-win' ? 'forfeit win' : 'forfeit loss'}.
                  No statistics are recorded for forfeit games.
                </p>
              </div>
            ) : roster && roster.length > 0 && gameStats && gameStats.length > 0 ? (
              <PlayerStatsByQuarter 
                roster={roster} 
                players={players || []}
                gameStats={gameStats}
              />
            ) : (
              <div className="text-center py-10 border rounded-lg bg-gray-50">
                <h3 className="text-lg font-medium mb-2">No statistics recorded</h3>
                <p className="text-gray-500 mb-4">
                  {roster && roster.length > 0 
                    ? "There are no statistics recorded for this game yet."
                    : "You need to set up the roster before recording statistics."}
                </p>
                <Button asChild>
                  <Link to={roster && roster.length > 0 ? `/game/${gameId}/livestats` : `/roster?game=${gameId}`}>
                    <Edit className="mr-2 h-4 w-4" />
                    {roster && roster.length > 0 ? "Record Statistics" : "Set Up Roster"}
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