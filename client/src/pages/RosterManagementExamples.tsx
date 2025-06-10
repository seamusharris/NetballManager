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
            
            {/* Copy Quarter Controls - like in the main roster manager */}
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

        <Tabs value={currentQuarter.toString()} onValueChange={(value) => setCurrentQuarter(parseInt(value))}>
          <div className="hidden">
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="1">Quarter 1</TabsTrigger>
              <TabsTrigger value="2">Quarter 2</TabsTrigger>
              <TabsTrigger value="3">Quarter 3</TabsTrigger>
              <TabsTrigger value="4">Quarter 4</TabsTrigger>
            </TabsList>
          </div>

          {[1, 2, 3, 4].map(quarter => (
            <TabsContent key={quarter} value={quarter.toString()}>
              {/* Court layout */}
              <div className="grid grid-cols-3 gap-4 mb-6 bg-green-50 p-4 rounded-lg">
                {/* Attacking Third */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-center">Attacking Third</h4>
                  {['GS', 'GA'].map(position => (
                    <div
                      key={position}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center min-h-[80px] bg-white"
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(position)}
                    >
                      <div className="text-xs font-medium mb-2">{position}</div>
                      {currentQuarterAssignments[position] && (
                        <div className="bg-primary text-white rounded px-2 py-1 text-xs">
                          {samplePlayers.find(p => p.id === currentQuarterAssignments[position])?.displayName}
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
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center min-h-[80px] bg-white"
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(position)}
                    >
                      <div className="text-xs font-medium mb-2">{position}</div>
                      {currentQuarterAssignments[position] && (
                        <div className="bg-primary text-white rounded px-2 py-1 text-xs">
                          {samplePlayers.find(p => p.id === currentQuarterAssignments[position])?.displayName}
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
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center min-h-[80px] bg-white"
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(position)}
                    >
                      <div className="text-xs font-medium mb-2">{position}</div>
                      {currentQuarterAssignments[position] && (
                        <div className="bg-primary text-white rounded px-2 py-1 text-xs">
                          {samplePlayers.find(p => p.id === currentQuarterAssignments[position])?.displayName}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

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

// Grid-Based Quick Assignment
function GridRoster() {
  const [assignments, setAssignments] = useState<Record<string, number | null>>({
    GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null
  });

  const handlePlayerClick = (playerId: number, position: string) => {
    setAssignments(prev => {
      const newAssignments = { ...prev };

      // If position is already taken by this player, remove them
      if (newAssignments[position] === playerId) {
        newAssignments[position] = null;
        return newAssignments;
      }

      // Remove player from any other position
      Object.keys(newAssignments).forEach(pos => {
        if (newAssignments[pos] === playerId) {
          newAssignments[pos] = null;
        }
      });

      newAssignments[position] = playerId;
      return newAssignments;
    });
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-200 p-2 bg-gray-50 text-left">Player</th>
              {positions.map(pos => (
                <th key={pos} className="border border-gray-200 p-2 bg-gray-50 text-center min-w-[80px]">
                  {pos}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {samplePlayers.map(player => (
              <tr key={player.id} className="hover:bg-gray-50">
                <td className="border border-gray-200 p-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={`${player.color} text-white text-xs`}>
                        {player.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{player.name}</div>
                      <div className="text-xs text-gray-500">
                        Plays: {player.positions.join(', ')}
                      </div>
                    </div>
                  </div>
                </td>
                {positions.map(position => {
                  const isAssigned = assignments[position] === player.id;
                  const canPlay = player.positions.includes(position);

                  return (
                    <td key={position} className="border border-gray-200 p-2 text-center">
                      <Button
                        variant={isAssigned ? "default" : canPlay ? "outline" : "ghost"}
                        size="sm"
                        disabled={!canPlay}
                        onClick={() => handlePlayerClick(player.id, position)}
                        className={`w-12 h-8 ${isAssigned ? 'bg-green-600 hover:bg-green-700' : ''}`}
                      >
                        {isAssigned ? '✓' : canPlay ? '+' : '-'}
                      </Button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Visual Court Layout
function VisualCourtRoster() {
  const [assignments, setAssignments] = useState<Record<string, number | null>>({
    GS: 1, GA: 2, WA: 3, C: 4, WD: 5, GD: 6, GK: 7
  });
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);

  const courtLayout = {
    GS: { top: '10%', left: '20%' },
    GA: { top: '30%', left: '20%' },
    WA: { top: '45%', left: '35%' },
    C: { top: '50%', left: '50%' },
    WD: { top: '55%', left: '65%' },
    GD: { top: '70%', left: '80%' },
    GK: { top: '90%', left: '80%' }
  };

  const assignPlayer = (playerId: number) => {
    if (selectedPosition) {
      setAssignments(prev => {
        const newAssignments = { ...prev };

        // Remove player from other positions
        Object.keys(newAssignments).forEach(pos => {
          if (newAssignments[pos] === playerId) {
            newAssignments[pos] = null;
          }
        });

        newAssignments[selectedPosition] = playerId;
        return newAssignments;
      });
      setSelectedPosition(null);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Court Visual */}
      <div className="relative">
        <h4 className="font-semibold mb-3">Court Layout</h4>
        <div className="relative bg-green-100 border-2 border-green-300 rounded-lg h-96 overflow-hidden">
          {/* Court markings */}
          <div className="absolute inset-0">
            {/* Center line */}
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white transform -translate-x-0.5"></div>
            {/* Goal circles */}
            <div className="absolute top-2 left-2 w-20 h-20 border border-white rounded-full"></div>
            <div className="absolute bottom-2 right-2 w-20 h-20 border border-white rounded-full"></div>
          </div>

          {/* Position markers */}
          {positions.map(position => {
            const layout = courtLayout[position];
            const assignedPlayer = assignments[position] 
              ? samplePlayers.find(p => p.id === assignments[position])
              : null;

            return (
              <div
                key={position}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer ${
                  selectedPosition === position ? 'ring-4 ring-blue-400' : ''
                }`}
                style={{ top: layout.top, left: layout.left }}
                onClick={() => setSelectedPosition(position)}
              >
                <div className="relative">
                  <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center ${
                    assignedPlayer 
                      ? `${assignedPlayer.color} border-white text-white` 
                      : 'bg-white border-gray-400 text-gray-600'
                  } ${selectedPosition === position ? 'ring-2 ring-blue-400' : ''}`}>
                    {assignedPlayer ? (
                      <span className="text-xs font-bold">
                        {assignedPlayer.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    ) : (
                      <span className="text-xs font-bold">{position}</span>
                    )}
                  </div>
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-center">
                    {position}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {selectedPosition && (
          <div className="mt-2 text-sm text-blue-600 font-medium">
            Click a player below to assign to {selectedPosition}
          </div>
        )}
      </div>

      {/* Player Selection */}
      <div>
        <h4 className="font-semibold mb-3">Select Player</h4>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {samplePlayers.map(player => {
            const currentPosition = Object.keys(assignments).find(
              pos => assignments[pos] === player.id
            );

            return (
              <div
                key={player.id}
                className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                  selectedPosition && !player.positions.includes(selectedPosition) 
                    ? 'opacity-50 cursor-not-allowed' 
                    : ''
                }`}
                onClick={() => {
                  if (!selectedPosition || player.positions.includes(selectedPosition)) {
                    assignPlayer(player.id);
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className={`${player.color} text-white text-xs`}>
                      {player.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{player.name}</div>
                    <div className="text-xs text-gray-500">
                      Plays: {player.positions.join(', ')}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {currentPosition && (
                    <Badge variant="secondary">{currentPosition}</Badge>
                  )}
                  {selectedPosition && player.positions.includes(selectedPosition) && (
                    <ChevronRight className="h-4 w-4 text-blue-500" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Multi-Quarter Quick Assign
function MultiQuarterRoster() {
  const [currentQuarter, setCurrentQuarter] = useState(1);
  const [assignments, setAssignments] = useState<Record<number, Record<string, number | null>>>({
    1: { GS: 1, GA: 2, WA: 3, C: 4, WD: 5, GD: 6, GK: 7 },
    2: { GS: 8, GA: 1, WA: 9, C: 3, WD: 4, GD: 5, GK: 6 },
    3: { GS: 2, GA: 8, WA: 4, C: 9, WD: 3, GD: 7, GK: 5 },
    4: { GS: 7, GA: 3, WA: 2, C: 8, WD: 9, GD: 4, GK: 1 }
  });

  const copyQuarter = (fromQuarter: number, toQuarter: number) => {
    setAssignments(prev => ({
      ...prev,
      [toQuarter]: { ...prev[fromQuarter] }
    }));
  };

  const getPlayerQuarterCount = (playerId: number) => {
    return Object.values(assignments).reduce((count, quarter) => {
      return count + (Object.values(quarter).includes(playerId) ? 1 : 0);
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Quarter Navigation */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span className="font-medium">Quarter:</span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4].map(quarter => (
            <Button
              key={quarter}
              variant={currentQuarter === quarter ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentQuarter(quarter)}
            >
              Q{quarter}
            </Button>
          ))}
        </div>
        <div className="flex gap-2 ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const sourceQuarter = currentQuarter === 1 ? 4 : currentQuarter - 1;
              copyQuarter(sourceQuarter, currentQuarter);
            }}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Copy Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const targetQuarter = currentQuarter === 4 ? 1 : currentQuarter + 1;
              copyQuarter(currentQuarter, targetQuarter);
            }}
          >
            Copy to Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Current Quarter Assignment */}
        <div className="col-span-2">
          <h4 className="font-semibold mb-3">Quarter {currentQuarter} Positions</h4>
          <div className="grid grid-cols-7 gap-2">
            {positions.map(position => {
              const assignedPlayerId = assignments[currentQuarter][position];
              const assignedPlayer = assignedPlayerId 
                ? samplePlayers.find(p => p.id === assignedPlayerId)
                : null;

              return (
                <div key={position} className="text-center">
                  <div className="text-xs font-medium mb-1">{position}</div>
                  <div className="h-16 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                    {assignedPlayer ? (
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className={`${assignedPlayer.color} text-white text-xs`}>
                          {assignedPlayer.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <Plus className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  {assignedPlayer && (
                    <div className="text-xs mt-1 font-medium truncate">
                      {assignedPlayer.name}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Player Summary */}
        <div>
          <h4 className="font-semibold mb-3">Playing Time</h4>
          <div className="space-y-2">
            {samplePlayers.map(player => {
              const quarterCount = getPlayerQuarterCount(player.id);

              return (
                <div key={player.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className={`${player.color} text-white text-xs`}>
                        {player.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{player.name}</span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map(quarter => {
                      const isPlaying = Object.values(assignments[quarter]).includes(player.id);
                      return (
                        <div
                          key={quarter}
                          className={`w-4 h-4 rounded-sm ${
                            isPlaying ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RosterManagementExamples() {
  const breadcrumbs = [
    { label: 'Examples', href: '/component-examples' },
    { label: 'Roster Management', href: '/roster-management-examples' }
  ];

  return (
    <PageTemplate
      title="Roster Management Examples"
      subtitle="Different interface patterns for assigning players to court positions"
      breadcrumbs={breadcrumbs}
    >
      <Helmet>
        <title>Roster Management Examples - Netball Team Manager</title>
      </Helmet>

      <div className="space-y-8">
        <Tabs defaultValue="drag-drop" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="drag-drop">Drag & Drop</TabsTrigger>
            <TabsTrigger value="grid">Grid Selection</TabsTrigger>
            <TabsTrigger value="visual">Visual Court</TabsTrigger>
            <TabsTrigger value="multi-quarter">Multi-Quarter</TabsTrigger>
          </TabsList>

          <TabsContent value="drag-drop" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ArrowUpDown className="h-5 w-5" />
                  <span>Drag & Drop Interface</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DragDropRoster />
                <div className="mt-4 text-sm text-gray-600">
                  Drag players from the left panel and drop them onto court positions. 
                  This provides an intuitive way to assign players by physically moving them.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grid" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Grid3X3 className="h-5 w-5" />
                  <span>Grid-Based Selection</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <GridRoster />
                <div className="mt-4 text-sm text-gray-600">
                  Matrix view showing all players and positions. Click the + button to assign, 
                  ✓ to confirm assignment, or - if the player can't play that position.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visual" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Visual Court Layout</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <VisualCourtRoster />
                <div className="mt-4 text-sm text-gray-600">
                  Interactive court diagram where you click positions to select them, 
                  then choose a player. Provides spatial context for position assignments.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="multi-quarter" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Multi-Quarter Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MultiQuarterRoster />
                <div className="mt-4 text-sm text-gray-600">
                  Manage all four quarters at once with quick copying between quarters and 
                  visual playing time tracking to ensure fair rotation.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Implementation Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Implementation Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm">Drag & Drop Benefits:</h4>
                <ul className="text-sm text-gray-600 list-disc list-inside mt-1">
                  <li>Most intuitive interface - feels like physically moving players</li>
                  <li>Works well on touch devices</li>
                  <li>Clear visual feedback during interaction</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-sm">Grid Selection Benefits:</h4>
                <ul className="text-sm text-gray-600 list-disc list-inside mt-1">
                  <li>Shows all information at once - no hidden state</li>
                  <li>Fast for experienced users</li>
                  <li>Easy to see player capabilities vs assignments</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-sm">Visual Court Benefits:</h4>
                <ul className="text-sm text-gray-600 list-disc list-inside mt-1">
                  <li>Provides spatial context for position relationships</li>
                  <li>Great for tactical planning and visualization</li>
                  <li>Intuitive for users familiar with netball</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-sm">Multi-Quarter Benefits:</h4>
                <ul className="text-sm text-gray-600 list-disc list-inside mt-1">
                  <li>Efficient management of entire game roster</li>
                  <li>Built-in fairness tracking</li>
                  <li>Quick quarter-to-quarter copying</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
}