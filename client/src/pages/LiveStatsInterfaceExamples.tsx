import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { PageTemplate } from '@/components/layout/PageTemplate';
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
  X,
  Pause,
  Play,
  Settings,
  Maximize2,
  Grid3X3,
  List,
  Eye,
  EyeOff,
  BarChart3,
  Zap,
  RefreshCw,
  ArrowRightLeft,
  Clock
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
  { id: 8, name: "Sophie M", position: "C", avatar: "SM" },
  { id: 9, name: "Grace T", position: "GA", avatar: "GT" },
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

// Design 5: Timer-Enhanced Live Stats Interface
const TimerEnhancedInterface = () => {
  const [positionStats, setPositionStats] = useState({});
  const [currentQuarter, setCurrentQuarter] = useState(1);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Timer state
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(15 * 60); // 15 minutes in seconds
  const [quarterLength, setQuarterLength] = useState(15); // minutes
  const [gameStarted, setGameStarted] = useState(false);

  // Playing time tracking for each player
  const [playingTimes, setPlayingTimes] = useState({});

  // Player assignment and interchange state - using mock player IDs from this file
  const [currentPositions, setCurrentPositions] = useState({
    'GS': 1, 'GA': 2, 'WA': 3, 'C': 4, 'WD': 5, 'GD': 6, 'GK': 7 // All positions filled, players 8 & 9 available for interchange
  });

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isTimerRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => {
          if (time <= 1) {
            setIsTimerRunning(false);
            // Auto advance to next quarter if not Q4
            if (currentQuarter < 4) {
              setTimeout(() => {
                setCurrentQuarter(q => q + 1);
                setTimeRemaining(quarterLength * 60);
              }, 1000);
            }
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timeRemaining, currentQuarter, quarterLength]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate playing times for display
  const calculatePlayingTimes = () => {
    const times = {};

    // Initialize all players with zero times
    mockPlayers.forEach(player => {
      times[player.id] = { quarterTime: 0, totalTime: 0 };
    });

    // Only calculate actual playing time if game has started
    if (gameStarted) {
      // For players currently on court, calculate their playing time this quarter
      const quarterProgressSeconds = (quarterLength * 60) - timeRemaining;
      const currentQuarterPlayingTime = Math.max(0, Math.round(quarterProgressSeconds / 30) * 30); // Round to nearest 30 seconds

      Object.entries(currentPositions).forEach(([position, playerId]) => {
        if (playerId && playerId !== 'bench' && times[playerId]) {
          // Set current quarter playing time
          times[playerId].quarterTime = currentQuarterPlayingTime;

          // For demo purposes, assume they played full quarters in previous quarters
          const previousQuartersTime = (currentQuarter - 1) * quarterLength * 60;
          times[playerId].totalTime = previousQuartersTime + currentQuarterPlayingTime;
        }
      });

      // For players not currently playing, show previous quarters only
      Object.keys(times).forEach(playerId => {
        const playerIdNum = parseInt(playerId);
        const isCurrentlyPlaying = Object.values(currentPositions).includes(playerIdNum);

        if (!isCurrentlyPlaying) {
          times[playerId].quarterTime = 0; // Not playing this quarter
          // For demo, assume they played some previous quarters
          times[playerId].totalTime = Math.max(0, (currentQuarter - 2) * quarterLength * 60);
        }
      });
    }

    return times;
  };

  // Timer controls
  const startTimer = () => {
    setGameStarted(true);
    setIsTimerRunning(true);
  };

  const pauseTimer = () => {
    setIsTimerRunning(false);
  };

  const resetQuarter = () => {
    setIsTimerRunning(false);
    setTimeRemaining(quarterLength * 60);
  };

  const endQuarter = () => {
    setIsTimerRunning(false);
    if (currentQuarter < 4) {
      setCurrentQuarter(q => q + 1);
      setTimeRemaining(quarterLength * 60);
    }
  };

  const recordStat = (position: string, stat: string) => {
    // Get current time for interchange tracking
    const currentTime = formatTime(timeRemaining);
    console.log(`Stat recorded: ${position} ${stat} at ${currentTime} in Q${currentQuarter}`);

    // Update stats (simplified for demo)
    setPositionStats(prev => {
      const key = `${position}-${currentQuarter}`;
      const newStats = { ...prev };
      if (!newStats[key]) newStats[key] = {};
      newStats[key][stat] = (newStats[key][stat] || 0) + 1;
      return newStats;
    });
  };

  // Initialize playing times and update when timer changes
  useEffect(() => {
    setPlayingTimes(calculatePlayingTimes());
  }, [Math.floor(timeRemaining / 30), currentQuarter, currentPositions, gameStarted]);

  return (
    <div className="space-y-4">
      {/* Game Timer Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5" />
                Live Game Timer
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                WNC Dingoes vs Emeralds
              </p>
            </div>

            {/* Quarter Length Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm">Quarter Length:</span>
              <select 
                value={quarterLength} 
                onChange={(e) => {
                  const newLength = parseInt(e.target.value);
                  setQuarterLength(newLength);
                  if (!isTimerRunning) {
                    setTimeRemaining(newLength * 60);
                  }
                }}
                className="px-2 py-1 border rounded text-sm"
                disabled={gameStarted}
              >
                <option value={10}>10 min</option>
                <option value={12}>12 min</option>
                <option value={15}>15 min</option>
                <option value={20}>20 min</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Timer Display */}
            <Card className="text-center">
              <CardContent className="py-4">
                <div className="space-y-2">
                  <div className="text-4xl font-bold font-mono">
                    {formatTime(timeRemaining)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Quarter {currentQuarter} • {quarterLength} minutes
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                      style={{
                        width: `${((quarterLength * 60 - timeRemaining) / (quarterLength * 60)) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quarter Selector */}
            <Card>
              <CardContent className="py-4">
                <div className="space-y-3">
                  <div className="text-sm font-semibold text-center">Quarter</div>
                  <div className="grid grid-cols-4 gap-1">
                    {[1, 2, 3, 4].map(quarter => (
                      <Button
                        key={quarter}
                        variant={quarter === currentQuarter ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setCurrentQuarter(quarter);
                          if (!isTimerRunning) {
                            setTimeRemaining(quarterLength * 60);
                          }
                        }}
                        className="h-8 touch-manipulation"
                      >
                        {quarter}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timer Controls */}
            <Card>
              <CardContent className="py-4">
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-center mb-3">Timer Controls</div>

                  <div className="grid grid-cols-2 gap-2">
                    {!gameStarted ? (
                      <Button 
                        onClick={startTimer}
                        className="bg-green-600 hover:bg-green-700 col-span-2 touch-manipulation"
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Start Game
                      </Button>
                    ) : (
                      <>
                        {isTimerRunning ? (
                          <Button onClick={pauseTimer} variant="outline" className="touch-manipulation">
                            <Pause className="h-4 w-4 mr-1" />
                            Pause
                          </Button>
                        ) : (
                          <Button onClick={startTimer} className="touch-manipulation">
                            <Play className="h-4 w-4 mr-1" />
                            Resume
                          </Button>
                        )}

                        <Button onClick={resetQuarter} variant="outline" className="touch-manipulation">
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Reset
                        </Button>
                      </>
                    )}
                  </div>

                  {gameStarted && (
                    <Button 
                      onClick={endQuarter} 
                      variant="secondary" 
                      className="w-full mt-2 touch-manipulation"
                      disabled={currentQuarter >= 4 && timeRemaining === 0}
                    >
                      End Quarter {currentQuarter}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Game Score with Timer Integration */}
      <Card>
        <CardContent className="py-3">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">WNC Dingoes</p>
              <p className="text-3xl font-bold">
                {Object.values(positionStats).reduce((sum: number, pos: any) => {
                  return sum + Object.keys(pos).reduce((qSum, quarter) => {
                    return qSum + (pos[quarter]?.goalsFor || 0);
                  }, 0);
                }, 0)}
              </p>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="text-xs text-muted-foreground mb-1">
                {timeRemaining === 0 ? 'Quarter End' : isTimerRunning ? 'LIVE' : 'PAUSED'}
              </div>
              <span className="text-2xl font-bold">-</span>
              <div className="text-xs text-muted-foreground mt-1">
                Q{currentQuarter}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Emeralds</p>
              <p className="text-3xl font-bold">
                {Object.values(positionStats).reduce((sum: number, pos: any) => {
                  return sum + Object.keys(pos).reduce((qSum, quarter) => {
                    return qSum + (pos[quarter]?.goalsAgainst || 0);
                  }, 0);
                }, 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Position Cards with Timer Context */}
      <div className="space-y-3">
        {mockPlayers.slice(0, 3).map(player => {
          const currentTime = formatTime(timeRemaining);

          return (
            <Card key={player.id}>
              <CardHeader className="py-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 bg-blue-500 text-white">
                      <AvatarFallback>{player.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-sm">{player.name}</h3>
                      <Badge variant="outline" className="text-xs">{player.position}</Badge>
                    </div>
                  </div>

                  {/* Playing Time Display */}
                  <div className="text-right text-xs text-muted-foreground">
                    {(() => {
                      // Get player assigned to this position
                      const assignedPlayerId = currentPositions[player.position];
                      const playerTime = playingTimes[assignedPlayerId];

                      if (assignedPlayerId && playerTime) {
                        return (
                          <div className="text-xs space-y-1">
                            <div>Q{currentQuarter}: {formatTime(playerTime.quarterTime)}</div>
                            <div>Game: {formatTime(playerTime.totalTime)}</div>
                          </div>
                        );
                      }
                      
                      if (assignedPlayerId) {
                        // Player is assigned but no time data yet - show zeros
                        return (
                          <div className="text-xs space-y-1">
                            <div>Q{currentQuarter}: 00:00</div>
                            <div>Game: 00:00</div>
                          </div>
                        );
                      }
                      
                      return <div className="text-xs text-gray-400">Not assigned</div>;
                    })()}
                  </div>

                  {/* Common Stats Row - Quick Tap */}
                  <div className="flex-1 grid grid-cols-5 gap-2">
                    {commonStats.map(stat => (
                      statConfig[stat] && (
                        <QuickStatButton
                          key={stat}
                          position={player.position}
                          stat={stat}
                        />
                      )
                    ))}
                  </div>
                </div>
              </CardHeader>

              {/* Position-Specific Stats Row */}
              <CardContent className="py-2 pt-1">
                {(() => {
                  const posSpecificStats = Object.entries(statConfig)
                    .filter(([stat, isAvailable]) => isAvailable && !commonStats.includes(stat))
                    .map(([stat]) => stat);

                  if (posSpecificStats.length === 0) {
                    return null;
                  }

                  return (
                    <div className="flex justify-center gap-2">
                      {posSpecificStats.map(statType => (
                        <QuickStatButton
                          key={statType}
                          position={player.position}
                          stat={statType}
                          important={true}
                        />
                      ))}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Interchange Timeline with Timer */}
      <Card>
        <CardHeader>
          <CardTitle>Game Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center p-2 bg-green-50 rounded">
              <span>Q{currentQuarter} Started</span>
              <span>{formatTime(quarterLength * 60)}</span>
            </div>

            {timeRemaining < quarterLength * 60 && (
              <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                <span>Current Time</span>
                <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
              </div>
            )}

            {timeRemaining === 0 && (
              <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                <span>Q{currentQuarter} Ended</span>
                <span>00:00</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Bar with Timer-Aware Saving */}
      <Card>
        <CardContent className="py-3">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button variant="outline" className="touch-manipulation">
                <Undo className="h-4 w-4 mr-2" />
                Undo
              </Button>
              <Button variant="outline" className="touch-manipulation">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Quarter
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-xs text-muted-foreground">
                Game Time: {formatTime((quarterLength * 60 * (currentQuarter - 1)) + (quarterLength * 60 - timeRemaining))}
              </div>
              <Button className="bg-green-600 hover:bg-green-700 text-white touch-manipulation">
                <Save className="h-4 w-4 mr-2" />
                Save Stats
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Design 6: Quick Tap Version of Current LiveStats
const QuickTapCurrentInterface = () => {
  const [positionStats, setPositionStats] = useState({});
  const [currentQuarter, setCurrentQuarter] = useState(1);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Player assignment and interchange state - using mock player IDs from this file
  const [currentPositions, setCurrentPositions] = useState({
    'GS': 1, 'GA': 2, 'WA': 3, 'C': 4, 'WD': 5, 'GD': 6, 'GK': 7 // All positions filled, players 8 & 9 available for interchange
  });
  const [interchanges, setInterchanges] = useState([]);
  const [showInterchangePanel, setShowInterchangePanel] = useState(false);
  const [interchangeReason, setInterchangeReason] = useState('tactical');

  // Timer state
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(15 * 60); // 15 minutes in seconds
  const [quarterLength, setQuarterLength] = useState(15); // minutes
  const [gameStarted, setGameStarted] = useState(false);

  // Playing time tracking for each player
  const [playingTimes, setPlayingTimes] = useState({});

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isTimerRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => {
          if (time <= 1) {
            setIsTimerRunning(false);
            // Auto advance to next quarter if not Q4
            if (currentQuarter < 4) {
              setTimeout(() => {
                setCurrentQuarter(q => q + 1);
                setTimeRemaining(quarterLength * 60);
              }, 1000);
            }
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timeRemaining, currentQuarter, quarterLength]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate playing times for display
  const calculatePlayingTimes = () => {
    const times = {};

    // Initialize all players with zero times
    mockPlayers.forEach(player => {
      times[player.id] = { quarterTime: 0, totalTime: 0 };
    });

    // Only calculate actual playing time if game has started
    if (gameStarted) {
      // For players currently on court, calculate their playing time this quarter
      const quarterProgressSeconds = (quarterLength * 60) - timeRemaining;
      const currentQuarterPlayingTime = Math.max(0, Math.round(quarterProgressSeconds / 30) * 30); // Round to nearest 30 seconds

      Object.entries(currentPositions).forEach(([position, playerId]) => {
        if (playerId && playerId !== 'bench' && times[playerId]) {
          // Set current quarter playing time
          times[playerId].quarterTime = currentQuarterPlayingTime;

          // For demo purposes, assume they played full quarters in previous quarters
          const previousQuartersTime = (currentQuarter - 1) * quarterLength * 60;
          times[playerId].totalTime = previousQuartersTime + currentQuarterPlayingTime;
        }
      });

      // For players not currently playing, show previous quarters only
      Object.keys(times).forEach(playerId => {
        const playerIdNum = parseInt(playerId);
        const isCurrentlyPlaying = Object.values(currentPositions).includes(playerIdNum);

        if (!isCurrentlyPlaying) {
          times[playerId].quarterTime = 0; // Not playing this quarter
          // For demo, assume they played some previous quarters
          times[playerId].totalTime = Math.max(0, (currentQuarter - 2) * quarterLength * 60);
        }
      });
    }

    return times;
  };

  // Timer controls
  const startTimer = () => {
    setGameStarted(true);
    setIsTimerRunning(true);
  };

  const pauseTimer = () => {
    setIsTimerRunning(false);
  };

  const resetQuarter = () => {
    setIsTimerRunning(false);
    setTimeRemaining(quarterLength * 60);
  };

  const endQuarter = () => {
    setIsTimerRunning(false);
    if (currentQuarter < 4) {
      setCurrentQuarter(q => q + 1);
      setTimeRemaining(quarterLength * 60);
    }
  };

  // Mock position color mapping
  const getPositionColor = (position) => {
    const colors = {
      'GS': '#ef4444', 'GA': '#f97316', 'WA': '#eab308', 'C': '#22c55e',
      'WD': '#06b6d4', 'GD': '#3b82f6', 'GK': '#8b5cf6'
    };
    return colors[position] || '#6b7280';
  };

  // Position configuration for available stats
  const positionStatConfig = {
    'GS': { goalsFor: true, missedGoals: true, rebounds: true, intercepts: true, badPass: true, handlingError: true, pickUp: true, infringement: true },
    'GA': { goalsFor: true, missedGoals: true, rebounds: true, intercepts: true, badPass: true, handlingError: true, pickUp: true, infringement: true },
    'WA': { intercepts: true, badPass: true, handlingError: true, pickUp: true, infringement: true },
    'C': { intercepts: true, badPass: true, handlingError: true, pickUp: true, infringement: true },
    'WD': { intercepts: true, badPass: true, handlingError: true, pickUp: true, infringement: true },
    'GD': { goalsAgainst: true, rebounds: true, intercepts: true, badPass: true, handlingError: true, pickUp: true, infringement: true },
    'GK': { goalsAgainst: true, rebounds: true, intercepts: true, badPass: true, handlingError: true, pickUp: true, infringement: true }
  };

  const positionLabels = {
    'GS': 'Goal Shooter', 'GA': 'Goal Attack', 'WA': 'Wing Attack', 'C': 'Centre',
    'WD': 'Wing Defence', 'GD': 'Goal Defence', 'GK': 'Goal Keeper'
  };

  const allPositions = ['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'];
  const commonStats = ['intercepts', 'badPass', 'handlingError', 'infringement', 'pickUp'];

  // Initialize empty stats
  const emptyQuarterStats = {
    goalsFor: 0, goalsAgainst: 0, missedGoals: 0, rebounds: 0, intercepts: 0,
    badPass: 0, handlingError: 0, pickUp: 0, infringement: 0, rating: 5
  };

  // Initialize position stats
  React.useEffect(() => {
    const initialStats = {};
    allPositions.forEach(position => {
      for (let quarter = 1; quarter <= 4; quarter++) {
        const key = `${position}-${quarter}`;
        initialStats[key] = { ...emptyQuarterStats };
      }
    });
    setPositionStats(initialStats);
  }, []);

  const getPositionQuarterKey = (position, quarter) => `${position}-${quarter}`;

  const recordStat = (position, stat, value = 1) => {
    // Get current time for tracking
    const currentTime = formatTime(timeRemaining);
    console.log(`Stat recorded: ${position} ${stat} at ${currentTime} in Q${currentQuarter}`);

    // Save current state for undo
    setUndoStack([...undoStack, JSON.parse(JSON.stringify(positionStats))]);
    setRedoStack([]);

    const key = getPositionQuarterKey(position, currentQuarter);

    setPositionStats(prev => {
      const newStats = JSON.parse(JSON.stringify(prev));
      if (!newStats[key]) {
        newStats[key] = { ...emptyQuarterStats };
      }
      const currentValue = newStats[key][stat] || 0;
      newStats[key][stat] = currentValue + value;
      return newStats;
    });
  };

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const lastState = undoStack[undoStack.length - 1];
      const newUndoStack = undoStack.slice(0, -1);
      setRedoStack([...redoStack, JSON.parse(JSON.stringify(positionStats))]);
      setPositionStats(lastState);
      setUndoStack(newUndoStack);
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1];
      const newRedoStack = redoStack.slice(0, -1);
      setUndoStack([...undoStack, JSON.parse(JSON.stringify(positionStats))]);
      setPositionStats(nextState);
      setRedoStack(newRedoStack);
    }
  };

  const getQuarterTotal = (stat) => {
    let total = 0;
    allPositions.forEach(position => {
      const key = getPositionQuarterKey(position, currentQuarter);
      const stats = positionStats[key];
      if (stats && stats[stat] !== undefined) {
        total += stats[stat] || 0;
      }
    });
    return total;
  };

  // Get player name by ID
  const getPlayerName = (playerId) => {
    return mockPlayers.find(p => p.id === playerId)?.name || 'Unknown';
  };

  // Get available players for substitution (not currently on court)
  const getAvailablePlayers = () => {
    const onCourtPlayerIds = Object.values(currentPositions).filter(Boolean);
    return mockPlayers.filter(player => !onCourtPlayerIds.includes(player.id));
  };

  // Get player currently in a position
  const getPlayerInPosition = (position) => {
    const playerId = currentPositions[position];
    return playerId ? mockPlayers.find(p => p.id === playerId) : null;
  };

  // Record an interchange
  const recordInterchange = (position, playerOut, playerIn, reason) => {
    const currentTime = formatTime(timeRemaining);

    const newInterchange = {
      id: `${Date.now()}`,
      timestamp: new Date(),
      quarter: currentQuarter,
      timeInQuarter: currentTime,
      position,
      playerOut,
      playerIn,
      reason
    };

    // Add to interchange history
    setInterchanges(prev => [newInterchange, ...prev]);

    // Update current positions
    setCurrentPositions(prev => ({
      ...prev,
      [position]: playerIn
    }));

    console.log(`Interchange recorded: ${getPlayerName(playerOut)} → ${getPlayerName(playerIn)} at ${position} (${currentTime})`);
  };

  // Quick tap stat button - single tap to increment
  const QuickStatButton = ({ position, stat, important = false }) => {
    const key = getPositionQuarterKey(position, currentQuarter);
    const currentValue = positionStats[key]?.[stat] || 0;
    const StatIcon = statTypes.find(s => s.key === stat)?.icon || Target;
    const statColor = statTypes.find(s => s.key === stat)?.color || 'bg-gray-100 text-gray-700';
    const statLabel = statTypes.find(s => s.key === stat)?.label || stat;

    return (
      <Button
        variant="outline"
        className={`${important ? 'h-16 w-full' : 'h-12 w-full'} ${statColor} border-2 touch-manipulation flex flex-col gap-1 relative transition-all hover:scale-102 active:scale-95`}
        onClick={() => recordStat(position, stat, 1)}
      >
        <StatIcon className={important ? 'h-5 w-5' : 'h-4 w-4'} />
        <span className={`${important ? 'text-sm' : 'text-xs'} font-medium`}>{statLabel}</span>
        {currentValue > 0 && (
          <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs">
            {currentValue}
          </Badge>
        )}
      </Button>
    );
  };

  // Define commonStats and statConfig outside the return statement
  const statConfig = positionStatConfig;

  return (
    <div className="space-y-4">
      {/* Timer-Enhanced Game Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5" />
                Live Game with Timer
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                WNC Dingoes vs Emeralds - Quick Tap Stats
              </p>
            </div>

            {/* Quarter Length Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm">Quarter Length:</span>
              <select 
                value={quarterLength} 
                onChange={(e) => {
                  const newLength = parseInt(e.target.value);
                  setQuarterLength(newLength);
                  if (!isTimerRunning) {
                    setTimeRemaining(newLength * 60);
                  }
                }}
                className="px-2 py-1 border rounded text-sm"
                disabled={gameStarted}
              >
                <option value={10}>10 min</option>
                <option value={12}>12 min</option>
                <option value={15}>15 min</option>
                <option value={20}>20 min</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Timer Display */}
            <Card className="text-center">
              <CardContent className="py-4">
                <div className="space-y-2">
                  <div className="text-4xl font-bold font-mono">
                    {formatTime(timeRemaining)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Quarter {currentQuarter} • {quarterLength} minutes
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                      style={{
                        width: `${((quarterLength * 60 - timeRemaining) / (quarterLength * 60)) * 100}%`
                      }}
                    />
                  </div>

                  {/* Timer Status */}
                  <div className={`px-2 py-1 rounded text-xs ${
                    isTimerRunning ? 'bg-green-100 text-green-700' : 
                    timeRemaining === 0 ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {isTimerRunning ? 'LIVE' : timeRemaining === 0 ? 'END' : 'PAUSED'}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Game Score */}
            <Card>
              <CardContent className="py-4">
                <div className="text-center space-y-2">
                  <div className="text-sm font-semibold mb-3">Game Score</div>
                  <div className="grid grid-cols-3 gap-2 items-center">
                    <div>
                      <p className="text-xs text-muted-foreground">WNC Dingoes</p>
                      <p className="text-2xl font-bold">{getQuarterTotal('goalsFor')}</p>
                    </div>
                    <div className="text-xl font-bold">-</div>
                    <div>
                      <p className="text-xs text-muted-foreground">Emeralds</p>
                      <p className="text-2xl font-bold">{getQuarterTotal('goalsAgainst')}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quarter & Controls */}
            <Card>
              <CardContent className="py-4">
                <div className="space-y-3">
                  {/* Quarter Selector */}
                  <div className="text-center">
                    <div className="text-sm font-semibold mb-2">Quarter</div>
                    <div className="grid grid-cols-4 gap-1">
                      {[1, 2, 3, 4].map(quarter => (
                        <Button
                          key={quarter}
                          variant={quarter === currentQuarter ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setCurrentQuarter(quarter);
                            if (!isTimerRunning) {
                              setTimeRemaining(quarterLength * 60);
                            }
                          }}
                          className="h-8 touch-manipulation"
                        >
                          {quarter}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Timer Controls */}
                  <div className="space-y-2">
                    {!gameStarted ? (
                      <Button 
                        onClick={startTimer}
                        className="w-full bg-green-600 hover:bg-green-700 touch-manipulation"
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Start Game
                      </Button>
                    ) : (
                      <div className="grid grid-cols-2 gap-1">
                        {isTimerRunning ? (
                          <Button onClick={pauseTimer} variant="outline" size="sm" className="touch-manipulation">
                            <Pause className="h-3 w-3 mr-1" />
                            Pause
                          </Button>
                        ) : (
                          <Button onClick={startTimer} size="sm" className="touch-manipulation">
                            <Play className="h-3 w-3 mr-1" />
                            Resume
                          </Button>
                        )}

                        <Button onClick={resetQuarter} variant="outline" size="sm" className="touch-manipulation">
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Reset
                        </Button>
                      </div>
                    )}

                    <Button 
                      onClick={() => setShowInterchangePanel(!showInterchangePanel)}
                      variant={showInterchangePanel ? "default" : "outline"}
                      size="sm"
                      className="w-full touch-manipulation"
                    >
                      <ArrowRightLeft className="h-3 w-3 mr-1" />
                      Interchange
                    </Button>

                    {gameStarted && (
                      <Button 
                        onClick={endQuarter} 
                        variant="secondary" 
                        size="sm"
                        className="w-full touch-manipulation"
                        disabled={currentQuarter >= 4 && timeRemaining === 0}
                      >
                        End Quarter {currentQuarter}
                      </Button>
                    )}
                  </div>

                  {/* Undo/Redo */}
                  <div className="grid grid-cols-2 gap-1">
                    <Button
                      variant="outline" 
                      size="sm"
                      onClick={handleUndo}
                      disabled={undoStack.length === 0}
                      className="touch-manipulation"
                    >
                      <Undo className="h-3 w-3 mr-1" />
                      Undo
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRedo}
                      disabled={redoStack.length === 0}
                      className="touch-manipulation"
                    >
                      <Redo className="h-3 w-3 mr-1" />
                      Redo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Position Cards with Quick Tap Interface */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold">Positions - Quarter {currentQuarter}</h2>

        {allPositions.map(position => {
          const positionStatConfiguration = positionStatConfig[position];
          const assignedPlayerId = currentPositions[position];
          const assignedPlayer = mockPlayers.find(p => p.id === assignedPlayerId);

          return (
            <Card key={position} className="overflow-hidden">
              <CardHeader className="py-2 pb-2">
                <div className="flex items-center gap-3">
                  {/* Position Identity */}
                  <div 
                    className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0"
                    style={{
                      backgroundColor: getPositionColor(position),
                      border: '2px solid white',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}
                  >
                    {position}
                  </div>

                  <div className="min-w-[100px]">
                    {assignedPlayer ? (
                      <p className="font-semibold text-sm">{assignedPlayer.name}</p>
                    ) : (
                      <p className="font-semibold text-sm text-gray-400">Unassigned</p>
                    )}
                    <p className="text-xs text-muted-foreground">{positionLabels[position]}</p>
                  </div>

                  {/* Playing Time Display */}
                  <div className="text-right text-xs text-muted-foreground">
                    {(() => {
                      // Get player assigned to this position
                      const assignedPlayerId = currentPositions[position];
                      const playerTime = playingTimes[assignedPlayerId];

                      if (assignedPlayerId && playerTime && gameStarted) {
                        return (
                          <div className="text-xs space-y-1">
                            <div>Q{currentQuarter}: {formatTime(playerTime.quarterTime)}</div>
                            <div>Game: {formatTime(playerTime.totalTime)}</div>
                          </div>
                        );
                      }
                      return <div className="text-xs text-gray-400">00:00</div>;
                    })()}
                  </div>

                  {/* Common Stats Row - Quick Tap */}
                  <div className="flex-1 grid grid-cols-5 gap-2">
                    {commonStats.map(stat => (
                      positionStatConfiguration[stat] && (
                        <QuickStatButton
                          key={stat}
                          position={position}
                          stat={stat}
                        />
                      )
                    ))}
                  </div>
                </div>
              </CardHeader>

              {/* Position-Specific Stats Row */}
              <CardContent className="py-2 pt-1">
                {(() => {
                  const posSpecificStats = Object.entries(positionStatConfiguration)
                    .filter(([stat, isAvailable]) => isAvailable && !commonStats.includes(stat))
                    .map(([stat]) => stat);

                  if (posSpecificStats.length === 0) {
                    return null;
                  }

                  return (
                    <div className="flex justify-center gap-2">
                      {posSpecificStats.map(statType => (
                        <QuickStatButton
                          key={statType}
                          position={position}
                          stat={statType}
                          important={true}
                        />
                      ))}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Compact Interchange Panel */}
      {showInterchangePanel && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ArrowRightLeft className="h-4 w-4" />
                Quick Interchange - Q{currentQuarter}
              </span>
              <div className="text-sm text-muted-foreground">
                {formatTime(timeRemaining)} remaining
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Interchange Reason Selector */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Interchange Reason</h4>
              <div className="grid grid-cols-4 gap-2">
                {['tactical', 'injury', 'rest', 'performance'].map(reason => (
                  <Button
                    key={reason}
                    variant={interchangeReason === reason ? "default" : "outline"}
                    size="sm"
                    onClick={() => setInterchangeReason(reason)}
                    className="text-xs touch-manipulation capitalize"
                  >
                    {reason}
                  </Button>
                ))}
              </div>
            </div>

            {/* Available Players for Interchange */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Available Players</h4>
              <div className="flex flex-wrap gap-2">
                {getAvailablePlayers().map(player => (
                  <Badge key={player.id} variant="secondary" className="text-xs">
                    {player.name}
                  </Badge>
                ))}
                {getAvailablePlayers().length === 0 && (
                  <span className="text-xs text-muted-foreground">All players are on court</span>
                )}
              </div>
            </div>

            {/* Quick Interchange Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allPositions.map(position => {
                const currentPlayer = getPlayerInPosition(position);
                const availablePlayers = getAvailablePlayers();

                return (
                  <div key={position} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {/* Position */}
                    <div 
                      className="h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ backgroundColor: getPositionColor(position) }}
                    >
                      {position}
                    </div>

                    {/* Current Player */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {currentPlayer?.name || 'Empty Position'}
                      </p>
                      {!currentPlayer && (
                        <p className="text-xs text-muted-foreground">Click to assign</p>
                      )}
                    </div>

                    {/* Quick Substitute/Assign Buttons */}
                    <div className="flex gap-1">
                      {availablePlayers.slice(0, 3).map(player => (
                        <Button
                          key={player.id}
                          variant="outline"
                          size="sm"
                          className="h-8 px-2 text-xs touch-manipulation hover:bg-green-100"
                          onClick={() => {
                            if (currentPlayer) {
                              // Substitute existing player
                              recordInterchange(position, currentPlayer.id, player.id, interchangeReason);
                            } else {
                              // Assign to empty position
                              setCurrentPositions(prev => ({
                                ...prev,
                                [position]: player.id
                              }));
                              console.log(`Assigned ${player.name} to ${position}`);
                            }
                          }}
                          title={currentPlayer ? `Substitute ${currentPlayer.name} with ${player.name}` : `Assign ${player.name} to ${position}`}
                        >
                          {currentPlayer ? '← ' : '+ '}{player.name.split(' ')[0]}
                        </Button>
                      ))}

                      {/* Remove player button for occupied positions */}
                      {currentPlayer && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2 text-xs touch-manipulation hover:bg-red-100 text-red-600"
                          onClick={() => {
                            setCurrentPositions(prev => ({
                              ...prev,
                              [position]: null
                            }));
                            console.log(`Removed ${currentPlayer.name} from ${position}`);
                          }}
                          title={`Remove ${currentPlayer.name} from ${position}`}
                        >
                          ✕
                        </Button>
                      )}

                      {availablePlayers.length === 0 && !currentPlayer && (
                        <span className="text-xs text-muted-foreground">All assigned</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recent Interchanges for Current Quarter */}
            {interchanges.filter(i => i.quarter === currentQuarter).length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Recent Interchanges</h4>
                <div className="space-y-1">
                  {interchanges
                    .filter(i => i.quarter === currentQuarter)
                    .slice(0, 3)
                    .map(interchange => (
                      <div key={interchange.id} className="flex items-center justify-between p-2 bg-blue-50 rounded text-sm">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{interchange.timeInQuarter}</Badge>
                          <Badge className="text-xs">{interchange.position}</Badge>
                          <span>
                            {getPlayerName(interchange.playerOut)} → {getPlayerName(interchange.playerIn)}
                          </span>
                        </div>
                        <Badge 
                          variant={
                            interchange.reason === 'injury' ? 'destructive' : 
                            interchange.reason === 'tactical' ? 'default' : 
                            'secondary'
                          } 
                          className="text-xs capitalize"
                        >
                          {interchange.reason}
                        </Badge>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Close Panel Button */}
            <div className="pt-2 border-t">
              <Button 
                variant="outline" 
                onClick={() => setShowInterchangePanel(false)}
                className="w-full touch-manipulation"
              >
                Close Interchange Panel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timer-Enhanced Action Bar */}
      <Card>
        <CardContent className="py-3">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="touch-manipulation"
                onClick={resetQuarter}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Quarter
              </Button>
              <Button variant="outline" className="touch-manipulation">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset All
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-xs text-muted-foreground">
                Game Time: {formatTime((quarterLength * 60 * (currentQuarter - 1)) + (quarterLength * 60 - timeRemaining))}
              </div>
              <Button className="bg-green-600 hover:bg-green-700 text-white touch-manipulation">
                <Save className="h-4 w-4 mr-2" />
                Save Stats
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
    },
    {
      id: 'timer-enhanced',
      name: 'Timer-Enhanced Live Stats',
      description: 'Complete live game experience with countdown timer, quarter management, and timestamped stats.',
      component: TimerEnhancedInterface
    },
    {
      id: 'quick-tap-current',
      name: 'Quick Tap (Current Layout)',
      description: 'Your current LiveStats layout converted to quick-tap gesture entry. Single tap to add stats.',
      component: QuickTapCurrentInterface
    }
  ];

  const currentDesign = designs.find(d => d.id === activeDesign);
  const CurrentComponent = currentDesign?.component;

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
            Multiple design approaches for live statistics entry, optimized for 12" iPad touch interfaces.
            Each design prioritizes different aspects: touch-friendliness, visual organization, speed, or information density.
            All interfaces support real-time updates with local state management before saving.
          </p>
        </div>

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
        <Card>
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

            <div>
              <h4 className="font-semibold mb-2">Timer Integration</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Live countdown with customizable quarter lengths (10, 12, 15, 20 minutes)</li>
                <li>• Automatic quarter progression when time expires</li>
                <li>• Timestamped stat recording for interchange tracking</li>
                <li>• Pause/resume functionality for time-outs and breaks</li>
                <li>• Visual progress indicators and live game status</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Interchange Support</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Stats timestamped with exact game time</li>
                <li>• Mid-quarter interchange tracking capability</li>
                <li>• Timeline view showing when stats were recorded</li>
                <li>• Supports both live and post-game data entry</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <section>
          <h2 className="text-2xl font-bold mb-4">Player Interchange Timeline</h2>
          <Card>
            <CardHeader>
              <CardTitle>Game Interchanges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Timeline of interchanges */}
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200"></div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        1
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline">Q1 - 8:30</Badge>
                            <Badge>C</Badge>
                            <span className="text-sm">Emily → Grace</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary">Tactical</Badge>
                            <span className="text-xs text-gray-500">2:15 PM</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        2
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline">Q2 - 12:15</Badge>
                            <Badge>WA</Badge>
                            <span className="text-sm">Ava → Sophie</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary">Rest</Badge>
                            <span className="text-xs text-gray-500">2:18 PM</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        3
                      </div>
                      <div className="flex-1 bg-orange-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline">Q2 - 6:00</Badge>
                            <Badge>GD</Badge>
                            <span className="text-sm">Evie → Maya</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="destructive">Injury</Badge>
                            <span className="text-xs text-gray-500">2:27 PM</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        4
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline">Q3 - 10:45</Badge>
                            <Badge>WA</Badge>
                            <span className="text-sm">Sophie → Ava</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary">Tactical</Badge>
                            <span className="text-xs text-gray-500">2:35 PM</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">4</div>
                    <div className="text-sm text-gray-600">Total Interchanges</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">7</div>
                    <div className="text-sm text-gray-600">Players Used</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">2.5</div>
                    <div className="text-sm text-gray-600">Avg per Quarter</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </PageTemplate>
  );
}