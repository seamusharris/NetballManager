
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, RotateCcw, Plus, Shuffle, Copy, Target, Grid3X3, Clock,
  ArrowUpDown, Save, Trash2, MoreHorizontal, Move3D
} from 'lucide-react';
import { PlayerBox } from '@/components/ui/player-box';

// Sample player data matching your app's structure
const samplePlayers = [
  {
    id: 1,
    displayName: "Abbey N",
    firstName: "Abbey",
    lastName: "N",
    positionPreferences: ["GS", "GA"],
    avatarColor: "bg-red-500",
    active: true
  },
  {
    id: 2,
    displayName: "Abby D",
    firstName: "Abby",
    lastName: "D",
    positionPreferences: ["GA", "WA"],
    avatarColor: "bg-blue-500",
    active: true
  },
  {
    id: 3,
    displayName: "Ava",
    firstName: "Ava",
    lastName: "",
    positionPreferences: ["WA", "C"],
    avatarColor: "bg-green-500",
    active: true
  },
  {
    id: 4,
    displayName: "Emily",
    firstName: "Emily",
    lastName: "",
    positionPreferences: ["C", "WD"],
    avatarColor: "bg-purple-500",
    active: true
  },
  {
    id: 5,
    displayName: "Erin",
    firstName: "Erin",
    lastName: "",
    positionPreferences: ["WD", "GD"],
    avatarColor: "bg-orange-500",
    active: true
  },
  {
    id: 6,
    displayName: "Evie",
    firstName: "Evie",
    lastName: "",
    positionPreferences: ["GD", "GK"],
    avatarColor: "bg-pink-500",
    active: true
  },
  {
    id: 7,
    displayName: "Jess",
    firstName: "Jess",
    lastName: "",
    positionPreferences: ["GK"],
    avatarColor: "bg-teal-500",
    active: true
  },
  {
    id: 8,
    displayName: "Lily",
    firstName: "Lily",
    lastName: "",
    positionPreferences: ["GA", "GS"],
    avatarColor: "bg-indigo-500",
    active: true
  },
  {
    id: 9,
    displayName: "Mia",
    firstName: "Mia",
    lastName: "",
    positionPreferences: ["WA", "C", "GA"],
    avatarColor: "bg-yellow-500",
    active: true
  }
];

const NETBALL_POSITIONS = ['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'];

