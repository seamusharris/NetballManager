import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorDisplay } from '@/components/ui/error-display';
import { PlayerAvatar } from '@/components/ui/player-avatar';
import { PlayerBox } from '@/components/ui/player-box';
import { PlayerAvailabilitySelector } from '@/components/ui/player-availability-selector';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { CourtDisplay } from '@/components/ui/court-display';
import { ResultBadge } from '@/components/ui/result-badge';
import { useClub } from '@/contexts/ClubContext';
import { apiClient } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import { useBatchGameStatistics } from '@/components/statistics/hooks/useBatchGameStatistics';
import { useBatchRosterData } from '@/components/statistics/hooks/useBatchRosterData';
import DragDropLineupEditor from '@/components/roster/DragDropLineupEditor';
import { 
  Trophy, Target, TrendingUp, Users, CheckCircle, Clock, 
  AlertTriangle, Lightbulb, ChevronRight, ArrowRight, 
  RotateCcw, Zap, Play, Save, Calendar, MapPin, Copy, FileText,
  BarChart3, TrendingDown, Award, Shield, Star, Eye, Brain,
  Activity, Flame, History, Search, Filter, RefreshCw, 
  Crosshair, Focus, Layers, Hash, Flag, Telescope, Check,
  Plus, Minus, ArrowUpDown, Grid3X3
} from 'lucide-react';
import { cn, getWinLoseLabel, formatShortDate } from "@/lib/utils";

interface Game {
  id: number;
  date: string;
  time: string;
  homeTeamId: number;
  awayTeamId: number;
  homeTeam: { name: string; clubName: string };
  awayTeam: { name: string; clubName: string };
  statusIsCompleted: boolean;
}

interface Player {
  id: number;
  displayName: string;
  positionPreferences: string[];
}

interface Position {
  name: string;
}

const NETBALL_POSITIONS = ['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'];
const POSITIONS_ORDER = ['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'];

