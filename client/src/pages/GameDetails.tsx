import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { TEAM_NAME } from '@/lib/settings';
import { StatItemBox } from '@/components/games/StatItemBox';
import { PositionStatsBox } from '@/components/games/PositionStatsBox';
import { PositionBox } from '@/components/games/PositionBox';
import { GamePositionStatsBox } from '@/components/games/GamePositionStatsBox';
import AwardWinnerDisplay from '@/components/awards/AwardWinnerDisplay';
import GameForm from '@/components/games/GameForm';
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
  Edit, BarChart3, ClipboardList, Activity, CalendarRange, ActivitySquare, Trash2,
  FileText, Printer
} from 'lucide-react';
import { BackButton } from '@/components/ui/back-button';
import { Separator } from '@/components/ui/separator';
import { formatDate, cn, tailwindToHex, convertTailwindToHex } from '@/lib/utils';

// Helper functions for player colors
const getPlayerColorForBorder = (avatarColor?: string): string => {
  if (!avatarColor) return "#7c3aed"; // Default violet-700

  // Map of background colors to border colors
  const colorMap: Record<string, string> = {
    'bg-red-500': '#b91c1c', // red-700
    'bg-orange-500': '#c2410c', // orange-700
    'bg-amber-500': '#b45309', // amber-700
    'bg-yellow-500': '#a16207', // yellow-700
    'bg-lime-500': '#4d7c0f', // lime-700
    'bg-green-500': '#15803d', // green-700
    'bg-emerald-500': '#047857', // emerald-700
    'bg-teal-500': '#0f766e', // teal-700
    'bg-cyan-500': '#0e7490', // cyan-700
    'bg-sky-500': '#0369a1', // sky-700
    'bg-blue-500': '#1d4ed8', // blue-700
    'bg-indigo-500': '#4338ca', // indigo-700
    'bg-violet-500': '#6d28d9', // violet-700
    'bg-purple-500': '#7e22ce', // purple-700
    'bg-fuchsia-500': '#a21caf', // fuchsia-700
    'bg-pink-500': '#be185d', // pink-700
    'bg-rose-500': '#be123c', // rose-700
    'bg-yellow-600': '#a16207', // yellow-700
    'bg-blue-600': '#1d4ed8', // blue-700
    'bg-violet-600': '#6d28d9', // violet-700
    'bg-orange-600': '#c2410c', // orange-700
    'bg-green-600': '#15803d', // green-700
    'bg-rose-600': '#be123c', // rose-700
    'bg-indigo-600': '#4338ca', // indigo-700
    'bg-pink-600': '#be185d', // pink-700
    'bg-purple-600': '#7e22ce' // purple-700
  };

  return colorMap[avatarColor] || "#7c3aed";
};

const getPlayerColorForBackground = (avatarColor?: string): string => {
  if (!avatarColor) return "rgb(245, 243, 255)"; // Default violet-50

  // Map of background colors to light background colors
  const colorMap: Record<string, string> = {
    'bg-red-500': '#fef2f2', // red-50
    'bg-orange-500': '#fff7ed', // orange-50
    'bg-amber-500': '#fffbeb', // amber-50
    'bg-yellow-500': '#fefce8', // yellow-50
    'bg-lime-500': '#f7fee7', // lime-50
    'bg-green-500': '#f0fdf4', // green-50
    'bg-emerald-500': '#ecfdf5', // emerald-50
    'bg-teal-500': '#f0fdfa', // teal-50
    'bg-cyan-500': '#ecfeff', // cyan-50
    'bg-sky-500': '#f0f9ff', // sky-50
    'bg-blue-500': '#eff6ff', // blue-50
    'bg-indigo-500': '#eef2ff', // indigo-50
    'bg-violet-500': '#f5f3ff', // violet-50
    'bg-purple-500': '#faf5ff', // purple-50
    'bg-fuchsia-500': '#fdf4ff', // fuchsia-50
    'bg-pink-500': '#fdf2f8', // pink-50
    'bg-rose-500': '#fff1f2', // rose-50
    'bg-yellow-600': '#fefce8', // yellow-50
    'bg-blue-600': '#eff6ff', // blue-50
    'bg-violet-600': '#f5f3ff', // violet-50
    'bg-orange-600': '#fff7ed', // orange-50
    'bg-green-600': '#f0fdf4', // green-50
    'bg-rose-600': '#fff1f2', // rose-50
    'bg-indigo-600': '#eef2ff', // indigo-50
    'bg-pink-600': '#fdf2f8', // pink-50
    'bg-purple-600': '#faf5ff' // purple-50
  };

  return colorMap[avatarColor] || "rgb(245, 243, 255)";
};
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
import LiveStatsButton from '@/components/games/LiveStatsButton';