// Enhanced Position Slot Component using your styling patterns
const PositionSlot = ({ 
  position, 
  player, 
  isDropTarget = false, 
  isCompatible = true,
  onDrop,
  courtSection,
  onDragStart,
  variant = "default"
}: {
  position: string,
  player?: any,
  isDropTarget?: boolean,
  isCompatible?: boolean,
  onDrop: () => void,
  courtSection: 'attacking' | 'center' | 'defending',
  onDragStart: (playerId: number) => void,
  variant?: 'default' | 'compact' | 'minimal'
}) => {
  const sectionColors = {
    attacking: 'bg-gradient-to-br from-red-50 to-red-100 border-red-200',
    center: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200',
    defending: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
  };

  const slotSizes = {
    default: 'min-h-[140px] p-4',
    compact: 'min-h-[100px] p-3',
    minimal: 'min-h-[80px] p-2'
  };

  return (
    <div
      className={`
        relative border-2 border-dashed rounded-xl text-center transition-all duration-300 flex flex-col justify-center
        ${slotSizes[variant]}
        ${isDropTarget && isCompatible ? 'border-green-400 bg-green-50 scale-105 shadow-lg' : ''}
        ${isDropTarget && !isCompatible ? 'border-red-400 bg-red-50' : ''}
        ${!isDropTarget ? sectionColors[courtSection] : ''}
        hover:shadow-md
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
          className="cursor-move w-full" 
          draggable
          onDragStart={() => onDragStart(player.id)}
        >
          <PlayerBox 
            player={player}
            showPositions={variant !== 'minimal'}
            size={variant === 'compact' ? 'sm' : 'md'}
            className="transition-all duration-200 hover:scale-105"
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

// Full Roster Manager with Quarter Support
const QuarterBasedRosterManager = () => {
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
      const newAssignments = {
        ...assignments,
        [currentQuarter]: { ...assignments[currentQuarter] }
      };

      // Clear player from any previous position in this quarter
      Object.keys(newAssignments[currentQuarter]).forEach(pos => {
        if (newAssignments[currentQuarter][pos] === draggedPlayer) {
          newAssignments[currentQuarter][pos] = null;
        }
      });

      // Assign player to new position
      newAssignments[currentQuarter][position] = draggedPlayer;
      setAssignments(newAssignments);
    }
    setDraggedPlayer(null);
    setDragOverPosition(null);
  };

  const isPlayerCompatible = (playerId: number, position: string) => {
    const player = samplePlayers.find(p => p.id === playerId);
    return player ? player.positionPreferences.includes(position) : false;
  };

  const handleResetQuarter = () => {
    const newAssignments = {
      ...assignments,
      [currentQuarter]: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null }
    };
    setAssignments(newAssignments);
  };

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
  const availablePlayersForDrag = samplePlayers.filter(p => !assignedPlayerIds.includes(p.id));

  // Player summary
  const playerSummary = samplePlayers.reduce((acc, player) => {
    const quartersPlayed = Object.entries(assignments).reduce((qtrs, [quarter, quarterAssignments]) => {
      if (Object.values(quarterAssignments).includes(player.id)) {
        qtrs.push(parseInt(quarter));
      }
      return qtrs;
    }, [] as number[]);

    acc[player.id] = {
      totalQuarters: quartersPlayed.length,
      quarters: quartersPlayed
    };
    return acc;
  }, {} as Record<number, any>);

  return (
    <div className="space-y-6">
      {/* Game Info Header */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">vs Sample Opponents</h3>
            <p className="text-sm text-gray-600">Saturday, 28 June 2025 at 10:00 AM</p>
          </div>
          <Badge variant="outline" className="bg-white">
            {samplePlayers.length} players available
          </Badge>
        </div>
      </div>

      {/* Quarter Selection and Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col space-y-4">
            {/* Quarter Tabs */}
            <Tabs value={currentQuarter.toString()} onValueChange={(value) => setCurrentQuarter(parseInt(value))}>
              <TabsList className="grid grid-cols-4 w-full max-w-md mx-auto">
                <TabsTrigger value="1">Q1</TabsTrigger>
                <TabsTrigger value="2">Q2</TabsTrigger>
                <TabsTrigger value="3">Q3</TabsTrigger>
                <TabsTrigger value="4">Q4</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetQuarter}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset Q{currentQuarter}
              </Button>
              
              {/* Copy Quarter Controls */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Copy:</span>
                {[1, 2, 3, 4].map(sourceQuarter => (
                  <div key={sourceQuarter} className="flex items-center gap-1">
                    <span className="text-xs font-medium text-gray-600">Q{sourceQuarter}</span>
                    <Select
                      onValueChange={(value) => {
                        if (value) handleCopyQuarter(sourceQuarter, parseInt(value));
                      }}
                    >
                      <SelectTrigger className="w-12 h-7 text-xs">
                        <SelectValue placeholder="→" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4]
                          .filter(q => q !== sourceQuarter)
                          .map(targetQuarter => (
                            <SelectItem key={targetQuarter} value={targetQuarter.toString()}>
                              Q{targetQuarter}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Court Layout */}
      <div className="bg-gradient-to-b from-green-100 to-green-50 p-6 rounded-xl border border-green-200 shadow-inner">
        <div className="grid grid-cols-3 gap-6">
          {/* Attacking Third */}
          <div className="space-y-3">
            <div className="text-center">
              <h4 className="text-sm font-semibold text-red-700 mb-1">Attacking Third</h4>
              <div className="h-0.5 bg-red-200 rounded"></div>
            </div>
            {['GS', 'GA'].map(position => (
              <div
                key={position}
                onDragOver={(e) => handleDragOver(e, position)}
                onDragLeave={handleDragLeave}
              >
                <PositionSlot
                  position={position}
                  player={assignments[currentQuarter][position] ? 
                    samplePlayers.find(p => p.id === assignments[currentQuarter][position]) : undefined
                  }
                  isDropTarget={dragOverPosition === position}
                  isCompatible={draggedPlayer ? isPlayerCompatible(draggedPlayer, position) : true}
                  onDrop={() => handleDrop(position)}
                  courtSection="attacking"
                  onDragStart={handleDragStart}
                />
              </div>
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
                  player={assignments[currentQuarter][position] ? 
                    samplePlayers.find(p => p.id === assignments[currentQuarter][position]) : undefined
                  }
                  isDropTarget={dragOverPosition === position}
                  isCompatible={draggedPlayer ? isPlayerCompatible(draggedPlayer, position) : true}
                  onDrop={() => handleDrop(position)}
                  courtSection="center"
                  onDragStart={handleDragStart}
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
                  player={assignments[currentQuarter][position] ? 
                    samplePlayers.find(p => p.id === assignments[currentQuarter][position]) : undefined
                  }
                  isDropTarget={dragOverPosition === position}
                  isCompatible={draggedPlayer ? isPlayerCompatible(draggedPlayer, position) : true}
                  onDrop={() => handleDrop(position)}
                  courtSection="defending"
                  onDragStart={handleDragStart}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Available Players Pool */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Available Players - Quarter {currentQuarter}
            <Badge variant="secondary">{availablePlayersForDrag.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {availablePlayersForDrag.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {availablePlayersForDrag.map(player => (
                <div
                  key={player.id}
                  draggable
                  onDragStart={() => handleDragStart(player.id)}
                  className="cursor-move transform hover:scale-105 transition-transform"
                >
                  <PlayerBox
                    player={player}
                    size="sm"
                    showPositions={true}
                    className="transition-all duration-200"
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
        </CardContent>
      </Card>

      {/* Player Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            Player Game Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {samplePlayers.map(player => {
              const stats = playerSummary[player.id];
              const quarterDisplay = stats.quarters.length > 0 
                ? `Q${stats.quarters.sort().join(', Q')}` 
                : 'None';
              const playingTimePercent = (stats.totalQuarters / 4) * 100;

              return (
                <div key={player.id} className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{player.displayName}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{stats.totalQuarters}/4</span>
                      <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all"
                          style={{ width: `${playingTimePercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600">{quarterDisplay}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Compact List-Based Interface
const CompactListInterface = () => {
  const [currentQuarter, setCurrentQuarter] = useState(1);
  const [assignments, setAssignments] = useState<Record<number, Record<string, number | null>>>({
    1: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null },
    2: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null },
    3: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null },
    4: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null }
  });
  const [draggedPlayer, setDraggedPlayer] = useState<number | null>(null);

  const handleDragStart = (playerId: number) => setDraggedPlayer(playerId);
  
  const handleDrop = (position: string) => {
    if (draggedPlayer) {
      const newAssignments = {
        ...assignments,
        [currentQuarter]: { ...assignments[currentQuarter] }
      };

      // Clear player from any previous position
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

  const assignedPlayerIds = Object.values(assignments[currentQuarter]).filter(id => id !== null);
  const availablePlayers = samplePlayers.filter(p => !assignedPlayerIds.includes(p.id));

  return (
    <div className="space-y-6">
      {/* Quarter Selection */}
      <div className="flex justify-center">
        <Tabs value={currentQuarter.toString()} onValueChange={(value) => setCurrentQuarter(parseInt(value))}>
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="1">Quarter 1</TabsTrigger>
            <TabsTrigger value="2">Quarter 2</TabsTrigger>
            <TabsTrigger value="3">Quarter 3</TabsTrigger>
            <TabsTrigger value="4">Quarter 4</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Position List */}
        <Card>
          <CardHeader>
            <CardTitle>Starting Lineup - Quarter {currentQuarter}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {NETBALL_POSITIONS.map(position => {
              const player = assignments[currentQuarter][position] ? 
                samplePlayers.find(p => p.id === assignments[currentQuarter][position]) : null;
              
              return (
                <div
                  key={position}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(position)}
                  className={`
                    p-3 rounded-lg border-2 border-dashed transition-all duration-200
                    ${draggedPlayer && !player ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50'}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="font-bold">
                      {position}
                    </Badge>
                    
                    {player ? (
                      <div
                        draggable
                        onDragStart={() => handleDragStart(player.id)}
                        className="cursor-move flex-1 ml-4"
                      >
                        <PlayerBox 
                          player={player}
                          size="sm"
                          showPositions={true}
                          className="transition-all duration-200"
                        />
                      </div>
                    ) : (
                      <div className="flex-1 ml-4 text-center text-gray-400 py-3 text-sm">
                        Drag player here
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Available Players */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Available Players
              <Badge variant="secondary">{availablePlayers.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {availablePlayers.map(player => (
              <div
                key={player.id}
                draggable
                onDragStart={() => handleDragStart(player.id)}
                className="cursor-move hover:scale-[1.02] transition-transform"
              >
                <PlayerBox 
                  player={player}
                  showPositions={true}
                  className="transition-all duration-200"
                />
              </div>
            ))}
            
            {availablePlayers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">All players assigned for this quarter</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default function DragDropExamples() {
  const breadcrumbs = [
    { label: 'Component Examples', href: '/component-examples' },
    { label: 'Drag & Drop Examples' }
  ];

  return (
    <PageTemplate
      title="Enhanced Drag & Drop Examples"
      subtitle="Professional drag and drop interfaces using your PlayerBox components with quarter management"
      breadcrumbs={breadcrumbs}
    >
      <Helmet>
        <title>Enhanced Drag & Drop Examples | Team Manager</title>
      </Helmet>

      <div className="space-y-8">
        <Tabs defaultValue="full-roster" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="full-roster">Full Roster Manager</TabsTrigger>
            <TabsTrigger value="compact-list">Compact List Interface</TabsTrigger>
          </TabsList>

          <TabsContent value="full-roster" className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Complete Quarter-Based Roster Manager</h3>
              <p className="text-gray-600 mb-4">
                Full-featured interface with court visualization, quarter switching, player summaries, and compatibility checking.
                Uses your actual PlayerBox components and matches your app's styling patterns.
              </p>
              <QuarterBasedRosterManager />
            </div>
          </TabsContent>

          <TabsContent value="compact-list" className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Compact List-Based Interface</h3>
              <p className="text-gray-600 mb-4">
                Space-efficient vertical layout with quarter management. Perfect for smaller screens or when you need 
                to maximize information density while maintaining drag and drop functionality.
              </p>
              <CompactListInterface />
            </div>
          </TabsContent>
        </Tabs>

        {/* Feature Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Interface Comparison & Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-green-600">Full Roster Manager Features</h4>
                <ul className="text-sm space-y-2 text-gray-600">
                  <li>• Full court visualization with third sections</li>
                  <li>• Real-time compatibility checking</li>
                  <li>• Visual drop feedback with animations</li>
                  <li>• Comprehensive player game summaries</li>
                  <li>• Quarter copying functionality</li>
                  <li>• Playing time progress bars</li>
                  <li>• Position preference validation</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-blue-600">Compact List Interface Features</h4>
                <ul className="text-sm space-y-2 text-gray-600">
                  <li>• Space-efficient vertical layout</li>
                  <li>• Side-by-side position and player panels</li>
                  <li>• Quick quarter switching</li>
                  <li>• Simplified drag and drop zones</li>
                  <li>• Mobile-friendly responsive design</li>
                  <li>• Clear visual separation of assigned/available</li>
                  <li>• Minimal visual complexity</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-purple-600">Technical Integration</h4>
                <ul className="text-sm space-y-2 text-gray-600">
                  <li>• Uses your actual PlayerBox component</li>
                  <li>• Matches your app's player data structure</li>
                  <li>• Integrates with your color and styling system</li>
                  <li>• Compatible with your position preferences</li>
                  <li>• Follows your UI/UX patterns</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-orange-600">Enhancements for Production</h4>
                <ul className="text-sm space-y-2 text-gray-600">
                  <li>• Add save/load roster functionality</li>
                  <li>• Implement roster validation rules</li>
                  <li>• Add undo/redo capabilities</li>
                  <li>• Include rotation suggestions</li>
                  <li>• Add keyboard navigation support</li>
                  <li>• Implement touch/mobile gestures</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
}
