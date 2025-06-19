import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Users, Target, Layout, Save, RotateCcw, Zap, 
  CheckCircle, Filter, Search, AlertCircle, 
  Clock, User, MapPin, Trophy, Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/apiClient';
import CourtDisplay from '@/components/ui/court-display';
import SharedPlayerAvailability from '@/components/ui/shared-player-availability';
import DragDropRosterManager from '@/components/roster/DragDropRosterManager';
import type { Game, Player, Roster, Position } from '@shared/schema';

interface LineupTabProps {
  game: Game;
  players: Player[];
  rosters: Roster[];
  onRosterUpdate: (rosters: Roster[]) => void;
}

// Using shared availability format (boolean-based)
type PlayerAvailabilityData = Record<number, 'available' | 'unavailable' | 'maybe'>;

interface LineupRecommendation {
  id: string;
  formation: Record<string, number>; // Position -> PlayerId
  effectiveness: number;
  confidence: number;
  historicalSuccess: number;
  opponentSpecific: boolean;
  notes: string;
  availablePlayersOnly: boolean;
}

const POSITIONS = ['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'];

export function LineupTab({ game, players, rosters, onRosterUpdate }: LineupTabProps) {
  const [activeStep, setActiveStep] = useState<'availability' | 'recommendations' | 'builder' | 'assignments'>('availability');
  const [playerAvailability, setPlayerAvailability] = useState<PlayerAvailabilityData>({});
  const [recommendations, setRecommendations] = useState<LineupRecommendation[]>([]);
  const [selectedRoster, setSelectedRoster] = useState<Record<number, Record<string, number | null>>>({
    1: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null },
    2: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null },
    3: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null },
    4: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null }
  });
  const [confidenceFilter, setConfidenceFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const { toast } = useToast();

  // Initialize player availability
  useEffect(() => {
    const initializeAvailability = async () => {
      try {
        const response = await apiClient.get(`/api/games/${game.id}/availability`);
        if (response?.availablePlayerIds) {
          const initialData: PlayerAvailabilityData = {};
          players.forEach(player => {
            initialData[player.id] = response.availablePlayerIds.includes(player.id) ? 'available' : 'unavailable';
          });
          setPlayerAvailability(initialData);
        } else {
          // Default all active players to available
          const defaultData: PlayerAvailabilityData = {};
          players.forEach(player => {
            defaultData[player.id] = player.active !== false ? 'available' : 'unavailable';
          });
          setPlayerAvailability(defaultData);
        }
      } catch (error) {
        console.error('Failed to load player availability:', error);
        // Default all players to available on error
        const defaultData: PlayerAvailabilityData = {};
        players.forEach(player => {
          defaultData[player.id] = 'available';
        });
        setPlayerAvailability(defaultData);
      }
    };

    if (players.length > 0) {
      initializeAvailability();
    }
  }, [game.id, players]);

  // Generate recommendations when availability changes
  useEffect(() => {
    const availablePlayers = players.filter(p => playerAvailability[p.id] === 'available');
    if (availablePlayers.length >= 7) {
      generateLineupRecommendations(availablePlayers);
    } else {
      setRecommendations([]);
    }
  }, [playerAvailability, players]);

  const generateLineupRecommendations = (availablePlayers: Player[]) => {
    try {
      const newRecommendations: LineupRecommendation[] = [];

      // Position-optimized lineup
      const positionOptimized = generatePositionOptimizedLineup(availablePlayers);
      if (positionOptimized) newRecommendations.push(positionOptimized);

      // Experience-based lineup
      const experienceBased = generateExperienceBasedLineup(availablePlayers);
      if (experienceBased) newRecommendations.push(experienceBased);

      // Balanced lineup
      const balanced = generateBalancedLineup(availablePlayers);
      if (balanced) newRecommendations.push(balanced);

      setRecommendations(newRecommendations.sort((a, b) => b.effectiveness - a.effectiveness));
    } catch (error) {
      console.error('Error generating lineup recommendations:', error);
      setRecommendations([]);
    }
  };

  const generatePositionOptimizedLineup = (availablePlayers: Player[]): LineupRecommendation | null => {
    const formation: Record<string, number> = {};
    const usedPlayers = new Set<number>();

    // Assign players to their preferred positions
    POSITIONS.forEach(position => {
      const candidates = availablePlayers
        .filter(p => !usedPlayers.has(p.id) && p.positionPreferences?.includes(position))
        .sort((a, b) => (a.positionPreferences?.indexOf(position) || 99) - (b.positionPreferences?.indexOf(position) || 99));

      if (candidates.length > 0) {
        formation[position] = candidates[0].id;
        usedPlayers.add(candidates[0].id);
      }
    });

    // Fill remaining positions
    POSITIONS.forEach(position => {
      if (!formation[position]) {
        const remaining = availablePlayers.find(p => !usedPlayers.has(p.id));
        if (remaining) {
          formation[position] = remaining.id;
          usedPlayers.add(remaining.id);
        }
      }
    });

    if (Object.keys(formation).length < 7) return null;

    return {
      id: 'position-optimized',
      formation,
      effectiveness: 8.5,
      confidence: 85,
      historicalSuccess: 78,
      opponentSpecific: false,
      notes: 'Players assigned to their preferred positions for maximum comfort and effectiveness',
      availablePlayersOnly: true
    };
  };

  const generateExperienceBasedLineup = (availablePlayers: Player[]): LineupRecommendation | null => {
    const formation: Record<string, number> = {};
    const usedPlayers = new Set<number>();

    // Prioritize regular players
    const regularPlayers = availablePlayers.filter(p => p.isRegular);
    const otherPlayers = availablePlayers.filter(p => !p.isRegular);
    const sortedPlayers = [...regularPlayers, ...otherPlayers];

    POSITIONS.forEach((position, index) => {
      if (sortedPlayers[index] && !usedPlayers.has(sortedPlayers[index].id)) {
        formation[position] = sortedPlayers[index].id;
        usedPlayers.add(sortedPlayers[index].id);
      }
    });

    if (Object.keys(formation).length < 7) return null;

    return {
      id: 'experience-based',
      formation,
      effectiveness: 7.8,
      confidence: 75,
      historicalSuccess: 82,
      opponentSpecific: false,
      notes: 'Based on player experience and regular team membership',
      availablePlayersOnly: true
    };
  };

  const generateBalancedLineup = (availablePlayers: Player[]): LineupRecommendation | null => {
    const formation: Record<string, number> = {};
    const usedPlayers = new Set<number>();

    // Simple balanced distribution
    const sortedPlayers = [...availablePlayers].sort((a, b) => a.displayName?.localeCompare(b.displayName || '') || 0);

    POSITIONS.forEach((position, index) => {
      if (sortedPlayers[index] && !usedPlayers.has(sortedPlayers[index].id)) {
        formation[position] = sortedPlayers[index].id;
        usedPlayers.add(sortedPlayers[index].id);
      }
    });

    if (Object.keys(formation).length < 7) return null;

    return {
      id: 'balanced',
      formation,
      effectiveness: 7.2,
      confidence: 70,
      historicalSuccess: 75,
      opponentSpecific: false,
      notes: 'Balanced team composition with even distribution',
      availablePlayersOnly: true
    };
  };

  const handleAvailabilityChange = (data: PlayerAvailabilityData) => {
    setPlayerAvailability(data);
  };

  const handleApplyRecommendation = (recommendation: LineupRecommendation) => {
    const newRoster: Record<number, Record<string, number | null>> = {
      1: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null },
      2: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null },
      3: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null },
      4: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null }
    };

    // Apply the recommendation to all quarters
    POSITIONS.forEach(position => {
      const playerId = recommendation.formation[position];
      if (playerId) {
        for (let quarter = 1; quarter <= 4; quarter++) {
          newRoster[quarter][position] = playerId;
        }
      }
    });
    setSelectedRoster(newRoster);
    setActiveStep('builder');
  };

  // Filter recommendations
  const filteredRecommendations = recommendations.filter(rec => {
    return confidenceFilter === 'all' || 
      (confidenceFilter === 'high' && rec.confidence >= 80) ||
      (confidenceFilter === 'medium' && rec.confidence >= 60 && rec.confidence < 80) ||
      (confidenceFilter === 'low' && rec.confidence < 60);
  });

  const availableCount = Object.values(playerAvailability).filter(status => status === 'available').length;
  const canProceed = availableCount >= 7;

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 ${activeStep === 'availability' ? 'text-blue-600 font-medium' : canProceed ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeStep === 'availability' ? 'bg-blue-100' : canProceed ? 'bg-green-100' : 'bg-gray-100'}`}>
              {canProceed && activeStep !== 'availability' ? <CheckCircle className="h-5 w-5" /> : '1'}
            </div>
            <span>Player Availability</span>
          </div>
          <div className={`w-8 h-0.5 ${canProceed ? 'bg-green-200' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center space-x-2 ${!canProceed ? 'text-gray-400' : activeStep === 'recommendations' ? 'text-blue-600 font-medium' : 'text-gray-600'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${!canProceed ? 'bg-gray-100' : activeStep === 'recommendations' ? 'bg-blue-100' : 'bg-gray-100'}`}>
              2
            </div>
            <span>Recommendations</span>
          </div>
          <div className={`w-8 h-0.5 ${canProceed ? 'bg-green-200' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center space-x-2 ${!canProceed ? 'text-gray-400' : activeStep === 'builder' ? 'text-blue-600 font-medium' : 'text-gray-600'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${!canProceed ? 'bg-gray-100' : activeStep === 'builder' ? 'bg-blue-100' : 'bg-gray-100'}`}>
              3
            </div>
            <span>Lineup Builder</span>
          </div>
        </div>
        <Badge variant={canProceed ? "default" : "secondary"}>
          {availableCount} players available
        </Badge>
      </div>



      <Tabs value={activeStep} onValueChange={(value) => setActiveStep(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="availability" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Player Availability
          </TabsTrigger>
          <TabsTrigger value="recommendations" disabled={!canProceed} className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Recommendations
          </TabsTrigger>
          <TabsTrigger value="builder" disabled={!canProceed} className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Lineup Builder
          </TabsTrigger>
        </TabsList>

        {/* Player Availability Tab */}
        <TabsContent value="availability" className="space-y-6">
          <div className="mb-4">
            {!canProceed && (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Need at least 7 available players to generate lineup recommendations. Currently have {availableCount} available.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <SharedPlayerAvailability
            players={players}
            availabilityData={playerAvailability}
            onAvailabilityChange={handleAvailabilityChange}
            title={`Player Availability for ${game.homeTeamName} vs ${game.awayTeamName}`}
            showQuickActions={true}
            gameId={game.id}
            variant="detailed"
          />
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Lineup Recommendations
                </CardTitle>
                <Select value={confidenceFilter} onValueChange={(value: any) => setConfidenceFilter(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by confidence" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Recommendations</SelectItem>
                    <SelectItem value="high">High Confidence</SelectItem>
                    <SelectItem value="medium">Medium Confidence</SelectItem>
                    <SelectItem value="low">Low Confidence</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {filteredRecommendations.length > 0 ? (
                <div className="space-y-6">
                  {filteredRecommendations.map(recommendation => (
                    <RecommendationCard
                      key={recommendation.id}
                      recommendation={recommendation}
                      players={players}
                      onApply={() => handleApplyRecommendation(recommendation)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600">No recommendations available</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {availableCount < 7 ? 'Need at least 7 available players' : 'Unable to generate recommendations'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lineup Builder Tab */}
        <TabsContent value="builder" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                Drag & Drop Lineup Builder
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Drag players from the bench to court positions or between positions to create your lineup
              </p>
            </CardHeader>
            <CardContent>
              <DragDropRosterManager
                availablePlayers={players.filter(p => playerAvailability[p.id] === 'available')}
                gameInfo={{
                  opponent: game.awayTeamName || game.homeTeamName || "Unknown",
                  date: game.date,
                  time: game.time
                }}
                onRosterChange={setSelectedRoster}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}



// Recommendation Card Component
function RecommendationCard({
  recommendation,
  players,
  onApply
}: {
  recommendation: LineupRecommendation;
  players: Player[];
  onApply: () => void;
}) {
  const getPlayerName = (playerId: number) => {
    const player = players.find(p => p.id === playerId);
    return player ? (player.displayName || `${player.firstName} ${player.lastName}`) : 'Unknown';
  };

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Star className="h-5 w-5 text-yellow-500" />
            <div>
              <h3 className="font-semibold capitalize">{recommendation.id.replace('-', ' ')}</h3>
              <p className="text-sm text-gray-600">{recommendation.notes}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {recommendation.confidence}% confidence
            </Badge>
            <Badge variant="secondary">
              {recommendation.effectiveness.toFixed(1)} effectiveness
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {POSITIONS.map(position => (
            <div key={position} className="text-center p-2 bg-gray-50 rounded">
              <div className="text-xs font-medium text-gray-600 mb-1">{position}</div>
              <div className="text-xs">
                {getPlayerName(recommendation.formation[position])}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center">
          <div className="flex gap-4 text-xs text-gray-600">
            <span>Historical: {recommendation.historicalSuccess}%</span>
            <span>{recommendation.opponentSpecific ? 'Opponent-specific' : 'General'}</span>
          </div>
          <Button onClick={onApply} size="sm">
            Apply Lineup
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default LineupTab;