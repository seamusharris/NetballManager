import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { TEAM_NAME } from '@/lib/settings';
import { 
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
  } from '@/components/ui/breadcrumb';
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
import BackButton from '@/components/ui/back-button';
import { Separator } from '@/components/ui/separator';
import { formatDate, cn, tailwindToHex, convertTailwindToHex, getInitials } from '@/lib/utils';
import { TeamSwitcher } from '@/components/layout/TeamSwitcher';
import { ScoreMismatchWarning } from '@/components/games/ScoreMismatchWarning';
import { validateInterClubScores, getScoreDiscrepancyWarning, getReconciledScore } from '@/lib/scoreValidation';
import { getPlayerColorHex } from '@/lib/playerColorUtils';

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
    'bg-rose-600': '#be123c', // rose-50
    'bg-indigo-600': '#4338ca', // indigo-600
    'bg-pink-600': '#be185d', // pink-600
    'bg-purple-600': '#7e22ce' // purple-600
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
    'bg-purple-600': '#faf5ff' // purple-600
  };

  return colorMap[avatarColor] || "rgb(245, 243, 255)";
};

// Helper function to get a lighter shade of a color (used for background)
const getLighterColorHex = (avatarColor?: string): string => {
  if (!avatarColor) return "rgb(245, 243, 255)"; // Default violet-50

  // If the avatarColor is a Tailwind class (starts with 'bg-'), convert it to hex
  if (avatarColor.startsWith('bg-')) {
    avatarColor = convertTailwindToHex(avatarColor);
  }

  // If it's already a hex color, lighten it
  if (avatarColor.startsWith('#')) {
      let hex = avatarColor.replace(/^#/, '');
      // Handle short form hex color
      if (hex.length === 3) {
          hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);

      const lightenFactor = 0.9; // Adjust this value to control how much lighter the color becomes
      const newR = Math.min(255, Math.round(r + (255 - r) * lightenFactor));
      const newG = Math.min(255, Math.round(g + (255 - g) * lightenFactor));
      const newB = Math.min(255, Math.round(b + (255 - b) * lightenFactor));

      const newHex = "#" + ((1 << 24) + (newR << 16) + (newG << 8) + newB).toString(16).slice(1);
      return newHex;
  }

  return "rgb(245, 243, 255)";
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
import { GameScoreDisplay } from '@/components/statistics/GameScoreDisplay';
import { OfficialScoreEntry } from '@/components/games/OfficialScoreEntry';
import { apiClient } from '@/lib/apiClient';
import { useClub } from '@/contexts/ClubContext';
import { gameScoreService } from '@/lib/gameScoreService';
import { CACHE_KEYS } from '@/lib/cacheKeys';

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
    if (!Array.isArray(players) || !playerId) return null;
    const player = players.find(p => p.id === playerId);
    return player ? (player.displayName || `${player.firstName} ${player.lastName}`) : null;
  }

  // Helper function to get player color (moved from elsewhere in the file)
  function getPlayerColor(players: any[], playerId: number) {
    if (!Array.isArray(players) || !playerId) return '#cccccc';
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



// Court position roster component
const CourtPositionRoster = ({ roster, players, gameStats, quarter: initialQuarter = 1 }) => {
  const [quarter, setQuarter] = useState(initialQuarter);



  // Don't render with actual player data if players haven't loaded yet
  if (!Array.isArray(players) || players.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>Loading players...</p>
      </div>
    );
  }

  // Group roster by quarter and position
  const rosterByQuarter = useMemo(() => {
    if (!roster || !Array.isArray(roster)) {
      console.log('Roster is not an array:', roster);
      return {};
    }

    const grouped = roster.reduce((acc, entry) => {
      if (!acc[entry.quarter]) acc[entry.quarter] = {};
      acc[entry.quarter][entry.position] = entry;
      return acc;
    }, {});

    console.log('Grouped roster by quarter:', grouped);
    console.log('Quarter 1 positions:', Object.keys(grouped[1] || {}));
    return grouped;
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
  const getPlayerName = useCallback((playerId) => {
    if (!Array.isArray(players) || players.length === 0 || !playerId) {
      return `Player ${playerId}`;
    }

    const player = players.find(p => p.id === playerId);
    return player ? (player.displayName || `${player.firstName} ${player.lastName}`) : `Player ${playerId}`;
  }, [players]);

  // Function to get player color, converting from Tailwind class names to hex
  const getPlayerColor = (playerId) => {
    if (!Array.isArray(players) || !playerId) return '#cccccc';
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
        <div className="flex justify-center">
          <div className="relative w-full max-w-4xl h-96 bg-green-100 rounded-lg border border-green-300 shadow-md">
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
                  pickUp: positionStat.infringement || 0
                }
              };
            }

            return (
              <div
                key={position} 
                className="col-span-1"
              >
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

      if (!acc[stat.position][stat.quarter]) {        acc[stat.position][stat.quarter] = {};
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
const QuarterScores = ({ quarterScores, gameStatus, contextualTeamScore, contextualOpponentScore, isByeGame, isUpcomingGame }) => {
  // For BYE and upcoming games, show special styling
  if (isByeGame || isUpcomingGame) {
    const bgColor = isByeGame ? 'bg-gray-500' : 'bg-blue-500';
    const borderColor = isByeGame ? 'border-gray-300' : 'border-blue-300';
    const displayText = isByeGame ? 'BYE' : '—';

    return (
      <div>
        <div className="mt-4 max-w-2xl mx-auto">
          <div className={`rounded-md overflow-hidden border ${borderColor}`}>
            <div className={`text-white p-4 text-center ${bgColor}`}>
              <div className="flex justify-center items-center text-xl">
                <span className="font-bold text-3xl">{displayText}</span>
              </div>
              {gameStatus && (
                <div className="mt-1 text-sm font-medium">
                  {isByeGame ? 'BYE Round' : gameStatus.charAt(0).toUpperCase() + gameStatus.slice(1).replace('-', ' ')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Reshape the data to be quarter-by-quarter for easier rendering
  const scoringByQuarter = useMemo(() => {
    if (!quarterScores || !Array.isArray(quarterScores)) {
      return [];
    }
    return quarterScores.reduce((acc, current, index) => {
      acc.push({
        quarter: index + 1,
        teamScore: current.teamScore,
        opponentScore: current.opponentScore
      });
      return acc;
    }, []);
  }, [quarterScores]);

  // Use contextual scores instead of raw scores
  const totalTeamScore = contextualTeamScore;
  const totalOpponentScore = contextualOpponentScore;

  // Calculate cumulative scores by quarter
  const cumulativeScores = useMemo(() => {
    if (!scoringByQuarter || scoringByQuarter.length === 0) {
      return [];
    }

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
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col items-center">
                <div className="text-center mb-3 font-medium text-base text-gray-700">Quarter Scores</div>
                <div className="grid grid-cols-4 gap-1 w-full max-w-xs">
                  {scoringByQuarter.map(score => {
                    const quarterWin = score.teamScore > score.opponentScore;
                    const quarterLoss = score.teamScore < score.opponentScore;
                    const quarterDraw = score.teamScore === score.opponentScore;

                    const quarterBgColor = quarterWin 
                      ? 'bg-green-100 border-green-300' 
                      : quarterLoss 
                        ? 'bg-red-100 border-red-300' 
                        : 'bg-amber-100 border-amber-300';

                    return (
                      <div key={`q-${score.quarter}`} className="text-center">
                        <div className="text-xs text-gray-500 mb-1">Q{score.quarter}</div>
                        <div className={`font-medium text-sm p-2 rounded border ${quarterBgColor} min-h-[2.5rem] flex items-center justify-center`}>
                          {score.teamScore}-{score.opponentScore}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-center mb-3 font-medium text-base text-gray-700">Game Scores</div>
                <div className="grid grid-cols-4 gap-1 w-full max-w-xs">
                  {cumulativeScores.map(score => {
                    const gameWin = score.cumulativeTeamScore > score.cumulativeOpponentScore;
                    const gameLoss = score.cumulativeTeamScore < score.cumulativeOpponentScore;
                    const gameDraw = score.cumulativeTeamScore === score.cumulativeOpponentScore;

                    const gameBgColor = gameWin 
                      ? 'bg-green-100 border-green-300' 
                      : gameLoss 
                        ? 'bg-red-100 border-red-300' 
                        : 'bg-amber-100 border-amber-300';

                    return (
                      <div key={`cumulative-${score.quarter}`} className="text-center">
                        <div className="text-xs text-gray-500 mb-1">Q{score.quarter}</div>
                        <div className={`font-medium text-sm p-2 rounded border ${gameBgColor} min-h-[2.5rem] flex items-center justify-center`}>
                          {score.cumulativeTeamScore}-{score.cumulativeOpponentScore}
                        </div>
                      </div>
                    );
                  })}
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
  const params = useParams();
  // Handle both /game/:id and /team/:teamId/games/:gameId URL patterns
  const gameId = params.gameId ? parseInt(params.gameId) : parseInt(params.id);
  const teamIdFromUrl = params.teamId ? parseInt(params.teamId) : null;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { currentTeam } = useClub();
  const [, setLocation] = useLocation();

  // State for edit game dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // State for game notes
  const [gameNotes, setGameNotes] = useState<string>("");
  const [isEditingNotes, setIsEditingNotes] = useState<boolean>(false);

  // State for award winner
  const [isEditingAward, setIsEditingAward] = useState<boolean>(false);
  // Team Awards Management
  const [selectedAwardWinner, setSelectedAwardWinner] = useState<number | null>(null);

  // Fetch team awards
  const { data: teamAwards } = useQuery({
    queryKey: ['teamAwards', gameId, currentTeam?.id],
    queryFn: async () => {
      if (!gameId) return [];

      const response = await fetch(`/api/games/${gameId}/team-awards`, {
        headers: {
          'x-current-club-id': currentClub?.id?.toString() || '',
          'x-current-team-id': currentTeam?.id?.toString() || '',
        }
      });

      if (!response.ok) {
        if (response.status === 404) return [];
        throw new Error('Failed to fetch team awards');
      }

      return response.json();
    },
    enabled: !!gameId && !!currentTeam?.id
  });

  // Set initial award winner from team awards
  useEffect(() => {
    console.log('Team awards effect triggered:', { teamAwards, gameId, currentTeamId: currentTeam?.id });

    if (teamAwards !== undefined) {
      if (teamAwards.length > 0) {
        const playerOfMatch = teamAwards.find((award: any) => award.awardType === 'player_of_match');
        const winnerId = playerOfMatch?.playerId || null;
        console.log('Setting award winner from team awards:', winnerId);
        setSelectedAwardWinner(winnerId);
      } else {
        // Clear selection if no awards exist
        console.log('No team awards found, clearing selection');
        setSelectedAwardWinner(null);
      }
    }
  }, [teamAwards, gameId, currentTeam?.id]);

  // Reset editing state when game changes (but don't reset the award winner here)
  useEffect(() => {
    setIsEditingAward(false);
  }, [gameId]);

  const updateAwardWinner = useMutation({
    mutationFn: async (playerId: number | null) => {
      if (!game || !currentTeam) throw new Error("No game or team selected");

      if (!playerId) {
        // Handle removing award - we'd need a DELETE endpoint for this
        throw new Error("Removing awards not yet implemented");
      }

      return await apiClient.post(`/api/games/${gameId}/team-awards`, {
        playerId,
        awardType: 'player_of_match',
        teamId: currentTeam.id
      });
    },
    onSuccess: () => {
      // Targeted invalidation for immediate responsiveness
      queryClient.invalidateQueries({ queryKey: ['teamAwards', gameId, currentTeam?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/games', gameId] });

      // Also invalidate games list to update award winner display
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key[0] === '/api/games' && key.length === 1;
        }
      });

      toast({
        title: "Success",
        description: "Player of the match updated successfully"
      });
    },
    onError: (error: any) => {
      console.error('Award winner update error:', error);
      toast({
        title: "Error",
        description: `Failed to update player of the match: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });

  const [activeTab, setActiveTab] = useState('overview');

    // Fetch current club using apiClient
    const { data: currentClub } = useQuery({
      queryKey: ['/api/clubs/current'],
      queryFn: () => apiClient.get('/api/clubs/current'),
    });

  // Extract club ID from URL as fallback when club context is not available
  const currentClubId = currentClub?.id || 54;

  // Fetch game data using team-perspective endpoint when possible
  const effectiveTeamId = teamIdFromUrl || currentTeam?.id;
  const { data: game, isLoading: gameLoading, error: gameError } = useQuery({
    queryKey: effectiveTeamId ? ['teams', effectiveTeamId, 'games', gameId] : ['/api/games', gameId],
    queryFn: () => {
      if (effectiveTeamId) {
        return apiClient.get<Game>(`/api/teams/${effectiveTeamId}/games/${gameId}`);
      } else {
        return apiClient.get<Game>(`/api/games/${gameId}`);
      }
    },
    enabled: !!gameId,
  });

  const { data: teamGameNotes } = useQuery({
    queryKey: ['/api/games', gameId, 'team-notes'],
    queryFn: () => apiClient.get<{ notes: string; enteredBy: number; createdAt: string; updatedAt: string }>(`/api/games/${gameId}/team-notes`),
    enabled: !!gameId,
  });

  // Fetch players using REST endpoint with CACHE_KEYS
  const { 
    data: players = [],
    isLoading: isLoadingPlayers,
    error: playersError
  } = useQuery({
    queryKey: CACHE_KEYS.players(currentClubId),
    queryFn: async () => {
      if (!currentClubId) {
        return [];
      }
      try {
        const result = await apiClient.get(`/api/clubs/${currentClubId}/players`);
        return Array.isArray(result) ? result : [];
      } catch (error) {
        console.error('Error fetching players:', error);
        return [];
      }
    },
    enabled: !!currentClubId,
    staleTime: 1 * 60 * 1000, // Reduced cache time
    refetchOnWindowFocus: true, // Enable refetch to force data loading
    retry: 3
  });

  // Fetch game statuses
  const { 
    data: gameStatuses = [],
    isLoading: isLoadingGameStatuses
  } = useQuery({
    queryKey: ['/api/game-statuses'],
    queryFn: () => apiClient.get('/api/game-statuses'),
    select: (data) => Array.isArray(data) ? data : []
  });

  // Fetch teams
  const { 
    data: teams = [],
    isLoading: isLoadingTeams,
    error: teamsError
  } = useQuery({
    queryKey: ['/api/teams'],
    queryFn: () => apiClient.get('/api/teams'),
    select: (data) => Array.isArray(data) ? data : [],
    enabled: !!currentClubId
  });

  // Fetch all teams
  const {
    data: allTeams = [],
    isLoading: isLoadingAllTeams,
    error: allTeamsError
  } = useQuery({
    queryKey: ['/api/teams/all'],
    queryFn: () => apiClient.get('/api/teams/all'),
    select: (data) => Array.isArray(data) ? data : [],
    enabled: true
  });

  // Fetch roster for this game using team-specific endpoint when possible
  const { 
    data: roster,
    isLoading: isLoadingRoster,
    refetch: refetchRosters
  } = useQuery({
    queryKey: effectiveTeamId ? ['teams', effectiveTeamId, 'games', gameId, 'roster'] : ['/api/games', gameId, 'rosters'],
    queryFn: () => {
      if (effectiveTeamId) {
        return apiClient.get(`/api/teams/${effectiveTeamId}/games/${gameId}/rosters`);
      } else {
        return apiClient.get(`/api/games/${gameId}/rosters`);
      }
    },
    enabled: !isNaN(gameId)
  });

  // Fetch seasons data
  const { data: seasons = [], isLoading: isLoadingSeasons } = useQuery<any[]>({
    queryKey: ['/api/seasons'],
    queryFn: () => apiClient.get('/api/seasons'),
    select: (data) => Array.isArray(data) ? data : []
  });

  // Fetch active season
  const { data: activeSeason, isLoading: isLoadingActiveSeason } = useQuery<any>({
    queryKey: ['/api/seasons/active'],
    queryFn: () => apiClient.get('/api/seasons/active')
  });

  // Force refetch when component mounts or route changes
  useEffect(() => {
    if (gameId && !isNaN(gameId)) {
      console.log("Loaded roster data:", roster?.length, "entries");
      console.log("Roster first entry:", roster?.[0]);
      console.log("Players data:", { players, isLoadingPlayers, playersLength: players?.length });
      console.log("Teams data:", { teams, isLoadingTeams, teamsLength: teams?.length });
      console.log("Current club:", currentClub);
      console.log("Current team:", currentTeam);
      console.log("Effective team ID:", effectiveTeamId);
      // Always refetch roster data when navigating to this page
      refetchRosters();
    }
  }, [gameId, refetchRosters, teams, isLoadingTeams, currentClub, roster, currentTeam, players, isLoadingPlayers, effectiveTeamId]);

  // Fetch game stats
  const { 
    data: gameStats,
    isLoading: isLoadingStats,
    refetch: refetchGameStats
  } = useQuery({
    queryKey: ['/api/games', gameId, 'stats'],
    queryFn: () => apiClient.get(`/api/games/${gameId}/stats`),
    enabled: !isNaN(gameId),
    staleTime: 0, // Always consider stale to get fresh data
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: 'always' // Always refetch when component mounts
  });

  const homeTeamId = game?.homeTeamId;
  const awayTeamId = game?.awayTeamId;
  const isInterClub = homeTeamId && awayTeamId && teams.some(t => t.id === homeTeamId) && teams.some(t => t.id === awayTeamId);

  // Fetch official scores
  const { data: officialScores } = useQuery({
    queryKey: ['/api/games', gameId, 'scores'],
    queryFn: () => apiClient.get(`/api/games/${gameId}/scores`),
    enabled: !isNaN(gameId)
  });

  // Calculate scores using official score priority for game details
  const gameScores = useMemo(() => {
    if (!game) return { quarterScores: [], totalTeamScore: 0, totalOpponentScore: 0 };

    // Ensure we always pass the current team ID for consistent perspective
    const effectiveCurrentTeamId = currentTeam?.id || currentClub?.id;

    // Game details should prioritize official scores
    return gameScoreService.calculateGameScoresSync(
      gameStats || [], 
      game.status, 
      { teamGoals: game.statusTeamGoals, opponentGoals: game.statusOpponentGoals },
      isInterClub,
      homeTeamId,
      awayTeamId,
      effectiveCurrentTeamId,
      officialScores || undefined
    );
  }, [gameStats, game, isInterClub, homeTeamId, awayTeamId, currentTeam?.id, currentClub?.id, officialScores]);

  const { quarterScores, totalTeamScore, totalOpponentScore } = gameScores;

  // Check for score mismatches in inter-club games
  let scoreMismatchWarning = null;
  if (isInterClub && homeTeamId && awayTeamId && gameStats && gameStats.length > 0) {
    const homeStats = gameStats.filter(s => s.teamId === homeTeamId);
    const awayStats = gameStats.filter(s => s.teamId === awayTeamId);

    const homeTeamStats = {
      teamId: homeTeamId,
      goalsFor: homeStats.reduce((sum, s) => sum + (s.goalsFor || 0), 0),
      goalsAgainst: homeStats.reduce((sum, s) => sum + (s.goalsAgainst || 0), 0)
    };

    const awayTeamStats = {
      teamId: awayTeamId,
      goalsFor: awayStats.reduce((sum, s) => sum + (s.goalsFor || 0), 0),
      goalsAgainst: awayStats.reduce((sum, s) => sum + (s.goalsAgainst || 0), 0)
    };

    const validation = validateInterClubScores(homeTeamStats, awayTeamStats);
    if (validation.hasDiscrepancy) {
      scoreMismatchWarning = getScoreDiscrepancyWarning(validation);
    }
  }

  // Calculate quarter scores and cumulative scores for display
  const scoringByQuarter = quarterScores?.map(q => ({
    quarter: q.quarter,
    teamScore: q.teamScore,
    opponentScore: q.opponentScore
  })) || [];

  const cumulativeScores = quarterScores?.map((_, index) => {
    const cumulativeTeamScore = quarterScores.slice(0, index + 1).reduce((sum, q) => sum + q.teamScore, 0);
    const cumulativeOpponentScore = quarterScores.slice(0, index + 1).reduce((sum, q) => sum + q.opponentScore, 0);
    return {
      quarter: index + 1,
      cumulativeTeamScore,
      cumulativeOpponentScore
    };
  }) || [];

  // Debug game data
  useEffect(() => {
    if (game) {

    }
  }, [game]);

  // Loading state - wait for both players and roster to load before showing the page
  if (isLoadingPlayers || isLoadingRoster || isLoadingGameStatuses || isLoadingTeams || gameLoading || !game) { // Removed isLoadingOpponents
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
  //const opponentName = getOpponentName(opponents || [], game.opponentId); // Removed opponentName

  // Check game status using status ID (matching games list logic)
  const isByeGame = game?.statusId === 6;
  const isUpcomingGame = game?.statusId === 1;
  const isInProgressGame = game?.statusId === 2;
  const isCompletedGame = game?.statusId === 3;

  // Helper function to get score display with correct team context
  const finalTeamScore = quarterScores?.reduce((sum, q) => sum + q.teamScore, 0) || 0;
  const finalOpponentScore = quarterScores?.reduce((sum, q) => sum + q.opponentScore, 0) || 0;

  // Determine if we need to flip the perspective for inter-club games
  const getCorrectScoreContext = () => {
    if (!game || !currentTeam) {
      return { teamScore: finalTeamScore, opponentScore: finalOpponentScore };
    }

    // Check if this is an inter-club game (both teams from same club)
    const isInterClubGame = game.homeTeamId && game.awayTeamId && 
                           teams.some(t => t.id === game.homeTeamId) && 
                           teams.some(t => t.id === game.awayTeamId);

    if (isInterClubGame) {
      // For inter-club games, use reconciled scores to ensure consistency
      const homeTeamStats = gameStats?.filter(stat => stat.teamId === game.homeTeamId) || [];
      const awayTeamStats = gameStats?.filter(stat => stat.teamId === game.awayTeamId) || [];

      const homeTeamTotals = {
        goals: homeTeamStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0),
        goalsAgainst: homeTeamStats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0)
      };

      const awayTeamTotals = {
        goals: awayTeamStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0),
        goalsAgainst: awayTeamStats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0)
      };

      return {
        homeTeamGoals: homeTeamTotals.goals,
        awayTeamGoals: awayTeamTotals.goals
      };
    }

    return { homeTeamGoals: 0, awayTeamGoals: 0 };
  }, [game, gameStats]);

  // Determine if we can show roster based on team context
  const canShowRoster = useMemo(() => {
    if (!game || !currentTeamId) return false;
    return game.homeTeamId === currentTeamId || game.awayTeamId === currentTeamId;
  }, [game, currentTeamId]);

  // Determine roster management URL
  const rosterManagementUrl = useMemo(() => {
    if (!game || !currentTeamId) return null;
    return `/team/${currentTeamId}/roster/game/${game.id}`;
  }, [game, currentTeamId]);

  if (isLoadingGame) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Game not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>{game.homeTeamName} vs {game.awayTeamName} - {TEAM_NAME}</title>
        <meta name="description" content={`Game details for ${game.homeTeamName} vs ${game.awayTeamName} on ${formatDate(game.date)}`} />
      </Helmet>

      <div className="mb-4">
        <BackButton />
      </div>

      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Game Details</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">
                  {game.homeTeamName} vs {game.awayTeamName}
                </CardTitle>
                <CardDescription>
                  {formatDate(game.date)} at {game.time} • Round {game.round}
                </CardDescription>
              </div>
              <Badge variant={game.statusIsCompleted ? "default" : "secondary"}>
                {game.statusDisplayName}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center">
                <h3 className="font-semibold text-lg">{game.homeTeamName}</h3>
                <p className="text-muted-foreground">{game.homeClubName}</p>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg">{game.awayTeamName}</h3>
                <p className="text-muted-foreground">{game.awayClubName}</p>
              </div>
            </div>
            
            {game.statusIsCompleted && (
              <div className="mt-4 text-center">
                <div className="text-3xl font-bold">
                  {finalScores.homeTeamGoals} - {finalScores.awayTeamGoals}
                </div>
              </div>
            )}

            {canShowRoster && rosterManagementUrl && (
              <div className="mt-4 flex justify-center">
                <Button asChild variant="outline">
                  <Link href={rosterManagementUrl}>
                    <ClipboardList className="h-4 w-4 mr-2" />
                    Manage Roster
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="roster">Roster</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Game Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">{formatDate(game.date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-medium">{game.time}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Round</p>
                    <p className="font-medium">{game.round}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Season</p>
                    <p className="font-medium">{game.seasonName}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roster" className="space-y-4">
            {canShowRoster ? (
              <RosterDisplay gameId={game.id} />
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    Roster information not available for this game
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <StatsDisplay gameId={game.id} />
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Game Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Game
                  </Button>
                  <Button variant="outline" size="sm">
                    <Printer className="h-4 w-4 mr-2" />
                    Print Summary
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Simple roster display component
const RosterDisplay = ({ gameId }: { gameId: number }) => {
  const { data: roster, isLoading } = useQuery({
    queryKey: ['game-roster', gameId],
    queryFn: () => fetch(`/api/games/${gameId}/rosters`).then(res => res.json())
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-2">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Roster</CardTitle>
      </CardHeader>
      <CardContent>
        {roster && roster.length > 0 ? (
          <div className="space-y-2">
            {roster.map((entry: any) => (
              <div key={`${entry.quarter}-${entry.position}`} className="flex justify-between">
                <span>{entry.position} (Q{entry.quarter})</span>
                <span>{entry.playerName || `Player ${entry.playerId}`}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No roster data available</p>
        )}
      </CardContent>
    </Card>
  );
};

// Simple stats display component
const StatsDisplay = ({ gameId }: { gameId: number }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['game-stats', gameId],
    queryFn: () => fetch(`/api/games/${gameId}/stats`).then(res => res.json())
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        {stats && stats.length > 0 ? (
          <div className="space-y-2">
            {stats.map((stat: any, index: number) => (
              <div key={index} className="grid grid-cols-3 gap-2 text-sm">
                <span>{stat.position} (Q{stat.quarter})</span>
                <span>Goals: {stat.goalsFor || 0}</span>
                <span>Rebounds: {stat.rebounds || 0}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No statistics available</p>
        )}
      </CardContent>
    </Card>
  );
};

export default GameDetails;