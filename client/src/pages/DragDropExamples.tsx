
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, RotateCcw, Plus, Minus, ArrowUpDown, Grid3X3, Target, 
  Clock, ChevronRight, ChevronLeft, Eye, Edit, Trash2, Save,
  Shuffle, Move3D, Copy, MoreHorizontal
} from 'lucide-react';

// Sample data
const samplePlayers = [
  { id: 1, name: "Sarah J", displayName: "Sarah J", positions: ["GS", "GA"], color: "bg-red-500" },
  { id: 2, name: "Emma K", displayName: "Emma K", positions: ["WA", "C"], color: "bg-blue-500" },
  { id: 3, name: "Lucy M", displayName: "Lucy M", positions: ["C", "WD"], color: "bg-green-500" },
  { id: 4, name: "Kate R", displayName: "Kate R", positions: ["WD", "GD"], color: "bg-purple-500" },
  { id: 5, name: "Amy T", displayName: "Amy T", positions: ["GD", "GK"], color: "bg-orange-500" },
  { id: 6, name: "Zoe L", displayName: "Zoe L", positions: ["GK", "GD"], color: "bg-pink-500" },
  { id: 7, name: "Mia B", displayName: "Mia B", positions: ["GA", "WA"], color: "bg-teal-500" },
  { id: 8, name: "Ella C", displayName: "Ella C", positions: ["WA", "C", "WD"], color: "bg-yellow-500" },
];

const positions = ["GS", "GA", "WA", "C", "WD", "GD", "GK"];

