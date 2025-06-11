import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  RotateCcw, 
  Plus,
  Minus,
  ArrowUpDown,
  Grid3X3,
  Target,
  Clock,
  ChevronRight,
  ChevronLeft,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data
const samplePlayers = [
  { id: 1, name: "Sarah J", positions: ["GS", "GA"], color: "bg-red-500", displayName: "Sarah J" },
  { id: 2, name: "Emma K", positions: ["WA", "C"], color: "bg-blue-500", displayName: "Emma K" },
  { id: 3, name: "Lucy M", positions: ["C", "WD"], color: "bg-green-500", displayName: "Lucy M" },
  { id: 4, name: "Kate R", positions: ["WD", "GD"], color: "bg-purple-500", displayName: "Kate R" },
  { id: 5, name: "Amy T", positions: ["GD", "GK"], color: "bg-orange-500", displayName: "Amy T" },
  { id: 6, name: "Zoe L", positions: ["GK", "GD"], color: "bg-pink-500", displayName: "Zoe L" },
  { id: 7, name: "Mia B", positions: ["GA", "WA"], color: "bg-teal-500", displayName: "Mia B" },
  { id: 8, name: "Ella C", positions: ["WA", "C", "WD"], color: "bg-yellow-500", displayName: "Ella C" },
  { id: 9, name: "Ava D", positions: ["C", "WA"], color: "bg-indigo-500", displayName: "Ava D" },
  { id: 10, name: "Lily F", positions: ["GS", "GA", "WA"], color: "bg-cyan-500", displayName: "Lily F" }
];

const positions = ["GS", "GA", "WA", "C", "WD", "GD", "GK"];

// Define a PlayerBox Component
const PlayerBox = ({ player, showPositions = true, size = "md", className = "" }: {
  player: any,
  showPositions?: boolean,
  size?: "sm" | "md",
  className?: string
}) => {
  const avatarSize = size === "sm" ? "h-6 w-6" : "h-8 w-8";
  const fontSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <Avatar className={avatarSize}>
        <AvatarFallback className={`${player.color} text-white text-xs`}>
          {player.name.split(' ').map(n => n[0]).join('')}
        </AvatarFallback>
      </Avatar>
      <div className={`${fontSize} font-medium mt-1`}>{player.displayName}</div>
      {showPositions && (
        <div className="text-xs text-gray-500">
          Plays: {player.positions.join(', ')}
        </div>
      )}
    </div>
  );
};

