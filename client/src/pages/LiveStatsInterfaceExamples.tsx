import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Minus, 
  Save, 
  Undo, 
  Redo, 
  Trophy,
  Target,
  Shield,
  Activity,
  Users,
  Timer,
  RotateCcw,
  Check,
  X
} from 'lucide-react';

// Mock data for demonstration
const mockPlayers = [
  { id: 1, name: "Abbey N", position: "GS", avatar: "AN" },
  { id: 2, name: "Emily L", position: "GA", avatar: "EL" },
  { id: 3, name: "Ava D", position: "WA", avatar: "AD" },
  { id: 4, name: "Erin H", position: "C", avatar: "EH" },
  { id: 5, name: "Evie N", position: "WD", avatar: "EN" },
  { id: 6, name: "Olivia W", position: "GD", avatar: "OW" },
  { id: 7, name: "Ruby G", position: "GK", avatar: "RG" },
];

const statTypes = [
  { key: 'goalsFor', label: 'Goals', icon: Target, color: 'bg-green-100 text-green-700', touch: true },
  { key: 'missedGoals', label: 'Misses', icon: X, color: 'bg-orange-100 text-orange-700', touch: true },
  { key: 'goalsAgainst', label: 'Against', icon: Shield, color: 'bg-red-100 text-red-700', touch: true },
  { key: 'intercepts', label: 'Intercepts', icon: Activity, color: 'bg-blue-100 text-blue-700', touch: true },
  { key: 'rebounds', label: 'Rebounds', icon: RotateCcw, color: 'bg-purple-100 text-purple-700', touch: true },
  { key: 'badPass', label: 'Bad Pass', icon: X, color: 'bg-amber-100 text-amber-700', touch: false },
  { key: 'handlingError', label: 'Handling', icon: X, color: 'bg-pink-100 text-pink-700', touch: false },
  { key: 'pickUp', label: 'Pick Up', icon: Check, color: 'bg-teal-100 text-teal-700', touch: false },
  { key: 'infringement', label: 'Infringement', icon: X, color: 'bg-rose-100 text-rose-700', touch: false },
];

