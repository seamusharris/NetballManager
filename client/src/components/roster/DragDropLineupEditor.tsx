
import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlayerAvatar } from '@/components/ui/player-avatar';
import { CourtDisplay } from '@/components/ui/court-display';
import { RotateCcw, Users, Target } from 'lucide-react';
import { Player, Position } from '@/shared/api-types';
import { cn } from '@/lib/utils';

interface DragDropLineupEditorProps {
  availablePlayers: Player[];
  currentLineup: Record<Position, Player | null>;
  onLineupChange: (lineup: Record<Position, Player | null>) => void;
  onApplyRecommendation?: (lineup: Record<Position, Player | null>) => void;
}

const POSITIONS_ORDER: Position[] = ['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'];

export default function DragDropLineupEditor({ 
  availablePlayers, 
  currentLineup, 
  onLineupChange,
  onApplyRecommendation 
}: DragDropLineupEditorProps) {
  const [draggedPlayer, setDraggedPlayer] = useState<Player | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<Position | null>(null);
  const [dragOverBench, setDragOverBench] = useState(false);
  const dragCounterRef = useRef(0);

  // Get players currently assigned to positions
  const assignedPlayerIds = new Set(
    Object.values(currentLineup).filter(p => p !== null).map(p => p!.id)
  );

  // Get bench players (available but not assigned)
  const benchPlayers = availablePlayers.filter(p => !assignedPlayerIds.has(p.id));

  const handleDragStart = (e: React.DragEvent, player: Player) => {
    setDraggedPlayer(player);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', player.id.toString());
  };

  const handleDragEnd = () => {
    setDraggedPlayer(null);
    setDragOverPosition(null);
    setDragOverBench(false);
    dragCounterRef.current = 0;
  };

  const handlePositionDragOver = (e: React.DragEvent, position: Position) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverPosition(position);
  };

  const handlePositionDragLeave = () => {
    setDragOverPosition(null);
  };

  const handlePositionDrop = (e: React.DragEvent, position: Position) => {
    e.preventDefault();
    
    if (!draggedPlayer) return;

    // Get the current player in this position (if any)
    const currentPlayerInPosition = currentLineup[position];
    
    // Create new lineup
    const newLineup = { ...currentLineup };
    
    // If there's already a player in this position, move them to bench
    if (currentPlayerInPosition) {
      // Find where the dragged player came from and put the displaced player there
      const draggedPlayerPosition = Object.entries(currentLineup).find(
        ([_, player]) => player?.id === draggedPlayer.id
      )?.[0] as Position;
      
      if (draggedPlayerPosition) {
        newLineup[draggedPlayerPosition] = currentPlayerInPosition;
      }
    } else {
      // Clear the position the dragged player came from
      const draggedPlayerPosition = Object.entries(currentLineup).find(
        ([_, player]) => player?.id === draggedPlayer.id
      )?.[0] as Position;
      
      if (draggedPlayerPosition) {
        newLineup[draggedPlayerPosition] = null;
      }
    }
    
    // Assign the dragged player to the new position
    newLineup[position] = draggedPlayer;
    
    onLineupChange(newLineup);
    setDragOverPosition(null);
  };

  const handleBenchDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    dragCounterRef.current++;
    setDragOverBench(true);
  };

  const handleBenchDragLeave = () => {
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setDragOverBench(false);
    }
  };

  const handleBenchDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    if (!draggedPlayer) return;

    // Find which position the player came from and clear it
    const draggedPlayerPosition = Object.entries(currentLineup).find(
      ([_, player]) => player?.id === draggedPlayer.id
    )?.[0] as Position;
    
    if (draggedPlayerPosition) {
      const newLineup = { ...currentLineup };
      newLineup[draggedPlayerPosition] = null;
      onLineupChange(newLineup);
    }
    
    setDragOverBench(false);
    dragCounterRef.current = 0;
  };

  const handleClearLineup = () => {
    const emptyLineup = {
      GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null
    } as Record<Position, Player | null>;
    onLineupChange(emptyLineup);
  };

  const positionsAssigned = Object.values(currentLineup).filter(p => p !== null).length;

  return (
    <div className="space-y-6">
      {/* Status Bar */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-600" />
            <span className="font-medium">Lineup Status:</span>
            <Badge variant={positionsAssigned === 7 ? "default" : "secondary"}>
              {positionsAssigned}/7 positions filled
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-green-600" />
            <span className="font-medium">Available:</span>
            <Badge variant="outline">{benchPlayers.length} on bench</Badge>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleClearLineup}>
          <RotateCcw className="h-4 w-4 mr-1" />
          Clear All
        </Button>
      </div>

      {/* Full Width Court Display */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h4 className="font-semibold mb-4 text-center">Court Positions</h4>
          
          {/* Interactive Court Layout - Full Width */}
          <div className="relative max-w-6xl mx-auto">
            <CourtDisplay
              roster={Object.entries(currentLineup)
                .filter(([_, player]) => player !== null)
                .map(([position, player]) => ({
                  quarter: 1,
                  position,
                  playerId: player!.id
                }))}
              players={availablePlayers}
              quarter={1}
              layout="horizontal"
              showPositionLabels={true}
              className="pointer-events-none h-80"
            />
            
            {/* Overlay drag targets */}
            <div className="absolute inset-0 grid grid-cols-7 gap-3 p-6">
              {POSITIONS_ORDER.map((position) => {
                const player = currentLineup[position];
                const isHighlighted = dragOverPosition === position;
                
                return (
                  <div
                    key={position}
                    className={cn(
                      "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all duration-200 min-h-[120px]",
                      isHighlighted 
                        ? "border-blue-400 bg-blue-50" 
                        : "border-gray-300 hover:border-gray-400",
                      "cursor-pointer"
                    )}
                    onDragOver={(e) => handlePositionDragOver(e, position)}
                    onDragLeave={handlePositionDragLeave}
                    onDrop={(e) => handlePositionDrop(e, position)}
                  >
                    <div className="text-sm font-bold text-gray-600 mb-2">{position}</div>
                    
                    {player ? (
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, player)}
                        onDragEnd={handleDragEnd}
                        className="cursor-move hover:scale-105 transition-transform"
                      >
                        <PlayerAvatar player={player} size="md" />
                        <div className="text-xs text-center mt-2 font-medium">
                          {player.displayName}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400 text-center px-2">
                        Drop player here
                      </div>
                    )}
                    
                    {isHighlighted && (
                      <div className="absolute inset-0 border-2 border-blue-400 rounded-lg bg-blue-100/20" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bench and Quick Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bench */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Bench ({benchPlayers.length})
              </h4>
              
              <div
                className={cn(
                  "min-h-[200px] p-4 border-2 border-dashed rounded-lg transition-all duration-200",
                  dragOverBench 
                    ? "border-green-400 bg-green-50" 
                    : "border-gray-300"
                )}
                onDragOver={handleBenchDragOver}
                onDragLeave={handleBenchDragLeave}
                onDrop={handleBenchDrop}
              >
                {benchPlayers.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">All available players are assigned</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {benchPlayers.map((player) => (
                      <div
                        key={player.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, player)}
                        onDragEnd={handleDragEnd}
                        className={cn(
                          "flex flex-col items-center gap-2 p-3 bg-white rounded-lg border cursor-move transition-all",
                          "hover:shadow-md hover:scale-105",
                          draggedPlayer?.id === player.id && "opacity-50"
                        )}
                      >
                        <PlayerAvatar player={player} size="sm" />
                        <div className="text-center min-w-0">
                          <div className="font-medium text-sm truncate">{player.displayName}</div>
                          {player.positionPreferences && (
                            <div className="flex gap-1 mt-1 justify-center flex-wrap">
                              {player.positionPreferences.slice(0, 3).map(pos => (
                                <Badge key={pos} variant="outline" className="text-xs">
                                  {pos}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {dragOverBench && (
                  <div className="absolute inset-2 border-2 border-green-400 rounded-lg bg-green-100/20 pointer-events-none" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={handleClearLineup}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear All Positions
                </Button>
                {onApplyRecommendation && (
                  <div className="text-xs text-gray-500 mt-2">
                    Tip: Click "Select This Lineup" on any recommended lineup above to populate this editor
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-semibold text-blue-800 mb-2">How to Use</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• <strong>Drag from bench:</strong> Drag players from the bench to court positions</p>
            <p>• <strong>Swap positions:</strong> Drag players between court positions to swap them</p>
            <p>• <strong>Return to bench:</strong> Drag players from court back to the bench area</p>
            <p>• <strong>Use recommendations:</strong> Click "Select This Lineup" on recommended lineups to auto-populate</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
