
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
  Zap, Star, Heart, Shield, Flame, Sparkles
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

// 1. Court Visualization with Glass Morphism
const GlassMorphismCourt = () => {
  const [assignments, setAssignments] = useState<Record<string, number | null>>({
    GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null
  });
  const [draggedPlayer, setDraggedPlayer] = useState<number | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<string | null>(null);

  const handleDrop = (position: string) => {
    if (draggedPlayer) {
      const newAssignments = { ...assignments };
      Object.keys(newAssignments).forEach(pos => {
        if (newAssignments[pos] === draggedPlayer) {
          newAssignments[pos] = null;
        }
      });
      newAssignments[position] = draggedPlayer;
      setAssignments(newAssignments);
    }
    setDraggedPlayer(null);
    setDragOverPosition(null);
  };

  const assignedPlayerIds = Object.values(assignments).filter(id => id !== null);
  const availablePlayers = samplePlayers.filter(p => !assignedPlayerIds.includes(p.id));

  const PositionSlot = ({ position, courtSection }: { position: string, courtSection: 'attack' | 'mid' | 'defense' }) => {
    const player = assignments[position] ? samplePlayers.find(p => p.id === assignments[position]) : null;
    const sectionColors = {
      attack: 'from-red-500/20 to-red-600/30 border-red-300/50',
      mid: 'from-blue-500/20 to-blue-600/30 border-blue-300/50',
      defense: 'from-green-500/20 to-green-600/30 border-green-300/50'
    };

    return (
      <div
        className={`
          relative min-h-[140px] rounded-2xl backdrop-blur-lg border-2 transition-all duration-300
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
              className="cursor-move transform transition-transform hover:scale-105"
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
                className="cursor-move transform transition-all hover:scale-105 hover:rotate-2"
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

// 2. Team Builder with Roles & Specialties
const TeamBuilderInterface = () => {
  const [teams, setTeams] = useState<Record<string, number[]>>({
    starters: [],
    substitutes: [],
    captains: [],
    specialists: []
  });
  const [draggedPlayer, setDraggedPlayer] = useState<number | null>(null);

  const handleDrop = (teamType: string) => {
    if (draggedPlayer) {
      const newTeams = { ...teams };
      Object.keys(newTeams).forEach(type => {
        newTeams[type] = newTeams[type].filter(id => id !== draggedPlayer);
      });
      newTeams[teamType] = [...newTeams[teamType], draggedPlayer];
      setTeams(newTeams);
    }
    setDraggedPlayer(null);
  };

  const assignedPlayerIds = Object.values(teams).flat();
  const availablePlayers = samplePlayers.filter(p => !assignedPlayerIds.includes(p.id));

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
            {teams[teamType].length}/{maxPlayers}
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
          {teams[teamType].map(playerId => {
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
          {teams[teamType].length === 0 && (
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
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        <TeamSection
          title="Starting Seven"
          teamType="starters"
          icon={<Star className="h-5 w-5" />}
          maxPlayers={7}
          color="bg-gradient-to-r from-purple-600 to-purple-700"
          description="Your core lineup for the match"
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
                className="cursor-move transition-transform hover:scale-105"
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

// 3. Rotation Planner with Timing
const RotationPlanner = () => {
  const [rotations, setRotations] = useState<Record<string, { time: string, playersIn: number[], playersOut: number[] }>>({
    'rotation-1': { time: '10:00', playersIn: [], playersOut: [] },
    'rotation-2': { time: '20:00', playersIn: [], playersOut: [] },
    'rotation-3': { time: '30:00', playersIn: [], playersOut: [] },
    'rotation-4': { time: '40:00', playersIn: [], playersOut: [] }
  });
  const [draggedPlayer, setDraggedPlayer] = useState<number | null>(null);
  const [dragContext, setDragContext] = useState<{ rotation: string, type: 'in' | 'out' } | null>(null);

  const handleDrop = (rotation: string, type: 'in' | 'out') => {
    if (draggedPlayer && dragContext) {
      const newRotations = { ...rotations };
      
      // Remove from previous location
      if (dragContext.rotation && dragContext.type) {
        newRotations[dragContext.rotation][dragContext.type === 'in' ? 'playersIn' : 'playersOut'] = 
          newRotations[dragContext.rotation][dragContext.type === 'in' ? 'playersIn' : 'playersOut']
            .filter(id => id !== draggedPlayer);
      }
      
      // Add to new location
      if (type === 'in') {
        newRotations[rotation].playersIn = [...newRotations[rotation].playersIn, draggedPlayer];
      } else {
        newRotations[rotation].playersOut = [...newRotations[rotation].playersOut, draggedPlayer];
      }
      
      setRotations(newRotations);
    }
    setDraggedPlayer(null);
    setDragContext(null);
  };

  const RotationCard = ({ rotationKey, rotation }: { rotationKey: string, rotation: any }) => (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/20 to-transparent rounded-bl-3xl"></div>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">{rotation.time}</CardTitle>
          </div>
          <Badge variant="outline" className="bg-blue-50">
            Quarter {rotationKey.split('-')[1]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-1">
              <ArrowUpDown className="h-4 w-4" />
              Players In
            </h4>
            <div 
              className="min-h-[100px] p-3 border-2 border-dashed border-green-300 rounded-lg bg-green-50/50"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(rotationKey, 'in')}
            >
              <div className="space-y-2">
                {rotation.playersIn.map((playerId: number) => {
                  const player = samplePlayers.find(p => p.id === playerId);
                  return player ? (
                    <div
                      key={playerId}
                      draggable
                      onDragStart={() => {
                        setDraggedPlayer(playerId);
                        setDragContext({ rotation: rotationKey, type: 'in' });
                      }}
                      className="cursor-move"
                    >
                      <PlayerBox player={player} size="sm" showPositions={false} />
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-1">
              <ArrowUpDown className="h-4 w-4 rotate-180" />
              Players Out
            </h4>
            <div 
              className="min-h-[100px] p-3 border-2 border-dashed border-red-300 rounded-lg bg-red-50/50"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(rotationKey, 'out')}
            >
              <div className="space-y-2">
                {rotation.playersOut.map((playerId: number) => {
                  const player = samplePlayers.find(p => p.id === playerId);
                  return player ? (
                    <div
                      key={playerId}
                      draggable
                      onDragStart={() => {
                        setDraggedPlayer(playerId);
                        setDragContext({ rotation: rotationKey, type: 'out' });
                      }}
                      className="cursor-move"
                    >
                      <PlayerBox player={player} size="sm" showPositions={false} />
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(rotations).map(([key, rotation]) => (
          <RotationCard key={key} rotationKey={key} rotation={rotation} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Player Pool
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {samplePlayers.map(player => (
              <div
                key={player.id}
                draggable
                onDragStart={() => {
                  setDraggedPlayer(player.id);
                  setDragContext(null);
                }}
                className="cursor-move transition-transform hover:scale-105"
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

// 4. Match Strategy Board
const StrategyBoard = () => {
  const [formations, setFormations] = useState<Record<string, number[]>>({
    'attacking-formation': [],
    'defensive-formation': [],
    'neutral-formation': [],
    'power-play': []
  });
  const [draggedPlayer, setDraggedPlayer] = useState<number | null>(null);

  const handleDrop = (formation: string) => {
    if (draggedPlayer) {
      const newFormations = { ...formations };
      Object.keys(newFormations).forEach(form => {
        newFormations[form] = newFormations[form].filter(id => id !== draggedPlayer);
      });
      newFormations[formation] = [...newFormations[formation], draggedPlayer].slice(0, 7);
      setFormations(newFormations);
    }
    setDraggedPlayer(null);
  };

  const FormationZone = ({ 
    title, 
    formationKey, 
    icon, 
    color, 
    description 
  }: { 
    title: string, 
    formationKey: string, 
    icon: React.ReactNode, 
    color: string,
    description: string 
  }) => (
    <Card className="relative h-full overflow-hidden">
      <div className={`absolute inset-0 ${color} opacity-5`}></div>
      <CardHeader className={`${color} text-white relative`}>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
          <Badge variant="secondary" className="bg-white/20 text-white">
            {formations[formationKey].length}/7
          </Badge>
        </CardTitle>
        <p className="text-sm opacity-90">{description}</p>
      </CardHeader>
      <CardContent 
        className="min-h-[300px] p-4 relative"
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => handleDrop(formationKey)}
      >
        <div className="grid grid-cols-3 gap-3 h-full">
          {Array.from({ length: 7 }, (_, index) => {
            const playerId = formations[formationKey][index];
            const player = playerId ? samplePlayers.find(p => p.id === playerId) : null;
            
            return (
              <div
                key={index}
                className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-white/50"
              >
                {player ? (
                  <div
                    draggable
                    onDragStart={() => setDraggedPlayer(player.id)}
                    className="cursor-move w-full h-full flex items-center justify-center"
                  >
                    <PlayerBox player={player} size="sm" showPositions={false} />
                  </div>
                ) : (
                  <Plus className="h-6 w-6 text-gray-400" />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  const assignedPlayerIds = Object.values(formations).flat();
  const availablePlayers = samplePlayers.filter(p => !assignedPlayerIds.includes(p.id));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FormationZone
          title="Attacking Formation"
          formationKey="attacking-formation"
          icon={<Zap className="h-5 w-5" />}
          color="bg-gradient-to-r from-red-600 to-orange-600"
          description="High-pressure offensive setup"
        />
        <FormationZone
          title="Defensive Formation"
          formationKey="defensive-formation"
          icon={<Shield className="h-5 w-5" />}
          color="bg-gradient-to-r from-blue-600 to-indigo-600"
          description="Solid defensive structure"
        />
        <FormationZone
          title="Neutral Formation"
          formationKey="neutral-formation"
          icon={<Target className="h-5 w-5" />}
          color="bg-gradient-to-r from-green-600 to-emerald-600"
          description="Balanced all-around setup"
        />
        <FormationZone
          title="Power Play"
          formationKey="power-play"
          icon={<Flame className="h-5 w-5" />}
          color="bg-gradient-to-r from-purple-600 to-pink-600"
          description="Special tactical formation"
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
                className="cursor-move transition-transform hover:scale-105"
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

// 5. Performance-Based Lineup
const PerformanceLineup = () => {
  const [lineups, setLineups] = useState<Record<string, number[]>>({
    'top-performers': [],
    'rising-stars': [],
    'consistent-players': [],
    'clutch-players': []
  });
  const [draggedPlayer, setDraggedPlayer] = useState<number | null>(null);

  const handleDrop = (category: string) => {
    if (draggedPlayer) {
      const newLineups = { ...lineups };
      Object.keys(newLineups).forEach(cat => {
        newLineups[cat] = newLineups[cat].filter(id => id !== draggedPlayer);
      });
      newLineups[category] = [...newLineups[category], draggedPlayer];
      setLineups(newLineups);
    }
    setDraggedPlayer(null);
  };

  const PerformanceCategory = ({ 
    title, 
    categoryKey, 
    icon, 
    color, 
    gradient,
    description 
  }: { 
    title: string, 
    categoryKey: string, 
    icon: React.ReactNode, 
    color: string,
    gradient: string,
    description: string 
  }) => (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
      <div className={`absolute inset-0 ${gradient} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
      <CardHeader className="relative">
        <CardTitle className={`flex items-center gap-2 ${color}`}>
          {icon}
          {title}
          <Badge variant="outline" className={`${color} border-current`}>
            {lineups[categoryKey].length}
          </Badge>
        </CardTitle>
        <p className="text-sm text-gray-600">{description}</p>
      </CardHeader>
      <CardContent 
        className="min-h-[200px] relative"
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => handleDrop(categoryKey)}
      >
        <div className="space-y-3">
          {lineups[categoryKey].map(playerId => {
            const player = samplePlayers.find(p => p.id === playerId);
            return player ? (
              <div
                key={playerId}
                draggable
                onDragStart={() => setDraggedPlayer(playerId)}
                className="cursor-move transform transition-all hover:scale-102"
              >
                <PlayerBox player={player} size="md" showPositions={true} />
              </div>
            ) : null;
          })}
          {lineups[categoryKey].length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <div className={`w-16 h-16 rounded-full border-2 border-dashed ${color} border-opacity-30 flex items-center justify-center mx-auto mb-3`}>
                <Plus className="h-8 w-8" />
              </div>
              <p className="text-sm">Drag top performers here</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const assignedPlayerIds = Object.values(lineups).flat();
  const availablePlayers = samplePlayers.filter(p => !assignedPlayerIds.includes(p.id));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceCategory
          title="Top Performers"
          categoryKey="top-performers"
          icon={<Trophy className="h-5 w-5" />}
          color="text-amber-600"
          gradient="bg-gradient-to-br from-amber-400 to-yellow-500"
          description="Players with exceptional recent performance"
        />
        <PerformanceCategory
          title="Rising Stars"
          categoryKey="rising-stars"
          icon={<Star className="h-5 w-5" />}
          color="text-purple-600"
          gradient="bg-gradient-to-br from-purple-400 to-pink-500"
          description="Players showing significant improvement"
        />
        <PerformanceCategory
          title="Consistent Players"
          categoryKey="consistent-players"
          icon={<Heart className="h-5 w-5" />}
          color="text-green-600"
          gradient="bg-gradient-to-br from-green-400 to-emerald-500"
          description="Reliable performers week after week"
        />
        <PerformanceCategory
          title="Clutch Players"
          categoryKey="clutch-players"
          icon={<Zap className="h-5 w-5" />}
          color="text-red-600"
          gradient="bg-gradient-to-br from-red-400 to-orange-500"
          description="Players who deliver in crucial moments"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Player Pool
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
                className="cursor-move transition-all hover:scale-105 hover:-rotate-1"
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

// 6. Game Day Squad Builder
const GameDaySquad = () => {
  const [gameDay, setGameDay] = useState<Record<string, number[]>>({
    'starting-seven': [],
    'first-substitutes': [],
    'impact-players': [],
    'emergency-reserves': []
  });
  const [draggedPlayer, setDraggedPlayer] = useState<number | null>(null);

  const handleDrop = (section: string) => {
    if (draggedPlayer) {
      const newGameDay = { ...gameDay };
      Object.keys(newGameDay).forEach(sec => {
        newGameDay[sec] = newGameDay[sec].filter(id => id !== draggedPlayer);
      });
      
      const maxSizes = {
        'starting-seven': 7,
        'first-substitutes': 3,
        'impact-players': 2,
        'emergency-reserves': 1
      };
      
      if (newGameDay[section].length < maxSizes[section as keyof typeof maxSizes]) {
        newGameDay[section] = [...newGameDay[section], draggedPlayer];
      }
      
      setGameDay(newGameDay);
    }
    setDraggedPlayer(null);
  };

  const GameDaySection = ({ 
    title, 
    sectionKey, 
    icon, 
    priority, 
    maxPlayers, 
    description 
  }: { 
    title: string, 
    sectionKey: string, 
    icon: React.ReactNode, 
    priority: 'high' | 'medium' | 'low',
    maxPlayers: number,
    description: string 
  }) => {
    const priorityStyles = {
      high: 'from-emerald-600 to-teal-700 border-emerald-500',
      medium: 'from-blue-600 to-indigo-700 border-blue-500',
      low: 'from-gray-600 to-slate-700 border-gray-500'
    };

    return (
      <Card className="h-full overflow-hidden">
        <CardHeader className={`bg-gradient-to-r ${priorityStyles[priority]} text-white`}>
          <CardTitle className="flex items-center gap-2">
            {icon}
            {title}
            <Badge variant="secondary" className="bg-white/20 text-white">
              {gameDay[sectionKey].length}/{maxPlayers}
            </Badge>
          </CardTitle>
          <p className="text-sm opacity-90">{description}</p>
        </CardHeader>
        <CardContent 
          className="min-h-[250px] p-4"
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(sectionKey)}
        >
          <div className="space-y-3">
            {gameDay[sectionKey].map((playerId, index) => {
              const player = samplePlayers.find(p => p.id === playerId);
              return player ? (
                <div
                  key={playerId}
                  draggable
                  onDragStart={() => setDraggedPlayer(playerId)}
                  className="cursor-move flex items-center gap-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <Badge variant="outline" className="text-xs">
                    {index + 1}
                  </Badge>
                  <PlayerBox player={player} size="sm" showPositions={true} />
                </div>
              ) : null;
            })}
            {gameDay[sectionKey].length < maxPlayers && (
              <div className="text-center py-8 text-gray-400">
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center mx-auto mb-2">
                  <Plus className="h-6 w-6" />
                </div>
                <p className="text-sm">
                  {gameDay[sectionKey].length === 0 ? 'Drag players here' : `${maxPlayers - gameDay[sectionKey].length} more needed`}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const assignedPlayerIds = Object.values(gameDay).flat();
  const availablePlayers = samplePlayers.filter(p => !assignedPlayerIds.includes(p.id));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        <GameDaySection
          title="Starting Seven"
          sectionKey="starting-seven"
          icon={<Star className="h-5 w-5" />}
          priority="high"
          maxPlayers={7}
          description="Your best seven to start the match"
        />
        <GameDaySection
          title="First Substitutes"
          sectionKey="first-substitutes"
          icon={<ArrowUpDown className="h-5 w-5" />}
          priority="high"
          maxPlayers={3}
          description="Primary rotation players"
        />
        <GameDaySection
          title="Impact Players"
          sectionKey="impact-players"
          icon={<Zap className="h-5 w-5" />}
          priority="medium"
          maxPlayers={2}
          description="Game-changers for specific situations"
        />
        <GameDaySection
          title="Emergency Reserve"
          sectionKey="emergency-reserves"
          icon={<Shield className="h-5 w-5" />}
          priority="low"
          maxPlayers={1}
          description="Backup in case of injury"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Available Squad
            <Badge variant="outline">{availablePlayers.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {availablePlayers.map(player => (
              <div
                key={player.id}
                draggable
                onDragStart={() => setDraggedPlayer(player.id)}
                className="cursor-move transition-all hover:scale-105 hover:shadow-md"
              >
                <PlayerBox player={player} size="sm" showPositions={true} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg text-indigo-900">Squad Status</h3>
              <p className="text-indigo-700">
                Total selected: {assignedPlayerIds.length}/13 • 
                Starting positions: {gameDay['starting-seven'].length}/7 •
                Bench strength: {gameDay['first-substitutes'].length + gameDay['impact-players'].length + gameDay['emergency-reserves'].length}/6
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Squad
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Shuffle className="h-4 w-4" />
                Auto-Fill
              </Button>
            </div>
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
      title="Creative Drag & Drop Examples"
      subtitle="Six beautiful and functional drag and drop interfaces using PlayerBox components"
      breadcrumbs={breadcrumbs}
    >
      <Helmet>
        <title>Creative Drag & Drop Examples | Team Manager</title>
      </Helmet>

      <div className="space-y-8">
        <Tabs defaultValue="glass-court" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="glass-court">Glass Court</TabsTrigger>
            <TabsTrigger value="team-builder">Team Builder</TabsTrigger>
            <TabsTrigger value="rotation">Rotations</TabsTrigger>
            <TabsTrigger value="strategy">Strategy</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="gameday">Game Day</TabsTrigger>
          </TabsList>

          <TabsContent value="glass-court" className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Glass Morphism Court Visualization</h3>
              <p className="text-gray-600 mb-4">
                A beautiful court layout with glass morphism effects, animated drops, and position-based color coding.
              </p>
              <GlassMorphismCourt />
            </div>
          </TabsContent>

          <TabsContent value="team-builder" className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Advanced Team Builder</h3>
              <p className="text-gray-600 mb-4">
                Organize players into specialized roles: starters, substitutes, leadership group, and specialists.
              </p>
              <TeamBuilderInterface />
            </div>
          </TabsContent>

          <TabsContent value="rotation" className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Rotation Planner with Timing</h3>
              <p className="text-gray-600 mb-4">
                Plan strategic player rotations throughout the match with specific timing and in/out tracking.
              </p>
              <RotationPlanner />
            </div>
          </TabsContent>

          <TabsContent value="strategy" className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Match Strategy Board</h3>
              <p className="text-gray-600 mb-4">
                Create different tactical formations for various game situations: attacking, defensive, neutral, and power plays.
              </p>
              <StrategyBoard />
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Performance-Based Lineup</h3>
              <p className="text-gray-600 mb-4">
                Categorize players based on their performance metrics: top performers, rising stars, consistent players, and clutch performers.
              </p>
              <PerformanceLineup />
            </div>
          </TabsContent>

          <TabsContent value="gameday" className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Game Day Squad Builder</h3>
              <p className="text-gray-600 mb-4">
                Build your complete game day squad with prioritized sections and squad status tracking.
              </p>
              <GameDaySquad />
            </div>
          </TabsContent>
        </Tabs>

        {/* Feature Showcase */}
        <Card>
          <CardHeader>
            <CardTitle>Interface Features & Design Elements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-blue-600">Visual Design</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Glass morphism effects with backdrop blur</li>
                  <li>• Gradient backgrounds and color coding</li>
                  <li>• Smooth animations and hover effects</li>
                  <li>• Professional card layouts</li>
                  <li>• Responsive grid systems</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-green-600">Interaction Features</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Drag and drop with visual feedback</li>
                  <li>• Drop zone highlighting</li>
                  <li>• Automatic conflict resolution</li>
                  <li>• Player limits and validation</li>
                  <li>• Context-aware drop zones</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-purple-600">Functionality</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Multiple organizational systems</li>
                  <li>• Role and performance categorization</li>
                  <li>• Time-based rotation planning</li>
                  <li>• Strategic formation building</li>
                  <li>• Complete squad management</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
}
