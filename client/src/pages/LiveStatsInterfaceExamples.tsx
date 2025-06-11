
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
