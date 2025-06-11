
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRightLeft, Clock, Undo2, History } from 'lucide-react';
import { Player, Position } from '@shared/schema';
import { allPositions, positionLabels } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface PlayerInterchange {
  id: string;
  timestamp: Date;
  quarter: number;
  timeInQuarter: string; // e.g., "8:30" remaining
  position: Position;
  playerOut: number;
  playerIn: number;
  reason?: 'tactical' | 'injury' | 'rest' | 'performance';
}

interface PlayerInterchangeTrackerProps {
  gameId: number;
  players: Player[];
  currentQuarter: number;
  currentPositions: Record<Position, number | null>; // Current players on court
  onPositionChange: (position: Position, newPlayerId: number | null) => void;
  onInterchangeRecorded?: (interchange: PlayerInterchange) => void;
}

export default function PlayerInterchangeTracker({
  gameId,
  players,
  currentQuarter,
  currentPositions,
  onPositionChange,
  onInterchangeRecorded
}: PlayerInterchangeTrackerProps) {
  const [interchanges, setInterchanges] = useState<PlayerInterchange[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [selectedPlayerIn, setSelectedPlayerIn] = useState<number | null>(null);
  const [quarterTime, setQuarterTime] = useState<string>('15:00');
  const [reason, setReason] = useState<'tactical' | 'injury' | 'rest' | 'performance'>('tactical');
  const [showHistory, setShowHistory] = useState(false);
  const { toast } = useToast();

  // Get available players for substitution (not currently on court)
  const getAvailablePlayers = () => {
    const onCourtPlayerIds = Object.values(currentPositions).filter(Boolean) as number[];
    return players.filter(player => 
      player.active && !onCourtPlayerIds.includes(player.id)
    );
  };

  // Get player name by ID
  const getPlayerName = (playerId: number) => {
    return players.find(p => p.id === playerId)?.displayName || 'Unknown';
  };

  // Record an interchange
  const recordInterchange = () => {
    if (!selectedPosition || !selectedPlayerIn) {
      toast({
        title: "Incomplete Selection",
        description: "Please select both a position and incoming player",
        variant: "destructive"
      });
      return;
    }

    const playerOut = currentPositions[selectedPosition];
    if (!playerOut) {
      toast({
        title: "No Player to Replace",
        description: "There's no player currently in that position",
        variant: "destructive"
      });
      return;
    }

    const newInterchange: PlayerInterchange = {
      id: `${gameId}-${Date.now()}`,
      timestamp: new Date(),
      quarter: currentQuarter,
      timeInQuarter: quarterTime,
      position: selectedPosition,
      playerOut,
      playerIn: selectedPlayerIn,
      reason
    };

    // Add to local state
    setInterchanges(prev => [newInterchange, ...prev]);

    // Update the position
    onPositionChange(selectedPosition, selectedPlayerIn);

    // Notify parent component
    if (onInterchangeRecorded) {
      onInterchangeRecorded(newInterchange);
    }

    // Reset form
    setSelectedPosition(null);
    setSelectedPlayerIn(null);

    toast({
      title: "Interchange Recorded",
      description: `${getPlayerName(newInterchange.playerIn)} replaced ${getPlayerName(playerOut)} at ${selectedPosition}`,
    });
  };

  // Undo last interchange
  const undoLastInterchange = () => {
    if (interchanges.length === 0) return;

    const lastInterchange = interchanges[0];
    
    // Revert the position change
    onPositionChange(lastInterchange.position, lastInterchange.playerOut);

    // Remove from list
    setInterchanges(prev => prev.slice(1));

    toast({
      title: "Interchange Undone",
      description: `Reverted ${getPlayerName(lastInterchange.playerIn)} ↔ ${getPlayerName(lastInterchange.playerOut)}`,
    });
  };

  // Get interchanges for current quarter
  const currentQuarterInterchanges = interchanges.filter(i => i.quarter === currentQuarter);

  return (
    <div className="space-y-4">
      {/* Quick Interchange Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5" />
              Player Interchange
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
              >
                <History className="h-4 w-4 mr-1" />
                {showHistory ? 'Hide' : 'Show'} History
              </Button>
              {interchanges.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={undoLastInterchange}
                >
                  <Undo2 className="h-4 w-4 mr-1" />
                  Undo Last
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Position Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Position</label>
              <Select value={selectedPosition || ''} onValueChange={(value) => setSelectedPosition(value as Position)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {allPositions.map(position => (
                    <SelectItem key={position} value={position}>
                      {position} - {currentPositions[position] ? getPlayerName(currentPositions[position]!) : 'Empty'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Incoming Player */}
            <div>
              <label className="text-sm font-medium mb-2 block">Player Coming On</label>
              <Select value={selectedPlayerIn?.toString() || ''} onValueChange={(value) => setSelectedPlayerIn(Number(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select player" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailablePlayers().map(player => (
                    <SelectItem key={player.id} value={player.id.toString()}>
                      {player.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quarter Time */}
            <div>
              <label className="text-sm font-medium mb-2 block">Time Remaining</label>
              <Select value={quarterTime} onValueChange={setQuarterTime}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['15:00', '14:00', '13:00', '12:00', '11:00', '10:00', '9:00', '8:00', '7:00', '6:00', '5:00', '4:00', '3:00', '2:00', '1:00', '0:30'].map(time => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reason */}
            <div>
              <label className="text-sm font-medium mb-2 block">Reason</label>
              <Select value={reason} onValueChange={(value) => setReason(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tactical">Tactical</SelectItem>
                  <SelectItem value="rest">Rest</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="injury">Injury</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Record Button */}
            <div className="flex items-end">
              <Button 
                onClick={recordInterchange}
                className="w-full"
                disabled={!selectedPosition || !selectedPlayerIn}
              >
                Record Interchange
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Quarter Summary */}
      {currentQuarterInterchanges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Quarter {currentQuarter} Interchanges ({currentQuarterInterchanges.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {currentQuarterInterchanges.map(interchange => (
                <div key={interchange.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{interchange.timeInQuarter}</Badge>
                    <Badge>{interchange.position}</Badge>
                    <span className="text-sm">
                      {getPlayerName(interchange.playerOut)} → {getPlayerName(interchange.playerIn)}
                    </span>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {interchange.reason}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Game History */}
      {showHistory && interchanges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>All Interchanges ({interchanges.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(
                interchanges.reduce((acc, interchange) => {
                  const quarter = `Q${interchange.quarter}`;
                  if (!acc[quarter]) acc[quarter] = [];
                  acc[quarter].push(interchange);
                  return acc;
                }, {} as Record<string, PlayerInterchange[]>)
              ).map(([quarter, quarterInterchanges]) => (
                <div key={quarter}>
                  <h4 className="font-medium mb-2">{quarter}</h4>
                  <div className="space-y-1 ml-4">
                    {quarterInterchanges.map(interchange => (
                      <div key={interchange.id} className="flex items-center justify-between p-2 border rounded text-sm">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs">{interchange.timeInQuarter}</Badge>
                          <Badge className="text-xs">{interchange.position}</Badge>
                          <span>
                            {getPlayerName(interchange.playerOut)} → {getPlayerName(interchange.playerIn)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs capitalize">
                            {interchange.reason}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {interchange.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Interchanges Message */}
      {interchanges.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <ArrowRightLeft className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No interchanges recorded yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Record player substitutions as they happen during the game
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
