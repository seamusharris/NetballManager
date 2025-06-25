
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Target, Plus, Edit2, Trash2, Copy, Save, CheckCircle, 
  AlertCircle, Users, FileText, Lightbulb, Trophy, 
  Swords, Shield, Flag, Clock, User, ArrowRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/apiClient';
import type { Player, Position } from '@shared/schema';

interface StrategyTabProps {
  gameId: number;
  teamId: number;
  opponentId: number;
  players: Player[];
  previousNotes: string[];
  keyMatchups: KeyMatchup[];
  gamePlan: GamePlan;
}

interface KeyMatchup {
  id: string;
  ourPlayer: Player;
  opponentPlayer: string;
  position: Position;
  notes?: string;
  priority: 'critical' | 'important' | 'watch';
}

interface GamePlan {
  id?: string;
  objectives: GameObjective[];
  keyTactics: GameTactic[];
  playerRoles: Record<number, string>;
  preGameNotes: string;
  inGameNotes: string;
  postGameNotes: string;
}

interface GameObjective {
  id: string;
  description: string;
  target?: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface GameTactic {
  id: string;
  title: string;
  description: string;
  category: 'offense' | 'defense' | 'general';
  priority: 'high' | 'medium' | 'low';
}

const POSITIONS: Position[] = ['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'];

export default function StrategyTab({
  gameId,
  teamId,
  opponentId,
  players,
  previousNotes = [],
  keyMatchups: initialMatchups = [],
  gamePlan: initialGamePlan
}: StrategyTabProps) {
  const [gamePlan, setGamePlan] = useState<GamePlan>(initialGamePlan || {
    objectives: [],
    keyTactics: [],
    playerRoles: {},
    preGameNotes: '',
    inGameNotes: '',
    postGameNotes: ''
  });
  const [keyMatchups, setKeyMatchups] = useState<KeyMatchup[]>(initialMatchups);
  const [editingObjective, setEditingObjective] = useState<GameObjective | null>(null);
  const [editingTactic, setEditingTactic] = useState<GameTactic | null>(null);
  const [editingMatchup, setEditingMatchup] = useState<KeyMatchup | null>(null);
  const [isObjectiveDialogOpen, setIsObjectiveDialogOpen] = useState(false);
  const [isTacticDialogOpen, setIsTacticDialogOpen] = useState(false);
  const [isMatchupDialogOpen, setIsMatchupDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load existing strategy data
  useEffect(() => {
    loadStrategyData();
  }, [gameId]);

  const loadStrategyData = async () => {
    try {
      const response = await apiClient.get(`/api/games/${gameId}/strategy`);
      if (response) {
        setGamePlan(response.gamePlan || gamePlan);
        setKeyMatchups(response.keyMatchups || []);
      }
    } catch (error) {
      console.log('No existing strategy data found, using defaults');
      // Initialize with some default data
      initializeDefaultData();
    }
  };

  const initializeDefaultData = () => {
    const defaultObjectives: GameObjective[] = [
      {
        id: '1',
        description: 'Win first quarter',
        target: 'Score more goals than opponent in Q1',
        completed: false,
        priority: 'high'
      },
      {
        id: '2',
        description: 'Maintain possession control',
        target: 'Keep turnovers under 15',
        completed: false,
        priority: 'high'
      },
      {
        id: '3',
        description: 'Strong defensive pressure',
        target: 'Force opponent turnovers in mid-court',
        completed: false,
        priority: 'medium'
      }
    ];

    const defaultTactics: GameTactic[] = [
      {
        id: '1',
        title: 'Fast transitions',
        description: 'Quick ball movement from defense to attack',
        category: 'offense',
        priority: 'high'
      },
      {
        id: '2',
        title: 'Circle pressure',
        description: 'Apply consistent pressure around the shooting circle',
        category: 'defense',
        priority: 'high'
      },
      {
        id: '3',
        title: 'Quarter momentum',
        description: 'Strong starts in Q1 and Q3 for psychological advantage',
        category: 'general',
        priority: 'medium'
      }
    ];

    const defaultMatchups: KeyMatchup[] = [
      {
        id: '1',
        ourPlayer: players[0] || { id: 0, displayName: 'TBD' } as Player,
        opponentPlayer: 'Opponent GS',
        position: 'GK',
        priority: 'critical',
        notes: 'Focus on intercepting lobs and maintaining position'
      },
      {
        id: '2',
        ourPlayer: players[1] || { id: 0, displayName: 'TBD' } as Player,
        opponentPlayer: 'Opponent WA',
        position: 'WD',
        priority: 'important',
        notes: 'Pressure in mid-court to disrupt feed'
      }
    ];

    setGamePlan(prev => ({
      ...prev,
      objectives: defaultObjectives,
      keyTactics: defaultTactics
    }));
    setKeyMatchups(defaultMatchups);
  };

  const saveStrategyData = async () => {
    setIsSaving(true);
    try {
      await apiClient.post(`/api/games/${gameId}/strategy`, {
        gamePlan,
        keyMatchups
      });
      
      toast({
        title: "Success",
        description: "Strategy data saved successfully!"
      });
    } catch (error) {
      console.error('Failed to save strategy data:', error);
      toast({
        title: "Error",
        description: "Failed to save strategy data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addObjective = () => {
    setEditingObjective({
      id: '',
      description: '',
      target: '',
      completed: false,
      priority: 'medium'
    });
    setIsObjectiveDialogOpen(true);
  };

  const saveObjective = () => {
    if (!editingObjective || !editingObjective.description.trim()) return;

    const objective = {
      ...editingObjective,
      id: editingObjective.id || Date.now().toString()
    };

    setGamePlan(prev => ({
      ...prev,
      objectives: editingObjective.id 
        ? prev.objectives.map(o => o.id === objective.id ? objective : o)
        : [...prev.objectives, objective]
    }));

    setEditingObjective(null);
    setIsObjectiveDialogOpen(false);
  };

  const deleteObjective = (id: string) => {
    setGamePlan(prev => ({
      ...prev,
      objectives: prev.objectives.filter(o => o.id !== id)
    }));
  };

  const toggleObjectiveComplete = (id: string) => {
    setGamePlan(prev => ({
      ...prev,
      objectives: prev.objectives.map(o => 
        o.id === id ? { ...o, completed: !o.completed } : o
      )
    }));
  };

  const addTactic = () => {
    setEditingTactic({
      id: '',
      title: '',
      description: '',
      category: 'general',
      priority: 'medium'
    });
    setIsTacticDialogOpen(true);
  };

  const saveTactic = () => {
    if (!editingTactic || !editingTactic.title.trim()) return;

    const tactic = {
      ...editingTactic,
      id: editingTactic.id || Date.now().toString()
    };

    setGamePlan(prev => ({
      ...prev,
      keyTactics: editingTactic.id 
        ? prev.keyTactics.map(t => t.id === tactic.id ? tactic : t)
        : [...prev.keyTactics, tactic]
    }));

    setEditingTactic(null);
    setIsTacticDialogOpen(false);
  };

  const deleteTactic = (id: string) => {
    setGamePlan(prev => ({
      ...prev,
      keyTactics: prev.keyTactics.filter(t => t.id !== id)
    }));
  };

  const addMatchup = () => {
    setEditingMatchup({
      id: '',
      ourPlayer: players[0] || { id: 0, displayName: 'Select Player' } as Player,
      opponentPlayer: '',
      position: 'GS',
      priority: 'important',
      notes: ''
    });
    setIsMatchupDialogOpen(true);
  };

  const saveMatchup = () => {
    if (!editingMatchup || !editingMatchup.opponentPlayer.trim()) return;

    const matchup = {
      ...editingMatchup,
      id: editingMatchup.id || Date.now().toString()
    };

    setKeyMatchups(prev => 
      editingMatchup.id 
        ? prev.map(m => m.id === matchup.id ? matchup : m)
        : [...prev, matchup]
    );

    setEditingMatchup(null);
    setIsMatchupDialogOpen(false);
  };

  const deleteMatchup = (id: string) => {
    setKeyMatchups(prev => prev.filter(m => m.id !== id));
  };

  const updatePlayerRole = (playerId: number, role: string) => {
    setGamePlan(prev => ({
      ...prev,
      playerRoles: {
        ...prev.playerRoles,
        [playerId]: role
      }
    }));
  };

  const copyPreviousNotes = (targetField: 'preGameNotes' | 'inGameNotes' | 'postGameNotes') => {
    if (previousNotes.length > 0) {
      setGamePlan(prev => ({
        ...prev,
        [targetField]: prev[targetField] + '\n\n' + previousNotes[0]
      }));
      
      toast({
        title: "Notes Copied",
        description: "Previous notes added to current section."
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
      case 'critical':
        return 'destructive';
      case 'medium':
      case 'important':
        return 'default';
      case 'low':
      case 'watch':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'offense':
        return <Swords className="h-4 w-4" />;
      case 'defense':
        return <Shield className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Save Button */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Game Strategy</h3>
          <Button onClick={saveStrategyData} disabled={isSaving} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Strategy'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Game Plan Editor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Game Objectives
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {gamePlan.objectives.map(objective => (
                  <div key={objective.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <button
                      onClick={() => toggleObjectiveComplete(objective.id)}
                      className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center ${
                        objective.completed 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {objective.completed && <CheckCircle className="w-3 h-3" />}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-medium ${objective.completed ? 'line-through text-gray-500' : ''}`}>
                          {objective.description}
                        </h4>
                        <Badge variant={getPriorityColor(objective.priority)} className="text-xs">
                          {objective.priority}
                        </Badge>
                      </div>
                      {objective.target && (
                        <p className="text-sm text-gray-600">{objective.target}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingObjective(objective);
                              setIsObjectiveDialogOpen(true);
                            }}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit objective</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteObjective(objective.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete objective</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                ))}
                <Button onClick={addObjective} variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Objective
                </Button>
              </CardContent>
            </Card>

            {/* Key Tactics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Key Tactics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {gamePlan.keyTactics.map(tactic => (
                  <div key={tactic.id} className="border-l-4 border-blue-400 pl-4 py-2 bg-blue-50 rounded-r">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(tactic.category)}
                        <h4 className="font-medium text-blue-800">{tactic.title}</h4>
                        <Badge variant={getPriorityColor(tactic.priority)} className="text-xs">
                          {tactic.priority}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingTactic(tactic);
                            setIsTacticDialogOpen(true);
                          }}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTactic(tactic.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-blue-700">{tactic.description}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-blue-600 capitalize">{tactic.category}</span>
                    </div>
                  </div>
                ))}
                <Button onClick={addTactic} variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tactic
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Key Matchups */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Key Matchups
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {keyMatchups.map(matchup => (
                  <div key={matchup.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{matchup.position}</span>
                        <ArrowRight className="h-3 w-3 text-gray-400" />
                        <span className="text-sm">{matchup.ourPlayer.displayName}</span>
                        <span className="text-xs text-gray-500">vs</span>
                        <span className="text-sm">{matchup.opponentPlayer}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getPriorityColor(matchup.priority)} className="text-xs">
                          {matchup.priority}
                        </Badge>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingMatchup(matchup);
                              setIsMatchupDialogOpen(true);
                            }}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMatchup(matchup.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    {matchup.notes && (
                      <p className="text-sm text-gray-600">{matchup.notes}</p>
                    )}
                  </div>
                ))}
                <Button onClick={addMatchup} variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Matchup
                </Button>
              </CardContent>
            </Card>

            {/* Player Roles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Player Roles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {players.slice(0, 10).map(player => (
                  <div key={player.id} className="flex items-center justify-between">
                    <span className="font-medium">{player.displayName}</span>
                    <div className="w-48">
                      <Input
                        placeholder="Assign role..."
                        value={gamePlan.playerRoles[player.id] || ''}
                        onChange={(e) => updatePlayerRole(player.id, e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tactical Notes Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Tactical Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Pre-game Notes */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Flag className="h-4 w-4" />
                    Pre-game Notes
                  </Label>
                  {previousNotes.length > 0 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyPreviousNotes('preGameNotes')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy from previous game</TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <Textarea
                  placeholder="Pre-game preparation notes..."
                  value={gamePlan.preGameNotes}
                  onChange={(e) => setGamePlan(prev => ({ ...prev, preGameNotes: e.target.value }))}
                  className="min-h-32"
                />
              </div>

              {/* In-game Notes */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    In-game Notes
                  </Label>
                  {previousNotes.length > 0 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyPreviousNotes('inGameNotes')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy from previous game</TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <Textarea
                  placeholder="Live game observations..."
                  value={gamePlan.inGameNotes}
                  onChange={(e) => setGamePlan(prev => ({ ...prev, inGameNotes: e.target.value }))}
                  className="min-h-32"
                />
              </div>

              {/* Post-game Notes */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    Post-game Notes
                  </Label>
                  {previousNotes.length > 0 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyPreviousNotes('postGameNotes')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy from previous game</TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <Textarea
                  placeholder="Post-game review and lessons..."
                  value={gamePlan.postGameNotes}
                  onChange={(e) => setGamePlan(prev => ({ ...prev, postGameNotes: e.target.value }))}
                  className="min-h-32"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Previous Notes Section */}
        {previousNotes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Previous Game Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {previousNotes.slice(0, 3).map((note, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm">{note}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dialogs */}
        <Dialog open={isObjectiveDialogOpen} onOpenChange={setIsObjectiveDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingObjective?.id ? 'Edit Objective' : 'Add Objective'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Description</Label>
                <Input
                  placeholder="Enter objective description..."
                  value={editingObjective?.description || ''}
                  onChange={(e) => setEditingObjective(prev => prev ? { ...prev, description: e.target.value } : null)}
                />
              </div>
              <div>
                <Label>Target (optional)</Label>
                <Input
                  placeholder="Specific target or metric..."
                  value={editingObjective?.target || ''}
                  onChange={(e) => setEditingObjective(prev => prev ? { ...prev, target: e.target.value } : null)}
                />
              </div>
              <div>
                <Label>Priority</Label>
                <Select
                  value={editingObjective?.priority || 'medium'}
                  onValueChange={(value) => setEditingObjective(prev => prev ? { ...prev, priority: value as any } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsObjectiveDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={saveObjective}>
                  Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isTacticDialogOpen} onOpenChange={setIsTacticDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingTactic?.id ? 'Edit Tactic' : 'Add Tactic'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  placeholder="Enter tactic title..."
                  value={editingTactic?.title || ''}
                  onChange={(e) => setEditingTactic(prev => prev ? { ...prev, title: e.target.value } : null)}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe the tactic..."
                  value={editingTactic?.description || ''}
                  onChange={(e) => setEditingTactic(prev => prev ? { ...prev, description: e.target.value } : null)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select
                    value={editingTactic?.category || 'general'}
                    onValueChange={(value) => setEditingTactic(prev => prev ? { ...prev, category: value as any } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="offense">Offense</SelectItem>
                      <SelectItem value="defense">Defense</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select
                    value={editingTactic?.priority || 'medium'}
                    onValueChange={(value) => setEditingTactic(prev => prev ? { ...prev, priority: value as any } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsTacticDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={saveTactic}>
                  Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isMatchupDialogOpen} onOpenChange={setIsMatchupDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingMatchup?.id ? 'Edit Matchup' : 'Add Matchup'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Position</Label>
                <Select
                  value={editingMatchup?.position || 'GS'}
                  onValueChange={(value) => setEditingMatchup(prev => prev ? { ...prev, position: value as Position } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POSITIONS.map(position => (
                      <SelectItem key={position} value={position}>{position}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Our Player</Label>
                <Select
                  value={editingMatchup?.ourPlayer?.id?.toString() || ''}
                  onValueChange={(value) => {
                    const player = players.find(p => p.id.toString() === value);
                    if (player) {
                      setEditingMatchup(prev => prev ? { ...prev, ourPlayer: player } : null);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {players.map(player => (
                      <SelectItem key={player.id} value={player.id.toString()}>
                        {player.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Opponent Player</Label>
                <Input
                  placeholder="Enter opponent player name/position..."
                  value={editingMatchup?.opponentPlayer || ''}
                  onChange={(e) => setEditingMatchup(prev => prev ? { ...prev, opponentPlayer: e.target.value } : null)}
                />
              </div>
              <div>
                <Label>Priority</Label>
                <Select
                  value={editingMatchup?.priority || 'important'}
                  onValueChange={(value) => setEditingMatchup(prev => prev ? { ...prev, priority: value as any } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="important">Important</SelectItem>
                    <SelectItem value="watch">Watch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notes (optional)</Label>
                <Textarea
                  placeholder="Matchup strategy and notes..."
                  value={editingMatchup?.notes || ''}
                  onChange={(e) => setEditingMatchup(prev => prev ? { ...prev, notes: e.target.value } : null)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsMatchupDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={saveMatchup}>
                  Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