// Drag and Drop Interface
function DragDropRoster() {
  const [currentQuarter, setCurrentQuarter] = useState(1);
  const [assignments, setAssignments] = useState<Record<number, Record<string, number | null>>>({
    1: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null },
    2: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null },
    3: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null },
    4: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null }
  });
  const [draggedPlayer, setDraggedPlayer] = useState<number | null>(null);

  const handleDragStart = (playerId: number) => {
    setDraggedPlayer(playerId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (position: string) => {
    if (draggedPlayer) {
      // Remove player from previous position in current quarter
      const newAssignments = {
        ...assignments,
        [currentQuarter]: { ...assignments[currentQuarter] }
      };
      Object.keys(newAssignments[currentQuarter]).forEach(pos => {
        if (newAssignments[currentQuarter][pos] === draggedPlayer) {
          newAssignments[currentQuarter][pos] = null;
        }
      });
      newAssignments[currentQuarter][position] = draggedPlayer;
      setAssignments(newAssignments);
    }
    setDraggedPlayer(null);
  };

  // Reset functions
  const handleResetQuarter = () => {
    const newAssignments = {
      ...assignments,
      [currentQuarter]: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null }
    };
    setAssignments(newAssignments);
  };

  const handleResetAll = () => {
    setAssignments({
      1: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null },
      2: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null },
      3: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null },
      4: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null }
    });
  };

  // Copy quarter function
  const handleCopyQuarter = (sourceQuarter: number, targetQuarter: number) => {
    if (sourceQuarter === targetQuarter) return;

    const newAssignments = {
      ...assignments,
      [targetQuarter]: { ...assignments[sourceQuarter] }
    };
    setAssignments(newAssignments);
  };

  const currentQuarterAssignments = assignments[currentQuarter];
  const assignedPlayerIds = Object.values(currentQuarterAssignments).filter(id => id !== null);
  const availablePlayers = samplePlayers.filter(p => !assignedPlayerIds.includes(p.id));

  // Summaries
  const playerSummary = samplePlayers.reduce((acc, player) => {
    const quartersPlayed = Object.entries(assignments).reduce((qtrs, [quarter, quarterAssignments]) => {
      if (Object.values(quarterAssignments).includes(player.id)) {
        qtrs.push(parseInt(quarter));
      }
      return qtrs;
    }, [] as number[]);

    const positionsPlayed = positions.filter(pos => {
      return Object.values(assignments).some(quarterAssignments => {
        return quarterAssignments[pos] === player.id;
      });
    });

    acc[player.id] = {
      totalQuarters: quartersPlayed.length,
      quarters: quartersPlayed,
      positions: positionsPlayed
    };
    return acc;
  }, {});

  const positionSummary = positions.reduce((acc, position) => {
    const playersForPosition = Object.values(assignments).reduce((players, quarterAssignments) => {
      const playerId = quarterAssignments[position];
      if (playerId && !players.includes(playerId)) {
        players.push(playerId);
      }
      return players;
    }, [] as number[]);

    const quartersFilled = Object.entries(assignments).reduce((qtrs, [quarter, quarterAssignments]) => {
      if (quarterAssignments[position] != null && !qtrs.includes(parseInt(quarter))) {
        qtrs.push(parseInt(quarter));
      }
      return qtrs;
    }, [] as number[]);

    acc[position] = {
      players: playersForPosition,
      quarters: quartersFilled
    };
    return acc;
  }, {});

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Drag & Drop Roster Assignment</h3>

        {/* Quarter Selection and Controls */}
        <div className="flex items-center justify-between mb-4">
          <Tabs value={currentQuarter.toString()} onValueChange={(value) => setCurrentQuarter(parseInt(value))}>
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="1">Quarter 1</TabsTrigger>
              <TabsTrigger value="2">Quarter 2</TabsTrigger>
              <TabsTrigger value="3">Quarter 3</TabsTrigger>
              <TabsTrigger value="4">Quarter 4</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Quarter Management Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetQuarter}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset Quarter
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetAll}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Reset All
            </Button>

            {/* Copy Quarter Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              {[1, 2, 3, 4].map(sourceQuarter => (
                <Select
                  key={sourceQuarter}
                  onValueChange={(value) => {
                    if (value) {
                      handleCopyQuarter(sourceQuarter, parseInt(value));
                    }
                  }}
                >
                  <SelectTrigger className="w-[140px] text-xs">
                    <SelectValue placeholder={`Copy Q${sourceQuarter} to...`} />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4]
                      .filter(q => q !== sourceQuarter)
                      .map(targetQuarter => (
                        <SelectItem key={targetQuarter} value={targetQuarter.toString()}>
                          Quarter {targetQuarter}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              ))}
            </div>
          </div>
        </div>

        {/* Court layout */}
        <div className="grid grid-cols-3 gap-4 mb-6 bg-green-50 p-4 rounded-lg">
          {/* Attacking Third */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-center">Attacking Third</h4>
            {['GS', 'GA'].map(position => (
              <div
                key={position}
                className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center min-h-[120px] bg-white hover:bg-gray-50 transition-colors"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(position)}
              >
                <div className="text-sm font-bold mb-2 text-gray-700">{position}</div>
                {currentQuarterAssignments[position] ? (
                  <div className="scale-75 origin-center">
                    <PlayerBox 
                      player={samplePlayers.find(p => p.id === currentQuarterAssignments[position])!}
                      showPositions={false}
                      size="sm"
                      className="shadow-sm"
                    />
                  </div>
                ) : (
                  <div className="text-gray-400 text-xs mt-4">
                    Drop player here
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Center Third */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-center">Center Third</h4>
            {['WA', 'C', 'WD'].map(position => (
              <div
                key={position}
                className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center min-h-[120px] bg-white hover:bg-gray-50 transition-colors"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(position)}
              >
                <div className="text-sm font-bold mb-2 text-gray-700">{position}</div>
                {currentQuarterAssignments[position] ? (
                  <div className="scale-75 origin-center">
                    <PlayerBox 
                      player={samplePlayers.find(p => p.id === currentQuarterAssignments[position])!}
                      showPositions={false}
                      size="sm"
                      className="shadow-sm"
                    />
                  </div>
                ) : (
                  <div className="text-gray-400 text-xs mt-4">
                    Drop player here
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Defending Third */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-center">Defending Third</h4>
            {['GD', 'GK'].map(position => (
              <div
                key={position}
                className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center min-h-[120px] bg-white hover:bg-gray-50 transition-colors"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(position)}
              >
                <div className="text-sm font-bold mb-2 text-gray-700">{position}</div>
                {currentQuarterAssignments[position] ? (
                  <div className="scale-75 origin-center">
                    <PlayerBox 
                      player={samplePlayers.find(p => p.id === currentQuarterAssignments[position])!}
                      showPositions={false}
                      size="sm"
                      className="shadow-sm"
                    />
                  </div>
                ) : (
                  <div className="text-gray-400 text-xs mt-4">
                    Drop player here
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Available players for current quarter */}
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-2">Available Players (Quarter {currentQuarter})</h4>
          <div className="flex flex-wrap gap-2">
            {availablePlayers.map(player => (
              <div
                key={player.id}
                draggable
                onDragStart={() => handleDragStart(player.id)}
                className="bg-gray-100 border rounded px-3 py-2 cursor-move hover:bg-gray-200 text-sm"
              >
                {player.displayName}
              </div>
            ))}
          </div>
        </div>

        {/* Game Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Player Summary */}
          <div>
            <h4 className="text-sm font-medium mb-3">Player Summary</h4>
            <div className="space-y-2">
              {samplePlayers.map(player => {
                const stats = playerSummary[player.id];
                const quarterDisplay = stats.quarters.length > 0 
                  ? `Q${stats.quarters.sort().join(', Q')}` 
                  : 'No quarters';

                return (
                  <div key={player.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium text-sm">{player.displayName}</div>
                      <div className="text-xs text-gray-500">
                        Positions: {stats.positions.join(', ') || 'None'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{stats.totalQuarters}/4 quarters</div>
                      <div className="text-xs text-gray-500">
                        {quarterDisplay}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Position Summary */}
          <div>
            <h4 className="text-sm font-medium mb-3">Position Summary</h4>
            <div className="space-y-2">
              {['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'].map(position => {
                const stats = positionSummary[position];
                const playerNames = stats.players.map(id => 
                  samplePlayers.find(p => p.id === id)?.displayName
                ).filter(Boolean);

                return (
                  <div key={position} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium text-sm">{position}</div>
                      <div className="text-xs text-gray-500">
                        {playerNames.join(', ') || 'No players assigned'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{stats.players.length} players</div>
                      <div className="text-xs text-gray-500">
                        {stats.quarters.length}/4 quarters filled
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function RosterManagementExamples() {
  const breadcrumbs = [
    { label: 'Examples', href: '/component-examples' },
    { label: 'Roster Management' }
  ];

  return (
    <PageTemplate
      title="Roster Management Examples"
      subtitle="Interactive roster assignment interfaces for netball teams"
      breadcrumbs={breadcrumbs}
    >
      <Helmet>
        <title>Roster Management Examples | Team Manager</title>
      </Helmet>

      <div className="space-y-8">
        {/* Drag and Drop Interface */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Drag & Drop Roster Management</h2>
          <DragDropRoster />
        </section>

        {/* Design Guidelines */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Design Guidelines</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Roster Management Best Practices</h4>
                  <ul className="text-sm space-y-2 text-gray-600">
                    <li>• Provide clear visual feedback for drag operations</li>
                    <li>• Show quarter summaries and player statistics</li>
                    <li>• Enable easy copying between quarters</li>
                    <li>• Highlight position eligibility constraints</li>
                    <li>• Offer multiple assignment methods (drag, click, grid)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">User Experience Considerations</h4>
                  <ul className="text-sm space-y-2 text-gray-600">
                    <li>• Make court layout intuitive and recognizable</li>
                    <li>• Provide undo/redo functionality</li>
                    <li>• Show playing time distribution clearly</li>
                    <li>• Enable bulk operations for efficiency</li>
                    <li>• Support both touch and mouse interactions</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </PageTemplate>
  );
}