// Design 1: Card-Based Touch Interface
const CardBasedInterface = () => {
  const [stats, setStats] = useState({});
  const [currentQuarter, setCurrentQuarter] = useState(1);
  const [gameScore, setGameScore] = useState({ home: 0, away: 0 });

  const updateStat = (playerId, statType, change) => {
    setStats(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [statType]: Math.max(0, (prev[playerId]?.[statType] || 0) + change)
      }
    }));
  };

  const StatButton = ({ stat, value, onUpdate, size = "normal" }) => {
    const StatIcon = stat.icon;
    const isLarge = size === "large";

    return (
      <div className={`flex flex-col items-center p-3 rounded-lg border ${stat.color} ${isLarge ? 'min-h-[100px]' : 'min-h-[80px]'}`}>
        <div className="flex items-center gap-2 mb-2">
          <StatIcon className={`${isLarge ? 'h-5 w-5' : 'h-4 w-4'}`} />
          <span className={`font-medium ${isLarge ? 'text-base' : 'text-sm'}`}>{stat.label}</span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size={isLarge ? "default" : "sm"}
            className={`${isLarge ? 'h-10 w-10' : 'h-8 w-8'} p-0 touch-manipulation`}
            onClick={() => onUpdate(-1)}
            disabled={value <= 0}
          >
            <Minus className={`${isLarge ? 'h-5 w-5' : 'h-4 w-4'}`} />
          </Button>

          <span className={`${isLarge ? 'text-2xl' : 'text-xl'} font-bold min-w-[40px] text-center`}>
            {value || 0}
          </span>

          <Button
            variant="outline"
            size={isLarge ? "default" : "sm"}
            className={`${isLarge ? 'h-10 w-10' : 'h-8 w-8'} p-0 ${stat.color} border-2 touch-manipulation`}
            onClick={() => onUpdate(1)}
          >
            <Plus className={`${isLarge ? 'h-5 w-5' : 'h-4 w-4'}`} />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Live Game Stats</CardTitle>
              <p className="text-muted-foreground">Round 5 vs Emeralds</p>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(quarter => (
                <Button
                  key={quarter}
                  variant={quarter === currentQuarter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentQuarter(quarter)}
                  className="w-12 h-10 touch-manipulation"
                >
                  Q{quarter}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Our Team</p>
              <p className="text-3xl font-bold">{gameScore.home}</p>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-2xl font-bold">-</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Emeralds</p>
              <p className="text-3xl font-bold">{gameScore.away}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Player Cards */}
      <div className="grid grid-cols-1 gap-4">
        {mockPlayers.map(player => (
          <Card key={player.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 bg-blue-500 text-white">
                  <AvatarFallback>{player.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{player.name}</h3>
                  <Badge variant="outline">{player.position}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Primary Stats (Larger, Touch-Optimized) */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {statTypes.filter(s => s.touch).slice(0, 3).map(stat => (
                  <StatButton
                    key={stat.key}
                    stat={stat}
                    value={stats[player.id]?.[stat.key]}
                    onUpdate={(change) => updateStat(player.id, stat.key, change)}
                    size="large"
                  />
                ))}
              </div>

              {/* Secondary Stats (Smaller) */}
              <div className="grid grid-cols-4 gap-2">
                {statTypes.filter(s => !s.touch).map(stat => (
                  <StatButton
                    key={stat.key}
                    stat={stat}
                    value={stats[player.id]?.[stat.key]}
                    onUpdate={(change) => updateStat(player.id, stat.key, change)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Bar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button variant="outline" size="lg" className="touch-manipulation">
                <Undo className="h-5 w-5 mr-2" />
                Undo
              </Button>
              <Button variant="outline" size="lg" className="touch-manipulation">
                <Redo className="h-5 w-5 mr-2" />
                Redo
              </Button>
            </div>
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white touch-manipulation">
              <Save className="h-5 w-5 mr-2" />
              Save All Stats
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Design 2: Court-Based Layout
const CourtBasedInterface = () => {
  const [stats, setStats] = useState({});
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [currentQuarter, setCurrentQuarter] = useState(1);

  const courtSections = {
    attack: mockPlayers.slice(0, 2),
    center: mockPlayers.slice(2, 5),
    defense: mockPlayers.slice(5, 7)
  };

  const updateStat = (playerId, statType, change) => {
    setStats(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [statType]: Math.max(0, (prev[playerId]?.[statType] || 0) + change)
      }
    }));
  };

  const PlayerPosition = ({ player, section }) => {
    const isSelected = selectedPlayer === player.id;
    const sectionColors = {
      attack: 'bg-red-50 border-red-200',
      center: 'bg-yellow-50 border-yellow-200',
      defense: 'bg-blue-50 border-blue-200'
    };

    return (
      <div
        className={`p-4 rounded-lg border-2 cursor-pointer transition-all touch-manipulation ${sectionColors[section]} ${isSelected ? 'ring-2 ring-blue-500 scale-105' : 'hover:scale-102'}`}
        onClick={() => setSelectedPlayer(player.id)}
      >
        <div className="text-center">
          <Avatar className="h-16 w-16 mx-auto mb-2 bg-blue-500 text-white">
            <AvatarFallback className="text-lg">{player.avatar}</AvatarFallback>
          </Avatar>
          <h3 className="font-semibold text-sm">{player.name}</h3>
          <Badge variant="outline" className="text-xs mt-1">{player.position}</Badge>

          {/* Quick Stats Display */}
          <div className="flex justify-center gap-1 mt-2 text-xs">
            <span className="bg-green-100 px-2 py-1 rounded">
              G: {stats[player.id]?.goalsFor || 0}
            </span>
            <span className="bg-blue-100 px-2 py-1 rounded">
              I: {stats[player.id]?.intercepts || 0}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Quarter Selector */}
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4].map(quarter => (
          <Button
            key={quarter}
            variant={quarter === currentQuarter ? "default" : "outline"}
            size="lg"
            onClick={() => setCurrentQuarter(quarter)}
            className="w-16 h-12 touch-manipulation"
          >
            Q{quarter}
          </Button>
        ))}
      </div>

      {/* Court Layout */}
      <div className="grid grid-cols-1 gap-6">
        {/* Attack Third */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-center text-red-600">Attack Third</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {courtSections.attack.map(player => (
                <PlayerPosition key={player.id} player={player} section="attack" />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Center Third */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-center text-yellow-600">Center Third</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {courtSections.center.map(player => (
                <PlayerPosition key={player.id} player={player} section="center" />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Defense Third */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-center text-blue-600">Defense Third</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {courtSections.defense.map(player => (
                <PlayerPosition key={player.id} player={player} section="defense" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Input Panel */}
      {selectedPlayer && (
        <Card>
          <CardHeader>
            <CardTitle>
              Stats for {mockPlayers.find(p => p.id === selectedPlayer)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {statTypes.map(stat => {
                const StatIcon = stat.icon;
                const value = stats[selectedPlayer]?.[stat.key] || 0;

                return (
                  <div key={stat.key} className={`p-4 rounded-lg ${stat.color}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <StatIcon className="h-5 w-5" />
                        <span className="font-medium">{stat.label}</span>
                      </div>
                      <span className="text-2xl font-bold">{value}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 touch-manipulation"
                        onClick={() => updateStat(selectedPlayer, stat.key, -1)}
                        disabled={value <= 0}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 touch-manipulation"
                        onClick={() => updateStat(selectedPlayer, stat.key, 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Design 3: Gesture-Based Quick Entry
const GestureBasedInterface = () => {
  const [stats, setStats] = useState({});
  const [recentActions, setRecentActions] = useState([]);
  const [currentQuarter, setCurrentQuarter] = useState(1);

  const updateStat = (playerId, statType, change) => {
    setStats(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [statType]: Math.max(0, (prev[playerId]?.[statType] || 0) + change)
      }
    }));

    // Track for undo
    setRecentActions(prev => [...prev.slice(-9), { playerId, statType, change, timestamp: Date.now() }]);
  };

  const QuickStatButton = ({ player, stat, primary = false }) => {
    const StatIcon = stat.icon;
    const value = stats[player.id]?.[stat.key] || 0;
    const size = primary ? 'h-20 w-20' : 'h-16 w-16';

    return (
      <Button
        variant="outline"
        className={`${size} ${stat.color} border-2 touch-manipulation flex flex-col gap-1 relative`}
        onClick={() => updateStat(player.id, stat.key, 1)}
      >
        <StatIcon className={primary ? 'h-6 w-6' : 'h-5 w-5'} />
        <span className="text-xs font-medium">{stat.label}</span>
        {value > 0 && (
          <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center">
            {value}
          </Badge>
        )}
      </Button>
    );
  };

  return (
    <div className="space-y-6">
      {/* Game Header with Live Score */}
      <Card>
        <CardContent className="py-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center gap-4">
              {[1, 2, 3, 4].map(quarter => (
                <Button
                  key={quarter}
                  variant={quarter === currentQuarter ? "default" : "outline"}
                  size="lg"
                  onClick={() => setCurrentQuarter(quarter)}
                  className="w-14 h-14 rounded-full touch-manipulation"
                >
                  {quarter}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4 items-center">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">WNC Dingoes</p>
                <p className="text-4xl font-bold">24</p>
              </div>
              <div className="text-center">
                <Timer className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-lg font-medium">Q{currentQuarter}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Emeralds</p>
                <p className="text-4xl font-bold">18</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Players with Quick Actions */}
      <div className="grid grid-cols-1 gap-4">
        {mockPlayers.map(player => (
          <Card key={player.id}>
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                {/* Player Info */}
                <div className="flex items-center gap-3 min-w-[140px]">
                  <Avatar className="h-14 w-14 bg-blue-500 text-white">
                    <AvatarFallback className="text-lg">{player.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{player.name}</h3>
                    <Badge variant="outline" className="text-sm">{player.position}</Badge>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex-1 grid grid-cols-5 gap-3">
                  {/* Primary stats (larger buttons) */}
                  <QuickStatButton 
                    player={player} 
                    stat={statTypes.find(s => s.key === 'goalsFor')} 
                    primary 
                  />
                  <QuickStatButton 
                    player={player} 
                    stat={statTypes.find(s => s.key === 'intercepts')} 
                    primary 
                  />

                  {/* Secondary stats */}
                  <QuickStatButton 
                    player={player} 
                    stat={statTypes.find(s => s.key === 'missedGoals')} 
                  />
                  <QuickStatButton 
                    player={player} 
                    stat={statTypes.find(s => s.key === 'rebounds')} 
                  />
                  <QuickStatButton 
                    player={player} 
                    stat={statTypes.find(s => s.key === 'badPass')} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Actions & Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-4">
            {recentActions.slice(-5).reverse().map((action, index) => {
              const player = mockPlayers.find(p => p.id === action.playerId);
              const stat = statTypes.find(s => s.key === action.statType);
              return (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">
                    {player?.name} - {stat?.label} {action.change > 0 ? '+' : ''}{action.change}
                  </span>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between">
            <div className="flex gap-2">
              <Button variant="outline" size="lg" className="touch-manipulation">
                <Undo className="h-5 w-5 mr-2" />
                Undo Last
              </Button>
              <Button variant="outline" size="lg" className="touch-manipulation">
                <RotateCcw className="h-5 w-5 mr-2" />
                Reset Quarter
              </Button>
            </div>
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white touch-manipulation">
              <Save className="h-5 w-5 mr-2" />
              Save All Stats
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Design 4: Compact Dashboard Style
const CompactDashboardInterface = () => {
  const [stats, setStats] = useState({});
  const [currentQuarter, setCurrentQuarter] = useState(1);
  const [viewMode, setViewMode] = useState('summary'); // summary, detailed

  const updateStat = (playerId, statType, change) => {
    setStats(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [statType]: Math.max(0, (prev[playerId]?.[statType] || 0) + change)
      }
    }));
  };

  const getPlayerTotal = (playerId, statKey) => {
    return stats[playerId]?.[statKey] || 0;
  };

  const StatPill = ({ stat, value, onUpdate, compact = false }) => {
    const StatIcon = stat.icon;

    if (compact) {
      return (
        <div className="flex items-center gap-1">
          <StatIcon className="h-3 w-3" />
          <span className="text-xs font-medium">{value || 0}</span>
        </div>
      );
    }

    return (
      <div className={`flex items-center gap-2 p-2 rounded-md ${stat.color}`}>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => onUpdate(-1)}
          disabled={value <= 0}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <div className="flex items-center gap-1 min-w-[60px]">
          <StatIcon className="h-4 w-4" />
          <span className="font-bold">{value || 0}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => onUpdate(1)}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <Card>
        <CardContent className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold">Q{currentQuarter} Live Stats</h2>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map(quarter => (
                  <Button
                    key={quarter}
                    variant={quarter === currentQuarter ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentQuarter(quarter)}
                    className="w-8 h-8 p-0 touch-manipulation"
                  >
                    {quarter}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">26-21</p>
                <p className="text-xs text-muted-foreground">WNC Leading</p>
              </div>

              <div className="flex gap-1">
                <Button
                  variant={viewMode === 'summary' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('summary')}
                >
                  Summary
                </Button>
                <Button
                  variant={viewMode === 'detailed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('detailed')}
                >
                  Detailed
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {viewMode === 'summary' ? (
        /* Summary View - More Compact */
        <div className="grid grid-cols-1 gap-2">
          {mockPlayers.map(player => (
            <Card key={player.id}>
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 bg-blue-500 text-white">
                      <AvatarFallback>{player.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-sm">{player.name}</h3>
                      <Badge variant="outline" className="text-xs">{player.position}</Badge>
                    </div>
                  </div>

                  {/* Key stats display */}
                  <div className="flex items-center gap-4">
                    <StatPill 
                      stat={statTypes.find(s => s.key === 'goalsFor')}
                      value={getPlayerTotal(player.id, 'goalsFor')}
                      onUpdate={(change) => updateStat(player.id, 'goalsFor', change)}
                    />
                    <StatPill 
                      stat={statTypes.find(s => s.key === 'intercepts')}
                      value={getPlayerTotal(player.id, 'intercepts')}
                      onUpdate={(change) => updateStat(player.id, 'intercepts', change)}
                    />
                    <StatPill 
                      stat={statTypes.find(s => s.key === 'badPass')}
                      value={getPlayerTotal(player.id, 'badPass')}
                      onUpdate={(change) => updateStat(player.id, 'badPass', change)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Detailed View */
        <div className="grid grid-cols-1 gap-4">
          {mockPlayers.map(player => (
            <Card key={player.id}>
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 bg-blue-500 text-white">
                      <AvatarFallback>{player.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{player.name}</h3>
                      <Badge variant="outline">{player.position}</Badge>
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-4 gap-2">
                    {statTypes.slice(0, 8).map(stat => (
                      <StatPill
                        key={stat.key}
                        stat={stat}
                        value={getPlayerTotal(player.id, stat.key)}
                        onUpdate={(change) => updateStat(player.id, stat.key, change)}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Action Bar */}
      <Card>
        <CardContent className="py-3">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button variant="outline" className="touch-manipulation">
                <Undo className="h-4 w-4 mr-2" />
                Undo
              </Button>
              <Button variant="outline" className="touch-manipulation">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm">
                Last saved: 2:34 PM
              </Badge>
              <Button className="bg-green-600 hover:bg-green-700 text-white touch-manipulation">
                <Save className="h-4 w-4 mr-2" />
                Save All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default function LiveStatsInterfaceExamples() {
  const [activeDesign, setActiveDesign] = useState('card-based');

  const designs = [
    {
      id: 'card-based',
      name: 'Card-Based Touch Interface',
      description: 'Large touch-friendly cards with prominent stat buttons. Best for detailed stat entry.',
      component: CardBasedInterface
    },
    {
      id: 'court-based',
      name: 'Court Layout Interface',
      description: 'Visual court representation with player selection. Intuitive spatial organization.',
      component: CourtBasedInterface
    },
    {
      id: 'gesture-based',
      name: 'Quick Gesture Entry',
      description: 'Fast one-tap stat entry with undo tracking. Optimized for rapid game situations.',
      component: GestureBasedInterface
    },
    {
      id: 'compact-dashboard',
      name: 'Compact Dashboard',
      description: 'Information-dense layout with summary/detailed view toggle. Maximum efficiency.',
      component: CompactDashboardInterface
    }
  ];

  const currentDesign = designs.find(d => d.id === activeDesign);
  const CurrentComponent = currentDesign?.component;

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Live Stats Interface Design Examples</h1>
        <p className="text-muted-foreground mb-6">
          Multiple design approaches for live statistics entry, optimized for 12" iPad touch interfaces.
          Each design prioritizes different aspects: touch-friendliness, visual organization, speed, or information density.
        </p>

        {/* Design Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {designs.map(design => (
            <Card 
              key={design.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${activeDesign === design.id ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setActiveDesign(design.id)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{design.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{design.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Current Design Display */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{currentDesign?.name}</CardTitle>
              <p className="text-muted-foreground">{currentDesign?.description}</p>
            </div>
            <Badge variant="outline">Interactive Demo</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {CurrentComponent && <CurrentComponent />}
        </CardContent>
      </Card>

      {/* Implementation Notes */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Implementation Considerations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Touch Optimization</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Minimum 44px touch targets for accessibility</li>
              <li>• CSS `touch-manipulation` for immediate touch response</li>
              <li>• Hover states disabled on touch devices</li>
              <li>• Gesture conflicts avoided (scrolling vs. interactions)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Data Management</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Local state management until save button pressed</li>
              <li>• Undo/redo stack for error recovery</li>
              <li>• Auto-save to localStorage for network reliability</li>
              <li>• Optimistic UI updates with error handling</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Performance</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• React.memo for player components to prevent unnecessary re-renders</li>
              <li>• Debounced save operations</li>
              <li>• Efficient state updates using useCallback</li>
              <li>• Virtual scrolling for large player lists</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Minus, 
  Save,
  RotateCcw,
  Target,
  Shield,
  Activity,
  Clock,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Zap,
  Timer,
  BarChart3,
  Pause,
  Play,
  Settings,
  Maximize2,
  Grid3X3,
  List,
  Eye,
  EyeOff
} from 'lucide-react';

interface StatEntry {
  id: string;
  playerId: number;
  playerName: string;
  position: string;
  quarter: number;
  statType: string;
  value: number;
  timestamp: Date;
}

interface QuarterScore {
  quarter: number;
  homeScore: number;
  awayScore: number;
}

const mockPlayers = [
  { id: 60, name: "Abbey N", position: "GA" },
  { id: 59, name: "Abby D", position: "GS" },
  { id: 76, name: "Ava", position: "WA" },
  { id: 61, name: "Emily", position: "GD" },
  { id: 81, name: "Erin", position: "C" },
  { id: 63, name: "Evie", position: "WD" },
  { id: 62, name: "Grace", position: "GK" }
];

const positions = ["GS", "GA", "WA", "C", "WD", "GD", "GK"];
const statTypes = ["goalsFor", "missedGoals", "rebounds", "intercepts", "badPass", "handlingError"];

export default function LiveStatsInterfaceExamples() {
  const [currentQuarter, setCurrentQuarter] = useState(1);
  const [gameTime, setGameTime] = useState("12:00");
  const [isGameActive, setIsGameActive] = useState(false);
  const [stats, setStats] = useState<StatEntry[]>([]);
  const [scores, setScores] = useState<QuarterScore[]>([
    { quarter: 1, homeScore: 0, awayScore: 0 },
    { quarter: 2, homeScore: 0, awayScore: 0 },
    { quarter: 3, homeScore: 0, awayScore: 0 },
    { quarter: 4, homeScore: 0, awayScore: 0 }
  ]);
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [showAdvancedStats, setShowAdvancedStats] = useState(false);

  const addStat = (playerId: number, playerName: string, position: string, statType: string, value: number = 1) => {
    const newStat: StatEntry = {
      id: `${Date.now()}-${Math.random()}`,
      playerId,
      playerName,
      position,
      quarter: currentQuarter,
      statType,
      value,
      timestamp: new Date()
    };
    setStats(prev => [...prev, newStat]);
  };

  const updateScore = (team: 'home' | 'away', delta: number) => {
    setScores(prev => prev.map(score => 
      score.quarter === currentQuarter
        ? { ...score, [team === 'home' ? 'homeScore' : 'awayScore']: Math.max(0, score[team === 'home' ? 'homeScore' : 'awayScore'] + delta) }
        : score
    ));
  };

  const getCurrentScore = () => {
    const currentQuarterScore = scores.find(s => s.quarter === currentQuarter);
    return {
      home: currentQuarterScore?.homeScore || 0,
      away: currentQuarterScore?.awayScore || 0
    };
  };

  const getTotalScore = () => {
    return scores.reduce((totals, score) => ({
      home: totals.home + score.homeScore,
      away: totals.away + score.awayScore
    }), { home: 0, away: 0 });
  };

  const getPlayerStats = (playerId: number, statType: string) => {
    return stats
      .filter(s => s.playerId === playerId && s.statType === statType && s.quarter === currentQuarter)
      .reduce((sum, stat) => sum + stat.value, 0);
  };

  // Design 1: Grid-Based Touch Interface
  const GridBasedInterface = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-900">{getTotalScore().home}</div>
            <div className="text-lg font-medium text-blue-700">WNC Dingoes</div>
          </div>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-900">{getTotalScore().away}</div>
            <div className="text-lg font-medium text-red-700">Opponents</div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        {[1, 2, 3, 4].map(quarter => (
          <Button
            key={quarter}
            variant={currentQuarter === quarter ? "default" : "outline"}
            className="h-12 text-lg font-semibold"
            onClick={() => setCurrentQuarter(quarter)}
          >
            Q{quarter}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {positions.map(position => {
          const player = mockPlayers.find(p => p.position === position);
          return (
            <Card key={position} className="p-3">
              <div className="text-center mb-2">
                <Badge variant="outline" className="text-xs">{position}</Badge>
                <div className="font-medium text-sm mt-1">{player?.name || "Empty"}</div>
              </div>
              <div className="space-y-1">
                <Button
                  size="sm"
                  className="w-full h-8 bg-green-500 hover:bg-green-600 text-white"
                  onClick={() => player && addStat(player.id, player.name, position, "goalsFor")}
                >
                  <Target className="w-4 h-4 mr-1" />
                  {player ? getPlayerStats(player.id, "goalsFor") : 0}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full h-8"
                  onClick={() => player && addStat(player.id, player.name, position, "intercepts")}
                >
                  <Shield className="w-4 h-4 mr-1" />
                  {player ? getPlayerStats(player.id, "intercepts") : 0}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );

  // Design 2: Streamlined Touch Interface
  const StreamlinedInterface = () => (
    <div className="space-y-6">
      {/* Score Section */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600">{getTotalScore().home}</div>
            <div className="text-lg font-medium">Home</div>
          </div>
          <div className="text-center">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Q{currentQuarter} • {gameTime}
            </Badge>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-red-600">{getTotalScore().away}</div>
            <div className="text-lg font-medium">Away</div>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => updateScore('home', 1)}
            className="h-16 w-20 bg-blue-500 hover:bg-blue-600"
          >
            <Plus className="w-6 h-6" />
          </Button>
          <Button
            size="lg"
            onClick={() => updateScore('away', 1)}
            className="h-16 w-20 bg-red-500 hover:bg-red-600"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>
      </Card>

      {/* Player Selection */}
      <Card className="p-6">
        <CardTitle className="mb-4">Select Player</CardTitle>
        <div className="grid grid-cols-3 gap-3">
          {mockPlayers.map(player => (
            <Button
              key={player.id}
              variant={selectedPlayer === player.id ? "default" : "outline"}
              className="h-16 flex flex-col items-center justify-center"
              onClick={() => setSelectedPlayer(player.id)}
            >
              <div className="font-medium">{player.name}</div>
              <Badge variant="secondary" className="text-xs">{player.position}</Badge>
            </Button>
          ))}
        </div>
      </Card>

      {/* Quick Stats */}
      {selectedPlayer && (
        <Card className="p-6">
          <CardTitle className="mb-4">Quick Stats</CardTitle>
          <div className="grid grid-cols-3 gap-3">
            {statTypes.map(statType => {
              const selectedPlayerData = mockPlayers.find(p => p.id === selectedPlayer);
              return (
                <Button
                  key={statType}
                  size="lg"
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={() => selectedPlayerData && addStat(selectedPlayer, selectedPlayerData.name, selectedPlayerData.position, statType)}
                >
                  <div className="text-2xl font-bold">
                    {getPlayerStats(selectedPlayer, statType)}
                  </div>
                  <div className="text-xs capitalize">
                    {statType.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                </Button>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );

  // Design 3: Court View Interface
  const CourtViewInterface = () => (
    <div className="space-y-6">
      {/* Game Status Bar */}
      <Card className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant={isGameActive ? "destructive" : "default"}
              size="lg"
              onClick={() => setIsGameActive(!isGameActive)}
            >
              {isGameActive ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
              {isGameActive ? "Pause" : "Start"}
            </Button>
            <div className="text-2xl font-mono font-bold">{gameTime}</div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{getTotalScore().home}</div>
              <div className="text-sm font-medium">WNC Dingoes</div>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">Q{currentQuarter}</Badge>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{getTotalScore().away}</div>
              <div className="text-sm font-medium">Opponents</div>
            </div>
          </div>

          <Button variant="outline" size="lg">
            <Save className="w-5 h-5 mr-2" />
            Save All
          </Button>
        </div>
      </Card>

      {/* Court Layout */}
      <Card className="p-6">
        <div className="relative bg-gradient-to-b from-green-100 to-green-200 rounded-lg p-8" style={{ aspectRatio: '3/2' }}>
          {/* Court Lines */}
          <div className="absolute inset-4 border-2 border-white rounded"></div>
          <div className="absolute left-4 right-4 top-1/3 border-t-2 border-white"></div>
          <div className="absolute left-4 right-4 bottom-1/3 border-t-2 border-white"></div>

          {/* Goal Circles */}
          <div className="absolute left-4 top-4 w-16 h-16 border-2 border-white rounded-full flex items-center justify-center">
            <Target className="w-8 h-8 text-white" />
          </div>
          <div className="absolute right-4 bottom-4 w-16 h-16 border-2 border-white rounded-full flex items-center justify-center">
            <Target className="w-8 h-8 text-white" />
          </div>

          {/* Player Positions */}
          {positions.map((position, index) => {
            const player = mockPlayers.find(p => p.position === position);
            const xPositions = [10, 25, 40, 50, 60, 75, 90];
            const yPosition = 40;

            return (
              <div
                key={position}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                style={{ 
                  left: `${xPositions[index]}%`, 
                  top: `${yPosition}%` 
                }}
                onClick={() => player && setSelectedPlayer(player.id)}
              >
                <div className={`w-20 h-20 rounded-full border-3 flex flex-col items-center justify-center text-white font-bold ${
                  selectedPlayer === player?.id ? 'bg-blue-600 border-blue-800' : 'bg-gray-600 border-gray-800'
                }`}>
                  <div className="text-xs">{position}</div>
                  <div className="text-xs truncate w-full text-center">{player?.name || "Empty"}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Selected Player Stats Panel */}
      {selectedPlayer && (
        <Card className="p-6">
          <CardTitle className="mb-4">
            {mockPlayers.find(p => p.id === selectedPlayer)?.name} Stats - Q{currentQuarter}
          </CardTitle>
          <div className="grid grid-cols-6 gap-3">
            {statTypes.map(statType => (
              <div key={statType} className="text-center">
                <div className="text-xs mb-2 capitalize">
                  {statType.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-8 h-8 p-0"
                    onClick={() => {
                      const currentValue = getPlayerStats(selectedPlayer, statType);
                      if (currentValue > 0) {
                        const lastStat = [...stats].reverse().find(
                          s => s.playerId === selectedPlayer && s.statType === statType && s.quarter === currentQuarter
                        );
                        if (lastStat) {
                          setStats(prev => prev.filter(s => s.id !== lastStat.id));
                        }
                      }
                    }}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <div className="text-2xl font-bold w-8 text-center">
                    {getPlayerStats(selectedPlayer, statType)}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-8 h-8 p-0"
                    onClick={() => {
                      const selectedPlayerData = mockPlayers.find(p => p.id === selectedPlayer);
                      selectedPlayerData && addStat(selectedPlayer, selectedPlayerData.name, selectedPlayerData.position, statType);
                    }}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );

  // Design 4: Split Screen Interface
  const SplitScreenInterface = () => (
    <div className="grid grid-cols-2 gap-6 h-screen">
      {/* Left Panel - Game Control */}
      <div className="space-y-4">
        <Card className="p-6">
          <div className="text-center mb-4">
            <div className="text-6xl font-bold text-blue-600 mb-2">{getTotalScore().home}</div>
            <div className="text-lg font-medium">WNC Dingoes</div>
            <div className="text-6xl font-bold text-red-600 mt-4 mb-2">{getTotalScore().away}</div>
            <div className="text-lg font-medium">Opponents</div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <Button
              size="lg"
              className="h-20 bg-blue-500 hover:bg-blue-600"
              onClick={() => updateScore('home', 1)}
            >
              <Plus className="w-8 h-8" />
            </Button>
            <Button
              size="lg"
              className="h-20 bg-red-500 hover:bg-red-600"
              onClick={() => updateScore('away', 1)}
            >
              <Plus className="w-8 h-8" />
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="text-3xl font-mono font-bold">{gameTime}</div>
            <Badge variant="secondary" className="text-xl px-4 py-2">Q{currentQuarter}</Badge>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map(quarter => (
              <Button
                key={quarter}
                variant={currentQuarter === quarter ? "default" : "outline"}
                className="h-12"
                onClick={() => setCurrentQuarter(quarter)}
              >
                Q{quarter}
              </Button>
            ))}
          </div>
        </Card>

        <Card className="p-6 flex-1">
          <CardTitle className="mb-4">Recent Actions</CardTitle>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {stats.slice(-10).reverse().map(stat => (
              <div key={stat.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div className="text-sm">
                  <span className="font-medium">{stat.playerName}</span> - {stat.statType}
                </div>
                <Badge variant="outline">Q{stat.quarter}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Right Panel - Player Stats */}
      <div className="space-y-4">
        <Card className="p-6">
          <CardTitle className="mb-4">Player Selection</CardTitle>
          <div className="grid grid-cols-2 gap-3">
            {mockPlayers.map(player => (
              <Button
                key={player.id}
                variant={selectedPlayer === player.id ? "default" : "outline"}
                className="h-20 flex flex-col items-center justify-center"
                onClick={() => setSelectedPlayer(player.id)}
              >
                <div className="font-medium">{player.name}</div>
                <Badge variant="secondary">{player.position}</Badge>
              </Button>
            ))}
          </div>
        </Card>

        {selectedPlayer && (
          <Card className="p-6 flex-1">
            <CardTitle className="mb-4">
              {mockPlayers.find(p => p.id === selectedPlayer)?.name} - Quarter {currentQuarter}
            </CardTitle>
            <div className="grid grid-cols-2 gap-4">
              {statTypes.map(statType => (
                <div key={statType} className="text-center">
                  <div className="text-sm mb-2 capitalize font-medium">
                    {statType.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div className="text-4xl font-bold mb-3">
                    {getPlayerStats(selectedPlayer, statType)}
                  </div>
                  <Button
                    size="lg"
                    className="w-full h-12"
                    onClick={() => {
                      const selectedPlayerData = mockPlayers.find(p => p.id === selectedPlayer);
                      selectedPlayerData && addStat(selectedPlayer, selectedPlayerData.name, selectedPlayerData.position, statType);
                    }}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );

  return (
    <PageTemplate
      title="Live Stats Interface Examples"
      subtitle="Touch-optimized interfaces for recording live game statistics on tablets"
      breadcrumbs={[
        { label: 'Component Examples', href: '/component-examples' },
        { label: 'Live Stats Interface Examples' }
      ]}
    >
      <Helmet>
        <title>Live Stats Interface Examples | Team Manager</title>
      </Helmet>

      <div className="space-y-8">
        <div className="prose max-w-none">
          <p className="text-lg text-gray-700">
            Multiple design approaches for live statistics recording, optimized for 12" iPad touch interfaces. 
            Each design prioritizes different aspects: speed, accuracy, visual feedback, and user workflow.
            All interfaces support real-time updates with local state management before saving.
          </p>
        </div>

        {/* Design Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Grid3X3 className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold">Grid-Based</h3>
            </div>
            <p className="text-sm text-gray-600">Compact layout with all positions visible simultaneously</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold">Streamlined</h3>
            </div>
            <p className="text-sm text-gray-600">Step-by-step workflow for accurate data entry</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Eye className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold">Court View</h3>
            </div>
            <p className="text-sm text-gray-600">Visual court representation with position-based interaction</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="h-5 w-5 text-orange-600" />
              <h3 className="font-semibold">Split Screen</h3>
            </div>
            <p className="text-sm text-gray-600">Dual-panel layout for scoring and detailed statistics</p>
          </Card>
        </div>

        <Tabs defaultValue="grid" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="grid">Grid-Based</TabsTrigger>
            <TabsTrigger value="streamlined">Streamlined</TabsTrigger>
            <TabsTrigger value="court">Court View</TabsTrigger>
            <TabsTrigger value="split">Split Screen</TabsTrigger>
          </TabsList>

          <TabsContent value="grid" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Grid-Based Touch Interface</CardTitle>
                <p className="text-gray-600">
                  Compact design showing all court positions in a grid layout. Quick access to common stats 
                  with large touch targets. Ideal for users who want to see the full team at once.
                </p>
              </CardHeader>
              <CardContent>
                <GridBasedInterface />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="streamlined" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Streamlined Touch Interface</CardTitle>
                <p className="text-gray-600">
                  Step-by-step workflow that guides users through player selection and stat recording. 
                  Reduces errors by breaking the process into clear steps with large, accessible buttons.
                </p>
              </CardHeader>
              <CardContent>
                <StreamlinedInterface />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="court" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Court View Interface</CardTitle>
                <p className="text-gray-600">
                  Visual representation of the netball court with interactive player positions. 
                  Game timer and controls integrated with spatial player selection for intuitive use.
                </p>
              </CardHeader>
              <CardContent>
                <CourtViewInterface />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="split" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Split Screen Interface</CardTitle>
                <p className="text-gray-600">
                  Dual-panel layout optimizing the full iPad screen. Score management on the left, 
                  detailed player statistics on the right. Perfect for dedicated scorekeepers.
                </p>
              </CardHeader>
              <CardContent>
                <SplitScreenInterface />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Design Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle>iPad Touch Interface Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2 flex items-center">
                  <Target className="w-4 h-4 mr-2" />
                  Touch Target Sizes
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Minimum 44px touch targets with 8px spacing. Primary action buttons are 60-80px 
                  for comfortable finger interaction on 12" tablets.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center">
                  <Activity className="w-4 h-4 mr-2" />
                  Real-time Feedback
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Immediate visual feedback for all actions with color changes, animations, 
                  and counter updates. Undo capability for accidental taps.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center">
                  <Save className="w-4 h-4 mr-2" />
                  Data Persistence
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Local state management with batch save functionality. Auto-save drafts 
                  and clear save/unsaved indicators for reliability.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center">
                  <Maximize2 className="w-4 h-4 mr-2" />
                  Screen Optimization
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Designed for 12" iPad landscape orientation (1366x1024) with consideration 
                  for both landscape and portrait modes where applicable.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Implementation Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Implementation Considerations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Local Storage Fallback</h4>
                <p className="text-sm text-gray-600">
                  Implement localStorage backup for network-independent operation. Queue API calls 
                  when offline and sync when connection is restored.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Performance Optimization</h4>
                <p className="text-sm text-gray-600">
                  Use React.memo for player components, debounce rapid stat updates, 
                  and implement virtual scrolling for large player lists.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Error Handling</h4>
                <p className="text-sm text-gray-600">
                  Graceful degradation with clear error messages, retry mechanisms, 
                  and data recovery options for interrupted sessions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
}