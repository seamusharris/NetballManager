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

// Enhanced Player Card Component
const PlayerCard = ({ 
  player, 
  showPositions = true, 
  size = "md", 
  className = "",
  isDragging = false,
  isCompatible = true,
  isAssigned = false
}: {
  player: any,
  showPositions?: boolean,
  size?: "sm" | "md",
  className?: string,
  isDragging?: boolean,
  isCompatible?: boolean,
  isAssigned?: boolean
}) => {
  const avatarSize = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const cardSize = size === "sm" ? "p-2" : "p-3";
  
  return (
    <div className={`
      ${cardSize} rounded-lg border-2 transition-all duration-200
      ${isDragging ? 'opacity-50 scale-95 border-blue-400 bg-blue-50' : ''}
      ${isCompatible ? 'border-green-200 hover:border-green-300' : 'border-red-200 hover:border-red-300'}
      ${isAssigned ? 'bg-gray-50 border-gray-300' : 'bg-white hover:shadow-md'}
      ${className}
    `}>
      <div className="flex flex-col items-center space-y-1">
        <Avatar className={avatarSize}>
          <AvatarFallback className={`${player.color} text-white text-xs font-semibold`}>
            {player.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div className="text-sm font-medium text-center">{player.displayName}</div>
        {showPositions && (
          <div className="flex flex-wrap gap-1 justify-center">
            {player.positions.map(pos => (
              <Badge key={pos} variant="secondary" className="text-xs px-1 py-0">
                {pos}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced Position Slot Component
const PositionSlot = ({ 
  position, 
  player, 
  isDropTarget = false, 
  isCompatible = true,
  onDrop,
  courtSection 
}: {
  position: string,
  player?: any,
  isDropTarget?: boolean,
  isCompatible?: boolean,
  onDrop: () => void,
  courtSection: 'attacking' | 'center' | 'defending'
}) => {
  const sectionColors = {
    attacking: 'bg-gradient-to-br from-red-50 to-red-100 border-red-200',
    center: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200',
    defending: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
  };

  return (
    <div
      className={`
        relative border-2 border-dashed rounded-xl p-4 text-center min-h-[140px] 
        transition-all duration-300 flex flex-col justify-center
        ${isDropTarget && isCompatible ? 'border-green-400 bg-green-50 scale-105' : ''}
        ${isDropTarget && !isCompatible ? 'border-red-400 bg-red-50' : ''}
        ${!isDropTarget ? sectionColors[courtSection] : ''}
        hover:shadow-lg
      `}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      {/* Position Label */}
      <div className="absolute top-2 left-2">
        <Badge variant="outline" className="font-bold text-sm">
          {position}
        </Badge>
      </div>

      {/* Player or Drop Zone */}
      {player ? (
        <div 
          className="mt-2 cursor-move" 
          draggable
          onDragStart={() => handleDragStart(player.id)}
        >
          <PlayerCard 
            player={player}
            showPositions={false}
            size="sm"
            isAssigned={true}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center mb-2">
            <Plus className="h-6 w-6" />
          </div>
          <div className="text-xs font-medium">
            {isDropTarget ? (isCompatible ? 'Drop here' : 'Not compatible') : 'Drag player here'}
          </div>
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
  const [dragOverPosition, setDragOverPosition] = useState<string | null>(null);

  const handleDragStart = (playerId: number) => {
    setDraggedPlayer(playerId);
  };

  const handleDragOver = (e: React.DragEvent, position: string) => {
    e.preventDefault();
    setDragOverPosition(position);
  };

  const handleDragLeave = () => {
    setDragOverPosition(null);
  };

  const handleDrop = (position: string) => {
    if (draggedPlayer) {
      // Remove player from previous position in current quarter
      const newAssignments = {
        ...assignments,
        [currentQuarter]: { ...assignments[currentQuarter] }
      };
      
      // Clear the player from any previous position in this quarter
      Object.keys(newAssignments[currentQuarter]).forEach(pos => {
        if (newAssignments[currentQuarter][pos] === draggedPlayer) {
          newAssignments[currentQuarter][pos] = null;
        }
      });
      
      // If there's already a player in the target position, remove them
      if (newAssignments[currentQuarter][position] !== null) {
        newAssignments[currentQuarter][position] = null;
      }
      
      // Assign the dragged player to the new position
      newAssignments[currentQuarter][position] = draggedPlayer;
      setAssignments(newAssignments);
    }
    setDraggedPlayer(null);
    setDragOverPosition(null);
  };

  // Check if a player is compatible with a position
  const isPlayerCompatible = (playerId: number, position: string) => {
    const player = samplePlayers.find(p => p.id === playerId);
    return player ? player.positions.includes(position) : false;
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

        {/* Enhanced Court Layout */}
        <div className="mb-6 bg-gradient-to-b from-green-100 to-green-50 p-6 rounded-xl border border-green-200 shadow-inner">
          <div className="grid grid-cols-3 gap-6">
            {/* Attacking Third */}
            <div className="space-y-3">
              <div className="text-center">
                <h4 className="text-sm font-semibold text-red-700 mb-1">Attacking Third</h4>
                <div className="h-0.5 bg-red-200 rounded"></div>
              </div>
              {['GS', 'GA'].map(position => (
                <PositionSlot
                  key={position}
                  position={position}
                  player={currentQuarterAssignments[position] ? 
                    samplePlayers.find(p => p.id === currentQuarterAssignments[position]) : null
                  }
                  isDropTarget={dragOverPosition === position}
                  isCompatible={draggedPlayer ? isPlayerCompatible(draggedPlayer, position) : true}
                  onDrop={() => handleDrop(position)}
                  courtSection="attacking"
                />
              ))}
            </div>

            {/* Center Third */}
            <div className="space-y-3">
              <div className="text-center">
                <h4 className="text-sm font-semibold text-blue-700 mb-1">Center Third</h4>
                <div className="h-0.5 bg-blue-200 rounded"></div>
              </div>
              {['WA', 'C', 'WD'].map(position => (
                <div
                  key={position}
                  onDragOver={(e) => handleDragOver(e, position)}
                  onDragLeave={handleDragLeave}
                >
                  <PositionSlot
                    position={position}
                    player={currentQuarterAssignments[position] ? 
                      samplePlayers.find(p => p.id === currentQuarterAssignments[position]) : null
                    }
                    isDropTarget={dragOverPosition === position}
                    isCompatible={draggedPlayer ? isPlayerCompatible(draggedPlayer, position) : true}
                    onDrop={() => handleDrop(position)}
                    courtSection="center"
                  />
                </div>
              ))}
            </div>

            {/* Defending Third */}
            <div className="space-y-3">
              <div className="text-center">
                <h4 className="text-sm font-semibold text-green-700 mb-1">Defending Third</h4>
                <div className="h-0.5 bg-green-200 rounded"></div>
              </div>
              {['GD', 'GK'].map(position => (
                <div
                  key={position}
                  onDragOver={(e) => handleDragOver(e, position)}
                  onDragLeave={handleDragLeave}
                >
                  <PositionSlot
                    position={position}
                    player={currentQuarterAssignments[position] ? 
                      samplePlayers.find(p => p.id === currentQuarterAssignments[position]) : null
                    }
                    isDropTarget={dragOverPosition === position}
                    isCompatible={draggedPlayer ? isPlayerCompatible(draggedPlayer, position) : true}
                    onDrop={() => handleDrop(position)}
                    courtSection="defending"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Available Players Pool */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-5 w-5 text-blue-600" />
            <h4 className="text-lg font-semibold text-gray-800">Available Players - Quarter {currentQuarter}</h4>
            <Badge variant="secondary">{availablePlayers.length} players</Badge>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            {availablePlayers.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {availablePlayers.map(player => (
                  <div
                    key={player.id}
                    draggable
                    onDragStart={() => handleDragStart(player.id)}
                    className="cursor-move transform hover:scale-105 transition-transform"
                  >
                    <PlayerCard
                      player={player}
                      showPositions={true}
                      isDragging={draggedPlayer === player.id}
                      isCompatible={true}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="font-medium">All players assigned for this quarter</p>
                <p className="text-sm">Switch to another quarter or reset assignments</p>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Game Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Player Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5 text-blue-600" />
                Player Game Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {samplePlayers.map(player => {
                const stats = playerSummary[player.id];
                const quarterDisplay = stats.quarters.length > 0 
                  ? `Q${stats.quarters.sort().join(', Q')}` 
                  : 'None';
                const playingTimePercent = (stats.totalQuarters / 4) * 100;

                return (
                  <div key={player.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className={`${player.color} text-white text-xs`}>
                          {player.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{player.displayName}</div>
                        <div className="text-xs text-gray-600">
                          {stats.positions.length > 0 ? stats.positions.join(', ') : 'No positions'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-sm font-semibold">{stats.totalQuarters}/4</div>
                        <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 transition-all"
                            style={{ width: `${playingTimePercent}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">{quarterDisplay}</div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Position Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Grid3X3 className="h-5 w-5 text-green-600" />
                Position Coverage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'].map(position => {
                const stats = positionSummary[position];
                const playerNames = stats.players.map(id => 
                  samplePlayers.find(p => p.id === id)?.displayName
                ).filter(Boolean);
                const coveragePercent = (stats.quarters.length / 4) * 100;

                return (
                  <div key={position} className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-bold">{position}</Badge>
                        <span className="text-sm text-gray-600">{stats.players.length} players</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{stats.quarters.length}/4</span>
                        <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 transition-all"
                            style={{ width: `${coveragePercent}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600">
                      {playerNames.length > 0 ? playerNames.join(', ') : 'No players assigned'}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
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