// Enhanced Player Card Component
const EnhancedPlayerCard = ({ 
  player, 
  size = "md", 
  className = "",
  isDragging = false,
  showGrabHandle = false,
  variant = "default"
}: {
  player: any,
  size?: "sm" | "md" | "lg",
  className?: string,
  isDragging?: boolean,
  showGrabHandle?: boolean,
  variant?: "default" | "minimal" | "detailed" | "compact"
}) => {
  const sizeClasses = {
    sm: "p-2",
    md: "p-3", 
    lg: "p-4"
  };

  const avatarSizes = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10"
  };

  if (variant === "minimal") {
    return (
      <div className={`
        ${sizeClasses[size]} rounded-lg border-2 transition-all duration-200 bg-white
        ${isDragging ? 'opacity-50 scale-95 border-blue-400 shadow-lg' : 'border-gray-200 hover:border-gray-300 hover:shadow-md'}
        ${className}
      `}>
        <div className="flex items-center gap-2">
          {showGrabHandle && (
            <div className="cursor-grab active:cursor-grabbing text-gray-400">
              <Move3D className="h-3 w-3" />
            </div>
          )}
          <Avatar className={avatarSizes[size]}>
            <AvatarFallback className={`${player.color} text-white text-xs font-semibold`}>
              {player.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium flex-1">{player.displayName}</span>
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={`
        ${sizeClasses[size]} rounded-xl border-2 transition-all duration-200 bg-gradient-to-br from-white to-gray-50
        ${isDragging ? 'opacity-50 scale-95 border-blue-400 shadow-lg' : 'border-gray-200 hover:border-blue-300 hover:shadow-md'}
        ${className}
      `}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {showGrabHandle && (
              <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-blue-500">
                <Grid3X3 className="h-3 w-3" />
              </div>
            )}
            <Avatar className={avatarSizes[size]}>
              <AvatarFallback className={`${player.color} text-white text-xs font-semibold`}>
                {player.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm font-medium">{player.displayName}</div>
              <div className="flex gap-1">
                {player.positions.slice(0, 2).map(pos => (
                  <Badge key={pos} variant="secondary" className="text-xs px-1 py-0">
                    {pos}
                  </Badge>
                ))}
                {player.positions.length > 2 && (
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    +{player.positions.length - 2}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "detailed") {
    return (
      <div className={`
        ${sizeClasses[size]} rounded-xl border-2 transition-all duration-200 bg-white shadow-sm
        ${isDragging ? 'opacity-50 scale-95 border-blue-400 shadow-lg' : 'border-gray-200 hover:border-blue-300 hover:shadow-lg'}
        ${className}
      `}>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {showGrabHandle && (
                <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-blue-500">
                  <Move3D className="h-4 w-4" />
                </div>
              )}
              <Avatar className={avatarSizes[size]}>
                <AvatarFallback className={`${player.color} text-white text-sm font-semibold`}>
                  {player.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="font-medium">{player.displayName}</div>
            </div>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {player.positions.map(pos => (
              <Badge key={pos} variant="secondary" className="text-xs px-2 py-1">
                {pos}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`
      ${sizeClasses[size]} rounded-lg border-2 transition-all duration-200 bg-white
      ${isDragging ? 'opacity-50 scale-95 border-blue-400 shadow-lg' : 'border-gray-200 hover:border-gray-300 hover:shadow-md'}
      ${className}
    `}>
      <div className="flex flex-col items-center space-y-2">
        {showGrabHandle && (
          <div className="self-end cursor-grab active:cursor-grabbing text-gray-400">
            <Move3D className="h-3 w-3" />
          </div>
        )}
        <Avatar className={avatarSizes[size]}>
          <AvatarFallback className={`${player.color} text-white text-xs font-semibold`}>
            {player.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div className="text-sm font-medium text-center">{player.displayName}</div>
        <div className="flex flex-wrap gap-1 justify-center">
          {player.positions.map(pos => (
            <Badge key={pos} variant="secondary" className="text-xs px-1 py-0">
              {pos}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

// Modern Card Grid Interface
const ModernCardGrid = () => {
  const [draggedPlayer, setDraggedPlayer] = useState<number | null>(null);
  const [assignments, setAssignments] = useState<Record<string, number | null>>({
    GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null
  });

  const handleDragStart = (playerId: number) => {
    setDraggedPlayer(playerId);
  };

  const handleDrop = (position: string) => {
    if (draggedPlayer) {
      // Clear player from any previous position
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
  };

  const assignedPlayerIds = Object.values(assignments).filter(id => id !== null);
  const availablePlayers = samplePlayers.filter(p => !assignedPlayerIds.includes(p.id));

  return (
    <div className="space-y-6">
      {/* Modern Court Layout */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-green-50 p-6 rounded-2xl border border-gray-200 shadow-inner">
        <div className="grid grid-cols-7 gap-4">
          {positions.map(position => {
            const player = assignments[position] ? samplePlayers.find(p => p.id === assignments[position]) : null;
            
            return (
              <div
                key={position}
                className="relative"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(position)}
              >
                <div className="text-center mb-2">
                  <Badge variant="outline" className="font-bold text-sm">
                    {position}
                  </Badge>
                </div>
                
                <div className={`
                  min-h-[120px] border-2 border-dashed rounded-xl p-3 transition-all duration-300
                  flex flex-col justify-center items-center
                  ${draggedPlayer && !player ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50/50'}
                `}>
                  {player ? (
                    <div
                      draggable
                      onDragStart={() => handleDragStart(player.id)}
                      className="cursor-move w-full"
                    >
                      <EnhancedPlayerCard 
                        player={player}
                        size="sm"
                        variant="compact"
                        isDragging={draggedPlayer === player.id}
                      />
                    </div>
                  ) : (
                    <div className="text-center text-gray-400">
                      <Plus className="h-6 w-6 mx-auto mb-1" />
                      <div className="text-xs">Drop here</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Available Players Pool */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Available Players
            <Badge variant="secondary">{availablePlayers.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {availablePlayers.map(player => (
              <div
                key={player.id}
                draggable
                onDragStart={() => handleDragStart(player.id)}
                className="cursor-move transform hover:scale-105 transition-transform"
              >
                <EnhancedPlayerCard 
                  player={player}
                  variant="detailed"
                  isDragging={draggedPlayer === player.id}
                  showGrabHandle={true}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Minimalist Card Interface
const MinimalistInterface = () => {
  const [assignments, setAssignments] = useState<Record<string, number | null>>({
    GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null
  });
  const [draggedPlayer, setDraggedPlayer] = useState<number | null>(null);

  const handleDragStart = (playerId: number) => setDraggedPlayer(playerId);
  
  const handleDrop = (position: string) => {
    if (draggedPlayer) {
      const newAssignments = { ...assignments };
      Object.keys(newAssignments).forEach(pos => {
        if (newAssignments[pos] === draggedPlayer) newAssignments[pos] = null;
      });
      newAssignments[position] = draggedPlayer;
      setAssignments(newAssignments);
    }
    setDraggedPlayer(null);
  };

  const assignedPlayerIds = Object.values(assignments).filter(id => id !== null);
  const availablePlayers = samplePlayers.filter(p => !assignedPlayerIds.includes(p.id));

  return (
    <div className="space-y-6">
      {/* Minimalist Court */}
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-start">
          {/* Positions Layout */}
          <div className="grid grid-cols-3 gap-8 flex-1">
            {/* Attack */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-red-600 text-center">Attack</h4>
              {['GS', 'GA'].map(position => {
                const player = assignments[position] ? samplePlayers.find(p => p.id === assignments[position]) : null;
                return (
                  <div
                    key={position}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(position)}
                    className={`
                      min-h-[60px] rounded-lg border-2 border-dashed p-2 transition-all
                      ${draggedPlayer && !player ? 'border-red-300 bg-red-50' : 'border-gray-200'}
                    `}
                  >
                    <div className="text-xs font-medium text-gray-500 mb-1">{position}</div>
                    {player ? (
                      <div
                        draggable
                        onDragStart={() => handleDragStart(player.id)}
                        className="cursor-move"
                      >
                        <EnhancedPlayerCard 
                          player={player}
                          size="sm"
                          variant="minimal"
                          isDragging={draggedPlayer === player.id}
                        />
                      </div>
                    ) : (
                      <div className="text-center text-gray-300 text-xs py-2">Drop player</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Center */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-blue-600 text-center">Center</h4>
              {['WA', 'C', 'WD'].map(position => {
                const player = assignments[position] ? samplePlayers.find(p => p.id === assignments[position]) : null;
                return (
                  <div
                    key={position}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(position)}
                    className={`
                      min-h-[60px] rounded-lg border-2 border-dashed p-2 transition-all
                      ${draggedPlayer && !player ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}
                    `}
                  >
                    <div className="text-xs font-medium text-gray-500 mb-1">{position}</div>
                    {player ? (
                      <div
                        draggable
                        onDragStart={() => handleDragStart(player.id)}
                        className="cursor-move"
                      >
                        <EnhancedPlayerCard 
                          player={player}
                          size="sm"
                          variant="minimal"
                          isDragging={draggedPlayer === player.id}
                        />
                      </div>
                    ) : (
                      <div className="text-center text-gray-300 text-xs py-2">Drop player</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Defense */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-green-600 text-center">Defense</h4>
              {['GD', 'GK'].map(position => {
                const player = assignments[position] ? samplePlayers.find(p => p.id === assignments[position]) : null;
                return (
                  <div
                    key={position}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(position)}
                    className={`
                      min-h-[60px] rounded-lg border-2 border-dashed p-2 transition-all
                      ${draggedPlayer && !player ? 'border-green-300 bg-green-50' : 'border-gray-200'}
                    `}
                  >
                    <div className="text-xs font-medium text-gray-500 mb-1">{position}</div>
                    {player ? (
                      <div
                        draggable
                        onDragStart={() => handleDragStart(player.id)}
                        className="cursor-move"
                      >
                        <EnhancedPlayerCard 
                          player={player}
                          size="sm"
                          variant="minimal"
                          isDragging={draggedPlayer === player.id}
                        />
                      </div>
                    ) : (
                      <div className="text-center text-gray-300 text-xs py-2">Drop player</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Available Players */}
      <div className="bg-gray-50 rounded-xl p-4 border">
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Available Players</span>
          <Badge variant="secondary" className="text-xs">{availablePlayers.length}</Badge>
        </div>
        <div className="space-y-2">
          {availablePlayers.map(player => (
            <div
              key={player.id}
              draggable
              onDragStart={() => handleDragStart(player.id)}
              className="cursor-move"
            >
              <EnhancedPlayerCard 
                player={player}
                size="sm"
                variant="minimal"
                isDragging={draggedPlayer === player.id}
                showGrabHandle={true}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Compact List Interface
const CompactListInterface = () => {
  const [assignments, setAssignments] = useState<Record<string, number | null>>({
    GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null
  });
  const [draggedPlayer, setDraggedPlayer] = useState<number | null>(null);

  const handleDragStart = (playerId: number) => setDraggedPlayer(playerId);
  
  const handleDrop = (position: string) => {
    if (draggedPlayer) {
      const newAssignments = { ...assignments };
      Object.keys(newAssignments).forEach(pos => {
        if (newAssignments[pos] === draggedPlayer) newAssignments[pos] = null;
      });
      newAssignments[position] = draggedPlayer;
      setAssignments(newAssignments);
    }
    setDraggedPlayer(null);
  };

  const assignedPlayerIds = Object.values(assignments).filter(id => id !== null);
  const availablePlayers = samplePlayers.filter(p => !assignedPlayerIds.includes(p.id));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Compact Position List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Starting Lineup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {positions.map(position => {
            const player = assignments[position] ? samplePlayers.find(p => p.id === assignments[position]) : null;
            
            return (
              <div
                key={position}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(position)}
                className={`
                  p-3 rounded-lg border-2 border-dashed transition-all duration-200
                  ${draggedPlayer && !player ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50'}
                `}
              >
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="font-bold">
                    {position}
                  </Badge>
                  
                  {player ? (
                    <div
                      draggable
                      onDragStart={() => handleDragStart(player.id)}
                      className="cursor-move flex-1 ml-4"
                    >
                      <EnhancedPlayerCard 
                        player={player}
                        size="sm"
                        variant="compact"
                        isDragging={draggedPlayer === player.id}
                      />
                    </div>
                  ) : (
                    <div className="flex-1 ml-4 text-center text-gray-400 py-2 text-sm">
                      Drag player here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Available Players */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bench
            <Badge variant="secondary">{availablePlayers.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {availablePlayers.map(player => (
            <div
              key={player.id}
              draggable
              onDragStart={() => handleDragStart(player.id)}
              className="cursor-move hover:scale-[1.02] transition-transform"
            >
              <EnhancedPlayerCard 
                player={player}
                variant="compact"
                isDragging={draggedPlayer === player.id}
                showGrabHandle={true}
              />
            </div>
          ))}
          
          {availablePlayers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">All players assigned</p>
            </div>
          )}
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
      subtitle="Various drag and drop interface styles for roster management"
      breadcrumbs={breadcrumbs}
    >
      <Helmet>
        <title>Drag & Drop Examples | Team Manager</title>
      </Helmet>

      <div className="space-y-8">
        <Tabs defaultValue="modern" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="modern">Modern Grid</TabsTrigger>
            <TabsTrigger value="minimal">Minimalist</TabsTrigger>
            <TabsTrigger value="compact">Compact List</TabsTrigger>
          </TabsList>

          <TabsContent value="modern" className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Modern Card Grid Interface</h3>
              <p className="text-gray-600 mb-4">
                A visually appealing grid layout with enhanced player cards and modern styling.
              </p>
              <ModernCardGrid />
            </div>
          </TabsContent>

          <TabsContent value="minimal" className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Minimalist Interface</h3>
              <p className="text-gray-600 mb-4">
                Clean, minimal design focused on functionality with subtle visual feedback.
              </p>
              <MinimalistInterface />
            </div>
          </TabsContent>

          <TabsContent value="compact" className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Compact List Interface</h3>
              <p className="text-gray-600 mb-4">
                Space-efficient list-based layout ideal for smaller screens or dense information.
              </p>
              <CompactListInterface />
            </div>
          </TabsContent>
        </Tabs>

        {/* Design Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle>Design Guidelines & Best Practices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Visual Feedback</h4>
                <ul className="text-sm space-y-2 text-gray-600">
                  <li>• Clear drag states with opacity and scaling</li>
                  <li>• Hover effects on interactive elements</li>
                  <li>• Distinct drop zones with color coding</li>
                  <li>• Smooth transitions for all interactions</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3">User Experience</h4>
                <ul className="text-sm space-y-2 text-gray-600">
                  <li>• Consistent grab handles where appropriate</li>
                  <li>• Touch-friendly sizing for mobile devices</li>
                  <li>• Clear position labels and organization</li>
                  <li>• Fallback interactions for accessibility</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Card Variants</h4>
                <ul className="text-sm space-y-2 text-gray-600">
                  <li>• <strong>Minimal:</strong> Clean, text-focused layout</li>
                  <li>• <strong>Compact:</strong> Information-dense horizontal layout</li>
                  <li>• <strong>Detailed:</strong> Full feature set with actions</li>
                  <li>• <strong>Default:</strong> Balanced vertical card design</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Performance</h4>
                <ul className="text-sm space-y-2 text-gray-600">
                  <li>• Optimized drag events and state updates</li>
                  <li>• Efficient re-rendering with React keys</li>
                  <li>• Minimal DOM manipulation during drags</li>
                  <li>• Debounced interactions where needed</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
}