export default function Preparation() {
  const { currentClubId, currentTeamId } = useClub();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [availabilityData, setAvailabilityData] = useState<Record<number, 'available' | 'unavailable' | 'maybe'>>({});
  const [selectedLineup, setSelectedLineup] = useState<Record<string, Player | null>>({
    GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null
  });

  // Queries
  const { data: allGames = [], isLoading: gamesLoading } = useQuery<Game[]>({
    queryKey: ['/api/games', currentTeamId],
    enabled: !!currentTeamId
  });

  // Filter for upcoming games (not completed) and sort by date
  const upcomingGames = Array.isArray(allGames) ? (allGames as Game[])
    .filter((game: Game) => game.statusIsCompleted === false)
    .sort((a: Game, b: Game) => new Date(a.date).getTime() - new Date(b.date).getTime()) : [];

  const { data: teamPlayers = [], isLoading: playersLoading } = useQuery<Player[]>({
    queryKey: ['/api/players', currentTeamId],
    enabled: !!currentTeamId
  });

  const selectedGame = useMemo(() => {
    return upcomingGames.find((g: Game) => g.id === selectedGameId) || null;
  }, [upcomingGames, selectedGameId]);

  const opponentName = useMemo(() => {
    if (!selectedGame) return null;
    return selectedGame.homeTeamId === currentTeamId 
      ? selectedGame.awayTeam?.name 
      : selectedGame.homeTeam?.name;
  }, [selectedGame, currentTeamId]);

  // Handle applying selections to roster
  const handleApplyToRoster = () => {
    if (selectedGame && Object.values(selectedLineup).every(p => p !== null)) {
      navigate(`/roster/${selectedGame.id}`);
    }
  };

  if (gamesLoading || playersLoading) {
    return (
      <PageTemplate title="Team Preparation">
        <LoadingState />
      </PageTemplate>
    );
  }

  return (
    <PageTemplate title="Team Preparation">
      <div className="space-y-6">
        {/* Game Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Select Upcoming Game
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingGames.length === 0 ? (
              <Alert>
                <Calendar className="h-4 w-4" />
                <AlertDescription>
                  No upcoming games found for this team.
                </AlertDescription>
              </Alert>
            ) : (
              <Select 
                value={selectedGameId?.toString() || ""} 
                onValueChange={(value) => setSelectedGameId(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a game to prepare for..." />
                </SelectTrigger>
                <SelectContent>
                  {upcomingGames.map((game: Game) => (
                    <SelectItem key={game.id} value={game.id.toString()}>
                      {new Date(game.date).toLocaleDateString()} - vs{' '}
                      {game.homeTeamId === currentTeamId 
                        ? game.awayTeam?.name 
                        : game.homeTeam?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardContent>
        </Card>

        {selectedGame && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="availability">Availability</TabsTrigger>
              <TabsTrigger value="lineup">Lineup</TabsTrigger>
              <TabsTrigger value="roster">Apply</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Game Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Match Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Date:</span>
                          <span>{new Date(selectedGame.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Time:</span>
                          <span>{selectedGame.time}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Opponent:</span>
                          <span className="font-medium">{opponentName}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Preparation Status</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Player Availability</span>
                          <Badge variant="outline">
                            {Object.values(availabilityData).filter(status => status === 'available').length}/{Array.isArray(teamPlayers) ? teamPlayers.length : 0}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Starting Lineup</span>
                          <Badge variant="outline">
                            {Object.values(selectedLineup).filter(p => p !== null).length}/7
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Player Availability Tab */}
            <TabsContent value="availability" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Player Availability</CardTitle>
                  <p className="text-sm text-gray-600">
                    Set player availability for {new Date(selectedGame.date).toLocaleDateString()}
                  </p>
                </CardHeader>
                <CardContent>
                  <PlayerAvailabilitySelector
                    gameId={selectedGame.id}
                    players={Array.isArray(teamPlayers) ? teamPlayers as Player[] : []}
                    availabilityData={availabilityData}
                    onAvailabilityChange={(data) => setAvailabilityData(data)}
                  />
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab('overview')}>
                  Back to Overview
                </Button>
                <Button 
                  onClick={() => setActiveTab('lineup')}
                  disabled={Object.values(availabilityData).filter(status => status === 'available').length < 7}
                >
                  Set Lineup
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </TabsContent>

            {/* Lineup Selection Tab */}
            <TabsContent value="lineup" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Starting Lineup</CardTitle>
                  <p className="text-sm text-gray-600">
                    Create your starting lineup for the game vs {opponentName}
                  </p>
                </CardHeader>
                <CardContent>
                  <DragDropLineupEditor
                    availablePlayers={teamPlayers.filter((p: Player) => availabilityData[p.id] === 'available')}
                    currentLineup={selectedLineup}
                    onLineupChange={setSelectedLineup}
                    onApplyRecommendation={(lineup) => {
                      setSelectedLineup(lineup);
                      toast({
                        title: "Lineup Applied",
                        description: "Recommended lineup has been applied to the editor",
                      });
                    }}
                  />
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab('availability')}>
                  Back to Availability
                </Button>
                <Button 
                  onClick={() => setActiveTab('roster')}
                  disabled={!Object.values(selectedLineup).every(p => p !== null)}
                >
                  Apply to Roster
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </TabsContent>

            {/* Apply to Roster Tab */}
            <TabsContent value="roster" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Apply to Roster</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Alert>
                      <Play className="h-4 w-4" />
                      <AlertDescription>
                        Your preparation is complete! Apply your selections to the roster manager.
                      </AlertDescription>
                    </Alert>

                    {selectedGame && (
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-semibold mb-2">Preparation Summary</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Game</span>
                            <p className="font-semibold">vs {opponentName}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(selectedGame.date).toLocaleDateString()} {selectedGame.time}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Available Players</span>
                            <p className="font-semibold">
                              {Object.values(availabilityData).filter(status => status === 'available').length}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Starting Lineup</span>
                            <p className="font-semibold">
                              {Object.values(selectedLineup).filter(p => p !== null).length}/7 Complete
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <Button 
                        onClick={handleApplyToRoster}
                        className="flex-1"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Open Roster Manager
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab('lineup')}>
                  Back to Lineup
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </PageTemplate>
  );
}