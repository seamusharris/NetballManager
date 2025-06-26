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
  ArrowUpDown, Save, Trash2, MoreHorizontal, Move3D, Crown, Trophy,
  Zap, Star, Heart, Shield, Flame, Sparkles, ChevronLeft, ChevronRight
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
  },
  {
    id: 10,
    displayName: "Grace",
    firstName: "Grace",
    lastName: "",
    positionPreferences: ["GS", "GA"],
    avatarColor: "bg-cyan-500",
    active: true
  },
  {
    id: 11,
    displayName: "Sophie",
    firstName: "Sophie",
    lastName: "",
    positionPreferences: ["C", "WA"],
    avatarColor: "bg-emerald-500",
    active: true
  }
];

const NETBALL_POSITIONS = ['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'];

// 1. Enhanced Glass Morphism Court with Quarters
const GlassMorphismCourt = () => {
  const [currentQuarter, setCurrentQuarter] = useState(1);
  const [assignments, setAssignments] = useState<Record<number, Record<string, number | null>>>({
    1: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null },
    2: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null },
    3: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null },
    4: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null }
  });
  const [draggedPlayer, setDraggedPlayer] = useState<number | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<string | null>(null);

  const handleDrop = (position: string) => {
    if (draggedPlayer) {
      const newAssignments = { ...assignments };
      // Remove player from any position in current quarter
      Object.keys(newAssignments[currentQuarter]).forEach(pos => {
        if (newAssignments[currentQuarter][pos] === draggedPlayer) {
          newAssignments[currentQuarter][pos] = null;
        }
      });
      newAssignments[currentQuarter][position] = draggedPlayer;
      setAssignments(newAssignments);
    }
    setDraggedPlayer(null);
    setDragOverPosition(null);
  };

  const getAllAssignedPlayerIds = () => {
    const assigned = new Set<number>();
    Object.values(assignments).forEach(quarter => {
      Object.values(quarter).forEach(playerId => {
        if (playerId !== null) assigned.add(playerId);
      });
    });
    return assigned;
  };

  const assignedPlayerIds = getAllAssignedPlayerIds();
  const availablePlayers = samplePlayers.filter(p => !assignedPlayerIds.has(p.id));

  const PositionSlot = ({ position, courtSection }: { position: string, courtSection: 'attack' | 'mid' | 'defense' }) => {
    const player = assignments[currentQuarter][position] ? samplePlayers.find(p => p.id === assignments[currentQuarter][position]) : null;
    const sectionColors = {
      attack: 'from-red-500/20 to-red-600/30 border-red-300/50',
      mid: 'from-blue-500/20 to-blue-600/30 border-blue-300/50',
      defense: 'from-green-500/20 to-green-600/30 border-green-300/50'
    };

    return (
      <div
        className={`
          relative min-h-[160px] rounded-2xl backdrop-blur-lg border-2 transition-all duration-300
          bg-gradient-to-br ${sectionColors[courtSection]}
          ${dragOverPosition === position ? 'scale-105 shadow-2xl' : 'shadow-lg'}
          hover:shadow-xl
        `}
        onDragOver={(e) => { e.preventDefault(); setDragOverPosition(position); }}
        onDragLeave={() => setDragOverPosition(null)}
        onDrop={() => handleDrop(position)}
      >
        <div className="absolute top-3 left-3">
          <Badge variant="outline" className="bg-white/80 backdrop-blur-sm font-bold">
            {position}
          </Badge>
        </div>

        <div className="flex items-center justify-center h-full p-4">
          {player ? (
            <div
              draggable
              onDragStart={() => setDraggedPlayer(player.id)}
              className="cursor-move w-full max-w-[140px]"
            >
              <PlayerBox player={player} size="sm" showPositions={true} />
            </div>
          ) : (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/60 flex items-center justify-center mb-2 mx-auto">
                <Plus className="h-6 w-6 text-white/60" />
              </div>
              <p className="text-white/80 text-sm font-medium">Drop here</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Quarter Navigation */}
      <Card className="backdrop-blur-lg bg-white/80">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Quarter Management
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentQuarter(Math.max(1, currentQuarter - 1))}
                disabled={currentQuarter === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Badge variant="secondary" className="px-4 py-2">
                Quarter {currentQuarter}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentQuarter(Math.min(4, currentQuarter + 1))}
                disabled={currentQuarter === 4}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map(quarter => (
              <Button
                key={quarter}
                variant={currentQuarter === quarter ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentQuarter(quarter)}
                className="flex items-center gap-2"
              >
                Q{quarter}
                <Badge variant="secondary" className="text-xs">
                  {Object.values(assignments[quarter]).filter(p => p !== null).length}/7
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Court Layout */}
      <div className="relative min-h-[600px] rounded-3xl bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-100 p-8 shadow-inner">
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-3xl"></div>

        <div className="relative grid grid-cols-3 gap-8 h-full">
          <div className="space-y-6">
            <h3 className="text-center font-bold text-red-700 text-lg mb-4">Attack</h3>
            <PositionSlot position="GS" courtSection="attack" />
            <PositionSlot position="GA" courtSection="attack" />
          </div>

          <div className="space-y-4">
            <h3 className="text-center font-bold text-blue-700 text-lg mb-4">Midcourt</h3>
            <PositionSlot position="WA" courtSection="mid" />
            <PositionSlot position="C" courtSection="mid" />
            <PositionSlot position="WD" courtSection="mid" />
          </div>

          <div className="space-y-6">
            <h3 className="text-center font-bold text-green-700 text-lg mb-4">Defense</h3>
            <PositionSlot position="GD" courtSection="defense" />
            <PositionSlot position="GK" courtSection="defense" />
          </div>
        </div>
      </div>

      {/* Available Players */}
      <Card className="backdrop-blur-lg bg-white/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Available Players
            <Badge variant="secondary">{availablePlayers.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {availablePlayers.map(player => (
              <div
                key={player.id}
                draggable
                onDragStart={() => setDraggedPlayer(player.id)}
                className="cursor-move"
              >
                <PlayerBox player={player} size="sm" showPositions={true} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// 2. Neon Glass Variant
const NeonGlassCourt = () => {
  const [currentQuarter, setCurrentQuarter] = useState(1);
  const [assignments, setAssignments] = useState<Record<number, Record<string, number | null>>>({
    1: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null },
    2: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null },
    3: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null },
    4: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null }
  });
  const [draggedPlayer, setDraggedPlayer] = useState<number | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<string | null>(null);

  const handleDrop = (position: string) => {
    if (draggedPlayer) {
      const newAssignments = { ...assignments };
      Object.keys(newAssignments[currentQuarter]).forEach(pos => {
        if (newAssignments[currentQuarter][pos] === draggedPlayer) {
          newAssignments[currentQuarter][pos] = null;
        }
      });
      newAssignments[currentQuarter][position] = draggedPlayer;
      setAssignments(newAssignments);
    }
    setDraggedPlayer(null);
    setDragOverPosition(null);
  };

  const getAllAssignedPlayerIds = () => {
    const assigned = new Set<number>();
    Object.values(assignments).forEach(quarter => {
      Object.values(quarter).forEach(playerId => {
        if (playerId !== null) assigned.add(playerId);
      });
    });
    return assigned;
  };

  const assignedPlayerIds = getAllAssignedPlayerIds();
  const availablePlayers = samplePlayers.filter(p => !assignedPlayerIds.has(p.id));

  const PositionSlot = ({ position, courtSection }: { position: string, courtSection: 'attack' | 'mid' | 'defense' }) => {
    const player = assignments[currentQuarter][position] ? samplePlayers.find(p => p.id === assignments[currentQuarter][position]) : null;
    const sectionColors = {
      attack: 'from-pink-500/30 to-red-500/40 border-pink-400/60 shadow-pink-500/50',
      mid: 'from-cyan-500/30 to-blue-500/40 border-cyan-400/60 shadow-cyan-500/50',
      defense: 'from-green-500/30 to-emerald-500/40 border-green-400/60 shadow-green-500/50'
    };

    return (
      <div
        className={`
          relative min-h-[160px] rounded-2xl backdrop-blur-xl border-2 transition-all duration-300
          bg-gradient-to-br ${sectionColors[courtSection]}
          ${dragOverPosition === position ? 'scale-105 shadow-2xl glow-effect' : 'shadow-lg'}
          hover:shadow-xl hover:glow-effect
        `}
        onDragOver={(e) => { e.preventDefault(); setDragOverPosition(position); }}
        onDragLeave={() => setDragOverPosition(null)}
        onDrop={() => handleDrop(position)}
      >
        <div className="absolute top-3 left-3">
          <Badge variant="outline" className="bg-black/60 text-white border-white/40 backdrop-blur-sm font-bold">
            {position}
          </Badge>
        </div>

        <div className="flex items-center justify-center h-full p-4">
          {player ? (
            <div
              draggable
              onDragStart={() => setDraggedPlayer(player.id)}
              className="cursor-move w-full max-w-[140px]"
            >
              <PlayerBox player={player} size="sm" showPositions={true} />
            </div>
          ) : (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/80 flex items-center justify-center mb-2 mx-auto bg-white/10">
                <Plus className="h-6 w-6 text-white/80" />
              </div>
              <p className="text-white text-sm font-medium">Drop here</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Quarter Navigation */}
      <Card className="backdrop-blur-lg bg-black/40 border-white/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-white">
              <Clock className="h-5 w-5 text-cyan-400" />
              Quarter Management
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentQuarter(Math.max(1, currentQuarter - 1))}
                disabled={currentQuarter === 1}
                className="border-white/40 text-white hover:bg-white/10"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Badge variant="secondary" className="px-4 py-2 bg-cyan-500/80 text-white">
                Quarter {currentQuarter}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentQuarter(Math.min(4, currentQuarter + 1))}
                disabled={currentQuarter === 4}
                className="border-white/40 text-white hover:bg-white/10"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map(quarter => (
              <Button
                key={quarter}
                variant={currentQuarter === quarter ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentQuarter(quarter)}
                className={`flex items-center gap-2 ${
                  currentQuarter === quarter 
                    ? "bg-cyan-500 text-white" 
                    : "border-white/40 text-white hover:bg-white/10"
                }`}
              >
                Q{quarter}
                <Badge variant="secondary" className="text-xs bg-black/40 text-white">
                  {Object.values(assignments[quarter]).filter(p => p !== null).length}/7
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Court Layout */}
      <div className="relative min-h-[600px] rounded-3xl bg-gradient-to-br from-gray-900 via-black to-gray-800 p-8 shadow-inner border border-white/20">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-3xl"></div>

        <div className="relative grid grid-cols-3 gap-8 h-full">
          <div className="space-y-6">
            <h3 className="text-center font-bold text-pink-400 text-lg mb-4 drop-shadow-lg">Attack</h3>
            <PositionSlot position="GS" courtSection="attack" />
            <PositionSlot position="GA" courtSection="attack" />
          </div>

          <div className="space-y-4">
            <h3 className="text-center font-bold text-cyan-400 text-lg mb-4 drop-shadow-lg">Midcourt</h3>
            <PositionSlot position="WA" courtSection="mid" />
            <PositionSlot position="C" courtSection="mid" />
            <PositionSlot position="WD" courtSection="mid" />
          </div>

          <div className="space-y-6">
            <h3 className="text-center font-bold text-green-400 text-lg mb-4 drop-shadow-lg">Defense</h3>
            <PositionSlot position="GD" courtSection="defense" />
            <PositionSlot position="GK" courtSection="defense" />
          </div>
        </div>
      </div>

      {/* Available Players */}
      <Card className="backdrop-blur-lg bg-black/40 border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Sparkles className="h-5 w-5 text-purple-400" />
            Available Players
            <Badge variant="secondary" className="bg-purple-500/80 text-white">{availablePlayers.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {availablePlayers.map(player => (
              <div
                key={player.id}
                draggable
                onDragStart={() => setDraggedPlayer(player.id)}
                className="cursor-move"
              >
                <PlayerBox player={player} size="sm" showPositions={true} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        .glow-effect {
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3);
        }
      `}</style>
    </div>
  );
};

// 3. Minimal Glass Variant
const MinimalGlassCourt = () => {
  const [currentQuarter, setCurrentQuarter] = useState(1);
  const [assignments, setAssignments] = useState<Record<number, Record<string, number | null>>>({
    1: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null },
    2: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null },
    3: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null },
    4: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null }
  });
  const [draggedPlayer, setDraggedPlayer] = useState<number | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<string | null>(null);

  const handleDrop = (position: string) => {
    if (draggedPlayer) {
      const newAssignments = { ...assignments };
      Object.keys(newAssignments[currentQuarter]).forEach(pos => {
        if (newAssignments[currentQuarter][pos] === draggedPlayer) {
          newAssignments[currentQuarter][pos] = null;
        }
      });
      newAssignments[currentQuarter][position] = draggedPlayer;
      setAssignments(newAssignments);
    }
    setDraggedPlayer(null);
    setDragOverPosition(null);
  };

  const getAllAssignedPlayerIds = () => {
    const assigned = new Set<number>();
    Object.values(assignments).forEach(quarter => {
      Object.values(quarter).forEach(playerId => {
        if (playerId !== null) assigned.add(playerId);
      });
    });
    return assigned;
  };

  const assignedPlayerIds = getAllAssignedPlayerIds();
  const availablePlayers = samplePlayers.filter(p => !assignedPlayerIds.has(p.id));

  const PositionSlot = ({ position }: { position: string }) => {
    const player = assignments[currentQuarter][position] ? samplePlayers.find(p => p.id === assignments[currentQuarter][position]) : null;

    return (
      <div
        className={`
          relative min-h-[160px] rounded-xl backdrop-blur-sm border transition-all duration-200
          bg-white/60 border-gray-200/60
          ${dragOverPosition === position ? 'scale-102 shadow-lg border-blue-300' : 'shadow-sm'}
          hover:shadow-md hover:bg-white/70
        `}
        onDragOver={(e) => { e.preventDefault(); setDragOverPosition(position); }}
        onDragLeave={() => setDragOverPosition(null)}
        onDrop={() => handleDrop(position)}
      >
        <div className="absolute top-3 left-3">
          <Badge variant="outline" className="bg-white/90 text-gray-700 border-gray-300">
            {position}
          </Badge>
        </div>

        <div className="flex items-center justify-center h-full p-4">
          {player ? (
            <div
              draggable
              onDragStart={() => setDraggedPlayer(player.id)}
              className="cursor-move w-full max-w-[140px]"
            >
              <PlayerBox player={player} size="sm" showPositions={true} />
            </div>
          ) : (
            <div className="text-center">
              <div className="w-10 h-10 rounded-full border-2 border-dashed border-gray-400/60 flex items-center justify-center mb-2 mx-auto">
                <Plus className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-gray-600 text-sm">Drop here</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Quarter Navigation */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Quarter {currentQuarter}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentQuarter(Math.max(1, currentQuarter - 1))}
                disabled={currentQuarter === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentQuarter(Math.min(4, currentQuarter + 1))}
                disabled={currentQuarter === 4}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map(quarter => (
              <Button
                key={quarter}
                variant={currentQuarter === quarter ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentQuarter(quarter)}
                className="flex items-center gap-2"
              >
                Q{quarter}
                <Badge variant="secondary" className="text-xs">
                  {Object.values(assignments[quarter]).filter(p => p !== null).length}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Court Layout */}
      <div className="relative min-h-[600px] rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 p-8 border border-gray-200">
        <div className="relative grid grid-cols-7 gap-4 h-full">
          <div className="space-y-4">
            <PositionSlot position="GS" />
          </div>
          <div className="space-y-4">
            <PositionSlot position="GA" />
          </div>
          <div className="space-y-4">
            <PositionSlot position="WA" />
          </div>
          <div className="space-y-4">
            <PositionSlot position="C" />
          </div>
          <div className="space-y-4">
            <PositionSlot position="WD" />
          </div>
          <div className="space-y-4">
            <PositionSlot position="GD" />
          </div>
          <div className="space-y-4">
            <PositionSlot position="GK" />
          </div>
        </div>
      </div>

      {/* Available Players */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Available Players
            <Badge variant="outline">{availablePlayers.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {availablePlayers.map(player => (
              <div
                key={player.id}
                draggable
                onDragStart={() => setDraggedPlayer(player.id)}
                className="cursor-move"
              >
                <PlayerBox player={player} size="sm" showPositions={true} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// 4. Enhanced Team Builder with Quarters
const TeamBuilderInterface = () => {
  const [currentQuarter, setCurrentQuarter] = useState(1);
  const [teams, setTeams] = useState<Record<number, Record<string, number[]>>>({
    1: { starters: [], substitutes: [], captains: [], specialists: [] },
    2: { starters: [], substitutes: [], captains: [], specialists: [] },
    3: { starters: [], substitutes: [], captains: [], specialists: [] },
    4: { starters: [], substitutes: [], captains: [], specialists: [] }
  });
  const [draggedPlayer, setDraggedPlayer] = useState<number | null>(null);

  const handleDrop = (teamType: string) => {
    if (draggedPlayer) {
      const newTeams = { ...teams };
      // Remove from all categories in current quarter
      Object.keys(newTeams[currentQuarter]).forEach(type => {
        newTeams[currentQuarter][type] = newTeams[currentQuarter][type].filter(id => id !== draggedPlayer);
      });
      newTeams[currentQuarter][teamType] = [...newTeams[currentQuarter][teamType], draggedPlayer];
      setTeams(newTeams);
    }
    setDraggedPlayer(null);
  };

  const getAllAssignedPlayerIds = () => {
    const assigned = new Set<number>();
    Object.values(teams).forEach(quarter => {
      Object.values(quarter).forEach(playerList => {
        playerList.forEach(playerId => assigned.add(playerId));
      });
    });
    return assigned;
  };

  const assignedPlayerIds = getAllAssignedPlayerIds();
  const availablePlayers = samplePlayers.filter(p => !assignedPlayerIds.has(p.id));

  const TeamSection = ({ 
    title, 
    teamType, 
    icon, 
    maxPlayers, 
    color, 
    description 
  }: { 
    title: string, 
    teamType: string, 
    icon: React.ReactNode, 
    maxPlayers: number, 
    color: string,
    description: string 
  }) => (
    <Card className="h-full">
      <CardHeader className={`${color} text-white rounded-t-lg`}>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
          <Badge variant="secondary" className="bg-white/20 text-white">
            {teams[currentQuarter][teamType].length}/{maxPlayers}
          </Badge>
        </CardTitle>
        <p className="text-sm opacity-90">{description}</p>
      </CardHeader>
      <CardContent 
        className="min-h-[200px] p-4"
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => handleDrop(teamType)}
      >
        <div className="space-y-3">
          {teams[currentQuarter][teamType].map(playerId => {
            const player = samplePlayers.find(p => p.id === playerId);
            return player ? (
              <div
                key={playerId}
                draggable
                onDragStart={() => setDraggedPlayer(playerId)}
                className="cursor-move"
              >
                <PlayerBox player={player} size="sm" showPositions={true} />
              </div>
            ) : null;
          })}
          {teams[currentQuarter][teamType].length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center mx-auto mb-2">
                <Plus className="h-8 w-8" />
              </div>
              <p className="text-sm">Drag players here</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Quarter Navigation */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Quarter {currentQuarter} Team Builder
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentQuarter(Math.max(1, currentQuarter - 1))}
                disabled={currentQuarter === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Badge variant="secondary" className="px-4 py-2">
                Quarter {currentQuarter}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentQuarter(Math.min(4, currentQuarter + 1))}
                disabled={currentQuarter === 4}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map(quarter => (
              <Button
                key={quarter}
                variant={currentQuarter === quarter ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentQuarter(quarter)}
                className="flex items-center gap-2"
              >
                Q{quarter}
                <Badge variant="secondary" className="text-xs">
                  {Object.values(teams[quarter]).flat().length}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        <TeamSection
          title="Starting Seven"
          teamType="starters"
          icon={<Star className="h-5 w-5" />}
          maxPlayers={7}
          color="bg-gradient-to-r from-purple-600 to-purple-700"
          description="Your core lineup for this quarter"
        />
        <TeamSection
          title="Substitutes"
          teamType="substitutes"
          icon={<ArrowUpDown className="h-5 w-5" />}
          maxPlayers={4}
          color="bg-gradient-to-r from-blue-600 to-blue-700"
          description="Players ready to rotate in"
        />
        <TeamSection
          title="Leadership"
          teamType="captains"
          icon={<Crown className="h-5 w-5" />}
          maxPlayers={3}
          color="bg-gradient-to-r from-amber-600 to-amber-700"
          description="Captain and vice-captains"
        />
        <TeamSection
          title="Specialists"
          teamType="specialists"
          icon={<Target className="h-5 w-5" />}
          maxPlayers={3}
          color="bg-gradient-to-r from-emerald-600 to-emerald-700"
          description="Key position specialists"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Available Players
            <Badge variant="outline">{availablePlayers.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {availablePlayers.map(player => (
              <div
                key={player.id}
                draggable
                onDragStart={() => setDraggedPlayer(player.id)}
                className="cursor-move"
              >
                <PlayerBox player={player} size="sm" showPositions={true} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
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
      subtitle="Beautiful drag and drop interfaces with quarter management and glass morphism variants"
      breadcrumbs={breadcrumbs}
    >
      <Helmet>
        <title>Enhanced Drag & Drop Examples | Team Manager</title>
      </Helmet>

      <div className="space-y-8">
        <Tabs defaultValue="glass-classic" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="glass-classic">Classic Glass</TabsTrigger>
            <TabsTrigger value="glass-neon">Neon Glass</TabsTrigger>
            <TabsTrigger value="glass-minimal">Minimal Glass</TabsTrigger>
            <TabsTrigger value="team-builder">Team Builder</TabsTrigger>
            <TabsTrigger value="team-builder">More Examples</TabsTrigger>
          </TabsList>

          <TabsContent value="glass-classic" className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Classic Glass Morphism Court</h3>
              <p className="text-gray-600 mb-4">
                Enhanced glass morphism court with quarter management, wider position slots, and standard hover effects.
              </p>
              <GlassMorphismCourt />
            </div>
          </TabsContent>

          <TabsContent value="glass-neon" className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Neon Glass Morphism Court</h3>
              <p className="text-gray-600 mb-4">
                Dark theme variant with neon glow effects, perfect for modern interfaces.
              </p>
              <NeonGlassCourt />
            </div>
          </TabsContent>

          <TabsContent value="glass-minimal" className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Minimal Glass Court</h3>
              <p className="text-gray-600 mb-4">
                Clean, minimal approach with subtle glass effects and horizontal layout.
              </p>
              <MinimalGlassCourt />
            </div>
          </TabsContent>

          <TabsContent value="team-builder" className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Enhanced Team Builder</h3>
              <p className="text-gray-600 mb-4">
                Quarter-based team organization with role-specific categories and management.
              </p>
              <TeamBuilderInterface />
            </div>
          </TabsContent>
        </Tabs>

        {/* Feature Showcase */}
        <Card>
          <CardHeader>
            <CardTitle>Enhanced Features & Design Elements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-blue-600">Quarter Management</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Full 4-quarter support across all examples</li>
                  <li>• Visual quarter navigation with player counts</li>
                  <li>• Independent lineups per quarter</li>
                  <li>• Quick quarter switching controls</li>
                  <li>• Quarter progress tracking</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-green-600">Glass Morphism Variants</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Classic bright glass morphism</li>
                  <li>• Neon dark theme with glow effects</li>
                  <li>• Minimal clean glass approach</li>
                  <li>• Enhanced backdrop blur effects</li>
                  <li>• Improved visual hierarchy</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-purple-600">Improved UX</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Standard hover effects (no tilt)</li>
                  <li>• Wider position slots when occupied</li>
                  <li>• Better visual feedback on drop</li>
                  <li>• Consistent PlayerBox styling</li>
                  <li>• Responsive grid layouts</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
}