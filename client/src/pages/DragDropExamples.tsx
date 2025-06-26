import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PlayerBox from '@/components/ui/player-box';
import { 
  Users, RotateCcw, Plus, Shuffle, Copy, Target, Grid3X3, Clock,
  ArrowUpDown, Save, Trash2, MoreHorizontal, Move3D, Crown, Trophy,
  Zap, Star, Heart, Shield, Flame, Sparkles
} from 'lucide-react';
import { cn } from "@/lib/utils";

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



// 1. Classic Court Layout
const ClassicCourtLayout = () => {
  const [currentQuarter, setCurrentQuarter] = useState(1);
  const [assignments, setAssignments] = useState<Record<number, Record<string, number | null>>>({
    1: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null },
    2: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null },
    3: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null },
    4: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null }
  });
  const [draggedPlayer, setDraggedPlayer] = useState<number | null>(null);

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
      attack: 'border-red-200 bg-red-50',
      mid: 'border-blue-200 bg-blue-50',
      defense: 'border-green-200 bg-green-50'
    };

    return (
      <div 
        className={cn(
          "border-2 border-dashed rounded-lg p-4 min-h-[120px] flex flex-col items-center justify-center",
          sectionColors[courtSection],
          "hover:border-solid transition-all duration-200"
        )}
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => handleDrop(position)}
      >
        <div className="text-sm font-semibold mb-2">{position}</div>
        {player ? (
          <div 
            className="cursor-move"
            draggable
            onDragStart={() => setDraggedPlayer(player.id)}
          >
            <PlayerBox 
              player={player} 
              size="sm" 
              showPositions={true}
              className="transition-all duration-200 hover:shadow-md"
            />
          </div>
        ) : (
          <div className="text-center">
            <Plus className="h-8 w-8 text-gray-400 mb-1" />
            <p className="text-xs text-gray-500">Drop here</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Quarter Controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Quarter {currentQuarter}
            </CardTitle>
            <div className="flex gap-2">
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
          </div>
        </CardHeader>
      </Card>

      {/* Court Layout */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="text-center font-bold text-red-700">Attack</h3>
              <PositionSlot position="GS" courtSection="attack" />
              <PositionSlot position="GA" courtSection="attack" />
            </div>

            <div className="space-y-4">
              <h3 className="text-center font-bold text-blue-700">Midcourt</h3>
              <PositionSlot position="WA" courtSection="mid" />
              <PositionSlot position="C" courtSection="mid" />
              <PositionSlot position="WD" courtSection="mid" />
            </div>

            <div className="space-y-4">
              <h3 className="text-center font-bold text-green-700">Defense</h3>
              <PositionSlot position="GD" courtSection="defense" />
              <PositionSlot position="GK" courtSection="defense" />
            </div>
          </div>
        </CardContent>
      </Card>

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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {availablePlayers.map(player => (
              <div 
                key={player.id}
                className="cursor-move"
                draggable
                onDragStart={() => setDraggedPlayer(player.id)}
              >
                <PlayerBox 
                  player={player} 
                  showPositions={true}
                  size="sm"
                  className="transition-all duration-200 hover:shadow-md"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// 2. List-based Roster Manager
const ListBasedRoster = () => {
  const [currentQuarter, setCurrentQuarter] = useState(1);
  const [teams, setTeams] = useState<Record<number, Record<string, number[]>>>({
    1: { starters: [], substitutes: [], captains: [] },
    2: { starters: [], substitutes: [], captains: [] },
    3: { starters: [], substitutes: [], captains: [] },
    4: { starters: [], substitutes: [], captains: [] }
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

  const TeamSection = ({ title, teamType, icon, maxPlayers, color }: { 
    title: string, 
    teamType: string, 
    icon: React.ReactNode, 
    maxPlayers: number, 
    color: string 
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
      </CardHeader>
      <CardContent 
        className="min-h-[200px] p-4"
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => handleDrop(teamType)}
      >
        <div className="space-y-2">
          {teams[currentQuarter][teamType].map(playerId => {
            const player = samplePlayers.find(p => p.id === playerId);
            return player ? (
              <div 
                key={playerId}
                className="cursor-move"
                draggable
                onDragStart={() => setDraggedPlayer(playerId)}
              >
                <PlayerBox
                  player={player}
                  showPositions={true}
                  size="sm"
                  className="transition-all duration-200 hover:shadow-md"
                />
              </div>
            ) : null;
          })}
          {teams[currentQuarter][teamType].length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <Plus className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Drag players here</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Quarter Controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Quarter {currentQuarter} Team Builder
            </CardTitle>
            <div className="flex gap-2">
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
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TeamSection
          title="Starting Seven"
          teamType="starters"
          icon={<Star className="h-5 w-5" />}
          maxPlayers={7}
          color="bg-gradient-to-r from-purple-600 to-purple-700"
        />
        <TeamSection
          title="Substitutes"
          teamType="substitutes"
          icon={<ArrowUpDown className="h-5 w-5" />}
          maxPlayers={4}
          color="bg-gradient-to-r from-blue-600 to-blue-700"
        />
        <TeamSection
          title="Leadership"
          teamType="captains"
          icon={<Crown className="h-5 w-5" />}
          maxPlayers={3}
          color="bg-gradient-to-r from-amber-600 to-amber-700"
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {availablePlayers.map(player => (
              <div 
                key={player.id}
                className="cursor-move"
                draggable
                onDragStart={() => setDraggedPlayer(player.id)}
              >
                <PlayerBox
                  player={player}
                  showPositions={true}
                  size="sm"
                  className="transition-all duration-200 hover:shadow-md"
                />
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
      title="Drag & Drop Examples"
      subtitle="Interactive drag and drop interfaces for roster management"
      breadcrumbs={breadcrumbs}
    >
      <Helmet>
        <title>Drag & Drop Examples | Team Manager</title>
      </Helmet>

      <div className="space-y-8">
        <Tabs defaultValue="classic-court" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="classic-court">Classic Court</TabsTrigger>
            <TabsTrigger value="team-builder">Team Builder</TabsTrigger>
          </TabsList>

          <TabsContent value="classic-court" className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Classic Court Layout</h3>
              <p className="text-gray-600 mb-4">
                Traditional netball court with position-based drag and drop functionality.
              </p>
              <ClassicCourtLayout />
            </div>
          </TabsContent>

          <TabsContent value="team-builder" className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Team Builder Interface</h3>
              <p className="text-gray-600 mb-4">
                Organize players into different team categories with role-based management.
              </p>
              <ListBasedRoster />
            </div>
          </TabsContent>
        </Tabs>

        {/* Feature Showcase */}
        <Card>
          <CardHeader>
            <CardTitle>Key Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-2 text-blue-600">Quarter Management</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Full 4-quarter support</li>
                  <li>• Independent lineups per quarter</li>
                  <li>• Quick quarter switching</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-green-600">Drag & Drop</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Smooth player movement</li>
                  <li>• Visual drop zones</li>
                  <li>• Position validation</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-purple-600">Player Cards</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Avatar with initials</li>
                  <li>• Position preferences</li>
                  <li>• Hover effects</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
}