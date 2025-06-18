import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { PlayerBox } from '@/components/ui/player-box';
import { getPlayerColorHex, getDarkerColorHex, getLighterColorHex, getMediumColorHex } from '@/lib/playerColorUtils';

interface Player {
  id: number;
  displayName: string;
  firstName: string;
  lastName: string;
  positionPreferences: string[];
  avatarColor?: string;
}

interface GameInfo {
  opponent: string;
  date: string;
  time: string;
}

interface DragDropRosterManagerProps {
  availablePlayers: Player[];
  gameInfo: GameInfo;
  onRosterChange: (roster: Record<number, Record<string, number | null>>) => void;
}

const NETBALL_POSITIONS = ['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'];

// Enhanced Position Slot Component
const PositionSlot = ({ 
  position, 
  player, 
  isDropTarget = false, 
  isCompatible = true,
  onDrop,
  courtSection,
  onDragStart,
  onTouchStart,
  onTouchMove,
  onTouchEnd
}: {
  position: string,
  player?: Player,
  isDropTarget?: boolean,
  isCompatible?: boolean,
  onDrop: () => void,
  courtSection: 'attacking' | 'center' | 'defending',
  onDragStart: (playerId: number) => void,
  onTouchStart: (e: React.TouchEvent, playerId: number) => void,
  onTouchMove: (e: React.TouchEvent) => void,
  onTouchEnd: (e: React.TouchEvent) => void
}) => {
  const sectionColors = {
    attacking: 'bg-gradient-to-br from-red-50 to-red-100 border-red-200',
    center: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200',
    defending: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
  };

  return (
    <div
      data-position={position}
      className={`
        relative border-2 border-dashed rounded-xl p-4 text-center min-h-[140px] 
        transition-all duration-300 flex flex-col justify-center touch-manipulation
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
          className="cursor-move touch-manipulation select-none" 
          draggable
          onDragStart={() => onDragStart(player.id)}
          onTouchStart={(e) => onTouchStart(e, player.id)}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{ touchAction: 'none' }}
        >
          <PlayerBox 
            player={player}
            showPositions={true}
            size="sm"
            className="transition-all duration-200"
            style={{
                  backgroundColor: player ? getMediumColorHex(player.avatarColor) : 'transparent',
                  borderColor: player ? getDarkerColorHex(player.avatarColor) : '#ddd',
                  color: player ? getDarkerColorHex(player.avatarColor) : '#666'
                }}
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

export default function DragDropRosterManager({ availablePlayers, gameInfo, onRosterChange }: DragDropRosterManagerProps) {
  const [currentQuarter, setCurrentQuarter] = useState(1);
  const [assignments, setAssignments] = useState<Record<number, Record<string, number | null>>>({
    1: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null },
    2: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null },
    3: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null },
    4: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null }
  });
  const [draggedPlayer, setDraggedPlayer] = useState<number | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<string | null>(null);
  
  // Touch state
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedElement, setDraggedElement] = useState<HTMLElement | null>(null);
  const [clone, setClone] = useState<HTMLElement | null>(null);

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

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent, playerId: number) => {
    e.preventDefault();
    const touch = e.touches[0];
    const target = e.currentTarget as HTMLElement;
    
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setDraggedPlayer(playerId);
    setDraggedElement(target);
    setIsDragging(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || !draggedElement) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    
    // Start dragging after moving 10px
    if (!isDragging && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
      setIsDragging(true);
      
      // Create visual clone
      const rect = draggedElement.getBoundingClientRect();
      const cloneElement = draggedElement.cloneNode(true) as HTMLElement;
      cloneElement.style.position = 'fixed';
      cloneElement.style.top = `${rect.top}px`;
      cloneElement.style.left = `${rect.left}px`;
      cloneElement.style.width = `${rect.width}px`;
      cloneElement.style.height = `${rect.height}px`;
      cloneElement.style.opacity = '0.8';
      cloneElement.style.pointerEvents = 'none';
      cloneElement.style.zIndex = '9999';
      cloneElement.style.transform = 'rotate(5deg) scale(1.05)';
      cloneElement.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';
      
      document.body.appendChild(cloneElement);
      setClone(cloneElement);
      
      draggedElement.style.opacity = '0.3';
    }
    
    if (isDragging && clone) {
      clone.style.left = `${touch.clientX - touchStart.x + parseInt(clone.style.left)}px`;
      clone.style.top = `${touch.clientY - touchStart.y + parseInt(clone.style.top)}px`;
      
      // Check what's under the touch point
      const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
      const positionSlot = elementBelow?.closest('[data-position]');
      
      if (positionSlot) {
        const position = positionSlot.getAttribute('data-position');
        setDragOverPosition(position);
      } else {
        setDragOverPosition(null);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) {
      // Just a tap, not a drag
      cleanup();
      return;
    }
    
    const touch = e.changedTouches[0];
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    const positionSlot = elementBelow?.closest('[data-position]');
    
    if (positionSlot && draggedPlayer) {
      const position = positionSlot.getAttribute('data-position');
      if (position) {
        handleDrop(position);
      }
    }
    
    cleanup();
  };

  const cleanup = () => {
    if (clone) {
      document.body.removeChild(clone);
      setClone(null);
    }
    if (draggedElement) {
      draggedElement.style.opacity = '';
    }
    
    setTouchStart(null);
    setIsDragging(false);
    setDraggedElement(null);
    setDraggedPlayer(null);
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
      onRosterChange(newAssignments);
    }
    setDraggedPlayer(null);
    setDragOverPosition(null);
  };

  // Check if a player is compatible with a position
  const isPlayerCompatible = (playerId: number, position: string) => {
    const player = availablePlayers.find(p => p.id === playerId);
    return player ? player.positionPreferences.includes(position) : false;
  };

  // Reset functions
  const handleResetQuarter = () => {
    const newAssignments = {
      ...assignments,
      [currentQuarter]: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null }
    };
    setAssignments(newAssignments);
    onRosterChange(newAssignments);
  };

  const handleResetAll = () => {
    const resetAssignments = {
      1: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null },
      2: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null },
      3: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null },
      4: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null }
    };
    setAssignments(resetAssignments);
    onRosterChange(resetAssignments);
  };

  // Copy quarter function
  const handleCopyQuarter = (sourceQuarter: number, targetQuarter: number) => {
    if (sourceQuarter === targetQuarter) return;

    const newAssignments = {
      ...assignments,
      [targetQuarter]: { ...assignments[sourceQuarter] }
    };
    setAssignments(newAssignments);
    onRosterChange(newAssignments);
  };

  const currentQuarterAssignments = assignments[currentQuarter];
  const assignedPlayerIds = Object.values(currentQuarterAssignments).filter(id => id !== null);
  const availablePlayersForDrag = availablePlayers.filter(p => !assignedPlayerIds.includes(p.id));

  // Summaries
  const playerSummary = availablePlayers.reduce((acc, player) => {
    const quartersPlayed = Object.entries(assignments).reduce((qtrs, [quarter, quarterAssignments]) => {
      if (Object.values(quarterAssignments).includes(player.id)) {
        qtrs.push(parseInt(quarter));
      }
      return qtrs;
    }, [] as number[]);

    const positionsPlayed = NETBALL_POSITIONS.filter(pos => {
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
  }, {} as Record<number, any>);

  const positionSummary = NETBALL_POSITIONS.reduce((acc, position) => {
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
  }, {} as Record<string, any>);

  return (
    <div className="space-y-6">
      {/* Game Info Header */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">vs {gameInfo.opponent}</h3>
            <p className="text-sm text-gray-600">
              {new Date(gameInfo.date).toLocaleDateString()} at {gameInfo.time}
            </p>
          </div>
          <Badge variant="outline" className="bg-white">
            {availablePlayers.length} players available
          </Badge>
        </div>
      </div>

      {/* Quarter Selection and Controls */}
      <div className="flex items-center justify-between">
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
          <div className="flex items-center gap-2">
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
      <div className="bg-gradient-to-b from-green-100 to-green-50 p-6 rounded-xl border border-green-200 shadow-inner">
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
                  availablePlayers.find(p => p.id === currentQuarterAssignments[position]) : undefined
                }
                isDropTarget={dragOverPosition === position}
                isCompatible={draggedPlayer ? isPlayerCompatible(draggedPlayer, position) : true}
                onDrop={() => handleDrop(position)}
                courtSection="attacking"
                onDragStart={handleDragStart}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
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
                    availablePlayers.find(p => p.id === currentQuarterAssignments[position]) : undefined
                  }
                  isDropTarget={dragOverPosition === position}
                  isCompatible={draggedPlayer ? isPlayerCompatible(draggedPlayer, position) : true}
                  onDrop={() => handleDrop(position)}
                  courtSection="center"
                  onDragStart={handleDragStart}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
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
                    availablePlayers.find(p => p.id === currentQuarterAssignments[position]) : undefined
                  }
                  isDropTarget={dragOverPosition === position}
                  isCompatible={draggedPlayer ? isPlayerCompatible(draggedPlayer, position) : true}
                  onDrop={() => handleDrop(position)}
                  courtSection="defending"
                  onDragStart={handleDragStart}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Available Players Pool */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-5 w-5 text-blue-600" />
          <h4 className="text-lg font-semibold text-gray-800">Available Players - Quarter {currentQuarter}</h4>
          <Badge variant="secondary">{availablePlayersForDrag.length} players</Badge>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          {availablePlayersForDrag.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {availablePlayersForDrag.map(player => (
                <div
                  key={player.id}
                  draggable
                  onDragStart={() => handleDragStart(player.id)}
                  onTouchStart={(e) => handleTouchStart(e, player.id)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  className="cursor-move transform hover:scale-105 transition-transform touch-manipulation select-none"
                  style={{ touchAction: 'none' }}
                >
                  <PlayerBox
                    player={player}
                    size="sm"
                    showPositions={true}
                    className="transition-all duration-200"
                    style={{
                backgroundColor: getMediumColorHex(player.avatarColor),
                borderColor: getDarkerColorHex(player.avatarColor),
                color: getDarkerColorHex(player.avatarColor)
              }}
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
            {availablePlayers.map(player => {
              const stats = playerSummary[player.id];
              const quarterDisplay = stats.quarters.length > 0 
                ? `Q${stats.quarters.sort().join(', Q')}` 
                : 'None';
              const playingTimePercent = (stats.totalQuarters / 4) * 100;

              return (
                <div key={player.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={`${player.avatarColor || 'bg-gray-400'} text-white text-xs`}>
                        {player.displayName.split(' ').map(n => n[0]).join('')}
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
            {NETBALL_POSITIONS.map(position => {
              const stats = positionSummary[position];
              const playerNames = stats.players.map((id: number) => 
                availablePlayers.find(p => p.id === id)?.displayName
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
    </div>
  );
}