// Function to get opponent name
const getOpponentName = (opponents: any[], opponentId: number | null) => {
  if (!opponentId) return 'BYE Round';
  const opponent = opponents.find(o => o.id === opponentId);
  return opponent ? opponent.teamName : 'Unknown Opponent';
};

// We now use the shared GameStatusButton component instead

// Using the imported StatItemBox from components

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

  // Function to get player color, converting from Tailwind class names to hex
  const getPlayerColor = (playerId) => {
    if (!players || !playerId) return '#cccccc';
    const player = players.find(p => p.id === playerId);

    // If player doesn't exist or has no color, return a default gray
    if (!player || !player.avatarColor || player.avatarColor === '#FFFFFF' || player.avatarColor === '#ffffff') {
      return '#cccccc'; // Simple gray fallback for all players without colors
    }

    // Check if the avatarColor is a Tailwind class (starts with 'bg-')
    if (player.avatarColor.startsWith('bg-')) {
      const hexColor = tailwindToHex(player.avatarColor);
      return hexColor;
    }

    // If it's already a hex color, return it
    return player.avatarColor;
  };

  // Get player performance stats for display from the actual game statistics
  const getPlayerPerformanceStats = (position) => {
    const entry = rosterByQuarter[quarter]?.[position];

    // Find the statistics for this position in this quarter
    const positionStat = gameStats?.find?.(
      stat => stat.position === position && stat.quarter === quarter
    );

    // If we have no entry in the roster (player) and no stats, return null
    if (!entry && !positionStat) return null;

    // Return position-specific relevant statistics
    const stats = {
      // Common stats for all positions
      intercepts: positionStat?.intercepts || 0,
      badPass: positionStat?.badPass || 0,
      handlingError: positionStat?.handlingError || 0
    };

    // Get player name if we have a player assigned
    const playerName = entry?.playerId ? getPlayerName(entry.playerId) : "Unassigned";

    // Add position-specific stats
    if (position === 'GS' || position === 'GA') {
      // Attacking positions
      return {
        playerId: entry?.playerId || 0,
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
        playerId: entry?.playerId || 0,
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
        playerId: entry?.playerId || 0,
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
              'GS': 'top-[25%] left-[10%] -translate-x-1/2 -translate-y-1/2',
              'GA': 'top-[75%] left-[23%] -translate-x-1/2 -translate-y-1/2',

              // Mid-court - center
              'WA': 'top-[25%] left-[43%] -translate-x-1/2 -translate-y-1/2',
              'C': 'top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2',
              'WD': 'top-[75%] left-[57%] -translate-x-1/2 -translate-y-1/2',

              // Defense end - right side
              'GD': 'top-[25%] left-[77%] -translate-x-1/2 -translate-y-1/2',
              'GK': 'top-[75%] left-[90%] -translate-x-1/2 -translate-y-1/2',
            };

            const positionClass = horizontalPositions[position] || '';

            return (
              <div key={position} className={`absolute ${positionClass}`}>
                <div 
                  style={{ 
                    backgroundColor: playerName ? bgColor : '#e11d48', // Red for unassigned
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
                    border: '3px solid white',
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
                  <div 
                    className="font-bold text-center text-lg" 
                    style={{ color: playerName ? textColor : 'white' }}
                  >
                    {position}
                  </div>
                  {playerName && (
                    <div className="text-sm text-center font-medium leading-tight" style={{ color: textColor }}>{playerName}</div>
                  )}
                  {!playerName && (
                    <div className="text-sm text-center font-medium leading-tight text-white" style={{ letterSpacing: '2px' }}>—</div>
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

            // Find position stats directly, regardless of whether a player is assigned
            const positionStat = gameStats?.find(stat => 
              stat.position === position && stat.quarter === quarter
            );

            // Get performance stats (for players) or create stats object (for unassigned positions)
            let playerStats = getPlayerPerformanceStats(position);

            // If no player stats but we have position stats, create a stats object
            if (!playerStats && positionStat) {
              playerStats = {
                stats: {
                  goalsFor: positionStat.goalsFor || 0,
                  goalsAgainst: positionStat.goalsAgainst || 0,
                  missedGoals: positionStat.missedGoals || 0,
                  rebounds: positionStat.rebounds || 0,
                  intercepts: positionStat.intercepts || 0,
                  badPass: positionStat.badPass || 0,
                  handlingError: positionStat.handlingError || 0,
                  pickUp: positionStat.pickUp || 0,
                  infringement: positionStat.infringement || 0
                }
              };
            }

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
const QuarterScores = ({ quarterScores, gameStatus }) => {
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
            {gameStatus && (
              <div className="mt-1 text-sm font-medium">
                {gameStatus.charAt(0).toUpperCase() + gameStatus.slice(1).replace('-', ' ')}
              </div>
            )}
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

  // State for edit game dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // State for game notes
  const [gameNotes, setGameNotes] = useState<string>("");
  const [isEditingNotes, setIsEditingNotes] = useState<boolean>(false);

  // State for award winner
  const [isEditingAward, setIsEditingAward] = useState<boolean>(false);
  const [selectedAwardWinner, setSelectedAwardWinner] = useState<number | null>(null);

  const [activeTab, setActiveTab] = useState('overview');

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
    isLoading: isLoadingRoster,
    refetch: refetchRosters
  } = useQuery({
    queryKey: ['/api/games', gameId, 'rosters'],
    queryFn: () => fetch(`/api/games/${gameId}/rosters`).then(res => res.json()),
    enabled: !isNaN(gameId)
  });

  // Fetch seasons data
  const { data: seasons = [], isLoading: isLoadingSeasons } = useQuery<any[]>({
    queryKey: ['/api/seasons'],
  });

  // Fetch active season
  const { data: activeSeason, isLoading: isLoadingActiveSeason } = useQuery<any>({
    queryKey: ['/api/seasons/active'],
  });

  // Force refetch when component mounts or route changes
  useEffect(() => {
    if (gameId && !isNaN(gameId)) {
      console.log("Loaded roster data:", roster);
      // Always refetch roster data when navigating to this page
      refetchRosters();
    }
  }, [gameId, refetchRosters]);

  // Fetch game stats
  const { 
    data: gameStats,
    isLoading: isLoadingStats,
    refetch: refetchGameStats
  } = useQuery({
    queryKey: ['/api/games', gameId, 'stats'],
    queryFn: () => fetch(`/api/games/${gameId}/stats`).then(res => res.json()),
    enabled: !isNaN(gameId),
    staleTime: 0, // Always consider stale to get fresh data
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: 'always' // Always refetch when component mounts
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

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gray-50 p-6 rounded-lg">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <BackButton 
              fallbackPath="/games"
              variant="outline" 
              size="sm"
              className="border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
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

          <div className="flex flex-wrap gap-2 mt-4 mb-4">

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
                {opponents && game && seasons && (
                  <GameForm
                    game={game}
                    opponents={opponents}
                    seasons={seasons}
                    activeSeason={activeSeason}
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
                          queryKey: ['/api/games', gameId],
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
                    onCancel={() => setIsEditDialogOpen(false)}
                  />
                )}
              </DialogContent>
            </Dialog>
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              <ClipboardList className="mr-2 h-4 w-4" />
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

              {/* Award Winner Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xl font-bold">Player of the Match</CardTitle>
                  {!isEditingAward ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setIsEditingAward(true);
                        setSelectedAwardWinner(game.awardWinnerId || null);
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Select Winner
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setIsEditingAward(false);
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
                              body: JSON.stringify({ awardWinnerId: selectedAwardWinner }),
                            });

                            if (response.ok) {
                              // Invalidate the game query to refresh the data
                              queryClient.invalidateQueries({ queryKey: ['/api/games', gameId] });
                              setIsEditingAward(false);
                              toast({
                                title: "Award Winner saved",
                                description: "Player of the match has been updated successfully.",
                              });
                            } else {
                              throw new Error('Failed to save award winner');
                            }
                          } catch (error) {
                            toast({
                              variant: "destructive",
                              title: "Error",
                              description: "Failed to save award winner. Please try again.",
                            });
                          }
                        }}
                      >
                        Save
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {isEditingAward ? (
                    <div className="space-y-4">
                      <Select
                        value={selectedAwardWinner ? selectedAwardWinner.toString() : "none"}
                        onValueChange={(value) => {
                          if (value === "none") {
                            setSelectedAwardWinner(null);
                          } else {
                            setSelectedAwardWinner(parseInt(value, 10));
                          }
                        }}
                      >
                        <SelectTrigger className="w-[250px]">
                          <SelectValue placeholder="Select player..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No award winner</SelectItem>
                          {roster && roster.length > 0 ? (
                            // Get unique players from roster
                            Array.from(new Set(roster.map(r => r.playerId)))
                              .map(playerId => {
                                const player = players?.find(p => p.id === playerId);
                                return player ? (
                                  <SelectItem key={player.id} value={player.id.toString()}>
                                    {player.displayName || `${player.firstName} ${player.lastName}`}
                                  </SelectItem>
                                ) : null;
                              })
                          ) : (
                            <SelectItem value="no-players" disabled>No players in roster</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="min-h-[80px] p-2">
                      {/* Award winner display with real stats from database */}
                      {(() => {
                        // Find the award winner from the players array
                        const awardWinner = players?.find(p => p.id === game.awardWinnerId);

                        if (!awardWinner) {
                          return (
                            <div className="flex items-center justify-center h-full py-6 text-gray-500 italic">
                              No award winner has been selected for this game.
                            </div>
                          );
                        }

                        // Find positions played by this player in this game
                        const playerPositions = roster?.filter(r => r.playerId === awardWinner.id) || [];

                        // Initialize stat counters
                        let goals = 0;
                        let intercepts = 0; 
                        let rebounds = 0;

                        // Sum up stats from all positions this player played
                        playerPositions.forEach(rosterEntry => {
                          const stat = gameStats?.find(s => 
                            s.position === rosterEntry.position && 
                            s.quarter === rosterEntry.quarter
                          );

                          if (stat) {
                            goals += stat.goalsFor || 0;
                            intercepts += stat.intercepts || 0;
                            rebounds += stat.rebounds || 0;
                          }
                        });

                        // Get player initials
                        const getInitials = (firstName: string, lastName: string) => {
                          // Handle first name (considering first part of compound names)
                          const firstInitial = firstName.trim().charAt(0).toUpperCase();

                          // Handle last name (including hyphenated or multi-part names)
                          let lastInitial = '';
                          if (lastName && lastName.trim()) {
                            lastInitial = lastName.trim().charAt(0).toUpperCase();
                          }

                          return `${firstInitial}${lastInitial}`;
                        };

                        return (
                          <div className="flex items-center space-x-4">
                            {/* Player Avatar */}
                            <div 
                              className={`h-16 w-16 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md ${awardWinner.avatarColor || 'bg-indigo-500'}`}
                            >
                              {getInitials(awardWinner.firstName, awardWinner.lastName)}
                            </div>

                            {/* Player Stats Box - With colors matching player's avatar */}
                            <div 
                              className="flex-1 flex items-center p-3 rounded-lg border-2"
                              style={{ 
                                backgroundColor: awardWinner.avatarColor ? `${tailwindToHex(awardWinner.avatarColor)}10` : '#f5f3ff',
                                borderColor: awardWinner.avatarColor ? tailwindToHex(awardWinner.avatarColor) : '#7c3aed'
                              }}
                            >
                              <div className="flex-1">
                                <div 
                                  className="text-lg font-bold"
                                  style={{ color: awardWinner.avatarColor ? tailwindToHex(awardWinner.avatarColor) : '#7c3aed' }}
                                >
                                  {awardWinner.displayName || `${awardWinner.firstName} ${awardWinner.lastName}`}
                                </div>
                                <div 
                                  className="text-sm"
                                  style={{ color: awardWinner.avatarColor ? tailwindToHex(awardWinner.avatarColor) : '#7c3aed' }}
                                >
                                  Player of the Match
                                </div>
                              </div>

                              <div className="flex space-x-6">
                                <div className="text-center">
                                  <div 
                                    className="text-2xl font-bold"
                                    style={{ color: awardWinner.avatarColor ? tailwindToHex(awardWinner.avatarColor) : '#7c3aed' }}
                                  >
                                    {goals}
                                  </div>
                                  <div 
                                    className="text-xs"
                                    style={{ color: awardWinner.avatarColor ? tailwindToHex(awardWinner.avatarColor) : '#7c3aed' }}
                                  >
                                    Goals
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div 
                                    className="text-2xl font-bold"
                                    style={{ color: awardWinner.avatarColor ? tailwindToHex(awardWinner.avatarColor) : '#7c3aed' }}
                                  >
                                    {intercepts}
                                  </div>
                                  <div 
                                    className="text-xs"
                                    style={{ color: awardWinner.avatarColor ? tailwindToHex(awardWinner.avatarColor) : '#7c3aed' }}
                                  >
                                    Intercepts
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div 
                                    className="text-2xl font-bold"
                                    style={{ color: awardWinner.avatarColor ? tailwindToHex(awardWinner.avatarColor) : '#7c3aed' }}
                                  >
                                    {rebounds}
                                  </div>
                                  <div 
                                    className="text-xs"
                                    style={{ color: awardWinner.avatarColor ? tailwindToHex(awardWinner.avatarColor) : '#7c3aed' }}
                                  >
                                    Rebounds
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
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
          </TabsContent>

          <TabsContent value="print" className="mt-6">
            {roster && roster.length > 0 ? (
              <PrintableRosterSummary 
                game={game} 
                opponent={opponents?.find(o => o.id === game.opponentId) || null}
                roster={roster}
                players={players || []}
              />
            ) : (
              <div className="text-center py-10 border rounded-lg bg-gray-50">
                <h3 className="text-lg font-medium mb-2">No roster assigned</h3>
                <p className="text-gray-500 mb-4">There are no positions assigned for this game yet.</p>
                <Button asChild>
                  <Link to={`/roster/${gameId}`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Set Up Roster
                  </Link>
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="statssheet" className="mt-6">
            <PrintableStatsSheet
              game={game}
              opponent={opponents?.find(o => o.id === game.opponentId) || null}
            />
          </TabsContent>


        </Tabs>
      </div>
    </div>
  );
}