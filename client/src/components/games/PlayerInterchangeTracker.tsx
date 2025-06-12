
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRightLeft, Clock, Undo2, History } from 'lucide-react';
import { Player, Position, allPositions } from '@shared/schema';
import { positionLabels } from '@/lib/utils';
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

interface PlayerPlayingTime {
  playerId: number;
  quarterTime: Record<number, number>; // quarter -> seconds played
  totalTime: number; // total seconds played across all quarters
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
  const [playingTimes, setPlayingTimes] = useState<Record<number, PlayerPlayingTime>>({});
  const { toast } = useToast();

  // Convert time string (e.g., "12:30") to seconds remaining in quarter
  const timeStringToSeconds = (timeStr: string): number => {
    const [minutes, seconds] = timeStr.split(':').map(Number);
    return (minutes * 60) + seconds;
  };

  // Convert seconds to time played (900 - seconds remaining)
  const getTimePlayedFromRemaining = (remainingSeconds: number): number => {
    return 900 - remainingSeconds; // 15 minutes = 900 seconds
  };

  // Format seconds as MM:SS
  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calculate playing time for all players
  const calculatePlayingTimes = (): Record<number, PlayerPlayingTime> => {
    const times: Record<number, PlayerPlayingTime> = {};

    // Initialize all players
    players.forEach(player => {
      times[player.id] = {
        playerId: player.id,
        quarterTime: { 1: 0, 2: 0, 3: 0, 4: 0 },
        totalTime: 0
      };
    });

    // Track position assignments for each quarter
    const quarterAssignments: Record<number, Record<Position, Array<{ playerId: number, startTime: number, endTime?: number }>>> = {
      1: {} as Record<Position, Array<{ playerId: number, startTime: number, endTime?: number }>>,
      2: {} as Record<Position, Array<{ playerId: number, startTime: number, endTime?: number }>>,
      3: {} as Record<Position, Array<{ playerId: number, startTime: number, endTime?: number }>>,
      4: {} as Record<Position, Array<{ playerId: number, startTime: number, endTime?: number }>>
    };

    // Initialize position arrays
    allPositions.forEach(position => {
      [1, 2, 3, 4].forEach(quarter => {
        quarterAssignments[quarter][position] = [];
      });
    });

    // Start with current positions (assume they started at 15:00)
    Object.entries(currentPositions).forEach(([position, playerId]) => {
      if (playerId) {
        [1, 2, 3, 4].forEach(quarter => {
          quarterAssignments[quarter][position as Position].push({
            playerId,
            startTime: 900 // Started at beginning of quarter
          });
        });
      }
    });

    // Process interchanges in chronological order
    const sortedInterchanges = [...interchanges].sort((a, b) => {
      if (a.quarter !== b.quarter) return a.quarter - b.quarter;
      const aSeconds = timeStringToSeconds(a.timeInQuarter);
      const bSeconds = timeStringToSeconds(b.timeInQuarter);
      return bSeconds - aSeconds; // Earlier in quarter = higher remaining time
    });

    sortedInterchanges.forEach(interchange => {
      const position = interchange.position;
      const quarter = interchange.quarter;
      const timeSeconds = timeStringToSeconds(interchange.timeInQuarter);
      const timePlayedAtInterchange = getTimePlayedFromRemaining(timeSeconds);

      const assignments = quarterAssignments[quarter][position];
      
      // End the current player's time
      if (assignments.length > 0) {
        const lastAssignment = assignments[assignments.length - 1];
        if (!lastAssignment.endTime) {
          lastAssignment.endTime = timePlayedAtInterchange;
        }
      }

      // Start the new player's time
      assignments.push({
        playerId: interchange.playerIn,
        startTime: timePlayedAtInterchange,
        endTime: undefined // Will be set by next interchange or end of quarter
      });
    });

    // Calculate total time for each player
    [1, 2, 3, 4].forEach(quarter => {
      allPositions.forEach(position => {
        const assignments = quarterAssignments[quarter][position];
        
        assignments.forEach(assignment => {
          const endTime = assignment.endTime ?? 900; // End of quarter if not specified
          const timePlayed = endTime - assignment.startTime;
          
          if (timePlayed > 0 && times[assignment.playerId]) {
            times[assignment.playerId].quarterTime[quarter] += timePlayed;
            times[assignment.playerId].totalTime += timePlayed;
          }
        });
      });
    });

    return times;
  };

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

  // Recalculate playing times when interchanges change
  useEffect(() => {
    setPlayingTimes(calculatePlayingTimes());
  }, [interchanges, currentPositions, players]);

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
                      {position} - {currentPositions[position] ? getPlayerName(currentPositions[position]!) : 'No Player'}
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

      {/* Playing Time Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Player Playing Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {players
              .filter(player => Object.values(currentPositions).includes(player.id) || 
                      (playingTimes[player.id] && playingTimes[player.id].totalTime > 0))
              .sort((a, b) => (playingTimes[b.id]?.totalTime || 0) - (playingTimes[a.id]?.totalTime || 0))
              .map(player => {
                const playerTime = playingTimes[player.id];
                if (!playerTime) return null;

                return (
                  <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium">
                        {player.displayName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{player.displayName}</p>
                        <p className="text-sm text-gray-500">
                          Total: {formatTime(playerTime.totalTime)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4].map(quarter => (
                        <div key={quarter} className="text-center">
                          <div className="text-xs text-gray-500 mb-1">Q{quarter}</div>
                          <div className={`text-sm font-medium px-2 py-1 rounded ${
                            playerTime.quarterTime[quarter] > 0 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-400'
                          }`}>
                            {formatTime(playerTime.quarterTime[quarter])}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            
            {players.filter(player => 
              Object.values(currentPositions).includes(player.id) || 
              (playingTimes[player.id] && playingTimes[player.id].totalTime > 0)
            ).length === 0 && (
              <p className="text-center text-gray-500 py-4">
                No playing time recorded yet. Assign players to positions to start tracking.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

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
